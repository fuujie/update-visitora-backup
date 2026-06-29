// src/services/dashboard.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ─── Profile ─────────────────────────────────────────────────────
export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/api/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil profil: " + res.status);
  return res.json();
}

// ─── Admin/Security dashboard ────────────────────────────────────
export async function fetchVisitorStats(date) {
  const res = await fetch(`${BASE_URL}/api/visitor-checkins?date=${date}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data visitor: " + res.status);
  return res.json();
}

export async function fetchTotalAppointments(date) {
  const res = await fetch(`${BASE_URL}/api/appointments?date=${date}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil appointment: " + res.status);
  return res.json();
}

export async function fetchIdCardStatus() {
  const res = await fetch(`${BASE_URL}/api/id-cards/status`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil status ID card: " + res.status);
  return res.json();
}

export async function fetchParkingStatus() {
  const res = await fetch(`${BASE_URL}/api/parking-spots/status`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil status parkir: " + res.status);
  return res.json();
}

export async function fetchRecentVisitors() {
  const res = await fetch(`${BASE_URL}/api/visitors/recent`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil recent visitors: " + res.status);
  return res.json();
}

export async function fetchActiveCheckins() {
  const res = await fetch(`${BASE_URL}/api/visitor-checkins`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil active checkins: " + res.status);
  return res.json();
}

export async function fetchVisitorChart() {
  const res = await fetch(`${BASE_URL}/api/visitors/monthly`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data chart: " + res.status);
  return res.json();
}

// ─── Visitor dashboard ───────────────────────────────────────────
export async function fetchVisitorSchedules(visitorId) {
  const url = visitorId ? `${BASE_URL}/api/visitor-schedules?visitor_id=${visitorId}` : `${BASE_URL}/api/visitor-schedules`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil jadwal: " + res.status);
  return res.json();
}

export async function fetchLastCheckout(visitorId) {
  const res = await fetch(`${BASE_URL}/api/visitor-checkins?visitor_id=${visitorId}&type=checkout&limit=1`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil checkout terakhir: " + res.status);
  return res.json();
}

export async function fetchMonthlyAppointmentCount(visitorId) {
  const res = await fetch(`${BASE_URL}/api/visitor-schedules/monthly-count?visitor_id=${visitorId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil monthly count: " + res.status);
  return res.json();
}
