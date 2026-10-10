"use strict";
// HEXA - GREASING ANTI LINEBORING
// Versi awal: database lokal IndexedDB (BELUM terhubung ke Google Apps Script).
if(sessionStorage.getItem('hexaLoggedIn')!=='true'||!sessionStorage.getItem('hexaUser')){
  window.location.replace('index.html');
}
const galUser=(()=>{try{return JSON.parse(sessionStorage.getItem('hexaUser')||'{}')}catch{return {}}})();
const galById=id=>document.getElementById(id);
const galEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const galFormatDate=value=>new Date(value).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'});
const galUserName=()=>String(galUser.nama||galUser.NAMA||galUser.name||galUser.userId||galUser.USER_ID||'User HEXA');
let galDb=null,galRecords=[],galSelectedId=null,galPhotoUrls=[];
function galOpenDb(){return new Promise((resolve,reject)=>{
  const request=indexedDB.open('HEXA_Greasing_AntiLineboring',1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('problems'))db.createObjectStore('problems',{keyPath:'id'})};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
})}
function galStore(mode,callback){return new Promise((resolve,reject)=>{
  const tx=galDb.transaction('problems',mode);const store=tx.objectStore('problems');
  let value;try{value=callback(store)}catch(e){reject(e);return}
  tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
})}
async function galReadAll(){return new Promise((resolve,reject)=>{
  const tx=galDb.transaction('problems','readonly');const request=tx.objectStore('problems').getAll();
  request.onsuccess=()=>resolve(request.result||[]);request.onerror=()=>reject(request.error);
})}
function galObjectUrl(blob){if(!(blob instanceof Blob))return '';const url=URL.createObjectURL(blob);galPhotoUrls.push(url);return url}
function galPhoto(blob,alt){const url=galObjectUrl(blob);return url?`<a href="${url}" target="_blank" rel="noopener"><img class="gal-photo" src="${url}" alt="${galEscape(alt)}"></a>`:''}
function galCard(r){const closed=r.status==='CLOSE';const histories=r.followUps||[];
  return `<article class="gal-card"><div class="gal-card-top"><div><h3>${galEscape(r.unit)}</h3><div class="gal-date">${galFormatDate(r.createdAt)} · ${galEscape(r.createdBy)}</div></div><span class="gal-badge ${closed?'close':'open'}">${galEscape(r.status)}</span></div>
    <div class="gal-field"><small>Problem Autolube</small><p><strong>${galEscape(r.problem)}</strong></p></div>
    <div class="gal-field"><small>Foto Kerusakan</small>${galPhoto(r.damagePhoto,'Foto kerusakan '+r.unit)}</div>
    <div class="gal-card-cols"><div class="gal-field"><small>Required Part</small><p>${galEscape(r.part||'Tidak diperlukan / belum ditentukan')}</p></div><div class="gal-field"><small>Recommended Follow Up</small><p>${galEscape(r.recommendation)}</p></div></div>
    ${histories.length?`<details class="gal-history" ${closed?'open':''}><summary>Riwayat Follow Up (${histories.length})</summary>${histories.map(h=>`<div class="gal-history-item"><small>${galFormatDate(h.date)} · ${galEscape(h.by)}</small><p>${galEscape(h.action)}</p><div class="gal-result ${galEscape(h.result.toLowerCase())}">${galEscape(h.result)}</div>${galPhoto(h.evidence,'Evidence follow up')}</div>`).join('')}</details>`:''}
    ${!closed?`<div class="gal-card-footer"><button type="button" class="gal-primary" data-follow="${galEscape(r.id)}">Input Follow Up</button></div>`:''}</article>`}
