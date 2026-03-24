/* ===================================================
   Ai Iq Menjačnica — sw.js
   Service Worker for offline caching (PWA)
   =================================================== */

var CACHE_NAME = 'aiq-menja-v1';

var CACHE_URLS = [
  '/',
  '/index.html',
  '/trade.html',
  '/wallet.html',
  '/education.html',
  '/services.html',
  '/about.html',
  '/contact.html',
  '/css/styles.css',
  '/css/trading.css',
  '/css/animations.css',
  '/js/main.js',
  '/js/theme.js',
  '/js/chatbot.js',
  '/js/toast.js',
  '/js/cookie-consent.js',
  '/js/ticker.js',
  '/js/trading.js',
  '/js/trade.js',
  '/js/wallet.js',
  '/js/quiz.js',
  '/manifest.json',
  '/icon.svg'
];

/* INSTALL — cache all static assets */
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
});

/* ACTIVATE — remove old caches */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

/* FETCH — network first, fallback to cache */
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('/index.html');
      });
    })
  );
});
