/* HEXCatalog PC1250-8R card route. Other cards are untouched. */
(function () {
  'use strict';
  document.addEventListener('click', function (event) {
    const card = event.target.closest && event.target.closest('.catalog-card[data-model]');
    if (!card || !/^PC1250-8R?$/i.test((card.dataset.model || '').trim())) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.assign('pc1250-8-catalog.html');
  }, true);
})();
