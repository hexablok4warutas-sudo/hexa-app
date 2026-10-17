"use strict";
/* HEXA - Greasing Anti Lineboring
   Revisi: menggunakan fetch POST JSON seperti Start Inspection.
   Tidak lagi menggunakan iframe / postMessage.
   PENTING: Login sessionStorage bukan autentikasi API. Pastikan izin
   endpoint divalidasi di backend sebelum dipakai secara operasional.
*/
const GAL_API_URL = "https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec";
if (sessionStorage.getItem('hexaLoggedIn') !== 'true' || !sessionStorage.getItem('hexaUser')) {
  location.replace('index.html');
}
const galUser = (() => { try { return JSON.parse(sessionStorage.getItem('hexaUser') || '{}'); } catch { return {}; } })();
const el = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const username = () => String(galUser.nama || galUser.NAMA || galUser.name || galUser.userId || galUser.USER_ID || 'HEXA User');
const date = s => { if (!s) return '-'; const d = new Date(s); return isNaN(d.getTime()) ? String(s) : d.toLocaleString('id-ID', {dateStyle:'medium',timeStyle:'short'}); };
let records = [], selectedId = '', apiReady = false;
let galEditingId = '', galDeletingId = '';
let galExpanded = false, galPage = 0, galMasterRows = [];
const galComponentFields = [['greasePump','Grease Pump'],['oilPump','Oil Pump'],['controlUnit','Control Unit'],['lines','Lines'],['injectors','Injectors'],['greaseDrum','Grease Drum']];
const galLevel = String(galUser.level ?? galUser.LEVEL ?? galUser.roleCode ?? galUser.role ?? galUser.ROLE ?? '').trim().toUpperCase();
const galCanManage = ['1','2','3','MASTER','SECTION','SECTION HEAD','GROUP LEADER'].includes(galLevel);
const galCanEdit = galCanManage || ['4','5','ADMIN','MECHANIC'].includes(galLevel);
const galCanFollow = galLevel !== '6' && galLevel !== 'VISITOR';
// Untuk mutasi backend, isi token autentikasi yang benar dari sistem login HEXA.
const galAuthToken = () => sessionStorage.getItem('hexaAuthToken') || '';

const configured = () => GAL_API_URL.startsWith('https://script.google.com/macros/s/') && GAL_API_URL.endsWith('/exec');

