
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface NewsDetailProps {
  articles: NewsArticle[];
}

const NewsDetail: React.FC<NewsDetailProps> = ({ articles }) => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Berita Tidak Ditemukan</h2>
        <Link to="/" className="text-blue-500 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <header className="mb-12">
        <Link to="/" className="text-sm font-medium text-gray-400 hover:text-black transition-colors mb-8 inline-block">
          &larr; Kembali
        </Link>
        <div className="flex items-center space-x-4 mb-6">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
            {article.category}
          </span>
          <span className="text-gray-400 text-sm">•</span>
          <time className="text-gray-400 text-sm">
            {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight mb-8">
          {article.title}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
            {article.author.charAt(0)}
          </div>
          <div>
            <p className="font-bold">{article.author}</p>
            <p className="text-xs text-gray-500">Editor Senior TelierNews</p>
          </div>
        </div>
      </header>

      <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-gray-100">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="text-xl md:text-2xl leading-relaxed text-gray-600 mb-8 italic font-light border-l-4 border-black pl-6">
          {article.summary}
        </p>
        <div className="text-lg md:text-xl leading-relaxed space-y-6 text-gray-800 whitespace-pre-line">
          {article.content}
        </div>
      </div>
      
      <div className="mt-20 pt-12 border-t border-gray-100 flex flex-wrap gap-4">
        {["Indonesia", "Digital", "Berita", article.category].map(tag => (
          <span key={tag} className="px-4 py-2 bg-slate-50 rounded-full text-xs text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
};

export default NewsDetail;
