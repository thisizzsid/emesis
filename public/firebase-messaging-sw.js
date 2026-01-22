// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyCI2kwY-VdtU7cfSCCYyK8twNTAbH-14Ro",
  authDomain: "e2emesis.firebaseapp.com",
  databaseURL: "https://e2emesis-default-rtdb.firebaseio.com",
  projectId: "e2emesis",
  storageBucket: "e2emesis.firebasestorage.app",
  messagingSenderId: "1049443317810",
  appId: "1:1049443317810:web:41d40e39700344dd8fe42b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle messages when app is in background
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'EMESIS';
  const notificationOptions = {
    body: payload.notification?.body || 'New update',
    icon: '/logoemesis.png',
    badge: '/logoemesis.png',
    tag: payload.data?.type || 'notification',
    data: payload.data,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open/focus window
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const data = event.notification?.data || {};
        const isChat = data?.type === 'chat_message' && data?.chatId;
        const targetUrl = isChat ? `/chat/${data.chatId}` : '/feed';

        // Check if already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // Focus a client with same origin; navigate if needed
          if ('focus' in client) {
            try {
              // If the same path, just focus
              const samePath = new URL(client.url).pathname === targetUrl;
              if (samePath) return client.focus();
              // Else try navigate
              if ('navigate' in client) return client.navigate(targetUrl);
            } catch {}
          }
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
