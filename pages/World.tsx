import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import { COUNTRIES, getArticleCountry } from '../countries';
import WorldMap from '../components/WorldMap';
import ArticleFeed from '../components/ArticleFeed';

interface WorldProps { articles: NewsArticle[]; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Jumlah berita yang tampil per "Muat lebih banyak"
const PAGE = 7;

const SecTitle: React.FC<{ label: string; right?: string }> = ({ label, right }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
    <span className="wd-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>{label}</span>
    {right && <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>{right}</span>}
  </div>
);

const World: React.FC<WorldProps> = ({ articles }) => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Jumlah berita per negara: tag dari Admin, atau terdeteksi otomatis dari judul/ringkasan
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    articles.forEach(a => {
      const code = getArticleCountry(a);
      if (code) c[code] = (c[code] || 0) + 1;
    });
    return c;
  }, [articles]);

  // Berita terbaru dunia = semua berita (Deep Dive punya halamannya sendiri)
  const latest = useMemo(() => articles.filter(a => a.articleType !== 'deepdive'), [articles]);

  // Negara yang paling banyak beritanya di depan
  const countryCards = useMemo(
    () => [...COUNTRIES].sort((a, b) => (counts[b.code] || 0) - (counts[a.code] || 0)),
    [counts]
  );

  const activeCountries = COUNTRIES.filter(c => (counts[c.code] || 0) > 0).length;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO: peta bumi */}
        <div
          className="wd-hero-bg"
          style={{ background: '#f5f5f7', backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)', backgroundSize: '40px 40px', padding: '100px 0 8px' }}
        >
          <div className="wd-container" style={{ padding: '0 20px' }}>
            <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853', animation: 'tn-pulse 2s ease-in-out infinite' }} />
              Global news map
            </p>
            <h1 className="wd-hero-title" style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: '0 0 8px' }}>
              THE WORLD<br />RIGHT NOW
            </h1>
          </div>

          <div className="wd-map-wrap" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 8px' }}>
            <WorldMap counts={counts} onSelect={code => navigate(`/world/${code}`)} />
          </div>

          <div className="wd-container" style={{ padding: '4px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.12em', color: '#666' }}>
              {COUNTRIES.length} NEGARA · {activeCountries} AKTIF · {articles.length} BERITA
            </span>
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.12em', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00c853', border: '1px solid #000', display: 'inline-block' }} /> ADA BERITA
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5f5f7', border: '1px solid #8a8a8a', display: 'inline-block', marginLeft: '8px' }} /> BELUM ADA
            </span>
          </div>
          <div style={{ height: '8px' }} />
        </div>

        {/* DIVIDER */}
        <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px' }}>
            <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000" />
          </svg>
        </div>

        <div style={{ background: '#000', padding: '0 20px 80px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
          <div className="wd-container">

            {/* BERITA TERBARU (global) */}
            <SecTitle label="Berita Terbaru" right={latest.length > 0 ? `${latest.length} BERITA` : undefined} />
            {latest.length === 0 ? (
              <div style={{ padding: '40px 0 48px', textAlign: 'center', border: '1px dashed #1e1e1e', borderRadius: '12px', marginBottom: '8px' }}>
                <p style={{ ...m, color: '#aaa', fontSize: '13px', margin: 0, padding: '0 16px', lineHeight: 1.6 }}>
                  Belum ada berita.
                </p>
              </div>
            ) : (
              <>
                <ArticleFeed items={latest.slice(0, limit)} />
                {latest.length > limit && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setLimit(n => n + PAGE)}
                      style={{ ...mono, background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '11px 22px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      Muat lebih banyak ({latest.length - limit})
                    </button>
                  </div>
                )}
              </>
            )}

            {/* KARTU NEGARA */}
            <div style={{ marginTop: '36px' }}>
              <SecTitle label="Pilih Negara" right={`${COUNTRIES.length} NEGARA`} />
              <div className="wd-grid">
                {countryCards.map(c => {
                  const n = counts[c.code] || 0;
                  return (
                    <div
                      key={c.code}
                      className="wd-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/world/${c.code}`)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/world/${c.code}`); } }}
                      style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '14px', outline: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', color: '#fff', border: '1px solid #2a2a2a', padding: '3px 7px', borderRadius: '4px' }}>{c.code.toUpperCase()}</span>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: n > 0 ? '#3dff8b' : '#2a2a2a', animation: n > 0 ? 'tn-pulse 2s ease-in-out infinite' : 'none' }} />
                      </div>
                      <div>
                        <div className="wd-card-name" style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', lineHeight: 1.3, marginBottom: '6px' }}>{c.name}</div>
                        <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.1em', color: n > 0 ? '#aaa' : '#555' }}>{n > 0 ? `${n} BERITA →` : 'BELUM ADA BERITA'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        div::-webkit-scrollbar { display: none; }

        .wd-container { max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @media (min-width: 640px) { .wd-container { max-width: 100%; } }
        @media (min-width: 2000px) { .wd-container { max-width: 1900px; } }

        .wd-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 640px) { .wd-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
        @media (min-width: 1024px) {
          .wd-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
          .wd-hero-bg { padding-top: 130px !important; }
          .wd-hero-title { font-size: 68px !important; }
          .wd-sec { font-size: 20px !important; }
          .wd-card { padding: 18px !important; }
          .wd-card-name { font-size: 16px !important; }
        }
        @media (min-width: 1440px) {
          .wd-grid { grid-template-columns: repeat(6, 1fr); }
          .wd-hero-bg { padding-top: 150px !important; }
          .wd-hero-title { font-size: 84px !important; }
          .wd-sec { font-size: 22px !important; }
        }
      `}</style>
    </>
  );
};

export default World;
