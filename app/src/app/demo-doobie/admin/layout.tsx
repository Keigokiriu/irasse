'use client';

import { useEffect, useState, type ReactNode } from 'react';

const DEMO_PASSCODE = 'doobie2026';
const STORAGE_KEY = 'doobie-admin-auth';

const C = {
  bg: '#0a0a0a',
  surf: '#111111',
  bdr: '#222222',
  txt: '#ffffff',
  muted: '#888888',
  gold: '#c9a84c',
  goldD: '#1a1400',
  goldM: '#a07830',
};

export default function DoobieAdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = 確認中
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 初回マウント時に sessionStorage を確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem(STORAGE_KEY);
      setAuthed(auth === 'ok');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 少し遅延を入れてリアルな認証感を出す
    setTimeout(() => {
        if (input.trim() === DEMO_PASSCODE) {
          sessionStorage.setItem(STORAGE_KEY, 'ok');
          setAuthed(true);
      } else {
        setError('Incorrect passcode. Please try again.');
        setInput('');
      }
      setLoading(false);
    }, 400);
  };

  // 確認中（チラつき防止）
  if (authed === null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  // 認証済み → 中身を表示
  if (authed) {
    return <>{children}</>;
  }

  // 未認証 → パスコード入力画面
  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: "'Noto Sans JP', sans-serif",
        color: C.txt,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: C.surf,
          border: `1px solid ${C.bdr}`,
          borderRadius: '16px',
          padding: '40px 36px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* ロゴ */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: C.gold,
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            DOOBIE DOO BAR
          </div>
          <div style={{ fontSize: '12px', color: C.muted }}>Admin Access</div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: C.muted,
                marginBottom: '8px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              PASSCODE
            </label>
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter staff passcode"
              autoFocus
              disabled={loading}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: `1px solid ${error ? '#ef4444' : C.bdr}`,
                borderRadius: '10px',
                padding: '12px 14px',
                color: C.txt,
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: '0.1em',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: '#3f1d1d',
                border: '1px solid #ef4444',
                color: '#fecaca',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !input}
            style={{
              width: '100%',
              background: input && !loading ? C.gold : '#222222',
              border: 'none',
              color: input && !loading ? C.bg : C.muted,
              fontSize: '14px',
              fontWeight: 800,
              padding: '13px',
              borderRadius: '10px',
              cursor: loading || !input ? 'default' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s ease',
            }}
          >
            {loading ? 'Verifying...' : '🔓 Unlock'}
          </button>
        </form>

        {/* 補足 */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: `1px solid ${C.bdr}`,
            fontSize: '11px',
            color: C.muted,
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          Demo environment · Doobie Doo Bar
          <br />
          <span style={{ opacity: 0.6 }}>For authorized staff only</span>
        </div>
      </div>
    </div>
  );
}