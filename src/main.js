import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/500.css"; // Medium
import "@fontsource/inter/600.css"; // SemiBold
import "@fontsource/inter/700.css"; // Bold
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/css/global.css";
import "simple-datatables/dist/style.css";
import "./assets/css/datatable-company.css";

import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;
import { initRouter } from "./router/index.js";

initRouter();
