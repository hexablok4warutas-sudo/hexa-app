/* HEXA Offline shell registration. Does not alter existing page logic. */
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async function () {
    try {
      const registration = await navigator.serviceWorker.register('/hexa-sw.js', {scope:'/'});
      console.info('[HEXA Offline] Service Worker registered:', registration.scope);
    } catch (error) {
      console.warn('[HEXA Offline] Registration failed:', error);
    }
  });
})();
