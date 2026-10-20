/* HEXA Offline Queue v1 — per-account IndexedDB. Sync backend will be enabled after server idempotency. */
'use strict';
window.HEXAOffline = (() => {
 const DB='HEXA_OFFLINE_INSPECTIONS_V1', STORE='inspections';
 function owner(){let u;try{u=JSON.parse(sessionStorage.getItem('hexaUser')||'null')}catch(_){};const id=String(u?.uniqId||u?.userId||'').trim();if(sessionStorage.getItem('hexaLoggedIn')!=='true'||!id)throw Error('Sesi HEXA tidak valid');return id;}
 function open(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window))return reject(Error('IndexedDB tidak tersedia'));const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('owner','owner',{unique:false});}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 async function operation(mode,fn){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const s=tx.objectStore(STORE);let output;try{output=fn(s,resolve,reject)}catch(e){db.close();reject(e);return;}tx.oncomplete=()=>{db.close();if(output!==undefined)resolve(output)};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error||Error('Penyimpanan dibatalkan'))};});}
 async function put(payload){const id=crypto.randomUUID();const item={id,owner:owner(),type:'start-inspection',status:'pending',createdAt:new Date().toISOString(),payload};await operation('readwrite',s=>s.put(item));return item;}
 async function list(){const id=owner();return operation('readonly',(s,resolve)=>{const req=s.index('owner').getAll(id);req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));});}
 async function get(key){const id=owner();return operation('readonly',(s,resolve)=>{const req=s.get(key);req.onsuccess=()=>resolve(req.result?.owner===id?req.result:null);});}
 return {owner,put,list,get};
})();
