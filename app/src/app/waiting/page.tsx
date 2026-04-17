'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const C = {
  bg: '#09090b', surf: '#111113', bdr: '#222226',
  txt: '#ffffff', muted: '#888891', amber: '#ff8c38',
  amberD: '#1c0a00', amberM: '#ff6b00', faint: '#18181b',
};

type StoreStatus = {
  totalSeats: number;
  occupiedSeats: number;
  isOpen: boolean;
};

type WaitlistEntry = {
  id: string;
  name: string;
  partySize: number;
  status: 'waiting' | 'ready' | 'seated';
  position: number;
  createdAt: { seconds: number } | null;
};

function WaitingForm() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'main';
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [myEntry, setMyEntry] = useState<WaitlistEntry | null>(null);
  const [myEntryId, setMyEntryId] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'register' | 'waiting'>('status');
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) setStoreStatus(snap.data() as StoreStatus);
    });
    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'asc'));
    const unsubWait = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d, i) => ({
        id: d.id, ...d.data(), position: i + 1,
      })) as WaitlistEntry[];
      setWaitlist(data);
      if (myEntryId) {
        const found = data.find((e) => e.id === myEntryId);
        if (found) setMyEntry(found);
      }
    });
    return () => { unsubStatus(); unsubWait(); };
  }, [myEntryId]);

  const handleRegister = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'waitlist'), {
        name, partySize, status: 'waiting', createdAt: serverTimestamp(),
      });
      setMyEntryId(docRef.id);
      setStep('waiting');
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const waitingList = waitlist.filter((e) => e.status === 'waiting');
  const myPosition = myEntry ? waitingList.findIndex((e) => e.id === myEntry.id) + 1 : 0;
  const estimatedWait = myPosition * 15;
  const availableSeats = storeStatus ? storeStatus.totalSeats - storeStatus.occupiedSeats : 0;
  const congestionRate = storeStatus ? storeStatus.occupiedSeats / storeStatus.totalSeats : 0;
  const congestionLabel = congestionRate >= 0.9 ? '🔴 混雑' : congestionRate >= 0.6 ? '🟡 やや混雑' : '🟢 余裕あり';
  const congestionColor = congestionRate >= 0.9 ? '#ef4444' : congestionRate >= 0.6 ? '#f59e0b' : '#22c55e';

  if (step === 'waiting' && myEntry) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ padding: '32px 24px', width: '100%', maxWidth: '400px' }}>
        {myEntry.status === 'ready' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔔</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>お席の準備ができました！</div>
            <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>スタッフにお声がけください</div>
            <button onClick={() => window.location.href = `/order?table=1`}
              style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
              入店して注文する →
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '8px' }}>現在の順番</div>
              <div style={{ fontSize: '64px', fontWeight: 800, color: C.amber, lineHeight: 1 }}>{myPosition}</div>
              <div style={{ fontSize: '16px', color: C.muted, marginTop: '4px' }}>番目</div>
            </div>
            <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: C.muted, fontSize: '13px' }}>お名前</span>
                <span style={{ color: C.txt, fontSize: '13px', fontWeight: 700 }}>{myEntry.name} 様</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: C.muted, fontSize: '13px' }}>人数</span>
                <span style={{ color: C.txt, fontSize: '13px', fontWeight: 700 }}>{myEntry.partySize}名</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: C.muted, fontSize: '13px' }}>待ち時間の目安</span>
                <span style={{ color: C.amber, fontSize: '13px', fontWeight: 700 }}>約{estimatedWait}分</span>
              </div>
            </div>
            <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>順番が来たらこの画面に通知が届きます。<br />近くでお待ちください。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (step === 'register') return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => setStep('status')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>← 戻る</button>
        <div style={{ fontSize: '17px', fontWeight: 800, color: C.txt }}>順番待ちに登録</div>
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: C.muted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>お名前</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：田中"
            style={{ width: '100%', background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '12px 14px', color: C.txt, fontSize: '15px', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif" }} />
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={{ color: C.muted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>人数</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} onClick={() => setPartySize(n)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: partySize === n ? C.amberD : C.surf, border: `1px solid ${partySize === n ? C.amberM : C.bdr}`, color: partySize === n ? C.amber : C.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRegister} disabled={!name.trim() || loading}
          style={{ width: '100%', background: name.trim() ? C.amber : C.faint, border: 'none', color: name.trim() ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: name.trim() ? 'pointer' : 'default', fontFamily: "'Noto Sans JP', sans-serif" }}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: C.txt }}>Irasse</div>
        <div style={{ fontSize: '11px', color: C.muted }}>現在の混雑状況</div>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: C.txt }}>{congestionLabel}</span>
            <span style={{ background: C.faint, border: `1px solid ${congestionColor}`, borderRadius: '20px', padding: '4px 12px', color: congestionColor, fontSize: '12px', fontWeight: 700 }}>
              {storeStatus?.occupiedSeats ?? 0} / {storeStatus?.totalSeats ?? 0} 席
            </span>
          </div>
          <div style={{ background: C.faint, borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '8px', background: congestionColor, width: `${congestionRate * 100}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {availableSeats > 0 ? (
          <button onClick={() => window.location.href = `/order?table=1`}
            style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', fontFamily: "'Noto Sans JP', sans-serif" }}>
            このまま入店して注文する →
          </button>
        ) : (
          <div style={{ background: '#1a0000', border: '1px solid #ef4444', borderRadius: '12px', padding: '14px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 700, margin: 0 }}>❌ 現在満席です</p>
          </div>
        )}

        {waitingList.length > 0 && (
          <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.txt, marginBottom: '10px' }}>ウェイティングリスト</div>
            {waitingList.slice(0, 3).map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${C.bdr}` : 'none' }}>
                <span style={{ color: C.txt, fontSize: '13px' }}>{entry.name} 様（{entry.partySize}名）</span>
                <span style={{ color: i === 0 ? C.amber : C.muted, fontSize: '12px', fontWeight: 700 }}>{i + 1}番目</span>
              </div>
            ))}
            {waitingList.length > 3 && <p style={{ color: C.muted, fontSize: '12px', margin: '8px 0 0', textAlign: 'center' }}>他 {waitingList.length - 3}組 待ち</p>}
          </div>
        )}

        <button onClick={() => setStep('register')}
          style={{ width: '100%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '14px', fontWeight: 700, padding: '14px', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
          📋 ウェイティングリストに追加する
        </button>
      </div>
    </div>
  );
}

export default function WaitingPage() {
  return <Suspense><WaitingForm /></Suspense>;
}