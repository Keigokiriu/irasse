'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function QRPage() {
  const [tableCount, setTableCount] = useState(4);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📱 QRコード生成</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            テーブル数
          </label>
          <input
            type="number"
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value))}
            min={1}
            max={20}
            className="border border-gray-300 rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map((table) => (
            <div key={table} className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold text-gray-700 mb-4">テーブル {table}</h2>
              <QRCode
                value={`${baseUrl}/order?table=${table}`}
                size={160}
              />
              <p className="text-xs text-gray-400 mt-4 text-center break-all">
                {baseUrl}/order?table={table}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}