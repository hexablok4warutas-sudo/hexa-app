"use strict";

// ======================================================
// HEXA BACKLOG REGISTRATION FORM
// ======================================================

// ======================================================
// 0. API
// ======================================================

// Gunakan URL deployment Apps Script HEXA yang sama
// dengan modul HEXA lainnya.
const HEXA_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

let backlogCandidates = [];
let backlogUnits = [];

// ======================================================
// 1. SESSION
// ======================================================

const hexaLoggedIn =
  sessionStorage.getItem("hexaLoggedIn");

const hexaUserData =
  sessionStorage.getItem("hexaUser");

if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {
  window.location.replace("index.html");
}

// ======================================================
// 2. CURRENT USER
// ======================================================

let currentUser = null;

try {
  currentUser = JSON.parse(hexaUserData);
} catch (error) {
  sessionStorage.removeItem("hexaLoggedIn");
  sessionStorage.removeItem("hexaUser");
  window.location.replace("index.html");
}

// ======================================================
// 3. ELEMENTS
// ======================================================

const backButton =
  document.getElementById("brfBackButton");

const cancelButton =
  document.getElementById("brfCancelButton");

const saveDraftButton =
  document.getElementById("brfSaveDraftButton");

const addItemButton =
  document.getElementById("brfAddItemButton");

const itemsContainer =
  document.getElementById("brfItemsContainer");

const itemTemplate =
  document.getElementById("brfItemTemplate");

const partTemplate =
  document.getElementById("brfPartTemplate");

const itemCounter =
  document.getElementById("brfItemCounter");

const photoLightbox =
  document.getElementById("brfPhotoLightbox");

const photoLightboxImage =
  document.getElementById("brfPhotoLightboxImage");

const photoLightboxClose =
  document.getElementById("brfPhotoLightboxClose");

// ======================================================
// 4. USER INFORMATION
// ======================================================

function setRegistrationInformation() {
  const createdBy =
    document.getElementById("brfCreatedBy");

  const createdDate =
    document.getElementById("brfCreatedDate");

  if (createdBy) {
    createdBy.textContent =
      currentUser?.nama ||
      currentUser?.name ||
      currentUser?.userId ||
      "-";
  }

  if (createdDate) {
    createdDate.textContent =
      new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      ).format(new Date());
  }
}

// ======================================================
// 5. API - LOAD BACKLOG CANDIDATES
// ======================================================

async function loadBacklogCandidates() {
  try {
    setUnitSelectLoading(true);

    const response = await fetch(
      HEXA_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          action: "getBacklogRegistrationCandidates",
          registrationId: backlogRegistrationId
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }

    const result = await response.json();

    if (!result || result.success !== true) {
      throw new Error(
        result?.message ||
        "Gagal mengambil kandidat Registrasi Backlog."
      );
    }

    backlogCandidates =
      Array.isArray(result.data)
        ? result.data
        : [];

    backlogUnits =
      Array.isArray(result.units)
        ? result.units
        : [];

    refreshAllUnitSelects();

    console.log(
      "HEXA: Backlog candidates loaded",
      backlogCandidates.length
    );

  } catch (error) {
    console.error(
      "HEXA: Failed to load backlog candidates",
      error
    );

    backlogCandidates = [];
    backlogUnits = [];

    refreshAllUnitSelects(
      "Unable to load Unit Code"
    );
  } finally {
    setUnitSelectLoading(false);
  }
}

function setUnitSelectLoading(isLoading) {
  if (!itemsContainer) {
    return;
  }

  const selects =
    itemsContainer.querySelectorAll(
      ".brf-unit-select"
    );

  selects.forEach(function(select) {
    if (isLoading) {
      select.disabled = true;
      select.innerHTML =
        '<option value="">Loading Unit...</option>';
    } else {
      select.disabled = false;
    }
  });
}

function getUniqueUnitsFromCandidates() {
  const unitMap = {};

  backlogCandidates.forEach(function(item) {
    const unitCode =
      cleanText(item.unitCode);

    if (!unitCode) {
      return;
    }

    const key =
      unitCode.toLowerCase();

    if (!unitMap[key]) {
      unitMap[key] = unitCode;
    }
  });

  return Object.keys(unitMap)
    .map(function(key) {
      return {
        unitCode: unitMap[key]
      };
    })
    .sort(function(a, b) {
      return a.unitCode.localeCompare(
        b.unitCode,
        undefined,
        {
          numeric: true,
          sensitivity: "base"
        }
      );
    });
}

