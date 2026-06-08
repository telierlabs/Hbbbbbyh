import React, { useEffect } from 'react';
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
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Montserrat', sans-serif",
      colorScheme: 'dark',
    }}>
      <style>{KEYFRAMES}</style>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>

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
          teliernews.com · tiktok
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3, paddingBottom: 24,
      }}>
        {articles.map((article) => (
          <Link key={article.id} to={`/news/${article.id}`} style={{
            display: 'block', position: 'relative',
            aspectRatio: '3/3.6', overflow: 'hidden',
            background: '#111',
          }}>
            <img
              src={article.imageUrl} alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#444' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Belum ada artikel</p>
        </div>
      )}
    </div>
  );
};

export default TikTok;
