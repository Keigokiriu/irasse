'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type Order = {
  id: string;
  tableNumber: number;
  items: string[];
  status: 'pending' | 'preparing' | 'done';
  createdAt: Date;
};

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuPrices, setMenuPrices] = useState<{ [name: string]: number }>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribeMenu = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const prices: { [name: string]: number } = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        prices[data.name] = data.price;
      });
      setMenuPrices(prices);
    });

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Order[];
      setOrders(data);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, []);

  const calcOrderTotal = (items: string[]) => {
    return items.reduce((sum, item) => {
      const match = item.match(/^(.+) x(\d+)$/);
      if (!match) return sum;
      const name = match[1];
      const qty = Number(match[2]);
      return sum + (menuPrices[name] || 0) * qty;
    }, 0);
  };

  const doneOrders = orders.filter((o) => o.status === 'done');
  const totalSales = doneOrders.reduce((sum, o) => sum + calcOrderTotal(o.items), 0);

  const statusColor = {
    pending: { border: '#EAB308', bg: 'rgba(234,179,8,0.2)', text: '#EAB308', label: '未対応' },
    preparing: { border: '#3B82F6', bg: 'rgba(59,130,246,0.2)', text: '#3B82F6', label: '調理中' },
    done: { border: '#22C55E', bg: 'rgba(34,197,94,0.2)', text: '#22C55E', label: '完了' },
  };

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <div style={{ background: '#0F172A', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          ← 戻る
        </button>
        <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: 0 }}>売上管理</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '16px', textAlign: 'center', borderTop: '4px solid #EA580C' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', margin: '0 0 6px' }}>総売上（完了分）</p>
            <p style={{ color: '#EA580C', fontWeight: '700', fontSize: '22px', margin: 0 }}>¥{totalSales.toLocaleString()}</p>
          </div>
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '16px', textAlign: 'center', borderTop: '4px solid #3B82F6' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', margin: '0 0 6px' }}>総注文数</p>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '22px', margin: 0 }}>{orders.length}</p>
          </div>
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '16px', textAlign: 'center', borderTop: '4px solid #22C55E' }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '600', margin: '0 0 6px' }}>完了注文数</p>
            <p style={{ color: '#22C55E', fontWeight: '700', fontSize: '22px', margin: 0 }}>{doneOrders.length}</p>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '600', margin: '0 0 10px' }}>注文履歴</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{ background: '#0F172A', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${statusColor[order.status].border}` }}
            >
              <div>
                <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: '0 0 2px' }}>テーブル {order.tableNumber}</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0 }}>{order.items.join('・')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#EA580C', fontWeight: '700', fontSize: '15px', margin: '0 0 4px' }}>¥{calcOrderTotal(order.items).toLocaleString()}</p>
                <span style={{ background: statusColor[order.status].bg, color: statusColor[order.status].text, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>
                  {statusColor[order.status].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}