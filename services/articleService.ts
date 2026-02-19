import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle } from '../types';

const ARTICLES_COLLECTION = 'articles';

// ============================================
// GOOGLE INDEXING API — pakai service account
// ============================================
const GOOGLE_SA = {
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3EzRxrV6UEDYf\n7q2SCKFanECMVYjQE3m4m8JYJI+EpfyHK77HMgALZVfsyMrPcFJ6aKRrLTWFIN8C\nC4Eyq+Pdqx13DghokoFbWY/BMD8n4UNhuc6Q6BEf0k2wiQ6PSX6KGgpEAMOTxjVH\nC+/o8gWricffat5Yc5VIvkijDUr6h1Xb8JnP18GV3UcHeHJXly6Lb0gKZJY4RWit\n44hmyvYh6ERC4YHPBHMQIP//5jthzLC+Vf0A1p65ZxaGibU4X68MYQRPKvlbzn/L\nRGh5wAA7P00sv63dZcW0yWIw+htC8yKXYSMZqEXMmClbXjK/DZGjW4GuzpyuwdlH\nWNdZ4bkVAgMBAAECggEACIQ9cpNa3L7zUaF4FBzQKsetjgm1m15okXC3hgOvZH+X\nQ4+CqMAX9e/BOxvtKWDDiXvAOFcqT/bjQPRZjoqmB0wcSwtNU1YLa/063YUZzwhg\n6tUquZ1+HHGbWRzLH1nPJ+wFsbuqXX/BPzycLMVDg8MdV/SgAtPfrDpj5SfrZsOc\nUucRnMkO4hu7L/Gtke4xYBBoBIVkEY1o1PUc2M1DslKVNE4BJXJ8d/Q6ura3U9Zj\nsbiOd6kMqdFFSeVYioAYMlo+y06jbRDODdJ8BuDQRLr210gYhx8+PqSVXBS7YdJN\nuB1MXqw5IKRENKs1zB36dehGhdNzysdbzJw3zqghuQKBgQDcdVVFounRKPysMys8\nBWL9YB/x2SYv4AVj9i5PJFshUIFQLscIUHwl0Xoe51ob4Kcaw6xu1QZYFCB8eORI\nXh7/e7qL+U3rm2Fr9ACq/+HnyFwjNWBzDbScSip9nKHh0iFQXX1r6Oc3XZRR5wan\nSvk8Q5MZkxMyehvKEG2IdoBK2QKBgQDUlwC4TLKEXUqh87I/G5TAZgBgzK2BB9Ss\nil6QMghXAR1vu2ovpdGXtYj98adDNS3FKQ4XnCQ3tdgcYUSSi+X7n8+/2fkfKHcP\nS79FXsJPfJZTkr2bEDMH4Wi2NwFsuF3QmHqb4ctsHLwE4xU7spIyPieMmvJs7602\nEt/E9XsinQKBgDHoDem5u5yx3qFM5BiuT350aEbjlZV47T9313vrCwY7p0pzjHMB\nZVlaVn7weKGe9bVFXp+occs2ozQKWgNX60SCyfQt98nCXweFMTGEw6so3FLMHo1t\nKNnIoF3XO35Xh1seDuqCyvTppk30Mrlka4+M7Jv5g3sF0Yyos2MVEG3hAoGBAJpO\n6RTdhw6Q8OVREGbCTFzDLS8WIjJwTqzW2wDrcCZHBujdLpxbTiFCgadiSrh71zcv\nL61vhtJxSeZ/q9h7d3oHbDKjszIsmw8dOj7OI1iy5CLRdpMhVQk5UlpA3uXdhSsu\nIoEXiiJ1UPxzICxu17NkbiyfI6xy5FVFqes7DB/5AoGARN9hcpSICxbtIbnzlBCs\nDqdbQDDrqeQD5CAhrqpol6x2e3FXcDnvqGGSO7Z3wJlgPMd/aAb9dCcMEvTv7pIO\n4O/zZyFC1sLrujO5zoccXEtE5O8zJjmJte/kEyzuWEX1MGMF/47H5h0g+7xBkhki\nUAg0/woWahEJy9gGNmRDFP8=\n-----END PRIVATE KEY-----\n",
  client_email: "telier-indexer@gen-lang-client-0057139992.iam.gserviceaccount.com",
};

// Buat JWT token untuk Google API
const makeJWT = async (): Promise<string> => {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: GOOGLE_SA.client_email,
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

  // Import private key
  const pemBody = GOOGLE_SA.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
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
    const token = await getGoogleAccessToken();
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    });
    const data = await res.json();
    console.log('✅ Google Indexing API:', data);
  } catch (err) {
    console.warn('⚠️ Google Indexing API gagal (non-fatal):', err);
  }
};

// ============================================
// INDEXNOW — backup, gratis, ping Bing+Google
// ============================================
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

// ============================================
// FIRESTORE CRUD
// ============================================
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

    // Ping keduanya secara paralel
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
