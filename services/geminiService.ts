import { GoogleGenAI } from "@google/genai";

const GEMINI_KEYS = [
  import.meta.env.VITE_GEM_KEY || '',
  import.meta.env.VITE_GEM_KEY2 || '',
  import.meta.env.VITE_GEM_KEY3 || '',
].filter(k => k !== '');

export const askAboutArticle = async (
  articleTitle: string,
  articleContent: string,
  userQuestion: string
): Promise<string> => {
  const prompt = `Kamu adalah Cylen AI, asisten berita cerdas dari TelierNews.
Kamu membantu pembaca memahami artikel berita dengan bahasa yang jelas dan mudah dipahami.

Judul artikel: "${articleTitle}"
Isi artikel: ${articleContent.substring(0, 2000)}
Pertanyaan pembaca: "${userQuestion}"

Jawab dalam Bahasa Indonesia yang lugas. Maksimal 3 paragraf.`;

  for (const key of GEMINI_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      console.warn('Key error, coba berikutnya...');
      continue;
    }
  }
  return 'Maaf, Cylen AI sedang tidak tersedia. Coba lagi sebentar.';
};

export async function editNewsImage(base64Image: string, prompt: string): Promise<string | null> {
  try {
    const key = GEMINI_KEYS[0];
    if (!key) return null;
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
