import React from 'react';

// Hero gambar 16:9: foto, judul, dan deskripsi singkat berita terbaru.
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
  onClick: () => void;
}

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const HeroCard: React.FC<HeroCardProps> = ({ image, alt, tags, eyebrow, title, summary, cta, meta, onClick }) => (
  <>
    <div className="hc" onClick={onClick} role="link" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') onClick(); }}>
      {image && <img src={image} alt={alt || title} referrerPolicy="no-referrer" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.3) 62%,transparent 100%)' }} />
      <div className="hc-tags">
        {tags.map(t => (
          <span key={t} style={{ ...mono, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.65)', whiteSpace: 'nowrap' }}>{t}</span>
        ))}
      </div>
      <div className="hc-body">
        {eyebrow && <span className="hc-eye" style={{ ...mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#bbb' }}>{eyebrow}</span>}
        <h2 className="hc-title" style={{ ...m, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#fff', margin: 0 }}>{title}</h2>
        {summary && <p className="hc-sum" style={{ ...m, color: '#ccc', lineHeight: 1.55, margin: 0 }}>{summary}</p>}
        <div className="hc-foot">
          <span style={{ ...m, background: '#fff', color: '#000', fontSize: '11px', fontWeight: 700, padding: '9px 16px', borderRadius: '8px' }}>{cta}</span>
          {meta && <span style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.08em' }}>{meta}</span>}
        </div>
      </div>
    </div>
    <style>{`
      .hc { position: relative; overflow: hidden; border-radius: 16px; cursor: pointer; background: #111; border: 1px solid #1e1e1e; aspect-ratio: 16 / 9; width: 100%; box-sizing: border-box; }
      .hc-tags { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
      .hc-body { position: absolute; left: 14px; right: 14px; bottom: 12px; display: flex; flex-direction: column; gap: 5px; }
      .hc-eye { display: none; }
      .hc-title { font-size: clamp(15px, 4.4vw, 40px); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .hc-sum { font-size: 11.5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 720px; }
      .hc-foot { display: none; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 2px; }
      @media (min-width: 640px) {
        .hc-tags { top: 14px; left: 14px; right: 14px; }
        .hc-body { left: 18px; right: 18px; bottom: 18px; gap: 10px; }
        .hc-eye { display: block; }
        .hc-sum { font-size: 13px; }
        .hc-foot { display: flex; }
      }
      @media (min-width: 1024px) {
        .hc { max-height: 620px; }
        .hc-body { left: 32px; right: 32px; bottom: 30px; gap: 14px; }
        .hc-sum { font-size: 15px; }
      }
    `}</style>
  </>
);

export default HeroCard;
