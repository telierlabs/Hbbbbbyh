import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { NewsArticle, Category, ContentBlock } from '../types';

interface AdminProps {
  articles: NewsArticle[];
  onAddArticle: (article: NewsArticle) => void;
  onDeleteArticle: (id: string) => void;
}

interface ContentSection {
  id: string;
  imageUrl: string;
  text: string;
  videoUrl: string;
  uploadingImage: boolean;
  uploadingVideo: boolean;
}

const IMGBB_API_KEY = import.meta.env.IMG_KEY || '';
const ADMIN_SECRET_CODE = '21122109'; // Kode rahasia admin

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
    author: 'Muhamad rivaldy'
  });

  const [sections, setSections] = useState<ContentSection[]>([
    { id: '1', imageUrl: '', text: '', videoUrl: '', uploadingImage: false, uploadingVideo: false }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        // Cek kode admin dari localStorage
        const adminCode = localStorage.getItem('admin_secret_code');
        if (adminCode !== ADMIN_SECRET_CODE) {
          alert('Kode admin salah! Anda akan logout.');
          auth.signOut();
          navigate('/admin/login');
          return;
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSectionImageUpload = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, uploadingImage: true } : s
    ));

    const data = new FormData();
    data.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: data
      });
      const json = await response.json();
      
      if (json.success) {
        setSections(sections.map(s => 
          s.id === sectionId ? { ...s, imageUrl: json.data.url, uploadingImage: false } : s
        ));
      } else {
        alert('Upload gambar gagal!');
        setSections(sections.map(s => 
          s.id === sectionId ? { ...s, uploadingImage: false } : s
        ));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload gambar');
      setSections(sections.map(s => 
        s.id === sectionId ? { ...s, uploadingImage: false } : s
      ));
    }
  };

  const handleSectionVideoUpload = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, uploadingVideo: true } : s
    ));

    const data = new FormData();
    data.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: data
      });
      const json = await response.json();
      
      if (json.success) {
        setSections(sections.map(s => 
          s.id === sectionId ? { ...s, videoUrl: json.data.url, uploadingVideo: false } : s
        ));
      } else {
        alert('Upload video gagal!');
        setSections(sections.map(s => 
          s.id === sectionId ? { ...s, uploadingVideo: false } : s
        ));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSections(sections.map(s => 
        s.id === sectionId ? { ...s, uploadingVideo: false } : s
      ));
    }
  };

  const updateSectionText = (sectionId: string, text: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, text } : s
    ));
  };

  const updateSectionVideoUrl = (sectionId: string, videoUrl: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, videoUrl } : s
    ));
  };

  const addNewSection = () => {
    const newId = (sections.length + 1).toString();
    setSections([...sections, { 
      id: newId, 
      imageUrl: '', 
      text: '', 
      videoUrl: '', 
      uploadingImage: false,
      uploadingVideo: false 
    }]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length === 1) {
      alert('Minimal harus ada 1 section!');
      return;
    }
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert('Thumbnail wajib diupload!');
      return;
    }

    const contentBlocks: ContentBlock[] = [];
    sections.forEach(section => {
      if (section.imageUrl) {
        contentBlocks.push({
          type: 'image',
          content: section.imageUrl
        });
      }
      if (section.text.trim()) {
        contentBlocks.push({
          type: 'text',
          content: section.text
        });
      }
      if (section.videoUrl) {
        contentBlocks.push({
          type: 'text',
          content: `[VIDEO: ${section.videoUrl}]`
        });
      }
    });

    const fullContent = formData.content + '\n\n' + sections.map(s => s.text).filter(t => t.trim()).join('\n\n');

    const newArticle: NewsArticle = {
      title: formData.title,
      summary: formData.summary,
      content: fullContent || formData.content || 'Baca artikel lengkap di bawah.',
      category: formData.category,
      imageUrl: formData.imageUrl,
      author: formData.author,
      contentBlocks: contentBlocks.length > 0 ? contentBlocks : undefined,
      id: 'temp_' + Math.random().toString(36).substr(2, 9),
      publishedAt: new Date().toISOString()
    };

    onAddArticle(newArticle);

    setFormData({
      title: '',
      summary: '',
      content: '',
      category: Category.TECH,
      imageUrl: '',
      author: 'Muhamad rivaldy'
    });
    setSections([{ id: '1', imageUrl: '', text: '', videoUrl: '', uploadingImage: false, uploadingVideo: false }]);
    setIsAdding(false);
  };

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

      {isAdding && (
        <div className="mb-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. JUDUL BERITA */}
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
            
            {/* 2. KATEGORI & PENULIS */}
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

            {/* 3. GAMBAR (THUMBNAIL) - GAMBAR DULU! */}
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Thumbnail Utama</label>
              <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center hover:border-gray-400">
                {uploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Mengupload...</p>
                  </div>
                ) : formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white px-4 py-2 rounded-lg text-sm font-bold">
                        Ganti Gambar
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-6 pointer-events-none">
                      <p className="text-gray-400 text-sm">Klik untuk upload gambar</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                  </>
                )}
              </div>
            </div>

            {/* 4. RINGKASAN - BARU RINGKASAN! */}
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

            {/* 5. KONTEN LENGKAP */}
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

            {/* 6. SECTIONS (GAMBAR DULU, BARU KONTEN!) */}
            <div className="border-t pt-6">
              {sections.map((section, index) => (
                <div key={section.id} className="mb-8 p-6 bg-slate-50 rounded-2xl relative">
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600"
                    >
                      Hapus Section
                    </button>
                  )}
                  
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Section {index + 1}</h3>
                  
                  {/* GAMBAR DULU! */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">UPLOAD GAMBAR</label>
                    <div className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                      {section.uploadingImage ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500">Uploading...</p>
                        </div>
                      ) : section.imageUrl ? (
                        <>
                          <img src={section.imageUrl} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white px-3 py-1 rounded text-xs font-bold">
                              Ganti
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleSectionImageUpload(section.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-400 text-sm pointer-events-none">Klik untuk upload</p>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleSectionImageUpload(section.id, e)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* BARU KONTEN LENGKAP! */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">KONTEN LENGKAP</label>
                    <textarea 
                      rows={8}
                      value={section.text}
                      onChange={(e) => updateSectionText(section.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Tulis isi berita secara mendalam..."
                    />
                  </div>

                  {/* VIDEO (OPTIONAL) */}
                  <div>
                    <label className="block text-sm font-bold mb-2">LINK VIDEO (YouTube) ATAU UPLOAD VIDEO</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input 
                          type="url"
                          value={section.videoUrl.startsWith('http') ? section.videoUrl : ''}
                          onChange={(e) => updateSectionVideoUrl(section.id, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                      
                      <div>
                        <label className="block w-full px-4 py-3 bg-black text-white text-center rounded-xl cursor-pointer hover:bg-gray-800 transition-all">
                          {section.uploadingVideo ? 'Uploading...' : 'Upload dari Gallery'}
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={(e) => handleSectionVideoUpload(section.id, e)}
                            className="hidden"
                            disabled={section.uploadingVideo}
                          />
                        </label>
                      </div>
                    </div>
                    {section.videoUrl && !section.videoUrl.startsWith('http') && (
                      <p className="text-xs text-green-600 mt-2">✓ Video uploaded: {section.videoUrl}</p>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addNewSection}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:border-black hover:text-black transition-all"
              >
                + Tambah Section Baru
              </button>
            </div>

            <button 
              type="submit"
              disabled={uploading || !formData.imageUrl}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publikasikan Sekarang
            </button>
          </form>
        </div>
      )}

      {/* Article List */}
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
