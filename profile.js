"use strict";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

document.addEventListener("DOMContentLoaded", initializeProfile);

let currentProfileUser = null;

let profileSavedSignatureUrl = "";
let profilePendingSignatureDataUrl = "";
let profileSignatureDrawing = false;
let profileSignatureHasInk = false;
let profileSignatureLastPoint = null;

/* =========================================================
   INITIALIZE PROFILE
========================================================= */

async function initializeProfile() {
  const user = getProfileSessionUser();
  if (!user) return;

  currentProfileUser = { ...user };

  applyProfileTheme(user.kode);
  renderProfile(user);
  initializeProfileNavigation();

  await syncProfileFromDatabase();
}

async function syncProfileFromDatabase() {
  if (!currentProfileUser || !currentProfileUser.uniqId) return;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "getUserProfile",
        uniqId: currentProfileUser.uniqId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result || result.success !== true || !result.user) {
      throw new Error(
        result && result.message
          ? result.message
          : "Response User Profile tidak valid."
      );
    }

    const freshUser = normalizeProfileUser(result.user);

    if (!freshUser.uniqId || !freshUser.userId) {
      throw new Error("Data User Profile tidak lengkap.");
    }

    currentProfileUser = freshUser;

    sessionStorage.setItem(
      "hexaUser",
      JSON.stringify(currentProfileUser)
    );

    applyProfileTheme(currentProfileUser.kode);
    renderProfile(currentProfileUser);

  } catch (error) {
    console.error(
      "HEXA Profile: gagal sync User Profile dari database.",
      error
    );
  }
}

/* =========================================================
   SESSION
========================================================= */

function getProfileSessionUser() {
  const loggedIn = sessionStorage.getItem("hexaLoggedIn");
  const rawUser = sessionStorage.getItem("hexaUser");

  if (loggedIn !== "true" || !rawUser) {
    redirectProfileToLogin();
    return null;
  }

  try {
    const user = JSON.parse(rawUser);

    if (!user || !user.uniqId || !user.userId) {
      clearProfileSession();
      redirectProfileToLogin();
      return null;
    }

    return normalizeProfileUser(user);

  } catch (error) {
    console.error("HEXA Profile: session user tidak valid.", error);

    clearProfileSession();
    redirectProfileToLogin();

    return null;
  }
}

function normalizeProfileUser(user) {
  return {
    uniqId: cleanProfileValue(user.uniqId),
    userId: cleanProfileValue(user.userId),
    nama: cleanProfileValue(user.nama) || "User",
    level: cleanProfileValue(user.level) || "User",
    kode: cleanProfileValue(user.kode),
    noHp: cleanProfileValue(user.noHp),
    photo: cleanProfileValue(user.photo),
    email: cleanProfileValue(user.email),
    status: cleanProfileValue(user.status),
    kutipan: cleanProfileValue(user.kutipan),
    signature: cleanProfileValue(user.signature)
  };
}

function cleanProfileValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function clearProfileSession() {
  sessionStorage.removeItem("hexaLoggedIn");
  sessionStorage.removeItem("hexaUser");
}

function redirectProfileToLogin() {
  window.location.href = "index.html";
}

/* =========================================================
   THEME
========================================================= */

function applyProfileTheme(kode) {
  const numericKode = Number(kode);

  document.body.classList.remove(
    "theme-blue",
    "theme-orange"
  );

  if (
    Number.isFinite(numericKode) &&
    numericKode >= 1 &&
    numericKode <= 3
  ) {
    document.body.classList.add("theme-blue");
  } else {
    document.body.classList.add("theme-orange");
  }
}

/* =========================================================
   RENDER PROFILE
========================================================= */

function renderProfile(user) {
  setProfileText(
    "profileHeroName",
    user.nama || "User"
  );

  setProfileText(
    "profileHeroUserId",
    user.userId || "-"
  );

  setProfileText(
    "profileHeroLevel",
    user.kode ? `Level ${user.kode}` : "-"
  );

  setProfileText(
    "profileRoleBadge",
    (user.level || "User").toUpperCase()
  );

  setProfileText(
    "profileName",
    user.nama || "-"
  );

  setProfileText(
    "profilePhone",
    user.noHp || "-"
  );

  setProfileText(
    "profileEmail",
    user.email || "-"
  );

  setProfileText(
    "profileQuote",
    user.kutipan || "-"
  );

  setProfileText(
    "profileUserId",
    user.userId || "-"
  );

  setProfileText(
    "profileLevel",
    user.level || "-"
  );

  setProfileText(
    "profileKode",
    user.kode || "-"
  );

  renderProfileStatus(user.status);
  renderProfileMotto(user.kutipan);
  renderProfilePhoto(user.nama, user.photo);
  renderProfileSignature(user.signature);
}

function setProfileText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

/* =========================================================
   STATUS
========================================================= */

function renderProfileStatus(status) {
  const element =
    document.getElementById("profileStatus");

  const activeMark =
    document.getElementById("profileActiveMark");

  if (!element) return;

  const cleanStatus =
    cleanProfileValue(status);

  const normalizedStatus =
    cleanStatus.toLowerCase();

  const isInactive =
    normalizedStatus === "inactive" ||
    normalizedStatus === "nonaktif" ||
    normalizedStatus === "non-active";

  element.textContent =
    cleanStatus || "-";

  element.classList.toggle(
    "is-inactive",
    isInactive
  );

  if (activeMark) {
    activeMark.hidden = isInactive;
  }
}

/* =========================================================
   MOTTO
========================================================= */

function renderProfileMotto(motto) {
  const element =
    document.getElementById("profileMotto");

  if (!element) return;

  const cleanMotto =
    cleanProfileValue(motto);

  if (!cleanMotto) {
    element.textContent = "";
    element.hidden = true;
    return;
  }

  element.textContent =
    `“${cleanMotto}”`;

  element.hidden = false;
}

/* =========================================================
   PROFILE PHOTO
========================================================= */

