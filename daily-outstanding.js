"use strict";


// =====================================================
// HEXA DAILY OUTSTANDING
// =====================================================


// =====================================================
// API
// =====================================================

const HEXA_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


// =====================================================
// SESSION PROTECTION
// =====================================================

const hexaLoggedIn =
  sessionStorage.getItem(
    "hexaLoggedIn"
  );

const hexaUserRaw =
  sessionStorage.getItem(
    "hexaUser"
  );

if (
  hexaLoggedIn !== "true" ||
  !hexaUserRaw
) {

  window.location.replace(
    "index.html"
  );
}


// =====================================================
// USER
// =====================================================

let currentUser = null;

try {

  currentUser =
    JSON.parse(
      hexaUserRaw
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


// =====================================================
// STATE
// =====================================================

let outstandingData = [];

let filteredData = [];

let selectedRecord = null;

let selectedRating = "";

let selectedPartsStatus = "";

let replacementPhoto = null;

let evidenceFile = null;

let photoZoom = 1;

let pageInitialized = false;


// =====================================================
// DOM REFERENCES
// =====================================================

let filterButton;
let filterPanel;
let closeFilterButton;

let filterUnitCode;
let filterProblem;
let filterDate;
let filterMol;

let resetFilterButton;
let applyFilterButton;

let outstandingLoading;
let outstandingEmpty;
let outstandingError;

let outstandingScrollContainer;
let outstandingList;

let scrollNavigation;
let scrollUpButton;
let scrollDownButton;

let detailModal;
let detailPhotoButton;
let detailPhoto;

let detailUnitCode;
let detailHmInspection;
let detailDateInspection;
let detailGroupComponent;
let detailProblemDescription;
let detailRating;
let detailPartsDescription;
let detailMol;
let detailPartsStatus;

let editOutstandingButton;
let closeDetailButton;

let photoViewer;
let photoViewerImage;
let zoomOutButton;
let zoomInButton;
let resetZoomButton;
let closePhotoViewerButton;

let updateModal;
let updateOutstandingForm;

let updateInspectionId;
let updateUnitCode;
let updateHmInspection;
let updateDateInspection;
let updateInspectionPhoto;
let updateInspectionPhotoPreview;
let updateGroupComponent;
let updateProblemDescription;
let updateRating;
let updateRatingGrid;
let updatePartsDescription;
let updatePartNo;
let updateQuantity;
let updateNotes;
let updateMol;
let updateEvidence;
let evidenceFileText;
let existingEvidence;
let partsStatusGrid;
let updatePartsStatus;
let updateStatus;
let updateActionProblems;
let updateHmAction;
let updateDateAction;
let updateManPower;

let updateHmMinus;
let updateHmPlus;
let updateHmActionMinus;
let updateHmActionPlus;

let cancelUpdateButton;
let submitUpdateButton;

let startInspectionShortcut;


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    if (pageInitialized) {
      return;
    }

    pageInitialized = true;

    cacheElements();

    bindEvents();

    initializeSearch();

    loadDailyOutstanding();

  }
);


// =====================================================
// CACHE ELEMENTS
// =====================================================

