// src/pages/RegistVisitorPage.js
import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout.js";
import { fetchCardTypes, fetchCompanies, fetchCompanyById, createVisitor } from "../services/visitor.js";

// ─── Validasi file ───────────────────────────────────────────────
const VALID_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function validateImage(file) {
  if (!VALID_TYPES.includes(file.type)) return "Format gambar harus JPG, JPEG, atau PNG.";
  if (file.size > MAX_SIZE) return "Ukuran gambar maksimal 2 MB.";
  return null;
}

// ─── Preview foto ────────────────────────────────────────────────
function initPhotoPreview(container, inputId, previewId, removeBtnId) {
  const input = container.querySelector(`#${inputId}`);
  const preview = container.querySelector(`#${previewId}`);
  const removeBtn = container.querySelector(`#${removeBtnId}`);

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const err = validateImage(file);
    if (err) {
      Swal.fire({ title: err, icon: "warning", timer: 3000, showConfirmButton: false });
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
      removeBtn.style.display = "inline-flex";
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", () => {
    input.value = "";
    preview.src = "";
    preview.style.display = "none";
    removeBtn.style.display = "none";
  });
}

// ─── Load jenis identitas ────────────────────────────────────────
async function loadCardTypes(select) {
  try {
    const data = await fetchCardTypes();
    (data.types || []).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id_type_card;
      opt.textContent = t.type_name;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Card types:", e);
  }
}

