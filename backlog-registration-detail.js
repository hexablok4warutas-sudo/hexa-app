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
// Ubah link berbagi Google Drive menjadi URL gambar thumbnail.
function normalizeDriveImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const thumbnailMatch = url.match(/\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  const fileId = (fileMatch || queryMatch || thumbnailMatch || [])[1];
  return fileId
    ? "https://drive.google.com/thumbnail?id=" + encodeURIComponent(fileId) + "&sz=w1000"
    : url;
}
function addPhotos(container,items) {
  const wrap = document.createElement("div");
  wrap.className = "brd-photos";
  for (const item of items) {
    const photoUrl = normalizeDriveImageUrl(item.url);
    if (!photoUrl) continue;
    const img = document.createElement("img");
    img.className = "brd-photo";
    img.src = photoUrl;
    img.alt = item.name || "Foto";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("click", () => {
      $("brdLightboxImage").src = photoUrl;
      $("brdLightbox").hidden = false;
    });
    wrap.append(img);
  }
  container.append(wrap);
}
// Pilihan approval bersifat lokal sampai API penyimpanan disiapkan.
const brdSelectedParts=new Set();
const brdPartIds=[];
const brdItemPartIds=new Map();
function brdIsGL(){
 const level=String(brdUser.level||brdUser.LEVEL||brdUser.role||'').trim().toLowerCase().replace(/[_-]+/g,' ');
 return level==='group leader'||level==='groupleader'||level==='gl'||level==='3';
}
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
 $("brdSummary").dataset.stage=String(r.status||"").toUpperCase();
 $("brdApprovalPanel").dataset.stage=String(r.status||"").toUpperCase();
 $("brdSummary").innerHTML=`<div class="brd-title">${esc(r.registrationId)}</div><span class="brd-status" data-status="${esc(r.status)}">${esc(labels[r.status]||r.status)}</span><div class="brd-grid">${field("Created By",r.createdBy)}${field("Created At",r.createdAt)}${field("Submitted At",r.submittedAt)}${field("Total Items",r.totalItems)}${field("Created Level",r.createdLevel)}${field("Notes",r.notes)}</div>`;
 const isGL=brdIsGL()&&String(r.status).toUpperCase()==='WAITING_GL_APPROVAL';
  const isSection=brdIsSectionHead()&&String(r.status).toUpperCase()==='WAITING_SECTION_APPROVAL';
  const eligible=isGL||isSection;
  const forward=$('brdGLForward');
  if(forward){forward.hidden=!isGL;forward.disabled=false;}
  const final=$('brdFinalApprove');if(final)final.hidden=!isSection;
  const revision=$('brdRequestRevision');if(revision)revision.hidden=true;
  const title=$('brdApprovalTitle');if(title)title.textContent=isGL?'GL Approval Part':'Persiapan Approval Part';
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
   const editAction=isGL?`<button type="button" class="brd-edit-part" data-part-id="${esc(partId)}">Edit</button>`:"—";
   return `<tr>${checkbox}<td>${esc(part.partName)}</td><td>${esc(part.partNo)}</td><td>${esc(part.quantity)}</td><td>${esc(part.partStatus)}</td><td>${editAction}</td><td><span class="brd-part-status ${status==='APPROVED'?'approved':status==='REJECTED'?'rejected':''}">${esc(status)}</span></td></tr>`;
  }).join("");
  brdItemPartIds.set(itemKey,ids);
  const itemSelect=eligible&&ids.length?`<label class="brd-check-label brd-item-check"><input type="checkbox" class="brd-item-checkbox" data-item-key="${esc(itemKey)}"> Approve All Item ${index+1}</label>`:"";
  section.innerHTML=`<h2>Item ${index+1} — ${esc(item.unitCode)}</h2>${itemSelect}<div class="brd-grid">${field("Inspection ID",item.inspectionId)}${field("HM Inspection",item.hmInspection)}${field("Inspection Date",item.inspectionDate)}${field("Group Component",item.groupComponent)}${field("Rating",item.rating)}${field("Approval Status",labels[item.approvalStatus]||item.approvalStatus)}${field("Problem Description",item.problemDescription)}${field("Inspectors",item.inspectors)}${field("Plan Repair Date",item.planRepairDate)}${field("Notes",item.notes)}${field("Rejection Notes",item.rejectionNotes)}</div><h3>Part Requirement</h3>${rows?`<div class="brd-parts-wrap"><table class="brd-parts"><thead><tr><th>Pilih</th><th>Part Name</th><th>Part No</th><th>Qty</th><th>Part Status</th><th>GL Correction</th><th>Approval</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="brd-muted">Tidak ada part.</p>'}<div class="brd-gl-tools">${isGL?`<button type="button" class="brd-add-part">+ Add Part</button>`:""}</div><h3>Photos / Evidence</h3>`;
  if(isGL){
   const add=section.querySelector('.brd-add-part');
   if(add)add.addEventListener('click',()=>brdOpenPartEditor({mode:'add',itemId:item.itemId,unitCode:item.unitCode}));
   section.querySelectorAll('.brd-edit-part').forEach(btn=>btn.addEventListener('click',()=>{
     const p=(item.parts||[]).find(x=>String(x.partId)===btn.dataset.partId);
     if(p)brdOpenPartEditor({mode:'edit',itemId:item.itemId,unitCode:item.unitCode,part:p});
   }));
  }
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
 await brdLoadAudit();
 }catch(error){$("brdMessage").textContent="Gagal memuat detail: "+error.message;console.error(error)}
}
loadDetail();

