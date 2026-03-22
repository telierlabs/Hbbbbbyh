export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { title, content, question } = req.body;

  const keys = [
    process.env.GEM_KEY,
    process.env.GEM_KEY2,
    process.env.GEM_KEY3,
  ].filter(Boolean);

  console.log('Keys found:', keys.length);

  if (keys.length === 0) {
    return res.status(500).json({ text: 'API key tidak ditemukan.' });
  }

  const prompt = `Kamu adalah Cylen AI, asisten berita cerdas dari TelierNews.
Judul artikel: "${title}"
Isi artikel: ${String(content).substring(0, 2000)}
Pertanyaan: "${question}"
Jawab dalam Bahasa Indonesia, maksimal 3 paragraf.`;

  for (let i = 0; i < keys.length; i++) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keys[i]}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await r.json();
      console.log(`Key ${i+1} status:`, r.status, 'error:', data.error?.message || 'none');
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.json({ text });
    } catch (e) {
      console.error(`Key ${i+1} exception:`, e.message);
    }
  }

  res.status(500).json({ text: 'Maaf, Cylen AI sedang tidak tersedia.' });
}
