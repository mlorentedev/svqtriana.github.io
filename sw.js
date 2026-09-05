// SVQ Triana Service Worker - Efficient Caching Strategy
const CACHE_VERSION = 'v2.5';
// Stamped onto every local CSS/JS URL, in the HTML and in PRECACHE_URLS below.
// A query string is a fresh cache key for the Service Worker AND for Cloudflare
// (cache_level 'aggressive' keys on it), so bumping CACHE_VERSION is the single
// knob that invalidates a changed stylesheet everywhere. scripts/check_pages.py
// fails if the pages and this constant ever disagree.
const ASSET_VERSION = CACHE_VERSION.replace(/^v/, '');
const STATIC_CACHE = `svq-triana-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `svq-triana-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `svq-triana-images-${CACHE_VERSION}`;
const FONT_CACHE = `svq-triana-fonts-${CACHE_VERSION}`;

// Cache lifetimes (in milliseconds)
const CACHE_LIFETIMES = {
  STATIC: 30 * 24 * 60 * 60 * 1000,    // 30 days for CSS/JS
  FONTS: 365 * 24 * 60 * 60 * 1000,    // 1 year for fonts
  IMAGES: 7 * 24 * 60 * 60 * 1000,     // 7 days for images
  PAGES: 24 * 60 * 60 * 1000,          // 1 day for HTML pages
  EXTERNAL: 60 * 60 * 1000              // 1 hour for external resources
};

// Resources to precache for offline functionality
const PRECACHE_URLS = [
  '/',
  '/productos',
  '/media',
  '/encuentro',
  '/nosotros',
  `/css/fonts.css?v=${ASSET_VERSION}`,
  `/css/style.css?v=${ASSET_VERSION}`,
  `/css/bootstrap.css?v=${ASSET_VERSION}`,
  `/css/responsive.css?v=${ASSET_VERSION}`,
  `/js/performance.js?v=${ASSET_VERSION}`,
  '/fonts/GlacialIndifference-Regular.woff2',
  '/fonts/GlacialIndifference-Bold.woff2',
  '/images/webp/logo_192.webp',
  '/images/webp/menu.webp',
  '/images/webp/bg.webp',
  '/images/webp/fondorsp.webp'
];

// Utility functions
function isExpired(cachedResponse, maxAge) {
  if (!cachedResponse) return true;
  
  const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
  const now = new Date();
  return (now.getTime() - cachedDate.getTime()) > maxAge;
}

