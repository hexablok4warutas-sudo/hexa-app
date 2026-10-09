"use strict";
const HEXA_API_URL="https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";
if(sessionStorage.getItem("hexaLoggedIn")!=="true"||!sessionStorage.getItem("hexaUser"))location.replace("index.html");
let currentUser={};try{currentUser=JSON.parse(sessionStorage.getItem("hexaUser")||"{}");}catch(e){location.replace("index.html");}
const byId=id=>document.getElementById(id);
const backButton=byId("registrationBackButton"),searchInput=byId("registrationSearch"),filterButton=byId("registrationFilterButton"),filterPanel=byId("registrationFilterPanel"),statusFilter=byId("registrationStatusFilter"),clearFilterButton=byId("registrationClearFilter"),addButton=byId("registrationAddButton"),emptyAddButton=byId("registrationEmptyAddButton"),registrationList=byId("registrationList"),emptyState=byId("registrationEmpty"),resultCount=byId("registrationResultCount");
let registrationData=[],registrationLoading=false,registrationError="";
function registrationUserId(){return String(currentUser.uniqId||currentUser.uniqID||currentUser.UNIQ_ID||currentUser["UNIQ ID"]||"").trim();}
function registrationUserLevel(){return String(currentUser.level||currentUser.LEVEL||"").trim().toUpperCase().replace(/[\s_-]+/g,"");}
function canCreateRegistration(){return registrationUserLevel()!=="VISITOR";}
function isOwnRegistration(r){return !!registrationUserId()&&r.createdById===registrationUserId();}
async function registrationPost(payload){const response=await fetch(HEXA_API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});if(!response.ok)throw Error("HTTP "+response.status);const result=await response.json();if(!result||result.success!==true)throw Error(result?.message||"Gagal mengambil registrasi.");return result;}
async function loadRegistrations(){if(registrationLoading)return;registrationLoading=true;registrationError="";renderRegistrationList();try{const requesterId=registrationUserId();if(!requesterId)throw Error("UNIQ ID akun tidak ditemukan. Login kembali.");const result=await registrationPost({action:"getBacklogRegistrations",createdById:requesterId});registrationData=(Array.isArray(result.data)?result.data:[]).map(item=>({registrationId:String(item.registrationId||item.registrationNo||""),registrationNo:String(item.registrationId||item.registrationNo||""),createdById:String(item.createdById||""),createdBy:String(item.createdBy||"-"),createdAt:String(item.createdAt||""),updatedAt:String(item.updatedAt||""),totalItems:Number(item.totalItems)||0,status:String(item.status||"DRAFT").toUpperCase(),pdfUrl:String(item.pdfUrl||""),notes:String(item.notes||"")}));registrationData.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}catch(e){registrationError=e.message||"Gagal memuat registrasi.";console.error(e);}finally{registrationLoading=false;renderRegistrationList();}}
function openAddRegistration(){if(!canCreateRegistration()){alert("Visitor tidak memiliki izin membuat registrasi.");return;}location.href="backlog-registration-form.html";}
function openRegistration(r){const ownDraft=r.status==="DRAFT"&&isOwnRegistration(r);const target=ownDraft?"backlog-registration-form.html":"backlog-registration-detail.html";location.href=target+"?registrationId="+encodeURIComponent(r.registrationId);}
backButton?.addEventListener("click",()=>location.href="backlog-monitoring.html");
addButton?.addEventListener("click",openAddRegistration);emptyAddButton?.addEventListener("click",openAddRegistration);
if(!canCreateRegistration()){if(addButton)addButton.hidden=true;if(emptyAddButton)emptyAddButton.hidden=true;}
filterButton?.addEventListener("click",()=>{if(filterPanel)filterPanel.hidden=!filterPanel.hidden;});
clearFilterButton?.addEventListener("click",()=>{if(statusFilter)statusFilter.value="";if(searchInput)searchInput.value="";renderRegistrationList();});
searchInput?.addEventListener("input",renderRegistrationList);statusFilter?.addEventListener("change",renderRegistrationList);
function getFilteredRegistrations(){const keyword=String(searchInput?.value||"").trim().toLowerCase(),selectedStatus=String(statusFilter?.value||"").trim().toUpperCase();return registrationData.filter(item=>[item.registrationNo,item.createdBy,item.status,item.notes].join(" ").toLowerCase().includes(keyword)&&(!selectedStatus||item.status===selectedStatus));}
function getStatusLabel(s){return {DRAFT:"Draft",SUBMITTED:"Submitted",WAITING_GL_APPROVAL:"Waiting GL Approval",WAITING_SECTION_APPROVAL:"Waiting Section Approval",FULL_APPROVED:"Full Approved",REJECTED:"Rejected",REVISION_REQUIRED:"Revision Required"}[s]||s||"-";}
function getStatusTheme(s){return {DRAFT:"draft",SUBMITTED:"gl",WAITING_GL_APPROVAL:"gl",WAITING_SECTION_APPROVAL:"section",FULL_APPROVED:"approved",REJECTED:"rejected",REVISION_REQUIRED:"revision"}[s]||"draft";}
function escapeHtml(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function formatRegistrationDate(v){if(!v)return "-";const d=new Date(v);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d);}
function renderRegistrationList(){
  if(!registrationList||!emptyState)return;
  const data=getFilteredRegistrations();registrationList.innerHTML="";
  if(resultCount)resultCount.textContent=registrationLoading?"Loading...":data.length+(data.length===1?" registration":" registrations");
  if(registrationLoading){emptyState.hidden=true;const p=document.createElement("p");p.textContent="Memuat Registrasi Backlog...";registrationList.append(p);updateSummary();return;}
  if(registrationError){emptyState.hidden=true;const panel=document.createElement("div");panel.style.cssText="padding:16px;border:1px solid #e0a0a0;border-radius:12px;margin:12px 0";const p=document.createElement("p");p.textContent="Gagal memuat data: "+registrationError;const retry=document.createElement("button");retry.type="button";retry.textContent="Coba Lagi";retry.addEventListener("click",loadRegistrations);panel.append(p,retry);registrationList.append(panel);updateSummary();return;}
  emptyState.hidden=data.length!==0;
  data.forEach(item=>{
    const card=document.createElement("article");card.className="registration-card registration-card--"+getStatusTheme(item.status);card.style.cursor="pointer";
    const ownDraft=item.status==="DRAFT"&&isOwnRegistration(item);
    card.innerHTML=`<div class="registration-card-top"><div class="registration-card-main"><strong class="registration-card-id">${escapeHtml(item.registrationNo)}</strong><div class="registration-card-meta">${escapeHtml(item.createdBy)} · ${escapeHtml(formatRegistrationDate(item.createdAt))}</div><div class="registration-card-count">${item.totalItems} Item${item.totalItems===1?"":"s"}</div></div><span class="registration-status-badge">${escapeHtml(getStatusLabel(item.status))}</span></div><div class="registration-card-link">${ownDraft?"Buka / Edit Draft":"Lihat Detail"}<span aria-hidden="true"> →</span></div>`;
    if(item.status==="FULL_APPROVED"&&/^https:\/\//i.test(item.pdfUrl)){
      const links=document.createElement("span");links.style.cssText="display:inline-flex;flex-wrap:wrap;gap:16px;margin-left:18px;align-items:center";
      const view=document.createElement("a");view.href=item.pdfUrl;view.target="_blank";view.rel="noopener noreferrer";view.textContent="📄 View PDF";
      const download=document.createElement("a");const m=item.pdfUrl.match(/\/file\/d\/([\w-]+)/)||item.pdfUrl.match(/[?&]id=([\w-]+)/);download.href=m?"https://drive.google.com/uc?export=download&id="+encodeURIComponent(m[1]):item.pdfUrl;download.target="_blank";download.rel="noopener noreferrer";download.textContent="↧ Download";
      [view,download].forEach(a=>a.addEventListener("click",e=>e.stopPropagation()));links.append(view,download);card.querySelector(".registration-card-link").append(links);
    }
    card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label","Buka registrasi "+item.registrationNo+", status "+getStatusLabel(item.status));
    card.addEventListener("click",()=>openRegistration(item));card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openRegistration(item);}});registrationList.append(card);
  });updateSummary();
}
function updateSummary(){const draft=registrationData.filter(x=>x.status==="DRAFT").length,waiting=registrationData.filter(x=>["SUBMITTED","WAITING_GL_APPROVAL","WAITING_SECTION_APPROVAL"].includes(x.status)).length,approved=registrationData.filter(x=>x.status==="FULL_APPROVED").length;for(const [id,value] of [["registrationTotal",registrationData.length],["registrationDraft",draft],["registrationWaiting",waiting],["registrationApproved",approved]]){const el=byId(id);if(el)el.textContent=String(value);}}
renderRegistrationList();loadRegistrations();
