"use strict";


// =====================================================
// HEXA - USER MANAGEMENT
// VERSION 1
// READ USER DATABASE
// =====================================================


// =====================================================
// API
// =====================================================

const USER_MANAGEMENT_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


// =====================================================
// STATE
// =====================================================

let currentManagementUser = null;

let userManagementData = [];

let filteredUserManagementData = [];


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  initializeUserManagement
);


// =====================================================
// INITIALIZE
// =====================================================

async function initializeUserManagement() {

  const sessionUser =
    getUserManagementSession();

  if (!sessionUser) {
    return;
  }


  // ===================================================
  // MASTER PROTECTION
  // KODE 1 = MASTER
  // ===================================================

  if (Number(sessionUser.kode) !== 1) {

    alert(
      "You are not authorized to access this page."
    );

    window.location.replace(
      "main.html"
    );

    return;
  }


  currentManagementUser =
    sessionUser;


  initializeUserManagementBack();

  initializeUserManagementFilters();

  initializeUserManagementRetry();

  initializeUserManagementAdd();


  await loadUserManagementData();

}


// =====================================================
// SESSION
// =====================================================

function getUserManagementSession() {

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

    redirectUserManagementLogin();

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

      clearUserManagementSession();

      redirectUserManagementLogin();

      return null;
    }


    return normalizeManagementUser(
      user
    );


  } catch (error) {

    console.error(
      "HEXA User Management: invalid session.",
      error
    );


    clearUserManagementSession();

    redirectUserManagementLogin();

    return null;
  }

}


// =====================================================
// NORMALIZE USER
// =====================================================

function normalizeManagementUser(
  user
) {

  return {

    uniqId:
      cleanManagementValue(
        user.uniqId
      ),

    userId:
      cleanManagementValue(
        user.userId
      ),

    nama:
      cleanManagementValue(
        user.nama
      ) || "User",

    level:
      cleanManagementValue(
        user.level
      ) || "User",

    kode:
      cleanManagementValue(
        user.kode
      ),

    noHp:
      cleanManagementValue(
        user.noHp
      ),

    photo:
      cleanManagementValue(
        user.photo
      ),

    email:
      cleanManagementValue(
        user.email
      ),

    status:
      cleanManagementValue(
        user.status
      ),

    kutipan:
      cleanManagementValue(
        user.kutipan
      )

  };

}


// =====================================================
// CLEAN VALUE
// =====================================================

function cleanManagementValue(
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
// BACK TO SETTINGS
// =====================================================

function initializeUserManagementBack() {

  const button =
    document.getElementById(
      "userManagementBackButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      window.location.href =
        "settings.html";

    }
  );

}


// =====================================================
// FILTER EVENTS
// =====================================================

function initializeUserManagementFilters() {

  const searchInput =
    document.getElementById(
      "userSearchInput"
    );

  const levelFilter =
    document.getElementById(
      "userLevelFilter"
    );

  const statusFilter =
    document.getElementById(
      "userStatusFilter"
    );


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      applyUserManagementFilters
    );

  }


  if (levelFilter) {

    levelFilter.addEventListener(
      "change",
      applyUserManagementFilters
    );

  }


  if (statusFilter) {

    statusFilter.addEventListener(
      "change",
      applyUserManagementFilters
    );

  }

}


// =====================================================
// RETRY
// =====================================================

function initializeUserManagementRetry() {

  const button =
    document.getElementById(
      "userManagementRetryButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    loadUserManagementData
  );

}


// =====================================================
// LOAD USER DATABASE
// =====================================================

async function loadUserManagementData() {

  showUserManagementLoading();


  try {

    const response =
      await fetch(
        USER_MANAGEMENT_API_URL,
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
                "getUsers"

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

      throw new Error(
        result?.message ||
        "Gagal mengambil User Database."
      );

    }


    const rawUsers =
      Array.isArray(result.data)
        ? result.data
        : [];


    userManagementData =
      rawUsers
        .map(
          normalizeManagementUser
        )
        .filter(
          function (user) {

            return Boolean(
              user.uniqId
            );

          }
        );


    // Urutkan berdasarkan KODE kemudian NAMA.
    userManagementData.sort(
      compareManagementUsers
    );


    renderUserManagementSummary();

    buildUserManagementLevelFilter();

    applyUserManagementFilters();


    console.log(
      "HEXA User Management:",
      userManagementData.length,
      "users loaded."
    );


  } catch (error) {

    console.error(
      "HEXA User Management: load failed.",
      error
    );


    showUserManagementError(
      error.message
    );

  }

}


// =====================================================
// SORT USER
// =====================================================

