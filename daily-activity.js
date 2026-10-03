"use strict";

const DAILY_ACTIVITY_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

let dailyActivitySchedules = [];

let schedulerActiveMechanics = [];
let schedulerAvailableUnits = [];
let schedulerSelectedUnitIds = new Set();
let schedulerEditingScheduleId = "";
let schedulerEditingLockedUnitIds = new Set();
let schedulerEditingExistingUnits = [];

document.addEventListener("DOMContentLoaded", initializeDailyActivity);

async function initializeDailyActivity() {
  const user = getDailyActivitySessionUser();
  if (!user) return;

  initializeDailyActivityDate();
  document.getElementById("refreshDailyActivityButton")
    ?.addEventListener("click", loadDailyActivitySchedule);
  document.getElementById("activityDate")
    ?.addEventListener("change", loadDailyActivitySchedule);
  initializeSchedulerPanel();
  initializeDailyActivityUnitCardDelegation();

  await loadDailyActivitySchedule();
}

function getDailyActivitySessionUser() {
  const loggedIn = sessionStorage.getItem("hexaLoggedIn");
  const rawUser = sessionStorage.getItem("hexaUser");

  if (loggedIn !== "true" || !rawUser) {
    window.location.replace("index.html");
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    if (!user || !user.uniqId || !user.userId) throw new Error("Invalid session");
    return user;
  } catch (error) {
    sessionStorage.removeItem("hexaLoggedIn");
    sessionStorage.removeItem("hexaUser");
    window.location.replace("index.html");
    return null;
  }
}

function initializeDailyActivityDate() {
  const input = document.getElementById("activityDate");
  if (!input || input.value) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  input.value = `${year}-${month}-${day}`;
}

