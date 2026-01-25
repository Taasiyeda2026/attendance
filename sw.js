const CACHE_NAME = 'taasiyeda-attendance-v3';

// רשימת נכסים לשמירה בזיכרון
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// התקנה - שמירת קבצים בזיכרון
self.addEventListener('install', (event) => {
  console.log('[Service Worker] מתקין...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] שומר קבצים בזיכרון');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] התקנה הושלמה');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] שגיאה בהתקנה:', error);
      })
  );
});

// הפעלה - ניקוי קאש ישן
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] מפעיל...');
  event.waitUntil(
    caches.keys()
      .then((names) => {
        return Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[Service Worker] מוחק קאש ישן:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] הפעלה הושלמה');
        return self.clients.claim();
      })
  );
});

// ניהול בקשות רשת
self.addEventListener('fetch', (event) => {
  // ניווט דפים - החזרה ל-index.html במקרה של ניתוק
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] מחזיר index.html (אופליין)');
          return caches.match('./index.html');
        })
    );
    return;
  }

  // התעלמות מבקשות POST (דיווח ל-Logic App)
  if (event.request.method === 'POST') {
    return;
  }

  // התעלמות מבקשות ל-Logic App (תמיד נסה אונליין)
  if (event.request.url.includes('logic.azure.com')) {
    return;
  }

  // אסטרטגיית Network First לקבצים דינמיים
  // אם יש אינטרנט - קח מהשרת, אחרת מהקאש
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // אם התקבלה תגובה תקינה, שמור בקאש
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // אם אין אינטרנט, נסה לקחת מהקאש
        return caches.match(event.request).then((cached) => {
          if (cached) {
            console.log('[Service Worker] מחזיר מהקאש:', event.request.url);
            return cached;
          }
          // אם גם בקאש אין, החזר תגובת שגיאה
          return new Response('אופליין - תוכן לא זמין', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain; charset=utf-8'
            })
          });
        });
      })
  );
});

// הודעת עדכון
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] מדלג על המתנה');
    self.skipWaiting();
  }
});

console.log('[Service Worker] קובץ נטען - גרסה:', CACHE_NAME);
