/* HEXA Draft Inspection — V3 Stable + Manual Sync All + KPI original nut animation.
   Tidak menjalankan Auto Sync. Backend anti-duplikat wajib terpasang. */
'use strict';
(function(){
  const loggedIn=sessionStorage.getItem('hexaLoggedIn');
  const raw=sessionStorage.getItem('hexaUser');
  if(loggedIn!=='true'||!raw){window.location.replace('index.html');return;}
  let user;
  try{user=JSON.parse(raw);if(!user||typeof user!=='object')throw Error('invalid user');}
  catch(_){window.location.replace('index.html');return;}
  const accountId=user.userId||user.userID||user.userid||user.id||user.username||user.nik||user.NIK;
  const list=document.getElementById('draftList');
  const search=document.getElementById('draftSearch');
  let activeTab='pending';
  const API_URL='https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
  const syncButton=document.getElementById('syncAll');
  let syncing=false;
  // Pop-up meniru SVG mur dan tampilan upload KPI Achievement DM.
  let syncModal=null, syncModalPhaseTimer=null;
  function showSyncModal(total){
    if(!syncModal){
      const style=document.createElement('style');
      style.textContent=`
        #hexaSyncOverlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:#10232bb5;backdrop-filter:blur(5px)}
        #hexaSyncOverlay .kpi-progress-card{width:min(100%,460px);max-height:90vh;overflow-y:auto;background:white;padding:25px;border-radius:24px;text-align:center;box-shadow:0 20px 70px #0004;font-family:Arial,Helvetica,sans-serif;color:#26313a}
        #hexaSyncOverlay .kpi-nut-visual{height:125px;display:grid;place-items:center;position:relative}
        #hexaSyncOverlay .kpi-nut{grid-area:1/1;width:108px;height:108px;margin:0}
        #hexaSyncOverlay .kpi-nut g{transform-origin:60px 60px;animation:none}
        #hexaSyncOverlay .kpi-nut-visual.processing .kpi-nut g{animation:hexa-sync-kpi-nut-spin 1.4s linear infinite}
        @keyframes hexa-sync-kpi-nut-spin{to{transform:rotate(360deg)}}
        #hexaSyncOverlay .kpi-result-icon{grid-area:1/1;width:88px;height:88px;display:none;border-radius:50%;padding:20px;fill:none;stroke:white;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
        #hexaSyncOverlay .kpi-nut-visual.success .kpi-nut,#hexaSyncOverlay .kpi-nut-visual.failure .kpi-nut{display:none}
        #hexaSyncOverlay .kpi-nut-visual.success .kpi-result-icon{display:block;background:#13a774}
        #hexaSyncOverlay .kpi-nut-visual.failure .kpi-result-icon{display:block;background:#dc4c4c}
        #hexaSyncOverlay .kpi-stage-label{margin:2px 0 12px;font-size:17px;font-weight:800}
        #hexaSyncOverlay .kpi-progress-track{height:9px;border-radius:30px;overflow:hidden;background:#e7edf0;margin-top:15px}
        #hexaSyncOverlay .kpi-progress-track>div{width:0;height:100%;border-radius:30px;background:linear-gradient(90deg,#ffc12b,#ff7a00);transition:width .25s}
        #hexaSyncOverlay .kpi-progress-meta{display:flex;justify-content:space-between;align-items:center;margin:8px 0 14px;color:#71808b;font-size:12px;font-weight:700}
        #hexaSyncOverlay .kpi-result-label{margin:12px 0 4px;font-weight:800;font-size:17px}
        #hexaSyncOverlay .kpi-result-message{font-size:13px;color:#72808a;line-height:1.55;overflow-wrap:anywhere;margin:0 0 15px}
        #hexaSyncOverlay .kpi-secondary{border:1px solid #cbdfe3;border-radius:11px;background:#fff;color:#31748a;padding:12px 24px;font-weight:800;cursor:pointer}
        #hexaSyncOverlay .kpi-secondary[hidden]{display:none}
        @media(prefers-reduced-motion:reduce){#hexaSyncOverlay .kpi-nut-visual.processing .kpi-nut g{animation-duration:4s}}
      `;
      document.head.appendChild(style);
      syncModal=document.createElement('div');
      syncModal.id='hexaSyncOverlay';
      syncModal.setAttribute('role','dialog');
      syncModal.setAttribute('aria-modal','true');
      syncModal.setAttribute('aria-label','Proses sinkronisasi inspeksi');
      syncModal.innerHTML=`<div class="kpi-progress-card">
        <div class="kpi-nut-visual processing" id="hexaSyncNutVisual" aria-hidden="true">
          <svg class="kpi-nut" viewBox="0 0 120 120">
            <defs><linearGradient id="hexaSyncNutGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffdc49"/><stop offset=".5" stop-color="#ff9e0c"/><stop offset="1" stop-color="#e86c00"/></linearGradient></defs>
            <g><path fill="url(#hexaSyncNutGold)" fill-rule="evenodd" d="M60 6 106.8 33 106.8 87 60 114 13.2 87 13.2 33Z M60 37a23 23 0 1 0 0 46 23 23 0 1 0 0-46Z" stroke="#e7a00b" stroke-width="2"/></g>
          </svg>
          <svg class="kpi-result-icon" viewBox="0 0 24 24"><path id="hexaSyncResultPath" d="M5 12l4 4L19 6"/></svg>
        </div>
        <p id="hexaSyncStage" class="kpi-stage-label" role="status" aria-live="polite">Sync in Process</p>
        <div class="kpi-progress-track"><div id="hexaSyncProgressBar"></div></div>
        <div class="kpi-progress-meta"><span id="hexaSyncProgressStep">Inspection 1/${total}</span><span id="hexaSyncProgressPercent">0%</span></div>
        <p id="hexaSyncResultTitle" class="kpi-result-label" role="status"></p>
        <p id="hexaSyncResultText" class="kpi-result-message">Jangan tutup halaman sampai proses selesai.</p>
        <button id="hexaSyncClose" class="kpi-secondary" type="button" hidden>Tutup</button>
      </div>`;
      syncModal.querySelector('#hexaSyncClose').addEventListener('click',()=>syncModal.remove());
    }
    document.body.appendChild(syncModal);
    syncModal.querySelector('#hexaSyncNutVisual').className='kpi-nut-visual processing';
    syncModal.querySelector('#hexaSyncStage').textContent='Sync in Process';
    syncModal.querySelector('#hexaSyncProgressStep').textContent=`Inspection 1/${total}`;
    syncModal.querySelector('#hexaSyncProgressBar').style.width='0%';
    syncModal.querySelector('#hexaSyncProgressPercent').textContent='0%';
    syncModal.querySelector('#hexaSyncResultTitle').textContent='';
    syncModal.querySelector('#hexaSyncResultText').textContent='Jangan tutup halaman sampai proses selesai.';
    syncModal.querySelector('#hexaSyncClose').hidden=true;
    let phase=0;
    clearInterval(syncModalPhaseTimer);
    syncModalPhaseTimer=setInterval(()=>{
      phase++;
      if(syncModal.isConnected)syncModal.querySelector('#hexaSyncStage').textContent=phase%2?'Saving to Database':'Sync in Process';
    },1000);
  }
  function updateSyncModal(completed,total){
    if(!syncModal||!syncModal.isConnected)return;
    syncModal.querySelector('#hexaSyncProgressStep').textContent=completed===total?`Inspection ${total}/${total}`:`Inspection ${completed+1}/${total}`;
    const percent=Math.round(completed/total*100);
    syncModal.querySelector('#hexaSyncProgressBar').style.width=percent+'%';
    syncModal.querySelector('#hexaSyncProgressPercent').textContent=percent+'%';
  }
  function closeSyncModal(successCount,failedCount){
    clearInterval(syncModalPhaseTimer);
    syncModalPhaseTimer=null;
    if(!syncModal||!syncModal.isConnected)return;
    const ok=failedCount===0;
    syncModal.querySelector('#hexaSyncNutVisual').className='kpi-nut-visual '+(ok?'success':'failure');
    syncModal.querySelector('#hexaSyncResultPath').setAttribute('d',ok?'M5 12l4 4L19 6':'M6 6l12 12M18 6L6 18');
    syncModal.querySelector('#hexaSyncStage').textContent=ok?'Sync Completed':'Sync Belum Lengkap';
    syncModal.querySelector('#hexaSyncResultTitle').textContent=ok?'Sinkronisasi berhasil':'Periksa data yang belum tersinkron';
    syncModal.querySelector('#hexaSyncResultText').textContent=`${successCount} berhasil, ${failedCount} belum berhasil. Data yang gagal tetap tersimpan di perangkat.`;
    syncModal.querySelector('#hexaSyncClose').hidden=false;
  }
  async function syncAll(){
    if(syncing)return;
    if(!navigator.onLine){
      const notice=document.getElementById('draftInfo');
      if(notice)notice.textContent='Perangkat masih offline. Sambungkan internet lalu tekan Sync All.';
      return;
    }
    syncing=true;
    if(syncButton){syncButton.disabled=true;syncButton.textContent='Syncing...';}
    const notice=document.getElementById('draftInfo');
    let successCount=0,failedCount=0;
    try{
      const items=(await window.HEXAOffline.list()).filter(x=>['pending','failed'].includes(x.status));
      if(!items.length){
        if(notice)notice.textContent='Tidak ada inspeksi yang menunggu sinkronisasi.';
        return;
      }
      showSyncModal(items.length);
      if(notice)notice.textContent=`Memproses 0 dari ${items.length} inspeksi...`;
      for(let index=0;index<items.length;index++){
        const item=items[index];
        if(!navigator.onLine){
          if(notice)notice.textContent='Koneksi terputus. Data yang belum dikirim tetap tersimpan.';
          break;
        }
        try{
          const response=await fetch(API_URL,{
            method:'POST',
            headers:{'Content-Type':'text/plain;charset=utf-8'},
            body:JSON.stringify({...item.payload,action:'syncOfflineInspection',clientRequestId:item.id})
          });
          if(!response.ok)throw Error('HTTP '+response.status);
          const result=await response.json();
          if(result.success && result.clientRequestId===item.id && result.inspectionId){
            await window.HEXAOffline.updateStatus(item.id,'synced',{
              inspectionId:result.inspectionId,syncedAt:new Date().toISOString(),lastError:''
            });
            successCount++;
          }else{
            const message=String(result.message||'Server belum mengonfirmasi penyimpanan');
            await window.HEXAOffline.updateStatus(item.id,'failed',{lastError:message});
            failedCount++;
          }
        }catch(error){
          await window.HEXAOffline.updateStatus(item.id,'pending',{
            lastError:'Respons tidak diterima: '+error.message
          });
          failedCount++;
        }
        if(notice)notice.textContent=`Memproses ${index+1} dari ${items.length} inspeksi... (${successCount} berhasil)`;
        updateSyncModal(index+1,items.length);
        await render();
      }
      const remaining=(await window.HEXAOffline.list()).filter(x=>['pending','failed'].includes(x.status)).length;
      if(notice)notice.textContent=`Sync selesai: ${successCount} berhasil, ${remaining} masih menunggu. Data yang belum terkonfirmasi tetap tersimpan di perangkat.`;
    }catch(error){
      if(notice)notice.textContent='Sync gagal: '+error.message;
    }finally{
      if(syncModal?.isConnected)closeSyncModal(successCount,failedCount);
      syncing=false;
      if(syncButton)syncButton.textContent='Sync All';
      await render();
    }
  }
  syncButton?.addEventListener('click',syncAll);
  async function render(){
    if(!list)return;
    list.replaceChildren();
    try{
      const items=await window.HEXAOffline.list();
      document.getElementById('countDraft').textContent=String(items.filter(x=>x.status==='draft').length);
      document.getElementById('countReady').textContent=String(items.filter(x=>x.status==='pending').length);
      document.getElementById('countFailed').textContent=String(items.filter(x=>x.status==='failed').length);
      if(syncButton)syncButton.disabled=syncing||!navigator.onLine||!items.some(x=>['pending','failed'].includes(x.status));
      const query=(search?.value||'').trim().toLowerCase();
      const filtered=items.filter(x=>(activeTab==='history'?x.status==='synced':x.status!=='synced')&&String(x.payload?.unitCode||'').toLowerCase().includes(query));
      if(!filtered.length){const empty=document.createElement('section');empty.className='draft-empty';empty.textContent=activeTab==='history'?'Belum ada Sync History':'Belum ada inspection offline yang menunggu sinkronisasi.';list.append(empty);return;}
      filtered.forEach(item=>{const card=document.createElement('article');card.style.cssText='background:white;border:1px solid #dbe4ed;border-radius:14px;padding:18px;margin-bottom:12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap';const content=document.createElement('div');const title=document.createElement('strong');title.textContent=item.payload?.unitCode||'Unit';const info=document.createElement('div');info.style.cssText='font-size:13px;color:#64748b;margin-top:5px';info.textContent=[item.payload?.problemDescription||'',item.payload?.rating||'',new Date(item.createdAt).toLocaleString('id-ID'),item.status==='pending'?'Pending Sync':item.status==='synced'?'Synced · '+(item.inspectionId||''):item.status].filter(Boolean).join(' • ');content.append(title,info);card.append(content);list.append(card);});
    }catch(e){const error=document.createElement('p');error.textContent='Gagal membaca draft lokal: '+e.message;list.append(error);}
  }
  document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{activeTab=button.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));});render();}));
  search?.addEventListener('input',render);
  let lastConnectionState=null;
  function connection(){
    const online=navigator.onLine;
    const indicator=document.getElementById('draftConnection');
    if(indicator)indicator.textContent=online?'● Perangkat online':'● Perangkat offline';
    if(lastConnectionState!==online){lastConnectionState=online;render();}
  }
  window.addEventListener('online',connection);
  window.addEventListener('offline',connection);
  // Beberapa browser tidak mengirim event online saat jaringan pulih.
  // Polling hanya memperbarui indikator dan tombol, tidak memanggil syncAll.
  setInterval(connection,5000);
  const notice=document.getElementById('draftInfo');
  if(notice)notice.textContent='Inspection offline tersimpan di perangkat. Setelah online, tekan Sync All untuk mengirim seluruh antrean.';
  connection();

  // Floating Start Inspection shortcut, mengikuti perilaku Daily Maintenance.
  const shortcut = document.getElementById('inspectionShortcut');
  if (shortcut) {
    const positionKey = 'hexaInspectionButtonPosition';
    let drag = null;
    let suppressClick = false;
    const clamp = (x, y) => ({
      left: Math.max(0, Math.min(window.innerWidth - shortcut.offsetWidth, x)),
      top: Math.max(0, Math.min(window.innerHeight - shortcut.offsetHeight, y))
    });
    function move(x, y) {
      const pos = clamp(x, y);
      shortcut.style.left = pos.left + 'px';
      shortcut.style.top = pos.top + 'px';
      shortcut.style.right = 'auto';
      shortcut.style.bottom = 'auto';
    }
    try {
      const saved = JSON.parse(localStorage.getItem(positionKey) || 'null');
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        move(saved.left, saved.top);
      }
    } catch (_) {}
    shortcut.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const rect = shortcut.getBoundingClientRect();
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY,
               left: rect.left, top: rect.top, moved: false };
      shortcut.setPointerCapture?.(event.pointerId);
    });
    shortcut.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) <= 5) return;
      drag.moved = true;
      move(drag.left + dx, drag.top + dy);
    });
    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.moved) {
        suppressClick = true;
        const rect = shortcut.getBoundingClientRect();
        try { localStorage.setItem(positionKey, JSON.stringify({left:rect.left,top:rect.top})); } catch (_) {}
      }
      drag = null;
    }
    shortcut.addEventListener('pointerup', endDrag);
    shortcut.addEventListener('pointercancel', endDrag);
    shortcut.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      window.location.href = 'start-inspection.html';
    });
    window.addEventListener('resize', () => {
      if (shortcut.style.left) {
        const rect = shortcut.getBoundingClientRect();
        move(rect.left, rect.top);
      }
    });
  }
})();
