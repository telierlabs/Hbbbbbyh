import React, { useState, useEffect, useRef } from 'react';

interface VoiceReaderProps { text: string; }

const BAR_COUNT = 38;

const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [heights, setHeights] = useState<number[]>(Array(BAR_COUNT).fill(4));
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false); setIsPaused(false);
    stopAnim();
  }, [text]);

  const startAnim = () => {
    const loop = () => {
      tRef.current += 0.07;
      const t = tRef.current;
      setHeights(Array.from({ length: BAR_COUNT }, (_, i) => {
        const v = 0.5
          + 0.35 * Math.sin(i * 0.5  + t)
          + 0.15 * Math.sin(i * 1.1  + t * 1.8)
          + 0.08 * Math.sin(i * 0.22 + t * 0.55);
        return Math.max(4, Math.round(v * 44));
      }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const stopAnim = () => {
    cancelAnimationFrame(rafRef.current);
    setHeights(Array(BAR_COUNT).fill(4));
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utter;
    utter.lang = 'id-ID'; utter.rate = 1.0;
    const idVoice = window.speechSynthesis.getVoices().find(v => v.lang.includes('id'));
    if (idVoice) utter.voice = idVoice;
    utter.onstart  = () => { setIsPlaying(true); setIsPaused(false); startAnim(); };
    utter.onend    = () => { setIsPlaying(false); setIsPaused(false); stopAnim(); };
    utter.onerror  = e  => { if (e.error !== 'canceled') { setIsPlaying(false); setIsPaused(false); stopAnim(); } };
    setTimeout(() => window.speechSynthesis.speak(utter), 100);
  };

  const handlePause  = () => { window.speechSynthesis.pause();  setIsPaused(true);  stopAnim(); };
  const handleResume = () => { window.speechSynthesis.resume(); setIsPaused(false); startAnim(); };
  const handleStop   = () => { window.speechSynthesis.cancel(); setIsPlaying(false); setIsPaused(false); stopAnim(); };

  if (!('speechSynthesis' in window)) return null;

  const active = isPlaying && !isPaused;

  return (
    <>
      <style>{`@keyframes vr-rp{0%{transform:scale(1);opacity:1}100%{transform:scale(1.65);opacity:0}}`}</style>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 14px',
        border: `1px solid ${active ? '#222' : '#efefef'}`,
        borderRadius: '50px', transition: 'border-color 0.3s', background: '#fff',
      }}>

        {/* PLAY / PAUSE / RESUME */}
        <button
          onClick={!isPlaying ? handlePlay : isPaused ? handleResume : handlePause}
          style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: '#111', border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'transform 0.15s',
          }}
        >
          {active && (
            <span style={{
              position: 'absolute', inset: '-5px', borderRadius: '50%',
              border: '1.5px solid rgba(0,0,0,0.1)',
              animation: 'vr-rp 1.4s ease-out infinite',
              pointerEvents: 'none',
            }} />
          )}
          {!isPlaying || isPaused
            ? <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            : <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>}
        </button>

        {/* BARS */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          gap: '2.5px', height: '44px', overflow: 'hidden',
        }}>
          {heights.map((h, i) => (
            <div key={i} style={{
              width: '3px', borderRadius: '2px', flexShrink: 0,
              height: `${h}px`,
              background: active ? '#111' : '#e4e4e4',
              opacity: active ? (0.25 + (h / 44) * 0.75) : 1,
              transition: active ? 'none' : 'height 0.4s ease, background 0.3s',
            }} />
          ))}
        </div>

        {/* STOP — hanya saat playing */}
        {isPlaying && (
          <button onClick={handleStop} style={{
            width: '28px', height: '28px', borderRadius: '8px',
            border: '1px solid #ececec', background: '#f7f7f7',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="10" height="10" fill="#aaa" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
          </button>
        )}

      </div>
    </>
  );
};

export default VoiceReader;
