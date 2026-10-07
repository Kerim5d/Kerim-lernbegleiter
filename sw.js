/* sw.js — einfacher Service Worker für Offline-Grundfunktion (App-Shell) */
const CACHE_NAME = 'kerim-lernbegleiter-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/db.js',
  './js/matrix-intro.js',
  './js/gemini.js',
  './js/einstellungen.js',
  './js/sprachen.js',
  './js/equalizer.js',
  './js/mikrofon-equalizer.js',
  './js/wetter.js',
  './js/druck.js',
  './js/stundenplan.js',
  './js/ocr.js',
  './js/arbeitsblaetter.js',
  './js/sprache.js',
  './js/diktat.js',
  './js/abfrage.js',
  './js/zeit.js',
  './js/stats.js',
  './js/dashboard.js',
  './js/kalender.js',
  './js/noten.js',
  './js/themenlog.js',
  './js/probentrainer.js',
  './js/freund.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
