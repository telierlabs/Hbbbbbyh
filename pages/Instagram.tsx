import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface InstagramProps {
  articles: NewsArticle[];
}

const METEORS = [
  { top: '15%', delay: '0s',   duration: '2.2s',  tailLen: 70,  opacity: 0.95 },
  { top: '52%', delay: '0.8s', duration: '4.8s',  tailLen: 45,  opacity: 0.6  },
  { top: '28%', delay: '1.5s', duration: '1.5s',  tailLen: 100, opacity: 1.0  },
  { top: '70%', delay: '2.3s', duration: '6.0s',  tailLen: 35,  opacity: 0.5  },
  { top: '8%',  delay: '3.1s', duration: '1.1s',  tailLen: 120, opacity: 0.9  },
  { top: '82%', delay: '0.4s', duration: '3.5s',  tailLen: 55,  opacity: 0.7  },
  { top: '42%', delay: '4.3s', duration: '2.7s',  tailLen: 85,  opacity: 0.8  },
  { top: '63%', delay: '2.0s', duration: '0.9s',  tailLen: 65,  opacity: 0.85 },
];

const KEYFRAMES = `
@keyframes meteor {
  0%   { transform: translateX(-180px) rotate(-10deg); opacity: 0; }
  4%   { opacity: 1; }
  94%  { opacity: 1; }
  100% { transform: translateX(calc(100vw + 180px)) rotate(-10deg); opacity: 0; }
}
`;

const Instagram: React.FC<InstagramProps> = ({ articles }) => {
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

      {/* ── Header ── */}
      <div style={{
        position: 'relative',
        padding: '28px 20px 18px',
        textAlign: 'center',
        borderBottom: '1px solid #222',
        background: '#000',
        overflow: 'hidden',
      }}>

        {/* Meteor: titik bulat di ujung kanan + ekor gradient ke kiri */}
        {METEORS.map((m, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: m.top,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              animation: `meteor ${m.duration} linear ${m.delay} 1 forwards`,
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0,
            }}
          >
            {/* Ekor — garis gradient dari transparan ke putih */}
            <span style={{
              display: 'inline-block',
              width: m.tailLen,
              height: 1.2,
              background: `linear-gradient(to right, transparent, rgba(255,255,255,${m.opacity * 0.6}))`,
              borderRadius: 999,
            }} />
            {/* Kepala — titik bulat terang */}
            <span style={{
              display: 'inline-block',
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: `rgba(255,255,255,${m.opacity})`,
              boxShadow: `0 0 4px 2px rgba(255,255,255,${m.opacity * 0.5})`,
              flexShrink: 0,
            }} />
          </span>
        ))}

        {/* Logo */}
        <img
          src="/IMG_20260220_144200.png"
          alt="TelierNews"
          style={{
            height: 40,
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            display: 'block',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Domain */}
        <p style={{
          color: '#aaa',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'lowercase',
          margin: '8px 0 0',
          position: 'relative',
          zIndex: 1,
        }}>
          teliernews.com
        </p>
      </div>

      {/* ── Grid ── */}
      <div style={{
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
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#444' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Belum ada artikel
          </p>
        </div>
      )}
    </div>
  );
};

export default Instagram;
