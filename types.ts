
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
  POLITICS = 'Politik',
  TECH = 'Teknologi',
  SPORTS = 'Olahraga',
  LIFESTYLE = 'Gaya Hidup',
  ECONOMY = 'Ekonomi'
}

export interface NewsState {
  articles: NewsArticle[];
}
