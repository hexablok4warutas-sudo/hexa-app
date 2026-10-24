/* HEXA PC1250-11R — Engine Cylinder Head addon (tanpa mengubah JS lama).
   Pasang sebagai pc1250-11-engine-addon.js, SETELAH systems.js.
   Membaca 18 grup Engine dari pc1250-11-data.json; membuka grup lewat catalog.js asli.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const tabs=$('pcSystemTabs'),sections=$('pcSectionList'),list=$('groupList'),search=$('groupSearch');
if(!tabs||!sections||!list){console.error('[HEXA Engine] Elemen halaman tidak ditemukan');return;}
const ENGINE='ENGINE CYLINDER HEAD AND ITS RELATED PARTS', HYD='HYDRAULIC SYSTEM';
let engine=[],mode='hydraulic',hydraulicSections=null,ready=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const findTab=name=>[...tabs.querySelectorAll('.pc-system-tab')].find(t=>t.textContent.trim().toUpperCase()===name);
function decorateTabs(){
 const e=findTab(ENGINE);if(e){e.disabled=false;e.removeAttribute('disabled');e.removeAttribute('title');}
 for(const t of tabs.querySelectorAll('.pc-system-tab')){
  const name=t.textContent.trim().toUpperCase();if(name!==ENGINE&&name!==HYD)continue;
  const active=(mode==='engine'?name===ENGINE:name===HYD);
  t.classList.toggle('is-active',active);
  if(active)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');
 }
}
function renderEngine(){
 sections.innerHTML=engine.map(g=>`<button type="button" class="pc-section-btn" data-engine-group="${esc(g.id)}"><span>${esc(g.name)}</span><small>${esc(g.fig||'')} · ${g.parts.length} part</small></button>`).join('');
 sections.style.display='';
 list.style.display='none';
}
function openEngine(id){
 // Katalog asli memiliki semua 204 group pada #groupList, walaupun panelnya disembunyikan.
 const btn=[...list.querySelectorAll('[data-group]')].find(b=>b.dataset.group===id);
 if(!btn){console.error('[HEXA Engine] Tombol FIG tidak ditemukan:',id);sections.insertAdjacentHTML('afterbegin','<p>FIG belum dimuat. Periksa pc1250-11-data.json (204 FIG).</p>');return;}
 btn.click();
 sections.querySelectorAll('[data-engine-group]').forEach(b=>b.classList.toggle('is-active',b.dataset.engineGroup===id));
}
function setHeading(name){
 const title=document.querySelector('.pc-page-title, #pcCatalogTitle');
 if(title)title.textContent='KOMATSU PC1250-11R — '+name;
}
function activateEngine(){
 if(!ready||!engine.length){console.error('[HEXA Engine] Data belum siap atau 18 FIG tidak ditemukan');return;}
 if(mode!=='engine')hydraulicSections=sections.innerHTML;
 mode='engine';
 if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
 renderEngine();decorateTabs();setHeading(ENGINE);openEngine(engine[0].id);
}
function activateHydraulic(){
 mode='hydraulic';
 if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
 if(hydraulicSections!==null)sections.innerHTML=hydraulicSections;
 sections.style.display='';list.style.display='none';decorateTabs();setHeading(HYD);
 const first=[...list.querySelectorAll('[data-group]')].find(b=>!engine.some(g=>g.id===b.dataset.group));
 if(first)first.click();
}
// Capture event agar handler lama tidak menimpa pilihan Engine.
tabs.addEventListener('click',ev=>{
 const tab=ev.target.closest('.pc-system-tab');if(!tab)return;
 const name=tab.textContent.trim().toUpperCase();
 if(name!==ENGINE&&name!==HYD)return;
 ev.preventDefault();ev.stopImmediatePropagation();
 if(name===ENGINE)activateEngine();else activateHydraulic();
},true);
sections.addEventListener('click',ev=>{
 if(mode!=='engine')return;
 const btn=ev.target.closest('[data-engine-group]');if(!btn)return;
 ev.preventDefault();ev.stopImmediatePropagation();openEngine(btn.dataset.engineGroup);
},true);
// systems.js mengisi tab secara async; pastikan tab Engine tidak tetap disabled.
const observer=new MutationObserver(()=>{decorateTabs();});
observer.observe(tabs,{childList:true});
fetch('pc1250-11-data.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{
 const all=Array.isArray(d.groups)?d.groups:[];
 engine=all.filter(g=>String(g.system||'').trim().toUpperCase()===ENGINE&&g.id&&Array.isArray(g.parts));
 ready=true;decorateTabs();
 console.info('[HEXA Engine] Total FIG:',all.length,'Engine FIG:',engine.length);
 if(engine.length!==18)console.warn('[HEXA Engine] Seharusnya 18 FIG. Periksa JSON utama yang terpasang.');
}).catch(e=>console.error('[HEXA Engine] Gagal membaca JSON:',e));
})();
