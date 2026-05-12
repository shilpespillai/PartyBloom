// SELF-DESTRUCT SERVICE WORKER
// This script clears all caches and unregisters itself immediately.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      for (let name of names) caches.delete(name);
    }).then(() => {
      self.registration.unregister();
      self.clients.claim();
      console.log('SW Self-Destructed');
    })
  );
});

// Passive fetch (No caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
