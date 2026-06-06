import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface InstagramProps {
  articles: NewsArticle[];
}

const KEYFRAMES = `
/* Titik melayang pelan — gerak naik turun lambat */
@keyframes float1 { 0%,100% { transform: translateY(0px) translateX(0px); opacity:0.4; } 50% { transform: translateY(-8px) translateX(3px); opacity:0.7; } }
@keyframes float2 { 0%,100% { transform: translateY(0px) translateX(0px); opacity:0.3; } 50% { transform: translateY(6px) translateX(-4px); opacity:0.6; } }
@keyframes float3 { 0%,100% { transform: translateY(0px) translateX(0px); opacity:0.5; } 50% { transform: translateY(-5px) translateX(5px); opacity:0.8; } }
@keyframes float4 { 0%,100% { transform: translateY(0px) translateX(0px); opacity:0.25;} 50% { transform: translateY(9px) translateX(-3px); opacity:0.5; } }
@keyframes float5 { 0%,100% { transform: translateY(0px) translateX(0px); opacity:0.35;} 50% { transform: translateY(-7px) translateX(6px); opacity:0.65;} }

/* Meteor melesat: pojok kanan atas → pojok kiri bawah (diagonal ~135 derajat) */
@keyframes shoot {
  0%   { transform: translate(0, 0) rotate(135deg); opacity: 0; }
  5%   { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translate(-120vw, 120vh) rotate(135deg); opacity: 0; }
}
`;

/* Titik melayang — posisi tersebar di seluruh layar */
const FLOATERS = [
  { top: '8%',  left: '12%', anim: 'float1', dur: '4.2s', delay: '0s',    size: 2 },
  { top: '20%', left: '75%', anim: 'float2', dur: '5.8s', delay: '1.1s',  size: 1.5 },
  { top: '35%', left: '30%', anim: 'float3', dur: '3.9s', delay: '0.5s',  size: 2 },
  { top: '50%', left: '88%', anim: 'float1', dur: '6.2s', delay: '2.0s',  size: 1.5 },
  { top: '62%', left: '18%', anim: 'float4', dur: '4.7s', delay: '0.8s',  size: 2 },
  { top: '75%', left: '55%', anim: 'float2', dur: '5.1s', delay: '1.6s',  size: 1.5 },
  { top: '88%', left: '40%', anim: 'float5', dur: '4.4s', delay: '0.3s',  size: 2 },
  { top: '15%', left: '50%', anim: 'float3', dur: '6.8s', delay: '2.4s',  size: 1 },
  { top: '44%', left: '65%', anim: 'float4', dur: '3.6s', delay: '1.8s',  size: 1.5 },
  { top: '70%', left: '82%', anim: 'float1', dur: '5.4s', delay: '0.9s',  size: 2 },
  { top: '92%', left: '10%', anim: 'float5', dur: '4.0s', delay: '2.8s',  size: 1 },
  { top: '55%', left: '5%',  anim: 'float2', dur: '6.5s', delay: '1.3s',  size: 1.5 },
];

/* Meteor melesat — start dari pojok kanan atas, posisi beda tiap iterasi */
/* Pakai CSS animation-delay + iteration infinite — tapi supaya posisi acak,
   kita bikin beberapa meteor dengan timing stagger sehingga terasa random */
const SHOOTERS = [
  { top: '2%',  left: '85%', delay: '0s',   duration: '1.8s', tailLen: 90,  interval: '7s'  },
  { top: '5%',  left: '70%', delay: '2.5s', duration: '1.3s', tailLen: 110, interval: '9s'  },
  { top: '1%',  left: '95%', delay: '5.0s', duration: '2.2s', tailLen: 75,  interval: '11s' },
  { top: '8%',  left: '60%', delay: '8.0s', duration: '1.0s', tailLen: 130, interval: '13s' },
];

/* Karena CSS infinite dengan delay awal saja tidak cukup untuk efek "muncul sesekali",
   kita pakai trick: animation dengan durasi total panjang (misal 10s),
   tapi aktif hanya di 15% pertama, sisanya opacity 0 */
const SHOOT_FRAMES = SHOOTERS.map((s, i) => `
@keyframes shoot${i} {
  0%                          { transform: translate(0,0) rotate(135deg); opacity:0; }
  2%                          { opacity:1; }
  ${Math.round(1800/parseInt(s.interval)*100)/100}%  { opacity:1; }
  ${Math.round(2000/parseInt(s.interval)*100)/100}%  { transform: translate(-110vw, 110vh) rotate(135deg); opacity:0; }
  100%                        { transform: translate(-110vw, 110vh) rotate(135deg); opacity:0; }
}
`).join('\n');

const Instagram: React.FC<InstagramProps> = ({ articles }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Montserrat', sans-serif",
      colorScheme: 'dark',
      position: 'relative',
    }}>
      <style>{KEYFRAMES + SHOOT_FRAMES}</style>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>

      {/* ── Star field fullscreen — titik melayang pelan ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>

        {/* Titik melayang */}
        {FLOATERS.map((f, i) => (
          <span key={`f${i}`} style={{
            position: 'absolute',
            top: f.top,
            left: f.left,
            width: f.size,
            height: f.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            animation: `${f.anim} ${f.dur} ease-in-out ${f.delay} infinite`,
          }} />
        ))}

        {/* Meteor melesat — pojok kanan atas ke kiri bawah */}
        {SHOOTERS.map((s, i) => (
          <span key={`s${i}`} style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            display: 'flex',
            alignItems: 'center',
            animation: `shoot${i} ${s.interval} linear ${s.delay} infinite`,
            opacity: 0,
          }}>
            {/* Kepala titik */}
            <span style={{
              display: 'inline-block',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 0 5px 2px rgba(255,255,255,0.5)',
              flexShrink: 0,
              marginRight: 2,
            }} />
            {/* Ekor — arah berlawanan (ke kanan karena nanti dirotate 135deg) */}
            <span style={{
              display: 'inline-block',
              width: s.tailLen,
              height: 1.5,
              background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.7))',
              borderRadius: 999,
            }} />
          </span>
        ))}
      </div>

      {/* ── Header ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '28px 20px 18px',
        textAlign: 'center',
        borderBottom: '1px solid #1a1a1a',
        background: 'transparent',
      }}>
        <img
          src="/IMG_20260220_144200.png"
          alt="TelierNews"
          style={{
            height: 40,
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            display: 'block',
            margin: '0 auto',
          }}
        />
        <p style={{
          color: '#aaa',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'lowercase',
          margin: '8px 0 0',
        }}>
          teliernews.com
        </p>
      </div>

      {/* ── Grid ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        paddingBottom: 24,
      }}>
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            style={{
              display: 'block',
              position: 'relative',
              aspectRatio: '3/3.6',
              overflow: 'hidden',
              background: '#111',
            }}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '80px 20px', color: '#444' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Belum ada artikel
          </p>
        </div>
      )}
    </div>
  );
};

export default Instagram;
