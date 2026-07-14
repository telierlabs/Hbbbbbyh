import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { NewsArticle } from '../types';

interface HomeProps { articles: NewsArticle[]; searchQuery?: string; }

// ── THEME — ubah warna di sini aja, otomatis berlaku ke semua bagian ──
const THEME = {
  bg: '#ffffff',
  cardBg: '#ffffff',
  border: '#e9e9e9',
  text: '#111111',
  muted: '#767676',
  faint: '#a3a3a3',
  accent: '#111111',   // warna tombol / aksen utama
  accentText: '#ffffff',
};

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// "4 JULI 2026"
const heroDateFmt = (dateStr: string): string => {
  const d = new Date(dateStr);
  const months = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
// "4 Jul 2026"
const shortDateFmt = (dateStr: string): string => {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const SecHeader: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: THEME.text, flexShrink: 0 }} />
    <span style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: THEME.text, whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: THEME.border }} />
  </div>
);

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '26px 0 14px' }}>
    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: THEME.faint, flexShrink: 0 }} />
    <span style={{ ...m, fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: THEME.muted, whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: THEME.border }} />
  </div>
);

// ── HERO: berita utama, image landscape di desktop (via CSS class) ──
const HeroArticle: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="tn-hero" style={{ position: 'relative', background: '#000' }}>
    <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="tn-hero-media" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.08) 100%)' }} />
        <div style={{ position: 'absolute', top: '90px', left: '20px', right: '20px' }}>
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.2em', color: '#ccc', textTransform: 'uppercase' }}>
            {article.category} · {heroDateFmt(article.publishedAt)}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px' }}>
          <h1 className="tn-hero-title" style={{ ...m, fontSize: 'clamp(22px,4vw,34px)', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: '10px' }}>
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
  </div>
);

