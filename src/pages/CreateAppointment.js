import Swal from "sweetalert2";
import { DashboardLayout } from "../layouts/DashboardLayout";
import Choices from "choices.js";
import AirDatepicker from "air-datepicker";
import localeEnModule from "air-datepicker/locale/en";
import { DataTable } from "simple-datatables";
import "choices.js/public/assets/styles/choices.min.css";
import "air-datepicker/air-datepicker.css";
import "../assets/css/create-appointment.css";
import "../assets/css/styles.css";
import { fetchVisitors } from "../services/visitor-list";
import { fetchItemBring } from "../services/item-bring";

const AppState = {
  dtInstance: null,
  transactionUsers: [],
  currentEditId: null,
  visitorsCache: [],
  bringItemCache: [],
  choicesInstances: [],
  airDatepickerInstance: [],
  isResettingModal: false,
  modalInstance: null,
  userCompany: [],

  addUser(userData) {
    this.transactionUsers.push({
      id: Date.now().toString(),
      ...userData,
    });
  },

  updateUser(id, userData) {
    this.transactionUsers = this.transactionUsers.map((item) => (item.id === id ? { ...item, ...userData } : item));
  },

  removeUser(id) {
    this.transactionUsers = this.transactionUsers.filter((item) => item.id !== id);
  },

  getUser(id) {
    return this.transactionUsers.find((item) => item.id === id);
  },

  clear() {
    this.dtInstance = null;
    this.transactionUsers = [];
    this.currentEditId = null;
  },

  destroyAllChoicesInstances() {
    this.choicesInstances.forEach((instance) => {
      if (instance && typeof instance.destroy === "function") {
        try {
          instance.destroy();
        } catch (e) {
          console.error("Error destroying Choices instance:", e);
        }
      }
    });

    this.choicesInstances = [];
  },
};

// async function fetchVisitorByCompany() {
//   const userData = localStorage.getItem(user);
//   console.log("user", userData);

// }

async function fetchVisitorsData() {
  if (AppState.visitorsCache.length > 0) return AppState.visitorsCache;

  try {
    const { visitors = [] } = await fetchVisitors();
    AppState.visitorsCache = visitors;
    return visitors;
  } catch (e) {
    console.error("Error fetching visitors:", e);
    return [];
  }
}

async function fetchItemData() {
  if (AppState.bringItemCache.length > 0) return AppState.bringItemCache;

  try {
    const { items = [] } = await fetchItemBring();
    AppState.bringItemCache = items;
    return items;
  } catch (e) {
    console.error("Error fetching item bawaan categories:", e);
    return [];
  }
}

async function fetchModalReferenceData() {
  const [visitors, bringItemCategories] = await Promise.all([fetchVisitorsData(), fetchItemData()]);

  return { visitors, bringItemCategories };
}

function setSelectValue(selectElement, value) {
  if (!selectElement) return;

  const normalizedValue = value == null ? "" : String(value);

  const choicesInstance = selectElement.choicesInstance;

  if (choicesInstance && typeof choicesInstance.setChoiceByValue === "function") {
    choicesInstance.setChoiceByValue(normalizedValue);
    return;
  }

  selectElement.value = normalizedValue;
}

function initializeChoicesForSelect(selectElement, choicesData) {
  if (!selectElement) return null;

  try {
    const instance = new Choices(selectElement, {
      searchEnabled: true,
      searchPlaceholderValue: "Search by name",
      itemSelectText: "",
      placeholder: true,
      placeholderValue: "Select",
      shouldSort: false,
      noResultsText: "Not found",
      noChoicesText: "No choices",
    });

    instance.setChoices(
      choicesData.map((item) => ({
        value: String(item.value),
        label: String(item.label),
      })),
      "value",
      "label",
      false,
    );

    selectElement.choicesInstance = instance;
    AppState.choicesInstances.push(instance);

    return instance;
  } catch (e) {
    console.error("Error initializing Choices:", e);
    return null;
  }
}

