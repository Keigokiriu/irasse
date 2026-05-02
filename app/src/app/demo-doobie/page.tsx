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
  green: '#8aa67c',
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
    (sum, item) => sum + (cart[item.id] || 0) * item.price,
    0
  );

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", paddingBottom: '88px' }}>

      {/* HERO */}
<div
  style={{
    position: 'relative',
    minHeight: '420px',
    backgroundImage:
      'linear-gradient(180deg, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.3) 40%, rgba(8,8,8,0.85) 100%), url(/doobie/sign.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: '60% 30%',
  }}
>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
          <button
            aria-label="menu"
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '1px solid #2a2a2a', background: 'rgba(0,0,0,0.55)',
              color: C.txt, fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          >
            ≡
          </button>
          <button
            aria-label="cart"
            style={{
              position: 'relative',
              width: '40px', height: '40px', borderRadius: '50%',
              border: `1px solid ${C.goldM}`, background: 'rgba(0,0,0,0.55)',
              color: C.gold, fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          >
            🛒
            <span
              style={{
                position: 'absolute', top: '-4px', right: '-4px',
                minWidth: '18px', height: '18px', padding: '0 4px',
                background: C.gold, color: C.bg, borderRadius: '9px',
                fontSize: '10px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {totalQty}
            </span>
          </button>
        </div>

        <div style={{ padding: '180px 20px 28px', maxWidth: '85%' }}>
  <h1
    style={{
      fontSize: '32px', fontWeight: 800, color: C.txt,
      letterSpacing: '0.02em', margin: 0, lineHeight: 1.1,
      textShadow: '0 2px 16px rgba(0,0,0,0.85)',
    }}
  >
    DOOBIE DOO BAR
  </h1>
          <div style={{ fontSize: '14px', color: C.green, marginTop: '8px', fontWeight: 500 }}>
            {doobieStore.subtitle}
          </div>
          <div style={{ fontSize: '13px', color: C.txt, marginTop: '14px', lineHeight: 1.55, opacity: 0.92 }}>
            Late-night izakaya bites, natural wines,<br />and good vibes in Ho Chi Minh City.
          </div>
          <div
            style={{
              fontSize: '12px', color: C.gold, marginTop: '16px',
              display: 'flex', gap: '6px', alignItems: 'flex-start',
            }}
          >
            <span style={{ flexShrink: 0 }}>📍</span>
            <span style={{ lineHeight: 1.45 }}>118 Phạm Viết Chánh, Bình Thạnh,<br />Ho Chi Minh City</span>
          </div>
        </div>
      </div>

      {/* INSIDE DOOBIE */}
      <div style={{ padding: '22px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: C.gold, letterSpacing: '0.18em', fontWeight: 700 }}>
            INSIDE DOOBIE
          </span>
          <span style={{ fontSize: '11px', color: C.muted, cursor: 'pointer' }}>
            View gallery →
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: 'url(/doobie/interior-1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '10px',
              border: `1px solid ${C.bdr}`,
            }}
          />
          <div
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: 'url(/doobie/interior-2.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '10px',
              border: `1px solid ${C.bdr}`,
            }}
          />
        </div>
      </div>

      {/* COMFORT FOOD */}
      <div
        style={{
          margin: '20px 16px 0',
          padding: '28px 22px',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '180px',
          backgroundImage:
            'linear-gradient(90deg, rgba(10,5,0,0.85) 0%, rgba(10,5,0,0.45) 50%, rgba(10,5,0,0.1) 100%), url(/doobie/comfort-food.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: `1px solid ${C.bdr}`,
        }}
      >
        <h2
          style={{
            fontSize: '24px', fontWeight: 500, color: C.txt,
            lineHeight: 1.2, margin: 0,
            fontFamily: "'Times New Roman', Georgia, serif",
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          Comfort food,<br />served the<br />Doobie way.
        </h2>
        <div style={{ fontSize: '12px', color: C.green, marginTop: '14px', lineHeight: 1.45 }}>
          Izakaya favorites,<br />made for sharing.
        </div>
      </div>

      {/* カテゴリタブ */}
      <div style={{ padding: '20px 16px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory('recommended')}
          style={{
            padding: '8px 16px', fontSize: '12px', fontWeight: 600,
            color: activeCategory === 'recommended' ? C.gold : C.muted,
            background: 'transparent',
            border: `1px solid ${activeCategory === 'recommended' ? C.gold : '#2a2a2a'}`,
            borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Best of Doobie
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px', fontSize: '12px', fontWeight: 600,
              color: activeCategory === cat ? C.gold : C.muted,
              background: 'transparent',
              border: `1px solid ${activeCategory === cat ? C.gold : '#2a2a2a'}`,
              borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RECOMMENDED 見出し */}
      {activeCategory === 'recommended' && (
        <div style={{ padding: '4px 16px 8px' }}>
          <div style={{ fontSize: '11px', color: C.gold, letterSpacing: '0.12em', fontWeight: 700 }}>
            ★ RECOMMENDED FOR FIRST-TIME GUESTS
          </div>
        </div>
      )}

      {/* メニューリスト */}
      <div style={{ padding: '4px 16px 8px' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              background: C.surf,
              border: `1px solid ${(cart[item.id] || 0) > 0 ? C.gold : C.bdr}`,
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: (cart[item.id] || 0) > 0 ? '0 0 0 1px rgba(201,168,76,0.15)' : 'none',
            }}
          >
            <div
              style={{
                width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden',
                flexShrink: 0, background: '#1a1a1a', border: `1px solid ${C.bdr}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <p style={{ color: C.txt, fontWeight: 500, fontSize: '13px', margin: 0, lineHeight: 1.35 }}>
                  {item.name}
                </p>
                {item.recommended && activeCategory !== 'recommended' && (
                  <span
                    style={{
                      background: C.goldD, border: `1px solid ${C.goldM}`,
                      color: C.gold, fontSize: '9px', fontWeight: 700,
                      padding: '1px 6px', borderRadius: '4px',
                    }}
                  >
                    ★ REC
                  </span>
                )}
              </div>
              <p style={{ color: C.gold, fontWeight: 600, fontSize: '12px', margin: '4px 0 0' }}>
                {formatVND(item.price)}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                onClick={() => sub(item.id)}
                aria-label="decrement"
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'transparent', border: `1px solid ${C.goldM}`,
                  color: C.gold, fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                −
              </button>
              <span
                style={{
                  fontSize: '13px', fontWeight: 700, color: C.txt,
                  minWidth: '14px', textAlign: 'center',
                }}
              >
                {cart[item.id] || 0}
              </span>
              <button
                onClick={() => add(item.id)}
                aria-label="increment"
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'transparent', border: `1px solid ${C.goldM}`,
                  color: C.gold, fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ボトムバー */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: C.surf, borderTop: `1px solid ${C.bdr}`,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '40px', height: '40px',
            background: C.faint, border: `1px solid ${C.bdr}`,
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            flexShrink: 0,
          }}
        >
          🛍️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: C.txt }}>Your order</div>
          <div style={{ fontSize: '11px', color: C.muted }}>
            {totalQty === 0 ? 'Add items to get started' : `${totalQty} item${totalQty > 1 ? 's' : ''} selected`}
          </div>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: C.txt, whiteSpace: 'nowrap' }}>
          {formatVND(totalPrice)}
        </div>
        <button
          disabled={totalQty === 0}
          style={{
            background: totalQty > 0 ? C.gold : C.faint,
            border: 'none',
            color: totalQty > 0 ? C.bg : C.muted,
            fontSize: '13px', fontWeight: 800,
            padding: '10px 16px', borderRadius: '8px',
            cursor: totalQty > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
        >
          View cart
        </button>
      </div>
    </div>
  );
}