/* HEXA KPI Upload Adapter v3: jenis/periode eksplisit, tanpa prompt. */
(function(){
'use strict';
const API_URL='https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
const BYTES_PER_CHUNK=180000, MAX_BYTES=20*1024*1024;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function request(payload,retries=0){
 let last;
 for(let i=0;i<=retries;i++){
  try{
   const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
   if(!response.ok)throw new Error('HTTP '+response.status);
   const data=await response.json();
   if(!data||data.success!==true)throw new Error(data&&(data.message||data.error)||'Respons API tidak valid');
   return data;
  }catch(e){last=e;const net=e instanceof TypeError||/Failed to fetch|NetworkError/i.test(String(e.message));if(!net||i===retries)break;await wait(1000*(i+1));}
 }
 throw last;
}
function encode(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Gagal membaca file'));reader.readAsDataURL(blob);});}
function base(){let user;try{user=JSON.parse(sessionStorage.getItem('hexaUser')||'null');}catch(e){}if(!user||!user.uniqId)throw new Error('Silakan login ulang');return {userId:user.uniqId};}
window.HEXA_KPI_GET_HISTORY=()=>request({...base(),action:'kpiGetUploadHistory'});
window.HEXA_KPI_UPLOAD_ADAPTER=async function(file,onStage,options){
 if(!file||!/\.xlsx$/i.test(file.name)||file.size<1||file.size>MAX_BYTES)throw new Error('File harus XLSX, maksimal 20 MB');
 const opts=options||{},reportType=String(opts.reportType||'').toUpperCase(),year=Number(opts.year),month=Number(opts.month);
 if(!['REDO','ACHIEVEMENT'].includes(reportType))throw new Error('Jenis laporan wajib dipilih');
 if(!Number.isInteger(year)||year<2020||year>2100||!Number.isInteger(month)||month<1||month>12)throw new Error('Periode tidak valid');
 const user=base();
 const start=await request({...user,action:'kpiBeginUpload',fileName:file.name,fileSize:file.size,reportType,year,month});
 const count=Math.ceil(file.size/BYTES_PER_CHUNK);
 for(let i=0;i<count;i++){
  const chunk=await encode(file.slice(i*BYTES_PER_CHUNK,Math.min(file.size,(i+1)*BYTES_PER_CHUNK)));
  await request({...user,action:'kpiAppendUpload',uploadId:start.uploadId,index:i,chunk},2);
  if(onStage)onStage('uploading',Math.floor((i+1)/count*95));
 }
 if(onStage)onStage('saving',96);
 const commit={...user,action:'kpiCommitUpload',uploadId:start.uploadId,totalChunks:count,replacePeriod:false};
 try{return await request(commit);}catch(e){
  if(/sudah ada|penggantian/i.test(String(e.message))){
   if(window.confirm('Arsip '+reportType+' periode '+year+'-'+String(month).padStart(2,'0')+' sudah ada. Ganti arsip aktif? Arsip lama tidak dihapus.'))return request({...commit,replacePeriod:true});
  }
  throw e;
 }
};
})();
