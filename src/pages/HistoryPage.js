import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { Grid, h } from "gridjs";
import { fetchAppointmentData, fetchDetailData } from "../services/history";
import "gridjs/dist/theme/mermaid.css";
import "../assets/css/history.css";

// Base URL untuk file upload (qrcode, foto). Sesuaikan dengan .env kamu
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || "";

let gridInstance = null;
let latestDetailRequest = 0;
/* ============ HELPERS ============ */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatLabel(value) {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(status) {
  const map = {
    scheduled: "bg-info",
    checked_in: "bg-success",
    completed: "bg-secondary",
    cancelled: "bg-danger",
  };
  return map[status] || "bg-secondary";
}

function fileUrl(path) {
  return path ? `${FILE_BASE_URL}/${path}` : "";
}

function field(label, value) {
  const text = value || value === 0 ? escapeHtml(value) : "-";
  return `
    <div class="col-sm-6">
      <div class="text-muted small">${label}</div>
      <div class="fw-semibold">${text}</div>
    </div>
  `;
}

function photoBlock(label, path) {
  if (!path) return "";
  return `
    <div class="mb-3">
      <div class="text-muted small mb-1">${label}</div>
      <img src="${escapeHtml(fileUrl(path))}" alt="${label}"
           class="img-fluid rounded border" style="max-height: 180px" />
    </div>
  `;
}

/* ============ DETAIL MODAL ============ */

function renderDetail(d) {
  const host = d.host || {};

  return `
    <div class="row g-4">
      <div class="col-md-4 text-center">
        ${photoBlock("QR Code", d.qrcode_path)}
        ${photoBlock("Selfie", d.selfie_photo)}
        ${photoBlock("ID Photo", d.id_photo)}
      </div>

      <div class="col-md-8">
        <h6 class="text-primary mb-3">Visit Information</h6>
        <div class="row g-3 mb-4">
          ${field("Visit Code", d.visit_code)}
          <div class="col-sm-6">
            <div class="text-muted small">Status</div>
            <span class="badge ${statusClass(d.status)}">${escapeHtml(formatLabel(d.status))}</span>
          </div>
          ${field("Visitor Type", formatLabel(d.visitor_type))}
          ${field("Visit Category", formatLabel(d.visit_category))}
          ${field("Purpose", formatLabel(d.purpose))}
          ${field("Already Check-in", d.already_checkin ? "Yes" : "No")}
          ${field("Plan Check-in", d.plan_checkin)}
          ${field("Plan Check-out", d.plan_checkout)}
          ${field("Vehicle", d.type_vehicle)}
          ${field("Number Plate", d.number_plate)}
        </div>

        <h6 class="text-primary mb-3">Visitor</h6>
        <div class="row g-3 mb-4">
          ${field("Name", d.visitor_name)}
          ${field("Company", d.company_name)}
          ${field("Phone", d.phone)}
          ${field("Email", d.email)}
        </div>

        <h6 class="text-primary mb-3">Host</h6>
        <div class="row g-3">
          ${field("Name", host.host_name)}
          ${field("NIK", host.nik)}
          ${field("Phone", host.host_phone)}
          ${field("Department", host.department_name)}
          ${field("Company", host.company_name)}
        </div>
      </div>
    </div>
  `;
}

async function handleViewDetail(visitCode) {
  const modalEl = document.getElementById("modal-history-detail");
  if (!modalEl) return;

  const body = modalEl.querySelector("#history-detail-body");
  const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
  const requestId = ++latestDetailRequest;

  body.innerHTML = `
    <div class="text-center py-5 text-muted">
      <div class="spinner-border spinner-border-sm me-2"></div>
      Load detail...
    </div>
  `;
  modal.show();

  try {
    const detail = await fetchAppointmentDetail(visitCode);

    // Kalau user sudah klik baris lain selagi menunggu, abaikan response ini
    if (requestId !== latestDetailRequest) return;

    if (!detail) throw new Error("Detail not found");

    body.innerHTML = renderDetail(detail);
  } catch (e) {
    if (requestId !== latestDetailRequest) return;
    console.error("Error loading appointment detail:", e);
    body.innerHTML = `
      <div class="alert alert-danger mb-0" role="alert">
        Failed to load appointment detail. Please try again.
      </div>
    `;
  }
}

/* ============ TABLE ============ */

async function loadTable(container) {
  const wrapper = container.querySelector(".table-container");
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="text-center py-4 text-muted">
      <div class="spinner-border spinner-border-sm me-2"></div>
      Load data...
    </div>
  `;

  try {
    let history = await fetchAppointmentData();

    if (history && !Array.isArray(history)) {
      history = [history];
    }

    if (gridInstance) {
      gridInstance.destroy();
      gridInstance = null;
    }

    const total = history?.length || 0;
    const totalEl = container.querySelector("#totalAppointment");
    if (totalEl) totalEl.textContent = total;

    if (total === 0) {
      wrapper.innerHTML = `
        <div class="text-center py-4 text-muted">
          No data available
        </div>
      `;
      return;
    }

    wrapper.innerHTML = `<div id="gridjs-container"></div>`;
    const gridContainer = wrapper.querySelector("#gridjs-container");

    gridInstance = new Grid({
      data: history.map((item, i) => ({
        no: i + 1,
        visit_code: item.visit_code,
        visitor_name: item.visitor_name,
        company_name: item.company_name,
        plan_checkin: item.plan_checkin,
        plan_checkout: item.plan_checkout || "-",
        purpose: item.purpose,
        host_name: item.host_name,
        status: item.status,
        action: item.visit_code,
      })),
      columns: [
        { name: "No", id: "no" },
        { name: "ID Appointment", id: "visit_code" },
        { name: "Name", id: "visitor_name" },
        { name: "Company", id: "company_name" },
        { name: "Plan Checkin", id: "plan_checkin" },
        { name: "Plan Checkout", id: "plan_checkout" },
        {
          name: "Purpose",
          id: "purpose",
          formatter: (cell) => formatLabel(cell),
        },
        { name: "Employee Target", id: "host_name" },
        {
          name: "Status",
          id: "status",
          formatter: (cell) => h("span", { className: `badge ${statusClass(cell)}` }, formatLabel(cell)),
        },
        {
          name: "Action",
          id: "action",
          sort: false,
          formatter: (cell) =>
            h(
              "button",
              {
                type: "button",
                className: "btn btn-sm btn-outline-info btn-detail",
                onClick: () => handleViewDetail(cell),
              },
              "View Detail",
            ),
        },
      ],
      search: true,
      sort: true,
      pagination: { limit: 10 },
      language: {
        search: { placeholder: "Search..." },
        pagination: {
          showing: "Showing",
          of: "of",
          to: "to",
          results: () => "results",
        },
        noRecordsFound: "No appointments found",
      },
      className: {
        table: "table table-hover mb-0",
        container: "gridjs-container",
      },
    }).render(gridContainer);
  } catch (e) {
    console.error("Error loading appointment data:", e);
    wrapper.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load appointment data. Please try again.
      </div>
    `;
  }
}

/* ============ PAGE ============ */

function historyContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
      <div>
        <h1 class="text-primary mb-3">Appointment History</h1>
      </div>
      <div>
        <div class="count-group">
          <p class="fw-semibold text-dark appointment-count">Total Schedule History</p>
          <p class="badge badge-primary text-light fw-bold" id="totalAppointment">0</p>
          <p class="text-muted fw-semibold">Schedule</p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="table-container"></div>
    </div>

    <div class="modal fade" id="modal-history-detail" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointment Detail</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="history-detail-body"></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    loadTable(page);
  }, 0);
  return page;
}

export function HistoryPage() {
  return DashboardLayout(historyContent);
}
