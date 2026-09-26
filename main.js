"use strict";


// ======================================================
// HEXA MAIN PAGE
// main.js
// ======================================================


// ======================================================
// 1. HEXA SESSION PROTECTION
// ======================================================

const hexaLoggedIn =
  sessionStorage.getItem(
    "hexaLoggedIn"
  );

const hexaUserData =
  sessionStorage.getItem(
    "hexaUser"
  );


// ======================================================
// CEK LOGIN
// ======================================================

if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {

  window.location.replace(
    "index.html"
  );

}


// ======================================================
// BACA DATA USER
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


console.log(
  "HEXA Current User:",
  currentUser
);


// ======================================================
// 2. DAFTAR HALAMAN HEXA
// ======================================================

const HEXA_PAGES = {

  "daily-maintenance": {
    url: "daily-maintenance.html",
    enabled: true
  },

  "backlog-monitoring": {
    url: "backlog-monitoring.html",
    enabled: false
  },

  "fui": {
    url: "fui.html",
    enabled: false
  },

  "rotable": {
    url: "rotable.html",
    enabled: false
  },

  "news": {
    url: "news.html",
    enabled: false
  },

  "settings": {
    url: "settings.html",
    enabled: false
  }

};


// ======================================================
// 3. LOGOUT DROPDOWN
// ======================================================

const headerLogoButton =
  document.getElementById(
    "headerLogoButton"
  );

const hexaLogoutMenu =
  document.getElementById(
    "hexaLogoutMenu"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );


// ======================================================
// OPEN / CLOSE LOGOUT MENU
// ======================================================

if (
  headerLogoButton &&
  hexaLogoutMenu
) {

  headerLogoButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      const isOpen =
        hexaLogoutMenu.classList.toggle(
          "open"
        );


      headerLogoButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );


  hexaLogoutMenu.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

    }
  );

}


// ======================================================
// CLOSE LOGOUT MENU
// ======================================================

function closeLogoutMenu() {

  if (!hexaLogoutMenu) {
    return;
  }


  hexaLogoutMenu.classList.remove(
    "open"
  );


  if (headerLogoButton) {

    headerLogoButton.setAttribute(
      "aria-expanded",
      "false"
    );

  }

}


// Klik di luar dropdown

document.addEventListener(
  "click",
  closeLogoutMenu
);


// ESC menutup dropdown

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key ===
      "Escape"
    ) {

      closeLogoutMenu();

    }

  }
);


// ======================================================
// 4. LOGOUT
// ======================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    function () {

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
  );

}


// ======================================================
// 5. BANNER SLIDER
// ======================================================

const slides =
  document.querySelectorAll(
    ".banner-slide"
  );

const prevButton =
  document.getElementById(
    "sliderPrev"
  );

const nextButton =
  document.getElementById(
    "sliderNext"
  );

const bannerSlider =
  document.getElementById(
    "bannerSlider"
  );


let currentSlide = 0;

let autoSlideTimer;


// ======================================================
// TAMPILKAN SLIDE
// ======================================================

function showSlide(index) {

  if (!slides.length) {
    return;
  }


  if (
    index >= slides.length
  ) {

    currentSlide = 0;

  }

  else if (
    index < 0
  ) {

    currentSlide =
      slides.length - 1;

  }

  else {

    currentSlide =
      index;

  }


  slides.forEach(
    function (
      slide,
      slideIndex
    ) {

      if (
        slideIndex ===
        currentSlide
      ) {

        slide.classList.add(
          "active"
        );

      } else {

        slide.classList.remove(
          "active"
        );

      }

    }
  );

}


// ======================================================
// SLIDE BERIKUTNYA
// ======================================================

function nextSlide() {

  showSlide(
    currentSlide + 1
  );

}


// ======================================================
// SLIDE SEBELUMNYA
// ======================================================

function previousSlide() {

  showSlide(
    currentSlide - 1
  );

}


// ======================================================
// 6. AUTO SLIDE
// ======================================================

function startAutoSlide() {

  stopAutoSlide();


  autoSlideTimer =
    setInterval(
      function () {

        nextSlide();

      },
      5000
    );

}


function stopAutoSlide() {

  if (autoSlideTimer) {

    clearInterval(
      autoSlideTimer
    );

  }

}


