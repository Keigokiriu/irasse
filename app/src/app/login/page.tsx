'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('メールアドレスまたはパスワードが間違っています');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#1E293B' }}>
      <div className="w-full max-w-sm mx-4 rounded-3xl p-10" style={{ background: '#0F172A' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: '#EA580C' }}>
          <svg width="28" height="28" viewBox="0 0 46 46" fill="none">
  <circle cx="23" cy="10" r="5" fill="white"/>
  <rect x="20" y="16" width="6" height="20" rx="3" fill="white"/>
  <path d="M11 24 C11 18 23 16 23 16 C23 16 35 18 35 24" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
  <rect x="13" y="35" width="20" height="5" rx="2.5" fill="white"/>
</svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Irasse</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>店舗管理システム</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)' }}
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.2)' }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 rounded-xl transition disabled:opacity-50 text-white"
            style={{ background: '#EA580C' }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Irasse — いらっしゃいませ
        </p>
      </div>
    </div>
  );
}