function cacheElements() {

  filterButton =
    document.getElementById(
      "filterButton"
    );

  filterPanel =
    document.getElementById(
      "filterPanel"
    );

  closeFilterButton =
    document.getElementById(
      "closeFilterButton"
    );

  filterUnitCode =
    document.getElementById(
      "filterUnitCode"
    );

  filterProblem =
    document.getElementById(
      "filterProblem"
    );

  filterDate =
    document.getElementById(
      "filterDate"
    );

  filterMol =
    document.getElementById(
      "filterMol"
    );

  resetFilterButton =
    document.getElementById(
      "resetFilterButton"
    );

  applyFilterButton =
    document.getElementById(
      "applyFilterButton"
    );

  outstandingLoading =
    document.getElementById(
      "outstandingLoading"
    );

  outstandingEmpty =
    document.getElementById(
      "outstandingEmpty"
    );

  outstandingError =
    document.getElementById(
      "outstandingError"
    );

  outstandingScrollContainer =
    document.getElementById(
      "outstandingScrollContainer"
    );

  outstandingList =
    document.getElementById(
      "outstandingList"
    );

  scrollNavigation =
    document.getElementById(
      "scrollNavigation"
    );

  scrollUpButton =
    document.getElementById(
      "scrollUpButton"
    );

  scrollDownButton =
    document.getElementById(
      "scrollDownButton"
    );

  detailModal =
    document.getElementById(
      "detailModal"
    );

  detailPhotoButton =
    document.getElementById(
      "detailPhotoButton"
    );

  detailPhoto =
    document.getElementById(
      "detailPhoto"
    );

  detailUnitCode =
    document.getElementById(
      "detailUnitCode"
    );

  detailHmInspection =
    document.getElementById(
      "detailHmInspection"
    );

  detailDateInspection =
    document.getElementById(
      "detailDateInspection"
    );

  detailGroupComponent =
    document.getElementById(
      "detailGroupComponent"
    );

  detailProblemDescription =
    document.getElementById(
      "detailProblemDescription"
    );

  detailRating =
    document.getElementById(
      "detailRating"
    );

  detailPartsDescription =
    document.getElementById(
      "detailPartsDescription"
    );

  detailMol =
    document.getElementById(
      "detailMol"
    );

  detailPartsStatus =
    document.getElementById(
      "detailPartsStatus"
    );

  editOutstandingButton =
    document.getElementById(
      "editOutstandingButton"
    );

  closeDetailButton =
    document.getElementById(
      "closeDetailButton"
    );

  photoViewer =
    document.getElementById(
      "photoViewer"
    );

  photoViewerImage =
    document.getElementById(
      "photoViewerImage"
    );

  zoomOutButton =
    document.getElementById(
      "zoomOutButton"
    );

  zoomInButton =
    document.getElementById(
      "zoomInButton"
    );

  resetZoomButton =
    document.getElementById(
      "resetZoomButton"
    );

  closePhotoViewerButton =
    document.getElementById(
      "closePhotoViewerButton"
    );

  updateModal =
    document.getElementById(
      "updateModal"
    );

  updateOutstandingForm =
    document.getElementById(
      "updateOutstandingForm"
    );

  updateInspectionId =
    document.getElementById(
      "updateInspectionId"
    );

  updateUnitCode =
    document.getElementById(
      "updateUnitCode"
    );

  updateHmInspection =
    document.getElementById(
      "updateHmInspection"
    );

  updateDateInspection =
    document.getElementById(
      "updateDateInspection"
    );

  updateInspectionPhoto =
    document.getElementById(
      "updateInspectionPhoto"
    );

  updateInspectionPhotoPreview =
    document.getElementById(
      "updateInspectionPhotoPreview"
    );

  updateGroupComponent =
    document.getElementById(
      "updateGroupComponent"
    );

  updateProblemDescription =
    document.getElementById(
      "updateProblemDescription"
    );

  updateRating =
    document.getElementById(
      "updateRating"
    );

  updateRatingGrid =
    document.getElementById(
      "updateRatingGrid"
    );

  updatePartsDescription =
    document.getElementById(
      "updatePartsDescription"
    );

  updatePartNo =
    document.getElementById(
      "updatePartNo"
    );

  updateQuantity =
    document.getElementById(
      "updateQuantity"
    );

  updateNotes =
    document.getElementById(
      "updateNotes"
    );

  updateMol =
    document.getElementById(
      "updateMol"
    );

  updateEvidence =
    document.getElementById(
      "updateEvidence"
    );

  evidenceFileText =
    document.getElementById(
      "evidenceFileText"
    );

  existingEvidence =
    document.getElementById(
      "existingEvidence"
    );

  partsStatusGrid =
    document.getElementById(
      "partsStatusGrid"
    );

  updatePartsStatus =
    document.getElementById(
      "updatePartsStatus"
    );

  updateStatus =
    document.getElementById(
      "updateStatus"
    );

  updateActionProblems =
    document.getElementById(
      "updateActionProblems"
    );

  updateHmAction =
    document.getElementById(
      "updateHmAction"
    );

  updateDateAction =
    document.getElementById(
      "updateDateAction"
    );

  updateManPower =
    document.getElementById(
      "updateManPower"
    );

  updateHmMinus =
    document.getElementById(
      "updateHmMinus"
    );

  updateHmPlus =
    document.getElementById(
      "updateHmPlus"
    );

  updateHmActionMinus =
    document.getElementById(
      "updateHmActionMinus"
    );

  updateHmActionPlus =
    document.getElementById(
      "updateHmActionPlus"
    );

  cancelUpdateButton =
    document.getElementById(
      "cancelUpdateButton"
    );

  submitUpdateButton =
    document.getElementById(
      "submitUpdateButton"
    );

  startInspectionShortcut =
    document.getElementById(
      "startInspectionShortcut"
    );
}


// =====================================================
// EVENTS
// =====================================================

function bindEvents() {

  if (filterButton) {

    filterButton.addEventListener(
      "click",
      toggleFilterPanel
    );
  }


  if (closeFilterButton) {

    closeFilterButton.addEventListener(
      "click",
      closeFilterPanel
    );
  }


  if (applyFilterButton) {

    applyFilterButton.addEventListener(
      "click",
      applyFilters
    );
  }


  if (resetFilterButton) {

    resetFilterButton.addEventListener(
      "click",
      resetFilters
    );
  }


  if (filterProblem) {

    filterProblem.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          applyFilters();
        }
      }
    );
  }


  if (scrollUpButton) {

    scrollUpButton.addEventListener(
      "click",
      function () {

        outstandingScrollContainer
          ?.scrollBy({

            top: -250,

            behavior: "smooth"

          });
      }
    );
  }


  if (scrollDownButton) {

    scrollDownButton.addEventListener(
      "click",
      function () {

        outstandingScrollContainer
          ?.scrollBy({

            top: 250,

            behavior: "smooth"

          });
      }
    );
  }


  if (closeDetailButton) {

    closeDetailButton.addEventListener(
      "click",
      closeDetail
    );
  }


  if (editOutstandingButton) {

    editOutstandingButton.addEventListener(
      "click",
      openUpdateForm
    );
  }


  if (detailPhotoButton) {

    detailPhotoButton.addEventListener(
      "click",
      openPhotoViewer
    );
  }


  if (closePhotoViewerButton) {

    closePhotoViewerButton.addEventListener(
      "click",
      closePhotoViewer
    );
  }


  if (zoomInButton) {

    zoomInButton.addEventListener(
      "click",
      function () {

        setPhotoZoom(
          photoZoom + 0.25
        );
      }
    );
  }


  if (zoomOutButton) {

    zoomOutButton.addEventListener(
      "click",
      function () {

        setPhotoZoom(
          photoZoom - 0.25
        );
      }
    );
  }


  if (resetZoomButton) {

    resetZoomButton.addEventListener(
      "click",
      function () {

        setPhotoZoom(
          1
        );
      }
    );
  }


  if (cancelUpdateButton) {

    cancelUpdateButton.addEventListener(
      "click",
      closeUpdateForm
    );
  }


  if (updateOutstandingForm) {

    updateOutstandingForm.addEventListener(
      "submit",
      submitOutstandingUpdate
    );
  }


  if (updateInspectionPhoto) {

    updateInspectionPhoto.addEventListener(
      "change",
      handleReplacementPhoto
    );
  }


  if (updateEvidence) {

    updateEvidence.addEventListener(
      "change",
      handleEvidenceFile
    );
  }


  if (updateRatingGrid) {

    updateRatingGrid.addEventListener(
      "click",
      handleRatingSelection
    );
  }


  if (partsStatusGrid) {

    partsStatusGrid.addEventListener(
      "click",
      handlePartsStatusSelection
    );
  }


  bindNumberControl(
    updateHmMinus,
    updateHmPlus,
    updateHmInspection
  );


  bindNumberControl(
    updateHmActionMinus,
    updateHmActionPlus,
    updateHmAction
  );


  if (startInspectionShortcut) {

    startInspectionShortcut.addEventListener(
      "click",
      function () {

        window.location.href =
          "/start-inspection";
      }
    );
  }


  document.addEventListener(
    "keydown",
    handleEscapeKey
  );
}


