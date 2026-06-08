import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface TikTokProps {
  articles: NewsArticle[];
}

const KEYFRAMES = `
@keyframes twinkle1 { 0%,100%{opacity:0.1;}  50%{opacity:0.8;} }
@keyframes twinkle2 { 0%,100%{opacity:0.2;}  50%{opacity:1.0;} }
@keyframes twinkle3 { 0%,100%{opacity:0.05;} 50%{opacity:0.6;} }
@keyframes fall0 { 0%{transform:translate(0,0);opacity:0;} 5%{opacity:1;} 90%{opacity:1;} 100%{transform:translate(-420px,120px);opacity:0;} }
@keyframes fall1 { 0%{transform:translate(0,0);opacity:0;} 5%{opacity:1;} 90%{opacity:1;} 100%{transform:translate(-380px,110px);opacity:0;} }
@keyframes fall2 { 0%{transform:translate(0,0);opacity:0;} 5%{opacity:1;} 90%{opacity:1;} 100%{transform:translate(-440px,100px);opacity:0;} }
@keyframes fall3 { 0%{transform:translate(0,0);opacity:0;} 5%{opacity:1;} 90%{opacity:1;} 100%{transform:translate(-360px,130px);opacity:0;} }
@keyframes fall4 { 0%{transform:translate(0,0);opacity:0;} 5%{opacity:1;} 90%{opacity:1;} 100%{transform:translate(-400px,115px);opacity:0;} }
@keyframes slideUp { from{transform:translateY(100%);opacity:0;} to{transform:translateY(0);opacity:1;} }
@keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
`;

const STARS = [
  { top:'12%', left:'8%',  s:2,   a:'twinkle2', d:'3.1s', dl:'0s'   },
  { top:'30%', left:'20%', s:1.5, a:'twinkle1', d:'4.5s', dl:'0.6s' },
  { top:'55%', left:'15%', s:2.5, a:'twinkle3', d:'2.8s', dl:'1.1s' },
  { top:'70%', left:'35%', s:1.5, a:'twinkle2', d:'5.0s', dl:'0.3s' },
  { top:'20%', left:'50%', s:2,   a:'twinkle1', d:'3.7s', dl:'1.8s' },
  { top:'75%', left:'55%', s:1.5, a:'twinkle3', d:'4.2s', dl:'0.8s' },
  { top:'40%', left:'72%', s:2,   a:'twinkle2', d:'3.3s', dl:'2.0s' },
  { top:'15%', left:'88%', s:2.5, a:'twinkle1', d:'5.5s', dl:'0.4s' },
  { top:'60%', left:'80%', s:1.5, a:'twinkle3', d:'2.6s', dl:'1.5s' },
  { top:'85%', left:'92%', s:2,   a:'twinkle2', d:'4.8s', dl:'0.9s' },
];

const METEORS = [
  { top:'5%',  left:'98%', dur:'1.1s', delay:'0s',   tail:90,  anim:'fall0' },
  { top:'8%',  left:'88%', dur:'1.5s', delay:'0.5s', tail:70,  anim:'fall1' },
  { top:'3%',  left:'78%', dur:'0.9s', delay:'1.0s', tail:110, anim:'fall2' },
  { top:'10%', left:'95%', dur:'1.3s', delay:'1.5s', tail:80,  anim:'fall3' },
  { top:'6%',  left:'70%', dur:'1.7s', delay:'2.0s', tail:95,  anim:'fall4' },
];

