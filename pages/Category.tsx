import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import ArticleFeed from '../components/ArticleFeed';
import NewsCard, { BmBtn } from '../components/NewsCard';
import HeroCard from '../components/HeroCard';

interface CategoryProps { articles: NewsArticle[]; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Jumlah berita per "Muat lebih banyak"
const PAGE = 7;

const slug = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '');
const readMinutes = (a: NewsArticle): number =>
  Math.max(1, Math.round((a.content || '').split(/\s+/).filter(Boolean).length / 200));
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
const byNewest = (a: NewsArticle, b: NewsArticle) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const SecTitle: React.FC<{ label: string; right?: string }> = ({ label, right }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
    <span className="cat-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>{label}</span>
    {right && <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>{right}</span>}
  </div>
);

// Halaman "home" tiap kategori: hero berita terbaru kategori itu, Top Stories, Berita Terbaru, Deep Dive, kategori lain.
const Category: React.FC<CategoryProps> = ({ articles }) => {
  const navigate = useNavigate();
  const { categoryName } = useParams<{ categoryName: string }>();
  const key = slug(decodeURIComponent(categoryName || ''));
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => { window.scrollTo(0, 0); setLimit(PAGE); }, [key]);

  const inCat = useMemo(() => articles.filter(a => slug(a.category) === key).sort(byNewest), [articles, key]);
  const regular = useMemo(() => inCat.filter(a => a.articleType !== 'deepdive'), [inCat]);
  const deepDives = useMemo(() => inCat.filter(a => a.articleType === 'deepdive'), [inCat]);

  // Nama tampilan: pakai penulisan asli dari artikel; kalau kosong, dari URL
  const displayName = inCat[0]?.category || decodeURIComponent(categoryName || '').replace(/-/g, ' ');

  // Kategori lain + jumlah berita
  const others = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach(a => { if (a.category && slug(a.category) !== key) counts.set(a.category, (counts.get(a.category) || 0) + 1); });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [articles, key]);

  const hero = regular[0] || deepDives[0];
  const topStories = regular.slice(1, 6);
  const feed = regular.slice(hero && regular[0] ? 1 : 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO */}
        <div
          className="cat-hero-bg"
          style={{ background: '#f5f5f7', backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)', backgroundSize: '40px 40px', padding: '100px 20px 8px' }}
        >
          <div className="cat-container">
            {hero ? (
              <HeroCard
                image={hero.imageUrl}
                tags={[`${displayName} Terbaru`, `${readMinutes(hero)} mnt baca`]}
                eyebrow={hero.category}
                title={hero.title}
                summary={hero.summary}
                cta="Baca Berita →"
                meta={`${hero.author} · ${formatDate(hero.publishedAt)}`}
                onClick={() => navigate(`/news/${hero.id}`)}
              />
            ) : (
              <div style={{ border: '1px dashed #bbb', borderRadius: '16px', padding: '48px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.6)' }}>
                <p style={{ ...m, fontSize: '14px', color: '#555', margin: '0 0 14px' }}>Belum ada berita untuk kategori {displayName}.</p>
                <button type="button" onClick={() => navigate('/')} style={{ ...m, background: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>← Kembali ke Beranda</button>
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

        <div style={{ background: '#000', padding: '0 20px 80px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
          <div className="cat-container">

            {/* TOP STORIES kategori */}
            {topStories.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <SecTitle label={`Top Stories · ${displayName}`} />
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {topStories.map(a => (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/news/${a.id}`)}
                      style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '240px', background: '#080808', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
                    >
                      <div style={{ position: 'relative', paddingTop: '60%', background: '#111' }}>
                        <img src={a.imageUrl} alt={a.title} loading="lazy" referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }} />
                      </div>
                      <div style={{ padding: '12px' }}>
                        <div style={{ ...m, fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '10px' }}>{a.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ ...mono, fontSize: '10px', color: '#888' }}>{formatDate(a.publishedAt)}</span>
                          <BmBtn article={a} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BERITA TERBARU kategori */}
            <SecTitle label={`Berita Terbaru · ${displayName}`} right={regular.length > 0 ? `${regular.length} BERITA` : undefined} />
            {feed.length === 0 ? (
              <div style={{ padding: '40px 0 48px', textAlign: 'center', border: '1px dashed #1e1e1e', borderRadius: '12px' }}>
                <p style={{ ...m, color: '#aaa', fontSize: '13px', margin: 0 }}>Belum ada berita lain di kategori ini.</p>
              </div>
            ) : (
              <>
                <ArticleFeed items={feed.slice(0, limit)} />
                {feed.length > limit && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button type="button" onClick={() => setLimit(n => n + PAGE)} style={{ ...mono, background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '11px 22px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
                      Muat lebih banyak ({feed.length - limit})
                    </button>
                  </div>
                )}
              </>
            )}

            {/* DEEP DIVE kategori */}
            {deepDives.length > 0 && (
              <div style={{ marginTop: '36px' }}>
                <SecTitle label={`Deep Dive · ${displayName}`} right={`${deepDives.length} ARTIKEL`} />
                <div className="cat-dd">
                  {deepDives.map(a => <NewsCard key={a.id} article={a} variant="horizontal" />)}
                </div>
              </div>
            )}

            {/* KATEGORI LAIN */}
            {others.length > 0 && (
              <div style={{ marginTop: '36px' }}>
                <SecTitle label="Kategori Lain" />
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {others.map(([cat, n]) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}
                      style={{ ...mono, flexShrink: 0, padding: '8px 14px', borderRadius: '999px', border: '1px solid #2a2a2a', background: 'transparent', color: '#aaa', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {cat} · {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        div::-webkit-scrollbar { display: none; }
        .cat-container { max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @media (min-width: 640px) { .cat-container { max-width: 100%; } }
        @media (min-width: 900px) {
          .cat-dd { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); column-gap: 20px; align-items: start; }
        }
        @media (min-width: 1024px) {
          .cat-hero-bg { padding-top: 130px !important; }
          .cat-sec { font-size: 20px !important; }
        }
      `}</style>
    </>
  );
};

export default Category;
