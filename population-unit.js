"use strict";

// =====================================================
// HEXA - POPULATION UNIT
// =====================================================


// =====================================================
// API
// =====================================================

const POPULATION_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


// =====================================================
// STATE
// =====================================================

let populationData = [];
let populationEGIData = [];

let populationActiveStatus = "all";
let populationSearchValue = "";
let populationSortValue = "unit-asc";

let populationModalMode = "add";


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  initializePopulationUnit
);


async function initializePopulationUnit() {

  const user =
    getPopulationSessionUser();

  if (!user) {
    return;
  }


  // MASTER ONLY
  if (Number(user.kode) !== 1) {

    alert(
      "You are not authorized to access this page."
    );

    window.location.replace(
      "main.html"
    );

    return;
  }


  initializePopulationBackButton();

  initializePopulationSearch();

  initializePopulationFilters();

  initializePopulationSort();

  initializePopulationAddButton();

  initializePopulationModal();

  initializePopulationRetry();


  await loadPopulationPageData();

}


// =====================================================
// SESSION
// =====================================================

function getPopulationSessionUser() {

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

    redirectPopulationToLogin();

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

      clearPopulationSession();

      redirectPopulationToLogin();

      return null;

    }


    return user;

  } catch (error) {

    console.error(
      "HEXA Population: invalid session.",
      error
    );

    clearPopulationSession();

    redirectPopulationToLogin();

    return null;

  }

}


// =====================================================
// BACK
// =====================================================

function initializePopulationBackButton() {

  const button =
    document.getElementById(
      "populationBackButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      window.location.href =
        "system-settings.html";

    }
  );

}


// =====================================================
// LOAD PAGE DATA
// =====================================================

async function loadPopulationPageData() {

  setPopulationLoadingState();

  try {

    const results =
      await Promise.all([

        populationApiRequest({
          action:
            "getUnitPopulation"
        }),

        populationApiRequest({
          action:
            "getEGIList"
        })

      ]);


    const populationResult =
      results[0];

    const egiResult =
      results[1];


    if (
      !populationResult ||
      populationResult.success !== true
    ) {

      throw new Error(
        populationResult?.message ||
        "Unable to load Population."
      );

    }


    if (
      !egiResult ||
      egiResult.success !== true
    ) {

      throw new Error(
        egiResult?.message ||
        "Unable to load EGI."
      );

    }


    populationData =
      Array.isArray(
        populationResult.units
      )
        ? populationResult.units
        : [];


    populationEGIData =
      Array.isArray(
        egiResult.egiList
      )
        ? egiResult.egiList
        : [];


    populateEGIDatalist();

    renderPopulationList();


  } catch (error) {

    console.error(
      "HEXA Population load error:",
      error
    );

    setPopulationErrorState(
      error.message ||
      "Unable to load Population."
    );

  }

}


// =====================================================
// API REQUEST
// =====================================================

async function populationApiRequest(
  payload
) {

  const response =
    await fetch(
      POPULATION_API_URL,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );


  if (!response.ok) {

    throw new Error(
      "HTTP " +
      response.status
    );

  }


  return await response.json();

}


// =====================================================
// SEARCH
// =====================================================

function initializePopulationSearch() {

  const input =
    document.getElementById(
      "populationSearchInput"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    function () {

      populationSearchValue =
        cleanPopulationValue(
          input.value
        ).toLowerCase();


      renderPopulationList();

    }
  );

}


// =====================================================
// FILTERS
// =====================================================

function initializePopulationFilters() {

  const buttons =
    document.querySelectorAll(
      "[data-population-status]"
    );


  buttons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function () {

          populationActiveStatus =
            button.dataset.populationStatus ||
            "all";


          buttons.forEach(
            function(item) {

              item.classList.remove(
                "active"
              );

            }
          );


          button.classList.add(
            "active"
          );


          renderPopulationList();

        }
      );

    }
  );

}



// =====================================================
// SORT
// HANYA MENGURUTKAN DATA DI FRONTEND.
// TIDAK MENULIS / MENGUBAH URUTAN DATABASE.
// =====================================================

function initializePopulationSort() {

  const select =
    document.getElementById(
      "populationSortSelect"
    );

  if (!select) {
    return;
  }

  select.value =
    populationSortValue;

  select.addEventListener(
    "change",
    function () {

      populationSortValue =
        select.value ||
        "unit-asc";

      renderPopulationList();

    }
  );

}


