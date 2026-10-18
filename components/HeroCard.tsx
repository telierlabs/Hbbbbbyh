import React from 'react';
import { useNavigate } from 'react-router-dom';

// Hero gambar PENUH: foto 16:9 dari paling atas layar (di belakang header yang transparan),
// ujung ke ujung tanpa kartu. Judul + deskripsi singkat berita terbaru menempel di atas gambar,
// bagian bawahnya melengkung menyatu ke area hitam. Ada tombol kembali.
// Dipakai di halaman Kategori, Deep Dive, dan News Timeline.
interface HeroCardProps {
  image?: string;
  alt?: string;
  tags: string[];
  eyebrow?: string;
  title: string;
  summary?: string;
  cta: string;
  meta?: string;
  backLabel?: string;
  onClick: () => void;
}

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const HeroCard: React.FC<HeroCardProps> = ({ image, alt, tags, eyebrow, title, summary, cta, meta, backLabel = 'Kembali', onClick }) => {
  const navigate = useNavigate();
  const goBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.history.length > 1) navigate(-1); else navigate('/');
  };

  return (
    <>
      <div className="hc" onClick={onClick} role="link" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') onClick(); }}>
        {image && <img src={image} alt={alt || title} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.1) 100%)' }} />

        <button type="button" className="hc-back" onClick={goBack} aria-label="Kembali">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{backLabel}</span>
        </button>

        <div className="hc-body">
          <div className="hc-tags">
            {tags.map(t => (
              <span key={t} style={{ ...mono, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.65)', whiteSpace: 'nowrap' }}>{t}</span>
            ))}
          </div>
          {eyebrow && <span className="hc-eye" style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#bbb' }}>{eyebrow}</span>}
          <h1 className="hc-title" style={{ ...m, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#fff', margin: 0 }}>{title}</h1>
          {summary && <p className="hc-sum" style={{ ...m, color: '#d0d0d0', lineHeight: 1.55, margin: 0 }}>{summary}</p>}
          <div className="hc-foot">
            <span style={{ ...m, background: '#fff', color: '#000', fontSize: '11px', fontWeight: 700, padding: '9px 16px', borderRadius: '8px' }}>{cta}</span>
            {meta && <span style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.08em' }}>{meta}</span>}
          </div>
        </div>

        {/* lengkung hitam di dasar gambar */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '-1px', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '36px' }}>
            <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000" />
          </svg>
        </div>
      </div>
      <style>{`
        .hc { --hh: 64px; --pad: 20px; position: relative; overflow: hidden; cursor: pointer; background: #111; width: 100%; box-sizing: border-box;
              height: calc(var(--hh) + 56.25vw); min-height: 330px; max-height: 88vh; }
        .hc-back { position: absolute; top: calc(var(--hh) + 6px); left: var(--pad); display: inline-flex; align-items: center; gap: 6px; color: #fff; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.25); border-radius: 999px; padding: 7px 12px 7px 9px; cursor: pointer; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
        .hc-body { position: absolute; left: var(--pad); right: var(--pad); bottom: 40px; display: flex; flex-direction: column; gap: 6px; }
        .hc-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .hc-eye { display: none; }
        .hc-title { font-size: clamp(16px, 4.6vw, 44px); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .hc-sum { font-size: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 720px; }
        .hc-foot { display: none; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 2px; }
        @media (min-width: 768px) {
          .hc { --hh: 80px; --pad: 40px; }
          .hc-body { bottom: 48px; gap: 10px; }
          .hc-eye { display: block; }
          .hc-sum { font-size: 14px; }
          .hc-foot { display: flex; }
        }
        @media (min-width: 1024px) {
          .hc { --hh: 96px; --pad: 56px; }
          .hc-body { bottom: 56px; gap: 14px; }
          .hc-sum { font-size: 16px; }
        }
      `}</style>
    </>
  );
};

export default HeroCard;
