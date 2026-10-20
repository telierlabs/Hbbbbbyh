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
  measurementId: process.env.FB_MID,
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const CATEGORIES = [
  'Technology', 'Artificial Intelligence', 'Markets', 'Business',
  'Politics', 'Geopolitics', 'Science', 'Wealth',
];

async function generateHome() {
  const indexPath = path.join(__dirname, '../dist/index.html');

  if (!fs.existsSync(indexPath)) {
    console.log('⚠️ dist/index.html tidak ditemukan, skip');
    process.exit(0);
  }

  let html = fs.readFileSync(indexPath, 'utf-8');

  if (!/<div id="root">\s*<\/div>/i.test(html)) {
    console.log('⚠️ <div id="root"></div> tidak ditemukan di index.html, skip');
    process.exit(0);
  }

  let articles = [];
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snap = await getDocs(
      query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(200))
    );
    snap.forEach((d) => {
      const data = d.data();
      const dt = new Date(data.publishedAt);
      articles.push({
        id: d.id,
        title: data.title || '',
        summary: String(data.summary || '').trim(),
        category: data.category || 'News',
        date: isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10),
      });
    });
  } catch (e) {
    console.log('⚠️ Gagal ambil artikel, index.html dibiarkan apa adanya:', e.message);
    process.exit(0);
  }

  if (articles.length === 0) {
    console.log('⚠️ Tidak ada artikel, skip');
    process.exit(0);
  }

  const list = articles
    .map((a) => {
      const summaryHtml =
        a.summary.length >= 40
          ? `<p>${esc(a.summary)}</p>`
          : '';
      return `
    <article>
      <p>${esc(a.category)} · ${esc(a.date)}</p>
      <h3><a href="/news/${a.id}">${esc(a.title)}</a></h3>
      ${summaryHtml}
    </article>`;
    })
    .join('');

  const cats = CATEGORIES.map(
    (c) => `<a href="/category/${encodeURIComponent(c)}">${esc(c)}</a>`
  ).join(' ');

  // Disembunyikan secara visual supaya pengunjung tidak melihat "kilatan" teks polos
  // sebelum aplikasi tampil. Isinya tetap ada di HTML untuk crawler.
  const staticHome = `
<div data-prerendered="home" style="position:absolute;left:-10000px;top:0;width:1px;height:1px;overflow:hidden">
  <header>
    <p><a href="/">TELIERNEWS</a></p>
    <h1>Berita Teknologi, Geopolitik, dan Pasar</h1>
    <p>Teknologi, geopolitik, dan masa depan — dalam satu tempat.</p>
  </header>
  <main>
    <h2>Berita Terbaru</h2>
    ${list}
  </main>
  <footer>
    <p>${cats}</p>
    <p>
      <a href="/about">About</a>
      <a href="/editorial">Editorial</a>
      <a href="/contact">Contact</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/cookies">Cookie Policy</a>
    </p>
    <p>© 2026 TelierNews</p>
  </footer>
</div>`;

  html = html.replace(/<div id="root">\s*<\/div>/i, () => `<div id="root">${staticHome}</div>`);

  // Catatan: sengaja TIDAK menambah canonical di sini, karena index.html
  // dipakai semua halaman (About, Privacy, kategori, dll).
  if (!/<meta\s+name="description"/i.test(html)) {
    html = html.replace(
      '</head>',
      () =>
        '<meta name="description" content="Portal berita teknologi, geopolitik, dan pasar. Berita terpercaya, aktual, dan mendalam." />\n</head>'
    );
  }

  fs.writeFileSync(indexPath, html);
  console.log(`✅ Home prerender: ${articles.length} artikel disuntik ke dist/index.html`);
  process.exit(0);
}

generateHome();
