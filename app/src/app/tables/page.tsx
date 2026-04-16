'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type Table = {
  id: string;
  number: number;
  status: 'empty' | 'occupied' | 'billing';
};

const statusLabel = { empty: '空席', occupied: '使用中', billing: '会計待ち' };
const statusColor = { empty: '#22C55E', occupied: '#3B82F6', billing: '#EAB308' };
const nextStatus = { empty: 'occupied', occupied: 'billing', billing: 'empty' } as const;

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
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

  const updateStatus = async (id: string, status: Table['status']) => {
    await updateDoc(doc(db, 'tables', id), { status });
  };

  const addTable = async () => {
    const number = tables.length + 1;
    const id = `table_${number}`;
    await setDoc(doc(db, 'tables', id), { number, status: 'empty' });
  };

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <div style={{ background: '#0F172A', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            ← 戻る
          </button>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: 0 }}>テーブル管理</p>
        </div>
        <button
          onClick={addTable}
          style={{ background: '#EA580C', border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer' }}
        >
          ＋ 追加
        </button>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {tables.length === 0 ? (
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>テーブルがまだありません</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {tables.map((table) => (
              <div
                key={table.id}
                style={{ background: '#0F172A', borderRadius: '14px', padding: '20px', textAlign: 'center', borderTop: `4px solid ${statusColor[table.status]}` }}
              >
                <p style={{ color: 'white', fontWeight: '700', fontSize: '32px', margin: '0 0 6px' }}>{table.number}</p>
                <p style={{ color: statusColor[table.status], fontSize: '13px', fontWeight: '600', margin: '0 0 14px' }}>
                  {statusLabel[table.status]}
                </p>
                <button
                  onClick={() => updateStatus(table.id, nextStatus[table.status])}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  次へ →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}