function sortPopulationData(
  units
) {

  const sortedUnits =
    [...units];

  const textCompare =
    function(a, b) {

      return cleanPopulationValue(a)
        .localeCompare(
          cleanPopulationValue(b),
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        );

    };

  const statusOrder = {
    "running": 1,
    "stand by": 2,
    "lay off": 3
  };


  sortedUnits.sort(
    function(a, b) {

      if (
        populationSortValue ===
        "unit-desc"
      ) {

        return textCompare(
          b.unitCode,
          a.unitCode
        );

      }


      if (
        populationSortValue ===
        "egi-asc"
      ) {

        const egiCompare =
          textCompare(
            a.egi,
            b.egi
          );

        return (
          egiCompare ||
          textCompare(
            a.unitCode,
            b.unitCode
          )
        );

      }


      if (
        populationSortValue ===
        "egi-desc"
      ) {

        const egiCompare =
          textCompare(
            b.egi,
            a.egi
          );

        return (
          egiCompare ||
          textCompare(
            a.unitCode,
            b.unitCode
          )
        );

      }


      if (
        populationSortValue ===
        "status"
      ) {

        const statusA =
          cleanPopulationValue(
            a.status
          ).toLowerCase();

        const statusB =
          cleanPopulationValue(
            b.status
          ).toLowerCase();

        const statusCompare =
          (statusOrder[statusA] || 99) -
          (statusOrder[statusB] || 99);

        return (
          statusCompare ||
          textCompare(
            a.unitCode,
            b.unitCode
          )
        );

      }


      return textCompare(
        a.unitCode,
        b.unitCode
      );

    }
  );


  return sortedUnits;

}


// =====================================================
// FILTERED DATA
// =====================================================

function getFilteredPopulationData() {

  return populationData.filter(
    function(unit) {

      const unitCode =
        cleanPopulationValue(
          unit.unitCode
        );

      const egi =
        cleanPopulationValue(
          unit.egi
        );

      const status =
        cleanPopulationValue(
          unit.status
        );


      const matchesStatus =
        populationActiveStatus === "all" ||
        status.toLowerCase() ===
        populationActiveStatus.toLowerCase();


      const searchSource =
        (
          unitCode +
          " " +
          egi
        ).toLowerCase();


      const matchesSearch =
        !populationSearchValue ||
        searchSource.includes(
          populationSearchValue
        );


      return (
        matchesStatus &&
        matchesSearch
      );

    }
  );

}


// =====================================================
// RENDER LIST
// =====================================================

function renderPopulationList() {

  const list =
    document.getElementById(
      "populationList"
    );

  const count =
    document.getElementById(
      "populationResultCount"
    );

  const loadingState =
    document.getElementById(
      "populationLoadingState"
    );

  const errorState =
    document.getElementById(
      "populationErrorState"
    );

  const emptyState =
    document.getElementById(
      "populationEmptyState"
    );


  if (!list) {
    return;
  }


  if (loadingState) {
    loadingState.hidden = true;
  }

  if (errorState) {
    errorState.hidden = true;
  }


  const units =
    sortPopulationData(
      getFilteredPopulationData()
    );


  if (count) {

    count.textContent =
      `${units.length} ${
        units.length === 1
          ? "Unit"
          : "Units"
      }`;

  }


  list.innerHTML = "";


  if (!units.length) {

    if (emptyState) {
      emptyState.hidden = false;
    }

    return;

  }


  if (emptyState) {
    emptyState.hidden = true;
  }


  units.forEach(
    function(unit) {

      list.appendChild(
        createPopulationCard(
          unit
        )
      );

    }
  );

}


// =====================================================
// CREATE CARD
// =====================================================

