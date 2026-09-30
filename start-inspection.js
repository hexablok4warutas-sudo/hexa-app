"use strict";


/* =====================================================
   HEXA API
===================================================== */

const HEXA_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";


/* =====================================================
   UNIT POPULATION - SEARCHABLE COMBOBOX
===================================================== */
const unitCombobox = document.getElementById("unitCombobox");
const unitCodeSearch = document.getElementById("unitCodeSearch");
const unitCodeInput = document.getElementById("unitCode");
const unitCodeOptions = document.getElementById("unitCodeOptions");
let startInspectionUnits = [];

function cleanStartInspectionValue(value) {
  return value == null ? "" : String(value).trim();
}
function getPopulationStatusRank(status) {
  const s=cleanStartInspectionValue(status).toLowerCase();
  return s === "running" ? 1 : s === "stand by" ? 2 : 99;
}
function closeUnitCombobox() {
  if (!unitCodeOptions) return;
  unitCodeOptions.hidden=true;
  unitCodeSearch?.setAttribute("aria-expanded","false");
}
function selectStartInspectionUnit(unit) {
  const code=cleanStartInspectionValue(unit?.unitCode);
  if (unitCodeInput) unitCodeInput.value=code;
  if (unitCodeSearch) unitCodeSearch.value=code;
  closeUnitCombobox();
}
function renderUnitComboboxOptions(query="") {
  if (!unitCodeOptions) return;
  const q=cleanStartInspectionValue(query).toLowerCase();
  const matches=startInspectionUnits.filter(unit => [unit.unitCode,unit.egi,unit.status].join(" ").toLowerCase().includes(q));
  unitCodeOptions.innerHTML="";
  if (!matches.length) {
    const empty=document.createElement("div"); empty.className="unit-combobox-empty"; empty.textContent="Unit tidak ditemukan"; unitCodeOptions.appendChild(empty); return;
  }
  matches.forEach(unit => {
    const option=document.createElement("button"); option.type="button"; option.className="unit-combobox-option"; option.setAttribute("role","option");
    const main=document.createElement("span"); main.className="unit-combobox-option-main";
    const code=document.createElement("strong"); code.textContent=unit.unitCode; main.appendChild(code);
    if (unit.egi) { const egi=document.createElement("small"); egi.textContent=unit.egi; main.appendChild(egi); }
    const status=document.createElement("span"); status.className="unit-combobox-status "+(unit.status.toLowerCase()==="running"?"running":"standby"); status.textContent=unit.status;
    option.append(main,status); option.addEventListener("click",()=>selectStartInspectionUnit(unit)); unitCodeOptions.appendChild(option);
  });
}
function openUnitCombobox() {
  if (!unitCodeOptions || !unitCodeSearch || unitCodeSearch.disabled) return;
  renderUnitComboboxOptions(unitCodeSearch.value); unitCodeOptions.hidden=false; unitCodeSearch.setAttribute("aria-expanded","true");
}
async function loadStartInspectionPopulation() {
  if (!unitCodeSearch || !unitCodeInput) return;
  unitCodeSearch.disabled=true; unitCodeSearch.value="Loading Unit Population...";
  try {
    const response=await fetch(HEXA_API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"getUnitPopulation"})});
    if (!response.ok) throw new Error("HTTP "+response.status);
    const result=await response.json(); if (!result || result.success!==true) throw new Error(result?.message || "Gagal mengambil Population Unit.");
    startInspectionUnits=(Array.isArray(result.units)?result.units:[]).map(unit=>({unitCode:cleanStartInspectionValue(unit?.unitCode),egi:cleanStartInspectionValue(unit?.egi),status:cleanStartInspectionValue(unit?.status)})).filter(unit=>unit.unitCode && ["running","stand by"].includes(unit.status.toLowerCase())).sort((a,b)=>getPopulationStatusRank(a.status)-getPopulationStatusRank(b.status) || a.unitCode.localeCompare(b.unitCode,"id",{numeric:true,sensitivity:"base"}));
    unitCodeSearch.disabled=false; unitCodeSearch.value=""; unitCodeSearch.placeholder="Search / Select Unit";
  } catch(error) {
    console.error("HEXA Start Inspection: Population load failed.",error); unitCodeSearch.value=""; unitCodeSearch.placeholder="Unable to load Unit Population"; unitCodeSearch.disabled=true;
  }
}
if (unitCodeSearch) {
  unitCodeSearch.addEventListener("focus",openUnitCombobox);
  unitCodeSearch.addEventListener("click",openUnitCombobox);
  unitCodeSearch.addEventListener("input",()=>{ if(unitCodeInput) unitCodeInput.value=""; openUnitCombobox(); });
  unitCodeSearch.addEventListener("keydown",event=>{ if(event.key==="Escape") closeUnitCombobox(); if(event.key==="Enter"){const first=unitCodeOptions?.querySelector(".unit-combobox-option"); if(first){event.preventDefault(); first.click();}} });
}
document.addEventListener("click",event=>{if(unitCombobox && !unitCombobox.contains(event.target)) closeUnitCombobox();});
loadStartInspectionPopulation();


