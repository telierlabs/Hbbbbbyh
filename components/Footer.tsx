
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold tracking-tighter mb-4">TELIERNEWS</h2>
            <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
              Platform berita modern yang menghadirkan informasi terpercaya, mendalam, dan terkini untuk masyarakat Indonesia.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">Kategori</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Teknologi</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Ekonomi</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Olahraga</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-500">info@teliernews.com</li>
              <li className="text-sm text-gray-500">+62 21 1234 5678</li>
              <li className="text-sm text-gray-500">Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} TelierNews. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-black text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-black text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
