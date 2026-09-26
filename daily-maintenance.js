// ========================================
// HEXA APP
// DAILY MAINTENANCE
// ========================================

"use strict";


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

  window.location.replace("index.html");

}


// ========================================
// BACA DATA USER
// ========================================

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


console.log(
  "HEXA Current User:",
  currentUser
);


// ========================================
// ELEMENT KHUSUS DAILY MAINTENANCE
// ========================================

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchButton =
  document.getElementById(
    "searchButton"
  );

const dailyMenuItems =
  document.querySelectorAll(
    ".daily-menu-item"
  );

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


// ========================================
// SEARCH DAILY MAINTENANCE MENU
// ========================================

function searchDailyMenu() {

  if (!searchInput) {
    return;
  }

  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  dailyMenuItems.forEach(
    function (item) {

      const menuName =
        item.textContent
          .trim()
          .toLowerCase();


      if (
        !keyword ||
        menuName.includes(keyword)
      ) {

        item.classList.remove(
          "search-hidden"
        );

      } else {

        item.classList.add(
          "search-hidden"
        );

      }

    }
  );

}


// ========================================
// SEARCH SAAT USER MENGETIK
// ========================================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    searchDailyMenu
  );


  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        searchDailyMenu();

      }

    }
  );

}


// ========================================
// SEARCH BUTTON
// ========================================

if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchDailyMenu
  );

}


// ========================================
// DAILY MAINTENANCE MENU
// ========================================

dailyMenuItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const menu =
          item.dataset.menu;


        // =================================
        // START INSPECTION
        // =================================

        if (
          menu ===
          "start-inspection"
        ) {

          openStartInspection();

          return;

        }


        // =================================
        // DAILY OUTSTANDING
        // =================================

        if (
          menu ===
          "daily-outstanding"
        ) {

          console.log(
            "Daily Outstanding"
          );

          return;

        }


        // =================================
        // UNIT HISTORY
        // =================================

        if (
          menu ===
          "unit-history"
        ) {

          console.log(
            "Unit History"
          );

          return;

        }

      }
    );

  }
);


// ========================================
// OPEN START INSPECTION
// ========================================

function openStartInspection() {

  window.location.href =
    "/start-inspection";

}


// ========================================
// FLOATING BUTTON
// ========================================

const FLOATING_POSITION_KEY =
  "hexaInspectionButtonPosition";

let isDragging =
  false;

let hasDragged =
  false;

let dragOffsetX =
  0;

let dragOffsetY =
  0;


// ========================================
// LOAD POSISI FLOATING BUTTON
// ========================================

function loadFloatingPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const savedPosition =
    localStorage.getItem(
      FLOATING_POSITION_KEY
    );


  if (!savedPosition) {
    return;
  }


  try {

    const position =
      JSON.parse(
        savedPosition
      );


    if (
      typeof position.left !==
        "number" ||
      typeof position.top !==
        "number"
    ) {

      return;

    }


    const buttonWidth =
      inspectionShortcut.offsetWidth;

    const buttonHeight =
      inspectionShortcut.offsetHeight;


    const maxLeft =
      Math.max(
        0,
        window.innerWidth -
        buttonWidth
      );


    const maxTop =
      Math.max(
        0,
        window.innerHeight -
        buttonHeight
      );


    const left =
      Math.min(
        Math.max(
          position.left,
          0
        ),
        maxLeft
      );


    const top =
      Math.min(
        Math.max(
          position.top,
          0
        ),
        maxTop
      );


    inspectionShortcut.style.left =
      left + "px";

    inspectionShortcut.style.top =
      top + "px";

    inspectionShortcut.style.right =
      "auto";

    inspectionShortcut.style.bottom =
      "auto";


  } catch (error) {

    console.error(
      "Floating button position error:",
      error
    );

  }

}


// ========================================
// SAVE POSISI FLOATING BUTTON
// ========================================

function saveFloatingPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const rect =
    inspectionShortcut
      .getBoundingClientRect();


  localStorage.setItem(
    FLOATING_POSITION_KEY,
    JSON.stringify({

      left: rect.left,
      top: rect.top

    })
  );

}


// ========================================
// FLOATING BUTTON EVENTS
// ========================================