function renderProfilePhoto(name, photoUrl) {
  const photo =
    document.getElementById("profilePhoto");

  const initial =
    document.getElementById("profileInitial");

  if (initial) {
    initial.textContent =
      getProfileInitials(name);

    initial.style.display = "";
  }

  if (!photo) return;

  photo.onload = null;
  photo.onerror = null;

  photo.style.display = "none";
  photo.removeAttribute("src");

  const url =
    getProfilePhotoDisplayUrl(photoUrl);

  if (!url) return;

  photo.onload = function () {
    photo.style.display = "block";

    if (initial) {
      initial.style.display = "none";
    }
  };

  photo.onerror = function () {
    photo.style.display = "none";
    photo.removeAttribute("src");

    if (initial) {
      initial.style.display = "";
    }
  };

  photo.alt =
    `Foto profil ${name || "User"}`;

  photo.src = url;
}

function getProfilePhotoDisplayUrl(photoUrl) {
  const url =
    cleanProfileValue(photoUrl);

  if (!url) return "";

  const fileMatch =
    url.match(
      /\/file\/d\/([a-zA-Z0-9_-]+)/
    );

  if (fileMatch && fileMatch[1]) {
    return (
      "https://drive.google.com/thumbnail?id=" +
      fileMatch[1] +
      "&sz=w1000"
    );
  }

  const idMatch =
    url.match(
      /[?&]id=([a-zA-Z0-9_-]+)/
    );

  if (idMatch && idMatch[1]) {
    return (
      "https://drive.google.com/thumbnail?id=" +
      idMatch[1] +
      "&sz=w1000"
    );
  }

  return url;
}

function getProfileInitials(name) {
  const words =
    String(name || "User")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!words.length) {
    return "US";
  }

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

/* =========================================================
   SIGNATURE RENDER
========================================================= */

function renderProfileSignature(signatureUrl) {
  profileSavedSignatureUrl =
    cleanProfileValue(signatureUrl);

  profilePendingSignatureDataUrl = "";

  const image =
    document.getElementById(
      "profileSignatureImage"
    );

  const empty =
    document.getElementById(
      "profileSignatureEmpty"
    );

  const buttonText =
    document.getElementById(
      "profileSignatureButtonText"
    );

  const signatureButton =
    document.getElementById(
      "profileSignatureButton"
    );

  const pendingActions =
    document.getElementById(
      "profileSignaturePendingActions"
    );

  if (!image || !empty) return;

  if (signatureButton) {
    signatureButton.hidden = false;
  }

  if (pendingActions) {
    pendingActions.hidden = true;
  }

  image.onload = null;
  image.onerror = null;

  image.hidden = true;
  image.removeAttribute("src");

  empty.hidden = false;

  const url =
    getProfilePhotoDisplayUrl(signatureUrl);

  if (!url) {
    if (buttonText) {
      buttonText.textContent =
        "Create Signature";
    }

    return;
  }

  image.onload = function () {
    image.hidden = false;
    empty.hidden = true;

    if (buttonText) {
      buttonText.textContent =
        "Change Signature";
    }
  };

  image.onerror = function () {
    image.hidden = true;
    image.removeAttribute("src");

    empty.hidden = false;

    if (buttonText) {
      buttonText.textContent =
        "Create Signature";
    }
  };

  image.src = url;
}

/* =========================================================
   NAVIGATION
========================================================= */

function initializeProfileNavigation() {
  const backButton =
    document.getElementById(
      "profileBackButton"
    );

  const editButton =
    document.getElementById(
      "profileEditButton"
    );

  const cancelButton =
    document.getElementById(
      "profileCancelButton"
    );

  const saveButton =
    document.getElementById(
      "profileSaveButton"
    );

  const photoButton =
    document.getElementById(
      "profilePhotoAction"
    );

  const passwordButton =
    document.getElementById(
      "profilePasswordButton"
    );

  const signatureButton =
    document.getElementById(
      "profileSignatureButton"
    );

  if (backButton) {
    backButton.addEventListener(
      "click",
      function () {
        window.location.href =
          "settings.html";
      }
    );
  }

  if (editButton) {
    editButton.addEventListener(
      "click",
      enterProfileEditMode
    );
  }

  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      cancelProfileEdit
    );
  }

  if (saveButton) {
    saveButton.addEventListener(
      "click",
      previewProfileChanges
    );
  }

  if (photoButton) {
    photoButton.addEventListener(
      "click",
      openProfilePhotoSheet
    );
  }

  if (passwordButton) {
    passwordButton.addEventListener(
      "click",
      openProfilePasswordModal
    );
  }

  if (signatureButton) {
    signatureButton.addEventListener(
      "click",
      openProfileSignatureSheet
    );
  }

  initializeProfileSignatureControls();
  initializeProfilePhotoControls();
  initializeProfilePasswordControls();
}

/* =========================================================
   PROFILE EDIT
========================================================= */

function enterProfileEditMode() {
  if (!currentProfileUser) return;

  createProfileEditor(
    "profileName",
    "text",
    currentProfileUser.nama
  );

  createProfileEditor(
    "profilePhone",
    "tel",
    currentProfileUser.noHp
  );

  createProfileEditor(
    "profileEmail",
    "email",
    currentProfileUser.email
  );

  createProfileEditor(
    "profileQuote",
    "text",
    currentProfileUser.kutipan
  );

  const editButton =
    document.getElementById(
      "profileEditButton"
    );

  const actionButtons =
    document.getElementById(
      "profileEditActions"
    );

  if (editButton) {
    editButton.hidden = true;
  }

  if (actionButtons) {
    actionButtons.hidden = false;
  }
}

function createProfileEditor(
  elementId,
  type,
  value
) {
  const element =
    document.getElementById(elementId);

  if (!element) return;

  if (
    element.querySelector(
      ".profile-inline-editor"
    )
  ) {
    return;
  }

  const input =
    document.createElement("input");

  input.type = type;
  input.value = value || "";

  input.className =
    "profile-inline-editor";

  input.dataset.originalValue =
    value || "";

  element.textContent = "";
  element.appendChild(input);
}

function cancelProfileEdit() {
  if (!currentProfileUser) return;

  renderProfile(currentProfileUser);
  exitProfileEditMode();
}

