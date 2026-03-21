import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  onAuthStateChanged, signOut, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup,
  GoogleAuthProvider, OAuthProvider
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface HeaderProps {
  onMenuToggle: () => void;
  onSearch: (query: string) => void;
}

interface BookmarkItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  savedAt: number;
}

const getBookmarks = (): BookmarkItem[] => {
  try { return JSON.parse(localStorage.getItem('tn_bookmarks') || '[]'); } catch { return []; }
};

const AdBanner = () => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return (
    <div className="w-full bg-white flex justify-center py-1">
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5401422175634449"
        data-ad-slot="6768189218"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Bookmark
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bmCount, setBmCount] = useState(0);

  // Mode baca
  const [focusMode, setFocusMode] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  const isAdminPage = location.pathname.startsWith('/admin');
  const isNewsDetail = location.pathname.startsWith('/news/');

  // Sync bookmark dari localStorage
  const syncBookmarks = useCallback(() => {
    const bms = getBookmarks();
    setBookmarks(bms);
    setBmCount(bms.length);
  }, []);

  useEffect(() => {
    syncBookmarks();
    window.addEventListener('bookmarks-updated', syncBookmarks);
    return () => window.removeEventListener('bookmarks-updated', syncBookmarks);
  }, [syncBookmarks]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setIsLoggedIn(!!user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply mode baca ke body
  useEffect(() => {
    document.body.classList.toggle('tn-focus-mode', focusMode);
  }, [focusMode]);

  useEffect(() => {
    document.body.classList.toggle('tn-night-mode', nightMode);
  }, [nightMode]);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) { setSearchQuery(''); onSearch(''); }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleProfileClick = () => {
    if (isLoggedIn) navigate('/profile');
    else { setShowLoginPopup(true); setEmail(''); setPassword(''); setError(''); setIsSignUp(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('admin_secret_code');
    navigate('/');
  };

  const closePopup = () => {
    setShowLoginPopup(false); setEmail(''); setPassword('');
    setError(''); setLoading(false); setIsSignUp(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      closePopup(); navigate('/profile');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') setError('Akun tidak ditemukan.');
      else if (err.code === 'auth/wrong-password') setError('Password salah!');
      else if (err.code === 'auth/email-already-in-use') { setError('Email sudah terdaftar.'); setIsSignUp(false); }
      else if (err.code === 'auth/weak-password') setError('Password minimal 6 karakter.');
      else if (err.code === 'auth/invalid-email') setError('Format email salah!');
      else setError('Login gagal! Cek email dan password.');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      closePopup(); navigate('/profile');
    } catch (err: any) {
      setError(err.code === 'auth/popup-closed-by-user' ? 'Login dibatalkan.' : 'Login Google gagal!');
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithPopup(auth, new OAuthProvider('apple.com'));
      closePopup(); navigate('/profile');
    } catch (err: any) {
      setError(err.code === 'auth/popup-closed-by-user' ? 'Login dibatalkan.' : 'Login Apple gagal!');
      setLoading(false);
    }
  };

  const deleteBookmark = (id: string) => {
    const bms = getBookmarks().filter(b => b.id !== id);
    localStorage.setItem('tn_bookmarks', JSON.stringify(bms));
    syncBookmarks();
    window.dispatchEvent(new Event('bookmarks-updated'));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <style>{`
        body.tn-focus-mode .tn-hide-focus { display: none !important; }
        body.tn-focus-mode .tn-card-img { display: none !important; }
        body.tn-night-mode { filter: brightness(0.7) sepia(0.2); }
        @keyframes tn-bm-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isAdminPage ? 'bg-black' : scrolled ? 'bg-black/85 backdrop-blur-md' : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}>
        {!isAdminPage && <AdBanner />}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            {showSearch ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus type="text" value={searchQuery}
                  onChange={handleSearchChange} placeholder="Cari berita..."
                  className="flex-1 bg-white/10 backdrop-blur text-white placeholder-white/50 border border-white/20 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-white/50"
                />
                <button onClick={handleSearchToggle} className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <Link to="/" className="hover:opacity-75 transition-opacity flex-shrink-0">
                  <img src="/IMG_20260220_144200.png" alt="Telier News" className="h-10 md:h-12 w-auto object-contain" />
                </Link>
                <div className="flex items-center space-x-1">
                  {isAdminPage ? (
                    isLoggedIn && (
                      <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium border border-red-500 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all">
                        Logout
                      </button>
                    )
                  ) : (
                    <>
                      <button onClick={handleSearchToggle} className="w-11 h-11 flex items-center justify-center text-white/90 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>

                      {/* IKON BOOKMARK */}
                      <button
                        onClick={() => { syncBookmarks(); setShowBookmarks(true); }}
                        className="w-11 h-11 flex items-center justify-center text-white/90 hover:text-white transition-colors relative"
                      >
                        <svg className="w-5 h-5" fill={bmCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {bmCount > 0 && (
                          <span style={{
                            position: 'absolute', top: '8px', right: '6px',
                            width: '14px', height: '14px', borderRadius: '50%',
                            background: '#fff', color: '#000',
                            fontSize: '8px', fontWeight: 900,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Share Tech Mono', monospace",
                          }}>
                            {bmCount > 9 ? '9+' : bmCount}
                          </span>
                        )}
                      </button>

                      <button onClick={handleProfileClick} className="w-11 h-11 flex items-center justify-center text-white/90 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </button>
                      <button onClick={onMenuToggle} className="w-11 h-11 flex items-center justify-center text-white/90 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 17h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HALAMAN BOOKMARK */}
      {showBookmarks && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowBookmarks(false)}
        >
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '420px',
              background: '#000', borderLeft: '1px solid #111',
              overflowY: 'auto', animation: 'tn-bm-in 0.25s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Topbar */}
            <div style={{
              position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(10px)', borderBottom: '1px solid #111',
              padding: '0 20px', height: '56px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>
                BOOKMARK
              </span>
              <button
                onClick={() => setShowBookmarks(false)}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  border: '1px solid #222', background: 'transparent',
                  color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Konten */}
            <div style={{ padding: '20px 16px 60px' }}>
              {bookmarks.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '80px 0',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '10px', color: '#2a2a2a', letterSpacing: '0.2em', lineHeight: 2,
                }}>
                  BELUM ADA ARTIKEL<br />YANG DISIMPAN
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.15em', marginBottom: '16px' }}>
                    {bookmarks.length} ARTIKEL TERSIMPAN
                  </p>
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      style={{
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                        padding: '14px 0', borderBottom: '1px solid #0e0e0e',
                      }}
                    >
                      <img
                        src={bm.imageUrl}
                        alt={bm.title}
                        onClick={() => { setShowBookmarks(false); navigate(`/news/${bm.id}`); }}
                        style={{ width: '70px', height: '50px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, filter: 'brightness(0.75)', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '5px' }}>
                          {bm.category}
                        </p>
                        <p
                          onClick={() => { setShowBookmarks(false); navigate(`/news/${bm.id}`); }}
                          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: 700, color: '#bbb', lineHeight: 1.35, textTransform: 'uppercase', letterSpacing: '-0.01em', cursor: 'pointer', margin: 0 }}
                        >
                          {bm.title}
                        </p>
                        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#333', letterSpacing: '0.1em', marginTop: '5px' }}>
                          {formatDate(bm.publishedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteBookmark(bm.id)}
                        style={{
                          width: '26px', height: '26px', borderRadius: '6px',
                          border: '1px solid #1a1a1a', background: 'transparent',
                          color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget).style.borderColor = '#ff4444'; (e.currentTarget).style.color = '#ff4444'; }}
                        onMouseLeave={e => { (e.currentTarget).style.borderColor = '#1a1a1a'; (e.currentTarget).style.color = '#333'; }}
                      >
                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAB MODE BACA — hanya di halaman artikel */}
      {isNewsDetail && (
        <div style={{ position: 'fixed', bottom: '140px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setFocusMode(!focusMode)}
            title="Mode Fokus"
            style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: focusMode ? '#fff' : '#111',
              border: focusMode ? '1px solid #fff' : '1px solid #222',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: focusMode ? '#000' : '#666',
              transition: 'all 0.2s',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <button
            onClick={() => setNightMode(!nightMode)}
            title="Mode Malam"
            style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: nightMode ? '#fff' : '#111',
              border: nightMode ? '1px solid #fff' : '1px solid #222',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: nightMode ? '#000' : '#666',
              transition: 'all 0.2s',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </button>
        </div>
      )}

      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closePopup}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isSignUp ? 'Daftar' : 'Login'} TelierNews</h2>
              <button onClick={closePopup} className="text-gray-400 hover:text-black text-2xl">×</button>
            </div>
            <p className="text-gray-600 text-sm mb-6">{isSignUp ? 'Buat akun baru untuk akses fitur lengkap' : 'Login untuk akses fitur lengkap TelierNews'}</p>
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="nama@email.com" required disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="••••••••" required minLength={6} disabled={loading} />
                {isSignUp && <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>}
              </div>
              {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">⚠️ {error}</div>}
              <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50">
                {loading ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Login'}
              </button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Atau</span></div>
            </div>
            <div className="space-y-3">
              <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-3 px-4 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
              <button onClick={handleAppleLogin} disabled={loading} className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-bold text-black hover:underline" type="button">
                  {isSignUp ? 'Login' : 'Daftar Sekarang'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
