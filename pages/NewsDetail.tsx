import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsArticle } from '../types';
import { fetchArticleBySlug } from '../services/articleService';
import VoiceReader from '../components/VoiceReader';
import ArticleChat from '../components/ArticleChat';
import ShareButton from '../components/ShareButton';

interface NewsDetailProps {
  articles: NewsArticle[];
}

const NewsDetail: React.FC<NewsDetailProps> = ({ articles }) => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(true);

  // SCROLL TO TOP ON LOAD
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // FETCH ARTICLE BY SLUG
  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;
      
      setLoading(true);
      
      // COBA CARI DI MEMORY DULU (dari props articles)
      const foundInMemory = articles.find(a => a.slug === slug);
      
      if (foundInMemory) {
        setArticle(foundInMemory);
        setLoading(false);
      } else {
        // KALAU GAK ADA, FETCH DARI FIREBASE
        const foundInFirebase = await fetchArticleBySlug(slug);
        setArticle(foundInFirebase);
        setLoading(false);
      }
    };
    
    loadArticle();
  }, [slug, articles]);

  const relatedArticles = articles.filter(a => a.slug !== slug && a.slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

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
      ? article.contentBlocks
          .filter(block => block.type === 'text')
          .map(block => block.content)
          .join('. ')
      : article.content
  }`;

  const currentUrl = window.location.href;

  const scrollDown = () => {
    window.scrollBy({ top: 600, behavior: 'smooth' });
  };

  return (
    <>
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold">{article.author}</p>
                <p className="text-xs text-gray-500">Editor Senior TelierNews</p>
              </div>
            </div>
            <ShareButton title={article.title} url={currentUrl} />
          </div>
        </header>

        <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 border border-gray-100">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <VoiceReader text={fullText} />

        <div className="prose prose-slate max-w-none">
          <p className="text-xl md:text-2xl leading-relaxed text-gray-600 mb-8 italic font-light border-l-4 border-black pl-6">
            {article.summary}
          </p>

          {article.contentBlocks && article.contentBlocks.length > 0 ? (
            <div className="space-y-8">
              {article.contentBlocks.map((block, index) => (
                <div key={index}>
                  {block.type === 'image' ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 my-8">
                      <img 
                        src={block.content} 
                        alt={`Image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-lg md:text-xl leading-relaxed text-gray-800 whitespace-pre-line">
                      {block.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-lg md:text-xl leading-relaxed space-y-6 text-gray-800 whitespace-pre-line">
              {article.content}
            </div>
          )}
        </div>
        
        <div className="mt-16">
          <ArticleChat articleTitle={article.title} articleContent={fullText} />
        </div>

        {relatedArticles.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-8">Berita Lainnya</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map(related => (
                <Link 
                  key={related.id} 
                  to={`/news/${related.slug}`}
                  className="group"
                >
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
                    {new Date(related.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
