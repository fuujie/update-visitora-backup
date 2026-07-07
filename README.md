# VISITORA — Visitor Management System

## Project Migration Documentation

> **Status:** In Progress — SPA Migration dari multi-HTML ke Vite + Vanilla JS

---

## Tech Stack

### Frontend

| Tech                 | Keterangan                  |
| -------------------- | --------------------------- |
| Vite                 | Bundler                     |
| Vanilla JS (ES2022+) | No framework                |
| Bootstrap 5          | CSS + JS (via npm)          |
| Bootstrap Icons      | Icon library (via npm)      |
| Inter font           | @fontsource/inter (via npm) |
| SweetAlert2          | Notifikasi (via npm)        |
| ApexCharts           | Chart (via npm)             |
| simple-datatables    | Tabel interaktif (via npm)  |

### Backend (Dummy)

| Tech                 | Keterangan              |
| -------------------- | ----------------------- |
| CodeIgniter 4.7.3    | PHP framework           |
| MySQL 3307 via XAMPP | Database ✅ sudah setup |
| PHP 8.2              | Runtime                 |

---

## Cara Jalankan

### Frontend

```bash
cd update_visitora
npm install
npm run dev
# → http://localhost:5173
```

### Backend Dummy (CI4)

```bash
cd update_visitora_be_dummy
php spark serve
# → http://localhost:8080
```

> ⚠️ Pastikan XAMPP MySQL sudah running sebelum jalankan spark serve

### File `.env` Frontend

```
VITE_API_URL=http://localhost:8080
```

### File `.env` Backend (CI4)

```
CI_ENVIRONMENT = development

database.default.hostname = localhost
database.default.database = db_visitora_dev
database.default.username = root
database.default.password =
database.default.DBDriver = MySQLi
database.default.DBPrefix =
database.default.port     = 3307
```

---

## Struktur Folder

```
update_visitora/                    ← root project frontend
├── public/
│   └── images/                     ← aset gambar (logo, background, dll)
├── src/
│   ├── assets/css/
│   │   ├── global.css              ← design token + reset + Bootstrap override
│   │   ├── login.css               ← halaman login
│   │   ├── dashboard.css           ← layout navbar + sidebar
│   │   └── dashboard-content.css   ← widget, card, tabel dashboard
│   ├── layouts/
│   │   └── DashboardLayout.js      ← wrapper layout (navbar + sidebar)
│   ├── components/
│   │   ├── Navbar.js               ← navbar: toggle, user dropdown, logout
│   │   ├── Sidebar.js              ← sidebar collapsible, menu per role
│   │   ├── AdminDashboard.js       ← konten dashboard admin/security
│   │   └── VisitorDashboard.js     ← konten dashboard visitor
│   ├── pages/
│   │   ├── LoginPage.js            ← ✅ selesai
│   │   ├── DashboardPage.js        ← ✅ selesai
│   │   ├── RegistVisitorPage.js    ← 🚧 WIP
│   │   |-- CompanyPage.js          ← selesai
|   |   |-- DepartmentPage.js       ← selesai
|   |   |-- UserPage.js             ← selesai
|   |   |-- HostPage.js             ← selesai
|   |   |-- VisitorCardPage.js      ← WIP
│   ├── services/
│   │   ├── auth.js                 ← login, register
│   │   ├── dashboard.js            ← fetch data dashboard
│   │   ├── visitor.js              ← CRUD visitor
│   │   └── company.js              ← CRUD perusahaan
│   ├── router/
│   │   └── index.js                ← hash-based routing
│   └── main.js                     ← entry point
├── index.html
├── .env
├── vite.config.js
└── package.json

update_visitora_be_dummy/           ← root project backend CI4
├── app/
│   ├── Controllers/Api/
│   │   ├── AuthController.php      ← login, register
│   │   └── VisitorController.php   ← companies, card-types, visitors
│   ├── Database/
│   │   ├── Migrations/
│   │   │   └── CreateAllTables.php ← ✅ sudah dijalankan
│   │   └── Seeds/
│   │       └── DatabaseSeeder.php  ← 🚧 WIP
│   └── Config/
│       ├── Routes.php
│       ├── Cors.php
│       └── Filters.php
└── .env
```

---

## Design Tokens (Figma)

