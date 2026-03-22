import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { NewsArticle, Category, ContentBlock } from '../types';

interface AdminProps {
  articles: NewsArticle[];
  onAddArticle: (article: NewsArticle) => void;
  onUpdateArticle: (articleId: string, updates: Partial<NewsArticle>) => void;
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

const CLOUDINARY_CLOUD_NAME = 'dwtxsn7zo';
const CLOUDINARY_UPLOAD_PRESET = 'teliernews';
const ADMIN_SECRET_CODE = '21122109';

const uploadToCloudinary = async (file: File): Promise<string> => {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, { method: 'POST', body: data });
  const json = await response.json();
  if (!json.secure_url) throw new Error('Upload gagal');
  return json.secure_url;
};

const sendNotification = async (title: string, body: string, articleId: string, imageUrl: string): Promise<{ sent: number; failed: number }> => {
  const res = await fetch('/api/notify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, articleId, imageUrl }),
  });
  if (!res.ok) throw new Error('Gagal kirim notifikasi');
  return res.json();
};

const emptyForm = { title: '', summary: '', content: '', category: Category.TECH, imageUrl: '', author: 'Muhamad rivaldy' };
const emptySection: ContentSection = { id: '1', imageUrl: '', text: '', videoUrl: '', uploadingImage: false, uploadingVideo: false };

