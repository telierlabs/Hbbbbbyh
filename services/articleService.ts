import { 
  collection, addDoc, getDocs, deleteDoc, 
  doc, query, orderBy, updateDoc,
  setDoc, increment, onSnapshot, getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle } from '../types';

const ARTICLES_COLLECTION = 'articles';
const VIEWS_COLLECTION = 'views';
const BOOKMARKS_COLLECTION = 'bookmarks';

const SA_KEY = import.meta.env.SA_KEY || '';
const GOOGLE_SA_EMAIL = 'telier-indexer@gen-lang-client-0057139992.iam.gserviceaccount.com';

const makeJWT = async (): Promise<string> => {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: GOOGLE_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now,
  };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const sigInput = `${headerB64}.${payloadB64}`;
  const pemBody = SA_KEY
    .replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '')
    .replace(/\\n/g, '').replace(/\n/g, '');
  const binaryDer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(sigInput));
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
  } catch (err) { console.warn('⚠️ Google Indexing gagal:', err); }
};

const notifyIndexNow = async (url: string): Promise<void> => {
  try {
    const KEY = 'teliernews2026';
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'www.teliernews.com', key: KEY,
        keyLocation: `https://www.teliernews.com/${KEY}.txt`,
        urlList: [url],
      }),
    });
    console.log('✅ IndexNow notified:', url);
  } catch (err) { console.warn('⚠️ IndexNow gagal:', err); }
};

export const fetchArticles = async (): Promise<NewsArticle[]> => {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), orderBy('publishedAt', 'desc'));
    const snap = await getDocs(q);
    const articles: NewsArticle[] = [];
    snap.forEach(d => articles.push({ id: d.id, ...d.data() } as NewsArticle));
    console.log('✅ Fetched', articles.length, 'articles');
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return [];
  }
};

export const addArticle = async (article: Omit<NewsArticle, 'id'>): Promise<string | null> => {
  try {
    const clean = JSON.parse(JSON.stringify({ ...article, publishedAt: article.publishedAt || new Date().toISOString() }));
    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), clean);
    console.log('✅ Article added:', docRef.id);
    await setDoc(doc(db, VIEWS_COLLECTION, docRef.id), { count: 0 });
    const url = `https://www.teliernews.com/news/${docRef.id}`;
    await Promise.allSettled([notifyGoogleIndexing(url), notifyIndexNow(url)]);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding article:', error);
    alert('Gagal menyimpan artikel ke Firestore!');
    return null;
  }
};

export const updateArticle = async (articleId: string, updates: Partial<NewsArticle>): Promise<boolean> => {
  try {
    const clean = JSON.parse(JSON.stringify(updates));
    await updateDoc(doc(db, ARTICLES_COLLECTION, articleId), clean);
    console.log('✅ Article updated:', articleId);
    const url = `https://www.teliernews.com/news/${articleId}`;
    await Promise.allSettled([notifyGoogleIndexing(url), notifyIndexNow(url)]);
    return true;
  } catch (error) {
    console.error('❌ Error updating article:', error);
    alert('Gagal update artikel!');
    return false;
  }
};

