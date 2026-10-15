import React from 'react';
import { NewsArticle } from '../types';
import NewsCard from './NewsCard';

// Daftar berita: 1 kartu besar, 2 kartu kecil berdampingan, sisanya kartu horizontal.
// Di layar lebar otomatis jadi grid beberapa kolom.
const ArticleFeed: React.FC<{ items: NewsArticle[] }> = ({ items }) => {
  if (items.length === 0) return null;
  const [first, ...rest] = items;
  const hasPair = rest.length >= 2;
  const pair = hasPair ? rest.slice(0, 2) : [];
  const tail = hasPair ? rest.slice(2) : rest;

  return (
    <>
      <div className="af-feed">
        <NewsCard article={first} variant="featured" />
        {hasPair && (
          <div className="af-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            {pair.map(a => <NewsCard key={a.id} article={a} variant="small" />)}
          </div>
        )}
        {tail.map(a => <NewsCard key={a.id} article={a} variant="horizontal" />)}
      </div>
      <style>{`
        @media (min-width: 900px) {
          .af-feed { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); column-gap: 20px; align-items: start; }
          .af-pair { display: contents !important; }
        }
      `}</style>
    </>
  );
};

export default ArticleFeed;
