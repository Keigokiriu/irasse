'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp, onSnapshot, getDocs, getDoc, updateDoc, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TR = {
  ja: {
    title: 'メニュー', table: 'テーブル',
    confirm: 'ご注文内容の確認', back: '← 戻る',
    placeOrder: '注文を確定する ✓', ordering: '注文中...',
    orderDone: 'ご注文を承りました', orderDoneSub: 'キッチンに送信されました。まもなくお持ちします。',
    seeReceipt: 'お会計を見る', addMore: '追加注文する',
    callTitle: 'スタッフ呼び出し', callSub: '用件を選んでボタンを押してください',
    callMemo: 'メモ（任意）詳細があれば...', callBtn: '🔔 スタッフを呼ぶ',
    callSent: 'スタッフに通知しました', callSentSub: 'まもなく参ります',
    callWater: '💧 お水をください', callOrder: '📋 注文を変更したい',
    callClean: '🧹 テーブルを拭いてほしい', callOther: '🔔 その他',
    receipt: 'お会計', orderContents: 'ご注文内容',
    noOrder: 'まだ注文がありません', payMethod: 'お支払い方法',
    card: '💳 カード', cash: '💴 現金', payBtn: '💳 この内容でお支払い',
    payWaitCash: 'スタッフが参ります',
    payWaitCashSub: 'そのままお座りのままお待ちください。\nスタッフがお伺いします。',
    payWaitCard: 'キャッシャーまでお越しください',
    payWaitCardSub: 'レジにてお支払いをお願いします。\nご来店ありがとうございました。',
    payDone: 'お支払い完了', payDoneSub: 'またのご来店をお待ちしております',
    total: '合計', confirm2: '確認する',
    categories: {
      'フード': 'フード', '一品料理': '一品料理', 'おつまみ': 'おつまみ', '前菜': '前菜',
      'ご飯・麺': 'ご飯・麺', 'ラーメン': 'ラーメン', '丼物': '丼物', 'パスタ': 'パスタ',
      '肉料理': '肉料理', '魚料理': '魚料理', '野菜料理': '野菜料理',
      'ドリンク': 'ドリンク', 'アルコール': 'アルコール', 'ノンアルコール': 'ノンアルコール',
      'ビール': 'ビール', 'ワイン': 'ワイン', 'カクテル': 'カクテル', 'サワー': 'サワー',
      'ソフトドリンク': 'ソフトドリンク', 'お茶': 'お茶', 'コーヒー': 'コーヒー',
      'デザート': 'デザート', 'スイーツ': 'スイーツ',
      'セット': 'セット', 'コース': 'コース',
      '本日のおすすめ': '本日のおすすめ', '季節限定': '季節限定',
    },
  },
  en: {
    title: 'Menu', table: 'Table',
    confirm: 'Order Confirmation', back: '← Back',
    placeOrder: 'Place Order ✓', ordering: 'Ordering...',
    orderDone: 'Order Placed!', orderDoneSub: "Sent to the kitchen. We'll bring it right out.",
    seeReceipt: 'View Bill', addMore: 'Order More',
    callTitle: 'Call Staff', callSub: 'Select a reason and tap the button',
    callMemo: 'Note (optional)', callBtn: '🔔 Call Staff',
    callSent: 'Staff has been notified', callSentSub: 'Someone will be with you shortly',
    callWater: '💧 Water please', callOrder: '📋 Change my order',
    callClean: '🧹 Clean the table', callOther: '🔔 Other',
    receipt: 'Bill', orderContents: 'Order Summary',
    noOrder: 'No orders yet', payMethod: 'Payment Method',
    card: '💳 Card', cash: '💴 Cash', payBtn: '💳 Pay Now',
    payWaitCash: 'Staff is on the way',
    payWaitCashSub: 'Please remain seated.\nA staff member will come to you.',
    payWaitCard: 'Please proceed to the cashier',
    payWaitCardSub: 'Please pay at the register.\nThank you for visiting!',
    payDone: 'Payment Complete', payDoneSub: 'Thank you! See you again 🍜',
    total: 'Total', confirm2: 'Confirm',
    categories: {
      'フード': 'Food', '一品料理': 'Dishes', 'おつまみ': 'Snacks', '前菜': 'Starters',
      'ご飯・麺': 'Rice & Noodles', 'ラーメン': 'Ramen', '丼物': 'Rice Bowls', 'パスタ': 'Pasta',
      '肉料理': 'Meat', '魚料理': 'Fish', '野菜料理': 'Vegetables',
      'ドリンク': 'Drinks', 'アルコール': 'Alcohol', 'ノンアルコール': 'Non-Alcohol',
      'ビール': 'Beer', 'ワイン': 'Wine', 'カクテル': 'Cocktails', 'サワー': 'Sours',
      'ソフトドリンク': 'Soft Drinks', 'お茶': 'Tea', 'コーヒー': 'Coffee',
      'デザート': 'Desserts', 'スイーツ': 'Sweets',
      'セット': 'Sets', 'コース': 'Course',
      '本日のおすすめ': "Today's Special", '季節限定': 'Seasonal',
    },
  },
  ko: {
    title: '메뉴', table: '테이블',
    confirm: '주문 확인', back: '← 뒤로',
    placeOrder: '주문 확정 ✓', ordering: '주문 중...',
    orderDone: '주문이 완료되었습니다', orderDoneSub: '주방에 전달되었습니다. 곧 가져다 드리겠습니다.',
    seeReceipt: '계산 보기', addMore: '추가 주문',
    callTitle: '직원 호출', callSub: '용건을 선택하고 버튼을 눌러주세요',
    callMemo: '메모 (선택사항)', callBtn: '🔔 직원 호출',
    callSent: '직원에게 알렸습니다', callSentSub: '곧 찾아뵙겠습니다',
    callWater: '💧 물 주세요', callOrder: '📋 주문 변경',
    callClean: '🧹 테이블 닦아주세요', callOther: '🔔 기타',
    receipt: '계산', orderContents: '주문 내역',
    noOrder: '아직 주문이 없습니다', payMethod: '결제 방법',
    card: '💳 카드', cash: '💴 현금', payBtn: '💳 결제하기',
    payWaitCash: '직원이 곧 갑니다',
    payWaitCashSub: '자리에 앉아서 기다려 주세요.\n직원이 찾아뵙겠습니다.',
    payWaitCard: '계산대로 오세요',
    payWaitCardSub: '계산대에서 결제해 주세요.\n감사합니다!',
    payDone: '결제 완료', payDoneSub: '또 방문해 주세요 🍜',
    total: '합계', confirm2: '확인',
    categories: {
      'フード': '푸드', '一品料理': '일품요리', 'おつまみ': '안주', '前菜': '전채',
      'ご飯・麺': '밥·면', 'ラーメン': '라멘', '丼物': '덮밥', 'パスタ': '파스타',
      '肉料理': '육류', '魚料理': '생선요리', '野菜料理': '채소요리',
      'ドリンク': '음료', 'アルコール': '주류', 'ノンアルコール': '논알코올',
      'ビール': '맥주', 'ワイン': '와인', 'カクテル': '칵테일', 'サワー': '사워',
      'ソフトドリンク': '소프트드링크', 'お茶': '차', 'コーヒー': '커피',
      'デザート': '디저트', 'スイーツ': '스위츠',
      'セット': '세트', 'コース': '코스',
      '本日のおすすめ': '오늘의 추천', '季節限定': '시즌 한정',
    },
  },
  zh: {
    title: '菜单', table: '桌号',
    confirm: '确认订单', back: '← 返回',
    placeOrder: '确认下单 ✓', ordering: '下单中...',
    orderDone: '订单已接受', orderDoneSub: '已发送到厨房，请稍候。',
    seeReceipt: '查看账单', addMore: '继续点餐',
    callTitle: '呼叫服务员', callSub: '选择需求后按下按钮',
    callMemo: '备注（可选）', callBtn: '🔔 呼叫服务员',
    callSent: '已通知服务员', callSentSub: '服务员马上过来',
    callWater: '💧 请来水', callOrder: '📋 修改订单',
    callClean: '🧹 请擦桌子', callOther: '🔔 其他',
    receipt: '账单', orderContents: '订单内容',
    noOrder: '暂无订单', payMethod: '支付方式',
    card: '💳 刷卡', cash: '💴 现金', payBtn: '💳 立即支付',
    payWaitCash: '服务员马上来',
    payWaitCashSub: '请在座位上等候。\n服务员将前来为您结账。',
    payWaitCard: '请前往收银台',
    payWaitCardSub: '请在收银台付款。\n感谢您的光临！',
    payDone: '支付完成', payDoneSub: '欢迎再次光临 🍜',
    total: '合计', confirm2: '确认',
    categories: {
      'フード': '美食', '一品料理': '单品料理', 'おつまみ': '小食', '前菜': '前菜',
      'ご飯・麺': '饭·面', 'ラーメン': '拉面', '丼物': '盖饭', 'パスタ': '意面',
      '肉料理': '肉类', '魚料理': '鱼类', '野菜料理': '蔬菜',
      'ドリンク': '饮品', 'アルコール': '酒精饮料', 'ノンアルコール': '无酒精',
      'ビール': '啤酒', 'ワイン': '红酒', 'カクテル': '鸡尾酒', 'サワー': '酸酒',
      'ソフトドリンク': '软饮料', 'お茶': '茶', 'コーヒー': '咖啡',
      'デザート': '甜点', 'スイーツ': '甜品',
      'セット': '套餐', 'コース': '套餐课程',
      '本日のおすすめ': '今日推荐', '季節限定': '季节限定',
    },
  },
};

