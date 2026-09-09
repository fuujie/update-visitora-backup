import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { fetchStickerBlock, createStickerBlock, updateStickerBlock, deleteStickerBlock } from "../services/sticker-block";
import "../assets/css/styles.css";
import "../assets/css/datatable-visitor-card.css";

let dtInstance = null;
let addStickerBlock = null;
let editStickerBlock = null;
let deleteStickerBlockData = null;

const STATUS_LABEL = {
  available: "Tersedia",
  in_use: "Digunakan",
  damaged: "Rusak",
};

// ─── Load table ──────────────────────────────────────────────────
async function loadTable(container) {
  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }

  const wrapper = container.querySelector("#sticker-block-table-wrapper");
  console.log(wrapper);
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { sticker_data = [] } = await fetchStickerBlock();
    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }
    wrapper.innerHTML = `
    <table id="sticker-block-table" class="table table-hover mb-0">
        <thead>
            <tr>
                <th>No</th>
                <th>Sticker Block Number</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${
              sticker_data.length === 0
                ? `<tr><td colspan="5" class="text-center py-4 text-muted">Data sticker block kosong</td></tr>`
                : sticker_data
                    .map(
                      (sticker, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${sticker.protection_sticker_code || ""}</td>
                        <td><span class="status-badge ${sticker.status}">${STATUS_LABEL[sticker.status] || "-"}</span></td>
                        <td class="text-center">
                          <button class="btn btn-sm btn-outline-primary me-1 btn-edit"
                            data-id="${sticker.id}" title="Edit">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger btn-delete"
                            data-id="${sticker.id}" data-name="${sticker.protection_sticker_code}" title="Hapus">
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
    if (sticker_data.length > 0) {
      dtInstance = new DataTable("#sticker-block-table", {
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
  const table = container.querySelector("#sticker-block-table");
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
  link.download = `stickerBlock_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// ─── Add Handler ──────────────────────────────────────────────────
function initAddHandler(container) {
  const btnAdd = container.querySelector("#btn-submit-add");
  const modal = bootstrap.Modal.getOrCreateInstance(container.querySelector("#modal-add-sticker-block"));

  btnAdd.addEventListener("click", async () => {
    const stickerBlock = container.querySelector("#add_sticker_block_number").value.trim();
    const quantity = container.querySelector("#quantity_sticker").value.trim();

    if (!stickerBlock || !quantity) {
      Swal.fire({ title: "Nomor Sticker dan Jumlah Sticker wajib diisi!", icon: "warning" });
      return;
    }
    // belum mapping kirim payload sesuai jumlah user input
    // loading spiner
    // maksimal value quantity 999
    const stickerNumber = `STG-${stickerBlock}`;
    const orig = btnAdd.innerHTML;
    btnAdd.disabled = true;
    btnAdd.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await createStickerBlock({
        protection_sticker_code: stickerNumber,
        status: "available",
      });
      if (ok) {
        Swal.fire({ title: "Berhasil!", icon: "success", timer: 1500, showConfirmButton: false });
        modal.hide();
        container.querySelector("#add_sticker_block_number").value = "";
        container.querySelector("#quantity_sticker").value = "";
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

// ─── Edit handler ──────────────────────────────────────────────────
function initEditHandler(container) {
  const btnSubmitEdit = container.querySelector("#btn-submit-edit");
  const editModalElement = container.querySelector("#modal-edit-sticker-block");
  if (!editModalElement) return;

  const editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);
  const editModalBody = editModalElement.querySelector(".modal-edit-body");
  const selectStatus = container.querySelector("#edit_sticker_block_status").value.trim();
  const stickerNumber = container.querySelector("#edit_sticker_block_number");
  const inputId = container.querySelector("#edit_id");
  let originalData = {};

  const listStatus = [
    { value: "available", label: "Tersedia" },
    { value: "occupied", label: "Digunakan" },
  ];

  function checkFormChanges() {
    if (!stickerNumber || !selectStatus) return;
    const currentData = {
      protection_sticker_code: stickerNumber,
      status: selectStatus ? selectStatus.value : "available",
    };

    const isChanged = Object.keys(originalData).some((key) => originalData[key] !== currentData[key]);
    btnSubmitEdit.disabled = !isChanged;
  }

  container.querySelector("#sticker-block-table-wrapper").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    try {
      const { ok, data } = await fetchStickerBlock(id);
      if (selectStatus) {
        selectStatus.innerHTML = listStatus.map((s) => `<option value="${s.value}">${s.label}</option>`).join("");
      }

      container.querySelector("#edit_id").value = data.id;
      container.querySelector("#edit_sticker_block_status").value = data.status;

      originalData = {
        protection_sticker_code: data.protection_sticker_code,
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
    const stickerNumber = container.querySelector("#edit_sticker_block_number").value;
    const status = container.querySelector("#edit_sticker_block_status").value.trim();

    if (!id || !stickerNumber || !status) {
      Swal.fire({ title: "Tidak ada perubahan yang terjadi", icon: "warning" });
      return;
    }

    const ori = btnSubmitEdit.innerHTML;
    btnSubmitEdit.disabled = true;
    btnSubmitEdit.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...`;

    try {
      const { ok, data } = await updateStickerBlock(id, {
        protection_sticker_code: stickerNumber,
        status: status,
      });
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
  container.querySelector("#sticker-block-table-wrapper").addEventListener("click", async (e) => {
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
      const { ok, data } = await deleteStickerBlock(id);
      if (ok) {
        Swal.fire({ title: "Terhapus!", text: "Sticker berhasil dihapus.", icon: "success", timer: 1500, showConfirmButton: false });
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
function stickerBlockPageContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
            <h1 class="text-primary">Sticker Block</h1>
            <p>Kelola data inventaris blok sticker</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" id="btn-export"><i class="bi bi-download me-1"></i>Export CSV</button>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-add-sticker-block"><i class="bi bi-plus-lg me-1"></i>Tambah Sticker Block</button>
        </div>
        </div>

        <div class="table-card mb-4">
        <div id="sticker-block-table-wrapper" class="p-3"></div>
        </div>

        <!-- Modal Tambah -->
        <div class="modal fade" id="modal-add-sticker-block" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Tambah Sticker Block</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="add-sticker-block-form">
                <div class="mb-3">
                    <label class="form-label">Sticker Block Number <span class="text-danger">*</span></label>
                    <input type="text" id="add_sticker_block_number" class="form-control" placeholder="Sticker Block Number" />
                </div>
                <div class="mb-3">
                    <label class="form-label">Quantity of Sticker Block</label>
                    <input type="number" id="quantity_sticker" min="1" max="999" class="form-control" placeholder="Quantity of Sticker Block" />
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
        <div class="modal fade" id="modal-edit-sticker-block" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Sticker Block</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body modal-edit-body">
                <input type="hidden" id="edit_id" />
                <div class="mb-3">
                <label class="form-label">Sticker Block Number <span class="text-danger">*</span></label>
                <input type="text" id="edit_sticker_block_number" class="form-control" readonly/>
                </div>
                <div class="mb-3">
                <label class="form-label">Status <span class="text-danger">*</span></label>
                <select id="edit_sticker_block_status" class="form-select"></select>
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
  }, 0);
  return page;
}

// ─── Export ──────────────────────────────────────────────────
export function StickerBlockPage() {
  return DashboardLayout(stickerBlockPageContent);
}
