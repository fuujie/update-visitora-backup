import { DashboardLayout } from "../layouts/DashboardLayout";

// CONTENT
function buildingContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
  <div>
    <h1 class="text-primary mb-3">Building Management</h1>
    <p class="text-muted">Building mapping by Area</p>
  </div>
</div>
<div class="card">
<div class="text-center py-4 text-muted">
          No data available
        </div></div>
`;

  return page;
}

export function BuildingPage() {
  return DashboardLayout(buildingContent);
}