function exitProfileEditMode() {
  const editButton =
    document.getElementById(
      "profileEditButton"
    );

  const actionButtons =
    document.getElementById(
      "profileEditActions"
    );

  if (editButton) {
    editButton.hidden = false;
  }

  if (actionButtons) {
    actionButtons.hidden = true;
  }
}

function getProfileEditorValue(id) {
  const element =
    document.getElementById(id);

  if (!element) return "";

  const input =
    element.querySelector(
      ".profile-inline-editor"
    );

  if (!input) {
    return cleanProfileValue(
      element.textContent
    );
  }

  return cleanProfileValue(
    input.value
  );
}

function previewProfileChanges() {
  if (!currentProfileUser) return;

  const updatedData = {
    nama:
      getProfileEditorValue(
        "profileName"
      ),

    noHp:
      getProfileEditorValue(
        "profilePhone"
      ),

    email:
      getProfileEditorValue(
        "profileEmail"
      ),

    kutipan:
      getProfileEditorValue(
        "profileQuote"
      )
  };

  saveProfileChanges(updatedData);
}

async function saveProfileChanges(
  updatedData
) {
  if (
    !currentProfileUser ||
    !currentProfileUser.uniqId
  ) {
    alert(
      "Data user tidak ditemukan."
    );
    return;
  }

  try {
    const response =
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action:
            "updateMyProfile",

          uniqId:
            currentProfileUser.uniqId,

          nama:
            updatedData.nama,

          noHp:
            updatedData.noHp,

          email:
            updatedData.email,

          kutipan:
            updatedData.kutipan
        })
      });

    const result =
      await response.json();

    if (
      !result ||
      result.success !== true ||
      !result.user
    ) {
      throw new Error(
        result?.message ||
        "Gagal menyimpan profile."
      );
    }

    currentProfileUser =
      normalizeProfileUser(
        result.user
      );

    sessionStorage.setItem(
      "hexaUser",
      JSON.stringify(
        currentProfileUser
      )
    );

    renderProfile(
      currentProfileUser
    );

    exitProfileEditMode();

    alert(
      "Profile berhasil diperbarui."
    );

  } catch (error) {
    console.error(error);

    alert(
      "Profile gagal diperbarui.\n\n" +
      (
        error.message ||
        "Terjadi kesalahan."
      )
    );
  }
}

/* =========================================================
   SIGNATURE CONTROLS
========================================================= */

function initializeProfileSignatureControls() {
  const closeSheetButton =
    document.getElementById(
      "profileSignatureSheetClose"
    );

  const sheetBackdrop =
    document.getElementById(
      "profileSignatureSheetBackdrop"
    );

  const drawButton =
    document.getElementById(
      "profileSignatureDraw"
    );

  const scanButton =
    document.getElementById(
      "profileSignatureScan"
    );

  const drawCloseButton =
    document.getElementById(
      "profileDrawSignatureClose"
    );

  const drawBackdrop =
    document.getElementById(
      "profileDrawSignatureBackdrop"
    );

  const clearButton =
    document.getElementById(
      "profileSignatureClear"
    );

  const useButton =
    document.getElementById(
      "profileSignatureUse"
    );

  const canvas =
    document.getElementById(
      "profileSignatureCanvas"
    );

  const cancelPreviewButton =
    document.getElementById(
      "profileSignatureCancelPreview"
    );

  const saveSignatureButton =
    document.getElementById(
      "profileSignatureSave"
    );

  if (closeSheetButton) {
    closeSheetButton.addEventListener(
      "click",
      closeProfileSignatureSheet
    );
  }

  if (sheetBackdrop) {
    sheetBackdrop.addEventListener(
      "click",
      closeProfileSignatureSheet
    );
  }

  if (drawButton) {
    drawButton.addEventListener(
      "click",
      function () {
        closeProfileSignatureSheet();

        setTimeout(
          openProfileDrawSignature,
          180
        );
      }
    );
  }

  if (scanButton) {
    scanButton.addEventListener(
      "click",
      openProfileSignatureScanChooser
    );
  }

  if (drawCloseButton) {
    drawCloseButton.addEventListener(
      "click",
      closeProfileDrawSignature
    );
  }

  if (drawBackdrop) {
    drawBackdrop.addEventListener(
      "click",
      closeProfileDrawSignature
    );
  }

  if (clearButton) {
    clearButton.addEventListener(
      "click",
      clearProfileSignatureCanvas
    );
  }

  if (useButton) {
    useButton.addEventListener(
      "click",
      useProfileDrawnSignaturePreview
    );
  }

  if (canvas) {
    canvas.addEventListener(
      "pointerdown",
      startProfileSignatureDrawing
    );

    canvas.addEventListener(
      "pointermove",
      moveProfileSignatureDrawing
    );

    canvas.addEventListener(
      "pointerup",
      endProfileSignatureDrawing
    );

    canvas.addEventListener(
      "pointercancel",
      endProfileSignatureDrawing
    );

    canvas.addEventListener(
      "pointerleave",
      endProfileSignatureDrawing
    );
  }

  if (cancelPreviewButton) {
    cancelPreviewButton.addEventListener(
      "click",
      cancelProfileSignaturePreview
    );
  }

  if (saveSignatureButton) {
    saveSignatureButton.addEventListener(
      "click",
      saveProfileSignature
    );
  }

  ensureProfileSignatureScanInputs();
}

/* =========================================================
   CAMERA / GALLERY INPUTS
========================================================= */

function ensureProfileSignatureScanInputs() {
  if (
    document.getElementById(
      "profileSignatureCameraInput"
    )
  ) {
    return;
  }

  const cameraInput =
    document.createElement("input");

  cameraInput.type = "file";

  cameraInput.id =
    "profileSignatureCameraInput";

  cameraInput.accept =
    "image/*";

  /*
    Camera input sengaja menggunakan
    capture environment.
    Di HP ini akan meminta kamera belakang.
  */
  cameraInput.capture =
    "environment";

  cameraInput.hidden = true;

  const galleryInput =
    document.createElement("input");

  galleryInput.type = "file";

  galleryInput.id =
    "profileSignatureGalleryInput";

  galleryInput.accept =
    "image/*";

  /*
    Gallery TIDAK memakai capture.
    Ini penting supaya HP membuka
    file/gallery picker.
  */
  galleryInput.hidden = true;

  cameraInput.addEventListener(
    "change",
    handleProfileSignatureScanFile
  );

  galleryInput.addEventListener(
    "change",
    handleProfileSignatureScanFile
  );

  document.body.appendChild(
    cameraInput
  );

  document.body.appendChild(
    galleryInput
  );
}

