import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'FairRentWize - US Fair Market Rents & Rental Affordability';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
          FairRentWize
        </div>
        <div style={{ fontSize: 32, color: '#c7d2fe', textAlign: 'center', maxWidth: 800 }}>
          US Fair Market Rents &amp; Rental Affordability Data
        </div>
        <div style={{ fontSize: 24, color: '#a5b4fc', marginTop: 24 }}>
          3,000+ Counties &bull; 400+ Metros &bull; 50 States
        </div>
      </div>
    ),
    { ...size }
  );
}
