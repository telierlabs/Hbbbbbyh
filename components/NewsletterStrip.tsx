import React from 'react';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

// Newsletter berbentuk pil: gambar penuh, judul singkat di kiri bawah.
// `name` = nama lengkap (dipakai untuk aksesibilitas), `short` = judul singkat yang tampil di pil.
const NEWSLETTERS = [
  { id: 'daily', name: 'Daily Digest', short: 'Harian', icon: '/92122ef670ec1bfdab57482955e6d05b.jpg' },
  { id: 'tech', name: 'Tech Pulse', short: 'AI & Tech', icon: '/104b2b613ca32b6bac89f7d2772061be.jpg' },
  { id: 'geo', name: 'Geopolitik Weekly', short: 'Geopolitik', icon: '/516535ef10bc1f6028b46929407ef2c2.jpg' },
  { id: 'market', name: 'Market Signal', short: 'Pasar', icon: '/cce58a930b8baef640e391c40f4c50e4.jpg' },
  { id: 'space', name: 'Deep Space', short: 'Antariksa', icon: '/d64b0fd6a66dfdc95b4095bff97c9aee.jpg' },
  { id: 'cyber', name: 'Cyber Intel', short: 'Siber', icon: '/a8eeb6ba34345dff2e345628f17fbae6.jpg' },
];

// `flush` = tanpa padding sendiri (dipakai di halaman yang sudah punya padding)
const NewsletterStrip: React.FC<{ flush?: boolean }> = ({ flush = true }) => (
  <div style={{ marginBottom: flush ? '36px' : '28px' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
      <span className="nl-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>Newsletter</span>
    </div>
    <div className="nl-row">
      {NEWSLETTERS.map(nl => (
        <div key={nl.id} className="nl-pill" role="button" tabIndex={0} aria-label={`Newsletter ${nl.name}`} title={nl.name}>
          <img src={nl.icon} alt="" loading="lazy" className="nl-img" />
          <span className="nl-shade" />
          <span className="nl-name" style={m}>{nl.short}</span>
        </div>
      ))}
    </div>
    <style>{`
      .nl-row { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; -ms-overflow-style: none; scrollbar-width: none; }
      .nl-row::-webkit-scrollbar { display: none; }
      .nl-pill { position: relative; flex: 0 0 auto; width: 148px; height: 58px; border-radius: 999px; overflow: hidden; border: 1px solid #262626; background: #111; cursor: pointer; scroll-snap-align: start; transition: border-color 0.2s; }
      .nl-pill:hover { border-color: #444; }
      .nl-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.62) saturate(0.9); }
      .nl-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.08) 100%); }
      .nl-name { position: absolute; left: 18px; bottom: 11px; right: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.02em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      @media (min-width: 900px) {
        .nl-row { flex-wrap: wrap; overflow: visible; }
        .nl-pill { width: 170px; height: 62px; }
        .nl-name { font-size: 13px; }
        .nl-sec { font-size: 20px !important; }
      }
    `}</style>
  </div>
);

export default NewsletterStrip;
