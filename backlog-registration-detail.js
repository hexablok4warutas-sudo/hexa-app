"use strict";
const BRD_API="https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";
if(sessionStorage.getItem("hexaLoggedIn")!=="true"||!sessionStorage.getItem("hexaUser"))location.replace("index.html");
let brdUser={};try{brdUser=JSON.parse(sessionStorage.getItem("hexaUser")||"{}")}catch(_){location.replace("index.html")}
const brdId=new URLSearchParams(location.search).get("registrationId")||"";
const brdRequester=String(brdUser.uniqId||brdUser.uniqID||brdUser.UNIQ_ID||brdUser["UNIQ ID"]||"").trim();
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const field=(label,value)=>`<div class="brd-field"><span class="brd-label">${esc(label)}</span><div class="brd-value">${esc(value||"-")}</div></div>`;
const labels={DRAFT:"Draft",WAITING_GL_APPROVAL:"Waiting GL Approval",WAITING_SECTION_APPROVAL:"Waiting Section Approval",FULL_APPROVED:"Full Approved",REJECTED:"Revision Required",REVISION_REQUIRED:"Revision Required",SUBMITTED:"Submitted"};
$("brdBack").addEventListener("click",()=>location.href="backlog-registration.html");
$("brdLightboxClose").addEventListener("click",()=>$("brdLightbox").hidden=true);
$("brdLightbox").addEventListener("click",e=>{if(e.target===$("brdLightbox"))$("brdLightbox").hidden=true});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("brdLightbox").hidden=true});
function addPhotos(container,items){const wrap=document.createElement("div");wrap.className="brd-photos";for(const item of items){if(!item.url)continue;const img=document.createElement("img");img.className="brd-photo";img.src=item.url;img.alt=item.name||"Foto";img.loading="lazy";img.referrerPolicy="no-referrer";img.addEventListener("click",()=>{$("brdLightboxImage").src=item.url;$("brdLightbox").hidden=false});wrap.append(img)}container.append(wrap)}
async function loadDetail(){try{
 if(!brdId||!brdRequester)throw Error("Registration ID atau akun tidak ditemukan.");
 const response=await fetch(BRD_API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"getBacklogRegistrationDetail",registrationId:brdId,requesterId:brdRequester})});
 if(!response.ok)throw Error("HTTP "+response.status);
 const data=await response.json();if(!data.success)throw Error(data.message||"Gagal memuat detail.");
 const r=data.registration||{};$("brdSummary").hidden=false;
 $("brdSummary").innerHTML=`<div class="brd-title">${esc(r.registrationId)}</div><span class="brd-status">${esc(labels[r.status]||r.status)}</span><div class="brd-grid">${field("Created By",r.createdBy)}${field("Created At",r.createdAt)}${field("Submitted At",r.submittedAt)}${field("Total Items",r.totalItems)}${field("Created Level",r.createdLevel)}${field("Notes",r.notes)}</div>`;
 $("brdItems").innerHTML="";
 for(const [index,item] of (data.items||[]).entries()){
 const section=document.createElement("article");section.className="brd-item";
 const rows=(item.parts||[]).map(p=>`<tr><td>${esc(p.partName)}</td><td>${esc(p.partNo)}</td><td>${esc(p.quantity)}</td><td>${esc(p.partStatus)}</td></tr>`).join("");
 section.innerHTML=`<h2>Item ${index+1} — ${esc(item.unitCode)}</h2><div class="brd-grid">${field("Inspection ID",item.inspectionId)}${field("HM Inspection",item.hmInspection)}${field("Inspection Date",item.inspectionDate)}${field("Group Component",item.groupComponent)}${field("Rating",item.rating)}${field("Approval Status",labels[item.approvalStatus]||item.approvalStatus)}${field("Problem Description",item.problemDescription)}${field("Inspectors",item.inspectors)}${field("Plan Repair Date",item.planRepairDate)}${field("Notes",item.notes)}${field("Rejection Notes",item.rejectionNotes)}</div><h3>Part Requirement</h3>${rows?`<table class="brd-parts"><thead><tr><th>Part Name</th><th>Part No</th><th>Qty</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`:'<p class="brd-muted">Tidak ada part.</p>'}<h3>Photos / Evidence</h3>`;
 const photos=[];if(item.inspectionPhoto)photos.push({url:item.inspectionPhoto,name:"Inspection Photo"});for(const photo of item.photos||[])photos.push({url:photo.url,name:photo.fileName});
 if(photos.length)addPhotos(section,photos);else{const p=document.createElement("p");p.className="brd-muted";p.textContent="Tidak ada foto.";section.append(p)}
 $("brdItems").append(section);
 }
 $("brdMessage").textContent="";
 }catch(e){$("brdMessage").textContent="Gagal memuat detail: "+e.message;console.error(e)}}
loadDetail();
