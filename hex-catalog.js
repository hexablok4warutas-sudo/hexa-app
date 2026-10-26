// HEXCatalog - Navigasi katalog unit
// Menghubungkan kartu model ke katalog yang sudah tersedia.
// Model lain tetap menampilkan pemberitahuan.

const catalogPages = {
  'CAT 395': 'cat395-catalog.html',
  'D375A-6R': 'd375-catalog.html',
  'SANY SY500H': 'sany-sy500h-catalog.html',
  'PC1250-11': 'pc1250-11-catalog.html'
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