// =====================================================
// GLOBAL HEADER SEARCH
// =====================================================

function initializeSearch() {

  /*
    hexa-header.js melakukan inject header
    pada DOMContentLoaded.

    Karena hexa-header.js dimuat sebelum file ini,
    searchInput sudah tersedia saat listener ini jalan.
  */

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener(
    "input",
    function () {

      const query =
        searchInput.value
          .trim()
          .toLowerCase();

      if (!query) {

        applyFilters();

        return;
      }

      const base =
        getFilterBaseData();

      filteredData =
        base.filter(
          function (item) {

            return (

              normalizeText(
                item.unitCode
              ).includes(
                query
              ) ||

              normalizeText(
                item.problemDescription
              ).includes(
                query
              ) ||

              normalizeText(
                item.groupComponent
              ).includes(
                query
              ) ||

              normalizeText(
                item.rating
              ).includes(
                query
              ) ||

              normalizeText(
                item.partsDescription
              ).includes(
                query
              )

            );
          }
        );

      renderOutstandingList(
        filteredData
      );
    }
  );
}


// =====================================================
// API REQUEST
// =====================================================

async function apiRequest(
  payload
) {

  const response =
    await fetch(
      HEXA_API_URL,
      {

        method: "POST",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify(
            payload
          )

      }
    );

  if (!response.ok) {

    throw new Error(
      "HTTP " +
      response.status
    );
  }

  const text =
    await response.text();

  let result;

  try {

    result =
      JSON.parse(
        text
      );

  } catch (error) {

    throw new Error(
      "Response API bukan JSON yang valid."
    );
  }

  return result;
}


// =====================================================
// LOAD DAILY OUTSTANDING
// =====================================================

async function loadDailyOutstanding() {

  showLoadingState();

  try {

    const result =
      await apiRequest({

        action:
          "getDailyOutstanding"

      });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Gagal mengambil Daily Outstanding."
      );
    }

    outstandingData =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    filteredData =
      [...outstandingData];

    populateUnitFilter();

    populateUpdateUnitOptions();

    renderOutstandingList(
      filteredData
    );

  } catch (error) {

    console.error(
      "Daily Outstanding:",
      error
    );

    showErrorState(
      error.message
    );
  }
}


// =====================================================
// UI STATES
// =====================================================

function showLoadingState() {

  if (outstandingLoading) {
    outstandingLoading.hidden =
      false;
  }

  if (outstandingEmpty) {
    outstandingEmpty.hidden =
      true;
  }

  if (outstandingError) {
    outstandingError.hidden =
      true;
  }

  if (outstandingScrollContainer) {
    outstandingScrollContainer.hidden =
      true;
  }

  if (scrollNavigation) {
    scrollNavigation.hidden =
      true;
  }
}


function showErrorState(
  message
) {

  if (outstandingLoading) {
    outstandingLoading.hidden =
      true;
  }

  if (outstandingEmpty) {
    outstandingEmpty.hidden =
      true;
  }

  if (outstandingScrollContainer) {
    outstandingScrollContainer.hidden =
      true;
  }

  if (scrollNavigation) {
    scrollNavigation.hidden =
      true;
  }

  if (outstandingError) {

    outstandingError.textContent =
      message ||
      "Data Daily Outstanding gagal dimuat.";

    outstandingError.hidden =
      false;
  }
}


// =====================================================
// RENDER LIST
// =====================================================

function renderOutstandingList(
  records
) {

  if (!outstandingList) {
    return;
  }

  outstandingList.innerHTML =
    "";

  if (outstandingLoading) {
    outstandingLoading.hidden =
      true;
  }

  if (outstandingError) {
    outstandingError.hidden =
      true;
  }

  if (
    !records ||
    records.length === 0
  ) {

    if (outstandingEmpty) {
      outstandingEmpty.hidden =
        false;
    }

    if (outstandingScrollContainer) {
      outstandingScrollContainer.hidden =
        true;
    }

    if (scrollNavigation) {
      scrollNavigation.hidden =
        true;
    }

    return;
  }

  if (outstandingEmpty) {
    outstandingEmpty.hidden =
      true;
  }

  if (outstandingScrollContainer) {
    outstandingScrollContainer.hidden =
      false;
  }

  records.forEach(
    function (record) {

      outstandingList.appendChild(
        createOutstandingItem(
          record
        )
      );
    }
  );

  updateScrollNavigation();
}


// =====================================================
// CREATE LIST ITEM
// =====================================================

