const CACHE_NAME = 'zlip-v2';
const urlsToCache = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/games.css',
  './css/responsive.css',
  './css/fonts.css',
  './assets/fonts/plus-jakarta-sans-regular.woff2',
  './assets/fonts/plus-jakarta-sans-medium.woff2',
  './assets/fonts/plus-jakarta-sans-semibold.woff2',
  './assets/fonts/plus-jakarta-sans-bold.woff2',
  './assets/fonts/plus-jakarta-sans-extrabold.woff2',
  './assets/fonts/plus-jakarta-sans-black.woff2',
  './assets/fonts/jetbrains-mono-medium.woff2',
  './assets/fonts/jetbrains-mono-bold.woff2',
  './assets/fonts/jetbrains-mono-extrabold.woff2',
  './assets/images/coin-heads.webp',
  './assets/images/coin-tails.webp',
  './assets/images/logo.webp',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-192.png',
  './assets/icons/maskable-512.png',
  './js/core/main.js',
  './js/core/storage.js',
  './js/core/audio.js',
  './js/core/i18n.js',
  './js/ui/ui.js',
  './js/ui/team.js',
  './js/ui/donation.js',
  './js/games/spinner.js',
  './js/games/dice.js',
  './js/games/coin.js',
  './js/tools/timer.js',
  './js/games/class.js',
  './js/tools/number.js',
  './js/vendor/lucide.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Add files one by one to avoid total failure
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn(`[Service Worker] Failed to cache ${url}:`, error);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests and external requests
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Network-first for HTML, JS, and CSS to ensure updates are fetched
  if (['document', 'script', 'style'].includes(event.request.destination)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.destination === 'document') {
            return caches.match('./offline.html');
          }
        })
    );
    return;
  }

  // Cache-first for other assets (images, fonts, etc.)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
        return response;
      }).catch(() => {
        return new Response('', { status: 408, statusText: 'Request Timeout' });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
