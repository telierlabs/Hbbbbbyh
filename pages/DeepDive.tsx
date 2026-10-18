import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import { BmBtn } from '../components/NewsCard';
import HeroCard from '../components/HeroCard';

interface DeepDiveProps { articles: NewsArticle[]; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const ALL = 'Semua';

const scanline: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)',
};

// Estimasi waktu baca (200 kata/menit)
const readMinutes = (a: NewsArticle): number =>
  Math.max(1, Math.round((a.content || '').split(/\s+/).filter(Boolean).length / 200));

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.65)' }}>
    {label}
  </span>
);

// ── Kartu artikel Deep Dive (untuk daftar) ──
const DDCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/news/${article.id}`)}
      style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.25s', display: 'flex', flexDirection: 'column', height: '100%' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
    >
      <div style={{ position: 'relative', width: '100%', paddingTop: '58%', overflow: 'hidden', background: '#111' }}>
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72)' }}
        />
        <div style={scanline} />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}><Tag label="Deep Dive" /></div>
        <span style={{ ...mono, position: 'absolute', bottom: '10px', right: '10px', fontSize: '9px', letterSpacing: '0.15em', color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '3px 7px', borderRadius: '4px' }}>
          {readMinutes(article)} MNT BACA
        </span>
      </div>
      <div style={{ padding: '14px 16px 14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888' }}>{article.category}</span>
        <div style={{ ...m, fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
        <div style={{ ...m, fontSize: '12px', color: '#aaa', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.summary}</div>
        <div style={{ height: '1px', background: '#1a1a1a', marginTop: 'auto' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ ...mono, fontSize: '10px', color: '#888', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {article.author} · {formatDate(article.publishedAt)}
          </span>
          <BmBtn article={article} />
        </div>
      </div>
    </div>
  );
};

const DeepDive: React.FC<DeepDiveProps> = ({ articles }) => {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<string>(ALL);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Semua artikel Deep Dive, terbaru dulu
  const deepDives = useMemo(
    () =>
      articles
        .filter(a => a.articleType === 'deepdive')
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [articles]
  );

  const hero = deepDives[0];

  // Kategori yang ada di Deep Dive + jumlahnya (terbanyak dulu)
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    deepDives.forEach(a => counts.set(a.category, (counts.get(a.category) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [deepDives]);

  // "Semua" = tanpa artikel hero (sudah tampil di atas). Kategori tertentu = semua artikel kategori itu.
  const list = activeCat === ALL ? deepDives.slice(1) : deepDives.filter(a => a.category === activeCat);

  const chip = (active: boolean): React.CSSProperties => ({
    ...mono,
    flexShrink: 0,
    padding: '8px 14px',
    borderRadius: '999px',
    border: `1px solid ${active ? '#fff' : '#2a2a2a'}`,
    background: active ? '#fff' : 'transparent',
    color: active ? '#000' : '#aaa',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO */}
        <div
          className="ddp-hero-bg"
          style={{ background: '#f5f5f7', backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)', backgroundSize: '40px 40px', padding: '100px 20px 8px' }}
        >
          <div className="ddp-container">
            {hero ? (
              <HeroCard
                image={hero.imageUrl}
                tags={['Deep Dive Terbaru', `${readMinutes(hero)} mnt baca`]}
                eyebrow={hero.category}
                title={hero.title}
                summary={hero.summary}
                cta="Baca Deep Dive →"
                meta={`${hero.author} · ${formatDate(hero.publishedAt)}`}
                onClick={() => navigate(`/news/${hero.id}`)}
              />
            ) : (
              <div style={{ border: '1px dashed #bbb', borderRadius: '16px', padding: '48px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.6)' }}>
                <p style={{ ...m, fontSize: '14px', color: '#555', margin: '0 0 14px' }}>Belum ada artikel Deep Dive.</p>
                <button type="button" onClick={() => navigate('/')} style={{ ...m, background: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>← Kembali ke Home</button>
              </div>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px' }}>
            <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000" />
          </svg>
        </div>

        {deepDives.length > 0 && (
          <div style={{ background: '#000', padding: '0 20px 80px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
            <div className="ddp-container">

              {/* KATEGORI */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <span className="ddp-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>Kategori</span>
              </div>
              <div className="ddp-chips" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                <button type="button" onClick={() => setActiveCat(ALL)} style={chip(activeCat === ALL)}>Semua · {deepDives.length}</button>
                {categories.map(([cat, count]) => (
                  <button key={cat} type="button" onClick={() => setActiveCat(cat)} style={chip(activeCat === cat)}>{cat} · {count}</button>
                ))}
              </div>

              {/* DAFTAR */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 14px' }}>
                <span className="ddp-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>
                  {activeCat === ALL ? 'Semua Deep Dive' : activeCat}
                </span>
                <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>{list.length} ARTIKEL</span>
              </div>

              {list.length === 0 ? (
                <div style={{ padding: '50px 0', textAlign: 'center' }}>
                  <p style={{ ...m, color: '#aaa', fontSize: '14px' }}>
                    {activeCat === ALL ? 'Deep Dive lainnya segera hadir.' : 'Belum ada Deep Dive di kategori ini.'}
                  </p>
                </div>
              ) : (
                <div className="ddp-grid">
                  {list.map(article => <DDCard key={article.id} article={article} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes tn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        div::-webkit-scrollbar { display: none; }

        .ddp-container { max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @media (min-width: 640px) { .ddp-container { max-width: 100%; } }
        @media (min-width: 2000px) { .ddp-container { max-width: 1900px; } }

        .ddp-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }

        @media (min-width: 640px) {
          .ddp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (min-width: 1024px) {
          .ddp-hero-bg { padding-top: 130px !important; padding-left: 40px !important; padding-right: 40px !important; }
          .ddp-sec { font-size: 20px !important; }
          .ddp-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1440px) {
          .ddp-hero-bg { padding-top: 150px !important; }
          .ddp-sec { font-size: 22px !important; }
        }
        @media (min-width: 1600px) {
          .ddp-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </>
  );
};

export default DeepDive;