function createOutstandingItem(
  record
) {

  const item =
    document.createElement(
      "div"
    );

  item.className =
    "outstanding-item";

  item.dataset.id =
    record.id || "";

  item.tabIndex =
    0;


  // PHOTO

  const photoWrap =
    document.createElement(
      "div"
    );

  photoWrap.className =
    "outstanding-item-photo";


  const photo =
    document.createElement(
      "img"
    );

  photo.alt =
    record.unitCode
      ? "Photo " +
        record.unitCode
      : "Inspection Photo";

  photo.loading =
    "lazy";

  photo.src =
    getDriveImageUrl(
      record.photo
    );

  photo.onerror =
    function () {

      this.onerror =
        null;

      this.src =
        createPhotoPlaceholder();
    };

  photoWrap.appendChild(
    photo
  );


  // INFORMATION

  const info =
    document.createElement(
      "div"
    );

  info.className =
    "outstanding-item-information";


  const unit =
    document.createElement(
      "div"
    );

  unit.className =
    "outstanding-item-unit";

  unit.textContent =
    record.unitCode ||
    "-";


  const problem =
    document.createElement(
      "div"
    );

  problem.className =
    "outstanding-item-problem";

  problem.textContent =
    record.problemDescription ||
    "-";


  info.appendChild(
    unit
  );

  info.appendChild(
    problem
  );


  // MOL

  const mol =
    document.createElement(
      "div"
    );

  mol.className =
    "outstanding-item-mol";

  if (
    normalizeText(
      record.mol
    ) === "submitted"
  ) {

    mol.classList.add(
      "submitted"
    );
  }

  mol.textContent =
    record.mol ||
    "Belum";


  // EDIT ICON

  const edit =
    document.createElement(
      "button"
    );

  edit.type =
    "button";

  edit.className =
    "outstanding-item-edit";

  edit.setAttribute(
    "aria-label",
    "Edit " +
      (
        record.unitCode ||
        "Outstanding"
      )
  );

  edit.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M4 20h4L19 9l-4-4L4 16v4z"></path>
      <path d="M13.5 6.5l4 4"></path>
    </svg>
  `;


  // ROW CLICK -> DETAIL

  item.addEventListener(
    "click",
    function () {

      openDetail(
        record.id
      );
    }
  );


  item.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openDetail(
          record.id
        );
      }
    }
  );


  // EDIT ICON -> UPDATE FORM

  edit.addEventListener(
    "click",
    async function (event) {

      event.stopPropagation();

      await loadRecordDetail(
        record.id
      );

      if (selectedRecord) {

        fillUpdateForm(
          selectedRecord
        );

        showUpdateModal();
      }
    }
  );


  item.appendChild(
    photoWrap
  );

  item.appendChild(
    info
  );

  item.appendChild(
    mol
  );

  item.appendChild(
    edit
  );

  return item;
}


// =====================================================
// FILTER
// =====================================================

function toggleFilterPanel() {

  if (!filterPanel) {
    return;
  }

  const willOpen =
    filterPanel.hidden;

  filterPanel.hidden =
    !willOpen;

  filterButton?.setAttribute(
    "aria-expanded",
    willOpen
      ? "true"
      : "false"
  );
}


function closeFilterPanel() {

  if (!filterPanel) {
    return;
  }

  filterPanel.hidden =
    true;

  filterButton?.setAttribute(
    "aria-expanded",
    "false"
  );
}


function populateUnitFilter() {

  if (!filterUnitCode) {
    return;
  }

  const currentValue =
    filterUnitCode.value;

  const units =
    [
      ...new Set(

        outstandingData
          .map(
            function (item) {

              return (
                item.unitCode ||
                ""
              ).trim();
            }
          )
          .filter(Boolean)

      )
    ].sort();

  filterUnitCode.innerHTML =
    `<option value="">All Unit</option>`;

  units.forEach(
    function (unit) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        unit;

      option.textContent =
        unit;

      filterUnitCode.appendChild(
        option
      );
    }
  );

  if (
    units.includes(
      currentValue
    )
  ) {

    filterUnitCode.value =
      currentValue;
  }
}


function getFilterBaseData() {

  let result =
    [...outstandingData];

  const unit =
    filterUnitCode?.value ||
    "";

  const problem =
    normalizeText(
      filterProblem?.value
    );

  const date =
    filterDate?.value ||
    "";

  const mol =
    filterMol?.value ||
    "";

  if (unit) {

    result =
      result.filter(
        function (item) {

          return (
            item.unitCode ===
            unit
          );
        }
      );
  }

  if (problem) {

    result =
      result.filter(
        function (item) {

          return normalizeText(
            item.problemDescription
          ).includes(
            problem
          );
        }
      );
  }

  if (date) {

    result =
      result.filter(
        function (item) {

          return (
            item.dateInspection ===
            date
          );
        }
      );
  }

  if (mol) {

    result =
      result.filter(
        function (item) {

          return (
            normalizeText(
              item.mol
            ) ===
            normalizeText(
              mol
            )
          );
        }
      );
  }

  return result;
}


function applyFilters() {

  filteredData =
    getFilterBaseData();

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  const query =
    normalizeText(
      searchInput?.value
    );

  if (query) {

    filteredData =
      filteredData.filter(
        function (item) {

          return (

            normalizeText(
              item.unitCode
            ).includes(
              query
            ) ||

            normalizeText(
              item.problemDescription
            ).includes(
              query
            ) ||

            normalizeText(
              item.groupComponent
            ).includes(
              query
            ) ||

            normalizeText(
              item.rating
            ).includes(
              query
            ) ||

            normalizeText(
              item.partsDescription
            ).includes(
              query
            )

          );
        }
      );
  }

  renderOutstandingList(
    filteredData
  );

  closeFilterPanel();
}


function resetFilters() {

  if (filterUnitCode) {
    filterUnitCode.value =
      "";
  }

  if (filterProblem) {
    filterProblem.value =
      "";
  }

  if (filterDate) {
    filterDate.value =
      "";
  }

  if (filterMol) {
    filterMol.value =
      "";
  }

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  if (searchInput) {
    searchInput.value =
      "";
  }

  filteredData =
    [...outstandingData];

  renderOutstandingList(
    filteredData
  );

  closeFilterPanel();
}


// =====================================================
// SCROLL NAVIGATION
// =====================================================

function updateScrollNavigation() {

  if (
    !outstandingScrollContainer ||
    !scrollNavigation
  ) {
    return;
  }

  requestAnimationFrame(
    function () {

      const hasScroll =
        outstandingScrollContainer
          .scrollHeight >
        outstandingScrollContainer
          .clientHeight + 5;

      scrollNavigation.hidden =
        !hasScroll;
    }
  );
}


// =====================================================
// LOAD DETAIL
// =====================================================

async function loadRecordDetail(
  inspectionId
) {

  try {

    const result =
      await apiRequest({

        action:
          "getDailyOutstandingDetail",

        inspectionId:
          inspectionId

      });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Detail Outstanding gagal dimuat."
      );
    }

    selectedRecord =
      result.data;

    return selectedRecord;

  } catch (error) {

    console.error(
      error
    );

    alert(
      error.message ||
      "Detail Outstanding gagal dimuat."
    );

    selectedRecord =
      null;

    return null;
  }
}


// =====================================================
// OPEN DETAIL
// =====================================================

async function openDetail(
  inspectionId
) {

  const record =
    await loadRecordDetail(
      inspectionId
    );

  if (!record) {
    return;
  }

  fillDetailModal(
    record
  );

  if (detailModal) {
    detailModal.hidden =
      false;
  }

  setMainShortcutVisible(
    false
  );

  updateBodyModalState();
}


// =====================================================
// FILL DETAIL
// =====================================================

function fillDetailModal(
  record
) {

  if (detailPhoto) {

    detailPhoto.src =
      getDriveImageUrl(
        record.photo
      );

    detailPhoto.onerror =
      function () {

        this.onerror =
          null;

        this.src =
          createPhotoPlaceholder();
      };
  }

  setText(
    detailUnitCode,
    record.unitCode
  );

  setText(
    detailHmInspection,
    record.hmInspection
  );

  setText(
    detailDateInspection,
    formatDisplayDate(
      record.dateInspection
    )
  );

  setText(
    detailGroupComponent,
    record.groupComponent
  );

  setText(
    detailProblemDescription,
    record.problemDescription
  );

  setText(
    detailRating,
    record.rating
  );

  setText(
    detailPartsDescription,
    record.partsDescription
  );

  setText(
    detailMol,
    record.mol ||
    "Belum"
  );

  setText(
    detailPartsStatus,
    record.partsStatus ||
    "-"
  );
}


// =====================================================
// CLOSE DETAIL
// =====================================================

function closeDetail() {

  if (detailModal) {
    detailModal.hidden =
      true;
  }

  selectedRecord =
    null;

  setMainShortcutVisible(
    true
  );

  updateBodyModalState();
}


// =====================================================
// PHOTO VIEWER
// =====================================================

function openPhotoViewer() {

  if (
    !selectedRecord ||
    !selectedRecord.photo
  ) {
    return;
  }

  photoZoom =
    1;

  if (photoViewerImage) {

    photoViewerImage.src =
      getDriveImageUrl(
        selectedRecord.photo
      );

    photoViewerImage.style.transform =
      "scale(1)";
  }

  if (resetZoomButton) {

    resetZoomButton.textContent =
      "100%";
  }

  if (photoViewer) {

    photoViewer.hidden =
      false;
  }

  setMainShortcutVisible(
    false
  );

  updateBodyModalState();
}


function closePhotoViewer() {

  if (photoViewer) {

    photoViewer.hidden =
      true;
  }

  photoZoom =
    1;

  if (photoViewerImage) {

    photoViewerImage.style.transform =
      "scale(1)";
  }

  updateBodyModalState();
}


function setPhotoZoom(
  value
) {

  photoZoom =
    Math.min(
      4,
      Math.max(
        0.5,
        value
      )
    );

  if (photoViewerImage) {

    photoViewerImage.style.transform =
      `scale(${photoZoom})`;
  }

  if (resetZoomButton) {

    resetZoomButton.textContent =
      Math.round(
        photoZoom * 100
      ) + "%";
  }
}


// =====================================================
// OPEN UPDATE FORM
// =====================================================

function openUpdateForm() {

  if (!selectedRecord) {
    return;
  }

  fillUpdateForm(
    selectedRecord
  );

  if (detailModal) {

    detailModal.hidden =
      true;
  }

  showUpdateModal();
}


function showUpdateModal() {

  if (updateModal) {

    updateModal.hidden =
      false;

    updateModal.scrollTop =
      0;
  }

  setMainShortcutVisible(
    false
  );

  updateBodyModalState();
}


// =====================================================
// CLOSE UPDATE FORM
// =====================================================

function closeUpdateForm() {

  if (updateModal) {

    updateModal.hidden =
      true;
  }

  replacementPhoto =
    null;

  evidenceFile =
    null;

  if (updateInspectionPhoto) {

    updateInspectionPhoto.value =
      "";
  }

  if (updateEvidence) {

    updateEvidence.value =
      "";
  }

  /*
    Cancel dari Update kembali ke Detail
    sesuai alur referensi.
  */

  if (selectedRecord) {

    fillDetailModal(
      selectedRecord
    );

    if (detailModal) {

      detailModal.hidden =
        false;
    }

    setMainShortcutVisible(
      false
    );

  } else {

    setMainShortcutVisible(
      true
    );
  }

  updateBodyModalState();
}


// =====================================================
// FILL UPDATE FORM
// =====================================================

function fillUpdateForm(
  record
) {

  replacementPhoto =
    null;

  evidenceFile =
    null;

  if (updateInspectionPhoto) {
    updateInspectionPhoto.value =
      "";
  }

  if (updateEvidence) {
    updateEvidence.value =
      "";
  }

  updateInspectionId.value =
    record.id ||
    "";

  ensureSelectOption(
    updateUnitCode,
    record.unitCode
  );

  updateUnitCode.value =
    record.unitCode ||
    "";

  updateHmInspection.value =
    record.hmInspection ||
    "";

  updateDateInspection.value =
    record.dateInspection ||
    "";

  updateInspectionPhotoPreview.src =
    getDriveImageUrl(
      record.photo
    );

  updateInspectionPhotoPreview.onerror =
    function () {

      this.onerror =
        null;

      this.src =
        createPhotoPlaceholder();
    };

  ensureSelectOption(
    updateGroupComponent,
    record.groupComponent
  );

  updateGroupComponent.value =
    record.groupComponent ||
    "";

  updateProblemDescription.value =
    record.problemDescription ||
    "";

  setRatingSelection(
    record.rating
  );

  updatePartsDescription.value =
    record.partsDescription ||
    "";

  updatePartNo.value =
    record.partNo ||
    "";

  updateQuantity.value =
    record.quantity ||
    "";

  updateNotes.value =
    record.notes ||
    "";

  updateMol.value =
    record.mol ||
    "Belum";

  setPartsStatusSelection(
    record.partsStatus
  );

  updateStatus.value =
    record.status ||
    "OPEN";

  updateActionProblems.value =
    record.actionProblems ||
    "";

  updateHmAction.value =
    record.hmAction ||
    "";

  updateDateAction.value =
    record.dateAction ||
    "";

  updateManPower.value =
    record.manPower ||
    "";

  updateEvidenceDisplay(
    record.evidence
  );
}


// =====================================================
// UNIT OPTIONS
// =====================================================

function populateUpdateUnitOptions() {

  if (!updateUnitCode) {
    return;
  }

  const units =
    [
      ...new Set(

        outstandingData
          .map(
            function (item) {

              return (
                item.unitCode ||
                ""
              ).trim();
            }
          )
          .filter(Boolean)

      )
    ].sort();

  updateUnitCode.innerHTML =
    `<option value="">Select Unit</option>`;

  units.forEach(
    function (unit) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        unit;

      option.textContent =
        unit;

      updateUnitCode.appendChild(
        option
      );
    }
  );
}


// =====================================================
// RATING
// =====================================================

function handleRatingSelection(
  event
) {

  const button =
    event.target.closest(
      ".rating-button"
    );

  if (!button) {
    return;
  }

  setRatingSelection(
    button.dataset.rating ||
    ""
  );
}


function setRatingSelection(
  rating
) {

  selectedRating =
    rating ||
    "";

  if (updateRating) {

    updateRating.value =
      selectedRating;
  }

  updateRatingGrid
    ?.querySelectorAll(
      ".rating-button"
    )
    .forEach(
      function (button) {

        button.classList.toggle(
          "selected",
          button.dataset.rating ===
            selectedRating
        );
      }
    );
}


// =====================================================
// PARTS STATUS
// =====================================================

function handlePartsStatusSelection(
  event
) {

  const button =
    event.target.closest(
      ".parts-status-button"
    );

  if (!button) {
    return;
  }

  setPartsStatusSelection(
    button.dataset.status ||
    ""
  );
}


function setPartsStatusSelection(
  status
) {

  selectedPartsStatus =
    status ||
    "";

  if (updatePartsStatus) {

    updatePartsStatus.value =
      selectedPartsStatus;
  }

  partsStatusGrid
    ?.querySelectorAll(
      ".parts-status-button"
    )
    .forEach(
      function (button) {

        button.classList.toggle(
          "selected",
          button.dataset.status ===
            selectedPartsStatus
        );
      }
    );
}


// =====================================================
// HM + / -
// =====================================================

function bindNumberControl(
  minusButton,
  plusButton,
  input
) {

  if (
    !minusButton ||
    !plusButton ||
    !input
  ) {
    return;
  }

  minusButton.addEventListener(
    "click",
    function () {

      const value =
        Number(
          input.value ||
          0
        );

      input.value =
        Math.max(
          0,
          value - 1
        );
    }
  );

  plusButton.addEventListener(
    "click",
    function () {

      const value =
        Number(
          input.value ||
          0
        );

      input.value =
        value + 1;
    }
  );
}


// =====================================================
// REPLACEMENT PHOTO
// =====================================================

async function handleReplacementPhoto(
  event
) {

  const file =
    event.target.files?.[0];

  if (!file) {

    replacementPhoto =
      null;

    return;
  }

  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    alert(
      "Photo harus berupa file gambar."
    );

    event.target.value =
      "";

    replacementPhoto =
      null;

    return;
  }

  try {

    replacementPhoto =
      await compressImageFile(
        file
      );

    updateInspectionPhotoPreview.src =
      replacementPhoto.previewUrl;

  } catch (error) {

    console.error(
      error
    );

    alert(
      "Photo gagal diproses."
    );

    event.target.value =
      "";

    replacementPhoto =
      null;
  }
}


// =====================================================
// EVIDENCE
// =====================================================

async function handleEvidenceFile(
  event
) {

  const file =
    event.target.files?.[0];

  if (!file) {

    evidenceFile =
      null;

    evidenceFileText.textContent =
      "Upload Photo / PDF";

    return;
  }

  const allowed =
    [

      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf"

    ];

  if (
    !allowed.includes(
      file.type
    )
  ) {

    alert(
      "Evidence hanya mendukung JPG, PNG, WEBP atau PDF."
    );

    event.target.value =
      "";

    evidenceFile =
      null;

    return;
  }

  try {

    /*
      Evidence image juga dikompres supaya payload
      Apps Script lebih ringan.

      PDF dibaca langsung tanpa kompresi.
    */

    if (
      file.type.startsWith(
        "image/"
      )
    ) {

      const compressed =
        await compressImageFile(
          file
        );

      evidenceFile = {

        base64:
          compressed.base64,

        mimeType:
          compressed.mimeType,

        name:
          file.name

      };

    } else {

      const base64 =
        await fileToBase64(
          file
        );

      evidenceFile = {

        base64:
          base64,

        mimeType:
          file.type,

        name:
          file.name

      };
    }

    evidenceFileText.textContent =
      file.name;

    /*
      Preview MOL di form.
      Backend tetap penentu final.
    */

    if (updateMol) {

      updateMol.value =
        "Submitted";
    }

  } catch (error) {

    console.error(
      error
    );

    alert(
      "Evidence gagal diproses."
    );

    event.target.value =
      "";

    evidenceFile =
      null;
  }
}


function updateEvidenceDisplay(
  evidenceUrl
) {

  if (!existingEvidence) {
    return;
  }

  existingEvidence.innerHTML =
    "";

  if (!evidenceUrl) {

    existingEvidence.hidden =
      true;

    if (evidenceFileText) {

      evidenceFileText.textContent =
        "Upload Photo / PDF";
    }

    return;
  }

  existingEvidence.hidden =
    false;

  const label =
    document.createElement(
      "span"
    );

  label.textContent =
    "Evidence sudah tersedia";

  existingEvidence.appendChild(
    label
  );

  if (evidenceFileText) {

    evidenceFileText.textContent =
      "Replace Evidence";
  }
}


// =====================================================
// SUBMIT UPDATE
// =====================================================

async function submitOutstandingUpdate(
  event
) {

  event.preventDefault();

  if (!selectedRecord) {

    alert(
      "Data Outstanding tidak ditemukan."
    );

    return;
  }

  const inspectionId =
    updateInspectionId.value
      .trim();

  const unitCode =
    updateUnitCode.value
      .trim();

  const hmInspection =
    updateHmInspection.value
      .trim();

  const dateInspection =
    updateDateInspection.value
      .trim();

  const groupComponent =
    updateGroupComponent.value
      .trim();

  const problemDescription =
    updateProblemDescription.value
      .trim();

  const rating =
    updateRating.value
      .trim();

  if (!unitCode) {

    alert(
      "Unit Code wajib diisi."
    );

    return;
  }

  if (!hmInspection) {

    alert(
      "HM Inspection wajib diisi."
    );

    return;
  }

  if (!dateInspection) {

    alert(
      "Date Inspection wajib diisi."
    );

    return;
  }

  if (!groupComponent) {

    alert(
      "Group Component wajib diisi."
    );

    return;
  }

  if (!problemDescription) {

    alert(
      "Problem Description wajib diisi."
    );

    return;
  }

  if (!rating) {

    alert(
      "Rating wajib dipilih."
    );

    return;
  }

  const payload = {

    action:
      "updateDailyOutstanding",

    inspectionId:
      inspectionId,

    unitCode:
      unitCode,

    hmInspection:
      hmInspection,

    dateInspection:
      dateInspection,

    groupComponent:
      groupComponent,

    problemDescription:
      problemDescription,

    rating:
      rating,

    partsDescription:
      updatePartsDescription.value
        .trim(),

    partNo:
      updatePartNo.value
        .trim(),

    quantity:
      updateQuantity.value
        .trim(),

    notes:
      updateNotes.value
        .trim(),

    partsStatus:
      updatePartsStatus.value
        .trim(),

    actionProblems:
      updateActionProblems.value
        .trim(),

    hmAction:
      updateHmAction.value
        .trim(),

    dateAction:
      updateDateAction.value
        .trim(),

    manPower:
      updateManPower.value
        .trim()

  };


  // PHOTO BARU

  if (replacementPhoto) {

    payload.photoBase64 =
      replacementPhoto.base64;

    payload.photoMimeType =
      replacementPhoto.mimeType;
  }


  // EVIDENCE BARU

  if (evidenceFile) {

    payload.evidenceBase64 =
      evidenceFile.base64;

    payload.evidenceMimeType =
      evidenceFile.mimeType;
  }


  setUpdateLoading(
    true
  );

  try {

    const result =
      await apiRequest(
        payload
      );

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Update Outstanding gagal."
      );
    }

    /*
      Backend yang menentukan MOL dan Status.
    */

    const finalStatus =
      result.status ||
      result.data?.status ||
      "OPEN";

    const finalMol =
      result.mol ||
      result.data?.mol ||
      "Belum";


    alert(
      result.message ||
      (
        "Outstanding berhasil diupdate.\n" +
        "MOL: " +
        finalMol +
        "\nStatus: " +
        finalStatus
      )
    );


    // Tutup semua modal

    if (updateModal) {

      updateModal.hidden =
        true;
    }

    if (detailModal) {

      detailModal.hidden =
        true;
    }

    selectedRecord =
      null;

    replacementPhoto =
      null;

    evidenceFile =
      null;

    setMainShortcutVisible(
      true
    );

    updateBodyModalState();


    /*
      Reload list dari server.

      Jika Action Problems terisi dan backend
      mengubah Status menjadi CLOSE,
      record otomatis tidak kembali karena
      getDailyOutstanding hanya mengirim OPEN.
    */

    await loadDailyOutstanding();

  } catch (error) {

    console.error(
      "Update Outstanding:",
      error
    );

    alert(
      error.message ||
      "Update Outstanding gagal."
    );

  } finally {

    setUpdateLoading(
      false
    );
  }
}


// =====================================================
// UPDATE LOADING
// =====================================================

function setUpdateLoading(
  loading
) {

  if (!submitUpdateButton) {
    return;
  }

  submitUpdateButton.disabled =
    loading;

  submitUpdateButton.textContent =
    loading
      ? "Updating..."
      : "Update";

  if (cancelUpdateButton) {

    cancelUpdateButton.disabled =
      loading;
  }
}


// =====================================================
// IMAGE COMPRESSION
// =====================================================

function compressImageFile(
  file
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const reader =
        new FileReader();

      reader.onload =
        function () {

          const image =
            new Image();

          image.onload =
            function () {

              const maxDimension =
                1600;

              let width =
                image.width;

              let height =
                image.height;

              if (
                width >
                  maxDimension ||
                height >
                  maxDimension
              ) {

                const scale =
                  Math.min(

                    maxDimension /
                      width,

                    maxDimension /
                      height

                  );

                width =
                  Math.round(
                    width * scale
                  );

                height =
                  Math.round(
                    height * scale
                  );
              }

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                width;

              canvas.height =
                height;

              const context =
                canvas.getContext(
                  "2d"
                );

              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );

              const dataUrl =
                canvas.toDataURL(
                  "image/jpeg",
                  0.75
                );

              resolve({

                base64:
                  dataUrl,

                mimeType:
                  "image/jpeg",

                previewUrl:
                  dataUrl

              });
            };

          image.onerror =
            function () {

              reject(
                new Error(
                  "Gambar tidak dapat dibaca."
                )
              );
            };

          image.src =
            reader.result;
        };

      reader.onerror =
        function () {

          reject(
            new Error(
              "File tidak dapat dibaca."
            )
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


// =====================================================
// FILE TO BASE64
// =====================================================

function fileToBase64(
  file
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const reader =
        new FileReader();

      reader.onload =
        function () {

          resolve(
            reader.result
          );
        };

      reader.onerror =
        function () {

          reject(
            new Error(
              "File tidak dapat dibaca."
            )
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


// =====================================================
// GOOGLE DRIVE IMAGE URL
// =====================================================

function getDriveFileId(
  url
) {

  if (!url) {
    return "";
  }

  const value =
    String(
      url
    );

  let match =
    value.match(
      /\/d\/([a-zA-Z0-9_-]+)/
    );

  if (
    match &&
    match[1]
  ) {

    return match[1];
  }

  match =
    value.match(
      /[?&]id=([a-zA-Z0-9_-]+)/
    );

  if (
    match &&
    match[1]
  ) {

    return match[1];
  }

  return "";
}


function getDriveImageUrl(
  url
) {

  if (!url) {

    return createPhotoPlaceholder();
  }

  const fileId =
    getDriveFileId(
      url
    );

  if (!fileId) {

    return url;
  }

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(
      fileId
    ) +
    "&sz=w1200"
  );
}


// =====================================================
// PHOTO PLACEHOLDER
// =====================================================

function createPhotoPlaceholder() {

  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="600"
        height="400"
        viewBox="0 0 600 400"
      >
        <rect
          width="600"
          height="400"
          fill="#eeeeee"
        />
        <path
          d="M190 280l75-90 55 65 35-40 65 65H190z"
          fill="#c7c7c7"
        />
        <circle
          cx="235"
          cy="135"
          r="30"
          fill="#c7c7c7"
        />
        <text
          x="300"
          y="340"
          text-anchor="middle"
          font-family="Arial"
          font-size="22"
          fill="#888888"
        >
          No Photo
        </text>
      </svg>
    `)
  );
}


