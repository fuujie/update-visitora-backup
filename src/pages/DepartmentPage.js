// src/pages/DepartmentPage.js
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.min.css";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchDepartments, fetchDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "../services/department.js";
import { fetchCompanies } from "../services/company.js";
import "../assets/css/datatable-department.css";

let dtInstance = null;
let addChoices = null;
let editChoices = null;

// ─── Load dropdown company dengan Choices.js ─────────────────────
async function initChoicesSelect(select) {
  const instance = new Choices(select, {
    searchEnabled: true,
    searchPlaceholderValue: "Cari perusahaan...",
    itemSelectText: "",
    placeholder: true,
    placeholderValue: "-- Pilih Perusahaan --",
    shouldSort: false,
    noResultsText: "Tidak ditemukan",
    noChoicesText: "Tidak ada pilihan",
  });

  try {
    const { companies = [] } = await fetchCompanies();
    instance.setChoices(
      companies.map((c) => ({ value: c.company_id, label: c.name })),
      "value",
      "label",
      false,
    );
  } catch (e) {
    console.error("Companies:", e);
  }

  return instance;
}

// ─── Render tabel ────────────────────────────────────────────────
async function loadTable(container) {
  const wrapper = container.querySelector("#department-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { departments = [] } = await fetchDepartments();

    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }

    wrapper.innerHTML = `
      <table id="department-table" class="table table-hover mb-0">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Departemen</th>
            <th>Perusahaan</th>
            <th class="text-center" style="width:120px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${
            departments.length === 0
              ? `<tr><td colspan="4" class="text-center py-4 text-muted">Belum ada data departemen</td></tr>`
              : departments
                  .map(
                    (d, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${d.name}</td>
                <td>${d.company_name || "-"}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                    data-id="${d.id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger btn-delete"
                    data-id="${d.id}" data-name="${d.name}" title="Hapus">
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

    if (departments.length > 0) {
      dtInstance = new DataTable("#department-table", {
        searchable: true,
        fixedHeight: false,
        perPageSelect: [10, 25, 50],
        labels: {
          placeholder: "Search...",
          perPage: " ",
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
  const table = container.querySelector("#department-table");
  if (!table) {
    Swal.fire({ title: "Tidak ada data untuk diekspor", icon: "warning" });
    return;
  }

  const rows = [...table.querySelectorAll("thead tr, tbody tr")];
  const csv = rows
    .map((row) => {
      const cells = [...row.querySelectorAll("th, td")].slice(0, -1);
      return cells.map((c) => `"${c.innerText.replace(/"/g, '""')}"`).join(",");
    })
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `departemen_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// ─── Add handler ─────────────────────────────────────────────────
function initAddHandler(container) {
  const btnAdd = container.querySelector("#btn-submit-add");
  const modal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-add-department"));

  btnAdd.addEventListener("click", async () => {
    const name = container.querySelector("#add_name").value.trim();
    const companyId = addChoices.getValue(true); // true = return raw value

    if (!name || !companyId) {
      Swal.fire({ title: "Nama dan perusahaan wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnAdd.innerHTML;
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await createDepartment({ name, company_id: companyId });
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Departemen berhasil ditambahkan.", icon: "success", timer: 1500, showConfirmButton: false });
        container.querySelector("#add_name").value = "";
        addChoices.removeActiveItems();
        modal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Departemen gagal ditambahkan.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    } finally {
      btnAdd.disabled = false;
      btnAdd.innerHTML = orig;
    }
  });
}

// ─── Edit handler ────────────────────────────────────────────────
function initEditHandler(container) {
  const btnSave = container.querySelector("#btn-submit-edit");
  const editModal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-edit-department"));

  container.querySelector("#department-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const { department } = await fetchDepartmentById(id);
      container.querySelector("#edit_id").value = department.id;
      container.querySelector("#edit_name").value = department.name;
      editChoices.setChoiceByValue(String(department.company_id));
      editModal.show();
    } catch (e) {
      Swal.fire({ title: "Gagal mengambil data!", text: e.message, icon: "error" });
    }
  });

  btnSave.addEventListener("click", async () => {
    const id = container.querySelector("#edit_id").value;
    const name = container.querySelector("#edit_name").value.trim();
    const companyId = editChoices.getValue(true);

    if (!name || !companyId) {
      Swal.fire({ title: "Nama dan perusahaan wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await updateDepartment(id, { name, company_id: companyId });
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Departemen berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        editModal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal memperbarui departemen.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = orig;
    }
  });
}

// ─── Delete handler ──────────────────────────────────────────────
function initDeleteHandler(container) {
  container.querySelector("#department-table-wrapper").addEventListener("click", async (e) => {
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
      const { ok, data } = await deleteDepartment(id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", text: "Departemen berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal menghapus departemen.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    }
  });
}

// ─── Content ─────────────────────────────────────────────────────
function DepartmentContent() {
  const page = document.createElement("div");

  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1>Departemen</h1>
        <p>Kelola data departemen dalam sistem</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" id="btn-export">
          <i class="bi bi-download me-1"></i>Export CSV
        </button>
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-department">
          <i class="bi bi-plus-lg me-1"></i>Tambah Departemen
        </button>
      </div>
    </div>

    <div class="table-card mb-4">
      <div id="department-table-wrapper" class="p-3"></div>
    </div>

    <!-- Modal Tambah -->
    <div class="modal fade" id="modal-add-department" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Departemen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nama Departemen <span class="text-danger">*</span></label>
              <input type="text" id="add_name" class="form-control" placeholder="Nama departemen" />
            </div>
            <div class="mb-3">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <select id="add_company" class="form-select">
                <option value="">-- Pilih Perusahaan --</option>
              </select>
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

    <!-- Modal Edit -->
    <div class="modal fade" id="modal-edit-department" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Departemen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="edit_id" />
            <div class="mb-3">
              <label class="form-label">Nama Departemen <span class="text-danger">*</span></label>
              <input type="text" id="edit_name" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <select id="edit_company" class="form-select">
                <option value="">-- Pilih Perusahaan --</option>
              </select>
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

  setTimeout(async () => {
    loadTable(page);
    addChoices = await initChoicesSelect(page.querySelector("#add_company"));
    editChoices = await initChoicesSelect(page.querySelector("#edit_company"));
    initAddHandler(page);
    initEditHandler(page);
    initDeleteHandler(page);
    page.querySelector("#btn-export").addEventListener("click", () => exportCSV(page));
  }, 0);

  return page;
}

// ─── Export ──────────────────────────────────────────────────────
export function DepartmentPage() {
  return DashboardLayout(DepartmentContent);
}
