'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TR = {
  ja: {
    title: 'Irasse', congestion: '現在の混雑状況',
    crowded: '🔴 混雑', moderate: '🟡 やや混雑', available: '🟢 余裕あり',
    seats: '席', full: '❌ 現在満席です',
    enterNow: 'このまま入店して注文する →',
    waitingList: 'ウェイティングリスト',
    othersWaiting: '組 待ち',
    joinWaitlist: '📋 ウェイティングリストに追加する',
    registerTitle: '順番待ちに登録', back: '← 戻る',
    yourName: 'お名前', namePlaceholder: '例：田中',
    partySize: '人数', register: '登録する', registering: '登録中...',
    currentPosition: '現在の順番', positionSuffix: '番目',
    nameLabel: 'お名前', nameSuffix: '様',
    partySizeLabel: '人数', partySizeSuffix: '名',
    estimatedWait: '待ち時間の目安', approx: '約', minutes: '分',
    waitNote: '順番が来たらこの画面に通知が届きます。\n近くでお待ちください。',
    seatReady: 'お席の準備ができました！',
    seatReadySub: 'スタッフにお声がけください',
    enterAndOrder: '入店して注文する →',
    registerFailed: '登録に失敗しました。もう一度お試しください。',
  },
  en: {
    title: 'Irasse', congestion: 'Current Availability',
    crowded: '🔴 Busy', moderate: '🟡 Moderate', available: '🟢 Available',
    seats: 'seats', full: '❌ Currently Full',
    enterNow: 'Enter & Order →',
    waitingList: 'Waiting List',
    othersWaiting: ' groups waiting',
    joinWaitlist: '📋 Join the Waiting List',
    registerTitle: 'Join Waiting List', back: '← Back',
    yourName: 'Your Name', namePlaceholder: 'e.g. Smith',
    partySize: 'Party Size', register: 'Join', registering: 'Joining...',
    currentPosition: 'Your Position', positionSuffix: '',
    nameLabel: 'Name', nameSuffix: '',
    partySizeLabel: 'Party', partySizeSuffix: ' guests',
    estimatedWait: 'Estimated Wait', approx: '~', minutes: ' min',
    waitNote: 'We\'ll notify you on this screen when your table is ready.\nPlease stay nearby.',
    seatReady: 'Your table is ready!',
    seatReadySub: 'Please speak to a staff member',
    enterAndOrder: 'Enter & Order →',
    registerFailed: 'Registration failed. Please try again.',
  },
  ko: {
    title: 'Irasse', congestion: '현재 혼잡 상황',
    crowded: '🔴 혼잡', moderate: '🟡 보통', available: '🟢 여유',
    seats: '석', full: '❌ 현재 만석입니다',
    enterNow: '입장하여 주문하기 →',
    waitingList: '웨이팅 리스트',
    othersWaiting: '팀 대기 중',
    joinWaitlist: '📋 웨이팅 리스트에 등록',
    registerTitle: '대기 등록', back: '← 뒤로',
    yourName: '성함', namePlaceholder: '예: 김철수',
    partySize: '인원', register: '등록하기', registering: '등록 중...',
    currentPosition: '현재 순서', positionSuffix: '번째',
    nameLabel: '성함', nameSuffix: '님',
    partySizeLabel: '인원', partySizeSuffix: '명',
    estimatedWait: '예상 대기 시간', approx: '약', minutes: '분',
    waitNote: '순서가 되면 이 화면에 알림이 옵니다.\n근처에서 기다려 주세요.',
    seatReady: '자리가 준비되었습니다!',
    seatReadySub: '직원에게 말씀해 주세요',
    enterAndOrder: '입장하여 주문하기 →',
    registerFailed: '등록에 실패했습니다. 다시 시도해 주세요.',
  },
  zh: {
    title: 'Irasse', congestion: '当前拥挤状况',
    crowded: '🔴 拥挤', moderate: '🟡 较忙', available: '🟢 宽松',
    seats: '席', full: '❌ 当前已满座',
    enterNow: '直接入座点餐 →',
    waitingList: '等位列表',
    othersWaiting: '组等待中',
    joinWaitlist: '📋 加入等位列表',
    registerTitle: '等位登记', back: '← 返回',
    yourName: '姓名', namePlaceholder: '例：张三',
    partySize: '人数', register: '登记', registering: '登记中...',
    currentPosition: '当前顺序', positionSuffix: '号',
    nameLabel: '姓名', nameSuffix: '先生/女士',
    partySizeLabel: '人数', partySizeSuffix: '位',
    estimatedWait: '预计等待时间', approx: '约', minutes: '分钟',
    waitNote: '轮到您时，此屏幕会收到通知。\n请在附近等候。',
    seatReady: '您的座位已准备好！',
    seatReadySub: '请告知工作人员',
    enterAndOrder: '入座点餐 →',
    registerFailed: '登记失败，请重试。',
  },
};

