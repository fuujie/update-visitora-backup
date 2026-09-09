import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout";
import Choices from "choices.js";
import AirDatepicker from "air-datepicker";
import localeEn from "air-datepicker/locale/en";
import { DataTable } from "simple-datatables";
import "choices.js/public/assets/styles/choices.min.css";
import "../assets/css/create-appointment.css";
import "../assets/css/styles.css";

let dtInstance = null;

// Render table add user
async function loadTableAddUser(container) {
  if (dtInstance) {
    dtInstance.destroy();
    dtInstance = null;
  }

  const wrapper = container.querySelector("#visitor-list-table-wrapper");
  wrapper.innerHTML = `<div class="text-center py-4 text-muted">
    <div class="spinner-border spinner-border-sm me-2"></div> Choose user from add data
  </div>`;
}
// async function

// Content
function createAppointmentContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
      <div>
        <h1 class="text-primary mb-3">Create Visit Schedule</h1>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-list-visitor">
          <i class="bi bi-plus-lg me-1"></i>Add User
        </button>
      </div>
    </div>

    <form action="">
      <div class="table-card mb-4 p-4">
        <h3 class="text-dark section-title fw-semibold">Data User</h3>
        <div class="visitor-list-table-wrapper"></div>
      </div>

      <div class="table-card mb-4 p-4">
        <h3 class="text-dark section-title fw-semibold">Detail Appointment</h3>
        <div class="mb-3">
          <label for="visit-plan" class="form-label">Visit Plan</label>
          <div id="visit-plan">
            <input type="date" class="form-control" id="start-date" name="startDate" />
            <i class="bi bi-calendar-date"></i>
            <input type="date" class="form-control" id="end-date" name="endDate" />
            <i class="bi bi-calendar-date"></i>
          </div>
        </div>
        <div class="mb-3">
          <label for="company-origin" class="form-label">Company Origin</label>
          <select name="companyOrigin" id="company-origin" class="form-select">
            <option value="">Select</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="purpose" class="form-label">Purpose</label>
          <select name="purpose_" id="purpose" class="form-select">
            <option value="">Select</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="" class="form-label">Vehicle Type</label>
          <select name="purpose_" id="vehicle-type" class="form-select">
            <option value="">Select</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="license-plate" class="form-label">License Plate</label>
          <input type="text" class="form-control" name="licensePlate" id="license-plate" required />
        </div>
        <div class="mb-3">
          <label for="employee-target" class="form-label">Employee Target</label>
          <select name="employeeTarget" id="employee-target" class="form-select">
            <option value="">Select</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="" class="form-label">Target Department</label>
          <input type="text" class="form-control" id="target-department" name="targetDepartment" />
        </div>
        <button type="submit" class="btn btn-primary" id="create-submit">Submit</button>
      </div>
    </form>

    <!-- Modal list user -->
    <div class="modal fade" id="modal-list-visitor" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title section-title">Add Visitor</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form action="">
              <div class="card user-card mb-3">
                <div class="mb-4">
                  <label for="user-name" class="form-label">Name</label>
                  <select name="userName_" id="user-name" class="form-select">
                    <option value="">Select</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label for="identity-number" class="form-label">Identity Number</label>
                  <select name="identityNumber_" id="identity-number" class="form-select">
                    <option value="">Select</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label for="electronic-device" class="form-label">Electronic Device</label>
                  <select name="electronicDevice_" id="electronic-device" class="form-select">
                    <option value="">Select</option>
                  </select>
                  <button class="btn" name="btnCoppy_" id="btn-coppy"><i class="bi bi-plus-circle"></i></button>
                </div>
              </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" name="deleteUser" id="delete-user"><i class="bi bi-trash"></i> Delete</button>
            <button type="submit" class="btn btn-primary" name="addUser" id="add-user"><i class="bi bi-person-add"></i> Submit</button>
          </div>
            </form>
        </div>
      </div>
    </div>
    `;
  setTimeout(() => {
    loadTableAddUser(page);
  }, 0);
  return page;
}

export function CreateAppointmentPage() {
  return DashboardLayout(createAppointmentContent);
}
