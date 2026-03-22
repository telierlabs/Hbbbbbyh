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

const NEWSLETTERS = [
  {
    id: 'daily',
    name: 'Daily Digest',
    desc: '5 berita terpenting hari ini',
    icon: <svg width="24" height="24" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>,
  },
  {
    id: 'tech',
    name: 'Tech Pulse',
    desc: 'AI & teknologi terbaru',
    icon: <svg width="24" height="24" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  },
  {
    id: 'geo',
    name: 'Geopolitik Weekly',
    desc: 'Analisis situasi global',
    icon: <svg width="24" height="24" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  {
    id: 'market',
    name: 'Market Signal',
    desc: 'Sinyal ekonomi & pasar',
    icon: <svg width="24" height="24" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>,
  },
  {
    id: 'space',
    name: 'Deep Space',
    desc: 'Sains & eksplorasi antariksa',
    icon: <svg width="24" height="24" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  },
  {
    id: 'cyber',
    name: 'Cyber Intel',
    desc: 'Keamanan digital & siber',
    icon: <svg width="24" height="24" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  },
];

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 14px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#aaa', flexShrink: 0 }} />
    <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap', fontWeight: 700 }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: '#2a2a2a' }} />
  </div>
);

const Home: React.FC<HomeProps> = ({ articles, searchQuery = '' }) => {
  const { categoryName } = useParams<{ categoryName?: string }>();
  const [savedTicker, setSavedTicker] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true); setEmail('');
  };

  const trendingArticles = articles.slice(0, 5);

  const filteredArticles = articles.filter(article => {
    const matchCategory = categoryName ? article.category.toLowerCase() === categoryName.toLowerCase().replace(/ /g, '') : true;
    const matchSearch = searchQuery.trim()
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

  const isSearching = searchQuery.trim().length > 0;
  const toggleTickerSave = (id: string) => setSavedTicker(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const fakeViews = (id: string) => { const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0); return `${((10000 + (hash % 90000)) / 1000).toFixed(1)}K`; };
  const viewsPercent = (id: string) => { const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0); return 30 + (hash % 65); };

  const renderMixedFeed = (items: NewsArticle[]) => {
    const result: React.ReactNode[] = [];
    let i = 0, blockIndex = 0, lastCategoryLabel = '';
    const maybeShowLabel = (cat: string, key: string) => {
      let count = 0;
      for (let j = i; j < items.length && j < i + 4; j++) { if (items[j].category === cat) count++; else break; }
      if (count >= 2 && cat !== lastCategoryLabel) { lastCategoryLabel = cat; result.push(<SectionLabel key={`label-${key}`} label={cat} />); }
      else if (count < 2) lastCategoryLabel = '';
    };
    while (i < items.length) {
      const pattern = blockIndex % 3;
      if (pattern === 0) {
        maybeShowLabel(items[i].category, `f-${i}`);
        result.push(<NewsCard key={items[i].id} article={items[i]} variant="featured" />); i++;
        if (i + 1 < items.length) {
          const cat2 = items[i].category, cat3 = items[i+1].category;
          if (cat2 === cat3 && cat2 !== lastCategoryLabel) { result.push(<SectionLabel key={`label-d-${i}`} label={cat2} />); lastCategoryLabel = cat2; }
          result.push(<div key={`double-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}><NewsCard article={items[i]} variant="small" /><NewsCard article={items[i+1]} variant="small" /></div>);
          i += 2;
        }
      } else if (pattern === 1) {
        const end = Math.min(i + 3, items.length), groupCat = items[i].category;
        const allSame = items.slice(i, end).every(a => a.category === groupCat);
        if (allSame && groupCat !== lastCategoryLabel) { result.push(<SectionLabel key={`label-h-${i}`} label={groupCat} />); lastCategoryLabel = groupCat; }
        else if (!allSame) lastCategoryLabel = '';
        for (let j = i; j < end; j++) result.push(<NewsCard key={items[j].id} article={items[j]} variant="horizontal" />);
        i = end;
      } else {
        if (i + 1 < items.length) {
          const cat2 = items[i].category, cat3 = items[i+1].category;
          if (cat2 === cat3 && cat2 !== lastCategoryLabel) { result.push(<SectionLabel key={`label-d2-${i}`} label={cat2} />); lastCategoryLabel = cat2; }
          result.push(<div key={`double2-${i}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}><NewsCard article={items[i]} variant="small" /><NewsCard article={items[i+1]} variant="small" /></div>);
          i += 2;
        } else { result.push(<NewsCard key={items[i].id} article={items[i]} variant="horizontal" />); i++; }
        if (i < items.length) { maybeShowLabel(items[i].category, `f2-${i}`); result.push(<NewsCard key={items[i].id} article={items[i]} variant="featured" />); i++; }
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
            <div style={{ background: '#f5f5f7', backgroundImage: `linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)`, backgroundSize: '40px 40px', paddingTop: '100px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '0px', overflow: 'hidden' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ paddingBottom: '16px', flex: '1 1 auto' }}>
                  <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '14px', display: 'block' }}>Cyberpunk Newsroom</p>
                  <h1 style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: 0 }}>
                    FU<span style={{ position: 'relative', display: 'inline-block' }}>TURE
                      <svg viewBox="0 0 80 46" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-8deg)', width: '115%', height: '140%', pointerEvents: 'none' }}>
                        <ellipse cx="40" cy="23" rx="36" ry="19" stroke="#111" strokeWidth="1.4" opacity="0.3" />
                      </svg>
                    </span><br />NEWS<br />DIMENSION
                  </h1>
                </div>
                <img src="/file_000000002bfc720b925d15254b6d39e9.png" alt="Cylen" style={{ height: 'clamp(220px, 48vw, 340px)', width: 'auto', objectFit: 'contain', flexShrink: 0, mixBlendMode: 'multiply', marginBottom: '-16px', marginRight: '-10px' }} />
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ ...m, color: '#ccc', fontSize: '14px', lineHeight: 1.7, maxWidth: '280px', marginBottom: '14px', fontWeight: 300 }}>
                        Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
                      </p>
                      {!subscribed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '220px' }}>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubscribe(); }} placeholder="Masukkan email kamu..."
                            style={{ width: '100%', padding: '10px 12px', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', fontSize: '13px', color: '#fff', fontFamily: "'Montserrat', sans-serif", outline: 'none' }} />
                          <button onClick={handleSubscribe} style={{ width: 'fit-content', padding: '9px 18px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
                            Langganan
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="11" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>Terima kasih! Kamu sudah terdaftar.</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, textAlign: 'right', paddingTop: '2px' }}>
                      <div>
                        <span style={{ ...mono, fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', display: 'block', lineHeight: 1 }}>{articles.length || '—'}</span>
                        <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Artikel</span>
                      </div>
                      <div style={{ width: '100%', height: '1px', background: '#1e1e1e' }} />
                      <div>
                        <span style={{ ...mono, fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', display: 'block', lineHeight: 1 }}>{clock}</span>
                        <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>WIB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPLORE */}
                <div style={{ padding: '28px 20px 24px', display: 'flex', alignItems: 'flex-start', gap: '28px', borderBottom: '1px solid #1a1a1a' }}>
                  <h2 style={{ ...m, color: '#fff', fontSize: 'clamp(16px,3.5vw,22px)', fontWeight: 700, lineHeight: 1.2, textTransform: 'uppercase', flexShrink: 0, paddingLeft: '14px', borderLeft: '1px solid #2a2a2a', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '-1px', top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)', pointerEvents: 'none' }} />
                    EXPLORE THE FUTURE<br />OF DIGITAL NEWS
                  </h2>
                  <p style={{ ...m, color: '#aaa', fontSize: '13px', lineHeight: 1.7, paddingTop: '3px' }}>
                    Teknologi, geopolitik, dan masa depan — dalam satu tempat.
                  </p>
                </div>
              </div>
            </div>

            {/* TRENDING TICKER */}
            {trendingArticles.length > 0 && (
              <div style={{ background: '#000', paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #111' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', flexShrink: 0, animation: 'tn-pulse 2s infinite' }} />
                  <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>Trending Sekarang</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {trendingArticles.map((article, idx) => {
                    const isSaved = savedTicker.includes(article.id);
                    const views = fakeViews(article.id);
                    return (
                      <div key={article.id}
                        style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '220px', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ ...mono, fontSize: '24px', fontWeight: 900, color: '#2a2a2a', lineHeight: 1, flexShrink: 0, minWidth: '32px' }}>{String(idx + 1).padStart(2, '0')}</div>
                          <div style={{ ...m, fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: 1.4, textTransform: 'uppercase', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" fill="none" stroke="#888" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            <span style={{ ...mono, fontSize: '11px', color: '#aaa' }}>{views}</span>
                          </div>
                          <button onClick={() => toggleTickerSave(article.id)}
                            style={{ width: '28px', height: '28px', borderRadius: '7px', border: isSaved ? '1px solid #fff' : '1px solid #2a2a2a', background: isSaved ? '#111' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isSaved ? '#fff' : '#555', transition: 'all 0.2s' }}>
                            <svg width="13" height="13" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── NEWSLETTER ── */}
            <div style={{ background: '#000', paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #111' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
                <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>Newsletter</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#ffffff33,transparent)' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {NEWSLETTERS.map(nl => (
                  <div key={nl.id}
                    style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '220px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#222', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {nl.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nl.name}</span>
                      <span style={{ ...m, fontSize: '13px', color: '#aaa', lineHeight: 1.4, display: 'block' }}>{nl.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}

        {/* FEED */}
        <div style={{ background: '#000', padding: '0 16px 80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>

            {categoryName && !isSearching && (
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(24px,6vw,40px)', fontWeight: 700, textTransform: 'capitalize' }}>{categoryName.replace(/%20/g, ' ')}</h1>
                <p style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>{filteredArticles.length} artikel ditemukan</p>
              </div>
            )}

            {isSearching && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ ...mono, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: '6px' }}>Hasil pencarian</p>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(20px,5vw,32px)', fontWeight: 700 }}>"{searchQuery}"</h1>
                <p style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>{filteredArticles.length} berita ditemukan</p>
              </div>
            )}

            {!categoryName && !isSearching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
                <span style={{ ...m, fontSize: '16px', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap', fontWeight: 700 }}>Berita Terbaru</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#ffffff33,transparent)' }} />
              </div>
            )}

            {filteredArticles.length === 0 ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <p style={{ color: '#aaa', fontSize: '14px' }}>
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
