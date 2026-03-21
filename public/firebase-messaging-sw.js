// ⚠️ PENTING: Ganti nilai di bawah dengan nilai asli dari Vercel env lo
// Buka Vercel → Settings → Environment Variables → klik mata untuk lihat nilai

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "GANTI_NILAI_FB_API",
  authDomain: "GANTI_NILAI_FB_AUTH",
  projectId: "GANTI_NILAI_FB_PID",
  storageBucket: "GANTI_NILAI_FB_STOR",
  messagingSenderId: "GANTI_NILAI_FB_SID",
  appId: "GANTI_NILAI_FB_AID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const { articleId } = payload.data || {};

  self.registration.showNotification(title || 'TelierNews', {
    body: body || 'Ada berita baru',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: articleId || 'tn-notif',
    data: { url: articleId ? `/news/${articleId}` : '/' },
    actions: [
      { action: 'read', title: 'Baca' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