function compareManagementUsers(
  firstUser,
  secondUser
) {

  const firstKode =
    Number(
      firstUser.kode
    );

  const secondKode =
    Number(
      secondUser.kode
    );


  const safeFirstKode =
    Number.isFinite(firstKode)
      ? firstKode
      : 999;

  const safeSecondKode =
    Number.isFinite(secondKode)
      ? secondKode
      : 999;


  if (
    safeFirstKode !==
    safeSecondKode
  ) {

    return (
      safeFirstKode -
      safeSecondKode
    );

  }


  return (
    firstUser.nama || ""
  ).localeCompare(
    secondUser.nama || "",
    "id",
    {
      sensitivity:
        "base"
    }
  );

}


// =====================================================
// SUMMARY
// =====================================================

function renderUserManagementSummary() {

  const totalElement =
    document.getElementById(
      "userTotalCount"
    );

  const activeElement =
    document.getElementById(
      "userActiveCount"
    );

  const inactiveElement =
    document.getElementById(
      "userInactiveCount"
    );


  const total =
    userManagementData.length;


  let active = 0;

  let inactive = 0;


  userManagementData.forEach(
    function (user) {

      const status =
        getManagementUserStatus(
          user
        );


      if (status === "ACTIVE") {

        active++;

      } else {

        inactive++;

      }

    }
  );


  if (totalElement) {

    totalElement.textContent =
      String(total);

  }


  if (activeElement) {

    activeElement.textContent =
      String(active);

  }


  if (inactiveElement) {

    inactiveElement.textContent =
      String(inactive);

  }

}


// =====================================================
// STATUS NORMALIZATION
//
// Backend lama HEXA memperbolehkan STATUS kosong
// dianggap ACTIVE.
// =====================================================

function getManagementUserStatus(
  user
) {

  const status =
    cleanManagementValue(
      user?.status
    ).toUpperCase();


  if (!status) {

    return "ACTIVE";

  }


  return status;

}


// =====================================================
// BUILD LEVEL FILTER
// =====================================================

function buildUserManagementLevelFilter() {

  const select =
    document.getElementById(
      "userLevelFilter"
    );


  if (!select) {
    return;
  }


  const currentValue =
    select.value;


  // Sisakan All Levels.
  select.innerHTML =
    '<option value="">All Levels</option>';


  const levelMap =
    new Map();


  userManagementData.forEach(
    function (user) {

      const kode =
        cleanManagementValue(
          user.kode
        );

      const level =
        cleanManagementValue(
          user.level
        );


      const key =
        kode || level;


      if (!key) {
        return;
      }


      if (!levelMap.has(key)) {

        levelMap.set(
          key,
          {
            kode:
              kode,

            level:
              level || "User"
          }
        );

      }

    }
  );


  const levels =
    Array.from(
      levelMap.values()
    );


  levels.sort(
    function (a, b) {

      const kodeA =
        Number(a.kode);

      const kodeB =
        Number(b.kode);


      if (
        Number.isFinite(kodeA) &&
        Number.isFinite(kodeB)
      ) {

        return kodeA - kodeB;

      }


      return (
        a.level || ""
      ).localeCompare(
        b.level || "",
        "id"
      );

    }
  );


  levels.forEach(
    function (item) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        item.kode ||
        item.level;


      option.textContent =
        item.kode
          ? `Level ${item.kode} - ${item.level}`
          : item.level;


      select.appendChild(
        option
      );

    }
  );


  if (
    Array.from(
      select.options
    ).some(
      function (option) {

        return (
          option.value ===
          currentValue
        );

      }
    )
  ) {

    select.value =
      currentValue;

  }

}


// =====================================================
// APPLY FILTER
// =====================================================

function applyUserManagementFilters() {

  const searchInput =
    document.getElementById(
      "userSearchInput"
    );

  const levelFilter =
    document.getElementById(
      "userLevelFilter"
    );

  const statusFilter =
    document.getElementById(
      "userStatusFilter"
    );


  const search =
    cleanManagementValue(
      searchInput?.value
    ).toLowerCase();


  const selectedLevel =
    cleanManagementValue(
      levelFilter?.value
    );


  const selectedStatus =
    cleanManagementValue(
      statusFilter?.value
    ).toUpperCase();


  filteredUserManagementData =
    userManagementData.filter(
      function (user) {

        // SEARCH
        const searchableText =
          [
            user.nama,
            user.userId,
            user.level,
            user.kode,
            user.email,
            user.noHp
          ]
            .join(" ")
            .toLowerCase();


        const matchSearch =
          !search ||
          searchableText.includes(
            search
          );


        // LEVEL
        const matchLevel =
          !selectedLevel ||
          user.kode ===
            selectedLevel ||
          user.level ===
            selectedLevel;


        // STATUS
        const userStatus =
          getManagementUserStatus(
            user
          );


        const matchStatus =
          !selectedStatus ||
          userStatus ===
            selectedStatus;


        return (
          matchSearch &&
          matchLevel &&
          matchStatus
        );

      }
    );


  renderUserManagementList();

}


