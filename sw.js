var dataCacheName = 'weatherData';
var cacheName = 'weatherPWA';
var filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/scripts/axios.js',
  '/scripts/jquery.js',
  '/scripts/anychart-base.min.js',
  '/scripts/main.js',
  '/styles/main.css',
  '/images/01d.png',
  '/images/01n.png',
  '/images/02d.png',
  '/images/02n.png',
  '/images/03d.png',
  '/images/03n.png',
  '/images/04d.png',
  '/images/04n.png',
  '/images/09d.png',
  '/images/09n.png',
  '/images/10d.png',
  '/images/10n.png',
  '/images/11d.png',
  '/images/11n.png',
  '/images/13d.png',
  '/images/13n.png',
  '/images/50d.png',
  '/images/50n.png',
  '/images/btnadd.svg',
  '/images/btnnotifications.svg',
  '/images/btnrefresh.svg',
  '/images/confirm.png',
  '/images/remove.png',
  '/images/weather144.png',
  '/images/weather152.png',
  '/favicon.ico'

];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching files');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = '/weather/';
  if (e.request.url.indexOf(dataUrl) > 0) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request);
      })
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
