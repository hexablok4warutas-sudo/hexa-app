/* HEXA Service Worker V6.1 — 2026-10-22 */
const CACHE_NAME = 'hexa-shell-v6-1-20261022';

const CORE = [
  '/index.html', '/app.js', '/style.css',
  '/hexa-logo-login.png', '/hexa-logo-hrs.png',
  '/main.html', '/main.js', '/main.css',
  '/daily-maintenance.html',
  '/start-inspection.html', '/start-inspection.js',
  '/draft-inspection.html', '/draft-inspection.js',
  '/hexa-offline-store.js', '/hexa-offline-register.js',
  '/hexa-header.css', '/hexa-header.js', '/hexa-menu.js'
];

const PAGES = new Map([
  ['/', '/index.html'],
  ['/index', '/index.html'],
  ['/index.html', '/index.html'],
  ['/main', '/main.html'],
  ['/main.html', '/main.html'],
  ['/daily-maintenance', '/daily-maintenance.html'],
  ['/daily-maintenance.html', '/daily-maintenance.html'],
  ['/start-inspection', '/start-inspection.html'],
  ['/start-inspection.html', '/start-inspection.html'],
  ['/draft-inspection', '/draft-inspection.html'],
  ['/draft-inspection.html', '/draft-inspection.html']
]);

async function normalized(response) {
  if (!response || !response.ok || response.type === 'opaque') {
    throw new Error('HEXA: invalid network response');
  }
  const headers = new Headers(response.headers);
  for (const key of ['content-length', 'content-encoding', 'transfer-encoding', 'location']) {
    headers.delete(key);
  }
  return new Response(await response.blob(), { status: 200, statusText: 'OK', headers });
}

async function fetchFresh(path) {
  const response = await fetch(new Request(new URL(path, self.location.origin), {
    method: 'GET', redirect: 'follow', cache: 'no-store'
  }));
  if (new URL(response.url).origin !== self.location.origin) {
    throw new Error('HEXA: cross-origin redirect blocked');
  }
  return normalized(response);
}

async function fromCache(path) {
  const current = await caches.open(CACHE_NAME);
  return (await current.match(path)) || (await caches.match(path));
}

async function serve(path) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetchFresh(path);
    await cache.put(path, fresh.clone());
    return fresh;
  } catch (error) {
    const fallback = await fromCache(path);
    if (fallback) return fallback;
    throw error;
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE.map(async path => {
      const response = await fetchFresh(path);
      await cache.put(path, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  // Do not delete old caches or IndexedDB.
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const page = PAGES.get(path);

  if (request.mode === 'navigate') {
    if (page) event.respondWith(serve(page));
    return;
  }

  if (CORE.includes(path)) {
    event.respondWith(serve(path));
  }
});