/* =========================================================
   CAMERA / GALLERY SOURCE CHOOSER
========================================================= */

function openProfileSignatureScanChooser() {
  closeProfileSignatureSheet();

  ensureProfileSignatureSourceSheet();

  const overlay =
    document.getElementById(
      "profileSignatureSourceOverlay"
    );

  if (!overlay) return;

  overlay.hidden = false;

  document.body.style.overflow =
    "hidden";
}

function ensureProfileSignatureSourceSheet() {
  if (
    document.getElementById(
      "profileSignatureSourceOverlay"
    )
  ) {
    return;
  }

  const overlay =
    document.createElement("div");

  overlay.id =
    "profileSignatureSourceOverlay";

  overlay.hidden = true;

  overlay.innerHTML = `
    <div
      class="profile-signature-source-backdrop"
      data-signature-source-close>
    </div>

    <section
      class="profile-signature-source-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Choose signature source">

      <div
        class="profile-signature-source-handle">
      </div>

      <div
        class="profile-signature-source-heading">

        <strong>
          Scan / Upload Signature
        </strong>

        <span>
          Choose image source
        </span>

      </div>

      <button
        type="button"
        class="profile-signature-source-option"
        id="profileSignatureSourceCamera">

        <span
          class="profile-signature-source-icon">
          📷
        </span>

        <span>
          <strong>
            Camera
          </strong>

          <small>
            Take a new photo of your signature
          </small>
        </span>

      </button>

      <button
        type="button"
        class="profile-signature-source-option"
        id="profileSignatureSourceGallery">

        <span
          class="profile-signature-source-icon">
          🖼️
        </span>

        <span>
          <strong>
            Gallery
          </strong>

          <small>
            Choose an existing signature photo
          </small>
        </span>

      </button>

      <button
        type="button"
        class="profile-signature-source-cancel"
        data-signature-source-close>
        Cancel
      </button>

    </section>
  `;

  document.body.appendChild(
    overlay
  );

  /*
    CSS bottom sheet dibuat dari JS
    supaya HTML dan profile.css
    yang sudah stabil tidak perlu disentuh.
  */

  if (
    !document.getElementById(
      "profileSignatureSourceStyle"
    )
  ) {
    const style =
      document.createElement("style");

    style.id =
      "profileSignatureSourceStyle";

    style.textContent = `
      #profileSignatureSourceOverlay[hidden] {
        display: none !important;
      }

      #profileSignatureSourceOverlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }

      .profile-signature-source-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(
          15,
          23,
          42,
          0.42
        );
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }

      .profile-signature-source-sheet {
        position: relative;
        width: min(
          100%,
          520px
        );

        box-sizing:
          border-box;

        padding:
          10px
          18px
          calc(
            18px +
            env(
              safe-area-inset-bottom
            )
          );

        border-radius:
          24px
          24px
          0
          0;

        background:
          #ffffff;

        box-shadow:
          0
          -14px
          40px
          rgba(
            15,
            23,
            42,
            0.16
          );

        animation:
          profileSignatureSourceUp
          0.22s
          ease-out;
      }

      @keyframes
      profileSignatureSourceUp {

        from {
          transform:
            translateY(100%);
        }

        to {
          transform:
            translateY(0);
        }
      }

      .profile-signature-source-handle {
        width: 42px;
        height: 4px;

        margin:
          0
          auto
          16px;

        border-radius:
          999px;

        background:
          #d7dce2;
      }

      .profile-signature-source-heading {
        display: grid;
        gap: 4px;
        margin-bottom: 14px;
      }

      .profile-signature-source-heading strong {
        font-size: 17px;
        color: #172033;
      }

      .profile-signature-source-heading span {
        font-size: 13px;
        color: #7b8494;
      }

      .profile-signature-source-option {
        width: 100%;

        display: flex;
        align-items: center;

        gap: 13px;

        margin:
          9px
          0;

        padding:
          14px;

        border:
          1px
          solid
          #e4e8ee;

        border-radius:
          15px;

        background:
          #ffffff;

        color:
          #172033;

        text-align:
          left;

        cursor:
          pointer;
      }

      .profile-signature-source-option:active {
        transform:
          scale(0.99);

        background:
          #f7f8fa;
      }

      .profile-signature-source-icon {
        width: 42px;
        height: 42px;

        flex:
          0
          0
          42px;

        display: grid;
        place-items: center;

        border-radius:
          12px;

        background:
          #f2f4f7;

        font-size:
          20px;
      }

      .profile-signature-source-option
      > span:last-child {
        display: grid;
        gap: 3px;
      }

      .profile-signature-source-option strong {
        font-size: 14px;
      }

      .profile-signature-source-option small {
        color: #7b8494;
        font-size: 12px;
      }

      .profile-signature-source-cancel {
        width: 100%;

        margin-top:
          10px;

        padding:
          13px;

        border:
          0;

        border-radius:
          14px;

        background:
          #f2f4f7;

        color:
          #394150;

        font-weight:
          700;

        cursor:
          pointer;
      }
    `;

    document.head.appendChild(
      style
    );
  }

  const cameraButton =
    document.getElementById(
      "profileSignatureSourceCamera"
    );

  const galleryButton =
    document.getElementById(
      "profileSignatureSourceGallery"
    );

  if (cameraButton) {
    cameraButton.addEventListener(
      "click",
      function () {
        closeProfileSignatureSourceSheet();

        const input =
          document.getElementById(
            "profileSignatureCameraInput"
          );

        if (!input) return;

        input.value = "";
        input.click();
      }
    );
  }

  if (galleryButton) {
    galleryButton.addEventListener(
      "click",
      function () {
        closeProfileSignatureSourceSheet();

        const input =
          document.getElementById(
            "profileSignatureGalleryInput"
          );

        if (!input) return;

        input.value = "";
        input.click();
      }
    );
  }

  overlay
    .querySelectorAll(
      "[data-signature-source-close]"
    )
    .forEach(
      function (element) {
        element.addEventListener(
          "click",
          closeProfileSignatureSourceSheet
        );
      }
    );
}

