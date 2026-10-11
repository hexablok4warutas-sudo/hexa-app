// ========================================
// HEXA APP
// DAILY MAINTENANCE
// ========================================

"use strict";


// ========================================
// SESSION PROTECTION
// ========================================

const hexaLoggedIn =
  sessionStorage.getItem("hexaLoggedIn");

const hexaUserData =
  sessionStorage.getItem("hexaUser");


if (
  hexaLoggedIn !== "true" ||
  !hexaUserData
) {

  window.location.replace("index.html");

}


// ========================================
// BACA DATA USER
// ========================================

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


console.log(
  "HEXA Current User:",
  currentUser
);


// ========================================
// ELEMENT KHUSUS DAILY MAINTENANCE
// ========================================

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchButton =
  document.getElementById(
    "searchButton"
  );

const dailyMenuItems =
  document.querySelectorAll(
    ".daily-menu-item"
  );

const inspectionShortcut =
  document.getElementById(
    "inspectionShortcut"
  );


// ========================================
// SEARCH DAILY MAINTENANCE MENU
// ========================================

function searchDailyMenu() {

  if (!searchInput) {
    return;
  }

  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  dailyMenuItems.forEach(
    function (item) {

      const menuName =
        item.textContent
          .trim()
          .toLowerCase();


      if (
        !keyword ||
        menuName.includes(keyword)
      ) {

        item.classList.remove(
          "search-hidden"
        );

      } else {

        item.classList.add(
          "search-hidden"
        );

      }

    }
  );

}


// ========================================
// SEARCH SAAT USER MENGETIK
// ========================================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    searchDailyMenu
  );


  searchInput.addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {

        event.preventDefault();

        searchDailyMenu();

      }

    }
  );

}


// ========================================
// SEARCH BUTTON
// ========================================

if (searchButton) {

  searchButton.addEventListener(
    "click",
    searchDailyMenu
  );

}


// ========================================
// DAILY MAINTENANCE MENU
// ========================================

dailyMenuItems.forEach(
  function (item) {

    item.addEventListener(
      "click",
      function () {

        const menu =
          item.dataset.menu;


        // =================================
        // START INSPECTION
        // =================================

        if (
          menu ===
          "start-inspection"
        ) {

          openStartInspection();

          return;

        }


        // =================================
        // DAILY OUTSTANDING
        // =================================

        if (
        menu ===
        "daily-outstanding"
        ) {

        openDailyOutstanding();

        return;

        }
        if (menu === "unit-history") {
        openUnitHistory();
        return;
        }

        // =================================
        // DAILY ACTIVITY
        // =================================

        if (
          menu ===
          "daily-activity"
        ) {

          openDailyActivity();

          return;

        }

        // GREASING ANTI LINEBORING
        if (menu === "greasing-anti-lineboring") {
          window.location.href = "/greasing-anti-lineboring";
          return;
        }

        // =================================
        // UNIT HISTORY
        // =================================

        if (
          menu ===
          "unit-history"
        ) {

          console.log(
            "Unit History"
          );

          return;

        }

      }
    );

  }
);


// ========================================
// OPEN START INSPECTION
// ========================================

function openStartInspection() {

  window.location.href =
    "/start-inspection";

}

// ========================================
// OPEN DAILY OUTSTANDING
// ========================================

function openDailyOutstanding() {

  window.location.href =
    "/daily-outstanding";

}
function openUnitHistory() {
  window.location.href = "/unit-history";
}

// ========================================
// OPEN DAILY ACTIVITY
// ========================================

function openDailyActivity() {

  window.location.href =
    "/daily-activity";

}
// ========================================
// FLOATING BUTTON
// ========================================

const FLOATING_POSITION_KEY =
  "hexaInspectionButtonPosition";

let isDragging =
  false;

let hasDragged =
  false;

let dragOffsetX =
  0;

let dragOffsetY =
  0;


// ========================================
// LOAD POSISI FLOATING BUTTON
// ========================================

function loadFloatingPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const savedPosition =
    localStorage.getItem(
      FLOATING_POSITION_KEY
    );


  if (!savedPosition) {
    return;
  }


  try {

    const position =
      JSON.parse(
        savedPosition
      );


    if (
      typeof position.left !==
        "number" ||
      typeof position.top !==
        "number"
    ) {

      return;

    }


    const buttonWidth =
      inspectionShortcut.offsetWidth;

    const buttonHeight =
      inspectionShortcut.offsetHeight;


    const maxLeft =
      Math.max(
        0,
        window.innerWidth -
        buttonWidth
      );


    const maxTop =
      Math.max(
        0,
        window.innerHeight -
        buttonHeight
      );


    const left =
      Math.min(
        Math.max(
          position.left,
          0
        ),
        maxLeft
      );


    const top =
      Math.min(
        Math.max(
          position.top,
          0
        ),
        maxTop
      );


    inspectionShortcut.style.left =
      left + "px";

    inspectionShortcut.style.top =
      top + "px";

    inspectionShortcut.style.right =
      "auto";

    inspectionShortcut.style.bottom =
      "auto";


  } catch (error) {

    console.error(
      "Floating button position error:",
      error
    );

  }

}


// ========================================
// SAVE POSISI FLOATING BUTTON
// ========================================

function saveFloatingPosition() {

  if (!inspectionShortcut) {
    return;
  }


  const rect =
    inspectionShortcut
      .getBoundingClientRect();


  localStorage.setItem(
    FLOATING_POSITION_KEY,
    JSON.stringify({

      left: rect.left,
      top: rect.top

    })
  );

}


// ========================================
// FLOATING BUTTON EVENTS
// ========================================

if (inspectionShortcut) {


  // ======================================
  // POINTER DOWN
  // ======================================

  inspectionShortcut.addEventListener(
    "pointerdown",
    function (event) {

      isDragging = true;
      hasDragged = false;


      const rect =
        inspectionShortcut
          .getBoundingClientRect();


      dragOffsetX =
        event.clientX -
        rect.left;


      dragOffsetY =
        event.clientY -
        rect.top;


      try {

        inspectionShortcut
          .setPointerCapture(
            event.pointerId
          );

      } catch (error) {

        console.log(
          "Pointer capture unavailable"
        );

      }

    }
  );


  // ======================================
  // POINTER MOVE
  // ======================================

  inspectionShortcut.addEventListener(
    "pointermove",
    function (event) {

      if (!isDragging) {
        return;
      }


      const rect =
        inspectionShortcut
          .getBoundingClientRect();


      const movementX =
        Math.abs(
          event.clientX -
          (
            rect.left +
            dragOffsetX
          )
        );


      const movementY =
        Math.abs(
          event.clientY -
          (
            rect.top +
            dragOffsetY
          )
        );


      if (
        movementX > 2 ||
        movementY > 2
      ) {

        hasDragged = true;

      }


      const buttonWidth =
        inspectionShortcut.offsetWidth;


      const buttonHeight =
        inspectionShortcut.offsetHeight;


      let left =
        event.clientX -
        dragOffsetX;


      let top =
        event.clientY -
        dragOffsetY;


      const maxLeft =
        Math.max(
          0,
          window.innerWidth -
          buttonWidth
        );


      const maxTop =
        Math.max(
          0,
          window.innerHeight -
          buttonHeight
        );


      left =
        Math.min(
          Math.max(
            left,
            0
          ),
          maxLeft
        );


      top =
        Math.min(
          Math.max(
            top,
            0
          ),
          maxTop
        );


      inspectionShortcut.style.left =
        left + "px";


      inspectionShortcut.style.top =
        top + "px";


      inspectionShortcut.style.right =
        "auto";


      inspectionShortcut.style.bottom =
        "auto";

    }
  );


  // ======================================
  // POINTER UP
  // ======================================

  inspectionShortcut.addEventListener(
    "pointerup",
    function (event) {

      if (!isDragging) {
        return;
      }


      isDragging = false;


      try {

        inspectionShortcut
          .releasePointerCapture(
            event.pointerId
          );

      } catch (error) {

        console.log(
          "Pointer release unavailable"
        );

      }


      if (hasDragged) {

        saveFloatingPosition();

      }

    }
  );


  // ======================================
  // POINTER CANCEL
  // ======================================

  inspectionShortcut.addEventListener(
    "pointercancel",
    function () {

      isDragging = false;

    }
  );


  // ======================================
  // CLICK
  // ======================================

  inspectionShortcut.addEventListener(
    "click",
    function () {

      if (hasDragged) {

        hasDragged = false;

        return;

      }


      openStartInspection();

    }
  );

}


