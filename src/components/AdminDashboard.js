// src/components/AdminDashboard.js
import ApexCharts from "apexcharts";
import { fetchVisitorStats, fetchTotalAppointments, fetchIdCardStatus, fetchParkingStatus, fetchRecentVisitors, fetchActiveCheckins, fetchVisitorChart } from "../services/dashboard.js";

// ─── Helper ─────────────────────────────────────────────────────
function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt(raw) {
  if (!raw) return "-";
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d)) return raw;
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── Render tabel ────────────────────────────────────────────────
function renderTable(tbodyId, rows, columns, emptyMsg = "Tidak ada data") {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columns.length}" class="table-empty">${emptyMsg}</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(
      (row, i) => `
    <tr>${columns.map((col) => `<td>${col(row, i)}</td>`).join("")}</tr>
  `,
    )
    .join("");
}

// ─── Render chart ────────────────────────────────────────────────
function renderChart(data) {
  const el = document.getElementById("visitor-chart");
  if (!el) return;

  const months = data?.months || ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const counts = data?.visitor_counts || Array(12).fill(0);

  new ApexCharts(el, {
    series: [{ name: "Pengunjung", data: counts }],
    chart: {
      type: "bar",
      height: 280,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: "55%" },
    },
    colors: [getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#3852B4"],
    dataLabels: { enabled: false },
    xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    grid: { borderColor: "#f0f0f0", strokeDashArray: 4 },
    tooltip: { y: { formatter: (val) => `${val} pengunjung` } },
    noData: { text: "Belum ada data", style: { color: "#717182" } },
  }).render();
}

// ─── Load semua data ─────────────────────────────────────────────
async function loadData() {
  const date = todayYMD();

  // Stat cards
  try {
    const stats = await fetchVisitorStats(date);
    const checkin = stats.checkin_count || 0;
    const checkout = stats.checkout_count || 0;
    setEl("stat-visit-today", checkin + checkout);
    setEl("stat-checkin", checkin);
    setEl("stat-checkout", checkout);
  } catch (e) {
    console.warn("Stats:", e.message);
  }

  try {
    const appt = await fetchTotalAppointments(date);
    setEl("stat-appointment", appt.total || 0);
  } catch (e) {
    console.warn("Appointment:", e.message);
  }

  // Inventory cards
  try {
    const id = await fetchIdCardStatus();
    setEl("idcard-used", id.occupied || 0);
    setEl("idcard-available", id.available || 0);
  } catch (e) {
    console.warn("ID Card:", e.message);
  }

  try {
    const pk = await fetchParkingStatus();
    setEl("parking-used", pk.occupied || 0);
    setEl("parking-available", pk.available || 0);
  } catch (e) {
    console.warn("Parking:", e.message);
  }

  // Chart
  try {
    const chartData = await fetchVisitorChart();
    renderChart(chartData);
  } catch (e) {
    console.warn("Chart:", e.message);
    renderChart(null);
  }

  // Recent visitors table
  try {
    const res = await fetchRecentVisitors();
    const visitors = res.recent_visitors || [];
    renderTable("tbody-recent", visitors, [(r, i) => i + 1, (r) => r.name || "-", (r) => r.company_name || "-", (r) => fmt(r.checkin_time), (r) => r.purpose || "-", (r) => r.host_name || "-"]);
  } catch (e) {
    console.warn("Recent:", e.message);
  }

  // Active checkins table
  try {
    const res = await fetchActiveCheckins();
    const checkins = (res.checkins || []).filter((c) => !c.is_checkout);
    renderTable("tbody-active", checkins, [(r, i) => i + 1, (r) => r.visitor_name || "-", (r) => r.visitor_company || "-", (r) => fmt(r.checkin_time), (r) => r.purpose || "-", (r) => r.host_name || "-"]);
  } catch (e) {
    console.warn("Active:", e.message);
  }
}

