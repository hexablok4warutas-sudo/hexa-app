// ========================================
// HEXA APP
// GLOBAL MENU REGISTRY
// ========================================

"use strict";


/*
  =========================================
  HEXA MENU MASTER
  =========================================

  File ini menjadi SATU SUMBER menu HEXA.

  Nantinya digunakan oleh:
  - Main Page
  - Global Header Dropdown
  - Search Menu
  - Access Settings
  - User Permission

  Jika ada menu baru, cukup tambahkan di sini.

  Tahap berikutnya data ini dapat dipindahkan
  ke Google Sheets / Settings Master tanpa
  mengubah struktur halaman.
*/


window.HEXA_MENU = [

  // ========================================
  // DAILY MAINTENANCE
  // ========================================

  {
    id: "daily-maintenance",

    name: "Daily Maintenance",

    icon:
      "hexa-icon-svg-dailymaintenance.svg",

    url:
      "/daily-maintenance",

    order: 1,

    enabled: true
  },


  // ========================================
  // BACKLOG MONITORING
  // ========================================

  {
    id: "backlog-monitoring",

    name: "Backlog Monitoring",

    icon:
      "hexa-icon-svg-backlogmonitoring.svg",

    url:
      "/backlog-monitoring",

    order: 2,

    enabled: false
  },


  // ========================================
  // FUI
  // ========================================

  {
    id: "fui",

    name: "FUI",

    icon:
      "hexa-icon-svg-fui.svg",

    url:
      "/fui",

    order: 3,

    enabled: false
  },


  // ========================================
  // ROTABLE
  // ========================================

  {
    id: "rotable",

    name: "Rotable",

    icon:
      "hexa-icon-svg-rotable.svg",

    url:
      "/rotable",

    order: 4,

    enabled: false
  },


  // ========================================
  // NEWS
  // ========================================

  {
    id: "news",

    name: "News",

    icon:
      "hexa-icon-svg-news.svg",

    url:
      "/news",

    order: 5,

    enabled: false
  },


  // ========================================
  // SETTINGS
  // ========================================

  {
    id: "settings",

    name: "Settings",

    icon:
      "hexa-icon-svg-settings.svg",

    url:
      "/settings",

    order: 6,

    enabled: false
  }

];


// ========================================
// SORT MENU BERDASARKAN ORDER
// ========================================

window.HEXA_MENU.sort(
  function (a, b) {

    return a.order - b.order;

  }
);


// ========================================
// HELPER
// AMBIL SEMUA MENU
// ========================================

window.getHexaMenus =
  function () {

    return window.HEXA_MENU;

  };


// ========================================
// HELPER
// AMBIL MENU BERDASARKAN ID
// ========================================

window.getHexaMenu =
  function (menuId) {

    return window.HEXA_MENU.find(
      function (menu) {

        return menu.id === menuId;

      }
    );

  };


// ========================================
// HELPER
// AMBIL MENU YANG SUDAH AKTIF
// ========================================

window.getEnabledHexaMenus =
  function () {

    return window.HEXA_MENU.filter(
      function (menu) {

        return menu.enabled === true;

      }
    );

  };


// ========================================
// HELPER
// CEK MENU SUDAH AKTIF
// ========================================

window.isHexaMenuEnabled =
  function (menuId) {

    const menu =
      window.getHexaMenu(menuId);

    return Boolean(
      menu &&
      menu.enabled === true
    );

  };


console.log(
  "HEXA Global Menu Ready:",
  window.HEXA_MENU
);