function closeProfileSignatureSourceSheet() {
  const overlay =
    document.getElementById(
      "profileSignatureSourceOverlay"
    );

  if (overlay) {
    overlay.hidden = true;
  }

  document.body.style.overflow =
    "";
}

/* =========================================================
   READ CAMERA / GALLERY FILE
========================================================= */

async function handleProfileSignatureScanFile(
  event
) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) return;

  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {
    alert(
      "File harus berupa gambar."
    );

    return;
  }

  try {
    const dataUrl =
      await readProfileSignatureFile(
        file
      );

    const processedDataUrl =
      await processProfileSignatureImage(
        dataUrl
      );

    showProfileSignatureProcessedPreview(
      processedDataUrl
    );

  } catch (error) {
    console.error(
      "HEXA Profile: gagal memproses Scan / Upload Signature.",
      error
    );

    alert(
      "Gambar signature gagal diproses.\n\n" +
      (
        error.message ||
        "Silakan coba foto atau gambar lain."
      )
    );
  }
}

function readProfileSignatureFile(file) {
  return new Promise(
    function (resolve, reject) {
      const reader =
        new FileReader();

      reader.onload =
        function () {
          resolve(
            reader.result
          );
        };

      reader.onerror =
        function () {
          reject(
            new Error(
              "Gagal membaca file gambar."
            )
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}

function loadProfileSignatureImage(
  dataUrl
) {
  return new Promise(
    function (resolve, reject) {
      const image =
        new Image();

      image.onload =
        function () {
          resolve(image);
        };

      image.onerror =
        function () {
          reject(
            new Error(
              "Gambar tidak dapat dibuka."
            )
          );
        };

      image.src =
        dataUrl;
    }
  );
}

/* =========================================================
   SIGNATURE IMAGE PROCESSING
========================================================= */

async function processProfileSignatureImage(
  dataUrl
) {
  const image =
    await loadProfileSignatureImage(
      dataUrl
    );

  const maxWidth = 1400;
  const maxHeight = 900;

  const scale =
    Math.min(
      1,
      maxWidth /
        image.naturalWidth,
      maxHeight /
        image.naturalHeight
    );

  const width =
    Math.max(
      1,
      Math.round(
        image.naturalWidth *
        scale
      )
    );

  const height =
    Math.max(
      1,
      Math.round(
        image.naturalHeight *
        scale
      )
    );

  const workCanvas =
    document.createElement(
      "canvas"
    );

  workCanvas.width =
    width;

  workCanvas.height =
    height;

  const context =
    workCanvas.getContext(
      "2d",
      {
        willReadFrequently:
          true
      }
    );

  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  const imageData =
    context.getImageData(
      0,
      0,
      width,
      height
    );

  const pixels =
    imageData.data;

  /*
    Estimasi tingkat terang
    background kertas.
  */

  let luminanceTotal = 0;
  let luminanceSamples = 0;

  const sampleStep =
    Math.max(
      1,
      Math.floor(
        (width * height) /
        30000
      )
    );

  for (
    let i = 0;
    i < pixels.length;
    i += 4 * sampleStep
  ) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    luminanceTotal +=
      (0.299 * r) +
      (0.587 * g) +
      (0.114 * b);

    luminanceSamples++;
  }

  const averageLum =
    luminanceSamples > 0
      ? luminanceTotal /
        luminanceSamples
      : 230;

  /*
    Adaptive threshold.
    Background terang dihapus,
    tinta gelap dipertahankan.
  */

  const threshold =
    Math.max(
      135,
      Math.min(
        215,
        averageLum - 28
      )
    );

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const gray =
      (0.299 * r) +
      (0.587 * g) +
      (0.114 * b);

    if (gray >= threshold) {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 0;

      continue;
    }

    const darkness =
      Math.max(
        0,
        Math.min(
          1,
          (
            threshold -
            gray
          ) /
          Math.max(
            1,
            threshold - 45
          )
        )
      );

    let alpha =
      Math.round(
        255 *
        Math.pow(
          darkness,
          0.72
        )
      );

    /*
      Buang noise kamera
      yang sangat tipis.
    */

    if (alpha < 34) {
      alpha = 0;
    }

    pixels[i] = 17;
    pixels[i + 1] = 17;
    pixels[i + 2] = 17;
    pixels[i + 3] = alpha;
  }

  context.putImageData(
    imageData,
    0,
    0
  );

  /*
    Cari area tinta.
  */

  const bounds =
    getProfileSignatureInkBounds(
      workCanvas
    );

  if (!bounds) {
    throw new Error(
      "Tanda tangan tidak terdeteksi. Gunakan kertas terang dan tinta gelap."
    );
  }

  /*
    Crop margin kosong.
  */

  const padding =
    Math.max(
      18,
      Math.round(
        Math.min(
          width,
          height
        ) *
        0.035
      )
    );

  const sx =
    Math.max(
      0,
      bounds.left -
      padding
    );

  const sy =
    Math.max(
      0,
      bounds.top -
      padding
    );

  const ex =
    Math.min(
      width,
      bounds.right +
      padding
    );

  const ey =
    Math.min(
      height,
      bounds.bottom +
      padding
    );

  const cropWidth =
    Math.max(
      1,
      ex - sx
    );

  const cropHeight =
    Math.max(
      1,
      ey - sy
    );

  const outputCanvas =
    document.createElement(
      "canvas"
    );

  outputCanvas.width =
    cropWidth;

  outputCanvas.height =
    cropHeight;

  const outputContext =
    outputCanvas.getContext(
      "2d"
    );

  outputContext.drawImage(
    workCanvas,

    sx,
    sy,
    cropWidth,
    cropHeight,

    0,
    0,
    cropWidth,
    cropHeight
  );

  return outputCanvas.toDataURL(
    "image/png"
  );
}

function getProfileSignatureInkBounds(
  canvas
) {
  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true
      }
    );

  const width =
    canvas.width;

  const height =
    canvas.height;

  const data =
    context.getImageData(
      0,
      0,
      width,
      height
    ).data;

  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (
    let y = 0;
    y < height;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x++
    ) {
      const alpha =
        data[
          (
            (y * width) +
            x
          ) *
          4 +
          3
        ];

      if (alpha > 45) {
        if (x < left) {
          left = x;
        }

        if (x > right) {
          right = x;
        }

        if (y < top) {
          top = y;
        }

        if (y > bottom) {
          bottom = y;
        }
      }
    }
  }

  if (
    right < left ||
    bottom < top
  ) {
    return null;
  }

  return {
    left: left,
    top: top,
    right: right + 1,
    bottom: bottom + 1
  };
}

