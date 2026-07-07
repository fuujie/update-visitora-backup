//src/services/visitor-card.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchVisitorCardTypes() {
  const res = await fetch(`${BASE_URL}/api/id-card-types`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil jenis kartu");
  // return res.json();
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function fetchVisitorCard() {
  const res = await fetch(`${BASE_URL}/api/id-cards`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data kartu pengunjung");
  const data = await res.json();
  console.log(data);
  return data;
}

export async function createVisitorCard(payload) {
  const res = await fetch(`${BASE_URL}/api/id-cards`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat kartu pengunjung");
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function updateVisitorCard(id, payload) {
  const res = await fetch(`${BASE_URL}/api/id-cards/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal memperbarui kartu pengunjung");
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function deleteVisitorCard(id) {
  const res = await fetch(`${BASE_URL}/api/id-cards/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Gagal menghapus kartu pengunjung");
  const data = await res.json();
  return { ok: res.ok, data };
}
