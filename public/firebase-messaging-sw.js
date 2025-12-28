// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyCI2kwY-VdtU7cfSCCYyK8twNTAbH-14Ro",
  authDomain: "e2emesis.firebaseapp.com",
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
        // Check if already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow('/feed');
        }
      })
  );
});
