export interface ContentBlock {
  type: 'image' | 'text' | 'video';
  content: string;
  caption?: string;
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
