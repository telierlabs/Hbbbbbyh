import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
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

async function generateNewsSitemap() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const q = query(
    collection(db, 'articles'),
    orderBy('publishedAt', 'desc'),
    where('publishedAt', '>=', twoDaysAgo.toISOString())
  );

  const snapshot = await getDocs(q);
  const articles = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    articles.push({
      id: doc.id,
      title: data.title || '',
      publishedAt: new Date(data.publishedAt).toISOString()
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles.map(a => `  <url>
    <loc>https://www.teliernews.com/news/${a.id}</loc>
    <news:news>
      <news:publication>
        <news:name>Telier News</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/news-sitemap.xml'), sitemap);
  console.log(`✅ News sitemap: ${articles.length} artikel`);
  process.exit(0);
}

generateNewsSitemap();
