import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ArticleChatProps {
  articleTitle: string;
  articleContent: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEM_KEY || import.meta.env.GEM_KEY || '';

const ArticleChat: React.FC<ArticleChatProps> = ({ articleTitle, articleContent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Konteks artikel: "${articleTitle}"\n\nIsi artikel: ${articleContent.substring(0, 1000)}...\n\nPertanyaan user: ${input}\n\nJawab pertanyaan berdasarkan konteks artikel di atas dalam bahasa Indonesia. Jika pertanyaan tidak relevan dengan artikel, jelaskan bahwa kamu hanya bisa menjawab pertanyaan seputar artikel ini.`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak dapat menjawab pertanyaan tersebut.';
      const aiMessage: Message = { role: 'ai', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = { role: 'ai', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
      <div className="flex items-center space-x-4 mb-6">
        <img src="/IMG_20260110_200713_512.webp" alt="Cylen AI" className="w-14 h-14 rounded-full" />
        <div>
          <h3 className="font-bold text-lg">Tanya Cylen AI tentang artikel ini</h3>
          <p className="text-sm text-gray-500">Dapatkan penjelasan lebih detail</p>
        </div>
      </div>

      <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Tanyakan sesuatu tentang artikel ini...</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-base whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-5 py-3 rounded-2xl">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ketik pertanyaan Anda..." 
          className="flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-base" 
          disabled={loading} 
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()} 
          className="px-7 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ArticleChat;