function getAvailableUnitsForItem(itemCard) {
  const currentSelect =
    itemCard.querySelector(
      ".brf-unit-select"
    );

  const currentUnit =
    cleanText(
      currentSelect?.value
    );

  const usedInspectionIds =
    getSelectedInspectionIds(
      itemCard
    );

  const availableCandidates =
    backlogCandidates.filter(
      function(candidate) {
        const inspectionId =
          cleanText(
            candidate.inspectionId
          );

        if (
          inspectionId &&
          usedInspectionIds.has(
            inspectionId
          )
        ) {
          return false;
        }

        return true;
      }
    );

  const map = {};

  availableCandidates.forEach(
    function(candidate) {
      const unitCode =
        cleanText(
          candidate.unitCode
        );

      if (!unitCode) {
        return;
      }

      map[
        unitCode.toLowerCase()
      ] = unitCode;
    }
  );

  if (currentUnit) {
    map[
      currentUnit.toLowerCase()
    ] = currentUnit;
  }

  return Object.keys(map)
    .map(function(key) {
      return {
        unitCode: map[key]
      };
    })
    .sort(function(a, b) {
      return a.unitCode.localeCompare(
        b.unitCode,
        undefined,
        {
          numeric: true,
          sensitivity: "base"
        }
      );
    });
}

function populateUnitSelect(
  itemCard,
  errorText
) {
  if (!itemCard) {
    return;
  }

  const select =
    itemCard.querySelector(
      ".brf-unit-select"
    );

  if (!select) {
    return;
  }

  const previousValue =
    cleanText(select.value);

  select.innerHTML = "";

  const placeholder =
    document.createElement(
      "option"
    );

  placeholder.value = "";
  placeholder.textContent =
    errorText ||
    (
      backlogCandidates.length
        ? "Select Unit"
        : "No Unit Available"
    );

  select.appendChild(
    placeholder
  );

  if (errorText) {
    select.disabled = true;
    return;
  }

  const units =
    getAvailableUnitsForItem(
      itemCard
    );

  units.forEach(function(item) {
    const option =
      document.createElement(
        "option"
      );

    option.value =
      item.unitCode;

    option.textContent =
      item.unitCode;

    select.appendChild(
      option
    );
  });

  select.disabled = false;

  const stillAvailable =
    Array.from(select.options)
      .some(function(option) {
        return (
          option.value ===
          previousValue
        );
      });

  if (
    previousValue &&
    stillAvailable
  ) {
    select.value =
      previousValue;
  }
}

function refreshAllUnitSelects(
  errorText
) {
  if (!itemsContainer) {
    return;
  }

  const items =
    itemsContainer.querySelectorAll(
      ".brf-item-card"
    );

  items.forEach(function(itemCard) {
    populateUnitSelect(
      itemCard,
      errorText
    );
  });
}

// ======================================================
// 6. ADD ITEM
// ======================================================

function addRegistrationItem() {
  if (
    !itemsContainer ||
    !itemTemplate
  ) {
    return;
  }

  const fragment =
    itemTemplate.content.cloneNode(
      true
    );

  const itemCard =
    fragment.querySelector(
      ".brf-item-card"
    );

  setupItemEvents(
    itemCard
  );

  itemsContainer.appendChild(
    fragment
  );

  const addedItems =
    itemsContainer.querySelectorAll(
      ".brf-item-card"
    );

  const newItem =
    addedItems[
      addedItems.length - 1
    ];

  if (newItem) {
    addPartRow(
      newItem
    );

    if (backlogCandidates.length) {
      populateUnitSelect(
        newItem
      );
    }
  }

  updateItemNumbers();
}

// ======================================================
// 7. SETUP ITEM
// ======================================================

