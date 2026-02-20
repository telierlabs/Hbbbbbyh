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

  return (
    <div style={{ background: '#000' }}>
      {!categoryName && (
        <>
          {/* HERO — putih + grid */}
          <div
            style={{
              background: '#f5f5f7',
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              paddingTop: '120px',
              paddingBottom: '60px',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#999',
                marginBottom: '24px',
              }}>
                Cyberpunk Newsroom
              </p>
              <h1 style={{
                fontSize: 'clamp(56px, 12vw, 120px)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: '#000',
                margin: '0 0 24px 0',
              }}>
                FUTURE<br />
                NEWS<br />
                DIMENSION
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#666',
                maxWidth: '420px',
                lineHeight: 1.6,
              }}>
                Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
              </p>
            </div>
          </div>

          {/* BATAS melengkung — persis foto 3
              Hitam naik dari kiri, melengkung rounded ke kanan atas */}
          <div style={{ marginTop: '-2px', lineHeight: 0, background: '#f5f5f7' }}>
            <svg
              viewBox="0 0 1440 160"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ display: 'block', width: '100%', height: '120px' }}
            >
              {/*
                Mulai dari kiri bawah (0,160)
                Naik ke kiri (0,160) → flat di kiri bawah
                Lalu kurva bezier naik ke kanan: 
                  titik kontrol di tengah bawah, keluar di kanan atas
                Persis bentuk foto 3: kiri rata bawah, kanan naik tinggi dengan lengkungan
              */}
              <path
                d="M0,160 L0,120 Q400,160 700,80 Q900,20 1440,0 L1440,160 Z"
                fill="#000000"
              />
            </svg>
          </div>
        </>
      )}

      {/* KARTU BERITA — latar hitam */}
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

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
