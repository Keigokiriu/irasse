'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
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
  green: '#8aa67c',
  red: '#ef4444',
  redD: '#1a0808',
  amber: '#f59e0b',
  amberD: '#1a1000',
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

type DoobieCall = {
  id: string;
  tableNumber: number;
  reason: string;
  memo?: string;
  status: 'pending' | 'done';
  createdAt: Timestamp | null;
};

type DoobiePayment = {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  currency: string;
  payMethod: 'card' | 'cash';
  status: 'pending' | 'done';
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

const REASON_ICONS: Record<string, string> = {
  water: '💧',
  order: '📋',
  clean: '🧹',
  other: '🔔',
};

const REASON_LABELS: Record<string, string> = {
  water: 'Water please',
  order: 'Change order',
  clean: 'Clean table',
  other: 'Other',
};

export default function DoobieAdminDashboard() {
  const [orders, setOrders] = useState<DoobieOrder[]>([]);
  const [calls, setCalls] = useState<DoobieCall[]>([]);
  const [payments, setPayments] = useState<DoobiePayment[]>([]);

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, 'demo_doobie_orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DoobieOrder[];
        setOrders(data);
      }
    );

    const unsubCalls = onSnapshot(
      query(collection(db, 'demo_doobie_calls'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DoobieCall[];
        setCalls(data);
      }
    );

    const unsubPayments = onSnapshot(
      query(collection(db, 'demo_doobie_payments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DoobiePayment[];
        setPayments(data);
      }
    );

    return () => {
      unsubOrders();
      unsubCalls();
      unsubPayments();
    };
  }, []);

  const pendingOrders = orders.filter((o) => o.status !== 'served');
  const pendingCalls = calls.filter((c) => c.status === 'pending');
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const recentOrders = orders.slice(0, 3);
  const recentCalls = calls.slice(0, 3);
  const recentPayments = payments.slice(0, 3);

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
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${C.bdr}`,
        }}
      >
        <div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: C.gold, letterSpacing: '0.05em' }}>
            DOOBIE DOO BAR
          </div>
          <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>
            Admin Dashboard · Demo
          </div>
        </div>
        <div style={{ fontSize: '12px', color: C.muted, textAlign: 'right' }}>
          🟢 Live · Real-time monitoring
        </div>
      </div>

      {/* サマリーカード */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <SummaryCard
          icon="🍽️"
          label="Pending Orders"
          count={pendingOrders.length}
          accent={pendingOrders.length > 0 ? C.amber : C.muted}
          accentBg={pendingOrders.length > 0 ? C.amberD : C.faint}
          href="/demo-doobie/admin/orders"
        />
        <SummaryCard
          icon="🛎️"
          label="Active Calls"
          count={pendingCalls.length}
          accent={pendingCalls.length > 0 ? C.red : C.muted}
          accentBg={pendingCalls.length > 0 ? C.redD : C.faint}
          href="/demo-doobie/admin/calls"
        />
        <SummaryCard
          icon="💳"
          label="Payment Requests"
          count={pendingPayments.length}
          accent={pendingPayments.length > 0 ? C.gold : C.muted}
          accentBg={pendingPayments.length > 0 ? C.goldD : C.faint}
          href="/demo-doobie/admin/payments"
        />
      </div>

      {/* 最新3件セクション */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Recent Orders */}
        <RecentSection
          title="Recent Orders"
          href="/demo-doobie/admin/orders"
          empty={recentOrders.length === 0}
        >
          {recentOrders.map((o) => (
            <div
              key={o.id}
              style={{
                padding: '12px 14px',
                borderBottom: `1px solid ${C.bdr}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700 }}>
                    Table {o.tableNumber}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <div style={{ fontSize: '12px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold }}>
                  {formatVND(o.total)}
                </div>
                <div style={{ fontSize: '10px', color: C.muted }}>{formatTime(o.createdAt)}</div>
              </div>
            </div>
          ))}
        </RecentSection>

        {/* Recent Calls */}
        <RecentSection
          title="Recent Calls"
          href="/demo-doobie/admin/calls"
          empty={recentCalls.length === 0}
        >
          {recentCalls.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '12px 14px',
                borderBottom: `1px solid ${C.bdr}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700 }}>
                    Table {c.tableNumber}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <div style={{ fontSize: '13px', color: C.txt }}>
                  {REASON_ICONS[c.reason] || '🔔'} {REASON_LABELS[c.reason] || c.reason}
                </div>
              </div>
              <div style={{ fontSize: '10px', color: C.muted, flexShrink: 0 }}>
                {formatTime(c.createdAt)}
              </div>
            </div>
          ))}
        </RecentSection>

        {/* Recent Payments */}
        <RecentSection
          title="Recent Payments"
          href="/demo-doobie/admin/payments"
          empty={recentPayments.length === 0}
        >
          {recentPayments.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '12px 14px',
                borderBottom: `1px solid ${C.bdr}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700 }}>
                    Table {p.tableNumber}
                  </span>
                  <StatusBadge status={p.status} />
                  <span style={{ fontSize: '10px', color: C.muted }}>
                    {p.payMethod === 'card' ? '💳 Card' : '💴 Cash'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: C.muted }}>
                  {p.items.length} item{p.items.length > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold }}>
                  {formatVND(p.total)}
                </div>
                <div style={{ fontSize: '10px', color: C.muted }}>{formatTime(p.createdAt)}</div>
              </div>
            </div>
          ))}
        </RecentSection>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// サマリーカード
// ─────────────────────────────────────
function SummaryCard({
  icon,
  label,
  count,
  accent,
  accentBg,
  href,
}: {
  icon: string;
  label: string;
  count: number;
  accent: string;
  accentBg: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        background: C.surf,
        border: `1px solid ${count > 0 ? accent : C.bdr}`,
        borderRadius: '14px',
        padding: '20px 22px',
        textDecoration: 'none',
        display: 'block',
        boxShadow: count > 0 ? `0 0 0 1px ${accent}30` : 'none',
        transition: 'transform 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            background: accentBg,
            border: `1px solid ${accent}40`,
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: '20px',
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: '11px', color: C.muted, fontWeight: 600 }}>
          {count > 0 ? '🔴 Active' : 'All clear'}
        </span>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, color: count > 0 ? accent : C.muted, lineHeight: 1 }}>
        {count}
      </div>
      <div style={{ fontSize: '12px', color: C.muted, marginTop: '6px', fontWeight: 500 }}>
        {label}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────
// 最新セクション
// ─────────────────────────────────────
function RecentSection({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bdr}`,
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${C.bdr}`,
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, letterSpacing: '0.08em' }}>
          {title.toUpperCase()}
        </div>
        <Link
          href={href}
          style={{
            fontSize: '11px',
            color: C.muted,
            textDecoration: 'none',
          }}
        >
          View all →
        </Link>
      </div>
      {empty ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>
          No data yet
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────
// ステータスバッジ
// ─────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#1a1000', color: C.amber, label: 'PENDING' },
    preparing: { bg: '#0a1a1a', color: '#5dd3d3', label: 'PREPARING' },
    served: { bg: '#0a1a0a', color: '#5dc870', label: 'SERVED' },
    done: { bg: '#0a1a0a', color: '#5dc870', label: 'DONE' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: '9px',
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: '4px',
        letterSpacing: '0.05em',
      }}
    >
      {s.label}
    </span>
  );
}