"use strict";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

document.addEventListener("DOMContentLoaded", initializeProfile);

let currentProfileUser = null;

function initializeProfile() {
  const user = getProfileSessionUser();
  if (!user) return;

  currentProfileUser = { ...user };

  applyProfileTheme(user.kode);
  renderProfile(user);
  initializeProfileNavigation();
}

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
    kutipan: cleanProfileValue(user.kutipan)
  };
}

function cleanProfileValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function applyProfileTheme(kode) {
  const numericKode = Number(kode);

  document.body.classList.remove("theme-blue", "theme-orange");

  if (Number.isFinite(numericKode) && numericKode >= 1 && numericKode <= 3) {
    document.body.classList.add("theme-blue");
  } else {
    document.body.classList.add("theme-orange");
  }
}

function renderProfile(user) {
  setProfileText("profileHeroName", user.nama || "User");
  setProfileText("profileHeroUserId", user.userId || "-");
  setProfileText("profileHeroLevel", user.kode ? `Level ${user.kode}` : "-");
  setProfileText("profileRoleBadge", (user.level || "User").toUpperCase());
  setProfileText("profileName", user.nama || "-");
  setProfileText("profilePhone", user.noHp || "-");
  setProfileText("profileEmail", user.email || "-");
  setProfileText("profileQuote", user.kutipan || "-");
  setProfileText("profileUserId", user.userId || "-");
  setProfileText("profileLevel", user.level || "-");
  setProfileText("profileKode", user.kode || "-");

  renderProfileStatus(user.status);
  renderProfileMotto(user.kutipan);
  renderProfilePhoto(user.nama, user.photo);
}

function setProfileText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderProfileStatus(status) {
  const element = document.getElementById("profileStatus");
  const activeMark = document.getElementById("profileActiveMark");
  if (!element) return;

  const cleanStatus = cleanProfileValue(status);
  const normalizedStatus = cleanStatus.toLowerCase();

  const isInactive =
    normalizedStatus === "inactive" ||
    normalizedStatus === "nonaktif" ||
    normalizedStatus === "non-active";

  element.textContent = cleanStatus || "-";
  element.classList.toggle("is-inactive", isInactive);

  if (activeMark) activeMark.hidden = isInactive;
}

function renderProfileMotto(motto) {
  const element = document.getElementById("profileMotto");
  if (!element) return;

  const cleanMotto = cleanProfileValue(motto);

  if (!cleanMotto) {
    element.textContent = "";
    element.hidden = true;
    return;
  }

  element.textContent = `“${cleanMotto}”`;
  element.hidden = false;
}

function renderProfilePhoto(name, photoUrl) {
  const photo = document.getElementById("profilePhoto");
  const initial = document.getElementById("profileInitial");

  if (initial) {
    initial.textContent = getProfileInitials(name);
    initial.style.display = "";
  }

  if (!photo) return;

  photo.onload = null;
  photo.onerror = null;
  photo.style.display = "none";
  photo.removeAttribute("src");

  const url = cleanProfileValue(photoUrl);
  if (!url) return;

  photo.onload = function () {
    photo.style.display = "block";
    if (initial) initial.style.display = "none";
  };

  photo.onerror = function () {
    photo.style.display = "none";
    photo.removeAttribute("src");
    if (initial) initial.style.display = "";
  };

  photo.alt = `Foto profil ${name || "User"}`;
  photo.src = url;
}

