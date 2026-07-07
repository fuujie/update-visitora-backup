// src/services/department.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchDepartments() {
  const res = await fetch(`${BASE_URL}/api/departments`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data departemen");
  return res.json();
}

export async function fetchDepartmentById(id) {
  const res = await fetch(`${BASE_URL}/api/departments/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data departemen");
  return res.json();
}

export async function createDepartment({ name, company_id }) {
  const res = await fetch(`${BASE_URL}/api/departments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, company_id }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function updateDepartment(id, { name, company_id }) {
  const res = await fetch(`${BASE_URL}/api/departments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name, company_id }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function deleteDepartment(id) {
  const res = await fetch(`${BASE_URL}/api/departments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
