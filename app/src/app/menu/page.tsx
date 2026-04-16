'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('フード');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    if (!name || !price) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'menu'), { name, price: Number(price), category });
      setName('');
      setPrice('');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'menu', id));
  };

  const categories = ['フード', 'ドリンク', 'デザート'];

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <div style={{ background: '#0F172A', padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginRight: '10px' }}
        >
          ← 戻る
        </button>
        <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: 0 }}>メニュー管理</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ background: '#0F172A', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '600', margin: '0 0 12px' }}>メニューを追加</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="メニュー名"
              className="placeholder-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1, minWidth: '120px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.85)', fontSize: '13px', outline: 'none' }}
            />
            <input
              type="number"
              placeholder="価格"
              className="placeholder-white"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: '90px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.85)', fontSize: '13px', outline: 'none' }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.85)', fontSize: '13px', outline: 'none' }}
            >
              {categories.map((c) => (
                <option key={c} value={c} style={{ background: '#0F172A' }}>{c}</option>
              ))}
            </select>
            <button
              onClick={addItem}
              disabled={loading}
              style={{ background: '#EA580C', border: 'none', color: 'white', fontSize: '13px', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              追加
            </button>
          </div>
        </div>

        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '600', margin: '0 0 10px' }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {catItems.map((item) => (
                  <div key={item.id} style={{ background: '#0F172A', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: '0 0 2px' }}>{item.name}</p>
                      <p style={{ color: '#EA580C', fontSize: '13px', fontWeight: '600', margin: 0 }}>¥{item.price}</p>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div style={{ background: '#0F172A', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>メニューがまだありません</p>
          </div>
        )}
      </div>
    </div>
  );
}