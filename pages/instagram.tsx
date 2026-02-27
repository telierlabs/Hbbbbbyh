import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface InstagramProps {
  articles: NewsArticle[];
}

const Instagram: React.FC<InstagramProps> = ({ articles }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'Montserrat', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ padding: '32px 20px 20px', textAlign: 'center', borderBottom: '1px solid #1a1a1a' }}>
        <img src="/IMG_20260220_144200.png" alt="TelierNews" style={{ height: 36, objectFit: 'contain', marginBottom: 8 }} />
        <p style={{ color: '#555', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, fontFamily: "'Share Tech Mono', monospace" }}>
          teliernews.com
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
        padding: 2
      }}>
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            style={{ display: 'block', position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#111' }}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Overlay on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)',
              padding: '8px 6px 6px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              <span style={{
                fontSize: 8, fontWeight: 700, color: '#fff', letterSpacing: '0.1em',
                textTransform: 'uppercase', opacity: 0.7, marginBottom: 2,
                fontFamily: "'Share Tech Mono', monospace"
              }}>
                {article.category}
              </span>
              <p style={{
                fontSize: 9, fontWeight: 700, color: '#fff', lineHeight: 1.3,
                margin: 0, display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {article.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#333' }}>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: '0.2em' }}>
            BELUM ADA ARTIKEL
          </p>
        </div>
      )}
    </div>
  );
};

export default Instagram;
