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
function bcUpdateWeeks(){
  const year=Number(bcKpiEl('bcYear').value),month=Number(bcKpiEl('bcMonth').value);
  const last=new Date(year,month,0).getDate();
  const current=bcKpiEl('bcWeek').value||String(Math.min(5,Math.ceil(new Date().getDate()/7)));
  const weeks=Array.from({length:Math.ceil(last/7)},(_,i)=>{
    const from=i*7+1,to=Math.min(last,(i+1)*7);
    return [i+1,`Week ${i+1} (${from}–${to} ${BC_MONTH_NAMES[month-1]})`];
  });
  bcSelectOptions('bcWeek',weeks,weeks.some(x=>String(x[0])===current)?current:weeks[weeks.length-1][0]);
  bcKpiEl('bcWeek').hidden=bcKpiMode!=='weekly';
  ['bcWeeklyBtn','bcMonthlyBtn'].forEach((id,i)=>{
    const on=(i===0)===(bcKpiMode==='weekly');
    bcKpiEl(id).classList.toggle('is-active',on);
    bcKpiEl(id).setAttribute('aria-pressed',String(on));
  });
  const w=Number(bcKpiEl('bcWeek').value);
  bcKpiSet('bcSelectedRange',bcKpiMode==='weekly'
    ?`Week ${w}: ${7*(w-1)+1}–${Math.min(7*w,last)} ${BC_MONTH_NAMES[month-1]} ${year}`
    :`1–${last} ${BC_MONTH_NAMES[month-1]} ${year}`);
}
function bcSelectedKey(){
  const y=bcKpiEl('bcYear').value,m=bcKpiEl('bcMonth').value.padStart(2,'0');
  return bcKpiMode==='monthly'?`${y}-${m}`:`${y}-${m}-W${bcKpiEl('bcWeek').value}`;
}
function bcRenderMovement(groups){
  const key=bcSelectedKey(),chosen=groups.find(g=>g.period===key);
  const fields={bcKpiOpening:'opening',bcKpiIncoming:'incoming',bcKpiRemoved:'removedPending',bcKpiChanged:'changed',bcKpiClosing:'closing',bcKpiUploads:'uploads'};
  Object.entries(fields).forEach(([id,field])=>bcKpiSet(id,chosen?bcKpiNumber(Number(chosen[field])||0):'—'));
  bcKpiSet('bcPeriodLabel',bcKpiMode==='weekly'?'Weekly':'Monthly');
  const tbody=bcKpiEl('bcKpiHistory');tbody.replaceChildren();
  const prefix=bcKpiEl('bcYear').value+'-'+bcKpiEl('bcMonth').value.padStart(2,'0');
  const visible=groups.filter(g=>bcKpiMode==='weekly'?g.period.startsWith(prefix+'-W'):g.period.startsWith(bcKpiEl('bcYear').value+'-'));
  if(!visible.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='Belum ada snapshot pada periode ini';tr.append(td);tbody.append(tr);}
  visible.slice().reverse().forEach(g=>{
    const tr=document.createElement('tr');
    [g.period,g.uploads,g.opening,g.incoming,g.removedPending,g.changed,g.closing].forEach((v,i)=>{
      const td=document.createElement('td');td.textContent=i?bcKpiNumber(Number(v)||0):String(v);tr.append(td);
    });tbody.append(tr);
  });
  bcKpiMovementChart(visible);
}
async function bcKpiLoad(){
  bcUpdateWeeks();
  bcKpiStatus('Mengambil data Backlog Control...');
  const [active,movement]=await Promise.allSettled([
    bcKpiRequest('getBacklogControl'),
    bcKpiRequest('getBacklogMovementSummary',{period:bcKpiMode})
  ]);
  if(active.status==='fulfilled'){
    const data=active.value,rows=Array.isArray(data.rows)?data.rows:[];
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
  bcKpiEl('bcYear').addEventListener('change',()=>{bcUpdateWeeks();bcRenderMovement(bcKpiGroups)});
  bcKpiEl('bcMonth').addEventListener('change',()=>{bcKpiEl('bcWeek').value='1';bcUpdateWeeks();bcRenderMovement(bcKpiGroups)});
  bcKpiEl('bcWeek').addEventListener('change',()=>{bcUpdateWeeks();bcRenderMovement(bcKpiGroups)});
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