// GL Approval: hanya Forward aktif pada tahap ini.
const brdForwardButton=$('brdGLForward');
if(brdForwardButton)brdForwardButton.addEventListener('click',async function(){
 const ids=Array.from(brdSelectedParts);
 if(!ids.length){alert('Pilih minimal satu part untuk diteruskan.');return;}
 if(!confirm('Teruskan '+ids.length+' part pilihan GL ke Section Head?\nPart lain tetap PENDING.'))return;
 brdForwardButton.disabled=true;brdForwardButton.textContent='Menyimpan...';
 try{
  const res=await fetch(BRD_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'approveBacklogGL',registrationId:brdId,requesterId:brdRequester,selectedPartIds:ids})});
  if(!res.ok)throw Error('HTTP '+res.status);
  const data=await res.json();if(!data.success)throw Error(data.message||'GL Approval gagal.');
  alert('GL Approval berhasil. Registrasi diteruskan ke Section Head.');
  location.reload();
 }catch(e){alert('Gagal: '+e.message);brdForwardButton.disabled=false;brdForwardButton.textContent='Approve & Forward to Section';}
});

// GL correction modal dibuat dinamis agar HTML lama tetap kompatibel.
function brdOpenPartEditor({mode,itemId,unitCode,part}){
  if(document.getElementById('brdPartModal'))return;
  const overlay=document.createElement('div');overlay.id='brdPartModal';overlay.className='brd-modal-overlay';
  overlay.innerHTML=`<form class="brd-modal-form"><h2>${mode==='add'?'Add Part':'Edit Part'} — ${esc(unitCode)}</h2>
    <label>Part Name<input name="partName" required maxlength="250" value="${esc(part?.partName||'')}"></label>
    <label>Part No<input name="partNo" required maxlength="120" value="${esc(part?.partNo||'')}"></label>
    <label>Quantity<input name="quantity" required type="number" min="1" step="1" value="${esc(part?.quantity||1)}"></label>
    <p class="brd-muted">Perubahan GL tercatat dalam Audit History.</p>
    <div class="brd-modal-actions"><button type="button" class="brd-cancel">Cancel</button><button type="submit" class="brd-save">Save</button></div>
  </form>`;
  document.body.append(overlay);
  const close=()=>overlay.remove();
  overlay.querySelector('.brd-cancel').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  overlay.querySelector('form').addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget,save=form.querySelector('.brd-save');
    const payload={action:mode==='add'?'addBacklogGLPart':'editBacklogGLPart',registrationId:brdId,requesterId:brdRequester,itemId:itemId,
      partId:part?.partId||'',partName:form.elements.partName.value.trim(),partNo:form.elements.partNo.value.trim(),quantity:Number(form.elements.quantity.value)};
    if(!payload.partName||!payload.partNo||!Number.isInteger(payload.quantity)||payload.quantity<=0){alert('Lengkapi Part Name, Part No dan Quantity yang valid.');return;}
    save.disabled=true;save.textContent='Saving...';
    try{
      const res=await fetch(BRD_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
      if(!res.ok)throw Error('HTTP '+res.status);
      const result=await res.json();if(!result.success)throw Error(result.message||'Gagal menyimpan.');
      close();await loadDetail();await brdLoadAudit();
    }catch(error){alert('Gagal: '+error.message);save.disabled=false;save.textContent='Save';}
  });
}
async function brdLoadAudit(){
  let host=document.getElementById('brdAuditHistory');
  if(!host){host=document.createElement('section');host.id='brdAuditHistory';host.className='brd-item';$('brdItems').after(host)}
  try{
    const res=await fetch(BRD_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'getBacklogGLAudit',registrationId:brdId,requesterId:brdRequester})});
    const data=await res.json();if(!data.success)throw Error(data.message||'Gagal membaca audit.');
    const entries=data.entries||[];
    host.innerHTML=`<h2>GL Audit History</h2>${entries.length?`<div class="brd-parts-wrap"><table class="brd-parts"><thead><tr><th>Action</th><th>Part ID</th><th>Field</th><th>Before</th><th>After</th><th>Changed By</th><th>Time</th></tr></thead><tbody>${entries.map(x=>`<tr><td>${esc(x.action)}</td><td>${esc(x.partId)}</td><td>${esc(x.field)}</td><td>${esc(x.oldValue)}</td><td>${esc(x.newValue)}</td><td>${esc(x.actorName)}</td><td>${esc(x.timestamp)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="brd-muted">Belum ada perubahan GL.</p>'}`;
  }catch(error){host.innerHTML=`<h2>GL Audit History</h2><p class="brd-muted">${esc(error.message)}</p>`;}
}
const brdReviewStyles=document.createElement('style');
brdReviewStyles.textContent=`
.brd-modal-overlay{position:fixed;inset:0;background:#0f172a99;z-index:10010;display:flex;align-items:center;justify-content:center;padding:16px}
.brd-modal-form{background:white;border-radius:16px;padding:24px;width:min(440px,100%);box-shadow:0 20px 60px #0003}
.brd-modal-form h2{margin:0 0 18px;font-size:18px;color:#1d4ed8}
.brd-modal-form label{display:block;font-size:13px;font-weight:700;margin:12px 0}
.brd-modal-form input{display:block;width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:9px;margin-top:5px;font:inherit}
.brd-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}
.brd-modal-actions button,.brd-add-part,.brd-edit-part{padding:9px 13px;border-radius:9px;border:1px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-weight:700;cursor:pointer}
.brd-modal-actions .brd-save{background:#2563eb;color:white}
.brd-gl-tools{margin:12px 0 20px}
.brd-edit-part{font-size:12px;padding:6px 10px}
.brd-status{background:#e2e8f0;color:#475569}
.brd-status[data-status="WAITING_GL_APPROVAL"]{background:#dbeafe;color:#1d4ed8}
.brd-status[data-status="WAITING_SECTION_APPROVAL"]{background:#ede9fe;color:#6d28d9}
.brd-status[data-status="FULL_APPROVED"]{background:#dcfce7;color:#15803d}
.brd-status[data-status="REVISION_REQUIRED"]{background:#ffedd5;color:#c2410c}
.brd-status[data-status="REJECTED"]{background:#fee2e2;color:#b91c1c}
.brd-summary[data-stage="WAITING_GL_APPROVAL"]{border-left:5px solid #2563eb}
.brd-summary[data-stage="WAITING_SECTION_APPROVAL"]{border-left:5px solid #7c3aed}
.brd-summary[data-stage="FULL_APPROVED"]{border-left:5px solid #16a34a}
.brd-summary[data-stage="REVISION_REQUIRED"]{border-left:5px solid #ea580c}
.brd-approval-panel[data-stage="WAITING_GL_APPROVAL"]{border-top:4px solid #2563eb}
.brd-approval-panel[data-stage="WAITING_SECTION_APPROVAL"]{border-top:4px solid #7c3aed}
`;
document.head.append(brdReviewStyles);
