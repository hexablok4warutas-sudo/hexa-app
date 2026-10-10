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
function photo(url, alt) {
  if (!url) return '';

  const value = String(url).trim();
  // Mendukung link Drive lama (/file/d/ID/view), link ?id=ID,
  // dan URL thumbnail yang sudah tersimpan di spreadsheet.
  const match = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = match ? (match[1] || match[2]) : '';
  const imageUrl = fileId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`
    : value;

  return `<button type="button" class="gal-photo-button" data-photo="${esc(imageUrl)}"><img loading="lazy" class="gal-photo" src="${esc(imageUrl)}" alt="${esc(alt)}"></button>`;
}
function card(r) {
  const histories = r.followUps || [], closed = r.status === 'CLOSE';
  return `<article class="gal-card"><div class="gal-card-top"><div><h3>${esc(r.unit)}</h3><div class="gal-date">${date(r.createdAt)} · ${esc(r.createdBy)}</div></div><span class="gal-badge ${closed?'close':'open'}">${esc(r.status)}</span></div><div class="gal-field"><small>Problem Autolube</small><p><strong>${esc(r.problem)}</strong></p></div><div class="gal-field">${photo(r.damagePhoto,'Foto kerusakan')}</div><div class="gal-card-cols"><div class="gal-field"><small>Required Part</small><p>${esc(r.part || '-')}</p></div><div class="gal-field"><small>Recommended Follow Up</small><p>${esc(r.recommendation || '-')}</p></div></div>${histories.length ? `<details class="gal-history"><summary>Follow Up (${histories.length})</summary>${histories.map(h => `<div class="gal-history-item"><small>${date(h.date)} · ${esc(h.by)}</small><p>${esc(h.action)}</p><span class="gal-result ${esc(String(h.result).toLowerCase())}">${esc(h.result)}</span>${photo(h.evidence,'Evidence follow up')}</div>`).join('')}</details>` : ''}${closed ? '' : `<div class="gal-card-footer"><button type="button" class="gal-primary" data-follow="${esc(r.id)}">+ Follow Up</button></div>`}</article>`;
}
function render() {
  el('galTotal').textContent = records.length;
  el('galOpen').textContent = records.filter(r => r.status === 'OPEN').length;
  el('galClose').textContent = records.filter(r => r.status === 'CLOSE').length;
  const q = el('galSearch').value.trim().toLowerCase(), status = el('galStatus').value;
  const visible = records.filter(r => (status === 'ALL' || r.status === status) && (!q || [r.unit,r.problem,r.part,r.recommendation].some(s => String(s || '').toLowerCase().includes(q))));
  el('galCards').innerHTML = visible.length ? visible.map(card).join('') : '<div class="gal-empty">Belum ada problem yang sesuai.</div>';
}
async function refresh() {
  const data = await api({action:'getGALProblems'});
  const problems = Array.isArray(data.problems) ? data.problems : [];
  // Baca riwayat berurutan agar tidak membanjiri Apps Script dengan request paralel.
  const result = [];
  for (const r of problems) {
    let followUps = [];
    try {
      const history = await api({action:'getGALFollowUps', problemId:r.id});
      followUps = (history.followups || []).map(h => ({...h, by:h.createdBy}));
    } catch (error) {
      console.warn('Gagal membaca riwayat problem ' + r.id, error);
    }
    result.push({id:r.id,unit:r.unitCode,problem:r.problem,damagePhoto:r.photo,part:r.requiredPart,recommendation:r.recommendedFollowUp,status:String(r.status || '').toUpperCase(),createdAt:r.createdAt,createdBy:r.createdBy,followUps});
  }
  records = result;
  render();
}
/* Unit population: searchable combobox seperti Start Inspection. */
let galUnits = [];
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
  el('galSearch').oninput = render;
  el('galStatus').onchange = render;
  document.querySelectorAll('[data-dismiss]').forEach(b => b.onclick = () => close(b.dataset.dismiss));
  setupGalUnitCombobox();
  el('galNew').onclick = () => { el('galNewForm').reset(); el('galUnit').value = ''; closeGalUnitOptions(); el('galNewMessage').textContent = ''; el('galNewDialog').showModal(); };
  el('galLightboxClose').onclick = () => close('galLightbox');
  el('galCards').addEventListener('click', e => {
    const p = e.target.closest('[data-photo]');
    if (p) { el('galLightboxImage').src = p.dataset.photo; el('galLightbox').showModal(); return; }
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
      const file = el('galDamage').files[0];
      // New Problem: foto boleh kosong; bila dipilih harus valid.
      const photoData = file ? await fileData(file) : '';
      await api({action:'createGALProblem',unitCode:unit,problem:el('galProblem').value.trim(),requiredPart:el('galPart').value.trim(),recommendedFollowUp:el('galRecommendation').value.trim(),photoData,createdBy:username()});
      close('galNewDialog');
      await refresh();
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
      await api({action:'createGALFollowUp',problemId:selectedId,action:el('galAction').value.trim(),result,evidenceData,createdBy:username()});
      close('galFollowDialog');
      await refresh();
    } catch (error) { el('galFollowMessage').textContent = error.message; }
    finally { busy(b, false); }
  };
  el('galNew').disabled = true;
  if (!configured()) { setGalSync('error', 'URL API Greasing belum dikonfigurasi.'); return; }
  setGalSync('loading', 'Sedang menyinkronkan data HEXA...');
  try {
    const [_, count] = await Promise.all([refresh(), loadUnits()]);
    apiReady = true;
    el('galNew').disabled = false;
    setGalSync('success', count ? 'Data tersinkron dengan Google Sheets HEXA.' : 'Koneksi berhasil, tetapi belum ada unit aktif.');
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
