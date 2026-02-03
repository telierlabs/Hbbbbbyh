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
  
  // Check apakah di halaman admin
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu - HANYA TAMPIL DI PUBLIC PAGE */}
            {!isAdminPage && (
              <button
                onClick={onMenuToggle}
                className="text-white hover:text-gray-300 transition-colors p-2"
                aria-label="Menu"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
            )}
            
            {/* Logo */}
            <Link 
              to="/" 
              className="text-xl md:text-2xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors"
            >
              TELIERNEWS
            </Link>
          </div>

          {/* Right Section - Subscribe & Profile/Login */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* ADMIN PAGE - cuma tampil logout */}
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
              /* PUBLIC PAGE - tampil Subscribe & Profile Icon */
              <>
                {/* Subscribe Button */}
                <button className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-300">
                  SUBSCRIBE
                </button>
                
                {/* Profile Icon / Login */}
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
                    aria-label="Logout"
                  >
                    <svg 
                      className="w-6 h-6 text-black" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
                    aria-label="Login"
                  >
                    <svg 
                      className="w-6 h-6 text-black" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
