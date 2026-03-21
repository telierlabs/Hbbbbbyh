const fs = require('fs');

const content = `importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "${process.env.FB_API}",
  authDomain: "${process.env.FB_AUTH}",
  projectId: "${process.env.FB_PID}",
  storageBucket: "${process.env.FB_STOR}",
  messagingSenderId: "${process.env.FB_SID}",
  appId: "${process.env.FB_AID}",
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
    data: { url: articleId ? '/news/' + articleId : '/' },
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
        if ('focus' in client) { client.focus(); client.navigate(url); return; }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});`;

fs.writeFileSync('public/firebase-messaging-sw.js', content);
console.log('✅ firebase-messaging-sw.js generated');
