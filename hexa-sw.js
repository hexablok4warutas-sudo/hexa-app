
/* HEXA Offline App Shell v6 — online network-first, offline cache fallback.
 * Only same-origin static files are cached; GAS/API requests are untouched.
 * Never clears IndexedDB or older caches. */
'use strict';

const CACHE_NAME = 'hexa-shell-v6-20261022';

const CORE = [
  '/main.html', '/daily-maintenance.html', '/start-inspection.html',
  '/draft-inspection.html', '/main.js', '/daily-maintenance.js',
  '/start-inspection.js', '/draft-inspection.js', '/hexa-offline-store.js',
  '/hexa-menu.js', '/hexa-header.js', '/hexa-offline-register.js'
];

const ASSETS = [
  '/banner-01.jpg', '/banner-02.jpg', '/daily-maintenance.css',
  '/draft-inspection.css', '/hexa-doodle.png', '/hexa-header.css',
  '/hexa-logo-header.png',
  '/hexa-icon-dailyactivity.svg', '/hexa-icon-dailyoutstanding.svg',
  '/hexa-icon-draftinspection.svg', '/hexa-icon-greasingantilineboring.svg',
  '/hexa-icon-startinspection-noline.png', '/hexa-icon-startinspection.svg',
  '/hexa-icon-svg-backlogmonitoring.svg', '/hexa-icon-svg-dailymaintenance.svg',
  '/hexa-icon-svg-fui.svg', '/hexa-icon-svg-games.svg',
  '/hexa-icon-svg-news.svg', '/hexa-icon-svg-rotable.svg',
  '/hexa-icon-svg-settings.svg', '/hexa-icon-unithistory.svg',
  '/hexa-kpi-fast-adapter.js', '/main.css', '/start-inspection.css'
];

const PAGES = new Map([
  ['/', '/main.html'],
  ['/main', '/main.html'],
  ['/main.html', '/main.html'],
  ['/daily-maintenance', '/daily-maintenance.html'],
  ['/daily-maintenance.html', '/daily-maintenance.html'],
  ['/start-inspection', '/start-inspection.html'],
  ['/start-inspection.html', '/start-inspection.html'],
  ['/draft-inspection', '/draft-inspection.html'],
  ['/draft-inspection.html', '/draft-inspection.html']
]);

const STATIC = new Set([...CORE, ...ASSETS]);

async function cleanResponse(response, expectedPath) {
  if (!response || !response.ok || response.type === 'opaque') return null;

  const finalURL = new URL(
    response.url || self.location.origin + expectedPath
  );

  if (finalURL.origin !== self.location.origin) return null;

  if (PAGES.has(expectedPath)) {
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return null;
  }

  const headers = new Headers(response.headers);
  headers.delete('location');

  return new Response(await response.blob(), {
    status: 200,
    statusText: 'OK',
    headers
  });
}

async function fetchStatic(path) {
  const response = await fetch(new Request(path, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  }));

  return cleanResponse(response, path);
}

async function populateCache() {
  const cache = await caches.open(CACHE_NAME);

  const results = await Promise.allSettled(
    CORE.map(async path => {
      const response = await fetchStatic(path);
      if (!response) throw new Error('Cannot cache core: ' + path);
      await cache.put(path, response);
    })
  );

  const failed = results
    .map((r, i) => r.status === 'rejected' ? CORE[i] : null)
    .filter(Boolean);

  if (failed.length) {
    throw new Error(
      'HEXA offline core incomplete: ' + failed.join(', ')
    );
  }

  await Promise.allSettled(
    ASSETS.map(async path => {
      try {
        const response = await fetchStatic(path);
        if (response) await cache.put(path, response);
      } catch (_) {}
    })
  );
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await populateCache();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    // Keep previous caches and IndexedDB.
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
      const cache = await caches.open(CACHE_NAME);

      try {
        const fresh = await fetchStatic(page);
        if (fresh) {
          await cache.put(page, fresh.clone());
          return fresh;
        }
      } catch (_) {}

      const cached = await cache.match(page);

      if (cached) {
        const safe = await cleanResponse(cached, page);
        if (safe) return safe;
      }

      const old = await caches.match(page);
      const repaired = old && await cleanResponse(old, page);

      return repaired || Response.error();
    })());

    return;
  }

  if (request.mode === 'navigate' || !STATIC.has(path)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const fresh = await fetchStatic(path);
      if (fresh) {
        await cache.put(path, fresh.clone());
        return fresh;
      }
    } catch (_) {}

    const cached = await cache.match(path);

    if (cached) {
      const safe = await cleanResponse(cached, path);
      if (safe) return safe;
    }

    const old = await caches.match(path);
    const repaired = old && await cleanResponse(old, path);

    return repaired || Response.error();
  })());
});
