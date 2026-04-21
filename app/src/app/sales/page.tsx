'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type Order = {
  id: string;
  tableNumber: number;
  sessionId: string | null;
  items: string[];
  status: 'pending' | 'preparing' | 'done';
  createdAt: Date;
};

type Session = {
  id: string;
  tableNumber: number;
  tableId: string;
  status: 'active' | 'closed';
  startedAt: Date;
  closedAt: Date | null;
  totalAmount: number;
};

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [menuPrices, setMenuPrices] = useState<{ [name: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'menu'>('overview');
  const router = useRouter();

  useEffect(() => {
    const unsubMenu = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const prices: { [name: string]: number } = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        prices[data.name] = data.price;
      });
      setMenuPrices(prices);
    });

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Order[];
      setOrders(data);
    });

    const qSessions = query(collection(db, 'sessions'), orderBy('startedAt', 'desc'));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate(),
        closedAt: doc.data().closedAt?.toDate() || null,
      })) as Session[];
      setSessions(data);
    });

    return () => { unsubMenu(); unsubOrders(); unsubSessions(); };
  }, []);

  const calcOrderTotal = (items: string[]) => {
    return items.reduce((sum, item) => {
      const match = item.match(/^(.+) x(\d+)$/);
      if (!match) return sum;
      return sum + (menuPrices[match[1]] || 0) * Number(match[2]);
    }, 0);
  };

  const exportCSV = () => {
    const rows = [
      ['日付', '時間', 'テーブル番号', 'セッションID', '注文内容', '金額', 'ステータス'],
    ];
    doneOrders.forEach((order) => {
      const date = order.createdAt ? order.createdAt.toLocaleDateString('ja-JP') : '';
      const time = order.createdAt ? order.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '';
      rows.push([
        date,
        time,
        String(order.tableNumber),
        order.sessionId || '',
        order.items.join(' / '),
        String(calcOrderTotal(order.items)),
        '完了',
      ]);
    });
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irasse_sales_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => o.createdAt && o.createdAt >= today);
  const doneOrders = orders.filter((o) => o.status === 'done');
  const todayDoneOrders = todayOrders.filter((o) => o.status === 'done');
  const todaySales = todayDoneOrders.reduce((sum, o) => sum + calcOrderTotal(o.items), 0);
  const totalSales = doneOrders.reduce((sum, o) => sum + calcOrderTotal(o.items), 0);
  const avgOrder = doneOrders.length > 0 ? Math.round(totalSales / doneOrders.length) : 0;

  const closedSessions = sessions.filter((s) => s.status === 'closed');
  const todaySessions = closedSessions.filter((s) => s.startedAt && s.startedAt >= today);

  const getSessionOrders = (sessionId: string) =>
    orders.filter((o) => o.sessionId === sessionId);

  const getSessionTotal = (sessionId: string) =>
    getSessionOrders(sessionId).reduce((sum, o) => sum + calcOrderTotal(o.items), 0);

  const getSessionItems = (sessionId: string) => {
    const itemMap: { [name: string]: number } = {};
    getSessionOrders(sessionId).forEach((order) => {
      order.items.forEach((item) => {
        const match = item.match(/^(.+) x(\d+)$/);
        if (match) {
          itemMap[match[1]] = (itemMap[match[1]] || 0) + Number(match[2]);
        }
      });
    });
    return Object.entries(itemMap).map(([name, qty]) => `${name} x${qty}`);
  };

  const menuStats: { [name: string]: { qty: number; total: number } } = {};
  doneOrders.forEach((order) => {
    order.items.forEach((item) => {
      const match = item.match(/^(.+) x(\d+)$/);
      if (!match) return;
      const name = match[1];
      const qty = Number(match[2]);
      if (!menuStats[name]) menuStats[name] = { qty: 0, total: 0 };
      menuStats[name].qty += qty;
      menuStats[name].total += (menuPrices[name] || 0) * qty;
    });
  });
  const menuRanking = Object.entries(menuStats)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.total - a.total);
  const maxMenuTotal = menuRanking[0]?.total || 1;

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const TAB = (active: boolean) => ({
    flex: 1, padding: '10px 4px', fontSize: '13px', fontWeight: 700 as const,
    color: active ? '#f97316' : '#64748b', background: 'transparent', border: 'none',
    borderBottom: active ? '2px solid #f97316' : '2px solid transparent',
    cursor: 'pointer', fontFamily: 'inherit',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
            ← ダッシュボード
          </button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>📊 売上管理</h1>
        </div>
        <button onClick={exportCSV}
          style={{ background: '#1e3a5f', border: '1px solid #3b82f6', color: '#93c5fd', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          📥 CSVエクスポート
        </button>
      </div>

      {/* タブ */}
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex' }}>
        <button style={TAB(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>概要</button>
        <button style={TAB(activeTab === 'sessions')} onClick={() => setActiveTab('sessions')}>セッション履歴</button>
        <button style={TAB(activeTab === 'menu')} onClick={() => setActiveTab('menu')}>メニュー別</button>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>

        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.05em' }}>本日の売上</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px', borderTop: '3px solid #f97316' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 6px' }}>本日売上</p>
                <p style={{ color: '#f97316', fontWeight: 800, fontSize: '24px', margin: 0 }}>¥{todaySales.toLocaleString()}</p>
              </div>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px', borderTop: '3px solid #22c55e' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 6px' }}>本日セッション数</p>
                <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '24px', margin: 0 }}>{todaySessions.length}組</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '14px' }}>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 4px' }}>累計売上</p>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', margin: 0 }}>¥{totalSales.toLocaleString()}</p>
              </div>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '14px' }}>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 4px' }}>平均客単価</p>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', margin: 0 }}>¥{avgOrder.toLocaleString()}</p>
              </div>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '14px' }}>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 4px' }}>累計セッション</p>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', margin: 0 }}>{closedSessions.length}組</p>
              </div>
            </div>

            {sessions.filter((s) => s.status === 'active').length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, margin: '0 0 12px' }}>現在着席中</p>
                {sessions.filter((s) => s.status === 'active').map((session) => (
                  <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#f97316', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                        テーブル {session.tableNumber}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{formatTime(session.startedAt)}〜</span>
                    </div>
                    <span style={{ color: '#f97316', fontSize: '13px', fontWeight: 700 }}>
                      ¥{getSessionTotal(session.id).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* セッション履歴タブ */}
        {activeTab === 'sessions' && (
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.05em' }}>
              セッション履歴（着席〜退席ごとの記録）
            </p>
            {closedSessions.length === 0 ? (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', margin: 0 }}>まだセッションの記録がありません</p>
              </div>
            ) : closedSessions.map((session) => {
              const sessionTotal = getSessionTotal(session.id);
              const sessionItems = getSessionItems(session.id);
              return (
                <div key={session.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: '#f97316', color: '#fff', borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                          テーブル {session.tableNumber}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>
                          {formatTime(session.startedAt)} 〜 {formatTime(session.closedAt)}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                        {sessionItems.length > 0 ? sessionItems.join('・') : '注文なし'}
                      </p>
                    </div>
                    <p style={{ color: '#f97316', fontWeight: 800, fontSize: '18px', margin: 0 }}>
                      ¥{sessionTotal.toLocaleString()}
                    </p>
                  </div>
                  {getSessionOrders(session.id).length > 1 && (
                    <div style={{ borderTop: '1px solid #334155', paddingTop: '10px' }}>
                      <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 6px' }}>注文履歴</p>
                      {getSessionOrders(session.id).map((order) => (
                        <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                            {formatTime(order.createdAt)} {order.items.join('・')}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>
                            ¥{calcOrderTotal(order.items).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* メニュー別タブ */}
        {activeTab === 'menu' && (
          <div>
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.05em' }}>メニュー別売上ランキング</p>
            {menuRanking.length === 0 ? (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', margin: 0 }}>完了した注文がありません</p>
              </div>
            ) : menuRanking.map((item, i) => (
              <div key={item.name} style={{ background: '#1e293b', border: `1px solid ${i === 0 ? '#f97316' : '#334155'}`, borderRadius: '14px', padding: '14px 16px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: i === 0 ? '#f97316' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#334155', color: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                      {i + 1}位
                    </span>
                    <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#f97316', fontWeight: 700, fontSize: '15px', margin: '0 0 2px' }}>¥{item.total.toLocaleString()}</p>
                    <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{item.qty}個販売</p>
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: i === 0 ? '#f97316' : '#334155', width: `${(item.total / maxMenuTotal) * 100}%`, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}