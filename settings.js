// =====================================================
// HEXA - SETTINGS
// =====================================================

"use strict";


// =====================================================
// ROLE MASTER
// =====================================================

const HEXA_ROLES = {
  1: "Master",
  2: "Section Head",
  3: "Group Leader",
  4: "Admin",
  5: "Mechanic",
  6: "Visitor"
};


// =====================================================
// SETTINGS PAGE ROUTES
//
// Nanti file tujuan dapat kita ubah tanpa
// mengubah event listener.
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
// INITIALIZE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeSettings();

  }
);


// =====================================================
// INITIALIZE SETTINGS
// =====================================================

function initializeSettings() {

  const currentUser =
    getCurrentHexaUser();


  // -----------------------------------------------
  // APPLY ROLE THEME
  // -----------------------------------------------

  applyRoleTheme(
    currentUser.level
  );


  // -----------------------------------------------
  // PROFILE CARD
  // -----------------------------------------------

  renderSettingsProfile(
    currentUser
  );


  // -----------------------------------------------
  // SETTINGS MENU
  // -----------------------------------------------

  initializeSettingsNavigation();


  // -----------------------------------------------
  // LOGOUT
  // -----------------------------------------------

  initializeSettingsLogout();


  console.log(
    "HEXA Settings Ready:",
    currentUser
  );

}


// =====================================================
// GET CURRENT HEXA USER
//
// V1:
// Kita mencoba membaca user dari localStorage.
//
// Saya buat beberapa kemungkinan key agar halaman
// tetap aman sambil menunggu kita cocokkan dengan
// sistem login HEXA yang sebenarnya.
// =====================================================

function getCurrentHexaUser() {

  const possibleKeys = [

    "hexaUser",

    "currentUser",

    "userData",

    "loggedInUser"

  ];


  let storedUser = null;


  for (
    const key of possibleKeys
  ) {

    try {

      const raw =
        localStorage.getItem(
          key
        );


      if (!raw) {
        continue;
      }


      const parsed =
        JSON.parse(
          raw
        );


      if (
        parsed &&
        typeof parsed === "object"
      ) {

        storedUser =
          parsed;

        break;

      }

    }

    catch (error) {

      console.warn(
        "HEXA Settings: gagal membaca",
        key,
        error
      );

    }

  }


  // -----------------------------------------------
  // FALLBACK
  //
  // Untuk tahap UI development.
  // Default Master agar blue theme dapat langsung
  // terlihat sebelum session login kita sambungkan.
  // -----------------------------------------------

  if (!storedUser) {

    return {

      id:
        "-",

      name:
        "User Name",

      level:
        1,

      role:
        "Master",

      photo:
        ""

    };

  }


  return normalizeHexaUser(
    storedUser
  );

}


// =====================================================
// NORMALIZE USER DATA
//
// Mendukung beberapa kemungkinan nama field.
// Nanti setelah struktur login final sudah kita
// pastikan, bagian ini bisa kita sederhanakan.
// =====================================================

function normalizeHexaUser(
  user
) {

  const level =
    normalizeLevel(
      user.level ??
      user.LEVEL ??
      user.Level ??
      user.levelCode ??
      user.level_code
    );


  const role =
    HEXA_ROLES[level] ||
    user.role ||
    user.ROLE ||
    "User";


  return {

    id:
      user.id ??
      user.ID ??
      user.userId ??
      user.USER_ID ??
      user["USER ID"] ??
      user.uniqId ??
      user["UNIQ ID"] ??
      "-",


    name:
      user.name ??
      user.NAME ??
      user.nama ??
      user.NAMA ??
      "User Name",


    level:
      level,


    role:
      role,


    photo:
      user.photo ??
      user.PHOTO ??
      user.photoUrl ??
      user.photoURL ??
      ""

  };

}


// =====================================================
// NORMALIZE LEVEL
// =====================================================

function normalizeLevel(
  value
) {

  const number =
    Number(
      value
    );


  if (
    Number.isInteger(number) &&
    number >= 1 &&
    number <= 6
  ) {

    return number;

  }


  // -----------------------------------------------
  // Jika database sementara menyimpan nama role
  // bukan angka.
  // -----------------------------------------------

  const text =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();


  const roleMap = {

    "master":
      1,

    "section head":
      2,

    "sectionhead":
      2,

    "group leader":
      3,

    "groupleader":
      3,

    "gl":
      3,

    "admin":
      4,

    "mechanic":
      5,

    "visitor":
      6

  };


  return (
    roleMap[text] ||
    6
  );

}


