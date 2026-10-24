/* PC1250-11R — Multi-system navigation, no changes to CAT 395. */
(()=>{'use strict';
 const tabs=document.getElementById('pcSystemTabs');
 const sections=document.getElementById('pcSectionList');
 const list=document.getElementById('groupList');
 const search=document.getElementById('groupSearch');
 if(!tabs||!sections)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const engineId='engine-cylinder-head-and-its-related-parts';
 let systems=[],index=null,current='hydraulic-system',currentSection=null;
 const fetchJSON=async url=>{const r=await fetch(url);if(!r.ok)throw Error(url+' HTTP '+r.status);return r.json()};
 function updateVisibility(){const searching=!!search?.value.trim();
   sections.style.display=searching?'none':(current==='hydraulic-system'?'':'none');
   if(list)list.style.display=searching||current!== 'hydraulic-system'||!!currentSection?'':'none';
 }
 function renderTabs(){tabs.innerHTML=systems.map(s=>`<button type="button" data-system="${esc(s.id)}" class="pc-system-tab ${current===s.id?'is-active':''}" ${s.enabled?'':'disabled title="Sistem belum tersedia"'} ${current===s.id?'aria-current="page"':''}>${esc(s.name)}</button>`).join('');}
 function renderSections(){if(current!=='hydraulic-system'||!index?.sections){sections.replaceChildren();return;}
  sections.innerHTML=index.sections.map(s=>`<button type="button" class="pc-section-btn ${currentSection===s.name?'is-active':''}" data-section="${esc(s.name)}"><span>${esc(s.name)}</span><small>${s.figures?.length||0} FIG</small></button>`).join('');
 }
 function switchSystem(id){const s=systems.find(x=>x.id===id&&x.enabled);if(!s)return;
  current=id;currentSection=null;renderTabs();renderSections();
  window.HEXA_PC1250_CATALOG?.setSystem(id);updateVisibility();
 }
 tabs.addEventListener('click',e=>{const b=e.target.closest('[data-system]');if(b)switchSystem(b.dataset.system)});
 sections.addEventListener('click',e=>{const b=e.target.closest('[data-section]');if(!b)return;
  const section=index?.sections?.find(x=>x.name===b.dataset.section);if(!section)return;
  currentSection=section.name;renderSections();
  window.HEXA_PC1250_CATALOG?.setSection((section.figures||[]).map(x=>x.fig));updateVisibility();
 });
 search?.addEventListener('input',updateVisibility);
 Promise.allSettled([fetchJSON('pc1250-11-systems.json'),fetchJSON('pc1250-11-hydraulic-index.json')]).then(results=>{
  if(results[0].status!=='fulfilled'){sections.textContent='Gagal memuat pc1250-11-systems.json';return;}
  systems=results[0].value.systems||[];
  systems=systems.map(s=>({...s,enabled:s.id===engineId||s.id==='hydraulic-system'?true:!!s.enabled}));
  if(results[1].status==='fulfilled')index=results[1].value;
  renderTabs();renderSections();updateVisibility();
  if(window.HEXA_PC1250_CATALOG)switchSystem(current);
  else window.addEventListener('hexa-pc1250-data-ready',()=>switchSystem(current),{once:true});
 }).catch(console.error);
})();
