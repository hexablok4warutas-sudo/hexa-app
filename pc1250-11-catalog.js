/* HEXCatalog PC1250-11R — read-only reference and local selection.
   Master will later upload SVGs and map clickable callouts.
   File pc1250-11-data.json must be placed beside this JS. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
let groups=[],active=null,imageIndex=0;
let activePartIndex=null;
let lastPointer={x:0,y:0};
const selected=new Map();
const STORAGE_KEY='hexa_pc1250_11_selected_parts_v1';
function saveSelection(){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...selected.entries()]));}
 catch(err){console.warn('HEXA Selected Parts: penyimpanan lokal tidak tersedia',err);}
}
function restoreSelection(){
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  if(!Array.isArray(saved))return;
  for(const entry of saved){
   if(!Array.isArray(entry)||entry.length!==2||!entry[1]||typeof entry[1]!=='object')continue;
   const [k,x]=entry;
   if(!x.group||!x.pn||x.no==null)continue;
   selected.set(String(k),{group:String(x.group),no:String(x.no),pn:String(x.pn),description:String(x.description||''),needed:qty(x.needed)});
  }
 }catch(err){console.warn('HEXA Selected Parts: gagal memulihkan data lokal',err);}
}

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
// Global Search memakai input groupSearch yang sudah ada (tanpa HTML baru).
function showGroups(filter=''){
 const q=String(filter).trim().toLowerCase();
 const list=$('groupList');
 if(!q){
  list.innerHTML=groups.map(g=>`<button type="button" class="cat-group-btn ${active?.id===g.id?'active':''}" data-group="${esc(g.id)}"><span>${esc(g.name)}</span><small>${g.parts.length}</small></button>`).join('')||'<p>Tidak ada group.</p>';
  return;
 }
 const matchingGroups=groups.filter(g=>g.name.toLowerCase().includes(q));
 const matches=[];
 for(const g of groups){for(let i=0;i<g.parts.length;i++){
  const part=g.parts[i];
  if([part.pn,part.description,part.no].some(v=>String(v??'').toLowerCase().includes(q)))matches.push({g,part,i});
 }}
 const groupHTML=matchingGroups.map(g=>`<button type="button" class="cat-group-btn ${active?.id===g.id?'active':''}" data-group="${esc(g.id)}"><span>${esc(g.name)}</span><small>${g.parts.length}</small></button>`).join('');
 const partHTML=matches.slice(0,80).map(({g,part,i})=>`<button type="button" class="cat-group-btn cat-search-result" data-locate-group="${esc(g.id)}" data-locate-index="${i}" title="Locate ${esc(part.pn)}"><span><strong>${esc(part.pn)}</strong><span class="cat-search-desc">${esc(part.description)} · No ${esc(part.no)}</span><span class="cat-search-group">${esc(g.name)}</span></span><small>↗</small></button>`).join('');
 list.innerHTML=(matchingGroups.length?'<div class="cat-search-section">Assembly Groups (${matchingGroups.length})</div>'+groupHTML:'')+
  '<div class="cat-search-section">Parts ('+matches.length+')</div>'+partHTML+
  (matches.length>80?'<p class="cat-search-hint">Menampilkan 80 hasil pertama. Ketik lebih spesifik.</p>':'')+
  (!matchingGroups.length&&!matches.length?'<p class="cat-search-hint">Tidak ada grup atau part yang cocok.</p>':'');
}
let locateRequest=0;
// Cari gambar yang benar berdasarkan nomor callout atau PN dalam metadata SVG.
// Jika tidak ditemukan, tetap sorot Parts List tanpa mengklaim posisi gambar.
const svgCalloutCache=new Map();
async function findImageForPart(group,part){
 const no=parentNo(part);
 for(let i=0;i<(group.images||[]).length;i++){
  const url=group.images[i];
  try{
   let nodes=svgCalloutCache.get(url);
   if(!nodes){
    const r=await fetch(url);if(!r.ok)continue;
    const doc=new DOMParser().parseFromString(await r.text(),'image/svg+xml');
    nodes=[...doc.querySelectorAll('g.callout,g.part')].map(n=>({nums:partNumbers(n),callout:n.classList.contains('callout'),pn:normalizePN(partTitlePN(n))}));
    svgCalloutCache.set(url,nodes);
   }
   if(nodes.some(n=>n.nums.includes(no)&&(n.callout||n.pn===normalizePN(part.pn))))return i;
  }catch(e){console.warn('HEXCatalog SVG:',url,e);}
 }
 return -1;
}
async function selectPartAndLocate(index,{focus=true}={}){
 if(!active?.parts[index])return;
 const request=++locateRequest,group=active,part=group.parts[index];
 pickPart(index);
 const target=await findImageForPart(group,part);
 if(request!==locateRequest||active!==group)return;
 if(target>=0&&target!==imageIndex){
  imageIndex=target;
  await renderImage({preserveSelection:true});
  if(request!==locateRequest||active!==group)return;
 }
 pickPart(index);
 if(focus&&target>=0)requestAnimationFrame(()=>focusPartInDrawing(index));
}
async function locatePart(groupId,index){
 const g=groups.find(x=>x.id===groupId),part=g?.parts?.[index];
 if(!g||!part)return;
 if(active!==g){
  ++locateRequest;active=g;imageIndex=0;
  showGroups($('groupSearch').value);
  $('groupTitle').textContent=g.name;
  $('groupCount').textContent=`${g.parts.length} part`;
  $('partsBody').innerHTML=partsRowsHTML(g);
  await renderImage();
 }
 if(active===g)await selectPartAndLocate(index);
}

 function partsRowsHTML(group){
  return group.parts.map((p,i)=>{
   const chosen=selected.has(key(group,p));
   return `<tr data-index="${i}" tabindex="0" aria-label="Pilih part nomor ${esc(p.no)}, ${esc(p.pn)}" class="${chosen?'cat-part-in-cart':''}"><td>${esc(p.no)}</td><td><strong>${esc(p.pn)}</strong></td><td>${esc(p.description)}</td><td>${esc(p.qty??'—')}</td><td><button type="button" class="cat-add ${chosen?'is-selected':''}" title="${chosen?'Sudah dipilih':'Tambahkan ke Selected Parts'}" aria-label="${chosen?'Sudah dipilih':'Tambahkan'} ${esc(p.pn)} ke Selected Parts" aria-pressed="${chosen}"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg></button></td></tr>`;
  }).join('');
 }
window.HEXA_PC1250_OPEN_GROUP = id => openGroup(id);
function openGroup(id){++locateRequest;active=groups.find(g=>g.id===id);imageIndex=0;showGroups($('groupSearch').value);render();}
function render(){if(!active)return;$('groupTitle').textContent=active.name;$('groupCount').textContent=`${active.parts.length} part`;
 $('partsBody').innerHTML=partsRowsHTML(active);renderImage();}
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
  if(pointers.size===1){tap={x:e.clientX,y:e.clientY,hit:document.elementFromPoint(e.clientX,e.clientY)||e.target};multiTouch=false;gesture={type:'pan',x:e.clientX-offsetX,y:e.clientY-offsetY};}
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
   const hit=tap.hit||document.elementFromPoint(e.clientX,e.clientY);
   const svgHit=hit?.closest?.('g.callout, g.part') ? hit : tap.hit;
   const callout=svgHit?.closest?.('g.callout');
   const partNode=svgHit?.closest?.('g.part');
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
// V2: Fokus hanya setelah memilih hasil Global Search.
// Prioritaskan bentuk part dengan Part Number tepat, lalu callout bernomor sesuai.
function focusPartInDrawing(index){
 if(!viewerImage||!active?.parts[index])return false;
 const part=active.parts[index],no=parentNo(part),pn=normalizePN(part.pn);
 const nodes=[...viewerImage.querySelectorAll('g.part, g.callout')];
 const matching=nodes.filter(node=>partNumbers(node).includes(no));
 const exactParts=matching.filter(node=>node.classList.contains('part')&&normalizePN(partTitlePN(node))===pn);
 const callouts=matching.filter(node=>node.classList.contains('callout'));
 const targets=exactParts.length?exactParts:callouts;
 if(!targets.length)return false;
 // Gunakan elemen yang benar-benar memiliki ukuran di layar.
 const rects=targets.map(node=>node.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);
 if(!rects.length)return false;
 const left=Math.min(...rects.map(r=>r.left)),right=Math.max(...rects.map(r=>r.right));
 const top=Math.min(...rects.map(r=>r.top)),bottom=Math.max(...rects.map(r=>r.bottom));
 const area=$('drawingArea'),stage=viewer.getBoundingClientRect();
 const width=area.clientWidth||stage.width,height=area.clientHeight||stage.height;
 if(!width||!height)return false;
 const targetWidth=Math.max(24,right-left),targetHeight=Math.max(24,bottom-top);
 const desiredZoom=Math.max(1,Math.min(1.5,Math.min(width*.42/targetWidth,height*.42/targetHeight)));
 const nextZoom=desiredZoom;
 const currentCenterX=(left+right)/2-(stage.left+stage.width/2);
 const currentCenterY=(top+bottom)/2-(stage.top+stage.height/2);
 // Posisi pusat target dihitung dari transform lama, lalu diletakkan tepat di tengah stage.
 const originalX=(currentCenterX-offsetX)/zoom;
 const originalY=(currentCenterY-offsetY)/zoom;
 zoom=nextZoom;
 offsetX=-originalX*zoom;
 offsetY=-originalY*zoom;
 updateView();
 return true;
}
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
   const row=rows[index],scroller=$('partsBody')?.closest('.cat-table-wrap');
   if(row&&scroller){
    const rr=row.getBoundingClientRect(),sr=scroller.getBoundingClientRect();
    const desired=scroller.scrollTop+(rr.top-sr.top)-(scroller.clientHeight-rr.height)/2;
    scroller.scrollTop=Math.max(0,Math.min(scroller.scrollHeight-scroller.clientHeight,desired));
   }
   // Qty Needed hanya diedit pada Selected Parts.
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
async function renderImage({preserveSelection=false}={}){
 hidePicker();
 if(!preserveSelection){activePartIndex=null;document.querySelectorAll('#partsBody tr').forEach(r=>r.classList.remove('cat-part-highlight'));}
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
   // CAT SIS callout tidak memiliki <title>; tambahkan tooltip dari database.
   svg.querySelectorAll('g.callout').forEach(node=>{
     const nums=partNumbers(node);
     const indexes=matchIndexes(nums);
     const entries=indexes.map(i=>active.parts[i]);
     const label=entries.length
       ? entries.map(x=>`No ${x.no} | ${x.pn} | ${x.description}`).join('\n')
       : `No ${nums.join(', ')} | Tidak terdaftar di Parts List`;
     let title=node.querySelector(':scope > title');
     if(!title){title=document.createElementNS('http://www.w3.org/2000/svg','title');node.insertBefore(title,node.firstChild);}
     title.textContent=label;
   });
   viewer.replaceChildren(svg);
   viewerImage=svg;
   viewer.dataset.message='';
   resetView();
   if(preserveSelection&&activePartIndex!=null)highlightDrawing(activePartIndex);
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
 function syncPartAddButton(){
  if(!active)return;
  $('partsBody').querySelectorAll('tr').forEach(tr=>{
   const p=active.parts[Number(tr.dataset.index)];if(!p)return;
   const chosen=selected.has(key(active,p));
   tr.classList.toggle('cat-part-in-cart',chosen);
   const b=tr.querySelector('.cat-add');if(!b)return;
   b.classList.toggle('is-selected',chosen);
   b.setAttribute('aria-pressed',String(chosen));
   b.setAttribute('aria-label',`${chosen?'Sudah dipilih':'Tambahkan'} ${p.pn} ke Selected Parts`);
   b.title=chosen?'Sudah dipilih':'Tambahkan ke Selected Parts';
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
$('groupList').addEventListener('click',e=>{const locate=e.target.closest('[data-locate-group]');if(locate){locatePart(locate.dataset.locateGroup,Number(locate.dataset.locateIndex));return;}const btn=e.target.closest('[data-group]');if(btn)openGroup(btn.dataset.group)});
$('groupSearch').placeholder='Cari Group / Part Number / Part...';
$('groupSearch').setAttribute('aria-label','Global Search: Assembly Group, Part Number, atau Description');
$('groupSearch').addEventListener('input',e=>showGroups(e.target.value));
// Sinkronisasi dua arah: klik baris memilih nomor SVG; klik keranjang tetap menambah part.
 $('partsBody').addEventListener('click',e=>{
  if(!active)return;
  const tr=e.target.closest('tr[data-index]');if(!tr)return;
  const index=Number(tr.dataset.index),p=active.parts[index];if(!p)return;
  if(!e.target.closest('.cat-add')){void selectPartAndLocate(index);return;}
  void selectPartAndLocate(index,{focus:false});
  if(!selected.has(key(active,p)))selected.set(key(active,p),{group:active.name,no:p.no,pn:p.pn,description:p.description,needed:1});
  saveSelection();renderSelected();syncPartAddButton();
 });
 // Akses keyboard untuk pemilihan baris Parts List tanpa mengganggu tombol keranjang.
 $('partsBody').addEventListener('keydown',e=>{
  if(e.target.closest('button,input,select,a'))return;
  if(e.key!=='Enter'&&e.key!==' ')return;
  const tr=e.target.closest('tr[data-index]');if(!tr)return;
  e.preventDefault();void selectPartAndLocate(Number(tr.dataset.index));
 });
$('prevImage').addEventListener('click',()=>{if(imageIndex>0){++locateRequest;imageIndex--;renderImage({preserveSelection:true})}});
$('nextImage').addEventListener('click',()=>{if(imageIndex<(active?.images.length||0)-1){++locateRequest;imageIndex++;renderImage({preserveSelection:true})}});
$('clearSelection').addEventListener('click',()=>{if(!selected.size)return;if(!confirm('Hapus semua Selected Parts?'))return;selected.clear();saveSelection();renderSelected();render()});
$('exportSelection').addEventListener('click',async()=>{if(!selected.size){alert('Pilih part terlebih dahulu.');return}const data=[...selected.values()];const text=['Group\tNo\tPart Number\tDescription\tQty Needed',...data.map(p=>[p.group,p.no,p.pn,p.description,p.needed].join('\t'))].join('\n');try{await navigator.clipboard.writeText(text);alert('Daftar part berhasil disalin.')}catch{prompt('Salin daftar part berikut:',text)}});

// FIG continuation handling:
// - one drawing per identical FIG + same variant; never deduplicate across different variants
// - continuation part rows are concatenated, not silently discarded
// - legacy groups with images/parts work unchanged
function prepareGroups(sourceGroups){
 const result=[];
 for(const raw of (Array.isArray(sourceGroups)?sourceGroups:[])){
  if(!raw||typeof raw!=='object')continue;
  const g={...raw};
  const segments=Array.isArray(raw.pages)?raw.pages:(Array.isArray(raw.continuations)?raw.continuations:[]);
  const parts=[...(Array.isArray(raw.parts)?raw.parts:[])];
  const images=[...(Array.isArray(raw.images)?raw.images:[])];
  const figKey=v=>String(v??'').trim().toUpperCase();
  const variantKey=v=>String(v??'').trim().toUpperCase();
  const known=new Set();
  const cleanImages=[];
  const addImage=(url,fig,variant)=>{
   if(!url)return;
   const canonical=String(url).trim();
   // For repeated PDF continuation pages, prefer an explicit FIG identity.
   // Without one, exact same URL is safely deduplicated.
   const identity=figKey(fig)?'fig:'+figKey(fig)+'|variant:'+variantKey(variant):'url:'+canonical;
   if(known.has(identity))return;
   known.add(identity);cleanImages.push(canonical);
  };
  images.forEach((img,i)=>{
   if(typeof img==='string')addImage(img,raw.imageFigs?.[i]||'',raw.imageVariants?.[i]||raw.variant||'');
   else if(img&&typeof img==='object')addImage(img.url||img.src,img.fig,img.variant||raw.variant);
  });
  for(const page of segments){
   if(!page||typeof page!=='object')continue;
   if(Array.isArray(page.parts))parts.push(...page.parts);
   const fig=page.fig||raw.fig;
   const variant=page.variant||raw.variant;
   if(page.image)addImage(page.image,fig,variant);
   if(Array.isArray(page.images))page.images.forEach(im=>{
    if(typeof im==='string')addImage(im,fig,variant);
    else if(im)addImage(im.url||im.src,im.fig||fig,im.variant||variant);
   });
  }
  g.parts=parts;g.images=cleanImages;
  result.push(g);
 }
 return result;
}
restoreSelection();renderSelected();
fetch('pc1250-11-data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{groups=prepareGroups(data.groups);window.HEXA_PC1250_GROUPS = groups;document.dispatchEvent(new Event('hexa-pc1250-ready'));showGroups();if(groups.length)openGroup(groups[0].id)}).catch(e=>{$('groupList').textContent='Gagal memuat data katalog. Periksa pc1250-11-data.json';console.error(e)});
})();
