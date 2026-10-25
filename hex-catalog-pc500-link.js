/* HEXCatalog — PC500LC-10R navigation patch.
   Capture phase overrides the old "catalog not available" alert,
   without changing other catalog cards or page styling. */
(function () {
  'use strict';
  document.addEventListener('click', function (event) {
    var card = event.target.closest && event.target.closest('.catalog-card[data-model]');
    if (!card) return;
    var model = (card.getAttribute('data-model') || '').trim().toUpperCase();
    if (model !== 'PC500' && model !== 'PC500LC-10R') return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.assign('pc500-catalog.html');
  }, true);
})();
