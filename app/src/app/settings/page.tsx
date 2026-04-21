'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type StoreSettings = {
  storeName: string;
  totalSeats: number;
  paymentStyle: 'staff' | 'cashier';
  waitlistEnabled: boolean;
  estimatedWaitPerGroup: number;
  maxWaitGroups: number;
  timeLimit: boolean;
  timeLimitMinutes: number;
  additionalOrderEnabled: boolean;
  isOpen: boolean;
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: '', totalSeats: 20, paymentStyle: 'staff',
  waitlistEnabled: true, estimatedWaitPerGroup: 15, maxWaitGroups: 10,
  timeLimit: false, timeLimitMinutes: 90, additionalOrderEnabled: true,
  isOpen: false,
};

type Lang = 'ja' | 'en';

const TR = {
  ja: {
    back: '← ダッシュボード',
    title: '⚙️ 店舗設定',
    save: '保存する',
    saved: '✅ 保存しました',
    loading: '読み込み中...',
    operationSection: '営業設定',
isOpen: '営業中',
isOpenSub: 'ONにすると客がQRから注文・待ち行列登録できます',
    basicSection: '基本設定',
    storeName: '店舗名',
    storeNameSub: '客側の画面に表示される店舗名です',
    storeNamePlaceholder: '例：麺屋 雅',
    totalSeats: '総席数',
    totalSeatsSub: '店内の総席数（混雑状況の計算に使います）',
    seatUnit: '席',
    paymentSection: 'お支払い設定',
    paymentStyle: 'お支払いスタイル',
    paymentStyleSub: '客がお支払いボタンを押した後の案内方法',
    paymentOptions: [
      { value: 'staff', label: '⏳ スタッフがお伺い', desc: '「そのままお待ちください」と表示してスタッフが伺います' },
      { value: 'cashier', label: '🏧 キャッシャーへご案内', desc: '「レジまでお越しください」と表示します' },
    ],
    waitlistSection: '待ち行列設定',
    waitlistEnabled: '待ち行列機能',
    waitlistEnabledSub: 'ONにすると客がQRから順番待ち登録できます',
    waitPerGroup: '1組あたりの待ち時間目安',
    waitPerGroupSub: '「約◯分待ち」の計算に使います',
    waitPerGroupUnit: '分 / 組',
    maxWaitGroups: '最大受付組数',
    maxWaitGroupsSub: 'これを超えると新規の待ち登録ができなくなります',
    maxWaitGroupsUnit: '組まで',
    orderSection: '注文設定',
    additionalOrder: '追加注文',
    additionalOrderSub: '最初の注文後に追加注文を許可するか',
    timeLimit: '時間制限',
    timeLimitSub: '席の利用時間に制限を設ける',
    timeLimitLabel: '制限時間',
    timeLimitUnit: '分',
    saveBottom: '設定を保存する',
    savedBottom: '✅ 保存しました',
  },
  en: {
    back: '← Dashboard',
    title: '⚙️ Store Settings',
    save: 'Save',
    saved: '✅ Saved',
    loading: 'Loading...',
    operationSection: 'Operation',
isOpen: 'Open for Business',
isOpenSub: 'When ON, guests can order and join the waitlist via QR',
    basicSection: 'Basic Settings',
    storeName: 'Store Name',
    storeNameSub: 'This name appears on the customer-facing screen',
    storeNamePlaceholder: 'e.g. Ramen Miyabi',
    totalSeats: 'Total Seats',
    totalSeatsSub: 'Used to calculate congestion level',
    seatUnit: 'seats',
    paymentSection: 'Payment Settings',
    paymentStyle: 'Payment Style',
    paymentStyleSub: 'How guests are guided after pressing the payment button',
    paymentOptions: [
      { value: 'staff', label: '⏳ Staff will come to you', desc: 'Displays "Please wait" and staff visits the table' },
      { value: 'cashier', label: '🏧 Go to cashier', desc: 'Displays "Please come to the register"' },
    ],
    waitlistSection: 'Waitlist Settings',
    waitlistEnabled: 'Waitlist Feature',
    waitlistEnabledSub: 'When ON, guests can join the waitlist via QR',
    waitPerGroup: 'Estimated wait per group',
    waitPerGroupSub: 'Used to calculate "approx. X min wait"',
    waitPerGroupUnit: 'min / group',
    maxWaitGroups: 'Max groups accepted',
    maxWaitGroupsSub: 'New registrations are blocked when this limit is reached',
    maxWaitGroupsUnit: 'groups max',
    orderSection: 'Order Settings',
    additionalOrder: 'Additional Orders',
    additionalOrderSub: 'Allow guests to order more after the first order',
    timeLimit: 'Time Limit',
    timeLimitSub: 'Set a time limit for table usage',
    timeLimitLabel: 'Time Limit',
    timeLimitUnit: 'min',
    saveBottom: 'Save Settings',
    savedBottom: '✅ Saved',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('ja');
  const router = useRouter();
  const t = TR[lang];

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) setSettings((prev) => ({ ...prev, ...snap.data() }));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    await setDoc(doc(db, 'store_status', 'main'), settings, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const update = (key: keyof StoreSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
      <h2 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 16px' }}>{title}</h2>
      {children}
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700, margin: '0 0 8px' }}>{children}</p>
  );

  const SubLabel = ({ children }: { children: React.ReactNode }) => (
    <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 10px' }}>{children}</p>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      style={{ width: '48px', height: '26px', borderRadius: '13px', background: value ? '#f97316' : '#334155', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: value ? '25px' : '3px', transition: 'left 0.2s' }} />
    </button>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b' }}>{TR.ja.loading}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                {l === 'ja' ? '🇯🇵 JP' : '🇺🇸 EN'}
              </button>
            ))}
          </div>
          <button onClick={handleSave}
            style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {saved ? t.saved : t.save}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {/* 営業設定 */}
