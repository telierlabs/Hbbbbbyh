import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-12">Terakhir diperbarui: Februari 2026</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Data yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar, berlangganan, atau menghubungi kami. Data ini mencakup nama, alamat email, dan preferensi konten.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Penggunaan Data</h2>
          <p>Data digunakan untuk mengirimkan konten berita, meningkatkan layanan, dan komunikasi terkait akun. Kami tidak menjual data Anda kepada pihak ketiga.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Keamanan</h2>
          <p>Kami menggunakan Firebase Authentication dan enkripsi standar industri untuk melindungi data Anda. Akses data dibatasi hanya untuk tim yang berwenang.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Kontak</h2>
          <p>Pertanyaan terkait privasi: <a href="mailto:admin@teliernews.com" className="underline">admin@teliernews.com</a></p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
