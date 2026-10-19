import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const firebaseConfig = {
  apiKey: process.env.FB_API,
  authDomain: process.env.FB_AUTH,
  projectId: process.env.FB_PID,
  storageBucket: process.env.FB_STOR,
  messagingSenderId: process.env.FB_SID,
  appId: process.env.FB_AID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// 'google' mencakup Googlebot, Mediapartners-Google (bot AdSense),
// AdsBot-Google, Google-InspectionTool, GoogleOther, dll.
const BOT_KEYWORDS = [
  'google', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'facebookexternalhit', 'twitterbot',
  'linkedinbot', 'whatsapp', 'telegrambot', 'applebot',
];

const isBot = (ua: string = ''): boolean => {
  const lower = ua.toLowerCase();
  return BOT_KEYWORDS.some(k => lower.includes(k));
};

const esc = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const readIndex = (): string | null => {
  try {
    return readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  } catch {
    return null;
  }
};

const ADSENSE_TAG =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5401422175634449" crossorigin="anonymous"></script>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  res.setHeader('Vary', 'User-Agent');

  // Pengunjung biasa: kirim SPA seperti sebelumnya
  if (!isBot(userAgent)) {
    const index = readIndex();
    if (index) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(index);
    }
    res.setHeader('Location', '/');
    return res.status(302).end();
  }

  try {
    const snap = await getDoc(doc(db, 'articles', id as string));

    if (!snap.exists()) {
      return res.status(404).send('<html><body>Article not found</body></html>');
    }

    const article = snap.data()!;
    const title = article.title || 'TelierNews';
    const description = article.summary || 'Portal berita terpercaya, aktual, dan mendalam.';
    const image = article.imageUrl || 'https://www.teliernews.com/og-default.jpg';
    const author = article.author || 'TelierNews';
    const publishedAt = article.publishedAt || new Date().toISOString();
    const category = article.category || 'News';
    const url = `https://www.teliernews.com/news/${id}`;

    // ⚠️ GANTI nama field ini kalau isi artikel di Firestore namanya beda
    const raw = String(article.content ?? article.body ?? article.text ?? '');
    const looksHtml = /<\/?[a-z][\s\S]*?>/i.test(raw);
    const bodyHtml = looksHtml
      ? raw
      : raw
          .split(/\n+/)
          .filter(Boolean)
          .map(p => `<p>${esc(p)}</p>`)
          .join('');

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description,
      image: [image],
      datePublished: publishedAt,
      dateModified: publishedAt,
      author: { '@type': 'Person', name: author },
      publisher: {
        '@type': 'Organization',
        name: 'TelierNews',
        logo: { '@type': 'ImageObject', url: 'https://www.teliernews.com/favicon.ico' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: category,
      url,
    }).replace(/</g, '\\u003c');

    const headTags = `
  <title>${esc(title)} - TelierNews</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="author" content="${esc(author)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="TelierNews" />
  <meta property="article:published_time" content="${esc(publishedAt)}" />
  <meta property="article:author" content="${esc(author)}" />
  <meta property="article:section" content="${esc(category)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <script type="application/ld+json">${schema}</script>
`;

    const staticBody = `
<header><a href="/">TelierNews</a></header>
<article>
  <h1>${esc(title)}</h1>
  <p>${esc(author)} · ${esc(category)} · ${esc(publishedAt)}</p>
  <img src="${esc(image)}" alt="${esc(title)}" />
  <p><strong>${esc(description)}</strong></p>
  ${bodyHtml}
</article>
<footer>
  <nav>
    <a href="/about">About</a>
    <a href="/editorial">Editorial</a>
    <a href="/contact">Contact</a>
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
    <a href="/cookies">Cookie Policy</a>
  </nav>
  <p>© 2026 TelierNews</p>
</footer>`;

    const index = readIndex();
    let html: string;

    if (index) {
      html = index
        .replace(/<title>[\s\S]*?<\/title>/i, '')
        .replace(/<meta\s+(?:property="og:|name="twitter:|name="description")[^>]*>/gi, '')
        .replace('</head>', `${headTags}</head>`);

      if (/<div id="root">\s*<\/div>/i.test(html)) {
        html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${staticBody}</div>`);
      } else {
        html = html.replace('</body>', `<div>${staticBody}</div></body>`);
      }
    } else {
      html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${headTags}
  ${ADSENSE_TAG}
</head>
<body>${staticBody}</body>
</html>`;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Prerender error:', err);
    return res.status(500).send('<html><body>Server error</body></html>');
  }
}
