import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, getMessagingInstance } from '../services/firebase';
import { getToken, deleteToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { fetchBookmarks } from '../services/articleService';

const VAPID_KEY = import.meta.env.VAPID_KEY || '';

// FIX BUG: label tampil di UI, value dipakai untuk filter/logika
const TOPICS: { label: string; value: string }[] = [
  { label: 'Tech',        value: 'Tech'        },
  { label: 'Geopolitics', value: 'Geopolitics' },
  { label: 'Economy',     value: 'Economy'     },
  { label: 'Science',     value: 'Science'     },
  { label: 'Space',       value: 'Space'       },
  { label: 'Cyber',       value: 'Cyber'       },
  { label: 'Defense',     value: 'Defense'     },
  // "AI" di UI → cocok dengan artikel ber-kategori "AI" atau "Artificial Intelligence"
  { label: 'AI',          value: 'AI'          },
];

const C = {
  bg:      '#000000',
  s1:      '#0f0f0f',   // surface card
  s2:      '#161616',   // surface lebih terang sedikit
  border:  '#272727',
  text:    '#ffffff',   // PUTIH — judul, angka, label penting
  sub:     '#a0a0a0',   // abu terang — terbaca di hitam
  dim:     '#606060',   // hint/version text
  red:     '#ff3b30',
};

const sans: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

/* ── Toggle ── */
const Toggle: React.FC<{ on: boolean; loading?: boolean; onClick: () => void }> = ({ on, loading, onClick }) => (
  <button onClick={onClick} disabled={loading} style={{
    position: 'relative', width: '54px', height: '32px', borderRadius: '16px',
    border: 'none', cursor: loading ? 'wait' : 'pointer', flexShrink: 0,
    background: on ? '#ffffff' : '#2e2e2e',
    transition: 'background 0.25s', opacity: loading ? 0.5 : 1,
  }}>
    <span style={{
      position: 'absolute', top: '5px', left: on ? '27px' : '5px',
      width: '22px', height: '22px', borderRadius: '50%',
      background: on ? '#000' : '#6a6a6a',
      transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
    }} />
  </button>
);

/* ── Section Label ── */
const SectionTitle: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ paddingBottom: '18px' }}>
    <span style={{
      ...sans, fontSize: '13px', color: C.sub,
      letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
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
      background: C.s1, border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ ...sans, fontSize: '16px', fontWeight: 600, color: C.text, marginBottom: '5px' }}>
        {title}
      </div>
      <div style={{ ...sans, fontSize: '13px', color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {subtitle}
      </div>
    </div>
    {right}
  </div>
);

/* ══════════ HALAMAN BANTUAN ══════════ */
const HelpPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const faqs = [
    {
      q: 'Bagaimana cara membaca artikel premium?',
      a: 'Upgrade ke paket berbayar untuk mengakses semua artikel tanpa batas. Klik tombol "Upgrade" di halaman profil.',
    },
    {
      q: 'Apa itu Filter Berita?',
      a: 'Filter Berita memungkinkan kamu memilih topik yang ingin ditampilkan di feed. Jika tidak ada topik dipilih, semua berita akan muncul.',
    },
    {
      q: 'Kategori "AI" menampilkan berita apa?',
      a: 'Kategori AI mencakup semua berita tentang Kecerdasan Buatan dan Artificial Intelligence, termasuk machine learning, ChatGPT, dan sejenisnya.',
    },
    {
      q: 'Bagaimana cara mengaktifkan notifikasi?',
      a: 'Pergi ke Profil → Pengaturan → aktifkan toggle "Breaking News". Pastikan browser kamu mengizinkan notifikasi dari situs ini.',
    },
    {
      q: 'Apakah newsletter dikirim setiap hari?',
      a: 'Ya, newsletter dikirim setiap hari ke email yang terdaftar. Kamu bisa menonaktifkannya kapan saja dari halaman Profil.',
    },
    {
      q: 'Bagaimana cara menghapus akun?',
      a: 'Untuk menghapus akun, hubungi tim support kami melalui email di support@teliernews.com.',
    },
  ];

  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, ...sans, color: C.text, paddingBottom: '80px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.faq-item{transition:background 0.15s}.faq-item:active{background:${C.s2}!important}`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '56px 20px 20px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <button onClick={onBack} style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: C.s1, border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="18" height="18" fill="none" stroke={C.text} viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
            Bantuan & FAQ
          </div>
          <div style={{ fontSize: '13px', color: C.sub, marginTop: '3px' }}>
            Pertanyaan yang sering ditanyakan
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', maxWidth: '480px', margin: '0 auto' }}>

        {/* Kontak */}
        <div style={{
          marginTop: '28px', marginBottom: '28px',
          padding: '20px', background: C.s1,
          borderRadius: '16px', border: `1px solid ${C.border}`,
          animation: 'fadeUp 0.4s ease both',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>
            Butuh bantuan lebih lanjut?
          </div>
          <div style={{ fontSize: '14px', color: C.sub, lineHeight: 1.6, marginBottom: '16px' }}>
            Tim kami siap membantu kamu 7 hari seminggu, pukul 08.00–22.00 WIB.
          </div>
          <a href="mailto:support@teliernews.com" style={{
            display: 'inline-block', padding: '11px 22px',
            background: C.text, color: '#000',
            borderRadius: '10px', fontSize: '14px', fontWeight: 700,
            textDecoration: 'none', letterSpacing: '0.01em',
          }}>
            Email Support
          </a>
        </div>

        {/* FAQ list */}
        <div style={{ fontSize: '13px', color: C.sub, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
          FAQ
        </div>

        <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
          {faqs.map((faq, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Divider />}
              <div
                className="faq-item"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{ padding: '18px 20px', cursor: 'pointer', background: C.s1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, lineHeight: 1.45, flex: 1 }}>
                    {faq.q}
                  </div>
                  <svg
                    width="18" height="18" fill="none" stroke={C.sub} viewBox="0 0 24 24" strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: '2px', transition: 'transform 0.2s', transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {openIdx === i && (
                  <div style={{ fontSize: '14px', color: C.sub, lineHeight: 1.65, marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                    {faq.a}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ ...mono, fontSize: '10px', color: C.dim, textAlign: 'center', padding: '32px 0 0', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          TelierNews v2.1.0 · Build 2026
        </div>
      </div>
    </div>
  );
};

/* ══════════ MAIN PROFILE ══════════ */
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
  const [showHelp,      setShowHelp]      = useState(false);
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
        const msg      = await getMessagingInstance();
        const savedTok = localStorage.getItem('tn_fcm_token');
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

  const toggleTopic = (value: string) => {
    const next = topics.includes(value) ? topics.filter(x => x !== value) : [...topics, value];
    setTopics(next);
    localStorage.setItem('tn_topics', JSON.stringify(next));
    window.dispatchEvent(new Event('topics-updated'));
  };

  const handleLogout = async () => {
    try { await signOut(auth); localStorage.removeItem('admin_secret_code'); navigate('/'); }
    catch (e) { console.error(e); }
  };

  /* Render halaman bantuan */
  if (showHelp) return <HelpPage onBack={() => { setShowHelp(false); window.scrollTo(0,0); }} />;

  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #222', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const initial     = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
  const allSelected = topics.length === 0;
  const topicLabels = TOPICS.filter(t => topics.includes(t.value)).map(t => t.label);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        .fade-up   { animation: fadeUp 0.38s ease both; }
        .tap-row:active  { opacity: 0.65; }
        .topic-btn { transition: all 0.15s ease !important; }
        .topic-btn:active { transform: scale(0.93) !important; }
        .upgrade-btn:active { opacity: 0.8; }
        .logout-btn:hover  { background: rgba(255,59,48,0.08) !important; border-color: ${C.red} !important; }
        .logout-btn:active { opacity: 0.75; }
        .back-btn:active   { opacity: 0.7; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, ...sans, paddingBottom: '100px', color: C.text }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          {/* ══ HERO ══ */}
          <div className="fade-up" style={{
            paddingTop: '72px', paddingBottom: '32px',
            paddingLeft: '24px', paddingRight: '24px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            {/* Avatar + nama */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '74px', height: '74px', borderRadius: '50%',
                  background: C.s1, border: `1.5px solid ${C.border}`,
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
                <div style={{ fontSize: '13px', color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              background: C.border, borderRadius: '16px', overflow: 'hidden', gap: '1px',
            }}>
              {[
                { n: String(readCount),     l: 'Dibaca'   },
                { n: String(bookmarkCount), l: 'Disimpan' },
                { n: '0',                   l: 'Komentar' },
              ].map((s, i) => (
                <div key={s.l} style={{
                  background: C.s1, padding: '20px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '7px' }}>
                    {s.n}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: C.sub, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
                padding: '18px', background: C.s1, borderRadius: '16px', border: `1px solid ${C.border}`,
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '5px' }}>Paket Gratis</div>
                  <div style={{ fontSize: '13px', color: C.sub }}>Upgrade untuk akses penuh & tanpa iklan</div>
                </div>
                <button
                  className="upgrade-btn"
                  onClick={() => navigate('/subscribe')}
                  style={{
                    padding: '11px 22px', background: C.text, color: '#000',
                    border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800,
                    cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s', ...sans,
                  }}>
                  Upgrade
                </button>
              </div>
            </div>

            {/* PENGATURAN */}
            <div className="fade-up" style={{ paddingTop: '28px', paddingBottom: '4px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.12s' }}>
              <SectionTitle label="Pengaturan" />

              <div className="tap-row" onClick={handleNotificationsToggle} style={{ cursor: 'pointer' }}>
                <RowItem
                  icon={<svg width="20" height="20" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                  title="Breaking News"
                  subtitle={notifLoading ? 'Memproses...' : notifications ? 'Aktif · Akan menerima notifikasi' : 'Nonaktif · Ketuk untuk aktifkan'}
                  right={<Toggle on={notifications} loading={notifLoading} onClick={handleNotificationsToggle} />}
                />
              </div>

              <Divider />

              <div className="tap-row" onClick={handleNewsletterToggle} style={{ cursor: 'pointer' }}>
                <RowItem
                  icon={<svg width="20" height="20" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  title="Newsletter Harian"
                  subtitle={newsletter ? 'Aktif · Ringkasan berita ke emailmu' : 'Nonaktif · Ringkasan berita setiap hari'}
                  right={<Toggle on={newsletter} onClick={handleNewsletterToggle} />}
                />
              </div>
            </div>

            {/* FILTER BERITA */}
            <div className="fade-up" style={{ paddingTop: '28px', paddingBottom: '28px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.18s' }}>
              <SectionTitle label="Filter Berita" />
              <p style={{ fontSize: '14px', color: C.sub, marginBottom: '20px', lineHeight: 1.65 }}>
                Pilih topik untuk filter feed. Kosongkan = tampilkan semua berita.
              </p>

              {/* Semua Kategori */}
              <button
                className="topic-btn"
                onClick={() => { setTopics([]); localStorage.setItem('tn_topics', '[]'); window.dispatchEvent(new Event('topics-updated')); }}
                style={{
                  padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', marginBottom: '14px',
                  border: `1.5px solid ${allSelected ? C.text : C.border}`,
                  background: allSelected ? C.text : 'transparent',
                  ...sans, fontSize: '13px', fontWeight: 700,
                  color: allSelected ? '#000' : C.sub,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >
                Semua Kategori
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {TOPICS.map(({ label, value }) => {
                  const active = topics.includes(value);
                  return (
                    <button key={value} className="topic-btn" onClick={() => toggleTopic(value)}
                      style={{
                        padding: '12px 22px', borderRadius: '100px', cursor: 'pointer',
                        border: `1.5px solid ${active ? C.text : C.border}`,
                        background: active ? C.text : 'transparent',
                        ...sans, fontSize: '13px', fontWeight: active ? 700 : 500,
                        color: active ? '#000' : C.sub,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {topics.length > 0 && (
                <div style={{ marginTop: '16px', padding: '14px 16px', background: C.s1, borderRadius: '12px', border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '13px', color: C.sub }}>
                    Menampilkan: <span style={{ color: C.text, fontWeight: 600 }}>{topicLabels.join(', ')}</span>
                  </span>
                </div>
              )}
            </div>

            {/* LAINNYA */}
            <div className="fade-up" style={{ paddingTop: '28px', paddingBottom: '4px', borderBottom: `1px solid ${C.border}`, animationDelay: '0.24s' }}>
              <SectionTitle label="Lainnya" />
              <div className="tap-row" onClick={() => setShowHelp(true)} style={{ cursor: 'pointer' }}>
                <RowItem
                  icon={<svg width="20" height="20" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="Bantuan & FAQ"
                  subtitle="Pusat bantuan TelierNews"
                  right={<svg width="16" height="16" fill="none" stroke={C.sub} viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
                />
              </div>
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
                  color: C.red,
                  fontWeight: 700, fontSize: '15px',
                  cursor: 'pointer', letterSpacing: '0.1em',
                  ...sans, transition: 'all 0.2s', textTransform: 'uppercase',
                }}
              >
                Logout
              </button>
            </div>

            <div style={{ ...mono, fontSize: '10px', color: C.dim, letterSpacing: '0.16em', textAlign: 'center', padding: '28px 0 0', textTransform: 'uppercase' }}>
              TelierNews v2.1.0 · Build 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