type Lang = 'ja' | 'en' | 'ko' | 'zh';

const C = {
  bg: '#09090b', surf: '#111113', surf2: '#18181b',
  bdr: '#222226', txt: '#ffffff', muted: '#888891',
  amber: '#ff8c38', amberD: '#1c0a00', amberM: '#ff6b00', faint: '#18181b',
};

type MenuItem = { id: string; name: string; price: number; category: string; imageUrl?: string; };
type CartItem = { id: string; name: string; price: number; qty: number; };

function OrderForm() {
  const searchParams = useSearchParams();
  const tableNumber = Number(searchParams.get('table') || 1);
  const [lang, setLang] = useState<Lang>('ja');
  const t = TR[lang];
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

  const [paymentStyle, setPaymentStyle] = useState<'staff' | 'cashier'>('staff');

  const [storeName, setStoreName] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'store_status', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.paymentStyle) setPaymentStyle(data.paymentStyle);
        if (data.storeName) setStoreName(data.storeName);
        if (data.isOpen !== undefined) setIsOpen(data.isOpen);
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
      const tablesSnapshot = await getDocs(
        query(collection(db, 'tables'), where('number', '==', tableNumber))
      );
      const tableDoc = tablesSnapshot.docs[0];
      const sessionId = tableDoc?.data()?.currentSessionId || null;
      const tableId = tableDoc?.id || null;

      await addDoc(collection(db, 'orders'), {
        tableNumber, sessionId,
        items: cartItems.map((c) => `${c.name} x${c.qty}`),
        status: 'pending', createdAt: serverTimestamp(),
      });

    

      // AI退席予測を自動実行
      if (tableId && sessionId) {
        try {
          const allOrdersSnapshot = await getDocs(
            query(collection(db, 'orders'), where('sessionId', '==', sessionId))
          );
          const allItems: string[] = [];
          allOrdersSnapshot.docs.forEach((d) => {
            const data = d.data();
            if (data.items) allItems.push(...data.items);
          });
          cartItems.forEach((c) => allItems.push(`${c.name} x${c.qty}`));

          const storeSnap = await getDoc(doc(db, 'store_status', 'main'));
          const totalSeats = storeSnap.exists() ? (storeSnap.data().totalSeats || 20) : 20;
          const occupiedSeats = storeSnap.exists() ? (storeSnap.data().occupiedSeats || 0) : 0;

          const predResponse = await fetch('/api/predict-exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: allItems,
              partySize: tableDoc?.data()?.seats || 2,
              occupiedSeats,
              totalSeats,
              pastAvgMinutes: null,
            }),
          });
          const prediction = await predResponse.json();

          await updateDoc(doc(db, 'tables', tableId), {
            exitPrediction: prediction,
            exitPredictionUpdatedAt: serverTimestamp(),
          });
        } catch (predError) {
          console.error('Prediction error:', predError);
        }
      }

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

  const handlePayment = async () => {
    if (orderedItems.length === 0) return;
    setLoading(true);
    try {
        await addDoc(collection(db, 'payments'), {
            tableNumber,
            items: orderedItems.map((c) => ({ name: c.name, quantity: c.qty, price: c.price })),
            total: orderedTotal,
            payMethod,
            status: 'pending',
            createdAt: serverTimestamp(),
          });
      setPayDone(true);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const TAB_STYLE = (active: boolean) => ({
    flex: 1, padding: '10px 4px', fontSize: '12px', fontWeight: 700 as const,
    color: active ? C.amber : C.muted, background: 'transparent', border: 'none',
    borderBottom: active ? `2px solid ${C.amber}` : '2px solid transparent',
    cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif",
  });

  const callOptions = [
    { id: 'water', label: t.callWater },
    { id: 'order', label: t.callOrder },
    { id: 'clean', label: t.callClean },
    { id: 'other', label: t.callOther },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column' }}>

{!isOpen && (
  <div style={{ position: 'fixed', inset: 0, background: '#09090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '24px' }}>
    <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
    <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', textAlign: 'center' }}>
      {lang === 'ja' ? '現在営業時間外です' : lang === 'en' ? 'Currently Closed' : lang === 'ko' ? '현재 영업 시간 외입니다' : '当前非营业时间'}
    </div>
    <div style={{ fontSize: '14px', color: '#888891', textAlign: 'center' }}>
      {lang === 'ja' ? '営業時間内にまたお越しください' : lang === 'en' ? 'Please come back during business hours' : lang === 'ko' ? '영업 시간에 다시 방문해 주세요' : '请在营业时间内再次光临'}
    </div>
  </div>
)}

      {/* ヘッダー */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: C.txt }}>{storeName || 'Irasse'}</div>
          <div style={{ fontSize: '11px', color: C.muted }}>{t.table} {tableNumber}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {totalQty > 0 && activeTab === 'order' && (
            <div style={{ background: C.amberD, border: `1px solid ${C.amberM}`, borderRadius: '20px', padding: '6px 14px' }}>
              <span style={{ color: C.amber, fontSize: '12px', fontWeight: 700 }}>🛒 {totalQty}点 ¥{total.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['ja', 'en', 'ko', 'zh'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ background: lang === l ? C.amberD : C.faint, border: `1px solid ${lang === l ? C.amberM : C.bdr}`, borderRadius: '6px', padding: '4px 6px', color: lang === l ? C.amber : C.muted, fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {l === 'ja' ? '🇯🇵' : l === 'en' ? '🇺🇸' : l === 'ko' ? '🇰🇷' : '🇨🇳'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* タブ */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', flexShrink: 0 }}>
        <button style={TAB_STYLE(activeTab === 'order')} onClick={() => setActiveTab('order')}>{t.title}</button>
        <button style={TAB_STYLE(activeTab === 'call')} onClick={() => setActiveTab('call')}>{t.callTitle}</button>
        <button style={TAB_STYLE(activeTab === 'receipt')} onClick={() => setActiveTab('receipt')}>{t.receipt}</button>
      </div>

      {/* 注文タブ */}
      {activeTab === 'order' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {orderStep === 'done' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: C.txt, marginBottom: '8px' }}>{t.orderDone}</div>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '28px' }}>{t.orderDoneSub}</div>
                <button onClick={() => { setOrderStep('menu'); setActiveTab('receipt'); }}
                  style={{ background: C.amberD, border: `1px solid ${C.amberM}`, color: C.amber, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginRight: '10px' }}>
                  {t.seeReceipt}
                </button>
                <button onClick={() => setOrderStep('menu')}
                  style={{ background: 'transparent', border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: '12px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer' }}>
                  {t.addMore}
                </button>
              </div>
            </div>
          ) : orderStep === 'confirm' ? (
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
              <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setOrderStep('menu')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>{t.back}</button>
                <div style={{ fontSize: '17px', fontWeight: 800, color: C.txt }}>{t.confirm}</div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
                {cartItems.map((item) => (
  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${C.bdr}` }}>
    <div style={{ flex: 1 }}>
      <p style={{ color: C.txt, fontWeight: 700, fontSize: '14px', margin: '0 0 6px' }}>{item.name}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => sub(item.id)}
          style={{ width: '24px', height: '24px', borderRadius: '50%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: C.amber, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
        <button onClick={() => add(item.id)}
          style={{ width: '24px', height: '24px', borderRadius: '50%', background: C.amber, border: 'none', color: C.bg, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
      </div>
    </div>
    <p style={{ color: C.amber, fontWeight: 700, fontSize: '14px', margin: 0 }}>¥{(item.price * item.qty).toLocaleString()}</p>
  </div>
))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                    <p style={{ color: C.txt, fontWeight: 700, fontSize: '15px', margin: 0 }}>{t.total}</p>
                    <p style={{ color: C.amber, fontWeight: 700, fontSize: '22px', margin: 0 }}>¥{total.toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={handleOrder} disabled={loading}
                  style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '16px', fontWeight: 800, padding: '16px', borderRadius: '14px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
                  {loading ? t.ordering : t.placeOrder}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', padding: '0 12px', gap: '4px', overflowX: 'auto', flexShrink: 0 }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: '10px 16px', fontSize: '13px', fontWeight: 700,
                    color: activeCategory === cat ? C.amber : C.muted,
                    background: 'transparent', border: 'none',
                    borderBottom: activeCategory === cat ? `2px solid ${C.amber}` : '2px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Noto Sans JP', sans-serif",
                  }}>{(t.categories as Record<string, string>)[cat] || cat}</button>
                ))}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', paddingBottom: '80px' }}>
                {menuItems.filter((m) => m.category === activeCategory).map((item) => (
                  <div key={item.id} style={{ background: C.surf, border: `1px solid ${cart[item.id] > 0 ? C.amber : C.bdr}`, borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: C.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>🍽️</span>
                    )}
                  </div>
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
              {cartItems.length > 0 && (
                <div style={{ background: C.surf, borderTop: `1px solid ${C.bdr}`, padding: '12px 16px', flexShrink: 0 }}>
                  <button onClick={() => setOrderStep('confirm')}
                    style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
                    {t.confirm2}（¥{total.toLocaleString()}）
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* スタッフ呼び出しタブ */}
      {activeTab === 'call' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '14px' }}>{t.callSub}</p>
          {callOptions.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedCall(selectedCall === opt.id ? null : opt.id)}
              style={{ width: '100%', background: selectedCall === opt.id ? C.amberD : C.surf, border: `1px solid ${selectedCall === opt.id ? C.amberM : C.bdr}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', color: selectedCall === opt.id ? C.amber : C.txt, fontSize: '14px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: "'Noto Sans JP', sans-serif" }}>
              {opt.label}
            </button>
          ))}
          <textarea value={callMemo} onChange={(e) => setCallMemo(e.target.value)} placeholder={t.callMemo}
            style={{ width: '100%', background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '12px 14px', color: C.txt, fontSize: '13px', resize: 'none', height: '80px', marginTop: '4px', marginBottom: '12px', fontFamily: "'Noto Sans JP', sans-serif", outline: 'none' }} />
          {callSent ? (
            <div style={{ textAlign: 'center', padding: '16px', background: '#0a2a10', border: '1px solid #50c870', borderRadius: '12px', color: '#50c870', fontSize: '14px', fontWeight: 700 }}>
              ✅ {t.callSent}<br />
              <span style={{ fontSize: '12px', fontWeight: 400, color: C.muted }}>{t.callSentSub}</span>
            </div>
          ) : (
            <button onClick={handleCall} disabled={!selectedCall || loading}
              style={{ width: '100%', background: selectedCall ? C.amber : C.faint, border: 'none', color: selectedCall ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: selectedCall ? 'pointer' : 'default', fontFamily: "'Noto Sans JP', sans-serif" }}>
              {t.callBtn}
            </button>
          )}
        </div>
      )}

      {/* お会計タブ */}
      {activeTab === 'receipt' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {payDone ? (
  <div style={{ textAlign: 'center', padding: '50px 20px' }}>
    <div style={{ fontSize: '56px', marginBottom: '16px' }}>
      {paymentStyle === 'staff' ? '⏳' : '🏧'}
    </div>
    <div style={{ fontSize: '20px', fontWeight: 800, color: C.txt, marginBottom: '12px' }}>
      {paymentStyle === 'staff' ? t.payWaitCash : t.payWaitCard}
    </div>
    <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.8, marginBottom: '24px', whiteSpace: 'pre-line' }}>
      {paymentStyle === 'staff' ? t.payWaitCashSub : t.payWaitCardSub}
    </div>
    <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: C.muted, fontSize: '13px' }}>{t.total}</span>
        <span style={{ color: C.amber, fontSize: '22px', fontWeight: 800 }}>¥{orderedTotal.toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ color: C.muted, fontSize: '13px' }}>{t.payMethod}</span>
        <span style={{ color: C.txt, fontSize: '13px', fontWeight: 700 }}>
          {payMethod === 'cash' ? t.cash : t.card}
        </span>
      </div>
    </div>
  </div>
          ) : (
            <>
              <div style={{ fontSize: '15px', fontWeight: 700, color: C.txt, marginBottom: '14px' }}>{t.orderContents}</div>
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
                    <p style={{ color: C.txt, fontWeight: 700, fontSize: '15px', margin: 0 }}>{t.total}</p>
                    <p style={{ color: C.amber, fontWeight: 700, fontSize: '22px', margin: 0 }}>¥{orderedTotal.toLocaleString()}</p>
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
                  <button key={method} onClick={() => setPayMethod(method)}
                    style={{ padding: '14px', borderRadius: '12px', background: payMethod === method ? C.amberD : C.surf, border: `1px solid ${payMethod === method ? C.amberM : C.bdr}`, color: payMethod === method ? C.amber : C.muted, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {method === 'card' ? t.card : t.cash}
                  </button>
                ))}
              </div>
              <button onClick={handlePayment} disabled={orderedItems.length === 0 || loading}
                style={{ width: '100%', background: orderedItems.length > 0 ? C.amber : C.faint, border: 'none', color: orderedItems.length > 0 ? C.bg : C.muted, fontSize: '15px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: orderedItems.length > 0 ? 'pointer' : 'default', fontFamily: "'Noto Sans JP', sans-serif" }}>
                {t.payBtn}
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