if (inspectionShortcut) {


  // ======================================
  // POINTER DOWN
  // ======================================

  inspectionShortcut.addEventListener(
    "pointerdown",
    function (event) {

      isDragging = true;
      hasDragged = false;


      const rect =
        inspectionShortcut
          .getBoundingClientRect();


      dragOffsetX =
        event.clientX -
        rect.left;


      dragOffsetY =
        event.clientY -
        rect.top;


      try {

        inspectionShortcut
          .setPointerCapture(
            event.pointerId
          );

      } catch (error) {

        console.log(
          "Pointer capture unavailable"
        );

      }

    }
  );


  // ======================================
  // POINTER MOVE
  // ======================================

  inspectionShortcut.addEventListener(
    "pointermove",
    function (event) {

      if (!isDragging) {
        return;
      }


      const rect =
        inspectionShortcut
          .getBoundingClientRect();


      const movementX =
        Math.abs(
          event.clientX -
          (
            rect.left +
            dragOffsetX
          )
        );


      const movementY =
        Math.abs(
          event.clientY -
          (
            rect.top +
            dragOffsetY
          )
        );


      if (
        movementX > 2 ||
        movementY > 2
      ) {

        hasDragged = true;

      }


      const buttonWidth =
        inspectionShortcut.offsetWidth;


      const buttonHeight =
        inspectionShortcut.offsetHeight;


      let left =
        event.clientX -
        dragOffsetX;


      let top =
        event.clientY -
        dragOffsetY;


      const maxLeft =
        Math.max(
          0,
          window.innerWidth -
          buttonWidth
        );


      const maxTop =
        Math.max(
          0,
          window.innerHeight -
          buttonHeight
        );


      left =
        Math.min(
          Math.max(
            left,
            0
          ),
          maxLeft
        );


      top =
        Math.min(
          Math.max(
            top,
            0
          ),
          maxTop
        );


      inspectionShortcut.style.left =
        left + "px";


      inspectionShortcut.style.top =
        top + "px";


      inspectionShortcut.style.right =
        "auto";


      inspectionShortcut.style.bottom =
        "auto";

    }
  );


  // ======================================
  // POINTER UP
  // ======================================

  inspectionShortcut.addEventListener(
    "pointerup",
    function (event) {

      if (!isDragging) {
        return;
      }


      isDragging = false;


      try {

        inspectionShortcut
          .releasePointerCapture(
            event.pointerId
          );

      } catch (error) {

        console.log(
          "Pointer release unavailable"
        );

      }


      if (hasDragged) {

        saveFloatingPosition();

      }

    }
  );


  // ======================================
  // POINTER CANCEL
  // ======================================

  inspectionShortcut.addEventListener(
    "pointercancel",
    function () {

      isDragging = false;

    }
  );


  // ======================================
  // CLICK
  // ======================================

  inspectionShortcut.addEventListener(
    "click",
    function () {

      if (hasDragged) {

        hasDragged = false;

        return;

      }


      openStartInspection();

    }
  );

}


// ========================================
// WINDOW RESIZE
// JAGA BUTTON TETAP DI DALAM LAYAR
// ========================================

window.addEventListener(
  "resize",
  function () {

    if (!inspectionShortcut) {
      return;
    }


    const rect =
      inspectionShortcut
        .getBoundingClientRect();


    const buttonWidth =
      inspectionShortcut.offsetWidth;


    const buttonHeight =
      inspectionShortcut.offsetHeight;


    const maxLeft =
      Math.max(
        0,
        window.innerWidth -
        buttonWidth
      );


    const maxTop =
      Math.max(
        0,
        window.innerHeight -
        buttonHeight
      );


    const left =
      Math.min(
        Math.max(
          rect.left,
          0
        ),
        maxLeft
      );


    const top =
      Math.min(
        Math.max(
          rect.top,
          0
        ),
        maxTop
      );


    inspectionShortcut.style.left =
      left + "px";


    inspectionShortcut.style.top =
      top + "px";


    inspectionShortcut.style.right =
      "auto";


    inspectionShortcut.style.bottom =
      "auto";


    saveFloatingPosition();

  }
);


// ========================================
// INITIALIZE
// ========================================

loadFloatingPosition();


console.log(
  "HEXA Daily Maintenance Ready"
);
