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
import { doobieStore } from '@/data/doobieMenu';

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

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
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

function formatDate(ts: Timestamp | null): string {
  if (!ts) return '—';
  const d = ts.toDate();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function elapsedMinutes(ts: Timestamp | null): number {
  if (!ts) return 0;
  return Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
}

export default function DoobiePaymentsPage() {
  const [payments, setPayments] = useState<DoobiePayment[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptPayment, setReceiptPayment] = useState<DoobiePayment | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'demo_doobie_payments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DoobiePayment[];
        setPayments(data);
      }
    );
    return () => unsub();
  }, []);

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const donePayments = payments.filter((p) => p.status === 'done').slice(0, 10);
  const doneCount = payments.filter((p) => p.status === 'done').length;

  const handleComplete = async (paymentId: string) => {
    setUpdating(paymentId);
    setErrorMsg('');
    try {
      await updateDoc(doc(db, 'demo_doobie_payments', paymentId), {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
     {/* 印刷用CSS */}
     <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 16mm;
          }
          html, body {
            background: white !important;
            color: black !important;
          }
          /* 印刷時、ページ全体を非表示にする */
          body > * {
            display: none !important;
          }
          /* レシートを内包するモーダル全体だけは表示する */
          body .receipt-modal-root,
          body .receipt-modal-root * {
            display: revert !important;
            visibility: visible !important;
          }
          /* モーダル背景は白 */
          body .receipt-modal-root {
            position: static !important;
            background: white !important;
            padding: 0 !important;
          }
          /* レシート本体を全幅で表示 */
          body .receipt-print-area {
            position: static !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          /* レシート内の全要素を白×黒に */
          body .receipt-print-area * {
            background: white !important;
            color: black !important;
          }
          /* 印刷時に隠したい要素 */
          .receipt-no-print {
            display: none !important;
          }
        }
      `}</style>

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
              PAYMENTS
            </div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
              Pending: {pendingPayments.length} · Done: {doneCount}
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

        {/* Pending */}
        <Section
          title="Pending Payments"
          subtitle="Awaiting completion"
          icon="💳"
          accent={C.gold}
          accentBg={C.goldD}
          count={pendingPayments.length}
        >
          {pendingPayments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '14px' }}>
              {pendingPayments.map((p) => (
                <PaymentCard
                  key={p.id}
                  payment={p}
                  onShowReceipt={() => setReceiptPayment(p)}
                  onComplete={() => handleComplete(p.id)}
                  loading={updating === p.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="No pending payments — all settled ✨" />
          )}
        </Section>

        {/* Done */}
        <Section
          title="Done"
          subtitle="Recently completed"
          icon="✅"
          accent={C.green}
          accentBg={C.greenD}
          count={doneCount}
          muted
        >
          {donePayments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
              {donePayments.map((p) => (
                <DonePaymentCard
                  key={p.id}
                  payment={p}
                  onShowReceipt={() => setReceiptPayment(p)}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="No completed payments yet" />
          )}
        </Section>
      </div>

      {/* レシートモーダル */}
      {receiptPayment && (
        <ReceiptModal
          payment={receiptPayment}
          onClose={() => setReceiptPayment(null)}
          onPrint={handlePrint}
        />
      )}
    </>
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
// Pending 会計カード
// ─────────────────────────────────────
function PaymentCard({
  payment,
  onShowReceipt,
  onComplete,
  loading,
}: {
  payment: DoobiePayment;
  onShowReceipt: () => void;
  onComplete: () => void;
  loading: boolean;
}) {
  const minutes = elapsedMinutes(payment.createdAt);

  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bdr}`,
        borderRadius: '12px',
        padding: '16px 18px',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: C.goldD,
              border: `1px solid ${C.goldM}`,
              color: C.gold,
              fontSize: '13px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            Table {payment.tableNumber}
          </div>
          <div
            style={{
              background: payment.payMethod === 'card' ? '#0a1a2e' : '#1a1a0a',
              border: `1px solid ${payment.payMethod === 'card' ? '#5b9eff40' : '#c9a84c40'}`,
              color: payment.payMethod === 'card' ? '#7eb6ff' : C.gold,
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            {payment.payMethod === 'card' ? '💳 Card' : '💴 Cash'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: C.muted }}>{formatTime(payment.createdAt)}</div>
          <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{minutes}m ago</div>
        </div>
      </div>

      {/* 商品一覧 */}
      <div style={{ marginBottom: '14px' }}>
        {payment.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              padding: '5px 0',
              borderBottom: idx < payment.items.length - 1 ? `1px dashed ${C.bdr}` : 'none',
            }}
          >
            <span style={{ color: C.txt, flex: 1, marginRight: '8px' }}>
              {item.name}
              <span style={{ color: C.muted, marginLeft: '6px' }}>×{item.quantity}</span>
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
          padding: '10px 12px',
          background: C.goldD,
          border: `1px solid ${C.goldM}40`,
          borderRadius: '8px',
          marginBottom: '14px',
        }}
      >
        <span style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>TOTAL</span>
        <span style={{ fontSize: '20px', fontWeight: 800, color: C.gold }}>
          {formatVND(payment.total)}
        </span>
      </div>

      {/* アクションボタン */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={onShowReceipt}
          style={{
            background: 'transparent',
            border: `1px solid ${C.goldM}`,
            color: C.gold,
            fontSize: '12px',
            fontWeight: 700,
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🧾 Show receipt
        </button>
        <button
          onClick={onComplete}
          disabled={loading}
          style={{
            background: C.green,
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
          {loading ? 'Updating...' : '✓ Complete'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// Done 会計カード（コンパクト）
// ─────────────────────────────────────
function DonePaymentCard({
  payment,
  onShowReceipt,
}: {
  payment: DoobiePayment;
  onShowReceipt: () => void;
}) {
  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bdr}`,
        borderRadius: '8px',
        padding: '10px 12px',
        opacity: 0.7,
        cursor: 'pointer',
      }}
      onClick={onShowReceipt}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: C.txt }}>
          Table {payment.tableNumber}
        </div>
        <div style={{ fontSize: '10px', color: C.muted }}>{formatTime(payment.createdAt)}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: C.muted }}>
          {payment.payMethod === 'card' ? '💳 Card' : '💴 Cash'}
        </span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: C.gold }}>
          {formatVND(payment.total)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// レシートモーダル
// ─────────────────────────────────────
function ReceiptModal({
  payment,
  onClose,
  onPrint,
}: {
  payment: DoobiePayment;
  onClose: () => void;
  onPrint: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 100,
      }}
      onClick={onClose}
      className="receipt-modal-root"
    >
      <div
        style={{
          background: '#fafafa',
          color: '#1a1a1a',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          fontFamily: "'Courier New', monospace",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* レシート本体（印刷対象） */}
        <div className="receipt-print-area" style={{ padding: '40px 32px' }}>
          {/* 店名（テキストロゴ） */}
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px dashed #999' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>
              {doobieStore.name}
            </div>
            <div style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '8px', color: '#666' }}>
              {doobieStore.subtitle}
            </div>
            <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
              {doobieStore.location}
            </div>
          </div>

          {/* 日時・テーブル */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ color: '#666' }}>Date</div>
              <div style={{ fontWeight: 700 }}>{formatDate(payment.createdAt)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666' }}>Time</div>
              <div style={{ fontWeight: 700 }}>{formatTime(payment.createdAt)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#666' }}>Table</div>
              <div style={{ fontWeight: 700 }}>#{payment.tableNumber}</div>
            </div>
          </div>

          {/* 商品一覧 */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 700,
                paddingBottom: '8px',
                borderBottom: '1px solid #999',
                marginBottom: '8px',
                color: '#666',
                letterSpacing: '0.05em',
              }}
            >
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            {payment.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  fontSize: '13px',
                  padding: '6px 0',
                }}
              >
                <div style={{ flex: 1, marginRight: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {item.quantity} × {formatVND(item.price)}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>
                  {formatVND(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* 合計 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderTop: '2px solid #1a1a1a',
              borderBottom: '2px solid #1a1a1a',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 800 }}>TOTAL</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>{formatVND(payment.total)}</span>
          </div>

          {/* 支払い方法 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              marginBottom: '24px',
            }}
          >
            <span style={{ color: '#666' }}>Payment Method</span>
            <span style={{ fontWeight: 700 }}>
              {payment.payMethod === 'card' ? '💳 Card' : '💴 Cash'}
            </span>
          </div>

          {/* フッター */}
          <div
            style={{
              textAlign: 'center',
              paddingTop: '20px',
              borderTop: '2px dashed #999',
              fontSize: '12px',
              color: '#666',
            }}
          >
            <div style={{ marginBottom: '6px', fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>
              Thank you! See you again 🍜
            </div>
            <div style={{ fontSize: '10px' }}>
              Disco nights, izakaya plates & natural wines
            </div>
          </div>
        </div>

        {/* モーダル下部のアクションボタン（印刷時非表示） */}
        <div
          className="receipt-no-print"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '10px',
            background: '#f0f0f0',
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid #999',
              color: '#1a1a1a',
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✕ Close
          </button>
          <button
            onClick={onPrint}
            style={{
              flex: 2,
              background: '#1a1a1a',
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🖨️ Print Receipt
          </button>
        </div>
      </div>
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