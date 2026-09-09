import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { fetchParkingCard, createParkingCard, updateParkingCard, deleteParkingCard } from "../services/parking-card";
import "../assets/css/styles.css";
import "../assets/css/datatable-visitor-card.css";

let dtInstance = null;
let addParkingCard = null;
let editParkingCard = null;
// let deleteParkingCard = null;

const STATUS_LABEL = {
  available: "Tersedia",
  in_use: "Digunakan",
  damaged: "Rusak",
};

async function loadTable(container) {
  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }

  const wrapper = container.querySelector("#parking-card-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { parking_cards = [] } = await fetchParkingCard();
    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }
    wrapper.innerHTML = `
    <table id="parking-card-table" class="table table-hover mb-0">
        <thead>
            <tr>
                <th>No</th>
                <th>Parking Card Number</th>
                <th>Status</th>
                <th>Parking Card Type</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${
              parking_cards.length === 0
                ? `<tr><td colspan="5" class="text-center py-4 text-muted">Data kartu pengunjung kosong</td></tr>`
                : parking_cards
                    .map(
                      (cards, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${cards.card_number || "dumy123"}</td>
                        <td><span class="status-badge ${cards.status}">${STATUS_LABEL[cards.status] || "-"}</span></td>
                        <td>${cards.parking_cards_type}</td>
                        <td class="text-center">
                          <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                            data-id="${cards.id}" title="Edit">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger btn-delete"
                            data-id="${cards.id}" data-name="${cards.card_number}" title="Hapus">
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
    if (parking_cards.length > 0) {
      dtInstance = new DataTable("#parking-card-table", {
        searchable: true,
        fixedHeight: false,
        perpage: 10,
        perPageSelect: [10, 25, 50, 100],
        labels: {
          placeholder: "Search...",
          perPage: " ",
          noRows: "Not found",
          info: "Showing {start} to {end} of {rows} entries",
        },
        columns: [{ select: 4, sortable: false }],
      });
    }
  } catch (e) {
    wrapper.innerHTML = `<div class="text-center py-4 text-danger">${e.message}</div>`;
    console.error(e);
  }
}

// ─── Export CSV ──────────────────────────────────────────────────
function exportCSV(container) {
  const table = container.querySelector("#parking-card-table");
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
  link.download = `parking_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// ─── Add Handler ──────────────────────────────────────────────────
function initAddHandler(container) {
  const btnAdd = container.querySelector("#btn-submit-add");
  const modal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-add-parking-card"));

  btnAdd.addEventListener("click", async () => {
    const cardTypeId = container.querySelector("#add_parking_card_type").value(true);
    const cardType = container.querySelector("#add_parking_card_type").value.trim();
    const cardNumber = container.querySelector("#add_parking_card_number").value.trim();

    if (!cardType || !cardNumber) {
      Swal.fire({ title: "Jenis kartu dan nomor kartu wajib diisi!", icon: "warning" });
      return;
    }

    const orig = btnAdd.innerHTML;
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await createParkingCard({
        spot_number: cardNumber,
        status: "available",
        parking_spot_type_id: cardTypeId,
        assigned_to: null,
      });
      if (ok) {
        Swal.fire({ title: "Berhasil!", icon: "success", timer: 1500, showConfirmButton: false });
        modal.hide();
        container.querySelector("#add_parking_card_type").value = "";
        container.querySelector("#add_parking_card_number").value = "";
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message, icon: "error" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      btnAdd.innerHTML = orig;
      btnAdd.disabled = false;
    }
  });
}