// DEVICE MANAGEMENT
function createDeviceItem() {
  return `
    <div class="device-item d-flex align-items-center gap-2 mb-2">
      <select name="electronicDevice[]" class="form-select electronic-device">
        <option value="">Select</option>
        <option value="laptop">Laptop</option>
        <option value="handphone">Handphone</option>
        <option value="camera">Camera</option>
      </select>

      <button type="button" class="btn btn-add btn-more-device" data-action="add-device">
        <i class="bi bi-plus-circle"></i>
      </button>

      <button type="button" class="btn btn-remove-device d-none" data-action="remove-device">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
}

function addDevice(userCard) {
  const deviceList = userCard.querySelector(".device-list");
  if (!deviceList) return;

  const deviceItem = document.createElement("div");
  deviceItem.className = "device-item d-flex align-items-center gap-2 mb-2";
  deviceItem.innerHTML = `
    <select name="electronicDevice[]" class="form-select electronic-device">
      <option value="">Select</option>
      <option value="laptop">Laptop</option>
      <option value="handphone">Handphone</option>
      <option value="camera">Camera</option>
    </select>

    <button type="button" class="btn btn-add btn-more-device" data-action="add-device">
      <i class="bi bi-plus-circle"></i>
    </button>

    <button type="button" class="btn btn-remove-device" data-action="remove-device">
      <i class="bi bi-trash"></i>
    </button>
  `;

  deviceList.appendChild(deviceItem);
  updateDeviceButtons(userCard);
}

function removeDevice(deviceItem) {
  const userCard = deviceItem.closest(".user-card");
  if (!userCard) return;

  const deviceList = userCard.querySelector(".device-list");
  if (!deviceList) return;

  const deviceItems = deviceList.querySelectorAll(".device-item");
  if (deviceItems.length <= 1) return;

  deviceItem.remove();
  updateDeviceButtons(userCard);
}

function updateDeviceButtons(userCard) {
  const deviceItems = userCard.querySelectorAll(".device-item");

  deviceItems.forEach((item, index) => {
    const removeButton = item.querySelector('[data-action="remove-device"]');
    const addButton = item.querySelector('[data-action="add-device"]');

    if (!removeButton || !addButton) return;

    addButton.classList.toggle("d-none", index !== deviceItems.length - 1);
    removeButton.classList.toggle("d-none", deviceItems.length <= 1);
  });
}

// ITEM BAWAAN
function createItemBawaanOptions(categories) {
  return categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join("");
}

function createItemBawaanItem(categories) {
  return `
    <div class="item-bawaan-item d-flex align-items-center gap-2 mb-2">
      <select name="itemBawaan[]" class="form-select item-bawaan">
        <option value="">Select</option>
        ${createItemBawaanOptions(categories) || `<option value="" disabled>No data</option>`}
      </select>

      <button type="button" class="btn btn-add btn-more-item-bawaan" data-action="add-item-bawaan">
        <i class="bi bi-plus-circle"></i>
      </button>

      <button type="button" class="btn btn-remove-item-bawaan d-none" data-action="remove-item-bawaan">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
}

function addItemBawaan(userCard) {
  const itemBawaanList = userCard.querySelector(".item-bawaan-list");
  if (!itemBawaanList) return;

  const categories = AppState.bringItemCache;

  const itemBawaanEl = document.createElement("div");
  itemBawaanEl.className = "item-bawaan-item d-flex align-items-center gap-2 mb-2";
  itemBawaanEl.innerHTML = `
    <select name="itemBawaan[]" class="form-select item-bawaan">
      <option value="">Select</option>
      ${createItemBawaanOptions(categories)}
    </select>

    <button type="button" class="btn btn-add btn-more-item-bawaan" data-action="add-item-bawaan">
      <i class="bi bi-plus-circle"></i>
    </button>

    <button type="button" class="btn btn-remove-item-bawaan" data-action="remove-item-bawaan">
      <i class="bi bi-trash"></i>
    </button>
  `;

  itemBawaanList.appendChild(itemBawaanEl);
  updateItemBawaanButtons(userCard);
}

function removeItemBawaan(itemBawaanItem) {
  const userCard = itemBawaanItem.closest(".user-card");
  if (!userCard) return;

  const itemBawaanList = userCard.querySelector(".item-bawaan-list");
  if (!itemBawaanList) return;

  const items = itemBawaanList.querySelectorAll(".item-bawaan-item");
  if (items.length <= 1) return;

  itemBawaanItem.remove();
  updateItemBawaanButtons(userCard);
}

