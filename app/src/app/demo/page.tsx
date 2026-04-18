'use client';

import { useState } from 'react';

const C = { bg: '#09090b', surf: '#111113', bdr: '#222226', txt: '#ffffff', muted: '#888891', amber: '#ff8c38', amberD: '#1c0a00', amberM: '#ff6b00', faint: '#18181b' };
const N = { bg: '#0f172a', surf: '#1e293b', bdr: '#334155', txt: '#f1f5f9', muted: '#64748b', accent: '#f97316' };

const MENU = {
  'フード': [
    { id: '1', name: '特製ラーメン', price: 980, emoji: '🍜' },
    { id: '2', name: '餃子（6個）', price: 450, emoji: '🥟' },
    { id: '3', name: 'チャーハン', price: 750, emoji: '🍚' },
    { id: '4', name: '唐揚げ', price: 550, emoji: '🍗' },
  ],
  'ドリンク': [
    { id: '5', name: 'ビール', price: 500, emoji: '🍺' },
    { id: '6', name: 'ウーロン茶', price: 250, emoji: '🍵' },
    { id: '7', name: 'サワー', price: 450, emoji: '🍋' },
  ],
  'デザート': [
    { id: '8', name: '杏仁豆腐', price: 350, emoji: '🍮' },
  ],
};

type Lang = 'ja' | 'en' | 'ko' | 'zh';
const TR: Record<Lang, Record<string, string>> = {
  ja: { menu: 'メニュー', table: 'テーブル', order: '注文', call: 'スタッフ呼び出し', receipt: 'お会計', confirm: '確認する', total: '合計', placeOrder: '注文を確定する ✓', orderDone: 'ご注文を承りました', orderDoneSub: 'キッチンに送信されました', seeReceipt: 'お会計を見る', addMore: '追加注文する', callSub: '用件を選んでください', callBtn: '🔔 スタッフを呼ぶ', callSent: 'スタッフに通知しました', payMethod: 'お支払い方法', card: '💳 カード', cash: '💴 現金', payBtn: '💳 お支払い', payDone: 'お支払い完了', payDoneSub: 'またのご来店をお待ちしております', noOrder: 'まだ注文がありません', back: '← 戻る', water: '💧 お水をください', change: '📋 注文を変更したい', clean: '🧹 テーブルを拭いてほしい', other: '🔔 その他', congestion: '現在の混雑状況', crowded: '🔴 混雑', moderate: '🟡 やや混雑', available: '🟢 余裕あり', enterNow: 'このまま入店して注文する →', full: '❌ 現在満席です', waitingList: 'ウェイティングリスト', joinWait: '📋 ウェイティングリストに追加する', registerTitle: '順番待ちに登録', yourName: 'お名前', partySize: '人数', register: '登録する', currentPos: '現在の順番', posSuffix: '番目', estWait: '待ち時間の目安', waitNote: '順番が来たら通知が届きます', seatReady: 'お席の準備ができました！', enterOrder: '入店して注文する →', scanQR: 'QRコードを読み取る', scanSub: 'テーブルのQRコードをスキャンしてください', scanning: 'スキャン中...', scanDone: 'スキャン完了！' },
  en: { menu: 'Menu', table: 'Table', order: 'Order', call: 'Call Staff', receipt: 'Bill', confirm: 'Confirm', total: 'Total', placeOrder: 'Place Order ✓', orderDone: 'Order Placed!', orderDoneSub: 'Sent to the kitchen', seeReceipt: 'View Bill', addMore: 'Order More', callSub: 'Select a reason', callBtn: '🔔 Call Staff', callSent: 'Staff notified', payMethod: 'Payment', card: '💳 Card', cash: '💴 Cash', payBtn: '💳 Pay Now', payDone: 'Payment Complete', payDoneSub: 'Thank you! See you again 🍜', noOrder: 'No orders yet', back: '← Back', water: '💧 Water please', change: '📋 Change order', clean: '🧹 Clean table', other: '🔔 Other', congestion: 'Availability', crowded: '🔴 Busy', moderate: '🟡 Moderate', available: '🟢 Available', enterNow: 'Enter & Order →', full: '❌ Currently Full', waitingList: 'Waiting List', joinWait: '📋 Join Waiting List', registerTitle: 'Join Waitlist', yourName: 'Name', partySize: 'Party', register: 'Join', currentPos: 'Position', posSuffix: '', estWait: 'Est. Wait', waitNote: "We'll notify you when ready", seatReady: 'Your table is ready!', enterOrder: 'Enter & Order →', scanQR: 'Scan QR Code', scanSub: 'Scan the QR code on your table', scanning: 'Scanning...', scanDone: 'Scan Complete!' },
  ko: { menu: '메뉴', table: '테이블', order: '주문', call: '직원 호출', receipt: '계산', confirm: '확인', total: '합계', placeOrder: '주문 확정 ✓', orderDone: '주문 완료', orderDoneSub: '주방에 전달되었습니다', seeReceipt: '계산 보기', addMore: '추가 주문', callSub: '용건을 선택하세요', callBtn: '🔔 직원 호출', callSent: '직원에게 알렸습니다', payMethod: '결제 방법', card: '💳 카드', cash: '💴 현금', payBtn: '💳 결제하기', payDone: '결제 완료', payDoneSub: '또 방문해 주세요 🍜', noOrder: '아직 주문이 없습니다', back: '← 뒤로', water: '💧 물 주세요', change: '📋 주문 변경', clean: '🧹 테이블 닦기', other: '🔔 기타', congestion: '혼잡 상황', crowded: '🔴 혼잡', moderate: '🟡 보통', available: '🟢 여유', enterNow: '입장하여 주문 →', full: '❌ 만석', waitingList: '웨이팅', joinWait: '📋 웨이팅 등록', registerTitle: '대기 등록', yourName: '성함', partySize: '인원', register: '등록', currentPos: '순서', posSuffix: '번째', estWait: '예상 대기', waitNote: '순서가 되면 알림이 옵니다', seatReady: '자리가 준비되었습니다!', enterOrder: '입장하여 주문 →', scanQR: 'QR 스캔', scanSub: '테이블의 QR코드를 스캔하세요', scanning: '스캔 중...', scanDone: '스캔 완료!' },
  zh: { menu: '菜单', table: '桌号', order: '点餐', call: '呼叫服务员', receipt: '账单', confirm: '确认', total: '合计', placeOrder: '确认下单 ✓', orderDone: '订单已接受', orderDoneSub: '已发送到厨房', seeReceipt: '查看账单', addMore: '继续点餐', callSub: '选择需求', callBtn: '🔔 呼叫服务员', callSent: '已通知服务员', payMethod: '支付方式', card: '💳 刷卡', cash: '💴 现金', payBtn: '💳 支付', payDone: '支付完成', payDoneSub: '欢迎再次光临 🍜', noOrder: '暂无订单', back: '← 返回', water: '💧 请来水', change: '📋 修改订单', clean: '🧹 请擦桌子', other: '🔔 其他', congestion: '拥挤状况', crowded: '🔴 拥挤', moderate: '🟡 较忙', available: '🟢 宽松', enterNow: '入座点餐 →', full: '❌ 已满座', waitingList: '等位列表', joinWait: '📋 加入等位', registerTitle: '等位登记', yourName: '姓名', partySize: '人数', register: '登记', currentPos: '当前顺序', posSuffix: '号', estWait: '预计等待', waitNote: '轮到您时会收到通知', seatReady: '座位已准备好！', enterOrder: '入座点餐 →', scanQR: '扫描二维码', scanSub: '请扫描桌上的二维码', scanning: '扫描中...', scanDone: '扫描完成！' },
};

