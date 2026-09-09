//src/services/sticker-block.js
const BASE_URL = import.meta.env.VITE_API_URL;
function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchStickerBlock() {
  const res = await fetch(`${BASE_URL}/api/sticker-block`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data sticker block");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function createStickerBlock() {
  const res = await fetch(`${BASE_URL}/api/sticker-block`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat data sticker");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function updateStickerBlock(id, payload) {
  const res = await fetch(`${BASE_URL}/api/sticker-block`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal edit data sticker");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}

export async function deleteStickerBlock(id) {
  const res = await fetch(`${BASE_URL}/api/sticker-block`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Data sticker gagal dihapus");
  const data = await res.json();
  console.log(data);
  return { ok: res.ok, data };
}
