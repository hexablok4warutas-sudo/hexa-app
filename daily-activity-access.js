"use strict";

const DAILY_ACTIVITY_ACCESS_API_URL =
  "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";

const DAA_PERMISSION_ROWS = [
  ["PAGE_ACCESS", "Page Access"],
  ["SCHEDULER", "Scheduler"],
  ["EDIT_SCHEDULE", "Edit Schedule"],
  ["DAILY_ACTIVITY_CARD", "Daily Activity Card"],
  ["COMPLETE_ACTIVITY", "Complete Daily Activity"],
  ["APPROVAL_REVIEW", "Approval Review"],
  ["REVIEW_RESUME", "Review Resume"],
  ["APPROVE", "Approve"],
  ["ISSUE_RESUME", "Issue Resume"],
  ["PRINT_DOWNLOAD", "Print / Download"]
];

const DAA_COLUMNS = [
  "MASTER",
  "SECTION_HEAD",
  "GROUP_LEADER",
  "ADMIN",
  "MECHANIC",
  "VISITOR",
  "NAME_ID_1",
  "NAME_ID_2",
  "NAME_ID_3"
];

let daaCurrentUser = null;
let daaUsers = [];
let daaConfig = null;

document.addEventListener("DOMContentLoaded", initializeDailyActivityAccess);

async function initializeDailyActivityAccess() {
  daaCurrentUser = getDAASessionUser();
  if (!daaCurrentUser) return;

  if (Number(daaCurrentUser.kode) !== 1) {
    alert("You are not authorized to access this page.");
    window.location.replace("main.html");
    return;
  }

  document.getElementById("daaBackButton")?.addEventListener("click", function () {
    window.location.href = "system-settings.html";
  });

  document.getElementById("daaSaveButton")?.addEventListener("click", saveDailyActivityAccess);

  ["daaNameId1", "daaNameId2", "daaNameId3"].forEach(function(id) {
    document.getElementById(id)?.addEventListener("change", validateSpecialAccountDuplicates);
  });

  renderLoadingRow();

  try {
    const [usersResult, accessResult] = await Promise.all([
      postDAA({ action: "getUsers" }),
      postDAA({
        action: "getDailyActivityAccessSettings",
        actorUniqId: daaCurrentUser.uniqId
      })
    ]);

    if (!usersResult?.success) {
      throw new Error(usersResult?.message || "Gagal mengambil USER DATA.");
    }

    if (!accessResult?.success) {
      throw new Error(accessResult?.message || "Gagal mengambil Daily Activity Access.");
    }

    daaUsers = (usersResult.data || []).filter(function(user) {
      return String(user.status || "").trim().toUpperCase() !== "INACTIVE";
    });

    daaConfig = accessResult.config || {};

    renderPermissionMatrix();
    renderAccountOptions();
    applyConfigToUI();

  } catch (error) {
    console.error(error);
    showDAAMessage(error.message || "Gagal memuat Access Settings.", "error");
  }
}

function renderLoadingRow() {
  const body = document.getElementById("daaPermissionBody");
  if (!body) return;
  body.innerHTML =
    '<tr class="daa-loading-row"><td colspan="10">Loading permission settings...</td></tr>';
}

function renderPermissionMatrix() {
  const body = document.getElementById("daaPermissionBody");
  if (!body) return;

  body.innerHTML = DAA_PERMISSION_ROWS.map(function(item) {
    const key = item[0];
    const label = item[1];

    const cells = DAA_COLUMNS.map(function(column) {
      return `
        <td>
          <input
            type="checkbox"
            class="daa-check"
            data-permission-key="${escapeDAAHtml(key)}"
            data-permission-column="${escapeDAAHtml(column)}"
            aria-label="${escapeDAAHtml(label + " - " + column)}"
          >
        </td>
      `;
    }).join("");

    return `
      <tr>
        <th scope="row">${escapeDAAHtml(label)}</th>
        ${cells}
      </tr>
    `;
  }).join("");
}

