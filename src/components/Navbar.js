// src/components/Navbar.js

function initLanguage(container) {
  const select = container.querySelector("#navbar-lang");
  if (!select || !window.VisitoraLanguage) return;
  select.value = localStorage.getItem("visitora_language") || "id";
  select.addEventListener("change", function () {
    window.VisitoraLanguage.changeLanguage(this.value);
  });
}

function getUserInitial(name) {
  return (name || "U").charAt(0).toUpperCase();
}

function initLogout(container) {
  container.querySelector("#btn-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    window.location.hash = "/";
  });
}

export function Navbar({ onToggleSidebar } = {}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "User";

  const nav = document.createElement("nav");
  nav.className = "app-navbar";

  nav.innerHTML = `
    <!-- Kiri: toggle + brand -->
    <div class="navbar-left">
      <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle Sidebar">
        <i class="bi bi-list"></i>
      </button>
    </div>

    <!-- Kanan: lang, notif, user -->
    <div class="navbar-right">

      <!-- Language -->
      <div class="navbar-lang">
        <select id="navbar-lang">
          <option value="id">🇮🇩 ID</option>
          <option value="en">🇬🇧 EN</option>
          <option value="zh-CN">🇨🇳 CN</option>
          <option value="zh-TW">🇹🇼 TW</option>
        </select>
      </div>

      <!-- Notifikasi -->
      <button class="navbar-icon-btn" title="Notifikasi">
        <i class="bi bi-bell"></i>
        <span class="notif-badge"></span>
      </button>

      <!-- User dropdown -->
      <div class="navbar-user dropdown">
        <a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="user-avatar">${getUserInitial(name)}</div>
          <span class="user-name-text d-none d-sm-block">${name}</span>
          <i class="bi bi-chevron-down" style="font-size:0.7rem;color:var(--muted-foreground)"></i>
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item" href="#/profile">
              <i class="bi bi-person"></i> Profil
            </a>
          </li>
          <li><hr class="dropdown-divider my-1"></li>
          <li>
            <a class="dropdown-item text-danger" href="#" id="btn-logout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </a>
          </li>
        </ul>
      </div>

    </div>
  `;

  // Sidebar toggle handler
  nav.querySelector("#sidebar-toggle").addEventListener("click", () => {
    onToggleSidebar?.();
  });

  initLanguage(nav);
  initLogout(nav);

  return nav;
}
