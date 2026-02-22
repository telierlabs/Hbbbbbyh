// NewsDetail.tsx - WITH DYNAMIC OG TAGS
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsArticle } from '../types';
import VoiceReader from '../components/VoiceReader';
import ShareButton from '../components/ShareButton';

interface NewsDetailProps {
  articles: NewsArticle[];
}

const updateOGTags = (article: NewsArticle) => {
  const url = window.location.href;
  const setMeta = (property: string, content: string, isName = false) => {
    const attr = isName ? 'name' : 'property';
    let el = document.querySelector(`meta[${attr}="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  document.title = `${article.title} - TelierNews`;
  setMeta('og:title', article.title);
  setMeta('og:description', article.summary);
  setMeta('og:image', article.imageUrl);
  setMeta('og:url', url);
  setMeta('og:type', 'article');
  setMeta('twitter:title', article.title, true);
  setMeta('twitter:description', article.summary, true);
  setMeta('twitter:image', article.imageUrl, true);
};

const resetOGTags = () => {
  document.title = 'TelierNews - Informasi Terpercaya';
  const setMeta = (property: string, content: string, isName = false) => {
    const attr = isName ? 'name' : 'property';
    const el = document.querySelector(`meta[${attr}="${property}"]`);
    if (el) el.setAttribute('content', content);
  };
  setMeta('og:title', 'TelierNews - Informasi Terpercaya');
  setMeta('og:description', 'Portal berita terpercaya, aktual, dan mendalam.');
  setMeta('og:image', 'https://www.teliernews.com/favicon.ico');
};

const AdBanner = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.innerHTML = `
      atOptions = {
        'key' : 'aa643214b9c24b68c518717507f72797',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    const script2 = document.createElement('script');
    script2.src = 'https://www.highperformanceformat.com/aa643214b9c24b68c518717507f72797/invoke.js';
    const container = document.getElementById('adsterra-banner');
    if (container) {
      container.appendChild(script1);
      container.appendChild(script2);
    }
  }, []);
  return <div id="adsterra-banner" className="flex justify-center my-10" />;
};

const NewsDetail: React.FC<NewsDetailProps> = ({ articles }) => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);
  const [showScrollButton, setShowScrollButton] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) updateOGTags(article);
    return () => resetOGTags();
  }, [id, article]);

  const relatedArticles = articles.filter(a => a.id !== id);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Berita Tidak Ditemukan</h2>
        <Link to="/" className="text-blue-500 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const fullText = `${article.summary}. ${
    article.contentBlocks 
      ? article.contentBlocks.filter(block => block.type === 'text').map(block => block.content).join('. ')
      : article.content
  }`;

  const currentUrl = window.location.href;
  const scrollDown = () => window.scrollBy({ top: 600, behavior: 'smooth' });

  return (
    <>
      <div className="w-full h-[55vw] max-h-[520px] min-h-[240px] overflow-hidden relative">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <article className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="text-sm font-medium text-gray-400 hover:text-black transition-colors mb-6 inline-block"
        >
          &larr; Kembali
        </Link>

        <div className="flex items-center space-x-3 mb-4">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
            {article.category}
          </span>
          <span className="text-gray-400 text-sm">•</span>
          <time className="text-gray-400 text-sm">
            {new Date(article.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm">{article.author}</p>
              <p className="text-xs text-gray-500">Editor Senior TelierNews</p>
            </div>
          </div>
          <ShareButton title={article.title} url={currentUrl} />
        </div>

        <VoiceReader text={fullText} />

        <div className="prose prose-slate max-w-none">
          <p className="text-lg md:text-xl leading-relaxed text-gray-600 mb-6 italic font-light border-l-4 border-black pl-5">
            {article.summary}
          </p>

          {article.contentBlocks && article.contentBlocks.length > 0 ? (
            <div className="space-y-6">
              {article.contentBlocks.map((block, index) => (
                <div key={index}>
                  {block.type === 'image' ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 my-6">
                      <img
                        src={block.content}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-base md:text-lg leading-relaxed text-gray-800 whitespace-pre-line">
                      {block.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-base md:text-lg leading-relaxed space-y-5 text-gray-800 whitespace-pre-line">
              {article.content}
            </div>
          )}
        </div>

        {/* Iklan Adsterra */}
        <AdBanner />

        {/* Berita Lainnya */}
        {relatedArticles.length > 0 && (
          <div className="mt-6 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-bold mb-6">Berita Lainnya</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map(related => (
                <Link key={related.id} to={`/news/${related.id}`} className="group">
                  <div className="aspect-video rounded-xl overflow-hidden mb-3 border border-gray-100">
                    <img
                      src={related.imageUrl}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs text-gray-500 uppercase font-bold">{related.category}</span>
                  <h3 className="font-bold text-sm mt-1 line-clamp-2 group-hover:text-black transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(related.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {showScrollButton && (
        <button
          onClick={scrollDown}
          className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all z-50 flex items-center justify-center text-2xl"
          aria-label="Scroll down"
        >
          ↓
        </button>
      )}
    </>
  );
};

export default NewsDetail;
