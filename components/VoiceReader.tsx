import React, { useState, useEffect, useRef } from 'react';

interface VoiceReaderProps {
  text: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    }

    // CLEANUP: Stop speech on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // RESET speech synthesis on text change
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [text]);

  const handlePlay = () => {
    if (!isSupported) {
      alert('Browser Anda tidak mendukung fitur text-to-speech');
      return;
    }

    // STOP any existing speech first
    window.speechSynthesis.cancel();

    // CREATE new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
      
      // ONLY alert if error is not "canceled" (user stopped it)
      if (event.error !== 'canceled') {
        alert('Terjadi kesalahan saat memutar audio. Silakan coba lagi.');
      }
    };

    // SMALL DELAY to ensure clean start
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8">
      {/* Voice Wave Visualization */}
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-black rounded-full transition-all duration-300 ${
              isPlaying && !isPaused ? 'animate-pulse' : ''
            }`}
            style={{
              height: isPlaying && !isPaused ? `${12 + (i % 3) * 8}px` : '12px',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Play/Pause/Stop Controls */}
      <div className="flex items-center space-x-2">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all"
            aria-label="Play"
          >
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={handlePause}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all"
                aria-label="Pause"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all"
                aria-label="Resume"
              >
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            )}
            <button
              onClick={handleStop}
              className="w-10 h-10 rounded-full bg-slate-200 text-black flex items-center justify-center hover:bg-slate-300 transition-all"
              aria-label="Stop"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Label */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">
          {isPlaying 
            ? (isPaused ? 'Dijeda' : 'Sedang Diputar...') 
            : 'Dengarkan Artikel'}
        </p>
        <p className="text-xs text-gray-500">Text-to-Speech dalam Bahasa Indonesia</p>
      </div>
    </div>
  );
};

export default VoiceReader;
