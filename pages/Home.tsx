import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

interface HomeProps {
  articles: NewsArticle[];
  searchQuery?: string;
}

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const Home: React.FC<HomeProps> = ({ articles, searchQuery = '' }) => {
  const { categoryName } = useParams<{ categoryName?: string }>();
  const [savedTicker, setSavedTicker] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryName]);

  // Ambil 5 artikel terbaru sebagai trending
  const trendingArticles = articles.slice(0, 5);

  const filteredArticles = articles.filter(article => {
    const matchCategory = categoryName
      ? article.category.toLowerCase() === categoryName.toLowerCase().replace(/ /g, '')
      : true;
    const matchSearch = searchQuery.trim()
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

  const isSearching = searchQuery.trim().length > 0;

  const toggleTickerSave = (id: string) => {
    setSavedTicker(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Format views fake tapi konsisten berdasarkan id artikel
  const fakeViews = (id: string) => {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 10000 + (hash % 90000);
    return base >= 1000 ? `${(base / 1000).toFixed(1)}K` : `${base}`;
  };

  const viewsPercent = (id: string) => {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 30 + (hash % 65);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />

      <div style={{ background: '#000' }}>
        {!categoryName && !isSearching && (
          <>
            {/* HERO */}
            <div style={{
              background: '#f5f5f7',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)`,
              backgroundSize: '40px 40px',
              paddingTop: '100px', paddingBottom: '16px',
              paddingLeft: '20px', paddingRight: '20px',
            }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ paddingBottom: '12px' }}>
                  <p style={{ ...mono, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#999', marginBottom: '16px', display: 'block' }}>
                    Cyberpunk Newsroom
                  </p>
                  <h1 style={{ ...m, fontSize: 'clamp(36px,10vw,66px)', fontWeight: 300, lineHeight: 1.0, letterSpacing: '-0.01em', color: '#000', margin: 0 }}>
                    FUTURE<br />NEWS<br />DIMENSION
                  </h1>
                </div>
                <img
                  src="/file_000000002bfc720b925d15254b6d39e9.png"
                  alt="Cylen"
                  style={{
                    height: 'clamp(200px, 40vw, 320px)',
                    width: 'auto',
                    objectFit: 'contain',
                    flexShrink: 0,
                    mixBlendMode: 'multiply',
                    marginBottom: '-16px',
                  }}
                />
              </div>
            </div>

            {/* DIVIDER */}
            <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
              <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px' }}>
                <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000" />
              </svg>
            </div>

            {/* BLACK SECTION */}
            <div style={{ background: '#000' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ padding: '16px 20px 0', marginTop: '-52px', position: 'relative', zIndex: 2 }}>
                  <p style={{ ...m, color: '#aaa', fontSize: '13px', lineHeight: 1.7, maxWidth: '280px' }}>
                    Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
                  </p>
                </div>
                <div style={{ padding: '28px 20px 24px', display: 'flex', alignItems: 'flex-start', gap: '28px', borderBottom: '1px solid #1a1a1a' }}>
                  <h2 style={{ ...m, color: '#fff', fontSize: 'clamp(15px,3.5vw,22px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, textTransform: 'uppercase', flexShrink: 0 }}>
                    EXPLORE THE FUTURE<br />OF DIGITAL NEWS
                  </h2>
                  <p style={{ ...m, color: '#666', fontSize: '12px', lineHeight: 1.7, paddingTop: '3px' }}>
                    Teknologi, geopolitik, dan masa depan — dalam satu tempat.
                  </p>
                </div>
              </div>
            </div>

            {/* TRENDING TICKER */}
            {trendingArticles.length > 0 && (
              <div style={{ background: '#000', paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #111' }}>
                {/* Header trending */}
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%', background: '#fff', flexShrink: 0,
                    animation: 'tn-pulse 2s infinite',
                  }} />
                  <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#555' }}>
                    Trending Sekarang
                  </span>
                </div>

                {/* Scroll */}
                <div style={{
                  display: 'flex', gap: '10px', padding: '0 20px',
                  overflowX: 'auto', scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  msOverflowStyle: 'none', scrollbarWidth: 'none',
                }}>
                  {trendingArticles.map((article, idx) => {
                    const isSaved = savedTicker.includes(article.id);
                    const pct = viewsPercent(article.id);
                    const views = fakeViews(article.id);
                    return (
                      <div
                        key={article.id}
                        style={{
                          flexShrink: 0, scrollSnapAlign: 'start', width: '210px',
                          background: '#0a0a0a', border: '1px solid #161616',
                          borderRadius: '10px', padding: '12px 14px',
                          display: 'flex', flexDirection: 'column', gap: '10px',
                          cursor: 'pointer', transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ ...mono, fontSize: '22px', fontWeight: 900, color: '#1c1c1c', lineHeight: 1, flexShrink: 0, minWidth: '28px' }}>
                            {String(idx + 1).padStart(2, '0')}
                          </div>
                          <div style={{
                            ...m, fontSize: '11px', fontWeight: 700, color: '#ccc',
                            lineHeight: 1.4, letterSpacing: '-0.01em', textTransform: 'uppercase',
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {article.title}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {/* Views bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '36px', height: '2px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#3a3a3a', borderRadius: '2px' }} />
                            </div>
                            <span style={{ ...mono, fontSize: '9px', color: '#444', letterSpacing: '0.1em' }}>{views}</span>
                          </div>
                          {/* Tombol simpan */}
                          <button
                            onClick={() => toggleTickerSave(article.id)}
                            style={{
                              width: '26px', height: '26px', borderRadius: '6px',
                              border: isSaved ? '1px solid #fff' : '1px solid #1e1e1e',
                              background: isSaved ? '#111' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: isSaved ? '#fff' : '#444',
                              transition: 'all 0.2s',
                            }}
                          >
                            <svg width="12" height="12" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* FEED BERITA */}
        <div style={{ background: '#000', padding: '0 16px 80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>

            {categoryName && !isSearching && (
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(24px,6vw,40px)', fontWeight: 700, textTransform: 'capitalize' }}>
                  {categoryName.replace(/%20/g, ' ')}
                </h1>
                <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>{filteredArticles.length} artikel ditemukan</p>
              </div>
            )}

            {isSearching && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>Hasil pencarian</p>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(20px,5vw,32px)', fontWeight: 700 }}>
                  "{searchQuery}"
                </h1>
                <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>{filteredArticles.length} berita ditemukan</p>
              </div>
            )}

            {!categoryName && !isSearching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
                <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', whiteSpace: 'nowrap' }}>Berita Terbaru</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#ffffff22,transparent)' }} />
              </div>
            )}

            {filteredArticles.length === 0 ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <p style={{ color: '#444', fontSize: '14px' }}>
                  {isSearching
                    ? `Tidak ada berita untuk "${searchQuery}".`
                    : categoryName
                      ? `Belum ada berita untuk kategori "${categoryName.replace(/%20/g, ' ')}".`
                      : 'Belum ada berita untuk saat ini.'}
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default Home;
