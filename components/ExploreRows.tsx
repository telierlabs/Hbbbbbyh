import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import { BmBtn } from './NewsCard';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Judul section seragam
export const ExploreTitle: React.FC<{ label: string; right?: string; onRight?: () => void }> = ({ label, right, onRight }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
    <span className="ex-sec" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>{label}</span>
    {right && (
      <span onClick={onRight} style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em', cursor: onRight ? 'pointer' : 'default' }}>{right}</span>
    )}
  </div>
);

// Pilih Top Stories dari seluruh berita biasa: paling banyak dibaca dulu, lalu yang terbaru.
export const pickTopStories = (articles: NewsArticle[], excludeIds: string[] = [], limit = 6): NewsArticle[] =>
  articles
    .filter(a => a.articleType !== 'deepdive' && !excludeIds.includes(a.id))
    .sort((a, b) => ((b.views || 0) - (a.views || 0)) || (new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()))
    .slice(0, limit);

// Baris kartu Top Stories (geser ke samping)
export const TopStoriesRow: React.FC<{ items: NewsArticle[]; title?: string; showAll?: boolean }> = ({ items, title = 'Top Stories', showAll = true }) => {
  const navigate = useNavigate();
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: '36px' }}>
      <ExploreTitle label={title} right={showAll ? 'Lihat semua →' : undefined} onRight={() => navigate('/top-stories')} />
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {items.map(a => (
          <div
            key={a.id}
            onClick={() => navigate(`/news/${a.id}`)}
            style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '240px', background: '#080808', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ position: 'relative', paddingTop: '60%', background: '#111' }}>
              <img src={a.imageUrl} alt={a.title} loading="lazy" referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }} />
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ ...m, fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '10px' }}>{a.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ ...mono, fontSize: '10px', color: '#888' }}>{formatDate(a.publishedAt)}</span>
                <BmBtn article={a} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chip kategori + jumlah berita; klik = ke halaman kategori
export const CategoryChips: React.FC<{ articles: NewsArticle[]; skipKey?: string; title?: string }> = ({ articles, skipKey, title = 'Kategori' }) => {
  const navigate = useNavigate();
  const slug = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '');
  const counts = new Map<string, number>();
  articles.forEach(a => { if (a.category && slug(a.category) !== skipKey) counts.set(a.category, (counts.get(a.category) || 0) + 1); });
  const list = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (list.length === 0) return null;
  return (
    <div style={{ marginBottom: '36px' }}>
      <ExploreTitle label={title} />
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {list.map(([cat, n]) => (
          <button
            key={cat}
            type="button"
            onClick={() => navigate(`/category/${encodeURIComponent(cat)}`)}
            style={{ ...mono, flexShrink: 0, padding: '8px 14px', borderRadius: '999px', border: '1px solid #2a2a2a', background: 'transparent', color: '#aaa', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {cat} · {n}
          </button>
        ))}
      </div>
    </div>
  );
};
