
import React from 'react';
import { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

interface HomeProps {
  articles: NewsArticle[];
}

const Home: React.FC<HomeProps> = ({ articles }) => {
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Featured Section */}
      {featuredArticle && (
        <section className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            <h2 className="text-sm font-bold tracking-widest uppercase">Berita Utama</h2>
          </div>
          <NewsCard article={featuredArticle} featured={true} />
        </section>
      )}

      {/* Grid Section */}
      <section>
        <div className="flex items-center space-x-3 mb-10">
          <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
          <h2 className="text-sm font-bold tracking-widest uppercase">Terbaru</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {remainingArticles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
          {remainingArticles.length === 0 && !featuredArticle && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 text-lg">Belum ada berita untuk saat ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mt-32 bg-slate-50 rounded-3xl p-8 md:p-16 text-center border border-slate-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Dapatkan Update Harian</h2>
        <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
          Jangan lewatkan informasi penting. Berlangganan newsletter TelierNews sekarang.
        </p>
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Email Anda" 
            className="flex-1 px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
          <button className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
            Berlangganan
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
