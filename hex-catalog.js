// HEXCatalog — tahap awal: unit selection. No catalog pages are connected yet.
document.querySelectorAll('.catalog-card').forEach((card) => {
  card.addEventListener('click', () => {
    const model = card.dataset.model;
    window.alert(`Katalog ${model} sedang disiapkan. Halaman assembly akan ditambahkan berikutnya.`);
  });
});
