import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getFirestore, collection, doc, query, where, orderBy, limit, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { NewsArticle } from '../types';
import { COL_VISITS, COL_DAILY, COL_META, DOC_TOTALS, VisitDoc, DailyDoc, TotalsDoc, CC_NAME, RULES_TEXT, dayKey } from '../services/analytics';

/* Statistik admin: grafik harian/bulanan/tahunan (geser), total traffic, artikel terbanyak dibaca,
   rincian sumber/perangkat/negara, dan detail tiap pengunjung yang masuk. */

const f: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };
const card: React.CSSProperties = { background: '#fff', border: '1px solid #ececec', borderRadius: '16px', padding: '14px', marginBottom: '10px' };
const cap: React.CSSProperties = { ...mono, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa' };

const nf = new Intl.NumberFormat('id-ID');
const fmtN = (n: number) => nf.format(Math.round(n || 0));
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MON_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS_S = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const pad = (n: number) => String(n).padStart(2, '0');
const dim = (y: number, m: number) => new Date(y, m, 0).getDate(); // m = 1..12

const clock = (ts: number, sec = false) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', ...(sec ? { second: '2-digit' } : {}), hour12: false, timeZone: 'Asia/Jakarta' }).replace(/\./g, ':');
const ago = (ts: number, now: number) => {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return 'baru saja';
  if (s < 3600) return `${Math.round(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.round(s / 3600)} jam lalu`;
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }) + ' · ' + clock(ts);
};

const sumMap = (docs: DailyDoc[], field: keyof DailyDoc): Record<string, number> => {
  const out: Record<string, number> = {};
  docs.forEach(d => { const m = d[field] as Record<string, number> | undefined; if (m) Object.entries(m).forEach(([k, v]) => { out[k] = (out[k] || 0) + (Number(v) || 0); }); });
  return out;
};
const sumNum = (docs: DailyDoc[], field: 'views' | 'visitors' | 'sessions' | 'newVisitors') => docs.reduce((a, d) => a + (Number(d[field]) || 0), 0);
const sorted = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1]);

const niceStep = (range: number) => { const raw = Math.max(range, 1) / 4; const mag = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / mag; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag; };

