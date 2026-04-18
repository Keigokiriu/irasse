'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type TableType = 'table' | 'counter' | 'room';
type TableStatus = 'empty' | 'occupied' | 'billing' | 'paid';

type Table = {
    id: string;
    number: number;
    type: TableType;
    seats: number;
    status: TableStatus;
    currentSessionId?: string;
    exitPrediction?: { minutes: number; reason: string };
    exitPredictionUpdatedAt?: any;
  };

type Prediction = {
  minutes: number;
  reason: string;
  loading?: boolean;
};

const STATUS_LABEL: Record<TableStatus, string> = {
  empty: '空席',
  occupied: '着席中',
  billing: '会計待ち',
  paid: '会計済・案内OK',
};

const STATUS_COLOR: Record<TableStatus, string> = {
  empty: '#22c55e',
  occupied: '#3b82f6',
  billing: '#f59e0b',
  paid: '#f97316',
};

const STATUS_BG: Record<TableStatus, string> = {
  empty: '#052e16',
  occupied: '#1e3a5f',
  billing: '#2a1f08',
  paid: '#1c0a00',
};

const NEXT_STATUS: Record<TableStatus, TableStatus> = {
  empty: 'occupied',
  occupied: 'billing',
  billing: 'paid',
  paid: 'empty',
};

const TYPE_LABEL: Record<TableType, string> = {
  table: 'テーブル',
  counter: 'カウンター',
  room: '個室',
};

