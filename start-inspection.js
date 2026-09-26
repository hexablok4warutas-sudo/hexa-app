"use strict";


/* =====================================================
   HEXA API
===================================================== */

const HEXA_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


/* =====================================================
   SESSION PROTECTION
===================================================== */

const isLoggedIn =
  sessionStorage.getItem("hexaLoggedIn") === "true";

const storedUser =
  sessionStorage.getItem("hexaUser");


if (!isLoggedIn || !storedUser) {
  window.location.replace("index.html");
}


let currentUser = null;


try {

  currentUser =
    JSON.parse(storedUser);

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
   PAGE ROUTING
===================================================== */

const HEXA_PAGES = {

  main: {
    url: "main.html",
    enabled: true
  },

  "daily-maintenance": {
    url: "daily-maintenance.html",
    enabled: true
  },

  "backlog-monitoring": {
    url: "backlog-monitoring.html",
    enabled: false
  },

  fui: {
    url: "fui.html",
    enabled: false
  },

  rotable: {
    url: "rotable.html",
    enabled: false
  },

  news: {
    url: "news.html",
    enabled: false
  },

  settings: {
    url: "settings.html",
    enabled: false
  }

};


function openHexaPage(pageName) {

  const page =
    HEXA_PAGES[pageName];

  if (!page) {
    return;
  }

  if (!page.enabled) {

    console.log(
      `${pageName} belum diaktifkan.`
    );

    return;
  }

  window.location.href =
    page.url;
}


/* =====================================================
   HEADER NAVIGATION
===================================================== */

const headerLogoButton =
  document.getElementById(
    "headerLogoButton"
  );

const hexaNavMenu =
  document.getElementById(
    "hexaNavMenu"
  );


function closeHexaNavigation() {

  if (!hexaNavMenu) {
    return;
  }

  hexaNavMenu.classList.remove(
    "open"
  );

  if (headerLogoButton) {

    headerLogoButton.setAttribute(
      "aria-expanded",
      "false"
    );

  }
}


if (
  headerLogoButton &&
  hexaNavMenu
) {

  headerLogoButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      const isOpen =
        hexaNavMenu.classList.toggle(
          "open"
        );

      headerLogoButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );


  hexaNavMenu.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

    }
  );

}


document.addEventListener(
  "click",
  closeHexaNavigation
);


document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {

      closeHexaNavigation();

    }

  }
);


/* =====================================================
   NAVIGATION ITEMS
===================================================== */

document
  .querySelectorAll(
    ".nav-menu-item"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const page =
            button.dataset.page;

          closeHexaNavigation();

          openHexaPage(page);

        }
      );

    }
  );


/* =====================================================
   REFRESH
===================================================== */

const refreshButton =
  document.getElementById(
    "refreshButton"
  );


if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    function () {

      window.location.reload();

    }
  );

}


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchButton =
  document.getElementById(
    "searchButton"
  );


function searchFormField() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  if (!query) {

    searchInput.focus();

    return;

  }


  const groups =
    document.querySelectorAll(
      ".form-group"
    );


  for (const group of groups) {

    const label =
      group.querySelector(
        "label"
      );

    if (!label) {
      continue;
    }


    const labelText =
      label.textContent
        .toLowerCase();


    if (
      labelText.includes(query)
    ) {

      const headerOffset =
        180;

      const elementPosition =
        group
          .getBoundingClientRect()
          .top;

      const offsetPosition =
        elementPosition +
        window.pageYOffset -
        headerOffset;


      window.scrollTo({

        top:
          offsetPosition,

        behavior:
          "smooth"

      });


      const input =
        group.querySelector(
          "input, select, textarea, button"
        );


      if (input) {

        setTimeout(
          () => input.focus(),
          450
        );

      }

      return;

    }

  }

}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchFormField
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        searchFormField();

      }

    }
  );

}


/* =====================================================
   HM CONTROL
===================================================== */

const hmInspection =
  document.getElementById(
    "hmInspection"
  );

const hmMinus =
  document.getElementById(
    "hmMinus"
  );

const hmPlus =
  document.getElementById(
    "hmPlus"
  );


