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
function renderImage(){const imgs=active?.images||[];const area=$('drawingArea');$('imagePosition').textContent=imgs.length?`${imageIndex+1} / ${imgs.length}`:'0 / 0';$('prevImage').disabled=imageIndex===0;$('nextImage').disabled=imageIndex>=imgs.length-1;
 if(!imgs.length){area.textContent='Gambar SVG assembly belum diupload. Parts List tetap dapat digunakan.';return;}
 area.innerHTML='';const img=document.createElement('img');img.src=imgs[imageIndex];img.alt=`${active.name} drawing ${imageIndex+1}`;img.onerror=()=>{area.textContent='Gambar tidak ditemukan: '+imgs[imageIndex]};area.append(img);
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