const TYPE_EMOJI: Record<TableType, string> = {
  table: '🪑',
  counter: '🍺',
  room: '🚪',
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<TableType>('table');
  const [newSeats, setNewSeats] = useState(2);
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [storeStatus, setStoreStatus] = useState<{ totalSeats: number; occupiedSeats: number }>({ totalSeats: 20, occupiedSeats: 0 });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Table[];
      data.sort((a, b) => a.number - b.number);
      setTables(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStoreStatus({
          totalSeats: data.totalSeats || 20,
          occupiedSeats: data.occupiedSeats || 0,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPrediction = async (table: Table) => {
    if (table.status !== 'occupied' || !table.currentSessionId) return;

    setPredictions((prev) => ({ ...prev, [table.id]: { minutes: 0, reason: '', loading: true } }));

    try {
      // セッションの注文を取得
      const ordersSnapshot = await getDocs(
        query(collection(db, 'orders'), where('sessionId', '==', table.currentSessionId))
      );
      const items: string[] = [];
      ordersSnapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.items) items.push(...data.items);
      });

      if (items.length === 0) {
        setPredictions((prev) => ({ ...prev, [table.id]: { minutes: 0, reason: '注文待ち', loading: false } }));
        return;
      }

      const response = await fetch('/api/predict-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          partySize: table.seats || 2,
          occupiedSeats: storeStatus.occupiedSeats,
          totalSeats: storeStatus.totalSeats,
          pastAvgMinutes: null,
        }),
      });

      const result = await response.json();
      setPredictions((prev) => ({ ...prev, [table.id]: { ...result, loading: false } }));
    } catch (e) {
      console.error(e);
      setPredictions((prev) => ({ ...prev, [table.id]: { minutes: 60, reason: '予測エラー', loading: false } }));
    }
  };

  const updateStatus = async (id: string, currentStatus: TableStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    if (nextStatus === 'occupied') {
      const sessionRef = await addDoc(collection(db, 'sessions'), {
        tableNumber: table.number,
        tableId: id,
        status: 'active',
        startedAt: serverTimestamp(),
        closedAt: null,
        totalAmount: 0,
      });
      await updateDoc(doc(db, 'tables', id), {
        status: nextStatus,
        currentSessionId: sessionRef.id,
      });
    } else if (nextStatus === 'empty') {
      if (table.currentSessionId) {
        await updateDoc(doc(db, 'sessions', table.currentSessionId), {
          status: 'closed',
          closedAt: serverTimestamp(),
        });
      }
      await updateDoc(doc(db, 'tables', id), {
        status: nextStatus,
        currentSessionId: null,
      });
      setPredictions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      await updateDoc(doc(db, 'tables', id), { status: nextStatus });
    }
  };

  const addTable = async () => {
    const number = tables.length + 1;
    const id = `table_${Date.now()}`;
    await setDoc(doc(db, 'tables', id), {
      number,
      type: newType,
      seats: newSeats,
      status: 'empty',
      currentSessionId: null,
    });
    setShowAddModal(false);
  };

  const deleteTable = async (id: string) => {
    await deleteDoc(doc(db, 'tables', id));
  };

  const filteredTables = filterStatus === 'all' ? tables : tables.filter((t) => t.status === filterStatus);

  const stats = {
    empty: tables.filter((t) => t.status === 'empty').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    billing: tables.filter((t) => t.status === 'billing').length,
    paid: tables.filter((t) => t.status === 'paid').length,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
            ← ダッシュボード
          </button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>🪑 テーブル管理</h1>
        </div>
        <button onClick={() => setShowAddModal(true)}
          style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          ＋ 追加
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {(Object.keys(STATUS_LABEL) as TableStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              style={{ background: filterStatus === s ? STATUS_BG[s] : '#1e293b', border: `1px solid ${filterStatus === s ? STATUS_COLOR[s] : '#334155'}`, borderRadius: '10px', padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ color: STATUS_COLOR[s], fontSize: '18px', fontWeight: 800 }}>{stats[s]}</div>
              <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>{STATUS_LABEL[s]}</div>
            </button>
          ))}
        </div>

        {stats.billing > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ background: '#2a1f08', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>💳</span>
              <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{stats.billing}卓が会計待ちです</span>
            </div>
          </div>
        )}

        {stats.paid > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700 }}>{stats.paid}卓が案内OKです</span>
            </div>
          </div>
        )}

        {tables.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0 }}>テーブルがまだありません。「＋ 追加」から追加してください。</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filteredTables.map((table) => {
              const pred = predictions[table.id];
              return (
                <div key={table.id}
                  style={{ background: STATUS_BG[table.status], border: `1px solid ${STATUS_COLOR[table.status]}`, borderRadius: '14px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                  <button onClick={() => deleteTable(table.id)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: '2px' }}>
                    ✕
                  </button>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{TYPE_EMOJI[table.type || 'table']}</div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '2px' }}>{TYPE_LABEL[table.type || 'table']}</div>
                  <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{table.number}</div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px' }}>👤 {table.seats || 2}席</div>
                  <div style={{ background: STATUS_COLOR[table.status] + '22', borderRadius: '8px', padding: '4px 6px', marginBottom: '8px' }}>
                    <span style={{ color: STATUS_COLOR[table.status], fontSize: '10px', fontWeight: 700 }}>{STATUS_LABEL[table.status]}</span>
                  </div>

                  {/* AI退席予測 */}
{table.status === 'occupied' && (
  <div style={{ marginBottom: '8px' }}>
    {table.exitPrediction ? (
      <div style={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '8px', padding: '6px' }}>
        <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700 }}>🤖 退席予測：約{table.exitPrediction.minutes}分</div>
        <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>{table.exitPrediction.reason}</div>
      </div>
    ) : (
      <div style={{ background: '#0f172a', borderRadius: '8px', padding: '6px', fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
        🤖 注文後に予測が表示されます
      </div>
    )}
  </div>
)}

                  <button onClick={() => updateStatus(table.id, table.status)}
                    style={{ width: '100%', background: STATUS_COLOR[table.status], border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '7px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {NEXT_STATUS[table.status] === 'empty' ? '退店済み・案内OK →' :
                     NEXT_STATUS[table.status] === 'occupied' ? '着席 →' :
                     NEXT_STATUS[table.status] === 'billing' ? '会計待ち →' : '会計済み →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '360px' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: 800, margin: '0 0 20px' }}>席を追加</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>種類</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['table', 'counter', 'room'] as TableType[]).map((t) => (
                  <button key={t} onClick={() => setNewType(t)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: newType === t ? '#1c0a00' : '#0f172a', border: `1px solid ${newType === t ? '#f97316' : '#334155'}`, color: newType === t ? '#f97316' : '#64748b', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {TYPE_EMOJI[t]}<br />{TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>席数</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 6, 8].map((n) => (
                  <button key={n} onClick={() => setNewSeats(n)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: newSeats === n ? '#1c0a00' : '#0f172a', border: `1px solid ${newSeats === n ? '#f97316' : '#334155'}`, color: newSeats === n ? '#f97316' : '#64748b', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#64748b', fontSize: '14px', fontWeight: 700, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                キャンセル
              </button>
              <button onClick={addTable}
                style={{ flex: 2, background: '#f97316', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}