// =====================================================
// HELPERS
// =====================================================

function normalizeText(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
}


function setText(
  element,
  value
) {

  if (!element) {
    return;
  }

  element.textContent =
    value ||
    "-";
}


function ensureSelectOption(
  select,
  value
) {

  if (
    !select ||
    !value
  ) {
    return;
  }

  const exists =
    Array.from(
      select.options
    ).some(
      function (option) {

        return (
          option.value ===
          value
        );
      }
    );

  if (!exists) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      value;

    option.textContent =
      value;

    select.appendChild(
      option
    );
  }
}


function formatDisplayDate(
  value
) {

  if (!value) {
    return "-";
  }

  const parts =
    String(
      value
    ).split("-");

  if (
    parts.length !== 3
  ) {

    return value;
  }

  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );
}


// =====================================================
// SHORTCUT VISIBILITY
// =====================================================

function setMainShortcutVisible(
  visible
) {

  if (!startInspectionShortcut) {
    return;
  }

  startInspectionShortcut.hidden =
    !visible;
}


// =====================================================
// BODY MODAL STATE
// =====================================================

function updateBodyModalState() {

  const hasOpenModal =
    (
      detailModal &&
      !detailModal.hidden
    ) ||
    (
      updateModal &&
      !updateModal.hidden
    ) ||
    (
      photoViewer &&
      !photoViewer.hidden
    );

  document.body.classList.toggle(
    "modal-open",
    Boolean(
      hasOpenModal
    )
  );
}


// =====================================================
// ESCAPE
// =====================================================

function handleEscapeKey(
  event
) {

  if (
    event.key !==
    "Escape"
  ) {
    return;
  }

  if (
    photoViewer &&
    !photoViewer.hidden
  ) {

    closePhotoViewer();

    return;
  }

  if (
    updateModal &&
    !updateModal.hidden
  ) {

    closeUpdateForm();

    return;
  }

  if (
    detailModal &&
    !detailModal.hidden
  ) {

    closeDetail();

    return;
  }

  if (
    filterPanel &&
    !filterPanel.hidden
  ) {

    closeFilterPanel();
  }
}


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
  "resize",
  updateScrollNavigation
);