// ========================================
// WINDOW RESIZE
// JAGA BUTTON TETAP DI DALAM LAYAR
// ========================================

window.addEventListener(
  "resize",
  function () {

    if (!inspectionShortcut) {
      return;
    }


    const rect =
      inspectionShortcut
        .getBoundingClientRect();


    const buttonWidth =
      inspectionShortcut.offsetWidth;


    const buttonHeight =
      inspectionShortcut.offsetHeight;


    const maxLeft =
      Math.max(
        0,
        window.innerWidth -
        buttonWidth
      );


    const maxTop =
      Math.max(
        0,
        window.innerHeight -
        buttonHeight
      );


    const left =
      Math.min(
        Math.max(
          rect.left,
          0
        ),
        maxLeft
      );


    const top =
      Math.min(
        Math.max(
          rect.top,
          0
        ),
        maxTop
      );


    inspectionShortcut.style.left =
      left + "px";


    inspectionShortcut.style.top =
      top + "px";


    inspectionShortcut.style.right =
      "auto";


    inspectionShortcut.style.bottom =
      "auto";


    saveFloatingPosition();

  }
);


// ========================================
// INITIALIZE
// ========================================

loadFloatingPosition();


console.log(
  "HEXA Daily Maintenance Ready"
);


// ========================================
// KPI DAILY MAINTENANCE · TRACK ONLY
// Tampilan ringan, data hanya dari backend yang valid.
// Kontrak adapter opsional:
// window.HEXA_DM_KPI_ADAPTER({section:'TRACK',period,date})
//   => Promise<{success:true,source:{label,asOf},
//     achievement:{plan,actual,rate?,series:[{label,plan,actual}]},
//     redo:{unitDM,count,rate?,byEgi:[{label,count}],byUnit:[{label,count,history?:[]}]},
//     pica:[{problem,count,units?,possibleCause?,corrective?,preventive?,mtbf?,status?}] }>
// Tanpa adapter / data, tampilkan empty state (bukan angka fiktif).
// ========================================
(function initDmKpi(){
  'use strict';
  const root=document.getElementById('dmKpi');
  if(!root)return;
  const el=id=>document.getElementById(id);
  const dateInput=el('dmKpiDate');
  const pad=n=>String(n).padStart(2,'0');
  const toISO=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parseDate=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
  const today=new Date();dateInput.value=toISO(today);
  let period='daily',seq=0;
  const fmt=d=>new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(d);
  const periodRange=()=>{
    const d=parseDate(dateInput.value),a=new Date(d),b=new Date(d);
    if(period==='weekly'){const diff=(d.getDay()+6)%7;a.setDate(d.getDate()-diff);b.setDate(a.getDate()+6)}
    if(period==='monthly'){a.setDate(1);b.setMonth(d.getMonth()+1,0)}
    return {start:toISO(a),end:toISO(b),label:period==='daily'?fmt(d):`${fmt(a)} – ${fmt(b)}`};
  };
  const empty=(message='Belum ada data KPI tersinkronisasi untuk periode ini.')=>{
    const node=document.createElement('div');node.className='dm-kpi-empty';node.textContent=message;return node;
  };
  const clear=node=>node.replaceChildren();
  const number=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
  const setText=(id,v)=>{el(id).textContent=v};
  const percent=v=>number(v)===null?'—':`${(v*100).toLocaleString('id-ID',{maximumFractionDigits:1})}%`;
  const formatNumber=v=>number(v)===null?'—':v.toLocaleString('id-ID',{maximumFractionDigits:1});
  const safeArr=v=>Array.isArray(v)?v:[];
  function renderBars(id,items,interactive){
    const node=el(id);clear(node);
    const valid=safeArr(items).filter(x=>x&&typeof x.label==='string'&&number(x.count)!==null&&x.count>=0);
    if(!valid.length){node.append(empty());return}
    const max=Math.max(1,...valid.map(x=>x.count));
    valid.slice(0,12).forEach(item=>{
      const row=document.createElement('div');row.className='dm-kpi-bar-row';
      const name=document.createElement(interactive?'button':'span');
      if(interactive){name.type='button';name.addEventListener('click',()=>renderUnitHistory(item))}
      name.textContent=item.label;
      const track=document.createElement('div');track.className='dm-kpi-bar-bg';
      const fill=document.createElement('div');fill.className='dm-kpi-bar-fill';fill.style.width=`${Math.min(100,item.count/max*100)}%`;
      track.append(fill);
      const count=document.createElement('b');count.textContent=formatNumber(item.count);
      row.append(name,track,count);node.append(row);
    });
  }
  function renderUnitHistory(item){
    const node=el('dmKpiUnitHistory');clear(node);
    const title=document.createElement('strong');title.textContent=`Riwayat ${item.label}`;node.append(title);
    const history=safeArr(item.history);
    if(!history.length){node.append(empty('Detail riwayat unit belum tersedia dari database.'));return}
    history.slice(0,30).forEach(x=>{
      const p=document.createElement('p');p.textContent=[x.date,x.hm===undefined?'':`HM ${x.hm}`,x.problem].filter(Boolean).join(' · ');node.append(p);
    });
  }
  function renderAchievementChart(series){
    const node=el('dmKpiAchievementChart');clear(node);
    const data=safeArr(series).filter(x=>x&&typeof x.label==='string'&&number(x.plan)!==null&&number(x.actual)!==null);
    if(!data.length){node.append(empty());return}
    const max=Math.max(1,...data.flatMap(x=>[x.plan,x.actual]));
    data.slice(-14).forEach(x=>{
      const row=document.createElement('div');row.className='dm-kpi-bar-row';
      const label=document.createElement('span');label.textContent=x.label;
      const track=document.createElement('div');track.style.cssText='display:flex;flex-direction:column;gap:3px';
      [['Plan',x.plan,'#075f9b'],['Actual',x.actual,'#f3ae22']].forEach(([name,v,color])=>{
        const bar=document.createElement('div');bar.className='dm-kpi-bar-bg';bar.title=`${name}: ${v}`;
        const fill=document.createElement('div');fill.className='dm-kpi-bar-fill';fill.style.width=`${Math.max(0,v/max*100)}%`;fill.style.background=color;bar.append(fill);track.append(bar);
      });
      const count=document.createElement('b');count.textContent=`${x.actual}/${x.plan}`;row.append(label,track,count);node.append(row);
    });
  }
  function renderPica(items){
    const node=el('dmKpiPicaList');clear(node);
    const list=safeArr(items).filter(x=>x&&typeof x.problem==='string'&&number(x.count)!==null).sort((a,b)=>b.count-a.count).slice(0,3);
    if(!list.length){node.append(empty('Top 3 kerusakan dan Suggested PICA menunggu riwayat Redo DM yang tersinkronisasi.'));return}
    list.forEach((x,i)=>{
      const card=document.createElement('article');card.className='dm-kpi-pica-card';
      const rank=document.createElement('span');rank.className='dm-kpi-rank';rank.textContent=`TOP ${i+1} · ${x.count} kejadian`;
      const h=document.createElement('h4');h.textContent=x.problem;card.append(rank,h);
      const fields=[['Unit terdampak',safeArr(x.units).join(', ')||'Belum tersedia'],['Possible Cause',x.possibleCause||'Perlu analisis riwayat dan pemeriksaan lapangan'],['Corrective Action',x.corrective||'Belum ada rekomendasi terverifikasi'],['Preventive Action',x.preventive||'Belum ada rekomendasi terverifikasi'],['MTBF',number(x.mtbf)!==null?`${formatNumber(x.mtbf)} HM`:'Belum dapat dihitung'],['PICA Status',x.status||'Belum ditetapkan']];
      fields.forEach(([name,value])=>{const p=document.createElement('p');const b=document.createElement('b');b.textContent=name+': ';p.append(b,document.createTextNode(String(value)));card.append(p)});node.append(card);
    });
  }
  function reset(){
    ['dmKpiAchievement','dmKpiPlan','dmKpiActual','dmKpiRedo'].forEach(id=>setText(id,'—'));
    setText('dmKpiRedoDetail','Mengikuti angka resmi Dashboard');
    el('dmKpiAchievementBar').style.width='0%';
    renderAchievementChart([]);renderBars('dmKpiEgiChart',[],false);renderBars('dmKpiUnitChart',[],true);
    clear(el('dmKpiUnitHistory'));renderPica([]);
  }
  async function refresh(){
    const current=++seq,range=periodRange();setText('dmKpiPeriodLabel',range.label);reset();
    const adapter=window.HEXA_DM_KPI_ADAPTER;
    if(typeof adapter!=='function'){setText('dmKpiSource','Data KPI belum terhubung');return}
    setText('dmKpiSource','Memuat data…');
    try{
      const data=await adapter({section:'TRACK',period,date:dateInput.value,startDate:range.start,endDate:range.end});
      if(current!==seq)return;
      if(!data||data.success!==true)throw Error(data?.message||'Data KPI belum tersedia');
      if(data.section&&data.section!=='TRACK')throw Error('Respons bukan Section TRACK');
      const a=data.achievement||{},r=data.redo||{};
      setText('dmKpiSource',data.source?.label||'Data KPI tersinkronisasi');
      if(data.source?.asOf)setText('dmKpiSource',`${data.source.label||'Data KPI'} · ${data.source.asOf}`);
      setText('dmKpiPlan',formatNumber(a.plan));setText('dmKpiActual',formatNumber(a.actual));
      const achievement=number(a.rate)!==null?a.rate:(number(a.plan)>0&&number(a.actual)!==null?a.actual/a.plan:null);
      setText('dmKpiAchievement',percent(achievement));
      el('dmKpiAchievementBar').style.width=number(achievement)===null?'0%':`${Math.max(0,Math.min(100,achievement*100))}%`;
      setText('dmKpiRedo',percent(r.rate));
      setText('dmKpiRedoDetail',`${formatNumber(r.count)} Redo / ${formatNumber(r.unitDM)} Unit DM · Dashboard resmi`);
      renderAchievementChart(a.series);renderBars('dmKpiEgiChart',r.byEgi,false);renderBars('dmKpiUnitChart',r.byUnit,true);renderPica(data.pica);
    }catch(err){if(current!==seq)return;setText('dmKpiSource','Data belum tersedia');console.warn('HEXA KPI:',err.message)}
  }
  root.querySelectorAll('[data-kpi-period]').forEach(btn=>btn.addEventListener('click',()=>{
    period=btn.dataset.kpiPeriod;
    root.querySelectorAll('[data-kpi-period]').forEach(x=>{const active=x===btn;x.classList.toggle('is-active',active);x.setAttribute('aria-pressed',String(active))});refresh();
  }));
  dateInput.addEventListener('change',()=>{if(dateInput.value)refresh()});
  function move(dir){const d=parseDate(dateInput.value);if(period==='daily')d.setDate(d.getDate()+dir);else if(period==='weekly')d.setDate(d.getDate()+dir*7);else d.setMonth(d.getMonth()+dir);dateInput.value=toISO(d);refresh()}
  el('dmKpiPrev').addEventListener('click',()=>move(-1));el('dmKpiNext').addEventListener('click',()=>move(1));
  window.addEventListener('hexa:kpi-updated',refresh);
  refresh();
})();
