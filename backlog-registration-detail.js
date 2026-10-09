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
// Pilihan approval bersifat lokal sampai API penyimpanan disiapkan.
const brdSelectedParts=new Set();
const brdPartIds=[];
const brdItemPartIds=new Map();
function brdIsSectionHead(){
 const level=String(brdUser.level||brdUser.LEVEL||brdUser.role||"").trim().toLowerCase().replace(/[_-]+/g," ");
 return level==="section head"||level==="sectionhead";
}
function brdSyncSelection(){
 const all=$("brdApproveAll");
 const selected=brdPartIds.filter(id=>brdSelectedParts.has(id)).length;
 all.checked=brdPartIds.length>0&&selected===brdPartIds.length;
 all.indeterminate=selected>0&&selected<brdPartIds.length;
 $("brdApprovalCount").textContent=selected+" dari "+brdPartIds.length+" part dipilih";
 document.querySelectorAll(".brd-part-checkbox").forEach(input=>{input.checked=brdSelectedParts.has(input.dataset.partId)});
 document.querySelectorAll(".brd-item-checkbox").forEach(input=>{
  const ids=brdItemPartIds.get(input.dataset.itemKey)||[];
  const count=ids.filter(id=>brdSelectedParts.has(id)).length;
  input.checked=ids.length>0&&count===ids.length;
  input.indeterminate=count>0&&count<ids.length;
 });
}
$("brdApproveAll").addEventListener("change",event=>{
 for(const id of brdPartIds){if(event.target.checked)brdSelectedParts.add(id);else brdSelectedParts.delete(id)}
 brdSyncSelection();
});
async function loadDetail(){try{
 if(!brdId||!brdRequester)throw Error("Registration ID atau akun tidak ditemukan.");
 const response=await fetch(BRD_API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"getBacklogRegistrationDetail",registrationId:brdId,requesterId:brdRequester})});
 if(!response.ok)throw Error("HTTP "+response.status);
 const data=await response.json();if(!data.success)throw Error(data.message||"Gagal memuat detail.");
 const r=data.registration||{};
 $("brdSummary").hidden=false;
 $("brdSummary").innerHTML=`<div class="brd-title">${esc(r.registrationId)}</div><span class="brd-status">${esc(labels[r.status]||r.status)}</span><div class="brd-grid">${field("Created By",r.createdBy)}${field("Created At",r.createdAt)}${field("Submitted At",r.submittedAt)}${field("Total Items",r.totalItems)}${field("Created Level",r.createdLevel)}${field("Notes",r.notes)}</div>`;
 const eligible=brdIsSectionHead()&&String(r.status).toUpperCase()==="WAITING_SECTION_APPROVAL";
 $("brdApprovalPanel").hidden=!eligible;
 $("brdItems").replaceChildren();brdSelectedParts.clear();brdPartIds.length=0;brdItemPartIds.clear();
 const seenIds=new Set();let missingIds=0;
 for(const [index,item] of (data.items||[]).entries()){
  const section=document.createElement("article");section.className="brd-item";
  const itemKey=String(index);const ids=[];
  const rows=(item.parts||[]).map(part=>{
   const partId=String(part.partId||"").trim();
   const valid=partId&&!seenIds.has(partId);
   if(valid){seenIds.add(partId);brdPartIds.push(partId);ids.push(partId)}else missingIds++;
   const status=String(part.approvalStatus||"PENDING").toUpperCase();
   const checkbox=eligible?`<td>${valid?`<input class="brd-part-checkbox" type="checkbox" data-part-id="${esc(partId)}" aria-label="Pilih ${esc(part.partName||part.partNo||partId)}">`:'<span title="PART ID tidak tersedia atau duplikat">—</span>'}</td>`:"<td>—</td>";
   return `<tr>${checkbox}<td>${esc(part.partName)}</td><td>${esc(part.partNo)}</td><td>${esc(part.quantity)}</td><td>${esc(part.partStatus)}</td><td><span class="brd-part-status ${status==='APPROVED'?'approved':status==='REJECTED'?'rejected':''}">${esc(status)}</span></td></tr>`;
  }).join("");
  brdItemPartIds.set(itemKey,ids);
  const itemSelect=eligible&&ids.length?`<label class="brd-check-label brd-item-check"><input type="checkbox" class="brd-item-checkbox" data-item-key="${esc(itemKey)}"> Approve All Item ${index+1}</label>`:"";
  section.innerHTML=`<h2>Item ${index+1} — ${esc(item.unitCode)}</h2>${itemSelect}<div class="brd-grid">${field("Inspection ID",item.inspectionId)}${field("HM Inspection",item.hmInspection)}${field("Inspection Date",item.inspectionDate)}${field("Group Component",item.groupComponent)}${field("Rating",item.rating)}${field("Approval Status",labels[item.approvalStatus]||item.approvalStatus)}${field("Problem Description",item.problemDescription)}${field("Inspectors",item.inspectors)}${field("Plan Repair Date",item.planRepairDate)}${field("Notes",item.notes)}${field("Rejection Notes",item.rejectionNotes)}</div><h3>Part Requirement</h3>${rows?`<div class="brd-parts-wrap"><table class="brd-parts"><thead><tr><th>Pilih</th><th>Part Name</th><th>Part No</th><th>Qty</th><th>Part Status</th><th>Approval</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="brd-muted">Tidak ada part.</p>'}<h3>Photos / Evidence</h3>`;
  section.querySelectorAll(".brd-part-checkbox").forEach(input=>input.addEventListener("change",()=>{
   if(input.checked)brdSelectedParts.add(input.dataset.partId);else brdSelectedParts.delete(input.dataset.partId);
   brdSyncSelection();
  }));
  const itemCheckbox=section.querySelector(".brd-item-checkbox");
  if(itemCheckbox)itemCheckbox.addEventListener("change",()=>{
   for(const id of ids){if(itemCheckbox.checked)brdSelectedParts.add(id);else brdSelectedParts.delete(id)}
   brdSyncSelection();
  });
  const photos=[];if(item.inspectionPhoto)photos.push({url:item.inspectionPhoto,name:"Inspection Photo"});for(const photo of item.photos||[])photos.push({url:photo.url,name:photo.fileName});
  if(photos.length)addPhotos(section,photos);else{const note=document.createElement("p");note.className="brd-muted";note.textContent="Tidak ada foto.";section.append(note)}
  $("brdItems").append(section);
 }
 if(eligible){
  $("brdApproveAll").disabled=brdPartIds.length===0;
  $("brdApprovalHelp").textContent=missingIds?missingIds+" part tidak dapat dipilih karena PART ID kosong atau duplikat. Periksa respons API dan database PARTS.":"Pilih part yang akan disetujui. Belum ada perubahan tersimpan di database.";
  brdSyncSelection();
 }
 $("brdMessage").textContent="";
 }catch(error){$("brdMessage").textContent="Gagal memuat detail: "+error.message;console.error(error)}
}
loadDetail();
