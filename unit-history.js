"use strict";


/* =====================================================
   HEXA - UNIT HISTORY
===================================================== */


/* =====================================================
   API
===================================================== */

const HEXA_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


/* =====================================================
   SESSION PROTECTION
===================================================== */

const hexaLoggedIn =
  sessionStorage.getItem("hexaLoggedIn");

const hexaUserRaw =
  sessionStorage.getItem("hexaUser");


if (
  hexaLoggedIn !== "true" ||
  !hexaUserRaw
) {

  window.location.replace(
    "index.html"
  );
}


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


/* =====================================================
   STATE
===================================================== */

let unitHistoryData = [];

let filteredUnitHistoryData = [];

let selectedRecord = null;

let photoZoom = 1;

let pageInitialized = false;


/* DELETE */

let deleteMode = false;

const selectedDeleteIds =
  new Set();


/* FILTER */

let activeFilters = [];

let filterCounter = 0;


/* SHORTCUT DRAG */

const UNIT_HISTORY_SHORTCUT_POSITION_KEY =
  "hexaUnitHistoryShortcutPosition";

let shortcutDragState = null;


/* =====================================================
   FILTER DEFINITIONS

   Semua kategori database kecuali Unique ID.
===================================================== */

const UNIT_HISTORY_FILTER_FIELDS = [

  {
    key: "unitCode",
    label: "Unit Code",
    type: "select"
  },

  {
    key: "hmInspection",
    label: "HM Inspection",
    type: "numberRange"
  },

  {
    key: "dateInspection",
    label: "Date Inspection",
    type: "dateRange"
  },

  {
    key: "photo",
    label: "Photo",
    type: "availability"
  },

  {
    key: "groupComponent",
    label: "Group Component",
    type: "select"
  },

  {
    key: "problemDescription",
    label: "Problem Description",
    type: "text"
  },

  {
    key: "rating",
    label: "Rating",
    type: "select"
  },

  {
    key: "partsDescription",
    label: "Parts Description",
    type: "text"
  },

  {
    key: "partNo",
    label: "Part No",
    type: "text"
  },

  {
    key: "quantity",
    label: "Quantity",
    type: "numberRange"
  },

  {
    key: "inspectors",
    label: "Inspectors",
    type: "text"
  },

  {
    key: "notes",
    label: "Notes",
    type: "text"
  },

  {
    key: "mol",
    label: "MOL",
    type: "select"
  },

  {
    key: "evidence",
    label: "Evidence",
    type: "availability"
  },

  {
    key: "partsStatus",
    label: "Parts Status",
    type: "select"
  },

  {
    key: "actionProblems",
    label: "Action Problems",
    type: "text"
  },

  {
    key: "hmAction",
    label: "HM Action",
    type: "numberRange"
  },

  {
    key: "dateAction",
    label: "Date Action",
    type: "dateRange"
  },

  {
    key: "status",
    label: "Status",
    type: "select"
  },

  {
    key: "manPower",
    label: "Man Power",
    type: "text"
  }

];


/* =====================================================
   DOM REFERENCES
===================================================== */

let filterButton;
let printButton;
let sharePdfButton;
let deleteButton;

let filterPanel;
let closeFilterButton;

let filterConditions;
let addFilterButton;
let resetFilterButton;
let applyFilterButton;

let activeFiltersContainer;

let historyLoading;
let historyEmpty;
let historyError;

let historyScrollContainer;
let historyTableBody;

let deleteHeader;
let selectAllCheckbox;

let scrollNavigation;
let scrollUpButton;
let scrollDownButton;


/* DETAIL */

let detailModal;
let detailPhotoButton;
let detailPhoto;

let detailUnitCode;
let detailHmInspection;
let detailDateInspection;
let detailInspectors;

let detailGroupComponent;
let detailProblemDescription;
let detailRating;
let detailPartsDescription;
let detailPartNo;
let detailQuantity;
let detailNotes;

let detailMol;
let detailEvidence;
let detailPartsStatus;
let detailActionProblems;
let detailHmAction;
let detailDateAction;
let detailStatus;
let detailManPower;

let closeDetailButton;


/* PHOTO VIEWER */

let photoViewer;
let photoViewerImage;

let zoomOutButton;
let zoomInButton;
let resetZoomButton;
let closePhotoViewerButton;


/* DELETE MODAL */

let deleteModal;
let deleteModalMessage;

let deleteNoButton;
let deleteYesButton;


/* SHORTCUT */

let startInspectionShortcut;


/* =====================================================
   INITIALIZE
===================================================== */

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

    initializeShortcut();

    loadUnitHistory();

  }
);


/* =====================================================
   CACHE ELEMENTS
===================================================== */

function cacheElements() {

  filterButton =
    document.getElementById(
      "unitHistoryFilterButton"
    );

  printButton =
    document.getElementById(
      "unitHistoryPrintButton"
    );

   sharePdfButton =
  document.getElementById(
    "unitHistorySharePdfButton"
  );

  deleteButton =
    document.getElementById(
      "unitHistoryDeleteButton"
    );


  filterPanel =
    document.getElementById(
      "unitHistoryFilterPanel"
    );

  closeFilterButton =
    document.getElementById(
      "unitHistoryCloseFilterButton"
    );

  filterConditions =
    document.getElementById(
      "unitHistoryFilterConditions"
    );

  addFilterButton =
    document.getElementById(
      "unitHistoryAddFilterButton"
    );

  resetFilterButton =
    document.getElementById(
      "unitHistoryResetFilterButton"
    );

  applyFilterButton =
    document.getElementById(
      "unitHistoryApplyFilterButton"
    );

  activeFiltersContainer =
    document.getElementById(
      "unitHistoryActiveFilters"
    );


  historyLoading =
    document.getElementById(
      "unitHistoryLoading"
    );

  historyEmpty =
    document.getElementById(
      "unitHistoryEmpty"
    );

  historyError =
    document.getElementById(
      "unitHistoryError"
    );

  historyScrollContainer =
    document.getElementById(
      "unitHistoryScrollContainer"
    );

  historyTableBody =
    document.getElementById(
      "unitHistoryTableBody"
    );


  deleteHeader =
    document.getElementById(
      "unitHistoryDeleteHeader"
    );

  selectAllCheckbox =
    document.getElementById(
      "unitHistorySelectAll"
    );


  scrollNavigation =
    document.getElementById(
      "unitHistoryScrollNavigation"
    );

  scrollUpButton =
    document.getElementById(
      "unitHistoryScrollUpButton"
    );

  scrollDownButton =
    document.getElementById(
      "unitHistoryScrollDownButton"
    );


  /* DETAIL */

  detailModal =
    document.getElementById(
      "unitHistoryDetailModal"
    );

  detailPhotoButton =
    document.getElementById(
      "unitHistoryDetailPhotoButton"
    );

  detailPhoto =
    document.getElementById(
      "unitHistoryDetailPhoto"
    );

  detailUnitCode =
    document.getElementById(
      "unitHistoryDetailUnitCode"
    );

  detailHmInspection =
    document.getElementById(
      "unitHistoryDetailHmInspection"
    );

  detailDateInspection =
    document.getElementById(
      "unitHistoryDetailDateInspection"
    );

  detailInspectors =
    document.getElementById(
      "unitHistoryDetailInspectors"
    );

  detailGroupComponent =
    document.getElementById(
      "unitHistoryDetailGroupComponent"
    );

  detailProblemDescription =
    document.getElementById(
      "unitHistoryDetailProblemDescription"
    );

  detailRating =
    document.getElementById(
      "unitHistoryDetailRating"
    );

  detailPartsDescription =
    document.getElementById(
      "unitHistoryDetailPartsDescription"
    );

  detailPartNo =
    document.getElementById(
      "unitHistoryDetailPartNo"
    );

  detailQuantity =
    document.getElementById(
      "unitHistoryDetailQuantity"
    );

  detailNotes =
    document.getElementById(
      "unitHistoryDetailNotes"
    );

  detailMol =
    document.getElementById(
      "unitHistoryDetailMol"
    );

  detailEvidence =
    document.getElementById(
      "unitHistoryDetailEvidence"
    );

  detailPartsStatus =
    document.getElementById(
      "unitHistoryDetailPartsStatus"
    );

  detailActionProblems =
    document.getElementById(
      "unitHistoryDetailActionProblems"
    );

  detailHmAction =
    document.getElementById(
      "unitHistoryDetailHmAction"
    );

  detailDateAction =
    document.getElementById(
      "unitHistoryDetailDateAction"
    );

  detailStatus =
    document.getElementById(
      "unitHistoryDetailStatus"
    );

  detailManPower =
    document.getElementById(
      "unitHistoryDetailManPower"
    );

  closeDetailButton =
    document.getElementById(
      "unitHistoryCloseDetailButton"
    );


  /* PHOTO VIEWER */

  photoViewer =
    document.getElementById(
      "unitHistoryPhotoViewer"
    );

  photoViewerImage =
    document.getElementById(
      "unitHistoryPhotoViewerImage"
    );

  zoomOutButton =
    document.getElementById(
      "unitHistoryZoomOutButton"
    );

  zoomInButton =
    document.getElementById(
      "unitHistoryZoomInButton"
    );

  resetZoomButton =
    document.getElementById(
      "unitHistoryResetZoomButton"
    );

  closePhotoViewerButton =
    document.getElementById(
      "unitHistoryClosePhotoViewerButton"
    );


  /* DELETE MODAL */

  deleteModal =
    document.getElementById(
      "unitHistoryDeleteModal"
    );

  deleteModalMessage =
    document.getElementById(
      "unitHistoryDeleteModalMessage"
    );

  deleteNoButton =
    document.getElementById(
      "unitHistoryDeleteNoButton"
    );

  deleteYesButton =
    document.getElementById(
      "unitHistoryDeleteYesButton"
    );


  /* SHORTCUT */

  startInspectionShortcut =
    document.getElementById(
      "unitHistoryStartInspectionShortcut"
    );

}


