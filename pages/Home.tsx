import React, { useEffect } from 'react';
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryName]);

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

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>

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
                <div style={{ padding: '16px 20px 0', marginTop: '-52px', position: 'relative', zIndex: 2 }}>
                  <p style={{ ...m, color: '#aaa', fontSize: '14px', lineHeight: 1.65, maxWidth: '280px', textAlign: 'left' }}>
                    Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
                  </p>
                </div>
                <div style={{ padding: '32px 20px 24px', display: 'flex', alignItems: 'flex-start', gap: '28px', borderBottom: '1px solid #1a1a1a' }}>
                  <h2 style={{ ...m, color: '#fff', fontSize: 'clamp(18px,4vw,28px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, textTransform: 'uppercase', flexShrink: 0 }}>
                    EXPLORE THE FUTURE<br />OF DIGITAL NEWS
                  </h2>
                  <p style={{ ...m, color: '#999', fontSize: '13px', lineHeight: 1.7, paddingTop: '3px' }}>
                    Teknologi, geopolitik, dan masa depan — dalam satu tempat.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FEED BERITA */}
        <div style={{ background: '#000', padding: '0 16px 80px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '24px' }}>

            {/* Header kategori */}
            {categoryName && !isSearching && (
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(24px,6vw,40px)', fontWeight: 700, textTransform: 'capitalize' }}>
                  {categoryName.replace(/%20/g, ' ')}
                </h1>
                <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>{filteredArticles.length} artikel ditemukan</p>
              </div>
            )}

            {/* Header search */}
            {isSearching && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>Hasil pencarian</p>
                <h1 style={{ ...m, color: '#fff', fontSize: 'clamp(20px,5vw,32px)', fontWeight: 700 }}>
                  "{searchQuery}"
                </h1>
                <p style={{ color: '#444', fontSize: '13px', marginTop: '6px' }}>{filteredArticles.length} berita ditemukan</p>
              </div>
            )}

            {/* Label Berita Terbaru */}
            {!categoryName && !isSearching && (
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
    </>
  );
};

export default Home;
