"use strict";


// ======================================================
// HEXA MAIN PAGE
// main.js
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

  window.location.replace("index.html");

}


// ======================================================
// 2. BACA DATA USER
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


console.log(
  "HEXA Current User:",
  currentUser
);


// ======================================================
// 3. DAFTAR HALAMAN HEXA
// ======================================================

const HEXA_PAGES = {
  "daily-maintenance": { url: "daily-maintenance.html", enabled: true },
  "backlog-monitoring": { url: "backlog-monitoring.html", enabled: true },
  "fui": { url: "fui.html", enabled: true },
  "rotable": { url: "rotable.html", enabled: true },
  "news": { url: "news.html", enabled: true },
  "hexa-games": { url: "hexa-games.html", enabled: true },
  "my-development": { url: "my-development.html", enabled: true },
  "hex-catalog": { url: "hex-catalog.html", enabled: true },
  "hexa-schematic": { url: "hexa-schematic.html", enabled: true },
  "knibal": { url: "knibal.html", enabled: true },
  "settings": { url: "/settings", enabled: true }
};


// ======================================================
// 4. LOGOUT DROPDOWN
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


document.addEventListener(
  "click",
  closeLogoutMenu
);


document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {

      closeLogoutMenu();

    }

  }
);


// ======================================================
// 5. LOGOUT
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
// 6-7. HYBRID BANNER VIDEO + IMAGE + SWIPE
// ======================================================
const slides = [...document.querySelectorAll(".banner-slide")];
const prevButton = document.getElementById("sliderPrev");
const nextButton = document.getElementById("sliderNext");
const bannerSlider = document.getElementById("bannerSlider");
const bannerVideo = document.getElementById("hexaBannerVideo");
const IMAGE_DURATION_MS = 5000;
const VIDEO_FALLBACK_MS = 30000; // Hanya jika video macet/tidak bisa dimainkan
let currentSlide = 0;
let autoSlideTimer = null;
let touchStartX = 0;
let touchEndX = 0;
let bannerRun = 0;

function stopAutoSlide() {
  if (autoSlideTimer !== null) {
    clearTimeout(autoSlideTimer);
    autoSlideTimer = null;
  }
}

function scheduleNextSlide(delay, runId) {
  stopAutoSlide();
  if (slides.length < 2) return;
  autoSlideTimer = setTimeout(() => {
    if (runId === bannerRun && !document.hidden) nextSlide();
  }, delay);
}

function showSlide(index) {
  if (!slides.length) return;
  bannerRun += 1;
  const runId = bannerRun;
  stopAutoSlide();
  if (bannerVideo) {
    bannerVideo.pause();
    try { bannerVideo.currentTime = 0; } catch (error) {}
  }
  currentSlide = ((index % slides.length) + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
    slide.setAttribute("aria-hidden", i === currentSlide ? "false" : "true");
  });
  if (document.hidden) return;
  const activeSlide = slides[currentSlide];
  if (activeSlide.dataset.type === "video" && bannerVideo) {
    bannerVideo.muted = true;
    bannerVideo.loop = false;
    // Watchdog hanya digunakan bila video tidak mengirim event ended.
    scheduleNextSlide(VIDEO_FALLBACK_MS, runId);
    const result = bannerVideo.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        if (runId === bannerRun) scheduleNextSlide(IMAGE_DURATION_MS, runId);
      });
    }
  } else {
    scheduleNextSlide(IMAGE_DURATION_MS, runId);
  }
}
function nextSlide() { showSlide(currentSlide + 1); }
function previousSlide() { showSlide(currentSlide - 1); }
function startAutoSlide() { showSlide(currentSlide); }
function resetAutoSlide() { startAutoSlide(); }

if (bannerVideo) {
  bannerVideo.addEventListener("ended", () => {
    if (slides[currentSlide]?.contains(bannerVideo)) nextSlide();
  });
  bannerVideo.addEventListener("error", () => {
    if (slides[currentSlide]?.contains(bannerVideo)) {
      scheduleNextSlide(IMAGE_DURATION_MS, bannerRun);
    }
  });
  bannerVideo.addEventListener("playing", () => {
    if (slides[currentSlide]?.contains(bannerVideo)) {
      // Durasi video yang valid + buffer, agar tidak terpotong sebelum selesai.
      const remaining = Number.isFinite(bannerVideo.duration) && bannerVideo.duration > 0
        ? Math.max(5000, (bannerVideo.duration - bannerVideo.currentTime) * 1000 + 5000)
        : VIDEO_FALLBACK_MS;
      scheduleNextSlide(remaining, bannerRun);
    }
  });
}
prevButton?.addEventListener("click", previousSlide);
nextButton?.addEventListener("click", nextSlide);
if (bannerSlider) {
  bannerSlider.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  bannerSlider.addEventListener("touchend", event => {
    touchEndX = event.changedTouches[0].screenX;
    handleBannerSwipe();
  }, { passive: true });
}
function handleBannerSwipe() {
  const dx = touchStartX - touchEndX;
  if (Math.abs(dx) < 50) return;
  if (dx > 0) nextSlide(); else previousSlide();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoSlide();
    bannerVideo?.pause();
  } else {
    showSlide(currentSlide);
  }
});

