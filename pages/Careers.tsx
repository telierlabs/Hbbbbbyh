import React from 'react';
import { Link } from 'react-router-dom';

const Careers: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Careers</h1>
      <p className="text-gray-400 mb-12">Bergabunglah dengan tim TelierNews dan jadilah bagian dari masa depan jurnalisme digital.</p>
      <div className="space-y-6">
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Terbuka</p>
          <h2 className="text-xl font-bold mb-2">Jurnalis Digital</h2>
          <p className="text-gray-600 text-sm mb-4">Full-time · Remote · Jakarta</p>
          <a href="mailto:admin@teliernews.com?subject=Lamaran Jurnalis Digital" className="inline-block px-5 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all">Lamar Sekarang</a>
        </div>
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Terbuka</p>
          <h2 className="text-xl font-bold mb-2">Social Media Manager</h2>
          <p className="text-gray-600 text-sm mb-4">Part-time · Remote</p>
          <a href="mailto:admin@teliernews.com?subject=Lamaran Social Media Manager" className="inline-block px-5 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all">Lamar Sekarang</a>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-8">Pertanyaan karir: <a href="mailto:admin@teliernews.com" className="underline">admin@teliernews.com</a></p>
    </div>
  );
};

export default Careers;
