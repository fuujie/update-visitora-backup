const dummyItemBawaanCategories = [
  { id: 1, name: "Dokumen" },
  { id: 2, name: "Tas" },
  { id: 3, name: "Sample Produk" },
  { id: 4, name: "Peralatan Kerja" },
  { id: 5, name: "Konsumsi" },
  { id: 6, name: "Lainnya" },
];

export async function fetchItemBring() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ items: dummyItemBawaanCategories });
    }, 150);
  });
}