// ======================================================
// 8. REFRESH BUTTON
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
// 9. SEARCH MENU
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
  const keyword = (searchInput?.value || "").trim().toLowerCase();
  menuItems.forEach(item => {
    item.dataset.searchHidden = String(!item.textContent.trim().toLowerCase().includes(keyword));
  });
  rebuildMenuPages();
}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchMenu
  );

}


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
// 10. SETTINGS SELALU TERAKHIR
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
// SETTINGS ACCESS - SEMUA LEVEL PENGGUNA
// Hak akses submenu diatur pada halaman Settings.
// ======================================================

function applySettingsAccess() {
  if (!settingsMenu) return;
  settingsMenu.hidden = false;
  settingsMenu.style.removeProperty("display");
}

// ======================================================
// 11. NAVIGASI MENU UTAMA
// ======================================================

function openHexaPage(menuName) {

  const page =
    HEXA_PAGES[menuName];


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
// MENU ICON CLICK
// ======================================================

menuItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const menu =
          item.dataset.menu;


        openHexaPage(menu);

      }
    );

  }
);


// ======================================================
// 12. FLOATING START INSPECTION
// ======================================================

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


const FLOATING_POSITION_KEY =
  "hexaInspectionButtonPosition";


// ======================================================
// STATUS DRAG
// ======================================================

let isDragging = false;

let dragMoved = false;

let dragOffsetX = 0;

let dragOffsetY = 0;

let dragStartX = 0;

let dragStartY = 0;


// Minimum gerakan agar dianggap drag

const DRAG_THRESHOLD = 6;


// ======================================================
// 13. LOAD POSISI FLOATING BUTTON
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
// 14. SAVE POSISI FLOATING BUTTON
// ======================================================

function saveFloatingButtonPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const rect =
    inspectionShortcut
      .getBoundingClientRect();


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
// 15. POINTER DOWN
// ======================================================

if (inspectionShortcut) {

  inspectionShortcut.addEventListener(
    "pointerdown",
    function (event) {

      isDragging = true;

      dragMoved = false;


      // Posisi awal pointer

      dragStartX =
        event.clientX;

      dragStartY =
        event.clientY;


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

        // Abaikan jika browser
        // tidak mendukung pointer capture.

      }

    }
  );


// ======================================================
// 16. POINTER MOVE
// ======================================================

  inspectionShortcut.addEventListener(
    "pointermove",
    function (event) {

      if (!isDragging) {
        return;
      }


      // Hitung jarak gerakan dari
      // posisi pointer awal.

      const moveX =
        Math.abs(
          event.clientX -
          dragStartX
        );


      const moveY =
        Math.abs(
          event.clientY -
          dragStartY
        );


      // Belum melewati threshold,
      // masih dianggap klik biasa.

      if (
        moveX <= DRAG_THRESHOLD &&
        moveY <= DRAG_THRESHOLD
      ) {

        return;

      }


      // Sudah benar-benar drag.

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


// ======================================================
// 17. POINTER UP
// ======================================================

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

        // Abaikan.

      }


      if (dragMoved) {

        saveFloatingButtonPosition();

      }

    }
  );


// ======================================================
// 18. POINTER CANCEL
// ======================================================

  inspectionShortcut.addEventListener(
    "pointercancel",
    function () {

      isDragging = false;

    }
  );


// ======================================================
// 19. CLICK FLOATING BUTTON
// ======================================================

  inspectionShortcut.addEventListener(
    "click",
    function (event) {

      // Jika sebelumnya tombol
      // benar-benar digeser,
      // jangan buka Start Inspection.

      if (dragMoved) {

        event.preventDefault();

        dragMoved = false;

        return;

      }


      // ================================================
      // START INSPECTION
      // ================================================

      window.location.href =
        "start-inspection.html";

    }
  );

}


