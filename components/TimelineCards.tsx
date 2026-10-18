import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import { getActiveTimelines, formatClock, dayLabel } from '../timeline';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Baris kartu "Sedang Berkembang" di Home. Satu kartu = satu News Timeline (digeser ke samping).
// Hanya timeline yang diperbarui dalam 48 jam terakhir yang tampil; kalau tidak ada, section ini hilang.
const TimelineCards: React.FC<{ articles: NewsArticle[]; excludeId?: string; title?: string; hours?: number; inline?: boolean }> = ({ articles, excludeId, title = 'Sedang Berkembang', hours = 48, inline = false }) => {
  const navigate = useNavigate();
  const active = getActiveTimelines(articles, hours).filter(t => t.id !== excludeId);
  if (active.length === 0) return null;
  const pad = inline ? '0' : '20px'; // inline = dipakai di dalam halaman yang sudah punya padding sendiri

  return (
    <div style={inline ? { marginBottom: '36px' } : { background: '#000', paddingTop: '24px', paddingBottom: '24px', borderBottom: '1px solid #111' }}>
      <div className="tn-container" style={{ padding: `0 ${pad} 12px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="tn-sec-header" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>{title}</span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3dff8b', animation: 'tn-pulse 2s ease-in-out infinite' }} />
        </div>
      </div>
      <div className="tn-container">
        <div className="tn-story-row" style={{ display: 'flex', gap: '10px', padding: `0 ${pad}`, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {active.map(tl => {
            const last = tl.items[tl.items.length - 1];
            const live = Date.now() - new Date(tl.lastAt).getTime() < 6 * 3600 * 1000;
            return (
              <div
                key={tl.id}
                className="tn-story-card"
                onClick={() => navigate(`/timeline/${tl.id}`)}
                style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '260px', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
              >
                <div style={{ position: 'relative', aspectRatio: '16/10', background: '#111' }}>
                  {tl.cover && <img src={tl.cover} alt="" loading="lazy" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.75)' }} />}
                  <span style={{ ...mono, position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', letterSpacing: '0.18em', color: '#fff', background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.25)', padding: '3px 7px', borderRadius: '4px' }}>
                    {live && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3dff8b', animation: 'tn-pulse 2s ease-in-out infinite' }} />}
                    {live ? 'LIVE · ' : ''}{tl.items.length} UPDATE
                  </span>
                </div>
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div style={{ ...m, fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tl.title}</div>
                  <div style={{ ...m, fontSize: '12px', color: '#aaa', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <span style={{ ...mono, color: '#3dff8b', marginRight: '6px' }}>{dayLabel(tl.lastAt) === 'Hari ini' ? formatClock(tl.lastAt) : dayLabel(tl.lastAt).toUpperCase()}</span>{last.title}
                  </div>
                  <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.12em', color: '#fff', marginTop: 'auto' }}>BUKA LINI MASA →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (min-width: 900px) {
          .tn-story-row { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 14px !important; overflow: visible !important; }
          .tn-story-card { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default TimelineCards;
