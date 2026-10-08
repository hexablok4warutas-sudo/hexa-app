"use strict";
// HEXA - BACKLOG REGISTRATION LIST (DATABASE)
// Sumber: HEXA API / REGISTRATION sheet.
// Tidak mengubah Start Inspection atau form Save Draft.
const HEXA_API_URL = "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";
const hexaLoggedIn = sessionStorage.getItem("hexaLoggedIn");
const hexaUserData = sessionStorage.getItem("hexaUser");
if (hexaLoggedIn !== "true" || !hexaUserData) window.location.replace("index.html");
let currentUser = null;
try { currentUser = JSON.parse(hexaUserData); }
catch (error) {
  sessionStorage.removeItem("hexaLoggedIn");
  sessionStorage.removeItem("hexaUser");
  window.location.replace("index.html");
}
const backButton = document.getElementById("registrationBackButton");
const searchInput = document.getElementById("registrationSearch");
const filterButton = document.getElementById("registrationFilterButton");
const filterPanel = document.getElementById("registrationFilterPanel");
const statusFilter = document.getElementById("registrationStatusFilter");
const clearFilterButton = document.getElementById("registrationClearFilter");
const addButton = document.getElementById("registrationAddButton");
const emptyAddButton = document.getElementById("registrationEmptyAddButton");
const registrationList = document.getElementById("registrationList");
const emptyState = document.getElementById("registrationEmpty");
const resultCount = document.getElementById("registrationResultCount");
let registrationData = [];
let registrationLoading = false;
let registrationError = "";
function registrationUserId() {
  return String(currentUser?.uniqId || currentUser?.uniqID || currentUser?.UNIQ_ID || currentUser?.["UNIQ ID"] || "").trim();
}
async function registrationPost(payload) {
  const response = await fetch(HEXA_API_URL, {
    method: "POST",
    headers: {"Content-Type": "text/plain;charset=utf-8"},
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const result = await response.json();
  if (!result || result.success !== true) throw new Error(result?.message || "Gagal mengambil data registrasi.");
  return result;
}
async function loadRegistrations() {
  if (registrationLoading) return;
  registrationLoading = true;
  registrationError = "";
  renderRegistrationList();
  try {
    const createdById = registrationUserId();
    if (!createdById) throw new Error("UNIQ ID akun tidak ditemukan. Silakan login kembali.");
    const result = await registrationPost({action: "getBacklogRegistrations", createdById});
    registrationData = (Array.isArray(result.data) ? result.data : []).map(function(item) {
      return {
        registrationId: String(item.registrationId || item.registrationNo || ""),
        registrationNo: String(item.registrationId || item.registrationNo || ""),
        createdBy: String(item.createdBy || "-"),
        createdAt: String(item.createdAt || ""),
        updatedAt: String(item.updatedAt || ""),
        totalItems: Number(item.totalItems) || 0,
        status: String(item.status || "DRAFT").toUpperCase(),
        notes: String(item.notes || "")
      };
    });
    registrationData.sort(function(a,b){return b.updatedAt.localeCompare(a.updatedAt);});
  } catch(error) {
    registrationError = error.message || "Gagal memuat registrasi.";
    console.error("HEXA Backlog Registration:", error);
  } finally {
    registrationLoading = false;
    renderRegistrationList();
  }
}
function openAddRegistration() { window.location.href = "backlog-registration-form.html"; }
function openRegistration(registration) {
  if (registration.status !== "DRAFT") {
    alert("Registrasi berstatus " + getStatusLabel(registration.status) + ". Tampilan detail/approval akan dibuat pada tahap berikutnya.");
    return;
  }
  window.location.href = "backlog-registration-form.html?registrationId=" + encodeURIComponent(registration.registrationId);
}
if (backButton) backButton.addEventListener("click", function(){window.location.href="backlog-monitoring.html";});
if (addButton) addButton.addEventListener("click",openAddRegistration);
if (emptyAddButton) emptyAddButton.addEventListener("click",openAddRegistration);
if (filterButton && filterPanel) filterButton.addEventListener("click",function(){filterPanel.hidden=!filterPanel.hidden;});
if (clearFilterButton) clearFilterButton.addEventListener("click",function(){
  if (statusFilter) statusFilter.value="";
  if (searchInput) searchInput.value="";
  renderRegistrationList();
});
if (searchInput) searchInput.addEventListener("input",renderRegistrationList);
if (statusFilter) statusFilter.addEventListener("change",renderRegistrationList);
function getFilteredRegistrations() {
  const keyword = String(searchInput?.value || "").trim().toLowerCase();
  const selectedStatus = String(statusFilter?.value || "").trim().toUpperCase();
  return registrationData.filter(function(item){
    const searchable = [item.registrationNo,item.createdBy,item.status,item.notes].join(" ").toLowerCase();
    return (!keyword || searchable.includes(keyword)) && (!selectedStatus || item.status===selectedStatus);
  });
}
function getStatusLabel(status) {
  return ({DRAFT:"Draft",SUBMITTED:"Submitted",WAITING_GL_APPROVAL:"Waiting GL Approval",
    WAITING_SECTION_APPROVAL:"Waiting Section Approval",FULL_APPROVED:"Full Approved",
    REJECTED:"Revision Required",REVISION_REQUIRED:"Revision Required"})[status] || status || "-";
}
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function formatRegistrationDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("id-ID",{
    day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"
  }).format(date);
}
function renderRegistrationList() {
  if (!registrationList || !emptyState) return;
  const data=getFilteredRegistrations();
  registrationList.innerHTML="";
  if (resultCount) resultCount.textContent=registrationLoading ? "Loading..." : data.length + (data.length===1?" registration":" registrations");
  if (registrationLoading) {
    emptyState.hidden=true;
    const message=document.createElement("p");message.textContent="Memuat Registrasi Backlog...";
    registrationList.appendChild(message);
    updateSummary();return;
  }
  if (registrationError) {
    emptyState.hidden=true;
    const panel=document.createElement("div");
    panel.style.cssText="padding:16px;border:1px solid #e0a0a0;border-radius:12px;margin:12px 0";
    const text=document.createElement("p");text.textContent="Gagal memuat data: "+registrationError;
    const retry=document.createElement("button");retry.type="button";retry.textContent="Coba Lagi";
    retry.addEventListener("click",loadRegistrations);
    panel.append(text,retry);registrationList.appendChild(panel);updateSummary();return;
  }
  emptyState.hidden=data.length!==0;
  data.forEach(function(item){
    const card=document.createElement("article");
    card.className="registration-card";
    card.style.cursor=item.status==="DRAFT"?"pointer":"default";
    card.innerHTML=`<strong>${escapeHtml(item.registrationNo)}</strong>
      <div>${escapeHtml(getStatusLabel(item.status))}</div>
      <div style="margin-top:8px;font-size:0.9em;opacity:0.85">
        ${escapeHtml(item.createdBy)} · ${escapeHtml(formatRegistrationDate(item.createdAt))}
      </div>
      <div style="margin-top:4px;font-size:0.9em;opacity:0.85">${item.totalItems} Item${item.totalItems===1?"":"s"}</div>
      <div style="margin-top:10px;font-weight:600">${item.status==="DRAFT"?"Buka / Edit Draft →":"Detail / Approval (segera hadir)"}</div>`;
    card.tabIndex=0;
    card.setAttribute("role","button");
    card.setAttribute("aria-label","Buka registrasi "+item.registrationNo);
    card.addEventListener("click",function(){openRegistration(item);});
    card.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();openRegistration(item);}});
    registrationList.appendChild(card);
  });
  updateSummary();
}
function updateSummary() {
  const draft=registrationData.filter(x=>x.status==="DRAFT").length;
  const waiting=registrationData.filter(x=>["SUBMITTED","WAITING_GL_APPROVAL","WAITING_SECTION_APPROVAL"].includes(x.status)).length;
  const approved=registrationData.filter(x=>x.status==="FULL_APPROVED").length;
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value);};
  set("registrationTotal",registrationData.length);
  set("registrationDraft",draft);
  set("registrationWaiting",waiting);
  set("registrationApproved",approved);
}
function initializeBacklogRegistration(){renderRegistrationList();loadRegistrations();}
initializeBacklogRegistration();
