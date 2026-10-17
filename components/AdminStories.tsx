import React, { useState } from 'react';
import { NewsArticle, Story, StoryNote } from '../types';

interface AdminStoriesProps {
  stories: Story[];
  articles: NewsArticle[];
  onAdd: (story: Omit<Story, 'id'>) => Promise<string | null>;
  onUpdate: (id: string, updates: Partial<Story>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onUpload: (file: File) => Promise<string>;
}

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };
const inp: React.CSSProperties = { width: '100%', padding: '11px 13px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: "'Montserrat', sans-serif", color: '#111', background: '#fff', boxSizing: 'border-box' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', marginBottom: '5px' };
const card: React.CSSProperties = { background: '#fff', borderRadius: '16px', border: '1px solid #ececec', marginBottom: '10px', overflow: 'hidden' };
const cardHead: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' };
const cardBody: React.CSSProperties = { padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' };
const secLabel: React.CSSProperties = { ...mono, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa' };
const btnDark: React.CSSProperties = { padding: '10px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' };
const btnLight: React.CSSProperties = { padding: '8px 12px', background: '#fafafa', color: '#444', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };
const btnDanger: React.CSSProperties = { padding: '8px 12px', background: '#fff5f5', color: '#ff4444', border: '1px solid #ffecec', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };

// Nilai untuk <input type="datetime-local"> dari Date
const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const StoryEditor: React.FC<{
  story: Story; articleCount: number;
  onUpdate: AdminStoriesProps['onUpdate']; onDelete: AdminStoriesProps['onDelete']; onUpload: AdminStoriesProps['onUpload'];
}> = ({ story, articleCount, onUpdate, onDelete, onUpload }) => {
  const [title, setTitle] = useState(story.title);
  const [summary, setSummary] = useState(story.summary);
  const [imageUrl, setImageUrl] = useState(story.imageUrl || '');
  const [noteText, setNoteText] = useState('');
  const [noteAt, setNoteAt] = useState(() => toLocalInput(new Date()));
  const [busy, setBusy] = useState(false);
  const notes = [...(story.notes || [])].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const dirty = title !== story.title || summary !== story.summary || imageUrl !== (story.imageUrl || '');

  const save = async () => { setBusy(true); try { await onUpdate(story.id, { title: title.trim(), summary: summary.trim(), imageUrl }); } finally { setBusy(false); } };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setBusy(true);
    try {
      const note: StoryNote = { id: `n${Date.now()}`, text: noteText.trim(), at: new Date(noteAt).toISOString() };
      await onUpdate(story.id, { notes: [...(story.notes || []), note] });
      setNoteText(''); setNoteAt(toLocalInput(new Date()));
    } finally { setBusy(false); }
  };

  const removeNote = async (id: string) => {
    if (!window.confirm('Hapus catatan ini?')) return;
    setBusy(true);
    try { await onUpdate(story.id, { notes: (story.notes || []).filter(n => n.id !== id) }); } finally { setBusy(false); }
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { setImageUrl(await onUpload(f)); } catch { alert('Upload gagal!'); }
    e.target.value = '';
  };

  return (
    <div style={card}>
      <div style={cardHead}>
        <span style={secLabel}>{articleCount} artikel · {notes.length} catatan</span>
        <button type="button" style={btnDanger} onClick={() => { if (window.confirm(`Hapus cerita "${story.title}"? Artikelnya tidak ikut terhapus.`)) onDelete(story.id); }}>Hapus cerita</button>
      </div>
      <div style={cardBody}>
        <div><span style={lbl}>Judul Cerita</span><input style={inp} value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><span style={lbl}>Ringkasan</span><textarea style={{ ...inp, resize: 'none' }} rows={2} value={summary} onChange={e => setSummary(e.target.value)} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {imageUrl && <img src={imageUrl} alt="" referrerPolicy="no-referrer" style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: '8px' }} />}
          <label style={{ ...btnLight, display: 'inline-block' }}>
            {imageUrl ? 'Ganti gambar' : 'Upload gambar sampul (opsional)'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadCover} />
          </label>
          {imageUrl && <button type="button" style={btnLight} onClick={() => setImageUrl('')}>Hapus</button>}
        </div>
        {dirty && <button type="button" style={btnDark} disabled={busy || !title.trim()} onClick={save}>{busy ? 'Menyimpan...' : 'Simpan perubahan'}</button>}

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
          <span style={lbl}>Catatan singkat (tanpa halaman artikel)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input style={inp} placeholder="Misal: Polisi menutup akses jalan menuju lokasi" value={noteText} onChange={e => setNoteText(e.target.value)} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ ...inp, flex: 1 }} type="datetime-local" value={noteAt} onChange={e => setNoteAt(e.target.value)} />
              <button type="button" style={btnDark} disabled={busy || !noteText.trim()} onClick={addNote}>+ Catatan</button>
            </div>
          </div>
          {notes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
              {notes.map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <span style={{ ...mono, fontSize: '9px', color: '#aaa', flexShrink: 0, paddingTop: '2px' }}>{new Date(n.at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ flex: 1, fontSize: '12px', color: '#333', lineHeight: 1.5 }}>{n.text}</span>
                  <button type="button" onClick={() => removeNote(n.id)} style={{ width: '22px', height: '22px', borderRadius: '6px', border: 'none', background: '#fee', color: '#f55', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Panel Admin untuk membuat dan mengelola cerita lini masa
const AdminStories: React.FC<AdminStoriesProps> = ({ stories, articles, onAdd, onUpdate, onDelete, onUpload }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd({ title: title.trim(), summary: summary.trim(), notes: [], createdAt: new Date().toISOString() });
      setTitle(''); setSummary('');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <form onSubmit={create} style={card}>
        <div style={cardHead}><span style={secLabel}>Cerita baru</span></div>
        <div style={cardBody}>
          <div><span style={lbl}>Judul Cerita</span><input required style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Krisis Kabut Asap Regional" /></div>
          <div><span style={lbl}>Ringkasan</span><textarea style={{ ...inp, resize: 'none' }} rows={2} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Satu paragraf: apa yang terjadi" /></div>
          <button type="submit" style={btnDark} disabled={saving || !title.trim()}>{saving ? 'Menyimpan...' : '+ Buat Cerita'}</button>
          <p style={{ ...mono, fontSize: '9px', color: '#bbb', letterSpacing: '0.08em', margin: 0, lineHeight: 1.6 }}>
            Untuk memasukkan artikel ke cerita: buka Edit/Berita Baru, lalu pilih cerita di kolom "Lini Masa".
          </p>
        </div>
      </form>

      {stories.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', ...mono, fontSize: '10px', color: '#ccc', letterSpacing: '0.2em' }}>BELUM ADA CERITA</div>}
      {stories.map(s => (
        <StoryEditor
          key={s.id}
          story={s}
          articleCount={articles.filter(a => a.storyId === s.id).length}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
};

export default AdminStories;
