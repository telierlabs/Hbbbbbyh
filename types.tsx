// Jenis blok isi artikel.
// text/image/video = blok lama. stats/table/chart/timeline/quote = blok visual (data ada di `data`).
export type BlockType = 'image' | 'text' | 'video' | 'stats' | 'table' | 'chart' | 'timeline' | 'quote';

export interface ContentBlock {
  type: BlockType;
  content: string;
  caption?: string;
  data?: any; // khusus blok visual, bentuknya lihat components/DataBlocks.tsx
}

// Halaman artikel (untuk novel-style reading)
export interface ArticlePage {
  blocks: ContentBlock[];
}

// Item carousel header (foto atau video)
export interface CarouselItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

// Tipe artikel: berita biasa atau deep dive
export type ArticleType = 'regular' | 'deepdive';

export interface NewsArticle {
  id: string;
  title: string;
  content: string; // Fallback untuk artikel lama
  contentBlocks?: ContentBlock[]; // Fallback lama
  pages?: ArticlePage[]; // NEW: novel-style pages
  carouselItems?: CarouselItem[]; // NEW: multiple header media
  category: Category;
  imageUrl: string; // Main thumbnail (fallback)
  publishedAt: string;
  author: string;
  summary: string;
  aiInsight?: string[]; // NEW: cached AI insight points
  articleType?: ArticleType; // NEW: kosong = berita biasa
  country?: string; // NEW: kode negara (lihat countries.ts), '' = global
  timeline?: string; // NEW: nama News Timeline ('' / kosong = bukan bagian dari timeline)
  views?: number;
}

export enum Category {
  TECH = 'Technology',
  AI = 'Artificial Intelligence',
  MARKETS = 'Markets',
  BUSINESS = 'Business',
  POLITICS = 'Politics',
  GEOPOLITICS = 'Geopolitics',
  SCIENCE = 'Science',
  WEALTH = 'Wealth',
  SPORTS = 'Olahraga',
  LIFESTYLE = 'Gaya Hidup',
  ECONOMY = 'Ekonomi'
}

export interface NewsState {
  articles: NewsArticle[];
}