/* =====================================================
   BIND EVENTS
===================================================== */

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


  if (addFilterButton) {

    addFilterButton.addEventListener(
      "click",
      function () {

        addFilterCondition();
      }
    );
  }


  if (resetFilterButton) {

    resetFilterButton.addEventListener(
      "click",
      resetFilters
    );
  }


  if (applyFilterButton) {

    applyFilterButton.addEventListener(
      "click",
      applyFilters
    );
  }


  if (printButton) {

    printButton.addEventListener(
      "click",
      printCurrentHistory
    );
  }

   if (sharePdfButton) {

     sharePdfButton.addEventListener(
       "click",
       shareCurrentHistoryPdf
     );
   }


  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      handleDeleteButton
    );
  }


  if (selectAllCheckbox) {

    selectAllCheckbox.addEventListener(
      "change",
      handleSelectAll
    );
  }


  if (scrollUpButton) {

    scrollUpButton.addEventListener(
      "click",
      function () {

        historyScrollContainer
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

        historyScrollContainer
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


  if (detailPhotoButton) {

    detailPhotoButton.addEventListener(
      "click",
      openPhotoViewer
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

        setPhotoZoom(1);
      }
    );
  }


  if (closePhotoViewerButton) {

    closePhotoViewerButton.addEventListener(
      "click",
      closePhotoViewer
    );
  }


  if (deleteNoButton) {

    deleteNoButton.addEventListener(
      "click",
      cancelDelete
    );
  }


  if (deleteYesButton) {

    deleteYesButton.addEventListener(
      "click",
      confirmDelete
    );
  }


  document.addEventListener(
    "keydown",
    handleEscapeKey
  );


  window.addEventListener(
    "resize",
    keepShortcutInsideViewport
  );

}


/* =====================================================
   API REQUEST
===================================================== */

async function apiRequest(payload) {

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


/* =====================================================
   LOAD UNIT HISTORY
===================================================== */

async function loadUnitHistory() {

  showLoadingState();


  try {

    const result =
      await apiRequest({

        action:
          "getUnitHistory"

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Gagal mengambil Unit History."
      );
    }


    unitHistoryData =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];


    /*
      Backend sudah mengirim newest first.

      Kita tidak melakukan sort ulang agar urutan
      backend tetap dipertahankan.
    */

    filteredUnitHistoryData =
      [...unitHistoryData];


    renderUnitHistory(
      filteredUnitHistoryData
    );


  } catch (error) {

    console.error(
      "Unit History:",
      error
    );

    showErrorState(
      error.message
    );
  }
}


/* =====================================================
   UI STATES
===================================================== */

function showLoadingState() {

  if (historyLoading) {
    historyLoading.hidden =
      false;
  }

  if (historyEmpty) {
    historyEmpty.hidden =
      true;
  }

  if (historyError) {
    historyError.hidden =
      true;
  }

  if (historyScrollContainer) {
    historyScrollContainer.hidden =
      true;
  }

  if (scrollNavigation) {
    scrollNavigation.hidden =
      true;
  }
}


function showErrorState(message) {

  if (historyLoading) {
    historyLoading.hidden =
      true;
  }

  if (historyEmpty) {
    historyEmpty.hidden =
      true;
  }

  if (historyScrollContainer) {
    historyScrollContainer.hidden =
      true;
  }

  if (scrollNavigation) {
    scrollNavigation.hidden =
      true;
  }


  if (historyError) {

    historyError.textContent =
      message ||
      "Data Unit History gagal dimuat.";

    historyError.hidden =
      false;
  }
}


/* =====================================================
   RENDER TABLE
===================================================== */

function renderUnitHistory(records) {

  if (!historyTableBody) {
    return;
  }


  historyTableBody.innerHTML =
    "";


  if (historyLoading) {
    historyLoading.hidden =
      true;
  }

  if (historyError) {
    historyError.hidden =
      true;
  }


  if (
    !records ||
    records.length === 0
  ) {

    if (historyEmpty) {
      historyEmpty.hidden =
        false;
    }

    if (historyScrollContainer) {
      historyScrollContainer.hidden =
        true;
    }

    if (scrollNavigation) {
      scrollNavigation.hidden =
        true;
    }

    return;
  }


  if (historyEmpty) {
    historyEmpty.hidden =
      true;
  }

  if (historyScrollContainer) {
    historyScrollContainer.hidden =
      false;
  }


  records.forEach(
    function (record) {

      historyTableBody.appendChild(
        createHistoryRow(
          record
        )
      );
    }
  );


  updateDeleteUI();

  updateScrollNavigation();
}


/* =====================================================
   CREATE TABLE ROW
===================================================== */

function createHistoryRow(record) {

  const row =
    document.createElement(
      "tr"
    );


  row.dataset.id =
    record.id || "";


  /* ===================================================
     DELETE CHECKBOX
  =================================================== */

  const deleteCell =
    document.createElement(
      "td"
    );

  deleteCell.className =
    "unit-history-delete-column";

  deleteCell.hidden =
    !deleteMode;


  const checkbox =
    document.createElement(
      "input"
    );

  checkbox.type =
    "checkbox";

  checkbox.className =
    "unit-history-row-checkbox";

  checkbox.value =
    record.id || "";

  checkbox.checked =
    selectedDeleteIds.has(
      record.id
    );


  checkbox.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();
    }
  );


  checkbox.addEventListener(
    "change",
    function () {

      toggleDeleteSelection(
        record.id,
        checkbox.checked
      );
    }
  );


  deleteCell.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();
    }
  );


  deleteCell.appendChild(
    checkbox
  );


  row.appendChild(
    deleteCell
  );


  /* ===================================================
     UNIT CODE
  =================================================== */

  appendTextCell(
    row,
    record.unitCode
  );


  /* HM */

  appendTextCell(
    row,
    record.hmInspection
  );


  /* GROUP COMPONENT */

  appendTextCell(
    row,
    record.groupComponent
  );


  /* PROBLEM DESCRIPTION */

  appendTextCell(
    row,
    record.problemDescription
  );


  /* ===================================================
     PHOTO
  =================================================== */

  const photoCell =
    document.createElement(
      "td"
    );


  if (record.photo) {

    const image =
      document.createElement(
        "img"
      );

    image.className =
      "unit-history-row-photo";

    image.loading =
      "lazy";

    image.alt =
      record.unitCode
        ? "Photo " +
          record.unitCode
        : "Inspection Photo";

    image.src =
      getDriveImageUrl(
        record.photo
      );


    image.onerror =
      function () {

        this.onerror =
          null;

        this.src =
          createPhotoPlaceholder();
      };


    photoCell.appendChild(
      image
    );

  } else {

    const empty =
      document.createElement(
        "span"
      );

    empty.className =
      "unit-history-row-no-photo";

    empty.textContent =
      "No Photo";

    photoCell.appendChild(
      empty
    );
  }


  row.appendChild(
    photoCell
  );


  /* RATING */

  appendTextCell(
    row,
    record.rating
  );


  /* STATUS */

  const statusCell =
    document.createElement(
      "td"
    );

  statusCell.appendChild(
    createBadge(
      record.status ||
      "OPEN",
      "status"
    )
  );

  row.appendChild(
    statusCell
  );


