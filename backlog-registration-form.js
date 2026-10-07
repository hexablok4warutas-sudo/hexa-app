"use strict";


// ======================================================
// HEXA BACKLOG REGISTRATION FORM
// ======================================================


// ======================================================
// 1. SESSION
// ======================================================

const hexaLoggedIn =
  sessionStorage.getItem(
    "hexaLoggedIn"
  );

const hexaUserData =
  sessionStorage.getItem(
    "hexaUser"
  );


if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {

  window.location.replace(
    "index.html"
  );

}


// ======================================================
// 2. CURRENT USER
// ======================================================

let currentUser = null;


try {

  currentUser =
    JSON.parse(
      hexaUserData
    );

} catch (error) {

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


// ======================================================
// 3. ELEMENTS
// ======================================================

const backButton =
  document.getElementById(
    "brfBackButton"
  );

const cancelButton =
  document.getElementById(
    "brfCancelButton"
  );

const saveDraftButton =
  document.getElementById(
    "brfSaveDraftButton"
  );

const addItemButton =
  document.getElementById(
    "brfAddItemButton"
  );

const itemsContainer =
  document.getElementById(
    "brfItemsContainer"
  );

const itemTemplate =
  document.getElementById(
    "brfItemTemplate"
  );

const partTemplate =
  document.getElementById(
    "brfPartTemplate"
  );

const itemCounter =
  document.getElementById(
    "brfItemCounter"
  );


// ======================================================
// 4. USER INFORMATION
// ======================================================

function setRegistrationInformation() {

  const createdBy =
    document.getElementById(
      "brfCreatedBy"
    );

  const createdDate =
    document.getElementById(
      "brfCreatedDate"
    );


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
      ).format(
        new Date()
      );

  }

}


// ======================================================
// 5. ADD ITEM
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


  /*
    Setiap item minimal mempunyai
    satu baris Part Requirement.
  */

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

  }


  updateItemNumbers();

}


// ======================================================
// 6. SETUP ITEM
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


  if (removeButton) {

    removeButton.addEventListener(
      "click",
      function () {

        const totalItems =
          itemsContainer.querySelectorAll(
            ".brf-item-card"
          ).length;


        /*
          Minimal satu item tetap
          berada di form.
        */

        if (totalItems <= 1) {

          return;

        }


        itemCard.remove();

        updateItemNumbers();

      }
    );

  }


  if (addPartButton) {

    addPartButton.addEventListener(
      "click",
      function () {

        addPartRow(
          itemCard
        );

      }
    );

  }


  if (photoInput) {

    photoInput.addEventListener(
      "change",
      function () {

        renderPhotoPreview(
          itemCard,
          photoInput.files
        );

      }
    );

  }

}


// ======================================================
// 7. ADD PART
// ======================================================

function addPartRow(itemCard) {

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


  if (removeButton) {

    removeButton.addEventListener(
      "click",
      function () {

        partRow.remove();

      }
    );

  }


  partsContainer.appendChild(
    fragment
  );

}


// ======================================================
// 8. ITEM NUMBER
// ======================================================

function updateItemNumbers() {

  const items =
    itemsContainer
      ? itemsContainer.querySelectorAll(
          ".brf-item-card"
        )
      : [];


  items.forEach(
    function (item, index) {

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
// 9. PHOTO PREVIEW
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
    function (file) {

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
        function (event) {

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
// 10. BACK / CANCEL
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
// 11. ADD ITEM BUTTON
// ======================================================

if (addItemButton) {

  addItemButton.addEventListener(
    "click",
    addRegistrationItem
  );

}


// ======================================================
// 12. SAVE DRAFT
// ======================================================

if (saveDraftButton) {

  saveDraftButton.addEventListener(
    "click",
    function () {

      /*
        API belum dipasang.

        Tahap berikutnya kita akan
        melakukan validasi dan
        penyimpanan ke database.
      */

      console.log(
        "HEXA: Save Backlog Draft"
      );

    }
  );

}


// ======================================================
// 13. INITIALIZE
// ======================================================

function initializeBacklogForm() {

  setRegistrationInformation();


  /*
    Form selalu mulai dengan
    satu Registration Item.
  */

  addRegistrationItem();


  console.log(
    "HEXA Backlog Registration Form Ready"
  );

}


initializeBacklogForm();
