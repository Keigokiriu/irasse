'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type WaitlistEntry = {
  id: string;
  name: string;
  partySize: number;
  status: 'waiting' | 'soon' | 'ready' | 'seated';
  createdAt: { seconds: number } | null;
};

type StoreStatus = {
  totalSeats: number;
  occupiedSeats: number;
  isOpen: boolean;
};

type Lang = 'ja' | 'en';

const TR = {
  ja: {
    back: '← ダッシュボード',
    title: '📋 待ち行列管理',
    waitingBadge: (n: number) => `${n}組 待ち`,
    congestionLabel: (rate: number) => rate >= 0.9 ? '🔴 混雑' : rate >= 0.6 ? '🟡 やや混雑' : '🟢 余裕あり',
    seats: '席',
    adjustSeats: '着席数を調整：',
    available: (n: number) => `空き: ${n}席`,
    soonTitle: (n: number) => `⏰ もうすぐ案内 (${n})`,
    soonLabel: '⏰ もうすぐご案内します',
    callReady: '案内する 🔔',
    readyTitle: (n: number) => `🔔 案内中 (${n})`,
    markSeated: '着席済み ✓',
    waitingTitle: '待ち行列',
    waitingCount: (n: number) => `(${n}組)`,
    loading: '読み込み中...',
    empty: '待ち行列はありません ✅',
    position: (n: number) => `${n}番目`,
    nameSuffix: '様',
    partySuffix: '名',
    callSoon: '⏰ 5分前',
    seatedTitle: (n: number) => `着席済み (${n})`,
    seatedLabel: '✓ 着席済み',
  },
  en: {
    back: '← Dashboard',
    title: '📋 Waitlist Management',
    waitingBadge: (n: number) => `${n} waiting`,
    congestionLabel: (rate: number) => rate >= 0.9 ? '🔴 Busy' : rate >= 0.6 ? '🟡 Moderate' : '🟢 Available',
    seats: 'seats',
    adjustSeats: 'Adjust occupied:',
    available: (n: number) => `Available: ${n}`,
    soonTitle: (n: number) => `⏰ Almost Ready (${n})`,
    soonLabel: '⏰ Almost your turn',
    callReady: 'Seat now 🔔',
    readyTitle: (n: number) => `🔔 Ready to Seat (${n})`,
    markSeated: 'Seated ✓',
    waitingTitle: 'Waiting List',
    waitingCount: (n: number) => `(${n} groups)`,
    loading: 'Loading...',
    empty: 'No one waiting ✅',
    position: (n: number) => `#${n}`,
    nameSuffix: '',
    partySuffix: ' guests',
    callSoon: '⏰ 5 min',
    seatedTitle: (n: number) => `Seated (${n})`,
    seatedLabel: '✓ Seated',
  },
};

