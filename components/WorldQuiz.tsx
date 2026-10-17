import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CHALLENGES } from '../quizData';

const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

// Section "World Quiz" di Home: 4 kartu tantangan yang digeser ke samping, tanpa kartu pembungkus.
// Tiap tantangan punya halaman sendiri: /quiz/:kind
const WorldQuiz: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#000', paddingTop: '24px', paddingBottom: '24px', borderBottom: '1px solid #111' }}>
      <div className="tn-container" style={{ padding: '0 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span className="tn-sec-header" style={{ ...m, fontSize: '16px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>World Quiz</span>
          <button type="button" onClick={() => navigate('/quiz')} style={{ ...mono, background: 'none', border: 'none', padding: '4px 0', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', cursor: 'pointer' }}>
            Lihat semua →
          </button>
        </div>
      </div>
      <div className="tn-container">
        <div className="wq-row" style={{ display: 'flex', gap: '10px', padding: '0 20px', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {CHALLENGES.map(c => (
            <button
              key={c.kind}
              type="button"
              className="wq-card"
              onClick={() => navigate(`/quiz/${c.kind}`)}
              style={{ flexShrink: 0, scrollSnapAlign: 'start', width: '170px', textAlign: 'left', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px 14px', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#3a3a3a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
            >
              <span style={{ ...mono, display: 'block', fontSize: '22px', color: '#3dff8b', marginBottom: '12px' }}>{c.icon}</span>
              <span style={{ ...m, display: 'block', fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{c.title}</span>
              <span style={{ ...m, display: 'block', fontSize: '11px', color: '#aaa', lineHeight: 1.45 }}>{c.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @media (min-width: 900px) {
          .wq-row { display: grid !important; grid-template-columns: repeat(4, 1fr); overflow: visible !important; }
          .wq-card { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default WorldQuiz;
