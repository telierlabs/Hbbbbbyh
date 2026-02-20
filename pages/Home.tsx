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

  const featureCards = [
    { icon: '⚡', title: 'Breaking Real-Time', desc: 'Berita terkini langsung dari sumber pertama.' },
    { icon: '🌐', title: 'Geopolitik', desc: 'Analisis mendalam dunia digital dan global.' },
    { icon: '🔮', title: 'Masa Depan', desc: 'Laporan eksklusif inovasi era baru.' },
    { icon: '🤖', title: 'AI & Tech', desc: 'Perkembangan kecerdasan buatan terkini.' },
    { icon: '🛰️', title: 'Sains', desc: 'Eksplorasi ilmu pengetahuan terdepan.' },
  ];

  return (
    <div style={{ background: '#000' }}>
      {!categoryName && (
        <>
          {/* HERO putih + grid */}
          <div
            style={{
              background: '#f5f5f7',
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              paddingTop: '130px',
              paddingBottom: '20px',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <p style={{
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: '#999', marginBottom: '20px',
              }}>
                Cyberpunk Newsroom
              </p>
              <h1 style={{
                fontSize: 'clamp(36px, 7vw, 72px)',
                fontWeight: 900, lineHeight: 1,
                letterSpacing: '-0.03em', color: '#000',
                margin: '0 0 20px 0',
              }}>
                FUTURE<br />NEWS<br />DIMENSION
              </h1>
              <p style={{ fontSize: '15px', color: '#666', maxWidth: '360px', lineHeight: 1.6 }}>
                Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
              </p>
            </div>
          </div>

          {/* SVG pembatas */}
          <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
            <svg
              viewBox="0 0 1440 200"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ display: 'block', width: '100%', height: '120px' }}
            >
              <path
                d="M0,200 L0,60 L850,60 Q920,60 960,20 Q1000,0 1440,0 L1440,200 Z"
                fill="#000000"
              />
            </svg>
          </div>

          {/* KARTU KECIL — horizontal scroll */}
          <div style={{ background: '#000', paddingBottom: '48px', paddingTop: '8px' }}>
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                paddingLeft: '24px',
                paddingRight: '24px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featureCards.map((card, i) => (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: '150px',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '14px',
                    padding: '16px 14px',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '10px' }}>{card.icon}</div>
                  <h3 style={{
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    lineHeight: 1.3,
                  }}>
                    {card.title}
                  </h3>
                  <p style={{ color: '#555', fontSize: '11px', lineHeight: 1.5 }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* KARTU BERITA — latar hitam */}
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

          {categoryName && (
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight capitalize text-white">
                {categoryName.replace(/%20/g, ' ')}
              </h1>
              <p className="text-gray-500 mt-2">{filteredArticles.length} artikel ditemukan</p>
            </div>
          )}

          {featuredArticle && (
            <section className="mb-16">
              <div className="flex items-center space-x-3 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                <h2 className="text-sm font-bold tracking-widest uppercase text-white">
                  {categoryName ? 'Pilihan Editor' : 'Berita Utama'}
                </h2>
              </div>
              <NewsCard article={featuredArticle} featured={true} />
            </section>
          )}

          <section>
            <div className="flex items-center space-x-3 mb-10">
              <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
              <h2 className="text-sm font-bold tracking-widest uppercase text-white">
                {categoryName ? 'Artikel Lainnya' : 'Terbaru'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {remainingArticles.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
              {remainingArticles.length === 0 && !featuredArticle && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-500 text-lg">
                    {categoryName
                      ? `Belum ada berita untuk kategori "${categoryName.replace(/%20/g, ' ')}".`
                      : 'Belum ada berita untuk saat ini.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
