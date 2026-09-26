"use strict";

// ========================================
// HEXA APP - UNIT HISTORY
// ========================================

const HEXA_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


// ========================================
// SESSION PROTECTION
// ========================================

const hexaLoggedIn =
  sessionStorage.getItem("hexaLoggedIn");

const hexaUserData =
  sessionStorage.getItem("hexaUser");


if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {

  window.location.replace(
    "index.html"
  );

}


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


// ========================================
// DATA
// ========================================

let unitHistoryData = [];


// ========================================
// ELEMENTS
// ========================================

const historyLoading =
  document.getElementById(
    "historyLoading"
  );

const historyEmpty =
  document.getElementById(
    "historyEmpty"
  );

const historyError =
  document.getElementById(
    "historyError"
  );

const historyTableWrap =
  document.getElementById(
    "historyTableWrap"
  );

const historyTableBody =
  document.getElementById(
    "historyTableBody"
  );

const filterButton =
  document.getElementById(
    "filterButton"
  );

const reviewButton =
  document.getElementById(
    "reviewButton"
  );

const printButton =
  document.getElementById(
    "printButton"
  );


// ========================================
// PAGE STATE
// ========================================

function setState(state) {

  historyLoading.hidden =
    state !== "loading";

  historyEmpty.hidden =
    state !== "empty";

  historyError.hidden =
    state !== "error";

  historyTableWrap.hidden =
    state !== "table";

}


// ========================================
// API REQUEST
// ========================================

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


  return response.json();

}


// ========================================
// LOAD UNIT HISTORY
// ========================================

async function loadUnitHistory() {

  setState(
    "loading"
  );


  try {

    const result =
      await apiRequest({
        action:
          "getUnitHistory"
      });


    console.log(
      "Unit History API:",
      result
    );


    if (!result.success) {

      throw new Error(
        result.message ||
        "Gagal mengambil Unit History."
      );

    }


    unitHistoryData =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];


    if (
      unitHistoryData.length === 0
    ) {

      setState(
        "empty"
      );

      return;

    }


    renderUnitHistory(
      unitHistoryData
    );


    setState(
      "table"
    );

  } catch (error) {

    console.error(
      "Unit History error:",
      error
    );


    setState(
      "error"
    );

  }

}


// ========================================
// RENDER TABLE
// ========================================

function renderUnitHistory(
  records
) {

  historyTableBody.innerHTML =
    "";


  records.forEach(
    function (record) {

      const row =
        document.createElement(
          "tr"
        );


      // ID tidak ditampilkan,
      // tetapi tetap dibawa oleh row.
      row.dataset.inspectionId =
        record.id || "";


      // UNIT CODE
      row.appendChild(
        createTextCell(
          record.unitCode
        )
      );


      // HM INSPECTION
      row.appendChild(
        createTextCell(
          record.hmInspection
        )
      );


      // GROUP COMPONENT
      row.appendChild(
        createTextCell(
          record.groupComponent
        )
      );


      // PROBLEM DESCRIPTION
      row.appendChild(
        createTextCell(
          record.problemDescription
        )
      );


      // PHOTO
      row.appendChild(
        createPhotoCell(
          record.photo
        )
      );


      // RATING
      row.appendChild(
        createTextCell(
          record.rating
        )
      );


      // STATUS
      row.appendChild(
        createStatusCell(
          record.status
        )
      );


      // PARTS DESCRIPTION
      row.appendChild(
        createTextCell(
          record.partsDescription
        )
      );


      // MOL
      row.appendChild(
        createMolCell(
          record.mol
        )
      );


      // PARTS STATUS
      row.appendChild(
        createTextCell(
          record.partsStatus
        )
      );


      // Detail modal akan kita
      // aktifkan pada tahap berikutnya.
      row.addEventListener(
        "click",
        function () {

          console.log(
            "Unit History selected:",
            row.dataset.inspectionId
          );

        }
      );


      historyTableBody.appendChild(
        row
      );

    }
  );

}


// ========================================
// TEXT CELL
// ========================================

function createTextCell(
  value
) {

  const cell =
    document.createElement(
      "td"
    );


  const text =
    String(
      value || ""
    ).trim();


  cell.textContent =
    text || "-";


  if (!text) {

    cell.classList.add(
      "muted"
    );

  }


  return cell;

}


// ========================================
// PHOTO CELL
// ========================================

function createPhotoCell(
  photoUrl
) {

  const cell =
    document.createElement(
      "td"
    );


  const url =
    String(
      photoUrl || ""
    ).trim();


  if (!url) {

    cell.textContent =
      "No Photo";

    cell.classList.add(
      "muted"
    );

    return cell;

  }


  const image =
    document.createElement(
      "img"
    );


  image.className =
    "photo";

  image.alt =
    "Inspection Photo";

  image.loading =
    "lazy";


  image.src =
    getDriveImageUrl(
      url
    );


  image.addEventListener(
    "error",
    function () {

      image.remove();

      cell.textContent =
        "No Photo";

      cell.classList.add(
        "muted"
      );

    },
    {
      once: true
    }
  );


  cell.appendChild(
    image
  );


  return cell;

}


// ========================================
// GOOGLE DRIVE IMAGE URL
// ========================================

function getDriveImageUrl(
  url
) {

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
    "&sz=w400"
  );

}


// ========================================
// GET GOOGLE DRIVE FILE ID
// ========================================

function getDriveFileId(
  url
) {

  const text =
    String(
      url || ""
    );


  let match =
    text.match(
      /\/d\/([a-zA-Z0-9_-]+)/
    );


  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  match =
    text.match(
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


// ========================================
// STATUS CELL
// ========================================

function createStatusCell(
  value
) {

  const cell =
    document.createElement(
      "td"
    );


  const badge =
    document.createElement(
      "span"
    );


  const status =
    String(
      value || ""
    ).trim();


  badge.className =
    "badge " +
    (
      status.toUpperCase() ===
      "CLOSE"
        ? "close"
        : "open"
    );


  badge.textContent =
    status || "-";


  cell.appendChild(
    badge
  );


  return cell;

}


// ========================================
// MOL CELL
// ========================================

function createMolCell(
  value
) {

  const cell =
    document.createElement(
      "td"
    );


  const badge =
    document.createElement(
      "span"
    );


  const mol =
    String(
      value || ""
    ).trim();


  badge.className =
    "badge " +
    (
      mol.toLowerCase() ===
      "submitted"
        ? "submitted"
        : "belum"
    );


  badge.textContent =
    mol || "-";


  cell.appendChild(
    badge
  );


  return cell;

}


// ========================================
// FILTER
// Tahap berikutnya
// ========================================

if (filterButton) {

  filterButton.addEventListener(
    "click",
    function () {

      console.log(
        "Unit History Filter"
      );

    }
  );

}


// ========================================
// REVIEW
// Tahap berikutnya
// ========================================

if (reviewButton) {

  reviewButton.addEventListener(
    "click",
    function () {

      console.log(
        "Unit History Review Performance"
      );

    }
  );

}


// ========================================
// PRINT / EXPORT
// Tahap berikutnya
// ========================================

if (printButton) {

  printButton.addEventListener(
    "click",
    function () {

      console.log(
        "Unit History Print / Export"
      );

    }
  );

}


// ========================================
// START
// ========================================

loadUnitHistory();


console.log(
  "HEXA Unit History Ready",
  currentUser
);
