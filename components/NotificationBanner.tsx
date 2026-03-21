import React, { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, getMessagingInstance } from '../services/firebase';
import { useLocation } from 'react-router-dom';

const VAPID_KEY = import.meta.env.VAPID_KEY || '';

const NotificationBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Jangan tampilkan di halaman admin
    if (location.pathname.startsWith('/admin')) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;
    if (localStorage.getItem('tn_notif_dismissed')) return;

    const timer = setTimeout(() => setShow(true), 6000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setShow(false); return; }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const messaging = await getMessagingInstance();
      if (!messaging) { setShow(false); return; }

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
      }

      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        if (title && Notification.permission === 'granted') {
          new Notification(title, { body: body || '', icon: '/favicon.ico' });
        }
      });

      localStorage.setItem('tn_notif_granted', 'true');
      setShow(false);
    } catch (err) {
      console.error('Notif error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('tn_notif_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes tn-notif-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: '90px', left: '16px', right: '16px',
        zIndex: 150, maxWidth: '380px', margin: '0 auto',
        background: '#0d0d0d', border: '1px solid #222',
        borderRadius: '16px', padding: '16px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'tn-notif-up 0.3s ease',
        fontFamily: "'Montserrat', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#1a1a1a', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>
              Aktifkan Breaking News
            </p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0, lineHeight: 1.5 }}>
              Notif langsung saat ada berita penting
            </p>
          </div>
          <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleDismiss} style={{
            flex: 1, padding: '9px', borderRadius: '10px',
            background: 'transparent', border: '1px solid #222',
            color: '#555', fontSize: '12px', fontWeight: 500,
            fontFamily: "'Montserrat', sans-serif", cursor: 'pointer',
          }}>
            Nanti
          </button>
          <button onClick={handleAllow} disabled={loading} style={{
            flex: 2, padding: '9px', borderRadius: '10px',
            background: '#fff', border: 'none',
            color: '#000', fontSize: '12px', fontWeight: 700,
            fontFamily: "'Montserrat', sans-serif", cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Mengaktifkan...' : 'Aktifkan'}
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationBanner;
