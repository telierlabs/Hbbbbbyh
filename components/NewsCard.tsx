import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };
const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

// Waktu relatif
const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
};

// Format waktu artikel
const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGS','SEP','OKT','NOV','DES'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} · ${hours}:${mins} UTC`;
};

// Summary jadi 2 bullet points
const getBullets = (summary: string): string[] => {
  const sentences = summary.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length >= 2) return [sentences[0], sentences[1]];
  if (sentences.length === 1) {
    const half = Math.floor(sentences[0].length / 2);
    const cut = sentences[0].lastIndexOf(' ', half);
    return [sentences[0].slice(0, cut), sentences[0].slice(cut + 1)];
  }
  return [summary];
};

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const bullets = getBullets(article.summary);
  const timeStr = formatTime(article.publishedAt);
  const relTime = getRelativeTime(article.publishedAt);

  return (
    <Link
      to={`/news/${article.id}`}
      style={{ textDecoration: 'none', display: 'block', marginBottom: '16px' }}
      className="group"
    >
      <div style={{
        background: '#080808',
        border: '1px solid #161616',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.25s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}
      >
        {/* GAMBAR */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '52%', overflow: 'hidden', background: '#0a0a0a' }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              filter: 'brightness(0.82) grayscale(10%)',
              transition: 'transform 0.5s, filter 0.3s',
            }}
            className="group-hover:scale-[1.03] group-hover:brightness-90"
          />
          {/* Scanline overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)',
          }}/>
          {/* Badge kategori */}
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <span style={{
              ...mono,
              fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#e0e0e0', padding: '3px 9px', borderRadius: '3px',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            }}>
              {article.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: '14px 16px 14px' }}>

          {/* Baris timestamp + waktu relatif */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px' }}>
            <span style={{ ...mono, fontSize: '10px', color: '#555', letterSpacing: '0.08em' }}>
              {timeStr}
            </span>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: '#444' }}>
              {relTime}
            </span>
          </div>

          {/* Judul CAPS */}
          <div style={{
            ...m,
            color: '#f0f0f0', fontSize: '16px', fontWeight: 800,
            lineHeight: 1.25, letterSpacing: '-0.01em',
            textTransform: 'uppercase', marginBottom: '10px',
          }}>
            {article.title}
          </div>

          {/* Bullet points */}
          <ul style={{ listStyle: 'none', marginBottom: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', gap: '7px', alignItems: 'baseline' }}>
                <span style={{ color: '#555', fontSize: '12px', flexShrink: 0, lineHeight: 1 }}>›</span>
                <span style={{ ...m, fontSize: '12px', color: '#999', lineHeight: 1.6 }}>{b}</span>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div style={{ height: '1px', background: '#111', marginBottom: '11px' }}/>

          {/* Footer: TelierNews label + author */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              ...mono,
              fontSize: '8px', color: '#555', letterSpacing: '0.25em', textTransform: 'uppercase',
              border: '1px solid #1e1e1e', padding: '2px 7px', borderRadius: '2px',
            }}>
              TelierNews
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#333' }}/>
              <span style={{ ...mono, fontSize: '9px', color: '#444', letterSpacing: '0.08em' }}>
                {article.author}
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
