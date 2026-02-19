import { GoogleGenAI } from "@google/genai";

const GEMINI_KEYS = [
  import.meta.env.GEM_KEY || '',
  import.meta.env.GEM_KEY2 || '',
  import.meta.env.GEM_KEY3 || '',
];

let keyIndex = 0;

const getKey = (): string => {
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length];
    keyIndex++;
    if (key) return key;
  }
  return '';
};

// ============================================
// PROMPT CHAT ARTIKEL
// ============================================
export const askAboutArticle = async (
  articleTitle: string,
  articleContent: string,
  userQuestion: string
): Promise<string> => {
  const prompt = `Kamu adalah Cylen AI, asisten berita cerdas dari TelierNews.
Kamu membantu pembaca memahami artikel berita dengan bahasa yang jelas dan mudah dipahami.

Judul artikel: "${articleTitle}"

Isi artikel:
${articleContent.substring(0, 2000)}

Pertanyaan pembaca: "${userQuestion}"

Instruksi:
- Jawab dalam Bahasa Indonesia yang lugas dan informatif
- Berikan konteks tambahan jika relevan
- Jika pertanyaan tidak berkaitan dengan artikel, sampaikan dengan sopan bahwa kamu fokus pada artikel ini
- Jangan buat-buat fakta yang tidak ada di artikel
- Maksimal 3 paragraf`;

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = getKey();
    if (!key) continue;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      console.warn(`Gemini key ${i + 1} gagal, coba berikutnya...`);
    }
  }
  return 'Maaf, Cylen AI sedang tidak tersedia. Coba lagi sebentar.';
};

// ============================================
// IMAGE EDIT
// ============================================
export async function editNewsImage(base64Image: string, prompt: string): Promise<string | null> {
  try {
    const key = getKey();
    const ai = new GoogleGenAI({ apiKey: key });
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: `Edit this news article image: ${prompt}. Return only the edited image.` },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
}