<div style={{ background: settings.isOpen ? '#052e16' : '#1e293b', border: `1px solid ${settings.isOpen ? '#22c55e' : '#334155'}`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <p style={{ color: settings.isOpen ? '#22c55e' : '#f1f5f9', fontSize: '16px', fontWeight: 800, margin: '0 0 4px' }}>
        {settings.isOpen ? (lang === 'ja' ? '🟢 営業中' : '🟢 Open') : (lang === 'ja' ? '⚫️ 閉店中' : '⚫️ Closed')}
      </p>
      <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{t.isOpenSub}</p>
    </div>
    <Toggle value={settings.isOpen} onChange={(v) => update('isOpen', v)} />
  </div>
</div>
        <Section title={t.basicSection}>
          <Label>{t.storeName}</Label>
          <SubLabel>{t.storeNameSub}</SubLabel>
          <input value={settings.storeName} onChange={(e) => update('storeName', e.target.value)}
            placeholder={t.storeNamePlaceholder}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: '16px' }} />
          <Label>{t.totalSeats}</Label>
          <SubLabel>{t.totalSeatsSub}</SubLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => update('totalSeats', Math.max(1, settings.totalSeats - 1))}
              style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
            <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.totalSeats}</span>
            <button onClick={() => update('totalSeats', settings.totalSeats + 1)}
              style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
            <span style={{ color: '#64748b', fontSize: '13px' }}>{t.seatUnit}</span>
          </div>
        </Section>

        <Section title={t.paymentSection}>
          <Label>{t.paymentStyle}</Label>
          <SubLabel>{t.paymentStyleSub}</SubLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {t.paymentOptions.map((opt) => (
              <button key={opt.value} onClick={() => update('paymentStyle', opt.value)}
                style={{ background: settings.paymentStyle === opt.value ? '#1c0a00' : '#0f172a', border: `1px solid ${settings.paymentStyle === opt.value ? '#f97316' : '#334155'}`, borderRadius: '12px', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <p style={{ color: settings.paymentStyle === opt.value ? '#f97316' : '#f1f5f9', fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>{opt.label}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title={t.waitlistSection}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <Label>{t.waitlistEnabled}</Label>
              <SubLabel>{t.waitlistEnabledSub}</SubLabel>
            </div>
            <Toggle value={settings.waitlistEnabled} onChange={(v) => update('waitlistEnabled', v)} />
          </div>
          {settings.waitlistEnabled && (
            <>
              <Label>{t.waitPerGroup}</Label>
              <SubLabel>{t.waitPerGroupSub}</SubLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <button onClick={() => update('estimatedWaitPerGroup', Math.max(5, settings.estimatedWaitPerGroup - 5))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.estimatedWaitPerGroup}</span>
                <button onClick={() => update('estimatedWaitPerGroup', settings.estimatedWaitPerGroup + 5)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{t.waitPerGroupUnit}</span>
              </div>
              <Label>{t.maxWaitGroups}</Label>
              <SubLabel>{t.maxWaitGroupsSub}</SubLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => update('maxWaitGroups', Math.max(1, settings.maxWaitGroups - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.maxWaitGroups}</span>
                <button onClick={() => update('maxWaitGroups', settings.maxWaitGroups + 1)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{t.maxWaitGroupsUnit}</span>
              </div>
            </>
          )}
        </Section>

        <Section title={t.orderSection}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <Label>{t.additionalOrder}</Label>
              <SubLabel>{t.additionalOrderSub}</SubLabel>
            </div>
            <Toggle value={settings.additionalOrderEnabled} onChange={(v) => update('additionalOrderEnabled', v)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: settings.timeLimit ? '16px' : '0' }}>
            <div>
              <Label>{t.timeLimit}</Label>
              <SubLabel>{t.timeLimitSub}</SubLabel>
            </div>
            <Toggle value={settings.timeLimit} onChange={(v) => update('timeLimit', v)} />
          </div>
          {settings.timeLimit && (
            <>
              <Label>{t.timeLimitLabel}</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => update('timeLimitMinutes', Math.max(30, settings.timeLimitMinutes - 15))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.timeLimitMinutes}</span>
                <button onClick={() => update('timeLimitMinutes', settings.timeLimitMinutes + 15)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{t.timeLimitUnit}</span>
              </div>
            </>
          )}
        </Section>

        <button onClick={handleSave}
          style={{ width: '100%', background: '#f97316', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800, padding: '16px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '40px' }}>
          {saved ? t.savedBottom : t.saveBottom}
        </button>
      </div>
    </div>
  );
}