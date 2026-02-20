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
    <div>
      {!categoryName && (
        <section className="relative overflow-hidden" style={{ background: '#ffffff' }}>
          {/* Grid kotak */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Konten hero */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-48">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-6">
              Cyberpunk Newsroom
            </p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-black mb-6 max-w-3xl">
              FUTURE<br />
              NEWS<br />
              <span className="text-gray-300">DIMENSION</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-md leading-relaxed">
              Informasi terdepan dari persimpangan teknologi, geopolitik, dan masa depan digital.
            </p>
          </div>

          {/* Batas diagonal — kanan atas ke kiri bawah, tanpa blur */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '120px',
              background: '#000000',
              clipPath: 'polygon(0 100%, 100% 0, 100% 100%)',
            }}
          />
        </section>
      )}

      {/* KARTU BERITA — latar hitam */}
      <div className="bg-black min-h-screen">
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
