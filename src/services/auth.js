const BASE_URL = import.meta.env.VITE_API_URL;

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export async function registerUser({ name, email, password, role = "visitor" }) {
  const response = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}
