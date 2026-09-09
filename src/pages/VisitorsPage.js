import Swal from "sweetalert2";
import { DataTable } from "simple-datatables";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { fetchVisitors, fetchDetailVisitor } from "../services/visitor-list";
import "../assets/css/datatable-visitors.css";

let dtInstance = null;

function resetModalContent(container) {
  container.querySelector("#visitor_id").value = "";
  container.querySelector("#visitorName_").textContent = "Memuat...";
  container.querySelector("#phoneNumber_").textContent = "Memuat...";
  container.querySelector("#email_").textContent = "Memuat...";
  container.querySelector("#identityType_").textContent = "Memuat...";
  container.querySelector("#identityNumber_").textContent = "Memuat...";
  container.querySelector("#company_").textContent = "Memuat...";

  const visitorPhotoImg = container.querySelector("#visitorPhoto_");
  const identityPhotoImg = container.querySelector("#identityPhoto_");

  if (visitorPhotoImg) {
    visitorPhotoImg.src = "";
    visitorPhotoImg.style.display = "none";
  }
  if (identityPhotoImg) {
    identityPhotoImg.src = "";
    identityPhotoImg.style.display = "none";
  }
}

// ─── visitor detail handler ──────────────────────────────────────────────────
function visitorDetail(container) {
  const modalEl = container.querySelector("#modal-visitor-detail");
  if (!modalEl) return;

  const modalDetail = bootstrap.Modal.getOrCreateInstance(modalEl);
  const wrapper = container.querySelector("#visitors-table-wrapper");
  if (!wrapper) return;

  wrapper.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-detail");
    if (!btn) return;

    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
    resetModalContent(container);

    const id = btn.dataset.id;
    try {
      const { visitor } = await fetchDetailVisitor(id);
      container.querySelector("#visitor_id").value = visitor.visitor_id || "";
      container.querySelector("#visitorName_").textContent = visitor.name || "-";
      container.querySelector("#phoneNumber_").textContent = visitor.phone_number || "-";
      container.querySelector("#email_").textContent = visitor.email || "-";
      container.querySelector("#identityType_").textContent = visitor.id_type || "-";
      container.querySelector("#identityNumber_").textContent = visitor.id_number || "-";
      container.querySelector("#company_").textContent = visitor.company_origin || "-";

      const visitorPhotoImg = container.querySelector("#visitorPhoto_");
      const identityPhotoImg = container.querySelector("#identityPhoto_");

      if (visitor.visitor_photo) {
        visitorPhotoImg.src = visitor.visitor_photo;
        visitorPhotoImg.style.display = "block";
      } else {
        visitorPhotoImg.style.display = "none";
      }

      if (visitor.identity_photo) {
        identityPhotoImg.src = visitor.identity_photo;
        identityPhotoImg.style.display = "block";
      } else {
        identityPhotoImg.style.display = "none";
      }

      modalDetail.show();
    } catch (e) {
      console.error(e);
      Swal.fire({ title: "Gagal mengambil data!", text: e.message, icon: "error" });
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  });
}

