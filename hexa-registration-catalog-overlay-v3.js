/* HEXA — HEXCatalog bridge for Backlog Registration (V1) */
(()=>{
'use strict';
const TARGET_ORIGIN=location.origin;
const CATALOGS=[
 {label:'CAT 395',url:'cat395-catalog.html',match:/\b(CAT\s*395|395)\b/i},
 {label:'Komatsu PC1250-11',url:'pc1250-11-catalog.html',match:/PC\s*1250[-\s]*(11|11R)\b/i},
 {label:'SANY SY500H',url:'sany-sy500h-catalog.html',match:/SY\s*500H\b/i},
 {label:'Komatsu D375A-6R',url:'d375-catalog.html',match:/D375/i},
 {label:'Komatsu D85ESS-2',url:'d85-catalog.html',match:/D85/i}
];
function suggestedCatalog(card){
 const unit=card.querySelector('.brf-unit-select');
 const text=[unit?.value,unit?.selectedOptions?.[0]?.textContent,card.dataset.model,card.dataset.unitModel].filter(Boolean).join(' ');
 return CATALOGS.find(c=>c.match.test(text))||null;
}

const itemContainer=document.getElementById('brfItemsContainer');
if(!itemContainer)return;
function token(){const a=new Uint8Array(24);crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('');}
let active=null;
function closeCatalog(){
 if(!active)return;
 const {overlay,button}=active;
 overlay.remove();
 if(button?.isConnected)button.textContent='Browse HEXCatalog';
 active=null;
 document.body.style.overflow='';
}
function addBrowseButton(card){
 const header=card.querySelector('.brf-part-section .brf-subheading');
 if(!header||header.querySelector('.brf-browse-catalog'))return;
 const button=document.createElement('button');button.type='button';button.className='brf-browse-catalog';button.textContent='Browse HEXCatalog';
 button.style.cssText='margin-left:8px;padding:11px 15px;border:1px solid #1762a9;border-radius:10px;background:#fff;color:#135a9f;font-weight:700;cursor:pointer';
 const add=header.querySelector('.brf-add-part-button');(add?.parentElement||header).appendChild(button);
 button.addEventListener('click',()=>{
  if(active){alert('Tutup HEXCatalog yang sedang dibuka terlebih dahulu.');return;}
  const t=token();
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#fff;display:flex;flex-direction:column;';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','HEXCatalog');
  const bar=document.createElement('div');bar.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#101b2c;color:#fff;min-height:50px;gap:12px;';
  const title=document.createElement('strong');title.textContent='HEXCatalog';
  const picker=document.createElement('select');picker.setAttribute('aria-label','Pilih model katalog');
  picker.style.cssText='min-width:150px;max-width:45vw;padding:9px;border-radius:8px;background:#fff;color:#111;';
  const placeholder=new Option('Pilih model katalog','');picker.add(placeholder);
  CATALOGS.forEach(c=>picker.add(new Option(c.label,c.url)));
  const close=document.createElement('button');close.type='button';close.textContent='✕ Close Catalog';close.style.cssText='padding:9px 12px;border-radius:8px;border:1px solid #aaa;background:#fff;color:#111;cursor:pointer';
  close.addEventListener('click',closeCatalog);bar.append(title,picker,close);
  const frame=document.createElement('iframe');frame.title='HEXCatalog Parts Catalog';frame.style.cssText='border:0;flex:1;width:100%;min-height:0;';
  function openModel(url){
   const model=CATALOGS.find(c=>c.url===url);
   if(!model)return;
   frame.title=model.label+' Parts Catalog';
   title.textContent='HEXCatalog — '+model.label;
   const query=new URLSearchParams({hexaReturn:'registration',hexaEmbed:'1',hexaToken:t});
   frame.src=model.url+'?'+query.toString();
  }
  picker.addEventListener('change',()=>openModel(picker.value));
  const suggested=suggestedCatalog(card);
  if(suggested){picker.value=suggested.url;openModel(suggested.url);}
  else {frame.srcdoc='<p style="font:16px Arial;padding:32px;text-align:center">Pilih model katalog pada menu di atas.</p>'; }
  overlay.append(bar,frame);document.body.appendChild(overlay);document.body.style.overflow='hidden';
  active={token:t,card,overlay,frame,button};
  button.textContent='HEXCatalog Open';
 });
}
function ensureButtons(){itemContainer.querySelectorAll('.brf-item-card').forEach(addBrowseButton);}
new MutationObserver(ensureButtons).observe(itemContainer,{childList:true});ensureButtons();
function normalizePN(v){return String(v||'').trim().toUpperCase();}
function applyParts(card,parts){
 const rows=card.querySelector('.brf-parts-container');if(!rows)return 0;
 let count=0;
 for(const p of parts){
   const pn=String(p.pn||'').trim();const name=String(p.description||'').trim();const quantity=Math.max(1,Math.min(9999,parseInt(p.needed,10)||1));
   if(!pn)continue;
   const existing=[...rows.querySelectorAll('.brf-part-row')].find(row=>normalizePN(row.querySelector('.brf-part-no')?.value)===normalizePN(pn));
   if(existing){
     const input=existing.querySelector('.brf-part-qty');
     if(confirm('Part '+pn+' sudah ada. Tambahkan Qty '+quantity+' ke Qty saat ini?'))input.value=Math.min(9999,(parseInt(input.value,10)||1)+quantity);
     continue;
   }
   let row=[...rows.querySelectorAll('.brf-part-row')].find(r=>!r.querySelector('.brf-part-name')?.value.trim()&&!r.querySelector('.brf-part-no')?.value.trim());
   if(!row){addPartRow(card);row=rows.lastElementChild;}
   if(!row)continue;
   row.querySelector('.brf-part-name').value=name;
   row.querySelector('.brf-part-no').value=pn;
   row.querySelector('.brf-part-qty').value=quantity;
   count++;
 }
 return count;
}
window.addEventListener('message',event=>{
 if(event.origin!==TARGET_ORIGIN)return;
 const data=event.data;
 if(!data||data.type!=='HEXA_CATALOG_SELECTED_PARTS_V1'||typeof data.token!=='string')return;
 const entry=active;if(!entry||entry.token!==data.token||event.source!==entry.frame.contentWindow)return;
 if(!itemContainer.contains(entry.card)){alert('Item registrasi asal sudah dihapus.');closeCatalog();return;}
 if(!Array.isArray(data.parts)||data.parts.length>200)return;
 const safe=data.parts.filter(p=>p&&typeof p.pn==='string'&&p.pn.length<=100&&typeof p.description==='string'&&p.description.length<=300);
 const added=applyParts(entry.card,safe);
 entry.frame.contentWindow.postMessage({type:'HEXA_CATALOG_IMPORT_ACK_V1',token:data.token},TARGET_ORIGIN);
 closeCatalog();
 alert(added+' part baru masuk ke Part Requirement. Periksa Qty sebelum menyimpan registrasi.');
});
})();
