/* HEXA PC1250-11R — ADD-ON SEMUA SISTEM, V1
 * Simpan sebagai pc1250-11-engine-addon.js (menggantikan isi add-on lama).
 * HARUS dimuat setelah pc1250-11-catalog.js dan pc1250-11-systems.js.
 * Tidak mengubah kedua JS asli, JSON, SVG, maupun katalog CAT 395.
 * Sistem baru otomatis aktif ketika groups[] pada pc1250-11-data.json
 * memiliki properti system yang cocok dengan nama/id pada systems.json.
 */
(()=>{'use strict';
const byId=id=>document.getElementById(id);
const tabs=byId('pcSystemTabs'), sections=byId('pcSectionList'), list=byId('groupList'), search=byId('groupSearch');
if(!tabs||!sections||!list){console.error('[HEXA all systems] Elemen katalog tidak ditemukan');return;}
const HYD='HYDRAULIC SYSTEM';
const norm=s=>String(s??'').trim().toUpperCase().replace(/\s+/g,' ');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let allGroups=[],systems=[],selected=HYD,originalHydraulic=null,loaded=false,loading=false;
let pendingId=null;
const groupSystem=g=>norm(g.system||'');
const findSystem=s=>systems.find(x=>norm(x.name)===norm(s)||slug(x.id)===slug(s));
const isHyd=()=>norm(selected)===HYD;
function groupsFor(system){const s=findSystem(system);return allGroups.filter(g=>g.id&&Array.isArray(g.parts)&&(groupSystem(g)===norm(system)||(s&&slug(groupSystem(g))===slug(s.id))));}
function setTitle(name){const el=document.querySelector('.pc-page-title, #pcCatalogTitle');if(el)el.textContent='KOMATSU PC1250-11R — '+name;}
function decorate(){
 for(const t of tabs.querySelectorAll('.pc-system-tab')){
  const name=norm(t.textContent);
  if(!systems.some(s=>norm(s.name)===name))continue;
  t.disabled=false;t.removeAttribute('disabled');t.removeAttribute('title');
  const active=name===norm(selected);
  t.classList.toggle('is-active',active);
  if(active)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');
 }
}
function renderGroups(){
 const gs=groupsFor(selected);
 if(!gs.length){
  sections.innerHTML='<p class="pc-section-hint" style="padding:12px">Data '+esc(selected)+' belum tersedia. Tambahkan FIG dan Parts List ke pc1250-11-data.json; tab ini akan membacanya otomatis.</p>';
 }else{
  sections.innerHTML=gs.map(g=>'<button type="button" class="pc-section-btn" data-addon-group="'+esc(g.id)+'"><span>'+esc(g.name)+'</span><small>'+esc(g.fig||'')+' · '+g.parts.length+' part</small></button>').join('');
 }
 sections.style.display='';list.style.display='none';
 return gs;
}
function openGroup(id){
 const btn=[...list.querySelectorAll('[data-group]')].find(b=>b.dataset.group===id);
 if(!btn){
  pendingId=id;
  console.warn('[HEXA all systems] Menunggu catalog.js merender grup:',id);
  return false;
 }
 pendingId=null;btn.click();
 sections.querySelectorAll('[data-addon-group]').forEach(b=>b.classList.toggle('is-active',b.dataset.addonGroup===id));
 return true;
}
function clearView(){
 const title=byId('groupTitle');if(title)title.textContent=selected;
 const count=byId('groupCount');if(count)count.textContent='0 part';
 const info=byId('pcSectionStatus');if(info)info.remove();
 // Jangan memanipulasi internal SVG/cart milik catalog.js.
}
function activate(name){
 const s=findSystem(name);if(!s)return;
 if(isHyd()&&originalHydraulic===null)originalHydraulic=sections.innerHTML;
 selected=s.name;
 if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
 setTitle(selected);
 if(isHyd()){
  if(originalHydraulic!==null)sections.innerHTML=originalHydraulic;
  sections.style.display='';list.style.display='none';decorate();
  const first=[...list.querySelectorAll('[data-group]')].find(b=>!groupSystem(allGroups.find(g=>g.id===b.dataset.group)||{}));
  if(first)first.click();
  return;
 }
 const gs=renderGroups();decorate();
 if(gs.length)openGroup(gs[0].id);else clearView();
}
// Capture tab click sebelum kode lama yang menganggap tab lain belum aktif.
tabs.addEventListener('click',e=>{
 const t=e.target.closest('.pc-system-tab');if(!t)return;
 const name=norm(t.textContent);
 if(!systems.some(s=>norm(s.name)===name))return;
 e.preventDefault();e.stopImmediatePropagation();activate(name);
},true);
// Gunakan katalog asli untuk membuka SVG, Parts List, zoom dan keranjang.
sections.addEventListener('click',e=>{
 if(isHyd())return;
 const b=e.target.closest('[data-addon-group]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();openGroup(b.dataset.addonGroup);
},true);
// systems.js lama membuat tombol secara asinkron.
const observer=new MutationObserver(()=>decorate());
observer.observe(tabs,{childList:true});
// Katalog asli mungkin selesai membangun #groupList sedikit setelah JSON dimuat.
const listObserver=new MutationObserver(()=>{if(pendingId)openGroup(pendingId);});
listObserver.observe(list,{childList:true,subtree:true});
Promise.all([
 fetch('pc1250-11-data.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('data.json HTTP '+r.status);return r.json();}),
 fetch('pc1250-11-systems.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('systems.json HTTP '+r.status);return r.json();})
]).then(([data,sys])=>{
 allGroups=Array.isArray(data.groups)?data.groups:[];
 systems=Array.isArray(sys.systems)?sys.systems:[];
 loaded=true;decorate();
 console.info('[HEXA all systems] Siap:',allGroups.length,'FIG;',systems.length,'sistem.');
 for(const s of systems){const n=groupsFor(s.name).length;if(n)console.info('[HEXA all systems]',s.name,n,'FIG');}
}).catch(e=>console.error('[HEXA all systems] Gagal inisialisasi:',e));
})();