```css
--primary: #3852b4 /* biru utama — button, sidebar, accent */ --secondary: #e87f24 /* oranye — secondary button, badge */ --muted: #e8e7e3 /* background muted */ --card: #ffffff /* background card */ --sidebar: #2a3d8f
  /* sidebar (turunan primary) */;
```

---

## Database (db_visitora_dev)

### Tabel yang sudah dibuat ✅

```
company               ← perusahaan
departments           ← departemen
users                 ← login & auth
types_card            ← jenis identitas (KTP, SIM, dll)
hosts                 ← karyawan yang bisa dikunjungi
visitors              ← data pengunjung
id_cards              ← inventory kartu ID
parking_spots         ← inventory kartu parkir
protection_case       ← inventory case pelindung
protection_sticker    ← inventory stiker
buildings             ← gedung
areas                 ← area per gedung
visitor_schedule      ← jadwal/appointment kunjungan
visitor_checkin       ← transaksi masuk/keluar
visitor_group_member  ← anggota kunjungan grup
device                ← perangkat elektronik saat checkin
visitor_checkin_log   ← log history checkin
```

### Seed data yang dibutuhkan

```
users         ← admin, security, visitor (untuk login)
company       ← minimal 1 perusahaan (PT. Shoetown Ligung Indonesia)
departments   ← beberapa departemen
types_card    ← KTP, SIM, Passport, dll
hosts         ← beberapa karyawan
id_cards      ← beberapa kartu ID
parking_spots ← beberapa kartu parkir
```

---

## Routing (Hash-based)

```
✅ #/                  → LoginPage
✅ #/dashboard         → DashboardPage (AdminDashboard / VisitorDashboard by role)
🚧 #/regist-visitor    → RegistVisitorPage
🚧 #/company           → CompanyPage
⬜ #/department        → DepartmentPage
⬜ #/users             → UsersPage
⬜ #/host              → HostPage
⬜ #/id-card           → IdCardPage
⬜ #/parking-card      → ParkingCardPage
⬜ #/sticker-block     → StickerBlockPage
⬜ #/protective-case   → ProtectiveCasePage
⬜ #/visitor           → VisitorPage
⬜ #/visiting-schedule → VisitingSchedulePage
⬜ #/data-checkin      → DataCheckinPage
⬜ #/visitor-checkin   → VisitorCheckinPage
⬜ #/visitor-checkout  → VisitorCheckoutPage
⬜ #/history           → HistoryPage
⬜ #/building          → BuildingPage
⬜ #/area              → AreaPage
```

---

## Role System

```
admin     → akses semua fitur
security  → akses kunjungan + inventaris + data kunjungan
visitor   → akses data kunjungan sendiri + jadwal
```

Auth guard di `src/router/index.js`:

- Route dilindungi → cek `localStorage.getItem('token')`
- Belum login → redirect ke `#/`
- Sudah login buka login page → redirect ke `#/dashboard`

---

## API Endpoints

### Auth

```
POST /api/login
  body: { email, password }
  response: { token, user: { id, name, email, role } }

POST /api/register
  body: { name, email, password, role }
```

### Dummy Users (seed)

```
admin@visitora.com    / Admin123!@#   → role: admin
security@visitora.com / Security123!  → role: security
user@visitora.com     / User123!@#    → role: visitor
```

### Companies

```
GET    /api/companies
GET    /api/companies/:id
POST   /api/companies        body: { name, address }
PUT    /api/companies/:id    body: { name, address }
DELETE /api/companies/:id
```

### Visitors

```
POST /api/visitors   (multipart/form-data)
  fields: name, id_type_card, id_number, email, phone, company_id
  files:  id_photo, selfie_photo
```

### Lainnya (belum ada endpoint)

```
GET  /api/card-types
GET  /api/departments
GET  /api/hosts
GET  /api/id-cards/status
GET  /api/parking-spots/status
GET  /api/visitors/recent
GET  /api/visitor-checkins
GET  /api/visitor-schedules
GET  /api/visitors/monthly
POST /api/visitor-checkins
PUT  /api/visitor-checkins/:id
```

---

## Pola Kode (Wajib Diikuti!)

### Halaman baru dalam dashboard

