import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout";
import "../assets/css/visitor-checkin.css";

// CONTENT
function visitorCheckoutContent() {
  const page = document.createElement("div");
  page.innerHTML = ``;
}

export function CheckoutPage() {
  return DashboardLayout(visitorCheckoutContent);
}