function renderAccountOptions() {
  const options = daaUsers
    .slice()
    .sort(function(a, b) {
      return String(a.nama || "").localeCompare(String(b.nama || ""));
    })
    .map(function(user) {
      const label = `${user.nama || "User"} — ${user.userId || "-"}`;
      return `<option value="${escapeDAAHtml(user.uniqId)}">${escapeDAAHtml(label)}</option>`;
    })
    .join("");

  ["daaNameId1", "daaNameId2", "daaNameId3"].forEach(function(id) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="">Select Account</option>' + options;
  });
}

function applyConfigToUI() {
  const special = daaConfig?.specialAccounts || {};
  document.getElementById("daaNameId1").value = special.NAME_ID_1 || "";
  document.getElementById("daaNameId2").value = special.NAME_ID_2 || "";
  document.getElementById("daaNameId3").value = special.NAME_ID_3 || "";

  const permissions = daaConfig?.permissions || {};

  document.querySelectorAll(".daa-check").forEach(function(input) {
    const key = input.dataset.permissionKey;
    const column = input.dataset.permissionColumn;
    input.checked = Boolean(permissions?.[key]?.[column]);
  });
}

async function saveDailyActivityAccess() {
  if (!validateSpecialAccountDuplicates()) return;

  const saveButton = document.getElementById("daaSaveButton");
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
  }

  try {
    const permissions = {};

    DAA_PERMISSION_ROWS.forEach(function(item) {
      const key = item[0];
      permissions[key] = {};

      DAA_COLUMNS.forEach(function(column) {
        const input = document.querySelector(
          `.daa-check[data-permission-key="${key}"][data-permission-column="${column}"]`
        );
        permissions[key][column] = Boolean(input?.checked);
      });
    });

    const result = await postDAA({
      action: "saveDailyActivityAccessSettings",
      actorUniqId: daaCurrentUser.uniqId,
      specialAccounts: {
        NAME_ID_1: document.getElementById("daaNameId1")?.value || "",
        NAME_ID_2: document.getElementById("daaNameId2")?.value || "",
        NAME_ID_3: document.getElementById("daaNameId3")?.value || ""
      },
      permissions: permissions
    });

    if (!result?.success) {
      throw new Error(result?.message || "Gagal menyimpan Daily Activity Access.");
    }

    daaConfig = result.config || daaConfig;
    showDAAMessage("Daily Activity Access berhasil disimpan.", "success");

  } catch (error) {
    console.error(error);
    showDAAMessage(error.message || "Gagal menyimpan Daily Activity Access.", "error");
  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Changes";
    }
  }
}

function validateSpecialAccountDuplicates() {
  const values = [
    document.getElementById("daaNameId1")?.value || "",
    document.getElementById("daaNameId2")?.value || "",
    document.getElementById("daaNameId3")?.value || ""
  ].filter(Boolean);

  const duplicate = new Set(values).size !== values.length;

  if (duplicate) {
    showDAAMessage(
      "Satu akun tidak boleh digunakan pada lebih dari satu Name ID.",
      "error"
    );
    return false;
  }

  return true;
}

async function postDAA(payload) {
  const response = await fetch(DAILY_ACTIVITY_ACCESS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }

  return response.json();
}

function getDAASessionUser() {
  const loggedIn = sessionStorage.getItem("hexaLoggedIn");
  const rawUser = sessionStorage.getItem("hexaUser");

  if (loggedIn !== "true" || !rawUser) {
    window.location.replace("index.html");
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    if (!user || !user.uniqId || !user.userId) {
      window.location.replace("index.html");
      return null;
    }
    return user;
  } catch (error) {
    window.location.replace("index.html");
    return null;
  }
}

function showDAAMessage(message, type) {
  const box = document.getElementById("daaMessage");
  if (!box) return;

  box.hidden = false;
  box.textContent = message || "";
  box.className = "daa-message " + (type === "success" ? "is-success" : "is-error");

  window.clearTimeout(showDAAMessage._timer);
  showDAAMessage._timer = window.setTimeout(function() {
    box.hidden = true;
  }, 4500);
}

function escapeDAAHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
