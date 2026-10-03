import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle, Category } from '../types';

interface InstagramProps {
  articles: NewsArticle[];
}

/* Link Falmove */
const FALMOVE_URL = 'https://falmove.teliernews.com/';

/* Label tampilan tiap kategori (nilai aslinya tetap dari enum Category di types.tsx) */
const CATEGORY_LABEL: Record<string, string> = {
  [Category.TECH]: 'Teknologi',
  [Category.AI]: 'AI',
  [Category.MARKETS]: 'Pasar',
  [Category.BUSINESS]: 'Bisnis',
  [Category.POLITICS]: 'Politik',
  [Category.GEOPOLITICS]: 'Geopolitik',
  [Category.SCIENCE]: 'Sains',
  [Category.WEALTH]: 'Kekayaan',
  [Category.SPORTS]: 'Olahraga',
  [Category.LIFESTYLE]: 'Gaya Hidup',
  [Category.ECONOMY]: 'Ekonomi',
};
const catLabel = (c: string): string => CATEGORY_LABEL[c] ?? c;

const KEYFRAMES = `
@keyframes twinkle1 { 0%,100%{opacity:0.1;}  50%{opacity:0.8;} }
@keyframes twinkle2 { 0%,100%{opacity:0.2;}  50%{opacity:1.0;} }
@keyframes twinkle3 { 0%,100%{opacity:0.05;} 50%{opacity:0.6;} }

/* Meteor: kepala di kiri-bawah, ekor di kanan-atas, melesat dari kanan atas ke kiri bawah.
   Pelan + ada jeda sebelum siklus berikutnya. */
@keyframes meteor {
  0%   { transform: translate(0,0) rotate(-16deg); opacity: 0; }
  8%   { opacity: 1; }
  55%  { opacity: 1; }
  66%  { transform: translate(var(--dx), var(--dy)) rotate(-16deg); opacity: 0; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(-16deg); opacity: 0; }
}

@keyframes tnShine { 0%,60% { left:-60%; } 100% { left:130%; } }

.tn-cats { scrollbar-width: none; }
.tn-cats::-webkit-scrollbar { display: none; }
.tn-card { transition: opacity .15s; }
.tn-card:active { opacity: .75; }

.tn-pill {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 8px 6px 6px; border-radius: 999px;
  background: #0d0d0d; border: 1px solid #2b2b2b;
  color: #fff; text-decoration: none;
  transition: border-color .2s, transform .15s;
}
.tn-pill:active { transform: scale(.97); border-color: #555; }
.tn-pill::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.12), transparent);
  animation: tnShine 5s ease-in-out infinite; pointer-events: none;
}
.tn-pill-ic { width: 32px; height: 32px; border-radius: 50%; background: #fff; display: grid; place-items: center; flex: none; }
.tn-pill-tx { display: flex; flex-direction: column; line-height: 1.2; }
.tn-pill-tx b { font-size: 14px; font-weight: 700; }
.tn-pill-tx span { font-size: 12px; color: #8f8f8f; }
.tn-pill-free { font-size: 11px; font-weight: 800; letter-spacing: .08em; color: #000; background: #fff; padding: 6px 10px; border-radius: 999px; }
`;

const STARS = [
  { top:'12%', left:'8%',  s:2,   a:'twinkle2', d:'3.1s', dl:'0s'   },
  { top:'30%', left:'20%', s:1.5, a:'twinkle1', d:'4.5s', dl:'0.6s' },
  { top:'55%', left:'15%', s:2.5, a:'twinkle3', d:'2.8s', dl:'1.1s' },
  { top:'70%', left:'35%', s:1.5, a:'twinkle2', d:'5.0s', dl:'0.3s' },
  { top:'20%', left:'50%', s:2,   a:'twinkle1', d:'3.7s', dl:'1.8s' },
  { top:'75%', left:'55%', s:1.5, a:'twinkle3', d:'4.2s', dl:'0.8s' },
  { top:'40%', left:'72%', s:2,   a:'twinkle2', d:'3.3s', dl:'2.0s' },
  { top:'15%', left:'88%', s:2.5, a:'twinkle1', d:'5.5s', dl:'0.4s' },
  { top:'60%', left:'80%', s:1.5, a:'twinkle3', d:'2.6s', dl:'1.5s' },
  { top:'85%', left:'92%', s:2,   a:'twinkle2', d:'4.8s', dl:'0.9s' },
];

