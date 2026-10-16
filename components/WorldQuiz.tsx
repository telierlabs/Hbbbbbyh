import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CHALLENGES, ROUNDS } from '../quizData';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Kartu teaser di Home. Tiap tantangan punya halaman sendiri: /quiz/:kind
const WorldQuiz: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '18px 20px 20px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3dff8b', animation: 'tn-pulse 2s ease-in-out infinite' }} />
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.25em', color: '#888' }}>WORLD QUIZ</span>
        </div>
        <button type="button" onClick={() => navigate('/quiz')} style={{ ...mono, background: 'none', border: 'none', padding: '4px 0', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', cursor: 'pointer' }}>
          Lihat semua →
        </button>
      </div>
      <h2 style={{ ...m, fontSize: 'clamp(20px,6vw,28px)', fontWeight: 700, lineHeight: 1.15, textTransform: 'uppercase', color: '#fff', margin: '0 0 6px' }}>Seberapa kenal dunia?</h2>
      <p style={{ ...m, fontSize: '12px', color: '#aaa', lineHeight: 1.6, margin: '0 0 14px' }}>Pilih tantangan, jawab {ROUNDS} soal, kumpulkan skormu.</p>
      <div className="wq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {CHALLENGES.map(c => (
          <button
            key={c.kind}
            type="button"
            onClick={() => navigate(`/quiz/${c.kind}`)}
            style={{ textAlign: 'left', background: '#080808', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '14px 12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
          >
            <span style={{ ...mono, display: 'block', fontSize: '20px', color: '#3dff8b', marginBottom: '10px' }}>{c.icon}</span>
            <span style={{ ...m, display: 'block', fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{c.title}</span>
            <span style={{ ...m, display: 'block', fontSize: '11px', color: '#aaa', lineHeight: 1.45 }}>{c.desc}</span>
          </button>
        ))}
      </div>
      <style>{`@media (min-width: 900px) { .wq-grid { grid-template-columns: repeat(4, 1fr) !important; } }`}</style>
    </div>
  );
};

export default WorldQuiz;
