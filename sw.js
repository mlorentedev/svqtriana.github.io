const CACHE_NAME = 'svq-triana-fonts-v1';

const PRECACHE_URLS = [
  '/fonts/GlacialIndifference-Regular.woff2',
  '/fonts/GlacialIndifference-Bold.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of PRECACHE_URLS) {
      try { await cache.add(url); } catch (e) { console.error(`Error caching ${url}:`, e); }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isLocalFont = url.origin === self.location.origin && url.pathname.startsWith('/fonts/');

  if (!isLocalFont) return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;

    try {
      const resp = await fetch(event.request);
      if (resp && resp.ok) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      }
      return resp;
    } catch {
      return cached;
    }
  })());
});
