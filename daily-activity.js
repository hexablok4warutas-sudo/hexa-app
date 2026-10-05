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
          try {
            const result = await dailyActivityApiRequest({
              action: "resolveDailyActivityPermissions",
              uniqId: cleanDailyActivityValue(user?.uniqId)
            });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message ||
                "Daily Activity permission tidak dapat dimuat."
              );
            }

            dailyActivityPermissions =
              result.permissions && typeof result.permissions === "object"
                ? result.permissions
                : {};

            dailyActivityPermissionSource =
              cleanDailyActivityValue(result.source);

            return true;

          } catch (error) {
            console.error("HEXA Daily Activity permission error:", error);
            alert(
              error?.message ||
              "Daily Activity permission tidak dapat dimuat."
            );
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

            // Render schedule/card utama segera; Approval tidak boleh menahan halaman.
            renderDailyActivitySchedules();

            loadDailyActivityApprovalStates()
              .then(function() {
                // Setelah approval state selesai, update hanya panel Approval Review.
                renderDailyActivityApprovalReview();
              })
              .catch(function(error) {
                console.error(
                  "HEXA DM Approval background load error:",
                  error
                );
              });
          } catch (error) {
            console.error("HEXA Daily Activity load error:", error);
            setDailyActivityErrorState(
              error.message || "Unable to load Daily Activity Schedule."
            );
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
        }

        function renderLubeTruckSchedule(truckNumber, schedule) {
          const editButton =
            document.getElementById(`lubeTruck${truckNumber}EditButton`);

          if (editButton) {
            editButton.hidden =
              !hasDailyActivityPermission("EDIT_SCHEDULE");
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
            ?.addEventListener("click", () => openDailyActivityClosing(15));

          document.getElementById("lubeTruck16CompleteButton")
            ?.addEventListener("click", () => openDailyActivityClosing(16));

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

        function renderLubeTruckClosingState(truckNumber, schedule) {
          const button =
            document.getElementById(`lubeTruck${truckNumber}CompleteButton`);

          const statusElement =
            document.getElementById(`lubeTruck${truckNumber}ScheduleStatus`);

          if (!button) return;

          const status =
            normalizeDailyActivityStatus(schedule?.status);

          const editButton =
            document.getElementById(`lubeTruck${truckNumber}EditButton`);

          const scheduleLocked =
            status === "APPROVAL" || status === "APPROVED";

          if (editButton) {
            editButton.disabled = scheduleLocked;
            editButton.classList.toggle("is-locked", scheduleLocked);
            editButton.title =
              scheduleLocked
                ? "Schedule sudah Complete dan menunggu/selesai Approval."
                : "";
          }

          button.hidden =
            !hasDailyActivityPermission("COMPLETE_ACTIVITY");

          if (status === "APPROVAL" || status === "APPROVED") {
            button.disabled = true;
            button.classList.add("is-completed");
            button.textContent = "✓ COMPLETED";
          } else {
            button.disabled = false;
            button.classList.remove("is-completed");
            button.textContent = "COMPLETE DAILY ACTIVITY";
          }

          if (statusElement) {
            statusElement.classList.toggle(
              "is-approval",
              status === "APPROVAL"
            );
          }
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

          if (status === "APPROVAL" || status === "APPROVED") {
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

          if (!unitCode) {
            alert("Unit Code tidak ditemukan pada Unit Card.");
            return;
          }

          try {
            const result = await dailyActivityApiRequest({
              action: "getDMChecklistByUnit",
              unitCode: unitCode
            });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message || `Checklist ${unitCode} gagal dimuat.`
              );
            }

            const checklist = getDailyActivityChecklistArray(result);

            await openDailyActivityInspectionModal({
              scheduleUnitId: cleanDailyActivityValue(unit?.scheduleUnitId),
              unitCode,
              egi: cleanDailyActivityValue(
                result?.egi || result?.unit?.egi || unit?.egi
              ),
              type: cleanDailyActivityValue(
                result?.type ||
                result?.equipmentType ||
                result?.unit?.type ||
                unit?.type
              ),
              checklist
            });

          } catch (error) {
            console.error(
              "HEXA Daily Activity Inspection error:",
              unitCode,
              error
            );
            alert(
              error?.message ||
              `Checklist ${unitCode} gagal dimuat.`
            );
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
                   style="margin-top:7px;font-size:12px;color:#777;">
                No photo selected
              </div>
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

        const photoInput =
          document.getElementById("dailyActivityInspectionPhoto");

        document.getElementById("dailyActivityInspectionAddPhoto")
          ?.addEventListener("click", () => {
            photoInput?.click();
          });

        photoInput?.addEventListener("change", () => {
          const name =
            document.getElementById("dailyActivityInspectionPhotoName");
          const file = photoInput.files?.[0];

          if (name) {
            name.textContent = file
              ? file.name
              : "No photo selected";
          }
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
      if (notes) notes.value = "";
      if (photo) photo.value = "";
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
        const result =
          await dailyActivityApiRequest({
            action: "submitDMInspection",
            scheduleUnitId: scheduleUnitId,
            inspectedById: inspectorId,
            hourMeter: hourMeter,
            activityNotes: activityNotes,
            photo: "",
            answers: answers
          });

        if (!result || result.success !== true) {
          throw new Error(
            result?.message ||
            "Daily Activity gagal di-Submit."
          );
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
        const result = await dailyActivityApiRequest({
          action: "saveDMInspectionDraft",
          scheduleUnitId: scheduleUnitId,
          inspectedById: inspectorId,
          hourMeter: hourMeter,
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
            approveButton.disabled =
              !schedule ||
              status !== "APPROVAL" ||
              !reviewed ||
              !hasDailyActivityPermission("APPROVE");
          }

          // Stage 4C.
          if (issueButton) issueButton.disabled = true;
          if (pdfButton) pdfButton.disabled = true;
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
          if (!hasDailyActivityPermission("APPROVE")) {
            alert("Anda tidak memiliki akses Approve.");
            return;
          }

          const schedule =
            dailyActivitySchedules.find(item =>
              getLubeTruckNumber(item?.lubeTruck) === truckNumber
            );

          if (!schedule) return;

          const scheduleId =
            cleanDailyActivityValue(
              schedule?.scheduleId ||
              schedule?.scheduleID ||
              schedule?.id
            );

          if (!scheduleId) return;

          const approvalState =
            dailyActivityApprovalStates.get(scheduleId);

          if (approvalState?.reviewed !== true) {
            alert(
              "Review Resume harus diselesaikan sebelum Approve."
            );
            return;
          }

          const approved =
            window.confirm(
              `Approve Daily Activity Lube Truck ${truckNumber}?`
            );

          if (!approved) return;

          const button =
            document.getElementById(
              `approvalApproveButton${truckNumber}`
            );

          const originalText =
            button?.textContent || "Approve";

          if (button) {
            button.disabled = true;
            button.textContent = "Approving...";
          }

          try {
            const user =
              getDailyActivitySessionUser();

            const result = await dailyActivityApiRequest({
              action: "approveDMSchedule",
              scheduleId,
              approvedById: cleanDailyActivityValue(user?.uniqId)
            });

            if (!result || result.success !== true) {
              throw new Error(
                result?.message ||
                "Daily Activity gagal di-approve."
              );
            }

            await loadDailyActivitySchedule();

          } catch (error) {
            console.error(
              "HEXA Daily Activity approve error:",
              error
            );
            alert(
              error?.message ||
              "Daily Activity gagal di-approve."
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
