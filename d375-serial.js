/* D375 SN labels: separate unit/engine serial, sourced from JSON. */
(()=>{'use strict';
let groups=[];const title=document.getElementById('groupTitle');const body=document.getElementById('partsBody');
if(!title||!body)return;
const panel=document.querySelector('.cat-detail-head');const bar=document.createElement('div');bar.className='d375-sn-info';
if(panel)panel.insertAdjacentElement('afterend',bar);
fetch('d375-data.json').then(r=>r.json()).then(d=>{groups=d.groups||[];refresh();}).catch(console.error);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
let running=false;
function refresh(){if(running)return;running=true;queueMicrotask(()=>{running=false;
const id=document.querySelector('#groupList .cat-group-btn.active')?.dataset.group;
const g=groups.find(x=>x.id===id)||groups.find(x=>x.name===title.textContent.trim());if(!g){bar.textContent='';return;}
const snU=g.unitSN||'Tidak tercantum pada assembly';const snE=g.engineSN||'Tidak tercantum pada assembly';
bar.innerHTML='<span><b>Unit SN:</b> '+esc(snU)+'</span><span><b>Engine SN:</b> '+esc(snE)+'</span>'+(g.engineModel?'<span><b>Engine:</b> '+esc(g.engineModel)+'</span>':'')+'<small>Periksa batas SN pada setiap part sebelum pemesanan.</small>';
for(const row of body.querySelectorAll('tr[data-index]')){const i=Number(row.dataset.index),p=g.parts?.[i];if(!p)continue;
const sn=p.serialNumber||'Tidak tercantum';row.title='Berlaku untuk SN pada PDF: '+sn+(p.variantOf?' | Varian indeks '+p.variantOf:'');
const cell=row.children[1];if(cell){let mark=cell.querySelector('.d375-part-sn');if(!mark){mark=document.createElement('small');mark.className='d375-part-sn';cell.appendChild(mark);}mark.textContent='SN: '+sn;}
}
});}
new MutationObserver(refresh).observe(title,{childList:true,characterData:true,subtree:true});
new MutationObserver(refresh).observe(body,{childList:true});
document.getElementById('groupList')?.addEventListener('click',()=>queueMicrotask(refresh));
})();