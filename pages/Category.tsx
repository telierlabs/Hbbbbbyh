import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import ArticleFeed from '../components/ArticleFeed';
import NewsCard from '../components/NewsCard';
import HeroCard from '../components/HeroCard';
import { TopStoriesRow, CategoryChips } from '../components/ExploreRows';
import TimelineCards from '../components/TimelineCards';

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

  const hero = regular[0] || deepDives[0];
  const topStories = regular.slice(1, 6);
  const feed = regular.slice(hero && regular[0] ? 1 : 0);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO PENUH */}
        {hero ? (
          <HeroCard
            image={hero.imageUrl}
            tags={[`${displayName} Terbaru`, `${readMinutes(hero)} mnt baca`]}
            eyebrow={hero.category}
            title={hero.title}
            summary={hero.summary}
            cta="Baca Berita →"
            meta={`${hero.author} · ${formatDate(hero.publishedAt)}`}
            backLabel="Beranda"
            onClick={() => navigate(`/news/${hero.id}`)}
          />
        ) : (
          <div style={{ padding: '120px 20px 32px', textAlign: 'center' }}>
            <p style={{ ...m, fontSize: '14px', color: '#aaa', margin: '0 0 14px' }}>Belum ada berita untuk kategori {displayName}.</p>
            <button type="button" onClick={() => navigate('/')} style={{ ...m, background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>← Kembali ke Beranda</button>
          </div>
        )}

        <div style={{ background: '#000', padding: '8px 20px 80px', position: 'relative', zIndex: 2 }}>
          <div className="cat-container">

            {/* JELAJAHI: Top Stories, kategori lain, timeline yang sedang berkembang */}
            <TopStoriesRow items={topStories} showAll={false} />
            <CategoryChips articles={articles} skipKey={key} title="Jelajahi Kategori" />
            <TimelineCards articles={articles} inline />

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
          .cat-sec { font-size: 20px !important; }
          .ex-sec { font-size: 20px !important; }
        }
      `}</style>
    </>
  );
};

export default Category;