// =====================================================
// APPLY ROLE THEME
//
// LEVEL 1 - 3
// Master
// Section Head
// Group Leader
// = BLUE DOODLE
//
// LEVEL 4 - 6
// Admin
// Mechanic
// Visitor
// = ORANGE DOODLE
// =====================================================

function applyRoleTheme(
  level
) {

  const body =
    document.body;


  body.classList.remove(
    "theme-blue",
    "theme-orange"
  );


  const isGLUp =
    level >= 1 &&
    level <= 3;


  if (isGLUp) {

    body.classList.add(
      "theme-blue"
    );

  }

  else {

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


  const roleBadge =
    document.getElementById(
      "settingsRoleBadge"
    );


  const idElement =
    document.getElementById(
      "settingsProfileId"
    );


  const levelElement =
    document.getElementById(
      "settingsProfileLevel"
    );


  const photoElement =
    document.getElementById(
      "settingsProfilePhoto"
    );


  // -----------------------------------------------
  // NAME
  // -----------------------------------------------

  if (nameElement) {

    nameElement.textContent =
      user.name;

  }


  // -----------------------------------------------
  // ROLE
  // -----------------------------------------------

  if (roleBadge) {

    roleBadge.textContent =
      user.role.toUpperCase();

  }


  // -----------------------------------------------
  // USER ID
  // -----------------------------------------------

  if (idElement) {

    idElement.textContent =
      `ID • ${user.id}`;

  }


  // -----------------------------------------------
  // LEVEL
  // -----------------------------------------------

  if (levelElement) {

    levelElement.textContent =
      `Level ${user.level}`;

  }


  // -----------------------------------------------
  // PHOTO
  // -----------------------------------------------

  if (photoElement) {

    if (user.photo) {

      photoElement.src =
        user.photo;

    }


    photoElement.addEventListener(
      "error",
      function () {

        showProfileInitial(
          photoElement,
          user.name
        );

      },
      {
        once: true
      }
    );

  }

}


// =====================================================
// PROFILE PHOTO FALLBACK
//
// Jika hexa-default-user.png atau PHOTO user
// tidak tersedia, tampilkan initial.
// =====================================================

function showProfileInitial(
  imageElement,
  name
) {

  const parent =
    imageElement.parentElement;


  if (!parent) {
    return;
  }


  imageElement.style.display =
    "none";


  let initialElement =
    parent.querySelector(
      ".settings-profile-initial"
    );


  if (!initialElement) {

    initialElement =
      document.createElement(
        "span"
      );


    initialElement.className =
      "settings-profile-initial";


    parent.appendChild(
      initialElement
    );

  }


  initialElement.textContent =
    getUserInitials(
      name
    );

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
    return "U";
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
    words[words.length - 1][0]
  ).toUpperCase();

}


// =====================================================
// SETTINGS NAVIGATION
// =====================================================

function initializeSettingsNavigation() {

  const menuCards =
    document.querySelectorAll(
      "[data-settings-page]"
    );


  menuCards.forEach(
    function (
      card
    ) {

      card.addEventListener(
        "click",
        function () {

          const page =
            card.dataset.settingsPage;


          navigateToSettingsPage(
            page
          );

        }
      );

    }
  );


  // -----------------------------------------------
  // PROFILE CARD ARROW
  // -----------------------------------------------

  const profileShortcut =
    document.getElementById(
      "profileShortcutButton"
    );


  if (profileShortcut) {

    profileShortcut.addEventListener(
      "click",
      function () {

        navigateToSettingsPage(
          "profile"
        );

      }
    );

  }

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


// =====================================================
// HANDLE LOGOUT
// =====================================================

function handleSettingsLogout() {

  /*
    Untuk sementara kita hanya membersihkan
    kemungkinan session user.

    Setelah kita cocokkan dengan login.js HEXA,
    fungsi ini akan kita sesuaikan supaya
    menggunakan session key yang benar.
  */


  const sessionKeys = [

    "hexaUser",

    "currentUser",

    "userData",

    "loggedInUser"

  ];


  sessionKeys.forEach(
    function (
      key
    ) {

      localStorage.removeItem(
        key
      );

    }
  );


  window.location.href =
    "index.html";

}
