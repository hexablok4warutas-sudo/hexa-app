/* HEXA — return Selected Parts to Backlog Registration (V1) */
(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('hexaReturn')!=='registration')return;
const token=params.get('hexaToken');if(!token||!/^[a-f0-9]{48}$/.test(token)||window.parent===window)return;
const origin=location.origin;
const KEY='hexa_cat395_selected_parts_v1';
function init(){
 const summary=document.getElementById('selectionSummary');if(!summary)return;
 const exportButton=document.getElementById('exportSelection');
 const button=document.createElement('button');button.type='button';button.id='hexaUseSelectedParts';
 button.textContent='Use Selected Parts → Registration';
 button.style.cssText='padding:12px 18px;border:0;border-radius:10px;background:#e77718;color:#fff;font-weight:700;cursor:pointer;margin-left:10px';
 (exportButton?.parentElement||summary.parentElement).appendChild(button);
 button.addEventListener('click',()=>{
  let entries;try{entries=JSON.parse(localStorage.getItem(KEY)||'[]');}catch{entries=[];}
  if(!Array.isArray(entries))entries=[];
  const parts=entries.map(e=>e?.[1]).filter(x=>x&&x.pn).map(x=>({pn:String(x.pn),description:String(x.description||''),needed:Math.max(1,parseInt(x.needed,10)||1),group:String(x.group||''),catalogId:'cat395'}));
  if(!parts.length){alert('Selected Parts masih kosong. Tambahkan part terlebih dahulu.');return;}
  if(parts.length>200){alert('Maksimal 200 part per pengiriman.');return;}
  // Qty may have been edited but not blurred; sync visible inputs before sending.
  const inputs=summary.querySelectorAll('.cat-selected-qty');
  parts.forEach((p,i)=>{if(inputs[i])p.needed=Math.max(1,parseInt(inputs[i].value,10)||1);});
  button.disabled=true;button.textContent='Mengirim ke Registration...';
  window.parent.postMessage({type:'HEXA_CATALOG_SELECTED_PARTS_V1',token,parts},origin);
  setTimeout(()=>{if(button.isConnected&&button.disabled){button.disabled=false;button.textContent='Use Selected Parts → Registration';}},5000);
 });
 window.addEventListener('message',event=>{
  if(event.origin!==origin||event.source!==window.parent||event.data?.type!=='HEXA_CATALOG_IMPORT_ACK_V1'||event.data.token!==token)return;
  button.textContent='Parts sent ✓';
  // Parent closes overlay after acknowledgement.
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
