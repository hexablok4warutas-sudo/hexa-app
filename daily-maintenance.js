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
  function renderPareto(items){
    const node=el('dmKpiUnitChart');clear(node);
    const source=safeArr(items).filter(x=>x&&typeof x.label==='string'&&number(x.count)!==null&&x.count>0);
    const map=new Map();
    source.forEach(x=>{const key=x.label.trim().toUpperCase().replace(/\s+/g,' ');if(!key)return;
      if(!map.has(key))map.set(key,{label:key,count:0,history:[]});
      const v=map.get(key);v.count+=x.count;v.history.push(...safeArr(x.history));
    });
    const data=[...map.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
    if(!data.length){node.append(empty('Belum ada catatan Redo Event pada periode ini.'));return}
    const total=data.reduce((s,x)=>s+x.count,0),max=data[0].count;
    let cumulative=0,cutoff=data.length;
    data.forEach((x,i)=>{cumulative+=x.count;x.cumulative=cumulative/total*100;x.contribution=x.count/total*100;if(cutoff===data.length&&x.cumulative>=80)cutoff=i+1});
    const summary=document.createElement('p');summary.className='dm-kpi-pareto-summary';
    summary.textContent=`${total} catatan Redo Event · ${data.length} unit · ${cutoff} unit mencapai ${data[cutoff-1].cumulative.toFixed(1).replace('.',',')}% kumulatif (target 80%)`;
    node.append(summary);
    const scroll=document.createElement('div');scroll.className='dm-kpi-pareto-scroll';
    const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg');
    const width=Math.max(660,100+data.length*76),height=335,left=48,right=40,top=35,bottom=80;
    const plotW=width-left-right,plotH=height-top-bottom;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',width);svg.setAttribute('height',height);
    svg.setAttribute('role','img');svg.setAttribute('aria-label','Pareto frekuensi Redo Event per unit dengan garis kumulatif dan batas 80 persen');
    function element(tag,attrs,text){const e=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,String(v)));if(text!==undefined)e.textContent=text;svg.append(e);return e}
    for(let i=0;i<=4;i++){
      const y=top+plotH*(1-i/4);element('line',{x1:left,y1:y,x2:width-right,y2:y,stroke:'#e6edf3','stroke-width':1});
      element('text',{x:left-8,y:y+4,'text-anchor':'end',fill:'#69788b','font-size':11},String(Math.ceil(max*i/4)));
    }
    const y80=top+plotH*.2;
    element('line',{x1:left,y1:y80,x2:width-right,y2:y80,stroke:'#df8b26','stroke-width':1.5,'stroke-dasharray':'7 5'});
    element('text',{x:width-right+4,y:y80+4,fill:'#b36c12','font-size':11},'80%');
    const step=plotW/data.length,barW=Math.min(42,step*.58),points=[];
    data.forEach((x,i)=>{
      const cx=left+step*(i+.5),barH=x.count/max*plotH;
      const rect=element('rect',{x:cx-barW/2,y:top+plotH-barH,width:barW,height:barH,rx:5,fill:i<cutoff?'#008bca':'#aebfcf',tabindex:0,role:'button','aria-label':`${x.label}, ${x.count} catatan, kumulatif ${x.cumulative.toFixed(1)} persen. Lihat riwayat`});
      const show=()=>renderUnitHistory(x);rect.addEventListener('click',show);rect.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});
      const tip=document.createElementNS(NS,'title');tip.textContent=`${x.label}: ${x.count} event (${x.contribution.toFixed(1)}%), kumulatif ${x.cumulative.toFixed(1)}%`;rect.append(tip);
      element('text',{x:cx,y:top+plotH-barH-7,'text-anchor':'middle',fill:'#234055','font-size':12,'font-weight':700},x.count);
      element('text',{x:cx,y:top+plotH+20,'text-anchor':'middle',fill:'#455b70','font-size':11},x.label);
      const py=top+plotH*(1-x.cumulative/100);points.push([cx,py]);
    });
    element('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#ef9d26','stroke-width':3,'stroke-linejoin':'round'});
    points.forEach((p,i)=>{element('circle',{cx:p[0],cy:p[1],r:4,fill:'#ef9d26',stroke:'white','stroke-width':1.5});
      element('text',{x:p[0],y:p[1]-11,'text-anchor':'middle',fill:'#9a600c','font-size':10,'font-weight':700},`${data[i].cumulative.toFixed(0)}%`);
    });
    scroll.append(svg);node.append(scroll);
    const legend=document.createElement('p');legend.className='dm-kpi-pareto-legend';legend.textContent='Biru: unit hingga batas 80% · Abu-abu: lainnya · Garis oranye: kumulatif · Klik batang untuk riwayat unit';node.append(legend);
  }
  // Detail unit: hanya bukti DBR yang telah lolos pencocokan ketat dari backend.
  function renderUnitHistory(item){
    const node=el('dmKpiUnitHistory');clear(node);
    const history=safeArr(item.history).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
    const wrap=document.createElement('section');wrap.className='dm-kpi-investigation';
    const head=document.createElement('div');head.className='dm-kpi-investigation-head';
    const heading=document.createElement('div');
    const eyebrow=document.createElement('small');eyebrow.textContent='UNIT RELIABILITY INVESTIGATION';
    const title=document.createElement('h4');title.textContent=item.label+' · '+history.length+' Redo Event';
    heading.append(eyebrow,title);
    const close=document.createElement('button');close.type='button';close.className='dm-kpi-investigation-close';close.textContent='Tutup ×';close.addEventListener('click',()=>clear(node));
    head.append(heading,close);wrap.append(head);
    const intro=document.createElement('p');intro.textContent='Riwayat kejadian Redo pada periode terpilih. WO dan Actual Action hanya ditampilkan jika cocok dengan DBR. Jumlah event tidak otomatis sama dengan jumlah breakdown unik.';wrap.append(intro);
    if(!history.length){wrap.append(empty('Belum ada riwayat kejadian unit.'));node.append(wrap);return}
    const matched=history.filter(x=>x.matchStatus==='MATCHED').length;
    const ambiguous=history.filter(x=>x.matchStatus==='AMBIGUOUS').length;
    const stats=document.createElement('div');stats.className='dm-kpi-investigation-stats';
    [['Redo Event',history.length],['DBR matched',matched],['Perlu verifikasi',history.length-matched]].forEach(([k,v])=>{const b=document.createElement('div');const l=document.createElement('small');l.textContent=k;const strong=document.createElement('strong');strong.textContent=String(v);b.append(l,strong);stats.append(b)});wrap.append(stats);
    const hms=history.filter(x=>number(x.hm)!==null).map(x=>x.hm);
    const decreasing=hms.some((v,i)=>i>0&&v<hms[i-1]);
    const distinctProblems=new Set(history.map(x=>String(x.problem||'').trim().toUpperCase()).filter(Boolean));
    const warning=document.createElement('div');warning.className='dm-kpi-investigation-note';
    warning.textContent=(decreasing?'Peringatan kualitas data: HM menurun pada urutan tanggal; periksa pencatatan sebelum menghitung interval. ':'')+
      (ambiguous?'Ada '+ambiguous+' kejadian dengan kecocokan DBR ambigu. ':'')+
      'MTBF: belum dapat dihitung dari catatan Redo saja. Diperlukan urutan breakdown unscheduled unik dan HM yang tervalidasi.';
    wrap.append(warning);
    const summary=document.createElement('p');summary.className='dm-kpi-investigation-pattern';summary.textContent='Pola awal: '+distinctProblems.size+' deskripsi masalah berbeda dalam '+history.length+' catatan. Kesamaan sistem/komponen dan root cause memerlukan verifikasi mekanik/GL.';wrap.append(summary);
    const list=document.createElement('div');list.className='dm-kpi-investigation-list';
    history.forEach((x,i)=>{
      const card=document.createElement('article');card.className='dm-kpi-investigation-event';
      const top=document.createElement('div');top.className='dm-kpi-investigation-event-head';
      const name=document.createElement('strong');name.textContent='Event '+(i+1)+' · '+(x.date||'Tanggal tidak tersedia');
      const status=document.createElement('span');status.className='dm-kpi-match-status '+(x.matchStatus==='MATCHED'?'is-matched':'is-unmatched');status.textContent=x.matchStatus==='MATCHED'?'DBR MATCHED':x.matchStatus==='AMBIGUOUS'?'DBR AMBIGUOUS':'DBR UNMATCHED';top.append(name,status);card.append(top);
      const field=(label,value)=>{const line=document.createElement('p');const b=document.createElement('b');b.textContent=label+': ';line.append(b,document.createTextNode(String(value==null||value===''?'—':value)));card.append(line)};
      field('HM',number(x.hm)===null?'Belum tersedia':formatNumber(x.hm));field('Problem Description',x.problem||'Belum tersedia');
      field('WO Number',x.matchStatus==='MATCHED'?x.woNumber:'Belum terverifikasi');
      field('Actual Action',x.matchStatus==='MATCHED'?(x.actualAction||'Tidak tercatat pada baris DBR yang cocok'):'Belum terverifikasi');
      if(x.matchStatus==='MATCHED'){field('BD Type',x.breakdownType);field('Maintenance Type',x.maintenanceType)}
      field('Keterangan kecocokan',x.matchNote||'Data belum dapat dipastikan');list.append(card);
    });wrap.append(list);
    const next=document.createElement('div');next.className='dm-kpi-investigation-next';
    const nt=document.createElement('strong');nt.textContent='Arah investigasi PICA';next.append(nt);
    const ul=document.createElement('ul');
    ['Kelompokkan problem berdasarkan sistem/komponen setelah verifikasi teknis.','Bandingkan Actual Action dan temuan breakdown berikutnya pada WO yang berbeda.','Periksa penyebab dasar (komponen, metode, inspeksi, material, operasi) memakai evidence lapangan.','Tetapkan corrective/preventive action, PIC, target, lalu ukur kejadian berulang sesudah perbaikan.'].forEach(s=>{const li=document.createElement('li');li.textContent=s;ul.append(li)});next.append(ul);wrap.append(next);
    node.append(wrap);node.scrollIntoView({behavior:'smooth',block:'nearest'});
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
  // Prioritas berasal dari unit Pareto sampai titik potong 80%, bukan Top 3 problem.
  function renderPica(items){
    const node=el('dmKpiPicaList');clear(node);
    const source=safeArr(items).filter(x=>x&&typeof x.label==='string'&&number(x.count)!==null&&x.count>0);
    const map=new Map();
    source.forEach(x=>{const key=x.label.trim().toUpperCase().replace(/\s+/g,' ');if(!key)return;
      if(!map.has(key))map.set(key,{label:key,count:0,history:[]});
      const item=map.get(key);item.count+=x.count;item.history.push(...safeArr(x.history));
    });
    const units=[...map.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
    if(!units.length){node.append(empty('Belum ada Redo Event pada periode ini.'));return}
    const total=units.reduce((s,x)=>s+x.count,0);let sum=0;
    const priority=[];for(const unit of units){priority.push(unit);sum+=unit.count;if(sum/total>=.8)break}
    priority.forEach((unit,i)=>{
      const card=document.createElement('article');card.className='dm-kpi-pica-card dm-kpi-unit-priority-card';
      const rank=document.createElement('span');rank.className='dm-kpi-rank';rank.textContent='PRIORITAS '+(i+1)+' · '+unit.count+' Redo Event';
      const title=document.createElement('h4');title.textContent=unit.label;card.append(rank,title);
      const descriptions=[...new Set(unit.history.map(x=>String(x.problem||'').trim()).filter(Boolean))];
      const matched=unit.history.filter(x=>x.matchStatus==='MATCHED').length;
      const line=(label,value)=>{const p=document.createElement('p');const b=document.createElement('b');b.textContent=label+': ';p.append(b,document.createTextNode(value));card.append(p)};
      line('Kontribusi', (unit.count/total*100).toLocaleString('id-ID',{maximumFractionDigits:1})+'% dari '+total+' event');
      line('Problem tercatat',descriptions.length?descriptions.slice(0,3).join(' · ')+(descriptions.length>3?' · +'+(descriptions.length-3)+' lainnya':''):'Belum tersedia');
      line('DBR cocok',matched+' dari '+unit.history.length+' catatan');
      line('Root Cause','Belum terkonfirmasi — perlu investigasi dan evidence');
      line('MTBF','Belum dapat dihitung dari data Redo Event saja');
      const button=document.createElement('button');button.type='button';button.className='dm-kpi-priority-detail';button.textContent='Bedah riwayat & tindakan →';button.addEventListener('click',()=>renderUnitHistory(unit));card.append(button);node.append(card);
    });
  }
  function reset(){
    ['dmKpiAchievement','dmKpiPlan','dmKpiActual','dmKpiRedo'].forEach(id=>setText(id,'—'));
    setText('dmKpiRedoDetail','Mengikuti angka resmi Dashboard');
    el('dmKpiAchievementBar').style.width='0%';
    renderAchievementChart([]);renderBars('dmKpiEgiChart',[],false);renderPareto([]);
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
      renderAchievementChart(a.series);renderBars('dmKpiEgiChart',r.byEgi,false);renderPareto(r.byUnit);renderPica(r.byUnit);
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
