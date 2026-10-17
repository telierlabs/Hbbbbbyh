import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../types';
import { TimelineItem, formatClock, dayLabel } from '../services/storyService';

// Komponen lini masa untuk halaman detail artikel (halaman ini terang/putih).

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Chip kecil di atas artikel: "Bagian dari: ... · N update"
export const StoryChip: React.FC<{ story: Story; count: number }> = ({ story, count }) => (
  <Link
    to={`/timeline/${story.id}`}
    style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: '8px', maxWidth: '100%', fontSize: '10px', letterSpacing: '0.1em', color: '#111', textDecoration: 'none', border: '1px solid #111', borderRadius: '999px', padding: '6px 12px', margin: '0 0 14px' }}
  >
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853', flexShrink: 0 }} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>BAGIAN DARI: {story.title.toUpperCase()} · {count} UPDATE</span>
  </Link>
);

// Kotak lini masa (awal -> sekarang), bisa dilipat
export const StoryBox: React.FC<{ story: Story; items: TimelineItem[]; currentArticleId: string }> = ({ story, items, currentArticleId }) => {
  const [open, setOpen] = useState(items.length <= 6);
  const lastKey = items.length ? items[items.length - 1].key : '';

  return (
    <div style={{ border: '1px solid #ececec', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 16px', background: '#fafafa', borderBottom: open ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.2em', background: '#111', color: '#fff', padding: '3px 7px', borderRadius: '4px' }}>LINI MASA</span>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: '8px 0 0', lineHeight: 1.35 }}>{story.title}</p>
          <p style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: '#aaa', margin: '4px 0 0' }}>{items.length} UPDATE · AWAL → SEKARANG</p>
        </div>
        <svg width="14" height="14" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={2} style={{ transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
      {open && (
        <div style={{ padding: '16px' }}>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((it, idx) => {
              const current = it.articleId === currentArticleId;
              const isLast = it.key === lastKey;
              const lastRow = idx === items.length - 1;
              return (
                <li key={it.key} style={{ position: 'relative', padding: `0 0 ${lastRow ? 0 : 16}px 24px` }}>
                  {!lastRow && <span style={{ position: 'absolute', left: '5px', top: '14px', bottom: '-2px', width: '1px', background: '#e5e5e5' }} />}
                  <span style={{ position: 'absolute', left: 0, top: '3px', width: '11px', height: '11px', borderRadius: '50%', border: `1px solid ${current ? '#111' : isLast ? '#00c853' : '#bbb'}`, background: current ? '#111' : isLast ? '#00c853' : it.type === 'article' ? '#bbb' : '#fff', boxShadow: current ? '0 0 0 4px rgba(0,0,0,0.08)' : 'none' }} />
                  <time style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.1em', color: '#aaa', marginBottom: '3px' }}>{dayLabel(it.at).toUpperCase()} · {formatClock(it.at)}{current ? ' · ANDA DI SINI' : ''}</time>
                  {it.type === 'article' && !current ? (
                    <Link to={`/news/${it.articleId}`} style={{ fontSize: '13px', fontWeight: 600, color: '#444', lineHeight: 1.45, textDecoration: 'none' }}>{it.title}</Link>
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: current ? 700 : 500, color: current ? '#111' : '#777', lineHeight: 1.45 }}>
                      {it.title}
                      {it.type === 'note' && <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.15em', color: '#aaa', border: '1px solid #e5e5e5', borderRadius: '4px', padding: '1px 5px', marginLeft: '6px' }}>CATATAN</span>}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <Link to={`/timeline/${story.id}`} style={{ ...mono, display: 'inline-block', marginTop: '16px', fontSize: '10px', letterSpacing: '0.12em', color: '#111', textDecoration: 'none' }}>LIHAT LINI MASA PENUH →</Link>
        </div>
      )}
    </div>
  );
};

// Tombol "Update sebelumnya / berikutnya" (hanya antar artikel di cerita yang sama)
export const StoryNav: React.FC<{ items: TimelineItem[]; currentArticleId: string }> = ({ items, currentArticleId }) => {
  const arts = items.filter(i => i.type === 'article');
  const pos = arts.findIndex(i => i.articleId === currentArticleId);
  if (pos < 0 || arts.length < 2) return null;
  const prev = arts[pos - 1];
  const next = arts[pos + 1];

  const cell = (it: TimelineItem | undefined, label: string, align: 'left' | 'right') => (
    it ? (
      <Link to={`/news/${it.articleId}`} style={{ textDecoration: 'none', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '12px', display: 'block', minWidth: 0, textAlign: align }}>
        <span style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.12em', color: '#aaa', marginBottom: '6px' }}>{label}</span>
        <span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '12px', fontWeight: 600, color: '#111', lineHeight: 1.4 }}>{it.title}</span>
      </Link>
    ) : <div />
  );

  return (
    <div style={{ marginTop: '28px' }}>
      <p style={{ ...mono, fontSize: '9px', letterSpacing: '0.2em', color: '#aaa', margin: '0 0 10px' }}>LANJUT DI LINI MASA</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {cell(prev, '← UPDATE SEBELUMNYA', 'left')}
        {cell(next, 'UPDATE BERIKUTNYA →', 'right')}
      </div>
    </div>
  );
};

export default StoryBox;
