import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ArticleChatProps {
  articleTitle: string;
  articleContent: string;
}

// Ambil API key dari Vercel env (sama persis seperti di geminiService.ts lo)
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

const askAI = async (
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
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

const ArticleChat: React.FC<ArticleChatProps> = ({ articleTitle, articleContent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    const aiResponse = await askAI(articleTitle, articleContent, input);
    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* ── CHAT MESSAGES — muncul di bawah artikel ── */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <img
            src="/IMG_20260110_200713_512.webp"
            alt="Cylen AI"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-bold text-base">Tanya Cylen AI</h3>
            <p className="text-xs text-gray-400">Ketik pertanyaan di kolom bawah</p>
          </div>
        </div>

        <div className="space-y-4 pb-28">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-300 text-sm">
                Belum ada percakapan. Tanyakan sesuatu tentang artikel ini!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl flex space-x-1.5">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── FIXED INPUT BAR — nempel di navbar bawah ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya tentang artikel ini..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm bg-gray-50"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-11 h-11 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default ArticleChat;
