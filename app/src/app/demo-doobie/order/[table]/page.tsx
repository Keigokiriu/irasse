'use client';

import { useState, useMemo, use } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { doobieMenu, doobieStore } from '@/data/doobieMenu';

const TR = {
  en: {
    table: 'Table',
    bestOfDoobie: '★ Best of Doobie',
    recommended: 'RECOMMENDED FOR FIRST-TIME GUESTS',
    order: 'Order',
    call: 'Call Staff',
    bill: 'Bill',
    confirm: 'Order Confirmation',
    back: '← Back',
    placeOrder: 'Place Order ✓',
    ordering: 'Ordering...',
    orderDone: 'Order Placed!',
    orderDoneSub: "Sent to the kitchen. We'll bring it right out.",
    seeReceipt: 'View Bill',
    addMore: 'Order More',
    callTitle: 'Call Staff',
    callSub: 'Select a reason and tap the button',
    callMemo: 'Note (optional)',
    callBtn: '🔔 Call Staff',
    callSent: 'Staff has been notified',
    callSentSub: 'Someone will be with you shortly',
    callWater: '💧 Water please',
    callOrder: '📋 Change my order',
    callClean: '🧹 Clean the table',
    callOther: '🔔 Other',
    receipt: 'Bill',
    orderContents: 'Order Summary',
    noOrder: 'No orders yet',
    payMethod: 'Payment Method',
    card: '💳 Card',
    cash: '💴 Cash',
    payBtn: '💳 Pay Now',
    payWaitCash: 'Staff is on the way',
    payWaitCashSub: 'Please remain seated.\nA staff member will come to you.',
    total: 'Total',
    confirm2: 'Confirm',
    yourOrder: 'Your order',
    addItems: 'Add items to get started',
    itemsSelected: 'items selected',
    viewCart: 'View cart',
    emptyCart: 'Your cart is empty',
    selectCallReason: 'Please select a reason',
    noOrderToPay: 'There is no order to pay for',
    orderFailed: 'Failed to place the order',
    callFailed: 'Failed to call staff',
    paymentFailed: 'Failed to request payment',
    retry: 'Please try again',
  },
  ja: {
    table: 'テーブル',
    bestOfDoobie: '★ Best of Doobie',
    recommended: '初めてのお客様におすすめ',
    order: '注文',
    call: 'スタッフ呼び出し',
    bill: 'お会計',
    confirm: 'ご注文内容の確認',
    back: '← 戻る',
    placeOrder: '注文を確定する ✓',
    ordering: '注文中...',
    orderDone: 'ご注文を承りました',
    orderDoneSub: 'キッチンに送信されました。まもなくお持ちします。',
    seeReceipt: 'お会計を見る',
    addMore: '追加注文する',
    callTitle: 'スタッフ呼び出し',
    callSub: '用件を選んでボタンを押してください',
    callMemo: 'メモ（任意）',
    callBtn: '🔔 スタッフを呼ぶ',
    callSent: 'スタッフに通知しました',
    callSentSub: 'まもなく参ります',
    callWater: '💧 お水をください',
    callOrder: '📋 注文を変更したい',
    callClean: '🧹 テーブルを拭いてほしい',
    callOther: '🔔 その他',
    receipt: 'お会計',
    orderContents: 'ご注文内容',
    noOrder: 'まだ注文がありません',
    payMethod: 'お支払い方法',
    card: '💳 カード',
    cash: '💴 現金',
    payBtn: '💳 この内容でお支払い',
    payWaitCash: 'スタッフが参ります',
    payWaitCashSub: 'そのままお座りのままお待ちください。\nスタッフがお伺いします。',
    total: '合計',
    confirm2: '確認する',
    yourOrder: 'ご注文',
    addItems: '商品を追加してください',
    itemsSelected: '点選択中',
    viewCart: 'カートを見る',
    emptyCart: 'カートが空です',
    selectCallReason: '呼び出し内容を選択してください',
    noOrderToPay: 'お会計対象の注文がありません',
    orderFailed: '注文送信に失敗しました',
    callFailed: 'スタッフ呼び出しに失敗しました',
    paymentFailed: '会計リクエストに失敗しました',
    retry: 'もう一度お試しください',
  },
  ko: {
    table: '테이블',
    bestOfDoobie: '★ Best of Doobie',
    recommended: '처음 오신 분께 추천',
    order: '주문',
    call: '직원 호출',
    bill: '계산',
    confirm: '주문 확인',
    back: '← 뒤로',
    placeOrder: '주문 확정 ✓',
    ordering: '주문 중...',
    orderDone: '주문이 완료되었습니다',
    orderDoneSub: '주방에 전달되었습니다.',
    seeReceipt: '계산 보기',
    addMore: '추가 주문',
    callTitle: '직원 호출',
    callSub: '용건을 선택해 주세요',
    callMemo: '메모 (선택)',
    callBtn: '🔔 직원 호출',
    callSent: '직원에게 알렸습니다',
    callSentSub: '곧 찾아뵙겠습니다',
    callWater: '💧 물 주세요',
    callOrder: '📋 주문 변경',
    callClean: '🧹 테이블 닦아주세요',
    callOther: '🔔 기타',
    receipt: '계산',
    orderContents: '주문 내역',
    noOrder: '주문 없음',
    payMethod: '결제 방법',
    card: '💳 카드',
    cash: '💴 현금',
    payBtn: '💳 결제하기',
    payWaitCash: '직원이 곧 갑니다',
    payWaitCashSub: '자리에 앉아서 기다려 주세요.',
    total: '합계',
    confirm2: '확인',
    yourOrder: '주문 내역',
    addItems: '상품을 추가해 주세요',
    itemsSelected: '개 선택',
    viewCart: '장바구니 보기',
    emptyCart: '장바구니가 비어 있습니다',
    selectCallReason: '호출 사유를 선택해 주세요',
    noOrderToPay: '결제할 주문이 없습니다',
    orderFailed: '주문 전송 실패',
    callFailed: '호출 실패',
    paymentFailed: '결제 요청 실패',
    retry: '다시 시도해 주세요',
  },
  zh: {
    table: '桌号',
    bestOfDoobie: '★ Best of Doobie',
    recommended: '推荐给初次光临的客人',
    order: '点餐',
    call: '呼叫服务员',
    bill: '账单',
    confirm: '确认订单',
    back: '← 返回',
    placeOrder: '确认下单 ✓',
    ordering: '下单中...',
    orderDone: '订单已接受',
    orderDoneSub: '已发送到厨房。',
    seeReceipt: '查看账单',
    addMore: '继续点餐',
    callTitle: '呼叫服务员',
    callSub: '选择需求后按下按钮',
    callMemo: '备注（可选）',
    callBtn: '🔔 呼叫服务员',
    callSent: '已通知服务员',
    callSentSub: '服务员马上过来',
    callWater: '💧 请来水',
    callOrder: '📋 修改订单',
    callClean: '🧹 请擦桌子',
    callOther: '🔔 其他',
    receipt: '账单',
    orderContents: '订单内容',
    noOrder: '暂无订单',
    payMethod: '支付方式',
    card: '💳 刷卡',
    cash: '💴 现金',
    payBtn: '💳 立即支付',
    payWaitCash: '服务员马上来',
    payWaitCashSub: '请在座位上等候。',
    total: '合计',
    confirm2: '确认',
    yourOrder: '您的订单',
    addItems: '请添加商品',
    itemsSelected: '件已选',
    viewCart: '查看购物车',
    emptyCart: '购物车为空',
    selectCallReason: '请选择呼叫原因',
    noOrderToPay: '没有可结账的订单',
    orderFailed: '提交订单失败',
    callFailed: '呼叫失败',
    paymentFailed: '结账请求失败',
    retry: '请重试',
  },
} as const;