export const deleteArticle = async (articleId: string): Promise<boolean> => {
  try {
    if (articleId.startsWith('temp_')) { alert('Artikel ini tidak tersimpan di database.'); return false; }
    await deleteDoc(doc(db, ARTICLES_COLLECTION, articleId));
    try { await deleteDoc(doc(db, VIEWS_COLLECTION, articleId)); } catch {}
    console.log('✅ Article deleted:', articleId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting article:', error);
    alert('Gagal menghapus artikel!');
    return false;
  }
};

// ── VIEWS ──

export const incrementViews = async (articleId: string): Promise<void> => {
  try {
    const sessionKey = `tn_viewed_${articleId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
    const viewRef = doc(db, VIEWS_COLLECTION, articleId);
    await setDoc(viewRef, { count: increment(1) }, { merge: true });
  } catch (err) {
    console.warn('Views increment error:', err);
  }
};

export const subscribeToViews = (
  articleId: string,
  callback: (count: number) => void
): (() => void) => {
  const viewRef = doc(db, VIEWS_COLLECTION, articleId);
  const unsub = onSnapshot(viewRef, (snap) => {
    callback(snap.exists() ? (snap.data()?.count || 0) : 0);
  });
  return unsub;
};

export const fetchViews = async (articleId: string): Promise<number> => {
  try {
    const snap = await getDoc(doc(db, VIEWS_COLLECTION, articleId));
    return snap.exists() ? (snap.data()?.count || 0) : 0;
  } catch {
    return 0;
  }
};

export const formatViews = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
};

// ── BOOKMARKS (Firebase) ──

export interface BookmarkItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  savedAt: number;
}

// localStorage helpers (fallback saat belum login)
const LS_KEY = 'tn_bookmarks';
const getLSBookmarks = (): BookmarkItem[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};
const setLSBookmarks = (bms: BookmarkItem[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(bms));
};

// Simpan bookmark — Firebase jika login, localStorage jika tidak
export const saveBookmark = async (userId: string | null, item: BookmarkItem): Promise<void> => {
  if (userId) {
    try {
      await setDoc(
        doc(db, BOOKMARKS_COLLECTION, userId, 'articles', item.id),
        item
      );
      console.log('✅ Bookmark saved to Firebase:', item.id);
      return;
    } catch (err) {
      console.warn('Bookmark Firebase error, fallback LS:', err);
    }
  }
  // Fallback localStorage
  const bms = getLSBookmarks();
  if (!bms.find(b => b.id === item.id)) {
    bms.unshift(item);
    setLSBookmarks(bms);
  }
  window.dispatchEvent(new Event('bookmarks-updated'));
};

// Hapus bookmark
export const removeBookmark = async (userId: string | null, articleId: string): Promise<void> => {
  if (userId) {
    try {
      await deleteDoc(doc(db, BOOKMARKS_COLLECTION, userId, 'articles', articleId));
      console.log('✅ Bookmark removed from Firebase:', articleId);
      return;
    } catch (err) {
      console.warn('Bookmark remove Firebase error, fallback LS:', err);
    }
  }
  // Fallback localStorage
  setLSBookmarks(getLSBookmarks().filter(b => b.id !== articleId));
  window.dispatchEvent(new Event('bookmarks-updated'));
};

// Cek apakah artikel ter-bookmark
export const isBookmarked = async (userId: string | null, articleId: string): Promise<boolean> => {
  if (userId) {
    try {
      const snap = await getDoc(doc(db, BOOKMARKS_COLLECTION, userId, 'articles', articleId));
      return snap.exists();
    } catch {
      return false;
    }
  }
  return getLSBookmarks().some(b => b.id === articleId);
};

// Fetch semua bookmark user
export const fetchBookmarks = async (userId: string | null): Promise<BookmarkItem[]> => {
  if (userId) {
    try {
      const snap = await getDocs(
        query(collection(db, BOOKMARKS_COLLECTION, userId, 'articles'), orderBy('savedAt', 'desc'))
      );
      const bms: BookmarkItem[] = [];
      snap.forEach(d => bms.push(d.data() as BookmarkItem));
      return bms;
    } catch (err) {
      console.warn('Fetch bookmarks Firebase error, fallback LS:', err);
    }
  }
  return getLSBookmarks();
};

// Subscribe realtime bookmarks (hanya Firebase)
export const subscribeToBookmarks = (
  userId: string,
  callback: (bms: BookmarkItem[]) => void
): (() => void) => {
  const q = query(
    collection(db, BOOKMARKS_COLLECTION, userId, 'articles'),
    orderBy('savedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const bms: BookmarkItem[] = [];
    snap.forEach(d => bms.push(d.data() as BookmarkItem));
    callback(bms);
  });
};
