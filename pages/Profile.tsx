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

const m: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

/* ─── colours ─── */
const C = {
  bg:       '#000',
  surface:  '#111',
  border:   '#242424',
  text:     '#ffffff',
  sub:      '#888',        // subtitle — cukup terang di hitam
  dim:      '#555',        // hint paling redup
  accent:   '#ff3b30',
};

/* ── Toggle ── */
const Toggle: React.FC<{ on: boolean; loading?: boolean; onClick: () => void }> = ({ on, loading, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      position: 'relative', width: '54px', height: '32px', borderRadius: '16px',
      border: 'none', cursor: loading ? 'wait' : 'pointer', flexShrink: 0,
      background: on ? '#ffffff' : '#2c2c2c',
      transition: 'background 0.25s', opacity: loading ? 0.5 : 1,
    }}
  >
    <span style={{
      position: 'absolute', top: '5px', left: on ? '27px' : '5px',
      width: '22px', height: '22px', borderRadius: '50%',
      background: on ? '#000' : '#666',
      transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
    }} />
  </button>
);

/* ── Section Title ── */
const SectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ paddingBottom: '16px' }}>
    <span style={{
      ...mono, fontSize: '12px', color: C.sub,
      letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
    }}>
      {label}
    </span>
  </div>
);

/* ── Divider ── */
const Divider = () => <div style={{ height: '1px', background: C.border }} />;