// ======================================================
// 20. JAGA FLOATING BUTTON TETAP DI DALAM LAYAR
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
// MENU CAROUSEL - 6 ICONS PER PAGE (DESKTOP/MOBILE)
// ======================================================
const menuPrev = document.getElementById("menuPrev");
const menuNext = document.getElementById("menuNext");
const menuDots = document.getElementById("menuDots");
let activeMenuPage = 0;

function showMenuPage(index) {
  const pages = [...menuGrid.querySelectorAll(".menu-page")];
  if (!pages.length) return;
  activeMenuPage = Math.max(0, Math.min(index, pages.length - 1));
  menuGrid.scrollTo({ left: pages[activeMenuPage].offsetLeft - menuGrid.offsetLeft, behavior: "smooth" });
  if (menuPrev) menuPrev.disabled = activeMenuPage === 0;
  if (menuNext) menuNext.disabled = activeMenuPage === pages.length - 1;
  if (menuDots) [...menuDots.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === activeMenuPage);
    dot.setAttribute("aria-current", i === activeMenuPage ? "page" : "false");
  });
}

function rebuildMenuPages() {
  if (!menuGrid) return;
  // Ambil semua tombol, termasuk yang sebelumnya sudah berada di halaman carousel.
  const items = [...menuGrid.querySelectorAll(".menu-item")];
  menuGrid.replaceChildren();
  const visible = items.filter(item => item.dataset.searchHidden !== "true");
  items.forEach(item => { item.style.removeProperty("display"); });
  for (let i = 0; i < visible.length; i += 6) {
    const page = document.createElement("div");
    page.className = "menu-page";
    visible.slice(i, i + 6).forEach(item => page.appendChild(item));
    menuGrid.appendChild(page);
  }
  // Simpan item hasil pencarian yang tidak cocok, agar dapat muncul lagi saat pencarian dihapus.
  const hiddenStore = document.createElement("div");
  hiddenStore.hidden = true;
  hiddenStore.className = "menu-hidden-store";
  items.filter(item => item.dataset.searchHidden === "true").forEach(item => hiddenStore.appendChild(item));
  menuGrid.appendChild(hiddenStore);
  const count = menuGrid.querySelectorAll(".menu-page").length;
  if (menuDots) {
    menuDots.replaceChildren();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "menu-dot";
      dot.setAttribute("aria-label", `Halaman menu ${i + 1}`);
      dot.addEventListener("click", () => showMenuPage(i));
      menuDots.appendChild(dot);
    }
  }
  if (menuPrev) menuPrev.hidden = count <= 1;
  if (menuNext) menuNext.hidden = count <= 1;
  if (menuDots) menuDots.hidden = count <= 1;
  activeMenuPage = 0;
  showMenuPage(0);
}

menuPrev?.addEventListener("click", () => showMenuPage(activeMenuPage - 1));
menuNext?.addEventListener("click", () => showMenuPage(activeMenuPage + 1));
let menuTouchStart = 0;
menuGrid?.addEventListener("touchstart", e => {
  menuTouchStart = e.changedTouches[0].clientX;
}, {passive:true});
menuGrid?.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - menuTouchStart;
  if (Math.abs(dx) > 45) showMenuPage(activeMenuPage + (dx < 0 ? 1 : -1));
}, {passive:true});
menuGrid?.addEventListener("scroll", () => {
  const pages = [...menuGrid.querySelectorAll(".menu-page")];
  if (!pages.length) return;
  const closest = pages.reduce((best, page, i) =>
    Math.abs(page.offsetLeft - menuGrid.offsetLeft - menuGrid.scrollLeft) <
    Math.abs(pages[best].offsetLeft - menuGrid.offsetLeft - menuGrid.scrollLeft) ? i : best, 0);
  if (closest !== activeMenuPage) {
    activeMenuPage = closest;
    if (menuPrev) menuPrev.disabled = closest === 0;
    if (menuNext) menuNext.disabled = closest === pages.length - 1;
    if (menuDots) [...menuDots.children].forEach((dot,i)=>dot.classList.toggle("active",i===closest));
  }
}, {passive:true});

// ======================================================
// 21. INITIALIZE HEXA MAIN PAGE
// ======================================================

function initializeHexaMain() {

  // Banner pertama

  showSlide(0);


  // Auto banner

  startAutoSlide();


  // Settings tetap terakhir

  keepSettingsLast();

  // Master access Authorized
  applySettingsAccess();
  rebuildMenuPages();


  // Load posisi floating button

  loadFloatingButtonPosition();


  console.log(
    "HEXA Main Page Ready"
  );

}


// ======================================================
// JALANKAN
// ======================================================

initializeHexaMain();
