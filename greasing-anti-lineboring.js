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
  return url ? `<button type="button" class="gal-photo-button" data-photo="${esc(url)}"><img loading="lazy" class="gal-photo" src="${esc(url)}" alt="${esc(alt)}"></button>` : '';
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
async function loadUnits() {
  const data = await api({action:'getGALAvailableUnits'});
  const units = (data.units || []).filter(u => ['RUNNING','STANDBY'].includes(String(u.status || '').toUpperCase().replace(/\s+/g,'')));
  el('galUnit').innerHTML = '<option value="">Pilih Code Unit</option>' + units.map(u => `<option value="${esc(u.unitCode)}">${esc(u.unitCode)} · ${esc(u.egi)} · ${esc(u.status)}</option>`).join('');
  if (!units.length) el('galNotice').textContent = 'Tidak ada unit Running / Stand By pada Populasi.';
  return units.length;
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
  el('galNew').onclick = () => { el('galNewForm').reset(); el('galNewMessage').textContent = ''; el('galNewDialog').showModal(); };
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
      if (!unit) throw Error('Pilih Code Unit.');
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
  if (!configured()) { el('galNotice').textContent = 'URL API Greasing belum dikonfigurasi.'; return; }
  el('galNotice').textContent = 'Menghubungkan ke database HEXA...';
  try {
    const [_, count] = await Promise.all([refresh(), loadUnits()]);
    apiReady = true;
    el('galNew').disabled = false;
    el('galNotice').textContent = count ? 'Data tersinkron dengan Google Sheets HEXA.' : 'Koneksi berhasil, tetapi belum ada unit aktif.';
  } catch (error) {
    apiReady = false;
    el('galNew').disabled = true;
    el('galUnit').innerHTML = '<option value="">Gagal memuat Code Unit</option>';
    el('galNotice').textContent = 'Koneksi database gagal: ' + error.message;
    console.error('HEXA GAL API:', error);
  }
}
init();