function updateItemBawaanButtons(userCard) {
  const items = userCard.querySelectorAll(".item-bawaan-item");

  items.forEach((item, index) => {
    const removeButton = item.querySelector('[data-action="remove-item-bawaan"]');
    const addButton = item.querySelector('[data-action="add-item-bawaan"]');

    if (!removeButton || !addButton) return;

    addButton.classList.toggle("d-none", index !== items.length - 1);
    removeButton.classList.toggle("d-none", items.length <= 1);
  });
}

function buildUserCard(visitors, bringItemCategories, isClone = false) {
  const userCard = document.createElement("div");
  userCard.className = "card user-card mb-3 clone-form-group";

  const nameOptions = visitors.map((v) => `<option value="${v.name}">${v.name}</option>`).join("");

  const idOptions = visitors.map((v) => `<option value="${v.identity_number}">${v.identity_number}</option>`).join("");

  userCard.innerHTML = `
    ${
      isClone
        ? `
      <button type="button" class="btn btn-remove-clone" data-action="remove-user">
        <i class="bi bi-trash"></i>
      </button>
    `
        : ""
    }

    <div class="mb-4">
      <label class="form-label">Name</label>
      <select name="userName[]" class="form-select user-name">
        <option value="">Select</option>
        ${nameOptions || `<option value="" disabled>No data</option>`}
      </select>
    </div>

    <div class="mb-4">
      <label class="form-label">Identity Number</label>
      <select name="identityNumber[]" class="form-select identity-number">
        <option value="">Select</option>
        ${idOptions || `<option value="" disabled>No data</option>`}
      </select>
    </div>

    <div class="mb-4">
      <label class="form-label">Electronic Device</label>
      <div class="device-list">${createDeviceItem()}</div>
    </div>

    <div class="mb-4">
      <label class="form-label">Items Bring</label>
      <div class="item-bawaan-list">${createItemBawaanItem(bringItemCategories)}</div>
    </div>
  `;

  const nameSelect = userCard.querySelector(".user-name");
  const idSelect = userCard.querySelector(".identity-number");

  if (nameSelect) {
    initializeChoicesForSelect(
      nameSelect,
      visitors.map((v) => ({ value: v.name, label: v.name })),
    );
  }

  if (idSelect) {
    initializeChoicesForSelect(
      idSelect,
      visitors.map((v) => ({ value: v.identity_number, label: v.identity_number })),
    );
  }

  attachAutoFillListener(userCard, visitors);
  return userCard;
}

function attachAutoFillListener(userCard, visitors) {
  const nameSelect = userCard.querySelector(".user-name");
  const idSelect = userCard.querySelector(".identity-number");

  if (!nameSelect || !idSelect) return;

  if (nameSelect.dataset.listenerAttached === "true") return;
  nameSelect.dataset.listenerAttached = "true";

  nameSelect.addEventListener("change", () => {
    const selectedName = nameSelect.value;

    if (!selectedName) {
      setSelectValue(idSelect, "");
      return;
    }

    const visitor = visitors.find((v) => v.name === selectedName);

    if (visitor) {
      setSelectValue(idSelect, visitor.identity_number);
    }
  });

  idSelect.addEventListener("change", () => {
    const selectedId = idSelect.value;

    if (!selectedId) {
      setSelectValue(nameSelect, "");
      return;
    }

    const visitor = visitors.find((v) => v.identity_number === selectedId);

    if (visitor) {
      setSelectValue(nameSelect, visitor.name);
    }
  });
}

function removeUser(userCard) {
  const userList = userCard.closest(".user-card-list");
  if (!userList) return;

  const userCards = userList.querySelectorAll(".user-card");
  if (userCards.length <= 1) return;

  userCard.remove();
  updateModalScroll();
}

// MODAL MANAGEMENT
function getUserModalInstance() {
  const modalEl = document.querySelector("#modal-list-visitor");
  if (!modalEl) return null;

  if (!AppState.modalInstance) {
    AppState.modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  }

  return AppState.modalInstance;
}

function closeUserModal() {
  const modalInstance = getUserModalInstance();
  modalInstance?.hide();

  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("padding-right");
  document.body.style.removeProperty("overflow");

  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
}

