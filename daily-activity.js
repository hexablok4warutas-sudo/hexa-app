"use strict";

const DAILY_ACTIVITY_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

let dailyActivitySchedules = [];

let schedulerActiveMechanics = [];
let schedulerAvailableUnits = [];
let schedulerSelectedUnitIds = new Set();

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

  const egi = document.createElement("span");
  egi.className = "daily-unit-egi";
  egi.textContent = cleanDailyActivityValue(unit?.egi) || "-";

  const type = document.createElement("span");
  type.className = "daily-unit-type";
  type.textContent = cleanDailyActivityValue(unit?.type) || "-";

  const statusElement = document.createElement("span");
  statusElement.className = "daily-unit-status";
  statusElement.textContent = formatDailyActivityStatus(status);

  card.append(unitCode, egi, type, statusElement);

  card.addEventListener("click", () => {
    console.log("HEXA Daily Activity selected unit:", unit);
  });

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

  const filteredUnits = schedulerAvailableUnits.filter(unit => {
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
      schedulerAvailableUnits.length
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

  const createdById =
    cleanDailyActivityValue(
      currentUser.uniqId
    );

  if (!createdById) {
    alert("Session user tidak valid.");
    return;
  }

  const originalText =
    saveButton?.textContent || "Save Schedule";

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
  }

  try {
    const result =
      await dailyActivityApiRequest({
        action: "saveDMSchedule",
        activityDate: activityDate,
        lubeTruck: lubeTruck,
        mechanic1Id: mechanic1Id,
        mechanic2Id: mechanic2Id,
        createdById: createdById,
        unitIds: unitIds
      });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message ||
        "Schedule gagal disimpan."
      );
    }

    alert("Schedule berhasil disimpan.");

    if (backdrop) {
      backdrop.hidden = true;
    }

    document.body.classList.remove(
      "scheduler-panel-open"
    );

    const mainDate =
      document.getElementById("activityDate");

    if (mainDate) {
      mainDate.value = activityDate;
    }

    resetSchedulerForm();

    await loadDailyActivitySchedule();

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

  renderSchedulerMechanicOptions();
  renderSchedulerUnitList();
  updateSchedulerSelectedCount();
}
