/* HEXA Schematic — navigasi landing page tahap awal */
(() => {
  'use strict';
  const detail = document.getElementById('schematic-model-detail');
  const close = document.getElementById('schematic-detail-close');
  document.querySelectorAll('.schematic-card').forEach(card => {
    card.addEventListener('click', () => {
      const model = card.dataset.model;
      if (model === 'CAT 395') {
        detail.hidden = false;
        detail.scrollIntoView({behavior:'smooth',block:'nearest'});
      } else {
        window.alert(`Schematic ${model} belum tersedia. Dokumen dan viewer akan ditambahkan pada tahap berikutnya.`);
      }
    });
  });
  close?.addEventListener('click', () => { detail.hidden = true; });
})();