// ─── Render table ──────────────────────────────────────────────────
async function loadTable(container) {
  const wrapper = container.querySelector("#visitors-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div>Memuat data...
  </div>`;

  try {
    const { visitors = [] } = await fetchVisitors();
    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }

    wrapper.innerHTML = `
    <table id="visitors-table" class="table table-hover mb-0">
        <thead>
        <tr>
            <th>No</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Company Origin</th>
            <th>ID Number</th>
            <th>Detail</th>
        </tr>
        </thead>
        <tbody>
        ${
          visitors.length === 0
            ? `<tr><td colspan="7" class="text-center py-4 text-muted">Data empty</td></tr>`
            : visitors
                .map(
                  (v, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${v.name}</td>
                <td>${v.phone_number}</td>
                <td>${v.email}</td>
                <td>${v.company_origin}</td>
                <td>${v.id_number}</td>
                <td class="text-center">
                    <button class="btn d-block btn-sm btn-outline-primary me-1 btn-detail"
                    data-id="${v.visitor_id}" title="Detail">
                    <i class="bi bi-info-circle"></i> Detail
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
    if (visitors.length > 0) {
      const tableEl = wrapper.querySelector("#visitors-table");
      dtInstance = new DataTable(tableEl, {
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
async function exportCSV(container) {
  const table = container.querySelector("#visitors-table");
  if (!table) {
    Swal.fire({ title: "Tidak ada data untuk diekspor", icon: "warning" });
    return;
  }

  const headers = [...table.querySelectorAll("thead th")].slice(0, -1).map((th) => th.innerText.trim());

  try {
    const { visitors = [] } = await fetchVisitors();
    if (visitors.length === 0) {
      Swal.fire({ title: "Tidak ada data untuk diekspor", icon: "warning" });
      return;
    }

    const csvRows = [];
    csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

    visitors.forEach((item, index) => {
      const rowValues = headers.map((header) => {
        let value = "";
        switch (header.toLowerCase()) {
          case "no":
            value = index + 1;
            break;
          case "name":
          case "visitorname":
            value = item.name || "";
            break;
          case "phone number":
          case "phone_number":
            value = item.phone_number || "";
            break;
          case "email":
            value = item.email || "";
            break;
          case "company origin":
          case "company_origin":
            value = item.company || item.company_origin || "";
            break;
          case "id number":
          case "id_number":
          case "nomor identitas":
            value = item.id_number || "";
            break;
          default:
            value = "";
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(rowValues.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `visitors_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  } catch (e) {
    console.error(e);
    Swal.fire({ title: "Gagal Ekspor", text: e.message, icon: "error" });
  }
}

// ─── Content ──────────────────────────────────────────────────
function visitorsPageContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
            <h1 class="text-primary">Visitors</h1>
            <p>Data visitor yang sudah registrasi</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" id="btn-export"><i class="bi bi-download me-1"></i>Export CSV</button>
        </div>
    </div>

    <div class="table-card mb-4">
        <div id="visitors-table-wrapper" class="p-3"></div>
    </div>

    <!-- Modal Visitor Detail -->
    <div class="modal fade" id="modal-visitor-detail" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detail Visitor</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
            <input type="hidden" id="visitor_id" />

                <table class="table d-flex justify-space-between table-bordered detail-table">
                    <tbody>
                        <tr>
                            <th>Visitor Name</th>
                            <td id="visitorName_"></td>
                        </tr>
                        <tr>
                            <th>Phone Number</th>
                            <td id="phoneNumber_"></td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td id="email_"></td>
                        </tr>
                        <tr>
                            <th>Identity Type</th>
                            <td id="identityType_"></td>
                        </tr>
                        <tr>
                            <th>Identity Number</th>
                            <td id="identityNumber_"></td>
                        </tr>
                        <tr>
                            <th>Company</th>
                            <td id="company_"></td>
                        </tr>
                    </tbody>
                </table>
                <div class="photo-container d-flex flex-column align-items-center gap-3">
                    <div class="text-center w-100">
                      <p class="mb-1 text-muted small fw-bold">Visitor Photo</p>
                      <img src="" alt="Visitor photo" id="visitorPhoto_" class="img-thumbnail" style="max-height: 200px; display: none;" />
                    </div>
                    <div class="text-center w-100">
                      <p class="mb-1 text-muted small fw-bold">Identity Card Photo</p>
                      <img src="" alt="Identity photo" id="identityPhoto_" class="img-thumbnail" style="max-height: 200px; display: none;" />
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    `;

  setTimeout(async () => {
    await loadTable(page);

    visitorDetail(page);
    const exportBtn = page.querySelector("#btn-export");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => exportCSV(page));
    }
  }, 0);
  return page;
}

//EXPORT
export function VisitorsPage() {
  return DashboardLayout(visitorsPageContent);
}
