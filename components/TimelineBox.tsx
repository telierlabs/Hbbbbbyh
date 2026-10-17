import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Timeline, formatClock, dayLabel } from '../timeline';

// Komponen lini masa untuk halaman detail artikel (halaman ini terang/putih).

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Chip kecil di atas artikel: "Bagian dari: ... · N update"
export const TimelineChip: React.FC<{ timeline: Timeline }> = ({ timeline }) => (
  <Link
    to={`/timeline/${timeline.id}`}
    style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: '8px', maxWidth: '100%', fontSize: '10px', letterSpacing: '0.1em', color: '#111', textDecoration: 'none', border: '1px solid #111', borderRadius: '999px', padding: '6px 12px', margin: '0 0 14px' }}
  >
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853', flexShrink: 0 }} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>BAGIAN DARI: {timeline.title.toUpperCase()} · {timeline.items.length} UPDATE</span>
  </Link>
);

// Kotak lini masa (terbaru -> awal), bisa dilipat
export const TimelineBox: React.FC<{ timeline: Timeline; currentArticleId: string }> = ({ timeline, currentArticleId }) => {
  const items = [...timeline.items].reverse(); // terbaru di atas
  const [open, setOpen] = useState(items.length <= 6);
  const lastKey = items[0].key;

  return (
    <div style={{ border: '1px solid #ececec', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 16px', background: '#fafafa', borderBottom: open ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.2em', background: '#111', color: '#fff', padding: '3px 7px', borderRadius: '4px' }}>NEWS TIMELINE</span>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: '8px 0 0', lineHeight: 1.35 }}>{timeline.title}</p>
          <p style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: '#aaa', margin: '4px 0 0' }}>{items.length} UPDATE · TERBARU → AWAL</p>
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
                  <span style={{ position: 'absolute', left: 0, top: '3px', width: '11px', height: '11px', borderRadius: '50%', border: `1px solid ${current ? '#111' : isLast ? '#00c853' : '#bbb'}`, background: current ? '#111' : isLast ? '#00c853' : '#bbb', boxShadow: current ? '0 0 0 4px rgba(0,0,0,0.08)' : 'none' }} />
                  <time style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.1em', color: '#aaa', marginBottom: '3px' }}>{dayLabel(it.at).toUpperCase()} · {formatClock(it.at)}{current ? ' · ANDA DI SINI' : ''}</time>
                  {current ? (
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111', lineHeight: 1.45 }}>{it.title}</span>
                  ) : (
                    <Link to={`/news/${it.articleId}`} style={{ fontSize: '13px', fontWeight: 600, color: '#444', lineHeight: 1.45, textDecoration: 'none' }}>{it.title}</Link>
                  )}
                </li>
              );
            })}
          </ol>
          <Link to={`/timeline/${timeline.id}`} style={{ ...mono, display: 'inline-block', marginTop: '16px', fontSize: '10px', letterSpacing: '0.12em', color: '#111', textDecoration: 'none' }}>LIHAT LINI MASA PENUH →</Link>
        </div>
      )}
    </div>
  );
};

// Tombol "Update sebelumnya / berikutnya"
export const TimelineNav: React.FC<{ timeline: Timeline; currentArticleId: string }> = ({ timeline, currentArticleId }) => {
  const { items } = timeline;
  const pos = items.findIndex(i => i.articleId === currentArticleId);
  if (pos < 0 || items.length < 2) return null;
  const prev = items[pos - 1];
  const next = items[pos + 1];

  const cell = (it: typeof prev | undefined, label: string, align: 'left' | 'right') => (
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
