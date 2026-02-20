import React from 'react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact</h1>
      <p className="text-gray-400 mb-12">Hubungi tim TelierNews untuk kolaborasi, pertanyaan editorial, atau hal lainnya.</p>
      <div className="space-y-4">
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Kontak Umum</p>
          <a href="mailto:contact@teliernews.com" className="text-lg font-bold hover:underline">contact@teliernews.com</a>
        </div>
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Kirim Berita / Tips</p>
          <a href="mailto:news@teliernews.com" className="text-lg font-bold hover:underline">news@teliernews.com</a>
        </div>
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Redaksi & Editorial</p>
          <a href="mailto:editor@teliernews.com" className="text-lg font-bold hover:underline">editor@teliernews.com</a>
        </div>
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Administrasi</p>
          <a href="mailto:admin@teliernews.com" className="text-lg font-bold hover:underline">admin@teliernews.com</a>
        </div>
        <div className="border border-gray-100 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">WhatsApp</p>
          <a href="https://wa.me/6282112345678" className="text-lg font-bold hover:underline">+62 821 1234 5678</a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
