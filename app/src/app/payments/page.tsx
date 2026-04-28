'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type TimestampLike =
  | { seconds: number; nanoseconds?: number }
  | { toDate: () => Date }
  | Date
  | null
  | undefined;

type PaymentItemObject = {
  name?: string;
  quantity?: number;
  price?: number;
};

type PaymentItemInput = string | PaymentItemObject;

type Payment = {
  id: string;
  tableNumber: number;
  items: PaymentItemInput[];
  total: number;
  payMethod: 'card' | 'cash';
  status: 'pending' | 'done';
  createdAt: TimestampLike;
};

type Lang = 'ja' | 'en';

const TR = {
  ja: {
    back: '← ダッシュボード',
    title: '💳 お会計管理',
    pendingBadge: (n: number) => `${n}件 未対応`,
    pendingTitle: '未対応',
    doneTitle: '対応済み',
    loading: '読み込み中...',
    empty: '未対応のお会計はありません ✅',
    table: 'テーブル',
    card: '💳 カード',
    cash: '💴 現金',
    markDone: '対応済み ✓',
    markingDone: '更新中...',
    done: '✓ 対応済み',
    receipt: '🧾 レシート',
    print: '🖨️ 印刷する',
    close: '閉じる',
    retry: '再読み込み',
    receiptTitle: 'RECEIPT',
    receiptTable: 'テーブル',
    receiptTime: '日時',
    receiptPayMethod: 'お支払い',
    receiptSubtotal: '小計',
    receiptTotal: '合計',
    receiptNumber: '伝票番号',
    receiptNoItems: '明細情報がありません',
    receiptStoreInfo: '店舗情報',
    receiptThanks: 'ありがとうございました',
    updateError: '更新に失敗しました。通信状況をご確認ください。',
    loadError: 'お会計データの取得に失敗しました。',
  },
  en: {
    back: '← Dashboard',
    title: '💳 Payment Management',
    pendingBadge: (n: number) => `${n} pending`,
    pendingTitle: 'Pending',
    doneTitle: 'Resolved',
    loading: 'Loading...',
    empty: 'No pending payments ✅',
    table: 'Table',
    card: '💳 Card',
    cash: '💴 Cash',
    markDone: 'Resolve ✓',
    markingDone: 'Updating...',
    done: '✓ Resolved',
    receipt: '🧾 Receipt',
    print: '🖨️ Print',
    close: 'Close',
    retry: 'Reload',
    receiptTitle: 'RECEIPT',
    receiptTable: 'Table',
    receiptTime: 'Date & Time',
    receiptPayMethod: 'Payment',
    receiptSubtotal: 'Subtotal',
    receiptTotal: 'Total',
    receiptNumber: 'Receipt No.',
    receiptNoItems: 'No item details available',
    receiptStoreInfo: 'Store Info',
    receiptThanks: 'Thank you for visiting!',
    updateError: 'Failed to update. Please check your connection.',
    loadError: 'Failed to load payment data.',
  },
} as const;

function getLocale(lang: Lang) {
  return lang === 'ja' ? 'ja-JP' : 'en-US';
}

function getPaymentDate(createdAt: TimestampLike): Date | null {
  if (!createdAt) return null;

  if (createdAt instanceof Date) {
    return createdAt;
  }

  if (typeof createdAt === 'object' && 'toDate' in createdAt && typeof createdAt.toDate === 'function') {
    return createdAt.toDate();
  }

  if (typeof createdAt === 'object' && 'seconds' in createdAt && typeof createdAt.seconds === 'number') {
    return new Date(createdAt.seconds * 1000);
  }

  return null;
}

