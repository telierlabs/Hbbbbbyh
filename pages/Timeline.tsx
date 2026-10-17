import React, { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { NewsArticle } from '../types';
import { getTimeline, dayLabel, formatClock, TimelineItem } from '../timeline';

interface TimelinePageProps { articles: NewsArticle[]; }

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Halaman News Timeline: /timeline/:id — judul-judul update dari awal sampai sekarang.
// Klik judul = buka artikel lengkap (gambar, judul, isi, dan semua fitur baca).
const TimelinePage: React.FC<TimelinePageProps> = ({ articles }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const timeline = useMemo(() => getTimeline(articles, id), [articles, id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!timeline) return <Navigate to="/" replace />;

  // Terbaru di ATAS, awal di bawah — biar timeline panjang nggak perlu scroll jauh buat lihat update terakhir
  const items = [...timeline.items].reverse();
  const lastKey = items[0].key;
  const firstKey = items[items.length - 1].key;

  // Kelompok per hari (urutan terbaru -> awal)
  const groups: { day: string; list: TimelineItem[] }[] = [];
  items.forEach(it => {
    const d = dayLabel(it.at);
    const g = groups[groups.length - 1];
    if (g && g.day === d) g.list.push(it); else groups.push({ day: d, list: [it] });
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
              News Timeline · diperbarui {dayLabel(timeline.lastAt) === 'Hari ini' ? formatClock(timeline.lastAt) : dayLabel(timeline.lastAt)}
            </p>
            <h1 className="sp-hero-title" style={{ ...m, fontSize: 'clamp(28px,8vw,52px)', fontWeight: 500, lineHeight: 1.08, letterSpacing: '-0.01em', color: '#000', margin: '0 0 12px', textTransform: 'uppercase' }}>{timeline.title}</h1>
            {timeline.summary && <p style={{ ...m, fontSize: '14px', lineHeight: 1.65, color: '#444', margin: '0 0 16px', maxWidth: '680px' }}>{timeline.summary}</p>}
            <p style={{ ...mono, fontSize: '11px', letterSpacing: '0.12em', color: '#555', margin: '0 0 6px' }}>{items.length} UPDATE · TERBARU → AWAL</p>
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
            {groups.map(g => (
              <div key={g.day} style={{ marginBottom: '28px' }}>
                <div style={{ ...mono, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #1e1e1e' }}>{g.day}</div>
                <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {g.list.map((it, idx) => {
                    const isLast = it.key === lastKey;
                    const lastInGroup = idx === g.list.length - 1;
                    return (
                      <li key={it.key} style={{ position: 'relative', padding: `0 0 ${lastInGroup ? 0 : 22}px 28px` }}>
                        {!lastInGroup && <span style={{ position: 'absolute', left: '5px', top: '14px', bottom: '-2px', width: '1px', background: '#2a2a2a' }} />}
                        <span style={{ position: 'absolute', left: 0, top: '4px', width: '11px', height: '11px', borderRadius: '50%', border: `1px solid ${isLast ? '#3dff8b' : '#555'}`, background: isLast ? '#3dff8b' : '#555', boxShadow: isLast ? '0 0 0 4px rgba(61,255,139,0.15)' : 'none', animation: isLast ? 'tn-pulse 2s ease-in-out infinite' : 'none' }} />
                        <time style={{ ...mono, display: 'block', fontSize: '10px', letterSpacing: '0.1em', color: isLast ? '#3dff8b' : '#777', marginBottom: '4px' }}>{formatClock(it.at)}{isLast ? ' · TERBARU' : it.key === firstKey ? ' · AWAL' : ''}</time>
                        <div onClick={() => navigate(`/news/${it.articleId}`)} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#777', marginBottom: '4px' }}>{it.category}</span>
                            <span style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{it.title}</span>
                            <span style={{ ...mono, display: 'block', fontSize: '10px', letterSpacing: '0.12em', color: '#888', marginTop: '6px' }}>BACA ARTIKEL →</span>
                          </div>
                          {it.imageUrl && <img src={it.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" style={{ width: '72px', height: '54px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
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

export default TimelinePage;
