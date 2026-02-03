export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: Category;
  imageUrl: string;
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
