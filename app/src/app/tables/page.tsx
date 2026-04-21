'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type TableType = 'table' | 'counter' | 'room';
type TableStatus = 'empty' | 'occupied' | 'billing' | 'paid';
type Lang = 'ja' | 'en';

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

const TR = {
  ja: {
    back: '← ダッシュボード',
    title: '🪑 テーブル管理',
    add: '＋ 追加',
    empty: 'テーブルがまだありません。「＋ 追加」から追加してください。',
    billingAlert: (n: number) => `${n}卓が会計待ちです`,
    paidAlert: (n: number) => `${n}卓が案内OKです`,
    seats: '席',
    aiPrediction: '🤖 退席予測：約',
    aiMin: '分',
    aiWaiting: '🤖 注文後に予測が表示されます',
    nextStatus: { empty: '着席 →', occupied: '会計待ち →', billing: '会計済み →', paid: '退店済み・案内OK →' },
    statusLabel: { empty: '空席', occupied: '着席中', billing: '会計待ち', paid: '会計済・案内OK' },
    typeLabel: { table: 'テーブル', counter: 'カウンター', room: '個室' },
    modalTitle: '席を追加',
    typeSelect: '種類',
    seatsSelect: '席数',
    cancel: 'キャンセル',
    confirm: '追加する',
  },
  en: {
    back: '← Dashboard',
    title: '🪑 Table Management',
    add: '＋ Add',
    empty: 'No tables yet. Click "＋ Add" to get started.',
    billingAlert: (n: number) => `${n} table${n > 1 ? 's' : ''} waiting for payment`,
    paidAlert: (n: number) => `${n} table${n > 1 ? 's' : ''} ready to seat`,
    seats: 'seats',
    aiPrediction: '🤖 Exit prediction: ~',
    aiMin: ' min',
    aiWaiting: '🤖 Prediction available after order',
    nextStatus: { empty: 'Seat guests →', occupied: 'Request payment →', billing: 'Payment done →', paid: 'Clear table →' },
    statusLabel: { empty: 'Empty', occupied: 'Occupied', billing: 'Billing', paid: 'Ready' },
    typeLabel: { table: 'Table', counter: 'Counter', room: 'Room' },
    modalTitle: 'Add Seat',
    typeSelect: 'Type',
    seatsSelect: 'Seats',
    cancel: 'Cancel',
    confirm: 'Add',
  },
};

