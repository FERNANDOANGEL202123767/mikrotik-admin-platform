self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mikrotik-admin-cache').then((cache) => {
      const resources = [
        '/',
        '/index.html',
        '/favicon.ico',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/manifest.json',
      ];
      return cache.addAll(resources).catch((error) => {
        console.error('Service Worker: Failed to cache resources:', error);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/socket.io') ||
    url.pathname.includes('.hot-update.')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch((error) => {
        console.error('Service Worker: Fetch failed:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});