import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle } from '../types';

const ARTICLES_COLLECTION = 'articles';

// AUTO GENERATE SLUG: YYYY-MM-DD-CATEGORY-TITLE
export const generateSlug = (title: string, category: string, publishedAt: string): string => {
  // Format tanggal: 2026-02-08
  const date = new Date(publishedAt).toISOString().split('T')[0];
  
  // Format kategori: markets, technology, dll (lowercase, no spaces)
  const categorySlug = category
    .toLowerCase()
    .replace(/\s+/g, '-');
  
  // Format judul: mengapa-warren-buffett-lebih-menyukai-perak
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter spesial
    .replace(/\s+/g, '-')         // Spasi jadi dash
    .replace(/-+/g, '-')          // Multiple dash jadi satu
    .substring(0, 80);            // Max 80 karakter untuk judul
  
  // Gabungkan: 2026-02-08-markets-mengapa-warren-buffett
  return `${date}-${categorySlug}-${titleSlug}`;
};

// Fetch all articles from Firestore
export const fetchArticles = async (): Promise<NewsArticle[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((docSnapshot) => {
      articles.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      } as NewsArticle);
    });
    
    console.log('✅ Fetched', articles.length, 'articles from Firestore');
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return [];
  }
};

// FETCH ARTICLE BY SLUG
export const fetchArticleBySlug = async (slug: string): Promise<NewsArticle | null> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Article not found with slug:', slug);
      return null;
    }
    
    const docSnapshot = querySnapshot.docs[0];
    return {
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as NewsArticle;
  } catch (error) {
    console.error('❌ Error fetching article by slug:', error);
    return null;
  }
};

// Add new article to Firestore
export const addArticle = async (article: Omit<NewsArticle, 'id'>): Promise<string | null> => {
  try {
    const publishedAt = article.publishedAt || new Date().toISOString();
    
    // AUTO GENERATE SLUG: TANGGAL-KATEGORI-JUDUL
    const slug = generateSlug(article.title, article.category, publishedAt);
    
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...article,
      slug: slug, // SIMPAN SLUG
      publishedAt: publishedAt
    });
    
    console.log('✅ Article added with ID:', docRef.id);
    console.log('✅ Slug:', slug);
    console.log('✅ URL:', `https://teliernews.com/news/${slug}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding article:', error);
    alert('Error: Gagal menyimpan artikel ke Firestore. Cek console!');
    return null;
  }
};

// Delete article from Firestore
export const deleteArticle = async (articleId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, ARTICLES_COLLECTION, articleId));
    console.log('✅ Article deleted:', articleId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting article:', error);
    alert('Error: Gagal menghapus artikel. Cek console!');
    return false;
  }
};
