import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface InstagramProps {
  articles: NewsArticle[];
}

const Instagram: React.FC<InstagramProps> = ({ articles }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Montserrat', sans-serif",
      colorScheme: 'dark',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{
        padding: '28px 20px 18px',
        textAlign: 'center',
        borderBottom: '1px solid #222',
        background: '#000',
      }}>
        {/* Logo — putih agar terlihat di latar hitam */}
        <img
          src="/IMG_20260220_144200.png"
          alt="TelierNews"
          style={{
            height: 40,
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',   /* paksa jadi putih */
            display: 'block',
            margin: '0 auto',
          }}
        />
        {/* Domain kecil, lowercase */}
        <p style={{
          color: '#666',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'lowercase',
          margin: '8px 0 0',
        }}>
          teliernews.com
        </p>
      </div>

      {/* Grid — kotak sedikit lebih besar, tambah padding bawah */}
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
              /* Lebih tinggi dari 1/1 supaya kotak sedikit memanjang ke bawah */
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