/* =========================================================
   SCAN PREVIEW
========================================================= */

function showProfileSignatureProcessedPreview(
  dataUrl
) {
  const image =
    document.getElementById(
      "profileSignatureImage"
    );

  const empty =
    document.getElementById(
      "profileSignatureEmpty"
    );

  const signatureButton =
    document.getElementById(
      "profileSignatureButton"
    );

  const pendingActions =
    document.getElementById(
      "profileSignaturePendingActions"
    );

  if (!image || !empty) {
    return;
  }

  profilePendingSignatureDataUrl =
    dataUrl;

  image.onload =
    function () {
      image.hidden = false;
      empty.hidden = true;
    };

  image.onerror =
    function () {
      alert(
        "Preview signature tidak dapat ditampilkan."
      );
    };

  image.src =
    profilePendingSignatureDataUrl;

  if (signatureButton) {
    signatureButton.hidden = true;
  }

  if (pendingActions) {
    pendingActions.hidden = false;
  }
}

/* =========================================================
   SIGNATURE MAIN SHEET
========================================================= */

function openProfileSignatureSheet() {
  const sheet =
    document.getElementById(
      "profileSignatureSheet"
    );

  const backdrop =
    document.getElementById(
      "profileSignatureSheetBackdrop"
    );

  if (!sheet || !backdrop) {
    return;
  }

  backdrop.hidden = false;

  sheet.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "profile-signature-overlay-open"
  );

  requestAnimationFrame(
    function () {
      sheet.classList.add(
        "is-open"
      );
    }
  );
}

function closeProfileSignatureSheet() {
  const sheet =
    document.getElementById(
      "profileSignatureSheet"
    );

  const backdrop =
    document.getElementById(
      "profileSignatureSheetBackdrop"
    );

  if (!sheet || !backdrop) {
    return;
  }

  sheet.classList.remove(
    "is-open"
  );

  sheet.setAttribute(
    "aria-hidden",
    "true"
  );

  setTimeout(
    function () {
      if (
        !sheet.classList.contains(
          "is-open"
        )
      ) {
        backdrop.hidden = true;

        const drawModal =
          document.getElementById(
            "profileDrawSignatureModal"
          );

        if (
          !drawModal ||
          !drawModal.classList.contains(
            "is-open"
          )
        ) {
          document.body.classList.remove(
            "profile-signature-overlay-open"
          );
        }
      }
    },
    240
  );
}

/* =========================================================
   DRAW SIGNATURE
========================================================= */

function openProfileDrawSignature() {
  const modal =
    document.getElementById(
      "profileDrawSignatureModal"
    );

  const backdrop =
    document.getElementById(
      "profileDrawSignatureBackdrop"
    );

  if (!modal || !backdrop) {
    return;
  }

  backdrop.hidden = false;

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "profile-signature-overlay-open"
  );

  requestAnimationFrame(
    function () {
      modal.classList.add(
        "is-open"
      );

      requestAnimationFrame(
        function () {
          prepareProfileSignatureCanvas();
        }
      );
    }
  );
}