// =====================================================
// RENDER LIST
// =====================================================

function renderUserManagementList() {

  const list =
    document.getElementById(
      "userManagementList"
    );

  const loading =
    document.getElementById(
      "userManagementLoading"
    );

  const error =
    document.getElementById(
      "userManagementError"
    );

  const empty =
    document.getElementById(
      "userManagementEmpty"
    );

  const resultText =
    document.getElementById(
      "userListResultText"
    );


  if (loading) {
    loading.hidden = true;
  }


  if (error) {
    error.hidden = true;
  }


  if (!list) {
    return;
  }


  list.innerHTML = "";


  if (resultText) {

    resultText.textContent =
      `${filteredUserManagementData.length} of ${userManagementData.length} users`;

  }


  if (
    filteredUserManagementData.length === 0
  ) {

    if (empty) {
      empty.hidden = false;
    }

    return;
  }


  if (empty) {
    empty.hidden = true;
  }


  const fragment =
    document.createDocumentFragment();


  filteredUserManagementData.forEach(
    function (user) {

      fragment.appendChild(
        createUserManagementCard(
          user
        )
      );

    }
  );


  list.appendChild(
    fragment
  );

}


// =====================================================
// CREATE USER CARD
// =====================================================

function createUserManagementCard(
  user
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "user-card";


  card.dataset.uniqId =
    user.uniqId;


  // ===================================================
  // AVATAR
  // ===================================================

  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "user-card-avatar";


  const initial =
    document.createElement(
      "span"
    );


  initial.textContent =
    getManagementInitials(
      user.nama
    );


  avatar.appendChild(
    initial
  );


  const photoUrl =
    getManagementPhotoDisplayUrl(
      user.photo
    );


  if (photoUrl) {

    const image =
      document.createElement(
        "img"
      );


    image.alt =
      `Photo ${user.nama || "User"}`;


    image.onload =
      function () {

        image.style.display =
          "block";

        initial.style.display =
          "none";

      };


    image.onerror =
      function () {

        image.style.display =
          "none";

        initial.style.display =
          "";

      };


    image.src =
      photoUrl;


    avatar.appendChild(
      image
    );

  }


  // ===================================================
  // INFORMATION
  // ===================================================

  const info =
    document.createElement(
      "div"
    );


  info.className =
    "user-card-info";


  const name =
    document.createElement(
      "h3"
    );


  name.className =
    "user-card-name";


  name.textContent =
    user.nama ||
    "Unnamed User";


  const userId =
    document.createElement(
      "div"
    );


  userId.className =
    "user-card-id";


  userId.textContent =
    user.userId ||
    "-";


  // ===================================================
  // BADGES
  // ===================================================

  const meta =
    document.createElement(
      "div"
    );


  meta.className =
    "user-card-meta";


  const levelBadge =
    document.createElement(
      "span"
    );


  levelBadge.className =
    "user-level-badge";


  levelBadge.textContent =
    user.kode
      ? `Level ${user.kode} • ${user.level || "User"}`
      : user.level || "User";


  const status =
    getManagementUserStatus(
      user
    );


  const statusBadge =
    document.createElement(
      "span"
    );


  statusBadge.className =
    "user-status-badge " +
    (
      status === "ACTIVE"
        ? "active"
        : "inactive"
    );


  statusBadge.textContent =
    status;


  meta.appendChild(
    levelBadge
  );


  meta.appendChild(
    statusBadge
  );


  // ===================================================
  // SECONDARY
  // ===================================================

  const secondary =
    document.createElement(
      "div"
    );


  secondary.className =
    "user-card-secondary";


  if (user.email) {

    const email =
      document.createElement(
        "span"
      );


    email.textContent =
      user.email;


    secondary.appendChild(
      email
    );

  }


  if (user.noHp) {

    const phone =
      document.createElement(
        "span"
      );


    phone.textContent =
      user.noHp;


    secondary.appendChild(
      phone
    );

  }


  // ===================================================
  // ASSEMBLE
  // ===================================================

  info.appendChild(
    name
  );


  info.appendChild(
    userId
  );


  info.appendChild(
    meta
  );


  if (
    secondary.childElementCount > 0
  ) {

    info.appendChild(
      secondary
    );

  }


  card.appendChild(
    avatar
  );


  card.appendChild(
    info
  );


  return card;

}


