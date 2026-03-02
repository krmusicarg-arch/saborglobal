const CACHE_NAME = 'sabor-ruiz-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Instalación: Cachear recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: Limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estrategia Stale-While-Revalidate para recursos estáticos
// Network-First para API calls si fuera necesario
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match('index.html');
      });
    })
  );
});