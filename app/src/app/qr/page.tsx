'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/navigation';

type TableType = 'table' | 'counter' | 'room';
type Lang = 'ja' | 'en';

type Table = {
  id: string;
  number: number;
  type: TableType;
  seats: number;
  status: string;
};

const TR = {
  ja: {
    back: '← ダッシュボード',
    title: '📱 QRコード生成',
    hint: 'QRコードを印刷して各席に置いてください。客がスキャンするとその席専用の注文画面が開きます。',
    loading: '読み込み中...',
    empty: 'テーブルがまだ登録されていません',
    addTable: 'テーブルを追加する →',
    all: 'すべて',
    seats: '席',
    typeLabel: { table: 'テーブル', counter: 'カウンター', room: '個室' },
    tableNum: (n: number) => `${n}番`,
  },
  en: {
    back: '← Dashboard',
    title: '📱 QR Code Generator',
    hint: 'Print the QR codes and place them on each table. Guests scan to open the order page for that seat.',
    loading: 'Loading...',
    empty: 'No tables registered yet',
    addTable: 'Add tables →',
    all: 'All',
    seats: 'seats',
    typeLabel: { table: 'Table', counter: 'Counter', room: 'Room' },
    tableNum: (n: number) => `#${n}`,
  },
};

const TYPE_EMOJI: Record<TableType, string> = {
  table: '🪑', counter: '🍺', room: '🚪',
};

const TYPE_COLOR: Record<TableType, string> = {
  table: '#f97316', counter: '#3b82f6', room: '#a855f7',
};

export default function QRPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeType, setActiveType] = useState<TableType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('ja');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://irasse.vercel.app';
  const router = useRouter();
  const t = TR[lang];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Table[];
      data.sort((a, b) => a.number - b.number);
      setTables(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredTables = activeType === 'all' ? tables : tables.filter((tb) => tb.type === activeType);
  const countByType = (type: TableType) => tables.filter((tb) => tb.type === type).length;

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
      <div style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}>
            {t.back}
          </button>
          <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 800, margin: 0 }}>{t.title}</h1>
        </div>
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {(['ja', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              style={{ padding: '3px 8px', fontSize: '11px', fontWeight: lang === l ? 700 : 400, background: lang === l ? '#334155' : 'transparent', color: lang === l ? '#f1f5f9' : '#64748b', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {l === 'ja' ? '🇯🇵' : '🇺🇸'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: '#1c0a00', border: '1px solid #f97316', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <p style={{ color: '#f97316', fontSize: '13px', margin: 0 }}>{t.hint}</p>
        </div>

        {loading ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0 }}>{t.loading}</p>
          </div>
        ) : tables.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: '0 0 16px' }}>{t.empty}</p>
            <button onClick={() => router.push('/tables')}
              style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.addTable}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button style={TAB(activeType === 'all', '#f97316')} onClick={() => setActiveType('all')}>
                {t.all} <span style={{ background: '#334155', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{tables.length}</span>
              </button>
              {(['table', 'counter', 'room'] as TableType[]).map((type) => countByType(type) > 0 && (
                <button key={type} style={TAB(activeType === type, TYPE_COLOR[type])} onClick={() => setActiveType(type)}>
                  {TYPE_EMOJI[type]} {t.typeLabel[type]}
                  <span style={{ background: '#334155', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{countByType(type)}</span>
                </button>
              ))}
            </div>

            {activeType === 'all' ? (
              (['table', 'counter', 'room'] as TableType[]).map((type) => {
                const typeItems = tables.filter((tb) => tb.type === type);
                if (typeItems.length === 0) return null;
                return (
                  <div key={type} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '18px' }}>{TYPE_EMOJI[type]}</span>
                      <h2 style={{ color: TYPE_COLOR[type], fontSize: '16px', fontWeight: 800, margin: 0 }}>{t.typeLabel[type]}</h2>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>{typeItems.length} {t.seats}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {typeItems.map((table) => (
                        <QRCard key={table.id} table={table} baseUrl={baseUrl} tableNum={t.tableNum(table.number)} typeLabel={t.typeLabel[table.type || 'table']} seats={t.seats} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {filteredTables.map((table) => (
                  <QRCard key={table.id} table={table} baseUrl={baseUrl} tableNum={t.tableNum(table.number)} typeLabel={t.typeLabel[table.type || 'table']} seats={t.seats} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QRCard({ table, baseUrl, tableNum, typeLabel, seats }: {
  table: Table; baseUrl: string; tableNum: string; typeLabel: string; seats: string;
}) {
  const url = `${baseUrl}/order?table=${table.number}`;
  const color = TYPE_COLOR[table.type || 'table'];

  return (
    <div style={{ background: '#1e293b', border: `1px solid ${color}`, borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{TYPE_EMOJI[table.type || 'table']}</span>
        <span style={{ color, fontSize: '11px', fontWeight: 700 }}>{typeLabel}</span>
      </div>
      <h2 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>{tableNum}</h2>
      <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 16px' }}>👤 {table.seats} {seats}</p>
      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
        <QRCode value={url} size={140} />
      </div>
      <p style={{ color: '#64748b', fontSize: '9px', textAlign: 'center', wordBreak: 'break-all', margin: 0 }}>{url}</p>
    </div>
  );
}