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

  if (keys.length === 0) {
    return res.status(500).json({ text: 'API key tidak ditemukan.' });
  }

  const prompt = `Kamu adalah Cylen AI, asisten berita cerdas dari TelierNews.
Kamu membantu pembaca memahami artikel berita dengan bahasa yang jelas dan mudah dipahami.

Judul artikel: "${title}"

Isi artikel:
${String(content).substring(0, 2000)}

Pertanyaan pembaca: "${question}"

Instruksi:
- Jawab dalam Bahasa Indonesia yang lugas dan informatif
- Berikan konteks tambahan jika relevan
- Jika pertanyaan tidak berkaitan dengan artikel, sampaikan dengan sopan
- Jangan buat-buat fakta yang tidak ada di artikel
- Maksimal 3 paragraf`;

  for (const key of keys) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!r.ok) continue;
      const data = await r.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.json({ text });
    } catch {
      continue;
    }
  }

  res.status(500).json({ text: 'Maaf, Cylen AI sedang tidak tersedia. Coba lagi sebentar.' });
}
