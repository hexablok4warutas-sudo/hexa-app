/* HEXA PC1250-11R — ENGINE CYLINDER HEAD ADD-ON
   Pasang SEBAGAI FILE BARU pc1250-11-engine-addon.js.
   JANGAN ganti catalog.js atau systems.js yang sudah normal.
   Data 18 FIG harus sudah ada di pc1250-11-data.json.
*/
(()=>{'use strict';
 const tabs=document.getElementById('pcSystemTabs');
 const sections=document.getElementById('pcSectionList');
 const list=document.getElementById('groupList');
 if(!tabs||!sections||!list)return;
 const ENGINE='engine-cylinder-head-and-its-related-parts';
 const HYDRAULIC='hydraulic-system';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let mode=HYDRAULIC,engineGroups=[],originalSections=null;
 const findTab=(name)=>[...tabs.querySelectorAll('.pc-system-tab')].find(x=>x.textContent.trim().toUpperCase()===name);
 const engineTabName='ENGINE CYLINDER HEAD AND ITS RELATED PARTS';
 const hydraulicTabName='HYDRAULIC SYSTEM';
 function markTabs(){
  for(const t of tabs.querySelectorAll('.pc-system-tab')){
   const isEngine=t.textContent.trim().toUpperCase()===engineTabName;
   const isHydraulic=t.textContent.trim().toUpperCase()===hydraulicTabName;
   if(!isEngine&&!isHydraulic)continue;
   const selected=mode===(isEngine?ENGINE:HYDRAULIC);
   t.disabled=false;
   t.removeAttribute('title');
   t.classList.toggle('is-active',selected);
   if(selected)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');
  }
 }
 function engineHTML(){
  return engineGroups.map(g=>`<button type="button" class="pc-section-btn" data-engine-fig="${esc(g.id)}"><span>${esc(g.name)}</span><small>${esc(g.fig)} · ${g.parts.length} part</small></button>`).join('');
 }
 function openEngine(id){
  const button=[...list.querySelectorAll('[data-group]')].find(b=>b.dataset.group===id);
  if(!button){console.error('FIG belum ada di katalog utama:',id);alert('FIG '+id+' belum dimuat oleh catalog.js. Pastikan JSON gabungan 204 FIG digunakan.');return;}
  button.click();
  sections.querySelectorAll('[data-engine-fig]').forEach(b=>b.classList.toggle('is-active',b.dataset.engineFig===id));
 }
 function activateEngine(){
  if(!engineGroups.length){alert('18 FIG Engine belum ditemukan di pc1250-11-data.json.');return;}
  if(mode!==ENGINE)originalSections=sections.innerHTML;
  mode=ENGINE;
  sections.innerHTML=engineHTML();
  sections.style.display='';
  const search=document.getElementById('groupSearch');
  if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
  sections.style.display='';
  markTabs();
  openEngine(engineGroups[0].id);
  const heading=document.querySelector('.pc-page-title, #pcCatalogTitle');
  if(heading)heading.textContent='KOMATSU PC1250-11R — ENGINE CYLINDER HEAD AND ITS RELATED PARTS';
 }
 function activateHydraulic(){
  mode=HYDRAULIC;
  if(originalSections!==null)sections.innerHTML=originalSections;
  sections.style.display='';
  const search=document.getElementById('groupSearch');
  if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
  sections.style.display='';
  markTabs();
  const first=list.querySelector('[data-group]');
  if(first)first.click();
  const heading=document.querySelector('.pc-page-title, #pcCatalogTitle');
  if(heading)heading.textContent='KOMATSU PC1250-11R — HYDRAULIC SYSTEM';
 }
 // Capture phase: only intercept Engine-specific section clicks; original Hydraulic listener stays intact.
 sections.addEventListener('click',e=>{
  const b=e.target.closest('[data-engine-fig]');
  if(mode!==ENGINE||!b)return;
  e.stopImmediatePropagation();
  openEngine(b.dataset.engineFig);
 },true);
 tabs.addEventListener('click',e=>{
  const t=e.target.closest('.pc-system-tab');if(!t)return;
  const name=t.textContent.trim().toUpperCase();
  if(name===engineTabName){e.preventDefault();activateEngine();}
  else if(name===hydraulicTabName&&mode===ENGINE){e.preventDefault();activateHydraulic();}
 },true);
 // Original systems.js fetches its JSON asynchronously; wait for tabs to be painted.
 const observer=new MutationObserver(()=>{
  const t=findTab(engineTabName);
  if(t&&t.disabled){t.disabled=false;t.removeAttribute('title');}
  if(mode===ENGINE)markTabs();
 });
 observer.observe(tabs,{childList:true,subtree:true});
 fetch('pc1250-11-data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(d=>{
  engineGroups=(Array.isArray(d.groups)?d.groups:[]).filter(g=>
   String(g.system||'').trim().toUpperCase()===engineTabName &&
   g.id && Array.isArray(g.parts) && Array.isArray(g.images));
  if(!engineGroups.length)console.error('HEXA: Engine groups tidak ditemukan pada JSON utama.');
  markTabs();
 }).catch(e=>console.error('HEXA Engine addon:',e));
})();