function createPopulationCard(
  unit
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "population-card";


  // ---------------------------------------------------
  // ICON
  // ---------------------------------------------------

  const icon =
    document.createElement(
      "span"
    );

  icon.className =
    "population-card-icon";

  icon.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="
        M4 15
        V10
        L7 6
        H17
        L20 10
        V15
      "></path>

      <path d="
        M3 15
        H21
        V18
        H3
        Z
      "></path>

      <circle
        cx="7"
        cy="18"
        r="2"
      ></circle>

      <circle
        cx="17"
        cy="18"
        r="2"
      ></circle>
    </svg>
  `;


  // ---------------------------------------------------
  // CONTENT
  // ---------------------------------------------------

  const content =
    document.createElement(
      "div"
    );

  content.className =
    "population-card-content";


  const unitCode =
    document.createElement(
      "h3"
    );

  unitCode.className =
    "population-card-unit";

  unitCode.textContent =
    cleanPopulationValue(
      unit.unitCode
    ) || "-";


  const meta =
    document.createElement(
      "div"
    );

  meta.className =
    "population-card-meta";

  meta.textContent =
    cleanPopulationValue(
      unit.egi
    ) || "-";


  const status =
    createPopulationStatus(
      unit.status
    );


  content.appendChild(
    unitCode
  );

  content.appendChild(
    meta
  );

  content.appendChild(
    status
  );


  // ---------------------------------------------------
  // EDIT
  // ---------------------------------------------------

  const editButton =
    document.createElement(
      "button"
    );

  editButton.type =
    "button";

  editButton.className =
    "population-edit-button";

  editButton.setAttribute(
    "aria-label",
    "Edit " +
    (
      cleanPopulationValue(
        unit.unitCode
      ) || "Unit"
    )
  );


  editButton.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path
        d="M4 20h4l11-11-4-4L4 16z"
      ></path>

      <path
        d="M13.5 6.5l4 4"
      ></path>
    </svg>
  `;


  editButton.addEventListener(
    "click",
    function () {

      openPopulationEditModal(
        unit
      );

    }
  );


  card.appendChild(
    icon
  );

  card.appendChild(
    content
  );

  card.appendChild(
    editButton
  );


  return card;

}


// =====================================================
// STATUS
// =====================================================

function createPopulationStatus(
  statusValue
) {

  const status =
    cleanPopulationValue(
      statusValue
    );


  const element =
    document.createElement(
      "div"
    );


  element.className =
    "population-status " +
    getPopulationStatusClass(
      status
    );


  const dot =
    document.createElement(
      "span"
    );

  dot.className =
    "population-status-dot";


  const text =
    document.createElement(
      "span"
    );

  text.textContent =
    status || "-";


  element.appendChild(
    dot
  );

  element.appendChild(
    text
  );


  return element;

}


function getPopulationStatusClass(
  status
) {

  const normalized =
    cleanPopulationValue(
      status
    ).toLowerCase();


  if (normalized === "running") {
    return "running";
  }

  if (normalized === "stand by") {
    return "stand-by";
  }

  if (normalized === "lay off") {
    return "lay-off";
  }


  return "";

}


// =====================================================
// EGI DATALIST
// =====================================================

function populateEGIDatalist() {

  const datalist =
    document.getElementById(
      "populationEGIList"
    );


  if (!datalist) {
    return;
  }


  datalist.innerHTML = "";


  populationEGIData.forEach(
    function(item) {

      const egi =
        cleanPopulationValue(
          item.egi
        );


      if (!egi) {
        return;
      }


      const option =
        document.createElement(
          "option"
        );

      option.value =
        egi;


      datalist.appendChild(
        option
      );

    }
  );

}


// =====================================================
// ADD BUTTON
// =====================================================

function initializePopulationAddButton() {

  const button =
    document.getElementById(
      "populationAddButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    openPopulationAddModal
  );

}


// =====================================================
// MODAL INITIALIZE
// =====================================================

function initializePopulationModal() {

  const closeButton =
    document.getElementById(
      "populationModalCloseButton"
    );

  const cancelButton =
    document.getElementById(
      "populationCancelButton"
    );

  const backdrop =
    document.querySelector(
      "[data-close-population-modal]"
    );

  const form =
    document.getElementById(
      "populationForm"
    );


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closePopulationModal
    );

  }


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      closePopulationModal
    );

  }


  if (backdrop) {

    backdrop.addEventListener(
      "click",
      closePopulationModal
    );

  }


  if (form) {

    form.addEventListener(
      "submit",
      handlePopulationFormSubmit
    );

  }


  document.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key === "Escape"
      ) {

        closePopulationModal();

      }

    }
  );

}


// =====================================================
// OPEN ADD
// =====================================================

function openPopulationAddModal() {

  populationModalMode =
    "add";


  const form =
    document.getElementById(
      "populationForm"
    );


  if (form) {
    form.reset();
  }


  setPopulationInputValue(
    "populationUniqId",
    ""
  );


  setPopulationModalText(
    "Add Unit",
    "Add a new unit to HEXA population",
    "Save Unit"
  );


  clearPopulationFormMessage();

  showPopulationModal();

}


