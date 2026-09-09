// src/services/company.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchCompanies() {
  const res = await fetch(`${BASE_URL}/api/companies`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data perusahaan");

  // console.log("test", await res.json());
  return res.json();
}

export async function fetchCompanyById(id) {
  const res = await fetch(`${BASE_URL}/api/companies/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data perusahaan");
  return res.json();
}

export async function createCompany({ name, address }) {
  const res = await fetch(`${BASE_URL}/api/companies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, address }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function updateCompany(id, { name, address }) {
  const res = await fetch(`${BASE_URL}/api/companies/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name, address }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function deleteCompany(id) {
  const res = await fetch(`${BASE_URL}/api/companies/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
