import { GoogleGenAI } from "@google/genai";

// Hanya dipakai untuk editNewsImage (server-side via API route untuk chat)
const FIRST_KEY = import.meta.env.GEM_KEY || '';

export const askAboutArticle = async (
  articleTitle: string,
  articleContent: string,
  userQuestion: string
): Promise<string> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: articleTitle,
        content: articleContent,
        question: userQuestion,
      }),
    });
    const data = await res.json();
    return data.text || 'Maaf, tidak ada respons dari Cylen AI.';
  } catch {
    return 'Maaf, gagal terhubung ke server.';
  }
};

export async function editNewsImage(base64Image: string, prompt: string): Promise<string | null> {
  try {
    if (!FIRST_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: FIRST_KEY });
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
