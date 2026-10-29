/* HEXA shared catalog bridge — Start Inspection, Daily Outstanding, Unit History */
(()=>{'use strict';
const catalogs=[
 {label:'CAT 395',url:'cat395-catalog.html',re:/\b(?:CAT\s*395|395)\b/i},
 {label:'Komatsu PC1250-11',url:'pc1250-11-catalog.html',re:/PC\s*1250[-\s]*(?:11|11R)\b/i},
 {label:'SANY SY500H',url:'sany-sy500h-catalog.html',re:/SY\s*500H\b/i},
 {label:'Komatsu D375A-6R',url:'d375-catalog.html',re:/D375/i},
 {label:'Komatsu D85ESS-2',url:'d85-catalog.html',re:/D85/i}
];
const isStart=!!document.getElementById('inspectionForm');
const add=document.getElementById(isStart?'addPartButton':'updateAddPartButton');
const list=document.getElementById(isStart?'partRequirementList':'updatePartRequirementList');
if(!add||!list)return;
const area=add.parentElement;
area.classList.add('hexa-catalog-actions');
if(area.querySelector('.hexa-catalog-browse'))return;
const browse=document.createElement('button');browse.type='button';browse.className='hexa-catalog-browse';browse.textContent='Browse HEXCatalog';area.appendChild(browse);
let active=null;
function close(){if(!active)return;active.overlay.remove();document.body.style.overflow=active.overflow;active=null;}
function unitModel(){
 let text='';
 if(isStart){const code=document.getElementById('unitCode')?.value||'';
 const units=typeof startInspectionUnits!=='undefined'?startInspectionUnits:[];
 const item=units.find(u=>u.unitCode===code);text=[code,item?.egi].filter(Boolean).join(' ');
 }else{
 const field=document.getElementById('updateUnitCode');const code=field?.value||'';
 text=[code,field?.selectedOptions?.[0]?.textContent].filter(Boolean).join(' ');
 }
 return catalogs.find(c=>c.re.test(text));
}
function value(row,selector){return row.querySelector(selector)?.value.trim()||'';}
const classes=isStart?{row:'.part-requirement-item',name:'.part-description-input',pn:'.part-no-input',qty:'.part-quantity-input'}:{row:'.update-part-requirement-item',name:'.update-part-description-input',pn:'.update-part-no-input',qty:'.update-part-quantity-input'};
function rows(){return [...list.querySelectorAll(classes.row)];}
function write(input,v){if(!input)return;input.value=v;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
function applyParts(parts){let added=0;for(const part of parts){
 const pn=String(part.pn||'').trim();if(!pn)continue;
 const description=String(part.description||'').trim();const qty=Math.max(1,Math.min(9999,parseInt(part.needed,10)||1));
 let row=rows().find(r=>value(r,classes.pn).toUpperCase()===pn.toUpperCase());
 if(row){if(confirm('Part '+pn+' sudah ada. Tambahkan Qty '+qty+'?'))write(row.querySelector(classes.qty),String((parseInt(value(row,classes.qty),10)||0)+qty));continue;}
 row=rows().find(r=>!value(r,classes.pn)&&!value(r,classes.name));
 if(!row){add.click();row=rows().at(-1);}
 if(!row)continue;
 write(row.querySelector(classes.name),description);write(row.querySelector(classes.pn),pn);write(row.querySelector(classes.qty),String(qty));added++;
 }return added;}
function makeToken(){const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');}
browse.addEventListener('click',()=>{
 if(active)return;
 const token=makeToken(),overflow=document.body.style.overflow;
 const overlay=document.createElement('div');overlay.className='hexa-catalog-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','HEXCatalog');
 const bar=document.createElement('div');bar.className='hexa-catalog-bar';
 const title=document.createElement('strong');title.textContent='HEXCatalog';
 const picker=document.createElement('select');picker.setAttribute('aria-label','Pilih model katalog');picker.add(new Option('Pilih model katalog',''));
 catalogs.forEach(c=>picker.add(new Option(c.label,c.url)));
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='✕ Close Catalog';cancel.addEventListener('click',close);
 bar.append(title,picker,cancel);
 const frame=document.createElement('iframe');frame.title='HEXCatalog';frame.className='hexa-catalog-frame';
 function openModel(url){const model=catalogs.find(c=>c.url===url);if(!model)return;frame.removeAttribute('srcdoc');title.textContent='HEXCatalog — '+model.label;frame.src=model.url+'?'+new URLSearchParams({hexaReturn:'registration',hexaEmbed:'1',hexaToken:token});}
 picker.addEventListener('change',()=>openModel(picker.value));
 overlay.append(bar,frame);document.body.appendChild(overlay);document.body.style.overflow='hidden';
 active={token,overlay,frame,overflow};
 const suggested=unitModel();if(suggested){picker.value=suggested.url;openModel(suggested.url);}else frame.srcdoc='<p style="font:16px Arial;padding:32px;text-align:center">Pilih model katalog pada menu di atas.</p>';
});
window.addEventListener('message',event=>{
 const entry=active,data=event.data;
 if(!entry||event.origin!==location.origin||event.source!==entry.frame.contentWindow||!data||data.type!=='HEXA_CATALOG_SELECTED_PARTS_V1'||data.token!==entry.token||!Array.isArray(data.parts)||data.parts.length>200)return;
 const parts=data.parts.filter(p=>p&&typeof p.pn==='string'&&p.pn.length<=100&&typeof p.description==='string'&&p.description.length<=300);
 // Review the exact payload before writing to any database-bound form.
 const preview=parts.map((p,i)=>`${i+1}. ${p.pn} | ${p.description} | Qty ${p.needed||1}`).join('\n');
 if(!parts.length || !window.confirm('Periksa data yang dikirim HEXCatalog sebelum mengisi form:\n\n'+preview+'\n\nApakah seluruh part sudah sesuai dengan pilihan di katalog?')) return;
 const count=applyParts(parts);
 entry.frame.contentWindow.postMessage({type:'HEXA_CATALOG_IMPORT_ACK_V1',token:entry.token},location.origin);
 close();if(count)alert(count+' part masuk ke form. Periksa Qty lalu simpan melalui tombol form.');
});
})();
