import React, { useState, useEffect } from 'react';
import {
  collection, addDoc, deleteDoc, query, where,
  orderBy, onSnapshot, serverTimestamp, Timestamp, doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebase';

interface Comment {
  id: string;
  articleId: string;
  name: string;
  text: string;
  createdAt: Timestamp | null;
  uid: string | null;
  isAnon: boolean;
}

interface ArticleCommentsProps {
  articleId: string;
}

const getRelativeTime = (ts: Timestamp | null): string => {
  if (!ts) return 'baru saja';
  const diff = Date.now() - ts.toMillis();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
};

const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [myCommentIds, setMyCommentIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tn_my_comments') || '[]'); } catch { return []; }
  });

  const saveMyComment = (commentId: string) => {
    const updated = [...myCommentIds, commentId];
    setMyCommentIds(updated);
    localStorage.setItem('tn_my_comments', JSON.stringify(updated));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUid(user.uid);
        setUserDisplayName(user.displayName || user.email?.split('@')[0] || 'User');
      } else {
        setIsLoggedIn(false);
        setCurrentUid(null);
        setUserDisplayName(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    });
    return () => unsub();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        articleId,
        name: isLoggedIn ? userDisplayName : (name.trim() || 'Anonim'),
        text: text.trim(),
        createdAt: serverTimestamp(),
        uid: isLoggedIn ? auth.currentUser?.uid : null,
        isAnon: !isLoggedIn,
      });
      saveMyComment(docRef.id);
      setText(''); setName('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Gagal kirim komentar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    setDeletingId(commentId);
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error('Gagal hapus komentar:', err);
      alert('Gagal menghapus komentar.');
    } finally {
      setDeletingId(null);
    }
  };

  // Bisa hapus kalau: ID ada di localStorage ATAU uid sama (kalau login)
  const canDelete = (c: Comment) => {
    if (myCommentIds.includes(c.id)) return true;
    if (currentUid && c.uid === currentUid) return true;
    return false;
  };

  return (
    <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #f0f0f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#999' }}>
          Diskusi
        </span>
        {comments.length > 0 && (
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#aaa', background: '#f5f5f5', padding: '2px 8px', borderRadius: '20px' }}>
            {comments.length}
          </span>
        )}
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: '24px' }}>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#ccc', letterSpacing: '0.2em' }}>BELUM ADA KOMENTAR</p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', color: '#bbb', marginTop: '6px' }}>Jadilah yang pertama berdiskusi</p>
        </div>
      ) : (
        <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f0f0f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#888' }}>
                {c.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                {/* Name + time + delete */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', fontWeight: 600, color: '#111' }}>
                      {c.name || 'Anonim'}
                    </span>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#bbb' }}>
                      {getRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  {/* Tombol hapus — hanya muncul kalau milik user ini */}
                  {canDelete(c) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      style={{
                        padding: '3px 8px', border: '1px solid #ffecec',
                        background: '#fff5f5', color: '#ff6666',
                        borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'Montserrat', sans-serif",
                        opacity: deletingId === c.id ? 0.5 : 1,
                        flexShrink: 0,
                      }}
                    >
                      {deletingId === c.id ? '...' : 'Hapus'}
                    </button>
                  )}
                </div>
                {/* Bubble */}
                <div style={{ background: '#f8f8f8', borderRadius: '0 12px 12px 12px', padding: '10px 14px' }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', color: '#333', lineHeight: 1.6, margin: 0 }}>
                    {c.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#f8f8f8', borderRadius: '16px', padding: '16px', border: '1px solid #eee' }}>
          {!isLoggedIn && (
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Nama kamu (opsional)" maxLength={40}
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #e0e0e0', padding: '0 0 10px', marginBottom: '12px', fontSize: '13px', color: '#333', outline: 'none', fontFamily: "'Montserrat', sans-serif" }} />
          )}
          {isLoggedIn && (
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#aaa', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Sebagai <span style={{ color: '#555' }}>{userDisplayName}</span>
            </div>
          )}
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Tulis komentar atau pertanyaan..." maxLength={500} rows={3}
            style={{ width: '100%', background: 'transparent', border: 'none', resize: 'none', fontSize: '13px', color: '#333', outline: 'none', fontFamily: "'Montserrat', sans-serif", lineHeight: 1.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc' }}>{text.length}/500</span>
            <button type="submit" disabled={loading || !text.trim()}
              style={{ padding: '8px 18px', borderRadius: '20px', background: text.trim() ? '#000' : '#ddd', color: text.trim() ? '#fff' : '#aaa', border: 'none', cursor: text.trim() ? 'pointer' : 'default', fontSize: '12px', fontWeight: 600, fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s' }}>
              {loading ? 'Mengirim...' : submitted ? '✓ Terkirim' : 'Kirim'}
            </button>
          </div>
        </div>
        {!isLoggedIn && (
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: '#ccc', letterSpacing: '0.1em', marginTop: '8px', textAlign: 'center' }}>
            Komentar anonim diperbolehkan · Jaga kesopanan
          </p>
        )}
      </form>
    </div>
  );
};

export default ArticleComments;
