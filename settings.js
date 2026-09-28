"use strict";

// =====================================================
// HEXA - SETTINGS
// API V4 USER SYNC
// =====================================================


// =====================================================
// API
//
// Menggunakan Web App URL yang sama dengan app.js
// pada sistem login HEXA.
// =====================================================

const SETTINGS_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


// =====================================================
// SETTINGS PAGE ROUTES
// =====================================================

const SETTINGS_ROUTES = {

  "profile":
    "profile.html",

  "user-management":
    "user-management.html",

  "access-settings":
    "access-settings.html",

  "system-settings":
    "system-settings.html"

};


// =====================================================
// SESSION
// =====================================================

let currentSettingsUser = null;


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  initializeSettings
);


async function initializeSettings() {

  // Session resmi HEXA.
  const sessionUser =
    getHexaSessionUser();

  if (!sessionUser) {
    return;
  }

  currentSettingsUser =
    sessionUser;

  // Tampilkan session lebih dulu supaya UI tidak kosong.
  applyRoleTheme(
    sessionUser.kode
  );

  renderSettingsProfile(
    sessionUser
  );

  initializeSettingsNavigation();
  initializeSettingsLogout();

  // Kemudian ambil data paling baru dari Spreadsheet.
  await syncSettingsProfile();

}


// =====================================================
// GET SESSION USER
// =====================================================

function getHexaSessionUser() {

  const loggedIn =
    sessionStorage.getItem(
      "hexaLoggedIn"
    );

  const rawUser =
    sessionStorage.getItem(
      "hexaUser"
    );

  if (
    loggedIn !== "true" ||
    !rawUser
  ) {

    redirectToLogin();
    return null;

  }

  try {

    const user =
      JSON.parse(
        rawUser
      );

    if (
      !user ||
      !user.uniqId ||
      !user.userId
    ) {

      clearHexaSession();
      redirectToLogin();
      return null;

    }

    return normalizeUser(
      user
    );

  } catch (error) {

    console.error(
      "HEXA Settings: session user tidak valid.",
      error
    );

    clearHexaSession();
    redirectToLogin();

    return null;

  }

}


// =====================================================
// NORMALIZE USER
//
// LEVEL adalah nama role dari database.
// KODE adalah kode level aktual.
// Tidak memakai mapping role hard-coded.
// =====================================================

function normalizeUser(
  user
) {

  return {

    uniqId:
      cleanValue(
        user.uniqId
      ),

    userId:
      cleanValue(
        user.userId
      ),

    nama:
      cleanValue(
        user.nama
      ) || "User",

    level:
      cleanValue(
        user.level
      ) || "User",

    kode:
      cleanValue(
        user.kode
      ),

    noHp:
      cleanValue(
        user.noHp
      ),

    photo:
      cleanValue(
        user.photo
      ),

    email:
      cleanValue(
        user.email
      ),

    status:
      cleanValue(
        user.status
      ),

    kutipan:
      cleanValue(
        user.kutipan
      )

  };

}


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


// =====================================================
// SYNC PROFILE DARI DATABASE
//
// Dipanggil setiap Settings dibuka.
// Jadi perubahan data di Spreadsheet akan terbaca
// tanpa perlu mengubah source code HEXA.
// =====================================================

async function syncSettingsProfile() {

  if (
    !currentSettingsUser ||
    !currentSettingsUser.uniqId
  ) {
    return;
  }

  if (
    !SETTINGS_API_URL ||
    SETTINGS_API_URL === "__API_URL__"
  ) {

    console.error(
      "HEXA Settings: SETTINGS_API_URL belum tersedia."
    );

    return;

  }

  setProfileSyncState(
    true
  );

  try {

    const response =
      await fetch(
        SETTINGS_API_URL,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({

              action:
                "getUserProfile",

              uniqId:
                currentSettingsUser.uniqId

            })
        }
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );

    }


    const result =
      await response.json();


    if (
      !result ||
      result.success !== true
    ) {

      // Akun sudah dinonaktifkan dari database.
      if (
        result &&
        result.inactive === true
      ) {

        handleInactiveAccount(
          result.message
        );

        return;

      }


      throw new Error(
        result?.message ||
        "Gagal mengambil User Profile."
      );

    }


    const freshUser =
      normalizeUser(
        result.user || {}
      );


    if (
      !freshUser.uniqId ||
      !freshUser.userId
    ) {

      throw new Error(
        "Response User Profile tidak lengkap."
      );

    }


    currentSettingsUser =
      freshUser;


    // Perbarui session agar halaman berikutnya juga
    // membawa data USER terbaru.
    sessionStorage.setItem(
      "hexaUser",
      JSON.stringify(
        freshUser
      )
    );


    // Theme ikut berubah jika KODE di database berubah.
    applyRoleTheme(
      freshUser.kode
    );


    renderSettingsProfile(
      freshUser
    );


    console.log(
      "HEXA Settings profile synced:",
      freshUser
    );


  } catch (error) {

    // UI tetap memakai data session jika jaringan/API gagal.
    console.error(
      "HEXA Settings: gagal sync profile.",
      error
    );

  } finally {

    setProfileSyncState(
      false
    );

  }

}


// =====================================================
// PROFILE SYNC STATE
// =====================================================

function setProfileSyncState(
  isLoading
) {

  const card =
    document.getElementById(
      "settingsProfileCard"
    );

  if (!card) {
    return;
  }

  card.classList.toggle(
    "is-syncing",
    Boolean(isLoading)
  );

  card.setAttribute(
    "aria-busy",
    isLoading
      ? "true"
      : "false"
  );

}


