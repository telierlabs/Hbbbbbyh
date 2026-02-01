
import React, { useState } from 'react';
import { editNewsImage } from '../services/geminiService';

interface AIImageEditorProps {
  currentImage: string;
  onImageEdited: (newImage: string) => void;
}

const AIImageEditor: React.FC<AIImageEditorProps> = ({ currentImage, onImageEdited }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim() || !currentImage) return;
    
    setIsEditing(true);
    setError(null);
    
    try {
      const editedUrl = await editNewsImage(currentImage, prompt);
      if (editedUrl) {
        onImageEdited(editedUrl);
        setPrompt('');
      } else {
        setError("Gagal memproses gambar. Coba prompt lain.");
      }
    } catch (err) {
      setError("Terjadi kesalahan teknis saat mengedit dengan AI.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Gemini AI Editor</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">Masukkan instruksi untuk mengedit gambar (cth: "Berikan filter vintage", "Jadikan background blur", "Hapus keramaian")</p>
      
      <div className="flex space-x-2">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tulis instruksi edit..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
          disabled={isEditing}
        />
        <button
          onClick={handleEdit}
          disabled={isEditing || !prompt.trim()}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            isEditing || !prompt.trim() 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isEditing ? 'Memproses...' : 'Proses AI'}
        </button>
      </div>
      
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default AIImageEditor;
