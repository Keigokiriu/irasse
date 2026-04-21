'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TR = {
  ja: {
    loading: '読み込み中...',
    logout: 'ログアウト',
    operation: '🏪 営業中',
    manage: '⚙️ 管理',
    operationMenu: '営業中メニュー',
    manageMenu: '管理メニュー',
    confirm: '確認 →',
    newOrders: (n: number) => `新しい注文が${n}件あります`,
    newCalls: (n: number) => `スタッフ呼び出しが${n}件あります`,
    newPayments: (n: number) => `会計待ちが${n}件あります`,
    newWaiting: (n: number) => `待ち行列に${n}組います`,
    operationItems: [
      { label: '注文管理', desc: 'リアルタイムで確認・管理', emoji: '📋', path: '/orders' },
      { label: 'テーブル管理', desc: 'テーブルの状態を管理', emoji: '🪑', path: '/tables' },
      { label: 'キッチン', desc: 'キッチン用注文管理', emoji: '🍳', path: '/kitchen' },
      { label: 'スタッフ呼び出し', desc: '呼び出し通知をリアルタイム確認', emoji: '🔔', path: '/calls' },
      { label: 'お会計管理', desc: 'お会計リクエストを確認', emoji: '💳', path: '/payments' },
      { label: '待ち行列管理', desc: '混雑状況・ウェイティング管理', emoji: '👥', path: '/waitlist' },
    ],
    manageItems: [
      { label: 'メニュー管理', desc: 'メニューの追加・削除', emoji: '🍽️', path: '/menu' },
      { label: 'QRコード', desc: 'テーブルごとのQR生成', emoji: '📱', path: '/qr' },
      { label: '売上管理', desc: '売上・注文履歴の確認', emoji: '📊', path: '/sales' },
      { label: '店舗設定', desc: '支払い・待ち行列・席数などを設定', emoji: '⚙️', path: '/settings' },
    ],
  },
  en: {
    loading: 'Loading...',
    logout: 'Logout',
    operation: '🏪 Operations',
    manage: '⚙️ Manage',
    operationMenu: 'Operations Menu',
    manageMenu: 'Management Menu',
    confirm: 'View →',
    newOrders: (n: number) => `${n} new order${n > 1 ? 's' : ''} pending`,
    newCalls: (n: number) => `${n} staff call${n > 1 ? 's' : ''} pending`,
    newPayments: (n: number) => `${n} payment${n > 1 ? 's' : ''} waiting`,
    newWaiting: (n: number) => `${n} group${n > 1 ? 's' : ''} in waitlist`,
    operationItems: [
      { label: 'Orders', desc: 'Real-time order management', emoji: '📋', path: '/orders' },
      { label: 'Tables', desc: 'Manage table status', emoji: '🪑', path: '/tables' },
      { label: 'Kitchen', desc: 'Kitchen order display', emoji: '🍳', path: '/kitchen' },
      { label: 'Staff Calls', desc: 'Real-time call notifications', emoji: '🔔', path: '/calls' },
      { label: 'Payments', desc: 'Check payment requests', emoji: '💳', path: '/payments' },
      { label: 'Waitlist', desc: 'Manage waiting guests', emoji: '👥', path: '/waitlist' },
    ],
    manageItems: [
      { label: 'Menu', desc: 'Add or remove menu items', emoji: '🍽️', path: '/menu' },
      { label: 'QR Codes', desc: 'Generate QR per table', emoji: '📱', path: '/qr' },
      { label: 'Sales', desc: 'Sales & order history', emoji: '📊', path: '/sales' },
      { label: 'Settings', desc: 'Payment, waitlist & seat settings', emoji: '⚙️', path: '/settings' },
    ],
  },
};

type Lang = 'ja' | 'en';

