'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, orderBy, query, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type WaitlistEntry = {
  id: string;
  name: string;
  partySize: number;
  status: 'waiting' | 'ready' | 'seated';
  createdAt: { seconds: number } | null;
};

type StoreStatus = {
  totalSeats: number;
  occupiedSeats: number;
  isOpen: boolean;
};

export default function WaitlistPage() {
  const router = useRouter();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'asc'));
    const unsubWait = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WaitlistEntry[];
      setWaitlist(data);
      setLoading(false);
    });
    const unsubStatus = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) setStoreStatus(snap.data() as StoreStatus);
    });
    return () => { unsubWait(); unsubStatus(); };
  }, []);

  const callReady = async (id: string) => {
    await updateDoc(doc(db, 'waitlist', id), { status: 'ready' });
  };

  const markSeated = async (id: string) => {
    await updateDoc(doc(db, 'waitlist', id), { status: 'seated' });
    if (storeStatus) {
      await updateDoc(doc(db, 'store_status', 'main'), {
        occupiedSeats: storeStatus.occupiedSeats + 1,
      });
    }
  };

  const updateSeats = async (delta: number) => {
    if (!storeStatus) return;
    const newVal = Math.max(0, Math.min(storeStatus.totalSeats, storeStatus.occupiedSeats + delta));
    await updateDoc(doc(db, 'store_status', 'main'), { occupiedSeats: newVal });
  };

  const waitingList = waitlist.filter((e) => e.status === 'waiting');
  const readyList = waitlist.filter((e) => e.status === 'ready');
  const seatedList = waitlist.filter((e) => e.status === 'seated');
  const availableSeats = storeStatus ? storeStatus.totalSeats - storeStatus.occupiedSeats : 0;
  const congestionRate = storeStatus ? storeStatus.occupiedSeats / storeStatus.totalSeats : 0;
  const congestionLabel = congestionRate >= 0.9 ? '🔴 混雑' : congestionRate >= 0.6 ? '🟡 やや混雑' : '🟢 余裕あり';

  const formatTime = (entry: WaitlistEntry) => {
    if (!entry.createdAt) return '';
    return new Date(entry.createdAt.seconds * 1000).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>← ダッシュボード</button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>📋 待ち行列管理</h1>
        </div>
        {waitingList.length > 0 && (
          <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '20px', padding: '4px 12px' }}>
            <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>{waitingList.length}組 待ち</span>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* 混雑状況 */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700 }}>{congestionLabel}</span>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{storeStatus?.occupiedSeats ?? 0} / {storeStatus?.totalSeats ?? 0} 席</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>着席数を調整：</span>
            <button onClick={() => updateSeats(-1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer' }}>−</button>
            <span style={{ color: '#f97316', fontSize: '18px', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>{storeStatus?.occupiedSeats ?? 0}</span>
            <button onClick={() => updateSeats(1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            <span style={{ color: '#64748b', fontSize: '13px' }}>空き: {availableSeats}席</span>
          </div>
        </div>

        {/* 案内待ち（ready） */}
        {readyList.length > 0 && (
          <>
            <h2 style={{ color: '#4ade80', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>🔔 案内中 ({readyList.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {readyList.map((entry) => (
                <div key={entry.id} style={{ background: '#1e293b', border: '1px solid #4ade80', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{entry.name} 様（{entry.partySize}名）</span>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '10px' }}>{formatTime(entry)}</span>
                  </div>
                  <button onClick={() => markSeated(entry.id)}
                    style={{ background: '#4ade80', border: 'none', color: '#000', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    着席済み ✓
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 待ち行列 */}
        <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
          待ち行列 {waitingList.length > 0 && <span style={{ color: '#ef4444' }}>({waitingList.length}組)</span>}
        </h2>
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>読み込み中...</div>
        ) : waitingList.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>待ち行列はありません ✅</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {waitingList.map((entry, i) => (
              <div key={entry.id} style={{ background: '#1e293b', border: `1px solid ${i === 0 ? '#f97316' : '#334155'}`, borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ background: i === 0 ? '#f97316' : '#334155', color: '#fff', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>{i + 1}番目</span>
                  <div>
                    <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{entry.name} 様（{entry.partySize}名）</span>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '10px' }}>{formatTime(entry)}</span>
                  </div>
                </div>
                {i === 0 && (
                  <button onClick={() => callReady(entry.id)}
                    style={{ background: '#f97316', border: 'none', color: '#fff', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    案内する 🔔
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 着席済み */}
        {seatedList.length > 0 && (
          <>
            <h2 style={{ color: '#64748b', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>着席済み ({seatedList.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {seatedList.map((entry) => (
                <div key={entry.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{entry.name} 様（{entry.partySize}名）</span>
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700, marginLeft: 'auto' }}>✓ 着席済み</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}