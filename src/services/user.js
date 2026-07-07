// src/services/user.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/api/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data pengguna");
  return res.json();
}

export async function fetchUserById(id) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data pengguna");
  return res.json();
}

export async function createUser(payload) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function updateUser(id, payload) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
