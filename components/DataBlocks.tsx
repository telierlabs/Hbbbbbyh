import React, { useEffect, useRef, useState } from 'react';
import { ContentBlock } from '../types';
import { COUNTRIES } from '../countries';
import { MAP_W, MAP_H, MAP_STEP, getLandPath, project } from '../worldDots';

/*
  BLOK VISUAL ARTIKEL
  Bentuk data (disimpan di ContentBlock.data, aman untuk Firestore: tidak ada array di dalam array):

  stats    : { items: [{ value, unit, label, note }] }
  table    : { title, cols: string[], rows: [{ c: string[] }], source }
  chart    : { title, kind: 'line' | 'bar', unit, source, points: [{ label, value }] }
  timeline : { title, items: [{ date, text }] }
  quote    : { text, source }
  cause    : { title, steps: [{ tag, text, note }] }            (sebab -> akibat, urut dari atas)
  map      : { title, source, places: [{ label, note, country, coord }] }  (coord = "lat, lon", opsional kalau pilih negara)
*/

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

export const DATA_TYPES = ['stats', 'table', 'chart', 'timeline', 'quote', 'cause', 'map'] as const;
// urutan tombol "tambah blok" di Admin
export const ALL_BLOCK_TYPES = ['text', 'image', 'video', 'stats', 'table', 'chart', 'timeline', 'cause', 'map', 'quote'] as const;
export const isDataBlock = (t: string) => (DATA_TYPES as readonly string[]).includes(t);

export const BLOCK_LABEL: Record<string, string> = {
  text: 'Teks', image: 'Gambar', video: 'Video',
  stats: 'Kartu Angka', table: 'Tabel', chart: 'Grafik', timeline: 'Garis Waktu', quote: 'Kutipan', cause: 'Sebab → Akibat', map: 'Peta Lokasi',
};

export const newDataBlock = (type: string): ContentBlock => {
  const data =
    type === 'stats' ? { items: [{ value: '', unit: '', label: '', note: '' }, { value: '', unit: '', label: '', note: '' }] } :
    type === 'table' ? { title: '', cols: ['Aspek', '', ''], rows: [{ c: ['', '', ''] }, { c: ['', '', ''] }], source: '' } :
    type === 'chart' ? { title: '', kind: 'line', unit: '', source: '', points: [{ label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }] } :
    type === 'timeline' ? { title: '', items: [{ date: '', text: '' }, { date: '', text: '' }] } :
    type === 'cause' ? { title: '', steps: [{ tag: '', text: '', note: '' }, { tag: '', text: '', note: '' }, { tag: '', text: '', note: '' }] } :
    type === 'map' ? { title: '', source: '', places: [{ label: '', note: '', country: '', coord: '' }] } :
    { text: '', source: '' };
  return { type: type as ContentBlock['type'], content: '', caption: '', data };
};

