import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, getMessagingInstance } from '../services/firebase';
import { getToken, deleteToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { fetchBookmarks } from '../services/articleService';

const VAPID_KEY = import.meta.env.VAPID_KEY || '';
const ALL_TOPICS = ['Tech', 'Geopolitics', 'Economy', 'Science', 'Space', 'Cyber', 'Defense', 'AI'];
const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const Toggle: React.FC<{ on: boolean; loading?: boolean; onClick: () => void }> = ({ on, loading, onClick }) => (
  <button onClick={onClick} disabled={loading}
    style={{
      position: 'relative', width: '44px', height: '26px', borderRadius: '13px',
      border: 'none', cursor: loading ? 'wait' : 'pointer', flexShrink: 0,
      background: on ? '#111' : '#e5e5e5', transition: 'background 0.2s', opacity: loading ? 0.5 : 1,
      outline: on ? '1.5px solid #555' : '1.5px solid #d0d0d0',
    }}>
    <span style={{
      position: 'absolute', top: '4px', left: on ? '22px' : '4px',
      width: '18px', height: '18px', borderRadius: '50%',
      background: on ? '#fff' : '#999',
      transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }} />
  </button>
);

const Divider = () => <div style={{ height: '1px', background: '#f0f0f0', margin: '4px 0' }} />;

const SectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
  </div>
);

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(() => localStorage.getItem('tn_newsletter') === 'true');
  const [topics, setTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tn_topics');
      // null = semua kategori (belum pernah set)
      if (saved === null) return [];
      return JSON.parse(saved);
    } catch { return []; }
  });
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate('/'); return; }
      setUser(currentUser);
      const granted = Notification.permission === 'granted' && localStorage.getItem('tn_notif_granted') === 'true';
      setNotifications(granted);

      // Hitung bookmark dari Firebase
      const bms = await fetchBookmarks(currentUser.uid);
      setBookmarkCount(bms.length);

      // Hitung artikel dibaca dari localStorage
      const readKeys = Object.keys(localStorage).filter(k => k.startsWith('tn_viewed_'));
      setReadCount(readKeys.length);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNotificationsToggle = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      if (!notifications) {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) { alert('Browser tidak support notifikasi.'); return; }
        let permission = Notification.permission;
        if (permission !== 'granted') permission = await Notification.requestPermission();
        if (permission !== 'granted') { alert('Izin notifikasi ditolak.'); return; }
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
        const messaging = await getMessagingInstance();
        if (!messaging) { alert('Messaging tidak didukung browser ini.'); return; }
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
        if (token) {
          await setDoc(doc(db, 'fcm_tokens', token), { token, createdAt: new Date().toISOString(), ua: navigator.userAgent.substring(0, 100) });
          localStorage.setItem('tn_notif_granted', 'true');
          localStorage.setItem('tn_fcm_token', token);
          setNotifications(true);
        } else { alert('Gagal mendapatkan token. Coba lagi.'); }
      } else {
        const messaging = await getMessagingInstance();
        const savedToken = localStorage.getItem('tn_fcm_token');
        if (messaging && savedToken) {
          try { await deleteToken(messaging); await deleteDoc(doc(db, 'fcm_tokens', savedToken)); } catch (e) { console.warn(e); }
        }
        localStorage.removeItem('tn_notif_granted');
        localStorage.removeItem('tn_fcm_token');
        setNotifications(false);
      }
    } catch (err) { console.error(err); alert('Terjadi kesalahan. Coba lagi.'); }
    finally { setNotifLoading(false); }
  };

  const handleNewsletterToggle = () => {
    const next = !newsletter;
    setNewsletter(next);
    localStorage.setItem('tn_newsletter', String(next));
  };

  const toggleTopic = (t: string) => {
    // [] = semua topik (tidak ada filter)
    // kalau pilih topik → filter aktif
    const next = topics.includes(t) ? topics.filter(x => x !== t) : [...topics, t];
    setTopics(next);
    localStorage.setItem('tn_topics', JSON.stringify(next));
    // Dispatch event supaya Home bisa sync tanpa reload
    window.dispatchEvent(new Event('topics-updated'));
  };

  const handleLogout = async () => {
    try { await signOut(auth); localStorage.removeItem('admin_secret_code'); navigate('/'); }
    catch (error) { console.error('Logout error:', error); }
  };

  const allSelected = topics.length === 0;

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #eee', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        .topic-btn { transition: all 0.15s ease; }
        .topic-btn:active { transform: scale(0.96); }
        .row-item:active { background: #f8f8f8 !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fff', ...m, paddingBottom: '80px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* ── HERO HEADER ── */}
          <div style={{
            background: '#000', paddingTop: '80px', paddingBottom: '32px',
            paddingLeft: '24px', paddingRight: '24px',
          }}>
            {/* Avatar + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#1a1a1a', border: '1.5px solid #2a2a2a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
                }}>
                  {initial}
                </div>
                <div style={{
                  position: 'absolute', bottom: '2px', right: '2px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#4ade80', border: '2px solid #000',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '3px', letterSpacing: '-0.01em' }}>
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ ...mono, fontSize: '11px', color: '#666', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#1a1a1a', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1a1a1a' }}>
              {[
                { n: String(readCount), l: 'Dibaca' },
                { n: String(bookmarkCount), l: 'Disimpan' },
                { n: '0', l: 'Komentar' },
              ].map((s, i) => (
                <div key={s.l} style={{
                  background: '#0a0a0a', padding: '16px 8px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #1a1a1a' : 'none',
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '5px' }}>{s.n}</div>
                  <div style={{ ...mono, fontSize: '9px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ padding: '0 20px' }}>

            {/* MEMBERSHIP */}
            <div style={{ paddingTop: '28px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
              <SectionTitle label="Membership" />
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', background: '#fafafa', borderRadius: '14px',
                border: '1px solid #eee',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#000', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#000', marginBottom: '3px' }}>Paket Gratis</div>
                  <div style={{ ...mono, fontSize: '10px', color: '#888', letterSpacing: '0.04em' }}>Upgrade untuk akses penuh & tanpa iklan</div>
                </div>
                <button
                  onClick={() => navigate('/subscribe')}
                  style={{
                    padding: '8px 18px', background: '#000', color: '#fff',
                    border: 'none', borderRadius: '8px', fontSize: '12px',
                    fontWeight: 700, cursor: 'pointer', flexShrink: 0, ...m,
                  }}>
                  Upgrade
                </button>
              </div>
            </div>

            {/* PENGATURAN */}
            <div style={{ paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
              <SectionTitle label="Pengaturan" />

              {/* Notifikasi */}
              <div className="row-item" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 0', cursor: 'pointer',
              }} onClick={handleNotificationsToggle}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#f5f5f5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="#333" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '2px' }}>Breaking News</div>
                  <div style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.04em' }}>
                    {notifLoading ? 'Memproses...' : notifications ? 'Aktif · Kamu akan menerima notifikasi' : 'Nonaktif · Ketuk untuk aktifkan'}
                  </div>
                </div>
                <Toggle on={notifications} loading={notifLoading} onClick={handleNotificationsToggle} />
              </div>

              <Divider />

              {/* Newsletter */}
              <div className="row-item" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 0', cursor: 'pointer',
              }} onClick={handleNewsletterToggle}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#f5f5f5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="#333" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '2px' }}>Newsletter Harian</div>
                  <div style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.04em' }}>
                    {newsletter ? 'Aktif · Ringkasan berita tiap hari ke emailmu' : 'Nonaktif · Ringkasan berita setiap hari'}
                  </div>
                </div>
                <Toggle on={newsletter} onClick={handleNewsletterToggle} />
              </div>
            </div>

            {/* TOPIK FAVORIT */}
            <div style={{ paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
              <SectionTitle label="Filter Berita" />
              <p style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.05em', marginBottom: '14px', lineHeight: 1.6 }}>
                Pilih topik untuk filter feed. Kosongkan = tampilkan semua berita.
              </p>

              {/* Tombol "Semua" */}
              <button
                className="topic-btn"
                onClick={() => {
                  setTopics([]);
                  localStorage.setItem('tn_topics', JSON.stringify([]));
                  window.dispatchEvent(new Event('topics-updated'));
                }}
                style={{
                  padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', marginBottom: '10px',
                  border: `1.5px solid ${allSelected ? '#000' : '#e0e0e0'}`,
                  background: allSelected ? '#000' : '#fff',
                  ...mono, fontSize: '11px',
                  color: allSelected ? '#fff' : '#aaa',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                Semua Kategori
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ALL_TOPICS.map(t => {
                  const active = topics.includes(t);
                  return (
                    <button key={t} className="topic-btn" onClick={() => toggleTopic(t)}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                        border: `1.5px solid ${active ? '#000' : '#e0e0e0'}`,
                        background: active ? '#000' : '#fff',
                        ...mono, fontSize: '11px',
                        color: active ? '#fff' : '#888',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>

              {topics.length > 0 && (
                <div style={{
                  marginTop: '12px', padding: '10px 14px',
                  background: '#f9f9f9', borderRadius: '10px', border: '1px solid #f0f0f0',
                }}>
                  <span style={{ ...mono, fontSize: '10px', color: '#555', letterSpacing: '0.08em' }}>
                    Feed hanya menampilkan: {topics.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* LAINNYA */}
            <div style={{ paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
              <SectionTitle label="Lainnya" />
              <div className="row-item" style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 0', cursor: 'pointer',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#f5f5f5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="#333" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '2px' }}>Bantuan & FAQ</div>
                  <div style={{ ...mono, fontSize: '10px', color: '#aaa', letterSpacing: '0.04em' }}>Pusat bantuan TelierNews</div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#ccc" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* LOGOUT */}
            <div style={{ paddingTop: '20px' }}>
              <button onClick={handleLogout}
                style={{
                  width: '100%', padding: '15px', background: '#fff',
                  border: '1.5px solid #eee', borderRadius: '12px',
                  color: '#ff3333', fontWeight: 700, fontSize: '13px',
                  cursor: 'pointer', letterSpacing: '0.08em', ...mono,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.borderColor = '#ffcccc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#eee'; }}>
                LOGOUT
              </button>
            </div>

            <div style={{ ...mono, fontSize: '9px', color: '#ccc', letterSpacing: '0.2em', textAlign: 'center', padding: '24px 0 0' }}>
              TELIERNEWS v2.1.0 · BUILD 2026
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