// ─── Edit handler  ──────────────────────────────────────────────────
function initEditHandler(container) {
  const btnSubmitEdit = container.querySelector("#btn-submit-edit");
  const editModalElement = container.querySelector("#modal-edit-parking-card");
  if (!editModalElement) return;

  const editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);
  const editModalBody = editModalElement.querySelector(".modal-edit-body");
  const selectStatus = container.querySelector("#edit_parking_card_status");
  const inputCardNumber = container.querySelector("#edit_parking_card_number");
  const inputId = container.querySelector("#edit_id");
  let originalData = {};

  const listStatus = [
    { value: "available", label: "Tersedia" },
    { value: "occupied", label: "Digunakan" },
  ];

  function checkFormChanges() {
    if (!inputCardNumber || !selectStatus) return;
    const currentData = {
      card_number: container.querySelector("#edit_parking_card_number").value.trim(),
      status: selectStatus ? selectStatus.value : "available",
    };

    const isChanged = Object.keys(originalData).some((key) => originalData[key] !== currentData[key]);
    btnSubmitEdit.disabled = !isChanged;
  }

  container.querySelector("#parking-card-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const { ok, data } = await fetchParkingCard(id);

      if (selectStatus) {
        selectStatus.innerHTML = listStatus.map((s) => `<option value="${s.value}">${s.label}</option>`).join("");
      }

      container.querySelector("#edit_id").value = data.id;
      container.querySelector("#edit_parking_card_number").value = data.spot_number;

      originalData = {
        card_number: data.card_number,
        status: data.status,
      };
      btnSubmitEdit.disabled = true;
      editModal.show();
    } catch (e) {
      console.error(e);
      Swal.fire({ title: "Gagal mengambil data!", text: e.message, icon: "error" });
    }
  });

  if (editModalBody) {
    editModalBody.addEventListener("input", checkFormChanges);
    editModalBody.addEventListener("change", checkFormChanges);
  }

  btnSubmitEdit.addEventListener("click", async () => {
    const id = container.querySelector("#edit_id").value.trim();
    const cardNumber = container.querySelector("#edit_parking_card_number").value.trim();
    const status = container.querySelector("#edit_parking_card_status").value.trim();

    if (!id || !cardNumber || !status) {
      Swal.fire({ title: "Jenis kartu dan nomor kartu wajib diisi!", icon: "warning" });
      return;
    }

    const ori = btnSubmitEdit.innerHTML;
    btnSubmitEdit.disabled = true;
    btnSubmitEdit.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await updateParkingCard(id, { card_number: cardNumber, status });
      if (ok) {
        Swal.fire({ title: "Berhasil!", icon: "success", timer: 1500, showConfirmButton: false });
        editModal.hide();
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message, icon: "error" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      btnSubmitEdit.innerHTML = ori;
      btnSubmitEdit.disabled = false;
    }
  });
}

// ─── Delete handler ──────────────────────────────────────────────────
function initDeleteHandler(container) {
  container.querySelector("#parking-card-table-wrapper").addEventListener("click", async (e) => {
    const btnDelete = e.target.closest(".btn-delete");
    if (!btnDelete) return;

    const id = btnDelete.dataset.id;
    const name = btnDelete.dataset.name;

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
      const { ok, data } = await deleteParkingCard(id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", text: "Kartu pengunjung berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
        loadTable(container);
      } else {
        Swal.fire({ title: "Gagal!", text: data?.message || "Gagal menghapus kartu pengunjung.", icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Gagal!", text: e.message, icon: "error" });
      console.error(e);
    }
  });
}
// ─── Content ──────────────────────────────────────────────────
function ParkingCardPageContent() {
  const page = document.createElement("div");
  page.innerHTML = `
  <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
    <div>
        <h1 class="text-primary">Parking Cards</h1>
        <p>Kelola data inventaris kartu parkir</p>
    </div>
    <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" id="btn-export"><i class="bi bi-download me-1"></i>Export CSV</button>
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-parking-card"><i class="bi bi-plus-lg me-1"></i>Tambah Kartu Parkir</button>
    </div>
    </div>

    <div class="table-card mb-4">
    <div id="parking-card-table-wrapper" class="p-3"></div>
    </div>

    <!-- Modal Tambah -->
    <div class="modal fade" id="modal-add-parking-card" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Tambah Parking Card</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <form id="add-parking-card-form">
            <div class="mb-3">
                <label class="form-label">Parking Card Type <span class="text-danger">*</span></label>
                <select id="add_parking_card_type" class="form-select"></select>
            </div>
            <div class="mb-3">
                <label class="form-label">Parking Card Number</label>
                <input type="text" id="add_parking_card_number" class="form-control" placeholder="Parking Card Number" />
            </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button class="btn btn-primary" id="btn-submit-add"><i class="bi bi-floppy me-1"></i>Submit</button>
        </div>
        </div>
    </div>
    </div>

    <!-- Modal Edit -->
    <div class="modal fade" id="modal-edit-parking-card" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Parking Card</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body modal-edit-body">
                <input type="hidden" id="edit_id" />
                <div class="mb-3">
                <label class="form-label">Parking Card Number <span class="text-danger">*</span></label>
                <input type="text" id="edit_parking_card_number" class="form-control" />
                </div>
                <div class="mb-3">
                <label class="form-label">Status <span class="text-danger">*</span></label>
                <select id="edit_parking_card_status" class="form-select"></select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                <button class="btn btn-primary" id="btn-submit-edit"><i class="bi bi-floppy me-1"></i>Submit</button>
            </div>
            </div>
        </div>
    </div>
  `;
  setTimeout(async () => {
    loadTable(page);
    initAddHandler(page);
    initEditHandler(page);
    initDeleteHandler(page);
  }, 0);
  return page;
}

// ─── Export ──────────────────────────────────────────────────────
export function ParkingCardPage() {
  return DashboardLayout(ParkingCardPageContent);
}
