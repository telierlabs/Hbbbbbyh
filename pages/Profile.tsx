// Profile.tsx - Dark Futuristic
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, getMessagingInstance } from '../services/firebase';
import { getToken, deleteToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const VAPID_KEY = import.meta.env.VAPID_KEY || '';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
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

  const handleNotificationsToggle = async () => {
    if (notifLoading) return;
    setNotifLoading(true);

    try {
      if (!notifications) {
        // AKTIFKAN
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          alert('Browser lo tidak support notifikasi.'); return;
        }

        // Kalau sudah granted sebelumnya, langsung ambil token tanpa minta permission lagi
        let permission = Notification.permission;
        if (permission !== 'granted') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
          alert('Izin notifikasi ditolak. Aktifkan manual di pengaturan browser.'); return;
        }

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Tunggu SW aktif
        await navigator.serviceWorker.ready;

        const messaging = await getMessagingInstance();
        if (!messaging) { alert('Messaging tidak didukung browser ini.'); return; }

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
        // MATIKAN
        const messaging = await getMessagingInstance();
        const savedToken = localStorage.getItem('tn_fcm_token');
        if (messaging && savedToken) {
          try {
            await deleteToken(messaging);
            await deleteDoc(doc(db, 'fcm_tokens', savedToken));
          } catch (e) { console.warn('Token delete error:', e); }
        }
        localStorage.removeItem('tn_notif_granted');
        localStorage.removeItem('tn_fcm_token');
        localStorage.setItem('tn_notif_dismissed', 'true');
        setNotifications(false);
      }
    } catch (err) {
      console.error('Notif toggle error:', err);
      alert('Terjadi kesalahan. Coba lagi.');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('admin_secret_code');
      navigate('/');
    } catch (error) { console.error('Logout error:', error); }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #333', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: "'Montserrat', sans-serif", padding: '0 16px 60px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 40 }}>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#111', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: '#fff', margin: 0 }}>{user.displayName || 'User'}</p>
            <p style={{ fontSize: 12, color: '#555', margin: '3px 0 0', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.05em' }}>{user.email}</p>
          </div>
        </div>

        <div style={{ height: 1, background: '#1a1a1a', marginBottom: 32 }} />

        {/* Notifikasi */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ flex: 1, marginRight: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>Notifikasi Breaking News</p>
            <p style={{ fontSize: 11, color: '#555', margin: '3px 0 0' }}>
              {notifLoading ? 'Memproses...' : notifications ? 'Aktif — kamu akan menerima notif berita penting' : 'Nonaktif — aktifkan untuk terima breaking news'}
            </p>
          </div>
          <button
            onClick={handleNotificationsToggle}
            disabled={notifLoading}
            style={{
              position: 'relative', width: 44, height: 24, borderRadius: 12, border: 'none',
              cursor: notifLoading ? 'wait' : 'pointer',
              background: notifications ? '#fff' : '#2a2a2a',
              transition: 'background 0.2s', flexShrink: 0,
              opacity: notifLoading ? 0.5 : 1,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: notifications ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%',
              background: notifications ? '#000' : '#555',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <div style={{ height: 1, background: '#1a1a1a', margin: '32px 0' }} />

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 12, color: '#ff4444', fontWeight: 700, fontSize: 14, cursor: 'pointer', letterSpacing: '0.05em', fontFamily: "'Share Tech Mono', monospace", transition: 'background 0.2s, border-color 0.2s' }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#1a0000'; (e.target as HTMLButtonElement).style.borderColor = '#ff4444'; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.borderColor = '#2a2a2a'; }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
};

export default Profile;