/* =====================================================
   SESSION PROTECTION
===================================================== */

const isLoggedIn =
  sessionStorage.getItem(
    "hexaLoggedIn"
  ) === "true";


const storedUser =
  sessionStorage.getItem(
    "hexaUser"
  );


if (
  !isLoggedIn ||
  !storedUser
) {

  window.location.replace(
    "index.html"
  );

}


let currentUser = null;


try {

  currentUser =
    JSON.parse(
      storedUser
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


/* =====================================================
   SEARCH FORM FIELD

   Search UI berasal dari Global Header.
   Fungsi pencarian tetap khusus halaman
   Start Inspection.
===================================================== */

const searchInput =
  document.getElementById(
    "searchInput"
  );


const searchButton =
  document.getElementById(
    "searchButton"
  );


function searchFormField() {

  if (!searchInput) {
    return;
  }


  const query =
    searchInput.value
      .trim()
      .toLowerCase();


  if (!query) {

    searchInput.focus();

    return;

  }


  const groups =
    document.querySelectorAll(
      ".form-group"
    );


  for (const group of groups) {

    const label =
      group.querySelector(
        "label"
      );


    if (!label) {
      continue;
    }


    const labelText =
      label.textContent
        .toLowerCase();


    if (
      labelText.includes(
        query
      )
    ) {

      const headerOffset =
        180;


      const elementPosition =
        group
          .getBoundingClientRect()
          .top;


      const offsetPosition =
        elementPosition +
        window.pageYOffset -
        headerOffset;


      window.scrollTo({

        top:
          offsetPosition,

        behavior:
          "smooth"

      });


      const input =
        group.querySelector(
          "input:not([type='hidden']), select, textarea, button"
        );


      if (input) {

        setTimeout(
          () => input.focus(),
          450
        );

      }


      return;

    }

  }

}


if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchFormField
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        searchFormField();

      }

    }
  );

}


/* =====================================================
   HM CONTROL
===================================================== */

const hmInspection =
  document.getElementById(
    "hmInspection"
  );


const hmMinus =
  document.getElementById(
    "hmMinus"
  );


const hmPlus =
  document.getElementById(
    "hmPlus"
  );


if (
  hmMinus &&
  hmInspection
) {

  hmMinus.addEventListener(
    "click",
    function () {

      const currentValue =
        Number(
          hmInspection.value
        ) || 0;


      hmInspection.value =
        Math.max(
          0,
          currentValue - 1
        );

    }
  );

}


if (
  hmPlus &&
  hmInspection
) {

  hmPlus.addEventListener(
    "click",
    function () {

      const currentValue =
        Number(
          hmInspection.value
        ) || 0;


      hmInspection.value =
        currentValue + 1;

    }
  );

}


/* =====================================================
   DEFAULT DATE
===================================================== */

const dateInspection =
  document.getElementById(
    "dateInspection"
  );


function setTodayAsDefaultDate() {

  if (!dateInspection) {
    return;
  }


  if (
    dateInspection.value
  ) {

    return;

  }


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  dateInspection.value =
    `${year}-${month}-${day}`;

}


setTodayAsDefaultDate();


/* =====================================================
   PHOTO
===================================================== */

const photoSourceButton =
  document.getElementById(
    "photoSourceButton"
  );


