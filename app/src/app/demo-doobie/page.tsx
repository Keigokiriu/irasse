'use client';

import { useMemo, useState } from 'react';
import { doobieMenu, doobieStore } from '@/data/doobieMenu';

const C = {
  bg: '#0a0a0a',
  surf: '#111111',
  bdr: '#222222',
  txt: '#ffffff',
  muted: '#888888',
  gold: '#c9a84c',
  goldD: '#1a1400',
  goldM: '#a07830',
  faint: '#181818',
};

const CATEGORIES = [
  'Cold Tapas', 'Warm Tapas', 'Oden', 'Rice / Noodle',
  'Sparkling', 'White Wine', 'Red Wine', 'Rose Wine',
];

function formatVND(price: number): string {
  return `${price.toLocaleString('en-US')} VND`;
}

export default function DoobieDemoPage() {
  const [activeCategory, setActiveCategory] = useState<string | 'recommended'>('recommended');
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  const filteredItems = useMemo(() => {
    if (activeCategory === 'recommended') {
      return doobieMenu.filter((m) => m.recommended);
    }
    return doobieMenu.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const totalQty = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = doobieMenu.reduce(
    (sum, item) => sum + (cart[item.id] || 0) * item.price, 0
  );

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ヘッダー */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '16px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.gold, letterSpacing: '0.08em' }}>
              {doobieStore.name}
            </div>
            <div style={{ fontSize: '12px', color: '#c9a84c99', marginTop: '2px', fontStyle: 'italic' }}>
              {doobieStore.subtitle}
            </div>
            <div style={{ fontSize: '11px', color: C.muted, marginTop: '6px' }}>
              Disco nights, izakaya plates & natural wines
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              📍 {doobieStore.location}
            </div>
          </div>
          {totalQty > 0 && (
            <div style={{ background: C.goldD, border: `1px solid ${C.goldM}`, borderRadius: '20px', padding: '6px 14px', whiteSpace: 'nowrap' }}>
              <span style={{ color: C.gold, fontSize: '12px', fontWeight: 700 }}>
                🛒 {totalQty} items · {formatVND(totalPrice)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ヒーローバナー */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #0a0a0a 40%, #1a1200 100%)',
        borderBottom: `1px solid ${C.bdr}`,
        padding: '24px 20px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景装飾 */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: '#c9a84c08', border: '1px solid #c9a84c15' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '10px', width: '80px', height: '80px', borderRadius: '50%', background: '#c9a84c05', border: '1px solid #c9a84c10' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '13px', color: C.gold, fontWeight: 700, letterSpacing: '0.15em', marginBottom: '8px' }}>
            ✦ TONIGHT'S PICKS
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: C.txt, lineHeight: 1.3, marginBottom: '8px' }}>
            Late-night bites &<br />good vibes only.
          </div>
          <div style={{ fontSize: '11px', color: C.muted, lineHeight: 1.6 }}>
          Scan · Order · Enjoy — smoother ordering for every guest.
          </div>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', padding: '0 12px', overflowX: 'auto', flexShrink: 0 }}>
        <button onClick={() => setActiveCategory('recommended')} style={{
          padding: '10px 16px', fontSize: '12px', fontWeight: 700,
          color: activeCategory === 'recommended' ? C.gold : C.muted,
          background: 'transparent', border: 'none',
          borderBottom: activeCategory === 'recommended' ? `2px solid ${C.gold}` : '2px solid transparent',
          cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
        }}>
          ★ Best of Doobie
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '10px 16px', fontSize: '12px', fontWeight: 700,
            color: activeCategory === cat ? C.gold : C.muted,
            background: 'transparent', border: 'none',
            borderBottom: activeCategory === cat ? `2px solid ${C.gold}` : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* おすすめセクションのヘッダー */}
      {activeCategory === 'recommended' && (
        <div style={{ padding: '12px 16px 4px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', color: C.muted, letterSpacing: '0.1em' }}>
            RECOMMENDED FOR FIRST-TIME GUESTS
          </div>
        </div>
      )}

      {/* メニューリスト */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: '88px' }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={{
            background: item.recommended ? '#141200' : C.surf,
            border: `1px solid ${(cart[item.id] || 0) > 0 ? C.gold : item.recommended ? C.goldM : C.bdr}`,
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            {/* 画像枠 */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden',
              flexShrink: 0, background: '#1a1a1a', border: `1px solid ${C.bdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '22px' }}>
                  {item.category.includes('Wine') || item.category === 'Sparkling'
                    ? '🍷'
                    : item.category === 'Oden'
                      ? '🍢'
                      : item.category === 'Rice / Noodle'
                        ? '🍜'
                        : '🍽️'}
                </span>
              )}
            </div>

            {/* テキスト */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <p style={{ color: C.txt, fontWeight: 700, fontSize: '14px', margin: 0, wordBreak: 'break-word' }}>
                  {item.name}
                </p>
                {item.recommended && activeCategory !== 'recommended' && (
                  <span style={{ background: C.goldD, border: `1px solid ${C.goldM}`, color: C.gold, fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                    ★ REC
                  </span>
                )}
              </div>
              {item.description && (
                <p style={{ color: C.muted, fontSize: '11px', margin: '0 0 4px', lineHeight: 1.5 }}>
                  {item.description}
                </p>
              )}
              <p style={{ color: C.gold, fontWeight: 700, fontSize: '13px', margin: 0 }}>
                {formatVND(item.price)}
              </p>
            </div>

            {/* カートボタン */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => sub(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: '14px', fontWeight: 700, color: (cart[item.id] || 0) > 0 ? C.gold : C.muted, minWidth: '16px', textAlign: 'center' }}>
                {cart[item.id] || 0}
              </span>
              <button onClick={() => add(item.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.gold, border: 'none', color: C.bg, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* カートボタン */}
      {totalQty > 0 && (
        <div style={{ background: C.surf, borderTop: `1px solid ${C.bdr}`, padding: '12px 16px', flexShrink: 0 }}>
          <button style={{ width: '100%', background: C.gold, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
            Review Order ({formatVND(totalPrice)})
          </button>
        </div>
      )}
    </div>
  );
}