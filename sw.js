// Service Worker for PWA functionality - Enhanced Version
const CACHE_NAME = 'attendance-v2';  // ← עודכן מ-v1
const urlsToCache = [
  './index.html',
  './manifest.json',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install service worker and cache files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache addAll failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch from cache when offline
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // ✅ FIX: Skip chrome-extension and other unsupported schemes
  if (!requestUrl.protocol.startsWith('http')) {
    console.log('[SW] Skipping non-http request:', requestUrl.protocol);
    return;
  }
  
  // ✅ FIX: Skip Chrome DevTools requests
  if (requestUrl.origin === location.origin && requestUrl.pathname.startsWith('/_')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type === 'error') {
            console.log('[SW] Invalid response, not caching:', event.request.url);
            return response;
          }
          
          // ✅ FIX: Only cache http/https requests
          if (!event.request.url.startsWith('http')) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
                .catch((error) => {
                  console.warn('[SW] Failed to cache:', event.request.url, error);
                });
            });
          
          return response;
        }).catch((error) => {
          console.error('[SW] Fetch failed:', error);
          // Return offline page if available
          return caches.match('./index.html');
        });
      })
  );
});

// Activate service worker and remove old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
