import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import NewsCard, { BmBtn } from '../components/NewsCard';
import { formatViews } from '../services/articleService';

interface HomeProps { articles: NewsArticle[]; searchQuery?: string; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const NEWSLETTERS = [
  { id: 'daily', name: 'Daily Digest', desc: '5 berita terpenting hari ini', icon: '/92122ef670ec1bfdab57482955e6d05b.jpg' },
  { id: 'tech', name: 'Tech Pulse', desc: 'AI & teknologi terbaru', icon: '/104b2b613ca32b6bac89f7d2772061be.jpg' },
  { id: 'geo', name: 'Geopolitik Weekly', desc: 'Analisis situasi global', icon: '/516535ef10bc1f6028b46929407ef2c2.jpg' },
  { id: 'market', name: 'Market Signal', desc: 'Sinyal ekonomi & pasar', icon: '/cce58a930b8baef640e391c40f4c50e4.jpg' },
  { id: 'space', name: 'Deep Space', desc: 'Sains & eksplorasi antariksa', icon: '/d64b0fd6a66dfdc95b4095bff97c9aee.jpg' },
  { id: 'cyber', name: 'Cyber Intel', desc: 'Keamanan digital & siber', icon: '/a8eeb6ba34345dff2e345628f17fbae6.jpg' },
];

const SecHeader: React.FC<{ label: string; pulse?: boolean }> = ({ label, pulse }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', flexShrink: 0, animation: pulse ? 'tn-pulse 2s infinite' : 'none' }} />
    <span style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#ffffff33,transparent)' }} />
  </div>
);

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0 14px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#aaa', flexShrink: 0 }} />
    <span style={{ ...m, fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: '#2a2a2a' }} />
  </div>
);

const NewsletterStrip: React.FC = () => (
  <>
    <SecHeader label="Newsletter" />
    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none', marginBottom: '28px' }}>
      {NEWSLETTERS.map(nl => (
        <div key={nl.id}
          style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '210px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#222', border: '1px solid #333', flexShrink: 0, overflow: 'hidden' }}>
            <img src={nl.icon} alt={nl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nl.name}</span>
            <span style={{ ...m, fontSize: '12px', color: '#aaa', lineHeight: 1.4, display: 'block' }}>{nl.desc}</span>
          </div>
        </div>
      ))}
    </div>
  </>
);

