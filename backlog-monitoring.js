"use strict";


// ======================================================
// HEXA BACKLOG MONITORING
// backlog-monitoring.js
// ======================================================


// ======================================================
// 1. SESSION PROTECTION
// ======================================================

const hexaLoggedIn =
  sessionStorage.getItem("hexaLoggedIn");

const hexaUserData =
  sessionStorage.getItem("hexaUser");


if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {

  window.location.replace(
    "index.html"
  );

}


// ======================================================
// 2. CURRENT USER
// ======================================================

let currentUser = null;


try {

  currentUser =
    JSON.parse(hexaUserData);

} catch (error) {

  sessionStorage.removeItem(
    "hexaLoggedIn"
  );

  sessionStorage.removeItem(
    "hexaUser"
  );

  window.location.replace(
    "index.html"
  );

}


// ======================================================
// 3. BACKLOG PAGES
// ======================================================

const BACKLOG_PAGES = {

  "backlog-registration": {
    url: "backlog-registration.html",
    enabled: true
  },

  "backlog-control": {
    url: "backlog-control.html",
    enabled: true
  }

};


// ======================================================
// 4. MENU ITEMS
// ======================================================

const backlogMenuItems =
  document.querySelectorAll(
    ".backlog-menu-item"
  );


// ======================================================
// 5. OPEN BACKLOG PAGE
// ======================================================

function openBacklogPage(menuName) {

  const page =
    BACKLOG_PAGES[menuName];


  if (!page) {

    console.log(
      "Menu Backlog tidak terdaftar:",
      menuName
    );

    return;

  }


  if (page.enabled) {

    window.location.href =
      page.url;

    return;

  }


  console.log(
    "Halaman Backlog belum tersedia:",
    page.url
  );

}


// ======================================================
// 6. MENU CLICK
// ======================================================

backlogMenuItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const menu =
          item.dataset.menu;

        openBacklogPage(menu);

      }
    );

  }
);


// ======================================================
// 7. FLOATING START INSPECTION
// ======================================================

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


if (inspectionShortcut) {

  inspectionShortcut.addEventListener(
    "click",
    function () {

      window.location.href =
        "start-inspection.html";

    }
  );

}


// ======================================================
// 8. INITIALIZE
// ======================================================

function initializeBacklogMonitoring() {

  console.log(
    "HEXA Backlog Monitoring Ready"
  );

}


initializeBacklogMonitoring();

// ======================================================
// BACKLOG PERFORMANCE KPI — read only
// ======================================================
const BC_KPI_API = 'https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
const bcKpiEl = id => document.getElementById(id);
const bcKpiNumber = n => new Intl.NumberFormat('id-ID').format(n);
function bcKpiSet(id,value){const el=bcKpiEl(id);if(el)el.textContent=value;}
function bcKpiUserId(){return String(currentUser?.uniqId||currentUser?.UNIQ_ID||currentUser?.uniqID||currentUser?.id||currentUser?.userId||'').trim();}
async function bcKpiRequest(action,extra={}){
  const response=await fetch(BC_KPI_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,userId:bcKpiUserId(),...extra})});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(!data.success)throw Error(data.message||'Server menolak permintaan');
  return data;
}
function bcKpiStatus(value){bcKpiSet('bcKpiStatus',value);}