function galRender(){galPhotoUrls.forEach(url=>URL.revokeObjectURL(url));galPhotoUrls=[];
  galById('galTotal').textContent=galRecords.length;galById('galOpen').textContent=galRecords.filter(r=>r.status==='OPEN').length;galById('galClose').textContent=galRecords.filter(r=>r.status==='CLOSE').length;
  const q=galById('galSearch').value.toLowerCase().trim(),status=galById('galStatus').value;
  const shown=galRecords.filter(r=>(status==='ALL'||r.status===status)&&(!q||[r.unit,r.problem,r.part,r.recommendation].some(v=>String(v||'').toLowerCase().includes(q))));
  galById('galCards').innerHTML=shown.length?shown.map(galCard).join(''):'<div class="gal-empty">Belum ada problem sesuai filter.</div>';
}
async function galRefresh(){galRecords=(await galReadAll()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));galRender()}
function galSetBusy(button,busy){button.disabled=busy;button.dataset.originalText??=button.textContent;button.textContent=busy?'Menyimpan...':button.dataset.originalText}
function galShowError(id,error){galById(id).textContent=error?.message||'Terjadi kesalahan penyimpanan.'}
function galCloseDialog(id){galById(id).close()}
function galGenerateId(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`}
async function galInit(){
  try{galDb=await galOpenDb();await galRefresh()}catch(e){galById('galNotice').textContent='Penyimpanan lokal tidak tersedia: '+e.message;galById('galNew').disabled=true;return}
  galById('galBack').onclick=()=>{window.location.href='/daily-maintenance'};
  galById('galNew').onclick=()=>{galById('galNewForm').reset();galById('galNewMessage').textContent='';galById('galNewDialog').showModal()};
  document.querySelectorAll('[data-dismiss]').forEach(btn=>btn.addEventListener('click',()=>galCloseDialog(btn.dataset.dismiss)));
  galById('galSearch').addEventListener('input',galRender);galById('galStatus').addEventListener('change',galRender);
  galById('galCards').addEventListener('click',e=>{const button=e.target.closest('[data-follow]');if(!button)return;const r=galRecords.find(x=>x.id===button.dataset.follow);if(!r||r.status!=='OPEN')return;galSelectedId=r.id;galById('galFollowForm').reset();galById('galFollowMessage').textContent='';galById('galFollowUnit').textContent=`${r.unit} — ${r.problem}`;galById('galFollowDialog').showModal()});
  galById('galNewForm').addEventListener('submit',async e=>{e.preventDefault();const btn=galById('galSaveNew');galSetBusy(btn,true);
    try{const file=galById('galDamage').files[0];if(!file||!file.type.startsWith('image/'))throw Error('Pilih foto kerusakan yang valid.');
      const record={id:galGenerateId(),unit:galById('galUnit').value.trim().toUpperCase(),problem:galById('galProblem').value.trim(),damagePhoto:file,part:galById('galPart').value.trim(),recommendation:galById('galRecommendation').value.trim(),status:'OPEN',createdAt:new Date().toISOString(),createdBy:galUserName(),followUps:[]};
      if(!record.unit||!record.problem||!record.recommendation)throw Error('Lengkapi field wajib.');
      await galStore('readwrite',store=>store.put(record));galCloseDialog('galNewDialog');await galRefresh();
    }catch(err){galShowError('galNewMessage',err)}finally{galSetBusy(btn,false)}
  });
  galById('galFollowForm').addEventListener('submit',async e=>{e.preventDefault();const btn=galById('galSaveFollow');galSetBusy(btn,true);
    try{const file=galById('galEvidence').files[0],result=galById('galResult').value,action=galById('galAction').value.trim();
      if(!action||!['NORMAL','PARTIAL','ABNORMAL'].includes(result)||!file||!file.type.startsWith('image/'))throw Error('Isi action, result, dan evidence foto.');
      const record=galRecords.find(r=>r.id===galSelectedId);if(!record||record.status!=='OPEN')throw Error('Problem sudah ditutup atau tidak ditemukan.');
      const updated={...record,followUps:[...(record.followUps||[]),{id:galGenerateId(),action,result,evidence:file,date:new Date().toISOString(),by:galUserName()}],status:result==='NORMAL'?'CLOSE':'OPEN'};
      if(updated.status==='CLOSE'){updated.closedAt=new Date().toISOString();updated.closedBy=galUserName()}
      await galStore('readwrite',store=>store.put(updated));galCloseDialog('galFollowDialog');await galRefresh();
    }catch(err){galShowError('galFollowMessage',err)}finally{galSetBusy(btn,false)}
  });
}
galInit();
