        "use strict";

        const DAILY_ACTIVITY_API_URL =
          "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

        let dailyActivitySchedules = [];

// =============================================================
// HEXA DAILY ACTIVITY — OFFLINE STAGE 1 (READ-ONLY CACHE)
// Dedicated IndexedDB; never touches Start Inspection drafts.
// =============================================================
const DA_OFFLINE_DB = "HEXA_DAILY_ACTIVITY_OFFLINE_V1";
function daOfflineOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DA_OFFLINE_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("snapshots"))
        req.result.createObjectStore("snapshots");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function daOfflineOwner() {
  const user = getDailyActivitySessionUser();
  return user ? String(user.uniqId) + ":" + String(user.userId) : "";
}
async function daOfflineWrite(kind, key, value) {
  const owner = daOfflineOwner();
  if (!owner) return;
  const db = await daOfflineOpen();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("snapshots", "readwrite");
      tx.objectStore("snapshots").put({value, savedAt: Date.now()}, owner + ":" + kind + ":" + key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
async function daOfflineRead(kind, key, maxAgeMs) {
  const owner = daOfflineOwner();
  if (!owner) return null;
  const db = await daOfflineOpen();
  try {
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction("snapshots", "readonly");
      const req = tx.objectStore("snapshots").get(owner + ":" + kind + ":" + key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (!record || (maxAgeMs && Date.now() - record.savedAt > maxAgeMs)) return null;
    return record.value;
  } finally { db.close(); }
}
function daOfflineNotice(message) {
  let el = document.getElementById("daOfflineNotice");
  if (!el) {
    el = document.createElement("div");
    el.id = "daOfflineNotice";
    el.style.cssText = "max-width:1180px;margin:10px auto;padding:12px 16px;border:1px solid #efb34b;border-radius:12px;background:#fff7e8;color:#654400;font:600 13px Arial";
    const grid = document.getElementById("dailyActivityScheduleGrid");
    grid?.parentElement?.insertBefore(el, grid);
  }
  el.textContent = message;
  el.hidden = false;
}
function daOfflineClearNotice() {
  const el = document.getElementById("daOfflineNotice");
  if (el) el.hidden = true;
}


// =============================================================
// HEXA DAILY ACTIVITY — STAGE 2A: LOCAL DRAFT + PHOTO
// Separate from read-only Stage 1 cache and Start Inspection DB.
// =============================================================
const DA_DRAFT_DB = "HEXA_DAILY_ACTIVITY_DRAFTS_V1";
function daDraftOpen() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DA_DRAFT_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("drafts"))
        request.result.createObjectStore("drafts");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function daDraftKey(scheduleUnitId) {
  const owner = daOfflineOwner();
  if (!owner || !scheduleUnitId) throw new Error("Identitas Draft tidak tersedia.");
  return owner + ":" + scheduleUnitId;
}
async function daDraftPut(scheduleUnitId, value) {
  const db = await daDraftOpen();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      tx.objectStore("drafts").put(value, daDraftKey(scheduleUnitId));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
async function daDraftGet(scheduleUnitId) {
  const db = await daDraftOpen();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction("drafts", "readonly")
        .objectStore("drafts").get(daDraftKey(scheduleUnitId));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
}
// Stage 2B: pending final remains on device until Stage 2C sync confirms server receipt.
async function daDraftPendingCount(scheduleId) {
  const owner = daOfflineOwner();
  if (!owner) return 0;
  const db = await daDraftOpen();
  try {
    const records = await new Promise((resolve,reject) => {
      const req = db.transaction("drafts", "readonly").objectStore("drafts").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return records.filter(item => item?.owner === owner &&
      item?.status === "PENDING_SYNC" && item?.scheduleId === scheduleId).length;
  } finally { db.close(); }
}
// Stage 2B.1 — Visual status local, tidak mengubah status server / KPI.
let daCardPaintSequence = 0;
async function daRefreshLocalUnitCards() {
  const sequence = ++daCardPaintSequence;
  const schedules = dailyActivitySchedules;
  await Promise.all(schedules.map(async schedule => {
    const units = schedule.units || [];
    for (const unit of units) {
      const id = cleanDailyActivityValue(unit.scheduleUnitId);
      if (!id) continue;
      const card = document.querySelector(`.daily-unit-card[data-schedule-unit-id="${CSS.escape(id)}"]`);
      const local = await daDraftGet(id).catch(() => null);
      if (sequence !== daCardPaintSequence) return;
      const submitted = local?.status === "PENDING_SYNC" || local?.status === "SYNCED";
      const draft = local?.status === "DRAFT_OFFLINE";
      const serverDone = normalizeDailyActivityStatus(unit.status) === "COMPLETED";
      if (card) {
        card.className = "daily-unit-card " + getDailyActivityUnitStatusClass(serverDone || submitted ? "COMPLETED" : draft ? "IN PROGRESS" : unit.status);
        card.querySelector(".da-local-status")?.remove();
        card.style.removeProperty("background-color");
        card.style.removeProperty("border-color");
      }
    }
    const truck = getLubeTruckNumber(schedule.lubeTruck);
    const completed = await Promise.all(units.map(async unit => {
      if (normalizeDailyActivityStatus(unit.status) === "COMPLETED") return true;
      const local = await daDraftGet(cleanDailyActivityValue(unit.scheduleUnitId)).catch(() => null);
      return local?.status === "PENDING_SYNC" || local?.status === "SYNCED";
    }));
    if (sequence !== daCardPaintSequence || !truck) return;
    const count = completed.filter(Boolean).length;
    setDailyActivityText(`lubeTruck${truck}ProgressText`, `${count} / ${units.length}`);
    const bar = document.getElementById(`lubeTruck${truck}ProgressBar`);
    if (bar) bar.style.width = `${units.length ? count / units.length * 100 : 0}%`;
  }));
}
let daSyncRunning = false;
function daSyncOverlay() {
  let overlay = document.getElementById("daSyncOverlay");
  if (!overlay) {
    overlay = document.createElement("div"); overlay.id = "daSyncOverlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483640;background:rgba(10,20,30,.65);display:flex;align-items:center;justify-content:center;padding:20px";
    overlay.innerHTML = `<div style="background:white;border-radius:18px;padding:28px;max-width:420px;width:100%;font-family:Arial;text-align:center"><h3 style="margin:0 0 12px">Sinkronisasi Daily Activity</h3><div id="daSyncStep" style="font-size:22px;font-weight:700;margin:12px">0/0</div><div style="height:10px;background:#eee;border-radius:8px;overflow:hidden"><div id="daSyncBar" style="height:100%;width:0;background:#16a34a;transition:width .2s"></div></div><p id="daSyncUnit" style="font-size:13px;margin:12px 0 0">Mengirim data...</p></div>`;
    document.body.appendChild(overlay);
  }
  overlay.hidden = false;
  overlay.style.display = "flex";
  return overlay;
}
function daSyncUpdate(done, total, name) {
  const overlay = daSyncOverlay();
  overlay.querySelector("#daSyncStep").textContent = `${done}/${total}`;
  overlay.querySelector("#daSyncBar").style.width = `${total ? done / total * 100 : 100}%`;
  overlay.querySelector("#daSyncUnit").textContent = name || "Menyinkronkan...";
}
async function daFileBase64(file) {
  return await new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
async function daUploadPhotos(local, inspectorId) {
  const photos = Array.isArray(local.photos) ? local.photos : (local.photo ? [local.photo] : []);
  const urls = Array.isArray(local.uploadedPhotoUrls) ? local.uploadedPhotoUrls.slice() : [];
  for (let i = 0; i < photos.length; i++) {
    if (urls[i]) continue;
    const photo = photos[i];
    if (!photo || !(photo instanceof Blob)) throw new Error("Foto offline tidak dapat dibaca.");
    const result = await dailyActivityApiRequest({
      action: "uploadDMActivityPhoto", scheduleUnitId: local.scheduleUnitId,
      uploadedById: inspectorId, index: i, name: photo.name || `photo_${i}.jpg`,
      mimeType: photo.type || "image/jpeg", base64: await daFileBase64(photo)
    });
    if (result?.success !== true || !result.url) throw new Error(result?.message || "Upload foto gagal.");
    urls[i] = result.url;
    // Persist each uploaded photo so retries never upload it again.
    if (local.status === "PENDING_SYNC") {
      local.uploadedPhotoUrls = urls;
      await daDraftPut(local.scheduleUnitId, local);
    }
  }
  return urls;
}
async function daSyncSchedule(schedule) {
  if (daSyncRunning) throw new Error("Sinkronisasi sedang berjalan.");
  const user = getDailyActivitySessionUser();
  if (!user) throw new Error("Session tidak valid.");
  const pending = [];
  for (const unit of schedule.units || []) {
    const id = cleanDailyActivityValue(unit.scheduleUnitId);
    const local = await daDraftGet(id);
    if (local?.status === "PENDING_SYNC") pending.push(local);
  }
  if (!pending.length) return;
  daSyncRunning = true;
  const overlay = daSyncOverlay();
  try {
    daSyncUpdate(0, pending.length, "Menyiapkan sinkronisasi...");
    for (let i = 0; i < pending.length; i++) {
      const local = pending[i];
      daSyncUpdate(i, pending.length, `Mengirim ${local.unitCode || local.scheduleUnitId}...`);
      const photos = await daUploadPhotos(local, cleanDailyActivityValue(user.uniqId));
      const payload = {
        action: "submitDMInspection", scheduleUnitId: local.scheduleUnitId,
        inspectedById: cleanDailyActivityValue(user.uniqId),
        hourMeter: local.hourMeter, activityNotes: local.activityNotes,
        startInspectionTime: local.start?.value, startInspectionAt: local.start?.iso,
        finishInspectionTime: local.finish?.value, finishInspectionAt: local.finish?.iso,
        answers: local.answers, photo: photos[0] || ""
      };
      // Check existing completion first: network response might have been lost on previous attempt.
      const verify = await dailyActivityApiRequest({action:"getDMInspectionDraft", scheduleUnitId:local.scheduleUnitId});
      const serverCompleted = String(verify?.inspection?.status || "").toUpperCase() === "SUBMITTED";
      if (!serverCompleted) {
        const result = await dailyActivityApiRequest(payload);
        if (result?.success !== true) throw new Error(result?.message || `Submit ${local.unitCode} gagal.`);
      }
      local.status = "SYNCED";
      local.photos = []; local.photo = null;
      await daDraftPut(local.scheduleUnitId, local);
      daSyncUpdate(i + 1, pending.length, `${local.unitCode || local.scheduleUnitId} berhasil`);
    }
    await loadDailyActivitySchedule();
  } finally {
    overlay.hidden = true;
    overlay.style.display = "none";
    daSyncRunning = false;
  }
}
function daScheduleForUnit(scheduleUnitId) {
  return dailyActivitySchedules.find(schedule => (schedule?.units || []).some(
    unit => cleanDailyActivityValue(unit?.scheduleUnitId) === scheduleUnitId));
}
function daPendingLockUI() {
  const backdrop = document.getElementById("dailyActivityInspectionBackdrop");
  const locked = backdrop?.dataset.pendingSync === "true";
  for (const id of ["dailyActivityInspectionHourMeter", "dailyActivityInspectionNotes",
    "dailyActivityInspectionStartTime", "dailyActivityInspectionFinishTime",
    "dailyActivityInspectionAddPhoto", "dailyActivityStartNow", "dailyActivityFinishNow",
    "saveDailyActivityInspectionDraft", "submitDailyActivityInspection"]) {
    const el = document.getElementById(id);
    if (el) el.disabled = locked;
  }
  document.querySelectorAll("#dailyActivityInspectionBody .daily-activity-result-options button")
    .forEach(button => { button.disabled = locked; });
}
async function daShowPendingForUnit(scheduleUnitId) {
  const draft = await daDraftGet(scheduleUnitId);
  const backdrop = document.getElementById("dailyActivityInspectionBackdrop");
  if (backdrop) backdrop.dataset.pendingSync = draft?.status === "PENDING_SYNC" ? "true" : "false";
  daPendingLockUI();

}
// Multi-photo 4:3 landscape, compressed JPEG, saved as Files in IndexedDB.
let daSelectedPhotos = [];
function daPhotoLabel() {
  const label = document.getElementById("dailyActivityInspectionPhotoName");
  if (label) label.textContent = daSelectedPhotos.length ? `${daSelectedPhotos.length} foto dipilih` : "Belum ada foto";
  const gallery = document.getElementById("dailyActivityInspectionPhotoGallery");
  if (!gallery) return;
  gallery.replaceChildren();
  daSelectedPhotos.forEach((file, index) => {
    const card = document.createElement("div");
    card.style.cssText = "position:relative;min-width:0";
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.src = url;
    img.alt = `Foto ${index + 1}`;
    img.title = "Klik untuk memperbesar";
    img.style.cssText = "width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;cursor:zoom-in;display:block";
    img.addEventListener("load", () => URL.revokeObjectURL(url), {once:true});
    img.addEventListener("click", () => daOpenPhotoPreview(file));
    card.appendChild(img);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "Hapus foto";
    remove.style.cssText = "position:absolute;right:4px;top:4px;background:#b91c1c;color:white;border:0;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:20px";
    remove.disabled = document.getElementById("dailyActivityInspectionBackdrop")?.dataset.pendingSync === "true";
    remove.addEventListener("click", () => {daSelectedPhotos.splice(index,1);daPhotoLabel();});
    card.appendChild(remove);
    gallery.appendChild(card);
  });
}
function daOpenPhotoPreview(file) {
  const shade = document.createElement("div");
  shade.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:22px;cursor:zoom-out";
  const img = document.createElement("img");
  const url = URL.createObjectURL(file);
  img.src = url;
  img.style.cssText = "max-width:100%;max-height:88vh;object-fit:contain";
  const close = () => {shade.remove();URL.revokeObjectURL(url);document.removeEventListener("keydown",esc);};
  const esc = event => {if(event.key === "Escape") close();};
  shade.addEventListener("click",close);
  document.addEventListener("keydown",esc);
  shade.appendChild(img);
  document.body.appendChild(shade);
}
async function daCropPhotoLandscape(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("Pilih file gambar yang valid.");
  const bitmap = await createImageBitmap(file, {imageOrientation:"from-image"});
  try {
    const width = bitmap.width, height = bitmap.height;
    const ratio = 4/3;
    const cropW = Math.min(width, height * ratio);
    const cropH = cropW / ratio;
    const canvas = document.createElement("canvas");
    canvas.width = 1200; canvas.height = 900;
    canvas.getContext("2d").drawImage(bitmap,(width-cropW)/2,(height-cropH)/2,cropW,cropH,0,0,1200,900);
    const blob = await new Promise((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Gagal memproses foto.")),"image/jpeg",.82));
    return new File([blob], `DA_${Date.now()}_${Math.random().toString(36).slice(2,7)}.jpg`, {type:"image/jpeg"});
  } finally {bitmap.close();}
}
function daCaptureDraft() {
  const backdrop = document.getElementById("dailyActivityInspectionBackdrop");
  const scheduleUnitId = backdrop?.dataset.scheduleUnitId;
  if (!scheduleUnitId) throw new Error("Schedule Unit ID tidak ditemukan.");
  const time = name => {
    const input = document.getElementById(`dailyActivityInspection${name}Time`);
    return { value: input?.value || "", iso: input?.dataset.actualIso || "" };
  };
  return {
    scheduleUnitId,
    unitCode: backdrop.dataset.unitCode || "",
    status: "DRAFT_OFFLINE",
    hourMeter: document.getElementById("dailyActivityInspectionHourMeter")?.value || "",
    activityNotes: document.getElementById("dailyActivityInspectionNotes")?.value || "",
    start: time("Start"), finish: time("Finish"),
    answers: collectDailyActivityInspectionAnswers(),
    photo: daSelectedPhotos[0] || null, photos: daSelectedPhotos.slice(), owner: daOfflineOwner(),
    scheduleId: cleanDailyActivityValue(daScheduleForUnit(scheduleUnitId)?.scheduleId),
    savedAt: Date.now()
  };
}
function daRestoreLocalDraft(draft) {
  if (!draft) return;
  const hour = document.getElementById("dailyActivityInspectionHourMeter");
  const notes = document.getElementById("dailyActivityInspectionNotes");
  if (hour) hour.value = draft.hourMeter || "";
  if (notes) notes.value = draft.activityNotes || "";
  for (const [name, field] of [["Start", "start"], ["Finish", "finish"]]) {
    const input = document.getElementById(`dailyActivityInspection${name}Time`);
    if (!input) continue;
    input.value = draft[field]?.value || "";
    if (draft[field]?.iso) input.dataset.actualIso = draft[field].iso;
  }
  daSelectedPhotos = Array.isArray(draft.photos) ? draft.photos.slice() : (draft.photo ? [draft.photo] : []);
  daPhotoLabel();
  for (const answer of draft.answers || []) {
    const row = Array.from(document.querySelectorAll("#dailyActivityInspectionBody [data-checklist-id]"))
      .find(item => item.dataset.checklistId === answer.checklistId);
    const options = row?.querySelector(".daily-activity-result-options");
    const button = Array.from(options?.querySelectorAll("button") || [])
      .find(item => item.dataset.value === answer.result);
    if (button) selectDailyActivityResultButton(options, button);
  }
}

        let schedulerActiveMechanics = [];
        let schedulerAvailableUnits = [];
        let schedulerSelectedUnitIds = new Set();
        let schedulerEditingScheduleId = "";
        let schedulerEditingLockedUnitIds = new Set();
        let schedulerEditingExistingUnits = [];

        // =====================================================
        // DAILY ACTIVITY LOCAL PERMISSIONS
        // Special Name ID override berlaku HANYA di halaman ini.
        // =====================================================
        let dailyActivityPermissions = {};
        let dailyActivityPermissionSource = "";

        document.addEventListener("DOMContentLoaded", initializeDailyActivity);

        async function initializeDailyActivity() {
          const user = getDailyActivitySessionUser();
          if (!user) return;

          const permissionReady =
            await loadDailyActivityPermissions(user);

          if (!permissionReady) {
            return;
          }

          if (!hasDailyActivityPermission("PAGE_ACCESS")) {
            alert("You are not authorized to access Daily Activity.");
            window.location.replace("daily-maintenance.html");
            return;
          }

          applyDailyActivityPermissionUI();
          initializeDailyActivityDate();
          document.getElementById("refreshDailyActivityButton")
            ?.addEventListener("click", loadDailyActivitySchedule);
          document.getElementById("activityDate")
            ?.addEventListener("change", loadDailyActivitySchedule);
          initializeSchedulerPanel();
          initializeDailyActivityClosing();
          initializeDailyActivityApprovalReview();

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

        async function loadDailyActivityPermissions(user) {
          let result;
          try {
            result = await dailyActivityApiRequest({
              action: "resolveDailyActivityPermissions",
              uniqId: cleanDailyActivityValue(user?.uniqId)
            });
            if (!result || result.success !== true) throw new Error(result?.message || "Permission tidak tersedia");
            dailyActivityPermissions = result.permissions && typeof result.permissions === "object" ? result.permissions : {};
            dailyActivityPermissionSource = cleanDailyActivityValue(result.source);
            await daOfflineWrite("permissions", "current", {
              permissions: dailyActivityPermissions, source: dailyActivityPermissionSource
            });
            return true;
          } catch (error) {
            // Offline permission snapshot expires after 24 hours.
            // Never grant permissions that were not previously confirmed online.
            const cached = await daOfflineRead("permissions", "current", 24 * 60 * 60 * 1000).catch(() => null);
            if (cached?.permissions?.PAGE_ACCESS === true) {
              dailyActivityPermissions = cached.permissions;
              dailyActivityPermissionSource = "Offline snapshot";
              // Offline mode is mechanic inspection only, no scheduler or approval operations.
              for (const key of ["SCHEDULER", "EDIT_SCHEDULE", "APPROVAL_REVIEW"])
                dailyActivityPermissions[key] = false;
              daOfflineNotice("OFFLINE — Hak akses terakhir digunakan (maks. 24 jam). Scheduler dan approval dinonaktifkan.");
              return true;
            }
            console.error("HEXA Daily Activity permission error:", error);
            alert("Tidak dapat memverifikasi hak akses. Buka Daily Activity saat online terlebih dahulu.");
            return false;
          }
        }

        function hasDailyActivityPermission(key) {
          return dailyActivityPermissions?.[key] === true;
        }

        function applyDailyActivityPermissionUI() {
          const schedulerButton =
            document.getElementById("openSchedulerButton");

          if (schedulerButton) {
            schedulerButton.hidden =
              !hasDailyActivityPermission("SCHEDULER");
          }

          const scheduleGrid =
            document.getElementById("dailyActivityScheduleGrid");

          const statusLegend =
            document.querySelector(".daily-activity-status-legend");

          const cardAllowed =
            hasDailyActivityPermission("DAILY_ACTIVITY_CARD");

          if (scheduleGrid) {
            scheduleGrid.hidden = !cardAllowed;
          }

          if (statusLegend) {
            statusLegend.hidden = !cardAllowed;
          }

          const approvalSection =
            document.getElementById("dailyActivityApprovalReview");

          if (approvalSection) {
            approvalSection.hidden =
              !hasDailyActivityPermission("APPROVAL_REVIEW");
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
          const activityDate = document.getElementById("activityDate")?.value?.trim() || "";
          if (!activityDate) { showDailyActivityMessage("Activity Date belum dipilih."); return; }
          dailyActivitySchedules = [];
          resetLubeTruckCard(15);
          resetLubeTruckCard(16);
          setDailyActivityLoadingState();
          try {
            const result = await dailyActivityApiRequest({action:"getDMScheduleByDate", activityDate});
            if (!result || result.success !== true) throw new Error(result?.message || "Unable to load schedule");
            dailyActivitySchedules = Array.isArray(result.schedules) ? result.schedules : [];
            await daOfflineWrite("schedule", activityDate, dailyActivitySchedules);
            daOfflineClearNotice();
            renderDailyActivitySchedules();
            // Prepare checklist templates for all scheduled units in background.
            // Keep schedule UI responsive; each template is stored per account.
            const unitCodes = [...new Set(dailyActivitySchedules.flatMap(schedule =>
              (Array.isArray(schedule?.units) ? schedule.units : [])
                .map(unit => cleanDailyActivityValue(unit?.unitCode)).filter(Boolean)
            ))];
            Promise.allSettled(unitCodes.map(async unitCode => {
              const detail = await dailyActivityApiRequest({action:"getDMChecklistByUnit", unitCode});
              if (detail?.success === true && getDailyActivityChecklistArray(detail).length)
                await daOfflineWrite("checklist", unitCode, detail);
            })).then(results => {
              const failed = results.filter(item => item.status === "rejected").length;
              if (failed) console.warn("HEXA DA offline checklist preload incomplete:", failed);
            });
            loadDailyActivityApprovalStates().then(() => {
              renderDailyActivityApprovalReview();
              [15,16].forEach(truckNumber => {
                const schedule = dailyActivitySchedules.find(item => getLubeTruckNumber(item?.lubeTruck) === truckNumber);
                if (schedule) renderLubeTruckClosingState(truckNumber, schedule);
              });
            }).catch(error => console.error("HEXA DM Approval background load error:", error));
          } catch (error) {
            const cached = await daOfflineRead("schedule", activityDate).catch(() => null);
            if (cached) {
              dailyActivitySchedules = cached;
              renderDailyActivitySchedules();
              daOfflineNotice("OFFLINE — Menampilkan jadwal tersimpan untuk " + activityDate + ". Perubahan status belum tersinkronisasi.");
            } else {
              setDailyActivityErrorState("Jadwal " + activityDate + " belum disiapkan offline. Buka tanggal ini saat online terlebih dahulu.");
            }
          }
        }

        async function loadDailyActivityApprovalStates() {
          dailyActivityApprovalStates.clear();
          dailyActivityReviewedSchedules.clear();

          const scheduleIds =
            dailyActivitySchedules
              .map(schedule =>
                cleanDailyActivityValue(
                  schedule?.scheduleId ||
                  schedule?.scheduleID ||
                  schedule?.id
                )
              )
              .filter(Boolean);

          if (!scheduleIds.length) return;

          try {
            const result = await dailyActivityApiRequest({
              action: "getDMApprovalStates",
              scheduleIds
            });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message ||
                "Unable to load approval states."
              );
            }

            const states =
              Array.isArray(result.approvals)
                ? result.approvals
                : [];

            states.forEach(state => {
              const scheduleId =
                cleanDailyActivityValue(state?.scheduleId);

              if (!scheduleId) return;

              dailyActivityApprovalStates.set(
                scheduleId,
                state
              );

              if (state?.reviewed === true) {
                dailyActivityReviewedSchedules.add(
                  scheduleId
                );
              }
            });

          } catch (error) {
            console.error(
              "HEXA DM Approval state load error:",
              error
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
            renderDailyActivityApprovalReview();
            return;
          }

          if (empty) empty.hidden = true;

          dailyActivitySchedules.forEach(schedule => {
            const truckNumber = getLubeTruckNumber(schedule?.lubeTruck);
            if (truckNumber === 15 || truckNumber === 16) {
              renderLubeTruckSchedule(truckNumber, schedule);
            }
          });

          renderDailyActivityApprovalReview();
          daRefreshLocalUnitCards();
        }

        function formatDAScheduleBadgeDate(value) {
          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const raw = String(value || "").trim();
          let day, month;
          let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
          if (m) { month = Number(m[2]); day = Number(m[3]); }
          else {
            m = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
            if (m) { day = Number(m[1]); month = Number(m[2]); }
          }
          if ((!day || !month) && raw) {
            const parsed = new Date(raw);
            if (!Number.isNaN(parsed.getTime())) {
              day = parsed.getDate(); month = parsed.getMonth() + 1;
            }
          }
          return day >= 1 && day <= 31 && month >= 1 && month <= 12 ? `${day} ${months[month-1]}'` : "";
        }

        function renderLubeTruckSchedule(truckNumber, schedule) {
          const editButton =
            document.getElementById(`lubeTruck${truckNumber}EditButton`);

          if (editButton) {
            editButton.hidden =
              !hasDailyActivityPermission("EDIT_SCHEDULE");
          }

          // Create the badge if the published HTML is still an older version.
          const actions = document.querySelector(`#lubeTruck${truckNumber}Card .lube-truck-header-actions`);
          let badge = document.getElementById(`lubeTruck${truckNumber}ScheduleDate`);
          if (!badge && actions) {
            badge = document.createElement("span");
            badge.id = `lubeTruck${truckNumber}ScheduleDate`;
            badge.className = "lube-truck-schedule-date";
            actions.insertBefore(badge, document.getElementById(`lubeTruck${truckNumber}ScheduleStatus`));
          }
          // The date filter is the date used to fetch these cards; prefer it
          // over inconsistent API date serialization.
          const scheduleDate = document.getElementById("activityDate")?.value || schedule?.activityDate || "";
          if (badge) {
            const shortDate = formatDAScheduleBadgeDate(scheduleDate);
            badge.textContent = shortDate ? `▦ ${shortDate}` : "";
            badge.hidden = !shortDate;
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
          renderLubeTruckClosingState(truckNumber, schedule);
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
          void daRefreshLocalUnitCards();
        }

        function createDailyActivityUnitCard(unit) {
          const card = document.createElement("button");
          card.type = "button";

          const status = normalizeDailyActivityStatus(unit?.status);
          card.className =
            "daily-unit-card " + getDailyActivityUnitStatusClass(status);

          card.dataset.scheduleUnitId =
            cleanDailyActivityValue(unit?.scheduleUnitId);
          card.dataset.unitCode =
            cleanDailyActivityValue(unit?.unitCode);

          const unitCode = document.createElement("strong");
          unitCode.className = "daily-unit-code";
          unitCode.textContent = cleanDailyActivityValue(unit?.unitCode) || "-";

          card.append(unitCode);

          card.addEventListener("click", () => {
            const parent = dailyActivitySchedules.find(schedule =>
              (schedule.units || []).some(item =>
                cleanDailyActivityValue(item.scheduleUnitId) === cleanDailyActivityValue(unit.scheduleUnitId)
              )
            );
            if (["APPROVAL", "APPROVED", "RESUME ISSUED"].includes(normalizeDailyActivityStatus(parent?.status))) return;
            openDailyActivityInspection(unit);
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
          const dateBadge = document.getElementById(`lubeTruck${truckNumber}ScheduleDate`);
          if (dateBadge) { dateBadge.textContent = ""; dateBadge.hidden = true; }
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

          const completeButton =
            document.getElementById(`lubeTruck${truckNumber}CompleteButton`);

          if (completeButton) {
            completeButton.hidden = true;
            completeButton.disabled = false;
            completeButton.classList.remove("is-completed");
            completeButton.textContent = "COMPLETE DAILY ACTIVITY";
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
           DAILY ACTIVITY CLOSING
           STAGE 4A
        ===================================================== */

        const DAILY_ACTIVITY_NOT_INSPECTED_REASONS = [
          "Rain",
          "Unit BD",
          "Unit Not Operating",
          "Unit Not Found / Other Area",
          "Time Not Sufficient",
          "Schedule Changed",
          "Lube Truck Breakdown",
          "No Access",
          "Man Power Crowded",
          "Others"
        ];

        let dailyActivityClosingSchedule = null;

        function initializeDailyActivityClosing() {
          document.getElementById("lubeTruck15CompleteButton")
            ?.addEventListener("click", () => handleDailyActivityBottomButton(15));

          document.getElementById("lubeTruck16CompleteButton")
            ?.addEventListener("click", () => handleDailyActivityBottomButton(16));

          document.getElementById("closeDailyActivityClosing")
            ?.addEventListener("click", closeDailyActivityClosing);

          document.getElementById("cancelDailyActivityClosing")
            ?.addEventListener("click", closeDailyActivityClosing);

          document.getElementById("completeDailyActivityNow")
            ?.addEventListener("click", completeDailyActivityNow);

          document.getElementById("dailyActivityClosingBackdrop")
            ?.addEventListener("click", event => {
              if (event.target?.id === "dailyActivityClosingBackdrop") {
                closeDailyActivityClosing();
              }
            });
        }

        async function handleDailyActivityBottomButton(truckNumber) {
          const schedule = dailyActivitySchedules.find(item => getLubeTruckNumber(item?.lubeTruck) === truckNumber);
          const status = normalizeDailyActivityStatus(schedule?.status);
          if (status === "RESUME ISSUED") { openDailyActivityIssuedDocument(truckNumber); return; }
          if (["APPROVAL", "APPROVED"].includes(status)) return;
          if (!schedule) return;
          if (daSyncRunning) return;
          const button = document.getElementById(`lubeTruck${truckNumber}CompleteButton`);
          try {
            if (!navigator.onLine) throw new Error("Complete Daily Activity membutuhkan internet.");
            if (button) button.disabled = true;
            await daSyncSchedule(schedule);
            // Original closing remains unchanged, including NO DM reason collection.
            openDailyActivityClosing(truckNumber);
          } catch (error) {
            console.error("HEXA DA synchronization:", error);
            alert(error?.message || "Sinkronisasi gagal. Data offline tetap tersimpan.");
          } finally {
            if (button) button.disabled = false;
          }
        }

        function renderLubeTruckClosingState(truckNumber, schedule) {
          const button = document.getElementById(`lubeTruck${truckNumber}CompleteButton`);
          const editButton = document.getElementById(`lubeTruck${truckNumber}EditButton`);
          const statusElement = document.getElementById(`lubeTruck${truckNumber}ScheduleStatus`);
          if (!button) return;

          const status = normalizeDailyActivityStatus(schedule?.status);
          const locked = ["APPROVAL", "APPROVED", "RESUME ISSUED"].includes(status);
          const issued = status === "RESUME ISSUED";
          const scheduleId = cleanDailyActivityValue(schedule?.scheduleId || schedule?.scheduleID || schedule?.id);
          const pdfUrl = getDailyActivityDocumentUrl(dailyActivityApprovalStates.get(scheduleId));

          if (editButton) {
            editButton.disabled = locked;
            editButton.classList.toggle("is-locked", locked);
            editButton.title = locked ? "Schedule sudah selesai dan terkunci." : "";
          }

          button.hidden = !hasDailyActivityPermission("COMPLETE_ACTIVITY") && !issued;
          button.classList.toggle("is-completed", locked);
          button.style.setProperty("opacity", "1", "important");
          button.style.setProperty("color", "#ffffff", "important");

          if (issued) {
            button.textContent = "DOWNLOAD RESUME";
            button.disabled = !pdfUrl;
            button.title = pdfUrl ? "Buka PDF resume yang sudah diterbitkan" : "Link PDF belum tersedia";
            button.style.setProperty("background", "#16a34a", "important");
            button.style.setProperty("background-color", "#16a34a", "important");
            button.style.setProperty("cursor", pdfUrl ? "pointer" : "not-allowed");
          } else if (status === "APPROVED") {
            button.textContent = "GENERATE FILE...";
            button.disabled = true;
            button.style.setProperty("background", "#86cfa0", "important");
            button.style.setProperty("background-color", "#86cfa0", "important");
            button.style.setProperty("cursor", "not-allowed");
          } else if (status === "APPROVAL") {
            button.textContent = "✓ COMPLETED";
            button.disabled = true;
            button.style.setProperty("background", "#16a34a", "important");
            button.style.setProperty("background-color", "#16a34a", "important");
            button.style.setProperty("cursor", "not-allowed");
          } else {
            button.textContent = "COMPLETE DAILY ACTIVITY";
            button.disabled = false;
            button.title = "";
            button.style.removeProperty("background");
            button.style.removeProperty("background-color");
            button.style.removeProperty("color");
            button.style.removeProperty("opacity");
            button.style.removeProperty("cursor");
          }

          if (statusElement) statusElement.classList.toggle("is-approval", status === "APPROVAL");
        }

        function openDailyActivityClosing(truckNumber) {
          const schedule =
            dailyActivitySchedules.find(item =>
              getLubeTruckNumber(item?.lubeTruck) === truckNumber
            );

          if (!schedule) {
            alert(`Schedule Lube Truck ${truckNumber} tidak ditemukan.`);
            return;
          }

          const status =
            normalizeDailyActivityStatus(schedule?.status);

          if (["APPROVAL", "APPROVED", "RESUME ISSUED"].includes(status)) {
            return;
          }

          dailyActivityClosingSchedule = schedule;

          const units =
            Array.isArray(schedule?.units) ? schedule.units : [];

          const completedUnits =
            units.filter(unit =>
              normalizeDailyActivityStatus(unit?.status) === "COMPLETED"
            );

          const notInspectedUnits =
            units.filter(unit =>
              normalizeDailyActivityStatus(unit?.status) !== "COMPLETED"
            );

          const achievement =
            units.length
              ? ((completedUnits.length / units.length) * 100).toFixed(1)
              : "0.0";

          setDailyActivityText("closingTargetCount", units.length);
          setDailyActivityText("closingInspectedCount", completedUnits.length);
          setDailyActivityText("closingNotInspectedCount", notInspectedUnits.length);
          setDailyActivityText("closingAchievement", `${achievement}%`);

          const subtitle =
            document.getElementById("dailyActivityClosingSubtitle");

          if (subtitle) {
            subtitle.textContent =
              `${cleanDailyActivityValue(schedule?.lubeTruck)} • ` +
              `${cleanDailyActivityValue(schedule?.activityDate)}`;
          }

          renderDailyActivityClosingUnits(notInspectedUnits);

          const backdrop =
            document.getElementById("dailyActivityClosingBackdrop");

          if (backdrop) {
            backdrop.hidden = false;
          }
        }

        function renderDailyActivityClosingUnits(units) {
          const list =
            document.getElementById("dailyActivityClosingUnitList");

          const section =
            document.getElementById(
              "dailyActivityClosingNotInspectedSection"
            );

          const allCompleted =
            document.getElementById(
              "dailyActivityClosingAllCompleted"
            );

          if (!list) return;

          list.innerHTML = "";

          if (!units.length) {
            if (section) section.hidden = true;
            if (allCompleted) allCompleted.hidden = false;
            return;
          }

          if (section) section.hidden = false;
          if (allCompleted) allCompleted.hidden = true;

          units.forEach(unit => {
            const row = document.createElement("div");
            row.className = "daily-activity-closing-unit";
            row.dataset.scheduleUnitId =
              cleanDailyActivityValue(unit?.scheduleUnitId);

            const code = document.createElement("div");
            code.className = "closing-unit-code";
            code.textContent =
              cleanDailyActivityValue(unit?.unitCode) || "-";

            const select = document.createElement("select");
            select.className = "closing-reason-select";
            select.dataset.role = "reason";

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select Reason";
            select.appendChild(placeholder);

            DAILY_ACTIVITY_NOT_INSPECTED_REASONS.forEach(reason => {
              const option = document.createElement("option");
              option.value = reason;
              option.textContent = reason;
              select.appendChild(option);
            });

            const note = document.createElement("input");
            note.type = "text";
            note.className = "closing-note-input";
            note.dataset.role = "note";
            note.placeholder = "Notes (required for Others)";

            select.addEventListener("change", () => {
              select.classList.remove("is-invalid");

              if (select.value !== "Others") {
                note.classList.remove("is-invalid");
              }
            });

            note.addEventListener("input", () => {
              note.classList.remove("is-invalid");
            });

            row.append(code, select, note);
            list.appendChild(row);
          });
        }

        function closeDailyActivityClosing() {
          const backdrop =
            document.getElementById("dailyActivityClosingBackdrop");

          if (backdrop) {
            backdrop.hidden = true;
          }

          dailyActivityClosingSchedule = null;
        }

        function collectDailyActivityClosingReasons() {
          const rows =
            Array.from(
              document.querySelectorAll(
                "#dailyActivityClosingUnitList " +
                ".daily-activity-closing-unit"
              )
            );

          const items = [];
          let firstInvalid = null;

          rows.forEach(row => {
            const scheduleUnitId =
              cleanDailyActivityValue(row.dataset.scheduleUnitId);

            const select =
              row.querySelector('[data-role="reason"]');

            const note =
              row.querySelector('[data-role="note"]');

            const reason =
              cleanDailyActivityValue(select?.value);

            const noteValue =
              cleanDailyActivityValue(note?.value);

            if (!reason) {
              select?.classList.add("is-invalid");
              firstInvalid = firstInvalid || select;
              return;
            }

            if (reason === "Others" && !noteValue) {
              note?.classList.add("is-invalid");
              firstInvalid = firstInvalid || note;
              return;
            }

            items.push({
              scheduleUnitId: scheduleUnitId,
              reason: reason,
              note: noteValue
            });
          });

          return {
            valid: !firstInvalid && items.length === rows.length,
            firstInvalid: firstInvalid,
            items: items
          };
        }

        async function completeDailyActivityNow() {
          const schedule = dailyActivityClosingSchedule;

          if (!schedule) {
            alert("Schedule closing tidak ditemukan.");
            return;
          }

          const validation =
            collectDailyActivityClosingReasons();

          if (!validation.valid) {
            validation.firstInvalid?.focus();
            alert(
              "Lengkapi Reason untuk seluruh unit yang tidak dilakukan inspeksi."
            );
            return;
          }

          const user = getDailyActivitySessionUser();
          if (!user) return;

          const button =
            document.getElementById("completeDailyActivityNow");

          const originalText =
            button?.textContent || "Complete Now";

          if (button) {
            button.disabled = true;
            button.textContent = "Completing...";
          }

          try {
            const result =
              await dailyActivityApiRequest({
                action: "completeDMSchedule",
                scheduleId:
                  cleanDailyActivityValue(schedule?.scheduleId),
                completedById:
                  cleanDailyActivityValue(user?.uniqId),
                notInspectedUnits:
                  validation.items
              });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message ||
                "Daily Activity gagal di-Complete."
              );
            }

            closeDailyActivityClosing();
            await loadDailyActivitySchedule();

            alert(
              result?.message ||
              "Daily Activity berhasil di-Complete dan menunggu Approval."
            );

          } catch (error) {
            console.error(
              "HEXA Daily Activity Closing error:",
              error
            );

            alert(
              error?.message ||
              "Daily Activity gagal di-Complete."
            );

          } finally {
            if (button) {
              button.disabled = false;
              button.textContent = originalText;
            }
          }
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
            if (!hasDailyActivityPermission("SCHEDULER")) {
              alert("Anda tidak memiliki akses Scheduler.");
              return;
            }

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

          const requiredPermission =
            isEditMode ? "EDIT_SCHEDULE" : "SCHEDULER";

          if (!hasDailyActivityPermission(requiredPermission)) {
            alert(
              isEditMode
                ? "Anda tidak memiliki akses Edit Schedule."
                : "Anda tidak memiliki akses Scheduler."
            );
            return;
          }

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
          if (!hasDailyActivityPermission("EDIT_SCHEDULE")) {
            alert("Anda tidak memiliki akses Edit Schedule.");
            return;
          }

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
           DAILY ACTIVITY INSPECTION - STAGE 3A FIX
           Setiap Unit Card memakai object unit-nya sendiri.
           Tidak bergantung pada pencarian ulang scheduleUnitId.
        ===================================================== */

        async function openDailyActivityInspection(unit) {
          const unitCode = cleanDailyActivityValue(unit?.unitCode);
          if (!unitCode) { alert("Unit Code tidak ditemukan pada Unit Card."); return; }
          try {
            let result;
            let offline = false;
            try {
              result = await dailyActivityApiRequest({action:"getDMChecklistByUnit", unitCode});
              if (!result || result.success !== true) throw new Error(result?.message || "Checklist gagal dimuat");
              await daOfflineWrite("checklist", unitCode, result);
            } catch (error) {
              result = await daOfflineRead("checklist", unitCode).catch(() => null);
              if (!result) throw new Error("Checklist " + unitCode + " belum tersimpan offline. Buka unit ini saat online dahulu.");
              offline = true;
            }
            const checklist = getDailyActivityChecklistArray(result);
            await openDailyActivityInspectionModal({
              scheduleUnitId: cleanDailyActivityValue(unit?.scheduleUnitId), unitCode,
              egi: cleanDailyActivityValue(result?.egi || result?.unit?.egi || unit?.egi),
              type: cleanDailyActivityValue(result?.type || result?.equipmentType || result?.unit?.type || unit?.type),
              checklist
            });
            if (offline) daOfflineNotice("OFFLINE — Checklist " + unitCode + " tersedia untuk dilihat. Save Draft offline dan foto sudah tersedia pada Tahap 2A.");
          } catch (error) {
            console.error("HEXA Daily Activity Inspection error:", unitCode, error);
            alert(error?.message || `Checklist ${unitCode} gagal dimuat.`);
          }
        }

        function getDailyActivityChecklistArray(result) {
          const candidates = [
            result?.checklist,
            result?.items,
            result?.data,
            result?.checklists
          ];

          for (const candidate of candidates) {
            if (Array.isArray(candidate)) return candidate;
          }

          return [];
        }

        async function openDailyActivityInspectionModal(data) {
      let backdrop =
        document.getElementById("dailyActivityInspectionBackdrop");

      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "dailyActivityInspectionBackdrop";
        backdrop.className = "daily-activity-inspection-backdrop";

        Object.assign(backdrop.style, {
          position: "fixed",
          inset: "0",
          zIndex: "99999",
          background: "rgba(0,0,0,.55)",
          padding: "20px",
          overflowY: "auto"
        });

        const panel = document.createElement("section");
        panel.className = "daily-activity-inspection-panel";

        Object.assign(panel.style, {
          width: "min(900px, 100%)",
          margin: "20px auto",
          background: "#fff",
          borderRadius: "18px",
          overflow: "hidden"
        });

        panel.innerHTML = `
          <header style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px;border-bottom:1px solid #eee;">
            <div>
              <div style="font-size:12px;font-weight:700;color:#777;">DAILY ACTIVITY INSPECTION</div>
              <h2 id="dailyActivityInspectionTitle" style="margin:5px 0 3px;">-</h2>
              <div id="dailyActivityInspectionMeta" style="font-size:13px;color:#777;">-</div>
            </div>
            <button type="button" id="closeDailyActivityInspection"
                    style="border:0;background:transparent;font-size:30px;cursor:pointer;">×</button>
          </header>

          <div style="padding:20px 20px 0;">
            <label for="dailyActivityInspectionStartTime" style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;margin-bottom:7px;">
              <span aria-hidden="true">🕒</span> Start Inspection <span style="color:#c62828;">*</span>
            </label>
            <div class="daily-inspection-time-row"><input id="dailyActivityInspectionStartTime" type="time" step="60" readonly class="da-time-display"
                   style="box-sizing:border-box;padding:12px 14px;border:1px solid #d9d9d9;border-radius:10px;font:inherit;">
            <button type="button" class="daily-inspection-now-button" id="dailyActivityStartNow" title="Ambil waktu perangkat sekarang">◷ Start</button></div>
            <div style="font-size:11px;color:#777;margin:6px 0 16px;">Pilih jam dan menit mulai inspeksi (WITA).</div>
            <label for="dailyActivityInspectionHourMeter"
                   style="display:block;font-size:13px;font-weight:700;margin-bottom:7px;">
              Hour Meter <span style="color:#c62828;">*</span>
            </label>
            <input id="dailyActivityInspectionHourMeter"
                   type="number"
                   inputmode="decimal"
                   min="0"
                   step="0.1"
                   placeholder="Input Hour Meter"
                   style="width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #d9d9d9;border-radius:10px;font:inherit;">
          </div>

          <div id="dailyActivityInspectionBody" style="padding:20px;"></div>

          <div style="padding:0 20px 20px;">
            <label for="dailyActivityInspectionFinishTime" style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;margin-bottom:7px;">
              <span aria-hidden="true">⏱️</span> Finish Inspection <span style="color:#c62828;">*</span>
            </label>
            <div class="daily-inspection-time-row"><input id="dailyActivityInspectionFinishTime" type="time" step="60" readonly class="da-time-display"
                   style="box-sizing:border-box;padding:12px 14px;border:1px solid #d9d9d9;border-radius:10px;font:inherit;">
            <button type="button" class="daily-inspection-now-button" id="dailyActivityFinishNow" title="Ambil waktu perangkat sekarang">◷ Finish</button></div>
            <div style="font-size:11px;color:#777;margin:6px 0 16px;">Pilih jam dan menit selesai inspeksi (WITA). Jika melewati tengah malam, tanggal aktual akan ditangani backend.</div>
            <label for="dailyActivityInspectionNotes"
                   style="display:block;font-size:13px;font-weight:700;margin-bottom:7px;">
              Activity Notes
            </label>
            <textarea id="dailyActivityInspectionNotes"
                      rows="4"
                      placeholder="Catatan aktivitas (opsional)"
                      style="width:100%;box-sizing:border-box;resize:vertical;padding:12px 14px;border:1px solid #d9d9d9;border-radius:10px;font:inherit;"></textarea>

            <div style="margin-top:16px;">
              <div style="font-size:13px;font-weight:700;margin-bottom:7px;">Photo</div>
              <input id="dailyActivityInspectionPhoto"
                     type="file"
                     accept="image/*"
                     style="display:none;">
              <button type="button"
                      id="dailyActivityInspectionAddPhoto"
                      style="padding:10px 14px;border:1px solid #d9d9d9;border-radius:10px;background:#fff;cursor:pointer;font-weight:700;">
                + Add Photo
              </button>
              <div id="dailyActivityInspectionPhotoName"
                   style="margin-top:7px;font-size:12px;color:#777;">Belum ada foto</div>
              <div id="dailyActivityInspectionPhotoGallery"
                   style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px;"></div>
            </div>
          </div>

          <footer style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:16px 20px;border-top:1px solid #eee;">
            <strong id="dailyActivityInspectionCount">0 Checklist</strong>

            <div style="display:flex;gap:10px;margin-left:auto;">
              <button type="button"
                      id="saveDailyActivityInspectionDraft"
                      style="padding:11px 16px;border:1px solid #d9d9d9;border-radius:10px;background:#fff;cursor:pointer;font-weight:700;">
                Save Draft
              </button>

              <button type="button"
                      id="submitDailyActivityInspection"
                      style="padding:11px 18px;border:0;border-radius:10px;background:#111;color:#fff;cursor:pointer;font-weight:700;">
                Submit
              </button>
            </div>
          </footer>
        `;

        backdrop.appendChild(panel);
        document.body.appendChild(backdrop);

        const closeModal = () => {
          backdrop.hidden = true;
        };

        document.getElementById("closeDailyActivityInspection")
          ?.addEventListener("click", closeModal);

        backdrop.addEventListener("click", event => {
          if (event.target === backdrop) closeModal();
        });

        // Desktop/mobile consistent time selection with Setel / Hapus.
        function openDATimePicker(input) {
          if (!input || input.disabled) return;
          document.getElementById("daTimePickerOverlay")?.remove();
          const now = new Date();
          const [hour, minute] = /^\d{2}:\d{2}$/.test(input.value)
            ? input.value.split(":").map(Number) : [now.getHours(), now.getMinutes()];
          const overlay = document.createElement("div");
          overlay.id = "daTimePickerOverlay";
          overlay.className = "da-time-overlay";
          overlay.innerHTML = `<div class="da-time-dialog" role="dialog" aria-modal="true" aria-label="Setel waktu">
            <div class="da-time-title">◷ Setel Waktu</div>
            <div class="da-time-wheel-row">
              <div class="da-time-wheel"><label>JAM</label><select id="daPickerHour" size="5"></select></div>
              <span class="da-time-colon">:</span>
              <div class="da-time-wheel"><label>MENIT</label><select id="daPickerMinute" size="5"></select></div>
            </div>
            <div class="da-time-actions"><button type="button" id="daPickerClear">Hapus</button>
            <button type="button" id="daPickerCancel">Batal</button>
            <button type="button" id="daPickerSet">Setel</button></div>
          </div>`;
          document.body.appendChild(overlay);
          const h = overlay.querySelector("#daPickerHour");
          const m = overlay.querySelector("#daPickerMinute");
          for (let i = 0; i < 24; i++) h.add(new Option(String(i).padStart(2,"0"), String(i).padStart(2,"0")));
          for (let i = 0; i < 60; i++) m.add(new Option(String(i).padStart(2,"0"), String(i).padStart(2,"0")));
          h.value = String(hour).padStart(2,"0");
          m.value = String(minute).padStart(2,"0");
          const close = () => overlay.remove();
          overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
          overlay.querySelector("#daPickerCancel").onclick = close;
          overlay.querySelector("#daPickerClear").onclick = () => {
            input.value = ""; delete input.dataset.actualIso;
            input.dispatchEvent(new Event("change", {bubbles:true})); close();
          };
          overlay.querySelector("#daPickerSet").onclick = () => {
            input.value = `${h.value}:${m.value}`;
            input.dispatchEvent(new Event("change", {bubbles:true})); close();
          };
          h.focus();
        }
        for (const name of ["Start", "Finish"]) {
          const timeInput = document.getElementById(`dailyActivityInspection${name}Time`);
          timeInput?.addEventListener("click", () => openDATimePicker(timeInput));
          timeInput?.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDATimePicker(timeInput); }
          });

          document.getElementById(`dailyActivity${name}Now`)?.addEventListener("click", () => {
            const input = document.getElementById(`dailyActivityInspection${name}Time`);
            if (!input || input.disabled) return;
            const now = new Date();
            input.value = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
            input.dataset.actualIso = now.toISOString();
          });
          document.getElementById(`dailyActivityInspection${name}Time`)?.addEventListener("change", event => {
            const input = event.target;
            // Preserve captured calendar day when a draft time is edited.
            const base = input.dataset.actualIso ? new Date(input.dataset.actualIso) : new Date();
            if (/^([01]\d|2[0-3]):[0-5]\d$/.test(input.value)) {
              const [h,m] = input.value.split(":").map(Number);
              base.setHours(h,m,0,0);
              input.dataset.actualIso = base.toISOString();
            }
          });
        }
        const photoInput =
          document.getElementById("dailyActivityInspectionPhoto");

        document.getElementById("dailyActivityInspectionAddPhoto")
          ?.addEventListener("click", () => {
            photoInput?.click();
          });

        photoInput?.setAttribute("multiple", "multiple");
        photoInput?.addEventListener("change", async () => {
          const files = Array.from(photoInput.files || []);
          if (!files.length) return;
          const addButton = document.getElementById("dailyActivityInspectionAddPhoto");
          if (addButton) addButton.disabled = true;
          try {
            for (const file of files) {
              const cropped = await daCropPhotoLandscape(file);
              daSelectedPhotos.push(cropped);
            }
            daPhotoLabel();
          } catch (error) { alert(error?.message || "Gagal menambahkan foto."); }
          finally { photoInput.value = ""; if (addButton) addButton.disabled = false; }
        });

        document.getElementById("saveDailyActivityInspectionDraft")
          ?.addEventListener("click", saveDailyActivityInspectionDraft);

        // Stage 3C-2: Validasi Submit.
        // Submit final ke backend belum diaktifkan pada stage ini.
        document.getElementById("submitDailyActivityInspection")
          ?.addEventListener("click", validateDailyActivityInspectionBeforeSubmit);
      }

      backdrop.dataset.scheduleUnitId =
        cleanDailyActivityValue(data?.scheduleUnitId);
      backdrop.dataset.unitCode =
        cleanDailyActivityValue(data?.unitCode);

      document.getElementById("dailyActivityInspectionTitle").textContent =
        data.unitCode || "-";

      document.getElementById("dailyActivityInspectionMeta").textContent =
        `${data.egi || "-"} • ${data.type || "-"}`;

      const hourMeter =
        document.getElementById("dailyActivityInspectionHourMeter");
      const notes =
        document.getElementById("dailyActivityInspectionNotes");
      const photo =
        document.getElementById("dailyActivityInspectionPhoto");
      const photoName =
        document.getElementById("dailyActivityInspectionPhotoName");

      if (hourMeter) hourMeter.value = "";
      const startTimeInput = document.getElementById("dailyActivityInspectionStartTime");
      const finishTimeInput = document.getElementById("dailyActivityInspectionFinishTime");
      if (startTimeInput) { startTimeInput.value = ""; delete startTimeInput.dataset.actualIso; startTimeInput.disabled = false; }
      if (finishTimeInput) { finishTimeInput.value = ""; delete finishTimeInput.dataset.actualIso; finishTimeInput.disabled = false; }
      for (const id of ["dailyActivityStartNow", "dailyActivityFinishNow", "saveDailyActivityInspectionDraft", "submitDailyActivityInspection"]) {
        const control = document.getElementById(id); if (control) control.disabled = false;
      }
      if (notes) notes.value = "";
      if (photo) photo.value = "";
      daSelectedPhotos = [];
      backdrop.dataset.pendingSync = "false";
      if (photoName) photoName.textContent = "No photo selected";

      const body =
        document.getElementById("dailyActivityInspectionBody");

      const count =
        document.getElementById("dailyActivityInspectionCount");

      body.innerHTML = "";

      const groups = new Map();

      data.checklist.forEach(item => {
        const groupName =
          cleanDailyActivityValue(item?.group) || "CHECKLIST";

        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }

        groups.get(groupName).push(item);
      });

      groups.forEach((items, groupName) => {
        const section = document.createElement("section");
        section.style.marginBottom = "22px";

        const heading = document.createElement("h3");
        heading.textContent = groupName;
        heading.style.margin = "0 0 10px";
        section.appendChild(heading);

        items
          .sort(
            (a, b) =>
              (Number(a?.sequence) || 0) -
              (Number(b?.sequence) || 0)
          )
          .forEach(item => {
            const row = document.createElement("div");
            row.dataset.checklistId =
              cleanDailyActivityValue(
                item?.checklistId ||
                item?.id ||
                item?.uniqId
              );
            row.dataset.group =
              cleanDailyActivityValue(item?.group);
            row.dataset.item =
              cleanDailyActivityValue(item?.item);
            row.dataset.sequence =
              cleanDailyActivityValue(item?.sequence);

            Object.assign(row.style, {
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) auto",
              alignItems: "center",
              gap: "12px",
              padding: "11px 0",
              borderBottom: "1px solid #eee"
            });

            const itemText = document.createElement("span");
            itemText.className = "daily-activity-checklist-item-text";
            itemText.textContent =
              cleanDailyActivityValue(item?.item) || "-";

            const options = document.createElement("div");
            options.className = "daily-activity-result-options";
            options.style.display = "flex";
            options.style.gap = "7px";

            [
              ["GOOD", "✓", "Good Condition", "#2e7d32", "#e8f5e9"],
              ["BAD", "X", "Bad Condition", "#c62828", "#ffebee"],
              ["REPAIRED", "ⓧ", "Good Condition After Repair / Action", "#1565c0", "#e3f2fd"],
              ["N/A", "N/A", "Not Applicable", "#616161", "#eeeeee"]
            ].forEach(([value, symbol, label, activeColor, activeBackground]) => {
              const button = document.createElement("button");
              button.type = "button";
              button.dataset.value = value;
              button.dataset.selected = "false";
              button.dataset.activeColor = activeColor;
              button.dataset.activeBackground = activeBackground;
              button.textContent = symbol;
              button.title = label;

              Object.assign(button.style, {
                minWidth: value === "N/A" ? "48px" : "42px",
                minHeight: "42px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                background: "#fff",
                color: "#333",
                cursor: "pointer",
                fontWeight: "700"
              });

              button.addEventListener("click", () => {
                selectDailyActivityResultButton(options, button);
              });

              options.appendChild(button);
            });

            row.append(itemText, options);
            section.appendChild(row);
          });

        body.appendChild(section);
      });

      if (!data.checklist.length) {
        body.textContent =
          "Checklist tidak ditemukan untuk unit ini.";
      }

      count.textContent =
        `${data.checklist.length} Checklist`;

      backdrop.hidden = false;

      await loadDailyActivityInspectionDraft(
        cleanDailyActivityValue(data?.scheduleUnitId)
      );
    }


    function selectDailyActivityResultButton(options, selectedButton) {
      Array.from(options.children).forEach(other => {
        other.dataset.selected = "false";
        other.style.background = "#fff";
        other.style.color = "#333";
        other.style.borderColor = "#ddd";
        other.style.outline = "";
      });

      const activeColor =
        selectedButton.dataset.activeColor || "#333";
      const activeBackground =
        selectedButton.dataset.activeBackground || "#eee";

      selectedButton.dataset.selected = "true";
      selectedButton.style.background = activeBackground;
      selectedButton.style.color = activeColor;
      selectedButton.style.borderColor = activeColor;
      selectedButton.style.outline = `2px solid ${activeColor}`;

      // Jika sebelumnya item ditandai merah karena belum diisi,
      // hapus warning segera setelah user memilih salah satu hasil.
      const row =
        options.closest("[data-checklist-id]");

      if (row) {
        const itemText =
          row.querySelector(".daily-activity-checklist-item-text");

        if (itemText) {
          itemText.style.color = "";
          itemText.style.fontWeight = "";
        }

        row.style.background = "";
      }
    }


    function collectDailyActivityInspectionAnswers() {
      const body =
        document.getElementById("dailyActivityInspectionBody");

      if (!body) return [];

      return Array.from(
        body.querySelectorAll("[data-checklist-id]")
      )
        .map(row => {
          const selected =
            row.querySelector(
              '.daily-activity-result-options button[data-selected="true"]'
            );

          if (!selected) return null;

          return {
            checklistId:
              cleanDailyActivityValue(row.dataset.checklistId),
            group:
              cleanDailyActivityValue(row.dataset.group),
            item:
              cleanDailyActivityValue(row.dataset.item),
            sequence:
              Number(row.dataset.sequence) || 0,
            result:
              cleanDailyActivityValue(selected.dataset.value)
          };
        })
        .filter(Boolean);
    }


    function validateDailyActivityInspectionBeforeSubmit() {
      const start = document.getElementById("dailyActivityInspectionStartTime");
      const finish = document.getElementById("dailyActivityInspectionFinishTime");
      for (const [field, label] of [[start, "Start Inspection"], [finish, "Finish Inspection"]]) {
        if (!field?.value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(field.value)) {
          if (field) { field.style.borderColor = "#c62828"; field.focus(); }
          alert(label + " wajib diisi dengan jam dan menit sebelum Submit.");
          return;
        }
        field.style.borderColor = "#d9d9d9";
      }

      const body =
        document.getElementById("dailyActivityInspectionBody");

      const hourMeter =
        document.getElementById("dailyActivityInspectionHourMeter");

      if (!body) return;

      const rows =
        Array.from(
          body.querySelectorAll("[data-checklist-id]")
        );

      // Bersihkan warning checklist dari validasi sebelumnya.
      rows.forEach(row => {
        const itemText =
          row.querySelector(".daily-activity-checklist-item-text");

        if (itemText) {
          itemText.style.color = "";
          itemText.style.fontWeight = "";
        }

        row.style.background = "";
      });

      // Hour Meter wajib untuk Submit final.
      const hourMeterValue =
        cleanDailyActivityValue(hourMeter?.value);

      if (!hourMeterValue) {
        if (hourMeter) {
          hourMeter.style.borderColor = "#c62828";
          hourMeter.style.outline =
            "2px solid rgba(198,40,40,.15)";
          hourMeter.focus();
        }

        alert("Hour Meter wajib diisi sebelum Submit.");
        return;
      }

      if (hourMeter) {
        hourMeter.style.borderColor = "#d9d9d9";
        hourMeter.style.outline = "";
      }

      // Cari semua checklist yang belum memiliki pilihan.
      const incompleteRows = [];

      rows.forEach(row => {
        const selected =
          row.querySelector(
            '.daily-activity-result-options button[data-selected="true"]'
          );

        if (selected) return;

        incompleteRows.push(row);

        const itemText =
          row.querySelector(".daily-activity-checklist-item-text");

        if (itemText) {
          itemText.style.color = "#c62828";
          itemText.style.fontWeight = "700";
        }

        row.style.background = "#fff8f8";
      });

      if (incompleteRows.length) {
        incompleteRows[0].scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        alert(
          `${incompleteRows.length} checklist belum diisi. ` +
          "Lengkapi seluruh checklist sebelum Submit."
        );

        return;
      }

      // Semua checklist sudah lengkap.
      // Lanjutkan ke Submit Final.
      submitDailyActivityInspection();
    }


    async function submitDailyActivityInspection() {
      const backdrop =
        document.getElementById("dailyActivityInspectionBackdrop");

      const submitButton =
        document.getElementById("submitDailyActivityInspection");

      const saveButton =
        document.getElementById("saveDailyActivityInspectionDraft");

      const scheduleUnitId =
        cleanDailyActivityValue(backdrop?.dataset.scheduleUnitId);

      if (!scheduleUnitId) {
        alert("Schedule Unit ID tidak ditemukan.");
        return;
      }

      const user = getDailyActivitySessionUser();
      if (!user) return;

      const inspectorId =
        cleanDailyActivityValue(user?.uniqId);

      if (!inspectorId) {
        alert("Session user tidak valid.");
        return;
      }

      const hourMeter =
        cleanDailyActivityValue(
          document.getElementById("dailyActivityInspectionHourMeter")?.value
        );

      const activityNotes =
        cleanDailyActivityValue(
          document.getElementById("dailyActivityInspectionNotes")?.value
        );

      const answers =
        collectDailyActivityInspectionAnswers();

      const originalSubmitText =
        submitButton?.textContent || "Submit";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      if (saveButton) {
        saveButton.disabled = true;
      }

      try {
        const existingLocal = await daDraftGet(scheduleUnitId);
        if (existingLocal?.status === "PENDING_SYNC") {
          throw new Error("Unit sudah Submit dan terkunci.");
        }
        const local = daCaptureDraft();
        if (!local.scheduleId) throw new Error("Schedule ID tidak tersedia.");
        if (!local.start.iso || !local.finish.iso) throw new Error("Timestamp Start dan Finish wajib tersedia.");
        if (new Date(local.finish.iso) < new Date(local.start.iso)) throw new Error("Finish sebelum Start.");
        if (!navigator.onLine) {
          local.status = "PENDING_SYNC";
          await daDraftPut(scheduleUnitId, local);
          await daRefreshLocalUnitCards();
          if (backdrop) backdrop.hidden = true;
          alert("Submit berhasil disimpan. Data akan dikirim saat Complete Daily Activity.");
          return;
        }
        // Online Submit tetap mengirim langsung ke server.
        // Foto diunggah satu per satu sebelum Submit final.
        const photoUrls = await daUploadPhotos(local, inspectorId);
        const result =
          await dailyActivityApiRequest({
            action: "submitDMInspection",
            scheduleUnitId: scheduleUnitId,
            inspectedById: inspectorId,
            hourMeter: hourMeter,
            startInspectionTime: document.getElementById("dailyActivityInspectionStartTime")?.value || "",
            startInspectionAt: document.getElementById("dailyActivityInspectionStartTime")?.dataset.actualIso || "",
            finishInspectionTime: document.getElementById("dailyActivityInspectionFinishTime")?.value || "",
            finishInspectionAt: document.getElementById("dailyActivityInspectionFinishTime")?.dataset.actualIso || "",
            activityNotes: activityNotes,
            photo: photoUrls[0] || "",
            answers: answers
          });

        if (!result || result.success !== true) {
          throw new Error(
            result?.message ||
            "Daily Activity gagal di-Submit."
          );
        }

        if (existingLocal) {
          local.status = "SYNCED";
          local.photos = [];
          local.photo = null;
          await daDraftPut(scheduleUnitId, local);
        }
        // Refresh data terlebih dahulu agar card/progress mengambil
        // status terbaru dari database.
        await loadDailyActivitySchedule();

        // Tutup modal hanya setelah backend benar-benar sukses.
        if (backdrop) {
          backdrop.hidden = true;
        }

        alert(
          result?.message ||
          "Daily Activity berhasil di-Submit."
        );

      } catch (error) {
        console.error(
          "HEXA Daily Activity Submit error:",
          error
        );

        alert(
          error?.message ||
          "Daily Activity gagal di-Submit."
        );

      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalSubmitText;
        }

        if (saveButton) {
          saveButton.disabled = false;
        }
      }
    }


    async function saveDailyActivityInspectionDraft() {
      const backdrop =
        document.getElementById("dailyActivityInspectionBackdrop");

      const saveButton =
        document.getElementById("saveDailyActivityInspectionDraft");

      const scheduleUnitId =
        cleanDailyActivityValue(backdrop?.dataset.scheduleUnitId);

      if (!scheduleUnitId) {
        alert("Schedule Unit ID tidak ditemukan.");
        return;
      }

      const user = getDailyActivitySessionUser();
      if (!user) return;

      const inspectorId =
        cleanDailyActivityValue(user?.uniqId);

      if (!inspectorId) {
        alert("Session user tidak valid.");
        return;
      }

      const hourMeter =
        cleanDailyActivityValue(
          document.getElementById("dailyActivityInspectionHourMeter")?.value
        );

      const activityNotes =
        cleanDailyActivityValue(
          document.getElementById("dailyActivityInspectionNotes")?.value
        );

      const answers =
        collectDailyActivityInspectionAnswers();

      const originalText =
        saveButton?.textContent || "Save Draft";

      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
      }

      try {
        const existingLocal = await daDraftGet(scheduleUnitId);
        if (existingLocal?.status === "PENDING_SYNC") {
          alert("Unit sudah Pending Sync dan terkunci. Draft tidak boleh diubah.");
          return;
        }
        if (!navigator.onLine || daSelectedPhotos.length || existingLocal) {
          const draft = daCaptureDraft();
          await daDraftPut(scheduleUnitId, draft);
          await daRefreshLocalUnitCards();
          alert("Draft dan foto berhasil disimpan di perangkat ini. Belum tersinkronisasi ke server.");
          if (backdrop) backdrop.hidden = true;
          return;
        }
        const result = await dailyActivityApiRequest({
          action: "saveDMInspectionDraft",
          scheduleUnitId: scheduleUnitId,
          inspectedById: inspectorId,
          hourMeter: hourMeter,
          startInspectionTime: document.getElementById("dailyActivityInspectionStartTime")?.value || "",
          finishInspectionTime: document.getElementById("dailyActivityInspectionFinishTime")?.value || "",
          startInspectionAt: document.getElementById("dailyActivityInspectionStartTime")?.dataset.actualIso || "",
          finishInspectionAt: document.getElementById("dailyActivityInspectionFinishTime")?.dataset.actualIso || "",
          activityNotes: activityNotes,
          photo: "",
          answers: answers
        });

        if (!result || result.success !== true) {
          throw new Error(
            result?.message || "Draft gagal disimpan."
          );
        }

        await loadDailyActivitySchedule();

        alert("Draft berhasil disimpan.");

        if (backdrop) {
          backdrop.hidden = true;
        }

      } catch (error) {
        console.error(
          "HEXA Daily Activity Save Draft error:",
          error
        );

        alert(
          error?.message || "Draft gagal disimpan."
        );

      } finally {
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = originalText;
        }
      }
    }


    async function loadDailyActivityInspectionDraft(scheduleUnitId) {
      if (!scheduleUnitId) return;
      // A local draft has priority; never overwrite unsynced photos/answers.
      const localDraft = await daDraftGet(scheduleUnitId);
      if (localDraft) {
        daRestoreLocalDraft(localDraft);
        await daShowPendingForUnit(scheduleUnitId);
        if (localDraft.status !== "PENDING_SYNC")
          daOfflineNotice("DRAFT LOKAL — Checklist dan foto tersimpan di perangkat ini; belum tersinkronisasi.");
        return;
      }
      if (!navigator.onLine) return;

      try {
        const result = await dailyActivityApiRequest({
          action: "getDMInspectionDraft",
          scheduleUnitId: scheduleUnitId
        });

        if (!result || result.success !== true) {
          throw new Error(
            result?.message || "Draft gagal dimuat."
          );
        }

        const draft =
          result?.inspection ||
          result?.draft ||
          result?.data ||
          null;

        if (!draft) return;

        const hourMeter =
          document.getElementById("dailyActivityInspectionHourMeter");

        const notes =
          document.getElementById("dailyActivityInspectionNotes");

        if (hourMeter) {
          hourMeter.value =
            cleanDailyActivityValue(
              draft?.hourMeter ??
              draft?.hm ??
              result?.hourMeter
            );
        }

        if (notes) {
          notes.value =
            cleanDailyActivityValue(
              draft?.activityNotes ??
              draft?.notes ??
              draft?.note ??
              result?.activityNotes
            );
        }

        for (const [name, field] of [["Start","startedAt"],["Finish","finishedAt"]]) {
          const input = document.getElementById(`dailyActivityInspection${name}Time`);
          if (!input) continue;
          const raw = draft?.[field];
          if (raw) {
            const date = new Date(raw);
            if (!Number.isNaN(date.getTime())) {
              input.value = `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
              input.dataset.actualIso = date.toISOString();
            }
          }
        }
        if (String(draft.status || "").toUpperCase() === "SUBMITTED") {
          const backdrop = document.getElementById("dailyActivityInspectionBackdrop");
          backdrop?.querySelectorAll("input,textarea,button:not(#closeDailyActivityInspection)").forEach(el => {el.disabled=true;});
        }
        const answers =
          extractDailyActivityDraftAnswers(result, draft);

        answers.forEach(answer => {
          const checklistId =
            cleanDailyActivityValue(
              answer?.checklistId ||
              answer?.id
            );

          const value =
            cleanDailyActivityValue(
              answer?.result ||
              answer?.value
            ).toUpperCase();

          if (!checklistId || !value) return;

          const row =
            document.querySelector(
              `#dailyActivityInspectionBody [data-checklist-id="${escapeDailyActivitySelector(checklistId)}"]`
            );

          const options =
            row?.querySelector(".daily-activity-result-options");

          const button =
            options
              ? Array.from(options.querySelectorAll("button"))
                  .find(item =>
                    cleanDailyActivityValue(item.dataset.value).toUpperCase() === value
                  )
              : null;

          if (options && button) {
            selectDailyActivityResultButton(options, button);
          }
        });

      } catch (error) {
        console.error(
          "HEXA Daily Activity Resume Draft error:",
          error
        );

        alert(
          error?.message || "Draft gagal dimuat."
        );
      }
    }


    function extractDailyActivityDraftAnswers(result, draft) {
      const candidates = [
        draft?.answers,
        draft?.details,
        draft?.checklist,
        result?.answers,
        result?.details,
        result?.checklist
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }

      return [];
    }


    function escapeDailyActivitySelector(value) {
      const text = cleanDailyActivityValue(value);

      if (window.CSS && typeof window.CSS.escape === "function") {
        return window.CSS.escape(text);
      }

      return text.replace(/["\\]/g, "\\$&");
    }


        // =========================================================
        // STAGE 4B-1 — APPROVAL REVIEW
        // UI + Review Resume only.
        // Approve / Issue Resume / PDF remain disabled until next stage.
        // =========================================================

        const dailyActivityReviewedSchedules = new Set();
        const dailyActivityApprovalStates = new Map();
        const dailyActivityPdfBusy = new Map();
        let currentApprovalReviewScheduleId = "";
        let currentApprovalReviewTruckNumber = null;

        function initializeDailyActivityApprovalReview() {
          const section = document.getElementById("dailyActivityApprovalReview");
          const user = getDailyActivitySessionUser();

          if (section) {
            section.hidden = !hasDailyActivityApprovalAccess(user);
          }

          [15, 16].forEach(truckNumber => {
            document
              .getElementById(`approvalReviewButton${truckNumber}`)
              ?.addEventListener("click", () => openDailyActivityApprovalResume(truckNumber));

            document
              .getElementById(`approvalApproveButton${truckNumber}`)
              ?.addEventListener("click", () => approveDailyActivitySchedule(truckNumber));

            document
              .getElementById(`approvalIssueButton${truckNumber}`)
              ?.addEventListener("click", () => openDailyActivityIssuedDocument(truckNumber));

            document.getElementById(`approvalPdfButton${truckNumber}`)
              ?.addEventListener("click", () => openDailyActivityIssuedDocument(truckNumber));
          });

          document
            .getElementById("approvalResumeCloseButton")
            ?.addEventListener("click", closeDailyActivityApprovalResume);

          document
            .getElementById("approvalResumeDoneButton")
            ?.addEventListener("click", completeDailyActivityReview);

          document
            .getElementById("approvalResumeBackdrop")
            ?.addEventListener("click", event => {
              if (event.target?.id === "approvalResumeBackdrop") {
                closeDailyActivityApprovalResume();
              }
            });
        }

        function getDailyActivityDocumentUrl(state) {
          if (!state || typeof state !== "object") return "";
          const candidates = [state.pdfUrl, state.pdfURL, state.documentUrl, state.resumePdfUrl, state.fileUrl];
          const url = candidates.find(value => typeof value === "string" && /^https:\/\//i.test(value.trim()));
          return url ? url.trim() : "";
        }

        function openDailyActivityIssuedDocument(truckNumber) {
          const schedule = dailyActivitySchedules.find(item =>
            getLubeTruckNumber(item?.lubeTruck) === truckNumber
          );
          const scheduleId = cleanDailyActivityValue(schedule?.scheduleId || schedule?.scheduleID || schedule?.id);
          const url = getDailyActivityDocumentUrl(dailyActivityApprovalStates.get(scheduleId));
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        }

        function hasDailyActivityApprovalAccess(user) {
          return hasDailyActivityPermission("APPROVAL_REVIEW");
        }

        function renderDailyActivityApprovalReview() {
          const section = document.getElementById("dailyActivityApprovalReview");
          const user = getDailyActivitySessionUser();

          if (!section) return;

          const allowed = hasDailyActivityApprovalAccess(user);
          section.hidden = !allowed;
          if (!allowed) return;

          const activityDate =
            document.getElementById("activityDate")?.value?.trim() || "-";

          setDailyActivityText(
            "approvalReviewDate",
            activityDate === "-" ? "-" : formatDailyActivityDisplayDate(activityDate)
          );

          [15, 16].forEach(truckNumber => {
            const schedule = dailyActivitySchedules.find(item =>
              getLubeTruckNumber(item?.lubeTruck) === truckNumber
            );

            renderDailyActivityApprovalRow(truckNumber, schedule);
          });
        }

        function renderDailyActivityApprovalRow(truckNumber, schedule) {
          const row = document.getElementById(`approvalReviewRow${truckNumber}`);
          const statusEl = document.getElementById(`approvalReviewStatus${truckNumber}`);
          const reviewButton = document.getElementById(`approvalReviewButton${truckNumber}`);
          const approveButton = document.getElementById(`approvalApproveButton${truckNumber}`);
          const issueButton = document.getElementById(`approvalIssueButton${truckNumber}`);
          const pdfButton = document.getElementById(`approvalPdfButton${truckNumber}`);

          const status = normalizeDailyActivityStatus(schedule?.status);
          const canReview =
            Boolean(schedule) &&
            ["APPROVAL", "APPROVED", "RESUME ISSUED"].includes(status);

          row?.classList.toggle("is-ready", status === "APPROVAL");
          row?.classList.toggle(
            "is-approved",
            status === "APPROVED" || status === "RESUME ISSUED"
          );

          if (statusEl) {
            statusEl.textContent = schedule ? (status || "-") : "NO SCHEDULE";
            statusEl.classList.toggle("is-ready", status === "APPROVAL");
            statusEl.classList.toggle(
              "is-approved",
              status === "APPROVED" || status === "RESUME ISSUED"
            );
          }

          const scheduleId =
            cleanDailyActivityValue(
              schedule?.scheduleId ||
              schedule?.scheduleID ||
              schedule?.id
            );

          const approvalState =
            scheduleId
              ? dailyActivityApprovalStates.get(scheduleId)
              : null;

          const reviewed =
            Boolean(scheduleId) &&
            (
              dailyActivityReviewedSchedules.has(scheduleId) ||
              approvalState?.reviewed === true
            );

          if (reviewButton) {
            reviewButton.disabled =
              !canReview ||
              !hasDailyActivityPermission("REVIEW_RESUME");

            reviewButton.textContent =
              reviewed ? "Reviewed" : "Review Resume";

            reviewButton.classList.toggle(
              "is-reviewed",
              reviewed
            );
          }

          if (approveButton) {
            const documentReady = status === "RESUME ISSUED" &&
              Boolean(getDailyActivityDocumentUrl(approvalState));
            const needsPdfRetry = status === "APPROVED" && !documentReady;
            const busy = dailyActivityPdfBusy.has(scheduleId);
            approveButton.textContent = busy
              ? dailyActivityPdfBusy.get(scheduleId)
              : documentReady ? "Doc. Available"
              : needsPdfRetry ? "Generate File"
              : "Approve";
            approveButton.classList.toggle("is-approved-state", documentReady || busy);
            approveButton.classList.toggle("is-document-status", documentReady || busy || needsPdfRetry);
            approveButton.disabled = busy || documentReady || !schedule ||
              !(status === "APPROVAL" && reviewed && hasDailyActivityPermission("APPROVE") ||
                needsPdfRetry && hasDailyActivityPermission("ISSUE_RESUME"));
          }

          // Dokumen hanya bisa dibuka jika link PDF sudah tersimpan.
          // Jangan panggil generator lama dari tombol View Document.
          const documentUrl = getDailyActivityDocumentUrl(approvalState);
          if (issueButton) {
            issueButton.textContent = "View Document";
            issueButton.disabled = !documentUrl;
            issueButton.classList.toggle("is-document-ready", Boolean(documentUrl));
          }
          if (pdfButton) {
            pdfButton.disabled = !documentUrl;
          }
        }

        async function openDailyActivityApprovalResume(truckNumber) {
          if (!hasDailyActivityPermission("REVIEW_RESUME")) {
            alert("Anda tidak memiliki akses Review Resume.");
            return;
          }

          const schedule = dailyActivitySchedules.find(item =>
            getLubeTruckNumber(item?.lubeTruck) === truckNumber
          );

          if (!schedule) return;

          currentApprovalReviewScheduleId =
            cleanDailyActivityValue(schedule?.scheduleId || schedule?.scheduleID || schedule?.id);
          currentApprovalReviewTruckNumber = truckNumber;

          const status = normalizeDailyActivityStatus(schedule?.status);
          if (!["APPROVAL", "APPROVED", "RESUME ISSUED"].includes(status)) return;

          const backdrop = document.getElementById("approvalResumeBackdrop");
          const loading = document.getElementById("approvalResumeLoading");
          const content = document.getElementById("approvalResumeContent");

          if (backdrop) backdrop.hidden = false;
          if (loading) loading.hidden = false;
          if (content) content.hidden = true;

          setDailyActivityText("approvalResumeTitle", `Review Resume — Lube Truck ${truckNumber}`);
          setDailyActivityText(
            "approvalResumeSubtitle",
            `${formatDailyActivityDisplayDate(schedule?.activityDate || document.getElementById("activityDate")?.value || "")} · ${status}`
          );

          const units = Array.isArray(schedule?.units) ? schedule.units : [];
          const completedUnits = units.filter(unit =>
            normalizeDailyActivityStatus(unit?.status) === "COMPLETED"
          );
          const notInspectedUnits = units.filter(unit =>
            normalizeDailyActivityStatus(unit?.status) !== "COMPLETED"
          );

          setDailyActivityText("approvalResumeTarget", String(units.length));
          setDailyActivityText("approvalResumeInspected", String(completedUnits.length));
          setDailyActivityText("approvalResumeNotInspected", String(notInspectedUnits.length));

          const achievement =
            units.length > 0
              ? ((completedUnits.length / units.length) * 100).toFixed(1)
              : "0.0";

          setDailyActivityText("approvalResumeAchievement", `${achievement}%`);
          setDailyActivityText("approvalResumeMechanic1", getMechanicName(schedule?.mechanic1));
          setDailyActivityText("approvalResumeMechanic2", getMechanicName(schedule?.mechanic2));

          renderApprovalNotInspected(notInspectedUnits);

          try {
            const inspectionResults = await Promise.all(
              completedUnits.map(async unit => {
                const scheduleUnitId =
                  cleanDailyActivityValue(
                    unit?.scheduleUnitId ||
                    unit?.scheduleUnitID ||
                    unit?.id
                  );

                if (!scheduleUnitId) {
                  return { unit, inspection: null };
                }

                const result = await dailyActivityApiRequest({
                  action: "getDMInspectionDraft",
                  scheduleUnitId
                });

                return {
                  unit,
                  inspection:
                    result?.success === true && result?.found
                      ? result.inspection
                      : null
                };
              })
            );

            renderApprovalInspectionFindings(inspectionResults);
          } catch (error) {
            console.error("HEXA Approval Resume load error:", error);
            renderApprovalResumeError(
              error.message || "Unable to load inspection resume."
            );
          } finally {
            if (loading) loading.hidden = true;
            if (content) content.hidden = false;
          }
        }

        async function completeDailyActivityReview() {
          if (!hasDailyActivityPermission("REVIEW_RESUME")) {
            alert("Anda tidak memiliki akses Review Resume.");
            return;
          }

          if (!currentApprovalReviewScheduleId) {
            return;
          }

          const user =
            getDailyActivitySessionUser();

          const doneButton =
            document.getElementById("approvalResumeDoneButton");

          const originalText =
            doneButton?.textContent || "Done Review";

          if (doneButton) {
            doneButton.disabled = true;
            doneButton.textContent = "Saving...";
          }

          try {
            const result = await dailyActivityApiRequest({
              action: "markDMApprovalReviewed",
              scheduleId: currentApprovalReviewScheduleId,
              reviewedById: cleanDailyActivityValue(user?.uniqId)
            });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message ||
                "Review Resume gagal disimpan."
              );
            }

            dailyActivityReviewedSchedules.add(
              currentApprovalReviewScheduleId
            );

            if (result.approval) {
              dailyActivityApprovalStates.set(
                currentApprovalReviewScheduleId,
                result.approval
              );
            }

            if (
              currentApprovalReviewTruckNumber === 15 ||
              currentApprovalReviewTruckNumber === 16
            ) {
              const schedule =
                dailyActivitySchedules.find(item =>
                  getLubeTruckNumber(item?.lubeTruck) ===
                  currentApprovalReviewTruckNumber
                );

              renderDailyActivityApprovalRow(
                currentApprovalReviewTruckNumber,
                schedule
              );
            }

            closeDailyActivityApprovalResume();

          } catch (error) {
            console.error(
              "HEXA Review Resume save error:",
              error
            );
            alert(
              error?.message ||
              "Review Resume gagal disimpan."
            );
          } finally {
            if (doneButton) {
              doneButton.disabled = false;
              doneButton.textContent = originalText;
            }
          }
        }

        async function approveDailyActivitySchedule(truckNumber) {
          const schedule = dailyActivitySchedules.find(item =>
            getLubeTruckNumber(item?.lubeTruck) === truckNumber);
          if (!schedule) return;
          const scheduleId = cleanDailyActivityValue(schedule?.scheduleId || schedule?.scheduleID || schedule?.id);
          if (!scheduleId || dailyActivityPdfBusy.has(scheduleId)) return;
          const status = normalizeDailyActivityStatus(schedule?.status);
          const state = dailyActivityApprovalStates.get(scheduleId);
          const user = getDailyActivitySessionUser();
          if (!user) return;
          const button = document.getElementById(`approvalApproveButton${truckNumber}`);
          if (status === "RESUME ISSUED" && getDailyActivityDocumentUrl(state)) return;
          if (status !== "APPROVAL" && status !== "APPROVED") return;
          if (status === "APPROVAL") {
            if (!hasDailyActivityPermission("APPROVE")) return;
            if (state?.reviewed !== true) {
              alert("Review Resume harus diselesaikan sebelum Approve."); return;
            }
            if (!window.confirm(`Approve Daily Activity Lube Truck ${truckNumber}?`)) return;
          } else if (!hasDailyActivityPermission("ISSUE_RESUME")) {
            alert("PDF belum tersedia. Akun ini memerlukan izin ISSUE_RESUME untuk mencoba lagi."); return;
          }
          try {
            if (status === "APPROVAL") {
              dailyActivityPdfBusy.set(scheduleId, "Approving...");
              renderDailyActivityApprovalRow(truckNumber, schedule);
              const approved = await dailyActivityApiRequest({
                action: "approveDMSchedule", scheduleId,
                approvedById: cleanDailyActivityValue(user.uniqId)
              });
              if (!approved || approved.success !== true) {
                throw new Error(approved?.message || "Approval gagal.");
              }
            }
            dailyActivityPdfBusy.set(scheduleId, "Generate File...");
            if (button) { button.disabled = true; button.textContent = "Generate File..."; }
            const issued = await dailyActivityApiRequest({
              action: "issueDMResume", scheduleId,
              issuedById: cleanDailyActivityValue(user.uniqId)
            });
            if (!issued || issued.success !== true || !issued.pdfUrl) {
              throw new Error(issued?.message || "PDF belum berhasil disimpan.");
            }
            dailyActivityApprovalStates.set(scheduleId, {
              ...(dailyActivityApprovalStates.get(scheduleId) || {}),
              approved: true, issued: true, pdfUrl: issued.pdfUrl
            });
            if (button) { button.textContent = "Doc. Available"; button.disabled = true; }
            await loadDailyActivitySchedule();
          } catch (error) {
            console.error("HEXA Approval/PDF:", error);
            alert(error?.message || "Proses gagal. Periksa status sebelum mencoba kembali.");
            await loadDailyActivitySchedule();
          } finally {
            dailyActivityPdfBusy.delete(scheduleId);
            renderDailyActivityApprovalReview();
          }
        }


        async function issueDailyActivityResume(truckNumber) {
          if (!hasDailyActivityPermission("ISSUE_RESUME")) {
            alert("Anda tidak memiliki akses Issue Resume.");
            return;
          }

          const schedule =
            dailyActivitySchedules.find(item =>
              getLubeTruckNumber(item?.lubeTruck) === truckNumber
            );

          if (!schedule) return;

          const status = normalizeDailyActivityStatus(schedule?.status);
          if (status !== "APPROVED") {
            alert("Issue Resume hanya dapat dilakukan saat status APPROVED.");
            return;
          }

          const scheduleId = cleanDailyActivityValue(
            schedule?.scheduleId ||
            schedule?.scheduleID ||
            schedule?.id
          );

          if (!scheduleId) return;

          const confirmed = window.confirm(
            `Issue Resume Daily Activity Lube Truck ${truckNumber}?\
\
Sistem akan membuat PDF A4 Portrait dan menyimpannya sebagai snapshot permanen.`
          );

          if (!confirmed) return;

          const button = document.getElementById(
            `approvalIssueButton${truckNumber}`
          );
          const originalText = button?.textContent || "Issue Resume";

          if (button) {
            button.disabled = true;
            button.textContent = "Generating PDF...";
          }

          try {
            const user = getDailyActivitySessionUser();
            const result = await dailyActivityApiRequest({
              action: "issueDMResume",
              scheduleId,
              issuedById: cleanDailyActivityValue(user?.uniqId)
            });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message ||
                "Resume PDF gagal dibuat."
              );
            }

            alert("Resume PDF berhasil dibuat. Status berubah menjadi RESUME ISSUED.");
            await loadDailyActivitySchedule();

          } catch (error) {
            console.error("HEXA Daily Activity Issue Resume error:", error);
            alert(
              error?.message ||
              "Resume PDF gagal dibuat. Status tetap APPROVED."
            );
          } finally {
            if (button) {
              button.textContent = originalText;
            }
          }
        }


        function closeDailyActivityApprovalResume() {
          const backdrop = document.getElementById("approvalResumeBackdrop");
          if (backdrop) backdrop.hidden = true;
        }

        function renderApprovalInspectionFindings(results) {
          const findings = [];
          const repaired = [];

          results.forEach(entry => {
            const unitCode =
              cleanDailyActivityValue(entry?.inspection?.unitCode) ||
              cleanDailyActivityValue(entry?.unit?.unitCode) ||
              "-";

            const answers = Array.isArray(entry?.inspection?.answers)
              ? entry.inspection.answers
              : [];

            answers.forEach(answer => {
              const result = normalizeDailyActivityStatus(answer?.result);
              const item = {
                unitCode,
                group: cleanDailyActivityValue(answer?.group),
                item: cleanDailyActivityValue(answer?.item),
                result
              };

              if (result === "BAD" || result === "X") {
                findings.push(item);
              }

              if (result === "REPAIRED") {
                repaired.push(item);
              }
            });
          });

          renderApprovalFindingList("approvalResumeFindings", findings, "No BAD / X finding.");
          renderApprovalFindingList("approvalResumeRepaired", repaired, "No repaired finding.");
        }

        function renderApprovalFindingList(elementId, items, emptyText) {
          const container = document.getElementById(elementId);
          if (!container) return;

          container.innerHTML = "";

          if (!items.length) {
            container.innerHTML =
              `<div class="approval-resume-empty">${escapeDailyActivityHtml(emptyText)}</div>`;
            return;
          }

          items.forEach(item => {
            const div = document.createElement("div");
            div.className = "approval-resume-item";
            div.innerHTML = `
              <strong>${escapeDailyActivityHtml(item.unitCode)} — ${escapeDailyActivityHtml(item.item || "-")}</strong>
              <span>${escapeDailyActivityHtml(item.group || "-")} · ${escapeDailyActivityHtml(item.result || "-")}</span>
            `;
            container.appendChild(div);
          });
        }

        function renderApprovalNotInspected(units) {
          const container = document.getElementById("approvalResumeNotInspectedList");
          if (!container) return;

          container.innerHTML = "";

          if (!units.length) {
            container.innerHTML =
              '<div class="approval-resume-empty">All target units were inspected.</div>';
            return;
          }

          units.forEach(unit => {
            const unitCode = cleanDailyActivityValue(unit?.unitCode) || "-";
            const reason =
              cleanDailyActivityValue(
                unit?.notCompletedReason ||
                unit?.notInspectedReason ||
                unit?.reason
              ) || "-";
            const note =
              cleanDailyActivityValue(unit?.note || unit?.notes) || "";

            const div = document.createElement("div");
            div.className = "approval-resume-item";
            div.innerHTML = `
              <strong>${escapeDailyActivityHtml(unitCode)}</strong>
              <span>${escapeDailyActivityHtml(reason)}${note ? " · " + escapeDailyActivityHtml(note) : ""}</span>
            `;
            container.appendChild(div);
          });
        }

        function renderApprovalResumeError(message) {
          const findings = document.getElementById("approvalResumeFindings");
          const repaired = document.getElementById("approvalResumeRepaired");

          const html =
            `<div class="approval-resume-empty">${escapeDailyActivityHtml(message)}</div>`;

          if (findings) findings.innerHTML = html;
          if (repaired) repaired.innerHTML = html;
        }

        function formatDailyActivityDisplayDate(value) {
          const clean = cleanDailyActivityValue(value);
          if (!clean) return "-";

          const parts = clean.split("-");
          if (parts.length !== 3) return clean;

          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        function escapeDailyActivityHtml(value) {
          return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
