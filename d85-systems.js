/* D85ESS-2 systems adapter — original 11R layout, no UI redesign. */
(()=>{'use strict';
const tabs=document.getElementById('pcSystemTabs');
const sections=document.getElementById('pcSectionList');
const list=document.getElementById('groupList');
const search=document.getElementById('groupSearch');
const breadcrumb=document.querySelector('.cat-title h1 small');
if(!tabs||!sections||!list)return;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data=[],current='';
const norm=s=>String(s??'').trim().toUpperCase();
function displayGroups(){
 const gs=data.filter(g=>norm(g.system)===norm(current));
 sections.innerHTML=gs.map(g=>`<button type="button" class="pc-section-btn" data-addon-group="${escape(g.id)}"><span>${escape(g.name)}</span><small>${(g.parts||[]).length} part</small></button>`).join('');
 sections.style.display='';list.style.display='none';
 if(!gs.length)sections.textContent='Assembly belum tersedia untuk sistem ini.';
 return gs;
}
function open(id){
 const btn=[...list.querySelectorAll('[data-group]')].find(x=>x.dataset.group===id);
 if(!btn)return false;
 btn.click();
 sections.querySelectorAll('[data-addon-group]').forEach(x=>x.classList.toggle('is-active',x.dataset.addonGroup===id));
 return true;
}
function activate(system){
 current=system;
 if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
 tabs.querySelectorAll('.pc-system-tab').forEach(t=>{
  const active=t.dataset.system===current;
  t.classList.toggle('is-active',active);
  if(active)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');
 });
 if(breadcrumb)breadcrumb.textContent='/ D85ESS-2 / '+current;
 const activeSystem=document.getElementById('pcCurrentSystem');
 if(activeSystem)activeSystem.textContent=current;
 const gs=displayGroups();
 if(gs.length)open(gs[0].id);else{const t=document.getElementById('groupTitle');if(t)t.textContent='Belum ada assembly';const c=document.getElementById('groupCount');if(c)c.textContent='0 part';const b=document.getElementById('partsBody');if(b)b.innerHTML='';const area=document.getElementById('drawingArea');if(area){const stage=area.querySelector('.cat-viewer-stage');if(stage){stage.replaceChildren();stage.dataset.message='Assembly belum tersedia untuk sistem ini.';}}}
}
tabs.addEventListener('click',e=>{
 const btn=e.target.closest('.pc-system-tab');
 if(btn)activate(btn.dataset.system);
});
sections.addEventListener('click',e=>{
 const btn=e.target.closest('[data-addon-group]');
 if(btn){e.preventDefault();open(btn.dataset.addonGroup);}
});
search?.addEventListener('input',()=>{
 const hasQuery=Boolean(search.value.trim());
 sections.style.display=hasQuery?'none':'';
 list.style.display=hasQuery?'':'none';
});
fetch('d85-data.json').then(r=>{
 if(!r.ok)throw Error('HTTP '+r.status);
 return r.json();
}).then(d=>{
 data=d.groups||[];
 const systems=(d.systems||[...new Set(data.map(g=>g.system))]).filter(Boolean);
 tabs.innerHTML=systems.map(s=>`<button type="button" class="pc-system-tab" data-system="${escape(s)}">${escape(s)}</button>`).join('');
 // The original 11R main JS renders groupList independently from this adapter.
 const first=systems.find(s=>norm(s)==='ENGINE')||systems[0];
 const awaitList=()=>{
  if(!list.querySelector('[data-group]'))return false;
  activate(first);return true;
 };
 if(!awaitList()){
  const obs=new MutationObserver(()=>{
   if(awaitList())obs.disconnect();
  });
  obs.observe(list,{childList:true});
 }
}).catch(err=>{
 console.error('D85ESS-2 systems:',err);
 sections.textContent='Gagal memuat sistem. Periksa d85-data.json.';
});
})();