const inspectionPhotoCamera =
  document.getElementById(
    "inspectionPhotoCamera"
  );


const inspectionPhotoGallery =
  document.getElementById(
    "inspectionPhotoGallery"
  );


const photoSourceSheet =
  document.getElementById(
    "photoSourceSheet"
  );


const photoSourceBackdrop =
  document.getElementById(
    "photoSourceBackdrop"
  );


const takePhotoButton =
  document.getElementById(
    "takePhotoButton"
  );


const chooseGalleryButton =
  document.getElementById(
    "chooseGalleryButton"
  );


const cancelPhotoSourceButton =
  document.getElementById(
    "cancelPhotoSourceButton"
  );


const photoText =
  document.getElementById(
    "photoText"
  );


const photoPreviewContainer =
  document.getElementById(
    "photoPreviewContainer"
  );


const photoPreview =
  document.getElementById(
    "photoPreview"
  );


let selectedInspectionPhoto =
  null;


let photoPreviewObjectUrl =
  "";


/* =====================================================
   PHOTO SOURCE SHEET
===================================================== */

function openPhotoSourceSheet() {

  if (!photoSourceSheet) {
    return;
  }


  photoSourceSheet.hidden =
    false;


  document.body.classList.add(
    "photo-source-open"
  );
}


function closePhotoSourceSheet() {

  if (!photoSourceSheet) {
    return;
  }


  photoSourceSheet.hidden =
    true;


  document.body.classList.remove(
    "photo-source-open"
  );
}


function clearPhotoInputValues() {

  if (inspectionPhotoCamera) {
    inspectionPhotoCamera.value = "";
  }


  if (inspectionPhotoGallery) {
    inspectionPhotoGallery.value = "";
  }
}


function setSelectedInspectionPhoto(
  file
) {

  if (!file) {
    return;
  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    alert(
      "File harus berupa gambar."
    );

    clearPhotoInputValues();

    return;
  }


  selectedInspectionPhoto =
    file;


  if (photoText) {
    photoText.textContent =
      file.name ||
      "Inspection Photo";
  }


  if (photoPreviewObjectUrl) {

    URL.revokeObjectURL(
      photoPreviewObjectUrl
    );
  }


  photoPreviewObjectUrl =
    URL.createObjectURL(
      file
    );


  if (photoPreview) {
    photoPreview.src =
      photoPreviewObjectUrl;
  }


  if (photoPreviewContainer) {
    photoPreviewContainer.hidden =
      false;
  }
}


if (photoSourceButton) {

  photoSourceButton.addEventListener(
    "click",
    openPhotoSourceSheet
  );
}


if (takePhotoButton) {

  takePhotoButton.addEventListener(
    "click",
    function () {

      closePhotoSourceSheet();

      if (inspectionPhotoCamera) {

        /*
          Kosongkan value agar foto yang sama tetap
          dapat dipilih/diambil kembali.
        */

        inspectionPhotoCamera.value =
          "";

        inspectionPhotoCamera.click();
      }
    }
  );
}


if (chooseGalleryButton) {

  chooseGalleryButton.addEventListener(
    "click",
    function () {

      closePhotoSourceSheet();

      if (inspectionPhotoGallery) {

        inspectionPhotoGallery.value =
          "";

        inspectionPhotoGallery.click();
      }
    }
  );
}


if (cancelPhotoSourceButton) {

  cancelPhotoSourceButton.addEventListener(
    "click",
    closePhotoSourceSheet
  );
}


if (photoSourceBackdrop) {

  photoSourceBackdrop.addEventListener(
    "click",
    closePhotoSourceSheet
  );
}


if (inspectionPhotoCamera) {

  inspectionPhotoCamera.addEventListener(
    "change",
    function () {

      setSelectedInspectionPhoto(
        inspectionPhotoCamera.files[0]
      );
    }
  );
}


if (inspectionPhotoGallery) {

  inspectionPhotoGallery.addEventListener(
    "change",
    function () {

      setSelectedInspectionPhoto(
        inspectionPhotoGallery.files[0]
      );
    }
  );
}


/* =====================================================
   COMPRESS PHOTO
===================================================== */

