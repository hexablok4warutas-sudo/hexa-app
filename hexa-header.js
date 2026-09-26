// ========================================
// HEXA APP
// GLOBAL HEADER
// ========================================

"use strict";


// ========================================
// HEADER INITIALIZATION
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeHexaHeader();

  }
);


// ========================================
// INITIALIZE HEXA HEADER
// ========================================

function initializeHexaHeader() {

  const header =
    document.getElementById(
      "hexaHeader"
    );

  if (!header) {

    console.warn(
      "HEXA Header element tidak ditemukan."
    );

    return;

  }


  // ======================================
  // HEADER TYPE
  // main / standard
  // ======================================

  const headerType =
    header.dataset.headerType ||
    "standard";


  // ======================================
  // CURRENT PAGE
  // ======================================

  const currentPage =
    header.dataset.page ||
    "";


  // ======================================
  // BUILD HEADER
  // ======================================

  header.classList.add(
    "main-header"
  );

  header.innerHTML =
    createHexaHeaderHTML(
      headerType,
      currentPage
    );


  // ======================================
  // START HEADER EVENTS
  // ======================================

  initializeHexaHeaderEvents(
    headerType
  );


  console.log(
    "HEXA Global Header Ready:",
    {
      type: headerType,
      page: currentPage
    }
  );

}


// ========================================
// CREATE HEADER HTML
// ========================================

function createHexaHeaderHTML(
  headerType,
  currentPage
) {

  return `
    <div class="header-navigation">

      <button
        type="button"
        class="header-logo"
        id="headerLogoButton"
        aria-label="Open HEXA menu"
        aria-expanded="false"
      >

        <img
          src="hexa-logo-header.png"
          alt="HEXA"
        >

      </button>


      <nav
        class="hexa-nav-menu"
        id="hexaNavMenu"
        aria-label="HEXA Navigation"
      >

        ${createHexaNavigation(
          headerType,
          currentPage
        )}

      </nav>

    </div>


    <div class="header-actions">

      <div class="search-box">

        <input
          type="text"
          id="searchInput"
          placeholder=""
          autocomplete="off"
          aria-label="Search"
        >

        <button
          type="button"
          id="searchButton"
          class="search-button"
          aria-label="Search"
        >

          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >

            <circle
              cx="11"
              cy="11"
              r="7"
            ></circle>

            <line
              x1="16.5"
              y1="16.5"
              x2="21"
              y2="21"
            ></line>

          </svg>

        </button>

      </div>


      <button
        type="button"
        id="refreshButton"
        class="refresh-button"
        aria-label="Refresh"
      >

        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >

          <path
            d="M20 6v5h-5"
          ></path>

          <path
            d="M18.5 15a7 7 0 1 1 .2-6"
          ></path>

        </svg>

      </button>

    </div>
  `;

}


// ========================================
// CREATE NAVIGATION
// ========================================

function createHexaNavigation(
  headerType,
  currentPage
) {

  // ======================================
  // MAIN PAGE
  // HANYA LOGOUT
  // ======================================

  if (headerType === "main") {

    return `
      <button
        type="button"
        class="nav-menu-item logout-menu-item"
        id="logoutButton"
      >
        Logout
      </button>
    `;

  }


  // ======================================
  // STANDARD HEADER
  // ======================================

  let navigationHTML = "";


  // ======================================
  // MAIN PAGE LINK
  // ======================================

  navigationHTML += `
    <button
      type="button"
      class="nav-menu-item
      ${currentPage === "main"
        ? "active"
        : ""}"
      data-page="main"
      data-url="/main"
    >
      Main Page
    </button>
  `;


  // ======================================
  // GET GLOBAL MENU
  // ======================================

  const menus =
    Array.isArray(
      window.HEXA_MENU
    )
      ? window.HEXA_MENU
      : [];


  // ======================================
  // CREATE MENU AUTOMATICALLY
  // ======================================

  menus.forEach(
    function (menu) {

      if (!menu) {
        return;
      }

      if (!menu.id) {
        return;
      }

      if (!menu.name) {
        return;
      }


      const activeClass =
        currentPage === menu.id
          ? "active"
          : "";


      const settingsClass =
        menu.id === "settings"
          ? "settings-nav"
          : "";


      const enabledClass =
        menu.enabled === true
          ? ""
          : "disabled";


      navigationHTML += `
        <button
          type="button"
          class="
            nav-menu-item
            ${activeClass}
            ${settingsClass}
            ${enabledClass}
          "
          data-page="${escapeHexaAttribute(
            menu.id
          )}"
          data-url="${escapeHexaAttribute(
            menu.url || ""
          )}"
          data-enabled="${
            menu.enabled === true
              ? "true"
              : "false"
          }"
        >
          ${escapeHexaHTML(
            menu.name
          )}
        </button>
      `;

    }
  );


  // ======================================
  // DIVIDER
  // ======================================

  navigationHTML += `
    <div
      class="nav-menu-divider"
      aria-hidden="true"
    ></div>
  `;


  // ======================================
  // LOGOUT
  // ======================================

  navigationHTML += `
    <button
      type="button"
      class="nav-menu-item logout-menu-item"
      id="logoutButton"
    >
      Logout
    </button>
  `;


  return navigationHTML;

}