export default function DashboardPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'operation' | 'manage'>('operation');
  const [lang, setLang] = useState<Lang>('ja');
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingCalls, setPendingCalls] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const router = useRouter();
  const t = TR[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || '');
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), where('status', '==', 'pending')),
      (snap) => setPendingOrders(snap.size)
    );
    const unsubCalls = onSnapshot(
      query(collection(db, 'calls'), where('status', '==', 'pending')),
      (snap) => setPendingCalls(snap.size)
    );
    const unsubPayments = onSnapshot(
      query(collection(db, 'payments'), where('status', '==', 'pending')),
      (snap) => setPendingPayments(snap.size)
    );
    const unsubWaitlist = onSnapshot(
      query(collection(db, 'waitlist'), where('status', '==', 'waiting')),
      (snap) => setWaitingCount(snap.size)
    );
    return () => { unsubOrders(); unsubCalls(); unsubPayments(); unsubWaitlist(); };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t.loading}</p>
    </div>
  );

  const items = mode === 'operation' ? t.operationItems : t.manageItems;
  const badges: Record<string, number> = {
    '/orders': pendingOrders,
    '/calls': pendingCalls,
    '/payments': pendingPayments,
    '/waitlist': waitingCount,
    '/tables': 0,
    '/kitchen': 0,
    '/menu': 0,
    '/qr': 0,
    '/sales': 0,
    '/settings': 0,
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#EA580C', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 46 46" fill="none">
              <circle cx="23" cy="10" r="5" fill="white"/>
              <rect x="20" y="16" width="6" height="20" rx="3" fill="white"/>
              <path d="M11 24 C11 18 23 16 23 16 C23 16 35 18 35 24" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <rect x="13" y="35" width="20" height="5" rx="2.5" fill="white"/>
            </svg>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: 0 }}>Irasse</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 言語切替 */}
          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {(['ja', 'en'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '4px 10px', fontSize: '12px', fontWeight: lang === l ? 700 : 400, background: lang === l ? '#334155' : 'transparent', color: lang === l ? '#f1f5f9' : '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {l === 'ja' ? '🇯🇵 JP' : '🇺🇸 EN'}
              </button>
            ))}
          </div>
          <button onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}>
            {t.logout}
          </button>
        </div>
      </div>

      {/* モード切り替えタブ */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 20px', display: 'flex', gap: '4px' }}>
        <button onClick={() => setMode('operation')}
          style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 700, color: mode === 'operation' ? '#f97316' : '#64748b', background: 'transparent', border: 'none', borderBottom: mode === 'operation' ? '2px solid #f97316' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {t.operation}
          {(pendingOrders + pendingCalls + pendingPayments + waitingCount) > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>
              {pendingOrders + pendingCalls + pendingPayments + waitingCount}
            </span>
          )}
        </button>
        <button onClick={() => setMode('manage')}
          style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 700, color: mode === 'manage' ? '#f97316' : '#64748b', background: 'transparent', border: 'none', borderBottom: mode === 'manage' ? '2px solid #f97316' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
          {t.manage}
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* アラート */}
        {mode === 'operation' && (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingOrders > 0 && (
              <div onClick={() => router.push('/orders')}
                style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>📋</span>
                  <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700 }}>{t.newOrders(pendingOrders)}</span>
                </div>
                <span style={{ color: '#f97316', fontSize: '12px' }}>{t.confirm}</span>
              </div>
            )}
            {pendingCalls > 0 && (
              <div onClick={() => router.push('/calls')}
                style={{ background: '#1a0000', border: '1px solid #ef4444', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>🔔</span>
                  <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>{t.newCalls(pendingCalls)}</span>
                </div>
                <span style={{ color: '#ef4444', fontSize: '12px' }}>{t.confirm}</span>
              </div>
            )}
            {pendingPayments > 0 && (
              <div onClick={() => router.push('/payments')}
                style={{ background: '#2a1f08', border: '1px solid #f59e0b', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>💳</span>
                  <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{t.newPayments(pendingPayments)}</span>
                </div>
                <span style={{ color: '#f59e0b', fontSize: '12px' }}>{t.confirm}</span>
              </div>
            )}
            {waitingCount > 0 && (
              <div onClick={() => router.push('/waitlist')}
                style={{ background: '#1e3a5f', border: '1px solid #3b82f6', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>👥</span>
                  <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 700 }}>{t.newWaiting(waitingCount)}</span>
                </div>
                <span style={{ color: '#60a5fa', fontSize: '12px' }}>{t.confirm}</span>
              </div>
            )}
          </div>
        )}

        {/* メニューグリッド */}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 12px', fontWeight: 700, letterSpacing: '0.05em' }}>
          {mode === 'operation' ? t.operationMenu : t.manageMenu}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {items.map((item) => {
            const badge = badges[item.path] || 0;
            return (
              <button key={item.path} onClick={() => router.push(item.path)}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', textAlign: 'left', cursor: 'pointer', position: 'relative' }}>
                {badge > 0 && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                    {badge}
                  </div>
                )}
                <p style={{ fontSize: '22px', margin: '0 0 8px' }}>{item.emoji}</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}