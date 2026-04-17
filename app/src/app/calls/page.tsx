'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Call = {
  id: string;
  tableNumber: number;
  reason: string;
  memo: string;
  status: 'pending' | 'done';
  createdAt: { seconds: number } | null;
};

export default function CallsPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'calls'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Call[];
      setCalls(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markDone = async (id: string) => {
    await updateDoc(doc(db, 'calls', id), { status: 'done' });
  };

  const pendingCalls = calls.filter((c) => c.status === 'pending');
  const doneCalls = calls.filter((c) => c.status === 'done');

  const formatTime = (call: Call) => {
    if (!call.createdAt) return '';
    const date = new Date(call.createdAt.seconds * 1000);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const reasonLabel: { [key: string]: string } = {
    water: '💧 お水をください',
    order: '📋 注文を変更したい',
    clean: '🧹 テーブルを拭いてほしい',
    other: '🔔 その他',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>← ダッシュボード</button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>🔔 スタッフ呼び出し</h1>
        </div>
        {pendingCalls.length > 0 && (
          <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '20px', padding: '4px 12px' }}>
            <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>{pendingCalls.length}件 未対応</span>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* 未対応 */}
        <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
          未対応 {pendingCalls.length > 0 && <span style={{ color: '#ef4444' }}>({pendingCalls.length})</span>}
        </h2>

        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>読み込み中...</div>
        ) : pendingCalls.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>未対応の呼び出しはありません ✅</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {pendingCalls.map((call) => (
              <div key={call.id} style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ background: '#f97316', color: '#fff', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>テーブル {call.tableNumber}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(call)}</span>
                  </div>
                  <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>{reasonLabel[call.reason] || call.reason}</p>
                  {call.memo && <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{call.memo}</p>}
                </div>
                <button onClick={() => markDone(call.id)}
                  style={{ background: '#f97316', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  対応済み ✓
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 対応済み */}
        {doneCalls.length > 0 && (
          <>
            <h2 style={{ color: '#64748b', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>対応済み ({doneCalls.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {doneCalls.map((call) => (
                <div key={call.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                  <span style={{ background: '#334155', color: '#94a3b8', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>テーブル {call.tableNumber}</span>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, flex: 1 }}>{reasonLabel[call.reason] || call.reason}</p>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatTime(call)}</span>
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