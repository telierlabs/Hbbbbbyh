import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-12">Terakhir diperbarui: Oktober 2026</p>
      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Data yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar, berlangganan, atau menghubungi kami. Data ini mencakup nama, alamat email, dan preferensi konten. Kami juga mengumpulkan data kunjungan yang bersifat umum, seperti halaman yang dibuka, jenis perangkat, dan peramban, untuk memahami lalu lintas situs.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Penggunaan Data</h2>
          <p>Data digunakan untuk mengirimkan konten berita, meningkatkan layanan, dan komunikasi terkait akun. Kami tidak menjual data pribadi Anda kepada pihak ketiga.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Iklan Pihak Ketiga (Google AdSense)</h2>
          <p>Kami menggunakan Google AdSense untuk menampilkan iklan di situs ini. Google dan mitra iklannya, sebagai vendor pihak ketiga, menggunakan cookie untuk menayangkan iklan berdasarkan kunjungan Anda sebelumnya ke situs ini maupun situs lain di internet.</p>
          <p className="mt-3">Dengan cookie iklan, Google dan mitranya dapat menayangkan iklan kepada Anda berdasarkan kunjungan Anda ke situs kami dan/atau situs lain. Anda dapat menonaktifkan personalisasi iklan melalui <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="underline">Pengaturan Iklan Google</a>. Anda juga dapat mempelajari cara Google menggunakan data dari situs mitra di <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="underline">policies.google.com/technologies/partner-sites</a>.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-black mb-3">Cookie</h2>
          <p>Kami menggunakan cookie esensial untuk autentikasi, cookie preferensi untuk menyimpan pengaturan Anda, serta cookie iklan dari pihak ketiga seperti dijelaskan di atas. Anda dapat mengatur atau menonaktifkan cookie melalui pengaturan peramban Anda. Informasi lebih lanjut ada di halaman <Link to="/cookies" className="underline">Cookie Policy</Link>.</p>
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
