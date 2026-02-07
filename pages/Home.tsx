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
    </div>
  );
};

export default Home;
