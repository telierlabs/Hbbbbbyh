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

// Private key dari Vercel env — tidak di-hardcode di kode
const SA_KEY = import.meta.env.SA_KEY || '';
const GOOGLE_SA_EMAIL = 'telier-indexer@gen-lang-client-0057139992.iam.gserviceaccount.com';

const makeJWT = async (): Promise<string> => {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: GOOGLE_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const sigInput = `${headerB64}.${payloadB64}`;
  const pemBody = SA_KEY
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\\n/g, '')
    .replace(/\n/g, '');
  const binaryDer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(sigInput)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${sigInput}.${sigB64}`;
};

const getGoogleAccessToken = async (): Promise<string> => {
  const jwt = await makeJWT();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  return data.access_token;
};

const notifyGoogleIndexing = async (url: string): Promise<void> => {
  try {
    if (!SA_KEY) return;
    const token = await getGoogleAccessToken();
    await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    });
    console.log('✅ Google Indexing notified:', url);
  } catch (err) {
    console.warn('⚠️ Google Indexing gagal (non-fatal):', err);
  }
};

const notifyIndexNow = async (url: string): Promise<void> => {
  try {
    const KEY = 'teliernews2026';
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'www.teliernews.com',
        key: KEY,
        keyLocation: `https://www.teliernews.com/${KEY}.txt`,
        urlList: [url],
      }),
    });
    console.log('✅ IndexNow notified:', url);
  } catch (err) {
    console.warn('⚠️ IndexNow gagal (non-fatal):', err);
  }
};

export const fetchArticles = async (): Promise<NewsArticle[]> => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const articles: NewsArticle[] = [];
    querySnapshot.forEach((docSnapshot) => {
      articles.push({ id: docSnapshot.id, ...docSnapshot.data() } as NewsArticle);
    });
    console.log('✅ Fetched', articles.length, 'articles');
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return [];
  }
};

export const addArticle = async (article: Omit<NewsArticle, 'id'>): Promise<string | null> => {
  try {
    const cleanArticle = JSON.parse(JSON.stringify({
      ...article,
      publishedAt: article.publishedAt || new Date().toISOString(),
    }));
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), cleanArticle);
    console.log('✅ Article added:', docRef.id);
    const articleUrl = `https://www.teliernews.com/news/${docRef.id}`;
    await Promise.allSettled([
      notifyGoogleIndexing(articleUrl),
      notifyIndexNow(articleUrl),
    ]);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding article:', error);
    alert('Gagal menyimpan artikel ke Firestore!');
    return null;
  }
};

export const deleteArticle = async (articleId: string): Promise<boolean> => {
  try {
    if (articleId.startsWith('temp_')) {
      alert('Artikel ini tidak tersimpan di database. Refresh halaman.');
      return false;
    }
    await deleteDoc(doc(db, ARTICLES_COLLECTION, articleId));
    console.log('✅ Article deleted:', articleId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting article:', error);
    alert('Gagal menghapus artikel!');
    return false;
  }
};
