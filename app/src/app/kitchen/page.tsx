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

type Lang = 'ja' | 'en';

const TR = {
  ja: {
    back: '← 戻る',
    title: 'キッチン',
    count: (n: number) => `${n}件対応中`,
    empty: '注文はありません',
    table: 'テーブル',
    status: { pending: '未対応', preparing: '調理中' },
    start: '調理開始 →',
    done: '完了 ✓',
  },
  en: {
    back: '← Back',
    title: 'Kitchen',
    count: (n: number) => `${n} active`,
    empty: 'No orders',
    table: 'Table',
    status: { pending: 'Pending', preparing: 'Preparing' },
    start: 'Start →',
    done: 'Done ✓',
  },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lang, setLang] = useState<Lang>('ja');
  const router = useRouter();
  const t = TR[lang];

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Order[];
      setOrders(data.filter((o) => o.status !== 'done'));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <div style={{ background: '#0F172A', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            {t.back}
          </button>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', margin: 0 }}>{t.title}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {(['ja', 'en'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '3px 8px', fontSize: '11px', fontWeight: lang === l ? 700 : 400, background: lang === l ? '#334155' : 'transparent', color: lang === l ? '#f1f5f9' : '#64748b', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {l === 'ja' ? '🇯🇵' : '🇺🇸'}
              </button>
            ))}
          </div>
          <div style={{ background: '#EAB308', borderRadius: '20px', padding: '4px 14px' }}>
            <p style={{ color: '#0F172A', fontSize: '13px', fontWeight: 700, margin: 0 }}>{t.count(orders.length)}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {orders.length === 0 ? (
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', margin: 0 }}>{t.empty}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {orders.map((order) => (
              <div key={order.id}
                style={{ background: '#0F172A', borderRadius: '14px', padding: '18px', borderTop: `5px solid ${order.status === 'pending' ? '#EAB308' : '#3B82F6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '20px', margin: 0 }}>{t.table} {order.tableNumber}</p>
                  <span style={{ background: order.status === 'pending' ? 'rgba(234,179,8,0.2)' : 'rgba(59,130,246,0.2)', color: order.status === 'pending' ? '#EAB308' : '#3B82F6', fontSize: '13px', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
                    {t.status[order.status as 'pending' | 'preparing']}
                  </span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  {order.items.map((item, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', margin: '0 0 6px', fontWeight: 500 }}>・{item}</p>
                  ))}
                </div>
                <button onClick={() => updateStatus(order.id, order.status === 'pending' ? 'preparing' : 'done')}
                  style={{ width: '100%', background: order.status === 'pending' ? '#EAB308' : '#3B82F6', border: 'none', color: order.status === 'pending' ? '#0F172A' : 'white', fontSize: '15px', fontWeight: 700, padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>
                  {order.status === 'pending' ? t.start : t.done}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}