function compressPhoto(file) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          const image =
            new Image();


          image.onload =
            function () {

              const maxDimension =
                1600;


              let width =
                image.width;


              let height =
                image.height;


              if (
                width >
                  maxDimension ||
                height >
                  maxDimension
              ) {

                const scale =
                  Math.min(

                    maxDimension /
                      width,

                    maxDimension /
                      height

                  );


                width =
                  Math.round(
                    width * scale
                  );


                height =
                  Math.round(
                    height * scale
                  );

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;


              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              context.drawImage(

                image,

                0,
                0,

                width,
                height

              );


              const compressedData =
                canvas.toDataURL(
                  "image/jpeg",
                  0.75
                );


              resolve({

                base64:
                  compressedData,

                mimeType:
                  "image/jpeg"

              });

            };


          image.onerror =
            function () {

              reject(
                new Error(
                  "Foto tidak dapat diproses."
                )
              );

            };


          image.src =
            event.target.result;

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Foto tidak dapat dibaca."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================================
   RATING
===================================================== */

const ratingInput =
  document.getElementById(
    "rating"
  );


const ratingButtons =
  document.querySelectorAll(
    ".rating-button"
  );


ratingButtons.forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        ratingButtons.forEach(
          function (item) {

            item.classList.remove(
              "selected"
            );

          }
        );


        button.classList.add(
          "selected"
        );


        ratingInput.value =
          button.dataset.rating;

      }
    );

  }
);


/* =====================================================
   PART REQUIREMENT
===================================================== */

const partRequirementList =
  document.getElementById(
    "partRequirementList"
  );


const addPartButton =
  document.getElementById(
    "addPartButton"
  );


const partsDescriptionInput =
  document.getElementById(
    "partsDescription"
  );


const partNoInput =
  document.getElementById(
    "partNo"
  );


const quantityInput =
  document.getElementById(
    "quantity"
  );


/* =====================================================
   CREATE PART ITEM
===================================================== */

function createPartItem() {

  const partItem =
    document.createElement(
      "div"
    );


  partItem.className =
    "part-requirement-item";


  partItem.innerHTML = `

    <div class="part-item-header">

      <div class="part-item-title">
        Part
      </div>

      <button
        type="button"
        class="remove-part-button"
        aria-label="Remove Part"
      >
        Remove Part
      </button>

    </div>


    <div class="part-field">

      <label>
        Part Description
      </label>

      <input
        type="text"
        class="part-description-input"
        autocomplete="off"
        placeholder="Input Part Description"
      >

    </div>


    <div class="part-row">


      <div class="part-field part-no-field">

        <label>
          Part No.
        </label>

        <input
          type="text"
          class="part-no-input"
          autocomplete="off"
          placeholder="Input Part No."
        >

      </div>


      <div class="part-field quantity-field">

        <label>
          Qty
        </label>

        <input
          type="number"
          class="part-quantity-input"
          min="0"
          step="1"
          inputmode="numeric"
          placeholder="0"
        >

      </div>


    </div>

  `;


  return partItem;

}


/* =====================================================
   GET PART ITEMS
===================================================== */

function getPartItems() {

  if (!partRequirementList) {
    return [];
  }


  return Array.from(
    partRequirementList.querySelectorAll(
      ".part-requirement-item"
    )
  );

}


/* =====================================================
   RENUMBER PARTS
===================================================== */

function renumberParts() {

  const items =
    getPartItems();


  items.forEach(
    function (
      item,
      index
    ) {

      const number =
        index + 1;


      item.dataset.partIndex =
        String(
          number
        );


      const title =
        item.querySelector(
          ".part-item-title"
        );


      const removeButton =
        item.querySelector(
          ".remove-part-button"
        );


      if (title) {

        title.textContent =
          `Part ${number}`;

      }


      if (removeButton) {

        removeButton.setAttribute(
          "aria-label",
          `Remove Part ${number}`
        );

      }

    }
  );

}


/* =====================================================
   CLEAR ONE PART ITEM
===================================================== */

function clearPartItem(
  item
) {

  if (!item) {
    return;
  }


  const description =
    item.querySelector(
      ".part-description-input"
    );


  const partNo =
    item.querySelector(
      ".part-no-input"
    );


  const quantity =
    item.querySelector(
      ".part-quantity-input"
    );


  if (description) {
    description.value = "";
  }


  if (partNo) {
    partNo.value = "";
  }


  if (quantity) {
    quantity.value = "";
  }

}


