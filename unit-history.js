"use strict";


// =====================================================
// HEXA APP
// UNIT HISTORY
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



// =====================================================
// CURRENT USER
// =====================================================

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
// DATA
// =====================================================

let unitHistoryData = [];



// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {


    // =================================================
    // ELEMENTS
    // =================================================

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


    const tableCard =
      document.getElementById(
        "unitHistoryTableCard"
      );


    const tableBody =
      document.getElementById(
        "unitHistoryTableBody"
      );


    const filterButton =
      document.getElementById(
        "unitHistoryFilterButton"
      );


    const reviewButton =
      document.getElementById(
        "unitHistoryReviewButton"
      );


    const printButton =
      document.getElementById(
        "unitHistoryPrintButton"
      );



    // =================================================
    // PAGE STATE
    // =================================================

    function showState(
      state
    ) {


      if (loading) {

        loading.hidden =
          state !==
          "loading";

      }


      if (empty) {

        empty.hidden =
          state !==
          "empty";

      }


      if (errorBox) {

        errorBox.hidden =
          state !==
          "error";

      }


      if (tableCard) {

        tableCard.hidden =
          state !==
          "table";

      }

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
    // LOAD UNIT HISTORY
    // =================================================

    async function loadUnitHistory() {


      showState(
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
          unitHistoryData.length ===
          0
        ) {

          showState(
            "empty"
          );

          return;

        }



        renderUnitHistory(
          unitHistoryData
        );


        showState(
          "table"
        );


      } catch (error) {


        console.error(
          "Unit History Error:",
          error
        );


        showState(
          "error"
        );

      }

    }



    // =================================================
    // RENDER UNIT HISTORY
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


          // -------------------------------------------
          // INTERNAL ID
          // -------------------------------------------

          row.dataset.inspectionId =
            cleanValue(
              record.id
            );



          // -------------------------------------------
          // UNIT CODE
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.unitCode
            )

          );



          // -------------------------------------------
          // HM INSPECTION
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.hmInspection
            )

          );



          // -------------------------------------------
          // GROUP COMPONENT
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.groupComponent
            )

          );



          // -------------------------------------------
          // PROBLEM DESCRIPTION
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.problemDescription
            )

          );



          // -------------------------------------------
          // PHOTO
          // -------------------------------------------

          row.appendChild(

            createPhotoCell(
              record.photo
            )

          );



          // -------------------------------------------
          // RATING
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.rating
            )

          );



          // -------------------------------------------
          // STATUS
          // -------------------------------------------

          row.appendChild(

            createStatusCell(
              record.status
            )

          );



          // -------------------------------------------
          // PARTS DESCRIPTION
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.partsDescription
            )

          );



          // -------------------------------------------
          // MOL
          // -------------------------------------------

          row.appendChild(

            createMolCell(
              record.mol
            )

          );



          // -------------------------------------------
          // PARTS STATUS
          // -------------------------------------------

          row.appendChild(

            createTextCell(
              record.partsStatus
            )

          );



          // -------------------------------------------
          // ROW CLICK
          // DETAIL AKAN DIBUAT TAHAP BERIKUTNYA
          // -------------------------------------------

          row.addEventListener(
            "click",
            function () {


              console.log(
                "Selected Unit History:",
                row.dataset.inspectionId
              );


            }
          );



          tableBody.appendChild(
            row
          );


        }
      );

    }



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


        const noPhoto =
          document.createElement(
            "span"
          );


        noPhoto.className =
          "unit-history-no-photo";


        noPhoto.textContent =
          "No Photo";


        cell.appendChild(
          noPhoto
        );


        return cell;

      }



      const image =
        document.createElement(
          "img"
        );


      image.className =
        "unit-history-photo";


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


          const noPhoto =
            document.createElement(
              "span"
            );


          noPhoto.className =
            "unit-history-no-photo";


          noPhoto.textContent =
            "No Photo";


          cell.appendChild(
            noPhoto
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
    // GOOGLE DRIVE IMAGE URL
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

        "&sz=w400"

      );

    }



    // =================================================
    // GOOGLE DRIVE FILE ID
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
    // STATUS
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
    // MOL
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
    // FILTER
    // FUNGSI AKAN DIBUAT TAHAP BERIKUTNYA
    // =================================================

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



    // =================================================
    // REVIEW
    // FUNGSI AKAN DIBUAT TAHAP BERIKUTNYA
    // =================================================

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



    // =================================================
    // PRINT / EXPORT
    // FUNGSI AKAN DIBUAT TAHAP BERIKUTNYA
    // =================================================

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
