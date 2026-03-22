import React, { useEffect, useRef, useState } from 'react';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface ImageViewerProps {
  items: MediaItem[];
  startIndex?: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ items, startIndex = 0, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const current = items[idx];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [idx]);

  const go = (dir: number) => {
    setZoomed(false);
    setScale(1);
    setIdx(prev => Math.max(0, Math.min(items.length - 1, prev + dir)));
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', flexDirection: 'column',
        animation: 'iv-in 0.2s ease',
      }}
      onClick={() => { if (!zoomed) onClose(); }}
    >
      <style>{`
        @keyframes iv-in { from{opacity:0} to{opacity:1} }
        @keyframes iv-img { from{transform:scale(0.95);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>

      {/* TOP BAR */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', flexShrink: 0, zIndex: 2 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {items.length > 1 && (
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
              {idx + 1} / {items.length}
            </span>
          )}
          {current.caption && (
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {current.caption}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Zoom toggle — hanya untuk gambar */}
          {current.type === 'image' && (
            <button
              onClick={() => { setZoomed(!zoomed); setScale(zoomed ? 1 : 2); }}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {zoomed
                ? <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
                : <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
              }
            </button>
          )}
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      {/* MEDIA */}
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
          if (Math.abs(dx) > 50 && dy < 80 && !zoomed) go(dx < 0 ? 1 : -1);
          if (dy > 100 && Math.abs(dx) < 50) onClose();
        }}
      >
        {current.type === 'image' ? (
          <img
            key={idx}
            src={current.url}
            alt={current.caption || ''}
            referrerPolicy="no-referrer"
            onClick={() => { setZoomed(!zoomed); setScale(zoomed ? 1 : 2); }}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${scale})`,
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
              cursor: zoomed ? 'zoom-out' : 'zoom-in',
              animation: 'iv-img 0.2s ease',
              userSelect: 'none',
            }}
          />
        ) : (
          <video
            key={idx}
            src={current.url}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', animation: 'iv-img 0.2s ease' }}
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>

      {/* NAV ARROWS */}
      {items.length > 1 && (
        <>
          {idx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); go(-1); }}
              style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
          )}
          {idx < items.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); go(1); }}
              style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          )}
        </>
      )}

      {/* DOTS */}
      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '14px 0', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {items.map((_, i) => (
            <div key={i} onClick={() => { setIdx(i); setZoomed(false); setScale(1); }}
              style={{ width: i === idx ? '16px' : '5px', height: '5px', borderRadius: i === idx ? '3px' : '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s', cursor: 'pointer' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
