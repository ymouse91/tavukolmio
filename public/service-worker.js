const CACHE_NAME = 'tavukolmio-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo-192.png',
  './logo-512.png'
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

