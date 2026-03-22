// Profile.tsx - Dark Futuristic Redesign
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, getMessagingInstance } from '../services/firebase';
import { getToken, deleteToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const VAPID_KEY = import.meta.env.VAPID_KEY || '';
const ALL_TOPICS = ['Tech', 'Geopolitics', 'Economy', 'Science', 'Space', 'Cyber', 'Defense', 'AI'];
const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

const Toggle: React.FC<{ on: boolean; loading?: boolean; onClick: () => void }> = ({ on, loading, onClick }) => (
  <button onClick={onClick} disabled={loading}
    style={{ position: 'relative', width: '42px', height: '24px', borderRadius: '12px', border: 'none', cursor: loading ? 'wait' : 'pointer', flexShrink: 0, background: on ? '#fff' : '#1e1e1e', transition: 'background 0.2s', opacity: loading ? 0.5 : 1 }}>
    <span style={{ position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: on ? '#000' : '#555', transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)' }} />
  </button>
);

const SecHead: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
    <span style={{ ...mono, fontSize: '12px', color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: 600 }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
  </div>
);

const Item: React.FC<{ icon: React.ReactNode; title: string; sub: string; right?: React.ReactNode }> = ({ icon, title, sub, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#080808', border: '1px solid #141414', borderRadius: '14px', marginBottom: '8px' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0f0f0f', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#888' }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ ...m, fontSize: '14px', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '3px' }}>{title}</span>
      <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.05em' }}>{sub}</span>
    </div>
    {right && <div style={{ flexShrink: 0 }}>{right}</div>}
  </div>
);

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(() => localStorage.getItem('tn_newsletter') === 'true');
  const [topics, setTopics] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tn_topics') || '["Tech","Geopolitics","Space"]'); }
    catch { return ['Tech', 'Geopolitics', 'Space']; }
  });
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) { navigate('/login'); }
      else {
        setUser(currentUser);
        const granted = Notification.permission === 'granted' && localStorage.getItem('tn_notif_granted') === 'true';
        setNotifications(granted);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const bookmarkCount = (() => { try { return JSON.parse(localStorage.getItem('tn_bookmarks') || '[]').length; } catch { return 0; } })();

  const handleNotificationsToggle = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      if (!notifications) {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) { alert('Browser tidak support notifikasi.'); return; }
        let permission = Notification.permission;
        if (permission !== 'granted') permission = await Notification.requestPermission();
        if (permission !== 'granted') { alert('Izin notifikasi ditolak. Aktifkan manual di pengaturan browser.'); return; }
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
          try { await deleteToken(messaging); await deleteDoc(doc(db, 'fcm_tokens', savedToken)); } catch (e) { console.warn('Token delete error:', e); }
        }
        localStorage.removeItem('tn_notif_granted');
        localStorage.removeItem('tn_fcm_token');
        localStorage.setItem('tn_notif_dismissed', 'true');
        setNotifications(false);
      }
    } catch (err) { console.error('Notif toggle error:', err); alert('Terjadi kesalahan. Coba lagi.'); }
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
  };

  const handleLogout = async () => {
    try { await signOut(auth); localStorage.removeItem('admin_secret_code'); navigate('/'); }
    catch (error) { console.error('Logout error:', error); }
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid #333', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const chevron = <svg width="14" height="14" fill="none" stroke="#444" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;-webkit-font-smoothing:antialiased;}`}</style>

      <div style={{ minHeight: '100vh', background: '#000', ...m, paddingBottom: '80px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '72px 20px 0' }}>

          {/* HERO */}
          <div style={{ padding: '28px 0 24px', display: 'flex', alignItems: 'center', gap: '18px', borderBottom: '1px solid #111' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#0d0d0d', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid #1e1e1e', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '3px', right: '3px', width: '11px', height: '11px', borderRadius: '50%', background: '#fff', border: '2px solid #000' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.01em' }}>{user.displayName || 'User'}</div>
              <div style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.08em', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #2a2a2a', background: '#0a0a0a', ...mono, fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#555' }} />
                PEMBACA GRATIS
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', padding: '20px 0', borderBottom: '1px solid #111' }}>
            {[{ n: '0', l: 'Dibaca' }, { n: String(bookmarkCount), l: 'Disimpan' }, { n: '0', l: 'Komentar' }].map(s => (
              <div key={s.l} style={{ background: '#080808', border: '1px solid #141414', borderRadius: '14px', padding: '14px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', display: 'block', marginBottom: '4px' }}>{s.n}</span>
                <span style={{ ...mono, fontSize: '11px', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.l}</span>
              </div>
            ))}
          </div>

          {/* MEMBERSHIP */}
          <div style={{ paddingTop: '20px' }}>
            <SecHead label="Membership" />
            <div style={{ background: '#090909', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#888' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '3px' }}>Paket Gratis</span>
                <span style={{ ...mono, fontSize: '11px', color: '#aaa' }}>Upgrade untuk akses penuh & tanpa iklan</span>
              </div>
              <button onClick={() => navigate('/subscribe')}
                style={{ padding: '8px 16px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, ...m, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e0e0e0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                Upgrade
              </button>
            </div>
          </div>

          {/* PENGATURAN */}
          <div style={{ paddingTop: '20px' }}>
            <SecHead label="Pengaturan" />
            <Item
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>}
              title="Breaking News"
              sub={notifLoading ? 'Memproses...' : notifications ? 'AKTIF · Kamu akan menerima notifikasi' : 'NONAKTIF · Aktifkan untuk terima notifikasi'}
              right={<Toggle on={notifications} loading={notifLoading} onClick={handleNotificationsToggle} />}
            />
            <Item
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
              title="Newsletter Harian"
              sub={newsletter ? 'AKTIF · Ringkasan berita tiap hari ke emailmu' : 'NONAKTIF · Ringkasan berita setiap hari ke email'}
              right={<Toggle on={newsletter} onClick={handleNewsletterToggle} />}
            />
          </div>

          {/* TOPIK FAVORIT */}
          <div style={{ paddingTop: '20px' }}>
            <SecHead label="Topik Favorit" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {ALL_TOPICS.map(t => (
                <button key={t} onClick={() => toggleTopic(t)}
                  style={{ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', border: `1px solid ${topics.includes(t) ? '#fff' : '#2a2a2a'}`, background: topics.includes(t) ? '#fff' : 'transparent', ...mono, fontSize: '11px', color: topics.includes(t) ? '#000' : '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
            <p style={{ ...mono, fontSize: '10px', color: '#444', letterSpacing: '0.1em', marginTop: '6px' }}>Pilih topik yang ingin tampil lebih banyak di feed</p>
          </div>

          {/* TERAKHIR DIBACA */}
          <div style={{ paddingTop: '20px' }}>
            <SecHead label="Terakhir Dibaca" />
            <div style={{ ...mono, fontSize: '11px', color: '#444', letterSpacing: '0.1em', textAlign: 'center', padding: '20px 0' }}>
              Belum ada riwayat baca
            </div>
          </div>

          {/* LAINNYA */}
          <div style={{ paddingTop: '20px' }}>
            <SecHead label="Lainnya" />
            <Item
              icon={<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              title="Bantuan & FAQ"
              sub="Pusat bantuan TelierNews"
              right={chevron}
            />
          </div>

          {/* LOGOUT */}
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '12px', color: '#aaa', fontWeight: 700, fontSize: '12px', cursor: 'pointer', letterSpacing: '0.1em', ...mono, transition: 'all 0.2s', marginTop: '8px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff3333'; e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.background = '#0d0000'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'transparent'; }}>
            LOGOUT
          </button>

          <div style={{ ...mono, fontSize: '9px', color: '#333', letterSpacing: '0.2em', textAlign: 'center', padding: '24px 0 0' }}>
            TELIERNEWS v2.1.0 · BUILD 2026
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;
