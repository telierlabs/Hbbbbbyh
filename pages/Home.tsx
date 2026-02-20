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
          {/* HERO Putih Bersih + Grid sesuai Foto 2 */}
          <div
            style={{
              background: '#ffffff', // Diubah dari cream ke putih bersih
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px', // Grid sedikit diperlebar agar clean
              paddingTop: '140px',
              paddingBottom: '0px',
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
            </div>
          </div>

          {/* TRANSISI SVG - Mengikuti lekukan Foto 2 */}
          <div style={{ background: '#ffffff', lineHeight: 0, marginTop: '-1px' }}>
            <svg
              viewBox="0 0 1440 180"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ display: 'block', width: '100%', height: '150px' }}
            >
              {/* Path ini membuat:
                  1. Dasar hitam rata di bawah.
                  2. Naik di sisi kiri (M0,180 L0,40).
                  3. Berjalan lurus ke kanan (L650,40).
                  4. Melengkung halus ke atas (Q700,40 700,0).
                  5. Sisa kanan atas tetap putih (background div).
              */}
              <path
                d="M0,180 L1440,180 L1440,0 L750,0 Q700,0 680,30 L650,50 L0,50 Z"
                fill="#000000"
              />
            </svg>
          </div>
        </>
      )}

      {/* KARTU BERITA — Latar Hitam Pekat */}
      <div style={{ background: '#000', minHeight: '100vh', marginTop: '-1px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

          {categoryName && (
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight capitalize text-white">
                {categoryName.replace(/%20/g, ' ')}
              </h1>
              <p className="text-gray-500 mt-2">{filteredArticles.length} artikel ditemukan</p>
            </div>
          )}

          {featuredArticle && (
            <section className="mb-20">
              <div className="flex items-center space-x-3 mb-8">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <h2 className="text-xs font-black tracking-[0.3em] uppercase text-white">
                  {categoryName ? 'Pilihan Editor' : 'BERITA UTAMA'}
                </h2>
              </div>
              <NewsCard article={featuredArticle} featured={true} />
            </section>
          )}

          <section>
            <div className="flex items-center space-x-3 mb-10">
              <span className="h-1.5 w-1.5 rounded-full bg-white/30"></span>
              <h2 className="text-xs font-black tracking-[0.3em] uppercase text-white/50">
                {categoryName ? 'Artikel Lainnya' : 'TERBARU'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {remainingArticles.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
            
            {remainingArticles.length === 0 && !featuredArticle && (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500 text-lg">
                  Belum ada berita yang tersedia.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
