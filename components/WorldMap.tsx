import React, { useMemo, useState } from 'react';
import { COUNTRIES, getCountry } from '../countries';
import { MAP_W, MAP_H, getLandPath, project } from '../worldDots';

interface WorldMapProps {
  counts: Record<string, number>; // jumlah berita per kode negara
  activeCode?: string; // kalau diisi: peta di-zoom ke negara ini
  onSelect?: (code: string) => void; // klik marker negara
}

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const WorldMap: React.FC<WorldMapProps> = ({ counts, activeCode, onSelect }) => {
  const [hover, setHover] = useState<string | null>(null);
  const landPath = useMemo(() => getLandPath(), []);

  // Area peta yang ditampilkan (viewBox). Tanpa activeCode = seluruh dunia.
  const active = getCountry(activeCode);
  const zoom = active ? active.zoom : 1;
  const vbW = MAP_W / zoom;
  const vbH = MAP_H / zoom;
  let vbX = 0;
  let vbY = 0;
  if (active) {
    const [fLat, fLon] = active.focus || [active.lat, active.lon];
    const c = project(fLat, fLon);
    vbX = Math.min(Math.max(c.x - vbW / 2, 0), MAP_W - vbW);
    vbY = Math.min(Math.max(c.y - vbH / 2, 0), MAP_H - vbH);
  }

  const hovered = hover ? getCountry(hover) : undefined;

  // Makin dalam zoom-nya, makin kecil marker supaya tidak menutupi titik daratan
  const k = 1 / Math.sqrt(zoom);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${MAP_W} / ${MAP_H}` }}>
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        role="img"
        aria-label="Peta berita dunia"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Daratan: ribuan titik dalam satu path */}
        <path d={landPath} fill="none" stroke="#141414" strokeWidth={1.05} strokeLinecap="round" opacity={0.82} />

        {COUNTRIES.map((c, i) => {
          const p = project(c.lat, c.lon);
          // Lewati marker yang di luar area zoom
          if (p.x < vbX - 3 || p.x > vbX + vbW + 3 || p.y < vbY - 3 || p.y > vbY + vbH + 3) return null;
          const n = counts[c.code] || 0;
          const has = n > 0;
          const isActive = c.code === activeCode;
          const dim = !!activeCode && !isActive;
          return (
            <g
              key={c.code}
              transform={`translate(${p.x} ${p.y})`}
              opacity={dim ? 0.5 : 1}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${c.name}, ${n} berita`}
              style={{ cursor: onSelect ? 'pointer' : 'default', outline: 'none' }}
              onMouseEnter={() => setHover(c.code)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(c.code)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect && onSelect(c.code)}
              onKeyDown={e => {
                if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(c.code); }
              }}
            >
              {has && (
                <circle className="wm-ring" r={2.4 * k} fill="none" stroke="#00c853" strokeWidth={0.5 * k} style={{ animationDelay: `${(i % 5) * 0.4}s` }} />
              )}
              <circle r={(has ? 1.5 : 1.1) * k} fill={has ? '#00c853' : '#f5f5f7'} stroke={has ? '#000' : '#8a8a8a'} strokeWidth={0.45 * k} />
              {isActive && <circle r={3.6 * k} fill="none" stroke="#000" strokeWidth={0.4 * k} />}
              {/* area sentuh yang lebih lebar */}
              <circle r={Math.max(5 * k, 2.5)} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {hovered && (() => {
        const p = project(hovered.lat, hovered.lon);
        const left = ((p.x - vbX) / vbW) * 100;
        const top = ((p.y - vbY) / vbH) * 100;
        const n = counts[hovered.code] || 0;
        return (
          <div
            style={{
              ...mono,
              position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -165%)',
              background: '#000', color: '#fff', fontSize: '10px', letterSpacing: '0.12em', whiteSpace: 'nowrap',
              padding: '5px 9px', borderRadius: '6px', pointerEvents: 'none', zIndex: 3,
            }}
          >
            {hovered.name.toUpperCase()} · {n} BERITA
          </div>
        );
      })()}

      <style>{`
        @keyframes wm-pulse { 0% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(2.4); opacity: 0; } }
        .wm-ring { transform-box: fill-box; transform-origin: center; animation: wm-pulse 2.2s ease-out infinite; }
      `}</style>
    </div>
  );
};

export default WorldMap;
