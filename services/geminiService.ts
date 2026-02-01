
import { GoogleGenAI } from "@google/genai";

export async function editNewsImage(base64Image: string, prompt: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract base64 data correctly (remove prefix if exists)
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Edit this news article image based on this request: ${prompt}. Return only the edited image.`,
          },
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
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
}
