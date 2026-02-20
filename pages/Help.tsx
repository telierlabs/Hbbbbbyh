import React from 'react';
import { Link } from 'react-router-dom';

const Help: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Help Center</h1>
      <p className="text-gray-400 mb-12">Ada pertanyaan? Kami siap membantu.</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Cara Berlangganan</h2>
          <p>Klik tombol Subscribe di halaman utama, masukkan email Anda, dan ikuti instruksi yang dikirim ke email tersebut.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Lupa Password</h2>
          <p>Klik "Lupa Password" di halaman login. Link reset akan dikirim ke email yang terdaftar.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Hubungi Kami</h2>
          <div className="space-y-2">
            <p>Umum: <a href="mailto:contact@teliernews.com" className="underline">contact@teliernews.com</a></p>
            <p>Berita: <a href="mailto:news@teliernews.com" className="underline">news@teliernews.com</a></p>
            <p>Editorial: <a href="mailto:editor@teliernews.com" className="underline">editor@teliernews.com</a></p>
            <p>Admin: <a href="mailto:admin@teliernews.com" className="underline">admin@teliernews.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Help;