/* =====================================================
   ADD PART
===================================================== */

function addPart() {

  if (!partRequirementList) {
    return;
  }


  const newPart =
    createPartItem();


  partRequirementList.appendChild(
    newPart
  );


  renumberParts();


  const description =
    newPart.querySelector(
      ".part-description-input"
    );


  if (description) {

    description.focus();

  }


  newPart.scrollIntoView({

    behavior:
      "smooth",

    block:
      "nearest"

  });

}


if (addPartButton) {

  addPartButton.addEventListener(
    "click",
    addPart
  );

}


/* =====================================================
   REMOVE PART

   Event delegation digunakan agar tombol Remove
   pada Part yang dibuat secara dinamis tetap bekerja.
===================================================== */

if (partRequirementList) {

  partRequirementList.addEventListener(
    "click",
    function (event) {

      const removeButton =
        event.target.closest(
          ".remove-part-button"
        );


      if (!removeButton) {
        return;
      }


      const item =
        removeButton.closest(
          ".part-requirement-item"
        );


      if (!item) {
        return;
      }


      const items =
        getPartItems();


      /*
        Part terakhir tidak dihapus.
        Jika hanya tersisa satu Part,
        tombol Remove berfungsi sebagai Clear.
      */

      if (
        items.length <= 1
      ) {

        clearPartItem(
          item
        );


        const description =
          item.querySelector(
            ".part-description-input"
          );


        if (description) {
          description.focus();
        }


        return;

      }


      item.remove();


      renumberParts();

    }
  );

}


/* =====================================================
   VALIDATE PART REQUIREMENT

   Aturan:
   - Seluruh Part Requirement boleh kosong.
   - Jika sebuah card benar-benar kosong, card tersebut
     tidak dianggap sebagai kebutuhan part.
   - Jika salah satu field pada card diisi, card tersebut
     tetap disimpan.
   - Qty jika diisi tidak boleh negatif.
===================================================== */

function validatePartRequirements() {

  const items =
    getPartItems();


  for (
    let index = 0;
    index < items.length;
    index++
  ) {

    const item =
      items[index];


    const descriptionInput =
      item.querySelector(
        ".part-description-input"
      );


    const partNumberInput =
      item.querySelector(
        ".part-no-input"
      );


    const quantityField =
      item.querySelector(
        ".part-quantity-input"
      );


    const description =
      descriptionInput
        ? descriptionInput.value.trim()
        : "";


    const partNumber =
      partNumberInput
        ? partNumberInput.value.trim()
        : "";


    const quantity =
      quantityField
        ? quantityField.value.trim()
        : "";


    const hasAnyValue =
      Boolean(
        description ||
        partNumber ||
        quantity
      );


    if (!hasAnyValue) {
      continue;
    }


    if (
      quantity !== "" &&
      Number(quantity) < 0
    ) {

      alert(
        `Qty pada Part ${index + 1} tidak boleh kurang dari 0.`
      );


      if (quantityField) {
        quantityField.focus();
      }


      return false;

    }

  }


  return true;

}


/* =====================================================
   COLLECT PART REQUIREMENT

   Database tetap menggunakan 3 kolom:
   Parts Description
   Part No
   Quantity

   Setiap Part disimpan pada line yang sama.

   Contoh:

   Description:
   Hose Assy
   O-Ring

   Part No:
   123-456
   8T-1234

   Quantity:
   1
   2
===================================================== */

