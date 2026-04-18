'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
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
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: '',
  totalSeats: 20,
  paymentStyle: 'staff',
  waitlistEnabled: true,
  estimatedWaitPerGroup: 15,
  maxWaitGroups: 10,
  timeLimit: false,
  timeLimitMinutes: 90,
  additionalOrderEnabled: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings((prev) => ({ ...prev, ...data }));
      }
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
      <p style={{ color: '#64748b' }}>読み込み中...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
            ← ダッシュボード
          </button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>⚙️ 店舗設定</h1>
        </div>
        <button onClick={handleSave}
          style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {saved ? '✅ 保存しました' : '保存する'}
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>

        {/* 基本設定 */}
        <Section title="基本設定">
          <Label>店舗名</Label>
          <SubLabel>客側の画面に表示される店舗名です</SubLabel>
          <input value={settings.storeName} onChange={(e) => update('storeName', e.target.value)}
            placeholder="例：麺屋 雅"
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: '16px' }} />

          <Label>総席数</Label>
          <SubLabel>店内の総席数（混雑状況の計算に使います）</SubLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <button onClick={() => update('totalSeats', Math.max(1, settings.totalSeats - 1))}
              style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
            <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.totalSeats}</span>
            <button onClick={() => update('totalSeats', settings.totalSeats + 1)}
              style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
            <span style={{ color: '#64748b', fontSize: '13px' }}>席</span>
          </div>
        </Section>

        {/* お支払い設定 */}
        <Section title="お支払い設定">
          <Label>お支払いスタイル</Label>
          <SubLabel>客がお支払いボタンを押した後の案内方法</SubLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { value: 'staff', label: '⏳ スタッフがお伺い', desc: '「そのままお待ちください」と表示してスタッフが伺います' },
              { value: 'cashier', label: '🏧 キャッシャーへご案内', desc: '「レジまでお越しください」と表示します' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => update('paymentStyle', opt.value)}
                style={{ background: settings.paymentStyle === opt.value ? '#1c0a00' : '#0f172a', border: `1px solid ${settings.paymentStyle === opt.value ? '#f97316' : '#334155'}`, borderRadius: '12px', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <p style={{ color: settings.paymentStyle === opt.value ? '#f97316' : '#f1f5f9', fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>{opt.label}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* 待ち行列設定 */}
        <Section title="待ち行列設定">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <Label>待ち行列機能</Label>
              <SubLabel>ONにすると客がQRから順番待ち登録できます</SubLabel>
            </div>
            <Toggle value={settings.waitlistEnabled} onChange={(v) => update('waitlistEnabled', v)} />
          </div>

          {settings.waitlistEnabled && (
            <>
              <Label>1組あたりの待ち時間目安</Label>
              <SubLabel>「約◯分待ち」の計算に使います</SubLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <button onClick={() => update('estimatedWaitPerGroup', Math.max(5, settings.estimatedWaitPerGroup - 5))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.estimatedWaitPerGroup}</span>
                <button onClick={() => update('estimatedWaitPerGroup', settings.estimatedWaitPerGroup + 5)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>分 / 組</span>
              </div>

              <Label>最大受付組数</Label>
              <SubLabel>これを超えると新規の待ち登録ができなくなります</SubLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => update('maxWaitGroups', Math.max(1, settings.maxWaitGroups - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.maxWaitGroups}</span>
                <button onClick={() => update('maxWaitGroups', settings.maxWaitGroups + 1)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>組まで</span>
              </div>
            </>
          )}
        </Section>

        {/* 注文設定 */}
        <Section title="注文設定">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <Label>追加注文</Label>
              <SubLabel>最初の注文後に追加注文を許可するか</SubLabel>
            </div>
            <Toggle value={settings.additionalOrderEnabled} onChange={(v) => update('additionalOrderEnabled', v)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: settings.timeLimit ? '16px' : '0' }}>
            <div>
              <Label>時間制限</Label>
              <SubLabel>席の利用時間に制限を設ける</SubLabel>
            </div>
            <Toggle value={settings.timeLimit} onChange={(v) => update('timeLimit', v)} />
          </div>

          {settings.timeLimit && (
            <>
              <Label>制限時間</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => update('timeLimitMinutes', Math.max(30, settings.timeLimitMinutes - 15))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#334155', border: 'none', color: '#f1f5f9', fontSize: '18px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: '#f97316', fontSize: '24px', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>{settings.timeLimitMinutes}</span>
                <button onClick={() => update('timeLimitMinutes', settings.timeLimitMinutes + 15)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f97316', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: '#64748b', fontSize: '13px' }}>分</span>
              </div>
            </>
          )}
        </Section>

        <button onClick={handleSave}
          style={{ width: '100%', background: '#f97316', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800, padding: '16px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '40px' }}>
          {saved ? '✅ 保存しました' : '設定を保存する'}
        </button>
      </div>
    </div>
  );
}