/* Meteor start dari kanan atas, bergantian, tiap siklus ~6-7 detik */
const METEORS = [
  { top:'5%',  left:'96%', dur:'6.5s', delay:'0s',   tail:90,  dx:'-420px', dy:'120px' },
  { top:'8%',  left:'86%', dur:'7s',   delay:'1.8s', tail:70,  dx:'-380px', dy:'110px' },
  { top:'3%',  left:'78%', dur:'6s',   delay:'3.6s', tail:100, dx:'-440px', dy:'100px' },
  { top:'10%', left:'92%', dur:'7.5s', delay:'5.2s', tail:80,  dx:'-360px', dy:'130px' },
];

const getCat = (a: NewsArticle): string => a.category;
const getDate = (a: NewsArticle): string | null => a.publishedAt ?? null;

const timeAgo = (d: string | null): string => {
  if (!d) return '';
  const t = new Date(d).getTime();
  if (isNaN(t)) return '';
  const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd} hari lalu`;
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Instagram: React.FC<InstagramProps> = ({ articles }) => {
  const [cat, setCat] = useState('Semua');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* Tab kategori hanya yang punya artikel, urutan sesuai enum */
  const tabs = useMemo(
    () => ['Semua', ...Object.values(Category).filter(c => articles.some(a => a.category === c))],
    [articles]
  );

  const list = useMemo(
    () => articles.filter(a => cat === 'Semua' || a.category === cat),
    [articles, cat]
  );
  const hero = list[0];
  const rest = list.slice(1);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Montserrat', sans-serif",
      colorScheme: 'dark',
      color: '#fff',
    }}>
      <style>{KEYFRAMES}</style>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* ── HEADER: logo + bintang + meteor ── */}
      <div style={{
        position: 'relative',
        padding: '28px 20px 20px',
        textAlign: 'center',
        background: '#000',
        overflow: 'hidden',
      }}>
        {STARS.map((s, i) => (
          <span key={`star${i}`} style={{
            position: 'absolute',
            top: s.top, left: s.left,
            width: s.s, height: s.s,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: `0 0 ${s.s + 1}px ${s.s}px rgba(255,255,255,0.5)`,
            animation: `${s.a} ${s.d} ease-in-out ${s.dl} infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {METEORS.map((m, i) => (
          <div key={`met${i}`} style={{
            position: 'absolute',
            top: m.top, left: m.left,
            display: 'flex',
            alignItems: 'center',
            ['--dx' as any]: m.dx,
            ['--dy' as any]: m.dy,
            animation: `meteor ${m.dur} linear ${m.delay} infinite`,
            opacity: 0,
            pointerEvents: 'none',
          } as React.CSSProperties}>
            {/* kepala di kiri */}
            <span style={{
              width: 3, height: 3, borderRadius: '50%', background: '#fff',
              boxShadow: '0 0 5px 2px rgba(255,255,255,0.8)', flexShrink: 0,
            }} />
            {/* ekor di kanan */}
            <span style={{
              display: 'inline-block', width: m.tail, height: 1.5, marginLeft: 1,
              background: 'linear-gradient(to right, rgba(255,255,255,0.8), transparent)',
              borderRadius: 999,
            }} />
          </div>
        ))}

        <img
          src="/IMG_20260220_144200.png"
          alt="TelierNews"
          style={{
            height: 40, objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
            display: 'block', margin: '0 auto',
            position: 'relative', zIndex: 1,
          }}
        />
        <p style={{
          color: '#aaa', fontSize: 12,
          letterSpacing: '0.18em', textTransform: 'lowercase',
          margin: '8px 0 0', position: 'relative', zIndex: 1,
        }}>
          teliernews.com
        </p>
      </div>

      {/* ── PIL FALMOVE ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 14px 16px' }}>
        <a href={FALMOVE_URL} target="_blank" rel="noopener noreferrer" className="tn-pill">
          <span className="tn-pill-ic">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
            </svg>
          </span>
          <span className="tn-pill-tx">
            <b>Falmove</b>
            <span>Kompres gambar</span>
          </span>
          <span className="tn-pill-free">GRATIS</span>
        </a>
      </div>

      {/* ── KATEGORI (nempel di atas saat scroll) ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid #1a1a1a',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div className="tn-cats" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px' }}>
          {tabs.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              whiteSpace: 'nowrap',
              border: `1px solid ${c === cat ? '#fff' : '#2a2a2a'}`,
              background: c === cat ? '#fff' : '#0f0f0f',
              color: c === cat ? '#000' : '#b5b5b5',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
              padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
            }}>
              {c === 'Semua' ? 'Semua' : catLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 620, margin: '0 auto', padding: '16px 14px 8px' }}>
        {/* ── BERITA UTAMA: satu-satunya kartu 16:9 ── */}
        {hero && (
          <Link to={`/news/${hero.id}`} className="tn-card" style={{
            display: 'block', position: 'relative',
            aspectRatio: '16/9', borderRadius: 22, overflow: 'hidden',
            background: '#111', textDecoration: 'none', color: '#fff',
          }}>
            <img src={hero.imageUrl} alt={hero.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.15) 65%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 18,
            }}>
              {getCat(hero) && (
                <span style={{
                  alignSelf: 'flex-start', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                  background: 'rgba(255,255,255,0.16)', padding: '5px 12px', borderRadius: 999, marginBottom: 10,
                }}>{catLabel(getCat(hero))}</span>
              )}
              <h2 style={{
                margin: 0, fontSize: 20, lineHeight: 1.3, fontWeight: 800,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{hero.title}</h2>
              {timeAgo(getDate(hero)) && (
                <div style={{ fontSize: 13, color: '#b0b0b0', marginTop: 8 }}>{timeAgo(getDate(hero))}</div>
              )}
            </div>
          </Link>
        )}

        {/* ── JUDUL SEKSI ── */}
        {list.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '30px 2px 14px' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{cat === 'Semua' ? 'Terbaru' : catLabel(cat)}</h3>
            <span style={{ fontSize: 13, color: '#777' }}>{list.length} berita</span>
          </div>
        )}

        {/* ── GRID 2 KOLOM, thumbnail 3:4 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 12px' }}>
          {rest.map((a, i) => (
            <Link key={a.id} to={`/news/${a.id}`} className="tn-card" style={{
              display: 'block', textDecoration: 'none', color: '#fff',
              marginTop: i % 2 === 1 ? 22 : 0,
            }}>
              <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 18, overflow: 'hidden', background: '#111' }}>
                <img src={a.imageUrl} alt={a.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {getCat(a) && (
                  <span style={{
                    position: 'absolute', left: 10, top: 10, fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.06em', background: 'rgba(0,0,0,0.55)', padding: '5px 10px', borderRadius: 999,
                  }}>{catLabel(getCat(a))}</span>
                )}
              </div>
              <h4 style={{
                margin: '11px 0 0', fontSize: 15, lineHeight: 1.4, fontWeight: 700,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{a.title}</h4>
              {timeAgo(getDate(a)) && (
                <div style={{ fontSize: 12, color: '#8f8f8f', marginTop: 7 }}>{timeAgo(getDate(a))}</div>
              )}
            </Link>
          ))}
        </div>

        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#555' }}>
            <p style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
              {articles.length === 0 ? 'Belum ada artikel' : 'Belum ada berita di kategori ini'}
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', color: '#555', fontSize: 12, padding: '30px 0', letterSpacing: '0.08em' }}>
          © TELIERNEWS.COM
        </div>
      </main>
    </div>
  );
};

export default Instagram;
