import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsArticle, ArticlePage, CarouselItem } from '../types';
import ShareButton from '../components/ShareButton';
import ArticleComments from '../components/ArticleComments';

interface NewsDetailProps {
  articles: NewsArticle[];
}

// ── OG TAGS ──
const updateOGTags = (article: NewsArticle) => {
  const url = window.location.href;
  const setMeta = (property: string, content: string, isName = false) => {
    const attr = isName ? 'name' : 'property';
    let el = document.querySelector(`meta[${attr}="${property}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, property); document.head.appendChild(el); }
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
    script1.innerHTML = `atOptions = {'key':'aa643214b9c24b68c518717507f72797','format':'iframe','height':50,'width':320,'params':{}};`;
    const script2 = document.createElement('script');
    script2.src = 'https://www.highperformanceformat.com/aa643214b9c24b68c518717507f72797/invoke.js';
    const container = document.getElementById('adsterra-banner');
    if (container) { container.appendChild(script1); container.appendChild(script2); }
  }, []);
  return <div id="adsterra-banner" className="flex justify-center my-8" />;
};

// ── CAROUSEL ──
const ArticleCarousel: React.FC<{ items: CarouselItem[]; title: string; category: string }> = ({ items, title, category }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);

  const go = (i: number) => setIdx(Math.max(0, Math.min(items.length - 1, i)));

  return (
    <div style={{ position: 'relative', width: '100%', height: '65vw', maxHeight: '520px', minHeight: '280px', overflow: 'hidden', background: '#000' }}>
      {/* Track */}
      <div style={{ display: 'flex', height: '100%', transform: `translateX(-${idx * 100}%)`, transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
        {items.map((item, i) => (
          <div key={i} style={{ flexShrink: 0, width: '100%', height: '100%', position: 'relative' }}>
            {item.type === 'video' ? (
              <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls={false} autoPlay={i === idx} muted loop playsInline />
            ) : (
              <img src={item.url} alt={item.caption || title} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        ))}
      </div>

      {/* Overlay gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.88) 100%)', pointerEvents: 'none' }} />

      {/* Title overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 18px', zIndex: 2, pointerEvents: 'none' }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>
          ● {category} · {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <h1 style={{ fontSize: 'clamp(17px,5vw,26px)', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.5)', margin: 0 }}>
          {title}
        </h1>
      </div>

      {/* Counter */}
      {items.length > 1 && (
        <div style={{ position: 'absolute', top: '12px', right: '14px', fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '3px 8px', borderRadius: '10px', zIndex: 3 }}>
          {idx + 1} / {items.length}
        </div>
      )}

      {/* Nav buttons */}
      {items.length > 1 && idx > 0 && (
        <button onClick={() => go(idx - 1)} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}
      {items.length > 1 && idx < items.length - 1 && (
        <button onClick={() => go(idx + 1)} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div style={{ position: 'absolute', bottom: '14px', right: '16px', display: 'flex', gap: '5px', zIndex: 3 }}>
          {items.map((_, i) => (
            <div key={i} onClick={() => go(i)} style={{ width: i === idx ? '16px' : '5px', height: '5px', borderRadius: i === idx ? '3px' : '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer' }} />
          ))}
        </div>
      )}

      {/* Touch swipe */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); }}
      />
    </div>
  );
};

// ── VOICE READER ──
const VoiceReader: React.FC<{ text: string }> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false); setIsPaused(false);
  }, [text]);

  const play = () => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utterRef.current = utter;
    utter.lang = 'id-ID'; utter.rate = 1.0; utter.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id'));
    if (idVoice) utter.voice = idVoice;
    utter.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utter.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utter.onerror = (e) => { if (e.error !== 'canceled') { setIsPlaying(false); setIsPaused(false); } };
    setTimeout(() => window.speechSynthesis.speak(utter), 100);
  };

  const pause = () => { window.speechSynthesis.pause(); setIsPaused(true); };
  const resume = () => { window.speechSynthesis.resume(); setIsPaused(false); };
  const stop = () => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); };

  if (!('speechSynthesis' in window)) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#f8f8f8', borderRadius: '14px', marginBottom: '0' }}>
      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        {[8, 14, 10, 18, 12].map((h, i) => (
          <div key={i} style={{
            width: '3px', borderRadius: '2px',
            background: isPlaying && !isPaused ? '#111' : '#bbb',
            height: isPlaying && !isPaused ? `${h}px` : '8px',
            transition: 'height 0.15s, background 0.2s',
            animation: isPlaying && !isPaused ? `bar-anim 0.8s ease ${i * 0.1}s infinite alternate` : 'none',
          }} />
        ))}
      </div>

      {/* Button */}
      {!isPlaying ? (
        <button onClick={play} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      ) : !isPaused ? (
        <button onClick={pause} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
        </button>
      ) : (
        <button onClick={resume} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      )}

      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111', display: 'block', marginBottom: '2px' }}>
          {isPlaying ? (isPaused ? 'Dijeda' : 'Sedang Diputar...') : 'Dengarkan Artikel'}
        </span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.1em' }}>
          Text-to-Speech · Bahasa Indonesia
        </span>
      </div>

      {isPlaying && (
        <button onClick={stop} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" fill="#666" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
        </button>
      )}

      <style>{`@keyframes bar-anim { from{height:4px} to{height:20px} }`}</style>
    </div>
  );
};

// ── AI INSIGHT ──
const AIInsight: React.FC<{ article: NewsArticle; fullText: string }> = ({ article, fullText }) => {
  const [points, setPoints] = useState<string[]>(article.aiInsight || []);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const loaded = useRef(false);

  const generate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Berikan 4 poin insight singkat dan tajam dari artikel berita ini dalam Bahasa Indonesia. Setiap poin maksimal 20 kata, langsung ke intinya. Format: hanya JSON array of strings, tanpa preamble. Judul: ${article.title}. Konten: ${fullText.substring(0, 1500)}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text?.trim().replace(/```json|```/g, '').trim();
      if (text) {
        const parsed = JSON.parse(text);
        setPoints(parsed);
      }
    } catch (e) {
      // Fallback insight dari summary
      const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 4);
      setPoints(sentences.map(s => s.trim()));
    } finally {
      setLoading(false);
    }
  }, [article.title, fullText, loading]);

  useEffect(() => {
    if (!loaded.current && points.length === 0) {
      loaded.current = true;
      setTimeout(generate, 800);
    }
  }, []);

  return (
    <div style={{ border: '1px solid #ececec', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa', borderBottom: open ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', letterSpacing: '0.2em', background: '#111', color: '#fff', padding: '3px 7px', borderRadius: '4px' }}>AI</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>Insight Artikel</span>
        </div>
        <svg width="14" height="14" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={2} style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      {open && (
        <div style={{ padding: '16px' }}>
          {loading && points.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {[0, 200, 400].map(delay => (
                <div key={delay} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ddd', animation: `dot-pulse 1.2s ease ${delay}ms infinite` }} />
              ))}
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.1em' }}>Menganalisis artikel...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {points.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#bbb', flexShrink: 0, paddingTop: '2px', width: '16px' }}>0{i + 1}</span>
                  <span style={{ fontSize: '13px', color: '#333', lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#bbb', letterSpacing: '0.1em' }}>Dihasilkan oleh Claude AI · TelierNews</span>
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes dot-pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
};

// ── NOVEL PAGES ──
const NovelPages: React.FC<{ pages: ArticlePage[] }> = ({ pages }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const go = (i: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, i));
    setIdx(next);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const page = pages[idx];

  return (
    <div ref={contentRef} style={{ marginTop: '20px' }}>
      {/* Progress + dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 0 14px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {pages.map((_, i) => (
            <div key={i} onClick={() => go(i)} style={{ width: i === idx ? '16px' : '5px', height: '5px', borderRadius: i === idx ? '3px' : '50%', background: i === idx ? '#111' : '#e0e0e0', transition: 'all 0.2s', cursor: 'pointer' }} />
          ))}
        </div>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#bbb', letterSpacing: '0.15em' }}>{idx + 1} / {pages.length}</span>
      </div>

      {/* Page content */}
      <div
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1)); }}
      >
        {page.blocks.map((block, i) => {
          if (block.type === 'image') return (
            <div key={i} style={{ margin: '18px 0', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={block.content} alt={block.caption || ''} referrerPolicy="no-referrer" style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }} />
              {block.caption && <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.1em', textAlign: 'center', marginTop: '8px' }}>{block.caption}</p>}
            </div>
          );
          if (block.type === 'video') return (
            <div key={i} style={{ margin: '18px 0', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              {block.content.includes('youtube.com') || block.content.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${block.content.split('v=')[1]?.split('&')[0] || block.content.split('/').pop()}`}
                  style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
                  allowFullScreen
                />
              ) : (
                <video src={block.content} controls style={{ width: '100%', maxHeight: '280px', display: 'block' }} />
              )}
              {block.caption && <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#555', letterSpacing: '0.1em', textAlign: 'center', padding: '8px 12px', background: '#111' }}>{block.caption}</p>}
            </div>
          );
          // text
          return (
            <p key={i} style={{ fontFamily: "'Georgia', serif", fontSize: '16px', lineHeight: 1.9, color: '#222', marginBottom: '18px' }}>
              {block.content}
            </p>
          );
        })}
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
        <button onClick={() => go(idx - 1)} disabled={idx === 0}
          style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#111', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontFamily: "'Montserrat', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Sebelumnya
        </button>
        <button onClick={() => go(idx + 1)} disabled={idx === pages.length - 1}
          style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', background: idx === pages.length - 1 ? '#888' : '#111', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: idx === pages.length - 1 ? 'default' : 'pointer', fontFamily: "'Montserrat', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {idx === pages.length - 1 ? 'Selesai ✓' : 'Halaman Berikutnya'}
          {idx < pages.length - 1 && <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>}
        </button>
      </div>
    </div>
  );
};