```js
// src/pages/NamaPage.js
import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchNama, createNama, updateNama, deleteNama } from "../services/nama.js";

function NamaContent() {
  const el = document.createElement("div");
  el.innerHTML = `<!-- HTML konten -->`;

  setTimeout(() => {
    // init event listeners setelah DOM ready
  }, 0);

  return el;
}

export function NamaPage() {
  return DashboardLayout(NamaContent);
}
```

### Daftarkan di router

```js
// src/router/index.js
import { NamaPage } from "../pages/NamaPage.js";

const routes = {
  // routes lain...
  "/nama-route": NamaPage,
};
```

### Service layer

```js
// src/services/nama.js
const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export async function fetchNama() {
  const res = await fetch(`${BASE_URL}/api/endpoint`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Pesan error");
  return res.json();
}

// Untuk upload file (multipart) — JANGAN set Content-Type manual
export async function uploadNama(formData) {
  const res = await fetch(`${BASE_URL}/api/endpoint`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}
```

### DataTable pattern (simple-datatables)

```js
import { DataTable } from "simple-datatables";
import "simple-datatables/dist/style.css";

let dtInstance = null;

async function loadTable(container) {
  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }

  // fetch data, render <table>, lalu:
  dtInstance = new DataTable("#table-id", {
    searchable: true,
    perPageSelect: [10, 25, 50],
    columns: [{ select: lastColIndex, sortable: false }], // kolom aksi tidak sortable
    labels: {
      placeholder: "Cari...",
      perPage: "baris per halaman", // simple-datatables versi ini tidak support {select}
      noRows: "Tidak ada data",
      info: "Menampilkan {start}-{end} dari {rows} data",
    },
  });
}
```

> **Konvensi CSS per halaman dengan DataTable:** buat file CSS terpisah per halaman
> (contoh: `src/assets/css/datatable-company.css`) agar style tidak bentrok antar
> halaman dan tetap manageable. Pattern penamaan: `datatable-{nama-halaman}.css`

---

## Progress

### ✅ Selesai

- Login Page — form login, password toggle, SweetAlert2
- Dashboard Layout — navbar, sidebar collapsible, user dropdown (custom vanilla JS, bukan Bootstrap JS)
- Admin Dashboard — stat cards, ApexCharts, inventory cards, 2 tabel (connect ke MySQL)
- Visitor Dashboard — greeting, live clock, info cards, syarat & ketentuan
- Sidebar — menu per role, collapse submenu, active link highlight
- Database — 17 tabel via CI4 Migration + Seeder lengkap
- AuthController — refactor ke MySQL, password_hash + password_verify
- DashboardController — semua endpoint stats/chart/table connect ke MySQL
- Company Page (`#/company`) — CRUD lengkap, simple-datatables, CSS terpisah

### 🚧 In Progress

- Registrasi Pengunjung (`#/regist-visitor`) — frontend done, BE butuh model Visitor + relasi MySQL

### ⬜ Belum Dibuat

**Settings:** Department, Users, Host

**Inventory:** ID Card, Parking Card, Sticker Block, Protective Case

**Main Function:** Visitor Checkin, Visitor Checkout, Data Visitor, Visiting Schedule, Data Checkin

**History:** Riwayat Kunjungan

**Access Control:** Building, Area

---

## Urutan Pengerjaan Selanjutnya

```
1. Database Seeder        ← isi data awal
2. Refactor AuthController ← konek ke MySQL (bukan dummy array)
3. Refactor VisitorController ← konek ke MySQL
4. Settings pages         ← Department, Users, Host
5. Inventory pages        ← ID Card, Parking Card, dll
6. Main function          ← Checkin, Checkout, Schedule
7. History                ← Riwayat kunjungan
8. Connect production BE  ← ganti VITE_API_URL ke production
```

---

## Catatan Penting

- Token disimpan di `localStorage` — acceptable untuk internal tool
- Routing hash-based (`#/route`) — tidak butuh server config
- Semua library via npm, tidak ada CDN atau file manual
- `public/vendors/` sudah dihapus bersama template DeskApp
- File upload: gunakan `FormData`, jangan set `Content-Type` manual
- MySQL port: **3307** (bukan 3306 default)
- Hapus `down()` method kalau tidak mau data hilang saat rollback