// =====================================================
// APPLY ROLE THEME
//
// KODE 1 - 3 = BLUE
// KODE 4 - 6 = ORANGE
// =====================================================

function applyRoleTheme(
  kode
) {

  const body =
    document.body;

  const numericKode =
    Number(
      kode
    );


  body.classList.remove(
    "theme-blue",
    "theme-orange"
  );


  if (
    Number.isFinite(
      numericKode
    ) &&
    numericKode >= 1 &&
    numericKode <= 3
  ) {

    body.classList.add(
      "theme-blue"
    );

  } else {

    body.classList.add(
      "theme-orange"
    );

  }

}


// =====================================================
// RENDER PROFILE CARD
// =====================================================

function renderSettingsProfile(
  user
) {

  const nameElement =
    document.getElementById(
      "settingsProfileName"
    );

  const idElement =
    document.getElementById(
      "settingsProfileId"
    );

  const levelElement =
    document.getElementById(
      "settingsProfileLevel"
    );

  const roleBadge =
    document.getElementById(
      "settingsRoleBadge"
    );

  const mottoElement =
    document.getElementById(
      "settingsProfileMotto"
    );

  const photoElement =
    document.getElementById(
      "settingsProfilePhoto"
    );

  const initialElement =
    document.getElementById(
      "settingsProfileInitial"
    );


  if (nameElement) {

    nameElement.textContent =
      user.nama || "User";

  }


  if (idElement) {

    idElement.textContent =
      user.userId || "-";

  }


  if (levelElement) {

    levelElement.textContent =
      user.kode
        ? `Level ${user.kode}`
        : "";

  }


  if (roleBadge) {

    roleBadge.textContent =
      (
        user.level ||
        "User"
      ).toUpperCase();

  }


  if (mottoElement) {

    const motto =
      cleanValue(
        user.kutipan
      );

    if (motto) {

      mottoElement.textContent =
        `“${motto}”`;

      mottoElement.hidden =
        false;

    } else {

      mottoElement.textContent =
        "";

      mottoElement.hidden =
        true;

    }

  }


  renderProfilePhoto(
    photoElement,
    initialElement,
    user.nama,
    user.photo
  );

}


// =====================================================
// PROFILE PHOTO + INITIAL FALLBACK
// =====================================================

function renderProfilePhoto(
  photoElement,
  initialElement,
  name,
  photoUrl
) {

  const initials =
    getUserInitials(
      name
    );


  if (initialElement) {

    initialElement.textContent =
      initials;

    initialElement.style.display =
      "";

  }


  if (!photoElement) {
    return;
  }


  photoElement.onload =
    null;

  photoElement.onerror =
    null;

  photoElement.style.display =
    "none";

  photoElement.removeAttribute(
    "src"
  );


  const url =
    cleanValue(
      photoUrl
    );


  if (!url) {
    return;
  }


  photoElement.onload =
    function () {

      photoElement.style.display =
        "block";

      if (initialElement) {

        initialElement.style.display =
          "none";

      }

    };


  photoElement.onerror =
    function () {

      photoElement.style.display =
        "none";

      photoElement.removeAttribute(
        "src"
      );

      if (initialElement) {

        initialElement.style.display =
          "";

      }

    };


  photoElement.alt =
    `Foto profil ${name || "User"}`;

  photoElement.src =
    url;

}


// =====================================================
// USER INITIAL
// =====================================================

function getUserInitials(
  name
) {

  const words =
    String(
      name || "User"
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (!words.length) {
    return "US";
  }


  if (words.length === 1) {

    return words[0]
      .substring(
        0,
        2
      )
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[
      words.length - 1
    ][0]
  ).toUpperCase();

}


// =====================================================
// SETTINGS NAVIGATION
// =====================================================

function initializeSettingsNavigation() {

  const profileCard =
    document.getElementById(
      "settingsProfileCard"
    );


  if (profileCard) {

    profileCard.addEventListener(
      "click",
      function () {

        navigateToSettingsPage(
          "profile"
        );

      }
    );

  }


  const menuCards =
    document.querySelectorAll(
      "[data-settings-page]"
    );


  menuCards.forEach(
    function(card) {

      card.addEventListener(
        "click",
        function () {

          navigateToSettingsPage(
            card.dataset.settingsPage
          );

        }
      );

    }
  );

}


// =====================================================
// NAVIGATE SETTINGS PAGE
// =====================================================

function navigateToSettingsPage(
  page
) {

  const route =
    SETTINGS_ROUTES[page];


  if (!route) {

    console.warn(
      "Settings route tidak ditemukan:",
      page
    );

    return;

  }


  window.location.href =
    route;

}


// =====================================================
// LOGOUT
// =====================================================

function initializeSettingsLogout() {

  const logoutButton =
    document.getElementById(
      "settingsLogoutButton"
    );


  if (!logoutButton) {
    return;
  }


  logoutButton.addEventListener(
    "click",
    handleSettingsLogout
  );

}


function handleSettingsLogout() {

  clearHexaSession();

  window.location.replace(
    "index.html"
  );

}


function clearHexaSession() {

  sessionStorage.removeItem(
    "hexaLoggedIn"
  );

  sessionStorage.removeItem(
    "hexaUser"
  );

}


function redirectToLogin() {

  window.location.replace(
    "index.html"
  );

}


// =====================================================
// INACTIVE ACCOUNT
// =====================================================

function handleInactiveAccount(
  message
) {

  clearHexaSession();

  alert(
    message ||
    "Akun Anda sedang tidak aktif."
  );

  redirectToLogin();

}
