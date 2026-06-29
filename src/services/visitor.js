// src/services/visitor.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchCardTypes() {
  const res = await fetch(`${BASE_URL}/api/card-types`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil jenis identitas");
  return res.json();
}

export async function fetchCompanies() {
  const res = await fetch(`${BASE_URL}/api/companies`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data perusahaan");
  return res.json();
}

export async function fetchCompanyById(id) {
  const res = await fetch(`${BASE_URL}/api/companies/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data perusahaan");
  return res.json();
}

// POST multipart/form-data — jangan set Content-Type, browser handle boundary
export async function createVisitor(formData) {
  const res = await fetch(`${BASE_URL}/api/visitors`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
