// public/sw.js — kill switch for the old site's service worker (<= v20260905).
// Keep it published for at least 6 months after the migration. Do not register
// it from any page.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('svq-triana-')).map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      // Reload so the page leaves the SW's control and fetches the new version.
      clients.forEach((client) => client.navigate(client.url));
    } catch (err) {
      console.warn('[sw-killswitch]', err);
    }
  })());
});
// Sin listener de 'fetch': las peticiones van directas a la red.
