// ─── Helper ─────────────────────────────────────────────────────
// 1. services/nama.js      ← API calls (fetch ke backend)
// 2. pages/NamaPage.js     ← HTML + logic
// 3. router/index.js       ← daftarkan route

// [ ] Buat src/services/nama.js dulu
// [ ] Copy template di atas, ganti nama
// [ ] Daftarkan di router/index.js
// [ ] Tambahkan menu di Sidebar.js kalau belum ada
// [ ] Test di browser

// src/pages/NamaPage.js
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchNama, createNama, updateNama, deleteNama } from "../services/nama.js";

let dtInstance = null;

async function loadTable(container) {
  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }

  try {
    const { items } = await fetchNama();

    container.querySelector("#table-wrapper").innerHTML = `
      <table id="main-table" class="table table-hover mb-0">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th class="text-center" style="width:120px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${item.name}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                  data-id="${item.id}"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-delete"
                  data-id="${item.id}" data-name="${item.name}">
                  <i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;

    if (items.length > 0) {
      dtInstance = new DataTable("#main-table", {
        searchable: true,
        perPageSelect: [10, 25, 50],
        columns: [{ select: 2, sortable: false }],
        labels: {
          placeholder: "Cari...",
          perPage: "{select} baris per halaman",
          noRows: "Tidak ada data",
          info: "Menampilkan {start}-{end} dari {rows} data",
        },
      });
    }
  } catch (e) {
    container.querySelector("#table-wrapper").innerHTML = `<p class="text-danger p-3">${e.message}</p>`;
  }
}

function initHandlers(container) {
  // Add
  container.querySelector("#btn-submit-add")?.addEventListener("click", async () => {
    const name = container.querySelector("#add_name").value.trim();
    if (!name) {
      Swal.fire({ title: "Nama wajib diisi!", icon: "warning" });
      return;
    }

    const { ok, data } = await createNama({ name });
    if (ok) {
      Swal.fire({ title: "Berhasil!", icon: "success", timer: 1500, showConfirmButton: false });
      bootstrap.Modal.getInstance(container.querySelector("#modal-add"))?.hide();
      container.querySelector("#add_name").value = "";
      loadTable(container);
    } else {
      Swal.fire({ title: "Gagal!", text: data?.message, icon: "error" });
    }
  });

  // Edit + Delete pakai event delegation
  container.querySelector("#table-wrapper").addEventListener("click", async (e) => {
    // Edit
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      // fetch data by id, isi modal, show
    }

    // Delete
    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      const { isConfirmed } = await Swal.fire({
        title: `Hapus "${deleteBtn.dataset.name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d4183d",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });
      if (!isConfirmed) return;

      const { ok, data } = await deleteNama(deleteBtn.dataset.id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", icon: "success", timer: 1500, showConfirmButton: false });
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message, icon: "error" });
      }
    }
  });
}

function NamaContent() {
  const el = document.createElement("div");
  el.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1>Nama Halaman</h1>
        <p>Deskripsi singkat</p>
      </div>
      <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add">
        <i class="bi bi-plus-lg me-1"></i>Tambah
      </button>
    </div>

    <div class="table-card mb-4">
      <div id="table-wrapper" class="p-3">
        <div class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm me-2"></div>Memuat...
        </div>
      </div>
    </div>

    <!-- Modal Tambah -->
    <div class="modal fade" id="modal-add" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nama <span class="text-danger">*</span></label>
              <input type="text" id="add_name" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button class="btn btn-primary" id="btn-submit-add">
              <i class="bi bi-floppy me-1"></i>Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    loadTable(el);
    initHandlers(el);
  }, 0);

  return el;
}

export function NamaPage() {
  return DashboardLayout(NamaContent);
}
