import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleProfileClick = () => {
    if (isLoggedIn) {
      // Kalau udah login → Ke halaman Profile
      navigate('/profile');
    } else {
      // Kalau belum login → Munculin popup
      setShowLoginPopup(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('admin_secret_code');
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center space-x-4 md:space-x-6">
              {!isAdminPage && (
                <button
                  onClick={onMenuToggle}
                  className="text-white hover:text-gray-300 transition-colors p-2"
                  aria-label="Menu"
                >
                  <svg 
                    className="w-7 h-7" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M4 8h16M4 16h16" 
                    />
                  </svg>
                </button>
              )}
              
              <Link 
                to="/" 
                className="text-xl md:text-2xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors"
              >
                TELIERNEWS
              </Link>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              {isAdminPage ? (
                isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    Logout
                  </button>
                )
              ) : (
                <>
                  <Link 
                    to="/subscribe"
                    className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-300"
                  >
                    SUBSCRIBE
                  </Link>
                  
                  {/* ICON PROFIL - INI YANG PENTING! */}
                  <button
                    onClick={handleProfileClick}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
                    aria-label={isLoggedIn ? "Profile" : "Login"}
                  >
                    <svg 
                      className="w-5 h-5 md:w-6 md:h-6 text-black" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* POPUP LOGIN */}
      {showLoginPopup && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLoginPopup(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Login TelierNews</h2>
              <button 
                onClick={() => setShowLoginPopup(false)}
                className="text-gray-400 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-6">
              Login untuk akses fitur lengkap TelierNews
            </p>

            <div className="space-y-3">
              <Link
                to="/login"
                onClick={() => setShowLoginPopup(false)}
                className="w-full py-3 px-4 border-2 border-black rounded-xl font-bold hover:bg-black hover:text-white transition-all flex items-center justify-center"
              >
                Login dengan Email
              </Link>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Atau</span>
                </div>
              </div>

              <Link
                to="/login?provider=google"
                onClick={() => setShowLoginPopup(false)}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </Link>

              <Link
                to="/login?provider=apple"
                onClick={() => setShowLoginPopup(false)}
                className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Apple</span>
              </Link>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Belum punya akun? <Link to="/login" className="text-black font-bold hover:underline">Daftar</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
