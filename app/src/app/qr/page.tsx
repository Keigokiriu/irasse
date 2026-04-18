'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/navigation';

type TableType = 'table' | 'counter' | 'room';

type Table = {
  id: string;
  number: number;
  type: TableType;
  seats: number;
  status: string;
};

const TYPE_LABEL: Record<TableType, string> = {
  table: 'テーブル',
  counter: 'カウンター',
  room: '個室',
};

const TYPE_EMOJI: Record<TableType, string> = {
  table: '🪑',
  counter: '🍺',
  room: '🚪',
};

const TYPE_COLOR: Record<TableType, string> = {
  table: '#f97316',
  counter: '#3b82f6',
  room: '#a855f7',
};

export default function QRPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeType, setActiveType] = useState<TableType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://irasse.vercel.app';
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Table[];
      data.sort((a, b) => a.number - b.number);
      setTables(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredTables = activeType === 'all' ? tables : tables.filter((t) => t.type === activeType);

  const countByType = (type: TableType) => tables.filter((t) => t.type === type).length;

  const TAB = (active: boolean, color: string) => ({
    padding: '8px 16px', fontSize: '13px', fontWeight: 700 as const,
    color: active ? color : '#64748b',
    background: active ? color + '22' : 'transparent',
    border: `1px solid ${active ? color : '#334155'}`,
    borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: '6px',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
          ← ダッシュボード
        </button>
        <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>📱 QRコード生成</h1>
      </div>

      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        {/* 説明 */}
        <div style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <p style={{ color: '#f97316', fontSize: '13px', margin: 0 }}>
            QRコードを印刷して各席に置いてください。客がスキャンするとその席専用の注文画面が開きます。
          </p>
        </div>

        {loading ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0 }}>読み込み中...</p>
          </div>
        ) : tables.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: '0 0 16px' }}>テーブルがまだ登録されていません</p>
            <button onClick={() => router.push('/tables')}
              style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              テーブルを追加する →
            </button>
          </div>
        ) : (
          <>
            {/* フィルタータブ */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button style={TAB(activeType === 'all', '#f97316')} onClick={() => setActiveType('all')}>
                すべて <span style={{ background: '#334155', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{tables.length}</span>
              </button>
              {(['table', 'counter', 'room'] as TableType[]).map((type) => countByType(type) > 0 && (
                <button key={type} style={TAB(activeType === type, TYPE_COLOR[type])} onClick={() => setActiveType(type)}>
                  {TYPE_EMOJI[type]} {TYPE_LABEL[type]}
                  <span style={{ background: '#334155', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{countByType(type)}</span>
                </button>
              ))}
            </div>

            {/* 種類ごとにグループ表示 */}
            {activeType === 'all' ? (
              (['table', 'counter', 'room'] as TableType[]).map((type) => {
                const typeItems = tables.filter((t) => t.type === type);
                if (typeItems.length === 0) return null;
                return (
                  <div key={type} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '18px' }}>{TYPE_EMOJI[type]}</span>
                      <h2 style={{ color: TYPE_COLOR[type], fontSize: '16px', fontWeight: 800, margin: 0 }}>{TYPE_LABEL[type]}</h2>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>{typeItems.length}席</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {typeItems.map((table) => (
                        <QRCard key={table.id} table={table} baseUrl={baseUrl} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {filteredTables.map((table) => (
                  <QRCard key={table.id} table={table} baseUrl={baseUrl} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QRCard({ table, baseUrl }: { table: Table; baseUrl: string }) {
  const url = `${baseUrl}/order?table=${table.number}`;
  const color = TYPE_COLOR[table.type || 'table'];

  return (
    <div style={{ background: '#1e293b', border: `1px solid ${color}`, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{TYPE_EMOJI[table.type || 'table']}</span>
        <span style={{ color, fontSize: '11px', fontWeight: 700 }}>{TYPE_LABEL[table.type || 'table']}</span>
      </div>
      <h2 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>
        {table.number}番
      </h2>
      <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>👤 {table.seats}席</p>
      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
        <QRCode value={url} size={140} />
      </div>
      <p style={{ color: '#64748b', fontSize: '9px', textAlign: 'center', wordBreak: 'break-all', margin: 0 }}>
        {url}
      </p>
    </div>
  );
}