function updateModalScroll() {
  const modalEl = document.querySelector("#modal-list-visitor");
  if (!modalEl) return;

  const modalBody = modalEl.querySelector(".modal-body");
  if (!modalBody) return;

  const userCards = modalBody.querySelectorAll(".user-card");
  modalBody.classList.toggle("has-overflow", userCards.length > 1);
}

async function addMoreUserToModal() {
  const modalEl = document.querySelector("#modal-list-visitor");
  const userCardList = modalEl?.querySelector(".user-card-list");
  if (!userCardList) return;

  const { visitors, bringItemCategories } = await fetchModalReferenceData();
  userCardList.appendChild(buildUserCard(visitors, bringItemCategories, true));
  updateModalScroll();
}

function getModalFormData() {
  const modalEl = document.querySelector("#modal-list-visitor");
  if (!modalEl) return [];

  const cards = modalEl.querySelectorAll(".user-card");
  const tempUsersData = [];

  cards.forEach((card) => {
    const userName = card.querySelector(".user-name")?.value?.trim() || "";
    const identityNumber = card.querySelector(".identity-number")?.value?.trim() || "";

    const devices = Array.from(card.querySelectorAll(".electronic-device"))
      .map((select) => select.value)
      .filter((val) => val && val.trim() !== "");

    const itemsBawaan = Array.from(card.querySelectorAll(".item-bawaan"))
      .map((select) => select.value)
      .filter((val) => val && val.trim() !== "");

    if (userName || identityNumber) {
      tempUsersData.push({
        userName,
        identityNumber,
        devices,
        itemsBawaan,
      });
    }
  });

  return tempUsersData;
}

let isResettingModal = false;

async function resetModalForm() {
  if (isResettingModal) return;

  const modalEl = document.querySelector("#modal-list-visitor");
  const form = modalEl?.querySelector("#form-modal");
  const userCardList = modalEl?.querySelector(".user-card-list");

  if (!modalEl || !userCardList) return;

  try {
    isResettingModal = true;

    form?.reset();

    AppState.destroyAllChoicesInstances();
    userCardList.replaceChildren();

    const { visitors, bringItemCategories } = await fetchModalReferenceData();

    userCardList.appendChild(buildUserCard(visitors, bringItemCategories, false));

    updateModalScroll();
  } catch (error) {
    console.error("Gagal mereset modal:", error);
  } finally {
    isResettingModal = false;
  }
}

// TABLE MANAGEMENT
function buildTableRows() {
  const rowsHtml = [];
  let rowNumber = 0;

  AppState.transactionUsers.forEach((group) => {
    group.users.forEach((user) => {
      rowNumber += 1;

      const devices = (user.devices || []).filter(Boolean).join(", ") || "-";
      const itemsBawaan = (user.itemsBawaan || []).filter(Boolean).join(", ") || "-";

      rowsHtml.push(`
        <tr>
          <td>${rowNumber}</td>
          <td>${user.userName || "-"}</td>
          <td>${user.identityNumber || "-"}</td>
          <td>${devices}</td>
          <td>${itemsBawaan}</td>
          <td>
            <button type="button" class="btn btn-sm btn-table-edit btn-info" data-edit-id="${group.id}">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
        </tr>
      `);
    });
  });

  return rowsHtml.join("");
}

function attachTableEventListeners() {
  const wrapper = document.querySelector(".visitor-list-table-wrapper");
  if (!wrapper) return;

  if (wrapper.dataset.listenerAttached === "true") return;
  wrapper.dataset.listenerAttached = "true";

  wrapper.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit-id]");
    const deleteBtn = e.target.closest("[data-delete-id]");

    if (editBtn) {
      e.preventDefault();
      editUserData(editBtn.dataset.editId);
    }

    if (deleteBtn) {
      e.preventDefault();
      deleteUserData(deleteBtn.dataset.deleteId);
    }
  });
}