function resetAutoSlide() {

  stopAutoSlide();

  startAutoSlide();

}


// ======================================================
// 7. PREVIOUS / NEXT BUTTON
// ======================================================

if (prevButton) {

  prevButton.addEventListener(
    "click",
    function () {

      previousSlide();

      resetAutoSlide();

    }
  );

}


if (nextButton) {

  nextButton.addEventListener(
    "click",
    function () {

      nextSlide();

      resetAutoSlide();

    }
  );

}


// ======================================================
// 8. SWIPE BANNER
// ======================================================

let touchStartX = 0;

let touchEndX = 0;


if (bannerSlider) {

  bannerSlider.addEventListener(
    "touchstart",
    function (event) {

      touchStartX =
        event
          .changedTouches[0]
          .screenX;

    },
    {
      passive: true
    }
  );


  bannerSlider.addEventListener(
    "touchend",
    function (event) {

      touchEndX =
        event
          .changedTouches[0]
          .screenX;


      handleBannerSwipe();

    },
    {
      passive: true
    }
  );

}


function handleBannerSwipe() {

  const swipeDistance =
    touchStartX -
    touchEndX;


  if (
    Math.abs(
      swipeDistance
    ) < 50
  ) {

    return;

  }


  if (
    swipeDistance > 0
  ) {

    nextSlide();

  } else {

    previousSlide();

  }


  resetAutoSlide();

}


// ======================================================
// 9. REFRESH BUTTON
// ======================================================

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


// ======================================================
// 10. SEARCH MENU
// ======================================================

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchButton =
  document.getElementById(
    "searchButton"
  );

const menuItems =
  document.querySelectorAll(
    ".menu-item"
  );


function searchMenu() {

  if (!searchInput) {
    return;
  }


  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  menuItems.forEach(
    function (item) {

      const menuName =
        item.textContent
          .trim()
          .toLowerCase();


      if (
        keyword === "" ||
        menuName.includes(
          keyword
        )
      ) {

        item.style.display =
          "flex";

      } else {

        item.style.display =
          "none";

      }

    }
  );

}


// SEARCH BUTTON

if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchMenu
  );

}


// SEARCH SAAT MENGETIK

if (searchInput) {

  searchInput.addEventListener(
    "input",
    searchMenu
  );


  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        searchMenu();

      }

    }
  );

}


// ======================================================
// 11. SETTINGS HARUS SELALU TERAKHIR
// ======================================================

const menuGrid =
  document.getElementById(
    "menuGrid"
  );

const settingsMenu =
  document.getElementById(
    "settingsMenu"
  );


function keepSettingsLast() {

  if (
    menuGrid &&
    settingsMenu
  ) {

    menuGrid.appendChild(
      settingsMenu
    );

  }

}


// ======================================================
// 12. NAVIGASI MENU UTAMA
// ======================================================

function openHexaPage(
  menuName
) {

  const page =
    HEXA_PAGES[
      menuName
    ];


  if (!page) {

    console.log(
      "Menu HEXA tidak terdaftar:",
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
    "Halaman belum tersedia:",
    page.url
  );

}


// ======================================================
// 13. MENU ICON CLICK
// ======================================================

menuItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const menu =
          item.dataset.menu;


        openHexaPage(
          menu
        );

      }
    );

  }
);


// ======================================================
// 14. FLOATING START INSPECTION BUTTON
// ======================================================

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


const FLOATING_POSITION_KEY =
  "hexaInspectionButtonPosition";


let isDragging = false;

let dragMoved = false;

let dragOffsetX = 0;

let dragOffsetY = 0;


// ======================================================
// 15. LOAD POSISI FLOATING BUTTON
// ======================================================

function loadFloatingButtonPosition() {

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
      inspectionShortcut
        .offsetWidth;

    const buttonHeight =
      inspectionShortcut
        .offsetHeight;


    const maxLeft =
      window.innerWidth -
      buttonWidth;

    const maxTop =
      window.innerHeight -
      buttonHeight;


    const safeLeft =
      Math.max(
        0,
        Math.min(
          position.left,
          maxLeft
        )
      );


    const safeTop =
      Math.max(
        0,
        Math.min(
          position.top,
          maxTop
        )
      );


    inspectionShortcut.style.left =
      safeLeft + "px";

    inspectionShortcut.style.top =
      safeTop + "px";

    inspectionShortcut.style.right =
      "auto";

    inspectionShortcut.style.bottom =
      "auto";


  } catch (error) {

    console.log(
      "Posisi floating button tidak dapat dibaca."
    );

  }

}


