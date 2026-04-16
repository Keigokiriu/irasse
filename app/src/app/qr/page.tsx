'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function QRPage() {
  const [tableCount, setTableCount] = useState(4);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">📱 QRコード生成</h1>

        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#1e293b' }}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            テーブル数
          </label>
          <input
            type="number"
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value))}
            min={1}
            max={20}
            className="rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map((table) => (
            <div key={table} className="rounded-2xl p-6 flex flex-col items-center" style={{ backgroundColor: '#1e293b' }}>
              <h2 className="text-lg font-bold text-white mb-4">テーブル {table}</h2>
              <div className="bg-white p-3 rounded-xl">
                <QRCode
                  value={`${baseUrl}/order?table=${table}`}
                  size={160}
                />
              </div>
              <p className="text-xs mt-4 text-center break-all" style={{ color: '#94a3b8' }}>
                {baseUrl}/order?table={table}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}