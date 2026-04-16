'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type Order = {
  id: string;
  tableNumber: number;
  items: string[];
  status: 'pending' | 'preparing' | 'done';
  createdAt: Date;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Order[];
      setOrders(data);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  const statusLabel = { pending: '未対応', preparing: '調理中', done: '完了' };
  const statusColor = {
    pending: { bg: 'rgba(234,179,8,0.2)', text: '#EAB308', border: '#EAB308' },
    preparing: { bg: 'rgba(59,130,246,0.2)', text: '#3B82F6', border: '#3B82F6' },
    done: { bg: 'rgba(34,197,94,0.2)', text: '#22C55E', border: '#22C55E' },
  };
  const nextStatus = { pending: 'preparing', preparing: 'done', done: 'pending' } as const;

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
          <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: 0 }}>注文一覧</p>
        </div>
        <div style={{ background: '#EA580C', borderRadius: '20px', padding: '4px 12px' }}>
          <p style={{ color: 'white', fontSize: '12px', fontWeight: '500', margin: 0 }}>{orders.length}件</p>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {orders.length === 0 ? (
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>注文はまだありません</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{ background: '#0F172A', borderRadius: '14px', padding: '14px 16px', borderLeft: `4px solid ${statusColor[order.status].border}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: 0 }}>テーブル {order.tableNumber}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: statusColor[order.status].bg, color: statusColor[order.status].text, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
                    {statusLabel[order.status]}
                  </span>
                  <button
                    onClick={() => updateStatus(order.id, nextStatus[order.status])}
                    style={{ background: order.status === 'done' ? 'rgba(255,255,255,0.1)' : '#EA580C', border: 'none', color: 'white', fontSize: '12px', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                  >
                    次へ →
                  </button>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>
                {order.items.join('・')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}