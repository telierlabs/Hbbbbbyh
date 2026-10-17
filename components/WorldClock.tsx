import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COUNTRIES } from '../countries';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Jam & tanggal lokal sebuah zona waktu
const parts = (now: Date, tz: string) => {
  try {
    const t = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    const d = new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(now);
    const hour = parseInt(t.slice(0, 2), 10) % 24;
    return { t, d, day: hour >= 6 && hour < 18 };
  } catch {
    return { t: '--:--', d: '', day: true };
  }
};

// Section "World Clock" di Home: baris tile yang digeser ke samping, tanpa kartu pembungkus
const WorldClock: React.FC = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  // Update tiap 15 detik (cukup, karena yang tampil cuma jam:menit)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: '#000', paddingTop: '24px', paddingBottom: '24px', borderBottom: '1px solid #111' }}>
      <div className="tn-container" style={{ padding: '0 20px 12px' }}>
        <span className="tn-sec-header" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>World Clock</span>
      </div>
      <div className="tn-container">
        <div className="wc-row" style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {COUNTRIES.map(c => {
            const p = parts(now, c.tz);
            return (
              <button
                key={c.code}
                type="button"
                className="wc-tile"
                onClick={() => navigate(`/world/${c.code}`)}
                style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '132px', textAlign: 'left', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
              >
                <span style={{ ...m, display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>{c.name}</span>
                <span style={{ ...mono, display: 'block', fontSize: '26px', lineHeight: 1, color: '#fff', marginBottom: '8px' }}>{p.t}</span>
                <span style={{ ...mono, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '0.08em', color: '#777' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.day ? '#3dff8b' : '#444', flexShrink: 0 }} />
                  {p.d}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (min-width: 900px) {
          .wc-row { display: grid !important; grid-template-columns: repeat(8, 1fr); overflow: visible !important; }
          .wc-tile { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default WorldClock;
