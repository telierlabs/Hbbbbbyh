export interface ContentBlock {
  type: 'image' | 'text';
  content: string; // URL untuk image, text untuk text
}

export interface NewsArticle {
  id: string;
  title: string;
  slug?: string; // NEW: URL-friendly slug
  content: string; // Fallback untuk artikel lama
  contentBlocks?: ContentBlock[]; // NEW: untuk multiple images + text
  category: Category;
  imageUrl: string; // Main thumbnail
  publishedAt: string;
  author: string;
  summary: string;
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