const BC_MONTH_NAMES=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
let bcKpiMode='weekly';
let bcKpiGroups=[];
function bcSelectOptions(id,options,selected){
  const el=bcKpiEl(id);el.replaceChildren();
  options.forEach(([value,label])=>{const opt=document.createElement('option');opt.value=String(value);opt.textContent=label;el.append(opt)});
  if(selected!==undefined)el.value=String(selected);
}
function bcDateControls(){
  const today=new Date(),y=today.getFullYear(),m=today.getMonth()+1;
  bcSelectOptions('bcYear',Array.from({length:7},(_,i)=>[y+1-i,String(y+1-i)]),y);
  bcSelectOptions('bcMonth',BC_MONTH_NAMES.map((name,i)=>[i+1,name]),m);
  bcUpdateWeeks();
}
function bcIsoWeekInfo(date){
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
  const day=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-day);
  const isoYear=d.getUTCFullYear();
  const yearStart=new Date(Date.UTC(isoYear,0,1));
  const week=Math.ceil((((d-yearStart)/86400000)+1)/7);
  return {year:isoYear,week,key:isoYear+'-W'+String(week).padStart(2,'0')};
}
function bcWeekOptions(){
  const year=Number(bcKpiEl('bcYear').value),month=Number(bcKpiEl('bcMonth').value);
  const first=new Date(Date.UTC(year,month-1,1));
  const last=new Date(Date.UTC(year,month,0));
  const monday=new Date(first);monday.setUTCDate(first.getUTCDate()-((first.getUTCDay()+6)%7));
  const fmt=d=>`${d.getUTCDate()} ${BC_MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const result=[];
  for(let d=new Date(monday);d<=last;d.setUTCDate(d.getUTCDate()+7)){
    const sunday=new Date(d);sunday.setUTCDate(sunday.getUTCDate()+6);
    const iso=bcIsoWeekInfo(d);
    result.push({key:iso.key,label:`Week ${iso.week} (${fmt(d)} – ${fmt(sunday)})`,from:fmt(d),to:fmt(sunday)});
  }
  return result;
}
function bcUpdateWeeks(){
  const options=bcWeekOptions();
  const current=bcKpiEl('bcWeek').value;
  const now=new Date();
  const todayIso=bcIsoWeekInfo(new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))).key;
  const selected=options.some(w=>w.key===current)?current:(options.some(w=>w.key===todayIso)?todayIso:options[0].key);
  bcSelectOptions('bcWeek',options.map(w=>[w.key,w.label]),selected);
  bcKpiEl('bcWeek').hidden=bcKpiMode!=='weekly';
  ['bcWeeklyBtn','bcMonthlyBtn'].forEach((id,i)=>{
    const on=(i===0)===(bcKpiMode==='weekly');
    bcKpiEl(id).classList.toggle('is-active',on);
    bcKpiEl(id).setAttribute('aria-pressed',String(on));
  });
  const chosen=options.find(w=>w.key===bcKpiEl('bcWeek').value);
  const year=Number(bcKpiEl('bcYear').value),month=Number(bcKpiEl('bcMonth').value);
  bcKpiSet('bcSelectedRange',bcKpiMode==='weekly'
    ?`${chosen.label}`
    :`1–${new Date(year,month,0).getDate()} ${BC_MONTH_NAMES[month-1]} ${year}`);
}
function bcSelectedKey(){
  const y=bcKpiEl('bcYear').value,m=bcKpiEl('bcMonth').value.padStart(2,'0');
  return bcKpiMode==='monthly'?`${y}-${m}`:bcKpiEl('bcWeek').value;
}
function bcRenderMovement(groups){
  const key=bcSelectedKey(),chosen=groups.find(g=>g.period===key);
  const fields={bcKpiOpening:'opening',bcKpiIncoming:'incoming',bcKpiRemoved:'removedPending',bcKpiChanged:'changed',bcKpiClosing:'closing',bcKpiUploads:'uploads'};
  Object.entries(fields).forEach(([id,field])=>bcKpiSet(id,chosen?bcKpiNumber(Number(chosen[field])||0):'—'));
  bcKpiSet('bcPeriodLabel',bcKpiMode==='weekly'?'Weekly':'Monthly');
  const tbody=bcKpiEl('bcKpiHistory');tbody.replaceChildren();
  const prefix=bcKpiEl('bcYear').value+'-'+bcKpiEl('bcMonth').value.padStart(2,'0');
  const visible=groups.filter(g=>bcKpiMode==='weekly'?bcWeekOptions().some(w=>w.key===g.period):g.period.startsWith(bcKpiEl('bcYear').value+'-'));
  if(!visible.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='Belum ada snapshot pada periode ini';tr.append(td);tbody.append(tr);}
  visible.slice().reverse().forEach(g=>{
    const tr=document.createElement('tr');
    [g.period,g.uploads,g.opening,g.incoming,g.removedPending,g.changed,g.closing].forEach((v,i)=>{
      const td=document.createElement('td');td.textContent=i?bcKpiNumber(Number(v)||0):String(v);tr.append(td);
    });tbody.append(tr);
  });
  bcKpiMovementChart(visible);
}

function bcKpiDateRange(){
  const y=Number(bcKpiEl('bcYear').value),m=Number(bcKpiEl('bcMonth').value);
  const iso=d=>d.toISOString().slice(0,10);
  if(bcKpiMode==='monthly')return {startDate:iso(new Date(Date.UTC(y,m-1,1))),endDate:iso(new Date(Date.UTC(y,m,0)))};
  const selected=bcKpiEl('bcWeek').value;
  const week=bcWeekOptions().find(w=>w.key===selected);
  if(!week)throw new Error('Minggu kalender belum dipilih');
  const first=new Date(Date.UTC(y,m-1,1));
  first.setUTCDate(first.getUTCDate()-((first.getUTCDay()+6)%7));
  const index=bcWeekOptions().findIndex(w=>w.key===selected);
  first.setUTCDate(first.getUTCDate()+index*7);
  const last=new Date(first);last.setUTCDate(last.getUTCDate()+6);
  return {startDate:iso(first),endDate:iso(last)};
}
let bcKpiPeriodRequest=0;
async function bcKpiLoadRegistration(){
  const request=++bcKpiPeriodRequest;
  ['kpiInspectionFindings','kpiRegistered','kpiApproved'].forEach(id=>bcKpiSet(id,'…'));
  try{
    const result=await bcKpiRequest('getBacklogRegistrationKpi',bcKpiDateRange());
    if(request!==bcKpiPeriodRequest)return;
    bcKpiSet('kpiInspectionFindings',bcKpiNumber(result.inspectionFindings));
    bcKpiSet('kpiRegistered',bcKpiNumber(result.registered));
    bcKpiSet('kpiApproved',bcKpiNumber(result.approved));
  }catch(e){
    if(request!==bcKpiPeriodRequest)return;
    ['kpiInspectionFindings','kpiRegistered','kpiApproved'].forEach(id=>bcKpiSet(id,'—'));
    bcKpiStatus('Inspection & Registration belum termuat: '+e.message);
  }
}

async function bcKpiLoad(){
  bcUpdateWeeks();
  bcKpiStatus('Mengambil data Backlog Control...');
  bcKpiLoadRegistration();
  const [active,movement]=await Promise.allSettled([
    bcKpiRequest('getBacklogControl'),
    bcKpiRequest('getBacklogMovementSummary',{period:bcKpiMode})
  ]);
  if(active.status==='fulfilled'){
    const data=active.value,rows=Array.isArray(data.rows)?data.rows:[];
    bcValueRender(rows);
    const count=s=>rows.filter(r=>String(r.N||'').trim().toUpperCase()===s).length;
    const waiting=count('WAITING PART'),ready=count('PART READY'),supply=count('SUPPLY');
    bcKpiSet('bcKpiTotal',bcKpiNumber(rows.length));
    bcKpiSet('bcKpiWaiting',bcKpiNumber(waiting));
    bcKpiSet('bcKpiReady',bcKpiNumber(ready));
    bcKpiSet('kpiPartReady',bcKpiNumber(ready));
    bcKpiMaterialChart(waiting,ready,supply);
    bcKpiSet('bcKpiSupply',bcKpiNumber(supply));
    bcKpiSet('bcKpiSupplyRatio',rows.length?(100*supply/rows.length).toFixed(1)+'%':'—');
    bcKpiSet('bcKpiAging',bcKpiNumber(rows.filter(r=>{const n=Number(String(r.X||'').replace(',','.'));return Number.isFinite(n)&&n>30}).length));
    bcKpiSet('bcLastSource','Last Source Update: '+(data.updatedAt||'Belum tersedia'));
  }else{
    ['bcKpiTotal','bcKpiWaiting','bcKpiReady','bcKpiSupply','bcKpiSupplyRatio','bcKpiAging'].forEach(id=>bcKpiSet(id,'—'));
    bcValueError();
  }
  if(movement.status==='fulfilled'){
    bcKpiGroups=Array.isArray(movement.value.groups)?movement.value.groups:[];
    bcRenderMovement(bcKpiGroups);
  }else{
    bcKpiGroups=[];bcRenderMovement([]);
    bcKpiEl('bcMovementChart').textContent='Histori belum dapat dimuat';
  }
  const errors=[active,movement].filter(r=>r.status==='rejected').map(r=>r.reason?.message||'Unknown error');
  bcKpiStatus(errors.length?'Sebagian KPI belum dapat dimuat: '+errors.join(' | '):
    'KPI material menunjukkan snapshot terbaru; pergerakan Weekly/Monthly berdasarkan tanggal upload. Tidak ada upload bukan berarti tidak ada perubahan.');
}
if(bcKpiEl('bcYear')){
  bcDateControls();
  bcKpiEl('bcWeeklyBtn').addEventListener('click',()=>{bcKpiMode='weekly';bcKpiLoad().catch(e=>bcKpiStatus(e.message))});
  bcKpiEl('bcMonthlyBtn').addEventListener('click',()=>{bcKpiMode='monthly';bcKpiLoad().catch(e=>bcKpiStatus(e.message))});
  bcKpiEl('bcYear').addEventListener('change',()=>{bcUpdateWeeks();bcRenderMovement(bcKpiGroups);bcKpiLoadRegistration()});
  bcKpiEl('bcMonth').addEventListener('change',()=>{bcKpiEl('bcWeek').value='';bcUpdateWeeks();bcRenderMovement(bcKpiGroups);bcKpiLoadRegistration()});
  bcKpiEl('bcWeek').addEventListener('change',()=>{bcUpdateWeeks();bcRenderMovement(bcKpiGroups);bcKpiLoadRegistration()});
  bcKpiEl('bcKpiRefresh').addEventListener('click',()=>bcKpiLoad().catch(e=>bcKpiStatus(e.message)));
  bcKpiLoad().catch(e=>bcKpiStatus('Gagal memuat KPI: '+e.message));
}

function bcKpiChartBar(parent,kind,value,max){
  const bar=document.createElement('div');bar.className='bc-chart-bar '+kind;bar.style.height=Math.max(2,Math.round(150*value/Math.max(1,max)))+'px';bar.title=kind+': '+bcKpiNumber(value);parent.append(bar);
}
function bcKpiChartGroup(container,label,values,max){
  const group=document.createElement('div');group.className='bc-chart-group';
  const counts=document.createElement('div');counts.className='bc-chart-count';counts.textContent=values.map(v=>bcKpiNumber(v.value)).join(' / ');
  const bars=document.createElement('div');bars.className='bc-chart-bars';values.forEach(v=>bcKpiChartBar(bars,v.kind,v.value,max));
  const title=document.createElement('div');title.className='bc-chart-label';title.textContent=label;group.append(counts,bars,title);container.append(group);
}
function bcKpiMovementChart(groups){
  const root=bcKpiEl('bcMovementChart');if(!root)return;root.replaceChildren();
  if(!groups.length){root.textContent='Belum ada histori upload untuk ditampilkan sebagai grafik.';return;}
  const recent=groups.slice(-8);const max=Math.max(1,...recent.flatMap(g=>[Number(g.incoming)||0,Number(g.removedPending)||0]));
  recent.forEach(g=>bcKpiChartGroup(root,g.period,[{kind:'incoming',value:Number(g.incoming)||0},{kind:'removed',value:Number(g.removedPending)||0}],max));
  const legend=document.createElement('div');legend.className='bc-chart-legend';legend.textContent='Biru: Incoming | Kuning: Removed Pending';root.after(legend);
}
function bcKpiMaterialChart(waiting,ready,supply){
  const root=bcKpiEl('bcMaterialChart');if(!root)return;root.replaceChildren();
  const max=Math.max(1,waiting,ready,supply);
  [['Waiting Part','waiting',waiting],['Part Ready','ready',ready],['Supply','supply',supply]].forEach(([label,kind,value])=>bcKpiChartGroup(root,label,[{kind,value}],max));
}


// ======================================================
// BACKLOG MATERIAL VALUE — read-only, uses current getBacklogControl rows
// PRICE = column S, Status Part = N, Aging WO = X
// ======================================================
let bcValueLastRows=[];
let bcValueMode='money';
const bcValueColors={'WAITING PART':'#e58d26','PART READY':'#16a34a','SUPPLY':'#64748b'};
function bcValueMoney(n){return 'Rp'+new Intl.NumberFormat('id-ID',{maximumFractionDigits:0}).format(n);}
function bcValuePrice(v){
  if(typeof v==='number')return Number.isFinite(v)?v:null;
  if(v===null||v===undefined||String(v).trim()==='')return null;
  let s=String(v).replace(/\s|Rp/gi,'').trim();
  if(!s||s==='-'||s==='#N/A')return null;
  // Indonesia format: 1.234.567,89; plain integer or decimal strings supported
  if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');
  else if(s.includes(','))s=s.replace(',','.');
  else if(/^-?\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
  const n=Number(s);return Number.isFinite(n)?n:null;
}
function bcValueRender(rows){
  bcValueLastRows=rows;
  const statusNames=['WAITING PART','PART READY','SUPPLY'];
  const totals=Object.fromEntries(statusNames.map(s=>[s,{value:0,count:0}]));
  let total=0,aging=0,valid=0,other=0;
  const waitingItems=[];
  for(const r of rows){
    const price=bcValuePrice(r.S);
    if(price===null)continue;
    valid++;total+=price;
    const status=String(r.N||'').trim().toUpperCase();
    if(totals[status]){totals[status].value+=price;totals[status].count++;}else other+=price;
    const days=bcValuePrice(r.X);
    if(days!==null&&days>30)aging+=price;
    if(status==='WAITING PART')waitingItems.push({unit:r.E||'',part:r.I||'',desc:r.J||'',price,aging:days});
  }
  const waiting=totals['WAITING PART'].value,ready=totals['PART READY'].value,supply=totals.SUPPLY.value;
  const pct=(a,b)=>b>0?(100*a/b).toLocaleString('id-ID',{maximumFractionDigits:2})+'%':'—';
  const set=(id,v)=>bcKpiSet(id,v);
  set('bcValueTotal',valid?bcValueMoney(total):'—');
  set('bcValueWaiting',bcValueMoney(waiting));set('bcValueReady',bcValueMoney(ready));set('bcValueSupply',bcValueMoney(supply));
  set('bcValueReadiness',pct(ready,waiting+ready));set('bcValueSupplyRatio',pct(supply,total));set('bcValueReadyRatio',pct(ready,total));
  set('bcValueAging',bcValueMoney(aging));set('bcValueCoverage',pct(valid,rows.length));
  const stack=bcKpiEl('bcValueStack');if(stack){stack.replaceChildren();
    [...statusNames,'OTHER'].forEach(s=>{const value=s==='OTHER'?other:totals[s].value;const part=document.createElement('span');part.style.width=(total>0?100*value/total:0)+'%';part.style.background=bcValueColors[s]||'#b9c3d0';part.title=s+': '+bcValueMoney(value);stack.append(part);});}
  const bars=bcKpiEl('bcValueBars');if(bars){bars.replaceChildren();
    const denom=bcValueMode==='money'?total:rows.length;
    [...statusNames].forEach(s=>{const value=bcValueMode==='money'?totals[s].value:totals[s].count;
      const row=document.createElement('div');row.className='bc-value-bar-row';
      const label=document.createElement('div');label.className='bc-value-bar-label';
      const left=document.createElement('span');left.textContent=s;
      const right=document.createElement('strong');right.textContent=bcValueMode==='money'?bcValueMoney(value):bcKpiNumber(value)+' records';
      label.append(left,right);const track=document.createElement('div');track.className='bc-value-track';
      const fill=document.createElement('div');fill.className='bc-value-fill';fill.style.background=bcValueColors[s];fill.style.width=(denom>0?Math.max(0,100*value/denom):0)+'%';
      track.append(fill);row.append(label,track);bars.append(row);
    });}
  const tbody=bcKpiEl('bcValueTopWaiting');if(tbody){tbody.replaceChildren();
    waitingItems.sort((a,b)=>b.price-a.price).slice(0,10).forEach(item=>{const tr=document.createElement('tr');
      [item.unit,item.part,item.desc,bcValueMoney(item.price),item.aging===null?'—':String(Math.round(item.aging))].forEach(v=>{const td=document.createElement('td');td.textContent=String(v);tr.append(td)});tbody.append(tr);});
    if(!tbody.children.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=5;td.textContent='Tidak ada Waiting Part dengan PRICE valid';tr.append(td);tbody.append(tr);}}
  set('bcValueNote',`Sumber: snapshot Backlog Control terbaru • ${valid} dari ${rows.length} record memiliki PRICE valid. PRICE dijumlahkan langsung tanpa dikalikan Qty. Nilai SUPPLY tidak berarti biaya terealisasi. Filter Weekly/Monthly tidak mengubah snapshot ini.`);
}
function bcValueError(){['bcValueTotal','bcValueWaiting','bcValueReady','bcValueSupply','bcValueReadiness','bcValueSupplyRatio','bcValueReadyRatio','bcValueAging','bcValueCoverage'].forEach(id=>bcKpiSet(id,'—'));bcKpiSet('bcValueNote','Data PRICE belum tersedia dari sumber Backlog Control.');}
if(bcKpiEl('bcValueModeMoney')){
  [['bcValueModeMoney','money'],['bcValueModeRecords','records']].forEach(([id,mode])=>bcKpiEl(id).addEventListener('click',()=>{bcValueMode=mode;bcKpiEl('bcValueModeMoney').classList.toggle('is-active',mode==='money');bcKpiEl('bcValueModeRecords').classList.toggle('is-active',mode==='records');bcValueRender(bcValueLastRows);}));
}