export default function WaitlistPage() {
  const router = useRouter();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('ja');
  const t = TR[lang];

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

  const callSoon = async (id: string) => {
    await updateDoc(doc(db, 'waitlist', id), { status: 'soon' });
  };

  const callReady = async (id: string) => {
    await updateDoc(doc(db, 'waitlist', id), { status: 'ready' });
  };

  const markSeated = async (id: string) => {
    await updateDoc(doc(db, 'waitlist', id), { status: 'seated' });
    if (storeStatus) {
      await updateDoc(doc(db, 'store_status', 'main'), { occupiedSeats: storeStatus.occupiedSeats + 1 });
    }
  };

  const updateSeats = async (delta: number) => {
    if (!storeStatus) return;
    const newVal = Math.max(0, Math.min(storeStatus.totalSeats, storeStatus.occupiedSeats + delta));
    await updateDoc(doc(db, 'store_status', 'main'), { occupiedSeats: newVal });
  };

  const waitingList = waitlist.filter((e) => e.status === 'waiting');
  const soonList = waitlist.filter((e) => e.status === 'soon');
  const readyList = waitlist.filter((e) => e.status === 'ready');
  const seatedList = waitlist.filter((e) => e.status === 'seated');
  const availableSeats = storeStatus ? storeStatus.totalSeats - storeStatus.occupiedSeats : 0;
  const congestionRate = storeStatus ? storeStatus.occupiedSeats / storeStatus.totalSeats : 0;

  const formatTime = (entry: WaitlistEntry) => {
    if (!entry.createdAt) return '';
    return new Date(entry.createdAt.seconds * 1000).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          {waitingList.length > 0 && (
            <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '20px', padding: '4px 12px' }}>
              <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>{t.waitingBadge(waitingList.length)}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* 混雑状況 */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700 }}>{t.congestionLabel(congestionRate)}</span>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{storeStatus?.occupiedSeats ?? 0} / {storeStatus?.totalSeats ?? 0} {t.seats}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t.adjustSeats}</span>
            <button onClick={() => updateSeats(-1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer' }}>−</button>
            <span style={{ color: '#f97316', fontSize: '18px', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>{storeStatus?.occupiedSeats ?? 0}</span>
            <button onClick={() => updateSeats(1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }}>+</button>
            <span style={{ color: '#64748b', fontSize: '13px' }}>{t.available(availableSeats)}</span>
          </div>
        </div>

        {/* もうすぐ案内（soon） */}
        {soonList.length > 0 && (
          <>
            <h2 style={{ color: '#93c5fd', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>{t.soonTitle(soonList.length)}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {soonList.map((entry) => (
                <div key={entry.id} style={{ background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{entry.name} {t.nameSuffix}（{entry.partySize}{t.partySuffix}）</span>
                    <span style={{ color: '#93c5fd', fontSize: '12px', marginLeft: '10px' }}>{t.soonLabel}</span>
                  </div>
                  <button onClick={() => callReady(entry.id)}
                    style={{ background: '#f97316', border: 'none', color: '#fff', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {t.callReady}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 案内待ち（ready） */}
        {readyList.length > 0 && (
          <>
            <h2 style={{ color: '#4ade80', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>{t.readyTitle(readyList.length)}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {readyList.map((entry) => (
                <div key={entry.id} style={{ background: '#1e293b', border: '1px solid #4ade80', borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{entry.name} {t.nameSuffix}（{entry.partySize}{t.partySuffix}）</span>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '10px' }}>{formatTime(entry)}</span>
                  </div>
                  <button onClick={() => markSeated(entry.id)}
                    style={{ background: '#4ade80', border: 'none', color: '#000', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    {t.markSeated}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 待ち行列 */}
        <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
          {t.waitingTitle} {waitingList.length > 0 && <span style={{ color: '#ef4444' }}>{t.waitingCount(waitingList.length)}</span>}
        </h2>
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>{t.loading}</div>
        ) : waitingList.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{t.empty}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {waitingList.map((entry, i) => (
              <div key={entry.id} style={{ background: '#1e293b', border: `1px solid ${i === 0 ? '#f97316' : '#334155'}`, borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ background: i === 0 ? '#f97316' : '#334155', color: '#fff', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>{t.position(i + 1)}</span>
                  <div>
                    <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{entry.name} {t.nameSuffix}（{entry.partySize}{t.partySuffix}）</span>
                    <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '10px' }}>{formatTime(entry)}</span>
                  </div>
                </div>
                {(i === 0 || i === 1) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {i === 1 && (
                      <button onClick={() => callSoon(entry.id)}
                        style={{ background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {t.callSoon}
                      </button>
                    )}
                    {i === 0 && (
                      <button onClick={() => callReady(entry.id)}
                        style={{ background: '#f97316', border: 'none', color: '#fff', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {t.callReady}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 着席済み */}
        {seatedList.length > 0 && (
          <>
            <h2 style={{ color: '#64748b', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>{t.seatedTitle(seatedList.length)}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {seatedList.map((entry) => (
                <div key={entry.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{entry.name} {t.nameSuffix}（{entry.partySize}{t.partySuffix}）</span>
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700, marginLeft: 'auto' }}>{t.seatedLabel}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}