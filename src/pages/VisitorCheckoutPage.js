import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout";
import "../assets/css/visitor-checkout.css";

// CONTENT
function visitorCheckoutContent() {
  const page = document.createElement("div");
  page.innerHTML = `
  <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
    <div>
      <h1 class="text-primary mb-3">Visitor Check Out</h1>
    </div>
  </div>

  <div class="card visitor-image mb-4 p-4">
    <div class="row">
      <div class="col-lg-4 col-md-4 col-sm-12 card-1">
        <h5 class="img-title">Visitor Photo</h5>

        <img src="images/pfp1.png" alt="Visitor photo" id="current_photo" />

        <button type="button" class="btn btn-primary rounded-5" id="take_photo" data-bs-toggle="modal" data-bs-target="#modalPhoto">
          <i class="bi bi-camera-fill"></i>
          Take Photo
        </button>
      </div>

      <div class="col-lg-4 col-md-4 col-sm-12 card-2">
        <h5 class="img-title">Visitor Photo Profile</h5>

        <img src="images/pfp2.png" alt="Visitor photo profile" id="photo_profile" />
      </div>

      <div class="col-lg-4 col-md-4 col-sm-12 card-3">
        <h5 class="img-title">Identity Photo</h5>

        <img src="images/ktp.png" alt="Identity photo" id="identity_photo" />
      </div>
    </div>
  </div>

  <div class="card details mb-4 p-4 gap-2">
    <form id="visitorCheckout">
      <div class="row">
        <!-- LEFT COLUMN -->
        <div class="col-lg-6 col-md-6 col-sm-12">
          <div class="form-group">
            <label for="id_appointment" class="form-label"> ID Appointment </label>

            <input type="text" class="form-control" id="id_appointment" name="id-appointment" placeholder="Scan for input" />
            <button class="btn btn-scan btn-outline-primary rounded-4" id="scanQr" data-bs-toggle="modal" data-bs-target="#modalQrScan"><i class="bi bi-qr-code-scan"></i></button>
          </div>

          <div class="form-group visitor-type">
            <label class="form-label"> Visitor Type </label>

            <div class="visitor-type-options">
              <label class="form-check" for="visitorExport">
                <input class="form-check-input" value="export" type="radio" name="visitor-type" id="visitorExport" />

                <span class="form-check-label"> Export </span>
              </label>

              <label class="form-check" for="visitorNonExport">
                <input class="form-check-input" value="non_export" type="radio" name="visitor-type" id="visitorNonExport" />

                <span class="form-check-label"> Non Export </span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="visitorCard" class="form-label"> Visitor Card </label>

            <select class="form-select" name="visitor-card" id="visitorCard">
              <option value="">Select</option>
            </select>
          </div>

          <div class="form-group">
            <label for="parkingCard" class="form-label"> Parking Card </label>

            <select class="form-select" name="parking-card" id="parkingCard">
              <option value="">Select</option>
            </select>
          </div>

          <!-- DEVICE LIST -->
          <div id="deviceList">
            <!-- DEVICE BLOCK DEFAULT -->
            <div class="device-block">
              <div class="form-group">
                <label for="device_" class="form-label"> Electronic Device </label>

                <div class="device-input">
                  <select class="form-select" name="device[]" id="device_">
                    <option value="">Select</option>
                  </select>

                  <button type="button" class="btn btn-add" id="addDevice_" data-action="add" aria-label="Add device" title="Add device">
                    <i class="bi bi-plus-circle"></i>
                  </button>
                </div>
              </div>

              <div class="form-group protection-type-group">
                <label class="form-label"> Protection Type </label>

                <div class="protection-options">
                  <label class="form-check" for="case_">
                    <input class="form-check-input" value="case" type="radio" name="protection-type[0]" id="case_" data-protection-type />

                    <span class="form-check-label"> Case </span>
                  </label>

                  <label class="form-check" for="sticker_">
                    <input class="form-check-input" value="sticker" type="radio" name="protection-type[0]" id="sticker_" data-protection-type />

                    <span class="form-check-label"> Sticker </span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="caseNumber_" class="form-label"> Protection Number </label>

                <div class="protection-number">
                  <select class="form-select" name="case-number[]" id="caseNumber_">
                    <option value="">Select</option>
                  </select>

                  <select class="form-select" name="sticker-number[]" id="stickerNumber_" hidden>
                    <option value="">Select</option>
                  </select>
                </div>
              </div>
            </div>
            <!-- END DEVICE BLOCK -->
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="col-lg-6 col-md-6 col-sm-12">
          <div class="form-group">
            <label for="planCheckOut_" class="form-label"> Plan Check Out </label>

            <input type="text" class="form-control" id="planCheckOut_" placeholder="Plan Check Out" readonly />
          </div>

          <div class="form-group">
            <label for="name_" class="form-label"> Name </label>

            <input type="text" class="form-control" id="name_" placeholder="Name" readonly />
          </div>

          <div class="form-group">
            <label for="email_" class="form-label"> Email </label>

            <input type="text" class="form-control" id="email_" placeholder="Email" readonly />
          </div>

          <div class="form-group">
            <label for="phoneNumber_" class="form-label"> Phone Number </label>

            <input type="text" class="form-control" id="phoneNumber_" placeholder="Phone Number" readonly />
          </div>

          <div class="form-group">
            <label for="company_" class="form-label"> Company Origin </label>

            <input type="text" class="form-control" id="company_" placeholder="Company" readonly />
          </div>

          <div class="form-group">
            <label for="purpose_" class="form-label"> Purpose </label>

            <input type="text" class="form-control" id="purpose_" placeholder="Purpose" readonly />
          </div>

          <div class="form-group">
            <label for="employeeTarget_" class="form-label"> Employee Target </label>

            <input type="text" class="form-control" id="employeeTarget_" placeholder="Employee Target Name" readonly />
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-primary rounded-5" id="checkinSubmit">Submit</button>
        </div>
      </div>
    </form>
  </div>

  <!-- Modal Take Photo-->
  <div class="modal fade" id="modalPhoto" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <i class="bi bi-camera"></i>
          <h1 class="modal-title fs-5">Take Photo</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="camera-container">
            <video src="" id="cameraView" width="320" height="240"></video>
            <canvas id="cameraCanvas" width="150" height="150"></canvas>
            <div id="camera-status">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <span class="sr-only">Loading...</span>

              <span class="camera-status-text">Waiting for camera access... If the camera does not appear, ensure you have granted camera permission to the browser.</span>
            </div>
            <div class="text-center mt-3">
              <button id="switch-camera-btn" class="btn btn-outline-warning btn-sm" data-i18n="switch_camera"><i class="bi bi-camera"></i> Switch Camera</button>
            </div>
            <div class="text-center mt-3">
              <button id="capture-btn" class="btn btn-primary" data-i18n="take_photo">Ambil Foto</button>
              <button id="retake-btn" class="btn btn-secondary" data-i18n="retake_photo">Ambil Ulang</button>
              <button id="save-photo-btn" class="btn btn-success" data-i18n="save_photo">Simpan Foto</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Take Photo-->
<div class="modal fade" id="modalPhoto" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <i class="bi bi-camera"></i>
        <h1 class="modal-title fs-5">Take Photo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="camera-container">
          <video src="" id="cameraView" width="320" height="240"></video>
          <canvas id="cameraCanvas" width="150" height="150"></canvas>
          <div id="camera-status">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <span class="sr-only">Loading...</span>

            <span class="camera-status-text">Waiting for camera access... If the camera does not appear, ensure you have granted camera permission to the browser.</span>
          </div>
          <div class="text-center mt-3">
            <button id="switch-camera-btn" class="btn btn-outline-warning btn-sm" data-i18n="switch_camera"><i class="bi bi-camera"></i> Switch Camera</button>
          </div>
          <div class="text-center mt-3">
            <button id="capture-btn" class="btn btn-primary" data-i18n="take_photo">Ambil Foto</button>
            <button id="retake-btn" class="btn btn-secondary" data-i18n="retake_photo">Ambil Ulang</button>
            <button id="save-photo-btn" class="btn btn-success" data-i18n="save_photo">Simpan Foto</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- Modal scan qr-->
<div class="modal fade" id="modalQrScan" tabindex="-1" aria-labelledby="scanQrTitle" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="scanQrTitle">Scan Qr Code</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="qr-reader-container">
          <div id="qrReader_"></div>
        </div>
      </div>
    </div>
  </div>
</div>
  `;
  return page;
}

export function CheckoutPage() {
  return DashboardLayout(visitorCheckoutContent);
}