// ======================================================
// 16. SAVE POSISI FLOATING BUTTON
// ======================================================

function saveFloatingButtonPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const rect =
    inspectionShortcut
      .getBoundingClientRect();


  const position = {

    left:
      rect.left,

    top:
      rect.top

  };


  localStorage.setItem(
    FLOATING_POSITION_KEY,
    JSON.stringify(
      position
    )
  );

}


// ======================================================
// 17. DRAG FLOATING BUTTON
// ======================================================

if (inspectionShortcut) {

  inspectionShortcut.addEventListener(
    "pointerdown",
    function (event) {

      isDragging = true;

      dragMoved = false;


      const rect =
        inspectionShortcut
          .getBoundingClientRect();


      dragOffsetX =
        event.clientX -
        rect.left;


      dragOffsetY =
        event.clientY -
        rect.top;


      inspectionShortcut
        .setPointerCapture(
          event.pointerId
        );

    }
  );


  // POINTER MOVE

  inspectionShortcut.addEventListener(
    "pointermove",
    function (event) {

      if (!isDragging) {
        return;
      }


      dragMoved = true;


      const buttonWidth =
        inspectionShortcut
          .offsetWidth;

      const buttonHeight =
        inspectionShortcut
          .offsetHeight;


      let newLeft =
        event.clientX -
        dragOffsetX;


      let newTop =
        event.clientY -
        dragOffsetY;


      const maxLeft =
        window.innerWidth -
        buttonWidth;


      const maxTop =
        window.innerHeight -
        buttonHeight;


      newLeft =
        Math.max(
          0,
          Math.min(
            newLeft,
            maxLeft
          )
        );


      newTop =
        Math.max(
          0,
          Math.min(
            newTop,
            maxTop
          )
        );


      inspectionShortcut.style.left =
        newLeft + "px";

      inspectionShortcut.style.top =
        newTop + "px";

      inspectionShortcut.style.right =
        "auto";

      inspectionShortcut.style.bottom =
        "auto";

    }
  );


  // POINTER UP

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

        // Pointer sudah dilepas browser.

      }


      if (dragMoved) {

        saveFloatingButtonPosition();

      }

    }
  );


  // ====================================================
  // 18. FLOATING BUTTON CLICK
  // ====================================================

  inspectionShortcut.addEventListener(
    "click",
    function (event) {

      // Setelah drag jangan dianggap klik.

      if (dragMoved) {

        event.preventDefault();

        dragMoved = false;

        return;

      }


      // START INSPECTION

      window.location.href =
        "/start-inspection";

    }
  );

}


// ======================================================
// 19. JAGA FLOATING BUTTON DI DALAM LAYAR
// ======================================================

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
      inspectionShortcut
        .offsetWidth;

    const buttonHeight =
      inspectionShortcut
        .offsetHeight;


    const maxLeft =
      window.innerWidth -
      buttonWidth;

    const maxTop =
      window.innerHeight -
      buttonHeight;


    const safeLeft =
      Math.max(
        0,
        Math.min(
          rect.left,
          maxLeft
        )
      );


    const safeTop =
      Math.max(
        0,
        Math.min(
          rect.top,
          maxTop
        )
      );


    inspectionShortcut.style.left =
      safeLeft + "px";

    inspectionShortcut.style.top =
      safeTop + "px";

    inspectionShortcut.style.right =
      "auto";

    inspectionShortcut.style.bottom =
      "auto";


    saveFloatingButtonPosition();

  }
);


// ======================================================
// 20. INITIALIZE HEXA MAIN PAGE
// ======================================================

function initializeHexaMain() {

  // Banner pertama

  showSlide(0);


  // Auto slide

  if (
    slides.length > 1
  ) {

    startAutoSlide();

  }


  // Settings selalu terakhir

  keepSettingsLast();


  // Posisi floating button

  loadFloatingButtonPosition();


  console.log(
    "HEXA Main Page Ready"
  );

}


// ======================================================
// JALANKAN
// ======================================================

initializeHexaMain();
