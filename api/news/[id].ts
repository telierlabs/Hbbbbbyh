import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Init Firebase Admin (hanya sekali)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Daftar user-agent bot yang butuh prerender
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'twitterbot', 'linkedinbot', 'whatsapp',
  'telegrambot', 'applebot', 'google-structured-data',
];

const isBot = (ua: string = ''): boolean => {
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(bot => lower.includes(bot));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  // Kalau bukan bot, redirect ke SPA biasa
  if (!isBot(userAgent)) {
    res.setHeader('Location', `/news/${id}`);
    return res.status(302).end();
  }

  try {
    // Fetch artikel dari Firestore
    const snap = await db.collection('articles').doc(id as string).get();

    if (!snap.exists) {
      return res.status(404).send('<html><body>Article not found</body></html>');
    }

    const article = snap.data()!;
    const title = article.title || 'TelierNews';
    const description = article.summary || 'Portal berita terpercaya, aktual, dan mendalam.';
    const image = article.imageUrl || 'https://www.teliernews.com/favicon.ico';
    const author = article.author || 'TelierNews';
    const publishedAt = article.publishedAt || new Date().toISOString();
    const category = article.category || 'News';
    const url = `https://www.teliernews.com/news/${id}`;

    // Schema JSON-LD NewsArticle
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description: description,
      image: [image],
      datePublished: publishedAt,
      dateModified: publishedAt,
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'TelierNews',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.teliernews.com/favicon.ico',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      articleSection: category,
      url: url,
    });

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - TelierNews</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="${author}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="TelierNews" />
  <meta property="article:published_time" content="${publishedAt}" />
  <meta property="article:author" content="${author}" />
  <meta property="article:section" content="${category}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <!-- Schema.org NewsArticle -->
  <script type="application/ld+json">${schema}</script>

  <!-- Redirect manusia ke SPA -->
  <script>
    if (!/bot|crawl|spider|slurp|fetch/i.test(navigator.userAgent)) {
      window.location.replace('/news/${id}');
    }
  </script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Penulis: ${author}</p>
  <p>Tanggal: ${publishedAt}</p>
  <p>Kategori: ${category}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);

  } catch (err) {
    console.error('Prerender error:', err);
    return res.status(500).send('<html><body>Server error</body></html>');
  }
}