// ─── Load perusahaan (role-based) ───────────────────────────────
async function loadCompanies(select) {
  const role = localStorage.getItem("userRole") || "visitor";

  try {
    if (role === "visitor") {
      // Visitor: hanya tampilkan company sendiri, auto-select + disabled
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = user.company_id;

      if (companyId) {
        const data = await fetchCompanyById(companyId);
        if (data.company) {
          const opt = document.createElement("option");
          opt.value = data.company.company_id;
          opt.textContent = data.company.name;
          opt.selected = true;
          select.appendChild(opt);
          select.disabled = true;
        }
      }
    } else {
      // Admin/Security: tampilkan semua company
      const data = await fetchCompanies();
      (data.companies || []).forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.company_id;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.error("Companies:", e);
  }
}

// ─── Submit handler ──────────────────────────────────────────────
function initSubmitHandler(container) {
  const form = container.querySelector("#visitor-regist-form");
  const btn = container.querySelector("#regist-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = container.querySelector("#first_name").value.trim();
    const lastName = container.querySelector("#last_name").value.trim();
    const idType = container.querySelector("#id_type_card").value;
    const idNumber = container.querySelector("#id_number").value.trim();
    const email = container.querySelector("#email").value.trim();
    const phone = container.querySelector("#phone").value.trim();
    const companyId = container.querySelector("#company_origin").value;
    const idPhoto = container.querySelector("#id_photo").files[0];
    const selfiePhoto = container.querySelector("#selfie_photo").files[0];

    // Validasi
    if (!firstName || !idType || !idNumber || !email || !phone || !companyId) {
      Swal.fire({ title: "Semua field wajib harus diisi!", icon: "warning" });
      return;
    }

    if (!idPhoto || !selfiePhoto) {
      Swal.fire({ title: "Foto identitas dan selfie harus diisi!", icon: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("name", `${firstName} ${lastName}`.trim());
    formData.append("id_type_card", idType);
    formData.append("id_number", idNumber);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("company_id", companyId);
    formData.append("id_photo", idPhoto);
    formData.append("selfie_photo", selfiePhoto);

    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...`;

    try {
      const { ok, data } = await createVisitor(formData);

      if (ok) {
        await Swal.fire({
          title: "Berhasil!",
          text: data.message || "Data pengunjung berhasil ditambahkan.",
          icon: "success",
        });
        form.reset();
        // Reset preview
        container.querySelectorAll(".preview-img").forEach((img) => {
          img.src = "";
          img.style.display = "none";
        });
        container.querySelectorAll(".remove-btn").forEach((b) => {
          b.style.display = "none";
        });
      } else {
        const errMsg = data?.messages?.error || data?.message || "Gagal menambahkan data pengunjung.";
        Swal.fire({ title: "Gagal!", text: errMsg, icon: "error" });
      }
    } catch (err) {
      Swal.fire({ title: "Error!", text: err.message, icon: "error" });
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });
}

// ─── Content ─────────────────────────────────────────────────────
function RegistVisitorContent() {
  const page = document.createElement("div");

  page.innerHTML = `
    <div class="page-title">
      <h1 class="text-primary">Registrasi Pengunjung</h1>
      <p>Tambah data pengunjung baru ke sistem</p>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card p-4">
            <form id="visitor-regist-form" novalidate>

                <!-- Nama -->
                <div class="row g-3 mb-3">
                <div class="col-md-6">
                    <label class="form-label">Nama Depan <span class="text-danger">*</span></label>
                    <input type="text" id="first_name" class="form-control" placeholder="Nama Depan" />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Nama Belakang</label>
                    <input type="text" id="last_name" class="form-control" placeholder="Nama Belakang" />
                </div>
                </div>

                <!-- Jenis Identitas -->
                <div class="mb-3">
                <label class="form-label">Jenis Identitas <span class="text-danger">*</span></label>
                <select id="id_type_card" class="form-select">
                    <option value="">-- Pilih Jenis Identitas --</option>
                </select>
                </div>

                <!-- Nomor Identitas -->
                <div class="mb-3">
                <label class="form-label">Nomor Identitas <span class="text-danger">*</span></label>
                <input type="text" id="id_number" class="form-control" placeholder="Nomor Identitas" />
                </div>

                <!-- Foto Identitas -->
                <div class="mb-3">
                <label class="form-label">Upload Foto Identitas <span class="text-danger">*</span></label>
                <input type="file" id="id_photo" class="form-control" accept="image/*" />
                <div class="mt-2" id="preview-id-wrapper" style="position:relative;display:inline-block">
                    <img id="preview-id" src="" alt="Preview" class="preview-img rounded"
                    style="display:none;max-height:160px;max-width:100%;object-fit:cover" />
                    <button type="button" id="remove-id" class="remove-btn btn btn-sm btn-danger"
                    style="display:none;position:absolute;top:4px;right:4px;padding:2px 6px">
                    <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="form-text">Format JPG/PNG, maks. 2 MB</div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input type="email" id="email" class="form-control" placeholder="Email" />
                </div>

                <!-- Nomor HP -->
                <div class="mb-3">
                <label class="form-label">Nomor Handphone <span class="text-danger">*</span></label>
                <input type="tel" id="phone" class="form-control" placeholder="08-dst"
                    inputmode="numeric" pattern="\\d*" />
                </div>

                <!-- Asal Perusahaan -->
                <div class="mb-3">
                <label class="form-label">Asal Perusahaan <span class="text-danger">*</span></label>
                <select id="company_origin" class="form-select">
                    <option value="">-- Pilih Perusahaan --</option>
                </select>
                </div>

                <!-- Foto Selfie -->
                <div class="mb-4">
                <label class="form-label">Upload Foto Selfie <span class="text-danger">*</span></label>
                <input type="file" id="selfie_photo" class="form-control" accept="image/*" />
                <div class="mt-2" id="preview-selfie-wrapper" style="position:relative;display:inline-block">
                    <img id="preview-selfie" src="" alt="Preview Selfie" class="preview-img rounded"
                    style="display:none;max-height:160px;max-width:100%;object-fit:cover" />
                    <button type="button" id="remove-selfie" class="remove-btn btn btn-sm btn-danger"
                    style="display:none;position:absolute;top:4px;right:4px;padding:2px 6px">
                    <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="form-text">Format JPG/PNG, maks. 2 MB</div>
                </div>

                <!-- Submit -->
                <div class="d-flex justify-content-end">
                <button type="submit" id="regist-submit" class="btn btn-primary px-4">
                    <i class="bi bi-person-plus me-2"></i>Daftarkan Pengunjung
                </button>
                </div>

            </form>
        </div>
      </div>
    </div>
    
  `;

  // Init semua
  setTimeout(() => {
    loadCardTypes(page.querySelector("#id_type_card"));
    loadCompanies(page.querySelector("#company_origin"));
    initPhotoPreview(page, "id_photo", "preview-id", "remove-id");
    initPhotoPreview(page, "selfie_photo", "preview-selfie", "remove-selfie");
    initSubmitHandler(page);

    // Only number untuk HP
    page.querySelector("#phone").addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  }, 0);

  return page;
}

// ─── Export ──────────────────────────────────────────────────────
export function RegistVisitorPage() {
  return DashboardLayout(RegistVisitorContent);
}
