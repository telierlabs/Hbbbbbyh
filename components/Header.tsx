
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Category } from '../types';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-black hover:opacity-80 transition-opacity">
              TELIER<span className="text-gray-400">NEWS</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {!isAdmin && Object.values(Category).map((cat) => (
                <Link 
                  key={cat} 
                  to={`/category/${cat}`} 
                  className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to={isAdmin ? "/" : "/admin"} 
              className="px-4 py-2 text-sm font-medium border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
              {isAdmin ? "Lihat Web" : "CMS Admin"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
