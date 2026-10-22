/* HEXA SERVICE WORKER V6.3 - DAILY ACTIVITY STAGE 1
 * Offline CSS / JS / icons / Global Header
 * Does not delete old caches or IndexedDB.
 */
const CACHE_NAME = 'hexa-shell-v6-3-da-stage1-20261022';

const CORE = [
  '/index.html', '/app.js', '/style.css',
  '/hexa-logo-login.png', '/hexa-logo-hrs.png',
  '/main.html', '/main.js', '/main.css',
  '/daily-maintenance.html', '/daily-maintenance.css',
  '/daily-maintenance.js', '/hexa-kpi-fast-adapter.js',
  '/daily-activity.html', '/daily-activity.css', '/daily-activity.js', '/hexa-doodle.png',
  '/start-inspection.html', '/start-inspection.js',
  '/draft-inspection.html', '/draft-inspection.js',
  '/hexa-offline-store.js', '/hexa-offline-register.js',
  '/hexa-header.css', '/hexa-header.js', '/hexa-menu.js',
  '/hexa-icon-startinspection.svg',
  '/hexa-icon-dailyoutstanding.svg',
  '/hexa-icon-unithistory.svg',
  '/hexa-icon-dailyactivity.svg',
  '/hexa-icon-greasingantilineboring.svg',
  '/hexa-icon-draftinspection.svg'
];

const PAGES = new Map([
  ['/', '/index.html'],
  ['/index', '/index.html'],
  ['/index.html', '/index.html'],
  ['/main', '/main.html'],
  ['/main.html', '/main.html'],
  ['/daily-maintenance', '/daily-maintenance.html'],
  ['/daily-maintenance.html', '/daily-maintenance.html'],
  ['/daily-activity', '/daily-activity.html'],
  ['/daily-activity.html', '/daily-activity.html'],
  ['/start-inspection', '/start-inspection.html'],
  ['/start-inspection.html', '/start-inspection.html'],
  ['/draft-inspection', '/draft-inspection.html'],
  ['/draft-inspection.html', '/draft-inspection.html']
]);

const STATIC_FILE = /\.(?:css|js|mjs|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$/i;

async function normalized(response) {
  if (!response || !response.ok || response.type === 'opaque') {
    throw new Error('HEXA: invalid response');
  }
  const headers = new Headers(response.headers);
  for (const key of ['content-length', 'content-encoding', 'transfer-encoding', 'location']) {
    headers.delete(key);
  }
  return new Response(await response.blob(), {
    status: 200, statusText: 'OK', headers
  });
}

async function fetchFresh(path) {
  const response = await fetch(new Request(new URL(path, self.location.origin), {
    method: 'GET', redirect: 'follow', cache: 'no-store'
  }));
  if (new URL(response.url).origin !== self.location.origin) {
    throw new Error('HEXA: unexpected cross-origin redirect');
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
    const cached = await fromCache(path);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(CORE.map(async path => {
      const fresh = await fetchFresh(path);
      await cache.put(path, fresh);
    }));
    const failed = CORE.filter((_, i) => results[i].status === 'rejected');
    if (failed.length) console.warn('HEXA offline preload incomplete:', failed);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  // Preserve older caches and IndexedDB, including unsynced inspections.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const page = PAGES.get(url.pathname);
  if (request.mode === 'navigate') {
    if (page) event.respondWith(serve(page));
    return;
  }

  // Cache same-origin static assets, including assets loaded by the Global Header.
  // Do not cache API calls, JSON endpoints, or other dynamic responses.
  if (STATIC_FILE.test(url.pathname)) {
    event.respondWith(serve(url.pathname));
  }
});
