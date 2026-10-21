/* HEXA Draft Inspection — V3 stable, Manual Sync All only. */
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
  async function syncAll(){
    if(syncing||!navigator.onLine)return;
    syncing=true;
    if(syncButton){syncButton.disabled=true;syncButton.textContent='Syncing...';}
    const notice=document.getElementById('draftInfo');
    let successCount=0,failedCount=0;
    try{
      const items=(await window.HEXAOffline.list()).filter(x=>['pending','failed'].includes(x.status));
      for(const item of items){
        if(!navigator.onLine)break;
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
          } else {
            const message=String(result.message||'Server belum mengonfirmasi penyimpanan');
            // Jangan tandai sukses jika server tidak mengembalikan ID yang cocok.
            await window.HEXAOffline.updateStatus(item.id,'failed',{lastError:message});
            failedCount++;
          }
        }catch(error){
          // Jika respons jaringan hilang, status keberhasilan di server tidak diketahui.
          // Tetap pending: percobaan berikutnya aman karena clientRequestId sama.
          await window.HEXAOffline.updateStatus(item.id,'pending',{lastError:'Respons tidak diterima: '+error.message});
          failedCount++;
          if(!navigator.onLine)break;
        }
        await render();
      }
      if(notice)notice.textContent=`Sync selesai: ${successCount} berhasil, ${failedCount} belum berhasil. Data yang belum terkonfirmasi tetap tersimpan di perangkat.`;
    }catch(error){
      if(notice)notice.textContent='Sync gagal: '+error.message;
    }finally{
      syncing=false;
      if(syncButton)syncButton.textContent='Sync All';
      await render();
    }
  }
  syncButton?.addEventListener('click',syncAll);
  async function render(){
    list.replaceChildren();
    try {
      const items=await window.HEXAOffline.list();
      document.getElementById('countDraft').textContent=String(items.filter(x=>x.status==='draft').length);
      document.getElementById('countReady').textContent=String(items.filter(x=>x.status==='pending').length);
      document.getElementById('countFailed').textContent=String(items.filter(x=>x.status==='failed').length);
      if(syncButton)syncButton.disabled=syncing||!navigator.onLine||!items.some(x=>['pending','failed'].includes(x.status));
      const query=(search?.value||'').trim().toLowerCase();
      const filtered=items.filter(x=>(activeTab==='history'?x.status==='synced':x.status!=='synced')&&String(x.payload?.unitCode||'').toLowerCase().includes(query));
      if(!filtered.length){const empty=document.createElement('section');empty.className='draft-empty';empty.textContent=activeTab==='history'?'Belum ada Sync History':'Belum ada inspection offline yang menunggu sinkronisasi.';list.append(empty);return;}
      filtered.forEach(item=>{const card=document.createElement('article');card.style.cssText='background:white;border:1px solid #dbe4ed;border-radius:14px;padding:18px;margin-bottom:12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap';const content=document.createElement('div');const title=document.createElement('strong');title.textContent=item.payload?.unitCode||'Unit';const info=document.createElement('div');info.style.cssText='font-size:13px;color:#64748b;margin-top:5px';info.textContent=[item.payload?.problemDescription||'',item.payload?.rating||'',new Date(item.createdAt).toLocaleString('id-ID'),item.status==='pending'?'Pending Sync':item.status==='synced'?'Synced · '+(item.inspectionId||''):item.status].filter(Boolean).join(' • ');content.append(title,info);card.append(content);list.append(card);});
    } catch(e){const error=document.createElement('p');error.textContent='Gagal membaca draft lokal: '+e.message;list.append(error);}
  }
  document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{activeTab=button.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));});render();}));
  search?.addEventListener('input',render);
  function connection(){document.getElementById('draftConnection').textContent=navigator.onLine?'● Perangkat online':'● Perangkat offline';}
  window.addEventListener('online',()=>{connection();render();});window.addEventListener('offline',()=>{connection();render();});
  const notice=document.getElementById('draftInfo');if(notice)notice.textContent='Inspection offline disimpan di perangkat. Saat online, klik Sync All untuk mengirim seluruh antrean.';
  connection();render();

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
