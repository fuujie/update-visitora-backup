// src/pages/HostPage.js
import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.min.css";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchHosts, fetchHostById, fetchDepartmentsByCompany, createHost, updateHost, deleteHost } from "../services/host.js";
import { fetchCompanies } from "../services/company.js";
import "../assets/css/datatable-host.css";
import "../assets/css/styles.css";

let dtInstance = null;
let addCompanyChoices = null;
let addDeptChoices = null;
let editCompanyChoices = null;
let editDeptChoices = null;

const STATUS_LABEL = { active: "Aktif", inactive: "Nonaktif" };

// ─── Init Choices.js untuk company (static list) ─────────────────
async function initCompanyChoices(select) {
  const instance = new Choices(select, {
    searchEnabled: true,
    searchPlaceholderValue: "Search Company...",
    itemSelectText: "",
    placeholder: true,
    placeholderValue: "Select Company",
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

// ─── Init Choices.js untuk department (kosong dulu, cascading) ──
function initDeptChoices(select) {
  return new Choices(select, {
    searchEnabled: true,
    searchPlaceholderValue: "Search Department...",
    itemSelectText: "",
    placeholder: true,
    placeholderValue: "Select Company",
    shouldSort: false,
    noResultsText: "Not found",
    noChoicesText: "Select company first",
  });
}

// ─── Cascading: load department saat company berubah ────────────
async function loadDeptByCompany(deptChoicesInstance, companyId) {
  deptChoicesInstance.clearChoices();
  deptChoicesInstance.setChoices([{ value: "", label: "Loading...", disabled: true }], "value", "label", true);

  try {
    const { departments = [] } = await fetchDepartmentsByCompany(companyId);
    deptChoicesInstance.clearChoices();

    if (departments.length === 0) {
      deptChoicesInstance.setChoices([{ value: "", label: "Department data empty", disabled: true }], "value", "label", true);
      return;
    }

    deptChoicesInstance.setChoices(
      departments.map((d) => ({ value: d.id, label: d.name })),
      "value",
      "label",
      true,
    );
  } catch (e) {
    console.error("Departments:", e);
  }
}

// ─── Render tabel ────────────────────────────────────────────────
async function loadTable(container) {
  const wrapper = container.querySelector("#host-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { hosts = [] } = await fetchHosts();

    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }

    wrapper.innerHTML = `
      <table id="host-table" class="table table-hover mb-0">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>NIK</th>
            <th>Status</th>
            <th>Perusahaan</th>
            <th>Departemen</th>
            <th class="text-center" style="width:120px">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${
            hosts.length === 0
              ? `<tr><td colspan="7" class="text-center py-4 text-muted">Host data empty</td></tr>`
              : hosts
                  .map(
                    (h, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${h.name}</td>
                <td>${h.nik || "-"}</td>
                <td><span class="status-badge ${h.status || "active"}">${STATUS_LABEL[h.status] ? STATUS_LABEL[h.status] : "Status not found"}</span></td>
                <td>${h.company_name || "-"}</td>
                <td>${h.department_name || "-"}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                    data-id="${h.host_id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger btn-delete"
                    data-id="${h.host_id}" data-name="${h.name}" title="Hapus">
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

    if (hosts.length > 0) {
      dtInstance = new DataTable("#host-table", {
        searchable: true,
        fixedHeight: false,
        perPageSelect: [10, 25, 50],
        labels: {
          placeholder: "Search...",
          perPage: " ",
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
  const table = container.querySelector("#host-table");
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
  link.download = `host_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// ─── Add handler ─────────────────────────────────────────────────
function initAddHandler(container) {
  const btnAdd = container.querySelector("#btn-submit-add");
  const modal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-add-host"));

  btnAdd.addEventListener("click", async () => {
    const name = container.querySelector("#add_name").value.trim();
    const employeeId = container.querySelector("#add_employee_id").value.trim();
    const phone = container.querySelector("#add_phone").value.trim();
    const companyId = addCompanyChoices.getValue(true);
    const departmentId = addDeptChoices.getValue(true);
    // const status = container.querySelector("#add_status").value;

    if (!name || !companyId || !departmentId) {
      Swal.fire({ title: "Nama, perusahaan, dan departemen wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnAdd.innerHTML;
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await createHost({
        name,
        nik: employeeId,
        no_telp: phone,
        company_id: companyId,
        department_id: departmentId,
      });
      console.log("Create Host:", ok, data);
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Host berhasil ditambahkan.", icon: "success", timer: 1500, showConfirmButton: false });
        container.querySelector("#add-host-form").reset();
        addCompanyChoices.removeActiveItems();
        addDeptChoices.clearChoices();
        addDeptChoices.setChoices([{ value: "", label: "-- Pilih Perusahaan dulu --", disabled: true }], "value", "label", true);
        modal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Host gagal ditambahkan.", icon: "error" });
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
  const editModalElement = container.querySelector("#modal-edit-host");
  const editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);
  const selectStatus = container.querySelector("#edit_status");

  const editModalBody = editModalElement.querySelector(".modal-edit-body");

  let originalData = {};

  const listStatus = [
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Tidak Aktif" },
  ];
  if (selectStatus) {
    selectStatus.innerHTML = listStatus.map((s) => `<option value="${s.value}">${s.label}</option>`).join("");
  }

  function checkFormChanges() {
    const currentData = {
      name: container.querySelector("#edit_name").value.trim(),
      nik: container.querySelector("#edit_employee_id").value.trim(),
      no_telp: container.querySelector("#edit_phone").value.trim(),
      status: selectStatus ? selectStatus.value : "active",
      company_id: String(editCompanyChoices.getValue(true)),
      department_id: String(editDeptChoices.getValue(true)),
    };

    const isChanged = Object.keys(originalData).some((key) => originalData[key] !== currentData[key]);

    btnSave.disabled = !isChanged;
  }

  container.querySelector("#host-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const { host } = await fetchHostById(id);
      console.log("Edit Host:", host);

      selectStatus.innerHTML = listStatus.map((s) => `<option value="${s.value}">${s.label}</option>`).join("");

      container.querySelector("#edit_id").value = host.host_id;
      container.querySelector("#edit_name").value = host.name;
      container.querySelector("#edit_employee_id").value = host.nik || "";
      container.querySelector("#edit_phone").value = host.no_telp || "";

      if (selectStatus) {
        selectStatus.value = host.status || "active"; // fallback ke active jika kosong
      }

      editCompanyChoices.setChoiceByValue(String(host.company_id));
      await loadDeptByCompany(editDeptChoices, host.company_id);
      editDeptChoices.setChoiceByValue(String(host.department_id));

      originalData = {
        name: host.name,
        nik: host.nik || "",
        no_telp: host.no_telp || "",
        status: host.status || "active",
        company_id: String(host.company_id),
        department_id: String(host.department_id),
      };
      btnSave.disabled = true;

      editModal.show();
    } catch (e) {
      Swal.fire({ title: "Gagal mengambil data!", text: e.message, icon: "error" });
    }
  });

  if (editModalBody) {
    editModalBody.addEventListener("input", checkFormChanges);
    editModalBody.addEventListener("change", checkFormChanges);
  }

  btnSave.addEventListener("click", async () => {
    const id = container.querySelector("#edit_id").value;
    const name = container.querySelector("#edit_name").value.trim();
    const nik = container.querySelector("#edit_employee_id").value.trim();
    const no_telp = container.querySelector("#edit_phone").value.trim();
    const companyId = editCompanyChoices.getValue(true);
    const departmentId = editDeptChoices.getValue(true);
    const status = selectStatus ? selectStatus.value : "active";

    if (!name || !companyId || !departmentId) {
      Swal.fire({ title: "Nama, perusahaan, dan departemen wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await updateHost(id, {
        name: name,
        nik: nik,
        no_telp: no_telp,
        status: status,
        department_id: departmentId,
        company_id: companyId,
      });
      console.log("Update Host:", ok, data);
      if (ok) {
        Swal.fire({ title: "Berhasil!", text: "Host berhasil diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
        editModal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal memperbarui host.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
      console.error("Update Host Error:", e);
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = orig;
    }
  });
}

// ─── Delete handler ──────────────────────────────────────────────
function initDeleteHandler(container) {
  container.querySelector("#host-table-wrapper").addEventListener("click", async (e) => {
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
      const { ok, data } = await deleteHost(id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", text: "Host berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal menghapus host.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Error!", text: e.message, icon: "error" });
    }
  });
}

// ─── Cascading change listener ───────────────────────────────────
function initCascading(container) {
  container.querySelector("#add_company").addEventListener("change", (e) => {
    if (e.detail?.value) loadDeptByCompany(addDeptChoices, e.detail.value);
  });
  container.querySelector("#edit_company").addEventListener("change", (e) => {
    if (e.detail?.value) loadDeptByCompany(editDeptChoices, e.detail.value);
  });
}

// ─── Content ─────────────────────────────────────────────────────
function HostContent() {
  const page = document.createElement("div");

  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1>Host</h1>
        <p>Kelola data karyawan yang dapat dikunjungi</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" id="btn-export">
          <i class="bi bi-download me-1"></i>Export CSV
        </button>
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-host">
          <i class="bi bi-plus-lg me-1"></i>Tambah Host
        </button>
      </div>
    </div>

    <div class="table-card mb-4">
      <div id="host-table-wrapper" class="p-3"></div>
    </div>

    <!-- Modal Tambah -->
    <div class="modal fade" id="modal-add-host" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Host</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="add-host-form">
              <div class="mb-3">
                <label class="form-label">Nama <span class="text-danger">*</span></label>
                <input type="text" id="add_name" class="form-control" placeholder="Nama karyawan" />
              </div>
              <div class="mb-3">
                <label class="form-label">NIK</label>
                <input type="text" id="add_employee_id" class="form-control" placeholder="NIK karyawan" />
              </div>
              <div class="mb-3">
                <label class="form-label">Telepon</label>
                <input type="tel" id="add_phone" class="form-control" placeholder="Nomor telepon" />
              </div>
              <div class="mb-3">
                <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
                <select id="add_company"></select>
              </div>
              <div class="mb-3">
                <label class="form-label">Departemen <span class="text-danger">*</span></label>
                <select id="add_department"></select>
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
    <div class="modal fade" id="modal-edit-host" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Host</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body modal-edit-body">
            <input type="hidden" id="edit_id" />
            <div class="mb-3">
              <label class="form-label">Nama <span class="text-danger">*</span></label>
              <input type="text" id="edit_name" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">NIK</label>
              <input type="text" id="edit_employee_id" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Telepon</label>
              <input type="tel" id="edit_phone" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Perusahaan <span class="text-danger">*</span></label>
              <select id="edit_company"></select>
            </div>
            <div class="mb-3">
              <label class="form-label">Departemen <span class="text-danger">*</span></label>
              <select id="edit_department"></select>
            </div>
            <div class="mb-3">
              <label class="form-label">Status <span class="text-danger">*</span></label>
              <select id="edit_status" class="form-select"></select>
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

    addCompanyChoices = await initCompanyChoices(page.querySelector("#add_company"));
    addDeptChoices = initDeptChoices(page.querySelector("#add_department"));
    editCompanyChoices = await initCompanyChoices(page.querySelector("#edit_company"));
    editDeptChoices = initDeptChoices(page.querySelector("#edit_department"));
    // editStatusChoices = initStatusChoices(page.querySelector("#edit_status"));

    initCascading(page);
    initAddHandler(page);
    initEditHandler(page);
    initDeleteHandler(page);
    page.querySelector("#btn-export").addEventListener("click", () => exportCSV(page));
  }, 0);

  return page;
}

// ─── Export ──────────────────────────────────────────────────────
export function HostPage() {
  return DashboardLayout(HostContent);
}
