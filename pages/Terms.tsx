import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-12">Terakhir diperbarui: Februari 2026</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Penggunaan Layanan</h2>
          <p>Dengan mengakses TelierNews, Anda setuju untuk menggunakan layanan ini hanya untuk keperluan yang sah dan tidak melanggar hukum yang berlaku.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Hak Kekayaan Intelektual</h2>
          <p>Seluruh konten di TelierNews — termasuk artikel, gambar, dan desain — adalah milik PT Telier News AIX dan dilindungi hak cipta.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Batasan Tanggung Jawab</h2>
          <p>TelierNews menyediakan informasi berdasarkan sumber terpercaya namun tidak bertanggung jawab atas keputusan yang diambil berdasarkan konten yang dipublikasikan.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Perubahan Ketentuan</h2>
          <p>Kami berhak mengubah ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui halaman ini.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