function collectPartRequirements() {

  const items =
    getPartItems();


  const parts =
    [];


  items.forEach(
    function (item) {

      const descriptionInput =
        item.querySelector(
          ".part-description-input"
        );


      const partNumberInput =
        item.querySelector(
          ".part-no-input"
        );


      const quantityField =
        item.querySelector(
          ".part-quantity-input"
        );


      const description =
        descriptionInput
          ? descriptionInput.value.trim()
          : "";


      const partNumber =
        partNumberInput
          ? partNumberInput.value.trim()
          : "";


      const quantity =
        quantityField
          ? quantityField.value.trim()
          : "";


      /*
        Card yang seluruh field-nya kosong
        tidak perlu disimpan.
      */

      if (
        !description &&
        !partNumber &&
        !quantity
      ) {

        return;

      }


      /*
        Field kosong tetap dimasukkan sebagai
        string kosong agar posisi antar-kolom
        tidak bergeser.
      */

      parts.push({

        description:
          description,

        partNo:
          partNumber,

        quantity:
          quantity

      });

    }
  );


  return {

    parts:
      parts,

    partsDescription:
      parts
        .map(
          part => part.description
        )
        .join("\n"),

    partNo:
      parts
        .map(
          part => part.partNo
        )
        .join("\n"),

    quantity:
      parts
        .map(
          part => part.quantity
        )
        .join("\n")

  };

}


/* =====================================================
   SYNC PART DATABASE FIELDS
===================================================== */

function syncPartDatabaseFields() {

  const partData =
    collectPartRequirements();


  if (partsDescriptionInput) {

    partsDescriptionInput.value =
      partData.partsDescription;

  }


  if (partNoInput) {

    partNoInput.value =
      partData.partNo;

  }


  if (quantityInput) {

    quantityInput.value =
      partData.quantity;

  }


  return partData;

}


/* =====================================================
   RESET PART REQUIREMENT
===================================================== */

function resetPartRequirements() {

  if (!partRequirementList) {
    return;
  }


  partRequirementList.innerHTML =
    "";


  const firstPart =
    createPartItem();


  partRequirementList.appendChild(
    firstPart
  );


  renumberParts();


  if (partsDescriptionInput) {
    partsDescriptionInput.value = "";
  }


  if (partNoInput) {
    partNoInput.value = "";
  }


  if (quantityInput) {
    quantityInput.value = "";
  }

}


/* =====================================================
   INITIALIZE EXISTING PART 1
===================================================== */

renumberParts();


/* =====================================================
   INSPECTOR FROM LOGIN
===================================================== */

const inspectors =
  document.getElementById(
    "inspectors"
  );


if (
  currentUser &&
  currentUser.nama &&
  inspectors
) {

  inspectors.value =
    currentUser.nama;

}


/* =====================================================
   FORM
===================================================== */

const inspectionForm =
  document.getElementById(
    "inspectionForm"
  );


/* =====================================================
   SUBMIT BUTTON
===================================================== */

const submitButton =
  inspectionForm
    ? inspectionForm.querySelector(
        'button[type="submit"], input[type="submit"]'
      )
    : null;


/* =====================================================
   SET SUBMIT LOADING
===================================================== */

function setSubmitLoading(
  loading
) {

  if (!submitButton) {
    return;
  }


  if (loading) {

    submitButton.disabled =
      true;


    submitButton.dataset.originalText =
      submitButton.innerHTML;


    submitButton.innerHTML =
      `
        <span>
          Submitting...
        </span>
      `;

  } else {

    submitButton.disabled =
      false;


    submitButton.innerHTML =
      submitButton.dataset.originalText ||
      `
        <span class="submit-icon">✓</span>
        <span>Submit Inspection</span>
      `;

  }

}


/* =====================================================
   RESET FORM SETELAH BERHASIL
===================================================== */

function resetInspectionForm() {

  inspectionForm.reset();


  /*
    Inspector tetap berasal dari user login.
  */

  if (
    currentUser &&
    currentUser.nama
  ) {

    inspectors.value =
      currentUser.nama;

  }


  /*
    Reset Rating.
  */

  ratingInput.value =
    "";


  ratingButtons.forEach(
    function (button) {

      button.classList.remove(
        "selected"
      );

    }
  );


  /*
    Reset Photo.
  */

  photoText.textContent =
    "Add Inspection Photo";


  photoPreviewContainer.hidden =
    true;


  photoPreview.removeAttribute(
    "src"
  );


  if (photoPreviewObjectUrl) {

    URL.revokeObjectURL(
      photoPreviewObjectUrl
    );

    photoPreviewObjectUrl =
      "";
  }


  selectedInspectionPhoto =
    null;


  clearPhotoInputValues();


  closePhotoSourceSheet();


  /*
    Reset Part Requirement menjadi
    hanya Part 1 kosong.
  */

  resetPartRequirements();


  /*
    Tanggal kembali hari ini.
  */

  setTodayAsDefaultDate();

}


