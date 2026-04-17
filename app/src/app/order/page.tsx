'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const C = {
  bg: '#0f0e0b',
  surf: '#1a1814',
  surf2: '#221f1a',
  bdr: '#2e2a24',
  txt: '#f0ece4',
  muted: '#7a7060',
  amber: '#e8a020',
  amberD: '#2a1f08',
  amberM: '#c47a10',
  faint: '#1e1c17',
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

function OrderForm() {
  const searchParams = useSearchParams();
  const tableNumber = Number(searchParams.get('table') || 1);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [step, setStep] = useState<'menu' | 'confirm' | 'done'>('menu');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];
      setMenuItems(data);
      if (data.length > 0 && !activeCategory) {
        const firstCat = [...new Set(data.map((m) => m.category))][0];
        setActiveCategory(firstCat);
      }
    });
    return () => unsubscribe();
  }, []);

  const categories = [...new Set(menuItems.map((m) => m.category))];
  const cartItems: CartItem[] = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const item = menuItems.find((m) => m.id === id);
      return item ? { id, name: item.name, price: item.price, qty } : null;
    })
    .filter(Boolean) as CartItem[];
  const total = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const totalQty = Object.values(cart).reduce((s, v) => s + v, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        tableNumber,
        items: cartItems.map((c) => `${c.name} x${c.qty}`),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setStep('done');
      setCart({});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── 注文完了画面 ──
  if (step === 'done') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
        <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>ご注文を承りました</div>
        <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>キッチンに送信されました。まもなくお持ちします。</div>
        <button
          onClick={() => setStep('menu')}
          style={{ background: C.amberD, border: `1px solid ${C.amberM}`, color: C.amber, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
        >
          追加注文する
        </button>
      </div>
    </div>
  );

  // ── 確認画面 ──
  if (step === 'confirm') return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => setStep('menu')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>← 戻る</button>
        <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '17px', fontWeight: 800, color: C.txt }}>ご注文内容の確認</div>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
          {cartItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.bdr}` }}>
              <div>
                <p style={{ color: C.txt, fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{item.name}</p>
                <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>×{item.qty}</p>
              </div>
              <p style={{ color: C.amber, fontWeight: 700, fontSize: '14px', margin: 0 }}>¥{(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
            <p style={{ color: C.txt, fontWeight: 700, fontSize: '15px', margin: 0 }}>合計</p>
            <p style={{ color: C.amber, fontWeight: 700, fontSize: '22px', margin: 0 }}>¥{total.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={handleOrder}
          disabled={loading}
          style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '16px', fontWeight: 800, padding: '16px', borderRadius: '14px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? '注文中...' : '注文を確定する ✓'}
        </button>
      </div>
    </div>
  );

  // ── メイン注文画面 ──
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: '80px' }}>

      {/* ヘッダー */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: '18px', fontWeight: 800, color: C.txt }}>メニュー</div>
          <div style={{ fontSize: '11px', color: C.muted }}>テーブル {tableNumber}</div>
        </div>
        {totalQty > 0 && (
          <div style={{ background: C.amberD, border: `1px solid ${C.amberM}`, borderRadius: '20px', padding: '6px 14px' }}>
            <p style={{ color: C.amber, fontSize: '12px', fontWeight: 700, margin: 0 }}>🛒 {totalQty}点 ¥{total.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* カテゴリタブ */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', padding: '0 12px', gap: '4px', overflowX: 'auto' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: activeCategory === cat ? C.amber : C.muted,
              background: 'transparent',
              border: 'none',
              borderBottom: activeCategory === cat ? `2px solid ${C.amber}` : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* メニューリスト */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.filter((m) => m.category === activeCategory).map((item) => (
          <div
            key={item.id}
            style={{
              background: C.surf,
              border: `1px solid ${cart[item.id] > 0 ? C.amber : C.bdr}`,
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ color: C.txt, fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{item.name}</p>
              <p style={{ color: C.amber, fontWeight: 700, fontSize: '13px', margin: 0 }}>¥{item.price.toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => sub(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: '14px', fontWeight: 700, color: cart[item.id] > 0 ? C.amber : C.muted, minWidth: '16px', textAlign: 'center' }}>{cart[item.id] || 0}</span>
              <button onClick={() => add(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.amber, border: 'none', color: C.bg, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* 注文ボタン（固定フッター） */}
      {cartItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surf, borderTop: `1px solid ${C.bdr}`, padding: '12px 16px' }}>
          <button
            onClick={() => setStep('confirm')}
            style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer' }}
          >
            確認する（¥{total.toLocaleString()}）
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense>
      <OrderForm />
    </Suspense>
  );
}