function closeProfileDrawSignature() {
  const modal =
    document.getElementById(
      "profileDrawSignatureModal"
    );

  const backdrop =
    document.getElementById(
      "profileDrawSignatureBackdrop"
    );

  if (!modal || !backdrop) {
    return;
  }

  modal.classList.remove(
    "is-open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  backdrop.hidden = true;

  document.body.classList.remove(
    "profile-signature-overlay-open"
  );

  profileSignatureDrawing = false;
  profileSignatureLastPoint = null;
}

function prepareProfileSignatureCanvas() {
  const canvas =
    document.getElementById(
      "profileSignatureCanvas"
    );

  const wrap =
    canvas?.parentElement;

  if (!canvas || !wrap) {
    return;
  }

  const rect =
    wrap.getBoundingClientRect();

  const dpr =
    Math.max(
      window.devicePixelRatio ||
      1,
      1
    );

  canvas.width =
    Math.max(
      1,
      Math.round(
        rect.width *
        dpr
      )
    );

  canvas.height =
    Math.max(
      1,
      Math.round(
        rect.height *
        dpr
      )
    );

  const context =
    canvas.getContext("2d");

  context.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  context.lineCap =
    "round";

  context.lineJoin =
    "round";

  context.strokeStyle =
    "#111111";

  context.lineWidth =
    2.4;

  profileSignatureHasInk =
    false;

  profileSignatureDrawing =
    false;

  profileSignatureLastPoint =
    null;

  updateProfileSignatureUseButton();
}

function getProfileSignaturePoint(
  event
) {
  const canvas =
    document.getElementById(
      "profileSignatureCanvas"
    );

  const rect =
    canvas.getBoundingClientRect();

  return {
    x:
      event.clientX -
      rect.left,

    y:
      event.clientY -
      rect.top
  };
}

function startProfileSignatureDrawing(
  event
) {
  const canvas =
    event.currentTarget;

  event.preventDefault();

  try {
    canvas.setPointerCapture(
      event.pointerId
    );
  } catch (error) {
    // optional
  }

  profileSignatureDrawing =
    true;

  profileSignatureLastPoint =
    getProfileSignaturePoint(
      event
    );

  const context =
    canvas.getContext("2d");

  context.beginPath();

  context.arc(
    profileSignatureLastPoint.x,
    profileSignatureLastPoint.y,
    1.2,
    0,
    Math.PI * 2
  );

  context.fillStyle =
    "#111111";

  context.fill();

  profileSignatureHasInk =
    true;

  updateProfileSignatureUseButton();
}

function moveProfileSignatureDrawing(
  event
) {
  if (
    !profileSignatureDrawing ||
    !profileSignatureLastPoint
  ) {
    return;
  }

  event.preventDefault();

  const canvas =
    event.currentTarget;

  const point =
    getProfileSignaturePoint(
      event
    );

  const context =
    canvas.getContext("2d");

  context.beginPath();

  context.moveTo(
    profileSignatureLastPoint.x,
    profileSignatureLastPoint.y
  );

  context.lineTo(
    point.x,
    point.y
  );

  context.stroke();

  profileSignatureLastPoint =
    point;

  profileSignatureHasInk =
    true;

  updateProfileSignatureUseButton();
}

function endProfileSignatureDrawing(
  event
) {
  if (!profileSignatureDrawing) {
    return;
  }

  profileSignatureDrawing =
    false;

  profileSignatureLastPoint =
    null;

  try {
    event.currentTarget
      .releasePointerCapture(
        event.pointerId
      );
  } catch (error) {
    // optional
  }
}

function clearProfileSignatureCanvas() {
  const canvas =
    document.getElementById(
      "profileSignatureCanvas"
    );

  if (!canvas) return;

  const context =
    canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  profileSignatureHasInk =
    false;

  profileSignatureDrawing =
    false;

  profileSignatureLastPoint =
    null;

  updateProfileSignatureUseButton();
}

function updateProfileSignatureUseButton() {
  const button =
    document.getElementById(
      "profileSignatureUse"
    );

  if (button) {
    button.disabled =
      !profileSignatureHasInk;
  }
}

function useProfileDrawnSignaturePreview() {
  if (!profileSignatureHasInk) {
    alert(
      "Silakan gambar tanda tangan terlebih dahulu."
    );

    return;
  }

  const canvas =
    document.getElementById(
      "profileSignatureCanvas"
    );

  const image =
    document.getElementById(
      "profileSignatureImage"
    );

  const empty =
    document.getElementById(
      "profileSignatureEmpty"
    );

  const signatureButton =
    document.getElementById(
      "profileSignatureButton"
    );

  const pendingActions =
    document.getElementById(
      "profileSignaturePendingActions"
    );

  if (
    !canvas ||
    !image ||
    !empty
  ) {
    return;
  }

  profilePendingSignatureDataUrl =
    canvas.toDataURL(
      "image/png"
    );

  image.onload =
    function () {
      image.hidden = false;
      empty.hidden = true;
    };

  image.onerror = null;

  image.src =
    profilePendingSignatureDataUrl;

  if (signatureButton) {
    signatureButton.hidden = true;
  }

  if (pendingActions) {
    pendingActions.hidden = false;
  }

  closeProfileDrawSignature();
}

/* =========================================================
   CANCEL SIGNATURE PREVIEW
========================================================= */

function cancelProfileSignaturePreview() {
  profilePendingSignatureDataUrl = "";

  if (currentProfileUser) {
    renderProfileSignature(
      currentProfileUser.signature ||
      profileSavedSignatureUrl ||
      ""
    );
  } else {
    renderProfileSignature(
      profileSavedSignatureUrl
    );
  }
}

/* =========================================================
   SAVE SIGNATURE
========================================================= */

async function saveProfileSignature() {
  if (
    !profilePendingSignatureDataUrl
  ) {
    alert(
      "Tidak ada signature baru untuk disimpan."
    );

    return;
  }

  if (
    !currentProfileUser ||
    !currentProfileUser.uniqId
  ) {
    alert(
      "Data user tidak ditemukan. Silakan login ulang."
    );

    return;
  }

  const saveButton =
    document.getElementById(
      "profileSignatureSave"
    );

  const cancelButton =
    document.getElementById(
      "profileSignatureCancelPreview"
    );

  const originalText =
    saveButton
      ? saveButton.textContent
      : "Save Signature";

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent =
      "Saving...";
  }

  if (cancelButton) {
    cancelButton.disabled = true;
  }

  try {
    const base64 =
      profilePendingSignatureDataUrl
        .split(",")[1] || "";

    if (!base64) {
      throw new Error(
        "Data signature PNG tidak valid."
      );
    }

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({
            action:
              "updateUserSignature",

            uniqId:
              currentProfileUser.uniqId,

            signatureBase64:
              base64,

            signatureMimeType:
              "image/png"
          })
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const result =
      await response.json();

    if (
      !result ||
      result.success !== true ||
      !result.user
    ) {
      throw new Error(
        result &&
        result.message
          ? result.message
          : "Response update Digital Signature tidak valid."
      );
    }

    currentProfileUser =
      normalizeProfileUser(
        result.user
      );

    sessionStorage.setItem(
      "hexaUser",
      JSON.stringify(
        currentProfileUser
      )
    );

    renderProfile(
      currentProfileUser
    );

    alert(
      "Digital Signature berhasil disimpan."
    );

  } catch (error) {
    console.error(
      "HEXA Profile: gagal menyimpan Digital Signature.",
      error
    );

    alert(
      "Digital Signature gagal disimpan.\n\n" +
      (
        error.message ||
        "Terjadi kesalahan saat menghubungi HEXA API."
      )
    );

  } finally {
    if (saveButton) {
      saveButton.disabled =
        false;

      saveButton.textContent =
        originalText;
    }

    if (cancelButton) {
      cancelButton.disabled =
        false;
    }
  }
}

/* =========================================================
   PHOTO CONTROLS
   Mempertahankan kompatibilitas dengan HTML profile.
========================================================= */

function initializeProfilePhotoControls() {
  const closeButton =
    document.getElementById(
      "profilePhotoSheetClose"
    );

  const backdrop =
    document.getElementById(
      "profilePhotoSheetBackdrop"
    );

  const cameraButton =
    document.getElementById(
      "profilePhotoCamera"
    );

  const galleryButton =
    document.getElementById(
      "profilePhotoGallery"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeProfilePhotoSheet
    );
  }

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeProfilePhotoSheet
    );
  }

  if (cameraButton) {
    cameraButton.addEventListener(
      "click",
      function () {
        triggerProfilePhotoInput(
          true
        );
      }
    );
  }

  if (galleryButton) {
    galleryButton.addEventListener(
      "click",
      function () {
        triggerProfilePhotoInput(
          false
        );
      }
    );
  }
}

