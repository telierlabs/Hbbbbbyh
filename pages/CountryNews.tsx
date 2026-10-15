import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import { COUNTRIES, getCountry } from '../countries';
import WorldMap from '../components/WorldMap';
import ArticleFeed from '../components/ArticleFeed';
import NewsCard from '../components/NewsCard';

interface CountryNewsProps { articles: NewsArticle[]; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Jumlah berita yang tampil per "Muat lebih banyak"
const PAGE = 7;

const SecTitle: React.FC<{ label: string; right?: string }> = ({ label, right }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
    <span className="cn-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>{label}</span>
    {right && <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>{right}</span>}
  </div>
);

const CountryNews: React.FC<CountryNewsProps> = ({ articles }) => {
  const navigate = useNavigate();
  const { countryCode } = useParams<{ countryCode: string }>();
  const country = getCountry(countryCode);
  const [limit, setLimit] = useState(PAGE);

  // Pindah negara / buka halaman: balik ke atas
  useEffect(() => { window.scrollTo(0, 0); setLimit(PAGE); }, [countryCode]);

  // Hitungan berita per negara (untuk marker peta + chip negara lain)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    articles.forEach(a => { if (a.country) c[a.country] = (c[a.country] || 0) + 1; });
    return c;
  }, [articles]);

  const inCountry = useMemo(
    () => articles.filter(a => !!country && a.country === country.code),
    [articles, country]
  );
  const regular = useMemo(() => inCountry.filter(a => a.articleType !== 'deepdive'), [inCountry]);
  const deepDives = useMemo(() => inCountry.filter(a => a.articleType === 'deepdive'), [inCountry]);

  const others = useMemo(
    () => COUNTRIES.filter(c => c.code !== country?.code).sort((a, b) => (counts[b.code] || 0) - (counts[a.code] || 0)),
    [country, counts]
  );

  // Kode negara tidak dikenal -> balik ke halaman World
  if (!country) return <Navigate to="/world" replace />;

  const chip: React.CSSProperties = {
    ...mono, flexShrink: 0, padding: '8px 14px', borderRadius: '999px', border: '1px solid #2a2a2a',
    background: 'transparent', color: '#aaa', fontSize: '11px', letterSpacing: '0.1em',
    textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO: nama negara + peta yang di-zoom */}
        <div
          className="cn-hero-bg"
          style={{ background: '#f5f5f7', backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)', backgroundSize: '40px 40px', padding: '100px 0 8px' }}
        >
          <div className="cn-container" style={{ padding: '0 20px' }}>
            <button
              type="button"
              onClick={() => navigate('/world')}
              style={{ ...mono, background: 'none', border: 'none', padding: '4px 0', marginBottom: '14px', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', cursor: 'pointer' }}
            >
              ← The World Right Now
            </button>
            <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853', animation: 'tn-pulse 2s ease-in-out infinite' }} />
              Country desk · {country.code.toUpperCase()}
            </p>
            <h1 className="cn-hero-title" style={{ ...m, fontSize: 'clamp(30px,9vw,56px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: '0 0 8px', textTransform: 'uppercase' }}>
              {country.name}
            </h1>
            <p style={{ ...mono, fontSize: '11px', letterSpacing: '0.12em', color: '#666', margin: '0 0 6px' }}>
              {regular.length} BERITA · {deepDives.length} DEEP DIVE
            </p>
          </div>

          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 8px' }}>
            <WorldMap counts={counts} activeCode={country.code} onSelect={code => navigate(`/world/${code}`)} />
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
          <div className="cn-container">

            {/* BERITA TERBARU {NEGARA} */}
            <SecTitle label={`Berita Terbaru · ${country.name}`} right={regular.length > 0 ? `${regular.length} BERITA` : undefined} />
            {regular.length === 0 ? (
              <div style={{ padding: '40px 0 48px', textAlign: 'center', border: '1px dashed #1e1e1e', borderRadius: '12px', marginBottom: '8px' }}>
                <p style={{ ...m, color: '#aaa', fontSize: '13px', margin: 0, padding: '0 16px', lineHeight: 1.6 }}>
                  Belum ada berita untuk {country.name}.
                </p>
              </div>
            ) : (
              <>
                <ArticleFeed items={regular.slice(0, limit)} />
                {regular.length > limit && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setLimit(n => n + PAGE)}
                      style={{ ...mono, background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '11px 22px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      Muat lebih banyak ({regular.length - limit})
                    </button>
                  </div>
                )}
              </>
            )}

            {/* DEEP DIVE {NEGARA} */}
            {deepDives.length > 0 && (
              <div style={{ marginTop: '36px' }}>
                <SecTitle label={`Deep Dive · ${country.name}`} right={`${deepDives.length} ARTIKEL`} />
                <div className="cn-dd">
                  {deepDives.map(a => <NewsCard key={a.id} article={a} variant="horizontal" />)}
                </div>
              </div>
            )}

            {/* NEGARA LAIN */}
            <div style={{ marginTop: '36px' }}>
              <SecTitle label="Negara Lain" />
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {others.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => navigate(`/world/${c.code}`)}
                    style={chip}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#aaa'; }}
                  >
                    {c.name} · {counts[c.code] || 0}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        div::-webkit-scrollbar { display: none; }

        .cn-container { max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @media (min-width: 640px) { .cn-container { max-width: 100%; } }
        @media (min-width: 2000px) { .cn-container { max-width: 1900px; } }

        @media (min-width: 900px) {
          .cn-dd { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); column-gap: 20px; align-items: start; }
        }
        @media (min-width: 1024px) {
          .cn-hero-bg { padding-top: 130px !important; }
          .cn-hero-title { font-size: 72px !important; }
          .cn-sec { font-size: 20px !important; }
        }
        @media (min-width: 1440px) {
          .cn-hero-bg { padding-top: 150px !important; }
          .cn-hero-title { font-size: 88px !important; }
          .cn-sec { font-size: 22px !important; }
        }
      `}</style>
    </>
  );
};

export default CountryNews;
