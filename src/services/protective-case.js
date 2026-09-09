//src/services/protective-case.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchProtectiveCase() {
  const res = await fetch(`${BASE_URL}/api/protective-case`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambi data protective case");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function createProtectiveCase() {
  const res = await fetch(`${BASE_URL}/api/protective-case`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat data protective case");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function updateProtectiveCase(id, payload) {
  const res = await fetch(`${BASE_URL}/api/protective-case`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal edit data protective case");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function deleteProtectiveCase(id) {
  const res = await fetch(`${BASE_URL}/api/protective-case`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Data protective case gagal dihapus");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}
