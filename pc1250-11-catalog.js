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
   let response=await fetch(url);
   if(!response.ok && /\/hydraulic-system\//.test(url)){
     const alternate=url.replace('/hydraulic-system/','/');
     response=await fetch(alternate);
   }
   if(!response.ok)throw Error('HTTP '+response.status+' — '+url);
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
       if(name.startsWith('on') || ((name==='href'||name.endsWith(':href')) && !value.startsWith('#') && !/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(value)) ||
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
fetch('pc1250-11-data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{groups=prepareGroups(data.groups);showGroups();if(groups.length)openGroup(groups[0].id)}).catch(e=>{$('groupList').textContent='Gagal memuat data katalog. Periksa pc1250-11-data.json';console.error(e)});
})();


/* PC1250-11R SYSTEM TABS AND ASSEMBLY INDEX */
/* PC1250-11R REV4: resilient system tabs and Hydraulic section index. */
(()=>{'use strict';
const tabs=document.getElementById('pcSystemTabs'), sections=document.getElementById('pcSectionList'), search=document.getElementById('groupSearch'), groupList=document.getElementById('groupList');
if(!tabs||!sections)return;
const fallbackSystems=[{"id":"engine-cylinder-head-and-its-related-parts","name":"ENGINE CYLINDER HEAD AND ITS RELATED PARTS","enabled":false},{"id":"engine-cylinder-block-and-its-related-parts","name":"ENGINE CYLINDER BLOCK AND ITS RELATED PARTS","enabled":false},{"id":"engine-lubrication-system","name":"ENGINE LUBRICATION SYSTEM","enabled":false},{"id":"engine-fuel-system","name":"ENGINE FUEL SYSTEM","enabled":false},{"id":"engine-cooling-system","name":"ENGINE COOLING SYSTEM","enabled":false},{"id":"engine-electrical-system","name":"ENGINE ELECTRICAL SYSTEM","enabled":false},{"id":"engine-accessories-and-others","name":"ENGINE ACCESSORIES AND OTHERS","enabled":false},{"id":"engine-marks-and-plates","name":"ENGINE MARKS AND PLATES","enabled":false},{"id":"engine-related-parts","name":"ENGINE RELATED PARTS","enabled":false},{"id":"cooling-system","name":"COOLING SYSTEM","enabled":false},{"id":"fuel-system","name":"FUEL SYSTEM","enabled":false},{"id":"electrical-system","name":"ELECTRICAL SYSTEM","enabled":false},{"id":"air-system","name":"AIR SYSTEM","enabled":false},{"id":"hydraulic-system","name":"HYDRAULIC SYSTEM","enabled":true},{"id":"frame-and-its-related-parts","name":"FRAME AND ITS RELATED PARTS","enabled":false},{"id":"operator-s-compartment-and-control-system","name":"OPERATOR'S COMPARTMENT AND CONTROL SYSTEM","enabled":false},{"id":"guards-and-covers","name":"GUARDS AND COVERS","enabled":false},{"id":"swing-circle-and-its-related-parts","name":"SWING CIRCLE AND ITS RELATED PARTS","enabled":false},{"id":"travel-system-and-its-related-parts","name":"TRAVEL SYSTEM AND ITS RELATED PARTS","enabled":false},{"id":"undercarriage","name":"UNDERCARRIAGE","enabled":false},{"id":"work-equipment","name":"WORK EQUIPMENT","enabled":false},{"id":"marks-and-plates","name":"MARKS AND PLATES","enabled":false},{"id":"auxiliary-parts-and-tool","name":"AUXILIARY PARTS AND TOOL","enabled":false},{"id":"other-equipment","name":"OTHER EQUIPMENT","enabled":false},{"id":"field-repair-service-parts","name":"FIELD REPAIR SERVICE PARTS","enabled":false}];
const fallbackSections=[{"name":"Hydraulic Tank","figures":[{"fig":"H0110-001001","section":"Hydraulic Tank","title":"Tank","printed_page":328},{"fig":"H0110-005001","section":"Hydraulic Tank","title":"Tank (Sandy and Dusty Terrain Arrangement)","printed_page":330},{"fig":"H0110-001002","section":"Hydraulic Tank","title":"Return Filter (1/2)","printed_page":332},{"fig":"H0110-002002","section":"Hydraulic Tank","title":"Return Filter (1/2)","printed_page":333},{"fig":"H0110-001003","section":"Hydraulic Tank","title":"Return Filter (2/2)","printed_page":334},{"fig":"H0110-002003","section":"Hydraulic Tank","title":"Return Filter (2/2)","printed_page":335},{"fig":"H0110-001004","section":"Hydraulic Tank","title":"Relief Valve","printed_page":336},{"fig":"H0110-002004","section":"Hydraulic Tank","title":"Relief Valve","printed_page":337},{"fig":"H0110-001005","section":"Hydraulic Tank","title":"Relief Valve Piping","printed_page":338},{"fig":"H0110-004005","section":"Hydraulic Tank","title":"Relief Valve Piping (Hydraulic Stairway)","printed_page":339},{"fig":"H0110-003005","section":"Hydraulic Tank","title":"Relief Valve Piping (Without Link, Loading Shovel)","printed_page":341},{"fig":"H0110-002005","section":"Hydraulic Tank","title":"Relief Valve Piping (Without Link, Loading Shovel,Hydraulic Stairway)","printed_page":342},{"fig":"H0110-006006","section":"Hydraulic Tank","title":"Washer Tank and Cab Rear Cover","printed_page":344},{"fig":"H0110-001006A","section":"Hydraulic Tank","title":"Washer Tank and Cab Rear Cover","printed_page":346},{"fig":"H0110-003006A","section":"Hydraulic Tank","title":"Washer Tank and Cab Rear Cover","printed_page":348},{"fig":"H0110-005006A","section":"Hydraulic Tank","title":"Stairway)","printed_page":350},{"fig":"H0110-001007","section":"Hydraulic Tank","title":"Mounting (1/2)","printed_page":352},{"fig":"H0110-002007","section":"Hydraulic Tank","title":"Mounting (1/2)","printed_page":353},{"fig":"H0110-003007","section":"Hydraulic Tank","title":"Mounting (1/2)","printed_page":354},{"fig":"H0110-004007","section":"Hydraulic Tank","title":"Mounting (1/2)","printed_page":355},{"fig":"H0110-001008","section":"Hydraulic Tank","title":"Bypass Valve","printed_page":356},{"fig":"H0110-005008","section":"Hydraulic Tank","title":"Bypass Valve","printed_page":357},{"fig":"H0110-001009","section":"Hydraulic Tank","title":"Valve Mounting","printed_page":358},{"fig":"H0110-002010","section":"Hydraulic Tank","title":"Mounting (2/2)","printed_page":359},{"fig":"H0110-001010A","section":"Hydraulic Tank","title":"Mounting (2/2)","printed_page":360}]},{"name":"Control Valve","figures":[{"fig":"H0120-002001","section":"Control Valve","title":"5-Spool (1/5)","printed_page":361},{"fig":"H0120-004001","section":"Control Valve","title":"Control Valve, 5-Spool (1/5)","printed_page":362},{"fig":"H0120-002002","section":"Control Valve","title":"5-Spool (2/5)","printed_page":363},{"fig":"H0120-004002","section":"Control Valve","title":"Control Valve, 5-Spool (2/5)","printed_page":364},{"fig":"H0120-002003","section":"Control Valve","title":"5-Spool (3/5)","printed_page":365},{"fig":"H0120-004003","section":"Control Valve","title":"Control Valve, 5-Spool (3/5)","printed_page":366},{"fig":"H0120-002004","section":"Control Valve","title":"5-Spool (4/5)","printed_page":367},{"fig":"H0120-004004","section":"Control Valve","title":"Control Valve, 5-Spool (4/5)","printed_page":368},{"fig":"H0120-002005","section":"Control Valve","title":"5-Spool (5/5)","printed_page":369},{"fig":"H0120-004005","section":"Control Valve","title":"Control Valve, 5-Spool (5/5)","printed_page":370},{"fig":"H0120-002006","section":"Control Valve","title":"Inner Parts, Line Filter (1/2) (No1)","printed_page":371},{"fig":"H0120-004006","section":"Control Valve","title":"Inner Parts, Line Filter (1/2) (No1)","printed_page":372},{"fig":"H0120-004007","section":"Control Valve","title":"Line Filter Related Parts (1/2)","printed_page":373},{"fig":"H0120-002007","section":"Control Valve","title":"Line Filter Related Parts (1/2) (Without Link, Loading Shovel)","printed_page":374},{"fig":"H0120-004008","section":"Control Valve","title":"Joint Parts (1/2)","printed_page":375},{"fig":"H0120-005008","section":"Control Valve","title":"Joint Parts (1/2) (For 5700mm Arm)","printed_page":376},{"fig":"H0120-002008","section":"Control Valve","title":"Joint Parts (1/2) (Without Link, Loading Shovel)","printed_page":377},{"fig":"H0120-002009","section":"Control Valve","title":"Branch Piping (1/2)","printed_page":378},{"fig":"H0120-002010","section":"Control Valve","title":"4-Spool (1/6)","printed_page":379},{"fig":"H0120-004010","section":"Control Valve","title":"Control Valve, 4-Spool (1/6)","printed_page":380},{"fig":"H0120-002011","section":"Control Valve","title":"4-Spool (2/6)","printed_page":381},{"fig":"H0120-004011","section":"Control Valve","title":"Control Valve, 4-Spool (2/6)","printed_page":382},{"fig":"H0120-002012","section":"Control Valve","title":"4-Spool (3/6)","printed_page":383},{"fig":"H0120-004012","section":"Control Valve","title":"Control Valve, 4-Spool (3/6)","printed_page":384},{"fig":"H0120-002013","section":"Control Valve","title":"4-Spool (4/6)","printed_page":385},{"fig":"H0120-004013","section":"Control Valve","title":"Control Valve, 4-Spool (4/6)","printed_page":386},{"fig":"H0120-002014","section":"Control Valve","title":"4-Spool (5/6)","printed_page":387},{"fig":"H0120-004014","section":"Control Valve","title":"Control Valve, 4-Spool (5/6)","printed_page":388},{"fig":"H0120-002015","section":"Control Valve","title":"4-Spool (6/6)","printed_page":389},{"fig":"H0120-004015","section":"Control Valve","title":"Control Valve, 4-Spool (6/6)","printed_page":390},{"fig":"H0120-002016","section":"Control Valve","title":"Inner Parts, Line Filter (2/2) (No2)","printed_page":391},{"fig":"H0120-004016","section":"Control Valve","title":"Inner Parts, Line Filter (2/2) (No2)","printed_page":392},{"fig":"H0120-004017","section":"Control Valve","title":"Line Filter Related Parts (2/2)","printed_page":393},{"fig":"H0120-002017","section":"Control Valve","title":"Line Filter Related Parts (2/2) (Without Link, Loading Shovel)","printed_page":394},{"fig":"H0120-002018","section":"Control Valve","title":"Joint Parts (2/2)","printed_page":395},{"fig":"H0120-005018","section":"Control Valve","title":"Joint Parts (2/2) (For 5700mm Arm)","printed_page":396},{"fig":"H0120-002019","section":"Control Valve","title":"Branch Piping (2/2)","printed_page":397},{"fig":"H0120-004020","section":"Control Valve","title":"Valve Stand","printed_page":398},{"fig":"H0120-002020","section":"Control Valve","title":"Valve Stand (Without Link, Loading Shovel)","printed_page":399}]},{"name":"Swing Control Valve","figures":[{"fig":"H0121-002001","section":"Swing Control Valve","title":"Control Valve, 4-Spool (1/4)","printed_page":400},{"fig":"H0121-002002","section":"Swing Control Valve","title":"Control Valve, 4-Spool (2/4)","printed_page":401},{"fig":"H0121-002003","section":"Swing Control Valve","title":"Control Valve, 4-Spool (3/4)","printed_page":402},{"fig":"H0121-002004","section":"Swing Control Valve","title":"Control Valve, 4-Spool (4/4)","printed_page":403},{"fig":"H0121-002005","section":"Swing Control Valve","title":"Inner Parts, Line Filter","printed_page":404},{"fig":"H0121-002006","section":"Swing Control Valve","title":"Line Filter Related Parts","printed_page":405},{"fig":"H0121-002007","section":"Swing Control Valve","title":"Joint Parts","printed_page":406},{"fig":"H0121-002008","section":"Swing Control Valve","title":"Valve Stand","printed_page":407}]},{"name":"No.1 Pump","figures":[{"fig":"H0210-002001","section":"No.1 Pump","title":"Piston Pump (1/15)","printed_page":408},{"fig":"H0210-002002","section":"No.1 Pump","title":"Piston Pump (2/15)","printed_page":409},{"fig":"H0210-002003","section":"No.1 Pump","title":"Piston Pump (3/15)","printed_page":410},{"fig":"H0210-002004","section":"No.1 Pump","title":"Piston Pump (4/15)","printed_page":411},{"fig":"H0210-002005","section":"No.1 Pump","title":"Piston Pump (5/15)","printed_page":413},{"fig":"H0210-002006","section":"No.1 Pump","title":"Piston Pump (6/15)","printed_page":414},{"fig":"H0210-002007","section":"No.1 Pump","title":"Piston Pump (7/15)","printed_page":415},{"fig":"H0210-002008","section":"No.1 Pump","title":"Piston Pump (8/15)","printed_page":417},{"fig":"H0210-002009","section":"No.1 Pump","title":"Piston Pump (9/15)","printed_page":419},{"fig":"H0210-002010","section":"No.1 Pump","title":"Piston Pump (10/15)","printed_page":420},{"fig":"H0210-002011","section":"No.1 Pump","title":"Piston Pump (11/15)","printed_page":422},{"fig":"H0210-002012","section":"No.1 Pump","title":"Piston Pump (12/15)","printed_page":424},{"fig":"H0210-002013","section":"No.1 Pump","title":"Piston Pump (13/15)","printed_page":425},{"fig":"H0210-002014","section":"No.1 Pump","title":"Piston Pump (14/15)","printed_page":426},{"fig":"H0210-002015","section":"No.1 Pump","title":"Piston Pump (15/15)","printed_page":427},{"fig":"H0210-002016","section":"No.1 Pump","title":"Gear Pump","printed_page":428},{"fig":"H0210-002017","section":"No.1 Pump","title":"Joint Parts","printed_page":429}]},{"name":"No.2 Pump","figures":[{"fig":"H0220-001001","section":"No.2 Pump","title":"Piston Pump (1/10)","printed_page":431},{"fig":"H0220-001002","section":"No.2 Pump","title":"Piston Pump (2/10)","printed_page":432},{"fig":"H0220-001003","section":"No.2 Pump","title":"Piston Pump (3/10)","printed_page":433},{"fig":"H0220-001004","section":"No.2 Pump","title":"Piston Pump (4/10)","printed_page":434},{"fig":"H0220-001005","section":"No.2 Pump","title":"Piston Pump (5/10)","printed_page":436},{"fig":"H0220-001006","section":"No.2 Pump","title":"Piston Pump (6/10)","printed_page":437},{"fig":"H0220-001007","section":"No.2 Pump","title":"Piston Pump (7/10)","printed_page":438},{"fig":"H0220-001008","section":"No.2 Pump","title":"Piston Pump (8/10)","printed_page":440},{"fig":"H0220-001009","section":"No.2 Pump","title":"Piston Pump (9/10)","printed_page":442},{"fig":"H0220-001010","section":"No.2 Pump","title":"Piston Pump (10/10)","printed_page":443},{"fig":"H0220-001011","section":"No.2 Pump","title":"Gear Pump","printed_page":444},{"fig":"H0220-001012A","section":"No.2 Pump","title":"Joint Parts","printed_page":445}]},{"name":"No.3 Pump","figures":[{"fig":"H0230-001001","section":"No.3 Pump","title":"Piston Pump (1/17)","printed_page":446},{"fig":"H0230-001002","section":"No.3 Pump","title":"Piston Pump (2/17)","printed_page":447},{"fig":"H0230-001003","section":"No.3 Pump","title":"Piston Pump (3/17)","printed_page":448},{"fig":"H0230-001004","section":"No.3 Pump","title":"Piston Pump (4/17)","printed_page":449},{"fig":"H0230-001005","section":"No.3 Pump","title":"Piston Pump (5/17)","printed_page":450},{"fig":"H0230-001006","section":"No.3 Pump","title":"Piston Pump (6/17)","printed_page":451},{"fig":"H0230-001007","section":"No.3 Pump","title":"Piston Pump (7/17)","printed_page":452},{"fig":"H0230-001008","section":"No.3 Pump","title":"Piston Pump (8/17)","printed_page":453},{"fig":"H0230-001009","section":"No.3 Pump","title":"Piston Pump (9/17)","printed_page":454},{"fig":"H0230-001010","section":"No.3 Pump","title":"Piston Pump (10/17)","printed_page":455},{"fig":"H0230-001011","section":"No.3 Pump","title":"Piston Pump (11/17)","printed_page":456},{"fig":"H0230-001012","section":"No.3 Pump","title":"Piston Pump (12/17)","printed_page":458},{"fig":"H0230-001013","section":"No.3 Pump","title":"Piston Pump (13/17)","printed_page":460},{"fig":"H0230-001014","section":"No.3 Pump","title":"Piston Pump (14/17)","printed_page":461},{"fig":"H0230-001015","section":"No.3 Pump","title":"Piston Pump (15/17)","printed_page":462},{"fig":"H0230-001016","section":"No.3 Pump","title":"Piston Pump (16/17)","printed_page":464},{"fig":"H0230-001017","section":"No.3 Pump","title":"Piston Pump (17/17)","printed_page":465},{"fig":"H0230-001018A","section":"No.3 Pump","title":"Joint Parts","printed_page":466}]},{"name":"Gear Pump","figures":[{"fig":"H0240-001001","section":"Gear Pump","title":"Fan Pump (1/7)","printed_page":468},{"fig":"H0240-001002","section":"Gear Pump","title":"Fan Pump (2/7)","printed_page":469},{"fig":"H0240-001003","section":"Gear Pump","title":"Fan Pump (3/7)","printed_page":470},{"fig":"H0240-001004","section":"Gear Pump","title":"Fan Pump (4/7)","printed_page":471},{"fig":"H0240-001005","section":"Gear Pump","title":"Fan Pump (5/7)","printed_page":472},{"fig":"H0240-001006","section":"Gear Pump","title":"Fan Pump (6/7)","printed_page":473},{"fig":"H0240-001007","section":"Gear Pump","title":"Fan Pump (7/7)","printed_page":474},{"fig":"H0240-001008","section":"Gear Pump","title":"Joint Parts","printed_page":475}]},{"name":"Suction Piping","figures":[{"fig":"H0311-001001","section":"Suction Piping","title":"No.1 Pump and No.2 Pump Piping","printed_page":477},{"fig":"H0311-001002","section":"Suction Piping","title":"No.3 Pump and Gear Pump Piping","printed_page":478},{"fig":"H0311-001003","section":"Suction Piping","title":"Hydraulic Tank (1/3)","printed_page":479},{"fig":"H0311-001004","section":"Suction Piping","title":"Hydraulic Tank (2/3)","printed_page":480},{"fig":"H0311-001005","section":"Suction Piping","title":"Hydraulic Tank (3/3)","printed_page":481}]},{"name":"Delivery Piping","figures":[{"fig":"H0312-001001","section":"Delivery Piping","title":"No.1 Pump and No.2 Pump Piping","printed_page":482},{"fig":"H0312-001002","section":"Delivery Piping","title":"No.3 Pump Piping","printed_page":483},{"fig":"H0312-001003","section":"Delivery Piping","title":"No.1, No.2 and No.3 Valve (1/2)","printed_page":484},{"fig":"H0312-001004","section":"Delivery Piping","title":"No.1, No.2 and No.3 Valve (2/2)","printed_page":485},{"fig":"H0312-001005A","section":"Delivery Piping","title":"Mounting and Valve Branch","printed_page":487}]},{"name":"Oil Cooler Piping","figures":[{"fig":"H0320-001001","section":"Oil Cooler Piping","title":"Hydraulic Tank Piping","printed_page":488},{"fig":"H0320-001002","section":"Oil Cooler Piping","title":"Revolving Frame Side","printed_page":489},{"fig":"H0320-001003","section":"Oil Cooler Piping","title":"Cooling Side","printed_page":490}]},{"name":"Return Piping","figures":[{"fig":"H0330-005001","section":"Return Piping","title":"No.1 Valve","printed_page":491},{"fig":"H0330-005002","section":"Return Piping","title":"No.2 Valve","printed_page":492},{"fig":"H0330-005003","section":"Return Piping","title":"No.3 Valve","printed_page":493},{"fig":"H0330-005004","section":"Return Piping","title":"Fan Motor Piping","printed_page":494},{"fig":"H0330-005005","section":"Return Piping","title":"Safety Valve Mounting","printed_page":495},{"fig":"H0330-005006","section":"Return Piping","title":"Safety Valve","printed_page":496},{"fig":"H0330-005007","section":"Return Piping","title":"Related Parts","printed_page":497},{"fig":"H0330-005008","section":"Return Piping","title":"Swing Suction (1/2)","printed_page":498},{"fig":"H0330-005009","section":"Return Piping","title":"Swing Suction (2/2)","printed_page":500},{"fig":"H0330-005010","section":"Return Piping","title":"Hose (1/2)","printed_page":501},{"fig":"H0330-005011","section":"Return Piping","title":"Hose (2/2)","printed_page":502},{"fig":"H0330-005012","section":"Return Piping","title":"Valve","printed_page":503},{"fig":"H0330-005013","section":"Return Piping","title":"Radiator Motor Piping (1/2)","printed_page":504},{"fig":"H0330-005014","section":"Return Piping","title":"Radiator Motor Piping (2/2)","printed_page":505}]},{"name":"Drain Piping","figures":[{"fig":"H0340-001001","section":"Drain Piping","title":"Hydraulic Tank Piping","printed_page":506},{"fig":"H0340-001002","section":"Drain Piping","title":"Hydraulic Pump Piping","printed_page":507},{"fig":"H0340-001003","section":"Drain Piping","title":"Aftercooler Motor Piping","printed_page":508},{"fig":"H0340-001004A","section":"Drain Piping","title":"Filter","printed_page":509}]},{"name":"Boom Piping","figures":[{"fig":"H1210-002001","section":"Boom Piping","title":"Front","printed_page":511},{"fig":"H1210-002002","section":"Boom Piping","title":"No.1 Valve","printed_page":512},{"fig":"H1210-002003","section":"Boom Piping","title":"No.2 Valve","printed_page":513},{"fig":"H1210-002004","section":"Boom Piping","title":"No.3 Valve","printed_page":514},{"fig":"H1210-002005","section":"Boom Piping","title":"Boom Piping Tube and Front Bracket","printed_page":515}]},{"name":"Arm Piping","figures":[{"fig":"H1221-001001A","section":"Arm Piping","title":"No.1 Valve","printed_page":516},{"fig":"H1221-001002","section":"Arm Piping","title":"No.2 Valve","printed_page":517},{"fig":"H1221-001003","section":"Arm Piping","title":"No.3 Valve","printed_page":518}]},{"name":"Bucket Piping","figures":[{"fig":"H1222-001001","section":"Bucket Piping","title":"No.1 Valve","printed_page":520},{"fig":"H1222-001002","section":"Bucket Piping","title":"No.2 Valve","printed_page":521},{"fig":"H1222-001003","section":"Bucket Piping","title":"No.3 Valve","printed_page":522}]},{"name":"Bottom Dump Piping","figures":[{"fig":"H1223-002001","section":"Bottom Dump Piping","title":"Bottom Dump Piping","printed_page":523}]},{"name":"Boom Foot Bracket","figures":[{"fig":"H1230-001001","section":"Boom Foot Bracket","title":"Boom Foot Bracket","printed_page":524}]},{"name":"Travel Piping","figures":[{"fig":"H1310-001001","section":"Travel Piping","title":"Travel Piping","printed_page":525}]},{"name":"Straight Travel Piping","figures":[{"fig":"H1320-001001","section":"Straight Travel Piping","title":"Straight Travel Piping","printed_page":527}]},{"name":"Swing Piping","figures":[{"fig":"H1340-001001","section":"Swing Piping","title":"Swing Piping","printed_page":528}]},{"name":"O.L.S.S. Piping","figures":[{"fig":"H1810-003001","section":"O.L.S.S. Piping","title":"(1/2)","printed_page":529},{"fig":"H1810-003002","section":"O.L.S.S. Piping","title":"(2/2)","printed_page":530}]},{"name":"Solenoid Valve","figures":[{"fig":"H1831-002001","section":"Solenoid Valve","title":"Related Parts (1/2)","printed_page":531},{"fig":"H1831-002002","section":"Solenoid Valve","title":"Inner Parts (1/2)","printed_page":532},{"fig":"H1831-002003","section":"Solenoid Valve","title":"Mounting (1/3)","printed_page":533},{"fig":"H1831-002004","section":"Solenoid Valve","title":"Related Parts (2/2)","printed_page":534},{"fig":"H1831-002005","section":"Solenoid Valve","title":"Inner Parts (2/2)","printed_page":535},{"fig":"H1831-002006","section":"Solenoid Valve","title":"Mounting (2/3)","printed_page":536},{"fig":"H1831-002007","section":"Solenoid Valve","title":"Mounting (3/3)","printed_page":537},{"fig":"H1831-002008","section":"Solenoid Valve","title":"Wiring Harness Clamp","printed_page":538}]},{"name":"Solenoid Valve Piping","figures":[{"fig":"H1832-001001","section":"Solenoid Valve Piping","title":"(1/2)","printed_page":539},{"fig":"H1832-001002A","section":"Solenoid Valve Piping","title":"(2/2)","printed_page":540}]},{"name":"Shuttle Valve Piping","figures":[{"fig":"H1833-001002","section":"Shuttle Valve Piping","title":"Check Valve","printed_page":542},{"fig":"H1833-001003","section":"Shuttle Valve Piping","title":"Valve Mounting","printed_page":543}]},{"name":"Proportional Pressure Control (PPC) Piping Joint","figures":[{"fig":"H1835-001001","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Deck","printed_page":544},{"fig":"H1835-003001","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Deck (Without Link, Loading Shovel)","printed_page":545},{"fig":"H1835-001002","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Hose, Deck","printed_page":546},{"fig":"H1835-002002","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Hose, Deck (For 5700mm Arm)","printed_page":547},{"fig":"H1835-001003","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Hose, Valve","printed_page":549},{"fig":"H1835-002003","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Hose, Valve","printed_page":550},{"fig":"H1835-001004","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Joint, Valve and Clamp","printed_page":551},{"fig":"H1835-002004","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Joint, Valve and Clamp (For 5700mm Arm)","printed_page":553},{"fig":"H1835-003004","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Joint, Valve and Clamp (Without Link, Loading Shovel)","printed_page":555},{"fig":"H1835-003005","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Related Parts (1/2)","printed_page":557},{"fig":"H1835-003006","section":"Proportional Pressure Control (PPC) Piping Joint","title":"Related Parts (2/2)","printed_page":558}]},{"name":"Proportional Pressure Control (PPC) Pump Piping","figures":[{"fig":"H1841-002001","section":"Proportional Pressure Control (PPC) Pump Piping","title":"Pump Delivery","printed_page":559},{"fig":"H1841-002002","section":"Proportional Pressure Control (PPC) Pump Piping","title":"Accumulator","printed_page":561},{"fig":"H1841-002003","section":"Proportional Pressure Control (PPC) Pump Piping","title":"Delivery and Return Piping","printed_page":562},{"fig":"H1841-002004","section":"Proportional Pressure Control (PPC) Pump Piping","title":"Solenoid Valve","printed_page":563}]},{"name":"Proportional Pressure Control (PPC) Travel Piping","figures":[{"fig":"H1842-001001","section":"Proportional Pressure Control (PPC) Travel Piping","title":"Proportional Pressure Control (PPC) Travel Piping","printed_page":564},{"fig":"H1844-001001","section":"Proportional Pressure Control (PPC) Travel Piping","title":"Proportional Pressure Control (PPC) Straight Travel Piping","printed_page":565}]},{"name":"Proportional Pressure Control (PPC) Arm Piping","figures":[{"fig":"H1845-001001","section":"Proportional Pressure Control (PPC) Arm Piping","title":"Proportional Pressure Control (PPC) Arm Piping","printed_page":566},{"fig":"H1846-001001","section":"Proportional Pressure Control (PPC) Arm Piping","title":"Proportional Pressure Control (PPC) Boom and Bucket Piping","printed_page":567},{"fig":"H1846-002001","section":"Proportional Pressure Control (PPC) Arm Piping","title":"(For 5700mm Arm)","printed_page":568}]},{"name":"Proportional Pressure Control (PPC) Swing Piping","figures":[{"fig":"H1847-001001","section":"Proportional Pressure Control (PPC) Swing Piping","title":"Proportional Pressure Control (PPC) Swing Piping","printed_page":569}]},{"name":"Proportional Pressure Control (PPC) Heavy Lift Piping","figures":[{"fig":"H1850-002001","section":"Proportional Pressure Control (PPC) Heavy Lift Piping","title":"Proportional Pressure Control (PPC) Heavy Lift Piping","printed_page":570}]}];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeSection='Hydraulic Tank',sectionData=fallbackSections;
function updateSearch(){const q=!!search?.value.trim();sections.style.display=q?'none':'';if(groupList)groupList.style.display=q?'':'none';}
search?.addEventListener('input',updateSearch);
let currentSystem='HYDRAULIC SYSTEM';
let savedHydraulicTitle='';
function chooseSystem(name){
 currentSystem=name;
 const isHydraulic=name.toUpperCase()==='HYDRAULIC SYSTEM';
 const panel=document.querySelector('.cat-panel');
 panel?.classList.toggle('pc-is-coming',!isHydraulic);
 const heading=document.getElementById('pcCurrentSystem');if(heading)heading.textContent=name;
 const groupTitle=document.getElementById('groupTitle');
 if(!isHydraulic){if(groupTitle){if(!savedHydraulicTitle)savedHydraulicTitle=groupTitle.textContent;groupTitle.textContent=name;}}
 else if(groupTitle && savedHydraulicTitle){groupTitle.textContent=savedHydraulicTitle;savedHydraulicTitle='';}
 tabs.querySelectorAll('.pc-system-tab').forEach(btn=>{
  const selected=btn.dataset.system===name;
  btn.classList.toggle('is-active',selected);
  if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
 });
}
function renderTabs(data){
 tabs.innerHTML=data.map(s=>`<button type="button" class="pc-system-tab" data-system="${esc(s.name)}" title="${esc(s.name)}">${esc(s.name)}</button>`).join('');
 chooseSystem(currentSystem);
 const active=tabs.querySelector('.is-active');
 if(active)requestAnimationFrame(()=>{tabs.scrollLeft=Math.max(0,active.offsetLeft-tabs.offsetLeft-tabs.clientWidth/2+active.clientWidth/2);});
}
tabs.addEventListener('click',e=>{const btn=e.target.closest('.pc-system-tab');if(!btn)return;chooseSystem(btn.dataset.system);});
function renderSections(){sections.innerHTML=sectionData.map(s=>`<button type="button" class="pc-section-btn ${activeSection===s.name?'is-active':''}" data-section="${esc(s.name)}"><span>${esc(s.name)}</span><small>${s.figures?.length||0} FIG</small></button>`).join('');}
sections.addEventListener('click',e=>{const btn=e.target.closest('[data-section]');if(!btn)return;activeSection=btn.dataset.section;renderSections();
 const matches=[...document.querySelectorAll('#groupList [data-group]')];const m=matches.find(x=>x.textContent.toLowerCase().includes(activeSection.toLowerCase()));if(m){m.click();return;}
 const sec=sectionData.find(x=>x.name===activeSection);const title=document.getElementById('groupTitle'),count=document.getElementById('groupCount');
 if(title)title.textContent=activeSection;if(count)count.textContent=`${sec?.figures?.length||0} FIG · data belum tersedia`;
});
renderTabs(fallbackSystems);renderSections();updateSearch();
fetch('pc1250-11-systems.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{if(Array.isArray(d.systems))renderTabs(d.systems)}).catch(e=>console.warn('Menggunakan tab sistem bawaan:',e));
fetch('pc1250-11-hydraulic-index.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{if(Array.isArray(d.sections)){sectionData=d.sections;renderSections()}}).catch(e=>console.warn('Menggunakan indeks Hydraulic bawaan:',e));
})();

/* REV6: measure the bottom of the drawing/parts workspace, not Selected Parts. */
(()=>{
 'use strict';
 const aside=document.querySelector('.cat-groups');
 const workspace=document.querySelector('.cat-workspace');
 if(!aside||!workspace)return;
 let queued=false;
 const sync=()=>{
   queued=false;
   if(window.innerWidth<=1000){aside.style.removeProperty('--pc-sidebar-height');return;}
   const top=aside.getBoundingClientRect().top;
   const bottom=workspace.getBoundingClientRect().bottom;
   if(bottom>top)aside.style.setProperty('--pc-sidebar-height',Math.round(bottom-top)+'px');
 };
 const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(sync)};
 window.addEventListener('resize',schedule,{passive:true});
 if('ResizeObserver' in window){
   const observer=new ResizeObserver(schedule);
   observer.observe(workspace);
 }
 document.addEventListener('DOMContentLoaded',schedule);
 schedule();
})();


/* HEXCatalog PC1250-11R
   Match Assembly Groups height to Drawing + Parts List */

(() => {
  function syncAssemblyHeight() {
    const sidebar = document.querySelector('.cat-groups');
    const workspace = document.querySelector('.cat-workspace');

    if (!sidebar || !workspace) return;

    if (window.innerWidth <= 900) {
      sidebar.style.height = '';
      return;
    }

    const sidebarTop = sidebar.getBoundingClientRect().top;
    const workspaceBottom = workspace.getBoundingClientRect().bottom;

    const height = Math.max(300, workspaceBottom - sidebarTop);

    sidebar.style.height = `${height}px`;
  }

  window.addEventListener('load', syncAssemblyHeight);
  window.addEventListener('resize', syncAssemblyHeight);

  if (document.readyState === 'complete') {
    syncAssemblyHeight();
  }
})();
