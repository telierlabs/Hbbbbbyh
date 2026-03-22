import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NewsArticle, ArticlePage, CarouselItem } from '../types';
import ShareButton from '../components/ShareButton';
import ArticleComments from '../components/ArticleComments';
import { askAboutArticle } from '../services/geminiService';
import { incrementViews, subscribeToViews, formatViews } from '../services/articleService';
import ImageViewer, { MediaItem } from '../components/ImageViewer';

interface NewsDetailProps {
  articles: NewsArticle[];
}

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
const ArticleCarousel: React.FC<{
  items: CarouselItem[];
  title: string;
  category: string;
  publishedAt: string;
  onOpenViewer: (index: number) => void;
}> = ({ items, title, category, publishedAt, onOpenViewer }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);
  const go = (i: number) => setIdx(Math.max(0, Math.min(items.length - 1, i)));

  return (
    <div style={{ position: 'relative', width: '100%', height: '65vw', maxHeight: '520px', minHeight: '280px', overflow: 'hidden', background: '#000' }}>
      <div style={{ display: 'flex', height: '100%', transform: `translateX(-${idx * 100}%)`, transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
        {items.map((item, i) => (
          <div key={i} style={{ flexShrink: 0, width: '100%', height: '100%', position: 'relative' }}>
            {item.type === 'video'
              ? <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} autoPlay={i === idx} muted loop playsInline onClick={() => onOpenViewer(i)} />
              : <img src={item.url} alt={title} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => onOpenViewer(i)} />}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.88) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 18px', zIndex: 2, pointerEvents: 'none' }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>
          ● {category} · {new Date(publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <h1 style={{ fontSize: 'clamp(17px,5vw,26px)', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.5)', margin: 0 }}>{title}</h1>
      </div>
      {/* Expand icon hint */}
      <div style={{ position: 'absolute', top: '12px', left: '14px', zIndex: 3, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
        <svg width="10" height="10" fill="none" stroke="rgba(255,255,255,0.6)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>TAP TO EXPAND</span>
      </div>
      {items.length > 1 && <div style={{ position: 'absolute', top: '12px', right: '14px', fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '3px 8px', borderRadius: '10px', zIndex: 3, pointerEvents: 'none' }}>{idx + 1} / {items.length}</div>}
      {items.length > 1 && idx > 0 && (
        <button onClick={() => go(idx - 1)} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}
      {items.length > 1 && idx < items.length - 1 && (
        <button onClick={() => go(idx + 1)} style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
      {items.length > 1 && (
        <div style={{ position: 'absolute', bottom: '14px', right: '16px', display: 'flex', gap: '5px', zIndex: 3 }}>
          {items.map((_, i) => <div key={i} onClick={() => go(i)} style={{ width: i === idx ? '16px' : '5px', height: '5px', borderRadius: i === idx ? '3px' : '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer' }} />)}
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); }} />
    </div>
  );
};

// ── VOICE READER ──
const VoiceReader: React.FC<{ text: string }> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);
  useEffect(() => { window.speechSynthesis?.cancel(); setIsPlaying(false); setIsPaused(false); }, [text]);
  const play = () => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID'; utter.rate = 1.0;
    const idVoice = window.speechSynthesis.getVoices().find(v => v.lang.includes('id'));
    if (idVoice) utter.voice = idVoice;
    utter.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utter.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utter.onerror = e => { if (e.error !== 'canceled') { setIsPlaying(false); setIsPaused(false); } };
    setTimeout(() => window.speechSynthesis.speak(utter), 100);
  };
  if (!('speechSynthesis' in window)) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#f8f8f8', borderRadius: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        {[8, 14, 10, 18, 12].map((h, i) => (
          <div key={i} style={{ width: '3px', borderRadius: '2px', background: isPlaying && !isPaused ? '#111' : '#bbb', height: isPlaying && !isPaused ? `${h}px` : '8px', transition: 'height 0.15s', animation: isPlaying && !isPaused ? `bar-anim 0.8s ease ${i * 0.1}s infinite alternate` : 'none' }} />
        ))}
      </div>
      {!isPlaying ? (
        <button onClick={play} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      ) : !isPaused ? (
        <button onClick={() => { window.speechSynthesis.pause(); setIsPaused(true); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
        </button>
      ) : (
        <button onClick={() => { window.speechSynthesis.resume(); setIsPaused(false); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      )}
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111', display: 'block', marginBottom: '2px' }}>
          {isPlaying ? (isPaused ? 'Dijeda' : 'Sedang Diputar...') : 'Dengarkan Artikel'}
        </span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.1em' }}>Text-to-Speech · Bahasa Indonesia</span>
      </div>
      {isPlaying && (
        <button onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); }} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f0f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" fill="#666" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
        </button>
      )}
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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: `Berikan 4 poin insight singkat dan tajam dari artikel berita ini dalam Bahasa Indonesia. Setiap poin maksimal 20 kata. Format: hanya JSON array of strings. Judul: ${article.title}. Konten: ${fullText.substring(0, 1500)}` }] })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim().replace(/```json|```/g, '').trim();
      if (text) setPoints(JSON.parse(text));
    } catch {
      const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 4);
      setPoints(sentences.map(s => s.trim()));
    } finally { setLoading(false); }
  }, [article.title, fullText]);
  useEffect(() => { if (!loaded.current && points.length === 0) { loaded.current = true; setTimeout(generate, 800); } }, []);
  return (
    <div style={{ border: '1px solid #ececec', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa', borderBottom: open ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', letterSpacing: '0.2em', background: '#111', color: '#fff', padding: '3px 7px', borderRadius: '4px' }}>AI</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>Insight Artikel</span>
        </div>
        <svg width="14" height="14" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={2} style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </div>
      {open && (
        <div style={{ padding: '16px' }}>
          {loading && points.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {[0, 200, 400].map(d => <div key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ddd', animation: `dot-pulse 1.2s ease ${d}ms infinite` }} />)}
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
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#bbb', letterSpacing: '0.1em' }}>Dihasilkan oleh Claude AI · TelierNews</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── NOVEL PAGES ──
const NovelPages: React.FC<{ pages: ArticlePage[]; onOpenViewer: (items: MediaItem[], index: number) => void }> = ({ pages, onOpenViewer }) => {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const go = (i: number) => {
    const next = Math.max(0, Math.min(pages.length - 1, i));
    setIdx(next);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const page = pages[idx];

  // Kumpulkan semua media di halaman ini untuk viewer
  const pageMediaItems: MediaItem[] = page.blocks
    .filter(b => b.type === 'image' || b.type === 'video')
    .map(b => ({ type: b.type as 'image' | 'video', url: b.content, caption: b.caption }));

  return (
    <div ref={contentRef} style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 0 14px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {pages.map((_, i) => <div key={i} onClick={() => go(i)} style={{ width: i === idx ? '16px' : '5px', height: '5px', borderRadius: i === idx ? '3px' : '50%', background: i === idx ? '#111' : '#e0e0e0', transition: 'all 0.2s', cursor: 'pointer' }} />)}
        </div>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#bbb', letterSpacing: '0.15em' }}>{idx + 1} / {pages.length}</span>
      </div>
      <div onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }} onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1)); }}>
        {page.blocks.map((block, i) => {
          if (block.type === 'image') {
            const mediaIdx = pageMediaItems.findIndex((m, mi) => m.url === block.content && pageMediaItems.slice(0, mi).filter(x => x.url === block.content).length === 0);
            return (
              <div key={i} style={{ margin: '18px 0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }} onClick={() => onOpenViewer(pageMediaItems, Math.max(0, mediaIdx))}>
                <img src={block.content} alt={block.caption || ''} referrerPolicy="no-referrer" style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }} />
                {/* Expand hint */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <svg width="9" height="9" fill="none" stroke="rgba(255,255,255,0.7)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                </div>
                {block.caption && <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.1em', textAlign: 'center', marginTop: '8px' }}>{block.caption}</p>}
              </div>
            );
          }
          if (block.type === 'video') {
            const mediaIdx = pageMediaItems.findIndex(m => m.url === block.content);
            return (
              <div key={i} style={{ margin: '18px 0', borderRadius: '12px', overflow: 'hidden', background: '#000', cursor: 'pointer' }}>
                {block.content.includes('youtube.com') || block.content.includes('youtu.be')
                  ? <iframe src={`https://www.youtube.com/embed/${block.content.split('v=')[1]?.split('&')[0] || block.content.split('/').pop()}`} style={{ width: '100%', aspectRatio: '16/9', border: 'none' }} allowFullScreen />
                  : <div style={{ position: 'relative' }} onClick={() => onOpenViewer(pageMediaItems, Math.max(0, mediaIdx))}>
                      <video src={block.content} style={{ width: '100%', maxHeight: '280px', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>}
                {block.caption && <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#555', letterSpacing: '0.1em', textAlign: 'center', padding: '8px 12px', background: '#111' }}>{block.caption}</p>}
              </div>
            );
          }
          return <p key={i} style={{ fontFamily: "'Georgia', serif", fontSize: '16px', lineHeight: 1.9, color: '#222', marginBottom: '18px' }}>{block.content}</p>;
        })}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
        <button onClick={() => go(idx - 1)} disabled={idx === 0} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '12px', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#111', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1, fontFamily: "'Montserrat', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Sebelumnya
        </button>
        <button onClick={() => go(idx + 1)} disabled={idx === pages.length - 1} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', background: idx === pages.length - 1 ? '#888' : '#111', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: idx === pages.length - 1 ? 'default' : 'pointer', fontFamily: "'Montserrat', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {idx === pages.length - 1 ? 'Selesai ✓' : <>Halaman Berikutnya<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg></>}
        </button>
      </div>
    </div>
  );
};

// ── FALLBACK ──
const FallbackContent: React.FC<{ article: NewsArticle; onOpenViewer: (items: MediaItem[], index: number) => void }> = ({ article, onOpenViewer }) => {
  const images: MediaItem[] = article.contentBlocks?.filter(b => b.type === 'image').map(b => ({ type: 'image' as const, url: b.content })) || [];
  return (
    <div className="prose prose-slate max-w-none" style={{ marginTop: '20px' }}>
      <p className="text-lg leading-relaxed text-gray-600 mb-6 italic font-light border-l-4 border-black pl-5">{article.summary}</p>
      {article.contentBlocks && article.contentBlocks.length > 0 ? (
        <div className="space-y-6">
          {article.contentBlocks.map((block, i) => (
            <div key={i}>
              {block.type === 'image' ? (
                <div className="relative rounded-2xl overflow-hidden my-6 cursor-pointer" style={{ position: 'relative' }} onClick={() => { const imgIdx = images.findIndex(img => img.url === block.content); onOpenViewer(images, Math.max(0, imgIdx)); }}>
                  <img src={block.content} alt="" className="w-full object-cover" />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '4px 7px' }}>
                    <svg width="9" height="9" fill="none" stroke="rgba(255,255,255,0.7)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                  </div>
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
};

// ── CHAT FULLSCREEN ──
interface Message { role: 'user' | 'ai'; content: string; }
const ChatFullscreen: React.FC<{ article: NewsArticle; fullText: string; onClose: () => void }> = ({ article, fullText, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);
  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput(''); setLoading(true);
    const res = await askAboutArticle(article.title, fullText, q);
    setMessages(prev => [...prev, { role: 'ai', content: res }]);
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', background: '#fff', flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f5f5f5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" fill="none" stroke="#555" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <img src="/IMG_20260110_200713_512.webp" alt="Cylen AI" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', margin: 0 }}>Tanya Cylen AI</p>
          <p style={{ fontSize: '10px', color: '#aaa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f5f5f5', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="#bbb" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Tanya apa saja tentang artikel ini</p>
            <p style={{ fontSize: '12px', color: '#bbb' }}>Cylen AI akan menjawab berdasarkan konten artikel</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? '#111' : '#f5f5f5', color: msg.role === 'user' ? '#fff' : '#222', fontSize: '14px', lineHeight: 1.6 }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: '#f5f5f5', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 150, 300].map(d => <div key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#bbb', animation: `dot-pulse 1.2s ease ${d}ms infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fff', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="Tanya tentang artikel ini..." disabled={loading}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #e0e0e0', fontSize: '14px', outline: 'none', background: '#f8f8f8', fontFamily: "'Montserrat', sans-serif" }} />
        <button onClick={handleSubmit} disabled={loading || !input.trim()}
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: input.trim() ? '#111' : '#ddd', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  );
};

// ── MAIN ──
const NewsDetail: React.FC<NewsDetailProps> = ({ articles }) => {
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);
  const [chatMode, setChatMode] = useState(false);
  const [views, setViews] = useState<number>(0);
  const [viewer, setViewer] = useState<{ items: MediaItem[]; index: number } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) updateOGTags(article);
    return () => resetOGTags();
  }, [id, article]);

  useEffect(() => {
    if (!id) return;
    incrementViews(id);
    const unsub = subscribeToViews(id, setViews);
    return () => unsub();
  }, [id]);

  if (!article) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Berita Tidak Ditemukan</h2>
      <Link to="/" className="text-blue-500 hover:underline">Kembali ke Beranda</Link>
    </div>
  );

  const fullText = `${article.summary}. ${article.pages ? article.pages.flatMap(p => p.blocks.filter(b => b.type === 'text').map(b => b.content)).join('. ') : article.contentBlocks ? article.contentBlocks.filter(b => b.type === 'text').map(b => b.content).join('. ') : article.content}`;
  const carouselItems: CarouselItem[] = article.carouselItems?.length ? article.carouselItems : [{ type: 'image', url: article.imageUrl }];
  const carouselMediaItems: MediaItem[] = carouselItems.map(c => ({ type: c.type, url: c.url, caption: c.caption }));
  const relatedArticles = articles.filter(a => a.id !== id).slice(0, 3);

  return (
    <>
      <style>{`
        @keyframes bar-anim { from{height:4px} to{height:20px} }
        @keyframes dot-pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>

      {/* IMAGE VIEWER */}
      {viewer && <ImageViewer items={viewer.items} startIndex={viewer.index} onClose={() => setViewer(null)} />}

      {chatMode && <ChatFullscreen article={article} fullText={fullText} onClose={() => setChatMode(false)} />}

      <ArticleCarousel
        items={carouselItems} title={article.title}
        category={article.category} publishedAt={article.publishedAt}
        onOpenViewer={(index) => setViewer({ items: carouselMediaItems, index })}
      />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 80px' }}>
        <Link to="/" style={{ display: 'inline-block', fontSize: '13px', fontWeight: 500, color: '#aaa', textDecoration: 'none', margin: '14px 0 12px' }}>← Kembali</Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{article.author.charAt(0)}</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', margin: 0 }}>{article.author}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>{new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <svg width="11" height="11" fill="none" stroke="#bbb" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#bbb', letterSpacing: '0.05em' }}>{formatViews(views)}</span>
                </div>
              </div>
            </div>
          </div>
          <ShareButton title={article.title} url={window.location.href} />
        </div>

        <div style={{ marginTop: '14px' }}><VoiceReader text={fullText} /></div>
        <AIInsight article={article} fullText={fullText} />

        {article.pages && article.pages.length > 0
          ? <NovelPages pages={article.pages} onOpenViewer={(items, index) => setViewer({ items, index })} />
          : <FallbackContent article={article} onOpenViewer={(items, index) => setViewer({ items, index })} />}

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <img src="/IMG_20260110_200713_512.webp" alt="Cylen" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', margin: 0 }}>Tanya Cylen AI</p>
              <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Ketik pertanyaan tentang artikel ini</p>
            </div>
          </div>
          <div onClick={() => setChatMode(true)} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '24px', background: '#f8f8f8', cursor: 'text' }}>
            <span style={{ flex: 1, fontSize: '14px', color: '#bbb', fontFamily: "'Montserrat', sans-serif" }}>Tanya tentang artikel ini...</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </div>
          </div>
        </div>

        <ArticleComments articleId={article.id} />
        <AdBanner />

        {relatedArticles.length > 0 && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Berita Lainnya</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {relatedArticles.map(related => (
                <Link key={related.id} to={`/news/${related.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={related.imageUrl} alt={related.title} referrerPolicy="no-referrer"
                    style={{ width: '72px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                    onClick={e => { e.preventDefault(); setViewer({ items: [{ type: 'image', url: related.imageUrl }], index: 0 }); }}
                  />
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

      {!chatMode && !viewer && (
        <button onClick={() => window.scrollBy({ top: 600, behavior: 'smooth' })}
          style={{ position: 'fixed', bottom: '24px', right: '20px', width: '44px', height: '44px', background: '#000', color: '#fff', border: 'none', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>↓</button>
      )}
    </>
  );
};

export default NewsDetail;
