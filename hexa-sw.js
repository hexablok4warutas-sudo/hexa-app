/* HEXA OFFLINE APP SHELL v1 — static navigation only. No API responses cached. */
const CACHE_NAME = 'hexa-shell-v1-20261020';
const CORE = ["/main.html", "/daily-maintenance.html", "/start-inspection.html", "/draft-inspection.html", "/main.js", "/daily-maintenance.js", "/start-inspection.js", "/draft-inspection.js", "/hexa-offline-store.js", "/hexa-menu.js", "/hexa-header.js", "/hexa-offline-register.js"];
const ASSETS = ["/banner-01.jpg", "/banner-02.jpg", "/daily-maintenance.css", "/daily-maintenance.html", "/daily-maintenance.js", "/draft-inspection.css", "/draft-inspection.html", "/draft-inspection.js", "/hexa-doodle.png", "/hexa-header.css", "/hexa-header.js", "/hexa-icon-dailyactivity.svg", "/hexa-icon-dailyoutstanding.svg", "/hexa-icon-draftinspection.svg", "/hexa-icon-greasingantilineboring.svg", "/hexa-icon-startinspection-noline.png", "/hexa-icon-startinspection.svg", "/hexa-icon-svg-backlogmonitoring.svg", "/hexa-icon-svg-dailymaintenance.svg", "/hexa-icon-svg-fui.svg", "/hexa-icon-svg-games.svg", "/hexa-icon-svg-news.svg", "/hexa-icon-svg-rotable.svg", "/hexa-icon-svg-settings.svg", "/hexa-icon-unithistory.svg", "/hexa-kpi-fast-adapter.js", "/hexa-menu.js", "/hexa-offline-register.js", "/hexa-offline-store.js", "/hexa-video-banner01.mp4", "/main.css", "/main.html", "/main.js", "/start-inspection.css", "/start-inspection.html", "/start-inspection.js"];
const PAGES = new Map([
  ['/main', '/main.html'], ['/main.html','/main.html'],
  ['/daily-maintenance','/daily-maintenance.html'], ['/daily-maintenance.html','/daily-maintenance.html'],
  ['/start-inspection','/start-inspection.html'], ['/start-inspection.html','/start-inspection.html'],
  ['/draft-inspection','/draft-inspection.html'], ['/draft-inspection.html','/draft-inspection.html']
]);
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  // Fail installation if any core file is unavailable, avoiding false offline-ready status.
  await cache.addAll(CORE);
  await Promise.allSettled(ASSETS.filter(a=>!CORE.includes(a)).map(a=>cache.add(a)));
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('hexa-shell-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return; // Never cache GAS or external APIs.
  const page=PAGES.get(url.pathname.replace(/\/$/,''));
  if(request.mode==='navigate' && page){
    event.respondWith((async()=>{
      try { const response=await fetch(request); if(response.ok)return response; }catch(_){}
      return (await caches.match(page)) || Response.error();
    })());return;
  }
  if(request.mode==='navigate')return; // No login or unknown-page caching.
  if(!ASSETS.includes(url.pathname))return;
  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok && response.type==='basic'){
      const cache=await caches.open(CACHE_NAME);await cache.put(request,response.clone());
    }
    return response;
  })());
});
