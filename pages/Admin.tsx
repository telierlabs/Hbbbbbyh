import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { NewsArticle, Category } from '../types';

interface AdminProps {
  articles: NewsArticle[];
  onAddArticle: (article: NewsArticle) => void;
  onDeleteArticle: (id: string) => void;
}

const IMGBB_API_KEY = '3fe23f04634c89761107ceec0ae1714f';

const Admin: React.FC<AdminProps> = ({ articles, onAddArticle, onDeleteArticle }) => {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: Category.TECH,
    imageUrl: '',
    author: 'Admin Telier'
  });

  // Protection: kalau belum login, redirect ke /admin/login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: data
      });
      const json = await response.json();
      
      if (json.success) {
        setFormData(prev => ({ ...prev, imageUrl: json.data.url }));
      } else {
        alert('Upload gambar gagal!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newArticle: NewsArticle = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      publishedAt: new Date().toISOString()
    };

    onAddArticle(newArticle);

    setFormData({
      title: '',
      summary: '',
      content: '',
      category: Category.TECH,
      imageUrl: '',
      author: 'Admin Telier'
    });
    setIsAdding(false);
    
    alert('✅ Berita berhasil dipublikasikan!');
  };

  // Loading state saat check authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Admin Panel */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management System</h1>
          <p className="text-gray-500 text-sm">Kelola seluruh berita di TelierNews</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
            isAdding ? 'bg-red-50 text-red-600' : 'bg-black text-white hover:shadow-lg'
          }`}
        >
          {isAdding ? 'Batal' : '+ Berita Baru'}
        </button>
      </div>

      {/* Form Tambah Berita */}
      {isAdding && (
        <div className="mb-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Judul Berita</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Masukkan judul yang menarik..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Kategori</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black appearance-none bg-white"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Penulis</label>
                  <input 
                    type="text" 
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Ringkasan</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  placeholder="Ringkasan singkat untuk tampilan depan..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Konten Lengkap</label>
                <textarea 
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Tulis isi berita secara mendalam..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Thumbnail Berita</label>
                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center transition-all hover:border-gray-400 group">
                  {uploading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Mengupload...</p>
                    </div>
                  ) : formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-lg text-sm font-bold">
                          Ganti Gambar
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center p-6 pointer-events-none">
                        <p className="text-gray-400 text-sm mb-2">Klik untuk upload gambar atau drag & drop</p>
                        <p className="text-[10px] uppercase font-bold text-gray-300">JPG, PNG up to 5MB</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={uploading || !formData.imageUrl}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 shadow-xl shadow-black/10 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publikasikan Sekarang
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Table List Artikel */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Preview</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Judul & Kategori</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Tanggal</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map(article => (
              <tr key={article.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <img src={article.imageUrl} className="w-20 h-12 object-cover rounded-lg" alt="" />
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-md">
                    <p className="font-bold text-sm line-clamp-1">{article.title}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded uppercase font-bold text-gray-500">
                      {article.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus berita ini?')) {
                        onDeleteArticle(article.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                  Belum ada konten yang dipublikasikan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