const STATUS_COLOR: Record<TableStatus, string> = {
  empty: '#22c55e', occupied: '#3b82f6', billing: '#f59e0b', paid: '#f97316',
};
const STATUS_BG: Record<TableStatus, string> = {
  empty: '#052e16', occupied: '#1e3a5f', billing: '#2a1f08', paid: '#1c0a00',
};
const NEXT_STATUS: Record<TableStatus, TableStatus> = {
  empty: 'occupied', occupied: 'billing', billing: 'paid', paid: 'empty',
};
const TYPE_EMOJI: Record<TableType, string> = {
  table: '🪑', counter: '🍺', room: '🚪',
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<TableType>('table');
  const [newSeats, setNewSeats] = useState(2);
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [storeStatus, setStoreStatus] = useState<{ totalSeats: number; occupiedSeats: number }>({ totalSeats: 20, occupiedSeats: 0 });
  const [lang, setLang] = useState<Lang>('ja');
  const router = useRouter();
  const t = TR[lang];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Table[];
      data.sort((a, b) => a.number - b.number);
      setTables(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStoreStatus({ totalSeats: data.totalSeats || 20, occupiedSeats: data.occupiedSeats || 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, currentStatus: TableStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    const table = tables.find((t) => t.id === id);
    if (!table) return;
    if (nextStatus === 'occupied') {
      const sessionRef = await addDoc(collection(db, 'sessions'), {
        tableNumber: table.number, tableId: id, status: 'active',
        startedAt: serverTimestamp(), closedAt: null, totalAmount: 0,
      });
      await updateDoc(doc(db, 'tables', id), { status: nextStatus, currentSessionId: sessionRef.id });
    } else if (nextStatus === 'empty') {
      if (table.currentSessionId) {
        await updateDoc(doc(db, 'sessions', table.currentSessionId), { status: 'closed', closedAt: serverTimestamp() });
      }
      await updateDoc(doc(db, 'tables', id), { status: nextStatus, currentSessionId: null });
      setPredictions((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } else {
      await updateDoc(doc(db, 'tables', id), { status: nextStatus });
    }
  };

  const addTable = async () => {
    const number = tables.length + 1;
    const id = `table_${Date.now()}`;
    await setDoc(doc(db, 'tables', id), { number, type: newType, seats: newSeats, status: 'empty', currentSessionId: null });
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
            {t.back}
          </button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>{t.title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {(['ja', 'en'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '3px 8px', fontSize: '11px', fontWeight: lang === l ? 700 : 400, background: lang === l ? '#334155' : 'transparent', color: lang === l ? '#f1f5f9' : '#64748b', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {l === 'ja' ? '🇯🇵' : '🇺🇸'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddModal(true)}
            style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            {t.add}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {(Object.keys(t.statusLabel) as TableStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              style={{ background: filterStatus === s ? STATUS_BG[s] : '#1e293b', border: `1px solid ${filterStatus === s ? STATUS_COLOR[s] : '#334155'}`, borderRadius: '10px', padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ color: STATUS_COLOR[s], fontSize: '18px', fontWeight: 800 }}>{stats[s]}</div>
              <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>{t.statusLabel[s]}</div>
            </button>
          ))}
        </div>

        {stats.billing > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ background: '#2a1f08', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>💳</span>
              <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{t.billingAlert(stats.billing)}</span>
            </div>
          </div>
        )}

        {stats.paid > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700 }}>{t.paidAlert(stats.paid)}</span>
            </div>
          </div>
        )}

        {tables.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0 }}>{t.empty}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filteredTables.map((table) => (
              <div key={table.id}
                style={{ background: STATUS_BG[table.status], border: `1px solid ${STATUS_COLOR[table.status]}`, borderRadius: '14px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                <button onClick={() => deleteTable(table.id)}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: '2px' }}>
                  ✕
                </button>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{TYPE_EMOJI[table.type || 'table']}</div>
                <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '2px' }}>{t.typeLabel[table.type || 'table']}</div>
                <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{table.number}</div>
                <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px' }}>👤 {table.seats || 2} {t.seats}</div>
                <div style={{ background: STATUS_COLOR[table.status] + '22', borderRadius: '8px', padding: '4px 6px', marginBottom: '8px' }}>
                  <span style={{ color: STATUS_COLOR[table.status], fontSize: '10px', fontWeight: 700 }}>{t.statusLabel[table.status]}</span>
                </div>
                {table.status === 'occupied' && (
                  <div style={{ marginBottom: '8px' }}>
                    {table.exitPrediction ? (
                      <div style={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '8px', padding: '6px' }}>
                        <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 700 }}>{t.aiPrediction}{table.exitPrediction.minutes}{t.aiMin}</div>
                        <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>{table.exitPrediction.reason}</div>
                      </div>
                    ) : (
                      <div style={{ background: '#0f172a', borderRadius: '8px', padding: '6px', fontSize: '10px', color: '#64748b', textAlign: 'center' }}>
                        {t.aiWaiting}
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => updateStatus(table.id, table.status)}
                  style={{ width: '100%', background: STATUS_COLOR[table.status], border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '7px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.nextStatus[table.status]}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '360px' }}>
            <h2 style={{ color: '#f1f5f9', fontSize: '17px', fontWeight: 800, margin: '0 0 20px' }}>{t.modalTitle}</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>{t.typeSelect}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['table', 'counter', 'room'] as TableType[]).map((tp) => (
                  <button key={tp} onClick={() => setNewType(tp)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', background: newType === tp ? '#1c0a00' : '#0f172a', border: `1px solid ${newType === tp ? '#f97316' : '#334155'}`, color: newType === tp ? '#f97316' : '#64748b', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {TYPE_EMOJI[tp]}<br />{t.typeLabel[tp]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>{t.seatsSelect}</label>
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
                {t.cancel}
              </button>
              <button onClick={addTable}
                style={{ flex: 2, background: '#f97316', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}