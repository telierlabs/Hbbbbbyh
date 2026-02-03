import React, { useState, useEffect } from 'react';

interface VoiceReaderProps {
  text: string;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const handlePlay = () => {
    if (!isSupported) {
      alert('Browser Anda tidak mendukung fitur text-to-speech');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set to Indonesian voice
    utterance.lang = 'id-ID';
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      alert('Terjadi kesalahan saat memutar audio');
    };

    window.speechSynthesis.speak(utterance);
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
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="flex items-center space-x-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8">
      {/* Voice Wave Visualization */}
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-black rounded-full transition-all duration-300 ${
              isPlaying && !isPaused
                ? 'animate-pulse'
                : ''
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
