/* HEXA Draft Inspection — TAHAP 2: tampilan saja.
   Belum membaca/menyimpan form dan belum mengirim ke server.
   Jangan menganggap tombol Sync sudah berfungsi. */
'use strict';
(function(){
  const loggedIn=sessionStorage.getItem('hexaLoggedIn');
  const raw=sessionStorage.getItem('hexaUser');
  if(loggedIn!=='true'||!raw){window.location.replace('index.html');return;}
  let user;
  try{user=JSON.parse(raw);if(!user||typeof user!=='object')throw Error('invalid user');}
  catch(_){window.location.replace('index.html');return;}
  const accountId=user.userId||user.userID||user.userid||user.id||user.username||user.nik||user.NIK;
  const accountName=user.name||user.nama||user.fullName||accountId;
  document.getElementById('draftAccount').textContent=accountName?String(accountName):'Akun HEXA';
  const list=document.getElementById('draftList');
  const search=document.getElementById('draftSearch');
  const type=document.getElementById('draftType');
  let activeTab='pending';
  function render(){
    list.replaceChildren();
    const wrap=document.createElement('section');wrap.className='draft-empty';
    const symbol=document.createElement('div');symbol.className='symbol';symbol.textContent=activeTab==='pending'?'📋':'✓';
    const heading=document.createElement('h2');heading.textContent=activeTab==='pending'?'Belum ada draft yang terhubung':'Belum ada riwayat sinkronisasi';
    const note=document.createElement('p');note.textContent=activeTab==='pending'?'Halaman sudah siap. Daftar akan muncul setelah penyimpanan lokal Start Inspection dan Daily Inspection diintegrasikan.':'Riwayat akan tercatat setelah backend mengonfirmasi pengiriman berhasil.';
    wrap.append(symbol,heading,note);list.append(wrap);
  }
  document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{
    activeTab=button.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));});
    render();
  }));
  search.addEventListener('input',render);type.addEventListener('change',render);
  function connection(){document.getElementById('draftConnection').textContent=navigator.onLine?'● Perangkat online':'● Perangkat offline';}
  window.addEventListener('online',connection);window.addEventListener('offline',connection);
  connection();render();
})();