function openProfilePhotoSheet() {
  const sheet =
    document.getElementById(
      "profilePhotoSheet"
    );

  const backdrop =
    document.getElementById(
      "profilePhotoSheetBackdrop"
    );

  if (!sheet || !backdrop) {
    return;
  }

  backdrop.hidden = false;

  sheet.setAttribute(
    "aria-hidden",
    "false"
  );

  requestAnimationFrame(
    function () {
      sheet.classList.add(
        "is-open"
      );
    }
  );
}

function closeProfilePhotoSheet() {
  const sheet =
    document.getElementById(
      "profilePhotoSheet"
    );

  const backdrop =
    document.getElementById(
      "profilePhotoSheetBackdrop"
    );

  if (!sheet || !backdrop) {
    return;
  }

  sheet.classList.remove(
    "is-open"
  );

  sheet.setAttribute(
    "aria-hidden",
    "true"
  );

  setTimeout(
    function () {
      if (
        !sheet.classList.contains(
          "is-open"
        )
      ) {
        backdrop.hidden = true;
      }
    },
    220
  );
}

function triggerProfilePhotoInput(
  useCamera
) {
  let input =
    document.getElementById(
      "profileDynamicPhotoInput"
    );

  if (input) {
    input.remove();
  }

  input =
    document.createElement(
      "input"
    );

  input.type = "file";
  input.accept = "image/*";

  input.id =
    "profileDynamicPhotoInput";

  if (useCamera) {
    input.capture =
      "environment";
  }

  input.hidden = true;

  input.addEventListener(
    "change",
    handleProfilePhotoFile
  );

  document.body.appendChild(
    input
  );

  closeProfilePhotoSheet();

  input.click();
}

async function handleProfilePhotoFile(
  event
) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) return;

  try {
    const dataUrl =
      await readProfileSignatureFile(
        file
      );

    await saveProfilePhoto(
      dataUrl,
      file.type ||
      "image/jpeg"
    );

  } catch (error) {
    console.error(error);

    alert(
      "Foto profil gagal diproses.\n\n" +
      (
        error.message ||
        "Terjadi kesalahan."
      )
    );
  }
}

async function saveProfilePhoto(
  dataUrl,
  mimeType
) {
  if (
    !currentProfileUser ||
    !currentProfileUser.uniqId
  ) {
    return;
  }

  const base64 =
    String(dataUrl)
      .split(",")[1] || "";

  if (!base64) {
    throw new Error(
      "Data foto tidak valid."
    );
  }

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          action:
            "updateProfilePhoto",

          uniqId:
            currentProfileUser.uniqId,

          photoBase64:
            base64,

          photoMimeType:
            mimeType
        })
      }
    );

  const result =
    await response.json();

  if (
    !result ||
    result.success !== true ||
    !result.user
  ) {
    throw new Error(
      result?.message ||
      "Gagal menyimpan foto."
    );
  }

  currentProfileUser =
    normalizeProfileUser(
      result.user
    );

  sessionStorage.setItem(
    "hexaUser",
    JSON.stringify(
      currentProfileUser
    )
  );

  renderProfile(
    currentProfileUser
  );

  alert(
    "Foto profil berhasil diperbarui."
  );
}

/* =========================================================
   PASSWORD
========================================================= */

function initializeProfilePasswordControls() {
  const closeButton =
    document.getElementById(
      "profilePasswordClose"
    );

  const cancelButton =
    document.getElementById(
      "profilePasswordCancel"
    );

  const saveButton =
    document.getElementById(
      "profilePasswordSave"
    );

  const backdrop =
    document.getElementById(
      "profilePasswordBackdrop"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeProfilePasswordModal
    );
  }

  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      closeProfilePasswordModal
    );
  }

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeProfilePasswordModal
    );
  }

  if (saveButton) {
    saveButton.addEventListener(
      "click",
      saveProfilePassword
    );
  }
}

function openProfilePasswordModal() {
  const modal =
    document.getElementById(
      "profilePasswordModal"
    );

  const backdrop =
    document.getElementById(
      "profilePasswordBackdrop"
    );

  if (!modal || !backdrop) {
    return;
  }

  backdrop.hidden = false;

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  requestAnimationFrame(
    function () {
      modal.classList.add(
        "is-open"
      );
    }
  );
}

function closeProfilePasswordModal() {
  const modal =
    document.getElementById(
      "profilePasswordModal"
    );

  const backdrop =
    document.getElementById(
      "profilePasswordBackdrop"
    );

  if (!modal || !backdrop) {
    return;
  }

  modal.classList.remove(
    "is-open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  backdrop.hidden = true;
}

async function saveProfilePassword() {
  const oldPassword =
    document.getElementById(
      "profileCurrentPassword"
    )?.value || "";

  const newPassword =
    document.getElementById(
      "profileNewPassword"
    )?.value || "";

  const confirmPassword =
    document.getElementById(
      "profileConfirmPassword"
    )?.value || "";

  if (
    !oldPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    alert(
      "Lengkapi seluruh data password."
    );

    return;
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    alert(
      "Konfirmasi password tidak sama."
    );

    return;
  }

  if (!currentProfileUser) {
    return;
  }

  try {
    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({
            action:
              "changePassword",

            uniqId:
              currentProfileUser.uniqId,

            oldPassword:
              oldPassword,

            newPassword:
              newPassword
          })
        }
      );

    const result =
      await response.json();

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result?.message ||
        "Password gagal diperbarui."
      );
    }

    closeProfilePasswordModal();

    alert(
      "Password berhasil diperbarui."
    );

  } catch (error) {
    console.error(error);

    alert(
      "Password gagal diperbarui.\n\n" +
      (
        error.message ||
        "Terjadi kesalahan."
      )
    );
  }
}