if (
  hmMinus &&
  hmInspection
) {

  hmMinus.addEventListener(
    "click",
    function () {

      const currentValue =
        Number(
          hmInspection.value
        ) || 0;

      hmInspection.value =
        Math.max(
          0,
          currentValue - 1
        );

    }
  );

}


if (
  hmPlus &&
  hmInspection
) {

  hmPlus.addEventListener(
    "click",
    function () {

      const currentValue =
        Number(
          hmInspection.value
        ) || 0;

      hmInspection.value =
        currentValue + 1;

    }
  );

}


/* =====================================================
   DEFAULT DATE
===================================================== */

const dateInspection =
  document.getElementById(
    "dateInspection"
  );


function setTodayAsDefaultDate() {

  if (!dateInspection) {
    return;
  }

  if (
    dateInspection.value
  ) {
    return;
  }


  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  dateInspection.value =
    `${year}-${month}-${day}`;

}


setTodayAsDefaultDate();


/* =====================================================
   PHOTO
===================================================== */

const inspectionPhoto =
  document.getElementById(
    "inspectionPhoto"
  );

const photoText =
  document.getElementById(
    "photoText"
  );

const photoPreviewContainer =
  document.getElementById(
    "photoPreviewContainer"
  );

const photoPreview =
  document.getElementById(
    "photoPreview"
  );


if (inspectionPhoto) {

  inspectionPhoto.addEventListener(
    "change",
    function () {

      const file =
        inspectionPhoto.files[0];


      if (!file) {

        photoText.textContent =
          "Add Inspection Photo";

        photoPreviewContainer.hidden =
          true;

        photoPreview.removeAttribute(
          "src"
        );

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "File harus berupa gambar."
        );

        inspectionPhoto.value =
          "";

        return;

      }


      photoText.textContent =
        file.name;


      const imageUrl =
        URL.createObjectURL(
          file
        );


      photoPreview.src =
        imageUrl;

      photoPreviewContainer.hidden =
        false;

    }
  );

}


/* =====================================================
   COMPRESS PHOTO
===================================================== */

function compressPhoto(file) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const reader =
        new FileReader();


      reader.onload =
        function (event) {

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


              const compressedData =
                canvas.toDataURL(
                  "image/jpeg",
                  0.75
                );


              resolve({

                base64:
                  compressedData,

                mimeType:
                  "image/jpeg"

              });

            };


          image.onerror =
            function () {

              reject(
                new Error(
                  "Foto tidak dapat diproses."
                )
              );

            };


          image.src =
            event.target.result;

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Foto tidak dapat dibaca."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================================
   RATING
===================================================== */

const ratingInput =
  document.getElementById(
    "rating"
  );

const ratingButtons =
  document.querySelectorAll(
    ".rating-button"
  );


ratingButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        ratingButtons.forEach(
          function (item) {

            item.classList.remove(
              "selected"
            );

          }
        );


        button.classList.add(
          "selected"
        );


        ratingInput.value =
          button.dataset.rating;

      }
    );

  }
);


/* =====================================================
   INSPECTOR FROM LOGIN
===================================================== */

const inspectors =
  document.getElementById(
    "inspectors"
  );


if (
  currentUser &&
  currentUser.nama &&
  inspectors
) {

  inspectors.value =
    currentUser.nama;

}


/* =====================================================
   FORM
===================================================== */

const inspectionForm =
  document.getElementById(
    "inspectionForm"
  );


/* =====================================================
   SUBMIT BUTTON
===================================================== */

const submitButton =
  inspectionForm
    ? inspectionForm.querySelector(
        'button[type="submit"], input[type="submit"]'
      )
    : null;


/* =====================================================
   SET SUBMIT LOADING
===================================================== */

function setSubmitLoading(
  loading
) {

  if (!submitButton) {
    return;
  }


  if (loading) {

    submitButton.disabled =
      true;

    submitButton.dataset.originalText =
      submitButton.textContent;

    submitButton.textContent =
      "Submitting...";

  } else {

    submitButton.disabled =
      false;

    submitButton.textContent =
      submitButton.dataset.originalText ||
      "Submit";

  }

}


