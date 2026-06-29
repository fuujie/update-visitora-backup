// src/components/Sidebar.js

const MENU = {
  visitor: [
    {
      label: "Menu",
      items: [
        { href: "#/", icon: "bi-house", text: "Dashboard" },
        {
          icon: "bi-calendar-check",
          text: "Data Kunjungan",
          submenu: [
            { href: "#/regist-visitor", text: "Registrasi Pengunjung" },
            { href: "#/visitor", text: "Pengunjung" },
            { href: "#/visiting-schedule", text: "Jadwal Kunjungan" },
          ],
        },
        { href: "#/history", icon: "bi-clock-history", text: "Riwayat Kunjungan" },
      ],
    },
  ],

  security: [
    {
      label: "Menu",
      items: [
        { href: "#/", icon: "bi-house", text: "Dashboard" },
        {
          icon: "bi-person-check",
          text: "Kunjungan",
          submenu: [
            { href: "#/visitor-checkin", text: "Pengunjung Masuk" },
            { href: "#/visitor-checkout", text: "Pengunjung Keluar" },
          ],
        },
        {
          icon: "bi-folder2",
          text: "Data Kunjungan",
          submenu: [
            { href: "#/regist-visitor", text: "Registrasi Pengunjung" },
            { href: "#/visitor", text: "Pengunjung" },
            { href: "#/visiting-schedule", text: "Jadwal Kunjungan" },
            { href: "#/data-checkin", text: "Data Check-in" },
          ],
        },
        { href: "#/history", icon: "bi-clock-history", text: "Riwayat Kunjungan" },
      ],
    },
    {
      label: "Inventaris",
      items: [
        {
          icon: "bi-archive",
          text: "Inventaris",
          submenu: [
            { href: "#/id-card", text: "Kartu ID" },
            { href: "#/parking-card", text: "Kartu Parkir" },
            { href: "#/sticker-block", text: "Blok Stiker" },
            { href: "#/protective-case", text: "Case Pelindung" },
          ],
        },
      ],
    },
  ],

  admin: [
    {
      label: "Menu",
      items: [
        { href: "#/", icon: "bi-house", text: "Dashboard" },
        {
          icon: "bi-person-check",
          text: "Kunjungan",
          submenu: [
            { href: "#/visitor-checkin", text: "Pengunjung Masuk" },
            { href: "#/visitor-checkout", text: "Pengunjung Keluar" },
          ],
        },
        {
          icon: "bi-folder2",
          text: "Data Kunjungan",
          submenu: [
            { href: "#/regist-visitor", text: "Registrasi Pengunjung" },
            { href: "#/visitor", text: "Pengunjung" },
            { href: "#/visiting-schedule", text: "Jadwal Kunjungan" },
            { href: "#/data-checkin", text: "Data Check-in" },
          ],
        },
        { href: "#/history", icon: "bi-clock-history", text: "Riwayat Kunjungan" },
      ],
    },
    {
      label: "Inventaris",
      items: [
        {
          icon: "bi-archive",
          text: "Inventaris",
          submenu: [
            { href: "#/id-card", text: "Kartu ID" },
            { href: "#/parking-card", text: "Kartu Parkir" },
            { href: "#/sticker-block", text: "Blok Stiker" },
            { href: "#/protective-case", text: "Case Pelindung" },
          ],
        },
      ],
    },
    {
      label: "Pengaturan",
      items: [
        {
          icon: "bi-shield-lock",
          text: "Kontrol Akses",
          submenu: [
            { href: "#/building", text: "Gedung" },
            { href: "#/area", text: "Area" },
          ],
        },
        {
          icon: "bi-gear",
          text: "Pengaturan Aplikasi",
          submenu: [
            { href: "#/company", text: "Perusahaan" },
            { href: "#/department", text: "Departemen" },
            { href: "#/users", text: "Pengguna" },
            { href: "#/host", text: "Host" },
          ],
        },
      ],
    },
  ],
};

// ─── Render menu item ────────────────────────────────────────────
function renderItem(item, index) {
  if (item.submenu) {
    const collapseId = `submenu-${index}`;
    const subItems = item.submenu
      .map(
        (sub) => `
      <li class="sidebar-item">
        <a href="${sub.href}" class="sidebar-link">${sub.text}</a>
      </li>
    `,
      )
      .join("");

    return `
      <li class="sidebar-item">
        <button class="sidebar-link" data-bs-toggle="collapse"
          data-bs-target="#${collapseId}" aria-expanded="false">
          <i class="bi ${item.icon}"></i>
          <span>${item.text}</span>
          <i class="bi bi-chevron-down chevron"></i>
        </button>
        <div class="collapse" id="${collapseId}">
          <ul class="sidebar-submenu">${subItems}</ul>
        </div>
      </li>
    `;
  }

  return `
    <li class="sidebar-item">
      <a href="${item.href}" class="sidebar-link">
        <i class="bi ${item.icon}"></i>
        <span>${item.text}</span>
      </a>
    </li>
  `;
}

// ─── Render menu group ───────────────────────────────────────────
function renderGroup(group, groupIndex) {
  const items = group.items.map((item, i) => renderItem(item, `${groupIndex}-${i}`)).join("");

  return `
    <div class="sidebar-label">${group.label}</div>
    <ul class="list-unstyled mb-0">${items}</ul>
  `;
}

// ─── Active link highlight ───────────────────────────────────────
function setActiveLink(sidebar) {
  const currentHash = window.location.hash || "#/";
  sidebar.querySelectorAll(".sidebar-link[href]").forEach((link) => {
    if (link.getAttribute("href") === currentHash) {
      link.classList.add("active");
      // Buka submenu parent kalau ada
      const collapse = link.closest(".collapse");
      if (collapse) {
        collapse.classList.add("show");
        const toggle = sidebar.querySelector(`[data-bs-target="#${collapse.id}"]`);
        toggle?.setAttribute("aria-expanded", "true");
      }
    }
  });
}

// ─── Update chevron saat collapse toggle ────────────────────────
function initCollapseChevron(sidebar) {
  sidebar.querySelectorAll('[data-bs-toggle="collapse"]').forEach((btn) => {
    const target = sidebar.querySelector(btn.dataset.bsTarget);
    if (!target) return;

    target.addEventListener("show.bs.collapse", () => btn.setAttribute("aria-expanded", "true"));
    target.addEventListener("hide.bs.collapse", () => btn.setAttribute("aria-expanded", "false"));
  });
}

// ─── Export: Sidebar ─────────────────────────────────────────────
export function Sidebar() {
  const role = localStorage.getItem("userRole") || "visitor";
  const groups = MENU[role] || MENU.visitor;

  const sidebar = document.createElement("aside");
  sidebar.className = "app-sidebar";

  sidebar.innerHTML = `
    <!-- Brand -->
    <div class="sidebar-brand">
      <img src="/images/visitora-logo1.png" alt="Visitora" />
    </div>

    <!-- Menu -->
    <div class="sidebar-body">
      ${groups.map((group, i) => renderGroup(group, i)).join("")}
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <img src="/images/STG-update2.png" alt="STG" />
      <span>PT. Shoetown Ligung Indonesia</span>
    </div>
  `;

  setTimeout(() => {
    setActiveLink(sidebar);
    initCollapseChevron(sidebar);
  }, 0);

  return sidebar;
}
