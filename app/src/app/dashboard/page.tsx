'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E293B' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>読み込み中...</p>
    </div>
  );

  const menuItems = [
    { label: '注文管理', desc: 'リアルタイムで確認・管理', emoji: '📋', path: '/orders', accent: true },
    { label: 'テーブル管理', desc: 'テーブルの状態を管理', emoji: '🪑', path: '/tables', accent: false },
    { label: 'キッチン', desc: 'キッチン用注文管理', emoji: '🍳', path: '/kitchen', accent: false },
    { label: 'QRコード', desc: 'テーブルごとのQR生成', emoji: '📱', path: '/qr', accent: false },
    { label: 'メニュー管理', desc: 'メニューの追加・削除', emoji: '🍽️', path: '/menu', accent: false },
    { label: '売上管理', desc: '売上・注文履歴の確認', emoji: '📊', path: '/sales', accent: false },
    { label: 'スタッフ呼び出し', desc: '呼び出し通知をリアルタイム確認', emoji: '🔔', path: '/calls', accent: false },
    { label: 'お会計管理', desc: 'お会計リクエストを確認', emoji: '💳', path: '/payments', accent: false },
    { label: '待ち行列管理', desc: '混雑状況・ウェイティング管理', emoji: '📋', path: '/waitlist', accent: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <div style={{ background: '#0F172A', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <p style={{ color: 'white', fontWeight: '500', fontSize: '15px', margin: 0 }}>Irasse</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
        >
          ログアウト
        </button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 16px' }}>メニュー</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                background: item.accent ? '#EA580C' : '#1E3A5F',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <p style={{ fontSize: '22px', margin: '0 0 8px' }}>{item.emoji}</p>
              <p style={{ color: 'white', fontWeight: '500', fontSize: '15px', margin: '0 0 4px' }}>{item.label}</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: 0 }}>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}