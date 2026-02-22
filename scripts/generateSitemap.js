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

async function generateSitemap() {
  const q = query(collection(db, 'articles'), orderBy('publishedAt', 'desc'));
  const snapshot = await getDocs(q);
  const articles = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    articles.push({
      id: doc.id,
      date: new Date(data.publishedAt).toISOString().split('T')[0]
    });
  });

  const today = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.teliernews.com</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${articles.map(a => `  <url><loc>https://www.teliernews.com/news/${a.id}</loc><lastmod>${a.date}</lastmod><priority>0.8</priority></url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
  console.log(`✅ Sitemap: ${articles.length} artikel`);
  process.exit(0);
}

generateSitemap();
