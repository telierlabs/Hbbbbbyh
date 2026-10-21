import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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

const cdata = (t) => String(t || '').replace(/]]>/g, ']]]]><![CDATA[>');

async function generateNewsSitemap() {
  const snapshot = await getDocs(
    query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(50))
  );

  const all = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const d = new Date(data.publishedAt);
    if (isNaN(d.getTime())) return;
    all.push({
      id: doc.id,
      title: data.title || '',
      time: d.getTime(),
      publishedAt: d.toISOString()
    });
  });

  const cutoff = Date.now() - 2 * 24 * 60 * 60 * 1000;
  let articles = all.filter(a => a.time >= cutoff);

  // Kalau tidak ada artikel 2 hari terakhir, tetap bikin file valid
  // dengan 5 artikel terbaru supaya sitemap tidak hilang.
  if (articles.length === 0) {
    articles = all.slice(0, 5);
    console.log('⚠️ Tidak ada artikel 2 hari terakhir, pakai 5 artikel terbaru sebagai fallback');
  }

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
      <news:title><![CDATA[${cdata(a.title)}]]></news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/news-sitemap.xml'), sitemap);
  console.log(`✅ News sitemap: ${articles.length} artikel`);
  process.exit(0);
}

generateNewsSitemap();
