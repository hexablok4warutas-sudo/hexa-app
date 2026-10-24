/* HEXA PC1250-11R system navigation: original PDF contents order. */
(()=>{'use strict';
 const tabs=document.getElementById('pcSystemTabs'),sectionsEl=document.getElementById('pcSectionList');
 if(!tabs||!sectionsEl)return;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let index=null,activeSection=null;
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
   const n=s.figures.length;
   return `<button type="button" class="pc-section-btn ${activeSection===s.name?'is-active':''}" data-section="${escape(s.name)}"><span>${escape(s.name)}</span><small>${n} FIG</small></button>`;
  }).join('');
 }
 function renderSystemTabs(data){
  tabs.innerHTML=data.systems.map(s=>`<button type="button" class="pc-system-tab ${s.enabled?'is-active':''}" ${s.enabled?'aria-current="page"':'disabled title="Sistem belum tersedia"'}>${escape(s.name)}</button>`).join('');
  const current=tabs.querySelector('.is-active');
  if(current)requestAnimationFrame(()=>current.scrollIntoView({block:'nearest',inline:'center'}));
 }
 sectionsEl.addEventListener('click',e=>{
  const btn=e.target.closest('[data-section]');if(!btn)return;
  activeSection=btn.dataset.section;renderSections();
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
  fetch('pc1250-11-hydraulic-index.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()})
 ]).then(([sys,idx])=>{index=idx;renderSystemTabs(sys);renderSections();updateSearchMode()}).catch(err=>{console.error('PC1250 system index:',err);sectionsEl.textContent='Indeks sistem belum tersedia. Pastikan file JSON tambahan sudah diupload.'});
})();