/* =====================================================
   SUBMIT START INSPECTION
===================================================== */

if (inspectionForm) {

  inspectionForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      /* ===============================================
         VALIDASI RATING
      =============================================== */

      if (
        !ratingInput.value
      ) {

        alert(
          "Silakan pilih Rating terlebih dahulu."
        );

        return;

      }


      /* ===============================================
         PHOTO OPTIONAL
      =============================================== */

      const photoFile =
        selectedInspectionPhoto ||
        null;


      /* ===============================================
         VALIDASI REQUIRED HTML
      =============================================== */

      if (
        !inspectionForm.checkValidity()
      ) {

        inspectionForm.reportValidity();

        return;

      }


      /* ===============================================
         VALIDASI PART REQUIREMENT
      =============================================== */

      if (
        !validatePartRequirements()
      ) {

        return;

      }


      /* ===============================================
         COLLECT PART REQUIREMENT

         Di sinilah semua Part 1, Part 2, Part 3...
         dikonversi menjadi multiline untuk database.
      =============================================== */

      const partData =
        syncPartDatabaseFields();


      setSubmitLoading(
        true
      );


      try {

        /* =============================================
           COMPRESS PHOTO

           Photo bersifat optional. Jika user tidak memilih
           foto, payload dikirim dengan nilai kosong.
        ============================================= */

        const photo =
          photoFile
            ? await compressPhoto(
                photoFile
              )
            : {
                base64: "",
                mimeType: ""
              };


        /* =============================================
           DATA START INSPECTION
        ============================================= */

        const inspectionData = {

          action:
            "submitInspection",

          unitCode:
            document.getElementById(
              "unitCode"
            ).value.trim(),

          hmInspection:
            hmInspection.value.trim(),

          dateInspection:
            dateInspection.value,

          photoBase64:
            photo.base64,

          photoMimeType:
            photo.mimeType,

          groupComponent:
            document.getElementById(
              "groupComponent"
            ).value.trim(),

          problemDescription:
            document.getElementById(
              "problemDescription"
            ).value.trim(),

          rating:
            ratingInput.value,

          /*
            MULTI PART

            Payload key tetap sama dengan backend lama.
          */

          partsDescription:
            partData.partsDescription,

          partNo:
            partData.partNo,

          quantity:
            partData.quantity,

          inspectors:
            inspectors.value.trim(),

          notes:
            document.getElementById(
              "notes"
            ).value.trim()

        };


        console.log(
          "HEXA SUBMIT:",
          inspectionData
        );


        console.log(
          "HEXA PART REQUIREMENT:",
          partData.parts
        );


        /* =============================================
           SEND TO HEXA API
        ============================================= */

        const response =
          await fetch(
            HEXA_API_URL,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "text/plain;charset=utf-8"

              },

              body:
                JSON.stringify(
                  inspectionData
                )

            }
          );


        /* =============================================
           RESPONSE
        ============================================= */

        if (!response.ok) {

          throw new Error(
            "Server tidak merespons dengan benar."
          );

        }


        const result =
          await response.json();


        console.log(
          "HEXA RESPONSE:",
          result
        );


        /* =============================================
           API ERROR
        ============================================= */

        if (
          !result.success
        ) {

          throw new Error(
            result.message ||
            "Inspection gagal disimpan."
          );

        }


        /* =============================================
           SUCCESS
        ============================================= */

        alert(

          "Inspection berhasil disimpan.\n\n" +

          "ID Inspection:\n" +
          result.inspectionId +

          "\n\nStatus: " +
          result.status +

          "\nMOL: " +
          result.mol

        );


        resetInspectionForm();


        window.scrollTo({

          top: 0,

          behavior:
            "smooth"

        });


      } catch (error) {

        console.error(
          "HEXA SUBMIT ERROR:",
          error
        );


        alert(

          "Inspection gagal disimpan.\n\n" +

          error.message

        );


      } finally {

        setSubmitLoading(
          false
        );

      }

    }
  );

}


/* =====================================================
   READY
===================================================== */

console.log(
  "HEXA Start Inspection Ready"
);
