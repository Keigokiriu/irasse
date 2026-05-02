'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

const DEFAULT_TABLE_COUNT = 10;
const MIN_TABLES = 1;
const MAX_TABLES = 30;

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
  red: '#ef4444',
};

function clampTableCount(value: number): number {
  if (Number.isNaN(value)) return DEFAULT_TABLE_COUNT;
  return Math.min(MAX_TABLES, Math.max(MIN_TABLES, value));
}

export default function DoobieQRPage() {
  const [origin, setOrigin] = useState('');
  const [inputCount, setInputCount] = useState(String(DEFAULT_TABLE_COUNT));
  const [generatedCount, setGeneratedCount] = useState(DEFAULT_TABLE_COUNT);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const tables = useMemo(
    () => Array.from({ length: generatedCount }, (_, i) => i + 1),
    [generatedCount]
  );

  const handleGenerate = () => {
    const parsed = Number(inputCount);

    if (!Number.isInteger(parsed)) {
      setErrorMessage(`Please enter a whole number between ${MIN_TABLES} and ${MAX_TABLES}.`);
      return;
    }

    const clamped = clampTableCount(parsed);

    if (clamped !== parsed) {
      setErrorMessage(`Table count must be between ${MIN_TABLES} and ${MAX_TABLES}.`);
    } else {
      setErrorMessage('');
    }

    setGeneratedCount(clamped);
    setInputCount(String(clamped));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        .print-only {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          html,
          body {
            background: white !important;
            color: black !important;
          }

          body * {
            visibility: hidden !important;
          }

          .qr-print-root,
          .qr-print-root * {
            visibility: visible !important;
          }

          .qr-print-root {
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
            min-height: 100%;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }

          .qr-print-root * {
            background: transparent !important;
            color: black !important;
            border-color: #999 !important;
            box-shadow: none !important;
          }

          .qr-no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .qr-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12mm !important;
          }

          .qr-card {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 2px dashed #999 !important;
            border-radius: 0 !important;
            padding: 16px !important;
          }

          .qr-code-box {
            background: white !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>

      <div
        className="qr-print-root"
        style={{
          minHeight: '100vh',
          background: C.bg,
          fontFamily: "'Noto Sans JP', sans-serif",
          color: C.txt,
          padding: '24px 32px',
        }}
      >
        <div
          className="qr-no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: `1px solid ${C.bdr}`,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Link
              href="/demo-doobie/admin"
              style={{
                fontSize: '12px',
                color: C.muted,
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              ← Back to admin
            </Link>

            <div
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: C.gold,
                letterSpacing: '0.05em',
              }}
            >
              QR MANAGER
            </div>

            <div
              style={{
                fontSize: '12px',
                color: C.muted,
                marginTop: '4px',
              }}
            >
              Generate, preview, and print table QR codes for Doobie Doo Bar
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              onClick={handlePrint}
              style={{
                background: C.gold,
                border: 'none',
                color: C.bg,
                fontSize: '13px',
                fontWeight: 800,
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              🖨️ Print all QR codes
            </button>
          </div>
        </div>

        <div
          className="qr-no-print"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: C.surf,
              border: `1px solid ${C.bdr}`,
              borderRadius: '14px',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: C.gold,
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              QR GENERATOR
            </div>

            <div
              style={{
                fontSize: '13px',
                color: C.muted,
                marginBottom: '14px',
                lineHeight: 1.6,
              }}
            >
              Set the number of tables you want to prepare, then generate a fresh set of printable QR cards.
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ minWidth: '180px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: C.muted,
                    marginBottom: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  NUMBER OF TABLES
                </label>
                <input
                  type="number"
                  min={MIN_TABLES}
                  max={MAX_TABLES}
                  value={inputCount}
                  onChange={(e) => {
                    setInputCount(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  style={{
                    width: '100%',
                    background: C.bg,
                    border: `1px solid ${errorMessage ? C.red : C.bdr}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: C.txt,
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={handleGenerate}
                style={{
                  background: C.goldD,
                  border: `1px solid ${C.goldM}`,
                  color: C.gold,
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '12px 18px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                Generate QR codes
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  marginTop: '12px',
                  background: '#3f1d1d',
                  border: `1px solid ${C.red}`,
                  color: '#fecaca',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}
          </div>

          <div
            style={{
              background: C.surf,
              border: `1px solid ${C.bdr}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: C.gold,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                }}
              >
                CURRENT OUTPUT
              </div>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: C.txt,
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                {generatedCount}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: C.muted,
                  lineHeight: 1.6,
                }}
              >
                QR cards ready for print
                <br />
                Tables 1 to {generatedCount}
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: `1px solid ${C.bdr}`,
                fontSize: '11px',
                color: C.muted,
                lineHeight: 1.7,
              }}
            >
              Tip: print on A4, cut each card, and place it on the matching table.
            </div>
          </div>
        </div>

        <div
          className="print-only"
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px dashed #999',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              fontFamily: "'Courier New', monospace",
            }}
          >
            DOOBIE DOO BAR
          </div>

          <div
            style={{
              fontSize: '11px',
              marginTop: '4px',
              fontStyle: 'italic',
            }}
          >
            Table QR Codes · Scan to order
          </div>
        </div>

        <div
          className="qr-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {tables.map((tableNum) => {
            const url = origin ? `${origin}/demo-doobie/order/${tableNum}` : '';

            return (
              <div
                key={tableNum}
                className="qr-card"
                style={{
                  background: C.surf,
                  border: `1px solid ${C.bdr}`,
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  className="qr-code-box"
                  style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '184px',
                    minWidth: '184px',
                  }}
                >
                  {url ? (
                    <QRCodeSVG
                      value={url}
                      size={160}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#666',
                        textAlign: 'center',
                        lineHeight: 1.5,
                      }}
                    >
                      Preparing QR...
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: C.muted,
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    DOOBIE DOO BAR
                  </div>

                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: C.gold,
                      letterSpacing: '0.05em',
                      marginBottom: '6px',
                    }}
                  >
                    Table {tableNum}
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: C.muted,
                    }}
                  >
                    Scan to order · Pay · Call staff
                  </div>
                </div>

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qr-no-print"
                    style={{
                      fontSize: '10px',
                      color: C.gold,
                      textDecoration: 'none',
                      border: `1px solid ${C.goldM}`,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: C.goldD,
                    }}
                  >
                    → Open in new tab
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="qr-no-print"
          style={{
            marginTop: '32px',
            padding: '16px 20px',
            background: C.surf,
            border: `1px solid ${C.bdr}`,
            borderRadius: '10px',
            fontSize: '12px',
            color: C.muted,
            lineHeight: 1.7,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: C.gold,
              marginBottom: '6px',
            }}
          >
            💡 How to use
          </div>
          1. Set the number of tables and generate the QR set
          <br />
          2. Print this page on A4 paper
          <br />
          3. Cut out each QR card and place on the corresponding table
          <br />
          4. Orders, calls, and payments will appear in the admin dashboard
        </div>
      </div>
    </>
  );
}