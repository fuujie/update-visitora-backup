// src/services/host.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchHosts() {
  const res = await fetch(`${BASE_URL}/api/hosts`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data host");
  return res.json();
}

export async function fetchHostById(id) {
  const res = await fetch(`${BASE_URL}/api/hosts/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data host dengan ID: " + id);
  return res.json();
}

// Cascading dropdown: department berdasarkan company
export async function fetchDepartmentsByCompany(companyId) {
  const res = await fetch(`${BASE_URL}/api/companies/${companyId}/departments`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data departemen");
  return res.json();
}

export async function createHost(payload) {
  const res = await fetch(`${BASE_URL}/api/hosts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function updateHost(id, payload) {
  const res = await fetch(`${BASE_URL}/api/hosts/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function deleteHost(id) {
  const res = await fetch(`${BASE_URL}/api/hosts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
