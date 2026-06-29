// src/layouts/DashboardLayout.js
// Layout wrapper untuk semua halaman yang butuh navbar + sidebar
import { Navbar } from "../components/Navbar.js";
import { Sidebar } from "../components/Sidebar.js";
import "../assets/css/dashboard.css";
import "../assets/css/dashboard-content.css";

function initSidebarToggle(wrapper) {
  const overlay = wrapper.querySelector(".sidebar-overlay");
  let isCollapsed = window.innerWidth < 768;

  function updateState() {
    wrapper.classList.toggle("sidebar-collapsed", isCollapsed);
    overlay?.classList.toggle("active", !isCollapsed && window.innerWidth < 768);
  }

  function toggle() {
    isCollapsed = !isCollapsed;
    updateState();
  }

  overlay?.addEventListener("click", () => {
    isCollapsed = true;
    updateState();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) overlay?.classList.remove("active");
  });

  updateState();
  return toggle;
}

// contentFn = fungsi yang return elemen konten halaman
export function DashboardLayout(contentFn) {
  document.body.className = "";

  const wrapper = document.createElement("div");
  wrapper.className = "dashboard-wrapper";

  // Render konten
  const content = typeof contentFn === "function" ? contentFn() : contentFn;

  wrapper.innerHTML = `
    <div class="sidebar-overlay"></div>
    <div class="main-content">
      <div class="content-inner"></div>
      <div class="content-footer">
        &copy; ${new Date().getFullYear()} J2 SDI
      </div>
    </div>
  `;

  wrapper.querySelector(".content-inner").appendChild(content);
  wrapper.prepend(Sidebar());

  const toggleFn = initSidebarToggle(wrapper);
  wrapper.prepend(Navbar({ onToggleSidebar: toggleFn }));

  return wrapper;
}