// =====================================================
// OPEN EDIT
// =====================================================

function openPopulationEditModal(
  unit
) {

  populationModalMode =
    "edit";


  setPopulationInputValue(
    "populationUniqId",
    unit.uniqId
  );

  setPopulationInputValue(
    "populationUnitCode",
    unit.unitCode
  );

  setPopulationInputValue(
    "populationEGI",
    unit.egi
  );

  setPopulationInputValue(
    "populationStatus",
    unit.status
  );


  setPopulationModalText(
    "Edit Unit",
    "Update unit population information",
    "Save Changes"
  );


  clearPopulationFormMessage();

  showPopulationModal();

}


// =====================================================
// SHOW / CLOSE MODAL
// =====================================================

function showPopulationModal() {

  const modal =
    document.getElementById(
      "populationModal"
    );


  if (!modal) {
    return;
  }


  modal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  window.setTimeout(
    function() {

      const input =
        document.getElementById(
          "populationUnitCode"
        );

      if (input) {
        input.focus();
      }

    },
    50
  );

}


function closePopulationModal() {

  const modal =
    document.getElementById(
      "populationModal"
    );


  if (!modal) {
    return;
  }


  modal.hidden =
    true;


  document.body.style.overflow =
    "";


  clearPopulationFormMessage();

}


// =====================================================
// MODAL TEXT
// =====================================================

function setPopulationModalText(
  title,
  subtitle,
  buttonText
) {

  const titleElement =
    document.getElementById(
      "populationModalTitle"
    );

  const subtitleElement =
    document.getElementById(
      "populationModalSubtitle"
    );

  const buttonTextElement =
    document.getElementById(
      "populationSaveButtonText"
    );


  if (titleElement) {
    titleElement.textContent =
      title;
  }


  if (subtitleElement) {
    subtitleElement.textContent =
      subtitle;
  }


  if (buttonTextElement) {
    buttonTextElement.textContent =
      buttonText;
  }

}


// =====================================================
// FORM SUBMIT
// =====================================================

async function handlePopulationFormSubmit(
  event
) {

  event.preventDefault();


  const uniqId =
    getPopulationInputValue(
      "populationUniqId"
    );

  const unitCode =
    getPopulationInputValue(
      "populationUnitCode"
    );

  const egi =
    getPopulationInputValue(
      "populationEGI"
    );

  const status =
    getPopulationInputValue(
      "populationStatus"
    );


  if (!unitCode) {

    showPopulationFormMessage(
      "Unit Code wajib diisi."
    );

    return;

  }


  if (!egi) {

    showPopulationFormMessage(
      "EGI wajib diisi."
    );

    return;

  }


  if (!status) {

    showPopulationFormMessage(
      "Operational Status wajib dipilih."
    );

    return;

  }


  if (
    populationModalMode === "edit" &&
    !uniqId
  ) {

    showPopulationFormMessage(
      "UNIQ ID Population tidak ditemukan."
    );

    return;

  }


  setPopulationSavingState(
    true
  );

  clearPopulationFormMessage();


  try {

    const action =
      populationModalMode === "edit"
        ? "updateUnitPopulation"
        : "addUnitPopulation";


    const result =
      await populationApiRequest({

        action:
          action,

        uniqId:
          uniqId,

        unitCode:
          unitCode,

        egi:
          egi,

        status:
          status

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Unable to save Unit."
      );

    }


    closePopulationModal();


    await loadPopulationPageData();


  } catch (error) {

    console.error(
      "HEXA Population save error:",
      error
    );


    showPopulationFormMessage(
      error.message ||
      "Unable to save Unit."
    );

  } finally {

    setPopulationSavingState(
      false
    );

  }

}


// =====================================================
// SAVING STATE
// =====================================================

function setPopulationSavingState(
  saving
) {

  const button =
    document.getElementById(
      "populationSaveButton"
    );

  const buttonText =
    document.getElementById(
      "populationSaveButtonText"
    );


  if (button) {

    button.disabled =
      Boolean(saving);

  }


  if (buttonText) {

    if (saving) {

      buttonText.textContent =
        "Saving...";

    } else {

      buttonText.textContent =
        populationModalMode === "edit"
          ? "Save Changes"
          : "Save Unit";

    }

  }

}


// =====================================================
// FORM MESSAGE
// =====================================================

function showPopulationFormMessage(
  message
) {

  const element =
    document.getElementById(
      "populationFormMessage"
    );


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.hidden =
    false;

}


