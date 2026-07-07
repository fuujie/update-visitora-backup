import { LoginPage } from "../pages/LoginPage.js";
import { DashboardPage } from "../pages/DashboardPage.js";
import { RegistVisitorPage } from "../pages/RegistVisitorPage.js";
import { CompanyPage } from "../pages/CompanyPage.js";
import { DepartmentPage } from "../pages/DepartmentPage.js";
import { UserPage } from "../pages/UserPage.js";
import { HostPage } from "../pages/HostPage.js";
import { VisitorCardPage } from "../pages/VisitorCardPage.js";

// ─── Definisi routes ────────────────────────────────────────────
const routes = {
  "/": LoginPage,
  "/dashboard": DashboardPage,
  "/regist-visitor": RegistVisitorPage,
  "/company": CompanyPage,
  "/department": DepartmentPage,
  "/users": UserPage,
  "/host": HostPage,
  "/id-card": VisitorCardPage,
};

// ─── Auth guard ─────────────────────────────────────────────────
const protectedRoutes = ["/dashboard", "/regist-visitor", "/company", "/department", "/users", "/host", "/id-card"];

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function getPath() {
  return window.location.hash.slice(1) || "/";
}

function render() {
  const path = getPath();

  if (protectedRoutes.includes(path) && !isAuthenticated()) {
    window.location.hash = "/";
    return;
  }

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
  app.appendChild(Page());
}

export function initRouter() {
  window.addEventListener("hashchange", render);
  render();
}
