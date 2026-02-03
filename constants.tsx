import { NewsArticle, Category } from './types';

// Menu items untuk navigation
export const MENU_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Editorial', path: '/editorial' },
  { label: 'Contact', path: '/contact' }
];

// Categories untuk mobile menu
export const CATEGORIES = [
  'Technology',
  'Artificial Intelligence',
  'Markets',
  'Business',
  'Politics',
  'Geopolitics',
  'Science',
  'Wealth'
];

// Social media links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/teliernews',
  tiktok: 'https://tiktok.com/@teliernews',
  instagram: 'https://instagram.com/teliernews'
};

// Initial articles for demo
export const INITIAL_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    title: 'Transformasi Digital di Indonesia Menuju 2030',
    summary: 'Bagaimana infrastruktur teknologi membentuk masa depan ekonomi digital tanah air.',
    content: 'Indonesia sedang berada di ambang revolusi digital besar-besaran. Dengan peningkatan penetrasi internet hingga pelosok desa, peluang ekonomi baru mulai bermunculan...',
    category: Category.TECH,
    imageUrl: 'https://picsum.photos/seed/tech1/800/600',
    publishedAt: new Date().toISOString(),
    author: 'Admin Telier',
  },
  {
    id: '2',
    title: 'Kebangkitan Olahraga Lokal di Kancah Internasional',
    summary: 'Atlet muda Indonesia semakin mendominasi panggung dunia dalam berbagai disiplin ilmu.',
    content: 'Dari bulutangkis hingga panjat tebing, talenta muda kita terus membuktikan bahwa batasan hanyalah tantangan yang belum terpecahkan...',
    category: Category.SPORTS,
    imageUrl: 'https://picsum.photos/seed/sports1/800/600',
    publishedAt: new Date().toISOString(),
    author: 'Budi Santoso',
  },
  {
    id: '3',
    title: 'Tren Gaya Hidup Minimalis di Kota Besar',
    summary: 'Mengapa semakin banyak kaum urban memilih hidup sederhana di tengah hiruk pikuk Jakarta.',
    content: 'Minimalisme bukan sekadar tentang merapikan rumah, tapi tentang kejernihan pikiran dan prioritas hidup yang lebih bermakna...',
    category: Category.LIFESTYLE,
    imageUrl: 'https://picsum.photos/seed/life1/800/600',
    publishedAt: new Date().toISOString(),
    author: 'Siti Aminah',
  },
  {
    id: '4',
    title: 'AI Mengubah Lanskap Industri Kreatif Global',
    summary: 'Kecerdasan buatan membuka peluang baru sekaligus tantangan etis dalam dunia kreativitas.',
    content: 'Dari musik hingga desain, AI kini menjadi mitra kreatif yang menghadirkan dimensi baru dalam berkarya. Namun pertanyaan tentang originalitas dan hak cipta tetap mengemuka...',
    category: Category.TECH,
    imageUrl: 'https://picsum.photos/seed/ai1/800/600',
    publishedAt: new Date().toISOString(),
    author: 'Dr. Rina Wijaya',
  },
  {
    id: '5',
    title: 'Pasar Saham Asia Menguat di Tengah Ketidakpastian Global',
    summary: 'Investor regional menunjukkan optimisme meski geopolitik masih penuh tantangan.',
    content: 'Bursa saham di kawasan Asia Tenggara mencatat penguatan signifikan dalam sepekan terakhir, didorong oleh data ekonomi yang lebih baik dari perkiraan...',
    category: Category.ECONOMY,
    imageUrl: 'https://picsum.photos/seed/market1/800/600',
    publishedAt: new Date().toISOString(),
    author: 'Ahmad Fauzi',
  },
  {
    id: '6',
    title: 'Politik Energi dan Masa Depan Transisi Hijau Indonesia',
    summary: 'Antara ambisi net-zero dan realitas ketergantungan energi fosil.',
    content: 'Pemerintah Indonesia menetapkan target ambisius untuk mencapai net-zero emission pada 2060. Namun transisi dari batu bara ke energi terbarukan memerlukan investasi triliunan rupiah...',
    category: Category.POLITICS,
    imageUrl: 'https://picsum.photos/seed/politics1/800/600',
    publishedAt: new Date().toISOString(),
    author: 'Linda Kurniawan',
  }
];
