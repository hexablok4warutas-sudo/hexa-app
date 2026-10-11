"use strict";

const SYSTEM_SETTINGS_ROUTES = {
  "population-unit": "population-unit.html",
  "daily-activity-access": "daily-activity-access.html",
  "kpi-data-management": "kpi-data-management.html"
};

document.addEventListener("DOMContentLoaded", initializeSystemSettings);

function initializeSystemSettings() {
  const user = getSystemSettingsSessionUser();
  if (!user) return;

  if (Number(user.kode) !== 1) {
    alert("You are not authorized to access this page.");
    window.location.replace("main.html");
    return;
  }

  applySystemSettingsTheme(user.kode);
  initializeBackButton();
  initializeSystemSettingsNavigation();
}

function getSystemSettingsSessionUser() {
  const loggedIn = sessionStorage.getItem("hexaLoggedIn");
  const rawUser = sessionStorage.getItem("hexaUser");

  if (loggedIn !== "true" || !rawUser) {
    redirectSystemSettingsToLogin();
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    if (!user || !user.uniqId || !user.userId) {
      clearSystemSettingsSession();
      redirectSystemSettingsToLogin();
      return null;
    }
    return user;
  } catch (error) {
    console.error("HEXA System Settings: invalid session.", error);
    clearSystemSettingsSession();
    redirectSystemSettingsToLogin();
    return null;
  }
}

function initializeBackButton() {
  const backButton = document.getElementById("systemSettingsBackButton");
  if (!backButton) return;
  backButton.addEventListener("click", function () {
    window.location.href = "settings.html";
  });
}

function initializeSystemSettingsNavigation() {
  document.querySelectorAll("[data-system-page]").forEach(function(card) {
    card.addEventListener("click", function () {
      navigateToSystemSettingsPage(card.dataset.systemPage);
    });
  });
}

function navigateToSystemSettingsPage(page) {
  const route = SYSTEM_SETTINGS_ROUTES[page];
  if (!route) {
    console.warn("System Settings route tidak ditemukan:", page);
    return;
  }
  window.location.href = route;
}

function applySystemSettingsTheme(kode) {
  const body = document.body;
  const numericKode = Number(kode);
  body.classList.remove("theme-blue", "theme-orange");
  if (Number.isFinite(numericKode) && numericKode >= 1 && numericKode <= 3) {
    body.classList.add("theme-blue");
  } else {
    body.classList.add("theme-orange");
  }
}

function clearSystemSettingsSession() {
  sessionStorage.removeItem("hexaLoggedIn");
  sessionStorage.removeItem("hexaUser");
}

function redirectSystemSettingsToLogin() {
  window.location.replace("index.html");
}
