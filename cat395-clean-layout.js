/* HEXCatalog CAT 395 — clean layout addon. Does not modify catalog or system logic. */
(()=>{'use strict';
function init(){
 const header=document.querySelector('.cat-title');
 const title=header?.querySelector('h1');
 const tabs=document.getElementById('pcSystemTabs');
 if(!header||!title||!tabs)return;
 const breadcrumb=title.querySelector('small');
 if(!breadcrumb)return;
 const oldBack=document.querySelector('.pc-catalog-heading .pc-back-link');
 if(oldBack){oldBack.classList.add('pc-clean-back');header.appendChild(oldBack);}
 else if(!header.querySelector('.pc-clean-back')){
  const back=document.createElement('a');back.className='pc-clean-back';back.href='hex-catalog.html';back.textContent='←';back.setAttribute('aria-label','Kembali ke Unit Catalog');header.appendChild(back);
 }
 let previous='';
 const update=()=>{
  const active=tabs.querySelector('.pc-system-tab.is-active, .pc-system-tab[aria-current="page"]');
  const name=active?.textContent?.trim()||document.getElementById('pcCurrentSystem')?.textContent?.trim()||'HYDRAULIC SYSTEM';
  if(name!==previous){previous=name;breadcrumb.textContent='/ CAT 395 / '+name;}
 };
 update();
 const observer=new MutationObserver(update);
 observer.observe(tabs,{subtree:true,attributes:true,attributeFilter:['class','aria-current'],childList:true,characterData:true});
 tabs.addEventListener('click',()=>queueMicrotask(update));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();


/* Align the bottom of Assembly Groups with the drawing/parts workspace.
   Measure the actual rendered elements so font, zoom and responsive sizes work. */
(()=>{'use strict';
 function init(){
  const groups=document.querySelector('.cat-layout > .cat-groups');
  const workspace=document.querySelector('.cat-workspace');
  if(!groups||!workspace)return;
  let queued=false;
  function sync(){
   queued=false;
   if(!window.matchMedia('(min-width:851px)').matches){
    groups.style.removeProperty('--cat395-assembly-height');return;
   }
   const top=groups.getBoundingClientRect().top;
   const bottom=workspace.getBoundingClientRect().bottom;
   const height=Math.max(0,Math.round(bottom-top));
   if(height>0)groups.style.setProperty('--cat395-assembly-height',height+'px');
  }
  function queue(){if(!queued){queued=true;requestAnimationFrame(sync);}}
  queue();
  window.addEventListener('resize',queue,{passive:true});
  if('ResizeObserver' in window){
   const ro=new ResizeObserver(queue);
   ro.observe(workspace);
  }
  const tabs=document.getElementById('pcSystemTabs');
  if(tabs){tabs.addEventListener('click',queue);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
