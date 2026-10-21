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
  // Konfirmasi foto opsional, hanya ketika pengguna menekan Sync All.
  async function confirmMissingPhotos(items){
    const missing=items.filter(x=>!String(x.payload?.photoBase64||'').trim());
    if(!missing.length)return true;
    return new Promise(resolve=>{
      const overlay=document.createElement('div');
      overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.70);display:flex;align-items:center;justify-content:center;padding:18px;';
      const card=document.createElement('div');
      card.style.cssText='background:white;border-radius:20px;max-width:390px;width:100%;overflow:hidden;box-shadow:0 24px 80px #0004;font-family:Arial,sans-serif;';
      const head=document.createElement('div');head.style.cssText='background:#171717;color:white;padding:17px 20px;font-weight:800;';head.textContent='⚠ HEXA • Inspection Sync';
      const body=document.createElement('div');body.style.cssText='padding:22px;color:#27313a;text-align:center;';
      const icon=document.createElement('div');icon.style.cssText='font-size:36px;margin-bottom:8px;';icon.textContent='📷';
      const title=document.createElement('h3');title.style.cssText='margin:0 0 12px;font-size:19px;';title.textContent='Foto Belum Terlampir';
      const detail=document.createElement('p');detail.style.cssText='font-size:14px;line-height:1.55;margin:0 0 10px;';detail.textContent=`${missing.length} dari ${items.length} inspeksi belum memiliki foto.`;
      const units=document.createElement('p');units.style.cssText='background:#fff6e9;border-radius:10px;padding:10px;font-size:13px;overflow-wrap:anywhere;';units.textContent=missing.map(x=>x.payload?.unitCode||'Unit').join(' • ');
      const question=document.createElement('p');question.style.cssText='font-size:14px;line-height:1.5;';question.textContent='Tetap lanjutkan sinkronisasi tanpa foto? Pilih Tidak untuk mengedit foto terlebih dahulu.';
      const buttons=document.createElement('div');buttons.style.cssText='display:flex;gap:10px;margin-top:18px;';
      const no=document.createElement('button');no.type='button';no.textContent='Tidak';no.style.cssText='flex:1;border:1px solid #cbd5e1;border-radius:10px;padding:12px;background:white;cursor:pointer;font-weight:700;';
      const yes=document.createElement('button');yes.type='button';yes.textContent='Ya, Sync All';yes.style.cssText='flex:1;border:0;border-radius:10px;padding:12px;background:#f59e0b;color:white;cursor:pointer;font-weight:700;';
      const done=value=>{overlay.remove();resolve(value)};
      no.addEventListener('click',()=>done(false));yes.addEventListener('click',()=>done(true));
      buttons.append(no,yes);body.append(icon,title,detail,units,question,buttons);card.append(head,body);overlay.append(card);document.body.append(overlay);no.focus();
    });
  }
  // Edit foto lokal tanpa mengganti ID antrean (clientRequestId tetap sama).
  async function replaceOfflinePhoto(id,file){
    if(!file||!file.type.startsWith('image/'))throw Error('Pilih file gambar');
    const dataUrl=await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Foto tidak dapat dibaca'));reader.readAsDataURL(file);
    });
    const photo=await new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>{
        try{const scale=Math.min(1,1600/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.75));}catch(e){reject(e)}
      };image.onerror=()=>reject(Error('Gambar tidak dapat diproses'));image.src=dataUrl;
    });
    const userOwner=window.HEXAOffline.owner();
    await new Promise((resolve,reject)=>{
      const req=indexedDB.open('HEXA_OFFLINE_INSPECTIONS_V1',2);
      req.onerror=()=>reject(req.error);
      req.onsuccess=()=>{
        const db=req.result;const tx=db.transaction('inspections','readwrite');const store=tx.objectStore('inspections');const get=store.get(id);
        get.onsuccess=()=>{
          const item=get.result;
          if(!item||item.owner!==userOwner||item.status==='synced'){tx.abort();return;}
          store.put({...item,status:'pending',lastError:'',payload:{...item.payload,photoBase64:photo,photoMimeType:'image/jpeg'}});
        };
        tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(Error('Data tidak dapat diedit'))};
      };
    });
  }
  async function syncAll(){
    if(syncing||!navigator.onLine)return;
    let items;
    try{
      items=(await window.HEXAOffline.list()).filter(x=>['pending','failed'].includes(x.status));
      if(!items.length)return;
      if(!await confirmMissingPhotos(items))return;
    }catch(error){alert('Gagal memeriksa antrean: '+error.message);return;}
    syncing=true;
    if(syncButton){syncButton.disabled=true;syncButton.textContent='Syncing...';}
    const notice=document.getElementById('draftInfo');
    let successCount=0,failedCount=0;
    try{
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
      filtered.forEach(item=>{const card=document.createElement('article');card.style.cssText='background:white;border:1px solid #dbe4ed;border-radius:14px;padding:18px;margin-bottom:12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap';const content=document.createElement('div');const title=document.createElement('strong');title.textContent=item.payload?.unitCode||'Unit';const info=document.createElement('div');info.style.cssText='font-size:13px;color:#64748b;margin-top:5px';info.textContent=[item.payload?.problemDescription||'',item.payload?.rating||'',new Date(item.createdAt).toLocaleString('id-ID'),item.status==='pending'?'Pending Sync':item.status==='synced'?'Synced · '+(item.inspectionId||''):item.status].filter(Boolean).join(' • ');content.append(title,info);card.append(content);
        if(item.status!=='synced'){
          const edit=document.createElement('button');edit.type='button';edit.textContent='✎ Edit';
           edit.style.cssText='background:#fff7ed;color:#c65f00;border:1px solid #f5c58c;border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:700;';
           edit.addEventListener('click',()=>{
             window.location.href='start-inspection.html?edit='+encodeURIComponent(item.id);
           });card.append(edit);
        }
        list.append(card);});
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
