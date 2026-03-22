import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { NewsArticle, Category, ContentBlock, ArticlePage, CarouselItem } from '../types';

interface AdminProps {
  articles: NewsArticle[];
  onAddArticle: (article: NewsArticle) => void;
  onUpdateArticle: (articleId: string, updates: Partial<NewsArticle>) => void;
  onDeleteArticle: (id: string) => void;
}

const CLOUDINARY_CLOUD_NAME = 'dwtxsn7zo';
const CLOUDINARY_UPLOAD_PRESET = 'teliernews';
const ADMIN_SECRET_CODE = '21122109';

const uploadToCloudinary = async (file: File): Promise<string> => {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, { method: 'POST', body: data });
  const json = await res.json();
  if (!json.secure_url) throw new Error('Upload gagal');
  return json.secure_url;
};

const sendNotification = async (title: string, body: string, articleId: string, imageUrl: string) => {
  const res = await fetch('/api/notify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, articleId, imageUrl }),
  });
  if (!res.ok) throw new Error('Gagal kirim notifikasi');
  return res.json();
};

const emptyBlock = (): ContentBlock => ({ type: 'text', content: '' });
const emptyPage = (): ArticlePage => ({ blocks: [emptyBlock()] });

const Admin: React.FC<AdminProps> = ({ articles, onAddArticle, onUpdateArticle, onDeleteArticle }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [lastPublished, setLastPublished] = useState<NewsArticle | null>(null);
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<Category>(Category.TECH);
  const [author, setAuthor] = useState('Muhamad rivaldy');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Carousel items (header media)
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [uploadingCarousel, setUploadingCarousel] = useState(false);

  // Pages
  const [pages, setPages] = useState<ArticlePage[]>([emptyPage()]);
  const [activePageIdx, setActivePageIdx] = useState(0);

  // AI Insight
  const [aiInsight, setAiInsight] = useState<string[]>([]);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) { navigate('/admin/login'); return; }
      const code = localStorage.getItem('admin_secret_code');
      if (code !== ADMIN_SECRET_CODE) { alert('Kode admin salah!'); auth.signOut(); navigate('/admin/login'); return; }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const resetForm = () => {
    setTitle(''); setSummary(''); setCategory(Category.TECH);
    setAuthor('Muhamad rivaldy'); setThumbnailUrl('');
    setCarouselItems([]); setPages([emptyPage()]);
    setActivePageIdx(0); setAiInsight([]);
  };

  const startEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setTitle(article.title); setSummary(article.summary);
    setCategory(article.category as Category); setAuthor(article.author);
    setThumbnailUrl(article.imageUrl);
    setCarouselItems(article.carouselItems || [{ type: 'image', url: article.imageUrl }]);
    setAiInsight(article.aiInsight || []);

    if (article.pages && article.pages.length > 0) {
      setPages(article.pages);
    } else if (article.contentBlocks && article.contentBlocks.length > 0) {
      // Convert old format to pages
      setPages([{ blocks: article.contentBlocks.map(b => ({ type: b.type as 'image' | 'text', content: b.content })) }]);
    } else {
      setPages([{ blocks: [{ type: 'text', content: article.content || '' }] }]);
    }
    setActivePageIdx(0);
    setMode('edit');
    window.scrollTo(0, 0);
  };

  // ── CAROUSEL UPLOAD ──
  const handleCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingCarousel(true);
    try {
      const url = await uploadToCloudinary(file);
      setCarouselItems(prev => [...prev, { type, url }]);
    } catch { alert('Upload gagal!'); }
    finally { setUploadingCarousel(false); e.target.value = ''; }
  };

  const removeCarouselItem = (i: number) => setCarouselItems(prev => prev.filter((_, idx) => idx !== i));

  // ── THUMBNAIL ──
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingThumb(true);
    try { const url = await uploadToCloudinary(file); setThumbnailUrl(url); }
    catch { alert('Upload gagal!'); }
    finally { setUploadingThumb(false); }
  };

  // ── PAGE BLOCKS ──
  const updateBlock = (pageIdx: number, blockIdx: number, updates: Partial<ContentBlock>) => {
    setPages(prev => prev.map((p, pi) => pi !== pageIdx ? p : {
      ...p, blocks: p.blocks.map((b, bi) => bi !== blockIdx ? b : { ...b, ...updates })
    }));
  };

  const addBlock = (pageIdx: number, type: 'text' | 'image' | 'video') => {
    setPages(prev => prev.map((p, pi) => pi !== pageIdx ? p : {
      ...p, blocks: [...p.blocks, { type, content: '', caption: '' }]
    }));
  };

  const removeBlock = (pageIdx: number, blockIdx: number) => {
    setPages(prev => prev.map((p, pi) => pi !== pageIdx ? p : {
      ...p, blocks: p.blocks.filter((_, bi) => bi !== blockIdx)
    }));
  };

  const uploadBlockImage = async (pageIdx: number, blockIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    updateBlock(pageIdx, blockIdx, { content: '' });
    try { const url = await uploadToCloudinary(file); updateBlock(pageIdx, blockIdx, { content: url }); }
    catch { alert('Upload gagal!'); }
    e.target.value = '';
  };

  const addPage = () => { setPages(prev => [...prev, emptyPage()]); setActivePageIdx(pages.length); };
  const delPage = (i: number) => {
    if (pages.length <= 1) { alert('Minimal 1 halaman'); return; }
    setPages(prev => prev.filter((_, idx) => idx !== i));
    setActivePageIdx(Math.max(0, i - 1));
  };

  // ── AI GENERATE INSIGHT ──
  const generateInsight = async () => {
    setGeneratingInsight(true);
    const allText = pages.flatMap(p => p.blocks.filter(b => b.type === 'text').map(b => b.content)).join('. ');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Buat 4 poin insight singkat dan tajam dari artikel berita ini dalam Bahasa Indonesia. Maksimal 20 kata per poin. Format: hanya JSON array of strings. Judul: ${title}. Konten: ${(summary + '. ' + allText).substring(0, 1500)}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      setAiInsight(parsed);
    } catch {
      const sentences = (summary + '. ' + allText).split(/[.!?]+/).filter(s => s.trim().length > 15).slice(0, 4);
      setAiInsight(sentences.map(s => s.trim()));
    }
    setGeneratingInsight(false);
  };

  // ── SUBMIT ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const thumb = thumbnailUrl || carouselItems[0]?.url || '';
    if (!thumb) { alert('Upload minimal 1 foto di header!'); return; }
    setSaving(true);
    try {
      const articleData: Partial<NewsArticle> = {
        title, summary, category, author,
        imageUrl: thumb,
        carouselItems: carouselItems.length > 0 ? carouselItems : [{ type: 'image', url: thumb }],
        pages,
        aiInsight: aiInsight.length > 0 ? aiInsight : undefined,
        content: pages.flatMap(p => p.blocks.filter(b => b.type === 'text').map(b => b.content)).join('\n\n'),
        contentBlocks: pages[0]?.blocks.map(b => ({ type: b.type as 'image' | 'text', content: b.content })),
      };

      if (mode === 'edit' && editingId) {
        await onUpdateArticle(editingId, articleData);
        alert('✅ Artikel berhasil diupdate!');
        setMode('list'); setEditingId(null); resetForm();
      } else {
        const newArticle = { ...articleData, publishedAt: new Date().toISOString() } as NewsArticle;
        await onAddArticle(newArticle);
        setLastPublished(newArticle);
        setShowNotifPopup(true); setNotifResult(null);
        setMode('list'); resetForm();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;

  const s = (base: React.CSSProperties): React.CSSProperties => base;
  const input = s({ width: '100%', padding: '11px 13px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif", color: '#111', background: '#fff' });
  const label = s({ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#888', marginBottom: '5px' });
  const card = s({ background: '#fff', borderRadius: '16px', border: '1px solid #ececec', marginBottom: '10px', overflow: 'hidden' });
  const cardHead = s({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' });
  const cardBody = s({ padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: '10px' });
  const sectionLabel = s({ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#aaa' });

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px 100px', fontFamily: "'Montserrat', sans-serif" }}>

      {/* POPUP NOTIF */}
      {showNotifPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '360px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', background: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Artikel Dipublish!</p>
              <p style={{ fontSize: '12px', color: '#888' }}>Kirim notifikasi ke subscriber?</p>
            </div>
            {notifResult && <div style={{ textAlign: 'center', padding: '9px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, marginBottom: '12px', background: notifResult.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: notifResult.startsWith('✅') ? '#15803d' : '#dc2626' }}>{notifResult}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowNotifPopup(false); setNotifResult(null); }} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'transparent', color: '#6b7280', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Tidak</button>
              <button onClick={handleKirimNotif} disabled={sendingNotif || !!notifResult?.startsWith('✅')} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: '12px', background: '#000', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: sendingNotif ? 0.6 : 1 }}>
                {sendingNotif ? 'Mengirim...' : notifResult?.startsWith('✅') ? 'Terkirim ✓' : 'Kirim Notif'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: 0 }}>
            {mode === 'edit' ? 'Edit Artikel' : mode === 'add' ? 'Berita Baru' : 'CMS'}
          </h1>
          <p style={{ fontSize: '11px', color: '#aaa', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.1em', margin: '3px 0 0' }}>
            {mode === 'list' ? `${articles.length} artikel` : 'TelierNews Admin'}
          </p>
        </div>
        {mode === 'list' ? (
          <button onClick={() => { setMode('add'); resetForm(); }} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>+ Berita Baru</button>
        ) : (
          <button onClick={() => { setMode('list'); setEditingId(null); resetForm(); }} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>← Batal</button>
        )}
      </div>

      {/* STATS */}
      {mode === 'list' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {[{ num: articles.length, label: 'Total' }, { num: new Set(articles.map(a => a.category)).size, label: 'Kategori' }, { num: articles.filter(a => new Date(a.publishedAt).toDateString() === new Date().toDateString()).length, label: 'Hari ini' }].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', border: '1px solid #ececec', borderRadius: '12px', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#aaa', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      {mode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {articles.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#ccc', letterSpacing: '0.2em' }}>BELUM ADA ARTIKEL</div>}
          {articles.map(article => (
            <div key={article.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #ececec', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={article.imageUrl} alt="" referrerPolicy="no-referrer" style={{ width: '60px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: '3px' }}>{article.category}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '3px' }}>{article.title}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc' }}>{new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => startEdit(article)} style={{ padding: '5px 10px', border: '1px solid #e0e0e0', background: '#fafafa', color: '#444', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => { if (window.confirm('Hapus artikel ini?')) onDeleteArticle(article.id); }} style={{ padding: '5px 10px', border: '1px solid #ffecec', background: '#fff5f5', color: '#ff4444', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM */}
      {(mode === 'add' || mode === 'edit') && (
        <form onSubmit={handleSubmit}>

          {/* INFO DASAR */}
          <div style={card}>
            <div style={cardHead}><span style={sectionLabel}>Info Dasar</span></div>
            <div style={cardBody}>
              <div><span style={label}>Judul Berita</span><input required style={input} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Masukkan judul yang menarik..." /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={label}>Kategori</span>
                  <select style={input} value={category} onChange={e => setCategory(e.target.value as Category)}>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><span style={label}>Penulis</span><input style={input} type="text" value={author} onChange={e => setAuthor(e.target.value)} /></div>
              </div>
              <div><span style={label}>Ringkasan</span><textarea required style={{ ...input, resize: 'none' } as React.CSSProperties} rows={2} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Ringkasan singkat..." /></div>
            </div>
          </div>

          {/* MEDIA HEADER CAROUSEL */}
          <div style={card}>
            <div style={cardHead}>
              <span style={sectionLabel}>Media Header · Carousel</span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc' }}>{carouselItems.length} item</span>
            </div>
            <div style={cardBody}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '4px' }}>
                {carouselItems.map((item, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 'calc(80% - 30px)', scrollSnapAlign: 'start', position: 'relative' }}>
                    <div style={{ aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', background: '#f0f0f0' }}>
                      {item.type === 'video'
                        ? <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <img src={item.url} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <button type="button" onClick={() => removeCarouselItem(i)} style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    <span style={{ position: 'absolute', bottom: '7px', left: '7px', fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', letterSpacing: '0.15em', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{item.type.toUpperCase()} {i + 1}</span>
                  </div>
                ))}

                {/* Add foto */}
                <label style={{ flexShrink: 0, minWidth: '52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0e0', borderRadius: '10px', background: 'transparent', cursor: 'pointer', gap: '3px', color: '#bbb', fontSize: '7px', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.1em', minHeight: '70px', padding: '10px 8px' }}>
                  {uploadingCarousel ? <div style={{ width: '16px', height: '16px', border: '2px solid #e0e0e0', borderTop: '2px solid #aaa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    FOTO
                  </>}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleCarouselUpload(e, 'image')} disabled={uploadingCarousel} />
                </label>

                {/* Add video */}
                <label style={{ flexShrink: 0, minWidth: '52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e0e0e0', borderRadius: '10px', background: 'transparent', cursor: 'pointer', gap: '3px', color: '#bbb', fontSize: '7px', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.1em', minHeight: '70px', padding: '10px 8px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                  VIDEO
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleCarouselUpload(e, 'video')} disabled={uploadingCarousel} />
                </label>
              </div>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ddd', letterSpacing: '0.1em', textAlign: 'center' }}>Geser → untuk lihat semua · Tap × untuk hapus</p>
            </div>
          </div>

          {/* AI INSIGHT */}
          <div style={card}>
            <div style={cardHead}>
              <span style={sectionLabel}>AI Insight</span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '7px', letterSpacing: '0.2em', background: '#111', color: '#fff', padding: '2px 7px', borderRadius: '4px' }}>AUTO</span>
            </div>
            <div style={cardBody}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#111', margin: '0 0 2px' }}>Generate Insight Otomatis</p>
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc', letterSpacing: '0.1em', margin: 0 }}>Klik setelah selesai menulis konten</p>
                </div>
                <button type="button" onClick={generateInsight} disabled={generatingInsight} style={{ padding: '8px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: generatingInsight ? 0.6 : 1, fontFamily: "'Montserrat', sans-serif", display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {generatingInsight ? 'Generating...' : aiInsight.length > 0 ? '↺ Regenerate' : '⚡ Generate'}
                </button>
              </div>
              {aiInsight.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {aiInsight.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#bbb', flexShrink: 0, paddingTop: '2px', width: '16px' }}>0{i + 1}</span>
                      <span style={{ fontSize: '12px', color: '#444', lineHeight: 1.55 }}>{p}</span>
                    </div>
                  ))}
                  <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc', letterSpacing: '0.1em', marginTop: '2px' }}>✓ Akan tampil otomatis di halaman baca</p>
                </div>
              )}
            </div>
          </div>

          {/* KONTEN PER HALAMAN */}
          <div style={card}>
            <div style={cardHead}><span style={sectionLabel}>Konten Artikel · Per Halaman</span></div>
            <div style={cardBody}>

              {/* Page tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {pages.map((_, i) => (
                  <button key={i} type="button" onClick={() => setActivePageIdx(i)}
                    style={{ flexShrink: 0, padding: '6px 14px', border: '1px solid', borderColor: i === activePageIdx ? '#111' : '#e0e0e0', borderRadius: '20px', background: i === activePageIdx ? '#111' : '#fff', color: i === activePageIdx ? '#fff' : '#aaa', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", whiteSpace: 'nowrap' }}>
                    Hal. {i + 1}
                  </button>
                ))}
                <button type="button" onClick={addPage} style={{ flexShrink: 0, padding: '6px 12px', border: '1px dashed #e0e0e0', borderRadius: '20px', background: 'transparent', fontSize: '11px', color: '#bbb', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif' " }}>+ Halaman</button>
                {pages.length > 1 && (
                  <button type="button" onClick={() => delPage(activePageIdx)} style={{ flexShrink: 0, padding: '6px 10px', border: '1px solid #ffecec', borderRadius: '20px', background: '#fff5f5', fontSize: '11px', color: '#ff6666', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>Hapus Hal.</button>
                )}
              </div>

              {/* Blocks */}
              {pages[activePageIdx]?.blocks.map((block, bi) => (
                <div key={bi} style={{ border: '1px solid #f0f0f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', color: '#aaa', textTransform: 'uppercase' }}>
                      {block.type === 'text' ? 'Teks' : block.type === 'image' ? 'Gambar · Bebas ukuran' : 'Video'}
                    </span>
                    <button type="button" onClick={() => removeBlock(activePageIdx, bi)} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', background: '#fee', color: '#f55', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                  <div style={{ padding: '10px' }}>
                    {block.type === 'text' && (
                      <textarea rows={5} value={block.content} onChange={e => updateBlock(activePageIdx, bi, { content: e.target.value })} placeholder="Tulis paragraf..."
                        style={{ ...input, resize: 'vertical' } as React.CSSProperties} />
                    )}
                    {block.type === 'image' && (
                      <>
                        <div style={{ borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                          {block.content ? <img src={block.content} alt="" referrerPolicy="no-referrer" style={{ width: '100%', display: 'block', maxHeight: '280px', objectFit: 'contain' }} /> : (
                            <>
                              <span style={{ fontSize: '11px', color: '#bbb' }}>Tap untuk upload gambar bebas ukuran</span>
                              <input type="file" accept="image/*" onChange={e => uploadBlockImage(activePageIdx, bi, e)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            </>
                          )}
                        </div>
                        <input type="text" value={block.caption || ''} onChange={e => updateBlock(activePageIdx, bi, { caption: e.target.value })} placeholder="Caption (opsional)" style={input} />
                      </>
                    )}
                    {block.type === 'video' && (
                      <>
                        <input type="url" value={block.content} onChange={e => updateBlock(activePageIdx, bi, { content: e.target.value })} placeholder="https://youtube.com/watch?v=..." style={{ ...input, marginBottom: '8px' } as React.CSSProperties} />
                        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc', letterSpacing: '0.1em', marginBottom: '6px' }}>ATAU UPLOAD VIDEO</p>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '2px dashed #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', color: '#bbb' }}>
                          Upload Video dari Galeri
                          <input type="file" accept="video/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadToCloudinary(f); updateBlock(activePageIdx, bi, { content: url }); e.target.value = ''; }} />
                        </label>
                        <input type="text" value={block.caption || ''} onChange={e => updateBlock(activePageIdx, bi, { caption: e.target.value })} placeholder="Caption (opsional)" style={{ ...input, marginTop: '8px' } as React.CSSProperties} />
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Add block buttons */}
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                {(['text', 'image', 'video'] as const).map(type => (
                  <button key={type} type="button" onClick={() => addBlock(activePageIdx, type)}
                    style={{ padding: '7px 13px', border: '1px dashed #e0e0e0', borderRadius: '8px', background: 'transparent', fontSize: '11px', color: '#bbb', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    {type === 'text' ? 'Teks' : type === 'image' ? 'Gambar' : 'Video'}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={saving || uploadingThumb || uploadingCarousel}
            style={{ width: '100%', padding: '14px', background: saving ? '#666' : '#000', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontFamily: "'Montserrat', sans-serif", marginTop: '4px' }}>
            {saving ? 'Menyimpan...' : mode === 'edit' ? '✓ Simpan Perubahan' : '🚀 Publikasikan Sekarang'}
          </button>

        </form>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Admin;
