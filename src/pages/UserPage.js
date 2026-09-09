// src/pages/UserPage.js
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.min.css";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchUsers, fetchUserById, createUser, updateUser, deleteUser } from "../services/user.js";
import { fetchCompanies } from "../services/company.js";
import "../assets/css/datatable-user.css";

let dtInstance = null;
let addChoices = null;
let editChoices = null;

const ROLE_LABEL = { admin: "Admin", security: "Security", visitor: "Visitor" };
const STATUS_LABEL = { active: "Aktif", inactive: "Nonaktif" };

// ─── Init Choices.js select company ──────────────────────────────
async function initChoicesSelect(select) {
  const instance = new Choices(select, {
    searchEnabled: true,
    searchPlaceholderValue: "Search Company...",
    itemSelectText: "",
    placeholder: true,
    placeholderValue: "Select Company",
    shouldSort: false,
    noResultsText: "Not found",
    noChoicesText: "No choices to choose from",
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
  const wrapper = container.querySelector("#user-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { users = [] } = await fetchUsers();

    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }

    wrapper.innerHTML = `
      <table id="user-table" class="table table-hover mb-0">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Perusahaan</th>
            <th class="text-center" style="width:120px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${
            users.length === 0
              ? `<tr><td colspan="7" class="text-center py-4 text-muted">Belum ada data pengguna</td></tr>`
              : users
                  .map(
                    (u, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="role-badge ${u.role}">${ROLE_LABEL[u.role] || u.role}</span></td>
                <td><span class="status-badge ${u.status || "active"}">${STATUS_LABEL[u.status] || "Aktif"}</span></td>
                <td>${u.company_name || "-"}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                    data-id="${u.id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger btn-delete"
                    data-id="${u.id}" data-name="${u.name}" title="Hapus">
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

    if (users.length > 0) {
      dtInstance = new DataTable("#user-table", {
        searchable: true,
        fixedHeight: false,
        perPageSelect: [10, 25, 50],
        labels: {
          placeholder: "Search...",
          perPage: "",
          noRows: "Not found",
          info: "Showing {start}-{end} from {rows} data",
        },
        columns: [{ select: 6, sortable: false }],
      });
    }
  } catch (e) {
    wrapper.innerHTML = `<div class="text-center py-4 text-danger">${e.message}</div>`;
  }
}

// ─── Export CSV ──────────────────────────────────────────────────
function exportCSV(container) {
  const table = container.querySelector("#user-table");
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
  link.download = `pengguna_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// ─── Add handler ─────────────────────────────────────────────────
function initAddHandler(container) {
  const btnAdd = container.querySelector("#btn-submit-add");
  const modal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-add-user"));

  btnAdd.addEventListener("click", async () => {
    const name = container.querySelector("#add_name").value.trim();
    const email = container.querySelector("#add_email").value.trim();
    const password = container.querySelector("#add_password").value;
    const role = container.querySelector("#add_role").value;
    const companyId = addChoices.getValue(true);

    if (!name || !email || !password || !role) {
      Swal.fire({ title: "Nama, email, password, dan role wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnAdd.innerHTML;
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await createUser({ name, email, password, role, company_id: companyId });
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Pengguna berhasil ditambahkan.", icon: "success", timer: 1500, showConfirmButton: false });
        container.querySelector("#add-user-form").reset();
        addChoices.removeActiveItems();
        modal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Pengguna gagal ditambahkan.", icon: "error" });
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
  const editModal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-edit-user"));

  container.querySelector("#user-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const { user } = await fetchUserById(id);
      container.querySelector("#edit_id").value = user.id;
      container.querySelector("#edit_name").value = user.name;
      container.querySelector("#edit_email").value = user.email;
      container.querySelector("#edit_password").value = "";
      container.querySelector("#edit_role").value = user.role;
      container.querySelector("#edit_status").value = user.status || "active";
      if (user.company_id) editChoices.setChoiceByValue(String(user.company_id));
      editModal.show();
    } catch (e) {
      Swal.fire({ title: "Gagal mengambil data!", text: e.message, icon: "error" });
    }
  });

  btnSave.addEventListener("click", async () => {
    const id = container.querySelector("#edit_id").value;
    const name = container.querySelector("#edit_name").value.trim();
    const email = container.querySelector("#edit_email").value.trim();
    const password = container.querySelector("#edit_password").value;
    const role = container.querySelector("#edit_role").value;
    const status = container.querySelector("#edit_status").value;
    const companyId = editChoices.getValue(true);

    if (!name || !email || !role) {
      Swal.fire({ title: "Nama, email, dan role wajib diisi!", icon: "warning" });
      return;
    }

    const payload = { name, email, role, status, company_id: companyId };
    if (password) payload.password = password; // hanya kirim kalau diisi

    const orig = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await updateUser(id, payload);
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Pengguna berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        editModal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal memperbarui pengguna.", icon: "error" });
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
  container.querySelector("#user-table-wrapper").addEventListener("click", async (e) => {
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
      const { ok, data } = await deleteUser(id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", text: "Pengguna berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal menghapus pengguna.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    }
  });
}

// ─── Toggle password visibility ──────────────────────────────────
function initPasswordToggle(container) {
  container.querySelectorAll(".toggle-pwd").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = container.querySelector(`#${btn.dataset.target}`);
      const icon = btn.querySelector("i");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      icon.className = show ? "bi bi-eye" : "bi bi-eye-slash";
    });
  });
}

// ─── Content ─────────────────────────────────────────────────────
function UserContent() {
  const page = document.createElement("div");

  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1 class="text-primary">Pengguna</h1>
        <p>Kelola akun pengguna sistem</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" id="btn-export">
          <i class="bi bi-download me-1"></i>Export CSV
        </button>
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-user">
          <i class="bi bi-plus-lg me-1"></i>Tambah Pengguna
        </button>
      </div>
    </div>

    <div class="table-card mb-4">
      <div id="user-table-wrapper" class="p-3"></div>
    </div>

    <!-- Modal Tambah -->
    <div class="modal fade" id="modal-add-user" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Pengguna</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="add-user-form">
              <div class="mb-3">
                <label class="form-label">Nama <span class="text-danger">*</span></label>
                <input type="text" id="add_name" class="form-control" placeholder="Nama lengkap" />
              </div>
              <div class="mb-3">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input type="email" id="add_email" class="form-control" placeholder="Email" />
              </div>
              <div class="mb-3">
                <label class="form-label">Password <span class="text-danger">*</span></label>
                <div style="position:relative">
                  <input type="password" id="add_password" class="form-control" placeholder="Password" />
                  <button type="button" class="toggle-pwd" data-target="add_password"
                    style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--muted-foreground)">
                    <i class="bi bi-eye-slash"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Role <span class="text-danger">*</span></label>
                <select id="add_role" class="form-select">
                  <option value="visitor">Visitor</option>
                  <option value="security">Security</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Perusahaan</label>
                <select id="add_company"></select>
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
    <div class="modal fade" id="modal-edit-user" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Pengguna</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="edit_id" />
            <div class="mb-3">
              <label class="form-label">Nama <span class="text-danger">*</span></label>
              <input type="text" id="edit_name" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Email <span class="text-danger">*</span></label>
              <input type="email" id="edit_email" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Password Baru</label>
              <div style="position:relative">
                <input type="password" id="edit_password" class="form-control" placeholder="Kosongkan jika tidak ingin mengubah" />
                <button type="button" class="toggle-pwd" data-target="edit_password"
                  style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:none;color:var(--muted-foreground)">
                  <i class="bi bi-eye-slash"></i>
                </button>
              </div>
              <div class="form-text">Kosongkan jika tidak ingin mengubah password</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Role <span class="text-danger">*</span></label>
              <select id="edit_role" class="form-select">
                <option value="visitor">Visitor</option>
                <option value="security">Security</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Status <span class="text-danger">*</span></label>
              <select id="edit_status" class="form-select">
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <div class="form-text">User nonaktif tidak bisa dipilih saat membuat appointment.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Perusahaan</label>
              <select id="edit_company"></select>
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
    initPasswordToggle(page);
    page.querySelector("#btn-export").addEventListener("click", () => exportCSV(page));
  }, 0);

  return page;
}

// ─── Export ──────────────────────────────────────────────────────
export function UserPage() {
  return DashboardLayout(UserContent);
}
