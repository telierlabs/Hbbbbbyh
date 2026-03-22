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

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 14px' }}>
    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#555', flexShrink: 0 }} />
    <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#888', whiteSpace: 'nowrap', fontWeight: 700 }}>
      {label}
    </span>
    <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
  </div>
);

const Home: React.FC<HomeProps> = ({ articles, searchQuery = '' }) => {
  const { categoryName } = useParams<{ categoryName?: string }>();
  const [savedTicker, setSavedTicker] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const mn = String(now.getMinutes()).padStart(2, '0');
      setClock(`${h}:${mn}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

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

  const renderMixedFeed = (items: NewsArticle[]) => {
    const result: React.ReactNode[] = [];
    let i = 0;
    let blockIndex = 0;
    let lastCategoryLabel = '';

    const maybeShowLabel = (cat: string, key: string) => {
      let count = 0;
      for (let j = i; j < items.length && j < i + 4; j++) {
        if (items[j].category === cat) count++;
        else break;
      }
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
        maybeShowLabel(items[i].category, `f-${i}`);
        result.push(<NewsCard key={items[i].id} article={items[i]} variant="featured" />);
        i++;
        if (i + 1 < items.length) {
          const cat2 = items[i].category;
          const cat3 = items[i + 1].category;
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
          result.push(<NewsCard key={items[i].id} article={items[i]} variant="horizontal" />);
          i++;
        }
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
                  {/* H1 dengan oval di TURE */}
                  <h1 style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: 0 }}>
                    FU<span style={{ position: 'relative', display: 'inline-block' }}>
                      TURE
                      <svg
                        viewBox="0 0 80 46" fill="none"
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-8deg)', width: '115%', height: '140%', pointerEvents: 'none' }}
                      >
                        <ellipse cx="40" cy="23" rx="36" ry="19" stroke="#111" strokeWidth="1.4" opacity="0.3" />
                      </svg>
                    </span><br />NEWS<br />DIMENSION
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

                {/* Deskripsi + Stats + Email */}
                <div style={{ padding: '16px 20px 0', marginTop: '-52px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>

                    {/* Kiri: teks + email */}
                    <div style={{ flex: 1 }}>
                      <p style={{ ...m, color: '#aaa', fontSize: '13px', lineHeight: 1.7, maxWidth: '280px', marginBottom: '12px', fontWeight: 300 }}>
                        Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
                      </p>
                      {/* EMAIL SUBSCRIBE */}
                      {!subscribed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '220px' }}>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSubscribe(); }}
                            placeholder="Masukkan email kamu..."
                            style={{
                              width: '100%', padding: '10px 12px',
                              background: '#0d0d0d', border: '1px solid #1e1e1e',
                              borderRadius: '10px', fontSize: '12px', color: '#fff',
                              fontFamily: "'Montserrat', sans-serif", outline: 'none',
                            }}
                          />
                          <button
                            onClick={handleSubscribe}
                            style={{
                              width: 'fit-content', padding: '9px 18px',
                              background: '#fff', color: '#000', border: 'none',
                              borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                              cursor: 'pointer', fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            Langganan
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="9" height="9" fill="none" stroke="#888" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span style={{ ...mono, fontSize: '9px', color: '#555', letterSpacing: '0.1em' }}>Terima kasih! Kamu sudah terdaftar.</span>
                        </div>
                      )}
                    </div>

                    {/* Kanan: stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, textAlign: 'right', paddingTop: '2px' }}>
                      <div>
                        <span style={{ ...mono, fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
                          {articles.length || '—'}
                        </span>
                        <span style={{ ...mono, fontSize: '9px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Artikel</span>
                      </div>
                      <div style={{ width: '100%', height: '1px', background: '#1a1a1a' }} />
                      <div>
                        <span style={{ ...mono, fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
                          {clock}
                        </span>
                        <span style={{ ...mono, fontSize: '9px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>WIB</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* EXPLORE */}
                <div style={{ padding: '28px 20px 24px', display: 'flex', alignItems: 'flex-start', gap: '28px', borderBottom: '1px solid #1a1a1a' }}>
                  <h2 style={{
                    ...m, color: '#fff', fontSize: 'clamp(15px,3.5vw,22px)', fontWeight: 400,
                    letterSpacing: '0em', lineHeight: 1.2, textTransform: 'uppercase', flexShrink: 0,
                    paddingLeft: '14px', borderLeft: '1px solid #2a2a2a', position: 'relative',
                  }}>
                    {/* Shadow gelap sebelah kiri */}
                    <span style={{
                      position: 'absolute', left: '-1px', top: 0, bottom: 0, width: '60px',
                      background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      pointerEvents: 'none',
                    }} />
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
                  <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>Trending Sekarang</span>
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
                <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#888', whiteSpace: 'nowrap', fontWeight: 700 }}>Berita Terbaru</span>
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
