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

// Label section kategori — muncul kalau 2+ artikel berturutan sama kategorinya
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 14px' }}>
    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
    <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#333', whiteSpace: 'nowrap' }}>
      {label}
    </span>
    <div style={{ flex: 1, height: '1px', background: '#111' }} />
  </div>
);

const Home: React.FC<HomeProps> = ({ articles, searchQuery = '' }) => {
  const { categoryName } = useParams<{ categoryName?: string }>();
  const [savedTicker, setSavedTicker] = useState<string[]>([]);

  useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

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
    setSavedTicker(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const fakeViews = (id: string) => {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 10000 + (hash % 90000);
    return `${(base / 1000).toFixed(1)}K`;
  };

  const viewsPercent = (id: string) => {
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 30 + (hash % 65);
  };

  // ── MIXED LAYOUT BUILDER ──
  // Pola: featured, [small,small], featured, horizontal x3, [small,small], horizontal x3, dst
  const renderMixedFeed = (items: NewsArticle[]) => {
    const result: React.ReactNode[] = [];
    let i = 0;
    let blockIndex = 0;

    // Track kategori untuk label
    let lastCategoryLabel = '';

    const maybeShowLabel = (cat: string, key: string) => {
      // Hitung berapa artikel kategori ini berturutan dari posisi i
      let count = 0;
      for (let j = i; j < items.length && j < i + 4; j++) {
        if (items[j].category === cat) count++;
        else break;
      }
      // Tampilkan label kalau 2+ artikel sama kategori berturutan dan belum pernah ditampilkan
      if (count >= 2 && cat !== lastCategoryLabel) {
        lastCategoryLabel = cat;
        result.push(<SectionLabel key={`label-${key}`} label={cat} />);
      } else if (count < 2) {
        lastCategoryLabel = '';
      }
    };

    while (i < items.length) {
      const pattern = blockIndex % 3;

      if (pattern === 0) {
        // FEATURED
        maybeShowLabel(items[i].category, `f-${i}`);
        result.push(<NewsCard key={items[i].id} article={items[i]} variant="featured" />);
        i++;

        // Double setelah featured (kalau ada 2 artikel berikutnya)
        if (i + 1 < items.length) {
          const cat2 = items[i].category;
          const cat3 = items[i + 1].category;
          // Label untuk double hanya kalau keduanya sama kategori
          if (cat2 === cat3 && cat2 !== lastCategoryLabel) {
            result.push(<SectionLabel key={`label-d-${i}`} label={cat2} />);
            lastCategoryLabel = cat2;
          }
          result.push(
            <div key={`double-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <NewsCard article={items[i]} variant="small" />
              <NewsCard article={items[i + 1]} variant="small" />
            </div>
          );
          i += 2;
        }

      } else if (pattern === 1) {
        // 3x HORIZONTAL
        const end = Math.min(i + 3, items.length);
        const groupCat = items[i].category;
        const allSame = items.slice(i, end).every(a => a.category === groupCat);
        if (allSame && groupCat !== lastCategoryLabel) {
          result.push(<SectionLabel key={`label-h-${i}`} label={groupCat} />);
          lastCategoryLabel = groupCat;
        } else if (!allSame) {
          lastCategoryLabel = '';
        }
        for (let j = i; j < end; j++) {
          result.push(<NewsCard key={items[j].id} article={items[j]} variant="horizontal" />);
        }
        i = end;

      } else {
        // Double lagi
        if (i + 1 < items.length) {
          const cat2 = items[i].category;
          const cat3 = items[i + 1].category;
          if (cat2 === cat3 && cat2 !== lastCategoryLabel) {
            result.push(<SectionLabel key={`label-d2-${i}`} label={cat2} />);
            lastCategoryLabel = cat2;
          }
          result.push(
            <div key={`double2-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <NewsCard article={items[i]} variant="small" />
              <NewsCard article={items[i + 1]} variant="small" />
            </div>
          );
          i += 2;
        } else {
          // Sisa 1 artikel
          result.push(<NewsCard key={items[i].id} article={items[i]} variant="horizontal" />);
          i++;
        }
        // Featured setelah double
        if (i < items.length) {
          maybeShowLabel(items[i].category, `f2-${i}`);
          result.push(<NewsCard key={items[i].id} article={items[i]} variant="featured" />);
          i++;
        }
      }

      blockIndex++;
    }

    return result;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />

      <div style={{ background: '#000' }}>
        {!categoryName && !isSearching && (
          <>
            {/* HERO */}
            <div style={{
              background: '#f5f5f7',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)`,
              backgroundSize: '40px 40px',
              paddingTop: '100px', paddingBottom: '16px',
              paddingLeft: '20px', paddingRight: '0px',
              overflow: 'hidden',
            }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0px' }}>
                <div style={{ paddingBottom: '16px', flex: '1 1 auto' }}>
                  <p style={{ ...mono, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#999', marginBottom: '14px', display: 'block' }}>
                    Cyberpunk Newsroom
                  </p>
                  <h1 style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: 0 }}>
                    FUTURE<br />NEWS<br />DIMENSION
                  </h1>
                </div>
                <img
                  src="/file_000000002bfc720b925d15254b6d39e9.png"
                  alt="Cylen"
                  style={{ height: 'clamp(220px, 48vw, 340px)', width: 'auto', objectFit: 'contain', flexShrink: 0, mixBlendMode: 'multiply', marginBottom: '-16px', marginRight: '-10px' }}
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
                  <h2 style={{ ...m, color: '#fff', fontSize: 'clamp(15px,3.5vw,22px)', fontWeight: 400, letterSpacing: '0em', lineHeight: 1.2, textTransform: 'uppercase', flexShrink: 0 }}>
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
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', flexShrink: 0, animation: 'tn-pulse 2s infinite' }} />
                  <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#555' }}>Trending Sekarang</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {trendingArticles.map((article, idx) => {
                    const isSaved = savedTicker.includes(article.id);
                    const pct = viewsPercent(article.id);
                    const views = fakeViews(article.id);
                    return (
                      <div key={article.id} style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '210px', background: '#0a0a0a', border: '1px solid #161616', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ ...mono, fontSize: '22px', fontWeight: 900, color: '#1c1c1c', lineHeight: 1, flexShrink: 0, minWidth: '28px' }}>{String(idx + 1).padStart(2, '0')}</div>
                          <div style={{ ...m, fontSize: '11px', fontWeight: 500, color: '#ccc', lineHeight: 1.4, textTransform: 'uppercase', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '36px', height: '2px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#3a3a3a', borderRadius: '2px' }} />
                            </div>
                            <span style={{ ...mono, fontSize: '9px', color: '#444' }}>{views}</span>
                          </div>
                          <button onClick={() => toggleTickerSave(article.id)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: isSaved ? '1px solid #fff' : '1px solid #1e1e1e', background: isSaved ? '#111' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isSaved ? '#fff' : '#444', transition: 'all 0.2s' }}>
                            <svg width="12" height="12" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
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

        {/* FEED */}
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
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(20px,5vw,32px)', fontWeight: 700 }}>"{searchQuery}"</h1>
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
                  {isSearching ? `Tidak ada berita untuk "${searchQuery}".` : categoryName ? `Belum ada berita untuk kategori "${categoryName.replace(/%20/g, ' ')}".` : 'Belum ada berita untuk saat ini.'}
                </p>
              </div>
            ) : (
              /* Mixed layout di homepage, default di kategori/search */
              !categoryName && !isSearching
                ? renderMixedFeed(filteredArticles)
                : filteredArticles.map(article => <NewsCard key={article.id} article={article} />)
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
