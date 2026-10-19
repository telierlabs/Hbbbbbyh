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
          ? `<p style="margin:0;font-size:14px;color:#aaa">${esc(a.summary)}</p>`
          : '';
      return `
    <article style="padding:16px 0;border-bottom:1px solid #222">
      <p style="margin:0 0 4px;font-size:12px;color:#aaa">${esc(a.category)} · ${esc(a.date)}</p>
      <h3 style="margin:0 0 6px;font-size:18px"><a href="/news/${a.id}" style="color:#fff;text-decoration:none">${esc(a.title)}</a></h3>
      ${summaryHtml}
    </article>`;
    })
    .join('');

  const cats = CATEGORIES.map(
    (c) => `<a href="/category/${encodeURIComponent(c)}" style="color:#aaa;margin-right:12px">${esc(c)}</a>`
  ).join('');

  const staticHome = `
<div data-prerendered="home" style="background:#000;color:#fff;min-height:100vh;padding:24px 20px;font-family:sans-serif">
  <header>
    <p style="margin:0 0 8px"><a href="/" style="color:#fff;font-weight:700;text-decoration:none">TELIERNEWS</a></p>
    <h1 style="margin:0 0 8px;font-size:22px">Berita Teknologi, Geopolitik, dan Pasar</h1>
    <p style="margin:0 0 20px;color:#aaa;font-size:14px">Teknologi, geopolitik, dan masa depan — dalam satu tempat.</p>
  </header>
  <main>
    <h2 style="font-size:16px;text-transform:uppercase;margin:0 0 8px">Berita Terbaru</h2>
    ${list}
  </main>
  <footer style="margin-top:32px;font-size:14px">
    <p>${cats}</p>
    <p>
      <a href="/about" style="color:#aaa;margin-right:12px">About</a>
      <a href="/editorial" style="color:#aaa;margin-right:12px">Editorial</a>
      <a href="/contact" style="color:#aaa;margin-right:12px">Contact</a>
      <a href="/privacy" style="color:#aaa;margin-right:12px">Privacy Policy</a>
      <a href="/terms" style="color:#aaa;margin-right:12px">Terms of Service</a>
      <a href="/cookies" style="color:#aaa">Cookie Policy</a>
    </p>
    <p style="color:#666">© 2026 TelierNews</p>
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
