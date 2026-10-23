/* HEXCatalog CAT 395 — read-only reference and local selection.
   Master will later upload SVGs and map clickable callouts.
   File cat395-hose-data.json must be placed beside this JS. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
let groups=[],active=null,imageIndex=0;
const selected=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=(g,p)=>`${g.id}|${p.no}|${p.pn}`;
const qty=(v)=>Math.max(1,Math.min(9999,Number.parseInt(v,10)||1));
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
function initViewer(){
 const area=$('drawingArea');
 area.classList.add('cat-viewer');
 area.innerHTML='<div class="cat-viewer-stage"><img class="cat-viewer-image" alt=""></div>';
 viewer=area.querySelector('.cat-viewer-stage'); viewerImage=area.querySelector('img');
 const toolbar=area.closest('.cat-images').querySelector('.cat-image-toolbar');
 const controls=document.createElement('div');controls.className='cat-zoom-controls';
 controls.innerHTML='<button type="button" data-zoom="out" title="Zoom out">−</button><span class="cat-zoom-label">100%</span><button type="button" data-zoom="in" title="Zoom in">+</button><button type="button" data-zoom="fit" title="Fit gambar">Fit</button><button type="button" data-zoom="fullscreen" title="Fullscreen">⛶</button>';
 toolbar.append(controls);zoomLabel=controls.querySelector('.cat-zoom-label');
 controls.addEventListener('click',e=>{const btn=e.target.closest('[data-zoom]');if(!btn)return;const action=btn.dataset.zoom;
 if(action==='in')setZoom(zoom*1.3);if(action==='out')setZoom(zoom/1.3);if(action==='fit')resetView();if(action==='fullscreen')toggleFullscreen();});
 area.addEventListener('wheel',e=>{if(!viewerImage?.getAttribute('src'))return;e.preventDefault();setZoom(zoom*(e.deltaY<0?1.15:1/1.15));},{passive:false});
 area.addEventListener('pointerdown',e=>{if(e.button!==0||!viewerImage?.getAttribute('src'))return;dragging=true;startX=e.clientX-offsetX;startY=e.clientY-offsetY;area.setPointerCapture(e.pointerId);area.classList.add('is-dragging');});
 area.addEventListener('pointermove',e=>{if(!dragging)return;offsetX=e.clientX-startX;offsetY=e.clientY-startY;updateView();});
 const end=()=>{dragging=false;area.classList.remove('is-dragging')};area.addEventListener('pointerup',end);area.addEventListener('pointercancel',end);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fullscreen)toggleFullscreen();});
}
function updateView(){if(!viewerImage)return;viewerImage.style.transform=`translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;zoomLabel.textContent=`${Math.round(zoom*100)}%`;}
function setZoom(n){zoom=Math.max(.5,Math.min(10,n));updateView();}
function resetView(){zoom=1;offsetX=offsetY=0;updateView();}
function toggleFullscreen(){fullscreen=!fullscreen;document.querySelector('.cat-images').classList.toggle('cat-fullscreen',fullscreen);document.body.classList.toggle('cat-viewer-open',fullscreen);resetView();}
function renderImage(){const imgs=active?.images||[];const area=$('drawingArea');$('imagePosition').textContent=imgs.length?`${imageIndex+1} / ${imgs.length}`:'0 / 0';$('prevImage').disabled=imageIndex===0;$('nextImage').disabled=imageIndex>=imgs.length-1;
 if(!viewer)initViewer();resetView();
 if(!imgs.length){viewerImage.removeAttribute('src');viewerImage.style.display='none';viewer.dataset.message='Gambar SVG assembly belum diupload. Parts List tetap dapat digunakan.';return;}
 viewer.dataset.message='';viewerImage.style.display='block';viewerImage.alt=`${active.name} drawing ${imageIndex+1}`;
 viewerImage.onerror=()=>{viewerImage.style.display='none';viewer.dataset.message='Gambar tidak ditemukan: '+imgs[imageIndex]};
 viewerImage.onload=()=>{viewer.dataset.message='';resetView()};viewerImage.src=imgs[imageIndex];
}
function renderSelected(){const items=[...selected.values()];$('selectionCount').textContent=items.length;$('selectionSummary').textContent=items.length?items.map(x=>`${x.group}: #${x.no} ${x.pn} × ${x.needed}`).join(' | '):'Belum ada part dipilih.';}
$('groupList').addEventListener('click',e=>{const btn=e.target.closest('[data-group]');if(btn)openGroup(btn.dataset.group)});
$('groupSearch').addEventListener('input',e=>showGroups(e.target.value));
$('partsBody').addEventListener('click',e=>{const btn=e.target.closest('.cat-add');if(!btn||!active)return;const tr=btn.closest('tr');const p=active.parts[Number(tr.dataset.index)];selected.set(key(active,p),{group:active.name,no:p.no,pn:p.pn,description:p.description,needed:qty(tr.querySelector('input').value)});btn.textContent='Update';renderSelected();});
$('prevImage').addEventListener('click',()=>{if(imageIndex>0){imageIndex--;renderImage()}});
$('nextImage').addEventListener('click',()=>{if(imageIndex<(active?.images.length||0)-1){imageIndex++;renderImage()}});
$('clearSelection').addEventListener('click',()=>{selected.clear();renderSelected();render()});
$('exportSelection').addEventListener('click',async()=>{if(!selected.size){alert('Pilih part terlebih dahulu.');return}const data=[...selected.values()];const text=['Group\tNo\tPart Number\tDescription\tQty Needed',...data.map(p=>[p.group,p.no,p.pn,p.description,p.needed].join('\t'))].join('\n');try{await navigator.clipboard.writeText(text);alert('Daftar part berhasil disalin.')}catch{prompt('Salin daftar part berikut:',text)}});
fetch('cat395-hose-data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{groups=data.groups||[];showGroups();if(groups.length)openGroup(groups[0].id)}).catch(e=>{$('groupList').textContent='Gagal memuat data katalog. Periksa cat395-hose-data.json';console.error(e)});
})();
