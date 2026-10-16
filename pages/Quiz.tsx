import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getCountry } from '../countries';
import WorldMap from '../components/WorldMap';
import { CHALLENGES, ROUNDS, Question, build } from '../quizData';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const gridBg: React.CSSProperties = {
  background: '#f5f5f7',
  backgroundImage: 'linear-gradient(rgba(0,0,0,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.07) 1px,transparent 1px)',
  backgroundSize: '40px 40px',
};

// /quiz = daftar tantangan, /quiz/:kind = halaman tantangan itu sendiri
const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { kind } = useParams<{ kind?: string }>();
  const challenge = CHALLENGES.find(c => c.kind === kind);

  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const restart = () => {
    if (!challenge) return;
    setQs(build(challenge.kind)); setIdx(0); setPicked(null); setScore(0);
  };
  useEffect(() => { window.scrollTo(0, 0); restart(); /* eslint-disable-next-line */ }, [kind]);

  if (kind && !challenge) return <Navigate to="/quiz" replace />;

  const q = qs[idx];
  const done = !!challenge && qs.length > 0 && idx >= qs.length;

  const answer = (opt: string) => {
    if (picked || !q) return;
    setPicked(opt);
    if (opt === q.answer) setScore(s => s + 1);
  };

  const optStyle = (opt: string): React.CSSProperties => {
    const base: React.CSSProperties = { ...m, width: '100%', textAlign: 'left', padding: '13px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: '#080808', border: '1px solid #1e1e1e', color: '#fff', cursor: picked ? 'default' : 'pointer', transition: 'border-color 0.2s, background 0.2s' };
    if (!picked || !q) return base;
    if (opt === q.answer) return { ...base, borderColor: '#3dff8b', background: 'rgba(61,255,139,0.08)', color: '#3dff8b' };
    if (opt === picked) return { ...base, borderColor: '#ff5252', background: 'rgba(255,82,82,0.08)', color: '#ff5252' };
    return { ...base, color: '#666' };
  };

  const btnLight: React.CSSProperties = { ...mono, background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '11px', letterSpacing: '0.12em', cursor: 'pointer' };
  const btnDark: React.CSSProperties = { ...mono, background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 16px', fontSize: '11px', letterSpacing: '0.12em', cursor: 'pointer' };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div style={{ background: '#000', minHeight: '100vh' }}>

        {/* HERO */}
        <div className="qz-hero-bg" style={{ ...gridBg, padding: '100px 0 22px' }}>
          <div className="qz-container" style={{ padding: '0 20px' }}>
            <button
              type="button"
              onClick={() => navigate(challenge ? '/quiz' : '/')}
              style={{ ...mono, background: 'none', border: 'none', padding: '4px 0', marginBottom: '14px', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', cursor: 'pointer' }}
            >
              ← {challenge ? 'World Quiz' : 'Beranda'}
            </button>
            <p style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c853', animation: 'tn-pulse 2s ease-in-out infinite' }} />
              {challenge ? `Tantangan · ${ROUNDS} soal` : 'Tantangan edukasi interaktif'}
            </p>
            <h1 className="qz-hero-title" style={{ ...m, fontSize: 'clamp(30px,9vw,56px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.01em', color: '#000', margin: 0, textTransform: 'uppercase' }}>
              {challenge ? challenge.title : <>WORLD<br />QUIZ</>}
            </h1>
            {challenge && <p style={{ ...m, fontSize: '13px', color: '#555', lineHeight: 1.6, margin: '10px 0 0' }}>{challenge.desc}</p>}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ background: '#f5f5f7', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '65px' }}>
            <path d="M0,140 L0,35 L700,35 Q780,35 820,8 Q850,0 1440,0 L1440,140 Z" fill="#000" />
          </svg>
        </div>

        <div style={{ background: '#000', padding: '0 20px 80px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
          <div className="qz-container">

            {/* DAFTAR TANTANGAN */}
            {!challenge && (
              <>
                <span className="qz-sec" style={{ ...m, display: 'block', fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', marginBottom: '14px' }}>Pilih Tantangan</span>
                <div className="qz-list" style={{ display: 'grid', gap: '10px' }}>
                  {CHALLENGES.map(c => (
                    <button
                      key={c.kind}
                      type="button"
                      onClick={() => navigate(`/quiz/${c.kind}`)}
                      style={{ textAlign: 'left', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 16px', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', gap: '16px' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
                    >
                      <span style={{ ...mono, fontSize: '28px', color: '#3dff8b', width: '36px', textAlign: 'center', flexShrink: 0 }}>{c.icon}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ ...m, display: 'block', fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{c.title}</span>
                        <span style={{ ...m, display: 'block', fontSize: '12px', color: '#aaa', lineHeight: 1.5 }}>{c.desc}</span>
                      </span>
                      <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.12em', flexShrink: 0 }}>MAIN →</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* SOAL */}
            {challenge && !done && q && (
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ ...mono, fontSize: '11px', letterSpacing: '0.12em', color: '#aaa' }}>SOAL {idx + 1}/{qs.length}</span>
                  <span style={{ ...mono, fontSize: '11px', letterSpacing: '0.12em', color: '#3dff8b' }}>SKOR {score}</span>
                </div>
                <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '18px', overflow: 'hidden' }}>
                  <div style={{ width: `${(idx / qs.length) * 100}%`, height: '100%', background: '#3dff8b', transition: 'width 0.3s' }} />
                </div>
                {q.kind === 'map' && (
                  <div style={{ ...gridBg, borderRadius: '10px', padding: '6px 4px', marginBottom: '16px' }}>
                    <WorldMap counts={{}} activeCode={q.code} hideLabels />
                  </div>
                )}
                <p style={{ ...m, fontSize: '17px', fontWeight: 700, lineHeight: 1.4, color: '#fff', margin: '0 0 16px' }}>{q.prompt}</p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {q.options.map(o => (
                    <button key={o} type="button" disabled={!!picked} onClick={() => answer(o)} style={optStyle(o)}>{o}</button>
                  ))}
                </div>
                {picked && (
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ ...m, fontSize: '12px', color: picked === q.answer ? '#3dff8b' : '#ff5252', lineHeight: 1.5 }}>
                      {picked === q.answer ? 'Benar!' : `Kurang tepat. Jawabannya ${q.answer}.`}
                      {q.kind === 'map' && ` (${getCountry(q.code)?.name})`}
                    </span>
                    <button type="button" onClick={() => { setPicked(null); setIdx(i => i + 1); }} style={{ ...btnLight, flexShrink: 0 }}>
                      {idx + 1 === qs.length ? 'HASIL →' : 'LANJUT →'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* HASIL */}
            {challenge && done && (
              <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
                <span style={{ ...mono, display: 'block', fontSize: '64px', color: '#3dff8b', lineHeight: 1 }}>{score}/{qs.length}</span>
                <p style={{ ...m, fontSize: '14px', color: '#aaa', margin: '12px 0 22px' }}>
                  {score === qs.length ? 'Sempurna! Kamu jago banget.' : score >= 3 ? 'Mantap, tinggal sedikit lagi.' : 'Coba lagi, pasti naik skornya.'}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" onClick={restart} style={btnLight}>ULANGI</button>
                  <button type="button" onClick={() => navigate('/quiz')} style={btnDark}>TANTANGAN LAIN</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes tn-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .qz-container { max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        @media (min-width: 640px) { .qz-container { max-width: 100%; } }
        @media (min-width: 900px) { .qz-list { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) {
          .qz-hero-bg { padding-top: 130px !important; }
          .qz-hero-title { font-size: 72px !important; }
          .qz-sec { font-size: 20px !important; }
        }
      `}</style>
    </>
  );
};

export default Quiz;
