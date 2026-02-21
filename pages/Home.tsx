// NewsDetail.tsx - WITH DYNAMIC OG TAGS
import React, { useState, useEffect, useRef } from 'react';
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

const NewsDetail: React.FC<NewsDetailProps> = ({ articles }) => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiAreaRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
  };

  // Enter = newline only, send via button
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // allow default newline
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
      }, 0);
    }
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsTyping(true);

    // Scroll ke area AI
    setTimeout(() => {
      aiAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      // Ganti ini dengan API call ke ArticleChat / Anthropic
      await new Promise(r => setTimeout(r, 1500));
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: `Berdasarkan artikel ini: ${text} — [jawaban AI akan muncul di sini]` },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        aiAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  };

  return (
    <>
      {/* ── GAMBAR FULL WIDTH di atas ── */}
      <div className="w-full overflow-hidden relative" style={{ height: 'min(55vw, 520px)', minHeight: 220 }}>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ── ARTIKEL ── */}
      <article className="max-w-2xl mx-auto px-4 py-8 pb-36">

        {/* Kembali */}
        <Link
          to="/"
          className="text-sm font-medium text-gray-400 hover:text-black transition-colors mb-6 inline-block"
        >
          ← Kembali
        </Link>

        {/* Kategori + Tanggal */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
            {article.category}
          </span>
          <span className="text-gray-400 text-sm">•</span>
          <time className="text-gray-400 text-sm">
            {new Date(article.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </time>
        </div>

        {/* Judul */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author + Share */}
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

        {/* Voice Reader */}
        <VoiceReader text={fullText} />

        {/* Konten */}
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
                      <img src={block.content} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
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

        {/* ── AI CHAT AREA (muncul di bawah artikel setelah ada chat) ── */}
        {(chatMessages.length > 0 || isTyping) && (
          <div ref={aiAreaRef} className="mt-12 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <span className="text-sm font-bold">Tanya Cylen AI</span>
            </div>

            <div className="space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-800 max-w-[85%]">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 leading-relaxed">
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-1 items-center px-4 py-3 border border-gray-100 rounded-2xl rounded-tl-sm w-fit">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="block w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Berita Lainnya */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
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
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* ── BOTTOM INPUT BAR — selalu tampil, floating ── */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex items-end gap-2">
        {/* Input pill */}
        <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-3xl px-4 py-3 focus-within:bg-white focus-within:shadow-lg focus-within:border focus-within:border-gray-200 transition-all">
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Tanya lanjutan..."
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-base leading-relaxed text-gray-800 placeholder-gray-400 min-h-[26px] max-h-[200px] overflow-y-hidden"
          />
          {/* Mic icon */}
          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 pb-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="9" y1="22" x2="15" y2="22"/>
            </svg>
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={sendMessage}
          className="w-12 h-12 bg-gray-200 hover:bg-black rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 group"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"
            className="stroke-gray-500 group-hover:stroke-white transition-colors">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" className="fill-gray-500 group-hover:fill-white transition-colors"/>
          </svg>
        </button>
      </div>
    </>
  );
};

export default NewsDetail;
