import React from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const categories = [
    'Technology',
    'Artificial Intelligence',
    'Markets',
    'Business',
    'Politics',
    'Geopolitics',
    'Science',
    'Wealth'
  ];

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Editorial', path: '/editorial' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      {/* FULLSCREEN Menu */}
      <div
        className={`fixed inset-0 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        {/* Header dengan Hamburger + Logo di kiri */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          {/* Left Section - Hamburger + Logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Icon (jadi X saat menu terbuka) */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors p-1"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            
            {/* Logo di sebelah hamburger */}
            <h2 className="text-xl font-bold">TELIERNEWS</h2>
          </div>
          
          {/* Right Section - Subscribe & Profile */}
          <div className="flex items-center space-x-3">
            <button className="px-5 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-300">
              SUBSCRIBE
            </button>
            
            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-all duration-300">
              <svg 
                className="w-5 h-5 text-black" 
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
          </div>
        </div>

        {/* Main Menu Items */}
        <nav className="px-6 pt-4">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center justify-between py-5 text-lg font-normal hover:text-gray-300 transition-colors border-b border-gray-800"
            >
              {item.label}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Categories Section */}
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            CATEGORIES
          </h3>
          <div className="space-y-0">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/category/${category.toLowerCase().replace(' ', '-')}`}
                onClick={onClose}
                className="flex items-center justify-between py-4 text-base font-normal hover:text-gray-300 transition-colors"
              >
                {category}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="px-6 pb-8">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} TELIERNEWS
          </p>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