/* =====================================================
   RESET FORM SETELAH BERHASIL
===================================================== */

function resetInspectionForm() {

  inspectionForm.reset();


  // Inspector tetap dari user login

  if (
    currentUser &&
    currentUser.nama
  ) {

    inspectors.value =
      currentUser.nama;

  }


  // Reset Rating

  ratingInput.value =
    "";

  ratingButtons.forEach(
    function (button) {

      button.classList.remove(
        "selected"
      );

    }
  );


  // Reset Photo

  photoText.textContent =
    "Add Inspection Photo";

  photoPreviewContainer.hidden =
    true;

  photoPreview.removeAttribute(
    "src"
  );


  // Tanggal kembali hari ini

  setTodayAsDefaultDate();

}


/* =====================================================
   SUBMIT START INSPECTION
===================================================== */

if (inspectionForm) {

  inspectionForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      /* ===============================================
         VALIDASI RATING
      =============================================== */

      if (
        !ratingInput.value
      ) {

        alert(
          "Silakan pilih Rating terlebih dahulu."
        );

        return;

      }


      /* ===============================================
         VALIDASI PHOTO
      =============================================== */

      const photoFile =
        inspectionPhoto.files[0];


      if (!photoFile) {

        alert(
          "Silakan tambahkan Photo Inspection."
        );

        return;

      }


      /* ===============================================
         VALIDASI REQUIRED HTML
      =============================================== */

      if (
        !inspectionForm.checkValidity()
      ) {

        inspectionForm.reportValidity();

        return;

      }


      setSubmitLoading(
        true
      );


      try {

        /* =============================================
           COMPRESS PHOTO
        ============================================= */

        const photo =
          await compressPhoto(
            photoFile
          );


        /* =============================================
           DATA START INSPECTION
        ============================================= */

        const inspectionData = {

          action:
            "submitInspection",

          unitCode:
            document.getElementById(
              "unitCode"
            ).value.trim(),

          hmInspection:
            hmInspection.value.trim(),

          dateInspection:
            dateInspection.value,

          photoBase64:
            photo.base64,

          photoMimeType:
            photo.mimeType,

          groupComponent:
            document.getElementById(
              "groupComponent"
            ).value.trim(),

          problemDescription:
            document.getElementById(
              "problemDescription"
            ).value.trim(),

          rating:
            ratingInput.value,

          partsDescription:
            document.getElementById(
              "partsDescription"
            ).value.trim(),

          partNo:
            document.getElementById(
              "partNo"
            ).value.trim(),

          quantity:
            document.getElementById(
              "quantity"
            ).value.trim(),

          inspectors:
            inspectors.value.trim(),

          notes:
            document.getElementById(
              "notes"
            ).value.trim()

        };


        console.log(
          "HEXA SUBMIT:",
          inspectionData
        );


        /* =============================================
           SEND TO HEXA API
        ============================================= */

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
                  inspectionData
                )

            }
          );


        /* =============================================
           RESPONSE
        ============================================= */

        if (!response.ok) {

          throw new Error(
            "Server tidak merespons dengan benar."
          );

        }


        const result =
          await response.json();


        console.log(
          "HEXA RESPONSE:",
          result
        );


        /* =============================================
           API ERROR
        ============================================= */

        if (
          !result.success
        ) {

          throw new Error(
            result.message ||
            "Inspection gagal disimpan."
          );

        }


        /* =============================================
           SUCCESS
        ============================================= */

        alert(

          "Inspection berhasil disimpan.\n\n" +

          "ID Inspection:\n" +
          result.inspectionId +

          "\n\nStatus: " +
          result.status +

          "\nMOL: " +
          result.mol

        );


        resetInspectionForm();


        window.scrollTo({

          top: 0,

          behavior:
            "smooth"

        });


      } catch (error) {

        console.error(
          "HEXA SUBMIT ERROR:",
          error
        );


        alert(

          "Inspection gagal disimpan.\n\n" +

          error.message

        );

      } finally {

        setSubmitLoading(
          false
        );

      }

    }
  );

}


/* =====================================================
   READY
===================================================== */

console.log(
  "HEXA Start Inspection Ready"
);
