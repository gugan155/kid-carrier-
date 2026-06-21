const CACHE = 'kl-v1';
const STATIC = [
  '/',
  '/index.html',
  '/learn.html',
  '/play.html',
  '/quiz.html',
  '/explorer.html',
  '/drone-pilot.html',
  '/cyber-defender.html',
  '/space-explorer.html',
  '/robotics-engineer.html',
  '/game-designer.html',
  '/doctor.html',
  '/leaderboard.html',
  '/certificate.html',
  '/career-quiz.html',
  '/style.css',
  '/script.js',
  '/firebase.js',
  '/name-greeting.js',
  '/images/ani.png',
  '/images/topic.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin or CDN fonts/Firebase
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Firebase requests: always network-first (real-time data)
  if (url.hostname.includes('firestore') || url.hostname.includes('firebaseio')) return;

  // Everything else: cache-first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (e.request.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});
