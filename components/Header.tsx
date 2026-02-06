import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Side: Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex flex-col justify-center items-center space-y-2"
            >
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </button>

            <Link to="/" className="text-2xl font-bold tracking-tight">
              TELIERNEWS
            </Link>
          </div>
          
          {/* Right Side: Subscribe + Profile */}
          <div className="flex items-center space-x-4">
            <Link to="/subscribe">
              <button className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all">
                SUBSCRIBE
              </button>
            </Link>
            
            <Link to="/profile">
              <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold hover:bg-gray-200 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Menu - Slide from Left */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-black text-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Close Button bisa ditambah kalau mau */}
              
              <nav className="space-y-1">
                <Link 
                  to="/" 
                  className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                  <span className="float-right">›</span>
                </Link>
                
                <Link 
                  to="/about" 
                  className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                  <span className="float-right">›</span>
                </Link>
                
                <Link 
                  to="/editorial" 
                  className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Editorial
                  <span className="float-right">›</span>
                </Link>
                
                <Link 
                  to="/contact" 
                  className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                  <span className="float-right">›</span>
                </Link>
              </nav>

              {/* Categories Section */}
              <div className="mt-8">
                <h3 className="text-sm text-gray-500 font-semibold mb-4">CATEGORIES</h3>
                
                <nav className="space-y-1">
                  <Link 
                    to="/category/technology" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Technology
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/ai" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Artificial Intelligence
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/markets" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Markets
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/business" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Business
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/politics" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Politics
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/geopolitics" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Geopolitics
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/science" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Science
                    <span className="float-right">›</span>
                  </Link>
                  
                  <Link 
                    to="/category/wealth" 
                    className="block py-4 text-lg hover:text-gray-300 transition-colors border-b border-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Wealth
                    <span className="float-right">›</span>
                  </Link>
                </nav>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="flex space-x-6">
                  <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                  <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors">
                    Instagram
                  </a>
                </div>
                <p className="mt-4 text-sm text-gray-500">© 2026 TELIERNEWS</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
