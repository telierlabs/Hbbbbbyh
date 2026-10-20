import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: process.env.FB_API,
  authDomain: process.env.FB_AUTH,
  projectId: process.env.FB_PID,
  storageBucket: process.env.FB_STOR,
  messagingSenderId: process.env.FB_SID,
  appId: process.env.FB_AID,
  measurementId: process.env.FB_MID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE = 'https://www.teliernews.com';
const STATIC_PAGES = [
  '/world', '/about', '/editorial', '/team', '/contact',
  '/careers', '/help', '/privacy', '/terms', '/cookies',
];

const safeDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
};

async function generateSitemap() {
  const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
  const snapshot = await getDocs(q);
  const articles = [];
  const categories = new Map();

  snapshot.forEach(doc => {
    const data = doc.data();
    const date = safeDate(data.publishedAt);
    articles.push({ id: doc.id, date });

    const cat = String(data.category || '').trim();
    if (cat && !categories.has(cat)) categories.set(cat, date);
  });

  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  urls.push(`  <url><loc>${BASE}</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>`);

  for (const [name, date] of categories) {
    urls.push(
      `  <url><loc>${BASE}/category/${encodeURIComponent(name)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}<priority>0.7</priority></url>`
    );
  }

  for (const p of STATIC_PAGES) {
    urls.push(`  <url><loc>${BASE}${p}</loc><priority>0.5</priority></url>`);
  }

  for (const a of articles) {
    urls.push(
      `  <url><loc>${BASE}/news/${a.id}</loc>${a.date ? `<lastmod>${a.date}</lastmod>` : ''}<priority>0.8</priority></url>`
    );
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
  console.log(`✅ Sitemap: ${articles.length} artikel, ${categories.size} kategori, ${STATIC_PAGES.length} halaman statis`);
  process.exit(0);
}

generateSitemap();
