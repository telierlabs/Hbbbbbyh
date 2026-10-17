import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { NewsArticle, Story } from '../types';
import { buildTimeline, dayLabel, formatClock, TimelineItem } from '../services/storyService';

interface StoryPageProps { stories: Story[]; articles: NewsArticle[]; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

type Filter = 'all' | 'article' | 'note';

// Halaman lini masa penuh: /timeline/:id — dari awal sampai sekarang
const StoryPage: React.FC<StoryPageProps> = ({ stories, articles }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const story = stories.find(s => s.id === id);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { window.scrollTo(0, 0); setFilter('all'); }, [id]);

  const items = useMemo(() => (story ? buildTimeline(story, articles) : []), [story, articles]);

  if (!story) return <Navigate to="/" replace />;

  const nArt = items.filter(i => i.type === 'article').length;
  const nNote = items.length - nArt;
  const lastAt = items.length ? items[items.length - 1].at : '';
  const shown = items.filter(i => filter === 'all' || i.type === filter);
  const lastKey = items.length ? items[items.length - 1].key : '';

  // Kelompok per hari (urutan awal -> sekarang)
  const groups: { day: string; list: TimelineItem[] }[] = [];
  shown.forEach(it => {
    const d = dayLabel(it.at);
    const g = groups[groups.length - 1];
    if (g && g.day === d) g.list.push(it); else groups.push({ day: d, list: [it] });
  });

  const chip = (active: boolean): React.CSSProperties => ({
    ...mono, flexShrink: 0, padding: '8px 14px', borderRadius: '999px',
    border: `1px solid ${active ? '#fff' : '#2a2a2a'}`, background: active ? '#fff' : 'transparent',
    color: active ? '#000' : '#aaa', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO */}
        <div
          className="sp-hero-bg"
          style={{ background: '#f5f5f7', backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)', backgroundSize: '40px 40px', padding: '100px 20px 8px' }}
        >
          <div className="sp-container">
            <button type="button" onClick={() => navigate('/')} style={{ ...mono, background: 'none', border: 'none', padding: '4px 0', marginBottom: '14px', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', cursor: 'pointer' }}>← Beranda</button>
            <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853', animation: 'tn-pulse 2s ease-in-out infinite' }} />
              Lini masa{lastAt ? ` · diperbarui ${dayLabel(lastAt) === 'Hari ini' ? formatClock(lastAt) : dayLabel(lastAt)}` : ''}
            </p>
            <h1 className="sp-hero-title" style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.01em', color: '#000', margin: '0 0 12px', textTransform: 'uppercase' }}>{story.title}</h1>
            {story.summary && <p style={{ ...m, fontSize: '14px', lineHeight: 1.65, color: '#444', margin: '0 0 16px', maxWidth: '680px' }}>{story.summary}</p>}
            <p style={{ ...mono, fontSize: '11px', letterSpacing: '0.12em', color: '#555', margin: '0 0 6px' }}>
              {items.length} UPDATE · {nArt} ARTIKEL · {nNote} CATATAN
            </p>
          </div>
          <div style={{ height: '8px' }} />
        </div>

        {/* DIVIDER */}
        <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px' }}>
            <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000" />
          </svg>
        </div>

        <div style={{ background: '#000', padding: '0 20px 80px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
          <div className="sp-container">
            {items.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', border: '1px dashed #1e1e1e', borderRadius: '12px' }}>
                <p style={{ ...m, color: '#aaa', fontSize: '13px', margin: 0 }}>Belum ada update di cerita ini.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <button type="button" style={chip(filter === 'all')} onClick={() => setFilter('all')}>Semua · {items.length}</button>
                  <button type="button" style={chip(filter === 'article')} onClick={() => setFilter('article')}>Artikel · {nArt}</button>
                  <button type="button" style={chip(filter === 'note')} onClick={() => setFilter('note')}>Catatan · {nNote}</button>
                </div>

                {groups.map(g => (
                  <div key={g.day} style={{ marginBottom: '28px' }}>
                    <div style={{ ...mono, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #1e1e1e' }}>{g.day}</div>
                    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {g.list.map((it, idx) => {
                        const isLast = it.key === lastKey;
                        const isArticle = it.type === 'article';
                        const lastInGroup = idx === g.list.length - 1;
                        return (
                          <li key={it.key} style={{ position: 'relative', padding: `0 0 ${lastInGroup ? 0 : 22}px 28px` }}>
                            {!lastInGroup && <span style={{ position: 'absolute', left: '5px', top: '14px', bottom: '-2px', width: '1px', background: '#2a2a2a' }} />}
                            <span style={{ position: 'absolute', left: 0, top: '4px', width: '11px', height: '11px', borderRadius: '50%', border: `1px solid ${isLast ? '#3dff8b' : '#555'}`, background: isLast ? '#3dff8b' : isArticle ? '#555' : '#000', boxShadow: isLast ? '0 0 0 4px rgba(61,255,139,0.15)' : 'none', animation: isLast ? 'tn-pulse 2s ease-in-out infinite' : 'none' }} />
                            <time style={{ ...mono, display: 'block', fontSize: '10px', letterSpacing: '0.1em', color: isLast ? '#3dff8b' : '#777', marginBottom: '4px' }}>{formatClock(it.at)}{isLast ? ' · TERBARU' : ''}</time>
                            {isArticle ? (
                              <div
                                className="sp-art"
                                onClick={() => navigate(`/news/${it.articleId}`)}
                                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#777', marginBottom: '4px' }}>{it.category}</span>
                                  <span style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{it.title}</span>
                                  <span style={{ ...mono, display: 'block', fontSize: '10px', letterSpacing: '0.12em', color: '#888', marginTop: '6px' }}>BACA ARTIKEL →</span>
                                </div>
                                {it.imageUrl && <img src={it.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" style={{ width: '72px', height: '54px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                              </div>
                            ) : (
                              <div>
                                <span style={{ ...mono, display: 'inline-block', fontSize: '9px', letterSpacing: '0.15em', color: '#777', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '1px 6px', marginBottom: '6px' }}>CATATAN</span>
                                <p style={{ ...m, fontSize: '13px', color: '#bbb', lineHeight: 1.6, margin: 0 }}>{it.title}</p>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .sp-container { max-width: 680px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @media (min-width: 1024px) {
          .sp-hero-bg { padding-top: 130px !important; }
          .sp-hero-title { font-size: 64px !important; }
        }
      `}</style>
    </>
  );
};

export default StoryPage;
