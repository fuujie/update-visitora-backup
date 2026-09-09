// src/pages/LoginPage.js
import Swal from "sweetalert2";

import { loginUser } from "../services/auth.js";
import "../assets/css/login.css";

// ─── Helper terjemahan ───────────────────────────────────────────
function t(key) {
  return window.VisitoraLanguage?.getTranslation(key) ?? key;
}

// ─── Password toggle ─────────────────────────────────────────────
function initPasswordToggle(container) {
  container.querySelectorAll(".pwd-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = container.querySelector(`#${btn.dataset.target}`);
      const icon = btn.querySelector("i");
      const isHidden = input.type === "password";

      input.type = isHidden ? "text" : "password";
      icon.className = isHidden ? "bi bi-eye" : "bi bi-eye-slash";
    });
  });
}

// ─── Language selector ───────────────────────────────────────────
function initLanguage(container) {
  const select = container.querySelector("#lang-select");
  if (!select || !window.VisitoraLanguage) return;

  select.value = localStorage.getItem("visitora_language") || "id";
  window.VisitoraLanguage.applyTranslations();

  select.addEventListener("change", function () {
    window.VisitoraLanguage.changeLanguage(this.value);
  });
}

// ─── Error handler ───────────────────────────────────────────────
const ERROR_MAP = {
  "Email dan password harus diisi": "email_password_required",
  "Email tidak ditemukan": "email_not_found",
  "Password salah": "incorrect_password",
  "Email atau password salah": "incorrect_password",
};

function buildErrorHTML(data) {
  const raw = (data?.messages?.error || "").trim();
  const key = ERROR_MAP[raw];
  const msg = key ? t(key) || raw : raw || t("login_failed") || "Login gagal.";

  let html = `<p>${msg}</p>`;

  if (data?.attempts_left > 0) {
    html += `
      <div class="alert alert-warning mt-2 py-2">
        <small>${t("try_again")}</small>
        <div class="fw-bold fs-5 text-danger">${data.attempts_left}x</div>
      </div>`;
  } else if (data?.retry_after) {
    const m = Math.floor(data.retry_after / 60);
    const s = data.retry_after % 60;
    const fmt = m > 0 ? `${m} menit ${s} detik` : `${s} detik`;
    html += `
      <div class="alert alert-danger mt-2 py-2">
        <small>${t("try_later")}</small>
        <div class="fw-bold fs-5 text-danger">${fmt}</div>
      </div>`;
  }

  return html;
}

// ─── Login handler ───────────────────────────────────────────────
function initLoginHandler(container) {
  const btn = container.querySelector("#btn-login");

  btn.addEventListener("click", async () => {
    const email = container.querySelector("#username").value.trim();
    const password = container.querySelector("#password").value;

    if (!email || !password) {
      Swal.fire({ title: t("empty_fields_error"), icon: "warning", draggable: true });
      return;
    }

    // Loading state
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${t("processing") || "Memproses..."}`;

    try {
      const { ok, data } = await loginUser(email, password);

      if (ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role);

        await Swal.fire({
          title: t("Login in..") || "Login in..",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.hash = "/dashboard";
      } else {
        Swal.fire({
          title: t("login_failed") || "Login Gagal",
          html: buildErrorHTML(data),
          icon: "warning",
          draggable: true,
        });
        container.querySelector("#password").value = "";
        container.querySelector("#username").focus();
      }
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        title: t("network_error") || "Koneksi Gagal",
        text: "Periksa koneksi internet kamu.",
        icon: "error",
        draggable: true,
      });
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });

  // Enter key shortcut
  container.querySelector("#password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });
}

// ─── Export: LoginPage ───────────────────────────────────────────
export function LoginPage() {
  document.body.className = "login-page";

  const page = document.createElement("div");
  page.className = "login-wrapper";

  page.innerHTML = `
    <!-- Language -->
    <div class="login-lang">
      <select id="lang-select">
        <option value="id">🇮🇩 Indonesia</option>
        <option value="en">🇬🇧 English</option>
        <option value="zh-CN">🇨🇳 简体中文</option>
        <option value="zh-TW">🇹🇼 繁體中文</option>
      </select>
    </div>

    <!-- Logo -->
    <div class="login-logo">
      <img src="images/visitora-logo-white.png" alt="Visitora" />
    </div>

    <!-- Card -->
    <div class="login-card">

      <!-- Title -->
      <div class="login-title">
        <h2 data-i18n="login_title">Masuk ke Akun Anda</h2>
      </div>

      <!-- Email -->
      <div class="login-input-group">
        <i class="bi bi-person login-input-icon"></i>
        <input
          type="text"
          id="username"
          class="form-control"
          placeholder="Email"
          autocomplete="email"
          data-i18n="email_placeholder" />
      </div>

      <!-- Password -->
      <div class="login-input-group">
        <i class="bi bi-lock login-input-icon"></i>
        <input
          type="password"
          id="password"
          class="form-control"
          placeholder="Password"
          autocomplete="current-password"
          data-i18n="password_placeholder" />
        <button class="login-input-toggle pwd-toggle" data-target="password" type="button">
          <i class="bi bi-eye-slash"></i>
        </button>
      </div>

      <!-- Submit -->
      <button type="button" id="btn-login" class="btn btn-primary login-btn" data-i18n="login_button">
        Masuk
      </button>

      <!-- Footer logo -->
      <div class="login-footer">
        <img src="/images/STG-update2.png" alt="STG" />
        <div class="divider"></div>
        <img src="/images/STG-3d.png" alt="STG 3D" />
      </div>
      

      <!-- Copyright -->
        <p class="login-copyright">
          &copy; ${new Date().getFullYear()} J2 SDI
        </p>
    </div>

    
  `;

  initPasswordToggle(page);
  initLoginHandler(page);
  initLanguage(page);

  return page;
}
