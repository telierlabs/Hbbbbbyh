import React, { useEffect, useRef, useState } from 'react';
import { ContentBlock } from '../types';

/*
  BLOK VISUAL ARTIKEL
  Bentuk data (disimpan di ContentBlock.data, aman untuk Firestore: tidak ada array di dalam array):

  stats    : { items: [{ value, unit, label, note }] }
  table    : { title, cols: string[], rows: [{ c: string[] }], source }
  chart    : { title, kind: 'line' | 'bar', unit, source, points: [{ label, value }] }
  timeline : { title, items: [{ date, text }] }
  quote    : { text, source }
*/

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

export const DATA_TYPES = ['stats', 'table', 'chart', 'timeline', 'quote'] as const;
export const isDataBlock = (t: string) => (DATA_TYPES as readonly string[]).includes(t);

export const BLOCK_LABEL: Record<string, string> = {
  text: 'Teks', image: 'Gambar', video: 'Video',
  stats: 'Kartu Angka', table: 'Tabel', chart: 'Grafik', timeline: 'Garis Waktu', quote: 'Kutipan',
};

export const newDataBlock = (type: string): ContentBlock => {
  const data =
    type === 'stats' ? { items: [{ value: '', unit: '', label: '', note: '' }, { value: '', unit: '', label: '', note: '' }] } :
    type === 'table' ? { title: '', cols: ['Aspek', '', ''], rows: [{ c: ['', '', ''] }, { c: ['', '', ''] }], source: '' } :
    type === 'chart' ? { title: '', kind: 'line', unit: '', source: '', points: [{ label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }] } :
    type === 'timeline' ? { title: '', items: [{ date: '', text: '' }, { date: '', text: '' }] } :
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
  if (b.type === 'quote') return clean(d.text) ? `${clean(d.text)} ${clean(d.source)}`.trim() : '';
  return '';
};

/* ───────── potongan kecil ───────── */
const ICONS: Record<string, string> = {
  stats: 'M3 12h4l2-6 4 12 2-6h6',
  table: 'M4 5h16v14H4zM4 10h16M10 5v14',
  chart: 'M4 19V5M4 19h16M7 15l4-4 3 3 5-6',
  timeline: 'M12 3v18M12 7h6M12 12h-6M12 17h6',
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
  if (!cols.some(c => clean(c)) && !rows.length) return null;
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

/* ───────── GRAFIK (SVG digambar sendiri) ───────── */
const niceStep = (range: number) => {
  const raw = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
};

const ChartView: React.FC<{ d: any }> = ({ d }) => {
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

/* ───────── PINTU MASUK ───────── */
export const DataBlockView: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const d = block.data || {};
  switch (block.type) {
    case 'stats': return <StatsView d={d} />;
    case 'table': return <TableView d={d} />;
    case 'chart': return <ChartView d={d} />;
    case 'timeline': return <TimelineView d={d} />;
    case 'quote': return <QuoteView d={d} />;
    default: return null;
  }
};

export default DataBlockView;
