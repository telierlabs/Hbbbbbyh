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

  if (articles.length === 0) {
    console.log('⚠️ Tidak ada artikel baru dalam 2 hari terakhir, skip generate (biarkan file lama)');
    process.exit(0);
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
      <news:title><![CDATA[${a.title}]]></news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/news-sitemap.xml'), sitemap);
  console.log(`✅ News sitemap: ${articles.length} artikel`);
  process.exit(0);
}

generateNewsSitemap();
