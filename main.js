// ======================================================
// HEXA MAIN PAGE
// main.js
// ======================================================

// ======================================================
// HEXA SESSION PROTECTION
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

  // Tidak memiliki session login
  // kembali ke Login Page

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

  // Session rusak / tidak valid

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
// DEBUG USER
// Nanti bisa dihapus saat development selesai
// ======================================================

console.log(
  "HEXA Current User:",
  currentUser
);

// ======================================================
// 1. BANNER SLIDER
// ======================================================

const slides = document.querySelectorAll(".banner-slide");
const prevButton = document.getElementById("sliderPrev");
const nextButton = document.getElementById("sliderNext");
const bannerSlider = document.getElementById("bannerSlider");

let currentSlide = 0;
let autoSlideTimer;


// Tampilkan slide tertentu
function showSlide(index) {

  if (!slides.length) {
    return;
  }

  // Jika melewati slide terakhir
  if (index >= slides.length) {
    currentSlide = 0;
  }

  // Jika mundur dari slide pertama
  else if (index < 0) {
    currentSlide = slides.length - 1;
  }

  else {
    currentSlide = index;
  }


  slides.forEach(function (slide, slideIndex) {

    if (slideIndex === currentSlide) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }

  });

}


// Slide berikutnya
function nextSlide() {

  showSlide(currentSlide + 1);

}


// Slide sebelumnya
function previousSlide() {

  showSlide(currentSlide - 1);

}


// ======================================================
// 2. AUTO SLIDE
// ======================================================

function startAutoSlide() {

  stopAutoSlide();

  autoSlideTimer = setInterval(function () {

    nextSlide();

  }, 5000);

}


function stopAutoSlide() {

  if (autoSlideTimer) {

    clearInterval(autoSlideTimer);

  }

}


// Reset timer setelah user menekan tombol
function resetAutoSlide() {

  stopAutoSlide();

  startAutoSlide();

}


// ======================================================
// 3. TOMBOL PREVIOUS / NEXT
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
// 4. SWIPE BANNER UNTUK HP / TABLET
// ======================================================

let touchStartX = 0;
let touchEndX = 0;


if (bannerSlider) {

  bannerSlider.addEventListener(
    "touchstart",
    function (event) {

      touchStartX =
        event.changedTouches[0].screenX;

    },
    { passive: true }
  );


  bannerSlider.addEventListener(
    "touchend",
    function (event) {

      touchEndX =
        event.changedTouches[0].screenX;

      handleBannerSwipe();

    },
    { passive: true }
  );

}


function handleBannerSwipe() {

  const swipeDistance =
    touchStartX - touchEndX;


  // Swipe terlalu pendek
  if (Math.abs(swipeDistance) < 50) {
    return;
  }


  // Swipe ke kiri
  if (swipeDistance > 0) {

    nextSlide();

  }

  // Swipe ke kanan
  else {

    previousSlide();

  }


  resetAutoSlide();

}


// ======================================================
// 5. REFRESH BUTTON
// ======================================================

const refreshButton =
  document.getElementById("refreshButton");


if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    function () {

      window.location.reload();

    }
  );

}


// ======================================================
// 6. SEARCH MENU
// ======================================================

const searchInput =
  document.getElementById("searchInput");

const searchButton =
  document.getElementById("searchButton");

const menuItems =
  document.querySelectorAll(".menu-item");


function searchMenu() {

  if (!searchInput) {
    return;
  }


  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  menuItems.forEach(function (item) {

    const menuName =
      item.textContent
        .trim()
        .toLowerCase();


    if (
      keyword === "" ||
      menuName.includes(keyword)
    ) {

      item.style.display = "flex";

    } else {

      item.style.display = "none";

    }

  });

}


// Search saat tombol search ditekan
if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchMenu
  );

}


// Search langsung saat mengetik
if (searchInput) {

  searchInput.addEventListener(
    "input",
    searchMenu
  );


  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        searchMenu();

      }

    }
  );

}


// ======================================================
// 7. SETTINGS HARUS SELALU TERAKHIR
// ======================================================

const menuGrid =
  document.getElementById("menuGrid");

const settingsMenu =
  document.getElementById("settingsMenu");


function keepSettingsLast() {

  if (
    menuGrid &&
    settingsMenu
  ) {

    menuGrid.appendChild(settingsMenu);

  }

}


// Jalankan saat halaman dibuka
keepSettingsLast();


// ======================================================
// 8. MENU CLICK
// ======================================================