type SharedState = {
  orders: { id: string; tableNumber: number; items: string[]; status: string; time: string }[];
  calls: { id: string; tableNumber: number; reason: string; time: string; status: string }[];
  waitlist: { id: string; name: string; partySize: number; status: string }[];
  tableStatus: 'empty' | 'occupied' | 'billing' | 'paid';
  occupiedSeats: number;
  setOrders: (v: any) => void;
  setCalls: (v: any) => void;
  setWaitlist: (v: any) => void;
  setTableStatus: (v: any) => void;
  setOccupiedSeats: (v: number) => void;
};

// ── 客側コンポーネント ──
function CustomerView({ shared }: { shared: SharedState }) {
  const [lang, setLang] = useState<Lang>('ja');
  const t = TR[lang];
  const [screen, setScreen] = useState<'qr' | 'congestion' | 'waitRegister' | 'waiting' | 'order'>('qr');
  const [activeTab, setActiveTab] = useState<'order' | 'call' | 'receipt'>('order');
  const [activeCat, setActiveCat] = useState('フード');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderStep, setOrderStep] = useState<'menu' | 'confirm' | 'done'>('menu');
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [callSent, setCallSent] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'cash'>('card');
  const [payDone, setPayDone] = useState(false);
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [myName, setMyName] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [myPosition, setMyPosition] = useState(0);

  const tableNumber = 3;
  const categories = Object.keys(MENU);
  const currentItems = MENU[activeCat as keyof typeof MENU] || [];
  const cartItems = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => {
    for (const items of Object.values(MENU)) {
      const found = items.find((i) => i.id === id);
      if (found) return { ...found, qty };
    }
    return null;
  }).filter(Boolean) as any[];
  const total = cartItems.reduce((s: number, c: any) => s + c.price * c.qty, 0);
  const totalQty = Object.values(cart).reduce((s, v) => s + v, 0);
  const congestionRate = shared.occupiedSeats / 20;
  const congestionLabel = congestionRate >= 0.9 ? t.crowded : congestionRate >= 0.6 ? t.moderate : t.available;
  const congestionColor = congestionRate >= 0.9 ? '#ef4444' : congestionRate >= 0.6 ? '#f59e0b' : '#22c55e';
  const availableSeats = 20 - shared.occupiedSeats;
  const waitingList = shared.waitlist.filter((e) => e.status === 'waiting');
  const myEntry = shared.waitlist.find((e) => e.name === myName && e.status !== 'seated');

  const TAB = (active: boolean) => ({ flex: 1, padding: '8px 4px', fontSize: '10px', fontWeight: 700 as const, color: active ? C.amber : C.muted, background: 'transparent', border: 'none', borderBottom: active ? `2px solid ${C.amber}` : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit' });

  const LangBtns = () => (
    <div style={{ display: 'flex', gap: '3px' }}>
      {(['ja', 'en', 'ko', 'zh'] as Lang[]).map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? C.amberD : C.faint, border: `1px solid ${lang === l ? C.amberM : C.bdr}`, borderRadius: '4px', padding: '2px 4px', color: lang === l ? C.amber : C.muted, fontSize: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {l === 'ja' ? '🇯🇵' : l === 'en' ? '🇺🇸' : l === 'ko' ? '🇰🇷' : '🇨🇳'}
        </button>
      ))}
    </div>
  );

  // ── QRスキャン画面 ──
  if (screen === 'qr') return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: C.txt, fontSize: '14px', fontWeight: 800 }}>麺屋 雅</span>
        <LangBtns />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <div style={{ color: C.txt, fontSize: '16px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>{t.scanQR}</div>
        <div style={{ color: C.muted, fontSize: '12px', marginBottom: '32px', textAlign: 'center' }}>{t.scanSub}</div>

        {/* QRコードのビジュアル */}
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {[1,1,1,1,1,1,1, 1,0,0,0,0,0,1, 1,0,1,1,1,0,1, 1,0,1,0,1,0,1, 1,0,1,1,1,0,1, 1,0,0,0,0,0,1, 1,1,1,1,1,1,1].map((v, i) => (
              <div key={i} style={{ width: '8px', height: '8px', background: v ? '#000' : '#fff' }} />
            ))}
          </div>
        </div>

        <button
          onClick={() => { setScanning(true); setTimeout(() => { setScanning(false); setScreen('congestion'); }, 1500); }}
          disabled={scanning}
          style={{ width: '100%', background: scanning ? C.faint : C.amber, border: 'none', color: scanning ? C.muted : C.bg, fontSize: '14px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: scanning ? 'default' : 'pointer', fontFamily: 'inherit' }}>
          {scanning ? t.scanning : t.scanDone + ' (タップで体験)'}
        </button>
      </div>
    </div>
  );

  // ── 混雑状況画面 ──
  if (screen === 'congestion') return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: C.txt, fontSize: '14px', fontWeight: 800 }}>麺屋 雅</div>
          <div style={{ color: C.muted, fontSize: '9px' }}>{t.congestion}</div>
        </div>
        <LangBtns />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: C.txt }}>{congestionLabel}</span>
            <span style={{ background: C.faint, border: `1px solid ${congestionColor}`, borderRadius: '16px', padding: '3px 10px', color: congestionColor, fontSize: '11px', fontWeight: 700 }}>
              {shared.occupiedSeats} / 20 席
            </span>
          </div>
          <div style={{ background: C.faint, borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '6px', background: congestionColor, width: `${congestionRate * 100}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {availableSeats > 0 ? (
          <button onClick={() => { setScreen('order'); shared.setTableStatus('occupied'); shared.setOccupiedSeats(shared.occupiedSeats + 1); }}
            style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '14px', fontWeight: 800, padding: '14px', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px', fontFamily: 'inherit' }}>
            {t.enterNow}
          </button>
        ) : (
          <div style={{ background: '#1a0000', border: '1px solid #ef4444', borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '10px' }}>
            <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700, margin: 0 }}>{t.full}</p>
          </div>
        )}

        {waitingList.length > 0 && (
          <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: C.txt, marginBottom: '8px' }}>{t.waitingList}</div>
            {waitingList.slice(0, 3).map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < waitingList.length - 1 ? `1px solid ${C.bdr}` : 'none' }}>
                <span style={{ color: C.txt, fontSize: '12px' }}>{entry.name} 様（{entry.partySize}名）</span>
                <span style={{ color: i === 0 ? C.amber : C.muted, fontSize: '11px', fontWeight: 700 }}>{i + 1}番目</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setScreen('waitRegister')}
          style={{ width: '100%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '13px', fontWeight: 700, padding: '12px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {t.joinWait}
        </button>
      </div>
    </div>
  );

  // ── 待ち行列登録 ──
  if (screen === 'waitRegister') return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setScreen('congestion')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>{t.back}</button>
          <span style={{ color: C.txt, fontSize: '13px', fontWeight: 800 }}>{t.registerTitle}</span>
        </div>
        <LangBtns />
      </div>
      <div style={{ padding: '16px', flex: 1 }}>
        <label style={{ color: C.muted, fontSize: '11px', display: 'block', marginBottom: '6px' }}>{t.yourName}</label>
        <input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="例：田中"
          style={{ width: '100%', background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '10px', padding: '10px 12px', color: C.txt, fontSize: '13px', outline: 'none', fontFamily: 'inherit', marginBottom: '14px', boxSizing: 'border-box' as const }} />
        <label style={{ color: C.muted, fontSize: '11px', display: 'block', marginBottom: '6px' }}>{t.partySize}</label>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} onClick={() => setPartySize(n)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', background: partySize === n ? C.amberD : C.surf, border: `1px solid ${partySize === n ? C.amberM : C.bdr}`, color: partySize === n ? C.amber : C.muted, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {n}
            </button>
          ))}
        </div>
        <button onClick={() => {
          const name = myName || '田中';
          const pos = waitingList.length + 1;
          shared.setWaitlist([...shared.waitlist, { id: Date.now().toString(), name, partySize, status: 'waiting' }]);
          setMyPosition(pos);
          setMyName(name);
          setScreen('waiting');
        }} disabled={!myName.trim()}
          style={{ width: '100%', background: myName.trim() ? C.amber : C.faint, border: 'none', color: myName.trim() ? C.bg : C.muted, fontSize: '13px', fontWeight: 800, padding: '12px', borderRadius: '10px', cursor: myName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          {t.register}
        </button>
      </div>
    </div>
  );

  // ── 待ち中画面 ──
  if (screen === 'waiting') {
    const currentPos = myEntry?.status === 'ready' ? 0 : waitingList.findIndex((e) => e.name === myName) + 1;
    return (
      <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
        <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.txt, fontSize: '14px', fontWeight: 800 }}>麺屋 雅</span>
          <LangBtns />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {myEntry?.status === 'ready' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: C.txt, marginBottom: '6px' }}>{t.seatReady}</div>
              <button onClick={() => { setScreen('order'); shared.setTableStatus('occupied'); shared.setOccupiedSeats(shared.occupiedSeats + 1); }}
                style={{ background: C.amber, border: 'none', color: C.bg, fontSize: '13px', fontWeight: 800, padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '12px' }}>
                {t.enterOrder}
              </button>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: C.muted, marginBottom: '6px' }}>{t.currentPos}</div>
                <div style={{ fontSize: '56px', fontWeight: 800, color: C.amber, lineHeight: 1 }}>{currentPos}</div>
                <div style={{ fontSize: '13px', color: C.muted }}>{t.posSuffix}</div>
              </div>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '12px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: C.muted, fontSize: '11px' }}>{t.estWait}</span>
                  <span style={{ color: C.amber, fontSize: '11px', fontWeight: 700 }}>約{currentPos * 15}分</span>
                </div>
                <p style={{ color: C.muted, fontSize: '10px', margin: 0, textAlign: 'center' }}>{t.waitNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 注文画面（メイン）──
  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: C.txt }}>麺屋 雅</div>
          <div style={{ fontSize: '9px', color: C.muted }}>{t.table} {tableNumber}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalQty > 0 && activeTab === 'order' && (
            <div style={{ background: C.amberD, border: `1px solid ${C.amberM}`, borderRadius: '14px', padding: '3px 8px' }}>
              <span style={{ color: C.amber, fontSize: '9px', fontWeight: 700 }}>🛒 ¥{total.toLocaleString()}</span>
            </div>
          )}
          <LangBtns />
        </div>
      </div>

      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', flexShrink: 0 }}>
        <button style={TAB(activeTab === 'order')} onClick={() => setActiveTab('order')}>{t.order}</button>
        <button style={TAB(activeTab === 'call')} onClick={() => setActiveTab('call')}>{t.call}</button>
        <button style={TAB(activeTab === 'receipt')} onClick={() => setActiveTab('receipt')}>{t.receipt}</button>
      </div>

      {activeTab === 'order' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {orderStep === 'done' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: C.txt, marginBottom: '4px' }}>{t.orderDone}</div>
                <div style={{ fontSize: '11px', color: C.muted, marginBottom: '16px' }}>{t.orderDoneSub}</div>
                <button onClick={() => { setOrderStep('menu'); setActiveTab('receipt'); }}
                  style={{ background: C.amberD, border: `1px solid ${C.amberM}`, color: C.amber, borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginRight: '6px', fontFamily: 'inherit' }}>{t.seeReceipt}</button>
                <button onClick={() => setOrderStep('menu')}
                  style={{ background: 'transparent', border: `1px solid ${C.bdr}`, color: C.muted, borderRadius: '8px', padding: '8px 16px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>{t.addMore}</button>
              </div>
            </div>
          ) : orderStep === 'confirm' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <button onClick={() => setOrderStep('menu')} style={{ background: 'transparent', border: 'none', color: C.amber, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>{t.back}</button>
                <span style={{ color: C.txt, fontSize: '13px', fontWeight: 800 }}>ご注文内容の確認</span>
              </div>
              <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                {cartItems.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${C.bdr}` }}>
                    <span style={{ color: C.txt, fontSize: '12px' }}>{item.emoji} {item.name} ×{item.qty}</span>
                    <span style={{ color: C.amber, fontSize: '12px', fontWeight: 700 }}>¥{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
                  <span style={{ color: C.txt, fontSize: '12px', fontWeight: 700 }}>{t.total}</span>
                  <span style={{ color: C.amber, fontSize: '18px', fontWeight: 800 }}>¥{total.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => {
                const items = cartItems.map((c: any) => `${c.name} x${c.qty}`);
                shared.setOrders([{ id: Date.now().toString(), tableNumber, items, status: 'pending', time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }, ...shared.orders]);
                setOrderedItems(cartItems);
                setOrderedTotal(total);
                setOrderStep('done');
                setCart({});
              }} style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '13px', fontWeight: 800, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.placeOrder}
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: C.surf, borderBottom: `1px solid ${C.bdr}`, display: 'flex', padding: '0 8px', flexShrink: 0 }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCat(cat)} style={{ padding: '7px 10px', fontSize: '10px', fontWeight: 700, color: activeCat === cat ? C.amber : C.muted, background: 'transparent', border: 'none', borderBottom: activeCat === cat ? `2px solid ${C.amber}` : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{cat}</button>
                ))}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {currentItems.map((item) => (
                  <div key={item.id} style={{ background: C.surf, border: `1px solid ${cart[item.id] > 0 ? C.amber : C.bdr}`, borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: C.txt, fontWeight: 700, fontSize: '12px', margin: '0 0 2px' }}>{item.name}</p>
                      <p style={{ color: C.amber, fontWeight: 700, fontSize: '11px', margin: 0 }}>¥{item.price.toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button onClick={() => setCart((c) => ({ ...c, [item.id]: Math.max((c[item.id] || 0) - 1, 0) }))} style={{ width: '22px', height: '22px', borderRadius: '50%', background: C.faint, border: `1px solid ${C.bdr}`, color: C.txt, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: cart[item.id] > 0 ? C.amber : C.muted, minWidth: '12px', textAlign: 'center' }}>{cart[item.id] || 0}</span>
                      <button onClick={() => setCart((c) => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }))} style={{ width: '22px', height: '22px', borderRadius: '50%', background: C.amber, border: 'none', color: C.bg, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              {cartItems.length > 0 && (
                <div style={{ background: C.surf, borderTop: `1px solid ${C.bdr}`, padding: '8px 10px', flexShrink: 0 }}>
                  <button onClick={() => setOrderStep('confirm')} style={{ width: '100%', background: C.amber, border: 'none', color: C.bg, fontSize: '12px', fontWeight: 800, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.confirm}（¥{total.toLocaleString()}）
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'call' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <p style={{ color: C.muted, fontSize: '11px', marginBottom: '10px' }}>{t.callSub}</p>
          {[t.water, t.change, t.clean, t.other].map((label, i) => (
            <button key={i} onClick={() => setSelectedCall(label)}
              style={{ width: '100%', background: selectedCall === label ? C.amberD : C.surf, border: `1px solid ${selectedCall === label ? C.amberM : C.bdr}`, borderRadius: '8px', padding: '10px 12px', marginBottom: '5px', color: selectedCall === label ? C.amber : C.txt, fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
          {callSent ? (
            <div style={{ textAlign: 'center', padding: '12px', background: '#0a2a10', border: '1px solid #50c870', borderRadius: '8px', color: '#50c870', fontSize: '12px', fontWeight: 700, marginTop: '8px' }}>✅ {t.callSent}</div>
          ) : (
            <button onClick={() => {
              if (selectedCall) {
                shared.setCalls([{ id: Date.now().toString(), tableNumber, reason: selectedCall, time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }), status: 'pending' }, ...shared.calls]);
                setCallSent(true);
                setTimeout(() => { setCallSent(false); setSelectedCall(null); }, 3000);
              }
            }} disabled={!selectedCall}
              style={{ width: '100%', background: selectedCall ? C.amber : C.faint, border: 'none', color: selectedCall ? C.bg : C.muted, fontSize: '12px', fontWeight: 800, padding: '10px', borderRadius: '8px', cursor: selectedCall ? 'pointer' : 'default', marginTop: '8px', fontFamily: 'inherit' }}>
              {t.callBtn}
            </button>
          )}
        </div>
      )}

      {activeTab === 'receipt' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {payDone ? (
  <div style={{ textAlign: 'center', padding: '30px 12px' }}>
    <div style={{ fontSize: '40px', marginBottom: '10px' }}>
      {payMethod === 'cash' ? '⏳' : '🏧'}
    </div>
    <div style={{ fontSize: '15px', fontWeight: 800, color: C.txt, marginBottom: '6px' }}>
      {payMethod === 'cash' ? 'スタッフが参ります' : 'キャッシャーまでお越しください'}
    </div>
    <div style={{ fontSize: '11px', color: C.muted, lineHeight: 1.7, marginBottom: '14px', whiteSpace: 'pre-line' }}>
      {payMethod === 'cash'
        ? 'そのままお座りのままお待ちください。\nスタッフがお伺いします。'
        : 'レジにてお支払いをお願いします。\nご来店ありがとうございました。'}
    </div>
    <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '10px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: C.muted, fontSize: '11px' }}>合計</span>
        <span style={{ color: C.amber, fontSize: '16px', fontWeight: 800 }}>¥{orderedTotal.toLocaleString()}</span>
      </div>
    </div>
  </div>
          ) : (
            <>
              {orderedItems.length > 0 ? (
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                  {orderedItems.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${C.bdr}` }}>
                      <span style={{ color: C.txt, fontSize: '11px' }}>{item.name} ×{item.qty}</span>
                      <span style={{ color: C.amber, fontSize: '11px', fontWeight: 700 }}>¥{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
                    <span style={{ color: C.txt, fontSize: '12px', fontWeight: 700 }}>{t.total}</span>
                    <span style={{ color: C.amber, fontSize: '18px', fontWeight: 800 }}>¥{orderedTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '10px' }}>
                  <p style={{ color: C.muted, fontSize: '11px', margin: 0 }}>{t.noOrder}</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                {(['card', 'cash'] as const).map((m) => (
                  <button key={m} onClick={() => setPayMethod(m)} style={{ padding: '10px', borderRadius: '8px', background: payMethod === m ? C.amberD : C.surf, border: `1px solid ${payMethod === m ? C.amberM : C.bdr}`, color: payMethod === m ? C.amber : C.muted, fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {m === 'card' ? t.card : t.cash}
                  </button>
                ))}
              </div>
              <button onClick={() => { setPayDone(true); shared.setTableStatus('billing'); }} disabled={orderedItems.length === 0}
                style={{ width: '100%', background: orderedItems.length > 0 ? C.amber : C.faint, border: 'none', color: orderedItems.length > 0 ? C.bg : C.muted, fontSize: '12px', fontWeight: 800, padding: '10px', borderRadius: '8px', cursor: orderedItems.length > 0 ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                {t.payBtn}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
// ── 店側コンポーネント ──
function StoreView({ shared }: { shared: SharedState }) {
    const [activeTab, setActiveTab] = useState<'tables' | 'orders' | 'calls' | 'kitchen' | 'sales'>('tables');
  
    const TAB = (active: boolean) => ({ flex: 1, padding: '8px 4px', fontSize: '9px', fontWeight: 700 as const, color: active ? N.accent : N.muted, background: 'transparent', border: 'none', borderBottom: active ? `2px solid ${N.accent}` : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit' });
  
    const pendingOrders = shared.orders.filter((o) => o.status === 'pending');
    const pendingCalls = shared.calls.filter((c) => c.status === 'pending');
    const waitingList = shared.waitlist.filter((e) => e.status === 'waiting');
    const readyList = shared.waitlist.filter((e) => e.status === 'ready');
  
    const STATUS_LABEL: Record<string, string> = { empty: '空席', occupied: '着席中', billing: '会計待ち', paid: '会計済・案内OK' };
    const STATUS_COLOR: Record<string, string> = { empty: '#22c55e', occupied: '#3b82f6', billing: '#f59e0b', paid: '#f97316' };
    const STATUS_BG: Record<string, string> = { empty: '#052e16', occupied: '#1e3a5f', billing: '#2a1f08', paid: '#1c0a00' };
    const NEXT_LABEL: Record<string, string> = { empty: '着席 →', occupied: '会計待ち →', billing: '会計済み →', paid: '退店済み・案内OK →' };
  
    const totalSales = shared.orders.filter((o) => o.status === 'done').reduce((sum, o) => {
      return sum + o.items.reduce((s, item) => {
        const match = item.match(/^(.+) x(\d+)$/);
        if (!match) return s;
        const found = Object.values(MENU).flat().find((m) => m.name === match[1]);
        return s + (found ? found.price * Number(match[2]) : 0);
      }, 0);
    }, 0);
  
    const menuStats: Record<string, { qty: number; total: number }> = {};
    shared.orders.filter((o) => o.status === 'done').forEach((o) => {
      o.items.forEach((item) => {
        const match = item.match(/^(.+) x(\d+)$/);
        if (!match) return;
        const found = Object.values(MENU).flat().find((m) => m.name === match[1]);
        if (!found) return;
        if (!menuStats[match[1]]) menuStats[match[1]] = { qty: 0, total: 0 };
        menuStats[match[1]].qty += Number(match[2]);
        menuStats[match[1]].total += found.price * Number(match[2]);
      });
    });
    const menuRanking = Object.entries(menuStats).sort((a, b) => b[1].total - a[1].total);
  
    return (
      <div style={{ background: N.bg, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'inherit', color: N.txt }}>
        <div style={{ background: N.surf, borderBottom: `1px solid ${N.bdr}`, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 800 }}>麺屋 雅 — 管理</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {pendingOrders.length > 0 && <span style={{ background: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '2px 6px', fontSize: '9px', fontWeight: 700 }}>注文 {pendingOrders.length}</span>}
            {pendingCalls.length > 0 && <span style={{ background: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', padding: '2px 6px', fontSize: '9px', fontWeight: 700 }}>呼出 {pendingCalls.length}</span>}
          </div>
        </div>
  
        <div style={{ background: N.surf, borderBottom: `1px solid ${N.bdr}`, display: 'flex', flexShrink: 0 }}>
          <button style={TAB(activeTab === 'tables')} onClick={() => setActiveTab('tables')}>テーブル</button>
          <button style={TAB(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>
            注文{pendingOrders.length > 0 && <span style={{ color: '#ef4444' }}> {pendingOrders.length}</span>}
          </button>
          <button style={TAB(activeTab === 'calls')} onClick={() => setActiveTab('calls')}>
            呼出{pendingCalls.length > 0 && <span style={{ color: '#ef4444' }}> {pendingCalls.length}</span>}
          </button>
          <button style={TAB(activeTab === 'kitchen')} onClick={() => setActiveTab('kitchen')}>キッチン</button>
          <button style={TAB(activeTab === 'sales')} onClick={() => setActiveTab('sales')}>売上</button>
        </div>
  
        {/* テーブル管理 */}
        {activeTab === 'tables' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {shared.tableStatus === 'billing' && (
              <div style={{ background: '#2a1f08', border: '1px solid #f59e0b', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💳</span>
                <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>テーブル3が会計待ちです</span>
              </div>
            )}
            {shared.tableStatus === 'paid' && (
              <div style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span style={{ color: '#f97316', fontSize: '12px', fontWeight: 700 }}>テーブル3が案内OKです</span>
              </div>
            )}
  
            {/* 待ち行列 */}
            {(waitingList.length > 0 || readyList.length > 0) && (
              <div style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: N.txt, marginBottom: '8px' }}>
                  待ち行列 {waitingList.length > 0 && <span style={{ color: '#ef4444' }}>({waitingList.length}組)</span>}
                </div>
                {readyList.map((entry) => (
                  <div key={entry.id} style={{ background: '#052e16', border: '1px solid #22c55e', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f1f5f9', fontSize: '11px', fontWeight: 700 }}>🔔 {entry.name} 様（{entry.partySize}名）案内中</span>
                    <button onClick={() => shared.setWaitlist(shared.waitlist.map((e) => e.id === entry.id ? { ...e, status: 'seated' } : e))}
                      style={{ background: '#22c55e', border: 'none', color: '#000', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      着席済み ✓
                    </button>
                  </div>
                ))}
                {waitingList.slice(0, 3).map((entry, i) => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${N.bdr}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: i === 0 ? N.accent : '#334155', color: '#fff', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', fontWeight: 700 }}>{i + 1}番</span>
                      <span style={{ color: N.txt, fontSize: '11px' }}>{entry.name} 様（{entry.partySize}名）</span>
                    </div>
                    {i === 0 && (
                      <button onClick={() => shared.setWaitlist(shared.waitlist.map((e) => e.id === entry.id ? { ...e, status: 'ready' } : e))}
                        style={{ background: N.accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        案内する 🔔
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
  
            {/* テーブルカード */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { num: 1, status: 'empty' },
                { num: 2, status: 'occupied' },
                { num: 3, status: shared.tableStatus },
                { num: 4, status: 'empty' },
              ].map((table) => (
                <div key={table.num} style={{ background: STATUS_BG[table.status], border: `1px solid ${STATUS_COLOR[table.status]}`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ color: N.txt, fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>{table.num}</div>
                  <div style={{ background: STATUS_COLOR[table.status] + '22', borderRadius: '6px', padding: '3px 6px', marginBottom: '8px' }}>
                    <span style={{ color: STATUS_COLOR[table.status], fontSize: '9px', fontWeight: 700 }}>{STATUS_LABEL[table.status]}</span>
                  </div>
                  {table.num === 3 && (
                    <button onClick={() => {
                      const next = { empty: 'occupied', occupied: 'billing', billing: 'paid', paid: 'empty' }[shared.tableStatus] as any;
                      shared.setTableStatus(next);
                      if (next === 'occupied') shared.setOccupiedSeats(shared.occupiedSeats + 1);
                      if (next === 'empty') shared.setOccupiedSeats(Math.max(0, shared.occupiedSeats - 1));
                    }}
                      style={{ width: '100%', background: STATUS_COLOR[table.status], border: 'none', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '5px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {NEXT_LABEL[shared.tableStatus]}
                    </button>
                  )}
                </div>
              ))}
            </div>
  
            {/* 混雑状況 */}
            <div style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '10px 12px', marginTop: '10px' }}>
              <div style={{ fontSize: '10px', color: N.muted, marginBottom: '6px' }}>着席数を調整</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => shared.setOccupiedSeats(Math.max(0, shared.occupiedSeats - 1))}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#334155', border: 'none', color: N.txt, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                <span style={{ color: N.accent, fontSize: '16px', fontWeight: 700 }}>{shared.occupiedSeats}</span>
                <button onClick={() => shared.setOccupiedSeats(Math.min(20, shared.occupiedSeats + 1))}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', background: N.accent, border: 'none', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                <span style={{ color: N.muted, fontSize: '10px' }}>/ 20席</span>
              </div>
            </div>
          </div>
        )}
  
        {/* 注文管理 */}
        {activeTab === 'orders' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {shared.orders.length === 0 ? (
              <div style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: N.muted, fontSize: '12px', margin: 0 }}>注文はありません</p>
              </div>
            ) : shared.orders.map((order) => (
              <div key={order.id} style={{ background: N.surf, border: `1px solid ${order.status === 'pending' ? '#ef4444' : order.status === 'preparing' ? '#f59e0b' : N.bdr}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: N.accent, color: '#fff', borderRadius: '5px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>テーブル {order.tableNumber}</span>
                    <span style={{ color: N.muted, fontSize: '10px' }}>{order.time}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: order.status === 'pending' ? '#ef4444' : order.status === 'preparing' ? '#f59e0b' : '#22c55e' }}>
                    {order.status === 'pending' ? '未対応' : order.status === 'preparing' ? '調理中' : '完了'}
                  </span>
                </div>
                <p style={{ color: N.txt, fontSize: '11px', margin: '0 0 6px' }}>{order.items.join('、')}</p>
                {order.status !== 'done' && (
                  <button onClick={() => shared.setOrders(shared.orders.map((o) => o.id === order.id ? { ...o, status: o.status === 'pending' ? 'preparing' : 'done' } : o))}
                    style={{ background: N.accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '5px 12px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {order.status === 'pending' ? '調理開始 →' : '完了 ✓'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
  
        {/* 呼び出し */}
        {activeTab === 'calls' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {pendingCalls.length === 0 ? (
              <div style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: N.muted, fontSize: '12px', margin: 0 }}>未対応の呼び出しはありません ✅</p>
              </div>
            ) : pendingCalls.map((call) => (
              <div key={call.id} style={{ background: N.surf, border: '1px solid #ef4444', borderRadius: '10px', padding: '10px 12px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ background: N.accent, color: '#fff', borderRadius: '5px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>テーブル {call.tableNumber}</span>
                    <span style={{ color: N.muted, fontSize: '10px' }}>{call.time}</span>
                  </div>
                  <p style={{ color: N.txt, fontSize: '12px', fontWeight: 700, margin: 0 }}>{call.reason}</p>
                </div>
                <button onClick={() => shared.setCalls(shared.calls.map((c) => c.id === call.id ? { ...c, status: 'done' } : c))}
                  style={{ background: N.accent, border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                  対応済み ✓
                </button>
              </div>
            ))}
            {shared.calls.filter((c) => c.status === 'done').map((call) => (
              <div key={call.id} style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '8px 12px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                <span style={{ background: '#334155', color: N.muted, borderRadius: '5px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>テーブル {call.tableNumber}</span>
                <span style={{ color: N.muted, fontSize: '11px', flex: 1 }}>{call.reason}</span>
                <span style={{ color: '#4ade80', fontSize: '10px', fontWeight: 700 }}>✓ 対応済み</span>
              </div>
            ))}
          </div>
        )}
  
        {/* キッチン */}
        {activeTab === 'kitchen' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {shared.orders.filter((o) => o.status !== 'done').length === 0 ? (
              <div style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: N.muted, fontSize: '12px', margin: 0 }}>対応中の注文はありません ✅</p>
              </div>
            ) : shared.orders.filter((o) => o.status !== 'done').map((order) => (
              <div key={order.id} style={{ background: N.surf, border: `1px solid ${order.status === 'pending' ? '#ef4444' : '#f59e0b'}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ background: N.accent, color: '#fff', borderRadius: '5px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>テーブル {order.tableNumber}</span>
                  <span style={{ color: order.status === 'pending' ? '#ef4444' : '#f59e0b', fontSize: '10px', fontWeight: 700 }}>
                    {order.status === 'pending' ? '🔴 新規' : '🟡 調理中'}
                  </span>
                </div>
                {order.items.map((item, i) => (
                  <p key={i} style={{ color: N.txt, fontSize: '13px', fontWeight: 700, margin: '0 0 3px' }}>• {item}</p>
                ))}
                <button onClick={() => shared.setOrders(shared.orders.map((o) => o.id === order.id ? { ...o, status: o.status === 'pending' ? 'preparing' : 'done' } : o))}
                  style={{ background: order.status === 'pending' ? N.accent : '#22c55e', border: 'none', color: '#fff', borderRadius: '6px', padding: '5px 12px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '6px', fontFamily: 'inherit' }}>
                  {order.status === 'pending' ? '調理開始 →' : '提供完了 ✓'}
                </button>
              </div>
            ))}
          </div>
        )}
  
        {/* 売上 */}
        {activeTab === 'sales' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: N.surf, border: '1px solid #334155', borderRadius: '10px', padding: '12px', borderTop: '3px solid #f97316' }}>
                <p style={{ color: N.muted, fontSize: '10px', margin: '0 0 4px' }}>本日売上</p>
                <p style={{ color: N.accent, fontWeight: 800, fontSize: '20px', margin: 0 }}>¥{totalSales.toLocaleString()}</p>
              </div>
              <div style={{ background: N.surf, border: '1px solid #334155', borderRadius: '10px', padding: '12px', borderTop: '3px solid #22c55e' }}>
                <p style={{ color: N.muted, fontSize: '10px', margin: '0 0 4px' }}>注文数</p>
                <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '20px', margin: 0 }}>{shared.orders.filter((o) => o.status === 'done').length}件</p>
              </div>
            </div>
            <p style={{ color: N.muted, fontSize: '10px', fontWeight: 700, margin: '0 0 8px' }}>メニュー別売上</p>
            {menuRanking.length === 0 ? (
              <div style={{ background: N.surf, border: `1px solid ${N.bdr}`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ color: N.muted, fontSize: '11px', margin: 0 }}>完了した注文がありません</p>
              </div>
            ) : menuRanking.map(([name, stats], i) => (
              <div key={name} style={{ background: N.surf, border: `1px solid ${i === 0 ? N.accent : N.bdr}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: i === 0 ? N.accent : '#334155', color: '#fff', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', fontWeight: 700 }}>{i + 1}位</span>
                    <span style={{ color: N.txt, fontSize: '12px', fontWeight: 700 }}>{name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: N.accent, fontSize: '12px', fontWeight: 700, margin: 0 }}>¥{stats.total.toLocaleString()}</p>
                    <p style={{ color: N.muted, fontSize: '10px', margin: 0 }}>{stats.qty}個</p>
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: i === 0 ? N.accent : '#334155', width: `${(stats.total / (menuRanking[0]?.[1].total || 1)) * 100}%`, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // ── メインページ ──
  export default function DemoPage() {
    const [page, setPage] = useState<'landing' | 'demo'>('landing');
    const [demoMode, setDemoMode] = useState<'split' | 'customer' | 'store'>('split');
  
    const [orders, setOrders] = useState<any[]>([]);
    const [calls, setCalls] = useState<any[]>([]);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [tableStatus, setTableStatus] = useState<'empty' | 'occupied' | 'billing' | 'paid'>('empty');
    const [occupiedSeats, setOccupiedSeats] = useState(8);
  
    const shared: SharedState = { orders, calls, waitlist, tableStatus, occupiedSeats, setOrders, setCalls, setWaitlist, setTableStatus, setOccupiedSeats };
  
    if (page === 'landing') return (
      <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif", color: '#ffffff' }}>
        <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #09090b 100%)', padding: '48px 24px 40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#f97316', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 46 46" fill="none">
              <circle cx="23" cy="10" r="5" fill="white"/>
              <rect x="20" y="16" width="6" height="20" rx="3" fill="white"/>
              <path d="M11 24 C11 18 23 16 23 16 C23 16 35 18 35 24" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <rect x="13" y="35" width="20" height="5" rx="2.5" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Irasse</h1>
          <p style={{ color: '#f97316', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', margin: '0 0 16px' }}>IRASSHAIMASE</p>
          <p style={{ color: '#888891', fontSize: '15px', lineHeight: 1.7, margin: '0 auto 32px', maxWidth: '360px' }}>
            QRコード<strong style={{ color: '#ffffff' }}>1枚</strong>で、<br />
            待つ・注文する・呼ぶ・払う<br />
            <strong style={{ color: '#f97316' }}>全部できる</strong>唯一のサービス
          </p>
          <button onClick={() => setPage('demo')}
            style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800, padding: '16px 40px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'block', margin: '0 auto 12px' }}>
            無料でデモを体験する →
          </button>
          <p style={{ color: '#888891', fontSize: '11px', margin: '8px 0 0' }}>架空の店舗「麺屋 雅」で体験できます</p>
        </div>
  
        <div style={{ padding: '40px 24px', maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>なぜIrasseなのか？</h2>
          <p style={{ color: '#888891', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>他のサービスとの決定的な違い</p>
  
          <div style={{ background: '#111113', border: '1px solid #222226', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px', background: '#1a1a1a', padding: '10px 14px', gap: '4px' }}>
              <span style={{ color: '#888891', fontSize: '10px' }}>機能</span>
              {['Irasse', 'Airwait', 'タブレット', 'TableCheck'].map((s) => (
                <span key={s} style={{ color: s === 'Irasse' ? '#f97316' : '#888891', fontSize: '10px', fontWeight: s === 'Irasse' ? 700 : 400, textAlign: 'center' }}>{s}</span>
              ))}
            </div>
            {[
              ['QRで注文', '✅', '❌', '✅', '❌'],
              ['待ち行列', '✅', '✅', '❌', '✅'],
              ['スタッフ呼び出し', '✅', '❌', '△', '❌'],
              ['多言語対応', '✅ 4言語', '❌', '❌', '△'],
              ['初期費用', '無料', '有料', '数十万〜', '高額'],
              ['ハード不要', '✅', '✅', '❌', '❌'],
              ['全部QR1枚', '✅', '❌', '❌', '❌'],
            ].map(([feature, ...vals], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px', padding: '9px 14px', borderTop: '1px solid #222226', gap: '4px', background: i % 2 === 0 ? 'transparent' : '#0f0f0f' }}>
                <span style={{ color: '#d4d4d4', fontSize: '11px' }}>{feature}</span>
                {vals.map((v, j) => (
                  <span key={j} style={{ color: j === 0 ? '#f97316' : v === '✅' ? '#22c55e' : v === '❌' ? '#ef4444' : '#888891', fontSize: j === 0 ? '10px' : '12px', fontWeight: j === 0 ? 700 : 400, textAlign: 'center' }}>{v}</span>
                ))}
              </div>
            ))}
          </div>
  
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
            {[
              { emoji: '📱', title: 'QR1枚で全解決', desc: '待つ・注文・呼ぶ・払うが全部1つのQRで完結' },
              { emoji: '💰', title: 'コスト激減', desc: 'タブレット不要。印刷費だけで導入できる' },
              { emoji: '⚡', title: '30秒で導入', desc: 'QRを印刷して置くだけ。設置工事も不要' },
              { emoji: '🌍', title: '4言語対応', desc: '訪日外国人にも対応。日英韓中を自動切替' },
            ].map((f) => (
              <div key={f.title} style={{ background: '#111113', border: '1px solid #222226', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.emoji}</div>
                <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{f.title}</div>
                <div style={{ color: '#888891', fontSize: '11px', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
  
          <button onClick={() => setPage('demo')}
            style={{ width: '100%', background: '#f97316', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800, padding: '16px', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px' }}>
            デモを体験する →
          </button>
          <div style={{ textAlign: 'center' }}>
            <a href="/login" style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>実際に導入する →</a>
          </div>
        </div>
      </div>
    );
  
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setPage('landing')} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>← 戻る</button>
            <div style={{ width: '20px', height: '20px', background: '#f97316', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="white"/><rect x="20" y="16" width="6" height="20" rx="3" fill="white"/><path d="M11 24 C11 18 23 16 23 16 C23 16 35 18 35 24" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/></svg>
            </div>
            <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 700 }}>Irasse Demo — 麺屋 雅</span>
          </div>
          <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {[{ id: 'split', label: '並べて見る' }, { id: 'customer', label: '📱 客側' }, { id: 'store', label: '🏪 店側' }].map((m) => (
              <button key={m.id} onClick={() => setDemoMode(m.id as any)}
                style={{ padding: '5px 10px', fontSize: '10px', fontWeight: demoMode === m.id ? 700 : 400, background: demoMode === m.id ? '#334155' : 'transparent', color: demoMode === m.id ? '#f1f5f9' : '#64748b', border: 'none', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
  
        <div style={{ background: '#1c0a00', borderBottom: '1px solid #f97316', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ color: '#f97316', fontSize: '10px', fontWeight: 700 }}>🔴 LIVE DEMO</span>
          <span style={{ color: '#888891', fontSize: '10px' }}>客側で操作すると店側にリアルタイムで反映されます。「並べて見る」で両方同時に確認できます。</span>
        </div>
  
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {demoMode === 'split' ? (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ color: '#888891', fontSize: '10px', fontWeight: 700, textAlign: 'center', marginBottom: '6px' }}>📱 客側</div>
                <div style={{ width: '280px', height: '560px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #222226', display: 'flex', flexDirection: 'column' }}>
                  <CustomerView shared={shared} />
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div style={{ color: '#888891', fontSize: '10px', fontWeight: 700, textAlign: 'center', marginBottom: '6px' }}>🏪 店側</div>
                <div style={{ width: '280px', height: '560px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #222226', display: 'flex', flexDirection: 'column' }}>
                  <StoreView shared={shared} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '360px', height: '660px', borderRadius: '24px', overflow: 'hidden', border: '2px solid #222226', display: 'flex', flexDirection: 'column' }}>
                {demoMode === 'customer' ? <CustomerView shared={shared} /> : <StoreView shared={shared} />}
              </div>
            </div>
          )}
        </div>
  
        <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid #1e293b', flexShrink: 0 }}>
          <a href="/login" style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>このサービスを導入する →</a>
        </div>
      </div>
    );
  }