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
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Hamburger Menu */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 flex flex-col justify-center items-center space-y-1.5"
        >
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>

        <Link to="/" className="text-2xl font-bold tracking-tight">
          TELIERNEWS
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/subscribe">
            <button className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all">
              SUBSCRIBE
            </button>
          </Link>
          
          <Link to="/profile">
            <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold hover:bg-gray-200 transition-all">
              {user ? user.email?.charAt(0).toUpperCase() : '👤'}
            </button>
          </Link>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-64 bg-white text-black shadow-xl border-r border-gray-200">
          <nav className="py-4">
            <Link to="/" className="block px-6 py-3 hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/profile" className="block px-6 py-3 hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(false)}>
              Profil
            </Link>
            <Link to="/subscribe" className="block px-6 py-3 hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(false)}>
              Langganan
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
