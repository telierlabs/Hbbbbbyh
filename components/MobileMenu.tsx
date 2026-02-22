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
      <div
        className={`fixed inset-0 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">Menu</h2>
          <div className="w-7"></div>
        </div>

        {/* Main Menu Items */}
        <nav className="px-6 pt-4">
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
            {categories.map((category) => (
              <Link
                key={category}
                to={`/category/${category}`}
                onClick={onClose}
                className="flex items-center justify-between py-4 text-base font-normal hover:text-gray-300 transition-colors"
              >
                {category}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="px-6 pb-8 border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} TELIERNEWS
          </p>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
