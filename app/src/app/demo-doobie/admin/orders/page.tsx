'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const C = {
  bg: '#0a0a0a',
  surf: '#111111',
  surf2: '#181818',
  bdr: '#222222',
  txt: '#ffffff',
  muted: '#888888',
  gold: '#c9a84c',
  goldD: '#1a1400',
  goldM: '#a07830',
  faint: '#181818',
  // ステータス別カラー
  amber: '#f59e0b',
  amberD: '#1a1000',
  cyan: '#5dd3d3',
  cyanD: '#0a1a1a',
  green: '#5dc870',
  greenD: '#0a1a0a',
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type DoobieOrder = {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  currency: string;
  status: 'pending' | 'preparing' | 'served';
  createdAt: Timestamp | null;
};

function formatVND(price: number): string {
  return `${price.toLocaleString('en-US')} VND`;
}

function formatTime(ts: Timestamp | null): string {
  if (!ts) return '—';
  const d = ts.toDate();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function elapsedMinutes(ts: Timestamp | null): number {
  if (!ts) return 0;
  return Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
}

export default function DoobieOrdersPage() {
  const [orders, setOrders] = useState<DoobieOrder[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'demo_doobie_orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DoobieOrder[];
        setOrders(data);
      }
    );
    return () => unsub();
  }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const servedOrders = orders.filter((o) => o.status === 'served');

  const handleStatusUpdate = async (
    orderId: string,
    nextStatus: 'preparing' | 'served'
  ) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, 'demo_doobie_orders', orderId), {
        status: nextStatus,
      });
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: "'Noto Sans JP', sans-serif",
        color: C.txt,
        padding: '24px 32px',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${C.bdr}`,
        }}
      >
        <div>
          <Link
            href="/demo-doobie/admin"
            style={{
              fontSize: '12px',
              color: C.muted,
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '6px',
            }}
          >
            ← Dashboard
          </Link>
          <div style={{ fontSize: '24px', fontWeight: 800, color: C.gold, letterSpacing: '0.05em' }}>
            ORDER MANAGEMENT
          </div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
            Total: {orders.length} · Pending: {pendingOrders.length} · Preparing:{' '}
            {preparingOrders.length} · Served: {servedOrders.length}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: C.muted, textAlign: 'right' }}>
          🟢 Live · Real-time
        </div>
      </div>

      {/* カンバンボード */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          minHeight: 'calc(100vh - 140px)',
        }}
      >
        <KanbanColumn
          title="Pending"
          subtitle="Awaiting kitchen"
          icon="⏳"
          accent={C.amber}
          accentBg={C.amberD}
          count={pendingOrders.length}
        >
          {pendingOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              accent={C.amber}
              accentBg={C.amberD}
              buttonLabel="🔥 Start preparing"
              onAction={() => handleStatusUpdate(o.id, 'preparing')}
              loading={updating === o.id}
            />
          ))}
          {pendingOrders.length === 0 && <EmptyState text="No pending orders" />}
        </KanbanColumn>

        <KanbanColumn
          title="Preparing"
          subtitle="In the kitchen"
          icon="👨‍🍳"
          accent={C.cyan}
          accentBg={C.cyanD}
          count={preparingOrders.length}
        >
          {preparingOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              accent={C.cyan}
              accentBg={C.cyanD}
              buttonLabel="✅ Mark as served"
              onAction={() => handleStatusUpdate(o.id, 'served')}
              loading={updating === o.id}
            />
          ))}
          {preparingOrders.length === 0 && <EmptyState text="Kitchen is clear" />}
        </KanbanColumn>

        <KanbanColumn
          title="Served"
          subtitle="Delivered to table"
          icon="🍽️"
          accent={C.green}
          accentBg={C.greenD}
          count={servedOrders.length}
        >
          {servedOrders.slice(0, 20).map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              accent={C.green}
              accentBg={C.greenD}
              buttonLabel={null}
              onAction={null}
              loading={false}
            />
          ))}
          {servedOrders.length === 0 && <EmptyState text="Nothing served yet" />}
        </KanbanColumn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// カンバンカラム
// ─────────────────────────────────────
function KanbanColumn({
  title,
  subtitle,
  icon,
  accent,
  accentBg,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  accentBg: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bdr}`,
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${C.bdr}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: accentBg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: accent, letterSpacing: '0.08em' }}>
              {title.toUpperCase()}
            </div>
            <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{subtitle}</div>
          </div>
        </div>
        <div
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${accent}40`,
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 800,
            color: accent,
          }}
        >
          {count}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// 注文カード
// ─────────────────────────────────────
function OrderCard({
  order,
  accent,
  accentBg,
  buttonLabel,
  onAction,
  loading,
}: {
  order: DoobieOrder;
  accent: string;
  accentBg: string;
  buttonLabel: string | null;
  onAction: (() => void) | null;
  loading: boolean;
}) {
  const minutes = elapsedMinutes(order.createdAt);
  const isOld = minutes > 10 && order.status !== 'served';

  return (
    <div
      style={{
        background: C.surf2,
        border: `1px solid ${isOld ? '#ef4444' : C.bdr}`,
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: isOld ? '0 0 0 1px #ef444430' : 'none',
      }}
    >
      {/* ヘッダー（テーブル + 時刻） */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            background: accentBg,
            border: `1px solid ${accent}40`,
            color: accent,
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '6px',
          }}
        >
          Table {order.tableNumber}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: C.muted }}>{formatTime(order.createdAt)}</div>
          <div
            style={{
              fontSize: '10px',
              color: isOld ? '#ef4444' : C.muted,
              fontWeight: isOld ? 700 : 400,
            }}
          >
            {minutes}m ago{isOld && ' ⚠️'}
          </div>
        </div>
      </div>

      {/* 商品リスト */}
      <div style={{ marginBottom: '10px' }}>
        {order.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              padding: '4px 0',
              borderBottom: idx < order.items.length - 1 ? `1px dashed ${C.bdr}` : 'none',
            }}
          >
            <span style={{ color: C.txt, flex: 1, marginRight: '8px' }}>
              {item.name}
              <span style={{ color: C.muted, marginLeft: '4px' }}>×{item.quantity}</span>
            </span>
            <span style={{ color: C.muted, fontSize: '11px', flexShrink: 0 }}>
              {formatVND(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* 合計 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderTop: `1px solid ${C.bdr}`,
          marginBottom: buttonLabel ? '10px' : 0,
        }}
      >
        <span style={{ fontSize: '11px', color: C.muted }}>Total</span>
        <span style={{ fontSize: '14px', fontWeight: 800, color: C.gold }}>
          {formatVND(order.total)}
        </span>
      </div>

      {/* アクションボタン */}
      {buttonLabel && onAction && (
        <button
          onClick={onAction}
          disabled={loading}
          style={{
            width: '100%',
            background: accent,
            border: 'none',
            color: '#0a0a0a',
            fontSize: '12px',
            fontWeight: 800,
            padding: '10px',
            borderRadius: '8px',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.5 : 1,
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Updating...' : buttonLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────
// 空状態
// ─────────────────────────────────────
function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '32px 16px',
        textAlign: 'center',
        color: C.muted,
        fontSize: '11px',
        fontStyle: 'italic',
      }}
    >
      {text}
    </div>
  );
}