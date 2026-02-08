import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          TELIERNEWS
        </h1>
        <p className="text-2xl md:text-3xl text-black mb-8 font-bold">
          THE CYBERPUNK NEWSROOM
        </p>
        
        {/* Hero Image */}
        <div className="w-full mb-12">
          <img 
            src="/file_0000000069cc72088f34a544f53e78ca.png" 
            alt="TelierNews - The Cyberpunk Newsroom" 
            className="w-full h-auto rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* The Origin */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
            The Origin: Satu Pemikiran, Satu Perlawanan
          </h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              TelierNews tidak lahir dari ruang rapat gedung pencakar langit yang dingin dengan ribuan karyawan yang terjebak birokrasi. TelierNews lahir dari sebuah meja kerja sederhana milik <strong className="text-black">Muhamad Rivaldy</strong>, seorang individu yang memiliki keresahan mendalam terhadap dekadensi industri media saat ini. Kita hidup di era di mana informasi melimpah, namun kualitasnya seringkali setara dengan sampah digital. Kita dipaksa mengonsumsi berita yang dipisah menjadi sepuluh halaman hanya demi impresi iklan, dihantam oleh judul clickbait yang menipu, dan disuguhi narasi kaku yang kehilangan relevansinya sebelum sempat selesai dibaca.
            </p>
            <p>
              Sebagai <strong className="text-black">Founder dan CEO</strong>, Muhamad Rivaldy membangun TelierNews sendirian (<strong className="text-black">Solo Founder</strong>) dari titik nol. Dari baris kode pertama, perancangan antarmuka visual yang minimalis, hingga arsitektur mesin AI di belakangnya, semuanya adalah hasil dedikasi Muhamad Rivaldy. Ini adalah manifestasi nyata bahwa di era "Masa Depan Digital", satu individu dengan visi yang tajam dan bantuan teknologi cerdas mampu menantang dominasi raksasa media tradisional. TelierNews bukan sekadar portal berita; ini adalah <strong className="text-black">benteng jurnalisme mendalam</strong> di persimpangan teknologi, pasar global, dan masa depan digital.
            </p>
          </div>
        </section>

        {/* The Cyberpunk Vision */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
            The Cyberpunk Vision: Jurnalisme Tanpa Batas
          </h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Mengapa Muhamad Rivaldy memilih identitas "The Cyberpunk Newsroom"? Karena kita saat ini berada dalam realitas di mana teknologi tinggi (<strong className="text-black">High Tech</strong>) telah menyatu dengan DNA kehidupan, namun akses terhadap informasi yang murni dan berkualitas masih sering terhambat oleh sistem lama yang korup secara estetika dan fungsional.
            </p>
            <p>
              Visi Muhamad Rivaldy melampaui portal berita konvensional; beliau ingin membangun sebuah <strong className="text-black">Platform Navigasi Masa Depan</strong>. Di TelierNews, Anda tidak lagi menjadi pembaca yang pasif. Kami menghadirkan ekosistem interaktif di mana:
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="text-xl font-bold text-black mb-2">AI Insight by Muhamad Rivaldy</h3>
              <p className="text-gray-700">
                Setiap berita publik tidak sekadar ditampilkan, melainkan diproses ulang untuk memberikan makna terdalam, analisis dampak, dan prediksi masa depan.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="text-xl font-bold text-black mb-2">AI Discussion & Chat</h3>
              <p className="text-gray-700">
                Platform ini memungkinkan Anda untuk mendebat, bertanya, dan menggali konteks berita secara real-time dengan asisten cerdas yang dirancang oleh Muhamad Rivaldy.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="text-xl font-bold text-black mb-2">Cyber-Atmosphere</h3>
              <p className="text-gray-700">
                Pengalaman konsumsi informasi yang bersih, tanpa gangguan iklan banner yang "berisik", memberikan ruang sakral bagi pemikiran kritis dan ketenangan membaca.
              </p>
            </div>
          </div>
        </section>

        {/* The Human & AI Synergy */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
            The Human & AI Synergy
          </h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Dalam operasional harian TelierNews, Muhamad Rivaldy bertindak sebagai <strong className="text-black">"Conductor" (Dirigen)</strong> utama. AI bukanlah pengganti, melainkan instrumen yang memperkuat kemampuan manusia. Setiap informasi dikurasi langsung oleh tangan Muhamad Rivaldy untuk menjaga integritas, etika, dan moralitas jurnalisme, namun diperkuat oleh kecerdasan buatan untuk mencapai kecepatan dan kedalaman analisis yang mustahil dilakukan manusia sendirian.
            </p>
            <p>
              Inilah standar baru media yang digagas Muhamad Rivaldy: <strong className="text-black">Human-Centric, AI-Powered</strong>.
            </p>
          </div>
        </section>

        {/* Struktur Redaksi */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-black">
            STRUKTUR REDAKSI & OPERASIONAL TELIERNEWS
          </h2>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            Terinspirasi dari profesionalisme media global, berikut adalah struktur tanggung jawab di balik operasional TelierNews yang dikelola oleh Muhamad Rivaldy dengan dukungan sistem AI terintegrasi:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Penanggung Jawab Konten & Pemberitaan</h3>
              <p className="text-black">Muhamad Rivaldy</p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Pemimpin Redaksi / Editor-in-Chief</h3>
              <p className="text-black">Muhamad Rivaldy</p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Managing Editors & Strategi AI</h3>
              <p className="text-black">Muhamad Rivaldy <span className="text-gray-600">(Assisted by Telier-AI Engine)</span></p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Editor Desk: Teknologi, AI, & Ekonomi</h3>
              <p className="text-black">Muhamad Rivaldy</p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Reporter & Peneliti Data (Data Researcher)</h3>
              <p className="text-black">Muhamad Rivaldy <span className="text-gray-600">(Supported by Automated AI Crawling)</span></p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Internasional & Geopolitics Desk</h3>
              <p className="text-black">Muhamad Rivaldy <span className="text-gray-600">(AI-Translation & Contextual Analysis)</span></p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Social Media & Podcast Host Manager</h3>
              <p className="text-black">Muhamad Rivaldy <span className="text-gray-600">(Using Telier-AI Voice & Avatar)</span></p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg hover:border-black transition-colors">
              <h3 className="text-xl font-bold text-black mb-2">Pengembangan Teknologi & Arsitek Web</h3>
              <p className="text-black">Muhamad Rivaldy</p>
            </div>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="text-center py-12 border-t border-gray-300">
          <p className="text-2xl md:text-3xl font-bold text-black mb-4">
            Selamat Datang di Masa Depan Jurnalisme
          </p>
          <p className="text-gray-600 text-lg">
            Di mana teknologi dan humanitas bersatu untuk kebenaran
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