/* ───────── potongan UI ───────── */
const Kpi: React.FC<{ label: string; value: string; sub?: string; dark?: boolean }> = ({ label, value, sub, dark }) => (
  <div style={{ flex: '1 1 0', minWidth: '76px', background: dark ? '#111' : '#fafafa', border: dark ? '1px solid #111' : '1px solid #f0f0f0', borderRadius: '12px', padding: '11px 12px' }}>
    <div style={{ ...mono, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: dark ? '#9a9aa2' : '#999', marginBottom: '5px' }}>{label}</div>
    <div style={{ ...f, fontSize: '21px', fontWeight: 800, color: dark ? '#fff' : '#111', lineHeight: 1.05 }}>{value}</div>
    {sub && <div style={{ ...f, fontSize: '10px', color: dark ? '#8a8a92' : '#999', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const BarList: React.FC<{ title: string; items: { label: string; value: number }[]; limit?: number; unit?: string; empty?: string }> = ({ title, items, limit: lim = 6, unit = '', empty = 'Belum ada data' }) => {
  const top = items.slice(0, lim);
  const total = items.reduce((a, i) => a + i.value, 0);
  const max = Math.max(1, ...top.map(i => i.value));
  return (
    <div style={{ ...card, marginBottom: 0 }}>
      <div style={{ ...cap, marginBottom: '10px' }}>{title}</div>
      {top.length === 0 && <div style={{ ...f, fontSize: '11px', color: '#bbb', padding: '6px 0' }}>{empty}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {top.map(i => (
          <div key={i.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', ...f, fontSize: '11.5px', color: '#222', marginBottom: '3px' }}>
              <span style={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.label}</span>
              <span style={{ color: '#888', flexShrink: 0 }}>{fmtN(i.value)}{unit} · {total ? Math.round((i.value / total) * 100) : 0}%</span>
            </div>
            <div style={{ height: '5px', background: '#f1f1f3', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${(i.value / max) * 100}%`, height: '100%', background: '#111', borderRadius: '3px' }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───────── grafik yang bisa digeser ───────── */
interface Bucket { key: string; label: string; long: string; views: number; visitors: number; sessions: number; newVisitors: number; docs: DailyDoc[] }

const StatsChart: React.FC<{ buckets: Bucket[]; sel: number; onSel: (i: number) => void; onSwipe: (dir: -1 | 1) => void }> = ({ buckets, sel, onSel, onSwipe }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  const t0 = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setW(Math.max(240, Math.round(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, []);

  const H = 210, padL = 38, padR = 8, padT = 12, padB = 26;
  const maxV = Math.max(1, ...buckets.map(b => Math.max(b.views, b.visitors)));
  const step = niceStep(maxV);
  const yMax = Math.ceil(maxV / step - 1e-9) * step;
  const ticks: number[] = []; for (let t = 0; t <= yMax + step / 2; t += step) ticks.push(Math.round(t * 100) / 100);
  const plotW = w - padL - padR, plotH = H - padT - padB, n = buckets.length;
  const slot = plotW / n;
  const bw = Math.max(2, Math.min(26, slot * 0.62));
  const x = (i: number) => padL + (i + 0.5) * slot;
  const y = (v: number) => padT + plotH - (v / yMax) * plotH;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 24))));
  const todayK = dayKey(Date.now());
  const past = buckets.map((b, i) => (b.key <= todayK.slice(0, b.key.length) ? i : -1)).filter(i => i >= 0); // garis hanya sampai hari ini
  const line = past.map((i, k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(buckets[i].visitors).toFixed(1)}`).join(' ');

  return (
    <div ref={ref}
      onTouchStart={e => { t0.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - t0.current.x, dy = e.changedTouches[0].clientY - t0.current.y; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) onSwipe(dx < 0 ? 1 : -1); }}
      style={{ width: '100%', touchAction: 'pan-y', userSelect: 'none' }}>
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{ display: 'block' }}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#d4d4d8' : '#f0f0f2'} />
            <text x={padL - 6} y={y(t) + 3.5} textAnchor="end" fontSize="9.5" fill="#999" style={f}>{t >= 1000 ? `${t / 1000}rb` : t}</text>
          </g>
        ))}
        {buckets.map((b, i) => (
          <g key={b.key} onClick={() => onSel(i)} style={{ cursor: 'pointer' }}>
            <rect x={x(i) - slot / 2} y={padT} width={slot} height={plotH + padB} fill="transparent" />
            <rect x={x(i) - bw / 2} y={y(b.views)} width={bw} height={Math.max(0, y(0) - y(b.views))} rx={Math.min(3, bw / 2)} fill={i === sel ? '#111' : '#cfcfd6'} />
            {i % every === 0 && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill={i === sel ? '#111' : '#888'} fontWeight={i === sel ? 700 : 400} style={f}>{b.label}</text>}
          </g>
        ))}
        <path d={line} fill="none" stroke="#2a9d5c" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {buckets.map((b, i) => (b.visitors > 0 && (n <= 31) && past.includes(i) ? <circle key={b.key} cx={x(i)} cy={y(b.visitors)} r={i === sel ? 3.6 : 2.2} fill="#2a9d5c" stroke="#fff" strokeWidth="1" /> : null))}
      </svg>
      <div style={{ display: 'flex', gap: '14px', ...f, fontSize: '10px', color: '#888', padding: '2px 4px 0 38px' }}>
        <span><i style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '2px', background: '#111', marginRight: '5px' }} />Tayangan</span>
        <span><i style={{ display: 'inline-block', width: '12px', height: '3px', borderRadius: '2px', background: '#2a9d5c', marginRight: '5px', verticalAlign: '2px' }} />Pengunjung</span>
        <span style={{ marginLeft: 'auto', color: '#bbb' }}>geser ← →</span>
      </div>
    </div>
  );
};

/* ───────── kartu sesi pengunjung ───────── */
interface Sess { sid: string; visits: VisitDoc[]; first: VisitDoc; last: VisitDoc }

const pageLabel = (v: VisitDoc) => v.kind === 'artikel' ? (v.title || v.path) : v.kind === 'beranda' ? 'Beranda' : v.kind === 'kategori' ? `Kategori ${v.cat || ''}`.trim() : v.kind === 'timeline' ? 'Timeline' : v.kind === 'deep dive' ? 'Deep Dive' : v.kind === 'world' ? 'The World Right Now' : v.kind === 'top stories' ? 'Top Stories' : v.kind === 'quiz' ? 'Quiz' : v.path;
const devLabel = (d: string) => d === 'mobile' ? 'HP' : d === 'tablet' ? 'Tablet' : 'Desktop';
const srcLabel = (v: VisitDoc) => v.refType === 'langsung' ? 'Langsung (ketik/bookmark)' : v.ref ? `${v.ref}` : v.refType;

const SessionCard: React.FC<{ s: Sess; now: number }> = ({ s, now }) => {
  const [open, setOpen] = useState(false);
  const ordered = [...s.visits].sort((a, b) => a.t - b.t);
  const fv = s.first;
  const shown = ordered.slice(0, 3);
  return (
    <div style={{ border: '1px solid #ececec', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ all: 'unset', display: 'block', width: '100%', boxSizing: 'border-box', padding: '11px 12px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
          <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.12em', padding: '3px 7px', borderRadius: '5px', background: fv.nv ? '#e8f7ee' : '#f1f1f3', color: fv.nv ? '#2a9d5c' : '#777' }}>{fv.nv ? 'BARU' : 'KEMBALI'}</span>
          <span style={{ ...f, fontSize: '11.5px', fontWeight: 700, color: '#111' }}>{devLabel(fv.dev)} · {fv.br}</span>
          <span style={{ ...f, fontSize: '11px', color: '#888' }}>{CC_NAME[fv.cc] || fv.cc}</span>
          <span style={{ ...f, fontSize: '10.5px', color: '#aaa', marginLeft: 'auto' }}>{ago(s.last.t, now)}</span>
        </div>
        <div style={{ ...f, fontSize: '10.5px', color: '#888', marginTop: '5px' }}>{fv.ns ? `Dari: ${srcLabel(fv)}` : 'Sesi berlanjut'} · {s.visits.length} halaman</div>
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {shown.map((v, i) => (
            <div key={v.t + '-' + i} style={{ display: 'flex', gap: '7px', alignItems: 'baseline', ...f, fontSize: '11.5px', color: '#333', lineHeight: 1.4 }}>
              <span style={{ ...mono, fontSize: '9px', color: '#bbb', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{pageLabel(v)}</span>
            </div>
          ))}
          {ordered.length > 3 && <div style={{ ...f, fontSize: '10.5px', color: '#aaa', paddingLeft: '16px' }}>+{ordered.length - 3} halaman lagi · ketuk untuk detail</div>}
        </div>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa', padding: '11px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: '10px' }}>
            {[['Perangkat', devLabel(fv.dev)], ['Sistem', fv.os], ['Browser', fv.br], ['Lebar layar', fv.scr ? `${fv.scr}px` : '-'], ['Bahasa', fv.lang || '-'], ['Zona waktu', fv.tz || '-'], ['Negara (perkiraan)', CC_NAME[fv.cc] || fv.cc], ['Sumber', fv.ns ? srcLabel(fv) : 'sesi berlanjut'], ['ID pengunjung', fv.vid.slice(0, 8)], ['ID sesi', s.sid.slice(0, 8)]].map(([k, v]) => (
              <div key={k}><div style={{ ...mono, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>{k}</div><div style={{ ...f, fontSize: '11.5px', color: '#222', wordBreak: 'break-word' }}>{v}</div></div>
            ))}
          </div>
          <div style={{ ...mono, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa', marginBottom: '6px' }}>Jejak halaman</div>
          {ordered.map((v, i) => (
            <div key={v.t + '-' + i} style={{ display: 'flex', gap: '9px', ...f, fontSize: '11.5px', color: '#333', padding: '4px 0', borderTop: i ? '1px dashed #eee' : 'none' }}>
              <span style={{ ...mono, fontSize: '9.5px', color: '#999', flexShrink: 0, width: '50px' }}>{clock(v.t, true)}</span>
              <span style={{ minWidth: 0, wordBreak: 'break-word' }}>{pageLabel(v)}<span style={{ display: 'block', ...mono, fontSize: '9px', color: '#bbb' }}>{v.path}</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────── halaman utama statistik ───────── */
type Gran = 'day' | 'month' | 'year';

const AdminAnalytics: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
  const [now, setNow] = useState(Date.now());
  const todayKey = dayKey(now);
  const [gran, setGran] = useState<Gran>('day');
  const [ym, setYm] = useState(todayKey.slice(0, 7));
  const [yr, setYr] = useState(todayKey.slice(0, 4));
  const [docs, setDocs] = useState<DailyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [err, setErr] = useState('');
  const [tick, setTick] = useState(0);
  const [visits, setVisits] = useState<VisitDoc[]>([]);
  const [today, setToday] = useState<DailyDoc | null>(null);
  const [yesterday, setYesterday] = useState<DailyDoc | null>(null);
  const [totals, setTotals] = useState<TotalsDoc | null>(null);
  const [sel, setSel] = useState(-1);
  const [topMode, setTopMode] = useState<'window' | 'all'>('window');
  const [copied, setCopied] = useState(false);

  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(t); }, []);

  // data live: feed kunjungan, hari ini, total
  useEffect(() => {
    let un: (() => void)[] = [];
    try {
      const db = getFirestore();
      const onErr = (e: any) => { if (e?.code === 'permission-denied') setDenied(true); };
      un.push(onSnapshot(query(collection(db, COL_VISITS), orderBy('t', 'desc'), limit(150)), s => setVisits(s.docs.map(d => d.data() as VisitDoc)), onErr));
      un.push(onSnapshot(doc(db, COL_DAILY, todayKey), s => setToday(s.exists() ? (s.data() as DailyDoc) : null), onErr));
      un.push(onSnapshot(doc(db, COL_META, DOC_TOTALS), s => setTotals(s.exists() ? (s.data() as TotalsDoc) : null), onErr));
      const y = dayKey(Date.now() - 86400000);
      getDoc(doc(db, COL_DAILY, y)).then(s => setYesterday(s.exists() ? (s.data() as DailyDoc) : null)).catch(onErr);
    } catch (e: any) { setErr(e?.message || 'Firestore tidak tersedia'); }
    return () => un.forEach(u => u());
  }, [todayKey]);

  // data jendela grafik
  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true); setErr('');
      try {
        const db = getFirestore();
        const from = gran === 'day' ? `${ym}-01` : gran === 'month' ? `${yr}-01-01` : '0000-01-01';
        const to = gran === 'day' ? `${ym}-31` : gran === 'month' ? `${yr}-12-31` : '9999-12-31';
        const snap = await getDocs(query(collection(db, COL_DAILY), where('day', '>=', from), where('day', '<=', to), orderBy('day')));
        if (!dead) setDocs(snap.docs.map(d => ({ ...(d.data() as DailyDoc), day: d.id })));
      } catch (e: any) {
        if (!dead) { if (e?.code === 'permission-denied') setDenied(true); else setErr(e?.message || 'Gagal memuat'); setDocs([]); }
      } finally { if (!dead) setLoading(false); }
    })();
    return () => { dead = true; };
  }, [gran, ym, yr, tick]);

  // ember grafik
  const buckets: Bucket[] = useMemo(() => {
    const mk = (key: string, label: string, long: string, ds: DailyDoc[]): Bucket => ({ key, label, long, docs: ds, views: sumNum(ds, 'views'), visitors: sumNum(ds, 'visitors'), sessions: sumNum(ds, 'sessions'), newVisitors: sumNum(ds, 'newVisitors') });
    if (gran === 'day') {
      const [Y, M] = ym.split('-').map(Number);
      return Array.from({ length: dim(Y, M) }, (_, i) => {
        const k = `${ym}-${pad(i + 1)}`; const wd = new Date(Y, M - 1, i + 1).getDay();
        return mk(k, String(i + 1), `${DAYS_S[wd]}, ${i + 1} ${MON_S[M - 1]} ${Y}`, docs.filter(d => d.day === k));
      });
    }
    if (gran === 'month') return Array.from({ length: 12 }, (_, i) => { const k = `${yr}-${pad(i + 1)}`; return mk(k, MON_S[i], `${MONTHS[i]} ${yr}`, docs.filter(d => d.day.startsWith(k))); });
    const years = docs.map(d => Number(d.day.slice(0, 4))).filter(Boolean);
    const lo = years.length ? Math.min(...years) : Number(todayKey.slice(0, 4));
    const hi = Number(todayKey.slice(0, 4));
    return Array.from({ length: hi - lo + 1 }, (_, i) => { const k = String(lo + i); return mk(k, k, `Tahun ${k}`, docs.filter(d => d.day.startsWith(k))); });
  }, [docs, gran, ym, yr, todayKey]);

  // pilih ember bawaan: hari ini / terakhir yang ada data
  useEffect(() => {
    let idx = buckets.findIndex(b => b.key === todayKey || (gran === 'month' && b.key === todayKey.slice(0, 7)) || (gran === 'year' && b.key === todayKey.slice(0, 4)));
    if (idx < 0) { for (let i = buckets.length - 1; i >= 0; i--) if (buckets[i].views > 0) { idx = i; break; } }
    setSel(idx < 0 ? buckets.length - 1 : idx);
  }, [gran, ym, yr, buckets.length, loading]); // eslint-disable-line

  const winDocs = docs;
  const wViews = sumNum(winDocs, 'views'), wVisitors = sumNum(winDocs, 'visitors'), wSessions = sumNum(winDocs, 'sessions');
  const activeBuckets = buckets.filter(b => b.key <= todayKey.slice(0, b.key.length) );
  const avg = activeBuckets.length ? wViews / activeBuckets.length : 0;
  const peak = buckets.reduce((a, b) => (b.views > (a?.views || 0) ? b : a), null as Bucket | null);
  const selB = buckets[sel];

  const periodLabel = gran === 'day' ? `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}` : gran === 'month' ? yr : 'Semua tahun';
  const atEnd = gran === 'day' ? ym >= todayKey.slice(0, 7) : gran === 'month' ? yr >= todayKey.slice(0, 4) : true;
  const shift = (dir: -1 | 1) => {
    if (gran === 'year') return;
    if (dir === 1 && atEnd) return;
    if (gran === 'day') { const [Y, M] = ym.split('-').map(Number); const d = new Date(Y, M - 1 + dir, 1); setYm(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); }
    else setYr(String(Number(yr) + dir));
  };

  const byArt = useMemo(() => sorted(sumMap(winDocs, 'byArticle')), [winDocs]);
  const artMap = useMemo(() => new Map(articles.map(a => [a.id, a])), [articles]);
  const topList = topMode === 'window'
    ? byArt.slice(0, 10).map(([id, v]) => ({ id, title: artMap.get(id)?.title || '(artikel sudah dihapus)', img: artMap.get(id)?.imageUrl, cat: artMap.get(id)?.category, value: v }))
    : [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).map(a => ({ id: a.id, title: a.title, img: a.imageUrl, cat: a.category, value: a.views || 0 }));
  const topMax = Math.max(1, ...topList.map(t => t.value));

  const refType = sorted(sumMap(winDocs, 'byRefType')).map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value }));
  const refHost = sorted(sumMap(winDocs, 'byRef')).map(([label, value]) => ({ label, value }));
  const devs = sorted(sumMap(winDocs, 'byDev')).map(([k, value]) => ({ label: devLabel(k), value }));
  const brs = sorted(sumMap(winDocs, 'byBr')).map(([label, value]) => ({ label, value }));
  const ccs = sorted(sumMap(winDocs, 'byCC')).map(([k, value]) => ({ label: CC_NAME[k] || k, value }));
  const kinds = sorted(sumMap(winDocs, 'byKind')).map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value }));
  const cats = sorted(sumMap(winDocs, 'byCat')).map(([label, value]) => ({ label, value }));
  const hours = sumMap(winDocs, 'byHour');
  const hMax = Math.max(1, ...Array.from({ length: 24 }, (_, h) => hours[String(h)] || 0));
  const bestHour = Array.from({ length: 24 }, (_, h) => [h, hours[String(h)] || 0] as const).sort((a, b) => b[1] - a[1])[0];

  // sesi pengunjung
  const sessions: Sess[] = useMemo(() => {
    const m = new Map<string, VisitDoc[]>();
    visits.forEach(v => { m.set(v.sid, [...(m.get(v.sid) || []), v]); });
    return [...m.entries()].map(([sid, vs]) => {
      const o = [...vs].sort((a, b) => a.t - b.t);
      return { sid, visits: vs, first: o[0], last: o[o.length - 1] };
    }).sort((a, b) => b.last.t - a.last.t);
  }, [visits]);
  const activeNow = new Set(visits.filter(v => now - v.t < 5 * 60 * 1000).map(v => v.vid)).size;

  // pantauan konten
  const nowMs = now;
  const sumViewsAll = articles.reduce((a, x) => a + (x.views || 0), 0);
  const new7 = articles.filter(a => nowMs - new Date(a.publishedAt).getTime() < 7 * 86400000).length;
  const catMap: Record<string, number> = {};
  articles.forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + 1; });
  const catCount = sorted(catMap).map(([label, value]) => ({ label, value }));
  const quiet = [...articles].filter(a => nowMs - new Date(a.publishedAt).getTime() > 3 * 86400000).sort((a, b) => (a.views || 0) - (b.views || 0)).slice(0, 5);

  const trend = (a: number, b: number) => (b > 0 ? `${a >= b ? '▲' : '▼'} ${Math.abs(Math.round(((a - b) / b) * 100))}% vs kemarin` : '');
  const tabBtn = (active: boolean): React.CSSProperties => ({ ...f, flex: 1, padding: '8px 0', border: 'none', borderRadius: '9px', background: active ? '#111' : 'transparent', color: active ? '#fff' : '#777', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' });
  const arrow = (dis: boolean): React.CSSProperties => ({ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e5e5e8', background: '#fff', color: dis ? '#ccc' : '#111', fontSize: '16px', cursor: dis ? 'default' : 'pointer' });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={cap}>Statistik · WIB</span>
        <button type="button" onClick={() => setTick(t => t + 1)} style={{ ...f, padding: '6px 12px', border: '1px solid #e5e5e8', borderRadius: '9px', background: '#fff', fontSize: '11px', fontWeight: 700, color: '#555', cursor: 'pointer' }}>↻ Muat ulang</button>
      </div>

      {denied && (
        <div style={{ ...card, borderColor: '#f3d9a4', background: '#fffaf0' }}>
          <div style={{ ...f, fontSize: '13px', fontWeight: 700, color: '#8a5a00', marginBottom: '6px' }}>Firestore belum mengizinkan statistik</div>
          <div style={{ ...f, fontSize: '11.5px', color: '#7a6a3a', lineHeight: 1.6, marginBottom: '8px' }}>Buka Firebase Console, lalu Firestore Database, lalu tab Rules. Tempel aturan di bawah ini di dalam blok <b>match /databases/{'{database}'}/documents</b>, klik Publish, lalu muat ulang halaman ini. Pelacak di situs utama baru bisa menulis setelah itu.</div>
          <pre style={{ ...mono, fontSize: '10px', background: '#fff', border: '1px solid #f0e3c3', borderRadius: '10px', padding: '10px', overflowX: 'auto', margin: '0 0 8px', color: '#333' }}>{RULES_TEXT}</pre>
          <button type="button" onClick={() => { try { navigator.clipboard.writeText(RULES_TEXT); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* abaikan */ } }} style={{ ...f, padding: '9px 14px', border: 'none', borderRadius: '10px', background: '#111', color: '#fff', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>{copied ? '✓ Tersalin' : 'Salin aturan'}</button>
        </div>
      )}
      {err && !denied && <div style={{ ...card, ...f, fontSize: '12px', color: '#b00020' }}>Gagal memuat: {err}</div>}

      {/* HARI INI */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2a9d5c', animation: 'tn-live 1.6s ease-in-out infinite' }} />
          <span style={cap}>Hari ini · langsung</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Kpi dark label="Aktif sekarang" value={fmtN(activeNow)} sub="5 menit terakhir" />
          <Kpi label="Tayangan" value={fmtN(today?.views || 0)} sub={trend(today?.views || 0, yesterday?.views || 0)} />
          <Kpi label="Pengunjung" value={fmtN(today?.visitors || 0)} sub={trend(today?.visitors || 0, yesterday?.visitors || 0)} />
        </div>
      </div>

      {/* TOTAL */}
      <div style={card}>
        <div style={{ ...cap, marginBottom: '10px' }}>Total sepanjang masa</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Kpi label="Total tayangan" value={fmtN(totals?.views || 0)} sub="sejak pelacak aktif" />
          <Kpi label="Pengunjung unik" value={fmtN(totals?.visitorsEver || 0)} sub="perangkat berbeda" />
          <Kpi label="Total sesi" value={fmtN(totals?.sessions || 0)} />
        </div>
        <div style={{ ...f, fontSize: '11px', color: '#888', marginTop: '10px', lineHeight: 1.5 }}>Total dibaca dari counter semua artikel (termasuk sebelum pelacak ini ada): <b style={{ color: '#111' }}>{fmtN(sumViewsAll)}</b> di {articles.length} artikel.</div>
      </div>

      {/* GRAFIK */}
      <div style={card}>
        <div style={{ display: 'flex', background: '#f3f3f5', borderRadius: '11px', padding: '3px', gap: '2px', marginBottom: '12px' }}>
          <button type="button" onClick={() => setGran('day')} style={tabBtn(gran === 'day')}>Harian</button>
          <button type="button" onClick={() => setGran('month')} style={tabBtn(gran === 'month')}>Bulanan</button>
          <button type="button" onClick={() => setGran('year')} style={tabBtn(gran === 'year')}>Tahunan</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <button type="button" aria-label="Sebelumnya" disabled={gran === 'year'} onClick={() => shift(-1)} style={arrow(gran === 'year')}>‹</button>
          <span style={{ ...f, fontSize: '14px', fontWeight: 800, color: '#111' }}>{periodLabel}</span>
          <button type="button" aria-label="Berikutnya" disabled={atEnd} onClick={() => shift(1)} style={arrow(atEnd)}>›</button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <Kpi label="Tayangan" value={fmtN(wViews)} />
          <Kpi label="Pengunjung" value={fmtN(wVisitors)} sub="unik per hari, dijumlah" />
          <Kpi label={gran === 'day' ? 'Rata-rata/hari' : gran === 'month' ? 'Rata-rata/bulan' : 'Rata-rata/tahun'} value={fmtN(avg)} sub={peak && peak.views > 0 ? `puncak ${peak.long.replace(/^\w+, /, '')}: ${fmtN(peak.views)}` : ''} />
        </div>
        {loading ? <div style={{ ...f, fontSize: '12px', color: '#aaa', textAlign: 'center', padding: '60px 0' }}>Memuat…</div>
          : <StatsChart buckets={buckets} sel={sel} onSel={setSel} onSwipe={shift} />}
        {!loading && wViews === 0 && <div style={{ ...f, fontSize: '11.5px', color: '#aaa', textAlign: 'center', paddingTop: '8px' }}>Belum ada data di periode ini. Data mulai terkumpul sejak pelacak di situs utama aktif.</div>}

        {selB && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e8e8ea' }}>
            <div style={{ ...f, fontSize: '13px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>{selB.long}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <Kpi label="Tayangan" value={fmtN(selB.views)} />
              <Kpi label="Pengunjung" value={fmtN(selB.visitors)} />
              <Kpi label="Sesi" value={fmtN(selB.sessions)} />
              <Kpi label="Baru" value={fmtN(selB.newVisitors)} sub="pengunjung baru" />
            </div>
            {(() => {
              const t = sorted(sumMap(selB.docs, 'byArticle')).slice(0, 3);
              return t.length ? (
                <div>
                  <div style={{ ...cap, marginBottom: '6px' }}>Paling banyak dibaca di sini</div>
                  {t.map(([id, v]) => <div key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', ...f, fontSize: '11.5px', color: '#333', padding: '3px 0' }}><span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artMap.get(id)?.title || id}</span><b>{fmtN(v)}</b></div>)}
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* ARTIKEL TERBANYAK */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
          <span style={cap}>Artikel terbanyak dibaca</span>
          <div style={{ display: 'flex', background: '#f3f3f5', borderRadius: '9px', padding: '2px' }}>
            <button type="button" onClick={() => setTopMode('window')} style={{ ...tabBtn(topMode === 'window'), flex: 'none', padding: '5px 10px', fontSize: '10.5px' }}>{gran === 'day' ? 'Bulan ini' : gran === 'month' ? 'Tahun ini' : 'Semua'}</button>
            <button type="button" onClick={() => setTopMode('all')} style={{ ...tabBtn(topMode === 'all'), flex: 'none', padding: '5px 10px', fontSize: '10.5px' }}>Sepanjang masa</button>
          </div>
        </div>
        {topList.length === 0 || topList.every(t => t.value === 0) ? <div style={{ ...f, fontSize: '11.5px', color: '#bbb', padding: '8px 0' }}>Belum ada data.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topList.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ ...mono, fontSize: '10px', color: '#bbb', width: '16px', flexShrink: 0 }}>{i + 1}</span>
                {t.img ? <img src={t.img} alt="" referrerPolicy="no-referrer" style={{ width: '44px', height: '34px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} /> : <span style={{ width: '44px', height: '34px', borderRadius: '6px', background: '#f1f1f3', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...f, fontSize: '11.5px', fontWeight: 600, color: '#111', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.title}</div>
                  <div style={{ height: '4px', background: '#f1f1f3', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' }}><div style={{ width: `${(t.value / topMax) * 100}%`, height: '100%', background: '#111' }} /></div>
                </div>
                <span style={{ ...f, fontSize: '12px', fontWeight: 800, color: '#111', flexShrink: 0 }}>{fmtN(t.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RINCIAN */}
      <div style={{ ...cap, margin: '14px 2px 8px' }}>Rincian · {periodLabel}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginBottom: '10px' }}>
        <BarList title="Sumber trafik (per sesi)" items={refType} />
        <BarList title="Situs perujuk" items={refHost} empty="Belum ada perujuk" />
        <BarList title="Perangkat" items={devs} />
        <BarList title="Browser" items={brs} />
        <BarList title="Negara (perkiraan zona waktu)" items={ccs} />
        <BarList title="Jenis halaman" items={kinds} />
        <BarList title="Kategori dibaca" items={cats} empty="Belum ada data kategori" />
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={{ ...cap, marginBottom: '10px' }}>Jam tersibuk (WIB)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '70px' }}>
            {Array.from({ length: 24 }, (_, h) => { const v = hours[String(h)] || 0; return <div key={h} title={`${pad(h)}:00 · ${v}`} style={{ flex: 1, height: `${Math.max(3, (v / hMax) * 100)}%`, background: v === bestHour[1] && v > 0 ? '#111' : '#d4d4d8', borderRadius: '2px' }} />; })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: '8.5px', color: '#aaa', marginTop: '4px' }}><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
          {bestHour[1] > 0 && <div style={{ ...f, fontSize: '11px', color: '#666', marginTop: '8px' }}>Puncak sekitar jam <b style={{ color: '#111' }}>{pad(bestHour[0])}:00</b></div>}
        </div>
      </div>

      {/* PENGUNJUNG MASUK */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={cap}>Pengunjung masuk · langsung</span>
          <span style={{ ...f, fontSize: '10.5px', color: '#aaa' }}>{sessions.length} sesi terakhir</span>
        </div>
        {sessions.length === 0 ? <div style={{ ...f, fontSize: '11.5px', color: '#bbb', padding: '10px 0' }}>Belum ada kunjungan tercatat. Buka situs dari HP lain atau tab penyamaran, lalu lihat di sini (kunjungan dari perangkat admin tidak dihitung).</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.slice(0, 30).map(s => <SessionCard key={s.sid} s={s} now={now} />)}
          </div>
        )}
      </div>

      {/* PANTAUAN KONTEN */}
      <div style={card}>
        <div style={{ ...cap, marginBottom: '10px' }}>Pantauan konten</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Kpi label="Total artikel" value={fmtN(articles.length)} />
          <Kpi label="Terbit 7 hari" value={fmtN(new7)} />
          <Kpi label="Rata-rata dibaca" value={fmtN(articles.length ? sumViewsAll / articles.length : 0)} sub="per artikel" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          <BarList title="Artikel per kategori" items={catCount} limit={8} />
          <div style={{ ...card, marginBottom: 0 }}>
            <div style={{ ...cap, marginBottom: '10px' }}>Perlu perhatian · sepi pembaca</div>
            {quiet.length === 0 && <div style={{ ...f, fontSize: '11px', color: '#bbb' }}>Belum ada.</div>}
            {quiet.map(a => <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', ...f, fontSize: '11.5px', color: '#333', padding: '4px 0', borderTop: '1px dashed #eee' }}><span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span><b style={{ color: '#b00020', flexShrink: 0 }}>{fmtN(a.views || 0)}</b></div>)}
          </div>
        </div>
      </div>

      <div style={{ ...f, fontSize: '10.5px', color: '#aaa', lineHeight: 1.6, padding: '4px 4px 20px' }}>
        Data dicatat tanpa IP dan tanpa data pribadi; pengunjung dikenali dari id acak di browsernya. Negara adalah perkiraan dari zona waktu perangkat, bukan lokasi pasti. Kunjungan dari perangkat admin dan bot tidak dihitung.
      </div>
      <style>{`@keyframes tn-live{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
    </div>
  );
};

export default AdminAnalytics;