// =====================================================
// PROFILE PHOTO
// GOOGLE DRIVE URL -> THUMBNAIL
// =====================================================

function getManagementPhotoDisplayUrl(
  photoUrl
) {

  const url =
    cleanManagementValue(
      photoUrl
    );


  if (!url) {

    return "";

  }


  const fileMatch =
    url.match(
      /\/file\/d\/([a-zA-Z0-9_-]+)/
    );


  if (
    fileMatch &&
    fileMatch[1]
  ) {

    return (
      "https://drive.google.com/thumbnail?id=" +
      fileMatch[1] +
      "&sz=w500"
    );

  }


  const idMatch =
    url.match(
      /[?&]id=([a-zA-Z0-9_-]+)/
    );


  if (
    idMatch &&
    idMatch[1]
  ) {

    return (
      "https://drive.google.com/thumbnail?id=" +
      idMatch[1] +
      "&sz=w500"
    );

  }


  return url;

}


// =====================================================
// INITIALS
// =====================================================

function getManagementInitials(
  name
) {

  const words =
    cleanManagementValue(
      name || "User"
    )
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
// LOADING STATE
// =====================================================

function showUserManagementLoading() {

  const loading =
    document.getElementById(
      "userManagementLoading"
    );

  const error =
    document.getElementById(
      "userManagementError"
    );

  const empty =
    document.getElementById(
      "userManagementEmpty"
    );

  const list =
    document.getElementById(
      "userManagementList"
    );

  const resultText =
    document.getElementById(
      "userListResultText"
    );


  if (loading) {
    loading.hidden = false;
  }


  if (error) {
    error.hidden = true;
  }


  if (empty) {
    empty.hidden = true;
  }


  if (list) {
    list.innerHTML = "";
  }


  if (resultText) {

    resultText.textContent =
      "Loading user database...";

  }

}


// =====================================================
// ERROR STATE
// =====================================================

function showUserManagementError(
  message
) {

  const loading =
    document.getElementById(
      "userManagementLoading"
    );

  const error =
    document.getElementById(
      "userManagementError"
    );

  const empty =
    document.getElementById(
      "userManagementEmpty"
    );

  const list =
    document.getElementById(
      "userManagementList"
    );

  const errorMessage =
    document.getElementById(
      "userManagementErrorMessage"
    );

  const resultText =
    document.getElementById(
      "userListResultText"
    );


  if (loading) {
    loading.hidden = true;
  }


  if (empty) {
    empty.hidden = true;
  }


  if (list) {
    list.innerHTML = "";
  }


  if (errorMessage) {

    errorMessage.textContent =
      message ||
      "User Database tidak dapat dimuat.";

  }


  if (error) {
    error.hidden = false;
  }


  if (resultText) {

    resultText.textContent =
      "Unable to load user database.";

  }

}


// =====================================================
// SESSION HELPERS
// =====================================================

function clearUserManagementSession() {

  sessionStorage.removeItem(
    "hexaLoggedIn"
  );

  sessionStorage.removeItem(
    "hexaUser"
  );

}


function redirectUserManagementLogin() {

  window.location.replace(
    "index.html"
  );

}


// =====================================================
// ADD USER
// =====================================================

function initializeUserManagementAdd() {

  const openButton =
    document.getElementById("userAddButton");

  const closeButton =
    document.getElementById("userAddClose");

  const cancelButton =
    document.getElementById("userAddCancel");

  const backdrop =
    document.getElementById("userAddBackdrop");

  const form =
    document.getElementById("userAddForm");

  const passwordToggle =
    document.getElementById("userAddPasswordToggle");


  if (openButton) {
    openButton.addEventListener(
      "click",
      openUserAddModal
    );
  }


  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeUserAddModal
    );
  }


  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      closeUserAddModal
    );
  }


  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeUserAddModal
    );
  }


  if (form) {
    form.addEventListener(
      "submit",
      submitUserAddForm
    );
  }


  if (passwordToggle) {
    passwordToggle.addEventListener(
      "click",
      toggleUserAddPassword
    );
  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        !document.getElementById("userAddModal")?.hidden
      ) {
        closeUserAddModal();
      }

    }
  );

}