type Lang = 'ja' | 'en' | 'ko' | 'zh';

const C = {
  bg: '#09090b', surf: '#111113', bdr: '#222226',
  txt: '#ffffff', muted: '#888891', amber: '#ff8c38',
  amberD: '#1c0a00', amberM: '#ff6b00', faint: '#18181b',
};

type StoreStatus = { totalSeats: number; occupiedSeats: number; isOpen: boolean; };
type WaitlistEntry = { id: string; name: string; partySize: number; status: 'waiting' | 'soon' | 'ready' | 'seated'; position: number; createdAt: { seconds: number } | null; };

function WaitingForm() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>('ja');
  const t = TR[lang];
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [myEntry, setMyEntry] = useState<WaitlistEntry | null>(null);
  const [myEntryId, setMyEntryId] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'register' | 'waiting'>('status');
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStoreStatus(data as StoreStatus);
        if (data.storeName) setStoreName(data.storeName);
      }
    });
    const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'asc'));
    const unsubWait = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d, i) => ({ id: d.id, ...d.data(), position: i + 1 })) as WaitlistEntry[];
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
    setErrorMessage('');
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'waitlist'), {
        name, partySize, status: 'waiting', createdAt: serverTimestamp(),
      });
      setErrorMessage('');
      setMyEntryId(docRef.id);
      setStep('waiting');
    } catch (e) {
      console.error(e);
      setErrorMessage(t.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  const waitingList = waitlist.filter((e) => e.status === 'waiting');
  const myPosition = myEntry ? waitingList.findIndex((e) => e.id === myEntry.id) + 1 : 0;
  const estimatedWait = myPosition * 15;
  const availableSeats = storeStatus ? storeStatus.totalSeats - storeStatus.occupiedSeats : 0;
  const congestionRate = storeStatus ? storeStatus.occupiedSeats / storeStatus.totalSeats : 0;
  const congestionLabel = congestionRate >= 0.9 ? t.crowded : congestionRate >= 0.6 ? t.moderate : t.available;
  const congestionColor = congestionRate >= 0.9 ? '#ef4444' : congestionRate >= 0.6 ? '#f59e0b' : '#22c55e';

  const LangButtons = () => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {(['ja', 'en', 'ko', 'zh'] as Lang[]).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          style={{ background: lang === l ? C.amberD : C.faint, border: `1px solid ${lang === l ? C.amberM : C.bdr}`, borderRadius: '6px', padding: '4px 6px', color: lang === l ? C.amber : C.muted, fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {l === 'ja' ? '🇯🇵' : l === 'en' ? '🇺🇸' : l === 'ko' ? '🇰🇷' : '🇨🇳'}
        </button>
      ))}
    </div>
  );

  if (step === 'waiting' && myEntry) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: C.txt }}>{storeName || t.title}</div>
        <LangButtons />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {myEntry.status === 'ready' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔔</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>{t.seatReady}</div>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>{t.seatReadySub}</div>
              <button onClick={() => window.location.href = `/order?table=1`}
                style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
                {t.enterAndOrder}
              </button>
            </div>
          ) : myEntry.status === 'soon' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏰</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#93c5fd', marginBottom: '8px' }}>
                {lang === 'ja' ? 'もうすぐお呼びします' : lang === 'en' ? 'Almost your turn!' : lang === 'ko' ? '곧 안내해 드립니다' : '即将为您安排座位'}
              </div>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>
                {lang === 'ja' ? '準備をしてお待ちください' : lang === 'en' ? 'Please be ready' : lang === 'ko' ? '준비해 주세요' : '请做好准备'}
              </div>
              <div style={{ background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: '#93c5fd', fontSize: '13px', margin: 0 }}>
                  {lang === 'ja' ? '間もなくスタッフがご案内します。近くでお待ちください。' : lang === 'en' ? 'A staff member will call you shortly. Please stay nearby.' : lang === 'ko' ? '직원이 곧 안내해 드립니다. 근처에서 기다려 주세요.' : '工作人员即将为您引导。请在附近等候。'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '8px' }}>{t.currentPosition}</div>
                <div style={{ fontSize: '64px', fontWeight: 800, color: C.amber, lineHeight: 1 }}>{myPosition}</div>
                <div style={{ fontSize: '16px', color: C.muted, marginTop: '4px' }}>{t.positionSuffix}</div>
              </div>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: C.muted, fontSize: '13px' }}>{t.nameLabel}</span>
                  <span style={{ color: C.txt, fontSize: '13px', fontWeight: 700 }}>{myEntry.name} {t.nameSuffix}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: C.muted, fontSize: '13px' }}>{t.partySizeLabel}</span>
                  <span style={{ color: C.txt, fontSize: '13px', fontWeight: 700 }}>{myEntry.partySize}{t.partySizeSuffix}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: C.muted, fontSize: '13px' }}>{t.estimatedWait}</span>
                  <span style={{ color: C.amber, fontSize: '13px', fontWeight: 700 }}>{t.approx}{estimatedWait}{t.minutes}</span>
                </div>
              </div>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>{t.waitNote.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (step === 'register') return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setStep('status')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>{t.back}</button>
          <div style={{ fontSize: '17px', fontWeight: 800, color: C.txt }}>{t.registerTitle}</div>
        </div>
        <LangButtons />
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: C.muted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>{t.yourName}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder}
            style={{ width: '100%', background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '12px 14px', color: C.txt, fontSize: '15px', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif" }} />
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={{ color: C.muted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>{t.partySize}</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} onClick={() => setPartySize(n)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: partySize === n ? C.amberD : C.surf, border: `1px solid ${partySize === n ? C.amberM : C.bdr}`, color: partySize === n ? C.amber : C.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        {errorMessage && (
  <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '12px' }}>
    {errorMessage}
  </div>
)}
<button onClick={handleRegister} disabled={!name.trim() || loading}
          style={{ width: '100%', background: name.trim() ? C.amber : C.faint, border: 'none', color: name.trim() ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: name.trim() ? 'pointer' : 'default', fontFamily: "'Noto Sans JP', sans-serif" }}>
          {loading ? t.registering : t.register}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: C.txt }}>{storeName || t.title}</div>
          <div style={{ fontSize: '11px', color: C.muted }}>{t.congestion}</div>
        </div>
        <LangButtons />
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: C.txt }}>{congestionLabel}</span>
            <span style={{ background: C.faint, border: `1px solid ${congestionColor}`, borderRadius: '20px', padding: '4px 12px', color: congestionColor, fontSize: '12px', fontWeight: 700 }}>
              {storeStatus?.occupiedSeats ?? 0} / {storeStatus?.totalSeats ?? 0} {t.seats}
            </span>
          </div>
          <div style={{ background: C.faint, borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '8px', background: congestionColor, width: `${congestionRate * 100}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {availableSeats > 0 ? (
          <button onClick={() => window.location.href = `/order?table=1`}
            style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', fontFamily: "'Noto Sans JP', sans-serif" }}>
            {t.enterNow}
          </button>
        ) : (
          <div style={{ background: '#1a0000', border: '1px solid #ef4444', borderRadius: '12px', padding: '14px', textAlign: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 700, margin: 0 }}>{t.full}</p>
          </div>
        )}

        {waitingList.length > 0 && (
          <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.txt, marginBottom: '10px' }}>{t.waitingList}</div>
            {waitingList.slice(0, 3).map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${C.bdr}` : 'none' }}>
                <span style={{ color: C.txt, fontSize: '13px' }}>{entry.name} {lang === 'ja' ? '様' : lang === 'ko' ? '님' : ''}（{entry.partySize}{lang === 'ja' ? '名' : lang === 'ko' ? '명' : lang === 'zh' ? '位' : ''}）</span>
                <span style={{ color: i === 0 ? C.amber : C.muted, fontSize: '12px', fontWeight: 700 }}>{i + 1}{t.positionSuffix}</span>
              </div>
            ))}
            {waitingList.length > 3 && <p style={{ color: C.muted, fontSize: '12px', margin: '8px 0 0', textAlign: 'center' }}>+{waitingList.length - 3} {t.othersWaiting}</p>}
          </div>
        )}

        <button onClick={() => setStep('register')}
          style={{ width: '100%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '14px', fontWeight: 700, padding: '14px', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
          {t.joinWaitlist}
        </button>
      </div>
    </div>
  );
}

export default function WaitingPage() {
  return <Suspense><WaitingForm /></Suspense>;
}