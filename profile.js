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

  const url = getProfilePhotoDisplayUrl(photoUrl);

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

  photo.alt = `Foto profil ${name || "User"}`;
  photo.src = url;
}

function getProfilePhotoDisplayUrl(photoUrl) {
  const url = cleanProfileValue(photoUrl);

  if (!url) return "";

  // Google Drive URL:
  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);

  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;
  }

  // Google Drive open?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
  }

  // Kalau bukan Google Drive, gunakan URL asli.
  return url;
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

  if (photoButton) {
    photoButton.addEventListener("click", openProfilePhotoSheet);
  }

  if (passwordButton) {
    passwordButton.addEventListener("click", openProfilePasswordModal);
  }

  initializeProfilePhotoControls();
  initializeProfilePasswordControls();
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


// =====================================================
// CHANGE PROFILE PHOTO
// =====================================================

function initializeProfilePhotoControls() {
  const cameraInput = document.getElementById("profileCameraInput");
  const galleryInput = document.getElementById("profileGalleryInput");
  const takePhotoButton = document.getElementById("profileTakePhotoButton");
  const chooseGalleryButton = document.getElementById("profileChooseGalleryButton");
  const cancelButton = document.getElementById("profilePhotoSheetCancel");
  const backdrop = document.getElementById("profilePhotoSheetBackdrop");

  if (takePhotoButton && cameraInput) {
    takePhotoButton.addEventListener("click", function () {
      closeProfilePhotoSheet();
      cameraInput.value = "";
      cameraInput.click();
    });
  }

  if (chooseGalleryButton && galleryInput) {
    chooseGalleryButton.addEventListener("click", function () {
      closeProfilePhotoSheet();
      galleryInput.value = "";
      galleryInput.click();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", closeProfilePhotoSheet);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeProfilePhotoSheet);
  }

  if (cameraInput) {
    cameraInput.addEventListener("change", handleProfilePhotoSelection);
  }

  if (galleryInput) {
    galleryInput.addEventListener("change", handleProfilePhotoSelection);
  }
}

function openProfilePhotoSheet() {
  const sheet = document.getElementById("profilePhotoSheet");
  const backdrop = document.getElementById("profilePhotoSheetBackdrop");

  if (!sheet || !backdrop) return;

  backdrop.hidden = false;
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("profile-photo-sheet-open");

  requestAnimationFrame(function () {
    sheet.classList.add("is-open");
  });
}

function closeProfilePhotoSheet() {
  const sheet = document.getElementById("profilePhotoSheet");
  const backdrop = document.getElementById("profilePhotoSheetBackdrop");

  if (!sheet || !backdrop) return;

  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("profile-photo-sheet-open");

  setTimeout(function () {
    if (!sheet.classList.contains("is-open")) {
      backdrop.hidden = true;
    }
  }, 240);
}

async function handleProfilePhotoSelection(event) {
  const input = event.currentTarget;
  const file = input.files && input.files[0];

  if (!file) return;

  if (!file.type || !file.type.startsWith("image/")) {
    alert("File yang dipilih harus berupa gambar.");
    input.value = "";
    return;
  }

  try {
    setProfilePhotoUploading(true);

    const compressedPhoto = await compressProfilePhoto(file);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "updateProfilePhoto",
        uniqId: currentProfileUser.uniqId,
        photoBase64: compressedPhoto.base64,
        photoMimeType: compressedPhoto.mimeType
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
          : "Response update Photo Profile tidak valid."
      );
    }

    currentProfileUser = normalizeProfileUser(result.user);

    sessionStorage.setItem(
      "hexaUser",
      JSON.stringify(currentProfileUser)
    );

    renderProfile(currentProfileUser);

    alert("Photo Profile berhasil diperbarui.");

  } catch (error) {
    console.error("HEXA Profile: gagal update Photo Profile.", error);

    alert(
      "Photo Profile gagal diperbarui.\\n\\n" +
      (error.message || "Terjadi kesalahan saat menghubungi HEXA API.")
    );

  } finally {
    setProfilePhotoUploading(false);
    input.value = "";
  }
}

function compressProfilePhoto(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onerror = function () {
      reject(new Error("Gagal membaca file gambar."));
    };

    reader.onload = function () {
      const image = new Image();

      image.onerror = function () {
        reject(new Error("Gambar tidak dapat diproses."));
      };

      image.onload = function () {
        const maxSize = 1200;

        let width = image.naturalWidth || image.width;
        let height = image.naturalHeight || image.height;

        if (!width || !height) {
          reject(new Error("Ukuran gambar tidak valid."));
          return;
        }

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);

          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Browser tidak dapat memproses gambar."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const mimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, 0.82);

        resolve({
          base64: dataUrl.split(",")[1],
          mimeType: mimeType
        });
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function setProfilePhotoUploading(isUploading) {
  const overlay = document.getElementById("profilePhotoUploading");
  const photoButton = document.getElementById("profilePhotoAction");

  if (overlay) {
    overlay.hidden = !isUploading;
  }

  if (photoButton) {
    photoButton.disabled = isUploading;
  }
}

// =====================================================
// CHANGE PASSWORD
// =====================================================

function initializeProfilePasswordControls() {
  const form = document.getElementById("profilePasswordForm");
  const closeButton = document.getElementById("profilePasswordClose");
  const cancelButton = document.getElementById("profilePasswordCancel");
  const backdrop = document.getElementById("profilePasswordBackdrop");
  const toggles = document.querySelectorAll(".profile-password-toggle");

  if (form) {
    form.addEventListener("submit", submitProfilePasswordChange);
  }

  if (closeButton) closeButton.addEventListener("click", closeProfilePasswordModal);
  if (cancelButton) cancelButton.addEventListener("click", closeProfilePasswordModal);
  if (backdrop) backdrop.addEventListener("click", closeProfilePasswordModal);

  toggles.forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.dataset.passwordTarget;
      const input = document.getElementById(targetId);
      if (!input) return;

      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "🙈" : "👁";
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });
}

