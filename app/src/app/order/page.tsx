'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const C = {
    bg: '#09090b',
    surf: '#111113',
    surf2: '#18181b',
    bdr: '#222226',
    txt: '#ffffff',
    muted: '#888891',
    amber: '#ff8c38',
    amberD: '#1c0a00',
    amberM: '#ff6b00',
    faint: '#18181b',
  };

type MenuItem = { id: string; name: string; price: number; category: string; };
type CartItem = { id: string; name: string; price: number; qty: number; };

function OrderForm() {
  const searchParams = useSearchParams();
  const tableNumber = Number(searchParams.get('table') || 1);
  const [activeTab, setActiveTab] = useState<'order' | 'call' | 'receipt'>('order');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [orderStep, setOrderStep] = useState<'menu' | 'confirm' | 'done'>('menu');
  const [loading, setLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [callSent, setCallSent] = useState(false);
  const [callMemo, setCallMemo] = useState('');
  const [payMethod, setPayMethod] = useState<'card' | 'cash'>('card');
  const [payDone, setPayDone] = useState(false);
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[];
      setMenuItems(data);
      if (data.length > 0 && !activeCategory) {
        setActiveCategory([...new Set(data.map((m) => m.category))][0]);
      }
    });
    return () => unsubscribe();
  }, []);

  const categories = [...new Set(menuItems.map((m) => m.category))];
  const cartItems: CartItem[] = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return item ? { id, name: item.name, price: item.price, qty } : null;
  }).filter(Boolean) as CartItem[];
  const total = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
  const totalQty = Object.values(cart).reduce((s, v) => s + v, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        tableNumber, items: cartItems.map((c) => `${c.name} x${c.qty}`),
        status: 'pending', createdAt: serverTimestamp(),
      });
      setOrderedItems(cartItems);
      setOrderedTotal(total);
      setOrderStep('done');
      setCart({});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCall = async () => {
    if (!selectedCall) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'calls'), {
        tableNumber, reason: selectedCall, memo: callMemo,
        status: 'pending', createdAt: serverTimestamp(),
      });
      setCallSent(true);
      setSelectedCall(null);
      setCallMemo('');
      setTimeout(() => setCallSent(false), 4000);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const TAB_STYLE = (active: boolean) => ({
    flex: 1, padding: '10px 4px', fontSize: '12px', fontWeight: 700 as const,
    color: active ? C.amber : C.muted, background: 'transparent', border: 'none',
    borderBottom: active ? `2px solid ${C.amber}` : '2px solid transparent',
    cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif",
  });

  const callOptions = [
    { id: 'water', label: '💧 お水をください' },
    { id: 'order', label: '📋 注文を変更したい' },
    { id: 'clean', label: '🧹 テーブルを拭いてほしい' },
    { id: 'other', label: '🔔 その他' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ヘッダー */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: C.txt }}>Irasse</div>
          <div style={{ fontSize: '11px', color: C.muted }}>テーブル {tableNumber}</div>
        </div>
        {totalQty > 0 && activeTab === 'order' && (
          <div style={{ background: C.amberD, border: `1px solid ${C.amberM}`, borderRadius: '20px', padding: '6px 14px' }}>
            <span style={{ color: C.amber, fontSize: '12px', fontWeight: 700 }}>🛒 {totalQty}点 ¥{total.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* タブ */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', flexShrink: 0 }}>
        <button style={TAB_STYLE(activeTab === 'order')} onClick={() => setActiveTab('order')}>注文</button>
        <button style={TAB_STYLE(activeTab === 'call')} onClick={() => setActiveTab('call')}>スタッフ呼び出し</button>
        <button style={TAB_STYLE(activeTab === 'receipt')} onClick={() => setActiveTab('receipt')}>お会計</button>
      </div>

      {/* ── 注文タブ ── */}
      {activeTab === 'order' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {orderStep === 'done' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>ご注文を承りました</div>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>キッチンに送信されました。まもなくお持ちします。</div>
                <button onClick={() => { setOrderStep('menu'); setActiveTab('receipt'); }}
                  style={{ background: C.amberD, border: `1px solid ${C.amberM}`, color: C.amber, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginRight: '10px' }}>
                  お会計を見る
                </button>
                <button onClick={() => setOrderStep('menu')}
                  style={{ background: 'transparent', border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer' }}>
                  追加注文する
                </button>
              </div>
            </div>
          ) : orderStep === 'confirm' ? (
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
              <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setOrderStep('menu')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>← 戻る</button>
                <div style={{ fontSize: '17px', fontWeight: 800, color: C.txt }}>ご注文内容の確認</div>
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
                <button onClick={handleOrder} disabled={loading}
                  style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '16px', fontWeight: 800, padding: '16px', borderRadius: '14px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '注文中...' : '注文を確定する ✓'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* カテゴリタブ */}
              <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', padding: '0 12px', gap: '4px', overflowX: 'auto', flexShrink: 0 }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: '10px 16px', fontSize: '13px', fontWeight: 700,
                    color: activeCategory === cat ? C.amber : C.muted,
                    background: 'transparent', border: 'none',
                    borderBottom: activeCategory === cat ? `2px solid ${C.amber}` : '2px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Noto Sans JP', sans-serif",
                  }}>{cat}</button>
                ))}
              </div>
              {/* メニューリスト */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: '80px' }}>
                {menuItems.filter((m) => m.category === activeCategory).map((item) => (
                  <div key={item.id} style={{ background: C.surf, border: `1px solid ${cart[item.id] > 0 ? C.amber : C.bdr}`, borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
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
              {/* 注文ボタン */}
              {cartItems.length > 0 && (
                <div style={{ background: C.surf, borderTop: `1px solid ${C.bdr}`, padding: '12px 16px', flexShrink: 0 }}>
                  <button onClick={() => setOrderStep('confirm')}
                    style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
                    確認する（¥{total.toLocaleString()}）
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── スタッフ呼び出しタブ ── */}
      {activeTab === 'call' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '14px' }}>用件を選んでボタンを押してください</p>
          {callOptions.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedCall(selectedCall === opt.id ? null : opt.id)}
              style={{ width: '100%', background: selectedCall === opt.id ? C.amberD : C.surf, border: `1px solid ${selectedCall === opt.id ? C.amberM : C.bdr}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', color: selectedCall === opt.id ? C.amber : C.txt, fontSize: '14px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: "'Noto Sans JP', sans-serif" }}>
              {opt.label}
            </button>
          ))}
          <textarea value={callMemo} onChange={(e) => setCallMemo(e.target.value)} placeholder="メモ（任意）詳細があれば..."
            style={{ width: '100%', background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '12px 14px', color: C.txt, fontSize: '13px', resize: 'none', height: '80px', marginTop: '4px', marginBottom: '12px', fontFamily: "'Noto Sans JP', sans-serif", outline: 'none' }} />
          {callSent ? (
            <div style={{ textAlign: 'center', padding: '16px', background: '#0a2a10', border: '1px solid #50c870', borderRadius: '12px', color: '#50c870', fontSize: '14px', fontWeight: 700 }}>
              ✅ スタッフに通知しました<br />
              <span style={{ fontSize: '12px', fontWeight: 400, color: C.muted }}>まもなく参ります</span>
            </div>
          ) : (
            <button onClick={handleCall} disabled={!selectedCall || loading}
              style={{ width: '100%', background: selectedCall ? C.amber : C.faint, border: 'none', color: selectedCall ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: selectedCall ? 'pointer' : 'default', fontFamily: "'Noto Sans JP', sans-serif" }}>
              🔔 スタッフを呼ぶ
            </button>
          )}
        </div>
      )}

      {/* ── お会計タブ ── */}
      {activeTab === 'receipt' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {payDone ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🙏</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>お支払い完了</div>
              <div style={{ fontSize: '13px', color: C.muted }}>またのご来店をお待ちしております</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '15px', fontWeight: 700, color: C.txt, marginBottom: '14px' }}>ご注文内容</div>
              {orderedItems.length > 0 ? (
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
                  {orderedItems.map((item) => (
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
                    <p style={{ color: C.amber, fontWeight: 700, fontSize: '22px', margin: 0 }}>¥{orderedTotal.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>まだ注文がありません</p>
                </div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.txt, marginBottom: '10px' }}>お支払い方法</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {(['card', 'cash'] as const).map((method) => (
                  <button key={method} onClick={() => setPayMethod(method)}
                    style={{ padding: '14px', borderRadius: '12px', background: payMethod === method ? C.amberD : C.surf, border: `1px solid ${payMethod === method ? C.amberM : C.bdr}`, color: payMethod === method ? C.amber : C.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {method === 'card' ? '💳 カード' : '💴 現金'}
                  </button>
                ))}
              </div>
              <button onClick={() => setPayDone(true)} disabled={orderedItems.length === 0}
                style={{ width: '100%', background: orderedItems.length > 0 ? C.amber : C.faint, border: 'none', color: orderedItems.length > 0 ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: orderedItems.length > 0 ? 'pointer' : 'default', fontFamily: "'Noto Sans JP', sans-serif" }}>
                💳 この内容でお支払い
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return <Suspense><OrderForm /></Suspense>;
}