// ─── Export ──────────────────────────────────────────────────────
export function AdminDashboard() {
  const el = document.createElement("div");
  el.innerHTML = `
    <!-- Page title -->
    <div class="page-title">
      <h1>Dashboard</h1>
      <p>Tinjauan pengunjung harian</p>
    </div>

    <!-- Stat cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon primary"><i class="bi bi-people"></i></div>
          <div class="stat-body">
            <div class="stat-value" id="stat-visit-today">—</div>
            <div class="stat-label">Kunjungan Hari Ini</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon success"><i class="bi bi-box-arrow-in-right"></i></div>
          <div class="stat-body">
            <div class="stat-value" id="stat-checkin">—</div>
            <div class="stat-label">Pengunjung Masuk</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon secondary"><i class="bi bi-box-arrow-right"></i></div>
          <div class="stat-body">
            <div class="stat-value" id="stat-checkout">—</div>
            <div class="stat-label">Pengunjung Keluar</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon info"><i class="bi bi-calendar-check"></i></div>
          <div class="stat-body">
            <div class="stat-value" id="stat-appointment">—</div>
            <div class="stat-label">Total Appointment</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart + Inventory -->
    <div class="row g-3 mb-4">
      <!-- Chart -->
      <div class="col-12 col-lg-7">
        <div class="chart-card">
          <div class="chart-card-title">Aktivitas Pengunjung Bulanan</div>
          <div id="visitor-chart"></div>
        </div>
      </div>

      <!-- Inventory cards -->
      <div class="col-12 col-lg-5">
        <div class="row g-3 h-100">
          <div class="col-12">
            <div class="inventory-card primary-card" id="card-idcard">
              <div class="inventory-card-header">
                <div class="inventory-card-icon">
                  <i class="bi bi-person-badge"></i>
                </div>
                <div class="inventory-card-title">Kartu Pengunjung</div>
              </div>
              <div class="inventory-card-stats">
                <div class="inventory-stat-item">
                  <div class="inventory-stat-label">Digunakan</div>
                  <div class="inventory-stat-value" id="idcard-used">—</div>
                </div>
                <div class="inventory-stat-item">
                  <div class="inventory-stat-label">Tersedia</div>
                  <div class="inventory-stat-value" id="idcard-available">—</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="inventory-card secondary-card" id="card-parking">
              <div class="inventory-card-header">
                <div class="inventory-card-icon">
                  <i class="bi bi-p-circle"></i>
                </div>
                <div class="inventory-card-title">Kartu Parkir</div>
              </div>
              <div class="inventory-card-stats">
                <div class="inventory-stat-item">
                  <div class="inventory-stat-label">Digunakan</div>
                  <div class="inventory-stat-value" id="parking-used">—</div>
                </div>
                <div class="inventory-stat-item">
                  <div class="inventory-stat-label">Tersedia</div>
                  <div class="inventory-stat-value" id="parking-available">—</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent visitors table -->
    <div class="table-card mb-4">
      <div class="table-card-header">
        <h6 class="table-card-title">Pengunjung Terbaru</h6>
      </div>
      <div class="table-card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Asal Perusahaan</th>
              <th>Waktu Masuk</th>
              <th>Tujuan</th>
              <th>Karyawan Dituju</th>
            </tr>
          </thead>
          <tbody id="tbody-recent">
            <tr><td colspan="6" class="table-empty">Memuat data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Active checkins table -->
    <div class="table-card mb-4">
      <div class="table-card-header">
        <h6 class="table-card-title">Pengunjung Masih Check-in</h6>
      </div>
      <div class="table-card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Asal Perusahaan</th>
              <th>Waktu Check-in</th>
              <th>Tujuan</th>
              <th>Karyawan Dituju</th>
            </tr>
          </thead>
          <tbody id="tbody-active">
            <tr><td colspan="6" class="table-empty">Memuat data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Card inventory click → navigate
  setTimeout(() => {
    document.getElementById("card-idcard")?.addEventListener("click", () => {
      window.location.hash = "/id-card";
    });
    document.getElementById("card-parking")?.addEventListener("click", () => {
      window.location.hash = "/parking-card";
    });
    loadData();
  }, 0);

  return el;
}
