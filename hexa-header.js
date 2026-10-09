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
  // ACTIVE NAVIGATION
  //
  // Jika halaman merupakan sub-page,
  // data-active-nav menentukan menu induk
  // yang tetap ditampilkan ACTIVE.
  //
  // Contoh:
  // Start Inspection
  // -> active nav = Daily Maintenance
  // ======================================

  const activeNav =
    header.dataset.activeNav ||
    currentPage;


  // ======================================
  // BUILD HEADER
  // ======================================

  header.classList.add(
    "main-header"
  );


  header.innerHTML =
    createHexaHeaderHTML(
      headerType,
      currentPage,
      activeNav
    );


  // ======================================
  // START HEADER EVENTS
  // ======================================

  initializeHexaHeaderEvents(
    headerType
  );

  initializeHexaProfileAvatar();


  console.log(
    "HEXA Global Header Ready:",
    {
      type: headerType,
      page: currentPage,
      activeNav: activeNav
    }
  );

}


// ========================================
// CREATE HEADER HTML
// ========================================

function createHexaHeaderHTML(
  headerType,
  currentPage,
  activeNav
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
          currentPage,
          activeNav
        )}

      </nav>

    </div>


    <div class="header-actions">

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

      <button
        type="button"
        id="hexaProfileButton"
        class="hexa-header-profile-button"
        aria-label="Buka My Profile"
        title="My Profile"
      >
        <span class="hexa-header-profile-avatar" id="hexaHeaderProfileAvatar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 21c0-5 3.5-8 8-8s8 3 8 8"></path>
          </svg>
        </span>
      </button>

    </div>
  `;

}


// ========================================
// CREATE NAVIGATION
// ========================================

function createHexaNavigation(
  headerType,
  currentPage,
  activeNav
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
      ${activeNav === "main"
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
        activeNav === menu.id
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

  const profileButton = document.getElementById("hexaProfileButton");
  profileButton?.addEventListener("click", function () {
    window.location.href = "profile.html";
  });


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
// ========================================
// PROFILE AVATAR IN GLOBAL HEADER
// ========================================
function initializeHexaProfileAvatar() {
  if (!document.getElementById("hexaHeaderProfileStyle")) {
    const style = document.createElement("style");
    style.id = "hexaHeaderProfileStyle";
    style.textContent = `
      .header-actions { display:flex; align-items:center; gap:10px; }
      .hexa-header-profile-button {
        appearance:none; flex:0 0 auto; display:inline-flex;
        align-items:center; justify-content:center;
        width:44px; height:44px; padding:3px;
        border:3px solid #f28c28; border-radius:50%;
        background:#fff; cursor:pointer; overflow:hidden;
        box-sizing:border-box; transition:transform .15s ease, box-shadow .15s ease;
      }
      .hexa-header-profile-button:hover { transform:scale(1.05); box-shadow:0 0 0 3px rgba(242,140,40,.16); }
      .hexa-header-profile-button:focus-visible { outline:2px solid #f28c28; outline-offset:3px; }
      .hexa-header-profile-avatar { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#f1f5f9; overflow:hidden; }
      .hexa-header-profile-avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; display:block; }
      .hexa-header-profile-avatar svg { width:22px; height:22px; fill:none; stroke:#64748b; stroke-width:1.8; stroke-linecap:round; }
      @media(max-width:480px) { .header-actions {gap:8px;} .hexa-header-profile-button {width:40px;height:40px;} }
    `;
    document.head.appendChild(style);
  }
  const avatar = document.getElementById("hexaHeaderProfileAvatar");
  if (!avatar) return;
  let user = {};
  try { user = JSON.parse(sessionStorage.getItem("hexaUser") || "{}"); } catch (_) {}
  const raw = String(user.photo || user.PHOTO || user.photoUrl || user.profilePhoto || user.foto || "").trim();
  if (!raw) return;
  const fileMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = (fileMatch && fileMatch[1]) || (idMatch && idMatch[1]);
  const url = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` : raw;
  if (!/^https:\/\//i.test(url) && !/^data:image\//i.test(url)) return;
  const img = document.createElement("img");
  img.alt = "Foto profil";
  img.referrerPolicy = "no-referrer";
  img.style.display = "none";
  img.addEventListener("load", function () {
    img.style.display = "block";
    const placeholder = avatar.querySelector("svg");
    if (placeholder) placeholder.style.display = "none";
  }, {once:true});
  img.addEventListener("error", function () { img.remove(); }, {once:true});
  img.src = url;
  avatar.appendChild(img);
}
