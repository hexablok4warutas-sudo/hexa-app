"use strict";


// ======================================================
// HEXA BACKLOG REGISTRATION
// backlog-registration.js
// ======================================================


// ======================================================
// 1. SESSION PROTECTION
// ======================================================

const hexaLoggedIn =
  sessionStorage.getItem(
    "hexaLoggedIn"
  );

const hexaUserData =
  sessionStorage.getItem(
    "hexaUser"
  );


if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {

  window.location.replace(
    "index.html"
  );

}


// ======================================================
// 2. CURRENT USER
// ======================================================

let currentUser = null;


try {

  currentUser =
    JSON.parse(
      hexaUserData
    );

} catch (error) {

  sessionStorage.removeItem(
    "hexaLoggedIn"
  );

  sessionStorage.removeItem(
    "hexaUser"
  );

  window.location.replace(
    "index.html"
  );

}


// ======================================================
// 3. ELEMENTS
// ======================================================

const backButton =
  document.getElementById(
    "registrationBackButton"
  );

const searchInput =
  document.getElementById(
    "registrationSearch"
  );

const filterButton =
  document.getElementById(
    "registrationFilterButton"
  );

const filterPanel =
  document.getElementById(
    "registrationFilterPanel"
  );

const statusFilter =
  document.getElementById(
    "registrationStatusFilter"
  );

const clearFilterButton =
  document.getElementById(
    "registrationClearFilter"
  );

const addButton =
  document.getElementById(
    "registrationAddButton"
  );

const emptyAddButton =
  document.getElementById(
    "registrationEmptyAddButton"
  );

const registrationList =
  document.getElementById(
    "registrationList"
  );

const emptyState =
  document.getElementById(
    "registrationEmpty"
  );

const resultCount =
  document.getElementById(
    "registrationResultCount"
  );


// ======================================================
// 4. REGISTRATION DATA
//
// NANTI DIGANTI DATA API.
// UNTUK SEKARANG KOSONG.
// ======================================================

let registrationData = [];


// ======================================================
// 5. BACK
// ======================================================

if (backButton) {

  backButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "backlog-monitoring.html";

    }
  );

}


// ======================================================
// 6. ADD REGISTRATION
// ======================================================

function openAddRegistration() {

  window.location.href =
    "backlog-registration-form.html";

}



if (addButton) {

  addButton.addEventListener(
    "click",
    openAddRegistration
  );

}


if (emptyAddButton) {

  emptyAddButton.addEventListener(
    "click",
    openAddRegistration
  );

}


// ======================================================
// 7. FILTER PANEL
// ======================================================

if (
  filterButton &&
  filterPanel
) {

  filterButton.addEventListener(
    "click",
    function () {

      filterPanel.hidden =
        !filterPanel.hidden;

    }
  );

}


// ======================================================
// 8. CLEAR FILTER
// ======================================================

if (clearFilterButton) {

  clearFilterButton.addEventListener(
    "click",
    function () {

      if (statusFilter) {

        statusFilter.value = "";

      }


      if (searchInput) {

        searchInput.value = "";

      }


      renderRegistrationList();

    }
  );

}


// ======================================================
// 9. SEARCH / FILTER EVENTS
// ======================================================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderRegistrationList
  );

}


if (statusFilter) {

  statusFilter.addEventListener(
    "change",
    renderRegistrationList
  );

}


// ======================================================
// 10. FILTER DATA
// ======================================================

function getFilteredRegistrations() {

  const keyword =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const selectedStatus =
    statusFilter
      ? statusFilter.value
      : "";


  return registrationData.filter(
    function (registration) {

      const searchableText = [
        registration.registrationNo,
        registration.createdBy,
        registration.status
      ]
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        keyword === "" ||
        searchableText.includes(
          keyword
        );


      const matchesStatus =
        selectedStatus === "" ||
        registration.status ===
          selectedStatus;


      return (
        matchesSearch &&
        matchesStatus
      );

    }
  );

}


// ======================================================
// 11. STATUS LABEL
// ======================================================

function getStatusLabel(status) {

  const labels = {

    DRAFT:
      "Draft",

    SUBMITTED:
      "Submitted",

    WAITING_GL_APPROVAL:
      "Waiting GL Approval",

    WAITING_SECTION_APPROVAL:
      "Waiting Section Approval",

    FULL_APPROVED:
      "Full Approved",

    REJECTED:
      "Revision Required"

  };


  return (
    labels[status] ||
    status ||
    "-"
  );

}


// ======================================================
// 12. RENDER LIST
// ======================================================

function renderRegistrationList() {

  if (
    !registrationList ||
    !emptyState
  ) {

    return;

  }


  const data =
    getFilteredRegistrations();


  registrationList.innerHTML = "";


  if (resultCount) {

    resultCount.textContent =
      data.length +
      (
        data.length === 1
          ? " registration"
          : " registrations"
      );

  }


  if (data.length === 0) {

    emptyState.hidden = false;

    updateSummary();

    return;

  }


  emptyState.hidden = true;


  data.forEach(
    function (registration) {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "registration-card";


      card.innerHTML = `
        <strong>
          ${escapeHtml(
            registration.registrationNo
          )}
        </strong>

        <div>
          ${escapeHtml(
            getStatusLabel(
              registration.status
            )
          )}
        </div>
      `;


      registrationList.appendChild(
        card
      );

    }
  );


  updateSummary();

}


// ======================================================
// 13. SUMMARY
// ======================================================

function updateSummary() {

  const totalElement =
    document.getElementById(
      "registrationTotal"
    );

  const draftElement =
    document.getElementById(
      "registrationDraft"
    );

  const waitingElement =
    document.getElementById(
      "registrationWaiting"
    );

  const approvedElement =
    document.getElementById(
      "registrationApproved"
    );


  const draft =
    registrationData.filter(
      function (item) {

        return (
          item.status === "DRAFT"
        );

      }
    ).length;


  const waiting =
    registrationData.filter(
      function (item) {

        return (
          item.status ===
            "SUBMITTED" ||

          item.status ===
            "WAITING_GL_APPROVAL" ||

          item.status ===
            "WAITING_SECTION_APPROVAL"
        );

      }
    ).length;


  const approved =
    registrationData.filter(
      function (item) {

        return (
          item.status ===
            "FULL_APPROVED"
        );

      }
    ).length;


  if (totalElement) {

    totalElement.textContent =
      registrationData.length;

  }


  if (draftElement) {

    draftElement.textContent =
      draft;

  }


  if (waitingElement) {

    waitingElement.textContent =
      waiting;

  }


  if (approvedElement) {

    approvedElement.textContent =
      approved;

  }

}


// ======================================================
// 14. SAFE HTML
// ======================================================

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// ======================================================
// 15. INITIALIZE
// ======================================================

function initializeBacklogRegistration() {

  renderRegistrationList();


  console.log(
    "HEXA Backlog Registration Ready"
  );

}


initializeBacklogRegistration();
