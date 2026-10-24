/* HEXA PC1250-11R system navigation: original PDF contents order. */
(()=>{'use strict';
 const tabs=document.getElementById('pcSystemTabs'),sectionsEl=document.getElementById('pcSectionList');
 if(!tabs||!sectionsEl)return;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let index=null,activeSection=null, activeSystem='hydraulic-system', hydraulicIndex=null, engineIndex=null, config=null;
 const search=document.getElementById('groupSearch');
 const groupList=document.getElementById('groupList');
 function updateSearchMode(){
  const searching=Boolean(search?.value.trim());
  sectionsEl.style.display=searching?'none':'';
  if(groupList)groupList.style.display=searching?'':'none';
 }
 search?.addEventListener('input',updateSearchMode);
 updateSearchMode();
 function renderSections(){
  if(!index)return;
  sectionsEl.innerHTML=index.sections.map(s=>{
   const n=(s.figures||[]).length;
   return `<button type="button" class="pc-section-btn ${activeSection===s.name?'is-active':''}" data-section="${escape(s.name)}"><span>${escape(s.name)}</span><small>${n} FIG</small></button>`;
  }).join('');
 }
 function renderSystemTabs(data){
  config=data;
  tabs.innerHTML=data.systems.map(s=>{
   const enabled=s.id==='hydraulic-system'||s.id==='engine-cylinder-head-and-its-related-parts'?true:!!s.enabled;
   return `<button type="button" data-system="${escape(s.id)}" class="pc-system-tab ${s.id===activeSystem?'is-active':''}" ${enabled?'':'disabled title="Sistem belum tersedia"'} ${s.id===activeSystem?'aria-current="page"':''}>${escape(s.name)}</button>`;
  }).join('');
 }
 function activateSystem(id){
  if(id!=='hydraulic-system'&&id!=='engine-cylinder-head-and-its-related-parts')return;
  activeSystem=id;activeSection=null;
  index=id==='hydraulic-system'?hydraulicIndex:engineIndex;
  if(!index){sectionsEl.textContent='Indeks sistem belum tersedia.';return;}
  renderSystemTabs(config);renderSections();
  if(search)search.value='';
  updateSearchMode();
  const first=index.sections?.[0]?.figures?.[0]?.fig;
  if(first)window.HEXA_PC1250_OPEN_GROUP?.(String(first).toLowerCase());
  if(id==='engine-cylinder-head-and-its-related-parts'){
   const firstButton=sectionsEl.querySelector('[data-section]');
   if(firstButton)firstButton.classList.add('is-active');
  }
 }
 tabs.addEventListener('click',e=>{
  const b=e.target.closest('[data-system]');if(!b||b.disabled)return;
  activateSystem(b.dataset.system);
 });
 sectionsEl.addEventListener('click',e=>{
  const btn=e.target.closest('[data-section]');if(!btn)return;
  activeSection=btn.dataset.section;renderSections();
  if(activeSystem==='engine-cylinder-head-and-its-related-parts'){
   const section=index.sections.find(s=>s.name===activeSection);
   const fig=section?.figures?.[0]?.fig;
   if(fig)window.HEXA_PC1250_OPEN_GROUP?.(String(fig).toLowerCase());
   return;
  }
  // If this assembly already exists in the actual parts DB, open it. Otherwise show reference-only information.
  const groups=[...document.querySelectorAll('#groupList [data-group]')];
  const match=groups.find(x=>x.textContent.toLowerCase().includes(activeSection.toLowerCase()));
  if(match){match.click();return;}
  const sec=index.sections.find(s=>s.name===activeSection);
  const figs=(sec?.figures||[]).map(x=>x.fig).join(', ');
  const title=document.getElementById('groupTitle');if(title)title.textContent=activeSection+' — Referensi PDF';
  const count=document.getElementById('groupCount');if(count)count.textContent=`${sec?.figures.length||0} FIG (data belum diinput)`;
  const hint=document.getElementById('pcSectionStatus');
  if(hint)hint.remove();
  const info=document.createElement('div');info.id='pcSectionStatus';info.className='pc-section-hint';info.textContent='FIG dalam PDF: '+(figs||'Belum teridentifikasi')+'. Pilih assembly pada daftar kiri setelah datanya tersedia.';
  title?.parentElement?.append(info);
 });
 Promise.all([
  fetch('pc1250-11-systems.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}),
  fetch('pc1250-11-hydraulic-index.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}),
  fetch('pc1250-11-engine-cylinder-head-index.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
 ]).then(([s,h,e])=>{
  hydraulicIndex=h;engineIndex=e;index=h;renderSystemTabs(s);renderSections();updateSearchMode();
 }).catch(err=>{console.error('PC1250 system index:',err);sectionsEl.textContent='Indeks sistem belum tersedia. Periksa JSON indeks.'});
})();