type Lang = 'en' | 'ja' | 'ko' | 'zh';

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
};

const CATEGORIES = [
  'Cold Tapas', 'Warm Tapas', 'Oden', 'Rice / Noodle',
  'Sparkling', 'White Wine', 'Red Wine', 'Rose Wine',
];

function formatVND(price: number): string {
  return `${price.toLocaleString('en-US')} VND`;
}

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function DoobieOrderPage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = use(params);
  const tableNumber = Number(table) || 1;

  const [lang, setLang] = useState<Lang>('en');
  const t = TR[lang];

  const [activeTab, setActiveTab] = useState<'order' | 'call' | 'bill'>('order');
  const [activeCategory, setActiveCategory] = useState<string | 'recommended'>('recommended');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [orderStep, setOrderStep] = useState<'menu' | 'confirm' | 'done'>('menu');
  const [loading, setLoading] = useState(false);

  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [callMemo, setCallMemo] = useState('');
  const [callSent, setCallSent] = useState(false);

  const [payMethod, setPayMethod] = useState<'card' | 'cash'>('card');
  const [payDone, setPayDone] = useState(false);

  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'recommended') {
      return doobieMenu.filter((m) => m.recommended);
    }
    return doobieMenu.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  const cartItems: CartItem[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = doobieMenu.find((m) => m.id === id);
      return item ? { id, name: item.name, price: item.price, qty } : null;
    })
    .filter(Boolean) as CartItem[];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = Object.values(cart).reduce((sum, value) => sum + value, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) => setCart((c) => ({ ...c, [id]: Math.max((c[id] || 0) - 1, 0) }));

  const handleOrder = async () => {
    setErrorMsg('');
    if (cartItems.length === 0) {
      setErrorMsg(t.emptyCart);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'demo_doobie_orders'), {
        tableNumber,
        items: cartItems.map((c) => ({
          name: c.name,
          quantity: c.qty,
          price: c.price,
        })),
        total,
        currency: 'VND',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setOrderedItems((prev) => [...prev, ...cartItems]);
      setOrderedTotal((prev) => prev + total);
      setOrderStep('done');
      setCart({});
    } catch (error) {
      console.error(error);
      setErrorMsg(`${t.orderFailed}\n${t.retry}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    setErrorMsg('');
    if (!selectedCall) {
      setErrorMsg(t.selectCallReason);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'demo_doobie_calls'), {
        tableNumber,
        reason: selectedCall,
        memo: callMemo || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setCallSent(true);
      setSelectedCall(null);
      setCallMemo('');

      setTimeout(() => setCallSent(false), 4000);
    } catch (error) {
      console.error(error);
      setErrorMsg(`${t.callFailed}\n${t.retry}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setErrorMsg('');
    if (orderedItems.length === 0) {
      setErrorMsg(t.noOrderToPay);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'demo_doobie_payments'), {
        tableNumber,
        items: orderedItems.map((c) => ({
          name: c.name,
          quantity: c.qty,
          price: c.price,
        })),
        total: orderedTotal,
        currency: 'VND',
        payMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setPayDone(true);
    } catch (error) {
      console.error(error);
      setErrorMsg(`${t.paymentFailed}\n${t.retry}`);
    } finally {
      setLoading(false);
    }
  };

  const callOptions = [
    { id: 'water', label: t.callWater },
    { id: 'order', label: t.callOrder },
    { id: 'clean', label: t.callClean },
    { id: 'other', label: t.callOther },
  ];

  const TAB_STYLE = (active: boolean) => ({
    flex: 1,
    padding: '12px 4px',
    fontSize: '12px',
    fontWeight: 700 as const,
    color: active ? C.gold : C.muted,
    background: 'transparent',
    border: 'none',
    borderBottom: active ? `2px solid ${C.gold}` : '2px solid transparent',
    cursor: 'pointer',
    fontFamily: "'Noto Sans JP', sans-serif",
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: "'Noto Sans JP', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          background: C.surf,
          borderBottom: `1px solid ${C.bdr}`,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: C.gold, letterSpacing: '0.05em' }}>
            {doobieStore.name}
          </div>
          <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>
            {t.table} {tableNumber}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {totalQty > 0 && activeTab === 'order' && (
            <div style={{ background: C.goldD, border: `1px solid ${C.goldM}`, borderRadius: '20px', padding: '6px 12px' }}>
              <span style={{ color: C.gold, fontSize: '11px', fontWeight: 700 }}>
                🛒 {totalQty} · {formatVND(total)}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['en', 'ja', 'ko', 'zh'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? C.goldD : C.faint,
                  border: `1px solid ${lang === l ? C.goldM : C.bdr}`,
                  borderRadius: '6px',
                  padding: '4px 6px',
                  color: lang === l ? C.gold : C.muted,
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {l === 'en' ? '🇺🇸' : l === 'ja' ? '🇯🇵' : l === 'ko' ? '🇰🇷' : '🇨🇳'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* タブ */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', flexShrink: 0 }}>
        <button style={TAB_STYLE(activeTab === 'order')} onClick={() => setActiveTab('order')}>{t.order}</button>
        <button style={TAB_STYLE(activeTab === 'call')} onClick={() => setActiveTab('call')}>{t.call}</button>
        <button style={TAB_STYLE(activeTab === 'bill')} onClick={() => setActiveTab('bill')}>{t.bill}</button>
      </div>

      {/* エラー */}
      {errorMsg && (
        <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
          <div style={{ background: '#3f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', whiteSpace: 'pre-line' }}>
            {errorMsg}
          </div>
        </div>
      )}

      {/* 注文タブ */}
      {activeTab === 'order' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {orderStep === 'done' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>{t.orderDone}</div>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>{t.orderDoneSub}</div>
                <button onClick={() => { setOrderStep('menu'); setActiveTab('bill'); }} style={{ background: C.goldD, border: `1px solid ${C.goldM}`, color: C.gold, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginRight: '10px', fontFamily: 'inherit' }}>{t.seeReceipt}</button>
                <button onClick={() => setOrderStep('menu')} style={{ background: 'transparent', border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>{t.addMore}</button>
              </div>
            </div>
          ) : orderStep === 'confirm' ? (
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
              <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setOrderStep('menu')} style={{ background: 'transparent', border: 'none', color: C.gold, fontSize: '14px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>{t.back}</button>
                <div style={{ fontSize: '17px', fontWeight: 800, color: C.txt }}>{t.confirm}</div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.bdr}` }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: C.txt, fontWeight: 600, fontSize: '14px', margin: '0 0 6px' }}>{item.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => sub(item.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'transparent', border: `1px solid ${C.goldM}`, color: C.gold, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: C.gold, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => add(item.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'transparent', border: `1px solid ${C.goldM}`, color: C.gold, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
                        </div>
                      </div>
                      <p style={{ color: C.gold, fontWeight: 600, fontSize: '13px', margin: 0 }}>{formatVND(item.price * item.qty)}</p>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                    <p style={{ color: C.txt, fontWeight: 700, fontSize: '15px', margin: 0 }}>{t.total}</p>
                    <p style={{ color: C.gold, fontWeight: 800, fontSize: '20px', margin: 0 }}>{formatVND(total)}</p>
                  </div>
                </div>
                <button onClick={handleOrder} disabled={loading} style={{ width: '100%', background: C.gold, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}>{loading ? t.ordering : t.placeOrder}</button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px 8px', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                <button onClick={() => setActiveCategory('recommended')} style={{ padding: '8px 14px', fontSize: '11px', fontWeight: 600, color: activeCategory === 'recommended' ? C.gold : C.muted, background: 'transparent', border: `1px solid ${activeCategory === 'recommended' ? C.gold : '#2a2a2a'}`, borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>{t.bestOfDoobie}</button>
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '8px 14px', fontSize: '11px', fontWeight: 600, color: activeCategory === cat ? C.gold : C.muted, background: 'transparent', border: `1px solid ${activeCategory === cat ? C.gold : '#2a2a2a'}`, borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>{cat}</button>
                ))}
              </div>

              {activeCategory === 'recommended' && (
                <div style={{ padding: '4px 16px 8px', flexShrink: 0 }}>
                  <div style={{ fontSize: '10px', color: C.gold, letterSpacing: '0.12em', fontWeight: 700 }}>{t.recommended}</div>
                </div>
              )}

              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px', paddingBottom: '90px' }}>
                {filteredItems.map((item) => (
                  <div key={item.id} style={{ background: C.surf, border: `1px solid ${(cart[item.id] || 0) > 0 ? C.gold : C.bdr}`, borderRadius: '12px', padding: '12px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', border: `1px solid ${C.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '22px' }}>
                          {item.category.includes('Wine') || item.category === 'Sparkling' ? '🍷' : item.category === 'Oden' ? '🍢' : item.category === 'Rice / Noodle' ? '🍜' : '🍽️'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <p style={{ color: C.txt, fontWeight: 500, fontSize: '13px', margin: 0, lineHeight: 1.35 }}>{item.name}</p>
                        {item.recommended && activeCategory !== 'recommended' && (
                          <span style={{ background: C.goldD, border: `1px solid ${C.goldM}`, color: C.gold, fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>★ REC</span>
                        )}
                      </div>
                      <p style={{ color: C.gold, fontWeight: 600, fontSize: '12px', margin: '4px 0 0' }}>{formatVND(item.price)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => sub(item.id)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'transparent', border: `1px solid ${C.goldM}`, color: C.gold, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: C.txt, minWidth: '14px', textAlign: 'center' }}>{cart[item.id] || 0}</span>
                      <button onClick={() => add(item.id)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'transparent', border: `1px solid ${C.goldM}`, color: C.gold, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surf, borderTop: `1px solid ${C.bdr}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                <div style={{ width: '40px', height: '40px', background: C.faint, border: `1px solid ${C.bdr}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🛍️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.txt }}>{t.yourOrder}</div>
                  <div style={{ fontSize: '11px', color: C.muted }}>{totalQty === 0 ? t.addItems : `${totalQty} ${t.itemsSelected}`}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.txt, whiteSpace: 'nowrap' }}>{formatVND(total)}</div>
                <button onClick={() => totalQty > 0 && setOrderStep('confirm')} disabled={totalQty === 0} style={{ background: totalQty > 0 ? C.gold : C.faint, border: 'none', color: totalQty > 0 ? C.bg : C.muted, fontSize: '13px', fontWeight: 800, padding: '10px 16px', borderRadius: '8px', cursor: totalQty > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit', flexShrink: 0 }}>{t.viewCart}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 呼び出しタブ */}
      {activeTab === 'call' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '14px' }}>{t.callSub}</p>
          {callOptions.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedCall(selectedCall === opt.id ? null : opt.id)} style={{ width: '100%', background: selectedCall === opt.id ? C.goldD : C.surf, border: `1px solid ${selectedCall === opt.id ? C.goldM : C.bdr}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', color: selectedCall === opt.id ? C.gold : C.txt, fontSize: '14px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>{opt.label}</button>
          ))}
          <textarea value={callMemo} onChange={(e) => setCallMemo(e.target.value)} placeholder={t.callMemo} style={{ width: '100%', background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '12px 14px', color: C.txt, fontSize: '13px', resize: 'none', height: '80px', marginTop: '4px', marginBottom: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
          {callSent ? (
            <div style={{ textAlign: 'center', padding: '16px', background: '#0a2a10', border: '1px solid #50c870', borderRadius: '12px', color: '#50c870', fontSize: '14px', fontWeight: 700 }}>
              ✅ {t.callSent}<br />
              <span style={{ fontSize: '12px', fontWeight: 400, color: C.muted }}>{t.callSentSub}</span>
            </div>
          ) : (
            <button onClick={handleCall} disabled={!selectedCall || loading} style={{ width: '100%', background: selectedCall ? C.gold : C.faint, border: 'none', color: selectedCall ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: selectedCall ? 'pointer' : 'default', fontFamily: 'inherit' }}>{t.callBtn}</button>
          )}
        </div>
      )}

      {/* 会計タブ */}
      {activeTab === 'bill' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {payDone ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏳</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: C.txt, marginBottom: '12px' }}>{t.payWaitCash}</div>
              <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.8, marginBottom: '24px', whiteSpace: 'pre-line' }}>{t.payWaitCashSub}</div>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: C.muted, fontSize: '13px' }}>{t.total}</span>
                  <span style={{ color: C.gold, fontSize: '20px', fontWeight: 800 }}>{formatVND(orderedTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ color: C.muted, fontSize: '13px' }}>{t.payMethod}</span>
                  <span style={{ color: C.txt, fontSize: '13px', fontWeight: 700 }}>{payMethod === 'cash' ? t.cash : t.card}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '15px', fontWeight: 700, color: C.txt, marginBottom: '14px' }}>{t.orderContents}</div>
              {orderedItems.length > 0 ? (
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
                  {orderedItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.bdr}` }}>
                      <div>
                        <p style={{ color: C.txt, fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{item.name}</p>
                        <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>×{item.qty}</p>
                      </div>
                      <p style={{ color: C.gold, fontWeight: 600, fontSize: '13px', margin: 0 }}>{formatVND(item.price * item.qty)}</p>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                    <p style={{ color: C.txt, fontWeight: 700, fontSize: '15px', margin: 0 }}>{t.total}</p>
                    <p style={{ color: C.gold, fontWeight: 800, fontSize: '20px', margin: 0 }}>{formatVND(orderedTotal)}</p>
                  </div>
                </div>
              ) : (
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>{t.noOrder}</p>
                </div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.txt, marginBottom: '10px' }}>{t.payMethod}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {(['card', 'cash'] as const).map((method) => (
                  <button key={method} onClick={() => setPayMethod(method)} style={{ padding: '14px', borderRadius: '12px', background: payMethod === method ? C.goldD : C.surf, border: `1px solid ${payMethod === method ? C.goldM : C.bdr}`, color: payMethod === method ? C.gold : C.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {method === 'card' ? t.card : t.cash}
                  </button>
                ))}
              </div>
              <button onClick={handlePayment} disabled={orderedItems.length === 0 || loading} style={{ width: '100%', background: orderedItems.length > 0 ? C.gold : C.faint, border: 'none', color: orderedItems.length > 0 ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: orderedItems.length > 0 ? 'pointer' : 'default', fontFamily: 'inherit' }}>{t.payBtn}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}