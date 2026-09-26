"use strict";


// =====================================================
// HEXA APP - UNIT HISTORY
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


// =====================================================
// DATA STATE
// =====================================================

let unitHistoryData = [];

let selectedHistoryRecord = null;

let deleteMode = false;

let deleteInProgress = false;


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {


    // =================================================
    // PAGE
    // =================================================

    const page =
      document.getElementById(
        "unitHistoryPage"
      );


    // =================================================
    // ACTION BUTTONS
    // =================================================

    const filterButton =
      document.getElementById(
        "unitHistoryFilterButton"
      );

    const printButton =
      document.getElementById(
        "unitHistoryPrintButton"
      );

    const deleteButton =
      document.getElementById(
        "unitHistoryDeleteButton"
      );


    // =================================================
    // TABLE VIEW
    // =================================================

    const tableView =
      document.getElementById(
        "unitHistoryTableView"
      );

    const loading =
      document.getElementById(
        "unitHistoryLoading"
      );

    const empty =
      document.getElementById(
        "unitHistoryEmpty"
      );

    const errorBox =
      document.getElementById(
        "unitHistoryError"
      );

    const tableContainer =
      document.getElementById(
        "unitHistoryTableContainer"
      );

    const tableBody =
      document.getElementById(
        "unitHistoryTableBody"
      );

    const deleteHeader =
      document.getElementById(
        "unitHistoryDeleteHeader"
      );

    const selectAll =
      document.getElementById(
        "unitHistorySelectAll"
      );


    // =================================================
    // DETAIL VIEW
    // =================================================

    const detailView =
      document.getElementById(
        "unitHistoryDetailView"
      );

    const detailBackButton =
      document.getElementById(
        "unitHistoryDetailBackButton"
      );

    const detailHeaderUnitCode =
      document.getElementById(
        "unitHistoryDetailUnitCode"
      );


    // =================================================
    // DETAIL FIELDS
    // =================================================

    const detailUnitCode =
      document.getElementById(
        "detailUnitCode"
      );

    const detailHmInspection =
      document.getElementById(
        "detailHmInspection"
      );

    const detailDateInspection =
      document.getElementById(
        "detailDateInspection"
      );

    const detailInspectors =
      document.getElementById(
        "detailInspectors"
      );

    const detailPhotoContainer =
      document.getElementById(
        "detailPhotoContainer"
      );

    const detailGroupComponent =
      document.getElementById(
        "detailGroupComponent"
      );

    const detailRating =
      document.getElementById(
        "detailRating"
      );

    const detailProblemDescription =
      document.getElementById(
        "detailProblemDescription"
      );

    const detailPartsDescription =
      document.getElementById(
        "detailPartsDescription"
      );

    const detailPartNo =
      document.getElementById(
        "detailPartNo"
      );

    const detailQuantity =
      document.getElementById(
        "detailQuantity"
      );

    const detailNotes =
      document.getElementById(
        "detailNotes"
      );

    const detailMol =
      document.getElementById(
        "detailMol"
      );

    const detailEvidenceStatus =
      document.getElementById(
        "detailEvidenceStatus"
      );

    const detailPartsStatus =
      document.getElementById(
        "detailPartsStatus"
      );

    const detailStatus =
      document.getElementById(
        "detailStatus"
      );

    const detailActionProblems =
      document.getElementById(
        "detailActionProblems"
      );

    const detailHmAction =
      document.getElementById(
        "detailHmAction"
      );

    const detailDateAction =
      document.getElementById(
        "detailDateAction"
      );

    const detailManPower =
      document.getElementById(
        "detailManPower"
      );


    // =================================================
    // FLOATING SHORTCUT
    // =================================================

    const inspectionShortcut =
      document.getElementById(
        "unitHistoryInspectionShortcut"
      );


    // =================================================
    // DELETE MODAL
    // =================================================

    const deleteModal =
      document.getElementById(
        "unitHistoryDeleteModal"
      );

    const deleteModalMessage =
      document.getElementById(
        "unitHistoryDeleteModalMessage"
      );

    const deleteNoButton =
      document.getElementById(
        "unitHistoryDeleteNoButton"
      );

    const deleteYesButton =
      document.getElementById(
        "unitHistoryDeleteYesButton"
      );


    // =================================================
    // CLEAN VALUE
    // =================================================

    function cleanValue(
      value
    ) {

      if (
        value === null ||
        value === undefined
      ) {

        return "";

      }


      return String(
        value
      ).trim();

    }


    // =================================================
    // DISPLAY VALUE
    // =================================================

    function displayValue(
      value
    ) {

      const text =
        cleanValue(
          value
        );


      return text || "-";

    }


    // =================================================
    // API REQUEST
    // =================================================

    async function apiRequest(
      payload
    ) {

      const response =
        await fetch(
          HEXA_API_URL,
          {

            method:
              "POST",

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


    // =================================================
    // TABLE STATE
    // =================================================

    function showTableState(
      state
    ) {

      if (loading) {

        loading.hidden =
          state !== "loading";

      }


      if (empty) {

        empty.hidden =
          state !== "empty";

      }


      if (errorBox) {

        errorBox.hidden =
          state !== "error";

      }


      if (tableContainer) {

        tableContainer.hidden =
          state !== "table";

      }

    }


    // =================================================
    // LOAD UNIT HISTORY
    // =================================================

    async function loadUnitHistory() {

      showTableState(
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


        if (
          !result ||
          !result.success
        ) {

          throw new Error(

            result &&
            result.message

              ? result.message

              : "Gagal mengambil Unit History."

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

          showTableState(
            "empty"
          );

          return;

        }


        renderUnitHistory(
          unitHistoryData
        );


        showTableState(
          "table"
        );


      } catch (error) {

        console.error(
          "Unit History Error:",
          error
        );


        showTableState(
          "error"
        );

      }

    }


    // =================================================
    // RENDER TABLE
    // =================================================

    function renderUnitHistory(
      records
    ) {

      if (!tableBody) {

        return;

      }


      tableBody.innerHTML =
        "";


      records.forEach(
        function (record) {

          const row =
            document.createElement(
              "tr"
            );


          const recordId =
            cleanValue(
              record.id
            );


          row.dataset.inspectionId =
            recordId;


          // ===========================================
          // DELETE CHECKBOX CELL
          // ===========================================

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
            recordId;


          checkbox.setAttribute(
            "aria-label",
            "Pilih " +
            (
              cleanValue(
                record.unitCode
              ) ||
              recordId
            )
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

              updateSelectAllState();

            }
          );


          deleteCell.appendChild(
            checkbox
          );


          row.appendChild(
            deleteCell
          );


          // ===========================================
          // TABLE DATA
          // ===========================================

          row.appendChild(
            createTextCell(
              record.unitCode
            )
          );


          row.appendChild(
            createTextCell(
              record.hmInspection
            )
          );


          row.appendChild(
            createTextCell(
              record.groupComponent
            )
          );


          row.appendChild(
            createTextCell(
              record.problemDescription
            )
          );


          row.appendChild(
            createPhotoCell(
              record.photo
            )
          );


          row.appendChild(
            createTextCell(
              record.rating
            )
          );


          row.appendChild(
            createStatusCell(
              record.status
            )
          );


          row.appendChild(
            createTextCell(
              record.partsDescription
            )
          );


          row.appendChild(
            createMolCell(
              record.mol
            )
          );


          row.appendChild(
            createTextCell(
              record.partsStatus
            )
          );


          // ===========================================
          // ROW CLICK
          // ===========================================

          row.addEventListener(
            "click",
            function (event) {

              if (deleteMode) {

                if (
                  event.target.closest(
                    "input"
                  )
                ) {

                  return;

                }


                checkbox.checked =
                  !checkbox.checked;


                updateSelectAllState();


                return;

              }


              openDetail(
                record
              );

            }
          );


          tableBody.appendChild(
            row
          );

        }
      );


      updateDeleteColumnVisibility();

    }


    // =================================================
    // TEXT CELL
    // =================================================

    function createTextCell(
      value
    ) {

      const cell =
        document.createElement(
          "td"
        );


      const text =
        cleanValue(
          value
        );


      if (text) {

        cell.textContent =
          text;

      } else {

        cell.textContent =
          "-";


        cell.classList.add(
          "unit-history-empty-value"
        );

      }


      return cell;

    }


    // =================================================
    // PHOTO CELL
    // =================================================

    function createPhotoCell(
      photoUrl
    ) {

      const cell =
        document.createElement(
          "td"
        );


      const url =
        cleanValue(
          photoUrl
        );


      if (!url) {

        addNoPhoto(
          cell
        );


        return cell;

      }


      const image =
        document.createElement(
          "img"
        );


      image.className =
        "unit-history-row-photo";


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


          addNoPhoto(
            cell
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


    // =================================================
    // NO PHOTO
    // =================================================

    function addNoPhoto(
      container
    ) {

      const noPhoto =
        document.createElement(
          "span"
        );


      noPhoto.className =
        "unit-history-row-no-photo";


      noPhoto.textContent =
        "No Photo";


      container.appendChild(
        noPhoto
      );

    }


    // =================================================
    // DRIVE IMAGE
    // =================================================

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
        "&sz=w1000"
      );

    }


    // =================================================
    // DRIVE FILE ID
    // =================================================

    function getDriveFileId(
      url
    ) {

      const text =
        cleanValue(
          url
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


    // =================================================
    // STATUS CELL
    // =================================================

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
        cleanValue(
          value
        );


      badge.className =
        "unit-history-badge";


      if (
        status.toUpperCase() ===
        "CLOSE"
      ) {

        badge.classList.add(
          "unit-history-badge-close"
        );

      } else {

        badge.classList.add(
          "unit-history-badge-open"
        );

      }


      badge.textContent =
        status || "-";


      cell.appendChild(
        badge
      );


      return cell;

    }


    // =================================================
    // MOL CELL
    // =================================================

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
        cleanValue(
          value
        );


      badge.className =
        "unit-history-badge";


      if (
        mol.toLowerCase() ===
        "submitted"
      ) {

        badge.classList.add(
          "unit-history-badge-submitted"
        );

      } else {

        badge.classList.add(
          "unit-history-badge-belum"
        );

      }


      badge.textContent =
        mol || "-";


      cell.appendChild(
        badge
      );


      return cell;

    }


    // =================================================
    // OPEN DETAIL
    // =================================================

    function openDetail(
      record
    ) {

      selectedHistoryRecord =
        record;


      exitDeleteMode();


      fillDetail(
        record
      );


      if (tableView) {

        tableView.hidden =
          true;

      }


      if (detailView) {

        detailView.hidden =
          false;


        detailView.scrollTop =
          0;

      }


      // Floating Start Inspection hilang
      // ketika membuka detail.

      if (inspectionShortcut) {

        inspectionShortcut.hidden =
          true;

      }

    }


    // =================================================
    // CLOSE DETAIL
    // =================================================

    function closeDetail() {

      selectedHistoryRecord =
        null;


      if (detailView) {

        detailView.hidden =
          true;

      }


      if (tableView) {

        tableView.hidden =
          false;

      }


      if (inspectionShortcut) {

        inspectionShortcut.hidden =
          false;

      }

    }


    // =================================================
    // FILL DETAIL
    // =================================================

    function fillDetail(
      record
    ) {

      setText(
        detailHeaderUnitCode,
        record.unitCode
      );


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
        record.dateInspection
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
        detailRating,
        record.rating
      );


      setText(
        detailProblemDescription,
        record.problemDescription
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
        record.mol
      );


      // Evidence hanya ditampilkan
      // sebagai status.

      setText(
        detailEvidenceStatus,
        getEvidenceStatus(
          record
        )
      );


      setText(
        detailPartsStatus,
        record.partsStatus
      );


      setText(
        detailStatus,
        record.status
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
        record.dateAction
      );


      setText(
        detailManPower,
        record.manPower
      );


      renderDetailPhoto(
        record.photo
      );

    }


    // =================================================
    // SET DETAIL TEXT
    // =================================================

    function setText(
      element,
      value
    ) {

      if (!element) {

        return;

      }


      element.textContent =
        displayValue(
          value
        );

    }


    // =================================================
    // EVIDENCE STATUS
    // =================================================

    function getEvidenceStatus(
      record
    ) {

      const evidence =
        cleanValue(
          record.evidence
        );


      if (evidence) {

        return "Submitted";

      }


      const mol =
        cleanValue(
          record.mol
        );


      if (
        mol.toLowerCase() ===
        "submitted"
      ) {

        return "Submitted";

      }


      return "Belum";

    }


    // =================================================
    // DETAIL PHOTO
    // =================================================

    function renderDetailPhoto(
      photoUrl
    ) {

      if (!detailPhotoContainer) {

        return;

      }


      detailPhotoContainer.innerHTML =
        "";


      const url =
        cleanValue(
          photoUrl
        );


      if (!url) {

        const text =
          document.createElement(
            "span"
          );


        text.className =
          "unit-history-row-no-photo";


        text.textContent =
          "No Photo";


        detailPhotoContainer.appendChild(
          text
        );


        return;

      }


      const image =
        document.createElement(
          "img"
        );


      image.className =
        "unit-history-detail-photo";


      image.alt =
        "Inspection Photo";


      image.src =
        getDriveImageUrl(
          url
        );


      image.addEventListener(
        "error",
        function () {

          detailPhotoContainer.innerHTML =
            "";


          const text =
            document.createElement(
              "span"
            );


          text.className =
            "unit-history-row-no-photo";


          text.textContent =
            "No Photo";


          detailPhotoContainer.appendChild(
            text
          );

        },
        {
          once: true
        }
      );


      detailPhotoContainer.appendChild(
        image
      );

    }


    // =================================================
    // DETAIL BACK
    // =================================================

    if (detailBackButton) {

      detailBackButton.addEventListener(
        "click",
        function () {

          closeDetail();

        }
      );

    }


    // =================================================
    // START INSPECTION SHORTCUT
    // =================================================

    if (inspectionShortcut) {

      inspectionShortcut.addEventListener(
        "click",
        function () {

          window.location.href =
            "/start-inspection";

        }
      );

    }


    // =================================================
    // DELETE BUTTON
    // =================================================

    if (deleteButton) {

      deleteButton.addEventListener(
        "click",
        function () {

          if (deleteInProgress) {

            return;

          }


          // First click:
          // masuk Delete Mode.

          if (!deleteMode) {

            enterDeleteMode();

            return;

          }


          // Second click:
          // cek checkbox terpilih.

          const selectedIds =
            getSelectedDeleteIds();


          if (
            selectedIds.length === 0
          ) {

            alert(
              "Pilih minimal 1 data yang akan dihapus."
            );

            return;

          }


          openDeleteConfirmation(
            selectedIds.length
          );

        }
      );

    }


    // =================================================
    // ENTER DELETE MODE
    // =================================================

    function enterDeleteMode() {

      deleteMode =
        true;


      if (page) {

        page.classList.add(
          "is-delete-mode"
        );

      }


      if (deleteButton) {

        deleteButton.classList.add(
          "is-active"
        );


        deleteButton.title =
          "Hapus data terpilih";

      }


      clearDeleteSelection();


      updateDeleteColumnVisibility();

    }


    // =================================================
    // EXIT DELETE MODE
    // =================================================

    function exitDeleteMode() {

      deleteMode =
        false;


      if (page) {

        page.classList.remove(
          "is-delete-mode"
        );

      }


      if (deleteButton) {

        deleteButton.classList.remove(
          "is-active"
        );


        deleteButton.title =
          "Delete";

      }


      clearDeleteSelection();


      updateDeleteColumnVisibility();

    }


    // =================================================
    // DELETE COLUMN VISIBILITY
    // =================================================

    function updateDeleteColumnVisibility() {

      if (deleteHeader) {

        deleteHeader.hidden =
          !deleteMode;

      }


      const deleteCells =
        document.querySelectorAll(
          ".unit-history-table tbody .unit-history-delete-column"
        );


      deleteCells.forEach(
        function (cell) {

          cell.hidden =
            !deleteMode;

        }
      );

    }


    // =================================================
    // CLEAR DELETE SELECTION
    // =================================================

    function clearDeleteSelection() {

      const checkboxes =
        getRowCheckboxes();


      checkboxes.forEach(
        function (checkbox) {

          checkbox.checked =
            false;

        }
      );


      if (selectAll) {

        selectAll.checked =
          false;

        selectAll.indeterminate =
          false;

      }

    }


    // =================================================
    // ROW CHECKBOXES
    // =================================================

    function getRowCheckboxes() {

      return Array.from(

        document.querySelectorAll(
          ".unit-history-row-checkbox"
        )

      );

    }


    // =================================================
    // SELECT ALL
    // =================================================

    if (selectAll) {

      selectAll.addEventListener(
        "change",
        function () {

          const checkboxes =
            getRowCheckboxes();


          checkboxes.forEach(
            function (checkbox) {

              checkbox.checked =
                selectAll.checked;

            }
          );


          updateSelectAllState();

        }
      );

    }


    // =================================================
    // UPDATE SELECT ALL STATE
    // =================================================

    function updateSelectAllState() {

      if (!selectAll) {

        return;

      }


      const checkboxes =
        getRowCheckboxes();


      const checkedCount =
        checkboxes.filter(
          function (checkbox) {

            return checkbox.checked;

          }
        ).length;


      selectAll.checked =
        (
          checkboxes.length > 0 &&
          checkedCount ===
          checkboxes.length
        );


      selectAll.indeterminate =
        (
          checkedCount > 0 &&
          checkedCount <
          checkboxes.length
        );

    }


    // =================================================
    // GET SELECTED DELETE IDS
    // =================================================

    function getSelectedDeleteIds() {

      return getRowCheckboxes()

        .filter(
          function (checkbox) {

            return checkbox.checked;

          }
        )

        .map(
          function (checkbox) {

            return cleanValue(
              checkbox.value
            );

          }
        )

        .filter(
          function (id) {

            return id !== "";

          }
        );

    }


    // =================================================
    // DELETE CONFIRMATION
    // =================================================

    function openDeleteConfirmation(
      count
    ) {

      if (!deleteModal) {

        return;

      }


      if (deleteModalMessage) {

        deleteModalMessage.textContent =
          "Apa kamu yakin akan menghapus " +
          count +
          " item dari database?";

      }


      deleteModal.hidden =
        false;

    }


    // =================================================
    // CLOSE DELETE CONFIRMATION
    // =================================================

    function closeDeleteConfirmation() {

      if (deleteModal) {

        deleteModal.hidden =
          true;

      }

    }


    // =================================================
    // NO DELETE
    // Sesuai keputusan:
    // No = checkbox hilang dan Delete Mode reset.
    // =================================================

    if (deleteNoButton) {

      deleteNoButton.addEventListener(
        "click",
        function () {

          closeDeleteConfirmation();

          exitDeleteMode();

        }
      );

    }


    // =================================================
    // CLICK BACKDROP = SAMA SEPERTI NO
    // =================================================

    if (deleteModal) {

      deleteModal.addEventListener(
        "click",
        function (event) {

          const closeTarget =
            event.target.closest(
              "[data-delete-close='true']"
            );


          if (!closeTarget) {

            return;

          }


          closeDeleteConfirmation();

          exitDeleteMode();

        }
      );

    }


    // =================================================
    // YES DELETE
    // =================================================

    if (deleteYesButton) {

      deleteYesButton.addEventListener(
        "click",
        async function () {

          if (deleteInProgress) {

            return;

          }


          const selectedIds =
            getSelectedDeleteIds();


          if (
            selectedIds.length === 0
          ) {

            closeDeleteConfirmation();

            exitDeleteMode();

            return;

          }


          await executeDelete(
            selectedIds
          );

        }
      );

    }


    // =================================================
    // EXECUTE DELETE
    // =================================================

    async function executeDelete(
      selectedIds
    ) {

      deleteInProgress =
        true;


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
              selectedIds

          });


        console.log(
          "Delete Unit History:",
          result
        );


        if (
          !result ||
          !result.success
        ) {

          throw new Error(

            result &&
            result.message

              ? result.message

              : "Gagal menghapus data."

          );

        }


        closeDeleteConfirmation();

        exitDeleteMode();


        // Refresh dari database
        // supaya tabel benar-benar mengikuti
        // kondisi terbaru DM DATABASE.

        await loadUnitHistory();


        alert(

          (
            result.deletedCount ||
            selectedIds.length
          ) +

          " item berhasil dihapus."

        );


      } catch (error) {

        console.error(
          "Delete Unit History Error:",
          error
        );


        alert(

          error.message ||
          "Gagal menghapus data."

        );


      } finally {

        deleteInProgress =
          false;


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


    // =================================================
    // FILTER
    // AKAN KITA AKTIFKAN SETELAH VIEW DASAR STABIL
    // =================================================

    if (filterButton) {

      filterButton.addEventListener(
        "click",
        function () {

          console.log(
            "Unit History Filter - next step"
          );

        }
      );

    }


    // =================================================
    // PRINT / EXPORT
    // AKAN KITA AKTIFKAN SETELAH FILTER
    // =================================================

    if (printButton) {

      printButton.addEventListener(
        "click",
        function () {

          console.log(
            "Unit History Print / Export - next step"
          );

        }
      );

    }


    // =================================================
    // START
    // =================================================

    loadUnitHistory();


    console.log(
      "HEXA Unit History Ready",
      currentUser
    );


  }
);