async function dailyActivityApiRequest(payload) {
  const response = await fetch(DAILY_ACTIVITY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("HTTP " + response.status);
  return await response.json();
}

async function loadDailyActivitySchedule() {
  const activityDate =
    document.getElementById("activityDate")?.value?.trim() || "";

  if (!activityDate) {
    showDailyActivityMessage("Activity Date belum dipilih.");
    return;
  }

  setDailyActivityLoadingState();

  try {
    const result = await dailyActivityApiRequest({
      action: "getDMScheduleByDate",
      activityDate: activityDate
    });

    if (!result || result.success !== true) {
      throw new Error(result?.message || "Unable to load Daily Activity Schedule.");
    }

    dailyActivitySchedules =
      Array.isArray(result.schedules) ? result.schedules : [];

    renderDailyActivitySchedules();
  } catch (error) {
    console.error("HEXA Daily Activity load error:", error);
    setDailyActivityErrorState(
      error.message || "Unable to load Daily Activity Schedule."
    );
  }
}

function renderDailyActivitySchedules() {
  hideDailyActivityLoading();
  hideDailyActivityMessage();
  resetLubeTruckCard(15);
  resetLubeTruckCard(16);

  const empty = document.getElementById("dailyActivityEmpty");

  if (!dailyActivitySchedules.length) {
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  dailyActivitySchedules.forEach(schedule => {
    const truckNumber = getLubeTruckNumber(schedule?.lubeTruck);
    if (truckNumber === 15 || truckNumber === 16) {
      renderLubeTruckSchedule(truckNumber, schedule);
    }
  });
}

function renderLubeTruckSchedule(truckNumber, schedule) {
  const editButton =
    document.getElementById(`lubeTruck${truckNumber}EditButton`);

  // Sementara untuk pengujian:
  // jika card memiliki schedule, tombol Edit langsung tampil.
  // Nanti ditambah filter permission Scheduler / Edit Schedule.
  if (editButton) {
    editButton.hidden = false;
  }

  setDailyActivityText(
    `lubeTruck${truckNumber}ScheduleStatus`,
    cleanDailyActivityValue(schedule?.status) || "-"
  );

  setDailyActivityText(
    `lubeTruck${truckNumber}Mechanic1`,
    getMechanicName(schedule?.mechanic1)
  );

  setDailyActivityText(
    `lubeTruck${truckNumber}Mechanic2`,
    getMechanicName(schedule?.mechanic2)
  );

  const units = Array.isArray(schedule?.units) ? [...schedule.units] : [];

  units.sort((a, b) => {
    const seq = (Number(a?.sequence) || 0) - (Number(b?.sequence) || 0);
    if (seq) return seq;
    return cleanDailyActivityValue(a?.unitCode).localeCompare(
      cleanDailyActivityValue(b?.unitCode),
      "id",
      { numeric: true, sensitivity: "base" }
    );
  });

  renderLubeTruckUnits(truckNumber, units);
  renderLubeTruckProgress(truckNumber, units);
}

function getMechanicName(mechanic) {
  if (!mechanic) return "-";
  if (typeof mechanic === "string") return cleanDailyActivityValue(mechanic) || "-";

  return (
    cleanDailyActivityValue(mechanic.name) ||
    cleanDailyActivityValue(mechanic.nama) ||
    cleanDailyActivityValue(mechanic.userName) ||
    "-"
  );
}

function renderLubeTruckUnits(truckNumber, units) {
  const container = document.getElementById(`lubeTruck${truckNumber}Units`);
  const empty = document.getElementById(`lubeTruck${truckNumber}Empty`);
  if (!container) return;

  container.innerHTML = "";

  if (!units.length) {
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  units.forEach(unit => {
    container.appendChild(createDailyActivityUnitCard(unit));
  });
}

function initializeDailyActivityUnitCardDelegation() {
  document.addEventListener("click", function (event) {
    const card = event.target.closest(".daily-unit-card");
    if (!card) return;

    const scheduleUnitId =
      cleanDailyActivityValue(card.dataset.scheduleUnitId);

    let selectedUnit = null;

    dailyActivitySchedules.some(schedule => {
      const units = Array.isArray(schedule?.units) ? schedule.units : [];

      selectedUnit =
        units.find(unit =>
          cleanDailyActivityValue(unit?.scheduleUnitId) === scheduleUnitId
        ) || null;

      return Boolean(selectedUnit);
    });

    if (!selectedUnit) {
      console.error(
        "HEXA Daily Activity: data Unit Card tidak ditemukan.",
        scheduleUnitId
      );
      return;
    }

    openDailyActivityInspection(selectedUnit);
  });
}


function createDailyActivityUnitCard(unit) {
  const card = document.createElement("button");
  card.type = "button";

  const status = normalizeDailyActivityStatus(unit?.status);
  card.className =
    "daily-unit-card " + getDailyActivityUnitStatusClass(status);

  card.dataset.scheduleUnitId =
    cleanDailyActivityValue(unit?.scheduleUnitId);

  const unitCode = document.createElement("strong");
  unitCode.className = "daily-unit-code";
  unitCode.textContent = cleanDailyActivityValue(unit?.unitCode) || "-";

  card.append(unitCode);



  return card;
}

function renderLubeTruckProgress(truckNumber, units) {
  const total = units.length;
  const completed = units.filter(
    unit => normalizeDailyActivityStatus(unit?.status) === "COMPLETED"
  ).length;

  const percentage = total ? Math.round((completed / total) * 100) : 0;

  setDailyActivityText(
    `lubeTruck${truckNumber}ProgressText`,
    `${completed} / ${total}`
  );

  const bar = document.getElementById(`lubeTruck${truckNumber}ProgressBar`);
  if (bar) bar.style.width = `${percentage}%`;
}

function resetLubeTruckCard(truckNumber) {
  setDailyActivityText(`lubeTruck${truckNumber}ScheduleStatus`, "-");
  setDailyActivityText(`lubeTruck${truckNumber}Mechanic1`, "-");
  setDailyActivityText(`lubeTruck${truckNumber}Mechanic2`, "-");
  setDailyActivityText(`lubeTruck${truckNumber}ProgressText`, "0 / 0");

  const bar = document.getElementById(`lubeTruck${truckNumber}ProgressBar`);
  if (bar) bar.style.width = "0%";

  const units = document.getElementById(`lubeTruck${truckNumber}Units`);
  if (units) units.innerHTML = "";

  const empty = document.getElementById(`lubeTruck${truckNumber}Empty`);
  if (empty) empty.hidden = false;

  const editButton =
    document.getElementById(`lubeTruck${truckNumber}EditButton`);

  // Card tanpa schedule tidak menampilkan Edit.
  if (editButton) {
    editButton.hidden = true;
  }
}

function normalizeDailyActivityStatus(status) {
  return cleanDailyActivityValue(status)
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function formatDailyActivityStatus(status) {
  const normalized = normalizeDailyActivityStatus(status);

  const labels = {
    "NOT STARTED": "Not Started",
    "IN PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "NOT COMPLETED": "Not Completed"
  };

  return labels[normalized] || normalized || "-";
}

function getDailyActivityUnitStatusClass(status) {
  const normalized = normalizeDailyActivityStatus(status);

  if (normalized === "COMPLETED") return "is-completed";
  if (normalized === "IN PROGRESS") return "is-in-progress";
  if (normalized === "NOT COMPLETED") return "is-not-completed";
  return "is-not-started";
}

function getLubeTruckNumber(value) {
  const text = cleanDailyActivityValue(value).toUpperCase();
  if (text.includes("15")) return 15;
  if (text.includes("16")) return 16;
  return 0;
}

function setDailyActivityLoadingState() {
  hideDailyActivityMessage();

  const loading = document.getElementById("dailyActivityLoading");
  const empty = document.getElementById("dailyActivityEmpty");

  if (loading) loading.hidden = false;
  if (empty) empty.hidden = true;
}

function hideDailyActivityLoading() {
  const loading = document.getElementById("dailyActivityLoading");
  if (loading) loading.hidden = true;
}

function setDailyActivityErrorState(message) {
  hideDailyActivityLoading();
  resetLubeTruckCard(15);
  resetLubeTruckCard(16);

  const empty = document.getElementById("dailyActivityEmpty");
  if (empty) empty.hidden = true;

  showDailyActivityMessage(message);
}

function showDailyActivityMessage(message) {
  const element = document.getElementById("dailyActivityMessage");
  if (!element) return;

  element.textContent = cleanDailyActivityValue(message);
  element.hidden = false;
}

function hideDailyActivityMessage() {
  const element = document.getElementById("dailyActivityMessage");
  if (!element) return;

  element.textContent = "";
  element.hidden = true;
}

function setDailyActivityText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  element.textContent = cleanDailyActivityValue(value) || "-";
}

function cleanDailyActivityValue(value) {
  return value == null ? "" : String(value).trim();
}


/* =====================================================
   SCHEDULER PANEL
   STAGE 2A - OPEN / CLOSE ONLY
===================================================== */

function initializeSchedulerPanel() {
  const openButton = document.getElementById("openSchedulerButton");
  const backdrop = document.getElementById("schedulerPanelBackdrop");
  const closeButton = document.getElementById("closeSchedulerPanel");
  const cancelButton = document.getElementById("cancelSchedulerPanel");
  const saveButton = document.getElementById("saveSchedulerButton");
  const activityDate = document.getElementById("activityDate");
  const schedulerDate = document.getElementById("schedulerActivityDate");

  function openPanel() {
    if (!backdrop) return;

    if (schedulerDate && activityDate?.value) {
      schedulerDate.value = activityDate.value;
    }

    backdrop.style.removeProperty("display");
    backdrop.hidden = false;
    document.body.classList.add("scheduler-panel-open");

    loadSchedulerReferenceData();
  }

  function closePanel() {
    if (!backdrop) return;
    backdrop.hidden = true;
    document.body.classList.remove("scheduler-panel-open");
  }

  openButton?.addEventListener("click", openPanel);
  closeButton?.addEventListener("click", closePanel);
  cancelButton?.addEventListener("click", closePanel);

  backdrop?.addEventListener("click", function (event) {
    if (event.target === backdrop) {
      closePanel();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && backdrop && !backdrop.hidden) {
      closePanel();
    }
  });

  const mechanic1 = document.getElementById("schedulerMechanic1");
  const mechanic2 = document.getElementById("schedulerMechanic2");
  const unitSearch = document.getElementById("schedulerUnitSearch");

  mechanic1?.addEventListener("change", updateSchedulerMechanicOptions);
  mechanic2?.addEventListener("change", updateSchedulerMechanicOptions);

  unitSearch?.addEventListener("input", renderSchedulerUnitList);
  saveButton?.addEventListener("click", saveSchedulerSchedule);

  document.getElementById("lubeTruck15EditButton")
    ?.addEventListener("click", () => openEditSchedulePanel("15"));

  document.getElementById("lubeTruck16EditButton")
    ?.addEventListener("click", () => openEditSchedulePanel("16"));
}


/* =====================================================
   SCHEDULER REFERENCE DATA
   STAGE 2B
===================================================== */

async function loadSchedulerReferenceData() {
  setSchedulerReferenceLoading(true);

  try {
    const [mechanicResult, unitResult] = await Promise.all([
      dailyActivityApiRequest({
        action: "getActiveMechanics"
      }),
      dailyActivityApiRequest({
        action: "getAvailableDMScheduleUnits"
      })
    ]);

    if (!mechanicResult || mechanicResult.success !== true) {
      throw new Error(
        mechanicResult?.message ||
        "Unable to load active mechanics."
      );
    }

    if (!unitResult || unitResult.success !== true) {
      throw new Error(
        unitResult?.message ||
        "Unable to load available units."
      );
    }

    schedulerActiveMechanics =
      extractSchedulerArray(
        mechanicResult,
        ["mechanics", "data", "users"]
      );

    schedulerAvailableUnits =
      extractSchedulerArray(
        unitResult,
        ["units", "data"]
      );

    schedulerSelectedUnitIds.clear();
    schedulerEditingScheduleId = "";
    schedulerEditingLockedUnitIds.clear();
    schedulerEditingExistingUnits = [];

    renderSchedulerMechanicOptions();
    renderSchedulerUnitList();
    updateSchedulerSelectedCount();

  } catch (error) {
    console.error("HEXA Scheduler reference data error:", error);

    schedulerActiveMechanics = [];
    schedulerAvailableUnits = [];
    schedulerSelectedUnitIds.clear();

    renderSchedulerMechanicOptions();
    renderSchedulerUnitError(
      error.message || "Unable to load Scheduler data."
    );
    updateSchedulerSelectedCount();
  } finally {
    setSchedulerReferenceLoading(false);
  }
}

function extractSchedulerArray(result, keys) {
  for (const key of keys) {
    if (Array.isArray(result?.[key])) {
      return result[key];
    }
  }
  return [];
}


/* =====================================================
   SCHEDULER MECHANICS
===================================================== */

function renderSchedulerMechanicOptions() {
  const mechanic1 = document.getElementById("schedulerMechanic1");
  const mechanic2 = document.getElementById("schedulerMechanic2");

  if (!mechanic1 || !mechanic2) return;

  const selected1 = mechanic1.value;
  const selected2 = mechanic2.value;

  fillSchedulerMechanicSelect(
    mechanic1,
    "Select Mechanic 1",
    selected1,
    selected2
  );

  fillSchedulerMechanicSelect(
    mechanic2,
    "Select Mechanic 2",
    selected2,
    selected1
  );
}

function updateSchedulerMechanicOptions() {
  renderSchedulerMechanicOptions();
}

function fillSchedulerMechanicSelect(
  select,
  placeholder,
  selectedValue,
  excludedValue
) {
  select.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);

  schedulerActiveMechanics.forEach(mechanic => {
    const id =
      cleanDailyActivityValue(
        mechanic?.uniqId ||
        mechanic?.id ||
        mechanic?.userId
      );

    const name =
      cleanDailyActivityValue(
        mechanic?.nama ||
        mechanic?.name ||
        mechanic?.userName
      );

    if (!id || !name) return;

    if (id === excludedValue && id !== selectedValue) {
      return;
    }

    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;

    if (id === selectedValue) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  if (
    selectedValue &&
    !Array.from(select.options).some(
      option => option.value === selectedValue
    )
  ) {
    select.value = "";
  }
}


/* =====================================================
   SCHEDULER UNIT LIST
===================================================== */

function renderSchedulerUnitList() {
  const container = document.getElementById("schedulerUnitList");
  const search = document.getElementById("schedulerUnitSearch");

  if (!container) return;

  const keyword =
    cleanDailyActivityValue(search?.value).toLowerCase();

  const mergedUnitMap = new Map();
  schedulerAvailableUnits.forEach(unit => {
    const id = cleanDailyActivityValue(unit?.unitId || unit?.uniqId || unit?.id);
    if (id) mergedUnitMap.set(id, unit);
  });
  schedulerEditingExistingUnits.forEach(unit => {
    const id = cleanDailyActivityValue(unit?.unitId);
    if (!id || mergedUnitMap.has(id)) return;
    mergedUnitMap.set(id, {
      unitId: id,
      unitCode: unit?.unitCode,
      egi: unit?.egi,
      type: unit?.type,
      status: ""
    });
  });
  const schedulerDisplayUnits = Array.from(mergedUnitMap.values());

  const filteredUnits = schedulerDisplayUnits.filter(unit => {
    const haystack = [
      unit?.unitCode,
      unit?.egi,
      unit?.type,
      unit?.status
    ]
      .map(cleanDailyActivityValue)
      .join(" ")
      .toLowerCase();

    return !keyword || haystack.includes(keyword);
  });

  container.innerHTML = "";

  if (!filteredUnits.length) {
    const empty = document.createElement("div");
    empty.className = "scheduler-unit-placeholder";
    empty.textContent =
      (schedulerAvailableUnits.length || schedulerEditingExistingUnits.length)
        ? "Unit tidak ditemukan."
        : "Tidak ada unit Running / Stand By yang tersedia.";

    container.appendChild(empty);
    return;
  }

  filteredUnits.forEach(unit => {
    container.appendChild(
      createSchedulerUnitOption(unit)
    );
  });
}

function createSchedulerUnitOption(unit) {
  const unitId =
    cleanDailyActivityValue(
      unit?.unitId ||
      unit?.uniqId ||
      unit?.id
    );

  const label = document.createElement("label");
  label.className = "scheduler-unit-option";

  if (schedulerSelectedUnitIds.has(unitId)) {
    label.classList.add("is-selected");
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = unitId;
  checkbox.checked = schedulerSelectedUnitIds.has(unitId);
  const isLocked = schedulerEditingLockedUnitIds.has(unitId);
  checkbox.disabled = isLocked;
  if (isLocked) {
    label.classList.add("is-locked");
    label.title = "Unit ini sudah memiliki progress dan tidak dapat dihapus dari schedule.";
  }

  const content = document.createElement("span");
  content.className = "scheduler-unit-option-content";

  const top = document.createElement("span");
  top.className = "scheduler-unit-option-top";

  const unitCode = document.createElement("strong");
  unitCode.textContent =
    cleanDailyActivityValue(unit?.unitCode) || "-";

  const status = document.createElement("span");
  status.className = "scheduler-unit-option-status";
  status.textContent =
    cleanDailyActivityValue(unit?.status) || "-";

  top.append(unitCode, status);

  const meta = document.createElement("span");
  meta.className = "scheduler-unit-option-meta";

  const egi =
    cleanDailyActivityValue(unit?.egi) || "-";

  const type =
    cleanDailyActivityValue(unit?.type) || "-";

  meta.textContent = `${egi} • ${type}`;

  content.append(top, meta);
  label.append(checkbox, content);

  checkbox.addEventListener("change", function () {
    if (!unitId) return;

    if (checkbox.checked) {
      schedulerSelectedUnitIds.add(unitId);
      label.classList.add("is-selected");
    } else {
      schedulerSelectedUnitIds.delete(unitId);
      label.classList.remove("is-selected");
    }

    updateSchedulerSelectedCount();
  });

  return label;
}

function updateSchedulerSelectedCount() {
  const element =
    document.getElementById("schedulerSelectedUnitCount");

  if (!element) return;

  const count = schedulerSelectedUnitIds.size;
  element.textContent =
    `${count} Selected`;
}


/* =====================================================
   SCHEDULER LOADING / ERROR
===================================================== */

function setSchedulerReferenceLoading(isLoading) {
  const mechanic1 = document.getElementById("schedulerMechanic1");
  const mechanic2 = document.getElementById("schedulerMechanic2");
  const search = document.getElementById("schedulerUnitSearch");
  const container = document.getElementById("schedulerUnitList");

  if (mechanic1) mechanic1.disabled = isLoading;
  if (mechanic2) mechanic2.disabled = isLoading;
  if (search) search.disabled = isLoading;

  if (isLoading && container) {
    container.innerHTML =
      '<div class="scheduler-unit-placeholder">Loading mechanics & unit...</div>';
  }
}

function renderSchedulerUnitError(message) {
  const container =
    document.getElementById("schedulerUnitList");

  if (!container) return;

  container.innerHTML = "";

  const error = document.createElement("div");
  error.className =
    "scheduler-unit-placeholder scheduler-unit-error";
  error.textContent = cleanDailyActivityValue(message);

  container.appendChild(error);
}


/* =====================================================
   SAVE SCHEDULER
   STAGE 2C
===================================================== */

async function saveSchedulerSchedule() {
  const saveButton = document.getElementById("saveSchedulerButton");
  const backdrop = document.getElementById("schedulerPanelBackdrop");

  const activityDate =
    cleanDailyActivityValue(
      document.getElementById("schedulerActivityDate")?.value
    );

  const lubeTruck =
    cleanDailyActivityValue(
      document.getElementById("schedulerLubeTruck")?.value
    );

  const mechanic1Id =
    cleanDailyActivityValue(
      document.getElementById("schedulerMechanic1")?.value
    );

  const mechanic2Id =
    cleanDailyActivityValue(
      document.getElementById("schedulerMechanic2")?.value
    );

  const unitIds =
    Array.from(schedulerSelectedUnitIds);

  if (!activityDate) {
    alert("Pilih Activity Date.");
    return;
  }

  if (!lubeTruck) {
    alert("Pilih Lube Truck.");
    return;
  }

  if (!mechanic1Id) {
    alert("Pilih Mechanic 1.");
    return;
  }

  if (!mechanic2Id) {
    alert("Pilih Mechanic 2.");
    return;
  }

  if (mechanic1Id === mechanic2Id) {
    alert("Mechanic 1 dan Mechanic 2 harus berbeda.");
    return;
  }

  if (!unitIds.length) {
    alert("Pilih minimal 1 Target Unit.");
    return;
  }

  const currentUser =
    getDailyActivitySessionUser();

  if (!currentUser) {
    return;
  }

  const requesterUniqId =
    cleanDailyActivityValue(
      currentUser.uniqId
    );

  if (!requesterUniqId) {
    alert("Session user tidak valid.");
    return;
  }

  const isEditMode = Boolean(schedulerEditingScheduleId);

  const originalText =
    saveButton?.textContent ||
    (isEditMode ? "Update Schedule" : "Save Schedule");

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent =
      isEditMode ? "Updating..." : "Saving...";
  }

  try {
    if (!isEditMode) {
      const existingResult =
        await dailyActivityApiRequest({
          action: "getDMScheduleByDate",
          activityDate: activityDate
        });

      if (existingResult?.success === true) {
        const targetTruckNumber = getLubeTruckNumber(lubeTruck);
        const duplicate =
          (Array.isArray(existingResult.schedules)
            ? existingResult.schedules
            : []
          ).find(schedule =>
            getLubeTruckNumber(schedule?.lubeTruck) === targetTruckNumber
          );

        if (duplicate) {
          alert(
            "Jadwal sudah terisi. Silakan update melalui fitur Edit."
          );
          return;
        }
      }
    }

    const payload = isEditMode
      ? {
          action: "updateDMSchedule",
          scheduleId: schedulerEditingScheduleId,
          requesterUniqId: requesterUniqId,
          mechanic1Id: mechanic1Id,
          mechanic2Id: mechanic2Id,
          unitIds: unitIds
        }
      : {
          action: "saveDMSchedule",
          activityDate: activityDate,
          lubeTruck: lubeTruck,
          mechanic1Id: mechanic1Id,
          mechanic2Id: mechanic2Id,
          createdById: requesterUniqId,
          unitIds: unitIds
        };

    const result =
      await dailyActivityApiRequest(payload);

    if (!result || result.success !== true) {
      throw new Error(
        result?.message ||
        "Schedule gagal disimpan."
      );
    }

    const mainDate =
      document.getElementById("activityDate");

    if (mainDate) {
      mainDate.value = activityDate;
    }

    if (backdrop) {
      backdrop.hidden = true;
      backdrop.style.display = "none";
    }

    document.body.classList.remove(
      "scheduler-panel-open"
    );

    resetSchedulerForm();

    await loadDailyActivitySchedule();

    alert(
      isEditMode
        ? "Schedule berhasil diperbarui."
        : "Schedule berhasil disimpan."
    );

  } catch (error) {
    console.error(
      "HEXA Scheduler save error:",
      error
    );

    alert(
      error.message ||
      "Schedule gagal disimpan."
    );

  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  }
}


/* =====================================================
   RESET SCHEDULER FORM AFTER SAVE
===================================================== */

function resetSchedulerForm() {
  const lubeTruck =
    document.getElementById("schedulerLubeTruck");

  const mechanic1 =
    document.getElementById("schedulerMechanic1");

  const mechanic2 =
    document.getElementById("schedulerMechanic2");

  const search =
    document.getElementById("schedulerUnitSearch");

  if (lubeTruck) {
    lubeTruck.value = "";
  }

  if (mechanic1) {
    mechanic1.value = "";
  }

  if (mechanic2) {
    mechanic2.value = "";
  }

  if (search) {
    search.value = "";
  }

  schedulerSelectedUnitIds.clear();
  schedulerEditingScheduleId = "";
  schedulerEditingLockedUnitIds.clear();
  schedulerEditingExistingUnits = [];

  const saveButton = document.getElementById("saveSchedulerButton");
  if (saveButton) saveButton.textContent = "Save Schedule";

  const dateInput = document.getElementById("schedulerActivityDate");
  const lubeTruckSelect = document.getElementById("schedulerLubeTruck");
  const panelTitle = document.getElementById("schedulerPanelTitle");

  if (dateInput) dateInput.disabled = false;
  if (lubeTruckSelect) lubeTruckSelect.disabled = false;
  if (panelTitle) panelTitle.textContent = "Scheduler";

  renderSchedulerMechanicOptions();
  renderSchedulerUnitList();
  updateSchedulerSelectedCount();
}


/* =====================================================
   SCHEDULER CREATE / EDIT MODE - STAGE 2F-B
===================================================== */

async function syncSchedulerCreateEditMode() {
  const activityDate = cleanDailyActivityValue(
    document.getElementById("schedulerActivityDate")?.value
  );
  const lubeTruck = cleanDailyActivityValue(
    document.getElementById("schedulerLubeTruck")?.value
  );
  const saveButton = document.getElementById("saveSchedulerButton");

  schedulerEditingScheduleId = "";
  schedulerEditingLockedUnitIds.clear();
  schedulerEditingExistingUnits = [];
  schedulerSelectedUnitIds.clear();

  if (saveButton) saveButton.textContent = "Save Schedule";

  if (!activityDate || !lubeTruck) {
    renderSchedulerMechanicOptions();
    renderSchedulerUnitList();
    updateSchedulerSelectedCount();
    return;
  }

  try {
    const result = await dailyActivityApiRequest({
      action: "getDMScheduleByDate",
      activityDate: activityDate
    });

    if (!result || result.success !== true) {
      throw new Error(result?.message || "Unable to check existing schedule.");
    }

    const schedules = Array.isArray(result.schedules) ? result.schedules : [];
    const targetTruckNumber = getLubeTruckNumber(lubeTruck);
    const existing = schedules.find(schedule =>
      getLubeTruckNumber(schedule?.lubeTruck) === targetTruckNumber
    );

    if (!existing) {
      renderSchedulerMechanicOptions();
      renderSchedulerUnitList();
      updateSchedulerSelectedCount();
      return;
    }

    schedulerEditingScheduleId = cleanDailyActivityValue(existing?.scheduleId);
    schedulerEditingExistingUnits =
      Array.isArray(existing?.units) ? [...existing.units] : [];

    schedulerEditingExistingUnits.forEach(unit => {
      const unitId = cleanDailyActivityValue(unit?.unitId);
      if (!unitId) return;
      schedulerSelectedUnitIds.add(unitId);
      if (normalizeDailyActivityStatus(unit?.status) !== "NOT STARTED") {
        schedulerEditingLockedUnitIds.add(unitId);
      }
    });

    const mechanic1 = document.getElementById("schedulerMechanic1");
    const mechanic2 = document.getElementById("schedulerMechanic2");
    const mechanic1Id = getSchedulerMechanicId(existing?.mechanic1);
    const mechanic2Id = getSchedulerMechanicId(existing?.mechanic2);

    if (mechanic1) mechanic1.value = mechanic1Id;
    if (mechanic2) mechanic2.value = mechanic2Id;
    renderSchedulerMechanicOptions();
    if (mechanic1) mechanic1.value = mechanic1Id;
    if (mechanic2) mechanic2.value = mechanic2Id;

    renderSchedulerUnitList();
    updateSchedulerSelectedCount();

    if (saveButton) saveButton.textContent = "Update Schedule";

  } catch (error) {
    console.error("HEXA Scheduler edit-mode check error:", error);
    schedulerEditingScheduleId = "";
    schedulerEditingLockedUnitIds.clear();
    schedulerEditingExistingUnits = [];
    schedulerSelectedUnitIds.clear();
    renderSchedulerMechanicOptions();
    renderSchedulerUnitList();
    updateSchedulerSelectedCount();
    if (saveButton) saveButton.textContent = "Save Schedule";
    alert(error.message || "Gagal memeriksa schedule existing.");
  }
}

function getSchedulerMechanicId(mechanic) {
  if (!mechanic || typeof mechanic === "string") return "";
  return cleanDailyActivityValue(
    mechanic?.uniqId || mechanic?.id || mechanic?.userId
  );
}


/* =====================================================
   OPEN EDIT FROM LUBE TRUCK CARD
   Scheduler = CREATE only
   Card Edit = UPDATE only
===================================================== */

async function openEditSchedulePanel(truckNumber) {
  const activityDate =
    cleanDailyActivityValue(
      document.getElementById("activityDate")?.value
    );

  if (!activityDate) {
    alert("Pilih Activity Date terlebih dahulu.");
    return;
  }

  const lubeTruck = `LUBE TRUCK ${truckNumber}`;

  try {
    const backdrop =
      document.getElementById("schedulerPanelBackdrop");

    if (!backdrop) {
      throw new Error("Scheduler panel tidak ditemukan.");
    }

    backdrop.style.removeProperty("display");
    backdrop.hidden = false;
    document.body.classList.add("scheduler-panel-open");

    const dateInput =
      document.getElementById("schedulerActivityDate");

    const lubeTruckSelect =
      document.getElementById("schedulerLubeTruck");

    const panelTitle =
      document.getElementById("schedulerPanelTitle");

    const saveButton =
      document.getElementById("saveSchedulerButton");

    if (panelTitle) {
      panelTitle.textContent = "Edit Schedule";
    }

    if (dateInput) {
      dateInput.value = activityDate;
      dateInput.disabled = true;
    }

    if (lubeTruckSelect) {
      lubeTruckSelect.value = lubeTruck;
      lubeTruckSelect.disabled = true;
    }

    schedulerEditingScheduleId = "";
    schedulerEditingLockedUnitIds.clear();
    schedulerEditingExistingUnits = [];
    schedulerSelectedUnitIds.clear();

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Loading...";
    }

    await loadSchedulerReferenceData();

    const result =
      await dailyActivityApiRequest({
        action: "getDMScheduleByDate",
        activityDate: activityDate
      });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message ||
        "Gagal membaca schedule existing."
      );
    }

    const existing =
      (Array.isArray(result.schedules)
        ? result.schedules
        : []
      ).find(schedule =>
        getLubeTruckNumber(schedule?.lubeTruck) ===
        getLubeTruckNumber(lubeTruck)
      );

    if (!existing) {
      throw new Error(
        "Schedule tidak ditemukan. Gunakan Scheduler untuk membuat jadwal baru."
      );
    }

    schedulerEditingScheduleId =
      cleanDailyActivityValue(existing.scheduleId);

    schedulerEditingExistingUnits =
      Array.isArray(existing.units)
        ? [...existing.units]
        : [];

    schedulerEditingExistingUnits.forEach(unit => {
      const unitId =
        cleanDailyActivityValue(unit?.unitId);

      if (!unitId) return;

      schedulerSelectedUnitIds.add(unitId);

      if (
        normalizeDailyActivityStatus(unit?.status) !==
        "NOT STARTED"
      ) {
        schedulerEditingLockedUnitIds.add(unitId);
      }
    });

    const mechanic1 =
      document.getElementById("schedulerMechanic1");

    const mechanic2 =
      document.getElementById("schedulerMechanic2");

    const mechanic1Id =
      getSchedulerMechanicId(existing.mechanic1);

    const mechanic2Id =
      getSchedulerMechanicId(existing.mechanic2);

    renderSchedulerMechanicOptions();

    if (mechanic1) mechanic1.value = mechanic1Id;
    if (mechanic2) mechanic2.value = mechanic2Id;

    renderSchedulerUnitList();
    updateSchedulerSelectedCount();

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Update Schedule";
    }

  } catch (error) {
    console.error("HEXA open Edit Schedule error:", error);
    alert(
      error.message ||
      "Gagal membuka Edit Schedule."
    );
    closeSchedulerPanel();
  }
}


