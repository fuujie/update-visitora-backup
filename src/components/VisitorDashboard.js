// src/components/VisitorDashboard.js
import { fetchProfile, fetchVisitorSchedules, fetchLastCheckout, fetchMonthlyAppointmentCount } from "../services/dashboard.js";

// ─── Live clock ──────────────────────────────────────────────────
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function startClock() {
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    const timeEl = document.getElementById("clock-time");
    const dateEl = document.getElementById("clock-date");
    if (timeEl) timeEl.textContent = `${hh}:${mm}`;
    if (dateEl) dateEl.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }
  tick();
  return setInterval(tick, 1000);
}

// ─── Format tanggal ──────────────────────────────────────────────
function fmtDate(raw) {
  if (!raw) return "-";
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d)) return raw;
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

function fmtDateTime(raw) {
  if (!raw) return "-";
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d)) return raw;
  return `${fmtDate(raw)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── Load data visitor ───────────────────────────────────────────
async function loadData() {
  try {
    const profile = await fetchProfile();
    const user = profile.user;
    const visitorId = user.visitor_id || null;

    setEl("greeting-name", user.name || "Visitor");

    // Jadwal terakhir
    try {
      const res = await fetchVisitorSchedules(visitorId);
      const schedules = (res.schedules || []).sort((a, b) => new Date(b.plan_checkin) - new Date(a.plan_checkin));
      const last = schedules[0];

      setEl("last-appt-purpose", last?.purpose || "-");
      setEl("last-appt-host", last?.host_name || "-");
      setEl("last-appt-date", fmtDate(last?.plan_checkin));
    } catch (e) {
      console.warn("Schedule:", e.message);
    }

    // Checkout terakhir
    try {
      if (visitorId) {
        const res = await fetchLastCheckout(visitorId);
        const last = (res.checkins || []).find((c) => c.is_checkout);

        setEl("last-checkout-type", last?.visitor_type || "-");
        setEl("last-checkout-vehicle", last?.type_vehicle || "-");
        setEl("last-checkout-plate", last?.number_plate || "-");
        setEl("last-checkout-time", fmtDateTime(last?.checkout_time));
      }
    } catch (e) {
      console.warn("Checkout:", e.message);
    }

    // Total janji bulan ini
    try {
      if (visitorId) {
        const res = await fetchMonthlyAppointmentCount(visitorId);
        setEl("monthly-total", res.count ?? 0);
      }
    } catch (e) {
      console.warn("Monthly:", e.message);
    }
  } catch (e) {
    console.error("Visitor data:", e);
    if (e.message?.includes("401")) {
      localStorage.removeItem("token");
      window.location.hash = "/";
    }
  }
}

// ─── Terms & Conditions content ──────────────────────────────────
const TERMS_ID = `
<p>Dengan memberikan data pribadi kepada PT Shoetown Ligung Indonesia, pengguna dianggap telah membaca, memahami, dan menyetujui syarat dan ketentuan berikut:</p>
<br>
<strong>Ketentuan Kunjungan:</strong>
<ol>
  <li>Pengunjung hanya diperbolehkan memasuki area perusahaan untuk keperluan resmi dan dengan seizin pihak yang berwenang.</li>
  <li>Pengunjung wajib melakukan registrasi di pos keamanan sebelum masuk ke area perusahaan.</li>
  <li>Pengunjung akan diberikan Visitor ID Card dan wajib dikenakan selama berada di dalam area perusahaan.</li>
  <li>Perangkat elektronik harus disegel atau menggunakan protective case.</li>
  <li>Pengunjung dilarang mengambil foto atau video tanpa izin resmi dari pihak perusahaan.</li>
  <li>Pengunjung saat masuk ke area wajib didampingi oleh personel perusahaan.</li>
  <li>Pengunjung wajib mematuhi seluruh prosedur keamanan yang berlaku.</li>
  <li>Seluruh area diawasi oleh sistem CCTV selama 24 jam.</li>
</ol>
`;

// ─── Export ──────────────────────────────────────────────────────
export function VisitorDashboard() {
  const el = document.createElement("div");
  el.innerHTML = `
    <!-- Greeting + Clock -->
    <div class="greeting-card mb-4">
      <div class="d-flex justify-content-between flex-wrap gap-3">
        <div>
          <h2>Halo, <span id="greeting-name">...</span></h2>
          <p class="greeting-sub mb-0">Silahkan lakukan Registrasi atau membuat janji kunjungan untuk visit ke PT Shoetown Ligung Indonesia</p>
        </div>
        <div class="clock-display">
          <div class="clock-time" id="clock-time">--:--:--</div>
          <div class="clock-date" id="clock-date">--</div>
        </div>
      </div>
    </div>

    <!-- 3 Info Cards -->
    <div class="row g-3 mb-4">

      <!-- Janji terakhir -->
      <div class="col-12 col-sm-6 col-lg-5">
        <div class="info-card">
          <div class="info-card-header">
            <i class="bi bi-calendar-event"></i>
            <span>Janji Kunjungan Terakhir</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Tujuan</span>
            <span class="info-value" id="last-appt-purpose">-</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Karyawan Dituju</span>
            <span class="info-value" id="last-appt-host">-</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Tanggal</span>
            <span class="info-value" id="last-appt-date">-</span>
          </div>
        </div>
      </div>

      <!-- Checkout terakhir -->
      <div class="col-12 col-sm-6 col-lg-5">
        <div class="info-card">
          <div class="info-card-header">
            <i class="bi bi-clock-history"></i>
            <span>Checkout Terakhir</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Jenis Visitor</span>
            <span class="info-value" id="last-checkout-type">-</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Kendaraan</span>
            <span class="info-value" id="last-checkout-vehicle">-</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Plat Nomor</span>
            <span class="info-value" id="last-checkout-plate">-</span>
          </div>
          <div class="info-card-row">
            <span class="info-label">Waktu</span>
            <span class="info-value" id="last-checkout-time">-</span>
          </div>
        </div>
      </div>

      <!-- Total janji bulan ini -->
      <div class="col-12 col-lg-2">
        <div class="total-card">
          <i class="bi bi-graph-up"></i>
          <div class="total-card-value" id="monthly-total">0</div>
          <div class="total-card-label">Janji bulan ini</div>
        </div>
      </div>
    </div>

    <!-- Terms & Conditions -->
    <div class="terms-card mb-4">
      <h5><i class="bi bi-shield-check me-2"></i>Syarat dan Ketentuan</h5>
      <div class="terms-content">${TERMS_ID}</div>
    </div>
  `;

  // Start clock & load data
  let clockInterval;
  setTimeout(() => {
    clockInterval = startClock();
    loadData();
  }, 0);

  // Cleanup clock saat navigasi
  window.addEventListener(
    "hashchange",
    () => {
      clearInterval(clockInterval);
    },
    { once: true },
  );

  return el;
}