function clearPopulationFormMessage() {

  const element =
    document.getElementById(
      "populationFormMessage"
    );


  if (!element) {
    return;
  }


  element.textContent =
    "";


  element.hidden =
    true;

}


// =====================================================
// INPUT HELPERS
// =====================================================

function setPopulationInputValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.value =
    cleanPopulationValue(
      value
    );

}


function getPopulationInputValue(
  id
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return "";
  }


  return cleanPopulationValue(
    element.value
  );

}


// =====================================================
// PAGE STATES
// =====================================================

function setPopulationLoadingState() {

  const loading =
    document.getElementById(
      "populationLoadingState"
    );

  const error =
    document.getElementById(
      "populationErrorState"
    );

  const empty =
    document.getElementById(
      "populationEmptyState"
    );

  const list =
    document.getElementById(
      "populationList"
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

}


function setPopulationErrorState(
  message
) {

  const loading =
    document.getElementById(
      "populationLoadingState"
    );

  const error =
    document.getElementById(
      "populationErrorState"
    );

  const empty =
    document.getElementById(
      "populationEmptyState"
    );

  const errorMessage =
    document.getElementById(
      "populationErrorMessage"
    );

  const list =
    document.getElementById(
      "populationList"
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
      "Please try again.";

  }


  if (error) {
    error.hidden = false;
  }

}


// =====================================================
// RETRY
// =====================================================

function initializePopulationRetry() {

  const button =
    document.getElementById(
      "populationRetryButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    loadPopulationPageData
  );

}


// =====================================================
// CLEAN VALUE
// =====================================================

function cleanPopulationValue(
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
// SESSION HELPERS
// =====================================================

function clearPopulationSession() {

  sessionStorage.removeItem(
    "hexaLoggedIn"
  );

  sessionStorage.removeItem(
    "hexaUser"
  );

}


function redirectPopulationToLogin() {

  window.location.replace(
    "index.html"
  );

}


// =====================================================
// MANAGE EGI - STAGE 1
// Load & display EGI master + Equipment Type
// Existing Population Unit logic is intentionally untouched.
// =====================================================

let egiManagerData = [];
let equipmentTypeMasterData = [];
let egiFormMode = "add";

document.addEventListener(
  "DOMContentLoaded",
  function() {
    initializeEGIManager();
  }
);


function initializeEGIManager() {

  const manageButton =
    document.getElementById(
      "populationManageEGIButton"
    );

  const managerClose =
    document.getElementById(
      "egiManagerCloseButton"
    );

  const managerBackdrop =
    document.querySelector(
      "[data-close-egi-manager]"
    );

  const addButton =
    document.getElementById(
      "egiAddButton"
    );

  const formClose =
    document.getElementById(
      "egiFormCloseButton"
    );

  const formCancel =
    document.getElementById(
      "egiFormCancelButton"
    );

  const formBackdrop =
    document.querySelector(
      "[data-close-egi-form]"
    );

  const form =
    document.getElementById(
      "egiForm"
    );


  if (manageButton) {
    manageButton.addEventListener(
      "click",
      openEGIManager
    );
  }

  if (managerClose) {
    managerClose.addEventListener(
      "click",
      closeEGIManager
    );
  }

  if (managerBackdrop) {
    managerBackdrop.addEventListener(
      "click",
      closeEGIManager
    );
  }

  if (addButton) {
    addButton.addEventListener(
      "click",
      openAddEGIForm
    );
  }

  if (formClose) {
    formClose.addEventListener(
      "click",
      closeEGIForm
    );
  }

  if (formCancel) {
    formCancel.addEventListener(
      "click",
      closeEGIForm
    );
  }

  if (formBackdrop) {
    formBackdrop.addEventListener(
      "click",
      closeEGIForm
    );
  }

  if (form) {
    form.addEventListener(
      "submit",
      handleEGIFormSubmit
    );
  }
}


async function openEGIManager() {

  const modal =
    document.getElementById(
      "egiManagerModal"
    );

  if (!modal) {
    return;
  }

  modal.hidden = false;
  document.body.style.overflow =
    "hidden";

  renderEGIManagerLoading();

  try {

    await Promise.all([
      loadEGIManagerData(),
      loadEquipmentTypeMaster()
    ]);

    renderEGIManagerList();

  } catch (error) {

    renderEGIManagerError(
      error &&
      error.message
        ? error.message
        : "Unable to load EGI data."
    );

  }
}


function closeEGIManager() {

  const modal =
    document.getElementById(
      "egiManagerModal"
    );

  if (modal) {
    modal.hidden = true;
  }

  document.body.style.overflow = "";
}


async function loadEGIManagerData() {

  const result =
    await populationApiRequest({
      action: "getEGIList"
    });

  if (
    !result ||
    result.success !== true
  ) {
    throw new Error(
      result && result.message
        ? result.message
        : "Unable to load EGI list."
    );
  }

  egiManagerData =
    Array.isArray(result.egiList)
      ? result.egiList
      : [];
}


async function loadEquipmentTypeMaster() {

  const result =
    await populationApiRequest({
      action: "getEquipmentTypeList"
    });

  if (
    !result ||
    result.success !== true
  ) {
    throw new Error(
      result && result.message
        ? result.message
        : "Unable to load Equipment Type."
    );
  }

  equipmentTypeMasterData =
    Array.isArray(
      result.equipmentTypes
    )
      ? result.equipmentTypes
      : [];

  populateEquipmentTypeSelect();
}


function populateEquipmentTypeSelect() {

  const select =
    document.getElementById(
      "egiEquipmentType"
    );

  if (!select) {
    return;
  }

  const currentValue =
    select.value;

  select.innerHTML =
    '<option value="">' +
    'Select Equipment Type' +
    '</option>';

  equipmentTypeMasterData.forEach(
    function(type) {

      const value =
        cleanPopulationValue(type);

      if (!value) {
        return;
      }

      const option =
        document.createElement(
          "option"
        );

      option.value = value;
      option.textContent = value;

      select.appendChild(option);
    }
  );

  if (currentValue) {
    select.value = currentValue;
  }
}


function renderEGIManagerLoading() {

  const list =
    document.getElementById(
      "egiManagerList"
    );

  if (!list) {
    return;
  }

  list.innerHTML =
    '<div class="population-state">' +
      '<span>Loading EGI...</span>' +
    '</div>';
}


function renderEGIManagerError(
  message
) {

  const list =
    document.getElementById(
      "egiManagerList"
    );

  if (!list) {
    return;
  }

  list.innerHTML = "";

  const state =
    document.createElement("div");

  state.className =
    "population-state";

  const strong =
    document.createElement("strong");

  strong.textContent =
    "Unable to Load EGI";

  const detail =
    document.createElement("span");

  detail.textContent =
    message || "Please try again.";

  state.appendChild(strong);
  state.appendChild(detail);
  list.appendChild(state);
}


function renderEGIManagerList() {

  const list =
    document.getElementById(
      "egiManagerList"
    );

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!egiManagerData.length) {

    const empty =
      document.createElement("div");

    empty.className =
      "population-state";

    empty.textContent =
      "No EGI data found.";

    list.appendChild(empty);

    return;
  }

  egiManagerData.forEach(
    function(item) {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "population-card";

      const content =
        document.createElement(
          "div"
        );

      content.className =
        "population-card-content";

      const title =
        document.createElement(
          "strong"
        );

      title.textContent =
        cleanPopulationValue(
          item.egi
        ) || "-";

      const type =
        document.createElement(
          "span"
        );

      type.textContent =
        cleanPopulationValue(
          item.type
        ) || "No Equipment Type";

      content.appendChild(title);
      content.appendChild(type);

      const editButton =
        document.createElement(
          "button"
        );

      editButton.type =
        "button";

      editButton.className =
        "population-edit-button";

      editButton.setAttribute(
        "aria-label",
        "Edit " +
        (
          cleanPopulationValue(
            item.egi
          ) || "EGI"
        )
      );

      editButton.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path
            d="M4 20h4l11-11-4-4L4 16z"
          ></path>
          <path
            d="M13.5 6.5l4 4"
          ></path>
        </svg>
      `;

      editButton.addEventListener(
        "click",
        function() {
          openEditEGIForm(item);
        }
      );

      card.appendChild(content);
      card.appendChild(editButton);
      list.appendChild(card);
    }
  );
}


function openAddEGIForm() {

  egiFormMode = "add";

  const form =
    document.getElementById(
      "egiForm"
    );

  if (form) {
    form.reset();
  }

  setEGIFormValue(
    "egiUniqId",
    ""
  );

  setEGIFormText(
    "Add EGI",
    "Add a new EGI to HEXA master data",
    "Save EGI"
  );

  populateEquipmentTypeSelect();
  clearEGIFormMessage();
  showEGIForm();
}


function openEditEGIForm(
  item
) {

  egiFormMode = "edit";

  setEGIFormValue(
    "egiUniqId",
    item.uniqId
  );

  setEGIFormValue(
    "egiName",
    item.egi
  );

  populateEquipmentTypeSelect();

  setEGIFormValue(
    "egiEquipmentType",
    item.type
  );

  setEGIFormText(
    "Edit EGI",
    "Update EGI master information",
    "Save Changes"
  );

  clearEGIFormMessage();
  showEGIForm();
}


function showEGIForm() {

  const modal =
    document.getElementById(
      "egiFormModal"
    );

  if (!modal) {
    return;
  }

  modal.hidden = false;

  window.setTimeout(
    function() {

      const input =
        document.getElementById(
          "egiName"
        );

      if (input) {
        input.focus();
      }

    },
    50
  );
}


function closeEGIForm() {

  const modal =
    document.getElementById(
      "egiFormModal"
    );

  if (modal) {
    modal.hidden = true;
  }

  clearEGIFormMessage();
}


function setEGIFormText(
  title,
  subtitle,
  buttonText
) {

  const titleElement =
    document.getElementById(
      "egiFormTitle"
    );

  const subtitleElement =
    document.getElementById(
      "egiFormSubtitle"
    );

  const buttonElement =
    document.getElementById(
      "egiSaveButtonText"
    );

  if (titleElement) {
    titleElement.textContent =
      title;
  }

  if (subtitleElement) {
    subtitleElement.textContent =
      subtitle;
  }

  if (buttonElement) {
    buttonElement.textContent =
      buttonText;
  }
}


function setEGIFormValue(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.value =
      cleanPopulationValue(value);
  }
}


async function handleEGIFormSubmit(
  event
) {

  event.preventDefault();

  const uniqId =
    getEGIFormValue(
      "egiUniqId"
    );

  const egi =
    getEGIFormValue(
      "egiName"
    );

  const type =
    getEGIFormValue(
      "egiEquipmentType"
    );

  if (!egi) {
    showEGIFormMessage(
      "EGI is required.",
      "error"
    );
    return;
  }

  if (!type) {
    showEGIFormMessage(
      "Equipment Type is required.",
      "error"
    );
    return;
  }

  setEGISaveLoading(true);

  try {

    const payload = {
      action:
        egiFormMode === "edit"
          ? "updateEGI"
          : "addEGI",
      uniqId: uniqId,
      egi: egi,
      type: type
    };

    const result =
      await populationApiRequest(
        payload
      );

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result && result.message
          ? result.message
          : "Unable to save EGI."
      );
    }

    closeEGIForm();

    await Promise.all([
      loadEGIManagerData(),
      loadEquipmentTypeMaster()
    ]);

    renderEGIManagerList();

    // Refresh existing EGI source used by Population Unit.
    if (
      typeof loadPopulationEGIData ===
      "function"
    ) {
      await loadPopulationEGIData();
    }

  } catch (error) {

    showEGIFormMessage(
      error &&
      error.message
        ? error.message
        : "Unable to save EGI.",
      "error"
    );

  } finally {

    setEGISaveLoading(false);

  }
}


function getEGIFormValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? cleanPopulationValue(
        element.value
      )
    : "";
}


function showEGIFormMessage(
  message,
  type
) {

  const element =
    document.getElementById(
      "egiFormMessage"
    );

  if (!element) {
    return;
  }

  element.hidden = false;
  element.textContent = message;

  element.className =
    "population-form-message " +
    (
      type === "error"
        ? "error"
        : "success"
    );
}


function clearEGIFormMessage() {

  const element =
    document.getElementById(
      "egiFormMessage"
    );

  if (!element) {
    return;
  }

  element.hidden = true;
  element.textContent = "";
  element.className =
    "population-form-message";
}


function setEGISaveLoading(
  loading
) {

  const button =
    document.getElementById(
      "egiSaveButton"
    );

  const text =
    document.getElementById(
      "egiSaveButtonText"
    );

  if (button) {
    button.disabled = loading;
  }

  if (text) {
    text.textContent =
      loading
        ? "Saving..."
        : (
            egiFormMode === "edit"
              ? "Save Changes"
              : "Save EGI"
          );
  }
}