// ── AI INSIGHT — komponen terpisah, BUKAN bagian dari hero.
// Mobile: block biasa di antara hero & Top Stories (tidak menempel/menutupi foto hero).
// Desktop: berubah jadi floating card di pojok kanan-atas hero (lihat CSS .tn-insight). ──
const AIInsight: React.FC<{ article: NewsArticle }> = ({ article }) => {
  if (!article.aiInsight || article.aiInsight.length === 0) return null;
  return (
    <div className="tn-insight">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase' }}>AI Insight</span>
      </div>
      <ul className="tn-insight-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0 }}>
        {article.aiInsight.map((point, i) => (
          <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ ...mono, fontSize: '10px', color: '#555', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="tn-insight-text" style={{ ...m, fontSize: '12px', color: '#ddd', lineHeight: 1.55 }}>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── TOP STORIES: grid gambar, 2 kolom mobile / 4 kolom desktop ──
const TopStories: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
  if (articles.length === 0) return null;
  return (
    <div style={{ padding: '28px 0 8px' }}>
      <span style={{ ...m, fontSize: '17px', fontWeight: 700, color: THEME.text, display: 'block', marginBottom: '16px' }}>Top Stories</span>
      <div className="tn-top-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 12px' }}>
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
              <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.15em', color: THEME.faint, textTransform: 'uppercase' }}>{article.category}</span>
              <p style={{ ...m, fontSize: '13px', fontWeight: 700, color: THEME.text, lineHeight: 1.4, marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {article.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ── Kartu berita versi terang, dipakai di feed / kategori / pencarian ──
const LightHorizontalCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block' }}>
    <div style={{ display: 'flex', gap: '14px', padding: '16px 0', borderBottom: `1px solid ${THEME.border}` }}>
      <div style={{ position: 'relative', width: '112px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', minHeight: '84px' }}>
        <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.15em', color: THEME.faint, textTransform: 'uppercase', marginBottom: '5px' }}>{article.category}</span>
        <span style={{ ...m, fontSize: '14px', fontWeight: 700, color: THEME.text, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</span>
        <span style={{ ...mono, fontSize: '9px', color: THEME.faint, marginTop: '6px' }}>{shortDateFmt(article.publishedAt)}</span>
      </div>
    </div>
  </Link>
);

const LightFeaturedCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
    <div style={{ position: 'relative', width: '100%', paddingTop: '56%', borderRadius: '14px', overflow: 'hidden', marginBottom: '10px' }}>
      <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.15em', color: THEME.faint, textTransform: 'uppercase' }}>{article.category} · {shortDateFmt(article.publishedAt)}</span>
    <p style={{ ...m, fontSize: '18px', fontWeight: 700, color: THEME.text, lineHeight: 1.35, margin: '6px 0 0' }}>{article.title}</p>
  </Link>
);

const LightSmallCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block' }}>
    <div style={{ position: 'relative', width: '100%', paddingTop: '68%', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
      <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.15em', color: THEME.faint, textTransform: 'uppercase' }}>{article.category}</span>
    <p style={{ ...m, fontSize: '13px', fontWeight: 700, color: THEME.text, lineHeight: 1.4, marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</p>
  </Link>
);

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
        result.push(<LightFeaturedCard key={items[i].id} article={items[i]} />); i++;
        if (i + 1 < items.length) {
          const cat2 = items[i].category, cat3 = items[i+1].category;
          if (cat2 === cat3 && cat2 !== lastCategoryLabel) { result.push(<SectionLabel key={`label-d-${i}`} label={cat2} />); lastCategoryLabel = cat2; }
          result.push(<div key={`double-${i}`} className="tn-double" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}><LightSmallCard article={items[i]} /><LightSmallCard article={items[i+1]} /></div>);
          i += 2;
        }
      } else if (pattern === 1) {
        const end = Math.min(i + 3, items.length), groupCat = items[i].category;
        const allSame = items.slice(i, end).every(a => a.category === groupCat);
        if (allSame && groupCat !== lastCategoryLabel) { result.push(<SectionLabel key={`label-h-${i}`} label={groupCat} />); lastCategoryLabel = groupCat; }
        else if (!allSame) lastCategoryLabel = '';
        for (let j = i; j < end; j++) result.push(<LightHorizontalCard key={items[j].id} article={items[j]} />);
        i = end;
      } else {
        if (i + 1 < items.length) {
          const cat2 = items[i].category, cat3 = items[i+1].category;
          if (cat2 === cat3 && cat2 !== lastCategoryLabel) { result.push(<SectionLabel key={`label-d2-${i}`} label={cat2} />); lastCategoryLabel = cat2; }
          result.push(<div key={`double2-${i}`} className="tn-double" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}><LightSmallCard article={items[i]} /><LightSmallCard article={items[i+1]} /></div>);
          i += 2;
        } else { result.push(<LightHorizontalCard key={items[i].id} article={items[i]} />); i++; }
        if (i < items.length) { maybeShowLabel(items[i].category, `f2-${i}`); result.push(<LightFeaturedCard key={items[i].id} article={items[i]} />); i++; }
      }
      blockIndex++;
    }
    return result;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: THEME.bg, minHeight: '100vh' }}>

        {!categoryName && !isSearching && heroArticle && (
          <div className="tn-hero-wrap" style={{ position: 'relative' }}>
            <HeroArticle article={heroArticle} />
            <AIInsight article={heroArticle} />
          </div>
        )}

        <div className="tn-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 80px' }}>

          {!categoryName && !isSearching && <TopStories articles={topStories} />}

          {categoryName && !isSearching && (
            <>
              <div style={{ paddingTop: '24px', marginBottom: '20px' }}>
                <h1 style={{ ...m, color: THEME.text, fontSize: 'clamp(22px,5vw,34px)', fontWeight: 700, textTransform: 'capitalize', marginBottom: '6px' }}>
                  {categoryName.replace(/%20/g, ' ')}
                </h1>
                <p style={{ ...mono, fontSize: '11px', color: THEME.muted, letterSpacing: '0.1em' }}>{filteredArticles.length} ARTIKEL DITEMUKAN</p>
              </div>
              {filteredArticles.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <p style={{ color: THEME.muted, fontSize: '14px' }}>Belum ada berita untuk kategori ini.</p>
                </div>
              ) : (
                <div>{filteredArticles.map(article => <LightHorizontalCard key={article.id} article={article} />)}</div>
              )}
            </>
          )}

          {isSearching && (
            <>
              <div style={{ paddingTop: '24px', marginBottom: '24px' }}>
                <p style={{ ...mono, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: THEME.muted, marginBottom: '6px' }}>Hasil pencarian</p>
                <h1 style={{ ...m, color: THEME.text, fontSize: 'clamp(20px,5vw,32px)', fontWeight: 700 }}>"{searchQuery}"</h1>
                <p style={{ ...mono, fontSize: '11px', color: THEME.muted, marginTop: '6px', letterSpacing: '0.1em' }}>{filteredArticles.length} BERITA DITEMUKAN</p>
              </div>
              {filteredArticles.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <p style={{ color: THEME.muted, fontSize: '14px' }}>Tidak ada berita untuk "{searchQuery}".</p>
                </div>
              ) : (
                <div>{filteredArticles.map(article => <LightHorizontalCard key={article.id} article={article} />)}</div>
              )}
            </>
          )}

          {!categoryName && !isSearching && (
            <div style={{ paddingTop: '8px' }}>
              <SecHeader label="Berita Terbaru" />
              {activeTopics.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ ...mono, fontSize: '9px', color: THEME.faint, letterSpacing: '0.15em' }}>FILTER AKTIF:</span>
                  {activeTopics.map(t => (
                    <span key={t} style={{ ...mono, fontSize: '9px', color: THEME.text, letterSpacing: '0.1em', padding: '3px 8px', background: '#f2f2f2', borderRadius: '4px', border: `1px solid ${THEME.border}`, textTransform: 'uppercase' }}>{t}</span>
                  ))}
                </div>
              )}
              {filteredArticles.length === 0 ? (
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                  <p style={{ color: THEME.muted, fontSize: '14px' }}>Belum ada berita untuk saat ini.</p>
                </div>
              ) : (
                <div className="tn-feed-col">{renderMixedFeed(filteredArticles.slice(5))}</div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        /* AI Insight — MOBILE: block biasa, terpisah dari hero, duduk di atas Top Stories */
        .tn-insight {
          position: static;
          margin: 16px 20px 0;
          background: #0d0d0d;
          border: 1px solid #222;
          border-radius: 16px;
          padding: 14px 16px;
          max-height: 176px;
          overflow-y: auto;
        }
        .tn-insight-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Desktop: kontainer lebih lebar, Top Stories 4 kolom, hero jadi landscape,
           judul hero dikecilkan, AI Insight jadi floating card di kanan-atas hero */
        @media (min-width: 900px) {
          .tn-container { max-width: 1080px !important; }
          .tn-hero-media { padding-top: 42% !important; }
          .tn-top-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .tn-feed-col { columns: 2; column-gap: 28px; }
          .tn-feed-col > * { break-inside: avoid; }

          .tn-hero-title { font-size: 26px !important; }

          .tn-insight {
            position: absolute;
            top: 24px;
            right: 24px;
            width: 280px;
            margin: 0;
            max-height: none;
            overflow: visible;
          }
        }
        @media (max-width: 899px) {
          .tn-hero-media { padding-top: 108%; }
        }
      `}</style>
    </>
  );
};

export default Home;
