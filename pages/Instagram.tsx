import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface InstagramProps {
  articles: NewsArticle[];
}

const Instagram: React.FC<InstagramProps> = ({ articles }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Montserrat', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ padding: '24px 20px 16px', textAlign: 'center', borderBottom: '1px solid #efefef', background: '#fff' }}>
        <img src="/IMG_20260220_144200.png" alt="TelierNews" style={{ height: 32, objectFit: 'contain', filter: 'invert(1)' }} />
        <p style={{ color: '#999', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '6px 0 0' }}>
          teliernews.com
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
      }}>
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            style={{ display: 'block', position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#f0f0f0' }}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#ccc' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Belum ada artikel
          </p>
        </div>
      )}
    </div>
  );
};

export default Instagram;
