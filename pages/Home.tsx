import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

interface HomeProps {
  articles: NewsArticle[];
}

const Home: React.FC<HomeProps> = ({ articles }) => {
  const { categoryName } = useParams<{ categoryName?: string }>();

  // SCROLL TO TOP ON LOAD
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryName]);

  // FILTER BY CATEGORY
  const filteredArticles = categoryName
    ? articles.filter(article => 
        article.category.toLowerCase() === categoryName.toLowerCase().replace(/ /g, '')
      )
    : articles;

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Category Title */}
      {categoryName && (
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight capitalize">
            {categoryName.replace(/%20/g, ' ')}
          </h1>
          <p className="text-gray-500 mt-2">
            {filteredArticles.length} artikel ditemukan
          </p>
        </div>
      )}

      {/* Featured Section */}
      {featuredArticle && (
        <section className="mb-20">
          <div className="flex items-center space-x-3 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            <h2 className="text-sm font-bold tracking-widest uppercase">
              {categoryName ? 'Pilihan Editor' : 'Berita Utama'}
            </h2>
          </div>
          <NewsCard article={featuredArticle} featured={true} />
        </section>
      )}

      {/* Grid Section */}
      <section>
        <div className="flex items-center space-x-3 mb-10">
          <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
          <h2 className="text-sm font-bold tracking-widest uppercase">
            {categoryName ? 'Artikel Lainnya' : 'Terbaru'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {remainingArticles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
          {remainingArticles.length === 0 && !featuredArticle && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 text-lg">
                {categoryName 
                  ? `Belum ada berita untuk kategori "${categoryName.replace(/%20/g, ' ')}".`
                  : 'Belum ada berita untuk saat ini.'
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
