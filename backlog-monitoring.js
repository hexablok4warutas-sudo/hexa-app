"use strict";


// ======================================================
// HEXA BACKLOG MONITORING
// backlog-monitoring.js
// ======================================================


// ======================================================
// 1. SESSION PROTECTION
// ======================================================

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


// ======================================================
// 2. CURRENT USER
// ======================================================

let currentUser = null;


try {

  currentUser =
    JSON.parse(hexaUserData);

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
// 3. BACKLOG PAGES
// ======================================================

const BACKLOG_PAGES = {

  "backlog-registration": {
    url: "backlog-registration.html",
    enabled: true
  },

  "backlog-control": {
    url: "backlog-control.html",
    enabled: false
  }

};


// ======================================================
// 4. MENU ITEMS
// ======================================================

const backlogMenuItems =
  document.querySelectorAll(
    ".backlog-menu-item"
  );


// ======================================================
// 5. OPEN BACKLOG PAGE
// ======================================================

function openBacklogPage(menuName) {

  const page =
    BACKLOG_PAGES[menuName];


  if (!page) {

    console.log(
      "Menu Backlog tidak terdaftar:",
      menuName
    );

    return;

  }


  if (page.enabled) {

    window.location.href =
      page.url;

    return;

  }


  console.log(
    "Halaman Backlog belum tersedia:",
    page.url
  );

}


// ======================================================
// 6. MENU CLICK
// ======================================================

backlogMenuItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const menu =
          item.dataset.menu;

        openBacklogPage(menu);

      }
    );

  }
);


// ======================================================
// 7. FLOATING START INSPECTION
// ======================================================

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


if (inspectionShortcut) {

  inspectionShortcut.addEventListener(
    "click",
    function () {

      window.location.href =
        "start-inspection.html";

    }
  );

}


// ======================================================
// 8. INITIALIZE
// ======================================================

function initializeBacklogMonitoring() {

  console.log(
    "HEXA Backlog Monitoring Ready"
  );

}


initializeBacklogMonitoring();
