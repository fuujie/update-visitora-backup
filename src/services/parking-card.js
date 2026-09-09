//src/services/parking-card.js
const BASE_URL = import.meta.env.VITE_API_URL;
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchParkingCard() {
  const res = await fetch(`${BASE_URL}/api/parking-cards`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data kartu parkir");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function createParkingCard() {
  const res = await fetch(`${BASE_URL}/api/parking-cards`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat kartu parkir");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function updateParkingCard(id, payload) {
  const res = await fetch(`${BASE_URL}/api/parking-cards/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal memperbarui kartu parkir");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function deleteParkingCard(id) {
  const res = await fetch(`${BASE_URL}/api/parking-cards/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Gagal menghapus kartu parkir");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}