function addTimestampHeader(response) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('sw-cached-date', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

function getCacheNameForRequest(request) {
  const url = new URL(request.url);
  
  // Fonts - longest cache lifetime
  if (url.pathname.includes('/fonts/') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff')) {
    return { name: FONT_CACHE, lifetime: CACHE_LIFETIMES.FONTS };
  }
  
  // Images - medium cache lifetime
  if (url.pathname.includes('/images/') || /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(url.pathname)) {
    return { name: IMAGE_CACHE, lifetime: CACHE_LIFETIMES.IMAGES };
  }
  
  // Static assets - long cache lifetime
  if (/\.(css|js)$/i.test(url.pathname)) {
    return { name: STATIC_CACHE, lifetime: CACHE_LIFETIMES.STATIC };
  }
  
  // HTML pages - short cache lifetime
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
    return { name: DYNAMIC_CACHE, lifetime: CACHE_LIFETIMES.PAGES };
  }
  
  // External resources - very short cache lifetime
  if (url.origin !== self.location.origin) {
    return { name: DYNAMIC_CACHE, lifetime: CACHE_LIFETIMES.EXTERNAL };
  }
  
  // Default to dynamic cache
  return { name: DYNAMIC_CACHE, lifetime: CACHE_LIFETIMES.PAGES };
}

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil((async () => {
    try {
      // Precache into the cache each URL will be LOOKED UP in. Everything went
      // into STATIC_CACHE before, while handleRequest routes pages to DYNAMIC,
      // fonts to FONT and images to IMAGE - so 11 of these 17 entries were
      // written somewhere nothing ever reads, including all five pages. The
      // offline fallback therefore never had a page to serve.
      for (const url of PRECACHE_URLS) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const target = getCacheNameForRequest(new Request(url, { method: 'GET' }));
            const cache = await caches.open(target.name);
            await cache.put(url, addTimestampHeader(response));
            console.log(`[SW] Precached: ${url} -> ${target.name}`);
          }
        } catch (error) {
          console.warn(`[SW] Failed to precache ${url}:`, error);
        }
      }
      
      // Skip waiting to activate immediately
      await self.skipWaiting();
      console.log('[SW] Service worker installed');
    } catch (error) {
      console.error('[SW] Installation failed:', error);
    }
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE];
      
      // Delete old caches
      await Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
      
      // Take control of all clients
      await self.clients.claim();
      console.log('[SW] Service worker activated');
    } catch (error) {
      console.error('[SW] Activation failed:', error);
    }
  })());
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip chrome-extension and other protocol requests
  if (!url.protocol.startsWith('http')) return;
  
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const cacheInfo = getCacheNameForRequest(request);
  
  try {
    // Check cache first
    const cache = await caches.open(cacheInfo.name);
    const cachedResponse = await cache.match(request, { ignoreVary: true });
    
    // For fonts and long-lived assets, always serve from cache if available
    if (cachedResponse && (cacheInfo.name === FONT_CACHE || cacheInfo.name === STATIC_CACHE)) {
      if (!isExpired(cachedResponse, cacheInfo.lifetime)) {
        console.log(`[SW] Serving from cache: ${url.pathname}`);
        return cachedResponse;
      }
    }
    
    // For other resources, use cache-first with background update
    if (cachedResponse && !isExpired(cachedResponse, cacheInfo.lifetime)) {
      console.log(`[SW] Serving from cache: ${url.pathname}`);
      
      // Background update for HTML pages
      // Pages are extensionless now, so test the routing decision rather than
      // the suffix - endsWith('.html') stopped matching any real page URL.
      if (cacheInfo.name === DYNAMIC_CACHE) {
        updateCacheInBackground(request, cache);
      }
      
      return cachedResponse;
    }
    
    // Fetch from network
    console.log(`[SW] Fetching from network: ${url.pathname}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok) {
      // Cache the response
      const responseToCache = addTimestampHeader(networkResponse.clone());
      await cache.put(request, responseToCache);
      await trimCache(cache);
      console.log(`[SW] Cached: ${url.pathname}`);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn(`[SW] Network failed for ${url.pathname}:`, error);
    
    // Try to serve from cache as fallback
    const cache = await caches.open(cacheInfo.name);
    const cachedResponse = await cache.match(request, { ignoreVary: true });
    
    if (cachedResponse) {
      console.log(`[SW] Serving stale cache as fallback: ${url.pathname}`);
      return cachedResponse;
    }
    
    // For HTML pages, serve offline page
    if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Sin conexión - PS SVQ Triana</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #242424; color: #fff; }
            h1 { color: #df0606; }
            .retry { background: #df0606; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Sin conexión a internet</h1>
          <p>No se puede cargar la página en este momento.</p>
          <p>Comprueba tu conexión a internet e inténtalo de nuevo.</p>
          <button class="retry" onclick="location.reload()">Reintentar</button>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Background cache update for HTML pages
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const responseToCache = addTimestampHeader(networkResponse.clone());
      await cache.put(request, responseToCache);
      console.log(`[SW] Background updated: ${request.url}`);
    }
  } catch (error) {
    console.warn('[SW] Background update failed:', error);
  }
}

// There is no 'quotaexceeded' event on ServiceWorkerGlobalScope, so the old
// listener here never fired. Trim on the write path instead, where a quota
// failure actually surfaces.
const CACHE_ENTRY_LIMIT = 60;

async function trimCache(cache, limit = CACHE_ENTRY_LIMIT) {
  const requests = await cache.keys();
  if (requests.length <= limit) return;

  // Cache.keys() returns insertion order, so the head is the oldest.
  for (const request of requests.slice(0, requests.length - limit)) {
    await cache.delete(request);
  }
  console.log(`[SW] Trimmed cache to ${limit} entries`);
}

// Message handling for cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}