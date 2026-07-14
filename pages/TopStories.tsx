import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';

interface TopStoriesPageProps { articles: NewsArticle[]; }

const THEME = { text: '#111111', muted: '#767676', faint: '#a3a3a3', border: '#e9e9e9' };
const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
};

// Halaman "Lihat Semua" dari Top Stories — dibuka lewat link di Home.tsx
const TopStoriesPage: React.FC<TopStoriesPageProps> = ({ articles }) => {
  // Artikel pertama (index 0) dipakai sebagai hero di Home, jadi di sini mulai dari index 1
  const items = articles.slice(1);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 20px 80px', background: '#fff', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <h1 style={{ ...m, fontSize: '26px', fontWeight: 700, color: THEME.text, marginBottom: '20px' }}>Top Stories</h1>

      {items.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <p style={{ color: THEME.muted, fontSize: '14px' }}>Belum ada berita.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px 16px' }}>
          {items.map(article => (
            <Link key={article.id} to={`/news/${article.id}`} style={{ textDecoration: 'none' }}>
              <div>
                <div style={{ position: 'relative', width: '100%', paddingTop: '72%', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px', background: '#f0f0f0' }}>
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.15em', color: THEME.faint, textTransform: 'uppercase' }}>{article.category}</span>
                <p style={{ ...m, fontSize: '13px', fontWeight: 700, color: THEME.text, lineHeight: 1.4, marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.title}
                </p>
                <span style={{ ...mono, fontSize: '9px', color: THEME.faint, marginTop: '4px', display: 'block' }}>{getRelativeTime(article.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopStoriesPage;
