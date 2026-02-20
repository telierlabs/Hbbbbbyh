import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

interface HomeProps {
  articles: NewsArticle[];
}

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

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);
  
  // Ambil 4 artikel pertama untuk kartu kecil horizontal scroll
  const smallCards = remainingArticles.slice(0, 4);
  const largeCards = remainingArticles.slice(4);

  return (
    <div style={{ background: '#000' }}>
      {!categoryName && (
        <>
          {/* HERO SECTION - Putih Bersih + Grid */}
          <div
            style={{
              background: '#ffffff',
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              paddingTop: '140px',
              paddingBottom: '60px',
              paddingLeft: '40px',
              paddingRight: '40px',
            }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <p style={{
                fontSize: '12px', fontWeight: 800,
                letterSpacing: '0.4em', textTransform: 'uppercase',
                color: '#bbb', marginBottom: '24px',
              }}>
                CYBERPUNK NEWSROOM
              </p>
              <h1 style={{
                fontSize: 'clamp(52px, 12vw, 120px)',
                fontWeight: 900, lineHeight: 0.9,
                letterSpacing: '-0.04em', color: '#000',
                margin: '0 0 30px 0',
              }}>
                FUTURE<br />NEWS<br />DIMENSION
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: '#444', 
                maxWidth: '450px', 
                lineHeight: 1.6,
                marginBottom: '40px' 
              }}>
                Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
              </p>
              
              {/* BUTTONS */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button style={{
                  background: '#000',
                  color: '#fff',
                  padding: '12px 28px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  GET STARTED
                </button>
                <button style={{
                  background: 'transparent',
                  color: '#000',
                  padding: '12px 28px',
                  border: '2px solid #000',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  WATCH DEMO
                </button>
              </div>
            </div>
          </div>

          {/* TRANSISI SVG */}
          <div style={{ background: '#ffffff', lineHeight: 0, marginTop: '-1px' }}>
            <svg
              viewBox="0 0 1440 180"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ display: 'block', width: '100%', height: '150px' }}
            >
              <path
                d="M0,180 L1440,180 L1440,0 L750,0 Q700,0 680,30 L650,50 L0,50 Z"
                fill="#000000"
              />
            </svg>
          </div>

          {/* DARK BAR SECTION - Heading untuk kartu kecil */}
          <div style={{
            background: '#000',
            paddingTop: '60px',
            paddingBottom: '40px',
            paddingLeft: '40px',
            paddingRight: '40px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
              }}>
                EXPLORE THE FUTURE OF TECHNOLOGY
              </h2>
            </div>
          </div>

          {/* KARTU KECIL - HORIZONTAL SCROLL */}
          {smallCards.length > 0 && (
            <div style={{
              background: '#000',
              paddingTop: '40px',
              paddingBottom: '60px',
              paddingLeft: '40px',
              paddingRight: '40px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  paddingBottom: '10px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.2) transparent',
                }}>
                  {smallCards.map(article => (
                    <div
                      key={article.id}
                      style={{
                        minWidth: '320px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '24px',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.background = 'rgba(255,255,255,0.1)';
                        el.style.borderColor = 'rgba(255,255,255,0.3)';
                        el.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.background = 'rgba(255,255,255,0.05)';
                        el.style.borderColor = 'rgba(255,255,255,0.1)';
                        el.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '24px' }}>
                          {article.category === 'EKONOMI' && '💼'}
                          {article.category === 'TEKNOLOGI' && '🔬'}
                          {article.category === 'GEOPOLITIK' && '🌍'}
                          {article.category === 'LAINNYA' && '📡'}
                        </span>
                      </div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '8px',
                        lineHeight: 1.4,
                      }}>
                        {article.title}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.5,
                      }}>
                        {article.summary?.substring(0, 80)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* KARTU BESAR - VERTICAL SCROLL */}
      <div style={{ background: '#000', minHeight: '100vh', paddingTop: categoryName ? '0' : '40px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '40px', paddingRight: '40px' }}>

          {categoryName && (
            <div style={{ marginBottom: '48px', paddingTop: '40px' }}>
              <h1 style={{
                fontSize: 'clamp(32px, 8vw, 56px)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'capitalize',
                color: '#fff',
              }}>
                {categoryName.replace(/%20/g, ' ')}
              </h1>
              <p style={{ color: '#999', marginTop: '12px', fontSize: '16px' }}>
                {filteredArticles.length} artikel ditemukan
              </p>
            </div>
          )}

          {/* FEATURED ARTICLE */}
          {featuredArticle && (
            <section style={{ marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  animation: 'pulse 2s infinite',
                }}></span>
                <h2 style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  margin: 0,
                }}>
                  {categoryName ? 'Pilihan Editor' : 'BERITA UTAMA'}
                </h2>
              </div>
              <NewsCard article={featuredArticle} featured={true} />
            </section>
          )}

          {/* LARGE CARDS GRID */}
          {(largeCards.length > 0 || categoryName) && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)',
                }}></span>
                <h2 style={{
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}>
                  {categoryName ? 'Artikel Lainnya' : 'TERBARU'}
                </h2>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '40px 40px',
              }}>
                {(categoryName ? remainingArticles : largeCards).map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
              
              {remainingArticles.length === 0 && !featuredArticle && !categoryName && (
                <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
                  <p style={{ color: '#999', fontSize: '18px' }}>
                    Belum ada berita yang tersedia.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Home;
