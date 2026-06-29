# VISITORA — Visitor Management System

## Project Migration Documentation

> **Status:** In Progress — SPA Migration dari multi-HTML ke Vite + Vanilla JS

---

## Tech Stack

### Frontend

| Tech              | Versi   | Keterangan                  |
| ----------------- | ------- | --------------------------- |
| Vite              | latest  | Bundler                     |
| Vanilla JS        | ES2022+ | No framework                |
| Bootstrap         | 5       | CSS + JS (via npm)          |
| Bootstrap Icons   | latest  | Icon library (via npm)      |
| Inter font        | latest  | @fontsource/inter (via npm) |
| SweetAlert2       | 11      | Notifikasi (via npm)        |
| ApexCharts        | latest  | Chart (via npm)             |
| simple-datatables | latest  | Tabel (via npm)             |

### Backend (Dummy)

| Tech            | Keterangan                     |
| --------------- | ------------------------------ |
| CodeIgniter 4   | PHP framework                  |
| MySQL via XAMPP | Database (setup belum selesai) |
| PHP 8.2         | Runtime                        |

---

## Struktur Folder

```
update_visitora/                ← root project frontend
├── public/
│   └── images/                ← aset gambar (logo, background, dll)
├── src/
│   ├── assets/
│   │   └── css/
│   │       ├── global.css          ← design token + reset + Bootstrap override
│   │       ├── login.css           ← halaman login
│   │       ├── dashboard.css       ← layout navbar + sidebar
│   │       └── dashboard-content.css ← widget, card, tabel dashboard
│   ├── layouts/
│   │   └── DashboardLayout.js      ← wrapper layout (navbar + sidebar)
│   ├── components/
│   │   ├── Navbar.js               ← navbar dengan toggle, user dropdown
│   │   ├── Sidebar.js              ← sidebar collapsible, menu per role
│   │   ├── AdminDashboard.js       ← konten dashboard admin/security
│   │   └── VisitorDashboard.js     ← konten dashboard visitor
│   ├── pages/
│   │   ├── LoginPage.js            ← halaman login ✅
│   │   ├── DashboardPage.js        ← halaman dashboard ✅
│   │   ├── RegistVisitorPage.js    ← registrasi pengunjung (WIP)
│   │   └── CompanyPage.js          ← CRUD perusahaan (WIP)
│   ├── services/
│   │   ├── auth.js                 ← login, register
│   │   ├── dashboard.js            ← fetch data dashboard
│   │   ├── visitor.js              ← CRUD visitor
│   │   └── company.js              ← CRUD perusahaan
│   ├── router/
│   │   └── index.js                ← hash-based routing
│   └── main.js                     ← entry point
├── index.html
├── .env                            ← VITE_API_URL=http://localhost:8080
├── vite.config.js
└── package.json

update_visitora_be_dummy/       ← root project backend CI4
├── app/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php      ← login, register
│   │       └── VisitorController.php   ← companies, card-types, visitors
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

## Routing (Hash-based)

```
#/                  → LoginPage
#/dashboard         → DashboardPage (AdminDashboard / VisitorDashboard by role)
#/regist-visitor    → RegistVisitorPage
#/company           → CompanyPage
#/department        → (belum dibuat)
#/users             → (belum dibuat)
#/host              → (belum dibuat)
#/id-card           → (belum dibuat)
#/parking-card      → (belum dibuat)
#/sticker-block     → (belum dibuat)
#/protective-case   → (belum dibuat)
#/visitor           → (belum dibuat)
#/visiting-schedule → (belum dibuat)
#/data-checkin      → (belum dibuat)
#/visitor-checkin   → (belum dibuat)
#/visitor-checkout  → (belum dibuat)
#/history           → (belum dibuat)
#/building          → (belum dibuat)
#/area              → (belum dibuat)
```

---

## Role System

```
admin     → akses semua fitur
security  → akses kunjungan + inventaris
visitor   → akses data kunjungan sendiri + jadwal
```

Auth guard ada di `src/router/index.js`:

- Route dilindungi → cek `localStorage.getItem('token')`
- Belum login → redirect ke `#/`
- Sudah login buka login page → redirect ke `#/dashboard`

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