// ========================================
// HEADER EVENTS
// ========================================

function initializeHexaHeaderEvents(
  headerType
) {

  const headerLogoButton =
    document.getElementById(
      "headerLogoButton"
    );

  const hexaNavMenu =
    document.getElementById(
      "hexaNavMenu"
    );

  const logoutButton =
    document.getElementById(
      "logoutButton"
    );

  const refreshButton =
    document.getElementById(
      "refreshButton"
    );

  const navMenuItems =
    document.querySelectorAll(
      "#hexaNavMenu .nav-menu-item[data-page]"
    );


  // ======================================
  // LOGO
  // OPEN / CLOSE DROPDOWN
  // ======================================

  if (
    headerLogoButton &&
    hexaNavMenu
  ) {

    headerLogoButton.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        const isOpen =
          hexaNavMenu
            .classList
            .toggle(
              "open"
            );

        headerLogoButton.setAttribute(
          "aria-expanded",
          isOpen
            ? "true"
            : "false"
        );

      }
    );

  }


  // ======================================
  // NAVIGATION
  // ======================================

  navMenuItems.forEach(
    function (item) {

      item.addEventListener(
        "click",
        function () {

          const page =
            item.dataset.page;

          const url =
            item.dataset.url;

          const enabled =
            item.dataset.enabled;


          closeHexaNavigation();


          // ==================================
          // MAIN PAGE
          // ==================================

          if (page === "main") {

            window.location.href =
              "/main";

            return;

          }


          // ==================================
          // CURRENT PAGE
          // ==================================

          const header =
            document.getElementById(
              "hexaHeader"
            );

          const currentPage =
            header
              ? header.dataset.page
              : "";


          if (
            page === currentPage
          ) {

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

            return;

          }


          // ==================================
          // MENU BELUM AKTIF
          // ==================================

          if (
            enabled !== "true"
          ) {

            console.log(
              "HEXA Menu belum aktif:",
              page
            );

            return;

          }


          // ==================================
          // OPEN PAGE
          // ==================================

          if (url) {

            window.location.href =
              url;

          }

        }
      );

    }
  );


  // ======================================
  // LOGOUT
  // ======================================

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      function () {

        closeHexaNavigation();


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


  // ======================================
  // REFRESH
  // ======================================

  if (refreshButton) {

    refreshButton.addEventListener(
      "click",
      function () {

        window.location.reload();

      }
    );

  }


  // ======================================
  // CLICK DI LUAR DROPDOWN
  // ======================================

  document.addEventListener(
    "click",
    function (event) {

      if (
        !hexaNavMenu ||
        !headerLogoButton
      ) {

        return;

      }


      const clickedInsideMenu =
        hexaNavMenu.contains(
          event.target
        );


      const clickedLogo =
        headerLogoButton.contains(
          event.target
        );


      if (
        !clickedInsideMenu &&
        !clickedLogo
      ) {

        closeHexaNavigation();

      }

    }
  );


  // ======================================
  // ESC CLOSE DROPDOWN
  // ======================================

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeHexaNavigation();

      }

    }
  );


  // ======================================
  // HEADER TYPE INFO
  // ======================================

  console.log(
    "HEXA Header Type:",
    headerType
  );

}


// ========================================
// CLOSE HEXA NAVIGATION
// ========================================

function closeHexaNavigation() {

  const hexaNavMenu =
    document.getElementById(
      "hexaNavMenu"
    );

  const headerLogoButton =
    document.getElementById(
      "headerLogoButton"
    );


  if (hexaNavMenu) {

    hexaNavMenu.classList.remove(
      "open"
    );

  }


  if (headerLogoButton) {

    headerLogoButton.setAttribute(
      "aria-expanded",
      "false"
    );

  }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHexaHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ========================================
// ESCAPE ATTRIBUTE
// ========================================

function escapeHexaAttribute(
  value
) {

  return escapeHexaHTML(
    value
  );

}


// ========================================
// GLOBAL HEADER API
// ========================================

window.closeHexaNavigation =
  closeHexaNavigation;


console.log(
  "HEXA Header Script Loaded"
);
