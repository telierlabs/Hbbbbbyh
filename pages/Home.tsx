import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

interface HomeProps {
  articles: NewsArticle[];
}

const CardIcons = [
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
];

const featureCards = [
  { title: 'Breaking',   desc: 'Berita terkini dari sumber pertama.' },
  { title: 'Geopolitik', desc: 'Analisis dunia digital & global.' },
  { title: 'Masa Depan', desc: 'Inovasi era baru.' },
  { title: 'AI & Tech',  desc: 'Kecerdasan buatan terkini.' },
  { title: 'Sains',      desc: 'Penemuan terdepan.' },
  { title: 'Opini',      desc: 'Suara analis dunia.' },
];

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const Home: React.FC<HomeProps> = ({ articles }) => {
  const { categoryName } = useParams<{ categoryName?: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryName]);

  const filteredArticles = categoryName
    ? articles.filter(article =>
        article.category.toLowerCase() === categoryName.toLowerCase().replace(/ /g, '')
      )
    : articles;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>

      <div style={{ background: '#000' }}>
        {!categoryName && (
          <>
            {/* HERO */}
            <div style={{
              background: '#f5f5f7',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)`,
              backgroundSize: '40px 40px',
              paddingTop: '100px', paddingBottom: '16px',
              paddingLeft: '20px', paddingRight: '20px',
            }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <p style={{ ...m, fontSize: '10px', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#999', marginBottom: '16px', display: 'block' }}>
                  Cyberpunk Newsroom
                </p>
                <h1 style={{ ...m, fontSize: 'clamp(34px,9vw,62px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.02em', color: '#000', margin: 0 }}>
                  FUTURE<br />NEWS<br />DIMENSION
                </h1>
              </div>
            </div>

            {/* DIVIDER */}
            <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
              <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px' }}>
                <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000"/>
              </svg>
            </div>

            {/* BLACK SECTION */}
            <div style={{ background: '#000', paddingBottom: '40px' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                {/* Desc + Button */}
                <div style={{ padding: '16px 20px 0', marginTop: '-52px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', position: 'relative', zIndex: 2 }}>
                  <p style={{ ...m, color: '#aaa', fontSize: '14px', lineHeight: 1.65, maxWidth: '280px', textAlign: 'left' }}>
                    Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
                  </p>
                  <a href="#" style={{ ...m, display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#000', fontSize: '11px', fontWeight: 700, padding: '9px 18px', borderRadius: '50px', textDecoration: 'none', letterSpacing: '0.04em' }}>
                    Get Started →
                  </a>
                </div>

                {/* Explore row */}
                <div style={{ padding: '32px 20px 24px', display: 'flex', alignItems: 'flex-start', gap: '28px', borderBottom: '1px solid #1a1a1a', marginBottom: '22px' }}>
                  <h2 style={{ ...m, color: '#fff', fontSize: 'clamp(18px,4vw,28px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, textTransform: 'uppercase', flexShrink: 0 }}>
                    EXPLORE THE FUTURE<br />OF DIGITAL NEWS
                  </h2>
                  <p style={{ ...m, color: '#999', fontSize: '13px', lineHeight: 1.7, paddingTop: '3px' }}>
                    Teknologi, geopolitik, dan masa depan — dalam satu tempat.
                  </p>
                </div>

                {/* Feature cards scroll */}
                <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '0 20px 4px', scrollbarWidth: 'none' } as React.CSSProperties}>
                  {featureCards.map((card, i) => (
                    <div key={i} style={{ flexShrink: 0, width: '128px', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px 12px', cursor: 'pointer' }}>
                      <div style={{ width: '32px', height: '32px', background: '#1a1a1a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        {CardIcons[i]}
                      </div>
                      <h3 style={{ ...m, color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '5px', lineHeight: 1.3 }}>{card.title}</h3>
                      <p style={{ color: '#888', fontSize: '12px', lineHeight: 1.5 }}>{card.desc}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </>
        )}

        {/* FEED BERITA */}
        <div style={{ background: '#000', minHeight: '100vh', padding: '0 16px 80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>

            {categoryName && (
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(24px,6vw,40px)', fontWeight: 700, textTransform: 'capitalize' }}>
                  {categoryName.replace(/%20/g, ' ')}
                </h1>
                <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>{filteredArticles.length} artikel ditemukan</p>
              </div>
            )}

            {/* Label Berita Terbaru */}
            {!categoryName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', flexShrink: 0 }}/>
                <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#888', whiteSpace: 'nowrap' }}>Berita Terbaru</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#ffffff22,transparent)' }}/>
              </div>
            )}

            {/* Artikel feed */}
            {filteredArticles.length === 0 ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <p style={{ color: '#444', fontSize: '14px' }}>
                  {categoryName ? `Belum ada berita untuk kategori "${categoryName.replace(/%20/g, ' ')}".` : 'Belum ada berita untuk saat ini.'}
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
    </>
  );
};

export default Home;
