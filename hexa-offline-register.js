
/* HEXA Offline registration V6.
 * Checks for new SW without forced reload.
 * Does not clear Cache Storage, IndexedDB or offline inspections.
 */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  async function checkUpdate() {
    if (!navigator.onLine) return;

    try {
      const registration =
        await navigator.serviceWorker.getRegistration('/');

      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.warn(
        '[HEXA Offline] Update check failed:',
        error
      );
    }
  }

  window.addEventListener('load', async function () {
    try {
      const registration =
        await navigator.serviceWorker.register('/hexa-sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

      console.info(
        '[HEXA Offline] Registered:',
        registration.scope
      );

      await checkUpdate();

    } catch (error) {
      console.warn(
        '[HEXA Offline] Registration failed:',
        error
      );
    }
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      void checkUpdate();
    }
  });

  window.addEventListener('online', function () {
    void checkUpdate();
  });

})();