async function api(payload) {
  let response;
  try {
    response = await fetch(GAL_API_URL, {
      method: 'POST',
      headers: {'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
  } catch (error) {
    throw new Error('Koneksi API gagal: ' + error.message);
  }
  if (!response.ok) throw new Error('HTTP ' + response.status + ' saat menghubungi API.');
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error('Respons API bukan JSON. Periksa URL deployment dan izin Web App.'); }
  if (!data || data.success !== true) throw new Error(data?.message || data?.error || 'API mengembalikan status gagal.');
  return data;
}

function fileData(file) {
  return new Promise((resolve, reject) => {
    if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) return reject(Error('Pilih foto JPEG, PNG, atau WebP.'));
    if (file.size > 4 * 1024 * 1024) return reject(Error('Foto maksimal 4 MB. Kompres foto dahulu.'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(Error('Gagal membaca foto.'));
    reader.readAsDataURL(file);
  });
}
// URL foto: utamakan thumbnail Google Drive berdasarkan File ID.
function galDriveId(url) {
  const value = String(url || '').trim();
  const match = value.match(/\/file\/d\/([A-Za-z0-9_-]+)|[?&]id=([A-Za-z0-9_-]+)|\/d\/([A-Za-z0-9_-]+)|^([A-Za-z0-9_-]{20,})$/);
  return match ? (match[1] || match[2] || match[3] || match[4]) : '';
}
function galThumbnail(url) {
  const id = galDriveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200` : String(url || '').trim();
}
function photo(url, alt, fallbackId = '') {
  const original = String(url || '').trim();
  // Foto HEX 1212 diverifikasi langsung dari link file yang diberikan.
  const primary = galThumbnail(original || fallbackId);
  if (!primary) return '';
  const driveId = galDriveId(original);
  const fallback = fallbackId && fallbackId !== driveId
    ? galThumbnail(fallbackId) : '';
  return `<button type="button" class="gal-photo-button" data-photo="${esc(primary)}" data-photo-fallback="${esc(fallback)}"><img loading="lazy" class="gal-photo" src="${esc(primary)}" alt="${esc(alt)}"></button>`;
}
function galPartsFromValue(value) {
  if (Array.isArray(value)) return value;
  const s = String(value || '').trim();
  if (!s) return [];
  try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) return parsed; } catch (_) {}
  return [{name:s, spec:'', qty:1}];
}
function galPartsLabel(value) {
  const parts = galPartsFromValue(value);
  return parts.length ? parts.map(p => [p.name, p.spec ? '(' + p.spec + ')' : '', p.qty ? '× ' + p.qty : ''].filter(Boolean).join(' ')).join('\n') : '-';
}
function galAddPartRow(part = {}) {
  const row = document.createElement('div'); row.className = 'gal-part-row';
  row.innerHTML = `<div class="gal-part-head"><strong>Part</strong><button type="button" class="gal-remove-part" aria-label="Hapus part">✕</button></div><div class="gal-part-grid"><label>Nama Part<input class="gal-part-name" placeholder="Elbow Connector" required></label><label>Part No / Spesifikasi<input class="gal-part-spec" placeholder="Nomor / ukuran"></label><label>Jumlah<input class="gal-part-qty" type="number" min="1" step="1" required></label></div>`;
  row.querySelector('.gal-part-name').value = part.name || '';
  row.querySelector('.gal-part-spec').value = part.spec || '';
  row.querySelector('.gal-part-qty').value = part.qty || 1;
  row.querySelector('.gal-remove-part').onclick = () => row.remove();
  el('galParts').appendChild(row);
}
function galReadParts() {
  return [...el('galParts').querySelectorAll('.gal-part-row')].map(row => ({
    name:row.querySelector('.gal-part-name').value.trim(),
    spec:row.querySelector('.gal-part-spec').value.trim(),
    qty:Number(row.querySelector('.gal-part-qty').value)
  }));
}
function galOpenEditor(r = null) {
  galEditingId = r?.id || '';
  el('galNewForm').reset(); el('galParts').replaceChildren();
  el('galFormTitle').textContent = r ? 'Edit Autolube Problem' : 'New Autolube Problem';
  el('galSaveNew').textContent = r ? 'Save Changes' : 'Save Problem';
  el('galSaveNew').dataset.label = el('galSaveNew').textContent;
  el('galUnit').value = r?.unit || '';
  el('galUnitSearch').value = r?.unit || '';
  el('galProblem').value = r?.problem || '';
  el('galCategory').value = r?.category || '';
  el('galCondition').value = r?.condition === 'BROKEN' ? 'BROKEN' : 'WARNING';
  el('galRecommendation').value = r?.recommendation || '';
  galPartsFromValue(r?.part).forEach(galAddPartRow);
  closeGalUnitOptions(); el('galNewMessage').textContent = '';
  el('galNewDialog').showModal();
  if (!galUnitsLoaded && !galUnitsLoading) galUnitsLoading = loadUnits().catch(error => {
    el('galNewMessage').textContent = 'Gagal memuat Code Unit: ' + error.message;
  }).finally(() => {galUnitsLoading = null;});
}
function card(r) {
  const histories = r.followUps || [], closed = r.status === 'CLOSE';
  const actions = `<div class="gal-card-top-actions"><span class="gal-badge ${closed?'close':'open'}">${esc(r.status)}</span>${galCanEdit ? `<button type="button" class="gal-icon-action" data-edit="${esc(r.id)}" title="Edit problem" aria-label="Edit problem">✎</button>` : ''}${galCanManage ? `<button type="button" class="gal-icon-action delete" data-delete="${esc(r.id)}" title="Hapus problem" aria-label="Hapus problem">🗑</button>` : ''}</div>`;
  return `<article class="gal-card"><div class="gal-card-top"><div><h3>${esc(r.unit)}</h3><div class="gal-date">${date(r.createdAt)} · ${esc(r.createdBy)}</div></div>${actions}</div><div class="gal-field"><small>Problem Autolube</small><p class="gal-problem-text" role="button" tabindex="0" aria-label="Tampilkan atau ringkas deskripsi problem" title="Klik untuk baca seluruhnya"><strong>${esc(r.problem)}</strong></p><div class="gal-condition-label">${!closed ? (r.condition==='BROKEN'?'🔴 Not Function':'🟠 Function with Notes') : '🟢 Closed'}</div></div><div class="gal-field">${photo(r.damagePhoto,'Foto kerusakan',r.unit==='HEX 1212' && /leaking injector/i.test(r.problem) ? '1pedIEH3FjZefc7bTd1Kjay779K_fZl0j' : '')}</div><div class="gal-card-cols"><div class="gal-field"><small>Required Part</small><p>${esc(galPartsLabel(r.part))}</p></div><div class="gal-field"><small>Recommended Follow Up</small><p>${esc(r.recommendation || '-')}</p></div></div>${histories.length ? `<details class="gal-history"><summary>Follow Up (${histories.length})</summary>${histories.map(h => `<div class="gal-history-item"><small>${date(h.date)} · ${esc(h.by)}</small><p>${esc(h.action)}</p><span class="gal-result ${esc(String(h.result).toLowerCase())}">${esc(h.result)}</span>${photo(h.evidence,'Evidence follow up')}</div>`).join('')}</details>` : ''}<div class="gal-card-footer">${!closed && galCanFollow ? `<button type="button" class="gal-primary" data-follow="${esc(r.id)}">+ Follow Up</button>` : ''}</div></article>`;
}

function render() {
  el('galTotal').textContent = records.length;
  el('galOpen').textContent = records.filter(r => r.status === 'OPEN').length;
  el('galClose').textContent = records.filter(r => r.status === 'CLOSE').length;
  const q = el('galSearch').value.trim().toLowerCase(), status = el('galStatus').value;
  const visible = records.filter(r => (status === 'ALL' || r.status === status) && (!q || [r.unit,r.problem,r.part,r.recommendation].some(s => String(s || '').toLowerCase().includes(q))));
  const pageSize = galExpanded ? 6 : 3;
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  galPage = Math.min(galPage, pages - 1);
  const shown = visible.slice(galPage * pageSize, (galPage + 1) * pageSize);
  el('galCards').innerHTML = shown.length ? shown.map(card).join('') : '<div class="gal-empty">Belum ada problem yang sesuai.</div>';
  el('galPageLabel').textContent = `${visible.length ? galPage+1 : 0} / ${visible.length ? pages : 0} · ${visible.length} problem`;
  el('galPrev').disabled = galPage === 0; el('galNext').disabled = galPage >= pages-1;
  el('galExpand').textContent = galExpanded ? '⤡' : '⛶';
  el('galExpand').title = galExpanded ? 'Collapse: 3 card' : 'Expand: 6 card';
}
async function refresh() {
  const data = await api({action:'getGALProblems',includeFollowUps:true});
  records = (data.problems || []).map(r => ({
    id:r.id,unit:r.unitCode,problem:r.problem,damagePhoto:r.photo,
    part:r.requiredPart,recommendation:r.recommendedFollowUp,
    status:String(r.status||'').toUpperCase(),category:r.category || '',condition:r.condition||'WARNING',createdAt:r.createdAt,createdBy:r.createdBy,
    followUps:(r.followUps||[]).map(h=>({...h,by:h.createdBy}))
  }));
  render();
}

// Jika URL lama di spreadsheet salah, coba ID foto terverifikasi.
// Jika masih gagal, tampilkan link Google Drive alih-alih ikon gambar rusak.
function galInstallPhotoFallback() {
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('gal-photo')) return;
    const button = img.closest('[data-photo]');
    if (!button) return;
    const fallback = button.dataset.photoFallback;
    if (fallback && img.dataset.fallbackTried !== 'yes') {
      img.dataset.fallbackTried = 'yes';
      img.src = fallback;
      button.dataset.photo = fallback;
      return;
    }
    const link = document.createElement('a');
    const id = galDriveId(button.dataset.photo);
    link.href = id ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/view` : button.dataset.photo;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Buka foto di Google Drive';
    link.style.cssText = 'font-size:12px;color:#d97706;text-decoration:underline';
    button.replaceWith(link);
    console.warn('HEXA GAL: Foto gagal dimuat dari URL:', img.src);
  }, true);
}
/* Unit population: searchable combobox seperti Start Inspection. */
let galUnits = [];
let galUnitsLoaded = false;
let galUnitsLoading = null;
const galUnitText = value => String(value ?? '').trim();
function closeGalUnitOptions() {
  const options = el('galUnitOptions');
  options.hidden = true;
  el('galUnitSearch').setAttribute('aria-expanded', 'false');
}
function chooseGalUnit(unit) {
  el('galUnit').value = unit.unitCode;
  el('galUnitSearch').value = unit.unitCode;
  closeGalUnitOptions();
}
function renderGalUnitOptions(query = '') {
  const options = el('galUnitOptions');
  const q = galUnitText(query).toLowerCase();
  const matches = galUnits.filter(u => [u.unitCode, u.egi, u.status].join(' ').toLowerCase().includes(q));
  options.replaceChildren();
  if (!matches.length) {
    const empty = document.createElement('div');
    empty.className = 'gal-unit-empty';
    empty.textContent = 'Unit tidak ditemukan';
    options.appendChild(empty);
    return;
  }
  matches.forEach(unit => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gal-unit-option';
    button.setAttribute('role', 'option');
    const main = document.createElement('span');
    main.className = 'gal-unit-option-main';
    const code = document.createElement('strong');
    code.textContent = unit.unitCode;
    const egi = document.createElement('small');
    egi.textContent = unit.egi;
    main.append(code, egi);
    const status = document.createElement('span');
    status.className = 'gal-unit-status ' + (unit.status.toUpperCase() === 'RUNNING' ? 'running' : 'standby');
    status.textContent = unit.status;
    button.append(main, status);
    button.addEventListener('click', () => chooseGalUnit(unit));
    options.appendChild(button);
  });
}
function openGalUnitOptions() {
  if (el('galUnitSearch').disabled) return;
  renderGalUnitOptions(el('galUnitSearch').value);
  el('galUnitOptions').hidden = false;
  el('galUnitSearch').setAttribute('aria-expanded', 'true');
}
function setupGalUnitCombobox() {
  const search = el('galUnitSearch');
  search.addEventListener('focus', openGalUnitOptions);
  search.addEventListener('click', openGalUnitOptions);
  search.addEventListener('input', () => {
    el('galUnit').value = '';
    openGalUnitOptions();
  });
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeGalUnitOptions();
    if (event.key === 'Enter' && !el('galUnitOptions').hidden) {
      const first = el('galUnitOptions').querySelector('.gal-unit-option');
      if (first) { event.preventDefault(); first.click(); }
    }
  });
  document.addEventListener('click', event => {
    if (!el('galUnitCombobox').contains(event.target)) closeGalUnitOptions();
  });
}
function setGalSync(state, message) {
  const icon = el('galSync');
  if (!icon) return;
  icon.className = 'gal-sync is-' + state;
  icon.title = message;
  icon.setAttribute('aria-label', message);
}
async function loadUnits() {
  const search = el('galUnitSearch');
  search.disabled = true;
  search.placeholder = 'Loading Unit Population...';
  try {
    const data = await api({action:'getGALAvailableUnits'});
    galUnits = (data.units || []).map(u => ({
      unitCode: galUnitText(u.unitCode),
      egi: galUnitText(u.egi),
      status: galUnitText(u.status)
    })).filter(u => u.unitCode && ['RUNNING','STANDBY'].includes(u.status.toUpperCase().replace(/\s+/g,'')))
      .sort((a,b) => (a.status.toUpperCase() === 'RUNNING' ? 0 : 1) - (b.status.toUpperCase() === 'RUNNING' ? 0 : 1) || a.unitCode.localeCompare(b.unitCode, 'id', {numeric:true,sensitivity:'base'}));
    search.disabled = false;
    search.placeholder = 'Search / Select Unit';
    if (!galUnits.length) console.warn('HEXA GAL: Tidak ada unit Running / Stand By pada Populasi.');
    galUnitsLoaded = true;
    return galUnits.length;
  } catch (error) {
    search.disabled = true;
    search.placeholder = 'Unable to load Unit Population';
    throw error;
  }
}
function busy(button, value) {
  button.disabled = value;
  button.dataset.label ??= button.textContent;
  button.textContent = value ? 'Menyimpan...' : button.dataset.label;
}
function close(id) { el(id).close(); }
async function init() {
  el('galBack').onclick = () => location.href = '/daily-maintenance';
  el('galSearch').oninput = () => {galPage=0;render();};
  el('galStatus').onchange = () => {galPage=0;render();};
  el('galExpand').onclick = () => {galExpanded=!galExpanded;galPage=0;render();};
  el('galPrev').onclick = () => {galPage=Math.max(0,galPage-1);render();};
  el('galNext').onclick = () => {galPage++;render();};
  let touchX=0;el('galCards').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].screenX},{passive:true});
  el('galCards').addEventListener('touchend',e=>{const dx=e.changedTouches[0].screenX-touchX;if(Math.abs(dx)>65){galPage=Math.max(0,galPage+(dx<0?1:-1));render();}},{passive:true});
  el('galCards').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.gal-problem-text')){e.preventDefault();e.target.classList.toggle('is-expanded');}});
  document.querySelectorAll('[data-dismiss]').forEach(b => b.onclick = () => close(b.dataset.dismiss));
  setupGalUnitCombobox();
  galInstallPhotoFallback();
  el('galNew').onclick = () => galOpenEditor();
  el('galAddMaster').onclick=()=>openMasterForm();
  el('galMasterForm').onsubmit=saveMasterForm;
  el('galMasterRows').addEventListener('click',e=>{const edit=e.target.closest('[data-master-edit]');const del=e.target.closest('[data-master-delete]');if(edit)openMasterForm(galMasterRows.find(r=>r.unitCode===edit.dataset.masterEdit));if(del)deleteMasterUnit(del.dataset.masterDelete);});
  el('galAddPart').onclick = () => galAddPartRow();
  el('galConfirmDelete').onclick = async () => {
    const b = el('galConfirmDelete'); busy(b,true);
    try { await api({action:'deleteGALProblem',problemId:galDeletingId,authToken:galAuthToken()}); close('galDeleteDialog'); await refresh(); await loadMaster(); }
    catch(error) {el('galDeleteMessage').textContent = error.message;} finally {busy(b,false);}
  };
  el('galLightboxClose').onclick = () => close('galLightbox');
  el('galCards').addEventListener('click', e => {
    const desc=e.target.closest('.gal-problem-text'); if(desc){desc.classList.toggle('is-expanded');return;}
    const p = e.target.closest('[data-photo]');
    if (p) { el('galLightboxImage').src = p.dataset.photo; el('galLightbox').showModal(); return; }
    const edit = e.target.closest('[data-edit]');
    if (edit) { const r = records.find(x => x.id === edit.dataset.edit); if (r && galCanEdit) galOpenEditor(r); return; }
    const del = e.target.closest('[data-delete]');
    if (del) { const r = records.find(x => x.id === del.dataset.delete); if (!r || !galCanManage) return; galDeletingId = r.id; el('galDeleteDescription').textContent = r.unit + ' — ' + r.problem; el('galDeleteMessage').textContent=''; el('galDeleteDialog').showModal(); return; }
    const b = e.target.closest('[data-follow]');
    if (!b) return;
    const r = records.find(x => x.id === b.dataset.follow);
    if (!r || r.status !== 'OPEN') return;
    selectedId = r.id;
    el('galFollowForm').reset();
    el('galFollowMessage').textContent = '';
    el('galFollowUnit').textContent = r.unit + ' — ' + r.problem;
    el('galFollowDialog').showModal();
  });
  el('galNewForm').onsubmit = async e => {
    e.preventDefault();
    if (!apiReady) return;
    const b = el('galSaveNew'); busy(b, true);
    try {
      const unit = el('galUnit').value;
      if (!unit || el('galUnitSearch').value.trim() !== unit) throw Error('Pilih Code Unit dari daftar pencarian.');
      const parts = galReadParts();
      if (parts.some(p => !p.name || !Number.isInteger(p.qty) || p.qty < 1)) throw Error('Isi nama part dan jumlah bilangan bulat minimal 1 untuk setiap part.');
      const file = el('galDamage').files[0];
      // New Problem: foto boleh kosong; bila dipilih harus valid.
      const photoData = file ? await fileData(file) : '';
      await api({action:galEditingId ? 'updateGALProblem' : 'createGALProblem',problemId:galEditingId,unitCode:unit,problem:el('galProblem').value.trim(),category:el('galCategory').value,condition:el('galCondition').value,requiredPart:JSON.stringify(parts),recommendedFollowUp:el('galRecommendation').value.trim(),photoData,createdBy:username(),authToken:galAuthToken()});
      close('galNewDialog');
      await refresh(); await loadMaster();
    } catch (error) { el('galNewMessage').textContent = error.message; }
    finally { busy(b, false); }
  };
  el('galFollowForm').onsubmit = async e => {
    e.preventDefault();
    if (!apiReady) return;
    const b = el('galSaveFollow'); busy(b, true);
    try {
      const result = el('galResult').value;
      const file = el('galEvidence').files[0];
      if (result === 'NORMAL' && !file) throw Error('Evidence wajib dilampirkan untuk hasil NORMAL.');
      const evidenceData = file ? await fileData(file) : '';
      await api({action:'createGALFollowUp',problemId:selectedId,followUpAction:el('galAction').value.trim(),result,evidenceData,createdBy:username()});
      close('galFollowDialog');
      await refresh(); await loadMaster();
    } catch (error) { el('galFollowMessage').textContent = error.message; }
    finally { busy(b, false); }
  };
  el('galNew').disabled = true;
  if (!configured()) { setGalSync('error', 'URL API Greasing belum dikonfigurasi.'); return; }
  setGalSync('loading', 'Sedang menyinkronkan data HEXA...');
  try {
    await refresh();
    await loadMaster();
    apiReady = true;
    el('galNew').disabled = !galCanFollow;
    el('galAddMaster').disabled = !galCanFollow;
    setGalSync('success', 'Data tersinkron dengan Google Sheets HEXA.');
  } catch (error) {
    apiReady = false;
    el('galNew').disabled = true;
    el('galUnitSearch').disabled = true;
    el('galUnitSearch').placeholder = 'Gagal memuat Code Unit';
    setGalSync('error', 'Koneksi database gagal: ' + error.message);
    console.error('HEXA GAL API:', error);
  }
}
init();


