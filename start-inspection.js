"use strict";


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
  currentUser = JSON.parse(storedUser);
} catch (error) {

  sessionStorage.removeItem("hexaLoggedIn");
  sessionStorage.removeItem("hexaUser");

  window.location.replace("index.html");
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

  const page = HEXA_PAGES[pageName];

  if (!page) {
    return;
  }

  if (!page.enabled) {
    console.log(
      `${pageName} belum diaktifkan.`
    );

    return;
  }

  window.location.href = page.url;
}


/* =====================================================
   HEADER NAVIGATION
===================================================== */

const headerLogoButton =
  document.getElementById("headerLogoButton");

const hexaNavMenu =
  document.getElementById("hexaNavMenu");


function closeHexaNavigation() {

  hexaNavMenu.classList.remove("open");

  headerLogoButton.setAttribute(
    "aria-expanded",
    "false"
  );
}


headerLogoButton.addEventListener(
  "click",
  function (event) {

    event.stopPropagation();

    const isOpen =
      hexaNavMenu.classList.toggle("open");

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
  .querySelectorAll(".nav-menu-item")
  .forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const page =
          button.dataset.page;

        closeHexaNavigation();

        openHexaPage(page);
      }
    );
  });


/* =====================================================
   REFRESH
===================================================== */

const refreshButton =
  document.getElementById("refreshButton");


refreshButton.addEventListener(
  "click",
  function () {

    window.location.reload();
  }
);


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
  document.getElementById("searchInput");

const searchButton =
  document.getElementById("searchButton");


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
    document.querySelectorAll(".form-group");

  for (const group of groups) {

    const label =
      group.querySelector("label");

    if (!label) {
      continue;
    }

    const labelText =
      label.textContent
        .toLowerCase();

    if (labelText.includes(query)) {

      const headerOffset = 180;

      const elementPosition =
        group.getBoundingClientRect().top;

      const offsetPosition =
        elementPosition +
        window.pageYOffset -
        headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
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


searchButton.addEventListener(
  "click",
  searchFormField
);


searchInput.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter") {

      event.preventDefault();

      searchFormField();
    }
  }
);


/* =====================================================
   HM CONTROL
===================================================== */

const hmInspection =
  document.getElementById("hmInspection");

const hmMinus =
  document.getElementById("hmMinus");

const hmPlus =
  document.getElementById("hmPlus");


hmMinus.addEventListener(
  "click",
  function () {

    const currentValue =
      Number(hmInspection.value) || 0;

    hmInspection.value =
      Math.max(0, currentValue - 1);
  }
);


hmPlus.addEventListener(
  "click",
  function () {

    const currentValue =
      Number(hmInspection.value) || 0;

    hmInspection.value =
      currentValue + 1;
  }
);


/* =====================================================
   DEFAULT DATE
===================================================== */

const dateInspection =
  document.getElementById("dateInspection");


function setTodayAsDefaultDate() {

  if (dateInspection.value) {
    return;
  }

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  dateInspection.value =
    `${year}-${month}-${day}`;
}


setTodayAsDefaultDate();


/* =====================================================
   PHOTO
===================================================== */

const inspectionPhoto =
  document.getElementById("inspectionPhoto");

const photoText =
  document.getElementById("photoText");

const photoPreviewContainer =
  document.getElementById(
    "photoPreviewContainer"
  );

const photoPreview =
  document.getElementById("photoPreview");


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

      photoPreview.removeAttribute("src");

      return;
    }

    photoText.textContent =
      file.name;

    const imageUrl =
      URL.createObjectURL(file);

    photoPreview.src =
      imageUrl;

    photoPreviewContainer.hidden =
      false;
  }
);


/* =====================================================
   RATING
===================================================== */

const ratingInput =
  document.getElementById("rating");

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
  document.getElementById("inspectors");


if (
  currentUser &&
  currentUser.nama
) {

  inspectors.value =
    currentUser.nama;
}


/* =====================================================
   TEST SUBMIT
===================================================== */

const inspectionForm =
  document.getElementById(
    "inspectionForm"
  );


inspectionForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();


    if (!ratingInput.value) {

      alert(
        "Silakan pilih Rating terlebih dahulu."
      );

      return;
    }


    const testData = {

      unitCode:
        document.getElementById(
          "unitCode"
        ).value,

      hmInspection:
        hmInspection.value,

      dateInspection:
        dateInspection.value,

      photo:
        inspectionPhoto.files[0]
          ? inspectionPhoto.files[0].name
          : "",

      groupComponent:
        document.getElementById(
          "groupComponent"
        ).value,

      problemDescription:
        document.getElementById(
          "problemDescription"
        ).value,

      rating:
        ratingInput.value,

      partsDescription:
        document.getElementById(
          "partsDescription"
        ).value,

      partNo:
        document.getElementById(
          "partNo"
        ).value,

      quantity:
        document.getElementById(
          "quantity"
        ).value,

      inspectors:
        inspectors.value,

      notes:
        document.getElementById(
          "notes"
        ).value

    };


    console.log(
      "HEXA START INSPECTION TEST:",
      testData
    );


    alert(
      "Form Start Inspection sudah bekerja.\n\n" +
      "Ini masih mode testing dan data belum dikirim ke database."
    );
  }
);
