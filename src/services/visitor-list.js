//services/visitor-list
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

// list visitor menggunakan pagination
const currentPages = 1;
export async function fetchVisitorsPages(pages) {
  try {
    const response = await fetch(`../payloadDummy/visitors.json`, { headers: authHeaders() });
    if (!response) return;

    const data = await response.json;
    console.log("ini", data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function fetchVisitors() {
  const res = await fetch(`/payloadDummy/visitors.json`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Gagal mengambil data");
  const data = await res.json();
  console.log("dari api", data);
  return data;
}

export async function fetchDetailVisitor(visitor_id) {
  const res = await fetch(`payloadDummy/visitorDetail/${visitor_id}`, {
    headers: authHeaders(),
  });
  console.log("test", await res.json());
  return res.json;
}
