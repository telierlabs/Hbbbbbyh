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

/* ── Toggle Switch ── */
const Toggle: React.FC<{ on: boolean; loading?: boolean; onClick: () => void }> = ({ on, loading, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      position: 'relative',
      width: '52px',
      height: '30px',
      borderRadius: '15px',
      border: 'none',
      cursor: loading ? 'wait' : 'pointer',
      flexShrink: 0,
      background: on ? '#fff' : '#2a2a2a',
      transition: 'background 0.25s',
      opacity: loading ? 0.5 : 1,
      outline: on ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #3a3a3a',
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '5px',
        left: on ? '26px' : '5px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: on ? '#000' : '#555',
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}
    />
  </button>
);

/* ── Section Title ── */
const SectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ paddingBottom: '14px', marginBottom: '4px' }}>
    <span
      style={{
        ...mono,
        fontSize: '11px',
        color: '#555',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  </div>
);

/* ── Thin Divider ── */
const Divider = () => (
  <div style={{ height: '1px', background: '#1e1e1e', margin: '0' }} />
);

/* ── Row Item ── */
const RowItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, title, subtitle, right, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '18px 0',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: '#111',
        border: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#fff',
          marginBottom: '4px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          ...mono,
          fontSize: '11px',
          color: '#555',
          letterSpacing: '0.04em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
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
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(
    () => localStorage.getItem('tn_newsletter') === 'true'
  );
  const [topics, setTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tn_topics');
      if (saved === null) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      setUser(currentUser);
      const granted =
        Notification.permission === 'granted' &&
        localStorage.getItem('tn_notif_granted') === 'true';
      setNotifications(granted);

      const bms = await fetchBookmarks(currentUser.uid);
      setBookmarkCount(bms.length);

      const readKeys = Object.keys(localStorage).filter((k) =>
        k.startsWith('tn_viewed_')
      );
      setReadCount(readKeys.length);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNotificationsToggle = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      if (!notifications) {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          alert('Browser tidak support notifikasi.');
          return;
        }
        let permission = Notification.permission;
        if (permission !== 'granted')
          permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Izin notifikasi ditolak.');
          return;
        }
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );
        await navigator.serviceWorker.ready;
        const messaging = await getMessagingInstance();
        if (!messaging) {
          alert('Messaging tidak didukung browser ini.');
          return;
        }
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (token) {
          await setDoc(doc(db, 'fcm_tokens', token), {
            token,
            createdAt: new Date().toISOString(),
            ua: navigator.userAgent.substring(0, 100),
          });
          localStorage.setItem('tn_notif_granted', 'true');
          localStorage.setItem('tn_fcm_token', token);
          setNotifications(true);
        } else {
          alert('Gagal mendapatkan token. Coba lagi.');
        }
      } else {
        const messaging = await getMessagingInstance();
        const savedToken = localStorage.getItem('tn_fcm_token');
        if (messaging && savedToken) {
          try {
            await deleteToken(messaging);
            await deleteDoc(doc(db, 'fcm_tokens', savedToken));
          } catch (e) {
            console.warn(e);
          }
        }
        localStorage.removeItem('tn_notif_granted');
        localStorage.removeItem('tn_fcm_token');
        setNotifications(false);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan. Coba lagi.');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleNewsletterToggle = () => {
    const next = !newsletter;
    setNewsletter(next);
    localStorage.setItem('tn_newsletter', String(next));
  };

  const toggleTopic = (t: string) => {
    const next = topics.includes(t)
      ? topics.filter((x) => x !== t)
      : [...topics, t];
    setTopics(next);
    localStorage.setItem('tn_topics', JSON.stringify(next));
    window.dispatchEvent(new Event('topics-updated'));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('admin_secret_code');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const allSelected = topics.length === 0;

  /* ── Loading spinner ── */
  if (!user)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #222',
            borderTop: '2px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  const initial = (user.displayName || user.email || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Share+Tech+Mono&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        .topic-btn { transition: all 0.18s ease !important; }
        .topic-btn:hover { opacity: 0.85; }
        .topic-btn:active { transform: scale(0.94) !important; }
        .row-tap:active { background: #111 !important; border-radius: 14px; }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .upgrade-btn:hover { background: #e5e5e5 !important; }
        .logout-btn:hover { background: #1a0505 !important; border-color: #ff4444 !important; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          ...m,
          paddingBottom: '100px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* ══ HERO HEADER ══ */}
          <div
            className="fade-up"
            style={{
              background: '#000',
              paddingTop: '72px',
              paddingBottom: '28px',
              paddingLeft: '24px',
              paddingRight: '24px',
              borderBottom: '1px solid #141414',
            }}
          >
            {/* Avatar + Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                marginBottom: '28px',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: '#111',
                    border: '1.5px solid #2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {initial}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '3px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#4ade80',
                    border: '2px solid #000',
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: '5px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </div>
                <div
                  style={{
                    ...mono,
                    fontSize: '12px',
                    color: '#555',
                    letterSpacing: '0.03em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: '1px',
                background: '#1a1a1a',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #1a1a1a',
              }}
            >
              {[
                { n: String(readCount), l: 'Dibaca' },
                { n: String(bookmarkCount), l: 'Disimpan' },
                { n: '0', l: 'Komentar' },
              ].map((s, i) => (
                <div
                  key={s.l}
                  style={{
                    background: '#0a0a0a',
                    padding: '20px 8px',
                    textAlign: 'center',
                    borderRight: i < 2 ? '1px solid #1a1a1a' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      marginBottom: '6px',
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      ...mono,
                      fontSize: '10px',
                      color: '#444',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ BODY ══ */}
          <div style={{ padding: '0 20px' }}>

            {/* MEMBERSHIP */}
            <div
              className="fade-up"
              style={{
                paddingTop: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid #141414',
                animationDelay: '0.05s',
              }}
            >
              <SectionTitle label="Membership" />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px 16px',
                  background: '#0d0d0d',
                  borderRadius: '16px',
                  border: '1px solid #1e1e1e',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#000"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 3l14 9-14 9V3z"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '4px',
                    }}
                  >
                    Paket Gratis
                  </div>
                  <div
                    style={{
                      ...mono,
                      fontSize: '11px',
                      color: '#555',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Upgrade untuk akses penuh & tanpa iklan
                  </div>
                </div>
                <button
                  className="upgrade-btn"
                  onClick={() => navigate('/subscribe')}
                  style={{
                    padding: '10px 20px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                    transition: 'background 0.2s',
                    ...m,
                  }}
                >
                  Upgrade
                </button>
              </div>
            </div>

            {/* PENGATURAN */}
            <div
              className="fade-up"
              style={{
                paddingTop: '24px',
                paddingBottom: '8px',
                borderBottom: '1px solid #141414',
                animationDelay: '0.1s',
              }}
            >
              <SectionTitle label="Pengaturan" />

              {/* Notifikasi */}
              <div
                className="row-tap"
                style={{ cursor: 'pointer' }}
                onClick={handleNotificationsToggle}
              >
                <RowItem
                  icon={
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="#aaa"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  }
                  title="Breaking News"
                  subtitle={
                    notifLoading
                      ? 'Memproses...'
                      : notifications
                      ? 'Aktif · Kamu akan menerima notifikasi'
                      : 'Nonaktif · Ketuk untuk aktifkan'
                  }
                  right={
                    <Toggle
                      on={notifications}
                      loading={notifLoading}
                      onClick={handleNotificationsToggle}
                    />
                  }
                />
              </div>

              <Divider />

              {/* Newsletter */}
              <div
                className="row-tap"
                style={{ cursor: 'pointer' }}
                onClick={handleNewsletterToggle}
              >
                <RowItem
                  icon={
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="#aaa"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  title="Newsletter Harian"
                  subtitle={
                    newsletter
                      ? 'Aktif · Ringkasan berita tiap hari ke emailmu'
                      : 'Nonaktif · Ringkasan berita setiap hari'
                  }
                  right={
                    <Toggle on={newsletter} onClick={handleNewsletterToggle} />
                  }
                />
              </div>
            </div>

            {/* FILTER BERITA */}
            <div
              className="fade-up"
              style={{
                paddingTop: '24px',
                paddingBottom: '24px',
                borderBottom: '1px solid #141414',
                animationDelay: '0.15s',
              }}
            >
              <SectionTitle label="Filter Berita" />
              <p
                style={{
                  ...mono,
                  fontSize: '11px',
                  color: '#444',
                  letterSpacing: '0.05em',
                  marginBottom: '16px',
                  lineHeight: 1.7,
                }}
              >
                Pilih topik untuk filter feed. Kosongkan = tampilkan semua
                berita.
              </p>

              {/* Semua Kategori */}
              <button
                className="topic-btn"
                onClick={() => {
                  setTopics([]);
                  localStorage.setItem('tn_topics', JSON.stringify([]));
                  window.dispatchEvent(new Event('topics-updated'));
                }}
                style={{
                  padding: '10px 22px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  border: `1.5px solid ${allSelected ? '#fff' : '#2a2a2a'}`,
                  background: allSelected ? '#fff' : 'transparent',
                  ...mono,
                  fontSize: '12px',
                  color: allSelected ? '#000' : '#555',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Semua Kategori
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {ALL_TOPICS.map((t) => {
                  const active = topics.includes(t);
                  return (
                    <button
                      key={t}
                      className="topic-btn"
                      onClick={() => toggleTopic(t)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        border: `1.5px solid ${active ? '#fff' : '#2a2a2a'}`,
                        background: active ? '#fff' : 'transparent',
                        ...mono,
                        fontSize: '12px',
                        color: active ? '#000' : '#555',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {topics.length > 0 && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 16px',
                    background: '#0d0d0d',
                    borderRadius: '12px',
                    border: '1px solid #1e1e1e',
                  }}
                >
                  <span
                    style={{
                      ...mono,
                      fontSize: '11px',
                      color: '#666',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Feed menampilkan: {topics.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* LAINNYA */}
            <div
              className="fade-up"
              style={{
                paddingTop: '24px',
                paddingBottom: '8px',
                borderBottom: '1px solid #141414',
                animationDelay: '0.2s',
              }}
            >
              <SectionTitle label="Lainnya" />
              <RowItem
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#aaa"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                title="Bantuan & FAQ"
                subtitle="Pusat bantuan TelierNews"
                right={
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#333"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
                onClick={() => {}}
              />
            </div>

            {/* LOGOUT */}
            <div
              className="fade-up"
              style={{ paddingTop: '28px', animationDelay: '0.25s' }}
            >
              <button
                className="logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'transparent',
                  border: '1.5px solid #2a2a2a',
                  borderRadius: '14px',
                  color: '#ff4444',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  letterSpacing: '0.12em',
                  ...mono,
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                }}
              >
                Logout
              </button>
            </div>

            <div
              style={{
                ...mono,
                fontSize: '9px',
                color: '#2a2a2a',
                letterSpacing: '0.2em',
                textAlign: 'center',
                padding: '28px 0 0',
                textTransform: 'uppercase',
              }}
            >
              TelierNews v2.1.0 · Build 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
