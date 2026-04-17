'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type Payment = {
  id: string;
  tableNumber: number;
  items: string[];
  total: number;
  payMethod: 'card' | 'cash';
  status: 'pending' | 'done';
  createdAt: { seconds: number } | null;
};

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Payment[];
      setPayments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markDone = async (id: string) => {
    await updateDoc(doc(db, 'payments', id), { status: 'done' });
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const donePayments = payments.filter((p) => p.status === 'done');

  const formatTime = (payment: Payment) => {
    if (!payment.createdAt) return '';
    const date = new Date(payment.createdAt.seconds * 1000);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>← ダッシュボード</button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>💳 お会計管理</h1>
        </div>
        {pendingPayments.length > 0 && (
          <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '20px', padding: '4px 12px' }}>
            <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>{pendingPayments.length}件 未対応</span>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
          未対応 {pendingPayments.length > 0 && <span style={{ color: '#ef4444' }}>({pendingPayments.length})</span>}
        </h2>

        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>読み込み中...</div>
        ) : pendingPayments.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>未対応のお会計はありません ✅</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {pendingPayments.map((payment) => (
              <div key={payment.id} style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ background: '#f97316', color: '#fff', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>テーブル {payment.tableNumber}</span>
                    <span style={{ background: payment.payMethod === 'card' ? '#1e3a5f' : '#1a3a1a', color: payment.payMethod === 'card' ? '#60a5fa' : '#4ade80', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                      {payment.payMethod === 'card' ? '💳 カード' : '💴 現金'}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(payment)}</span>
                  </div>
                  <p style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 800, margin: '0 0 6px', color: '#f97316' }}>¥{payment.total.toLocaleString()}</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{payment.items.join('、')}</p>
                </div>
                <button onClick={() => markDone(payment.id)}
                  style={{ background: '#f97316', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  対応済み ✓
                </button>
              </div>
            ))}
          </div>
        )}

        {donePayments.length > 0 && (
          <>
            <h2 style={{ color: '#64748b', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>対応済み ({donePayments.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {donePayments.map((payment) => (
                <div key={payment.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                  <span style={{ background: '#334155', color: '#94a3b8', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>テーブル {payment.tableNumber}</span>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, flex: 1 }}>¥{payment.total.toLocaleString()} · {payment.items.join('、')}</p>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(payment)}</span>
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>✓ 対応済み</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}