// ── FALLBACK CONTENT (artikel lama) ──
const FallbackContent: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <div className="prose prose-slate max-w-none">
    <p className="text-lg leading-relaxed text-gray-600 mb-6 italic font-light border-l-4 border-black pl-5">{article.summary}</p>
    {article.contentBlocks && article.contentBlocks.length > 0 ? (
      <div className="space-y-6">
        {article.contentBlocks.map((block, i) => (
          <div key={i}>
            {block.type === 'image' ? (
              <div className="relative rounded-2xl overflow-hidden my-6">
                <img src={block.content} alt="" className="w-full object-cover" />
              </div>
            ) : (
              <div className="text-base leading-relaxed text-gray-800 whitespace-pre-line">{block.content}</div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-base leading-relaxed space-y-5 text-gray-800 whitespace-pre-line">{article.content}</div>
    )}
  </div>
);

// ── MAIN COMPONENT ──
const NewsDetail: React.FC<NewsDetailProps> = ({ articles }) => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) updateOGTags(article);
    return () => resetOGTags();
  }, [id, article]);

  if (!article) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Berita Tidak Ditemukan</h2>
      <Link to="/" className="text-blue-500 hover:underline">Kembali ke Beranda</Link>
    </div>
  );

  const fullText = `${article.summary}. ${
    article.pages
      ? article.pages.flatMap(p => p.blocks.filter(b => b.type === 'text').map(b => b.content)).join('. ')
      : article.contentBlocks
        ? article.contentBlocks.filter(b => b.type === 'text').map(b => b.content).join('. ')
        : article.content
  }`;

  // Build carousel items
  const carouselItems: CarouselItem[] = article.carouselItems?.length
    ? article.carouselItems
    : [{ type: 'image', url: article.imageUrl }];

  const relatedArticles = articles.filter(a => a.id !== id).slice(0, 3);

  return (
    <>
      <style>{`@keyframes bar-anim { from{height:4px} to{height:20px} } @keyframes dot-pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>

      {/* CAROUSEL */}
      <ArticleCarousel items={carouselItems} title={article.title} category={article.category} />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ← Kembali */}
        <Link to="/" style={{ display: 'inline-block', fontSize: '13px', fontWeight: 500, color: '#aaa', textDecoration: 'none', margin: '14px 0 12px' }}>
          ← Kembali
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f0f0f0', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {article.author.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', margin: 0 }}>{article.author}</p>
              <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>
                {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <ShareButton title={article.title} url={window.location.href} />
        </div>

        {/* 1. VOICE READER */}
        <div style={{ marginTop: '14px' }}>
          <VoiceReader text={fullText} />
        </div>

        {/* 2. AI INSIGHT */}
        <AIInsight article={article} fullText={fullText} />

        {/* 3. ARTIKEL KONTEN */}
        {article.pages && article.pages.length > 0 ? (
          <NovelPages pages={article.pages} />
        ) : (
          <div style={{ marginTop: '20px' }}>
            <FallbackContent article={article} />
          </div>
        )}

        {/* KOMENTAR */}
        <ArticleComments articleId={article.id} />

        {/* IKLAN */}
        <AdBanner />

        {/* BERITA LAINNYA */}
        {relatedArticles.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Berita Lainnya</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {relatedArticles.map(related => (
                <Link key={related.id} to={`/news/${related.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={related.imageUrl} alt={related.title} referrerPolicy="no-referrer" style={{ width: '72px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa' }}>{related.category}</span>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.4, margin: '3px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{related.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Scroll down button */}
      <button onClick={() => window.scrollBy({ top: 600, behavior: 'smooth' })}
        style={{ position: 'fixed', bottom: '24px', right: '20px', width: '44px', height: '44px', background: '#000', color: '#fff', border: 'none', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        ↓
      </button>
    </>
  );
};

export default NewsDetail;
