/* HEXCatalog CAT 395 — read-only reference and local selection.
   Master will later upload SVGs and map clickable callouts.
   File cat395-hose-data.json must be placed beside this JS. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
let groups=[],active=null,imageIndex=0;
let activePartIndex=null;
let lastPointer={x:0,y:0};
const selected=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=(g,p)=>`${g.id}|${p.no}|${p.pn}`;
const qty=(v)=>Math.max(1,Math.min(9999,Number.parseInt(v,10)||1));
// Indeks turunan (contoh 11.1, 11.2) adalah subpart dari indeks assembly 11.
const parentNo=p=>String(p.no??'').split('.')[0];
const isChild=p=>String(p.no??'').includes('.');
const partTitlePN=node=>{
 const title=node?.querySelector(':scope > title')?.textContent||'';
 return (title.match(/\[([^\]]+)\]/)?.[1]||'').trim().toUpperCase();
};
const normalizePN=pn=>String(pn??'').trim().toUpperCase();
// Nomor SVG dapat menunjuk assembly induk, sedangkan PN metadata dapat menunjuk subpart.
function matchIndexes(numbers, pn=''){
 if(!active)return [];
 const nums=new Set(numbers.map(String));
 const candidates=active.parts.map((part,i)=>({part,i})).filter(({part})=>nums.has(parentNo(part)));
 if(pn){
  const exact=candidates.filter(({part})=>normalizePN(part.pn)===normalizePN(pn));
  if(exact.length)return exact.map(x=>x.i);
 }
 return candidates.map(x=>x.i);
}
function showGroups(filter=''){
 const list=groups.filter(g=>g.name.toLowerCase().includes(filter.toLowerCase()));
 $('groupList').innerHTML=list.map(g=>`<button type="button" class="cat-group-btn ${active?.id===g.id?'active':''}" data-group="${esc(g.id)}"><span>${esc(g.name)}</span><small>${g.parts.length}</small></button>`).join('')||'<p>Tidak ada group.</p>';
}
function openGroup(id){active=groups.find(g=>g.id===id);imageIndex=0;showGroups($('groupSearch').value);render();}
function render(){if(!active)return;$('groupTitle').textContent=active.name;$('groupCount').textContent=`${active.parts.length} part`;
 $('partsBody').innerHTML=active.parts.map((p,i)=>`<tr data-index="${i}"><td>${esc(p.no)}</td><td><strong>${esc(p.pn)}</strong></td><td>${esc(p.description)}</td><td>${p.qty??'—'}</td><td><input class="cat-qty" aria-label="Quantity needed ${esc(p.pn)}" type="number" min="1" max="9999" value="${selected.get(key(active,p))?.needed??1}"></td><td><button type="button" class="cat-add">${selected.has(key(active,p))?'Update':'Add'}</button></td></tr>`).join('');renderImage();}
// SVG viewer: fit, zoom, pan and fullscreen. Existing Parts List is unchanged.
let zoom=1, offsetX=0, offsetY=0, dragging=false, startX=0, startY=0;
let viewer, viewerImage, zoomLabel, fullscreen=false;
let imageRequest=0;
const hasDrawing=()=>!!viewerImage?.dataset.loaded;
function initViewer(){
 const area=$('drawingArea');
 area.classList.add('cat-viewer');
 area.innerHTML='<div class="cat-viewer-stage"></div>';
 viewer=area.querySelector('.cat-viewer-stage');
 const picker=document.createElement('div');picker.id='catPartPicker';picker.className='cat-part-picker';picker.hidden=true;area.append(picker);
 const toolbar=area.closest('.cat-images').querySelector('.cat-image-toolbar');
 const controls=document.createElement('div');controls.className='cat-zoom-controls';
 controls.innerHTML='<button type="button" data-zoom="out" title="Zoom out">−</button><span class="cat-zoom-label">100%</span><button type="button" data-zoom="in" title="Zoom in">+</button><button type="button" data-zoom="fit" title="Fit gambar">Fit</button><button type="button" data-zoom="fullscreen" title="Fullscreen">⛶</button>';
 toolbar.append(controls);zoomLabel=controls.querySelector('.cat-zoom-label');
 controls.addEventListener('click',e=>{const btn=e.target.closest('[data-zoom]');if(!btn)return;const action=btn.dataset.zoom;
 if(action==='in')setZoom(zoom*1.3);if(action==='out')setZoom(zoom/1.3);if(action==='fit')resetView();if(action==='fullscreen')toggleFullscreen();});
 area.addEventListener('wheel',e=>{if(!hasDrawing())return;e.preventDefault();setZoom(zoom*(e.deltaY<0?1.15:1/1.15));},{passive:false});
 // Unified touch/mouse gestures: single-finger pan, two-finger pinch around midpoint.
 const pointers=new Map();let gesture=null, tap=null, multiTouch=false;
 const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 area.addEventListener('pointerdown',e=>{
  if(e.target.closest('.cat-part-picker')||!hasDrawing()||e.button!==0)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  area.setPointerCapture(e.pointerId);
  if(pointers.size===1){tap={x:e.clientX,y:e.clientY,hit:e.target};multiTouch=false;gesture={type:'pan',x:e.clientX-offsetX,y:e.clientY-offsetY};}
  else if(pointers.size===2){multiTouch=true;tap=null;hidePicker();const [a,b]=[...pointers.values()];const m=midpoint(a,b);gesture={type:'pinch',dist:distance(a,b),zoom,offsetX,offsetY,m};}
  area.classList.add('is-dragging');
 });
 area.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size>=2){
   const [a,b]=[...pointers.values()],m=midpoint(a,b);
   if(!gesture||gesture.type!=='pinch')return;
   const next=Math.max(.5,Math.min(10,gesture.zoom*distance(a,b)/Math.max(1,gesture.dist)));
   const rect=area.getBoundingClientRect(),cx=gesture.m.x-(rect.left+rect.width/2),cy=gesture.m.y-(rect.top+rect.height/2);
   const newCx=m.x-(rect.left+rect.width/2),newCy=m.y-(rect.top+rect.height/2);
   offsetX=newCx-(cx-gesture.offsetX)*(next/gesture.zoom);
   offsetY=newCy-(cy-gesture.offsetY)*(next/gesture.zoom);
   zoom=next;updateView();
  }else if(gesture?.type==='pan'){
   offsetX=e.clientX-gesture.x;offsetY=e.clientY-gesture.y;updateView();
  }
 });
 area.addEventListener('pointerup',e=>{
  if(!pointers.has(e.pointerId))return;
  const isTap=!multiTouch&&tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<9;
   lastPointer={x:e.clientX,y:e.clientY};
  pointers.delete(e.pointerId);
  if(pointers.size===1){const point=[...pointers.values()][0];gesture={type:'pan',x:point.x-offsetX,y:point.y-offsetY};tap=null;}
  else if(!pointers.size){gesture=null;area.classList.remove('is-dragging');}
  if(!isTap||!hasDrawing())return;
   // Callout induk membuka pilihan termasuk subpart; klik gambar part memakai PN metadata jika cocok.
   const hit=tap.hit;
   const callout=hit?.closest?.('g.callout');
   const partNode=hit?.closest?.('g.part');
   if(callout && viewer.contains(callout)){
     const nums=partNumbers(callout);
     if(nums.length){pickByNumbers(nums);return;}
   }
   if(partNode && viewer.contains(partNode)){
     const title=partNode.querySelector(':scope > title')?.textContent||'';
     const pn=title.match(/\[([^\]]+)\]/)?.[1];
     const nums=partNumbers(partNode);
     const indexes=matchIndexes(nums,pn);
     if(indexes.length===1){pickPart(indexes[0]);return;}
     if(indexes.length>1){showPartPicker(e.clientX,e.clientY,indexes);return;}
     if(nums.length){pickByNumbers(nums);return;}
   }
   showPartPicker(e.clientX,e.clientY);
 });
 area.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);tap=null;if(!pointers.size){gesture=null;area.classList.remove('is-dragging');}});
 area.addEventListener('click',e=>{const btn=e.target.closest('[data-pick-index]');if(!btn)return;pickPart(Number(btn.dataset.pickIndex));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fullscreen)toggleFullscreen();});
}
function updateView(){if(!viewerImage)return;viewerImage.style.transform=`translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;zoomLabel.textContent=`${Math.round(zoom*100)}%`;}
function setZoom(n){zoom=Math.max(.5,Math.min(10,n));updateView();}
function resetView(){zoom=1;offsetX=offsetY=0;updateView();}
function toggleFullscreen(){fullscreen=!fullscreen;document.querySelector('.cat-images').classList.toggle('cat-fullscreen',fullscreen);document.body.classList.toggle('cat-viewer-open',fullscreen);resetView();}
function hidePicker(){const p=$('catPartPicker');if(p)p.hidden=true;}
 // Class CAT SIS: part_14, 1 / callout_14, 1. Indeks turunan dipetakan lewat parentNo().
 function partNumbers(node){
   const c=node?.getAttribute('class')||'';
   const m=c.match(/(?:part|callout)_(\d+(?:\s*,\s*\d+)*)/);
   return m?m[1].split(',').map(x=>x.trim()):[];
 }
 function pickByNumbers(nums){
   const numbers=[...new Set(nums.map(String))];
   const indexes=matchIndexes(numbers);
   if(indexes.length===1){pickPart(indexes[0]);return;}
   if(indexes.length>1){showPartPicker(lastPointer.x,lastPointer.y,indexes);return;}
   showPartNotice(`No ${numbers.join(', ')} belum terdaftar dalam Parts List grup ini.`);
 }
 function showPartNotice(message){
   const picker=$('catPartPicker');if(!picker)return;
   picker.innerHTML='<div class="cat-picker-head"><strong>Informasi part</strong><button type="button" data-close-picker aria-label="Tutup">×</button></div><p class="cat-picker-notice"></p>';
   picker.querySelector('.cat-picker-notice').textContent=message;
   picker.hidden=false;picker.style.left='12px';picker.style.top='12px';
   picker.querySelector('[data-close-picker]').onclick=hidePicker;
 }
 function highlightDrawing(index){
   if(!viewerImage||!active?.parts[index])return;
   const p=active.parts[index],no=parentNo(p),pn=normalizePN(p.pn);
   viewerImage.querySelectorAll('g.part, g.callout').forEach(node=>{
     const numbers=partNumbers(node);
     const isCallout=node.classList.contains('callout');
     const title=node.querySelector(':scope > title')?.textContent||'';
     const match=isCallout?numbers.includes(no):(numbers.includes(no) && normalizePN(partTitlePN(node))===pn);
     node.classList.toggle('cat-svg-selected',match);
   });
 }
 function pickPart(index){
   if(!active?.parts[index])return;
   activePartIndex=index;hidePicker();
   const rows=[...$('partsBody').querySelectorAll('tr')];
   rows.forEach((row,i)=>row.classList.toggle('cat-part-highlight',i===index));
   highlightDrawing(index);
   const row=rows[index];row?.scrollIntoView({behavior:'smooth',block:'nearest'});
   row?.querySelector('.cat-qty')?.focus({preventScroll:true});
 }

function showPartPicker(clientX,clientY,onlyIndexes=null){
 if(!active?.parts?.length)return;
 const area=$('drawingArea'), picker=$('catPartPicker'), r=area.getBoundingClientRect();
 picker.innerHTML='<div class="cat-picker-head"><strong>Pilih nomor part</strong><button type="button" data-close-picker aria-label="Tutup">×</button></div><div class="cat-picker-list">'+active.parts.map((part,i)=>({part,i})).filter(({i})=>!onlyIndexes||onlyIndexes.includes(i)).map(({part,i})=>`<button type="button" data-pick-index="${i}"><b>No ${esc(part.no)}${isChild(part)?' (subpart dari No '+esc(parentNo(part))+')':''}</b><span>${esc(part.pn)} — ${esc(part.description)}</span></button>`).join('')+'</div><small>Pilih part sesuai nomor pada gambar.</small>';
 picker.hidden=false;
 picker.style.left=Math.max(8,Math.min(clientX-r.left,r.width-295))+'px';
 picker.style.top=Math.max(8,Math.min(clientY-r.top,r.height-260))+'px';
 picker.querySelector('[data-close-picker]').onclick=hidePicker;
}
async function renderImage(){
 hidePicker();activePartIndex=null;
 document.querySelectorAll('#partsBody tr').forEach(r=>r.classList.remove('cat-part-highlight'));
 const imgs=active?.images||[], area=$('drawingArea'), request=++imageRequest;
 $('imagePosition').textContent=imgs.length?`${imageIndex+1} / ${imgs.length}`:'0 / 0';
 $('prevImage').disabled=imageIndex===0;
 $('nextImage').disabled=imageIndex>=imgs.length-1;
 if(!viewer)initViewer();
 viewer.replaceChildren();viewerImage=null;resetView();
 if(!imgs.length){viewer.dataset.message='Gambar SVG assembly belum diupload. Parts List tetap dapat digunakan.';return;}
 viewer.dataset.message='Memuat gambar assembly...';
 try{
   const url=imgs[imageIndex];
   const response=await fetch(url);
   if(!response.ok)throw Error('HTTP '+response.status);
   const source=await response.text();
   const doc=new DOMParser().parseFromString(source,'image/svg+xml');
   if(doc.querySelector('parsererror'))throw Error('SVG tidak valid');
   const root=doc.documentElement;
   if(root.localName!=='svg')throw Error('File bukan SVG');
   // SVG CAT SIS dimuat sebagai elemen inline agar grup part bisa diklik.
   // Hapus konten aktif dan tautan eksternal sebelum dimasukkan ke halaman.
   root.querySelectorAll('script,foreignObject,iframe,object,embed,animate,set,animateMotion,animateTransform').forEach(n=>n.remove());
   root.querySelectorAll('*').forEach(el=>{
     for(const attr of [...el.attributes]){
       const name=attr.name.toLowerCase(),value=attr.value.trim();
       if(name.startsWith('on') || ((name==='href'||name.endsWith(':href')) && !value.startsWith('#')) ||
          /url\s*\(\s*['"]?\s*(?:https?:|data:|javascript:)/i.test(value) ||
          (name==='style' && /@import|expression\s*\(/i.test(value))) el.removeAttribute(attr.name);
     }
   });
   if(request!==imageRequest)return;
   const svg=document.importNode(root,true);
   svg.classList.add('cat-viewer-image','cat-inline-svg');
   svg.dataset.loaded='true';
   svg.setAttribute('role','img');
   svg.setAttribute('aria-label',`${active.name} assembly drawing`);
   viewer.replaceChildren(svg);
   viewerImage=svg;
   viewer.dataset.message='';
   resetView();
 }catch(err){
   if(request!==imageRequest)return;
   viewer.dataset.message='Gambar gagal dimuat: '+err.message;
   console.error('HEXCatalog SVG:',err);
 }
}
function renderSelected(){
 const items=[...selected.entries()];
 $('selectionCount').textContent=items.length;
 const summary=$('selectionSummary');
 if(!items.length){summary.innerHTML='<span class="cat-selection-empty">Belum ada part dipilih. Pilih part dari Parts List, lalu tekan Add.</span>';return;}
 summary.innerHTML='<div class="cat-selected-table-wrap"><table class="cat-selected-table"><thead><tr><th>Assembly Group</th><th>No</th><th>Part Number</th><th>Description</th><th>Qty Needed</th><th>Aksi</th></tr></thead><tbody>'+items.map(([k,x],i)=>`<tr data-selected-index="${i}"><td data-label="Assembly Group">${esc(x.group)}</td><td data-label="No">${esc(x.no)}</td><td data-label="Part Number"><strong>${esc(x.pn)}</strong></td><td data-label="Description">${esc(x.description)}</td><td data-label="Qty Needed"><input class="cat-selected-qty" type="number" min="1" max="9999" value="${qty(x.needed)}" aria-label="Qty Needed ${esc(x.pn)}"></td><td class="cat-selected-remove-cell"><button class="cat-selected-remove" type="button" aria-label="Hapus ${esc(x.pn)}">Remove</button></td></tr>`).join('')+'</tbody></table></div>';
}
function syncPartAddButton(x){
 if(!active)return;
 $('partsBody').querySelectorAll('tr').forEach(tr=>{
  const p=active.parts[Number(tr.dataset.index)];
  if(!p)return;
  const b=tr.querySelector('.cat-add');
  if(b)b.textContent=selected.has(key(active,p))?'Update':'Add';
  if(x&&p.no==x.no&&p.pn===x.pn&&active.name===x.group){const input=tr.querySelector('.cat-qty');if(input)input.value=x.needed;}
 });
}
$('selectionSummary').addEventListener('change',e=>{
 const input=e.target.closest('.cat-selected-qty');if(!input)return;
 const row=input.closest('[data-selected-index]'),entry=[...selected.entries()][Number(row?.dataset.selectedIndex)];
 if(!entry)return;
 const [k,x]=entry;x.needed=qty(input.value);input.value=x.needed;selected.set(k,x);saveSelection();syncPartAddButton(x);
});
$('selectionSummary').addEventListener('click',e=>{
 const button=e.target.closest('.cat-selected-remove');if(!button)return;
 const row=button.closest('[data-selected-index]'),entry=[...selected.entries()][Number(row?.dataset.selectedIndex)];
 if(!entry)return;
 selected.delete(entry[0]);saveSelection();renderSelected();syncPartAddButton();
});
$('groupList').addEventListener('click',e=>{const btn=e.target.closest('[data-group]');if(btn)openGroup(btn.dataset.group)});
$('groupSearch').addEventListener('input',e=>showGroups(e.target.value));
$('partsBody').addEventListener('click',e=>{const btn=e.target.closest('.cat-add');if(!btn||!active)return;const tr=btn.closest('tr');const p=active.parts[Number(tr.dataset.index)];pickPart(Number(tr.dataset.index));selected.set(key(active,p),{group:active.name,no:p.no,pn:p.pn,description:p.description,needed:qty(tr.querySelector('input').value)});btn.textContent='Update';saveSelection();renderSelected();});
$('prevImage').addEventListener('click',()=>{if(imageIndex>0){imageIndex--;renderImage()}});
$('nextImage').addEventListener('click',()=>{if(imageIndex<(active?.images.length||0)-1){imageIndex++;renderImage()}});
$('clearSelection').addEventListener('click',()=>{if(!selected.size)return;if(!confirm('Hapus semua Selected Parts?'))return;selected.clear();saveSelection();renderSelected();render()});
$('exportSelection').addEventListener('click',async()=>{if(!selected.size){alert('Pilih part terlebih dahulu.');return}const data=[...selected.values()];const text=['Group\tNo\tPart Number\tDescription\tQty Needed',...data.map(p=>[p.group,p.no,p.pn,p.description,p.needed].join('\t'))].join('\n');try{await navigator.clipboard.writeText(text);alert('Daftar part berhasil disalin.')}catch{prompt('Salin daftar part berikut:',text)}});
restoreSelection();renderSelected();
fetch('cat395-hose-data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{groups=data.groups||[];showGroups();if(groups.length)openGroup(groups[0].id)}).catch(e=>{$('groupList').textContent='Gagal memuat data katalog. Periksa cat395-hose-data.json';console.error(e)});
})();
