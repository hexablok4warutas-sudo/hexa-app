"use strict";
/* HEXA KPI Data Management - dua file, satu tombol, upload berurutan. */
(function(){
const $=id=>document.getElementById(id), MAX=20*1024*1024;
const selected={ACHIEVEMENT:null,REDO:null};let busy=false;
const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function notice(s,kind=''){$('kpiNotice').textContent=s;$('kpiNotice').className='kpi-notice '+kind;}
function refreshButton(){$('kpiUploadButton').disabled=busy||!selected.ACHIEVEMENT||!selected.REDO;}
function choose(type,file){if(busy||!file)return;
 if(!/\.xlsx$/i.test(file.name)||!file.size||file.size>MAX){notice('File '+type+' harus XLSX dan maksimal 20 MB.','error');return;}
 selected[type]=file;const key=type==='REDO'?'Redo':'Achievement';
 $('kpi'+key+'Selected').hidden=false;$('kpi'+key+'Name').textContent=file.name;
 $('kpi'+key+'Meta').textContent=(file.size/1048576).toFixed(2)+' MB • Siap upload';
 $('kpi'+key+'Status').textContent='Siap diupload';$('kpi'+key+'Status').className='kpi-row-status';
 notice('Kedua file harus dipilih sebelum upload.');refreshButton();}
function clear(type){if(busy)return;const key=type==='REDO'?'Redo':'Achievement';selected[type]=null;$('kpi'+key+'Input').value='';$('kpi'+key+'Selected').hidden=true;$('kpi'+key+'Status').textContent='Belum dipilih';$('kpi'+key+'Status').className='kpi-row-status';refreshButton();}
function overlay(){ $('kpiProgressOverlay').hidden=false;$('kpiProgressClose').hidden=true;$('kpiNutVisual').className='kpi-nut-visual processing';$('kpiProgressBar').style.width='0%';$('kpiProgressTitle').textContent='';$('kpiProgressText').textContent='';}
function progress(percent,text){$('kpiProgressBar').style.width=Math.min(99,Math.max(0,percent))+'%';$('kpiProgressText').textContent=text;}
function finish(ok,text){$('kpiNutVisual').className='kpi-nut-visual '+(ok?'success':'failure');$('kpiResultPath').setAttribute('d',ok?'M5 12l4 4L19 6':'M6 6l12 12M18 6L6 18');$('kpiProgressTitle').textContent=ok?'Arsip berhasil disimpan':'Upload belum lengkap';$('kpiProgressText').textContent=text;$('kpiProgressBar').style.width=ok?'100%':'0%';$('kpiProgressClose').hidden=false;}
function rowStatus(type,text,kind=''){const el=$('kpi'+(type==='REDO'?'Redo':'Achievement')+'Status');el.textContent=text;el.className='kpi-row-status '+kind;}
async function loadHistory(){if(typeof window.HEXA_KPI_GET_HISTORY!=='function')return;
 try{const result=await window.HEXA_KPI_GET_HISTORY();const list=(result.history||[]).filter(x=>x.status!=='FILE_MISSING');
  const latest=list.slice(0,2);if(!latest.length)return;
  $('kpiSourceTitle').textContent='Arsip KPI tersedia';$('kpiSourceDetail').textContent=latest.map(x=>(x.reportType||'')+' • '+x.fileName).join(' | ');
  $('kpiSourceStatus').textContent='Archived';$('kpiSourceStatus').classList.add('connected');
 }catch(e){$('kpiSourceDetail').textContent='Riwayat belum dapat dimuat: '+e.message;}}
async function upload(){if(busy||!selected.ACHIEVEMENT||!selected.REDO)return;
 const year=Number($('kpiYear').value),month=Number($('kpiMonth').value);
 if(!Number.isInteger(year)||year<2020||year>2100||!Number.isInteger(month)||month<1||month>12){notice('Bulan/tahun tidak valid.','error');return;}
 if(typeof window.HEXA_KPI_UPLOAD_ADAPTER!=='function'){notice('Adapter upload tidak ditemukan.','error');return;}
 busy=true;refreshButton();['Achievement','Redo'].forEach(key=>{$('kpi'+key+'Remove').disabled=true;$('kpi'+key+'Choose').disabled=true;});overlay();
 let completed=0;
 try{
  for(const type of ['ACHIEVEMENT','REDO']){
   const label=type==='REDO'?'Redo DM':'DM Achievement';rowStatus(type,'Mengupload...');
   const result=await window.HEXA_KPI_UPLOAD_ADAPTER(selected[type],(stage,pc)=>progress(completed*50+pc*.5,'Mengupload '+label+'...'),{reportType:type,year,month});
   if(!result||result.success!==true||result.archived!==true)throw new Error('Server belum mengonfirmasi arsip '+label);
   completed++;rowStatus(type,'Arsip tersimpan','ok');progress(completed*50,label+' berhasil diarsipkan');
  }
  finish(true,'Kedua Excel berhasil diarsipkan. Sinkronisasi angka KPI belum dijalankan.');
  notice('Kedua Excel berhasil diarsipkan; menunggu sinkronisasi backend.','ok');await loadHistory();
 }catch(e){finish(false,e.message+' • '+completed+' dari 2 file berhasil. Jangan ulangi file yang sudah berhasil tanpa memeriksa riwayat.');notice('Upload terhenti: '+e.message,'error');if(completed===1)rowStatus('REDO','Belum berhasil','error');}
 finally{busy=false;refreshButton();['Achievement','Redo'].forEach(key=>{$('kpi'+key+'Remove').disabled=false;$('kpi'+key+'Choose').disabled=false;});}
}
document.addEventListener('DOMContentLoaded',()=>{
 const logged=sessionStorage.getItem('hexaLoggedIn');let user;try{user=JSON.parse(sessionStorage.getItem('hexaUser')||'null');}catch(e){}
 if(logged!=='true'||!user||!user.uniqId){location.replace('index.html');return;}
 if(Number(user.kode)!==1){alert('Hanya Master yang dapat mengakses halaman ini.');location.replace('main.html');return;}
 document.body.classList.add('theme-blue');$('kpiBack').addEventListener('click',()=>location.href='system-settings.html');
 const now=new Date();$('kpiYear').value=now.getFullYear();months.forEach((name,i)=>{const opt=document.createElement('option');opt.value=String(i+1);opt.textContent=name;$('kpiMonth').appendChild(opt);});$('kpiMonth').value=String(now.getMonth()+1);
 for(const type of ['ACHIEVEMENT','REDO']){
  const key=type==='REDO'?'Redo':'Achievement',input=$('kpi'+key+'Input'),zone=$('kpi'+key+'Choose');
  zone.addEventListener('click',()=>input.click());input.addEventListener('change',()=>choose(type,input.files[0]));$('kpi'+key+'Remove').addEventListener('click',()=>clear(type));
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragover');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragover'));
  zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragover');choose(type,e.dataTransfer.files[0]);});
 }
 $('kpiUploadButton').addEventListener('click',upload);$('kpiProgressClose').addEventListener('click',()=>{if(!busy)$('kpiProgressOverlay').hidden=true;});
 notice('Pilih kedua file Excel untuk periode yang sama.');loadHistory();
});
})();