function formatTime(createdAt: TimestampLike, lang: Lang) {
  const date = getPaymentDate(createdAt);
  if (!date) return '';
  return date.toLocaleTimeString(getLocale(lang), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(createdAt: TimestampLike, lang: Lang) {
  const date = getPaymentDate(createdAt);
  if (!date) return '';
  return date.toLocaleString(getLocale(lang), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number, lang: Lang) {
  return new Intl.NumberFormat(getLocale(lang), {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function getReceiptNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function parsePaymentItem(
  input: PaymentItemInput
): { name: string; quantity: number; price?: number } | null {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/^(.*?)(?:\s*[x×]\s*(\d+))?$/i);
    if (!match) {
      return { name: trimmed, quantity: 1 };
    }

    const name = match[1]?.trim() || trimmed;
    const quantity = match[2] ? Number(match[2]) : 1;

    return {
      name,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    };
  }

  if (input && typeof input === 'object') {
    const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Item';
    const quantity =
      typeof input.quantity === 'number' && Number.isFinite(input.quantity) && input.quantity > 0
        ? input.quantity
        : 1;
    const price =
      typeof input.price === 'number' && Number.isFinite(input.price) ? input.price : undefined;

    return { name, quantity, price };
  }

  return null;
}

function normalizePayment(raw: Partial<Payment> & { id: string }): Payment {
  return {
    id: raw.id,
    tableNumber: typeof raw.tableNumber === 'number' ? raw.tableNumber : 0,
    items: Array.isArray(raw.items) ? raw.items : [],
    total: typeof raw.total === 'number' ? raw.total : 0,
    payMethod: raw.payMethod === 'cash' ? 'cash' : 'card',
    status: raw.status === 'done' ? 'done' : 'pending',
    createdAt: raw.createdAt ?? null,
  };
}

export default function PaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('ja');
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const [storeName, setStoreName] = useState('Irasse');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');

  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');

  const t = TR[lang];

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    setPageError('');
    setLoading(true);

    const unsubStore = onSnapshot(
      doc(db, 'store_status', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          if (typeof data.storeName === 'string' && data.storeName.trim()) {
            setStoreName(data.storeName.trim());
          }

          const address =
            typeof data.storeAddress === 'string' && data.storeAddress.trim()
              ? data.storeAddress.trim()
              : typeof data.address === 'string' && data.address.trim()
                ? data.address.trim()
                : '';

          const phone =
            typeof data.storePhone === 'string' && data.storePhone.trim()
              ? data.storePhone.trim()
              : typeof data.phone === 'string' && data.phone.trim()
                ? data.phone.trim()
                : '';

          const website =
            typeof data.storeWebsite === 'string' && data.storeWebsite.trim()
              ? data.storeWebsite.trim()
              : typeof data.website === 'string' && data.website.trim()
                ? data.website.trim()
                : '';

          setStoreAddress(address);
          setStorePhone(phone);
          setStoreWebsite(website);
        }
      },
      () => {
        // 店舗情報取得失敗はページ全体を止めない
      }
    );

    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));

    const unsubPayments = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((paymentDoc) =>
          normalizePayment({
            id: paymentDoc.id,
            ...(paymentDoc.data() as Partial<Payment>),
          })
        );

        setPayments(data);
        setLoading(false);
        setPageError('');
      },
      () => {
        setLoading(false);
        setPageError(t.loadError);
      }
    );

    return () => {
      unsubStore();
      unsubPayments();
    };
  }, [t.loadError]);

  const pendingPayments = useMemo(
    () => payments.filter((payment) => payment.status === 'pending'),
    [payments]
  );

  const donePayments = useMemo(
    () => payments.filter((payment) => payment.status === 'done'),
    [payments]
  );

  const markDone = async (id: string) => {
    setActionError('');
    setIsUpdatingId(id);

    try {
      await updateDoc(doc(db, 'payments', id), { status: 'done' });
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setActionError(t.updateError);
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handlePrint = () => {
    setActionError('');
    window.print();
  };

  const receiptItems = useMemo(() => {
    if (!receiptPayment) return [];
    return receiptPayment.items.map(parsePaymentItem).filter(Boolean) as Array<{
      name: string;
      quantity: number;
      price?: number;
    }>;
  }, [receiptPayment]);

  const receiptSubtotal = useMemo(() => {
    if (receiptItems.length === 0) return null;

    const allItemsHavePrice = receiptItems.every(
      (item) => typeof item.price === 'number' && Number.isFinite(item.price)
    );

    if (!allItemsHavePrice) return null;

    return receiptItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  }, [receiptItems]);

  const hasStoreInfo = Boolean(storeAddress || storePhone || storeWebsite);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      <style>{`
  @media print {
    html, body {
      background: white !important;
    }

    body * {
      visibility: hidden !important;
    }

    #receipt-print,
    #receipt-print * {
      visibility: visible !important;
    }

    #receipt-print {
  position: fixed !important;
  top: 8mm;
  left: 50%;
  transform: translateX(-50%);
  width: 680px;
  max-width: calc(100% - 20mm);
  padding: 0 10mm;
  background: white !important;
  color: black !important;
  box-sizing: border-box;
  box-shadow: none !important;
}

    .no-print {
      display: none !important;
    }
  }

  @page {
    size: A4 portrait;
    margin: 10mm;
  }
`}</style>

      {receiptPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '0',
              width: '100%',
              maxWidth: '380px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div id="receipt-print" style={{ padding: '28px 24px', background: '#fff', color: '#000' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px' }}>{storeName}</p>
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '0.1em',
                  }}
                >
                  {t.receiptTitle}
                </h2>

                {hasStoreInfo && (
                  <div style={{ marginTop: '10px' }}>
                    {storeAddress && (
                      <p style={{ fontSize: '11px', color: '#666', margin: '0 0 2px', lineHeight: 1.5 }}>
                        {storeAddress}
                      </p>
                    )}
                    {storePhone && (
                      <p style={{ fontSize: '11px', color: '#666', margin: '0 0 2px', lineHeight: 1.5 }}>
                        {storePhone}
                      </p>
                    )}
                    {storeWebsite && (
                      <p style={{ fontSize: '11px', color: '#666', margin: 0, lineHeight: 1.5 }}>
                        {storeWebsite}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px dashed #ccc',
                  borderBottom: '1px dashed #ccc',
                  padding: '14px 0',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', gap: '12px' }}
                >
                  <span style={{ fontSize: '12px', color: '#666' }}>{t.receiptNumber}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{getReceiptNumber(receiptPayment.id)}</span>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', gap: '12px' }}
                >
                  <span style={{ fontSize: '12px', color: '#666' }}>{t.receiptTable}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{receiptPayment.tableNumber}</span>
                </div>

                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', gap: '12px' }}
                >
                  <span style={{ fontSize: '12px', color: '#666' }}>{t.receiptTime}</span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textAlign: 'right',
                      wordBreak: 'break-word',
                    }}
                  >
                    {formatDateTime(receiptPayment.createdAt, lang)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>{t.receiptPayMethod}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>
                    {receiptPayment.payMethod === 'card' ? t.card : t.cash}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                {receiptItems.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{t.receiptNoItems}</p>
                ) : (
                  receiptItems.map((item, index) => {
                    const subtotal =
                      item.price !== undefined && Number.isFinite(item.price)
                        ? item.price * item.quantity
                        : null;

                    return (
                      <div key={`${item.name}-${index}`} style={{ marginBottom: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '10px',
                          }}
                        >
                          <span style={{ fontSize: '13px', flex: 1, wordBreak: 'break-word' }}>
                            {item.name}
                          </span>

                          {subtotal !== null && (
                            <span
                              style={{
                                fontSize: '13px',
                                color: '#000',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatCurrency(subtotal, lang)}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                          {item.price !== undefined ? formatCurrency(item.price, lang) : '-'} × {item.quantity}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ borderTop: '1px solid #d4d4d8', paddingTop: '10px', marginBottom: '10px' }}>
                {receiptSubtotal !== null && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{t.receiptSubtotal}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>
                      {formatCurrency(receiptSubtotal, lang)}
                    </span>
                  </div>
                )}

                {hasStoreInfo && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{t.receiptStoreInfo}</span>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
                      {storeAddress && <div>{storeAddress}</div>}
                      {storePhone && <div>{storePhone}</div>}
                      {storeWebsite && <div>{storeWebsite}</div>}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: '2px solid #000',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800 }}>{t.receiptTotal}</span>
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                  }}
                >
                  {formatCurrency(receiptPayment.total, lang)}
                </span>
              </div>

              <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', margin: 0 }}>
                {t.receiptThanks}
              </p>
            </div>

            <div
              className="no-print"
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px 20px',
                background: '#fff',
              }}
            >
              <button
                onClick={() => setReceiptPayment(null)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                {t.close}
              </button>

              <button
                onClick={handlePrint}
                style={{
                  flex: 2,
                  background: '#f97316',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                {t.print}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f97316',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {t.back}
          </button>

          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>{t.title}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              background: '#0f172a',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
            }}
          >
            {(['ja', 'en'] as Lang[]).map((localeLang) => (
              <button
                key={localeLang}
                onClick={() => setLang(localeLang)}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: lang === localeLang ? 700 : 400,
                  background: lang === localeLang ? '#334155' : 'transparent',
                  color: lang === localeLang ? '#f1f5f9' : '#64748b',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {localeLang === 'ja' ? '🇯🇵' : '🇺🇸'}
              </button>
            ))}
          </div>

          {pendingPayments.length > 0 && (
            <div
              style={{
                background: '#7f1d1d',
                border: '1px solid #ef4444',
                borderRadius: '20px',
                padding: '4px 12px',
              }}
            >
              <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>
                {t.pendingBadge(pendingPayments.length)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {pageError && (
          <div
            style={{
              background: '#3f1d1d',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}
          >
            <p style={{ color: '#fecaca', fontSize: '13px', margin: 0 }}>{pageError}</p>
          </div>
        )}

        {actionError && (
          <div
            style={{
              background: '#3f1d1d',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}
          >
            <p style={{ color: '#fecaca', fontSize: '13px', margin: 0 }}>{actionError}</p>
          </div>
        )}

        <h2 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
          {t.pendingTitle}{' '}
          {pendingPayments.length > 0 && (
            <span style={{ color: '#ef4444' }}>({pendingPayments.length})</span>
          )}
        </h2>

        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>{t.loading}</div>
        ) : pendingPayments.length === 0 ? (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{t.empty}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {pendingPayments.map((payment) => {
              const itemLabels = payment.items
                .map(parsePaymentItem)
                .filter(Boolean)
                .map((item) => `${item!.name} ×${item!.quantity}`);

              const isUpdating = isUpdatingId === payment.id;

              return (
                <div
                  key={payment.id}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #ef4444',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          background: '#f97316',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '2px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {t.table} {payment.tableNumber}
                      </span>

                      <span
                        style={{
                          background: payment.payMethod === 'card' ? '#1e3a5f' : '#1a3a1a',
                          color: payment.payMethod === 'card' ? '#60a5fa' : '#4ade80',
                          borderRadius: '8px',
                          padding: '2px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {payment.payMethod === 'card' ? t.card : t.cash}
                      </span>

                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {formatTime(payment.createdAt, lang)}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        margin: '0 0 6px',
                        color: '#f97316',
                      }}
                    >
                      {formatCurrency(payment.total, lang)}
                    </p>

                    <p
                      style={{
                        color: '#94a3b8',
                        fontSize: '12px',
                        margin: 0,
                        wordBreak: 'break-word',
                      }}
                    >
                      {itemLabels.length > 0 ? itemLabels.join('、') : t.receiptNoItems}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => setReceiptPayment(payment)}
                      style={{
                        background: '#1e3a5f',
                        border: '1px solid #3b82f6',
                        color: '#93c5fd',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.receipt}
                    </button>

                    <button
                      onClick={() => markDone(payment.id)}
                      disabled={isUpdating}
                      style={{
                        background: isUpdating ? '#fb923c' : '#f97316',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: isUpdating ? 0.8 : 1,
                      }}
                    >
                      {isUpdating ? t.markingDone : t.markDone}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {donePayments.length > 0 && (
          <>
            <h2 style={{ color: '#64748b', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
              {t.doneTitle} ({donePayments.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {donePayments.map((payment) => {
                const itemLabels = payment.items
                  .map(parsePaymentItem)
                  .filter(Boolean)
                  .map((item) => `${item!.name} ×${item!.quantity}`);

                return (
                  <div
                    key={payment.id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '14px',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span
                      style={{
                        background: '#334155',
                        color: '#94a3b8',
                        borderRadius: '8px',
                        padding: '2px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.table} {payment.tableNumber}
                    </span>

                    <p
                      style={{
                        color: '#94a3b8',
                        fontSize: '13px',
                        margin: 0,
                        flex: 1,
                        wordBreak: 'break-word',
                      }}
                    >
                      {formatCurrency(payment.total, lang)} ·{' '}
                      {itemLabels.length > 0 ? itemLabels.join('、') : t.receiptNoItems}
                    </p>

                    <span style={{ color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {formatTime(payment.createdAt, lang)}
                    </span>

                    <button
                      onClick={() => setReceiptPayment(payment)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #334155',
                        color: '#64748b',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.receipt}
                    </button>

                    <span
                      style={{
                        color: '#4ade80',
                        fontSize: '12px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.done}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}