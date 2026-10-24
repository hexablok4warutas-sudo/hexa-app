/* HEXCatalog PC1250-11R — clean layout addon. Does not modify catalog or system logic. */
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
  if(name!==previous){previous=name;breadcrumb.textContent='/ PC1250-11R / '+name;}
 };
 update();
 const observer=new MutationObserver(update);
 observer.observe(tabs,{subtree:true,attributes:true,attributeFilter:['class','aria-current'],childList:true,characterData:true});
 tabs.addEventListener('click',()=>queueMicrotask(update));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