const Admin: React.FC<AdminProps> = ({ articles, onAddArticle, onUpdateArticle, onDeleteArticle }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [lastPublished, setLastPublished] = useState<NewsArticle | null>(null);
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<string | null>(null);

  const [formData, setFormData] = useState(emptyForm);
  const [sections, setSections] = useState<ContentSection[]>([emptySection]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) { navigate('/admin/login'); }
      else {
        const adminCode = localStorage.getItem('admin_secret_code');
        if (adminCode !== ADMIN_SECRET_CODE) { alert('Kode admin salah!'); auth.signOut(); navigate('/admin/login'); return; }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const startEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setFormData({ title: article.title, summary: article.summary, content: article.content || '', category: article.category as Category, imageUrl: article.imageUrl, author: article.author });
    if (article.contentBlocks && article.contentBlocks.length > 0) {
      const rebuilt: ContentSection[] = [];
      let sec: ContentSection = { id: '1', imageUrl: '', text: '', videoUrl: '', uploadingImage: false, uploadingVideo: false };
      article.contentBlocks.forEach((block, i) => {
        if (block.type === 'image') sec.imageUrl = block.content;
        else if (block.type === 'text') sec.text = block.content;
        rebuilt.push({ ...sec, id: String(i + 1) });
        sec = { id: String(i + 2), imageUrl: '', text: '', videoUrl: '', uploadingImage: false, uploadingVideo: false };
      });
      setSections(rebuilt.length > 0 ? rebuilt : [emptySection]);
    } else {
      setSections([{ ...emptySection, text: article.content || '' }]);
    }
    setMode('edit');
    window.scrollTo(0, 0);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { setFormData(prev => ({ ...prev, imageUrl: '' })); const url = await uploadToCloudinary(file); setFormData(prev => ({ ...prev, imageUrl: url })); }
    catch { alert('Upload gambar gagal!'); } finally { setUploading(false); }
  };

  const handleSectionImageUpload = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, uploadingImage: true } : s));
    try { const url = await uploadToCloudinary(file); setSections(prev => prev.map(s => s.id === sectionId ? { ...s, imageUrl: url, uploadingImage: false } : s)); }
    catch { alert('Upload gagal!'); setSections(prev => prev.map(s => s.id === sectionId ? { ...s, uploadingImage: false } : s)); }
  };

  const handleSectionVideoUpload = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, uploadingVideo: true } : s));
    try { const url = await uploadToCloudinary(file); setSections(prev => prev.map(s => s.id === sectionId ? { ...s, videoUrl: url, uploadingVideo: false } : s)); }
    catch { alert('Upload gagal!'); setSections(prev => prev.map(s => s.id === sectionId ? { ...s, uploadingVideo: false } : s)); }
  };

  const buildArticleData = () => {
    const contentBlocks: ContentBlock[] = [];
    sections.forEach(section => {
      if (section.imageUrl) contentBlocks.push({ type: 'image', content: section.imageUrl });
      if (section.text.trim()) contentBlocks.push({ type: 'text', content: section.text });
      if (section.videoUrl) contentBlocks.push({ type: 'text', content: `[VIDEO: ${section.videoUrl}]` });
    });
    const fullContent = formData.content + '\n\n' + sections.map(s => s.text).filter(t => t.trim()).join('\n\n');
    return { ...formData, content: fullContent || formData.content || 'Baca artikel lengkap di bawah.', contentBlocks: contentBlocks.length > 0 ? contentBlocks : undefined };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) { alert('Thumbnail wajib diupload!'); return; }
    setSaving(true);
    try {
      if (mode === 'edit' && editingId) {
        const updates = buildArticleData();
        await onUpdateArticle(editingId, updates);
        setMode('list'); setEditingId(null);
        setFormData(emptyForm); setSections([emptySection]);
        alert('✅ Artikel berhasil diupdate!');
      } else {
        const newArticle = { ...buildArticleData(), publishedAt: new Date().toISOString() };
        await onAddArticle(newArticle as NewsArticle);
        setLastPublished(newArticle as NewsArticle);
        setShowNotifPopup(true); setNotifResult(null);
        setFormData(emptyForm); setSections([emptySection]);
        setMode('list');
      }
    } finally { setSaving(false); }
  };

  const handleKirimNotif = async () => {
    if (!lastPublished) return;
    setSendingNotif(true); setNotifResult(null);
    try {
      const result = await sendNotification(`[BREAKING] ${lastPublished.title}`, lastPublished.summary, articles[0]?.id || '', lastPublished.imageUrl);
      setNotifResult(`✅ Terkirim ke ${result.sent} subscriber`);
    } catch { setNotifResult('❌ Gagal kirim notifikasi'); }
    finally { setSendingNotif(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  const isFormMode = mode === 'add' || mode === 'edit';

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 80px', fontFamily: "'Montserrat', sans-serif" }}>

      {/* POPUP NOTIF */}
      {showNotifPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '380px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', background: '#000', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Artikel Dipublish!</p>
              <p style={{ fontSize: '12px', color: '#888' }}>Kirim notifikasi ke subscriber?</p>
            </div>
            {notifResult && (
              <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, marginBottom: '14px', background: notifResult.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: notifResult.startsWith('✅') ? '#15803d' : '#dc2626' }}>
                {notifResult}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowNotifPopup(false); setNotifResult(null); }} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', borderRadius: '14px', background: 'transparent', color: '#6b7280', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Tidak</button>
              <button onClick={handleKirimNotif} disabled={sendingNotif || !!notifResult?.startsWith('✅')} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '14px', background: '#000', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: sendingNotif ? 0.6 : 1 }}>
                {sendingNotif ? 'Mengirim...' : notifResult?.startsWith('✅') ? 'Terkirim ✓' : 'Kirim Notif'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: 0 }}>
            {mode === 'edit' ? 'Edit Artikel' : mode === 'add' ? 'Berita Baru' : 'CMS'}
          </h1>
          <p style={{ fontSize: '11px', color: '#aaa', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.1em', margin: '3px 0 0' }}>
            {mode === 'list' ? `${articles.length} artikel` : 'TelierNews Admin'}
          </p>
        </div>
        {mode === 'list' ? (
          <button onClick={() => { setMode('add'); setFormData(emptyForm); setSections([emptySection]); }}
            style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            + Berita Baru
          </button>
        ) : (
          <button onClick={() => { setMode('list'); setEditingId(null); setFormData(emptyForm); setSections([emptySection]); }}
            style={{ padding: '10px 20px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            ← Batal
          </button>
        )}
      </div>

      {/* STATS */}
      {mode === 'list' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { num: articles.length, label: 'Total' },
            { num: new Set(articles.map(a => a.category)).size, label: 'Kategori' },
            { num: articles.filter(a => new Date(a.publishedAt).toDateString() === new Date().toDateString()).length, label: 'Hari ini' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', border: '1px solid #ececec', borderRadius: '12px', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#aaa', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE LIST */}
      {mode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {articles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#ccc', letterSpacing: '0.2em' }}>
              BELUM ADA ARTIKEL
            </div>
          )}
          {articles.map((article, idx) => (
            <div key={article.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ececec', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={article.imageUrl} alt="" referrerPolicy="no-referrer"
                style={{ width: '64px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, background: '#f0f0f0' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' }}>
                  {article.category}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '4px' }}>
                  {article.title}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#ccc' }}>
                  {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => startEdit(article)}
                  style={{ padding: '5px 12px', border: '1px solid #e0e0e0', background: '#fafafa', color: '#444', borderRadius: '8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Edit
                </button>
                <button onClick={() => { if (window.confirm('Hapus artikel ini?')) onDeleteArticle(article.id); }}
                  style={{ padding: '5px 12px', border: '1px solid #ffecec', background: '#fff5f5', color: '#ff4444', borderRadius: '8px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM ADD/EDIT */}
      {isFormMode && (
        <div style={{ background: '#fff', border: '1px solid #ececec', borderRadius: '20px', padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#888' }}>Judul Berita</label>
                <input required type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="Masukkan judul yang menarik..."
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#888' }}>Kategori</label>
                  <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value as Category }))}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', background: '#fff', fontFamily: "'Montserrat', sans-serif" }}>
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#888' }}>Penulis</label>
                  <input type="text" value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#888' }}>Thumbnail</label>
                <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '12px', border: '2px dashed #e5e7eb', background: '#fafafa', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {uploading ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '28px', height: '28px', border: '2px solid #e0e0e0', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }}></div>
                      <p style={{ fontSize: '12px', color: '#aaa' }}>Uploading...</p>
                    </div>
                  ) : formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} alt="" />
                      <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '6px 14px', borderRadius: '8px' }}>Ganti</span>
                        <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
                      </label>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '12px', color: '#ccc', pointerEvents: 'none' }}>Klik untuk upload gambar</p>
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} required style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    </>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#888' }}>Ringkasan</label>
                <textarea required rows={2} value={formData.summary} onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))}
                  placeholder="Ringkasan singkat..."
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: "'Montserrat', sans-serif" }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: '#888' }}>Konten</label>
                <textarea required rows={8} value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  placeholder="Tulis isi berita..."
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
              </div>

              {/* Sections */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                {sections.map((section, index) => (
                  <div key={section.id} style={{ background: '#fafafa', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #f0f0f0', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Section {index + 1}</span>
                      {sections.length > 1 && (
                        <button type="button" onClick={() => setSections(sections.filter(s => s.id !== section.id))}
                          style={{ padding: '4px 10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>
                          Hapus
                        </button>
                      )}
                    </div>
                    <div style={{ aspectRatio: '16/9', borderRadius: '10px', border: '2px dashed #e5e7eb', background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', position: 'relative' }}>
                      {section.uploadingImage ? <p style={{ fontSize: '12px', color: '#aaa' }}>Uploading...</p>
                        : section.imageUrl ? <img src={section.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : <>
                            <p style={{ fontSize: '12px', color: '#ccc', pointerEvents: 'none' }}>Upload gambar</p>
                            <input type="file" accept="image/*" onChange={e => handleSectionImageUpload(section.id, e)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                          </>}
                    </div>
                    <textarea rows={6} value={section.text} onChange={e => setSections(sections.map(s => s.id === section.id ? { ...s, text: e.target.value } : s))}
                      placeholder="Konten section..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif", marginBottom: '10px' }} />
                    <input type="url" value={section.videoUrl.startsWith('http') ? section.videoUrl : ''}
                      onChange={e => setSections(sections.map(s => s.id === section.id ? { ...s, videoUrl: e.target.value } : s))}
                      placeholder="YouTube URL (opsional)"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
                  </div>
                ))}
                <button type="button" onClick={() => setSections([...sections, { id: String(sections.length + 1), imageUrl: '', text: '', videoUrl: '', uploadingImage: false, uploadingVideo: false }])}
                  style={{ width: '100%', padding: '12px', border: '2px dashed #e5e7eb', borderRadius: '12px', background: 'transparent', color: '#aaa', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  + Tambah Section
                </button>
              </div>

              <button type="submit" disabled={saving || uploading || !formData.imageUrl}
                style={{ width: '100%', padding: '14px', background: saving ? '#666' : '#000', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', transition: 'background 0.2s', fontFamily: "'Montserrat', sans-serif" }}>
                {saving ? 'Menyimpan...' : mode === 'edit' ? '✓ Simpan Perubahan' : 'Publikasikan Sekarang'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Admin;