function loadTableUserList() {
  const wrapper = document.querySelector(".visitor-list-table-wrapper");
  if (!wrapper) return;

  if (AppState.dtInstance) {
    AppState.dtInstance.destroy();
    AppState.dtInstance = null;
  }

  if (AppState.transactionUsers.length === 0) {
    wrapper.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-search-heart-fill"></i>
        Choose user from add data
      </div>
    `;
    return;
  }

  wrapper.innerHTML = `
    <table id="tempUser-table" class="table table-hover mb-0">
      <thead>
        <tr>
          <th>No</th>
          <th>Name</th>
          <th>Identity Number</th>
          <th>Electronic Device</th>
          <th>Items Bring</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${buildTableRows()}
      </tbody>
    </table>
  `;

  const tableEl = wrapper.querySelector("#tempUser-table");
  AppState.dtInstance = new DataTable(tableEl, {
    searchable: true,
    fixedHeight: false,
    perPageSelect: [10, 25, 50],
    labels: {
      placeholder: "Search...",
      perPage: " ",
      noRows: "Not found",
      info: "Showing {start}-{end} from {rows} data",
    },
  });

  attachTableEventListeners();
}

// EDIT & DELETE
async function editUserData(id) {
  const userData = AppState.getUser(id);
  if (!userData) return;

  AppState.currentEditId = id;

  const modalEl = document.querySelector("#modal-list-visitor");
  const userCardList = modalEl?.querySelector(".user-card-list");
  if (!modalEl || !userCardList) return;

  AppState.destroyAllChoicesInstances();
  userCardList.replaceChildren();

  const { visitors, bringItemCategories } = await fetchModalReferenceData();

  userData.users.forEach((user, index) => {
    const userCard = buildUserCard(visitors, bringItemCategories, index !== 0);

    userCardList.appendChild(userCard);

    const nameSelect = userCard.querySelector(".user-name");
    const idSelect = userCard.querySelector(".identity-number");

    console.log("Edit data user:", user);

    setSelectValue(nameSelect, user.userName);
    setSelectValue(idSelect, user.identityNumber);

    const deviceList = userCard.querySelector(".device-list");
    if (deviceList) {
      deviceList.replaceChildren();

      const devices = user.devices && user.devices.length > 0 ? user.devices : [""];

      devices.forEach((device, idx) => {
        const deviceItem = document.createElement("div");
        deviceItem.className = "device-item d-flex align-items-center gap-2 mb-2";
        deviceItem.innerHTML = `
          <select name="electronicDevice[]" class="form-select electronic-device">
            <option value="">Select</option>
            <option value="laptop">Laptop</option>
            <option value="handphone">Handphone</option>
            <option value="camera">Camera</option>
          </select>

          <button type="button" class="btn btn-add btn-more-device" data-action="add-device">
            <i class="bi bi-plus-circle"></i>
          </button>

          <button type="button" class="btn btn-remove-device ${idx === 0 ? "d-none" : ""}" data-action="remove-device">
            <i class="bi bi-trash"></i>
          </button>
        `;

        deviceList.appendChild(deviceItem);

        const select = deviceItem.querySelector(".electronic-device");
        if (select) select.value = device || "";
      });

      updateDeviceButtons(userCard);
    }

    const itemBawaanList = userCard.querySelector(".item-bawaan-list");
    if (itemBawaanList) {
      itemBawaanList.replaceChildren();

      const items = user.itemsBawaan && user.itemsBawaan.length > 0 ? user.itemsBawaan : [""];

      items.forEach((itemValue, idx) => {
        const itemBawaanEl = document.createElement("div");
        itemBawaanEl.className = "item-bawaan-item d-flex align-items-center gap-2 mb-2";
        itemBawaanEl.innerHTML = `
          <select name="itemBawaan[]" class="form-select item-bawaan">
            <option value="">Select</option>
            ${createItemBawaanOptions(bringItemCategories)}
          </select>

          <button type="button" class="btn btn-add btn-more-item-bawaan" data-action="add-item-bawaan">
            <i class="bi bi-plus-circle"></i>
          </button>

          <button type="button" class="btn btn-remove-item-bawaan ${idx === 0 ? "d-none" : ""}" data-action="remove-item-bawaan">
            <i class="bi bi-trash"></i>
          </button>
        `;

        itemBawaanList.appendChild(itemBawaanEl);

        const select = itemBawaanEl.querySelector(".item-bawaan");
        if (select) select.value = itemValue || "";
      });

      updateItemBawaanButtons(userCard);
    }
  });

  updateModalScroll();
  const modalInstance = getUserModalInstance();
  modalInstance?.show();
}

function deleteUserData(id) {
  Swal.fire({
    title: "Delete Confirmation",
    text: "Are you sure want to delete this user data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      AppState.removeUser(id);
      loadTableUserList();
      Swal.fire("Deleted!", "User data has been deleted.", "success");
    }
  });
}

// FORM EVENT HANDLERS
function setupFormEventHandlers(formModal) {
  if (!formModal) return;

  const btnClone = formModal.querySelector("#btn-clone-add-user");
  if (btnClone && btnClone.dataset.bound !== "true") {
    btnClone.dataset.bound = "true";
    btnClone.addEventListener("click", (e) => {
      e.preventDefault();
      addMoreUserToModal();
    });
  }

  if (formModal.dataset.bound !== "true") {
    formModal.dataset.bound = "true";

    formModal.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.dataset.action;
      const userCard = actionButton.closest(".user-card");

      if (action === "add-device") {
        event.preventDefault();
        if (userCard) addDevice(userCard);
      }

      if (action === "remove-device") {
        event.preventDefault();
        const deviceItem = actionButton.closest(".device-item");
        if (deviceItem) removeDevice(deviceItem);
      }

      if (action === "add-item-bawaan") {
        event.preventDefault();
        if (userCard) addItemBawaan(userCard);
      }

      if (action === "remove-item-bawaan") {
        event.preventDefault();
        const itemBawaanItem = actionButton.closest(".item-bawaan-item");
        if (itemBawaanItem) removeItemBawaan(itemBawaanItem);
      }

      if (action === "remove-user") {
        event.preventDefault();
        if (userCard) removeUser(userCard);
      }
    });
  }

  const submitBtn = document.querySelector("#add-user");
  if (submitBtn && submitBtn.dataset.bound !== "true") {
    submitBtn.dataset.bound = "true";
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const tempUsersData = getModalFormData();

      if (tempUsersData.length === 0) {
        Swal.fire("Warning", "Please add at least one user", "warning");
        return;
      }

      if (AppState.currentEditId) {
        AppState.updateUser(AppState.currentEditId, { users: tempUsersData });
        AppState.currentEditId = null;
        Swal.fire("Success", "User data updated successfully", "success");
      } else {
        AppState.addUser({ users: tempUsersData });
        Swal.fire("Success", "User data added successfully", "success");
      }

      resetModalForm();

      const modalInstance = getUserModalInstance();
      modalInstance?.hide();

      loadTableUserList();
    });
  }
}

// MAIN FORM CONFIGURATION
const localeEn = localeEnModule.default || localeEnModule;

function visitPlanDate() {
  const startDate = document.querySelector("#start-date");
  const endDate = document.querySelector("#end-date");

  if (!startDate || !endDate) return;

  const today = new Date();

  const datepickerOptions = {
    locale: localeEn,
    autoClose: true,
    dateFormat: "dd/MM/yyyy",
    minDate: today,
  };
  console.log(localeEn);

  const endDatePicker = new AirDatepicker(endDate, datepickerOptions);

  const startDatePicker = new AirDatepicker(startDate, {
    ...datepickerOptions,

    onSelect({ date }) {
      if (date) {
        endDatePicker.update({
          minDate: date,
        });

        endDatePicker.show();
      }
    },
  });

  return {
    startDatePicker,
    endDatePicker,
  };
}

function buildAppointmentPayloads(mainForm) {
  const formData = new FormData(mainForm);
  const appointmentFields = Object.fromEntries(formData);

  return AppState.transactionUsers.flatMap((group) =>
    group.users.map((user) => ({
      username: user.userName,
      identity_number: user.identityNumber,
      electronic_device: user.devices,
      items_bawaan: user.itemsBawaan,
      company_origin: appointmentFields.companyOrigin,
      purpose: appointmentFields.purpose_,
      vehicle_type: appointmentFields.vehicleType,
      license_plate: appointmentFields.licensePlate,
      employee_target: appointmentFields.employeeTarget,
      target_department: appointmentFields.targetDepartment,
      visit_plan: {
        start_date: appointmentFields.startDate,
        end_date: appointmentFields.endDate,
      },
    })),
  );
}

function setupMainFormHandler(mainForm) {
  if (!mainForm) return;

  if (mainForm.dataset.bound === "true") return;
  mainForm.dataset.bound = "true";

  mainForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (AppState.transactionUsers.length === 0) {
      Swal.fire("Warning", "Please add user data first", "warning");
      return;
    }

    const payloads = buildAppointmentPayloads(mainForm);
    console.log("Payloads to send (1 request per user):", payloads);

    Swal.fire("Success", "Appointment created successfully", "success").then(() => {
      AppState.clear();
      mainForm.reset();
      loadTableUserList();
    });
  });
}

// CONTENT
function createAppointmentContent() {
  const page = document.createElement("div");
  page.innerHTML = `
    <div class="page-title d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
      <div>
        <h1 class="text-primary mb-3">Create Visit Schedule</h1>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal-list-visitor"><i class="bi bi-plus-lg me-1"></i>Add User</button>
      </div>
    </div>

    <form action="" id="main-transaction-form">
      <div class="table-card mb-4 p-4">
        <h3 class="text-dark section-title fw-semibold">Data User</h3>
        <div class="visitor-list-table-wrapper"></div>
      </div>

      <div class="table-card mb-4 p-4">
        <h3 class="text-dark section-title fw-semibold mb-4">Detail Appointment</h3>

        <div class="row">
          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="visit-plan" class="form-label">Visit Plan</label>
            </div>
            <div class="col-10 d-flex gap-2">
              <div class="start-date">
                <input type="input" class="form-control" id="start-date" name="startDate" placeholder="Start Date" />
                <i class="bi bi-calendar-event"></i>
              </div>
              <div class="end-date">
                <input type="input" class="form-control" id="end-date" name="endDate" placeholder="End Date" />
                <i class="bi bi-calendar-event"></i>
              </div>
            </div>
          </div>

          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="company-origin" class="form-label">Company Origin</label>
            </div>
            <div class="col-10">
              <select name="companyOrigin" id="company-origin" class="form-select">
                <option value="">Select</option>
              </select>
            </div>
          </div>

          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="purpose" class="form-label">Purpose</label>
            </div>
            <div class="col-10">
              <select name="purpose_" id="purpose" class="form-select">
                <option value="">Select</option>
              </select>
            </div>
          </div>

          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="vehicle-type" class="form-label">Vehicle Type</label>
            </div>
            <div class="col-10">
              <select name="vehicleType" id="vehicle-type" class="form-select">
                <option value="">Select</option>
              </select>
            </div>
          </div>

          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="license-plate" class="form-label">License Plate</label>
            </div>
            <div class="col-10">
              <input type="text" class="form-control" name="licensePlate" id="license-plate" required />
            </div>
          </div>

          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="employee-target" class="form-label">Employee Target</label>
            </div>
            <div class="col-10">
              <select name="employeeTarget" id="employee-target" class="form-select">
                <option value="">Select</option>
              </select>
            </div>
          </div>

          <div class="mb-3 form-group">
            <div class="col-2">
              <label for="target-department" class="form-label">Department Target</label>
            </div>
            <div class="col-10">
              <input type="text" class="form-control" id="target-department" name="targetDepartment" readonly />
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button type="submit" class="btn btn-primary rounded-5" id="create-submit">Submit</button>
        </div>
    </div>
    </form>

    <!-- MODAL ADD USER -->
    <div class="modal fade" id="modal-list-visitor" tabindex="-1">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title section-title">Add Visitor</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <form action="" id="form-modal">
              <div class="user-card-list"></div>
              <button type="button" class="btn btn-outline-secondary btn-modal-clone" id="btn-clone-add-user">Add more user</button>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-modal-submit" id="add-user">
              <i class="bi bi-person-add"></i>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(async () => {
    const formModal = page.querySelector("#form-modal");
    const mainForm = page.querySelector("#main-transaction-form");

    setupFormEventHandlers(formModal);
    setupMainFormHandler(mainForm);
    visitPlanDate();

    const modalEl = page.querySelector("#modal-list-visitor");
    if (modalEl && modalEl.dataset.boundCleanup !== "true") {
      modalEl.dataset.boundCleanup = "true";
      modalEl.addEventListener("hidden.bs.modal", () => {
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("padding-right");
        document.body.style.removeProperty("overflow");
        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      });
    }

    await resetModalForm();
    loadTableUserList();
  }, 0);

  return page;
}

export function CreateAppointmentPage() {
  return DashboardLayout(createAppointmentContent);
}
