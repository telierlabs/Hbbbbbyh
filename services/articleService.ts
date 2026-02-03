import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle } from '../types';

const ARTICLES_COLLECTION = 'articles';

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

// Add new article to Firestore
export const addArticle = async (article: Omit<NewsArticle, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...article,
      publishedAt: article.publishedAt || new Date().toISOString()
    });
    
    console.log('✅ Article added with ID:', docRef.id);
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
