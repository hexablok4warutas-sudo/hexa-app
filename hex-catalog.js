// HEXCatalog - Navigasi katalog unit
// Menghubungkan card CAT 395 ke halaman katalog yang sudah dibuat.
// Model lainnya tetap menampilkan pemberitahuan sampai katalognya tersedia.

const catalogPages = {
  'CAT 395': 'cat395-catalog.html'
};

document.querySelectorAll('.catalog-card').forEach((card) => {
  card.addEventListener('click', () => {
    const model = card.dataset.model;
    const destination = catalogPages[model];

    if (destination) {
      window.location.href = destination;
      return;
    }

    window.alert(`Katalog ${model} belum tersedia. Halaman katalog akan ditambahkan berikutnya.`);
  });
});
