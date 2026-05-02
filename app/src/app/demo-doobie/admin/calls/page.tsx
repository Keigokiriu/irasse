'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
  red: '#ef4444',
  redD: '#1a0808',
  green: '#5dc870',
  greenD: '#0a1a0a',
  amber: '#f59e0b',
  amberD: '#1a1000',
};

type DoobieCall = {
  id: string;
  tableNumber: number;
  reason: string;
  memo?: string;
  status: 'pending' | 'done';
  createdAt: Timestamp | null;
};

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

function formatTime(ts: Timestamp | null): string {
  if (!ts) return '—';
  const d = ts.toDate();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function elapsedMinutes(ts: Timestamp | null): number {
  if (!ts) return 0;
  return Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
}

export default function DoobieCallsPage() {
  const [calls, setCalls] = useState<DoobieCall[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'demo_doobie_calls'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DoobieCall[];
        setCalls(data);
      }
    );
    return () => unsub();
  }, []);

  const activeCalls = calls.filter((c) => c.status === 'pending');
  const doneCalls = calls.filter((c) => c.status === 'done').slice(0, 10);
  const doneCount = calls.filter((c) => c.status === 'done').length;

  const handleMarkDone = async (callId: string) => {
    setUpdating(callId);
    setErrorMsg('');
    try {
      await updateDoc(doc(db, 'demo_doobie_calls', callId), {
        status: 'done',
      });
    } catch (error) {
      console.error('Status update failed:', error);
      setErrorMsg('Failed to update. Please try again.');
      setTimeout(() => setErrorMsg(''), 4000);
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
            STAFF CALLS
          </div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
            Active: {activeCalls.length} · Done: {doneCount}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: C.muted, textAlign: 'right' }}>
          🟢 Live · Real-time
        </div>
      </div>

      {/* エラーバナー */}
      {errorMsg && (
        <div
          style={{
            background: '#3f1d1d',
            border: '1px solid #ef4444',
            color: '#fecaca',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Active calls セクション */}
      <Section
        title="Active Calls"
        subtitle="Awaiting response"
        icon="🔴"
        accent={C.red}
        accentBg={C.redD}
        count={activeCalls.length}
      >
        {activeCalls.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
            {activeCalls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onMarkDone={() => handleMarkDone(call.id)}
                loading={updating === call.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="No active calls — everything is calm 🌿" />
        )}
      </Section>

      {/* Done セクション */}
      <Section
        title="Done"
        subtitle="Recently handled"
        icon="✅"
        accent={C.green}
        accentBg={C.greenD}
        count={doneCalls.length}
        muted
      >
        {doneCalls.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
            {doneCalls.map((call) => (
              <DoneCallCard key={call.id} call={call} />
            ))}
          </div>
        ) : (
          <EmptyState text="No completed calls yet" />
        )}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────
// セクション
// ─────────────────────────────────────
function Section({
  title,
  subtitle,
  icon,
  accent,
  accentBg,
  count,
  muted,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  accentBg: string;
  count: number;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: `1px solid ${C.bdr}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px', opacity: muted ? 0.5 : 1 }}>{icon}</span>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: muted ? C.muted : accent,
                letterSpacing: '0.08em',
              }}
            >
              {title.toUpperCase()}
            </div>
            <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{subtitle}</div>
          </div>
        </div>
        <div
          style={{
            background: muted ? C.faint : accentBg,
            border: `1px solid ${muted ? C.bdr : accent + '40'}`,
            color: muted ? C.muted : accent,
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '999px',
          }}
        >
          {count}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────
// アクティブな呼び出しカード
// ─────────────────────────────────────
function CallCard({
  call,
  onMarkDone,
  loading,
}: {
  call: DoobieCall;
  onMarkDone: () => void;
  loading: boolean;
}) {
  const minutes = elapsedMinutes(call.createdAt);
  const isUrgent = minutes >= 5;
  const icon = REASON_ICONS[call.reason] || '🔔';
  const label = REASON_LABELS[call.reason] || call.reason;

  return (
    <div
      style={{
        background: isUrgent ? '#1a0808' : C.surf,
        border: `1px solid ${isUrgent ? C.red : C.bdr}`,
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: isUrgent ? '0 0 0 1px #ef444430' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            background: isUrgent ? '#3f1d1d' : C.goldD,
            border: `1px solid ${isUrgent ? C.red : C.goldM}`,
            color: isUrgent ? '#fecaca' : C.gold,
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '6px',
          }}
        >
          Table {call.tableNumber}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: C.muted }}>{formatTime(call.createdAt)}</div>
          <div
            style={{
              fontSize: '10px',
              color: isUrgent ? C.red : C.muted,
              fontWeight: isUrgent ? 700 : 400,
              marginTop: '2px',
            }}
          >
            {minutes}m ago{isUrgent && ' ⚠️ URGENT'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '10px',
          marginBottom: call.memo ? '10px' : '14px',
        }}
      >
        <span style={{ fontSize: '28px' }}>{icon}</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: C.txt }}>{label}</span>
      </div>

      {call.memo && (
        <div
          style={{
            background: C.surf2,
            border: `1px solid ${C.bdr}`,
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '14px',
            fontSize: '12px',
            color: C.muted,
            fontStyle: 'italic',
          }}
        >
          📝 &ldquo;{call.memo}&rdquo;
        </div>
      )}

      <button
        onClick={onMarkDone}
        disabled={loading}
        style={{
          width: '100%',
          background: isUrgent ? C.red : C.green,
          border: 'none',
          color: '#0a0a0a',
          fontSize: '13px',
          fontWeight: 800,
          padding: '11px',
          borderRadius: '8px',
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.5 : 1,
          fontFamily: 'inherit',
        }}
      >
        {loading ? 'Updating...' : '✓ Mark as done'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────
// 完了済み呼び出しカード（コンパクト）
// ─────────────────────────────────────
function DoneCallCard({ call }: { call: DoobieCall }) {
  const icon = REASON_ICONS[call.reason] || '🔔';
  const label = REASON_LABELS[call.reason] || call.reason;

  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bdr}`,
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: 0.6,
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: C.txt }}>
          Table {call.tableNumber} · {label}
        </div>
        <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>
          {formatTime(call.createdAt)}
        </div>
      </div>
      <span style={{ fontSize: '14px', color: C.green }}>✓</span>
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
        padding: '40px 16px',
        textAlign: 'center',
        color: C.muted,
        fontSize: '13px',
        fontStyle: 'italic',
        background: C.surf,
        border: `1px solid ${C.bdr}`,
        borderRadius: '12px',
      }}
    >
      {text}
    </div>
  );
}