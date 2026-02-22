import React, { useEffect } from 'react';

const Editorial: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Montserrat', sans-serif", padding: '60px 20px 80px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>
          Editorial
        </p>

        <h1 style={{ fontSize: 'clamp(28px,6vw,48px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#000', marginBottom: 32 }}>
          Standar & Kebijakan Editorial
        </h1>

        <div style={{ height: 1, background: '#f0f0f0', marginBottom: 32 }} />

        <div style={{ fontSize: 15, lineHeight: 1.85, color: '#333' }}>
          <p style={{ marginBottom: 24 }}>
            TelierNews berkomitmen untuk menyajikan berita yang akurat, berimbang, dan bertanggung jawab. Kami menjunjung tinggi standar jurnalisme yang etis dalam setiap laporan yang kami publikasikan.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 12, marginTop: 32 }}>Prinsip Utama</h2>
          <p style={{ marginBottom: 24 }}>
            Setiap artikel yang diterbitkan melewati proses verifikasi fakta yang ketat. Sumber informasi selalu dikonfirmasi sebelum dipublikasikan, dan kami tidak menerbitkan informasi yang belum terverifikasi.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 12, marginTop: 32 }}>Independensi</h2>
          <p style={{ marginBottom: 24 }}>
            TelierNews beroperasi secara independen tanpa pengaruh dari kepentingan politik maupun korporat. Redaksi kami membuat keputusan editorial berdasarkan nilai berita dan kepentingan publik semata.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 12, marginTop: 32 }}>Koreksi & Transparansi</h2>
          <p style={{ marginBottom: 24 }}>
            Jika terdapat kesalahan dalam pemberitaan kami, kami akan segera menerbitkan koreksi secara transparan. Kepercayaan pembaca adalah prioritas utama kami.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000', marginBottom: 12, marginTop: 32 }}>Hubungi Redaksi</h2>
          <p style={{ marginBottom: 8 }}>
            Untuk pertanyaan editorial, kritik, atau saran:
          </p>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: '#000' }}>
            editorial@teliernews.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Editorial;