function setupItemEvents(itemCard) {
  if (!itemCard) {
    return;
  }

  const removeButton =
    itemCard.querySelector(
      ".brf-remove-item"
    );

  const addPartButton =
    itemCard.querySelector(
      ".brf-add-part-button"
    );

  const photoInput =
    itemCard.querySelector(
      ".brf-photo-input"
    );

  const unitSelect =
    itemCard.querySelector(
      ".brf-unit-select"
    );

  const problemSelect =
    itemCard.querySelector(
      ".brf-problem-select"
    );

  if (removeButton) {
    removeButton.addEventListener(
      "click",
      function() {
        const totalItems =
          itemsContainer.querySelectorAll(
            ".brf-item-card"
          ).length;

        if (totalItems <= 1) {
          return;
        }

        itemCard.remove();

        updateItemNumbers();
        refreshAllUnitSelects();
      }
    );
  }

  if (addPartButton) {
    addPartButton.addEventListener(
      "click",
      function() {
        addPartRow(
          itemCard
        );
      }
    );
  }

  if (photoInput) {
    photoInput.addEventListener(
      "change",
      function() {
        renderPhotoPreview(
          itemCard,
          photoInput.files
        );
      }
    );
  }

  if (unitSelect) {
    unitSelect.addEventListener(
      "change",
      function() {
        resetSelectedFinding(
          itemCard,
          false
        );

        populateProblemSelect(
          itemCard,
          unitSelect.value
        );

        refreshAllUnitSelects();
      }
    );
  }

  if (problemSelect) {
    problemSelect.addEventListener(
      "change",
      function() {
        const inspectionId =
          cleanText(
            problemSelect.value
          );

        if (!inspectionId) {
          resetSelectedFinding(
            itemCard,
            true
          );

          refreshAllUnitSelects();
          return;
        }

        const candidate =
          backlogCandidates.find(
            function(item) {
              return (
                cleanText(
                  item.inspectionId
                ) === inspectionId
              );
            }
          );

        if (!candidate) {
          resetSelectedFinding(
            itemCard,
            true
          );

          refreshAllUnitSelects();
          return;
        }

        applyCandidateToItem(
          itemCard,
          candidate
        );

        refreshAllUnitSelects();
      }
    );
  }
}

// ======================================================
// 8. UNIT -> PROBLEM
// ======================================================

function populateProblemSelect(
  itemCard,
  unitCode
) {
  const select =
    itemCard.querySelector(
      ".brf-problem-select"
    );

  if (!select) {
    return;
  }

  select.innerHTML =
    '<option value="">Select Problem</option>';

  const normalizedUnit =
    cleanText(
      unitCode
    ).toLowerCase();

  if (!normalizedUnit) {
    select.disabled = true;
    return;
  }

  const usedInspectionIds =
    getSelectedInspectionIds(
      itemCard
    );

  const findings =
    backlogCandidates
      .filter(function(item) {
        const itemUnit =
          cleanText(
            item.unitCode
          ).toLowerCase();

        const inspectionId =
          cleanText(
            item.inspectionId
          );

        return (
          itemUnit ===
            normalizedUnit &&
          !usedInspectionIds.has(
            inspectionId
          )
        );
      })
      .sort(function(a, b) {
        return String(
          b.inspectionDate || ""
        ).localeCompare(
          String(
            a.inspectionDate || ""
          )
        );
      });

  findings.forEach(
    function(item) {
      const option =
        document.createElement(
          "option"
        );

      /*
        Value = Inspection ID.
        Bukan Problem Description.

        Ini penting karena satu Unit
        dapat memiliki Problem Description
        yang sama pada Inspection ID berbeda.
      */
      option.value =
        cleanText(
          item.inspectionId
        );

      const problem =
        cleanText(
          item.problemDescription
        ) || "No Problem Description";

      const date =
        formatDisplayDate(
          item.inspectionDate
        );

      const id =
        cleanText(
          item.inspectionId
        );

      option.textContent =
        problem +
        (date ? " • " + date : "") +
        (id ? " • " + id : "");

      select.appendChild(
        option
      );
    }
  );

  select.disabled =
    findings.length === 0;

  if (!findings.length) {
    select.innerHTML =
      '<option value="">No Problem Available</option>';
  }
}

// ======================================================
// 9. APPLY SELECTED FINDING
// ======================================================

function applyCandidateToItem(
  itemCard,
  candidate
) {
  if (
    !itemCard ||
    !candidate
  ) {
    return;
  }

  itemCard.dataset.inspectionId =
    cleanText(
      candidate.inspectionId
    );

  setText(
    itemCard,
    ".brf-inspection-id",
    candidate.inspectionId
  );

  setText(
    itemCard,
    ".brf-group-component",
    candidate.groupComponent
  );

  setText(
    itemCard,
    ".brf-rating",
    candidate.rating
  );

  setText(
    itemCard,
    ".brf-inspection-date",
    formatDisplayDate(
      candidate.inspectionDate
    )
  );

  renderInspectionPhoto(
    itemCard,
    candidate.photo
  );

  renderCandidateParts(
    itemCard,
    candidate.parts
  );
}