const Home: React.FC<HomeProps> = ({ articles, searchQuery = '' }) => {
  // ✅ Filter topik dari Profile — [] = semua, ['Tech','AI'] = filter aktif
  const [activeTopics, setActiveTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tn_topics');
      if (!saved) return [];
      return JSON.parse(saved);
    } catch { return []; }
  });

  // Sync saat user ubah topik di Profile (tanpa reload)
  useEffect(() => {
    const onTopicsUpdate = () => {
      try {
        const saved = localStorage.getItem('tn_topics');
        setActiveTopics(saved ? JSON.parse(saved) : []);
      } catch { setActiveTopics([]); }
    };
    window.addEventListener('topics-updated', onTopicsUpdate);
    return () => window.removeEventListener('topics-updated', onTopicsUpdate);
  }, []);

  const { categoryName } = useParams<{ categoryName?: string }>();
  const navigate = useNavigate();
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
    const matchCategory = categoryName
      ? article.category.toLowerCase() === categoryName.toLowerCase().replace(/ /g, '')
      : true;
    const matchSearch = searchQuery.trim()
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    // ✅ Filter topik dari preferensi user ([] = semua)
    const matchTopic = activeTopics.length === 0
      ? true
      : activeTopics.some(t => article.category.toLowerCase() === t.toLowerCase());
    return matchCategory && matchSearch && matchTopic;
  });

  const isSearching = searchQuery.trim().length > 0;

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
            <div style={{ background: '#f5f5f7', backgroundImage: `linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)`, backgroundSize: '40px 40px', paddingTop: '100px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '0', overflow: 'hidden' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ paddingBottom: '16px', flex: '1 1 auto' }}>
                  <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '14px', display: 'block' }}>Cyberpunk Newsroom</p>
                  <h1 style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: 0 }}>
                    FU<span style={{ position: 'relative', display: 'inline-block' }}>TURE
                      <svg viewBox="0 0 80 46" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-8deg)', width: '115%', height: '140%', pointerEvents: 'none' }}>
                        <ellipse cx="40" cy="23" rx="36" ry="19" stroke="#111" strokeWidth="1.4" opacity="0.3" />
                      </svg>
                    </span><br />NEWS<br />DIMENSION
                  </h1>
                </div>

                {/* ✅ VR IMAGE — animasi glow ngikutin kontur gambar via filter */}
                <img
                  src="/104411-removebg-preview.png"
                  alt="Cylen"
                  className="vr-hero-img"
                  style={{
                    height: 'clamp(220px,48vw,340px)',
                    width: 'auto',
                    objectFit: 'contain',
                    flexShrink: 0,
                    mixBlendMode: 'multiply',
                    marginBottom: '-16px',
                    marginRight: '-10px',
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

            {/* STATS + EMAIL */}
            <div style={{ background: '#000' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ padding: '16px 20px 0', marginTop: '-52px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      {!subscribed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '260px' }}>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubscribe(); }} placeholder="Masukkan email kamu..."
                            style={{ width: '100%', padding: '10px 12px', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '10px', fontSize: '13px', color: '#fff', fontFamily: "'Montserrat',sans-serif", outline: 'none' }} />
                          <button onClick={handleSubscribe} style={{ width: 'fit-content', padding: '7px 14px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Montserrat',sans-serif" }}>Langganan</button>
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
                    <span style={{ position: 'absolute', left: '-1px', top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to right,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.4) 50%,transparent 100%)', pointerEvents: 'none' }} />
                    EXPLORE THE FUTURE<br />OF DIGITAL NEWS
                  </h2>
                  <p style={{ ...m, color: '#aaa', fontSize: '13px', lineHeight: 1.7, paddingTop: '3px' }}>Teknologi, geopolitik, dan masa depan — dalam satu tempat.</p>
                </div>
              </div>
            </div>

            {/* TRENDING — pakai BmBtn (Firebase-aware) */}
            {trendingArticles.length > 0 && (
              <div style={{ background: '#000', paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #111' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 12px' }}>
                  <SecHeader label="Trending Sekarang" pulse />
                </div>
                <div style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                  {trendingArticles.map((article, idx) => {
                    const viewCount = formatViews(article.views ?? 0);
                    return (
                      <div
                        key={article.id}
                        onClick={() => navigate(`/news/${article.id}`)}
                        style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '220px', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ ...mono, fontSize: '24px', fontWeight: 900, color: '#2a2a2a', lineHeight: 1, flexShrink: 0, minWidth: '32px' }}>{String(idx+1).padStart(2,'0')}</div>
                          <div style={{ ...m, fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: 1.4, textTransform: 'uppercase', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" fill="none" stroke="#888" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            <span style={{ ...mono, fontSize: '11px', color: '#aaa' }}>{viewCount}</span>
                          </div>
                          {/* ✅ BmBtn Firebase-aware — bukan state lokal */}
                          <BmBtn article={article} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NEWSLETTER */}
            <div style={{ background: '#000', padding: '20px 20px 0', borderBottom: '1px solid #111', maxWidth: '600px', margin: '0 auto' }}>
              <NewsletterStrip />
            </div>
          </>
        )}

        {/* FEED */}
        <div style={{ background: '#000', padding: '0 20px 80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '28px' }}>

            {categoryName && !isSearching && (
              <>
                <NewsletterStrip />
                <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '24px', marginBottom: '20px' }}>
                  <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(22px,5vw,34px)', fontWeight: 700, textTransform: 'capitalize', marginBottom: '6px' }}>
                    {categoryName.replace(/%20/g, ' ')}
                  </h1>
                  <p style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em' }}>{filteredArticles.length} ARTIKEL DITEMUKAN</p>
                </div>
                {filteredArticles.length === 0 ? (
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '14px' }}>Belum ada berita untuk kategori ini.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {filteredArticles.map(article => <NewsCard key={article.id} article={article} variant="horizontal" />)}
                  </div>
                )}
              </>
            )}

            {isSearching && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ ...mono, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: '6px' }}>Hasil pencarian</p>
                  <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(20px,5vw,32px)', fontWeight: 700 }}>"{searchQuery}"</h1>
                  <p style={{ ...mono, fontSize: '11px', color: '#aaa', marginTop: '6px', letterSpacing: '0.1em' }}>{filteredArticles.length} BERITA DITEMUKAN</p>
                </div>
                {filteredArticles.length === 0 ? (
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '14px' }}>Tidak ada berita untuk "{searchQuery}".</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {filteredArticles.map(article => <NewsCard key={article.id} article={article} variant="horizontal" />)}
                  </div>
                )}
              </>
            )}

            {!categoryName && !isSearching && (
              <>
                <SecHeader label="Berita Terbaru" />
                {activeTopics.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#555', letterSpacing: '0.15em' }}>FILTER AKTIF:</span>
                    {activeTopics.map(t => (
                      <span key={t} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#fff', letterSpacing: '0.1em', padding: '3px 8px', background: '#1a1a1a', borderRadius: '4px', border: '1px solid #333', textTransform: 'uppercase' }}>{t}</span>
                    ))}
                  </div>
                )}
                {filteredArticles.length === 0 ? (
                  <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '14px' }}>Belum ada berita untuk saat ini.</p>
                  </div>
                ) : renderMixedFeed(filteredArticles)}
              </>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Glow berkilau ngikutin kontur gambar — kiri kanan pulse */
        @keyframes vr-glow {
          0%   { filter: drop-shadow(0 0 4px rgba(0,255,80,0.5)) drop-shadow(0 0 8px rgba(0,255,80,0.2)); }
          25%  { filter: drop-shadow(-6px 0 8px rgba(0,255,80,0.8)) drop-shadow(0 0 16px rgba(0,255,80,0.4)); }
          50%  { filter: drop-shadow(0 0 14px rgba(0,255,80,1)) drop-shadow(0 0 28px rgba(0,255,80,0.6)); }
          75%  { filter: drop-shadow(6px 0 8px rgba(0,255,80,0.8)) drop-shadow(0 0 16px rgba(0,255,80,0.4)); }
          100% { filter: drop-shadow(0 0 4px rgba(0,255,80,0.5)) drop-shadow(0 0 8px rgba(0,255,80,0.2)); }
        }

        .vr-hero-img {
          animation: vr-glow 2.6s ease-in-out infinite;
        }

        div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default Home;
