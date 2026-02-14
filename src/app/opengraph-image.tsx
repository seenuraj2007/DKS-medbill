import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'DKS StockAlert - Free Open Source Inventory Management Software'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          color: 'white',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '48px',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              DKS StockAlert
            </span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: '600',
                opacity: 0.9,
                marginTop: '4px',
              }}
            >
              Free & Open Source
            </span>
          </div>
        </div>

        <h1
          style={{
            fontSize: '56px',
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}
        >
          Inventory Management Software
        </h1>

        <p
          style={{
            fontSize: '28px',
            fontWeight: '500',
            textAlign: 'center',
            opacity: 0.95,
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          GST Invoicing • WhatsApp Alerts • Tally Import • Multi-Location
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
          }}
        >
          <span
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
            }}
          >
            🇮🇳 Made for India
          </span>
          <span
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
            }}
          >
            🚀 100% Free
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
