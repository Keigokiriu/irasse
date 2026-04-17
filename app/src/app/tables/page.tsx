'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type TableType = 'table' | 'counter' | 'room';
type TableStatus = 'empty' | 'occupied' | 'billing' | 'paid' | 'leaving';

type Table = {
  id: string;
  number: number;
  type: TableType;
  seats: number;
  status: TableStatus;
};

const STATUS_LABEL: Record<TableStatus, string> = {
  empty: '空席',
  occupied: '着席中',
  billing: '会計待ち',
  paid: '会計済・退店待ち',
  leaving: '案内OK',
};

const STATUS_COLOR: Record<TableStatus, string> = {
  empty: '#22c55e',
  occupied: '#3b82f6',
  billing: '#f59e0b',
  paid: '#a855f7',
  leaving: '#f97316',
};

const STATUS_BG: Record<TableStatus, string> = {
  empty: '#052e16',
  occupied: '#1e3a5f',
  billing: '#2a1f08',
  paid: '#2e1065',
  leaving: '#1c0a00',
};

const NEXT_STATUS: Record<TableStatus, TableStatus> = {
  empty: 'occupied',
  occupied: 'billing',
  billing: 'paid',
  paid: 'leaving',
  leaving: 'empty',
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

  const updateStatus = async (id: string, status: TableStatus) => {
    await updateDoc(doc(db, 'tables', id), { status });
  };

  const addTable = async () => {
    const number = tables.length + 1;
    const id = `table_${Date.now()}`;
    await setDoc(doc(db, 'tables', id), {
      number,
      type: newType,
      seats: newSeats,
      status: 'empty',
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
    leaving: tables.filter((t) => t.status === 'leaving').length,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
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
        {/* サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {(Object.keys(STATUS_LABEL) as TableStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              style={{ background: filterStatus === s ? STATUS_BG[s] : '#1e293b', border: `1px solid ${filterStatus === s ? STATUS_COLOR[s] : '#334155'}`, borderRadius: '10px', padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ color: STATUS_COLOR[s], fontSize: '18px', fontWeight: 800 }}>{stats[s]}</div>
              <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '2px' }}>{STATUS_LABEL[s]}</div>
            </button>
          ))}
        </div>

        {/* 会計待ち・案内OK のアラート */}
        {(stats.billing > 0 || stats.leaving > 0) && (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.billing > 0 && (
              <div style={{ background: '#2a1f08', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>💳</span>
                <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{stats.billing}卓が会計待ちです</span>
              </div>
            )}
            {stats.leaving > 0 && (
              <div style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700 }}>{stats.leaving}卓が案内OKです</span>
              </div>
            )}
          </div>
        )}

        {/* テーブルグリッド */}
        {tables.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0 }}>テーブルがまだありません。「＋ 追加」から追加してください。</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {filteredTables.map((table) => (
              <div key={table.id}
                style={{ background: STATUS_BG[table.status], border: `1px solid ${STATUS_COLOR[table.status]}`, borderRadius: '14px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                {/* 削除ボタン */}
                <button onClick={() => deleteTable(table.id)}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: '2px' }}>
                  ✕
                </button>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{TYPE_EMOJI[table.type || 'table']}</div>
                <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '2px' }}>{TYPE_LABEL[table.type || 'table']}</div>
                <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{table.number}</div>
                <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px' }}>👤 {table.seats || 2}席</div>
                <div style={{ background: STATUS_COLOR[table.status] + '22', borderRadius: '8px', padding: '4px 6px', marginBottom: '10px' }}>
                  <span style={{ color: STATUS_COLOR[table.status], fontSize: '10px', fontWeight: 700 }}>{STATUS_LABEL[table.status]}</span>
                </div>
                <button onClick={() => updateStatus(table.id, NEXT_STATUS[table.status])}
                  style={{ width: '100%', background: STATUS_COLOR[table.status], border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '7px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {NEXT_STATUS[table.status] === 'empty' ? '退店済み →' :
                   NEXT_STATUS[table.status] === 'occupied' ? '着席 →' :
                   NEXT_STATUS[table.status] === 'billing' ? '会計待ち →' :
                   NEXT_STATUS[table.status] === 'paid' ? '会計済み →' : '案内OK →'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 追加モーダル */}
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