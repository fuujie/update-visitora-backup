// src/pages/DashboardPage.js
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { AdminDashboard } from "../components/AdminDashboard.js";
import { VisitorDashboard } from "../components/VisitorDashboard.js";

function DashboardContent() {
  const role = localStorage.getItem("userRole") || "visitor";
  return role === "admin" || role === "security" ? AdminDashboard() : VisitorDashboard();
}

export function DashboardPage() {
  return DashboardLayout(DashboardContent);
}
