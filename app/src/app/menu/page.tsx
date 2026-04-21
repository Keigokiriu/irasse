'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
};

type Lang = 'ja' | 'en';

const TR = {
  ja: {
    back: '← ダッシュボード',
    title: '🍽️ メニュー管理',
    addTitle: 'メニューを追加',
    namePlaceholder: 'メニュー名',
    pricePlaceholder: '価格',
    imageUrlPlaceholder: '画像URL（任意）例：https://i.ibb.co/xxx/image.jpg',
    addBtn: '追加',
    imageBtn: '🖼️ 画像',
    deleteBtn: '削除',
    imageEditTitle: '画像URLを入力してください',
    imageEditPlaceholder: 'https://i.ibb.co/xxx/image.jpg',
    saveBtn: '保存',
    cancelBtn: 'キャンセル',
    imageHint: '💡 画像は',
    imageHint2: ' に無料アップロードして「Direct link」のURLを貼ってください',
    empty: 'メニューがまだありません',
    categories: [
      'フード', '一品料理', 'おつまみ', '前菜',
      'ご飯・麺', 'ラーメン', '丼物', 'パスタ',
      '肉料理', '魚料理', '野菜料理',
      'ドリンク', 'アルコール', 'ノンアルコール',
      'ビール', 'ワイン', 'カクテル', 'サワー',
      'ソフトドリンク', 'お茶', 'コーヒー',
      'デザート', 'スイーツ',
      'セット', 'コース',
      '本日のおすすめ', '季節限定',
    ],
  },
  en: {
    back: '← Dashboard',
    title: '🍽️ Menu Management',
    addTitle: 'Add Menu Item',
    namePlaceholder: 'Item name',
    pricePlaceholder: 'Price',
    imageUrlPlaceholder: 'Image URL (optional) e.g. https://i.ibb.co/xxx/image.jpg',
    addBtn: 'Add',
    imageBtn: '🖼️ Image',
    deleteBtn: 'Delete',
    imageEditTitle: 'Enter image URL',
    imageEditPlaceholder: 'https://i.ibb.co/xxx/image.jpg',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    imageHint: '💡 Upload images for free at',
    imageHint2: ' and paste the "Direct link" URL',
    empty: 'No menu items yet',
    categories: [
      'Food', 'A la Carte', 'Snacks', 'Starters',
      'Rice & Noodles', 'Ramen', 'Rice Bowls', 'Pasta',
      'Meat', 'Seafood', 'Vegetables',
      'Drinks', 'Alcohol', 'Non-Alcohol',
      'Beer', 'Wine', 'Cocktails', 'Sours',
      'Soft Drinks', 'Tea', 'Coffee',
      'Desserts', 'Sweets',
      'Sets', 'Course',
      "Today's Special", 'Seasonal',
    ],
  },
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [lang, setLang] = useState<Lang>('ja');
  const router = useRouter();
  const t = TR[lang];

  useEffect(() => {
    setCategory(t.categories[0]);
  }, [lang]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menu'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[];
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    if (!name || !price) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'menu'), {
        name, price: Number(price), category, imageUrl: imageUrl || '',
      });
      setName(''); setPrice(''); setImageUrl('');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'menu', id));
  };

  const saveImageUrl = async (id: string) => {
    await updateDoc(doc(db, 'menu', id), { imageUrl: editImageUrl });
    setEditingId(null);
    setEditImageUrl('');
  };

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

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* 追加フォーム */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, margin: '0 0 14px', letterSpacing: '0.05em' }}>{t.addTitle}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <input type="text" placeholder={t.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)}
              style={{ flex: 1, minWidth: '120px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <input type="number" placeholder={t.pricePlaceholder} value={price} onChange={(e) => setPrice(e.target.value)}
              style={{ width: '90px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ width: '130px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
              {t.categories.map((c) => (
                <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <input type="text" placeholder={t.imageUrlPlaceholder} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#f1f5f9', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={addItem} disabled={loading}
              style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}>
              {t.addBtn}
            </button>
          </div>
          <p style={{ color: '#64748b', fontSize: '11px', margin: '6px 0 0' }}>
            {t.imageHint} <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: '#f97316' }}>imgbb.com</a>{t.imageHint2}
          </p>
        </div>

        {/* メニュー一覧 */}
        {t.categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '24px' }}>
              <p style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.05em' }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {catItems.map((item) => (
                  <div key={item.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '24px' }}>🍽️</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{item.name}</p>
                        <p style={{ color: '#f97316', fontSize: '13px', fontWeight: 700, margin: 0 }}>¥{item.price.toLocaleString()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingId(editingId === item.id ? null : item.id); setEditImageUrl(item.imageUrl || ''); }}
                          style={{ background: '#1e3a5f', border: 'none', color: '#60a5fa', fontSize: '11px', fontWeight: 700, padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {t.imageBtn}
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {t.deleteBtn}
                        </button>
                      </div>
                    </div>
                    {editingId === item.id && (
                      <div style={{ borderTop: '1px solid #334155', padding: '12px 16px', background: '#0f172a' }}>
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 8px' }}>{t.imageEditTitle}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder={t.imageEditPlaceholder} value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)}
                            style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#f1f5f9', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }} />
                          <button onClick={() => saveImageUrl(item.id)}
                            style={{ background: '#f97316', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {t.saveBtn}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ background: '#334155', border: 'none', color: '#94a3b8', fontSize: '12px', fontWeight: 700, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {t.cancelBtn}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', margin: 0 }}>{t.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}