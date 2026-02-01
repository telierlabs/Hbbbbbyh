
import { NewsArticle, Category } from './types';

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
  }
];
