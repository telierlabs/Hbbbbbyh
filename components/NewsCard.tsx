import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, featured = false }) => {
  if (featured) {
    return (
      <Link to={`/news/${article.id}`} className="group block relative overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
          <div className="relative h-64 lg:h-[450px] overflow-hidden">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest text-white bg-black rounded-full mb-6 uppercase">
              {article.category}
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-6 group-hover:text-gray-600 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-500 text-lg mb-8 line-clamp-2">
              {article.summary}
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs uppercase">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{article.author}</p>
                <p className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/news/${article.id}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-gray-100">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-2 py-1 text-[10px] font-bold tracking-widest text-black bg-white/90 backdrop-blur rounded uppercase">
            {article.category}
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
        {article.title}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
        {article.summary}
      </p>
      <div className="text-xs text-gray-400 flex items-center space-x-2">
        <span>{article.author}</span>
        <span>•</span>
        <span>{new Date(article.publishedAt).toLocaleDateString('id-ID')}</span>
      </div>
    </Link>
  );
};

export default NewsCard;