/* MASTER AUTOLUBE — Tahap B */
function masterCell(value,drum=false,dateValue=''){
  const s=String(value?.status||'UNASSESSED').toUpperCase();
  const klass=({OK:'ok',WARNING:'warning',BROKEN:'broken',FULL:'full',LOW:'low',REPLACE:'replace'})[s]||'unassessed';
  const details=[s, value?.subcomponent, value?.note, drum&&dateValue?'Tanggal: '+dateValue:''].filter(Boolean).join(' — ');
  return `<span class="gal-status-dot ${klass}" tabindex="0" role="img" aria-label="${esc(details)}" title="${esc(details)}"></span>`;
}
async function loadMaster(){
  try{const result=await api({action:'getMasterAutolube'});galMasterRows=result.rows||[];renderMaster();el('galMasterMessage').textContent='';}
  catch(e){el('galMasterMessage').textContent='Gagal membaca Master Autolube: '+e.message;}
}
function renderMaster(){
  const rows=galMasterRows.slice().sort((a,b)=>a.unitCode.localeCompare(b.unitCode,undefined,{numeric:true}));
  el('galMasterRows').innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(r.unitCode)}</td><td>${esc((r.performance||'Belum dinilai').replaceAll('_',' '))}</td>${galComponentFields.map(([key])=>`<td>${masterCell(r[key],key==='greaseDrum',r.drumDate)}</td>`).join('')}<td><div class="gal-master-actions">${galCanFollow?`<button class="gal-icon-action" data-master-edit="${esc(r.unitCode)}" title="Edit mapping">✎</button>`:''}${['1','MASTER'].includes(galLevel)?`<button class="gal-icon-action delete" data-master-delete="${esc(r.unitCode)}" title="Hapus mapping">🗑</button>`:''}</div></td></tr>`).join(''):'<tr><td colspan="9">Belum ada data mapping.</td></tr>';
}
function openMasterForm(row=null){
  if(!galCanFollow)return;el('galMasterForm').reset();el('galMasterFormMessage').textContent='';
  el('galMasterUnit').value=row?.unitCode||'';el('galMasterUnit').readOnly=!!row;
  el('galMasterPerformance').value=row?.performance||'';el('galMasterDrumDate').value=row?.drumDate||'';
  const opts=(arr,current)=>arr.map(([v,label])=>`<option value="${v}" ${v===current?'selected':''}>${label}</option>`).join('');
  el('galMasterFields').innerHTML=galComponentFields.map(([key,label])=>{const v=row?.[key]||{};const drum=key==='greaseDrum';return `<section class="gal-master-field" data-master-field="${key}"><h3>${label}</h3><div class="gal-master-field-grid"><label>Kondisi<select class="ma-status"><option value="">Belum dinilai / Tidak diubah</option>${opts(drum?[['FULL','Full'],['LOW','Low'],['REPLACE','Replace']]:[['OK','OK'],['WARNING','Function with notes'],['BROKEN','Not Function']],v.status)}</select></label>${key==='controlUnit'?`<label>Komponen<select class="ma-subcomponent">${opts([['','Pilih komponen'],['Timer','Timer'],['Solenoid','Solenoid'],['Controller','Controller'],['Control Valve','Control Valve']],v.subcomponent)}</select></label>`:''}<label>Catatan<input class="ma-note" placeholder="Penjelasan kondisi" value="${esc(v.note||'')}"></label>${['1','3','MASTER','GROUP LEADER'].includes(galLevel)&&!drum?`<label><input type="checkbox" class="ma-override" ${v.manualOverride?'checked':''}> Override Manual Master/GL</label>`:''}</div></section>`}).join('');
  el('galMasterUnitList').innerHTML=(typeof galUnits!=='undefined'?galUnits:[]).map(u=>`<option value="${esc(u.unitCode||u)}"></option>`).join('');
  el('galMasterDialog').showModal();
}
async function saveMasterForm(e){e.preventDefault();const button=el('galMasterSave');busy(button,true);try{
 const payload={action:'saveMasterAutolube',authToken:galAuthToken(),unitCode:el('galMasterUnit').value.trim().toUpperCase(),performance:el('galMasterPerformance').value,drumDate:el('galMasterDrumDate').value};
 for(const field of el('galMasterFields').querySelectorAll('[data-master-field]')){const key=field.dataset.masterField,status=field.querySelector('.ma-status').value;if(!status)continue;if(key!=='greaseDrum'&&!field.querySelector('.ma-override')?.checked){const old=galMasterRows.find(r=>r.unitCode===payload.unitCode)?.[key];if(!old?.manualOverride)continue;payload[key]={status:'OK',note:'',subcomponent:'',manualOverride:false};continue;}payload[key]={status,note:field.querySelector('.ma-note').value.trim(),subcomponent:field.querySelector('.ma-subcomponent')?.value||'',manualOverride:!!field.querySelector('.ma-override')?.checked};}
 await api(payload);close('galMasterDialog');await loadMaster();
 }catch(err){el('galMasterFormMessage').textContent=err.message;}finally{busy(button,false);}}
async function deleteMasterUnit(unit){if(!['1','MASTER'].includes(galLevel)||!confirm('Reset mapping '+unit+'? Jika masih ada Problem List, unit tetap ditampilkan.'))return;try{await api({action:'deleteMasterAutolube',unitCode:unit,authToken:galAuthToken(),reason:'Deleted via Master Autolube UI'});await loadMaster();el('galMasterMessage').textContent='Mapping berhasil direset. Unit dengan riwayat Problem List tetap ditampilkan.';}catch(e){el('galMasterMessage').textContent=e.message;}}