function resetSelectedFinding(
  itemCard,
  keepProblemOptions
) {
  if (!itemCard) {
    return;
  }

  itemCard.dataset.inspectionId =
    "";

  setText(
    itemCard,
    ".brf-inspection-id",
    "-"
  );

  setText(
    itemCard,
    ".brf-group-component",
    "-"
  );

  setText(
    itemCard,
    ".brf-rating",
    "-"
  );

  setText(
    itemCard,
    ".brf-inspection-date",
    "-"
  );

  renderInspectionPhoto(
    itemCard,
    ""
  );

  resetPartsToSingleBlankRow(
    itemCard
  );

  if (!keepProblemOptions) {
    const problemSelect =
      itemCard.querySelector(
        ".brf-problem-select"
      );

    if (problemSelect) {
      problemSelect.innerHTML =
        '<option value="">Select Problem</option>';

      problemSelect.disabled =
        true;
    }
  }
}

// ======================================================
// 10. INSPECTION PHOTO
// ======================================================

function renderInspectionPhoto(
  itemCard,
  photoUrl
) {
  const container =
    itemCard.querySelector(
      ".brf-inspection-photo"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const url =
    cleanText(
      photoUrl
    );

  if (!url) {
    const span =
      document.createElement(
        "span"
      );

    span.textContent =
      "No inspection photo";

    container.appendChild(
      span
    );

    return;
  }

  const image =
    document.createElement(
      "img"
    );

  image.alt =
    "Inspection photo";

  image.loading =
    "lazy";

  image.src =
    normalizeDriveImageUrl(
      url
    );

  image.addEventListener(
    "error",
    function() {
      container.innerHTML = "";

      const link =
        document.createElement(
          "a"
        );

      link.href = url;
      link.target = "_blank";
      link.rel =
        "noopener noreferrer";

      link.textContent =
        "Open inspection photo";

      container.appendChild(
        link
      );
    }
  );

  container.appendChild(
    image
  );
}

function normalizeDriveImageUrl(
  url
) {
  const text =
    cleanText(url);

  if (!text) {
    return "";
  }

  const fileMatch =
    text.match(
      /\/file\/d\/([^/]+)/
    );

  if (fileMatch) {
    return (
      "https://drive.google.com/thumbnail?id=" +
      encodeURIComponent(
        fileMatch[1]
      ) +
      "&sz=w1000"
    );
  }

  const idMatch =
    text.match(
      /[?&]id=([^&]+)/
    );

  if (idMatch) {
    return (
      "https://drive.google.com/thumbnail?id=" +
      encodeURIComponent(
        idMatch[1]
      ) +
      "&sz=w1000"
    );
  }

  return text;
}

// ======================================================
// 11. PARTS FROM INSPECTION
// ======================================================

function renderCandidateParts(
  itemCard,
  parts
) {
  const container =
    itemCard.querySelector(
      ".brf-parts-container"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const list =
    Array.isArray(parts)
      ? parts
      : [];

  if (!list.length) {
    addPartRow(
      itemCard
    );
    return;
  }

  list.forEach(function(part) {
    addPartRow(
      itemCard,
      part
    );
  });
}

function resetPartsToSingleBlankRow(
  itemCard
) {
  const container =
    itemCard.querySelector(
      ".brf-parts-container"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  addPartRow(
    itemCard
  );
}

// ======================================================
// 12. ADD PART
// ======================================================

function addPartRow(
  itemCard,
  partData
) {
  if (
    !itemCard ||
    !partTemplate
  ) {
    return;
  }

  const partsContainer =
    itemCard.querySelector(
      ".brf-parts-container"
    );

  if (!partsContainer) {
    return;
  }

  const fragment =
    partTemplate.content.cloneNode(
      true
    );

  const partRow =
    fragment.querySelector(
      ".brf-part-row"
    );

  const removeButton =
    partRow.querySelector(
      ".brf-remove-part"
    );

  const partName =
    partRow.querySelector(
      ".brf-part-name"
    );

  const partNo =
    partRow.querySelector(
      ".brf-part-no"
    );

  const quantity =
    partRow.querySelector(
      ".brf-part-qty"
    );

  if (partData) {
    if (partName) {
      partName.value =
        cleanText(
          partData.partName
        );
    }

    if (partNo) {
      partNo.value =
        cleanText(
          partData.partNo
        );
    }

    if (quantity) {
      const qty =
        Number(
          partData.quantity
        );

      quantity.value =
        Number.isFinite(qty) &&
        qty > 0
          ? qty
          : 1;
    }
  }

  if (removeButton) {
    removeButton.addEventListener(
      "click",
      function() {
        partRow.remove();
      }
    );
  }

  partsContainer.appendChild(
    fragment
  );
}

// ======================================================
// 13. DUPLICATE INSPECTION PROTECTION
// ======================================================

function getSelectedInspectionIds(
  exceptItemCard
) {
  const selected =
    new Set();

  if (!itemsContainer) {
    return selected;
  }

  const items =
    itemsContainer.querySelectorAll(
      ".brf-item-card"
    );

  items.forEach(function(itemCard) {
    if (
      itemCard ===
      exceptItemCard
    ) {
      return;
    }

    const id =
      cleanText(
        itemCard.dataset
          .inspectionId
      );

    if (id) {
      selected.add(id);
    }
  });

  return selected;
}

// ======================================================
// 14. ITEM NUMBER
// ======================================================

function updateItemNumbers() {
  const items =
    itemsContainer
      ? itemsContainer.querySelectorAll(
          ".brf-item-card"
        )
      : [];

  items.forEach(
    function(item, index) {
      const number =
        item.querySelector(
          ".brf-item-number"
        );

      if (number) {
        number.textContent =
          "ITEM " +
          (index + 1);
      }
    }
  );

  if (itemCounter) {
    itemCounter.textContent =
      items.length +
      (
        items.length === 1
          ? " Item"
          : " Items"
      );
  }
}

// ======================================================
// 15. ADDITIONAL PHOTO PREVIEW
// ======================================================

function renderPhotoPreview(
  itemCard,
  files
) {
  const preview =
    itemCard.querySelector(
      ".brf-photo-preview"
    );

  if (!preview) {
    return;
  }

  preview.innerHTML = "";

  Array.from(
    files || []
  ).forEach(
    function(file) {
      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        function(event) {
          const wrapper =
            document.createElement(
              "div"
            );

          wrapper.className =
            "brf-photo-preview-item";

          const image =
            document.createElement(
              "img"
            );

          image.src =
            event.target.result;

          image.alt =
            "Registration evidence";

          wrapper.appendChild(
            image
          );

          preview.appendChild(
            wrapper
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}

// ======================================================
// 16. PHOTO LIGHTBOX
// ======================================================

function openPhotoLightbox(imageSource) {
  const src = cleanText(imageSource);

  if (
    !src ||
    !photoLightbox ||
    !photoLightboxImage
  ) {
    return;
  }

  photoLightboxImage.src = src;

  photoLightbox.classList.add(
    "is-open"
  );

  photoLightbox.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}

function closePhotoLightbox() {
  if (!photoLightbox) {
    return;
  }

  photoLightbox.classList.remove(
    "is-open"
  );

  photoLightbox.setAttribute(
    "aria-hidden",
    "true"
  );

  if (photoLightboxImage) {
    photoLightboxImage.src = "";
  }

  document.body.style.overflow = "";
}

/*
  Event delegation dipakai agar foto yang
  dibuat secara dinamis tetap otomatis
  dapat membuka lightbox.

  Berlaku untuk:
  - Inspection Photo
  - Additional Photo
*/
document.addEventListener(
  "click",
  function(event) {
    const image =
      event.target.closest(
        ".brf-inspection-photo img, " +
        ".brf-photo-preview-item img"
      );

    if (!image) {
      return;
    }

    event.preventDefault();

    openPhotoLightbox(
      image.currentSrc ||
      image.src
    );
  }
);

if (photoLightboxClose) {
  photoLightboxClose.addEventListener(
    "click",
    function(event) {
      event.stopPropagation();
      closePhotoLightbox();
    }
  );
}

if (photoLightbox) {
  photoLightbox.addEventListener(
    "click",
    function(event) {
      /*
        Tutup hanya jika user menekan
        area overlay gelap.

        Klik pada foto tidak menutup
        preview.
      */
      if (event.target === photoLightbox) {
        closePhotoLightbox();
      }
    }
  );
}

document.addEventListener(
  "keydown",
  function(event) {
    if (
      event.key === "Escape" &&
      photoLightbox &&
      photoLightbox.classList.contains(
        "is-open"
      )
    ) {
      closePhotoLightbox();
    }
  }
);


// ======================================================
// 17. HELPERS
// ======================================================

function cleanText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function setText(
  itemCard,
  selector,
  value
) {
  const element =
    itemCard.querySelector(
      selector
    );

  if (!element) {
    return;
  }

  element.textContent =
    cleanText(value) || "-";
}

function formatDisplayDate(
  value
) {
  const text =
    cleanText(value);

  if (!text) {
    return "";
  }

  let date = null;

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {
    const parts =
      text.split("-");

    date =
      new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );
  } else {
    const parsed =
      new Date(text);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      date = parsed;
    }
  }

  if (
    !date ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return text;
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date);
}

// ======================================================
// 18. BACK / CANCEL
// ======================================================

function backToRegistrationList() {
  window.location.href =
    "backlog-registration.html";
}

if (backButton) {
  backButton.addEventListener(
    "click",
    backToRegistrationList
  );
}

if (cancelButton) {
  cancelButton.addEventListener(
    "click",
    backToRegistrationList
  );
}

// ======================================================
// 19. ADD ITEM BUTTON
// ======================================================

if (addItemButton) {
  addItemButton.addEventListener(
    "click",
    addRegistrationItem
  );
}

// ======================================================
// 20. SAVE DRAFT
// ======================================================

let backlogSaving = false;
let backlogRegistrationId = new URLSearchParams(location.search).get('registrationId') || '';
function backlogUserId() {
  return cleanText(currentUser?.uniqId || currentUser?.uniqID || currentUser?.UNIQ_ID || currentUser?.['UNIQ ID']);
}
async function backlogPost(payload) {
  const response=await fetch(HEXA_API_URL,{
    method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)
  });
  if(!response.ok)throw new Error('HTTP '+response.status);
  const result=await response.json();
  if(!result || result.success!==true)throw new Error(result?.message||'Permintaan API gagal.');
  return result;
}
function backlogFileToBase64(file) {
  return new Promise(function(resolve,reject){
    const reader=new FileReader();
    reader.onload=function(){resolve(String(reader.result).split(',')[1]);};
    reader.onerror=function(){reject(new Error('Gagal membaca foto '+file.name));};
    reader.readAsDataURL(file);
  });
}
async function backlogUploadPhotos(card,createdById) {
  const input=card.querySelector('.brf-photo-input');
  const existing=Array.isArray(card._backlogSavedPhotos)?card._backlogSavedPhotos.slice():[];
  const files=Array.from(input?.files||[]);
  for(const file of files) {
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))
      throw new Error('Foto '+file.name+' harus JPG, PNG, atau WEBP.');
    if(file.size>5*1024*1024)throw new Error('Foto '+file.name+' maksimal 5 MB.');
    const result=await backlogPost({action:'uploadBacklogPhoto',createdById,
      fileName:file.name,mimeType:file.type,base64:await backlogFileToBase64(file)});
    existing.push({url:result.url,fileName:result.fileName});
  }
  card._backlogSavedPhotos=existing;
  if(input)input.value='';
  return existing;
}
async function saveBacklogFormDraft(options = {}) {
  const stayOnPage = options.stayOnPage === true;
  if(backlogSaving)return;
  const createdById=backlogUserId();
  if(!createdById){alert('UNIQ ID akun tidak tersedia pada sesi login. Silakan login kembali.');return;}
  const cards=Array.from(itemsContainer?.querySelectorAll('.brf-item-card')||[]);
  if(!cards.length){alert('Tambahkan minimal satu item.');return;}
  const ids=new Set(), items=[];
  for(let i=0;i<cards.length;i++) {
    const card=cards[i];
    const inspectionId=cleanText(card.dataset.inspectionId||card.querySelector('.brf-problem-select')?.value);
    if(!inspectionId){alert('Pilih Unit Code dan Problem Description pada ITEM '+(i+1)+'.');return;}
    if(ids.has(inspectionId)){alert('Inspection ID '+inspectionId+' dipilih dua kali.');return;}
    ids.add(inspectionId);
    const parts=Array.from(card.querySelectorAll('.brf-part-row')).map(function(row){
      return {partName:cleanText(row.querySelector('.brf-part-name')?.value),
        partNo:cleanText(row.querySelector('.brf-part-no')?.value),
        quantity:cleanText(row.querySelector('.brf-part-qty')?.value)};
    }).filter(function(part){return part.partName||part.partNo;});
    items.push({inspectionId,parts,notes:'',planRepairDate:''});
  }
  backlogSaving=true;
  const oldText=saveDraftButton.textContent;
  saveDraftButton.disabled=true;
  saveDraftButton.textContent='Saving Draft...';
  try {
    for(let i=0;i<cards.length;i++){
      saveDraftButton.textContent='Uploading photos '+(i+1)+'/'+cards.length+'...';
      items[i].photos=await backlogUploadPhotos(cards[i],createdById);
    }
    saveDraftButton.textContent='Saving Draft...';
    const result=await backlogPost({action:'saveBacklogDraft',createdById,
      registrationId:backlogRegistrationId,items});
    backlogRegistrationId=result.registrationId;
    if (!stayOnPage) {
      alert('Draft berhasil disimpan.\nRegistration ID: '+result.registrationId);
      window.location.href='backlog-registration.html';
    }
    return result;
  }catch(error){
    console.error('HEXA: Save Backlog Draft failed',error);
    if (!stayOnPage) alert('Gagal menyimpan Draft: '+error.message+'\nData form tetap terbuka.');
    throw error;
  }finally{
    backlogSaving=false;saveDraftButton.disabled=false;saveDraftButton.textContent=oldText;
  }
}
async function restoreBacklogDraft() {
  if(!backlogRegistrationId)return;
  const createdById=backlogUserId();
  if(!createdById)throw new Error('UNIQ ID akun tidak tersedia.');
  const result=await backlogPost({action:'getBacklogDraft',registrationId:backlogRegistrationId,createdById});
  if(result.status!=='DRAFT')throw new Error('Registrasi tidak berstatus DRAFT.');
  itemsContainer.innerHTML='';
  for(const item of result.items||[]){
    addRegistrationItem();
    const card=itemsContainer.lastElementChild;
    const candidate=backlogCandidates.find(function(c){return cleanText(c.inspectionId)===item.inspectionId;});
    if(!candidate)throw new Error('Inspection ID '+item.inspectionId+' tidak tersedia dalam kandidat MOL Belum.');
    const unit=card.querySelector('.brf-unit-select');
    populateUnitSelect(card);unit.value=candidate.unitCode;
    populateProblemSelect(card,candidate.unitCode);
    card.querySelector('.brf-problem-select').value=item.inspectionId;
    applyCandidateToItem(card,candidate);
    renderCandidateParts(card,item.parts||[]);
    card._backlogSavedPhotos=item.photos||[];
    const preview=card.querySelector('.brf-photo-preview');
    if(preview){
      (item.photos||[]).forEach(function(photo){
        const wrapper=document.createElement('div');wrapper.className='brf-photo-preview-item';
        const img=document.createElement('img');img.alt='Saved additional photo';
        img.src=normalizeDriveImageUrl(photo.url);wrapper.appendChild(img);preview.appendChild(wrapper);
      });
    }
  }
  updateItemNumbers();refreshAllUnitSelects();
}
if(saveDraftButton)saveDraftButton.addEventListener('click',function(){saveBacklogFormDraft().catch(function(){/* sudah ditampilkan oleh handler */});});

// ======================================================
// 21. SUBMIT REGISTRATION (requires backend submitBacklogRegistration)
// ======================================================
const brfSubmitButton = document.getElementById('brfSubmitButton');
const brfSubmitDialog = document.getElementById('brfSubmitDialog');
const brfSubmitCancel = document.getElementById('brfSubmitDialogCancel');
const brfSubmitConfirm = document.getElementById('brfSubmitDialogConfirm');
let brfSubmitting = false;

function brfValidateSubmit() {
  const cards = Array.from(itemsContainer?.querySelectorAll('.brf-item-card') || []);
  if (!cards.length) throw new Error('Tambahkan minimal satu item.');
  const ids = new Set();
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const id = cleanText(card.dataset.inspectionId);
    if (!id || !cleanText(card.querySelector('.brf-unit-select')?.value)) {
      throw new Error('ITEM ' + (i + 1) + ': pilih Unit Code dan Problem Description.');
    }
    if (ids.has(id)) throw new Error('Inspection ID ' + id + ' dipilih lebih dari sekali.');
    ids.add(id);
    for (const row of card.querySelectorAll('.brf-part-row')) {
      const name = cleanText(row.querySelector('.brf-part-name')?.value);
      const no = cleanText(row.querySelector('.brf-part-no')?.value);
      const qty = Number(row.querySelector('.brf-part-qty')?.value);
      if ((name || no) && (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty))) {
        throw new Error('ITEM ' + (i + 1) + ': Qty part harus bilangan bulat lebih dari nol.');
      }
    }
  }
}
function brfShowSubmitDialog(show) {
  if (!brfSubmitDialog) return;
  brfSubmitDialog.hidden = !show;
}
if (brfSubmitButton && brfSubmitDialog && brfSubmitConfirm) {
  // Aktifkan tombol hanya ketika API submit sudah dipasang di GAS.
  // Saat ini masih dinonaktifkan untuk mencegah Submit semu.
  const BRF_SUBMIT_API_READY = true;
  brfSubmitButton.disabled = !BRF_SUBMIT_API_READY;
  brfSubmitButton.title = BRF_SUBMIT_API_READY ? '' : 'Menunggu integrasi Apps Script API Submit';
  brfSubmitButton.addEventListener('click', function() {
    try { brfValidateSubmit(); brfShowSubmitDialog(true); }
    catch (error) { alert(error.message); }
  });
  brfSubmitCancel?.addEventListener('click', function() { brfShowSubmitDialog(false); });
  brfSubmitDialog.addEventListener('click', function(event) {
    if (event.target === brfSubmitDialog && !brfSubmitting) brfShowSubmitDialog(false);
  });
  brfSubmitConfirm.addEventListener('click', async function() {
    if (brfSubmitting || backlogSaving) return;
    brfSubmitting = true;
    brfSubmitConfirm.disabled = true;
    brfSubmitConfirm.textContent = 'Submitting...';
    if (brfSubmitButton) brfSubmitButton.disabled = true;
    try {
      brfValidateSubmit();
      // Simpan perubahan terakhir sebelum mengirim, tanpa redirect.
      const saved = await saveBacklogFormDraft({stayOnPage:true});
      if (!saved?.registrationId) throw new Error('Draft belum berhasil disimpan.');
      const response = await backlogPost({
        action:'submitBacklogRegistration',
        registrationId:saved.registrationId,
        createdById:backlogUserId()
      });
      // API wajib memvalidasi pemilik, status DRAFT, isi, serta mengunci data.
      if (!response.status || response.status === 'DRAFT') {
        throw new Error('API tidak mengonfirmasi status Submit.');
      }
      brfShowSubmitDialog(false);
      alert('Registrasi berhasil di-submit.\nRegistration ID: ' + saved.registrationId);
      window.location.href = 'backlog-registration.html';
    } catch (error) {
      console.error('HEXA: Submit failed', error);
      alert('Submit belum berhasil: ' + error.message + '\nDraft yang berhasil disimpan tetap tersedia.');
    } finally {
      brfSubmitting = false;
      brfSubmitConfirm.disabled = false;
      brfSubmitConfirm.textContent = 'Ya, Submit';
      if (brfSubmitButton) brfSubmitButton.disabled = !BRF_SUBMIT_API_READY;
    }
  });
}

// ======================================================
// 22. INITIALIZE
// ======================================================

async function initializeBacklogForm() {
  const role = cleanText(currentUser?.level || currentUser?.LEVEL).toUpperCase().replace(/[\s_-]+/g, '');
  if (role === 'VISITOR' || role === '6') {
    alert('Visitor hanya dapat melihat registrasi, tidak dapat membuat atau mengedit.');
    window.location.replace('backlog-registration.html');
    return;
  }
  setRegistrationInformation();

  /*
    Form selalu mulai dengan
    satu Registration Item.
  */
  addRegistrationItem();

  /*
    Ambil kandidat langsung dari
    DM DATABASE melalui HEXA API.
  */
  await loadBacklogCandidates();
  try { await restoreBacklogDraft(); } catch(error) { console.error(error); alert("Gagal membuka Draft: "+error.message); }

  console.log(
    "HEXA Backlog Registration Form Ready"
  );
}

initializeBacklogForm();