function openUserAddModal() {

  const backdrop =
    document.getElementById("userAddBackdrop");

  const modal =
    document.getElementById("userAddModal");

  const form =
    document.getElementById("userAddForm");

  if (!backdrop || !modal) {
    return;
  }

  if (form) {
    form.reset();
  }

  const status =
    document.getElementById("userAddStatus");

  if (status) {
    status.value = "ACTIVE";
  }

  setUserAddMessage("", "");

  backdrop.hidden = false;
  modal.hidden = false;

  document.body.classList.add(
    "user-add-open"
  );

  setTimeout(
    function () {
      document
        .getElementById("userAddName")
        ?.focus();
    },
    50
  );

}


function closeUserAddModal() {

  const backdrop =
    document.getElementById("userAddBackdrop");

  const modal =
    document.getElementById("userAddModal");

  const saveButton =
    document.getElementById("userAddSave");

  if (backdrop) {
    backdrop.hidden = true;
  }

  if (modal) {
    modal.hidden = true;
  }

  if (saveButton) {
    saveButton.disabled = false;
    saveButton.textContent = "Create User";
  }

  document.body.classList.remove(
    "user-add-open"
  );

}


function toggleUserAddPassword() {

  const input =
    document.getElementById("userAddPassword");

  const button =
    document.getElementById("userAddPasswordToggle");

  if (!input) {
    return;
  }

  const show =
    input.type === "password";

  input.type =
    show
      ? "text"
      : "password";

  if (button) {
    button.setAttribute(
      "aria-label",
      show
        ? "Hide password"
        : "Show password"
    );
  }

}


async function submitUserAddForm(
  event
) {

  event.preventDefault();


  const nama =
    cleanManagementValue(
      document.getElementById("userAddName")?.value
    );

  const userId =
    cleanManagementValue(
      document.getElementById("userAddUserId")?.value
    );

  const password =
    cleanManagementValue(
      document.getElementById("userAddPassword")?.value
    );

  const kode =
    cleanManagementValue(
      document.getElementById("userAddRole")?.value
    );

  const noHp =
    cleanManagementValue(
      document.getElementById("userAddPhone")?.value
    );

  const email =
    cleanManagementValue(
      document.getElementById("userAddEmail")?.value
    );

  const status =
    cleanManagementValue(
      document.getElementById("userAddStatus")?.value
    ).toUpperCase();


  if (!nama) {
    setUserAddMessage(
      "Nama wajib diisi.",
      "error"
    );
    return;
  }


  if (!userId) {
    setUserAddMessage(
      "User ID wajib diisi.",
      "error"
    );
    return;
  }


  if (!password) {
    setUserAddMessage(
      "Password wajib diisi.",
      "error"
    );
    return;
  }


  if (password.length < 6) {
    setUserAddMessage(
      "Password minimal 6 karakter.",
      "error"
    );
    return;
  }


  if (!kode) {
    setUserAddMessage(
      "Role wajib dipilih.",
      "error"
    );
    return;
  }


  if (!["1", "2", "3", "4"].includes(kode)) {
    setUserAddMessage(
      "Role tidak valid.",
      "error"
    );
    return;
  }


  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    setUserAddMessage(
      "Status tidak valid.",
      "error"
    );
    return;
  }


  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    setUserAddMessage(
      "Format email tidak valid.",
      "error"
    );
    return;
  }


  const saveButton =
    document.getElementById("userAddSave");


  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Creating...";
  }


  setUserAddMessage(
    "Creating new user...",
    ""
  );


  try {

    const response =
      await fetch(
        USER_MANAGEMENT_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify({
              action: "addUser",

              masterUniqId:
                currentManagementUser?.uniqId || "",

              nama:
                nama,

              userId:
                userId,

              password:
                password,

              kode:
                kode,

              noHp:
                noHp,

              email:
                email,

              status:
                status
            })
        }
      );


    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }


    const result =
      await response.json();


    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result?.message ||
        "Gagal membuat user baru."
      );
    }


    setUserAddMessage(
      result.message ||
      "User berhasil dibuat.",
      "success"
    );


    await loadUserManagementData();


    setTimeout(
      function () {
        closeUserAddModal();
      },
      650
    );


  } catch (error) {

    console.error(
      "HEXA User Management: add user failed.",
      error
    );

    setUserAddMessage(
      error.message ||
      "Gagal membuat user baru.",
      "error"
    );


    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Create User";
    }

  }

}


function setUserAddMessage(
  message,
  type
) {

  const element =
    document.getElementById("userAddMessage");

  if (!element) {
    return;
  }


  const cleanMessage =
    cleanManagementValue(message);


  if (!cleanMessage) {
    element.hidden = true;
    element.textContent = "";
    element.className =
      "user-add-message";
    return;
  }


  element.hidden = false;
  element.textContent =
    cleanMessage;

  element.className =
    "user-add-message" +
    (
      type
        ? " " + type
        : ""
    );

}
