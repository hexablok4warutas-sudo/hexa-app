"use strict";
const BC_API='https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
if(sessionStorage.getItem('hexaLoggedIn')!=='true'||!sessionStorage.getItem('hexaUser'))location.replace('index.html');
let bcUser={};try{bcUser=JSON.parse(sessionStorage.getItem('hexaUser')||'{}')}catch(e){location.replace('index.html')}
const $=id=>document.getElementById(id);
const BC_COLUMNS=[['E','CN UNIT'],['F','Backlog Date'],['G','Trouble Description'],['I','Part No'],['J','Part Description'],['K','Qty'],['N','Status Part'],['O','STATUS WO'],['P','Work Order'],['X','Aging WO (Day)'],['D','No'],['H','Material No'],['L','DEL'],['M','SOH'],['Q','RESV'],['R','Posting Date'],['S','PRICE (S)'],['T','PR No'],['U','PR Date'],['V','PO No'],['W','PO Date'],['Y','Aging PO (Day)'],['Z','CHECK'],['AA','POSTING'],['AB','TOTAL ORDER'],['AC','TOTAL POSTING'],['AF','STATUS'],['AG','Del'],['AH','PRICE (AH)'],['AI','PRICE (AI)']];
const BC_DEFAULT=BC_COLUMNS.slice(0,10).map(c=>c[0]);
const BC_KEY='hexaBacklogControlColumns';
let bcVisible=BC_DEFAULT.slice();try{let a=JSON.parse(localStorage.getItem(BC_KEY));if(Array.isArray(a)&&a.length)bcVisible=a.filter(x=>BC_COLUMNS.some(c=>c[0]===x))}catch(e){}
let bcRows=[],bcFiltered=[],bcPage=0,bcSize=50,bcUploadRows=null,bcBatchId='',bcCommitted=false;
const bcEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bcLabel=k=>(BC_COLUMNS.find(c=>c[0]===k)||[k,k])[1];
const bcCanUploadLocal=()=>{const role=String(bcUser.level??bcUser.LEVEL??bcUser.Level??bcUser.role??bcUser.ROLE??'').trim().toUpperCase();return ['1','2','3','4','MASTER','SECTION','SECTION HEAD','SECTION_HEAD','GROUP LEADER','GROUP LEADER','GROUP_LEADER','GL','ADMIN'].includes(role);};
const bcUserId=()=>String(bcUser.uniqId||bcUser.UNIQ_ID||bcUser.uniqID||bcUser.id||bcUser.userId||'').trim();
async function bcApi(action,rest={}){const r=await fetch(BC_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,userId:bcUserId(),...rest})});const x=await r.json();if(!x.success)throw Error(x.message||'Gagal menghubungi server');return x}
function bcToggle(id){$(id).hidden=!$(id).hidden}
let bcFilterRules=[];
let bcFilterSerial=0;
function bcFilterOptions(field){return [...new Set(bcRows.map(r=>String(r[field]??'').trim()))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'id',{numeric:true}));}
function bcDrawFilters(){
 $('bcFilterRows').innerHTML=bcFilterRules.map(rule=>{
  const options=BC_COLUMNS.map(([k,n])=>`<option value="${k}" ${rule.field===k?'selected':''}>${bcEsc(n)}</option>`).join('');
  const values=bcFilterOptions(rule.field);
  const choices='<option value="">Semua nilai</option>'+values.map(v=>`<option value="${bcEsc(v)}" ${rule.value===v?'selected':''}>${bcEsc(v)}</option>`).join('');
  return `<div class="bc-filter-row" data-filter-id="${rule.id}"><select class="bc-filter-field" aria-label="Pilih header tabel">${options}</select><select class="bc-filter-value" aria-label="Pilih nilai filter">${choices}</select><button type="button" class="bc-filter-remove" title="Hapus filter" aria-label="Hapus filter">✕</button></div>`;
 }).join('');
}
function bcFilters(){bcDrawFilters()}
function bcApply(){
 const q=$('bcSearch').value.toLowerCase().trim();
 bcFiltered=bcRows.filter(r=>(!q||Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)))&&bcFilterRules.every(rule=>!rule.value||String(r[rule.field]??'').trim()===rule.value));
 bcPage=0;bcRender();
}
function bcRender(){const columns=BC_COLUMNS.filter(c=>bcVisible.includes(c[0]));$('bcThead').innerHTML='<tr>'+columns.map(c=>`<th>${bcEsc(c[1])}</th>`).join('')+'</tr>';const start=bcPage*bcSize;let rows=bcFiltered.slice(start,start+bcSize);$('bcTbody').innerHTML=rows.length?rows.map((r,i)=>`<tr data-i="${start+i}">`+columns.map(([k])=>`<td title="${bcEsc(r[k]||'')}">${k==='N'||k==='O'?`<span class="bc-tag ${/ready|available|stock|siap/i.test(r[k]||'')?'ready':/waiting|open|pending/i.test(r[k]||'')?'wait':''}">${bcEsc(r[k]||'—')}</span>`:bcEsc(r[k]||'—')}</td>`).join('')+'</tr>').join(''):'<tr><td colspan="'+columns.length+'">Tidak ada data</td></tr>';$('bcCount').textContent=bcFiltered.length.toLocaleString('id-ID')+' records';$('bcPage').textContent=`${bcFiltered.length?start+1:0}–${Math.min(start+bcSize,bcFiltered.length)} / ${bcFiltered.length}`;$('bcPrev').disabled=bcPage===0;$('bcNext').disabled=start+bcSize>=bcFiltered.length;let stats=[['Total Records',bcRows.length],['Waiting Part',bcRows.filter(r=>/waiting|order|indent/i.test(r.N||'')).length],['Part Ready',bcRows.filter(r=>/ready|available|stock|siap/i.test(r.N||'')).length],['WO Open',bcRows.filter(r=>/open/i.test(r.O||'')).length]];$('bcStats').innerHTML=stats.map(([a,b])=>`<div class="bc-stat"><span>${a}</span><strong>${b.toLocaleString('id-ID')}</strong></div>`).join('')}
function bcShowDetail(row){$('bcDetailBody').innerHTML=BC_COLUMNS.map(([k,n])=>`<div><small>${bcEsc(n)}</small><strong>${bcEsc(row[k]||'—')}</strong></div>`).join('');$('bcDetail').showModal()}
function bcDrawColumns(){$('bcColumnChoices').innerHTML=BC_COLUMNS.map(([k,n])=>`<label><input type="checkbox" data-col="${k}" ${bcVisible.includes(k)?'checked':''}>${bcEsc(n)}</label>`).join('')}
async function bcLoad(){try{const r=await bcApi('getBacklogControl');bcRows=r.rows||[];$('bcUpdated').textContent=r.updatedAt?'Data terakhir diperbarui: '+r.updatedAt:'Belum ada file Backlog Control yang diupload';bcFilters();bcApply();$('bcSourceCard').hidden=!bcCanUploadLocal()}catch(e){$('bcCount').textContent='Data belum tersedia';$('bcUpdated').textContent='Tidak dapat mengambil data dari server: '+e.message;bcRows=[];bcFilters();bcApply()}}
function bcExcelCell(v){if(v==null)return '';if(v instanceof Date)return v.toISOString().slice(0,10);return String(v).trim()}
$('bcBack').addEventListener('click',()=>window.location.assign('./backlog-monitoring.html'));$('bcSearchBtn').onclick=()=>{bcToggle('bcSearchPanel');if(!$('bcSearchPanel').hidden)$('bcSearch').focus()};$('bcFilterBtn').onclick=()=>bcToggle('bcFilterPanel');$('bcColumnsBtn').onclick=()=>bcToggle('bcColumnsPanel');$('bcSearch').oninput=bcApply;$('bcFilterRows').addEventListener('change',e=>{
 const row=e.target.closest('[data-filter-id]');if(!row)return;
 const rule=bcFilterRules.find(x=>x.id===Number(row.dataset.filterId));if(!rule)return;
 if(e.target.classList.contains('bc-filter-field')){rule.field=e.target.value;rule.value='';bcDrawFilters()}else if(e.target.classList.contains('bc-filter-value')){rule.value=e.target.value}
 bcApply();
});
$('bcFilterRows').addEventListener('click',e=>{if(!e.target.closest('.bc-filter-remove'))return;const row=e.target.closest('[data-filter-id]');bcFilterRules=bcFilterRules.filter(r=>r.id!==Number(row.dataset.filterId));bcDrawFilters();bcApply()});
$('bcAddFilter').onclick=()=>{bcFilterRules.push({id:++bcFilterSerial,field:'E',value:''});bcDrawFilters()};
$('bcResetFilter').onclick=()=>{bcFilterRules=[];bcDrawFilters();bcApply()};
$('bcColumnChoices').onchange=e=>{let k=e.target.dataset.col;if(!k)return;let next=e.target.checked?[...bcVisible,k]:bcVisible.filter(v=>v!==k);if(!next.length){e.target.checked=true;return}bcVisible=next;localStorage.setItem(BC_KEY,JSON.stringify(next));bcRender()};$('bcAllColumns').onclick=()=>{bcVisible=BC_COLUMNS.map(c=>c[0]);localStorage.setItem(BC_KEY,JSON.stringify(bcVisible));bcDrawColumns();bcRender()};$('bcResetColumns').onclick=()=>{bcVisible=BC_DEFAULT.slice();localStorage.setItem(BC_KEY,JSON.stringify(bcVisible));bcDrawColumns();bcRender()};$('bcPrev').onclick=()=>{bcPage--;bcRender()};$('bcNext').onclick=()=>{bcPage++;bcRender()};$('bcTbody').onclick=e=>{let tr=e.target.closest('tr[data-i]');if(tr)bcShowDetail(bcFiltered[+tr.dataset.i])};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('bcUploadBtn').onclick=()=>{$('bcFile').click()};
$('bcFile').onchange=async e=>{bcUploadRows=null;bcCommitted=false;$('bcSyncNotice').hidden=true;$('bcCommit').disabled=true;$('bcSync').disabled=true;const f=e.target.files[0];if(!f)return;$('bcUploadDialog').showModal();try{if(!window.XLSX)throw Error('Library pembaca Excel belum tersedia. Periksa koneksi internet.');$('bcUploadStatus').textContent='Membaca Excel...';let wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true});let sheet=wb.Sheets.TRACK||wb.Sheets[wb.SheetNames[0]];if(!sheet)throw Error('Worksheet tidak ditemukan');let data=XLSX.utils.sheet_to_json(sheet,{header:'A',range:7,defval:'',raw:false});let header=XLSX.utils.sheet_to_json(sheet,{header:'A',range:6,defval:'',raw:false})[0]||{};for(let k of ['E','F','G','I','J','K','N','O','P'])if(!String(header[k]||'').trim())throw Error('Header kolom '+k+' tidak ditemukan pada baris 7.');bcUploadRows=data.map(r=>Object.fromEntries(BC_COLUMNS.map(([k])=>[k,bcExcelCell(r[k])]))).filter(r=>r.E&&r.G);if(!bcUploadRows.length)throw Error('Tidak ada record valid.');$('bcPreview').textContent=`File: ${f.name} | ${bcUploadRows.length} record valid | Sheet: ${wb.SheetNames[0]}`;$('bcUploadStatus').textContent='Preview siap. Klik Replace Data untuk mengganti snapshot monitoring.';$('bcCommit').disabled=false}catch(err){$('bcUploadStatus').textContent=err.message}};
$('bcCommit').onclick=async()=>{if(!bcUploadRows)return;const btn=$('bcCommit');btn.disabled=true;try{let start=await bcApi('beginBacklogControlUpload',{fileName:$('bcFile').files[0].name,total:bcUploadRows.length});bcBatchId=start.batchId;const chunk=100;for(let i=0;i<bcUploadRows.length;i+=chunk){$('bcUploadStatus').textContent=`Mengupload ${Math.min(i+chunk,bcUploadRows.length)} / ${bcUploadRows.length}...`;await bcApi('appendBacklogControlUpload',{batchId:bcBatchId,offset:i,rows:bcUploadRows.slice(i,i+chunk)})}let done=await bcApi('commitBacklogControlUpload',{batchId:bcBatchId});bcCommitted=true;$('bcUploadStatus').textContent=`Replace Data berhasil (${done.count} record). Preview sync: ${done.matched} cocok unik, ${done.unmatched} tidak cocok, ${done.ambiguous} ambigu. Tidak ada PARTS_STATUS yang diubah sebelum konfirmasi.`;$('bcSync').disabled=!done.matched;await bcLoad()}catch(e){$('bcUploadStatus').textContent='Upload gagal: '+e.message;btn.disabled=false}};
function bcNotifySync(message,already=false){const notice=$('bcSyncNotice');notice.hidden=false;notice.classList.toggle('info',already);notice.textContent=message;$('bcUploadStatus').textContent=message;$('bcSync').disabled=true;}
$('bcSync').onclick=async()=>{
 if(!bcCommitted||!bcBatchId)return;
 if(!confirm('Konfirmasi memperbarui PARTS_STATUS pada DM DATABASE untuk record yang cocok unik?'))return;
 const button=$('bcSync');button.disabled=true;
 try{
  const r=await bcApi('syncBacklogControlParts',{batchId:bcBatchId});
  if(r.alreadySynced){bcNotifySync(`Batch ini sudah disinkronkan sebelumnya. ${Number(r.updated||0).toLocaleString('id-ID')} record tercatat diperbarui.`,true)}
  else{bcNotifySync(`Sinkronisasi berhasil! ${Number(r.updated||0).toLocaleString('id-ID')} record PARTS_STATUS diperbarui di DM DATABASE.`)}
 }catch(e){
  if(/sudah disinkronkan/i.test(e.message||'')){bcNotifySync('Batch ini sudah disinkronkan sebelumnya. Tidak ada sinkronisasi ulang.',true)}
  else{$('bcUploadStatus').textContent='Sinkronisasi gagal: '+e.message;button.disabled=false}
 }
};
$('bcSourceCard').hidden=!bcCanUploadLocal();bcDrawColumns();bcApply();bcLoad();