/* ===================================================
   PART REQUIREMENT
   Semua part ditampilkan lengkap dan sejajar.
=================================================== */

appendPartRequirementCells(
  row,
  record.partsDescription,
  record.partNo,
  record.quantity
);


/* MOL */

  const molCell =
    document.createElement(
      "td"
    );

  molCell.appendChild(
    createBadge(
      getMolDisplay(record),
      "mol"
    )
  );

  row.appendChild(
    molCell
  );


  /* PARTS STATUS */

  appendTextCell(
    row,
    record.partsStatus
  );


  /* ===================================================
     ROW CLICK
  =================================================== */

  row.addEventListener(
    "click",
    function () {

      /*
        Saat Delete Mode aktif,
        klik row tidak membuka detail.
      */

      if (deleteMode) {

        checkbox.checked =
          !checkbox.checked;

        toggleDeleteSelection(
          record.id,
          checkbox.checked
        );

        return;
      }


      openDetail(
        record.id
      );
    }
  );


  return row;
}


/* =====================================================
   CELL HELPER
===================================================== */

function appendTextCell(
  row,
  value
) {

  const cell =
    document.createElement(
      "td"
    );


  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {

    const empty =
      document.createElement(
        "span"
      );

    empty.className =
      "unit-history-empty-value";

    empty.textContent =
      "-";

    cell.appendChild(
      empty
    );

  } else {

    cell.textContent =
      value;
  }


  row.appendChild(
    cell
  );
}

/* =====================================================
   PART REQUIREMENT TABLE HELPER

   Parts Description, Part No dan Quantity disimpan
   sebagai multiline string di database.

   Alignment selalu berdasarkan index yang sama.
===================================================== */

function splitPartMultiline(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");
}


/* =====================================================
   APPEND 3 PART REQUIREMENT CELLS
===================================================== */

function appendPartRequirementCells(
  row,
  partsDescription,
  partNo,
  quantity
) {

  const descriptions =
    splitPartMultiline(
      partsDescription
    );

  const partNumbers =
    splitPartMultiline(
      partNo
    );

  const quantities =
    splitPartMultiline(
      quantity
    );


  /*
    Jumlah baris mengikuti data terpanjang.

    Jangan filter array karena posisi kosong harus
    tetap dipertahankan agar alignment tidak bergeser.
  */

  const totalParts =
    Math.max(
      1,
      descriptions.length,
      partNumbers.length,
      quantities.length
    );


  const descriptionCell =
    createPartRequirementCell(
      descriptions,
      totalParts,
      "description"
    );


  const partNoCell =
    createPartRequirementCell(
      partNumbers,
      totalParts,
      "number"
    );


  const quantityCell =
    createPartRequirementCell(
      quantities,
      totalParts,
      "quantity"
    );


  row.appendChild(
    descriptionCell
  );

  row.appendChild(
    partNoCell
  );

  row.appendChild(
    quantityCell
  );
}


/* =====================================================
   CREATE ONE PART REQUIREMENT CELL
===================================================== */

function createPartRequirementCell(
  values,
  totalParts,
  type
) {

  const cell =
    document.createElement(
      "td"
    );


  cell.classList.add(
    "unit-history-parts-cell"
  );


  const list =
    document.createElement(
      "div"
    );


  list.className =
    "unit-history-part-list";


  for (
    let index = 0;
    index < totalParts;
    index++
  ) {

    const line =
      document.createElement(
        "div"
      );


    line.className =
      "unit-history-part-line";


    if (type === "description") {

      line.classList.add(
        "unit-history-part-description"
      );

    } else if (type === "number") {

      line.classList.add(
        "unit-history-part-number"
      );

    } else if (type === "quantity") {

      line.classList.add(
        "unit-history-part-quantity"
      );
    }


    /*
      Jangan menghapus posisi kosong.

      Contoh:
      Hose   | 611-5996 | 1
      Plug   |          | 4

      Baris Part No kedua tetap dibuat.
    */

    const rawValue =
      values[index] !== undefined
        ? String(values[index]).trim()
        : "";


    if (rawValue) {

      line.textContent =
        rawValue;

    } else {

      line.textContent =
        "-";

      line.classList.add(
        "unit-history-part-empty"
      );
    }


    list.appendChild(
      line
    );
  }


  cell.appendChild(
    list
  );


  return cell;
}

/* =====================================================
   BADGE
===================================================== */

function createBadge(
  value,
  type
) {

  const badge =
    document.createElement(
      "span"
    );


  const normalized =
    normalizeText(
      value
    );


  badge.className =
    "unit-history-badge";


  if (type === "status") {

    if (normalized === "close") {

      badge.classList.add(
        "unit-history-badge-close"
      );

    } else {

      badge.classList.add(
        "unit-history-badge-open"
      );
    }

  } else {

    if (normalized === "submitted") {

      badge.classList.add(
        "unit-history-badge-submitted"
      );

    } else {

      badge.classList.add(
        "unit-history-badge-belum"
      );
    }
  }


  badge.textContent =
    value || "-";


  return badge;
}


/* =====================================================
   MOL DISPLAY

   Evidence menjadi sumber tambahan agar record lama
   tetap terbaca benar.
===================================================== */

function getMolDisplay(record) {

  if (record.evidence) {
    return "Submitted";
  }

  if (
    normalizeText(
      record.mol
    ) === "submitted"
  ) {

    return "Submitted";
  }

  return record.mol ||
    "Belum";
}


/* =====================================================
   GLOBAL HEADER SEARCH
===================================================== */

function initializeSearch() {

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

      applyAllFilters();
    }
  );
}


/* =====================================================
   FILTER PANEL
===================================================== */

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


  if (
    willOpen &&
    filterConditions &&
    filterConditions.children.length === 0
  ) {

    addFilterCondition();
  }
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


/* =====================================================
   ADD FILTER CONDITION
===================================================== */

function addFilterCondition(
  existingFilter = null
) {

  if (!filterConditions) {
    return;
  }


  filterCounter += 1;


  const condition =
    document.createElement(
      "div"
    );

  condition.className =
    "unit-history-filter-condition";

  condition.dataset.filterId =
    String(filterCounter);


  /* CATEGORY FIELD */

  const categoryField =
    document.createElement(
      "div"
    );

  categoryField.className =
    "unit-history-filter-field";


  const categoryLabel =
    document.createElement(
      "label"
    );

  categoryLabel.textContent =
    "Category";


  const categorySelect =
    document.createElement(
      "select"
    );

  categorySelect.className =
    "unit-history-filter-category";


  categorySelect.innerHTML =
    `<option value="">Select Category</option>`;


  UNIT_HISTORY_FILTER_FIELDS.forEach(
    function (field) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        field.key;

      option.textContent =
        field.label;

      categorySelect.appendChild(
        option
      );
    }
  );


  categoryField.appendChild(
    categoryLabel
  );

  categoryField.appendChild(
    categorySelect
  );


  /* VALUE FIELD */

  const valueField =
    document.createElement(
      "div"
    );

  valueField.className =
    "unit-history-filter-field unit-history-filter-value-field";


  const valueLabel =
    document.createElement(
      "label"
    );

  valueLabel.textContent =
    "Value";


  const controlContainer =
    document.createElement(
      "div"
    );

  controlContainer.className =
    "unit-history-filter-control";


  valueField.appendChild(
    valueLabel
  );

  valueField.appendChild(
    controlContainer
  );


  /* REMOVE */

  const removeButton =
    document.createElement(
      "button"
    );

  removeButton.type =
    "button";

  removeButton.className =
    "unit-history-filter-remove";

  removeButton.setAttribute(
    "aria-label",
    "Remove Filter"
  );

  removeButton.textContent =
    "×";


  removeButton.addEventListener(
    "click",
    function () {

      condition.remove();

      if (
        filterConditions.children.length === 0
      ) {

        addFilterCondition();
      }
    }
  );


  categorySelect.addEventListener(
    "change",
    function () {

      renderFilterControl(
        condition,
        categorySelect.value
      );
    }
  );


  condition.appendChild(
    categoryField
  );

  condition.appendChild(
    valueField
  );

  condition.appendChild(
    removeButton
  );


  filterConditions.appendChild(
    condition
  );


  if (existingFilter) {

    categorySelect.value =
      existingFilter.key || "";

    renderFilterControl(
      condition,
      categorySelect.value,
      existingFilter
    );

  } else {

    renderFilterControl(
      condition,
      ""
    );
  }
}