// "7,7" -> 7.7 ; kosong / bukan angka -> null
export const toNum = (v: any): number | null => {
  const n = parseFloat(String(v ?? '').trim().replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
};
const fmt = (n: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);
const clean = (s: any) => String(s ?? '').trim();

/* ───────── teks polos (untuk pembaca suara, AI insight, pencarian) ───────── */
export const blockToText = (b: ContentBlock): string => {
  const d = b.data || {};
  if (b.type === 'stats') {
    return (d.items || []).filter((i: any) => clean(i.value) || clean(i.label))
      .map((i: any) => `${clean(i.label)} ${clean(i.value)} ${clean(i.unit)}`.replace(/\s+/g, ' ').trim()).join('; ');
  }
  if (b.type === 'table') {
    const cols: string[] = d.cols || [];
    const rows = (d.rows || []).map((r: any) => (r.c || []).map((v: string, i: number) => (i === 0 ? clean(v) : `${clean(cols[i])} ${clean(v)}`.trim())).filter(Boolean).join(', ')).filter(Boolean);
    return [clean(d.title), ...rows].filter(Boolean).join('. ');
  }
  if (b.type === 'chart') {
    const pts = (d.points || []).filter((p: any) => clean(p.label) && toNum(p.value) !== null).map((p: any) => `${clean(p.label)} ${clean(p.value)}`);
    return [clean(d.title), ...pts].filter(Boolean).join('. ');
  }
  if (b.type === 'timeline') {
    return [clean(d.title), ...(d.items || []).filter((i: any) => clean(i.text)).map((i: any) => `${clean(i.date)} ${clean(i.text)}`.trim())].filter(Boolean).join('. ');
  }
  if (b.type === 'cause') {
    const st = (d.steps || []).filter((x: any) => clean(x.text)).map((x: any) => clean(x.text));
    return [clean(d.title), st.join(', lalu ')].filter(Boolean).join('. ');
  }
  if (b.type === 'map') {
    const pl = (d.places || []).filter((x: any) => clean(x.label)).map((x: any) => `${clean(x.label)} ${clean(x.note)}`.trim());
    return pl.length ? `${clean(d.title) || 'Lokasi kejadian'}: ${pl.join(', ')}` : '';
  }
  if (b.type === 'quote') return clean(d.text) ? `${clean(d.text)} ${clean(d.source)}`.trim() : '';
  return '';
};

/* ───────── potongan kecil ───────── */
const ICONS: Record<string, string> = {
  stats: 'M3 12h4l2-6 4 12 2-6h6',
  table: 'M4 5h16v14H4zM4 10h16M10 5v14',
  chart: 'M4 19V5M4 19h16M7 15l4-4 3 3 5-6',
  timeline: 'M12 3v18M12 7h6M12 12h-6M12 17h6',
  cause: 'M4 12h14M13 6l6 6-6 6',
  map: 'M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10zM12 8.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
};

const BlockTitle: React.FC<{ type: string; title?: string; extra?: string }> = ({ type, title, extra }) => {
  if (!clean(title)) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
      <span style={{ width: '22px', height: '22px', borderRadius: '7px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[type] || ICONS.stats} /></svg>
      </span>
      <span style={{ ...m, fontSize: '14px', fontWeight: 700, color: '#111', lineHeight: 1.35 }}>
        {title}{extra ? <span style={{ fontWeight: 500, color: '#888' }}> {extra}</span> : null}
      </span>
    </div>
  );
};

const Source: React.FC<{ text?: string }> = ({ text }) => clean(text)
  ? <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.06em', color: '#999', textAlign: 'right', marginTop: '6px' }}>Sumber: {clean(text)}</div>
  : null;

const wrap: React.CSSProperties = { margin: '22px 0' };

/* ───────── KARTU ANGKA ───────── */
const StatsView: React.FC<{ d: any }> = ({ d }) => {
  const items = (d.items || []).filter((i: any) => clean(i.value) || clean(i.label));
  if (!items.length) return null;
  return (
    <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(76px, 1fr))', gap: '8px' }}>
      {items.map((it: any, i: number) => {
        const big = (clean(it.value) + clean(it.unit)).length <= 6;
        return (
          <div key={i} style={{ background: '#111', borderRadius: '12px', padding: '12px 11px 11px', color: '#fff', minWidth: 0 }}>
            <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.08em', color: '#9a9aa2', textTransform: 'uppercase', marginBottom: '6px', lineHeight: 1.3 }}>{clean(it.label)}</div>
            <div style={{ ...m, fontWeight: 800, fontSize: big ? '22px' : '17px', lineHeight: 1.1, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
              {clean(it.value)}{clean(it.unit) && <span style={{ fontSize: '11px', fontWeight: 600, color: '#bdbdc5', marginLeft: '4px' }}>{clean(it.unit)}</span>}
            </div>
            {clean(it.note) && <div style={{ ...m, fontSize: '10px', color: '#8a8a92', marginTop: '4px', lineHeight: 1.3 }}>{clean(it.note)}</div>}
          </div>
        );
      })}
    </div>
  );
};

/* ───────── TABEL ───────── */
const TableView: React.FC<{ d: any }> = ({ d }) => {
  const cols: string[] = d.cols || [];
  const rows: string[][] = (d.rows || []).map((r: any) => r.c || []).filter((c: string[]) => c.some(v => clean(v)));
  if (!rows.length) return null; // tabel tanpa isi tidak ditampilkan
  return (
    <div style={wrap}>
      <BlockTitle type="table" title={d.title} />
      <div style={{ overflowX: 'auto', border: '1px solid #e8e8ea', borderRadius: '12px', background: '#fff', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ ...m, width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: cols.length > 3 ? `${cols.length * 120}px` : undefined }}>
          <thead>
            <tr>{cols.map((c, i) => <th key={i} style={{ background: '#f4f4f5', textAlign: 'left', padding: '9px 11px', fontWeight: 700, fontSize: '11px', color: '#333', borderBottom: '1px solid #e8e8ea', whiteSpace: 'nowrap' }}>{clean(c)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {cols.map((_, ci) => (
                  <td key={ci} style={{ padding: '9px 11px', color: '#222', fontWeight: ci === 0 ? 600 : 400, borderTop: ri === 0 ? 'none' : '1px solid #f0f0f2', lineHeight: 1.4, verticalAlign: 'top' }}>{clean(r[ci])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Source text={d.source} />
    </div>
  );
};

/* lebar elemen (px), dipakai untuk menggambar SVG pas ukuran layar */
const useWidth = (): [React.RefObject<HTMLDivElement>, number] => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setW(Math.max(220, Math.round(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
};

/* ───────── GRAFIK (SVG digambar sendiri) ───────── */
const niceStep = (range: number) => {
  const raw = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
};

const ChartView: React.FC<{ d: any }> = ({ d }) => {
  const [ref, w] = useWidth();

  const kind = d.kind === 'bar' ? 'bar' : 'line';
  const pts = (d.points || []).map((p: any) => ({ label: clean(p.label), v: toNum(p.value) })).filter((p: any) => p.label && p.v !== null) as { label: string; v: number }[];
  if (pts.length < (kind === 'line' ? 2 : 1)) return null;

  const vals = pts.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo >= 0) lo = 0;
  if (hi <= 0) hi = 0;
  if (hi === lo) hi = lo + 1;
  const step = niceStep(hi - lo);
  const yMax = Math.ceil(hi / step - 1e-9) * step;
  const yMin = lo < 0 ? Math.floor(lo / step + 1e-9) * step : 0;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax + step / 2; t += step) ticks.push(Math.round(t * 1e6) / 1e6);

  const H = 220, padT = 24, padB = 30, padR = 20;
  const padL = Math.max(30, Math.max(...ticks.map(t => fmt(t).length)) * 6.4 + 12);
  const plotW = w - padL - padR, plotH = H - padT - padB;
  const n = pts.length;
  const y = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const x = (i: number) => kind === 'line' ? padL + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1)) : padL + ((i + 0.5) * plotW) / n;
  const maxLabels = Math.max(2, Math.floor(plotW / 46));
  const every = Math.ceil(n / maxLabels);
  const showVals = n <= 12;
  const maxV = Math.max(...vals);
  const maxIdx = vals.indexOf(maxV);
  const base = y(Math.max(yMin, 0));
  const barW = Math.min(38, (plotW / n) * 0.62);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)},${base.toFixed(1)} L${x(0).toFixed(1)},${base.toFixed(1)} Z`;

  return (
    <div style={wrap}>
      <div style={{ border: '1px solid #e8e8ea', borderRadius: '12px', background: '#fafafa', padding: '14px 12px 10px' }}>
        <BlockTitle type="chart" title={d.title} extra={clean(d.unit) ? `(${clean(d.unit)})` : ''} />
        <div ref={ref} style={{ width: '100%' }}>
          <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{ display: 'block', overflow: 'visible' }} role="img" aria-label={clean(d.title) || 'Grafik'}>
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#cfcfd4' : '#ececef'} strokeWidth="1" />
                <text x={padL - 7} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#8a8a92" style={m}>{fmt(t)}</text>
              </g>
            ))}
            {kind === 'line' && (
              <>
                <path d={area} fill="rgba(17,17,17,0.05)" />
                <path d={line} fill="none" stroke="#111" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              </>
            )}
            {pts.map((p, i) => (
              <g key={i}>
                {kind === 'bar' && (
                  <rect x={x(i) - barW / 2} y={Math.min(y(p.v), base)} width={barW} height={Math.max(1, Math.abs(base - y(p.v)))} rx="3" fill={i === maxIdx ? '#111' : '#cfcfd6'} />
                )}
                {kind === 'line' && <circle cx={x(i)} cy={y(p.v)} r="3.5" fill="#111" stroke="#fafafa" strokeWidth="1.5" />}
                {(showVals || i === maxIdx) && (
                  <text x={x(i)} y={(p.v >= 0 ? y(p.v) : y(p.v) + 14) - (p.v >= 0 ? 8 : 0)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#111" style={m}>{fmt(p.v)}</text>
                )}
                {i % every === 0 && (
                  <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="#777" style={m}>{p.label}</text>
                )}
              </g>
            ))}
          </svg>
        </div>
        <Source text={d.source} />
      </div>
    </div>
  );
};

/* ───────── GARIS WAKTU MINI ───────── */
const TimelineView: React.FC<{ d: any }> = ({ d }) => {
  const items = (d.items || []).filter((i: any) => clean(i.text) || clean(i.date));
  if (!items.length) return null;
  return (
    <div style={wrap}>
      <div style={{ background: '#f6f6f7', borderRadius: '12px', padding: '14px 14px 12px' }}>
        <BlockTitle type="timeline" title={d.title} />
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((it: any, i: number) => {
            const last = i === items.length - 1;
            return (
              <li key={i} style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(76px, 30%) 1fr', gap: '10px', padding: `0 0 ${last ? 0 : 14}px 20px` }}>
                {!last && <span style={{ position: 'absolute', left: '3.5px', top: '12px', bottom: '-2px', width: '2px', background: '#111' }} />}
                <span style={{ position: 'absolute', left: 0, top: '3px', width: '9px', height: '9px', borderRadius: '50%', background: '#111' }} />
                <span style={{ ...m, fontSize: '12px', fontWeight: 700, color: '#111', lineHeight: 1.4 }}>{clean(it.date)}</span>
                <span style={{ ...m, fontSize: '12.5px', color: '#444', lineHeight: 1.5 }}>{clean(it.text)}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

/* ───────── KUTIPAN ───────── */
const QuoteView: React.FC<{ d: any }> = ({ d }) => {
  if (!clean(d.text)) return null;
  return (
    <div style={{ ...wrap, background: '#f4f4f5', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span aria-hidden style={{ fontFamily: 'Georgia, serif', fontSize: '44px', fontWeight: 700, lineHeight: '0.8', color: '#111', marginTop: '6px' }}>“</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...m, fontSize: '13.5px', color: '#222', lineHeight: 1.6 }}>{clean(d.text)}</div>
        {clean(d.source) && <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.06em', color: '#777', marginTop: '8px' }}>— {clean(d.source)}</div>}
      </div>
    </div>
  );
};

/* ───────── SEBAB → AKIBAT ───────── */
const CauseView: React.FC<{ d: any }> = ({ d }) => {
  const steps = (d.steps || []).filter((s: any) => clean(s.text));
  if (!steps.length) return null;
  return (
    <div style={wrap}>
      <BlockTitle type="cause" title={d.title} />
      <div>
        {steps.map((s: any, i: number) => {
          const last = i === steps.length - 1 && steps.length > 1;
          return (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start', padding: '12px 13px', borderRadius: '12px', background: last ? '#111' : '#f6f6f7', border: last ? '1px solid #111' : '1px solid #e8e8ea' }}>
                <span style={{ ...m, flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: last ? '#fff' : '#111', color: last ? '#111' : '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <div style={{ minWidth: 0 }}>
                  {clean(s.tag) && <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: last ? '#9a9aa2' : '#888', marginBottom: '3px' }}>{clean(s.tag)}</div>}
                  <div style={{ ...m, fontSize: '13.5px', fontWeight: 700, lineHeight: 1.4, color: last ? '#fff' : '#111' }}>{clean(s.text)}</div>
                  {clean(s.note) && <div style={{ ...m, fontSize: '12px', lineHeight: 1.5, color: last ? '#bdbdc5' : '#666', marginTop: '3px' }}>{clean(s.note)}</div>}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3px 0' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v16M6 14l6 6 6-6" /></svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── PETA LOKASI ───────── */
// "−8.5, 121.7" -> { lat, lon } ; salah format -> null
export const parseCoord = (v: any): { lat: number; lon: number } | null => {
  const mt = String(v ?? '').replace(/[−–]/g, '-').match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
  if (!mt) return null;
  const lat = parseFloat(mt[1]), lon = parseFloat(mt[2]);
  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : null;
};


// Daftar tempat untuk dropdown blok Peta (di luar ini: isi koordinat manual).
const EXTRA: [string, string, number, number][] = [
  ['co','Kolombia',4,-72],['es','Spanyol',40,-4],['it','Italia',42.8,12.5],['tr','Turki',39,35],['ir','Iran',32,53],['il','Israel',31,35],['ps','Palestina',31.9,35.2],
  ['eg','Mesir',26,30],['za','Afrika Selatan',-30,25],['ng','Nigeria',9,8],['ke','Kenya',0,38],['et','Etiopia',9,40],['mx','Meksiko',23,-102],['ca','Kanada',56,-106],
  ['ar','Argentina',-34,-64],['cl','Chile',-30,-71],['pe','Peru',-10,-75],['ve','Venezuela',7,-66],['cu','Kuba',21.5,-79.5],['th','Thailand',15,101],['vn','Vietnam',16,107],
  ['ph','Filipina',13,122],['mm','Myanmar',21,96],['bd','Bangladesh',24,90],['pk','Pakistan',30,70],['af','Afganistan',33,66],['lk','Sri Lanka',7.9,80.7],['np','Nepal',28,84],
  ['tw','Taiwan',23.7,121],['kp','Korea Utara',40,127],['mn','Mongolia',47,105],['kz','Kazakhstan',48,67],['ae','Uni Emirat Arab',24,54],['qa','Qatar',25.3,51.2],['iq','Irak',33,44],
  ['sy','Suriah',35,38],['lb','Lebanon',33.9,35.9],['ye','Yaman',15.5,48],['jo','Yordania',31,36],['pl','Polandia',52,19],['nl','Belanda',52,5],['be','Belgia',50.6,4.6],
  ['ch','Swiss',46.8,8.2],['se','Swedia',62,15],['no','Norwegia',62,10],['fi','Finlandia',64,26],['pt','Portugal',39.5,-8],['gr','Yunani',39,22],['by','Belarus',53.7,28],
  ['ro','Rumania',46,25],['at','Austria',47.5,14.5],['ie','Irlandia',53,-8],['nz','Selandia Baru',-41,174],['pg','Papua Nugini',-6.3,147],['tl','Timor Leste',-8.8,125.7],
  ['kh','Kamboja',12.5,105],['la','Laos',19,102],['bn','Brunei',4.5,114.7],['dz','Aljazair',28,3],['ma','Maroko',32,-6],['ly','Libya',27,17],['sd','Sudan',15,30],
  ['so','Somalia',6,46],['cd','Kongo (DRC)',-2.9,23.7],['gh','Ghana',7.9,-1],['ug','Uganda',1.4,32.3],['tz','Tanzania',-6.4,34.9],
];
export const PLACE_OPTIONS: { code: string; name: string; lat: number; lon: number }[] = (() => {
  const seen = new Set<string>();
  const out: { code: string; name: string; lat: number; lon: number }[] = [];
  COUNTRIES.filter(c => c.code !== 'xx').forEach(c => { seen.add(c.code); out.push({ code: c.code, name: c.name, lat: c.lat, lon: c.lon }); });
  EXTRA.forEach(([code, name, lat, lon]) => { if (!seen.has(code)) out.push({ code, name, lat, lon }); });
  return out.sort((a, b) => a.name.localeCompare(b.name));
})();

// koordinat dari kolom "koordinat" dulu, kalau kosong pakai titik negara
export const resolvePlace = (p: any): { lat: number; lon: number } | null => {
  const c = parseCoord(p.coord);
  if (c) return c;
  const ct = PLACE_OPTIONS.find(o => o.code === clean(p.country));
  return ct ? { lat: ct.lat, lon: ct.lon } : null;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const MapView: React.FC<{ d: any }> = ({ d }) => {
  const [ref, w] = useWidth();
  const pts = (d.places || [])
    .filter((p: any) => clean(p.label))
    .map((p: any) => { const r = resolvePlace(p); return r ? { label: clean(p.label), note: clean(p.note), ...project(r.lat, r.lon) } : null; })
    .filter(Boolean) as { label: string; note: string; x: number; y: number }[];
  if (!pts.length) return null;

  // bingkai peta: zoom ke titik-titiknya, atau seluruh dunia kalau tersebar
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const ASPECT = 0.56;
  let vbW = Math.max((maxX - minX) * 1.5 + 50, ((maxY - minY) * 1.5 + 30) / ASPECT, 100);
  let vbH = vbW * ASPECT, vbX = 0, vbY = 0;
  if (vbW >= MAP_W * 0.8 || vbH > MAP_H) { vbW = MAP_W; vbH = MAP_H; }
  else { vbX = clamp((minX + maxX) / 2 - vbW / 2, 0, MAP_W - vbW); vbY = clamp((minY + maxY) / 2 - vbH / 2, 0, MAP_H - vbH); }

  const u = vbW / w; // 1 px = u satuan peta
  const fs = 10.5 * u, fs2 = 9 * u;

  // Letakkan label di kanan/kiri titik, pilih sisi yang tidak menabrak label lain atau keluar bingkai
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
  type Bx = { x0: number; x1: number; y0: number; y1: number };
  const overlaps = (A: Bx) => boxes.some(B => A.x0 < B.x1 && A.x1 > B.x0 && A.y0 < B.y1 && A.y1 > B.y0);
  const outside = (A: Bx) => A.x0 < vbX + 2 * u || A.x1 > vbX + vbW - 2 * u || A.y0 < vbY + 2 * u || A.y1 > vbY + vbH - 2 * u;
  const placed = pts.map(p => {
    const wd = Math.max(p.label.length * fs * 0.62, p.note.length * fs2 * 0.56) + 4 * u;
    const mk = (right: boolean, dy: number) => {
      const x0 = right ? p.x + 10 * u : p.x - 10 * u - wd;
      return { x0, x1: x0 + wd, y0: p.y + dy - 1.4 * fs, y1: p.y + dy + (p.note ? 2.2 * fs : 0.8 * fs), dy, right };
    };
    const pref = (p.x - vbX) / vbW <= 0.62;
    const opts = [0, 2.9 * fs, -2.9 * fs].flatMap(dy => [mk(pref, dy), mk(!pref, dy)]);
    const box = opts.find(bx => !overlaps(bx) && !outside(bx)) || opts.find(bx => !overlaps(bx)) || opts[0];
    boxes.push(box);
    return { ...p, right: box.right, dy: box.dy };
  });

  return (
    <div style={wrap}>
      <BlockTitle type="map" title={d.title} />
      <div ref={ref} style={{ background: '#0b0b0c', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
        <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} width="100%" style={{ display: 'block' }} role="img" aria-label={clean(d.title) || 'Peta lokasi kejadian'}>
          <path d={getLandPath()} fill="none" stroke="#3a3a40" strokeWidth={MAP_STEP * 0.62} strokeLinecap="round" />
          {placed.map((p, i) => {
            const tx = p.right ? p.x + 10 * u : p.x - 10 * u;
            const anchor = p.right ? 'start' : 'end';
            const halo = { paintOrder: 'stroke', stroke: '#0b0b0c', strokeWidth: 3 * u, strokeLinejoin: 'round' } as React.CSSProperties;
            return (
              <g key={i}>
                <circle className="db-ring" cx={p.x} cy={p.y} r={8 * u} fill="none" stroke="#fff" strokeWidth={1 * u} style={{ animationDelay: `${(i % 4) * 0.5}s` }} />
                <circle cx={p.x} cy={p.y} r={3.4 * u} fill="#fff" stroke="#0b0b0c" strokeWidth={1.2 * u} />
                <text x={tx} y={p.y + p.dy - (p.note ? 0.5 * fs : -0.35 * fs)} textAnchor={anchor} fontSize={fs} fontWeight="700" fill="#fff" style={{ ...m, ...halo }}>{p.label}</text>
                {p.note && <text x={tx} y={p.y + p.dy + 1.05 * fs} textAnchor={anchor} fontSize={fs2} fill="#a8a8b0" style={{ ...m, ...halo }}>{p.note}</text>}
              </g>
            );
          })}
        </svg>
        <style>{`@keyframes db-pulse{0%{transform:scale(1);opacity:.85}100%{transform:scale(2.3);opacity:0}}.db-ring{transform-box:fill-box;transform-origin:center;animation:db-pulse 2.2s ease-out infinite}`}</style>
      </div>
      <Source text={d.source} />
    </div>
  );
};

/* ───────── PINTU MASUK ───────── */
export const DataBlockView: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const d = block.data || {};
  switch (block.type) {
    case 'stats': return <StatsView d={d} />;
    case 'table': return <TableView d={d} />;
    case 'chart': return <ChartView d={d} />;
    case 'timeline': return <TimelineView d={d} />;
    case 'quote': return <QuoteView d={d} />;
    case 'cause': return <CauseView d={d} />;
    case 'map': return <MapView d={d} />;
    default: return null;
  }
};

export default DataBlockView;