const TikTok: React.FC<TikTokProps> = ({ articles }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) {
      if (dy > 0 && currentIdx < articles.length - 1) setCurrentIdx(prev => prev + 1);
      if (dy < 0 && currentIdx > 0) setCurrentIdx(prev => prev - 1);
    }
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const article = articles[currentIdx];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Montserrat', sans-serif",
      colorScheme: 'dark',
    }}>
      <style>{KEYFRAMES}</style>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{
        position: 'relative',
        padding: '28px 20px 18px',
        textAlign: 'center',
        borderBottom: '1px solid #1a1a1a',
        background: '#000',
        overflow: 'hidden',
      }}>
        {STARS.map((s, i) => (
          <span key={`star${i}`} style={{
            position: 'absolute',
            top: s.top, left: s.left,
            width: s.s, height: s.s,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: `0 0 ${s.s + 1}px ${s.s}px rgba(255,255,255,0.5)`,
            animation: `${s.a} ${s.d} ease-in-out ${s.dl} infinite`,
            pointerEvents: 'none',
          }} />
        ))}
        {METEORS.map((m, i) => (
          <div key={`met${i}`} style={{
            position: 'absolute',
            top: m.top, left: m.left,
            display: 'flex',
            alignItems: 'center',
            transform: 'rotate(15deg)',
            transformOrigin: 'left center',
            animation: `${m.anim} ${m.dur} linear ${m.delay} infinite`,
            opacity: 0,
            pointerEvents: 'none',
          }}>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#fff', boxShadow: '0 0 5px 2px rgba(255,255,255,0.8)', flexShrink: 0 }} />
            <span style={{ display: 'inline-block', width: m.tail, height: 1.5, marginLeft: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.8), transparent)', borderRadius: 999 }} />
          </div>
        ))}
        <img
          src="/IMG_20260220_144200.png"
          alt="TelierNews"
          style={{ height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto', position: 'relative', zIndex: 1 }}
        />
        <p style={{ color: '#aaa', fontSize: 11, letterSpacing: '0.18em', textTransform: 'lowercase', margin: '8px 0 0', position: 'relative', zIndex: 1 }}>
          teliernews.com · TikTok Style
        </p>
      </div>

      {/* TIKTOK FEED */}
      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#444' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Belum ada artikel</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'relative', height: 'calc(100vh - 110px)', overflow: 'hidden' }}
        >
          {article && (
            <Link
              key={article.id}
              to={`/news/${article.id}`}
              style={{ display: 'block', position: 'relative', height: '100%', textDecoration: 'none' }}
            >
              {/* Background Image */}
              <img
                src={article.imageUrl}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.95) 100%)',
              }} />

              {/* Konten bawah */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 60,
                padding: '20px 16px 32px',
                animation: 'slideUp 0.3s ease',
              }}>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 9, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
                  display: 'block', marginBottom: 8,
                }}>
                  ● {article.category}
                </span>
                <h2 style={{
                  fontSize: 18, fontWeight: 800, color: '#fff',
                  lineHeight: 1.25, letterSpacing: '-0.02em',
                  margin: '0 0 8px', textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}>
                  {article.title}
                </h2>
                <p style={{
                  fontSize: 12, color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {article.summary}
                </p>
              </div>

              {/* Sidebar kanan */}
              <div style={{
                position: 'absolute', bottom: 32, right: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
              }}>
                {/* Like */}
                <button
                  onClick={(e) => toggleLike(article.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: liked[article.id] ? 'pulse 0.3s ease' : 'none',
                  }}>
                    <svg width="22" height="22" fill={liked[article.id] ? '#ff2d55' : 'none'} stroke={liked[article.id] ? '#ff2d55' : '#fff'} viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 10, color: '#fff', fontFamily: "'Share Tech Mono', monospace" }}>
                    {liked[article.id] ? '1' : '0'}
                  </span>
                </button>

                {/* Baca */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 10, color: '#fff', fontFamily: "'Share Tech Mono', monospace" }}>Baca</span>
                </div>
              </div>

              {/* Progress dots */}
              <div style={{
                position: 'absolute', top: 16, right: 12,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {articles.slice(0, Math.min(articles.length, 8)).map((_, i) => (
                  <div key={i} style={{
                    width: 3, height: i === currentIdx ? 20 : 6,
                    borderRadius: 999,
                    background: i === currentIdx ? '#fff' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s',
                  }} />
                ))}
              </div>
            </Link>
          )}

          {/* Swipe hint */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.15em', pointerEvents: 'none',
          }}>
            {currentIdx + 1} / {articles.length} · GESER UNTUK LANJUT
          </div>
        </div>
      )}
    </div>
  );
};

export default TikTok;
