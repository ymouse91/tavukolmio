const CACHE_NAME = 'tavukolmio-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png',
  '/favicon.ico',
  '/static/css/main.d8f800cf.css',
  '/static/css/main.d8f800cf.css.map',
  '/static/js/453.6336793f.chunk.js',
  '/static/js/453.6336793f.chunk.js.map',
  '/static/js/main.2a2c43d9.js',
  '/static/js/main.2a2c43d9.js.LICENSE.txt',
  '/static/js/main.2a2c43d9.js.map'
];

// Asennusvaihe – cachetetaan resurssit
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Aktivointivaihe – poistetaan vanhat cachet
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Haetaan tiedostot välimuistista tai verkosta
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) =>
      response || fetch(event.request)
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

