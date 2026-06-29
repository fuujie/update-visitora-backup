import { LoginPage } from "../pages/LoginPage.js";
import { DashboardPage } from "../pages/DashboardPage.js";
import { RegistVisitorPage } from "../pages/RegistVisitorPage.js";
import { CompanyPage } from "../pages/CompanyPage.js";

// ─── Definisi routes ────────────────────────────────────────────
const routes = {
  "/": LoginPage,
  "/dashboard": DashboardPage,
  "/regist-visitor": RegistVisitorPage,
  "/company": CompanyPage,
};

// ─── Auth guard ─────────────────────────────────────────────────
// Halaman yang butuh login untuk diakses
const protectedRoutes = ["/dashboard"];

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// ─── Ambil path dari hash ────────────────────────────────────────
// contoh: "/#/dashboard" → "/dashboard"
function getPath() {
  return window.location.hash.slice(1) || "/";
}

// ─── Render halaman ─────────────────────────────────────────────
async function render() {
  const path = getPath();

  // Cek auth guard — kalau belum login, redirect ke '/'
  if (protectedRoutes.includes(path) && !isAuthenticated()) {
    window.location.hash = "/";
    return;
  }

  // Kalau sudah login tapi buka halaman login, langsung ke dashboard
  if (path === "/" && isAuthenticated()) {
    window.location.hash = "/dashboard";
    return;
  }

  const Page = routes[path];
  const app = document.getElementById("app");

  if (!Page) {
    app.innerHTML = '<h2 style="padding:40px;text-align:center">404 - Halaman tidak ditemukan</h2>';
    return;
  }

  app.innerHTML = "";
  // app.appendChild(Page());

  const el = await Page();
  app.appendChild(el);
}

// ─── Init router ─────────────────────────────────────────────────
export function initRouter() {
  // Render ulang setiap kali hash berubah
  window.addEventListener("hashchange", render);

  // Render pertama kali saat app dibuka
  render();
}
