import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDli6R1N98VxK89r788yPyBne-839LVFys",
  authDomain: "teliernews-f730a.firebaseapp.com",
  projectId: "teliernews-f730a",
  storageBucket: "teliernews-f730a.firebasestorage.app",
  messagingSenderId: "339087493380",
  appId: "1:339087493380:web:7852e353adfbb1fe936851",
  measurementId: "G-1P7S89VCGK"
};

async function generateSitemap() {
  try {
    console.log('🔄 Generating sitemap from Firebase...');
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const articles = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      articles.push({
        id: docSnapshot.id,
        slug: data.slug, // USE SLUG!
        date: data.publishedAt ? 
          new Date(data.publishedAt).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        priority: '0.8'
      });
    });

    console.log(`✅ Found ${articles.length} articles from Firebase`);

    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  
  <url>
    <loc>https://teliernews.com</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://teliernews.com/subscribe</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://teliernews.com/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
${articles.map(article => {
  // USE SLUG IF AVAILABLE, FALLBACK TO ID
  const url = article.slug ? article.slug : article.id;
  return `
  <url>
    <loc>https://teliernews.com/news/${url}</loc>
    <lastmod>${article.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${article.priority}</priority>
  </url>`;
}).join('')}

</urlset>`;

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated at public/sitemap.xml');
    console.log(`📊 Total URLs: ${articles.length + 3}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
