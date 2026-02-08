import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, featured = false }) => {
  // Use slug if available, fallback to id for old articles
  const articleUrl = article.slug ? `/news/${article.slug}` : `/news/${article.id}`;
  
  if (featured) {
    return (
      <Link to={articleUrl} className="group block">
        <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 border border-gray-100">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
            {article.category}
          </span>
          <span className="text-gray-400 text-sm">•</span>
          <time className="text-gray-400 text-sm">
            {new Date(article.publishedAt).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </time>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 group-hover:text-gray-700 transition-colors">
          {article.title}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
          {article.summary}
        </p>
        <div className="flex items-center mt-6 space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm">
            {article.author.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm">{article.author}</p>
            <p className="text-xs text-gray-500">Editor Senior TelierNews</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={articleUrl} className="group block">
      <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-gray-100">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
        {article.category}
      </span>
      <h3 className="text-xl font-bold mt-2 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
        {article.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
        {article.summary}
      </p>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
          {article.author.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium">{article.author}</p>
          <p className="text-xs text-gray-400">
            {new Date(article.publishedAt).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
