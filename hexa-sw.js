/* HEXA Offline App Shell v2 — cache-first core pages, network fallback.
 * Only static same-origin assets are cached. Never cache Google Apps Script APIs.
 * Does not access or delete IndexedDB / inspection drafts.
 */
const CACHE_NAME = 'hexa-shell-v2-20261020';
const CORE = [
  '/main.html', '/daily-maintenance.html', '/start-inspection.html', '/draft-inspection.html',
  '/main.js', '/daily-maintenance.js', '/start-inspection.js', '/draft-inspection.js',
  '/main.css', '/daily-maintenance.css', '/start-inspection.css', '/draft-inspection.css',
  '/hexa-header.js', '/hexa-header.css', '/hexa-menu.js',
  '/hexa-offline-store.js', '/hexa-offline-register.js'
];
const OPTIONAL = [
  '/banner-01.jpg', '/banner-02.jpg', '/hexa-doodle.png',
  '/hexa-icon-dailyactivity.svg', '/hexa-icon-dailyoutstanding.svg',
  '/hexa-icon-draftinspection.svg', '/hexa-icon-greasingantilineboring.svg',
  '/hexa-icon-startinspection-noline.png', '/hexa-icon-startinspection.svg',
  '/hexa-icon-svg-backlogmonitoring.svg', '/hexa-icon-svg-dailymaintenance.svg',
  '/hexa-icon-svg-fui.svg', '/hexa-icon-svg-games.svg', '/hexa-icon-svg-news.svg',
  '/hexa-icon-svg-rotable.svg', '/hexa-icon-svg-settings.svg',
  '/hexa-icon-unithistory.svg', '/hexa-kpi-fast-adapter.js'
];
const STATIC = new Set([...CORE, ...OPTIONAL]);
const PAGES = new Map([
  ['/', '/main.html'], ['/main', '/main.html'], ['/main.html', '/main.html'],
  ['/daily-maintenance', '/daily-maintenance.html'],
  ['/daily-maintenance.html', '/daily-maintenance.html'],
  ['/start-inspection', '/start-inspection.html'],
  ['/start-inspection.html', '/start-inspection.html'],
  ['/draft-inspection', '/draft-inspection.html'],
  ['/draft-inspection.html', '/draft-inspection.html']
]);

async function fetchAndStore(path, cache) {
  const response = await fetch(new Request(path, { cache: 'reload' }));
  if (!response.ok || response.type !== 'basic') {
    throw new Error('HEXA asset unavailable: ' + path + ' (' + response.status + ')');
  }
  await cache.put(path, response.clone());
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // All critical resources must be available before this SW becomes active.
    await Promise.all(CORE.map(path => fetchAndStore(path, cache)));
    await Promise.allSettled(OPTIONAL.map(path => fetchAndStore(path, cache)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    // Remove only previous app-shell caches, never IndexedDB or unrelated caches.
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('hexa-shell-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname.replace(/\/$/, '') || '/';
  const page = PAGES.get(path);

  if (request.mode === 'navigate' && page) {
    event.respondWith((async () => {
      const cached = await caches.match(page, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(page, response.clone());
        }
        return response;
      } catch (_) {
        return new Response(
          '<!doctype html><html lang="id"><meta charset="utf-8"><title>HEXA Offline</title><body><h2>Halaman HEXA belum tersimpan</h2><p>Hubungkan internet dan buka HEXA sekali untuk menyiapkan cache offline.</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })());
    return;
  }
  if (request.mode === 'navigate') return;
  if (!STATIC.has(path)) return;

  event.respondWith((async () => {
    const cached = await caches.match(path, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(path, response.clone());
      }
      return response;
    } catch (_) {
      return Response.error();
    }
  })());
});