/* ── Row Item ── */
const RowItem: React.FC<{
  icon: React.ReactNode; title: string; subtitle: string;
  right?: React.ReactNode; onClick?: () => void;
}> = ({ icon, title, subtitle, right, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '18px 0', cursor: onClick ? 'pointer' : 'default',
  }}>
    <div style={{
      width: '46px', height: '46px', borderRadius: '13px',
      background: C.surface, border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '16px', fontWeight: 600, color: C.text,
        marginBottom: '5px', letterSpacing: '-0.01em',
      }}>
        {title}
      </div>
      <div style={{
        ...mono, fontSize: '12px', color: C.sub, letterSpacing: '0.02em',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {subtitle}
      </div>
    </div>
    {right}
  </div>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const Profile: React.FC = () => {
  const [user,          setUser]          = useState<any>(null);
  const [notifications, setNotifications] = useState(false);
  const [notifLoading,  setNotifLoading]  = useState(false);
  const [newsletter,    setNewsletter]    = useState(() => localStorage.getItem('tn_newsletter') === 'true');
  const [topics,        setTopics]        = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tn_topics');
      if (saved === null) return [];
      return JSON.parse(saved);
    } catch { return []; }
  });
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [readCount,     setReadCount]     = useState(0);
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate('/'); return; }
      setUser(u);
      setNotifications(Notification.permission === 'granted' && localStorage.getItem('tn_notif_granted') === 'true');
      const bms = await fetchBookmarks(u.uid);
      setBookmarkCount(bms.length);
      setReadCount(Object.keys(localStorage).filter(k => k.startsWith('tn_viewed_')).length);
    });
    return () => unsub();
  }, [navigate]);

  const handleNotificationsToggle = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      if (!notifications) {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) { alert('Browser tidak support notifikasi.'); return; }
        let perm = Notification.permission;
        if (perm !== 'granted') perm = await Notification.requestPermission();
        if (perm !== 'granted') { alert('Izin notifikasi ditolak.'); return; }
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
        const msg = await getMessagingInstance();
        if (!msg) { alert('Messaging tidak didukung browser ini.'); return; }
        const token = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
        if (token) {
          await setDoc(doc(db, 'fcm_tokens', token), { token, createdAt: new Date().toISOString(), ua: navigator.userAgent.substring(0, 100) });
          localStorage.setItem('tn_notif_granted', 'true');
          localStorage.setItem('tn_fcm_token', token);
          setNotifications(true);
        } else { alert('Gagal mendapatkan token. Coba lagi.'); }
      } else {
        const msg       = await getMessagingInstance();
        const savedTok  = localStorage.getItem('tn_fcm_token');
        if (msg && savedTok) {
          try { await deleteToken(msg); await deleteDoc(doc(db, 'fcm_tokens', savedTok)); } catch (e) { console.warn(e); }
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
    const next = topics.includes(t) ? topics.filter(x => x !== t) : [...topics, t];
    setTopics(next);
    localStorage.setItem('tn_topics', JSON.stringify(next));
    window.dispatchEvent(new Event('topics-updated'));
  };

  const handleLogout = async () => {
    try { await signOut(auth); localStorage.removeItem('admin_secret_code'); navigate('/'); }
    catch (e) { console.error(e); }
  };

  const allSelected = topics.length === 0;

  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #222', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .topic-btn { transition: all 0.15s ease !important; }
        .topic-btn:active { transform: scale(0.93) !important; }
        .row-hover:active { opacity: 0.7; }
        .upgrade-btn:hover { opacity: 0.88; }
        .logout-btn:hover { background: rgba(255,59,48,0.1) !important; border-color: ${C.accent} !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, ...m, paddingBottom: '100px', color: C.text }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* ══ HERO ══ */}
          <div className="fade-up" style={{
            background: C.bg, paddingTop: '72px', paddingBottom: '32px',
            paddingLeft: '24px', paddingRight: '24px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            {/* Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: '#1a1a1a', border: `1.5px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em',
                }}>
                  {initial}
                </div>
                <div style={{
                  position: 'absolute', bottom: '3px', right: '3px',
                  width: '13px', height: '13px', borderRadius: '50%',
                  background: '#4ade80', border: '2.5px solid #000',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: C.text, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ ...mono, fontSize: '13px', color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px',
              background: C.border, borderRadius: '16px', overflow: 'hidden',
            }}>
              {[
                { n: String(readCount),     l: 'Dibaca'    },
                { n: String(bookmarkCount), l: 'Disimpan'  },
                { n: '0',                   l: 'Komentar'  },
              ].map((s, i) => (
                <div key={s.l} style={{
                  background: '#0d0d0d', padding: '20px 8px', textAlign: 'center',
                  borderRight: i < 2 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '7px' }}>
                    {s.n}
                  </div>
                  <div style={{ ...mono, fontSize: '11px', color: C.sub, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ BODY ══ */}
          <div style={{ padding: '0 20px' }}>

            {/* MEMBERSHIP */}
            <div className="fade-up" style={{ paddingTop: '32px', paddingBottom: '28px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.06s' }}>
              <SectionTitle label="Membership" />
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '18px', background: C.surface,
                borderRadius: '16px', border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: C.text, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="20" height="20" fill="none" stroke="#000" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '5px' }}>Paket Gratis</div>
                  <div style={{ ...mono, fontSize: '12px', color: C.sub }}>Upgrade untuk akses penuh & tanpa iklan</div>
                </div>
                <button
                  className="upgrade-btn"
                  onClick={() => navigate('/subscribe')}
                  style={{
                    padding: '11px 22px', background: C.text, color: '#000',
                    border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800,
                    cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s', ...m,
                  }}>
                  Upgrade
                </button>
              </div>
            </div>

            {/* PENGATURAN */}
            <div className="fade-up" style={{ paddingTop: '28px', paddingBottom: '4px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.12s' }}>
              <SectionTitle label="Pengaturan" />

              <div className="row-hover" onClick={handleNotificationsToggle} style={{ cursor: 'pointer' }}>
                <RowItem
                  icon={<svg width="20" height="20" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                  title="Breaking News"
                  subtitle={notifLoading ? 'Memproses...' : notifications ? 'Aktif · Kamu akan menerima notifikasi' : 'Nonaktif · Ketuk untuk aktifkan'}
                  right={<Toggle on={notifications} loading={notifLoading} onClick={handleNotificationsToggle} />}
                />
              </div>

              <Divider />

              <div className="row-hover" onClick={handleNewsletterToggle} style={{ cursor: 'pointer' }}>
                <RowItem
                  icon={<svg width="20" height="20" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  title="Newsletter Harian"
                  subtitle={newsletter ? 'Aktif · Ringkasan berita tiap hari ke emailmu' : 'Nonaktif · Ringkasan berita setiap hari'}
                  right={<Toggle on={newsletter} onClick={handleNewsletterToggle} />}
                />
              </div>
            </div>

            {/* FILTER BERITA */}
            <div className="fade-up" style={{ paddingTop: '28px', paddingBottom: '28px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.18s' }}>
              <SectionTitle label="Filter Berita" />
              <p style={{ ...mono, fontSize: '13px', color: C.sub, marginBottom: '18px', lineHeight: 1.65 }}>
                Pilih topik untuk filter feed. Kosongkan = tampilkan semua berita.
              </p>

              {/* Semua */}
              <button
                className="topic-btn"
                onClick={() => { setTopics([]); localStorage.setItem('tn_topics', '[]'); window.dispatchEvent(new Event('topics-updated')); }}
                style={{
                  padding: '11px 24px', borderRadius: '100px', cursor: 'pointer', marginBottom: '14px',
                  border: `1.5px solid ${allSelected ? C.text : C.border}`,
                  background: allSelected ? C.text : 'transparent',
                  ...mono, fontSize: '13px', fontWeight: 700,
                  color: allSelected ? '#000' : C.sub,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}
              >
                Semua Kategori
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {ALL_TOPICS.map(t => {
                  const active = topics.includes(t);
                  return (
                    <button key={t} className="topic-btn" onClick={() => toggleTopic(t)}
                      style={{
                        padding: '11px 22px', borderRadius: '100px', cursor: 'pointer',
                        border: `1.5px solid ${active ? C.text : C.border}`,
                        background: active ? C.text : 'transparent',
                        ...mono, fontSize: '13px', fontWeight: active ? 700 : 400,
                        color: active ? '#000' : C.sub,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                      }}>
                      {t}
                    </button>
                  );
                })}
              </div>

              {topics.length > 0 && (
                <div style={{ marginTop: '16px', padding: '13px 16px', background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}` }}>
                  <span style={{ ...mono, fontSize: '12px', color: C.sub, letterSpacing: '0.04em' }}>
                    Feed menampilkan: {topics.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* LAINNYA */}
            <div className="fade-up" style={{ paddingTop: '28px', paddingBottom: '4px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.24s' }}>
              <SectionTitle label="Lainnya" />
              <RowItem
                icon={<svg width="20" height="20" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Bantuan & FAQ"
                subtitle="Pusat bantuan TelierNews"
                right={<svg width="16" height="16" fill="none" stroke={C.sub} viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
                onClick={() => {}}
              />
            </div>

            {/* LOGOUT */}
            <div className="fade-up" style={{ paddingTop: '28px', animationDelay: '0.3s' }}>
              <button
                className="logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '19px',
                  background: 'transparent',
                  border: `1.5px solid ${C.border}`,
                  borderRadius: '14px',
                  color: C.accent,
                  fontWeight: 700, fontSize: '15px',
                  cursor: 'pointer', letterSpacing: '0.12em',
                  ...mono, transition: 'all 0.2s', textTransform: 'uppercase',
                }}
              >
                Logout
              </button>
            </div>

            <div style={{ ...mono, fontSize: '10px', color: C.dim, letterSpacing: '0.18em', textAlign: 'center', padding: '28px 0 0', textTransform: 'uppercase' }}>
              TelierNews v2.1.0 · Build 2026
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
