import React from 'react';
import { Link } from 'react-router-dom';

const Cookies: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Cookie Policy</h1>
      <p className="text-gray-400 text-sm mb-12">Terakhir diperbarui: Februari 2026</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Apa itu Cookie?</h2>
          <p>Cookie adalah file kecil yang disimpan di perangkat Anda saat mengunjungi situs web. Kami menggunakan cookie untuk meningkatkan pengalaman pengguna.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Cookie yang Kami Gunakan</h2>
          <p>Cookie esensial untuk autentikasi pengguna via Firebase, cookie analitik untuk memahami trafik situs, dan cookie preferensi untuk menyimpan pengaturan Anda.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Mengelola Cookie</h2>
          <p>Anda dapat menonaktifkan cookie melalui pengaturan browser. Namun beberapa fitur mungkin tidak berfungsi optimal tanpa cookie.</p>
        </section>
      </div>
    </div>
  );
};

export default Cookies;