menuItems.forEach(function (item) {

  item.addEventListener(
    "click",
    function () {

      const menu =
        item.dataset.menu;


      // Untuk sementara kita tampilkan
      // nama menu di console.
      //
      // Nanti setiap menu akan diarahkan
      // ke halaman masing-masing.

      console.log(
        "HEXA Menu:",
        menu
      );


      // ----------------------------------
      // DAILY MAINTENANCE
      // ----------------------------------

      if (menu === "daily-maintenance") {

        console.log(
          "Open Daily Maintenance"
        );

      }


      // ----------------------------------
      // BACKLOG MONITORING
      // ----------------------------------

      else if (
        menu === "backlog-monitoring"
      ) {

        console.log(
          "Open Backlog Monitoring"
        );

      }


      // ----------------------------------
      // FUI
      // ----------------------------------

      else if (menu === "fui") {

        console.log(
          "Open FUI"
        );

      }


      // ----------------------------------
      // ROTABLE
      // ----------------------------------

      else if (menu === "rotable") {

        console.log(
          "Open Rotable"
        );

      }


      // ----------------------------------
      // NEWS
      // ----------------------------------

      else if (menu === "news") {

        console.log(
          "Open News"
        );

      }


      // ----------------------------------
      // SETTINGS
      // ----------------------------------

      else if (menu === "settings") {

        console.log(
          "Open Settings"
        );

      }

    }
  );

});


// ======================================================
// 9. FLOATING START INSPECTION BUTTON
// ======================================================

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


// LocalStorage key
const FLOATING_POSITION_KEY =
  "hexaInspectionButtonPosition";


let isDragging = false;

let dragMoved = false;

let dragOffsetX = 0;

let dragOffsetY = 0;


// ======================================================
// 10. LOAD POSISI TERAKHIR FLOATING BUTTON
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
      JSON.parse(savedPosition);


    if (
      typeof position.left !== "number" ||
      typeof position.top !== "number"
    ) {

      return;

    }


    const buttonWidth =
      inspectionShortcut.offsetWidth;

    const buttonHeight =
      inspectionShortcut.offsetHeight;


    // Pastikan tombol tidak keluar layar

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
// 11. SIMPAN POSISI FLOATING BUTTON
// ======================================================

function saveFloatingButtonPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const rect =
    inspectionShortcut.getBoundingClientRect();


  const position = {

    left: rect.left,

    top: rect.top

  };


  localStorage.setItem(
    FLOATING_POSITION_KEY,
    JSON.stringify(position)
  );

}


// ======================================================
// 12. DRAG FLOATING BUTTON
// Pointer Event bekerja untuk mouse + touch
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


  inspectionShortcut.addEventListener(
    "pointermove",
    function (event) {

      if (!isDragging) {
        return;
      }


      dragMoved = true;


      const buttonWidth =
        inspectionShortcut.offsetWidth;

      const buttonHeight =
        inspectionShortcut.offsetHeight;


      let newLeft =
        event.clientX -
        dragOffsetX;


      let newTop =
        event.clientY -
        dragOffsetY;


      // ----------------------------------
      // BATAS LAYAR
      // ----------------------------------

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


      // ----------------------------------
      // PINDAHKAN BUTTON
      // ----------------------------------

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


  inspectionShortcut.addEventListener(
    "pointerup",
    function (event) {

      if (!isDragging) {
        return;
      }


      isDragging = false;


      inspectionShortcut
        .releasePointerCapture(
          event.pointerId
        );


      // Jika tombol digeser
      if (dragMoved) {

        saveFloatingButtonPosition();

      }

    }
  );


  // ====================================================
  // 13. KLIK SHORTCUT START INSPECTION
  // ====================================================

  inspectionShortcut.addEventListener(
    "click",
    function (event) {

      // Jika sebelumnya digeser,
      // jangan dianggap sebagai klik.

      if (dragMoved) {

        event.preventDefault();

        dragMoved = false;

        return;

      }


      console.log(
        "Shortcut: Start Inspection"
      );


      /*
        NANTI DI SINI:

        window.location.href =
          "start-inspection.html";

        Untuk sekarang belum diarahkan
        karena halaman Start Inspection
        belum kita buat.
      */

    }
  );

}


// ======================================================
// 14. JAGA POSISI BUTTON SAAT UKURAN LAYAR BERUBAH
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
      inspectionShortcut.offsetWidth;

    const buttonHeight =
      inspectionShortcut.offsetHeight;


    const maxLeft =
      window.innerWidth -
      buttonWidth;

    const maxTop =
      window.innerHeight -
      buttonHeight;


    let safeLeft =
      Math.max(
        0,
        Math.min(
          rect.left,
          maxLeft
        )
      );


    let safeTop =
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
// 15. INITIALIZE HEXA MAIN PAGE
// ======================================================

function initializeHexaMain() {

  // Banner pertama
  showSlide(0);


  // Auto slide
  if (slides.length > 1) {

    startAutoSlide();

  }


  // Settings terakhir
  keepSettingsLast();


  // Posisi floating button
  loadFloatingButtonPosition();


  console.log(
    "HEXA Main Page Ready"
  );

}


// Jalankan
initializeHexaMain();
