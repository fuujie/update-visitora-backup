import { DashboardLayout } from "../layouts/DashboardLayout";
const urlParams = new URLSearchParams(window.location.search);

const idData = urlParams.get("id");
if (idData) {
  console.log("ID yang diterima:", idData);
} else {
  console.error("ID tidak ditemukan");
}

// CONTENT
function qrPageContent() {
  const page = document.createElement("div");
  page.innerHTML = `
  <div class="card p-4">
  <div class="title-container">
    <h5 class="page-title">Detail Appointment</h5>
    <span class="qr-info"><i class="bi bi-info-circle"></i>Show this QR Code to Security personnel</span>
  </div>
  <div>
    <div class="row">
      <div class="col-6">
        <div class="info-container card p-4">
          <h5>Visitor Information</h5>
          <div class="info-item">
            <i class="bi bi-info-circle"></i>
            <span class="info-label">Name</span>
            <span class="info-value" id="info-name"></span>
          </div>
          <div class="info-item">
            <i class="bi bi-info-circle"></i>
            <span class="info-label">Appointment Type</span>
            <span class="info-value" id="info-appointment-type"></span>
          </div>
          <div class="info-item">
            <i class="bi bi-info-circle"></i>
            <span class="info-label">Date Appointment</span>
            <span class="info-value" id="info-appointment-date"></span>
          </div>
          <div class="info-item">
            <i class="bi bi-info-circle"></i>
            <span class="info-label">Purpose</span>
            <span class="info-value" id="info-purpose"></span>
          </div>
          <div class="info-item">
            <i class="bi bi-info-circle"></i>
            <span class="info-label">Host Name</span>
            <span class="info-value" id="info-host"></span>
          </div>
          <div class="info-item">
            <i class="bi bi-info-circle"></i>
            <span class="info-label">Plat Number</span>
            <span class="info-value" id="info-plat-number"></span>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="qr-container card p-4">
          <div class="item-qr">
            <img src="" alt="" />
            <i class="bi bi-qr-code-scan"></i>
          </div>
          <div class="btn-wrapper">
            <button class="btn btn-primary" id="download"><i class="bi bi-download"></i> Download Image</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  `;
}

export function QrPage() {
  return DashboardLayout(qrPageContent);
}