function openProfilePasswordModal() {
  const modal = document.getElementById("profilePasswordModal");
  const backdrop = document.getElementById("profilePasswordBackdrop");
  const currentInput = document.getElementById("profileCurrentPassword");

  resetProfilePasswordForm();

  if (backdrop) backdrop.hidden = false;

  if (modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  document.body.classList.add("profile-password-open");

  window.setTimeout(function () {
    if (currentInput) currentInput.focus();
  }, 80);
}

function closeProfilePasswordModal() {
  const modal = document.getElementById("profilePasswordModal");
  const backdrop = document.getElementById("profilePasswordBackdrop");

  if (modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  if (backdrop) backdrop.hidden = true;

  document.body.classList.remove("profile-password-open");
  resetProfilePasswordForm();
}

function resetProfilePasswordForm() {
  const form = document.getElementById("profilePasswordForm");
  const message = document.getElementById("profilePasswordMessage");
  const toggles = document.querySelectorAll(".profile-password-toggle");

  if (form) form.reset();

  if (message) {
    message.hidden = true;
    message.textContent = "";
    message.classList.remove("is-error", "is-success");
  }

  toggles.forEach(function (button) {
    const targetId = button.dataset.passwordTarget;
    const input = document.getElementById(targetId);
    if (input) input.type = "password";
    button.textContent = "👁";
    button.setAttribute("aria-label", "Show password");
  });
}

function showProfilePasswordMessage(message, type) {
  const element = document.getElementById("profilePasswordMessage");
  if (!element) return;

  element.textContent = message || "";
  element.classList.remove("is-error", "is-success");
  element.classList.add(type === "success" ? "is-success" : "is-error");
  element.hidden = false;
}

async function submitProfilePasswordChange(event) {
  event.preventDefault();

  if (!currentProfileUser || !currentProfileUser.uniqId) {
    showProfilePasswordMessage("Session user tidak ditemukan.", "error");
    return;
  }

  const currentPassword = cleanProfileValue(
    document.getElementById("profileCurrentPassword")?.value
  );

  const newPassword = cleanProfileValue(
    document.getElementById("profileNewPassword")?.value
  );

  const confirmPassword = cleanProfileValue(
    document.getElementById("profileConfirmPassword")?.value
  );

  if (!currentPassword || !newPassword || !confirmPassword) {
    showProfilePasswordMessage("Semua field password wajib diisi.", "error");
    return;
  }

  if (newPassword.length < 6) {
    showProfilePasswordMessage("New Password minimal 6 karakter.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showProfilePasswordMessage("Confirm New Password tidak sesuai.", "error");
    return;
  }

  if (currentPassword === newPassword) {
    showProfilePasswordMessage(
      "New Password harus berbeda dari Current Password.",
      "error"
    );
    return;
  }

  const saveButton = document.getElementById("profilePasswordSave");
  const originalText = saveButton ? saveButton.textContent : "";

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Updating...";
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "changePassword",
        uniqId: currentProfileUser.uniqId,
        currentPassword: currentPassword,
        newPassword: newPassword
      })
    });

    const result = await response.json();

    if (!result || result.success !== true) {
      showProfilePasswordMessage(
        result?.message || "Gagal mengubah Password.",
        "error"
      );
      return;
    }

    showProfilePasswordMessage(
      result.message || "Password berhasil diubah.",
      "success"
    );

    const currentInput = document.getElementById("profileCurrentPassword");
    const newInput = document.getElementById("profileNewPassword");
    const confirmInput = document.getElementById("profileConfirmPassword");

    if (currentInput) currentInput.value = "";
    if (newInput) newInput.value = "";
    if (confirmInput) confirmInput.value = "";

    window.setTimeout(function () {
      closeProfilePasswordModal();
      alert("Password berhasil diubah. Gunakan password baru pada login berikutnya.");
    }, 700);

  } catch (error) {
    console.error("HEXA Profile: change password gagal.", error);
    showProfilePasswordMessage(
      "Tidak dapat terhubung ke HEXA API.",
      "error"
    );

  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = originalText || "Change Password";
    }
  }
}