### File .env Frontend

```
VITE_API_URL=http://localhost:8080
```

### File .env Backend (CI4)

```
CI_ENVIRONMENT = development
```

---

## API Endpoints (Dummy Backend)

### Auth

```
POST /api/login
  body: { email, password }
  response: { token, user: { id, name, email, role } }

POST /api/register
  body: { name, email, password, role }
```

### Dummy Users

```
admin@visitora.com  / Admin123!@#  → role: admin
user@visitora.com   / User123!@#   → role: visitor
```

### Companies

```
GET    /api/companies
GET    /api/companies/:id
POST   /api/companies       body: { name, address }
PUT    /api/companies/:id   body: { name, address }
DELETE /api/companies/:id
```

### Visitors

```
POST /api/visitors   (multipart/form-data)
  fields: name, id_type_card, id_number, email, phone, company_id
  files:  id_photo, selfie_photo
```

### Lainnya (belum ada dummy endpoint)

```
GET /api/card-types
GET /api/departments
GET /api/hosts
GET /api/id-cards/status
GET /api/parking-spots/status
GET /api/visitors/recent
GET /api/visitor-checkins
GET /api/visitor-schedules
GET /api/visitors/monthly
POST /api/visitor-checkins
PUT  /api/visitor-checkins/:id
```

---

## Pola Kode (Penting!)

### Setiap halaman baru mengikuti pola ini:

```js
// src/pages/NamaPage.js
import { DashboardLayout } from "../layouts/DashboardLayout.js";

function NamaContent() {
  const el = document.createElement("div");
  el.innerHTML = `<!-- HTML konten -->`;
  // init event listeners
  return el;
}

export function NamaPage() {
  return DashboardLayout(NamaContent);
}
```

### Daftarkan di router:

```js
// src/router/index.js
import { NamaPage } from "../pages/NamaPage.js";

const routes = {
  // ...routes lain
  "/nama-route": NamaPage,
};
```

### Service layer (API calls):

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
```

---

## Halaman yang Sudah Selesai ✅

- [x] Login Page — form login, password toggle, language selector, SweetAlert2
- [x] Dashboard Layout — navbar collapsible sidebar, user dropdown, logout
- [x] Admin Dashboard — stat cards, chart ApexCharts, inventory cards, 2 tabel
- [x] Visitor Dashboard — greeting, live clock, info cards, syarat & ketentuan
- [x] Sidebar — menu per role (admin/security/visitor), collapse submenu

## Halaman yang Sedang Dikerjakan 🚧

- [ ] Registrasi Pengunjung (`#/regist-visitor`)
- [ ] Company (`#/company`) — CRUD + DataTable

## Halaman yang Belum Dibuat ⬜

- [ ] Department
- [ ] Users
- [ ] Host
- [ ] ID Card (inventory)
- [ ] Parking Card (inventory)
- [ ] Sticker Block (inventory)
- [ ] Protective Case (inventory)
- [ ] Visitor Checkin
- [ ] Visitor Checkout
- [ ] Data Visitor
- [ ] Visiting Schedule
- [ ] Data Checkin
- [ ] History
- [ ] Building
- [ ] Area

---

## Next Steps

1. Setup MySQL di XAMPP untuk backend yang lebih proper
2. Buat migration CI4 untuk semua tabel
3. Lanjut halaman yang belum dibuat (urutan: Settings → Inventory → Main Function → History)
4. Connect ke production backend CI4 saat semua halaman siap

---

## Catatan

- Token auth disimpan di `localStorage` (bukan HttpOnly cookie) — acceptable untuk internal tool
- Routing pakai hash-based (`#/route`) karena tidak butuh server-side config
- Semua vendor library diinstall via npm, tidak ada CDN atau file manual
- `public/vendors/` sudah dihapus — semua dependency via npm
- Untuk foto/file upload: gunakan `FormData`, jangan set `Content-Type` manual (biarkan browser set boundary)