/* =====================================================
   DAILY ACTIVITY INSPECTION - STAGE 3A
   UNIT CARD -> LOAD CHECKLIST BY UNIT
   Read-only preview. Belum menyimpan hasil inspeksi.
===================================================== */

async function openDailyActivityInspection(unit) {
  const unitCode = cleanDailyActivityValue(unit?.unitCode);

  if (!unitCode) {
    alert("Unit Code tidak ditemukan.");
    return;
  }

  try {
    const result = await dailyActivityApiRequest({
      action: "getDMChecklistByUnit",
      unitCode: unitCode
    });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message || "Checklist Daily Activity gagal dimuat."
      );
    }

    const checklist = extractDailyActivityChecklist(result);

    showDailyActivityInspectionPreview({
      unitCode: unitCode,
      egi: cleanDailyActivityValue(result?.egi || result?.unit?.egi || unit?.egi),
      type: cleanDailyActivityValue(
        result?.type || result?.equipmentType || result?.unit?.type || unit?.type
      ),
      checklist: checklist
    });

  } catch (error) {
    console.error("HEXA Daily Activity checklist error:", error);
    alert(error.message || "Checklist Daily Activity gagal dimuat.");
  }
}

function extractDailyActivityChecklist(result) {
  for (const value of [
    result?.checklist,
    result?.items,
    result?.data,
    result?.checklists
  ]) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function showDailyActivityInspectionPreview(data) {
  let backdrop = document.getElementById("dailyActivityInspectionBackdrop");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "dailyActivityInspectionBackdrop";
    backdrop.className = "daily-activity-inspection-backdrop";
    backdrop.hidden = true;

    backdrop.innerHTML = `
      <section class="daily-activity-inspection-panel" role="dialog" aria-modal="true">
        <header class="daily-activity-inspection-header">
          <div>
            <p class="daily-activity-inspection-eyebrow">Daily Activity Inspection</p>
            <h2 id="dailyActivityInspectionTitle">-</h2>
            <p id="dailyActivityInspectionMeta" class="daily-activity-inspection-meta">-</p>
          </div>
          <button type="button" id="closeDailyActivityInspection"
                  class="daily-activity-inspection-close" aria-label="Close">×</button>
        </header>
        <div id="dailyActivityInspectionBody"
             class="daily-activity-inspection-body"></div>
        <footer class="daily-activity-inspection-footer">
          <span id="dailyActivityInspectionCount">0 Checklist</span>
          <button type="button" id="closeDailyActivityInspectionFooter"
                  class="daily-activity-inspection-done">Close</button>
        </footer>
      </section>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.hidden = true;
      document.body.classList.remove("daily-activity-inspection-open");
    };

    document.getElementById("closeDailyActivityInspection")
      ?.addEventListener("click", close);
    document.getElementById("closeDailyActivityInspectionFooter")
      ?.addEventListener("click", close);
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) close();
    });
  }

  setDailyActivityText("dailyActivityInspectionTitle", data.unitCode);
  setDailyActivityText(
    "dailyActivityInspectionMeta",
    `${data.egi || "-"} • ${data.type || "-"}`
  );

  const body = document.getElementById("dailyActivityInspectionBody");
  const count = document.getElementById("dailyActivityInspectionCount");
  if (!body) return;

  body.innerHTML = "";
  const groups = new Map();

  data.checklist.forEach(item => {
    const groupName = cleanDailyActivityValue(item?.group) || "CHECKLIST";
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName).push(item);
  });

  groups.forEach((items, groupName) => {
    const group = document.createElement("section");
    group.className = "daily-activity-inspection-group";

    const title = document.createElement("h3");
    title.textContent = groupName;
    group.appendChild(title);

    items.sort((a, b) =>
      (Number(a?.sequence) || 0) - (Number(b?.sequence) || 0)
    ).forEach(item => {
      const row = document.createElement("div");
      row.className = "daily-activity-inspection-item";

      const itemText = document.createElement("span");
      itemText.className = "daily-activity-inspection-item-text";
      itemText.textContent = cleanDailyActivityValue(item?.item) || "-";

      const options = document.createElement("div");
      options.className = "daily-activity-inspection-options";

      [
        ["GOOD", "✓", "Good Condition"],
        ["BAD", "X", "Bad Condition"],
        ["REPAIRED", "ⓧ", "Good Condition After Repair / Action"]
      ].forEach(([value, symbol, label]) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "daily-activity-inspection-option";
        option.dataset.value = value;
        option.title = label;
        option.setAttribute("aria-label", label);
        option.textContent = symbol;
        option.addEventListener("click", () => {
          options.querySelectorAll(".daily-activity-inspection-option")
            .forEach(button => button.classList.remove("is-selected"));
          option.classList.add("is-selected");
        });
        options.appendChild(option);
      });

      row.append(itemText, options);
      group.appendChild(row);
    });

    body.appendChild(group);
  });

  if (!data.checklist.length) {
    const empty = document.createElement("div");
    empty.className = "daily-activity-inspection-empty";
    empty.textContent = "Checklist tidak ditemukan untuk unit ini.";
    body.appendChild(empty);
  }

  if (count) count.textContent = `${data.checklist.length} Checklist`;

  backdrop.hidden = false;
  document.body.classList.add("daily-activity-inspection-open");
}
