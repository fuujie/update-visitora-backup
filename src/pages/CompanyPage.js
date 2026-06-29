// src/pages/CompanyPage.js
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchCompanies, fetchCompanyById, createCompany, updateCompany, deleteCompany } from "../services/company.js";
import "../assets/css/company.css";

// ─── State ───────────────────────────────────────────────────────
let dtInstance = null;

// ─── Render tabel ────────────────────────────────────────────────
async function loadTable(container) {
  const wrapper = container.querySelector("#company-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { companies = [] } = await fetchCompanies();

    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }

    wrapper.innerHTML = `
      <table id="company-table" class="table table-hover mb-0">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Perusahaan</th>
            <th>Alamat</th>
            <th class="text-center" style="width:120px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${
            companies.length === 0
              ? `<tr><td colspan="4" class="text-center py-4 text-muted">Belum ada data perusahaan</td></tr>`
              : companies
                  .map(
                    (c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.name}</td>
                <td>${c.address || "-"}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                    data-id="${c.company_id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger btn-delete"
                    data-id="${c.company_id}" data-name="${c.name}" title="Hapus">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            `,
                  )
                  .join("")
          }
        </tbody>
      </table>
    `;

    if (companies.length > 0) {
      dtInstance = new DataTable("#company-table", {
        searchable: true,
        fixedHeight: false,
        perPageSelect: [10, 25, 50],
        labels: {
          placeholder: "Cari...",
          perPage: "{select} baris per halaman",
          noRows: "Tidak ada data",
          info: "Menampilkan {start}-{end} dari {rows} data",
        },
        columns: [{ select: 3, sortable: false }],
      });
    }
  } catch (e) {
    wrapper.innerHTML = `<div class="text-center py-4 text-danger">${e.message}</div>`;
  }
}

// ─── Export CSV ──────────────────────────────────────────────────
function exportCSV(container) {
  const table = container.querySelector("#company-table");
  if (!table) {
    Swal.fire({ title: "Tidak ada data untuk diekspor", icon: "warning" });
    return;
  }

  const rows = [...table.querySelectorAll("thead tr, tbody tr")];
  const csv = rows
    .map((row) => {
      const cells = [...row.querySelectorAll("th, td")].slice(0, -1); // skip kolom aksi
      return cells.map((c) => `"${c.innerText.replace(/"/g, '""')}"`).join(",");
    })
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `perusahaan_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// ─── Add company handler ─────────────────────────────────────────
function initAddHandler(container) {
  const form = container.querySelector("#add-company-form");
  const btnAdd = container.querySelector("#btn-submit-add");
  const modal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-add-company"));

  btnAdd.addEventListener("click", async () => {
    const name = container.querySelector("#add_name").value.trim();
    const address = container.querySelector("#add_address").value.trim();

    if (!name || !address) {
      Swal.fire({ title: "Nama dan alamat wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnAdd.innerHTML;
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await createCompany({ name, address });
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Perusahaan berhasil ditambahkan.", icon: "success", timer: 1500, showConfirmButton: false });
        form.reset();
        modal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Perusahaan gagal ditambahkan.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    } finally {
      btnAdd.disabled = false;
      btnAdd.innerHTML = orig;
    }
  });
}

// ─── Edit company handler ────────────────────────────────────────
function initEditHandler(container) {
  const btnSave = container.querySelector("#btn-submit-edit");
  const editModal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-edit-company"));

  // Delegasi klik ke tombol edit di tabel
  container.querySelector("#company-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const { company } = await fetchCompanyById(id);
      container.querySelector("#edit_id").value = company.company_id;
      container.querySelector("#edit_name").value = company.name;
      container.querySelector("#edit_address").value = company.address || "";
      editModal.show();
    } catch (e) {
      Swal.fire({ title: "Gagal mengambil data!", text: e.message, icon: "error" });
    }
  });

  btnSave.addEventListener("click", async () => {
    const id = container.querySelector("#edit_id").value;
    const name = container.querySelector("#edit_name").value.trim();
    const address = container.querySelector("#edit_address").value.trim();

    if (!name || !address) {
      Swal.fire({ title: "Nama dan alamat wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await updateCompany(id, { name, address });
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Perusahaan berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        editModal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal memperbarui perusahaan.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = orig;
    }
  });
}

// ─── Delete company handler ──────────────────────────────────────
function initDeleteHandler(container) {
  container.querySelector("#company-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;

    const id = btn.dataset.id;
    const name = btn.dataset.name;

    const confirm = await Swal.fire({
      title: `Hapus "${name}"?`,
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d4183d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const { ok, data } = await deleteCompany(id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", text: "Perusahaan berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal menghapus perusahaan.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    }
  });
}

// ─── Content ─────────────────────────────────────────────────────
function CompanyContent() {
  const page = document.createElement("div");

  page.innerHTML = `
    <!-- Page title -->
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1>Perusahaan</h1>
        <p>Kelola data perusahaan dalam sistem</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" id="btn-export">
          <i class="bi bi-download me-1"></i>Export CSV
        </button>
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-company">
          <i class="bi bi-plus-lg me-1"></i>Tambah Perusahaan
        </button>
      </div>
    </div>

    <!-- Tabel -->
    <div class="table-card mb-4">
      <div id="company-table-wrapper" class="p-3"></div>
    </div>

    <!-- Modal Tambah -->
    <div class="modal fade" id="modal-add-company" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Perusahaan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="add-company-form">
              <div class="mb-3">
                <label class="form-label">Nama Perusahaan <span class="text-danger">*</span></label>
                <input type="text" id="add_name" class="form-control" placeholder="Nama perusahaan" />
              </div>
              <div class="mb-3">
                <label class="form-label">Alamat <span class="text-danger">*</span></label>
                <textarea id="add_address" class="form-control" rows="3" placeholder="Alamat lengkap"></textarea>
              </div>
            </form>
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

    <!-- Modal Edit -->
    <div class="modal fade" id="modal-edit-company" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Perusahaan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="edit_id" />
            <div class="mb-3">
              <label class="form-label">Nama Perusahaan <span class="text-danger">*</span></label>
              <input type="text" id="edit_name" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Alamat <span class="text-danger">*</span></label>
              <textarea id="edit_address" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button class="btn btn-primary" id="btn-submit-edit">
              <i class="bi bi-floppy me-1"></i>Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    loadTable(page);
    initAddHandler(page);
    initEditHandler(page);
    initDeleteHandler(page);
    page.querySelector("#btn-export").addEventListener("click", () => exportCSV(page));
  }, 0);

  return page;
}

// ─── Export ──────────────────────────────────────────────────────
export function CompanyPage() {
  return DashboardLayout(CompanyContent);
}