function getProfileInitials(name) {
  const words = String(name || "User").trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "US";

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function initializeProfileNavigation() {
  const backButton = document.getElementById("profileBackButton");
  const editButton = document.getElementById("profileEditButton");
  const cancelButton = document.getElementById("profileCancelButton");
  const saveButton = document.getElementById("profileSaveButton");
  const photoButton = document.getElementById("profilePhotoAction");
  const passwordButton = document.getElementById("profilePasswordButton");

  if (backButton) {
    backButton.addEventListener("click", function () {
      window.location.href = "settings.html";
    });
  }

  if (editButton) {
    editButton.addEventListener("click", enterProfileEditMode);
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", cancelProfileEdit);
  }

  if (saveButton) {
    saveButton.addEventListener("click", previewProfileChanges);
  }

  // Photo dan password kita aktifkan pada tahap berikutnya.
  [photoButton, passwordButton].forEach(function (button) {
    if (button) {
      button.addEventListener("click", function () {
        alert("Fitur ini akan diaktifkan pada tahap berikutnya.");
      });
    }
  });
}

function enterProfileEditMode() {
  if (!currentProfileUser) return;

  createProfileEditor("profileName", "text", currentProfileUser.nama);
  createProfileEditor("profilePhone", "tel", currentProfileUser.noHp);
  createProfileEditor("profileEmail", "email", currentProfileUser.email);
  createProfileEditor("profileQuote", "textarea", currentProfileUser.kutipan);

  const viewActions = document.getElementById("profileViewActions");
  const editActions = document.getElementById("profileEditActions");

  if (viewActions) viewActions.hidden = true;
  if (editActions) editActions.hidden = false;
}

function createProfileEditor(id, type, value) {
  const container = document.getElementById(id);
  if (!container) return;

  const field = container.closest(".profile-field");
  if (field) field.classList.add("is-editing");

  let input;

  if (type === "textarea") {
    input = document.createElement("textarea");
  } else {
    input = document.createElement("input");
    input.type = type;
  }

  input.className = "profile-edit-input";
  input.value = value || "";
  input.dataset.profileEditor = id;

  if (id === "profilePhone") {
    input.inputMode = "tel";
  }

  container.replaceChildren(input);
}

function cancelProfileEdit() {
  if (!currentProfileUser) return;

  renderProfile(currentProfileUser);
  exitProfileEditMode();
}

async function previewProfileChanges() {
  if (!currentProfileUser) return;

  const nama = getProfileEditorValue("profileName");
  const noHp = getProfileEditorValue("profilePhone");
  const email = getProfileEditorValue("profileEmail");
  const kutipan = getProfileEditorValue("profileQuote");

  if (!nama) {
    alert("Name tidak boleh kosong.");
    return;
  }

  const saveButton = document.getElementById("profileSaveButton");
  const cancelButton = document.getElementById("profileCancelButton");

  const originalSaveText = saveButton ? saveButton.textContent : "Save Changes";

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
  }

  if (cancelButton) {
    cancelButton.disabled = true;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "updateMyProfile",
        uniqId: currentProfileUser.uniqId,
        nama: nama,
        noHp: noHp,
        photo: currentProfileUser.photo || "",
        email: email,
        kutipan: kutipan
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
          : "Response update profile tidak valid."
      );
    }

    currentProfileUser = normalizeProfileUser(result.user);

    sessionStorage.setItem(
      "hexaUser",
      JSON.stringify(currentProfileUser)
    );

    renderProfile(currentProfileUser);
    exitProfileEditMode();

    alert("Profile berhasil diperbarui.");

  } catch (error) {
    console.error("HEXA Profile: gagal menyimpan profile.", error);

    alert(
      "Profile gagal diperbarui.\n\n" +
      (error.message || "Terjadi kesalahan saat menghubungi HEXA API.")
    );

  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = originalSaveText;
    }

    if (cancelButton) {
      cancelButton.disabled = false;
    }
  }
}

function getProfileEditorValue(id) {
  const container = document.getElementById(id);
  const input = container?.querySelector("[data-profile-editor]");
  return cleanProfileValue(input?.value);
}

function exitProfileEditMode() {
  document.querySelectorAll(".profile-field.is-editing").forEach(function (field) {
    field.classList.remove("is-editing");
  });

  const viewActions = document.getElementById("profileViewActions");
  const editActions = document.getElementById("profileEditActions");

  if (viewActions) viewActions.hidden = false;
  if (editActions) editActions.hidden = true;
}

function clearProfileSession() {
  sessionStorage.removeItem("hexaLoggedIn");
  sessionStorage.removeItem("hexaUser");
}

function redirectProfileToLogin() {
  window.location.replace("index.html");
}
