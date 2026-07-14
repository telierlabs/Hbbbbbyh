import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

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

// Format tanggal untuk hero: "4 JULI 2026"
const heroDateFmt = (dateStr: string): string => {
  const d = new Date(dateStr);
  const months = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

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

// ── HERO: berita utama (bukan lagi branding text) ──
const HeroArticle: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div style={{ position: 'relative', background: '#000' }}>
    <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ position: 'relative', width: '100%', paddingTop: '108%', overflow: 'hidden' }}>
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 100%)' }} />

        <div style={{ position: 'absolute', top: '90px', left: '20px', right: '20px' }}>
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.2em', color: '#ccc', textTransform: 'uppercase' }}>
            {article.category} · {heroDateFmt(article.publishedAt)}
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px' }}>
          <h1 style={{ ...m, fontSize: 'clamp(22px,6vw,32px)', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: '10px' }}>
            {article.title}
          </h1>
          <p style={{ ...m, fontSize: '13px', color: '#ccc', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.summary}
          </p>
          <span style={{ display: 'inline-block', padding: '10px 20px', background: '#fff', color: '#000', borderRadius: '24px', fontSize: '12px', fontWeight: 700, ...m }}>
            Baca Selengkapnya
          </span>
        </div>
      </div>
    </Link>

    {/* AI INSIGHT — hanya tampil kalau artikel punya aiInsight dari Admin */}
    {article.aiInsight && article.aiInsight.length > 0 && (
      <div style={{ margin: '-28px 20px 0', position: 'relative', zIndex: 2, background: '#0d0d0d', border: '1px solid #222', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase' }}>AI Insight</span>
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0 }}>
          {article.aiInsight.map((point, i) => (
            <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ ...mono, fontSize: '10px', color: '#555', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ ...m, fontSize: '12px', color: '#ddd', lineHeight: 1.6 }}>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// ── TOP STORIES: grid gambar, latar putih ──
const TopStories: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
  if (articles.length === 0) return null;
  return (
    <div style={{ background: '#fff' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '28px 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ ...m, fontSize: '17px', fontWeight: 700, color: '#111' }}>Top Stories</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px' }}>
          {articles.map(article => (
            <Link key={article.id} to={`/news/${article.id}`} style={{ textDecoration: 'none' }}>
              <div>
                <div style={{ position: 'relative', width: '100%', paddingTop: '72%', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px', background: '#f0f0f0' }}>
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' }}>{article.category}</span>
                <p style={{ ...m, fontSize: '13px', fontWeight: 700, color: '#111', lineHeight: 1.4, marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ articles, searchQuery = '' }) => {
  const [activeTopics, setActiveTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tn_topics');
      if (!saved) return [];
      return JSON.parse(saved);
    } catch { return []; }
  });

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

  useEffect(() => { window.scrollTo(0, 0); }, [categoryName]);

  // Hero = artikel terbaru, Top Stories = 4 artikel berikutnya
  const heroArticle = articles[0];
  const topStories = articles.slice(1, 5);

  const filteredArticles = articles.filter(article => {
    const matchCategory = categoryName
      ? article.category.toLowerCase() === categoryName.toLowerCase().replace(/ /g, '')
      : true;
    const matchSearch = searchQuery.trim()
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
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
            {/* HERO — berita utama */}
            {heroArticle && <HeroArticle article={heroArticle} />}

            {/* TOP STORIES — latar putih, grid gambar */}
            <TopStories articles={topStories} />

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
                ) : renderMixedFeed(filteredArticles.slice(categoryName || isSearching ? 0 : 5))}
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
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default Home;