/* =====================================================
   RENDER FILTER CONTROL
===================================================== */

function renderFilterControl(
  condition,
  fieldKey,
  existingFilter = null
) {

  const container =
    condition.querySelector(
      ".unit-history-filter-control"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const definition =
    UNIT_HISTORY_FILTER_FIELDS.find(
      function (field) {

        return field.key ===
          fieldKey;
      }
    );


  if (!definition) {

    const input =
      document.createElement(
        "input"
      );

    input.type =
      "text";

    input.disabled =
      true;

    input.placeholder =
      "Select category first";

    container.appendChild(
      input
    );

    return;
  }


  /* TEXT */

  if (definition.type === "text") {

    const input =
      document.createElement(
        "input"
      );

    input.type =
      "text";

    input.className =
      "unit-history-filter-value";

    input.placeholder =
      "Contains...";

    input.value =
      existingFilter?.value ||
      "";

    container.appendChild(
      input
    );

    return;
  }


  /* SELECT */

  if (definition.type === "select") {

    const select =
      document.createElement(
        "select"
      );

    select.className =
      "unit-history-filter-value";


    select.innerHTML =
      `<option value="">All</option>`;


    getUniqueValues(
      fieldKey
    ).forEach(
      function (value) {

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
    );


    select.value =
      existingFilter?.value ||
      "";


    container.appendChild(
      select
    );

    return;
  }


  /* AVAILABILITY */

  if (
    definition.type ===
    "availability"
  ) {

    const select =
      document.createElement(
        "select"
      );

    select.className =
      "unit-history-filter-value";


    select.innerHTML = `
      <option value="">All</option>
      <option value="available">Available</option>
      <option value="empty">Empty</option>
    `;


    select.value =
      existingFilter?.value ||
      "";


    container.appendChild(
      select
    );

    return;
  }


  /* NUMBER RANGE */

  if (
    definition.type ===
    "numberRange"
  ) {

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.style.display =
      "grid";

    wrapper.style.gridTemplateColumns =
      "1fr 1fr";

    wrapper.style.gap =
      "7px";


    const minInput =
      document.createElement(
        "input"
      );

    minInput.type =
      "number";

    minInput.placeholder =
      "Min";

    minInput.className =
      "unit-history-filter-min";

    minInput.value =
      existingFilter?.min ??
      "";


    const maxInput =
      document.createElement(
        "input"
      );

    maxInput.type =
      "number";

    maxInput.placeholder =
      "Max";

    maxInput.className =
      "unit-history-filter-max";

    maxInput.value =
      existingFilter?.max ??
      "";


    wrapper.appendChild(
      minInput
    );

    wrapper.appendChild(
      maxInput
    );


    container.appendChild(
      wrapper
    );

    return;
  }


  /* DATE RANGE */

  if (
    definition.type ===
    "dateRange"
  ) {

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.style.display =
      "grid";

    wrapper.style.gridTemplateColumns =
      "1fr 1fr";

    wrapper.style.gap =
      "7px";


    const fromInput =
      document.createElement(
        "input"
      );

    fromInput.type =
      "date";

    fromInput.className =
      "unit-history-filter-from";

    fromInput.value =
      existingFilter?.from ||
      "";


    const toInput =
      document.createElement(
        "input"
      );

    toInput.type =
      "date";

    toInput.className =
      "unit-history-filter-to";

    toInput.value =
      existingFilter?.to ||
      "";


    wrapper.appendChild(
      fromInput
    );

    wrapper.appendChild(
      toInput
    );


    container.appendChild(
      wrapper
    );
  }
}


/* =====================================================
   UNIQUE FILTER VALUES
===================================================== */

function getUniqueValues(
  fieldKey
) {

  return [
    ...new Set(

      unitHistoryData

        .map(
          function (record) {

            let value =
              record[fieldKey];

            if (
              fieldKey === "mol"
            ) {

              value =
                getMolDisplay(
                  record
                );
            }

            return String(
              value ?? ""
            ).trim();
          }
        )

        .filter(Boolean)

    )
  ].sort(
    function (a, b) {

      return a.localeCompare(
        b,
        undefined,
        {
          numeric: true
        }
      );
    }
  );
}


/* =====================================================
   READ FILTER CONDITIONS
===================================================== */

function readFilterConditions() {

  if (!filterConditions) {
    return [];
  }


  const filters = [];


  filterConditions
    .querySelectorAll(
      ".unit-history-filter-condition"
    )
    .forEach(
      function (condition) {

        const category =
          condition.querySelector(
            ".unit-history-filter-category"
          )?.value || "";


        if (!category) {
          return;
        }


        const definition =
          UNIT_HISTORY_FILTER_FIELDS.find(
            function (field) {

              return field.key ===
                category;
            }
          );


        if (!definition) {
          return;
        }


        if (
          definition.type === "text" ||
          definition.type === "select" ||
          definition.type === "availability"
        ) {

          const value =
            condition.querySelector(
              ".unit-history-filter-value"
            )?.value || "";


          if (!value) {
            return;
          }


          filters.push({

            key:
              category,

            type:
              definition.type,

            value:
              value

          });


          return;
        }


        if (
          definition.type ===
          "numberRange"
        ) {

          const min =
            condition.querySelector(
              ".unit-history-filter-min"
            )?.value ?? "";

          const max =
            condition.querySelector(
              ".unit-history-filter-max"
            )?.value ?? "";


          if (
            min === "" &&
            max === ""
          ) {

            return;
          }


          filters.push({

            key:
              category,

            type:
              definition.type,

            min:
              min,

            max:
              max

          });


          return;
        }


        if (
          definition.type ===
          "dateRange"
        ) {

          const from =
            condition.querySelector(
              ".unit-history-filter-from"
            )?.value || "";

          const to =
            condition.querySelector(
              ".unit-history-filter-to"
            )?.value || "";


          if (
            !from &&
            !to
          ) {

            return;
          }


          filters.push({

            key:
              category,

            type:
              definition.type,

            from:
              from,

            to:
              to

          });
        }

      }
    );


  return filters;
}


/* =====================================================
   APPLY FILTER BUTTON
===================================================== */

function applyFilters() {

  activeFilters =
    readFilterConditions();


  applyAllFilters();

  renderActiveFilterChips();

  closeFilterPanel();
}


/* =====================================================
   APPLY ALL FILTERS
===================================================== */

function applyAllFilters() {

  let result =
    [...unitHistoryData];


  activeFilters.forEach(
    function (filter) {

      result =
        result.filter(
          function (record) {

            return recordMatchesFilter(
              record,
              filter
            );
          }
        );
    }
  );


  /* GLOBAL HEADER SEARCH */

  const searchInput =
    document.getElementById(
      "searchInput"
    );


  const query =
    normalizeText(
      searchInput?.value
    );


  if (query) {

    result =
      result.filter(
        function (record) {

          return recordMatchesSearch(
            record,
            query
          );
        }
      );
  }


  filteredUnitHistoryData =
    result;


  selectedDeleteIds.clear();


  renderUnitHistory(
    filteredUnitHistoryData
  );
}


/* =====================================================
   FILTER MATCHING
===================================================== */

function recordMatchesFilter(
  record,
  filter
) {

  let rawValue =
    record[filter.key];


  if (filter.key === "mol") {

    rawValue =
      getMolDisplay(
        record
      );
  }


  /* TEXT */

  if (filter.type === "text") {

    return normalizeText(
      rawValue
    ).includes(
      normalizeText(
        filter.value
      )
    );
  }


  /* SELECT */

  if (filter.type === "select") {

    return normalizeText(
      rawValue
    ) ===
    normalizeText(
      filter.value
    );
  }


  /* AVAILABLE / EMPTY */

  if (
    filter.type ===
    "availability"
  ) {

    const hasValue =
      Boolean(
        String(
          rawValue ?? ""
        ).trim()
      );


    return filter.value ===
      "available"
        ? hasValue
        : !hasValue;
  }


  /* NUMBER RANGE */

  if (
    filter.type ===
    "numberRange"
  ) {

    const value =
      parseNumericValue(
        rawValue
      );


    if (
      Number.isNaN(value)
    ) {

      return false;
    }


    if (
      filter.min !== "" &&
      value <
        Number(filter.min)
    ) {

      return false;
    }


    if (
      filter.max !== "" &&
      value >
        Number(filter.max)
    ) {

      return false;
    }


    return true;
  }


  /* DATE RANGE */

  if (
    filter.type ===
    "dateRange"
  ) {

    const date =
      normalizeDateValue(
        rawValue
      );


    if (!date) {
      return false;
    }


    if (
      filter.from &&
      date < filter.from
    ) {

      return false;
    }


    if (
      filter.to &&
      date > filter.to
    ) {

      return false;
    }


    return true;
  }


  return true;
}


/* =====================================================
   GLOBAL SEARCH MATCHING
===================================================== */

function recordMatchesSearch(
  record,
  query
) {

  const values = [

    record.unitCode,
    record.hmInspection,
    record.dateInspection,
    record.groupComponent,
    record.problemDescription,
    record.rating,
    record.partsDescription,
    record.partNo,
    record.quantity,
    record.inspectors,
    record.notes,
    getMolDisplay(record),
    record.partsStatus,
    record.actionProblems,
    record.hmAction,
    record.dateAction,
    record.status,
    record.manPower

  ];


  return values.some(
    function (value) {

      return normalizeText(
        value
      ).includes(
        query
      );
    }
  );
}


/* =====================================================
   RESET FILTERS
===================================================== */

function resetFilters() {

  activeFilters =
    [];


  if (filterConditions) {

    filterConditions.innerHTML =
      "";

    addFilterCondition();
  }


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (searchInput) {

    searchInput.value =
      "";
  }


  filteredUnitHistoryData =
    [...unitHistoryData];


  selectedDeleteIds.clear();


  renderUnitHistory(
    filteredUnitHistoryData
  );


  renderActiveFilterChips();

  closeFilterPanel();
}


/* =====================================================
   ACTIVE FILTER CHIPS
===================================================== */

function renderActiveFilterChips() {

  if (!activeFiltersContainer) {
    return;
  }


  activeFiltersContainer.innerHTML =
    "";


  if (
    activeFilters.length === 0
  ) {

    activeFiltersContainer.hidden =
      true;

    return;
  }


  activeFiltersContainer.hidden =
    false;


  activeFilters.forEach(
    function (filter) {

      const definition =
        UNIT_HISTORY_FILTER_FIELDS.find(
          function (field) {

            return field.key ===
              filter.key;
          }
        );


      const chip =
        document.createElement(
          "span"
        );

      chip.className =
        "unit-history-filter-chip";


      let text =
        definition?.label ||
        filter.key;


      if (
        filter.type === "numberRange"
      ) {

        text +=
          ": " +
          (
            filter.min ||
            "Min"
          ) +
          " - " +
          (
            filter.max ||
            "Max"
          );

      } else if (
        filter.type === "dateRange"
      ) {

        text +=
          ": " +
          (
            filter.from ||
            "Start"
          ) +
          " - " +
          (
            filter.to ||
            "End"
          );

      } else {

        text +=
          ": " +
          filter.value;
      }


      chip.textContent =
        text;


      activeFiltersContainer.appendChild(
        chip
      );
    }
  );
}


/* =====================================================
   SCROLL NAVIGATION
===================================================== */

function updateScrollNavigation() {

  if (
    !historyScrollContainer ||
    !scrollNavigation
  ) {

    return;
  }


  requestAnimationFrame(
    function () {

      const hasVerticalScroll =
        historyScrollContainer
          .scrollHeight >
        historyScrollContainer
          .clientHeight + 5;


      scrollNavigation.hidden =
        !hasVerticalScroll;
    }
  );
}


/* =====================================================
   OPEN DETAIL
===================================================== */

function openDetail(
  inspectionId
) {

  const record =
    unitHistoryData.find(
      function (item) {

        return String(
          item.id
        ) ===
        String(
          inspectionId
        );
      }
    );


  if (!record) {

    alert(
      "Detail Unit History tidak ditemukan."
    );

    return;
  }


  selectedRecord =
    record;


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


/* =====================================================
   FILL DETAIL
===================================================== */

function fillDetailModal(
  record
) {

  if (detailPhoto) {

    detailPhoto.src =
      record.photo
        ? getDriveImageUrl(
            record.photo
          )
        : createPhotoPlaceholder();


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
    detailInspectors,
    record.inspectors
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
    detailPartNo,
    record.partNo
  );


  setText(
    detailQuantity,
    record.quantity
  );


  setText(
    detailNotes,
    record.notes
  );


  setText(
    detailMol,
    getMolDisplay(
      record
    )
  );


  /*
    Evidence tidak ditampilkan sebagai file.
    Hanya status Submitted / Belum.
  */

  setText(
    detailEvidence,
    record.evidence
      ? "Submitted"
      : "Belum"
  );


  setText(
    detailPartsStatus,
    record.partsStatus
  );


  setText(
    detailActionProblems,
    record.actionProblems
  );


  setText(
    detailHmAction,
    record.hmAction
  );


  setText(
    detailDateAction,
    formatDisplayDate(
      record.dateAction
    )
  );


  setText(
    detailStatus,
    record.status
  );


  setText(
    detailManPower,
    record.manPower
  );
}


/* =====================================================
   CLOSE DETAIL
===================================================== */

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


/* =====================================================
   PHOTO VIEWER
===================================================== */

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


/* =====================================================
   DELETE BUTTON
===================================================== */

function handleDeleteButton() {

  /*
    FIRST CLICK:
    Masuk Delete Mode.
  */

  if (!deleteMode) {

    enterDeleteMode();

    return;
  }


  /*
    SECOND CLICK:
    Jika belum memilih data, keluar Delete Mode.
  */

  if (
    selectedDeleteIds.size === 0
  ) {

    alert(
      "Belum ada data yang dipilih."
    );

    exitDeleteMode();

    return;
  }


  openDeleteConfirmation();
}


/* =====================================================
   ENTER DELETE MODE
===================================================== */

function enterDeleteMode() {

  deleteMode =
    true;


  selectedDeleteIds.clear();


  if (selectAllCheckbox) {

    selectAllCheckbox.checked =
      false;

    selectAllCheckbox.indeterminate =
      false;
  }


  updateDeleteUI();


  renderUnitHistory(
    filteredUnitHistoryData
  );
}


/* =====================================================
   EXIT DELETE MODE
===================================================== */

function exitDeleteMode() {

  deleteMode =
    false;


  selectedDeleteIds.clear();


  if (selectAllCheckbox) {

    selectAllCheckbox.checked =
      false;

    selectAllCheckbox.indeterminate =
      false;
  }


  updateDeleteUI();


  renderUnitHistory(
    filteredUnitHistoryData
  );
}


/* =====================================================
   DELETE UI
===================================================== */

function updateDeleteUI() {

  if (deleteHeader) {

    deleteHeader.hidden =
      !deleteMode;
  }


  if (deleteButton) {

    deleteButton.classList.toggle(
      "is-active",
      deleteMode
    );


    deleteButton.setAttribute(
      "aria-label",
      deleteMode
        ? (
            selectedDeleteIds.size > 0
              ? "Delete " +
                selectedDeleteIds.size +
                " selected item"
              : "Exit Delete Mode"
          )
        : "Delete Unit History"
    );
  }


  document
    .querySelectorAll(
      ".unit-history-delete-column"
    )
    .forEach(
      function (element) {

        element.hidden =
          !deleteMode;
      }
    );


  updateSelectAllState();
}


/* =====================================================
   TOGGLE DELETE SELECTION
===================================================== */

function toggleDeleteSelection(
  inspectionId,
  selected
) {

  if (!inspectionId) {
    return;
  }


  if (selected) {

    selectedDeleteIds.add(
      inspectionId
    );

  } else {

    selectedDeleteIds.delete(
      inspectionId
    );
  }


  updateSelectAllState();
}


/* =====================================================
   SELECT ALL
===================================================== */

function handleSelectAll() {

  if (!selectAllCheckbox) {
    return;
  }


  if (
    selectAllCheckbox.checked
  ) {

    filteredUnitHistoryData
      .forEach(
        function (record) {

          if (record.id) {

            selectedDeleteIds.add(
              record.id
            );
          }
        }
      );

  } else {

    filteredUnitHistoryData
      .forEach(
        function (record) {

          selectedDeleteIds.delete(
            record.id
          );
        }
      );
  }


  historyTableBody
    ?.querySelectorAll(
      ".unit-history-row-checkbox"
    )
    .forEach(
      function (checkbox) {

        checkbox.checked =
          selectedDeleteIds.has(
            checkbox.value
          );
      }
    );


  updateSelectAllState();
}


/* =====================================================
   SELECT ALL STATE
===================================================== */

function updateSelectAllState() {

  if (!selectAllCheckbox) {
    return;
  }


  const ids =
    filteredUnitHistoryData

      .map(
        function (record) {

          return record.id;
        }
      )

      .filter(Boolean);


  if (ids.length === 0) {

    selectAllCheckbox.checked =
      false;

    selectAllCheckbox.indeterminate =
      false;

    return;
  }


  const selectedCount =
    ids.filter(
      function (id) {

        return selectedDeleteIds.has(
          id
        );
      }
    ).length;


  selectAllCheckbox.checked =
    selectedCount ===
    ids.length;


  selectAllCheckbox.indeterminate =
    selectedCount > 0 &&
    selectedCount < ids.length;
}


/* =====================================================
   DELETE CONFIRMATION
===================================================== */

function openDeleteConfirmation() {

  const count =
    selectedDeleteIds.size;


  if (!count) {
    return;
  }


  if (deleteModalMessage) {

    deleteModalMessage.textContent =
      "Apa kamu yakin akan menghapus " +
      count +
      " item dari database?";
  }


  if (deleteModal) {

    deleteModal.hidden =
      false;
  }


  setMainShortcutVisible(
    false
  );


  updateBodyModalState();
}


/* =====================================================
   CANCEL DELETE
===================================================== */

function cancelDelete() {

  if (deleteModal) {

    deleteModal.hidden =
      true;
  }


  /*
    Sesuai kebutuhan:
    No = clear checks + exit delete mode.
  */

  deleteMode =
    false;

  selectedDeleteIds.clear();


  setMainShortcutVisible(
    true
  );


  updateBodyModalState();


  renderUnitHistory(
    filteredUnitHistoryData
  );
}


/* =====================================================
   CONFIRM DELETE
===================================================== */

async function confirmDelete() {

  const inspectionIds =
    Array.from(
      selectedDeleteIds
    );


  if (
    inspectionIds.length === 0
  ) {

    cancelDelete();

    return;
  }


  if (deleteYesButton) {

    deleteYesButton.disabled =
      true;

    deleteYesButton.textContent =
      "Deleting...";
  }


  if (deleteNoButton) {

    deleteNoButton.disabled =
      true;
  }


  try {

    const result =
      await apiRequest({

        action:
          "deleteUnitHistory",

        inspectionIds:
          inspectionIds

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Data Unit History gagal dihapus."
      );
    }


    if (deleteModal) {

      deleteModal.hidden =
        true;
    }


    deleteMode =
      false;

    selectedDeleteIds.clear();


    setMainShortcutVisible(
      true
    );


    updateBodyModalState();


    alert(
      result.message ||
      (
        inspectionIds.length +
        " data berhasil dihapus."
      )
    );


    /*
      Ambil ulang database setelah delete.
    */

    await loadUnitHistory();


  } catch (error) {

    console.error(
      "Delete Unit History:",
      error
    );


    alert(
      error.message ||
      "Data Unit History gagal dihapus."
    );


  } finally {

    if (deleteYesButton) {

      deleteYesButton.disabled =
        false;

      deleteYesButton.textContent =
        "Yes";
    }


    if (deleteNoButton) {

      deleteNoButton.disabled =
        false;
    }
  }
}



/* =====================================================
   PRINT CURRENT FILTERED RESULT
===================================================== */

function printCurrentHistory() {

  if (
    !filteredUnitHistoryData ||
    filteredUnitHistoryData.length === 0
  ) {

    alert(
      "Tidak ada data untuk dicetak."
    );

    return;
  }


  const printWindow =
    window.open(
      "",
      "_blank"
    );


  if (!printWindow) {

    alert(
      "Browser memblokir jendela Print."
    );

    return;
  }


  /* ===================================================
     CURRENT USER
  =================================================== */

  let printUserId = "-";

  try {

    const storedUser =
      JSON.parse(
        sessionStorage.getItem(
          "hexaUser"
        ) || "{}"
      );

    printUserId =
      storedUser.userId ||
      storedUser.userID ||
      storedUser.userid ||
      storedUser["USER ID"] ||
      storedUser.id ||
      "-";

  } catch (error) {

    printUserId = "-";
  }


  /* ===================================================
     ASSET URL
     Dibuat absolute supaya tetap terbaca di print window.
  =================================================== */

  const hrsLogoUrl =
  new URL(
    "hexa-icon-logo-hrsheaderprint.png",
    window.location.href
  ).href;


  const hexaLogoUrl =
    new URL(
      "hexa-logo-header.png",
      window.location.href
    ).href;


  /* ===================================================
     PRINT PART CELL
     Semua multiline dipertahankan berdasarkan index.
  =================================================== */

  function splitPrintPartValue(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return [];
    }

    return String(value)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");
  }


  function buildPrintPartCell(
    values,
    totalParts,
    type
  ) {

    let html =
      `<div class="print-part-list ${type}">`;


    for (
      let index = 0;
      index < totalParts;
      index++
    ) {

      const value =
        values[index] !== undefined
          ? String(values[index]).trim()
          : "";


      html += `
        <div class="print-part-line">
          ${
            value
              ? escapeHtml(value)
              : '<span class="print-empty">-</span>'
          }
        </div>
      `;
    }


    html += "</div>";

    return html;
  }


  /* ===================================================
     TABLE ROWS
  =================================================== */

  const rows =
    filteredUnitHistoryData
      .map(
        function (record) {

          const descriptions =
            splitPrintPartValue(
              record.partsDescription
            );

          const partNumbers =
            splitPrintPartValue(
              record.partNo
            );

          const quantities =
            splitPrintPartValue(
              record.quantity
            );


          const totalParts =
            Math.max(
              1,
              descriptions.length,
              partNumbers.length,
              quantities.length
            );


          const descriptionHtml =
            buildPrintPartCell(
              descriptions,
              totalParts,
              "description"
            );


          const partNoHtml =
            buildPrintPartCell(
              partNumbers,
              totalParts,
              "part-number"
            );


          const quantityHtml =
            buildPrintPartCell(
              quantities,
              totalParts,
              "quantity"
            );


          return `
            <tr class="history-record">

              <td>
                ${escapeHtml(record.unitCode)}
              </td>

              <td>
                ${escapeHtml(record.hmInspection)}
              </td>

              <td>
                ${escapeHtml(record.groupComponent)}
              </td>

              <td>
                ${escapeHtml(record.problemDescription)}
              </td>

              <td>
                ${escapeHtml(record.rating)}
              </td>

              <td>
                ${escapeHtml(record.status)}
              </td>

              <td class="part-cell">
                ${descriptionHtml}
              </td>

              <td class="part-cell">
                ${partNoHtml}
              </td>

              <td class="part-cell qty-cell">
                ${quantityHtml}
              </td>

              <td>
                ${escapeHtml(
                  getMolDisplay(record)
                )}
              </td>

              <td>
                ${escapeHtml(record.partsStatus)}
              </td>

            </tr>
          `;
        }
      )
      .join("");


  const generatedDate =
    new Date()
      .toLocaleString(
        "id-ID"
      );


  /* ===================================================
     PRINT DOCUMENT
  =================================================== */

  printWindow.document.write(`
    <!DOCTYPE html>

    <html lang="id">

    <head>

      <meta charset="UTF-8">

      <title>HEXA - Unit History</title>

      <style>

        @page {
          size: A4 landscape;

          margin:
            10mm
            9mm
            14mm
            9mm;
        }


        * {
          box-sizing: border-box;
        }


        html,
        body {
          margin: 0;
          padding: 0;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          color: #222;

          background: #fff;
        }


        body {
          position: relative;

          padding-bottom: 18px;
        }


        /* =============================================
           MAIN TABLE
        ============================================= */

        table {
          width: 100%;

          border-collapse: collapse;

          table-layout: fixed;

          font-size: 7.5px;
        }


        thead {
          display: table-header-group;
        }


        tbody {
          display: table-row-group;
        }


        /* =============================================
           REPEATING PRINT HEADER
        ============================================= */

        .print-header-row th {
          padding: 0 0 8px 0;

          border: 0;

          background: #fff;

          color: #222;
        }


        .print-header {
          width: 100%;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          padding-bottom: 7px;

          border-bottom:
            2px solid #111;
        }


        .print-header-left {
          min-width: 0;

          text-align: left;
        }


        .print-title {
          margin: 0;

          font-size: 20px;
          line-height: 1.15;

          font-weight: 800;

          color: #111;
        }


        .print-meta {
          margin-top: 4px;

          font-size: 8px;
          line-height: 1.3;

          font-weight: 400;

          color: #666;
        }


        .print-header-logos {
          flex-shrink: 0;

          display: flex;

          align-items: center;

          gap: 12px;
        }


        .print-header-logos img {
          display: block;

          width: auto;

          object-fit: contain;
        }


        .print-logo-hrs {
           width: auto;
           height: 31px;
           object-fit: contain;
      }


        .print-logo-hexa {
           width: auto;
           height: 31px;
           object-fit: contain;
        }


        /* =============================================
           COLUMN HEADER
        ============================================= */

        .column-header th {
          padding: 5px 4px;

          border:
            1px solid #777;

          background: #111;

          color: #fff;

          font-size: 7px;
          line-height: 1.15;

          font-weight: 700;

          text-align: left;

          vertical-align: middle;
        }


        /* =============================================
           BODY
        ============================================= */

        tbody td {
          padding: 5px 4px;

          border:
            1px solid #aaa;

          background: #fff;

          color: #222;

          vertical-align: top;

          line-height: 1.25;

          text-align: left;

          word-break: break-word;

          overflow-wrap: anywhere;
        }


        /*
          Semua informasi record dimulai dari atas,
          bukan vertical center.
        */

        tbody tr.history-record > td {
          vertical-align: top !important;
        }


        /*
          Sebisa mungkin satu inspection tidak
          dipotong antar halaman.
        */

        tbody tr.history-record {
          break-inside: avoid;
          page-break-inside: avoid;
        }


        /* =============================================
           COLUMN WIDTH
        ============================================= */

        .column-header th:nth-child(1) {
          width: 8%;
        }

        .column-header th:nth-child(2) {
          width: 8%;
        }

        .column-header th:nth-child(3) {
          width: 11%;
        }

        .column-header th:nth-child(4) {
          width: 17%;
        }

        .column-header th:nth-child(5) {
          width: 7%;
        }

        .column-header th:nth-child(6) {
          width: 7%;
        }

        .column-header th:nth-child(7) {
          width: 15%;
        }

        .column-header th:nth-child(8) {
          width: 11%;
        }

        .column-header th:nth-child(9) {
          width: 5%;
        }

        .column-header th:nth-child(10) {
          width: 5%;
        }

        .column-header th:nth-child(11) {
          width: 6%;
        }


        /* =============================================
           PART REQUIREMENT
        ============================================= */

        td.part-cell {
          padding-top: 3px;
          padding-bottom: 3px;
        }


        .print-part-list {
          width: 100%;

          display: flex;
          flex-direction: column;

          gap: 0;
        }


        .print-part-line {
          min-height: 19px;

          display: flex;
          align-items: flex-start;

          padding:
            3px
            0;

          border-bottom:
            1px solid #e1e1e1;

          line-height: 13px;

          text-align: left;
        }


        .print-part-line:last-child {
          border-bottom: 0;
        }


        .print-part-list.quantity
        .print-part-line {
          justify-content: center;

          text-align: center;
        }


        td.qty-cell {
          text-align: center;
        }


        .print-empty {
          color: #999;
        }


        /* =============================================
           USER FOOTER
        ============================================= */

        .print-user-footer {
          position: fixed;

          left: 0;
          bottom: -8mm;

          font-size: 7px;
          line-height: 1;

          color: #555;
        }


        /* =============================================
           PRINT
        ============================================= */

        @media print {

          .print-header-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .column-header {
            break-inside: avoid;
            page-break-inside: avoid;
          }

        }

      </style>

    </head>


    <body>


      <table>

        <thead>


          <!-- ========================================
               HEADER INI DIULANG SETIAP HALAMAN
          ========================================= -->

          <tr class="print-header-row">

            <th colspan="11">

              <div class="print-header">

                <div class="print-header-left">

                  <div class="print-title">
                    HEXA - Unit History
                  </div>

                  <div class="print-meta">

                    ${filteredUnitHistoryData.length}
                    records

                    &nbsp;•&nbsp;

                    Printed
                    ${escapeHtml(generatedDate)}

                  </div>

                </div>


                <div class="print-header-logos">

                  <img
                    class="print-logo-hrs"
                    src="${escapeHtml(hrsLogoUrl)}"
                    alt="HRS"
                  >

                  <img
                    class="print-logo-hexa"
                    src="${escapeHtml(hexaLogoUrl)}"
                    alt="HEXA"
                  >

                </div>

              </div>

            </th>

          </tr>


          <!-- ========================================
               COLUMN HEADER
          ========================================= -->

          <tr class="column-header">

            <th>Unit Code</th>

            <th>HM Inspection</th>

            <th>Group Component</th>

            <th>Problem Description</th>

            <th>Rating</th>

            <th>Status</th>

            <th>Parts Description</th>

            <th>Part No</th>

            <th>Qty</th>

            <th>MOL</th>

            <th>Parts Status</th>

          </tr>


        </thead>


        <tbody>

          ${rows}

        </tbody>


      </table>


      <!-- USER ID FOOTER -->

      <div class="print-user-footer">

        USER ID :
        ${escapeHtml(printUserId)}

      </div>


      <script>

        window.onload = function () {

          /*
            Tunggu sebentar agar kedua logo selesai
            dirender sebelum dialog print dibuka.
          */

          setTimeout(
            function () {

              window.print();

            },
            300
          );

        };

      <\/script>


    </body>

    </html>
  `);


  printWindow.document.close();
}

/* =====================================================
   SHORTCUT INITIALIZE
===================================================== */

function initializeShortcut() {

  if (!startInspectionShortcut) {
    return;
  }


  restoreShortcutPosition();


  startInspectionShortcut.addEventListener(
    "pointerdown",
    handleShortcutPointerDown
  );
}


/* =====================================================
   SHORTCUT POINTER DOWN
===================================================== */

function handleShortcutPointerDown(
  event
) {

  if (
    event.button !== undefined &&
    event.button !== 0
  ) {

    return;
  }


  const rect =
    startInspectionShortcut
      .getBoundingClientRect();


  shortcutDragState = {

    pointerId:
      event.pointerId,

    startX:
      event.clientX,

    startY:
      event.clientY,

    startLeft:
      rect.left,

    startTop:
      rect.top,

    moved:
      false

  };


  startInspectionShortcut
    .setPointerCapture(
      event.pointerId
    );


  startInspectionShortcut
    .addEventListener(
      "pointermove",
      handleShortcutPointerMove
    );


  startInspectionShortcut
    .addEventListener(
      "pointerup",
      handleShortcutPointerUp
    );


  startInspectionShortcut
    .addEventListener(
      "pointercancel",
      handleShortcutPointerUp
    );


  event.preventDefault();
}


/* =====================================================
   SHORTCUT POINTER MOVE
===================================================== */

function handleShortcutPointerMove(
  event
) {

  if (
    !shortcutDragState ||
    event.pointerId !==
      shortcutDragState.pointerId
  ) {

    return;
  }


  const deltaX =
    event.clientX -
    shortcutDragState.startX;


  const deltaY =
    event.clientY -
    shortcutDragState.startY;


  if (
    Math.abs(deltaX) > 5 ||
    Math.abs(deltaY) > 5
  ) {

    shortcutDragState.moved =
      true;
  }


  const buttonWidth =
    startInspectionShortcut
      .offsetWidth;


  const buttonHeight =
    startInspectionShortcut
      .offsetHeight;


  const margin =
    8;


  const maxLeft =
    Math.max(
      margin,
      window.innerWidth -
      buttonWidth -
      margin
    );


  const maxTop =
    Math.max(
      margin,
      window.innerHeight -
      buttonHeight -
      margin
    );


  const left =
    clamp(
      shortcutDragState.startLeft +
      deltaX,
      margin,
      maxLeft
    );


  const top =
    clamp(
      shortcutDragState.startTop +
      deltaY,
      margin,
      maxTop
    );


  startInspectionShortcut.style.left =
    left + "px";

  startInspectionShortcut.style.top =
    top + "px";

  startInspectionShortcut.style.right =
    "auto";

  startInspectionShortcut.style.bottom =
    "auto";
}


/* =====================================================
   SHORTCUT POINTER UP
===================================================== */

function handleShortcutPointerUp(
  event
) {

  if (
    !shortcutDragState ||
    event.pointerId !==
      shortcutDragState.pointerId
  ) {

    return;
  }


  const wasMoved =
    shortcutDragState.moved;


  try {

    startInspectionShortcut
      .releasePointerCapture(
        event.pointerId
      );

  } catch (error) {

    /* Ignore */
  }


  startInspectionShortcut
    .removeEventListener(
      "pointermove",
      handleShortcutPointerMove
    );


  startInspectionShortcut
    .removeEventListener(
      "pointerup",
      handleShortcutPointerUp
    );


  startInspectionShortcut
    .removeEventListener(
      "pointercancel",
      handleShortcutPointerUp
    );


  shortcutDragState =
    null;


  if (wasMoved) {

    saveShortcutPosition();

  } else {

    window.location.href =
      "/start-inspection";
  }
}


/* =====================================================
   SAVE SHORTCUT POSITION
===================================================== */

function saveShortcutPosition() {

  if (!startInspectionShortcut) {
    return;
  }


  const rect =
    startInspectionShortcut
      .getBoundingClientRect();


  const position = {

    left:
      rect.left,

    top:
      rect.top

  };


  try {

    localStorage.setItem(
      UNIT_HISTORY_SHORTCUT_POSITION_KEY,
      JSON.stringify(
        position
      )
    );

  } catch (error) {

    console.warn(
      "Shortcut position tidak dapat disimpan.",
      error
    );
  }
}


/* =====================================================
   RESTORE SHORTCUT POSITION
===================================================== */

function restoreShortcutPosition() {

  if (!startInspectionShortcut) {
    return;
  }


  let savedPosition =
    null;


  try {

    savedPosition =
      JSON.parse(
        localStorage.getItem(
          UNIT_HISTORY_SHORTCUT_POSITION_KEY
        )
      );

  } catch (error) {

    savedPosition =
      null;
  }


  if (
    !savedPosition ||
    !Number.isFinite(
      Number(savedPosition.left)
    ) ||
    !Number.isFinite(
      Number(savedPosition.top)
    )
  ) {

    return;
  }


  const width =
    startInspectionShortcut
      .offsetWidth ||
    70;


  const height =
    startInspectionShortcut
      .offsetHeight ||
    70;


  const margin =
    8;


  const left =
    clamp(
      Number(
        savedPosition.left
      ),
      margin,
      Math.max(
        margin,
        window.innerWidth -
        width -
        margin
      )
    );


  const top =
    clamp(
      Number(
        savedPosition.top
      ),
      margin,
      Math.max(
        margin,
        window.innerHeight -
        height -
        margin
      )
    );


  startInspectionShortcut.style.left =
    left + "px";

  startInspectionShortcut.style.top =
    top + "px";

  startInspectionShortcut.style.right =
    "auto";

  startInspectionShortcut.style.bottom =
    "auto";
}


/* =====================================================
   KEEP SHORTCUT INSIDE VIEWPORT
===================================================== */

function keepShortcutInsideViewport() {

  if (
    !startInspectionShortcut ||
    startInspectionShortcut.hidden
  ) {

    return;
  }


  const rect =
    startInspectionShortcut
      .getBoundingClientRect();


  /*
    Kalau tombol masih menggunakan posisi CSS default,
    jangan paksa menjadi left/top.
  */

  const hasCustomPosition =
    startInspectionShortcut.style.left ||
    startInspectionShortcut.style.top;


  if (!hasCustomPosition) {
    return;
  }


  const margin =
    8;


  const left =
    clamp(
      rect.left,
      margin,
      Math.max(
        margin,
        window.innerWidth -
        rect.width -
        margin
      )
    );


  const top =
    clamp(
      rect.top,
      margin,
      Math.max(
        margin,
        window.innerHeight -
        rect.height -
        margin
      )
    );


  startInspectionShortcut.style.left =
    left + "px";

  startInspectionShortcut.style.top =
    top + "px";


  saveShortcutPosition();
}


/* =====================================================
   SHORTCUT VISIBILITY
===================================================== */

function setMainShortcutVisible(
  visible
) {

  if (!startInspectionShortcut) {
    return;
  }


  startInspectionShortcut.hidden =
    !visible;
}


/* =====================================================
   BODY MODAL STATE
===================================================== */

function updateBodyModalState() {

  const hasOpenModal =

    (
      detailModal &&
      !detailModal.hidden
    ) ||

    (
      photoViewer &&
      !photoViewer.hidden
    ) ||

    (
      deleteModal &&
      !deleteModal.hidden
    );


  document.body.classList.toggle(
    "modal-open",
    Boolean(
      hasOpenModal
    )
  );
}


/* =====================================================
   ESCAPE KEY
===================================================== */

function handleEscapeKey(
  event
) {

  if (
    event.key !== "Escape"
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
    deleteModal &&
    !deleteModal.hidden
  ) {

    cancelDelete();

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

    return;
  }


  if (deleteMode) {

    exitDeleteMode();
  }
}


/* =====================================================
   GOOGLE DRIVE IMAGE URL
===================================================== */

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


/* =====================================================
   PHOTO PLACEHOLDER
===================================================== */

function createPhotoPlaceholder() {

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="600"
      height="400"
      viewBox="0 0 600 400"
    >

      <rect
        width="600"
        height="400"
        fill="#ececec"
      />

      <text
        x="300"
        y="200"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial"
        font-size="32"
        fill="#999999"
      >
        No Photo
      </text>

    </svg>
  `;


  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      svg
    )
  );
}


/* =====================================================
   TEXT HELPER
===================================================== */

function setText(
  element,
  value
) {

  if (!element) {
    return;
  }


  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {

    element.textContent =
      "-";

    return;
  }


  element.textContent =
    value;
}


/* =====================================================
   NORMALIZE TEXT
===================================================== */

function normalizeText(
  value
) {

  return String(
    value ?? ""
  )
    .trim()
    .toLowerCase();
}


/* =====================================================
   NUMERIC VALUE
===================================================== */

function parseNumericValue(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return NaN;
  }


  const text =
    String(value)
      .trim()
      .replace(/\s/g, "")
      .replace(/,/g, "");


  return Number(
    text
  );
}


/* =====================================================
   DATE NORMALIZATION
===================================================== */

function normalizeDateValue(
  value
) {

  if (!value) {
    return "";
  }


  const text =
    String(value)
      .trim();


  /*
    YYYY-MM-DD
  */

  if (
    /^\d{4}-\d{2}-\d{2}$/
      .test(text)
  ) {

    return text;
  }


  const date =
    new Date(
      text
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";
  }


  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    year +
    "-" +
    month +
    "-" +
    day
  );
}


/* =====================================================
   DISPLAY DATE
===================================================== */

function formatDisplayDate(
  value
) {

  if (!value) {
    return "-";
  }


  const normalized =
    normalizeDateValue(
      value
    );


  if (!normalized) {

    return String(
      value
    );
  }


  const parts =
    normalized.split("-");


  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );
}


/* =====================================================
   CLAMP
===================================================== */

function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(
      value,
      min
    ),
    max
  );
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
  value
) {

  return String(
    value ?? "-"
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}
