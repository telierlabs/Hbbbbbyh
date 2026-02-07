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
      {/* FULLSCREEN Menu - bukan setengah */}
      <div
        className={`fixed inset-0 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        {/* Header dengan X button */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          {/* Close Button - X Icon */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          {/* Menu Title */}
          <h2 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">Menu</h2>
          
          {/* Spacer untuk balance */}
          <div className="w-7"></div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Teliernews"
              className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 text-base"
            />
            <svg
              className="absolute right-4 top-4 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Main Menu Items */}
        <nav className="px-6">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between py-5 text-lg font-normal hover:text-gray-300 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-gray-800' : ''
              }`}
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
        <div className="px-6 py-6 border-t border-gray-800">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            CATEGORIES
          </h3>
          <div className="space-y-1">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/category/${category}`}
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

        {/* Social Media Links */}
        <div className="px-6 py-6 border-t border-gray-800">
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
              aria-label="Instagram"
            >
              Instagram
            </a>
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
