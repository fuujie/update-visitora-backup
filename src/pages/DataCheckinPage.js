import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DataTable } from "simple-datatables";
import { fetchDataCheckin } from "../services/data-checkin";
import "../assets/css/data-checkin.css";
import AirDatepicker from "air-datepicker";
import localeEnModule from "air-datepicker/locale/en";

let dtInstance = null;

// handler inisiasi date format
const localeEn = localeEnModule.default || localeEnModule;

function reportTime() {
  const startDate = document.querySelector("#report-start-date");
  const endDate = document.querySelector("#report-end-date");
  if (!startDate || !endDate) return;

  const inisiasiDatePicker = {
    locale: localeEn,
    autoClose: true,
    dateFormat: "dd/MM/yyyy",
  };

  const endDatePicker = new AirDatepicker(endDate, inisiasiDatePicker);
  const startDatePicker = new AirDatepicker(startDate, inisiasiDatePicker);

  return (endDatePicker, startDatePicker);
}

// handler table
async function loadTable(container) {
  const wrapper = container.querySelector("#main-table");

  if (!wrapper) {
    console.error("Element #main-table tidak ditemukan.");
    return;
  }

  wrapper.innerHTML = `
    <div class="text-center py-4 text-muted">
      <div class="spinner-border spinner-border-sm me-2"></div>
      Load data...
    </div>
  `;

  try {
    const report = await fetchDataCheckin();
    console.log("pages", report);

    if (dtInstance) {
      dtInstance.destroy();
      dtInstance = null;
    }

    if (!Array.isArray(report) || report.length === 0) {
      wrapper.innerHTML = `
        <div class="text-center py-4 text-muted">
          No data available
        </div>
      `;
      return;
    }

    wrapper.innerHTML = `
      <table class="table table-hover mb-3" id="report-table">
        <thead>
          <tr>
            <th>No</th>
            <th>ID Appointment</th>
            <th>Visitor Name</th>
            <th>Company Origin</th>
            <th>Check-In Time</th>
            <th>Check-Out Time</th>
            <th>ID Card</th>
            <th>Parking Card</th>
            <th>Electronic Device</th>
            <th>Sticker</th>
            <th>Status</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          ${report
            .map(
              (r, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${r.appointment_id}</td>
                    <td>${r.name}</td>
                    <td>${r.company_}</td>
                    <td>${r.check_in_actual}</td>
                    <td>${r.check_out_actual}</td>
                    <td>${r.id_card_number}</td>
                    <td>${r.parking_card_number}</td>
                    <td>${r.device}</td>
                    <td>${r.sticker}</td>
                    <td>${r.status}</td>
                    <td>
                        <div class="action-wrapper">
                            <button type="button" class="btn btn-sm btn-outline-info me-1 btn-detail" data-id="${r.appointment_id}" title="Detail">
                                <i class="bi bi-info-circle"></i>
                            </button>
                        </div>
                    </td>
                  </tr>
                `,
            )
            .join("")}
        </tbody>
      </table>
    `;

    dtInstance = new DataTable("#report-table", {
      searchable: true,
      fixedHeight: false,
      perPageSelect: [10, 25, 50],
      labels: {
        placeholder: "Search...",
        perPage: "",
        noRows: "Tidak ada data",
        info: "Menampilkan {start}-{end} dari {rows} data",
      },
      columns: [
        {
          select: 3,
          sortable: false,
        },
      ],
    });
  } catch (e) {
    console.error("Gagal memuat data check-in:", e);

    wrapper.innerHTML = `
      <div class="text-center py-4 text-danger">
        ${e.message || "Terjadi kesalahan saat memuat data"}
      </div>
    `;
  }
}

// CONTENT
function dataCheckinContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <div>
            <h1 class="text-primary mb-3">Data Checkin</h1>
            <p class="text-muted">List of visitors who have Check-In & Out</p>
        </div>
        <div>
            <div class="gap-2">
                <h4 class="report-range-title fw-semibold">Select the report time range</h4>
                <div class="d-flex gap-3">
                    <div class="position-relative flex-grow-1">
                        <input type="text" class="form-control" id="report-start-date" placeholder="Report Start Date" />
                        <i class="bi bi-calendar calendar-icon"></i>
                    </div>
                    <div class="position-relative flex-grow-1">
                        <input type="text" class="form-control" id="report-end-date" placeholder="Report End Date" />
                        <i class="bi bi-calendar calendar-icon"></i>
                    </div>
                    <button class="btn btn-primary rounded-5 flex-shrink-0"><i class="bi bi-download"></i> Download Report</button>
                </div>
            </div>
        </div>
    </div>

<div class="card mb-4 p-4 d-flex justify-content-center align-item-center">
  <div class="table-data-checkin" id="main-table"></div>
</div>

        <!-- MODAL DETAIL -->
        <div class="modal fade" id="modal-detail" tabindex="-1">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title section-title">Detail Kunjungan</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                <div class="col-md-6">
                    <h5 class="info-title">Basic Information</h5>
                    <div class="basic-info-table"></div>
                    <div class="mt-3">
                    <h5 class="visitor-photo text-muted">Visitor Photo</h5>
                    <img src="" alt="" />
                    </div>
                </div>
                <div class="col-md-6">
                    <h5 class="info-title">Appointment Time Info</h5>
                    <div class="appointment-time-info-table"></div>
                    <div class="mt-3">
                    <div class="row">
                        <div class="col-sm-6">
                        <span class="badge-success">Check-In</span>
                        <img src="" alt="" />
                        </div>
                        <div class="col-sm-6">
                        <span class="badge-danger">Check-Out</span>
                        <img src="" alt="" />
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    `;
  setTimeout(() => {
    loadTable(page);
    reportTime();
  }, 0);

  return page;
}

export function DataCheckinPage() {
  return DashboardLayout(dataCheckinContent);
}
