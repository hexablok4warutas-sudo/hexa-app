"use strict";
/* HEXA KPI Data Management - Stage 5C: ekstraksi, arsip, simpan database. */
(function () {
  const $ = id => document.getElementById(id);
  const MAX = 20 * 1024 * 1024;
  const selected = { ACHIEVEMENT: null, REDO: null };
  let busy = false;
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function notice(s, kind = '') { $('kpiNotice').textContent = s; $('kpiNotice').className = 'kpi-notice ' + kind; }
  function refreshButton() { $('kpiUploadButton').disabled = busy || !selected.ACHIEVEMENT || !selected.REDO; }
  function choose(type, file) {
    if (busy || !file) return;
    if (!/\.xlsx$/i.test(file.name) || !file.size || file.size > MAX) { notice('File ' + type + ' harus XLSX dan maksimal 20 MB.', 'error'); return; }
    selected[type] = file;
    const key = type === 'REDO' ? 'Redo' : 'Achievement';
    $('kpi' + key + 'Selected').hidden = false;
    $('kpi' + key + 'Name').textContent = file.name;
    $('kpi' + key + 'Meta').textContent = (file.size / 1048576).toFixed(2) + ' MB • Siap upload';
    rowStatus(type, 'Siap diupload');
    notice('Kedua file harus dipilih sebelum upload.');
    refreshButton();
  }
  function clear(type) {
    if (busy) return;
    const key = type === 'REDO' ? 'Redo' : 'Achievement';
    selected[type] = null;
    $('kpi' + key + 'Input').value = '';
    $('kpi' + key + 'Selected').hidden = true;
    rowStatus(type, 'Belum dipilih');
    refreshButton();
  }
  let currentStage = 1;
  let lastProgress = 0;
  function setStage(stage, title, detail) {
    currentStage = stage;
    $('kpiProgressStage').textContent = title;
    $('kpiProgressStep').textContent = 'Tahap ' + stage + ' dari 5';
    if (detail) $('kpiProgressText').textContent = detail;
    document.querySelectorAll('[data-kpi-step]').forEach(el => {
      const n = Number(el.dataset.kpiStep);
      el.classList.toggle('done', n < stage);
      el.classList.toggle('active', n === stage);
      el.classList.remove('failed');
    });
  }
  function overlay() {
    $('kpiProgressOverlay').hidden = false;
    $('kpiProgressClose').hidden = true;
    $('kpiNutVisual').className = 'kpi-nut-visual processing';
    $('kpiProgressTitle').textContent = '';
    $('kpiProgressText').textContent = '';
    lastProgress = 0;
    $('kpiProgressBar').style.width = '0%';
    $('kpiProgressPercent').textContent = '0%';
    setStage(1, 'Membaca file Excel', 'Menyiapkan pembacaan kedua file...');
  }
  function progress(percent, text) {
    lastProgress = Math.max(lastProgress, Math.min(99, Math.max(0, Math.floor(percent))));
    $('kpiProgressBar').style.width = lastProgress + '%';
    $('kpiProgressPercent').textContent = lastProgress + '%';
    if (text) $('kpiProgressText').textContent = text;
  }
  function finish(ok, text) {
    $('kpiNutVisual').className = 'kpi-nut-visual ' + (ok ? 'success' : 'failure');
    $('kpiResultPath').setAttribute('d', ok ? 'M5 12l4 4L19 6' : 'M6 6l12 12M18 6L6 18');
    $('kpiProgressTitle').textContent = ok ? 'Data KPI berhasil disimpan' : 'Proses KPI belum lengkap';
    $('kpiProgressStage').textContent = ok ? 'Sinkronisasi selesai' : 'Proses terhenti';
    $('kpiProgressText').textContent = text;
    if (ok) {
      $('kpiProgressBar').style.width = '100%';
      $('kpiProgressPercent').textContent = '100%';
      document.querySelectorAll('[data-kpi-step]').forEach(el => {
        el.classList.remove('active', 'failed'); el.classList.add('done');
      });
    } else {
      const active = document.querySelector('[data-kpi-step="' + currentStage + '"]');
      if (active) { active.classList.add('failed'); active.classList.remove('active'); }
      $('kpiProgressPercent').textContent = lastProgress + '% • terhenti';
    }
    $('kpiProgressClose').hidden = false;
  }
  function rowStatus(type, text, kind = '') {
    const el = $('kpi' + (type === 'REDO' ? 'Redo' : 'Achievement') + 'Status');
    el.textContent = text;
    el.className = 'kpi-row-status ' + kind;
  }
  async function loadHistory() {
    if (typeof window.HEXA_KPI_GET_HISTORY !== 'function') return;
    try {
      const result = await window.HEXA_KPI_GET_HISTORY();
      const list = (result.history || []).filter(x => x.status !== 'FILE_MISSING');
      const latest = list.slice(0, 2);
      if (!latest.length) return;
      $('kpiSourceTitle').textContent = 'Arsip KPI tersedia';
      $('kpiSourceDetail').textContent = latest.map(x => (x.reportType || '') + ' • ' + x.fileName + ' (' + x.status + ')').join(' | ');
      $('kpiSourceStatus').textContent = 'Archived';
      $('kpiSourceStatus').classList.add('connected');
    } catch (e) { $('kpiSourceDetail').textContent = 'Riwayat belum dapat dimuat: ' + e.message; }
  }
  function prepare(extracted, type, period) {
    if (!extracted || extracted.type !== type) throw new Error('Jenis hasil ekstraksi tidak sesuai: ' + type);
    const result = { type, period, fileName: extracted.fileName };
    if (type === 'ACHIEVEMENT') {
      if (!Array.isArray(extracted.rows)) throw new Error('Data Achievement tidak tersedia');
      result.rows = extracted.rows.filter(r => String(r.date || '').slice(0, 7) === period).map(r => ({
        date: r.date, plan: r.plan, actual: r.actual
      }));
      if (!result.rows.length) throw new Error('Tidak ada data Achievement untuk ' + period);
      const seen = new Set();
      for (const r of result.rows) {
        if (seen.has(r.date)) throw new Error('Tanggal Achievement duplikat: ' + r.date);
        seen.add(r.date);
        if (![r.plan, r.actual].every(v => Number.isFinite(Number(v)) && Number(v) >= 0)) throw new Error('Angka Achievement tidak valid: ' + r.date);
      }
    } else {
      const s = extracted.summary || {};
      if (![s.unitDM, s.redo, s.rate].every(v => Number.isFinite(Number(v)))) throw new Error('Ringkasan Redo tidak valid');
      if (Number(s.unitDM) <= 0 || Number(s.redo) < 0 || Number(s.redo) > Number(s.unitDM) || Number(s.rate) < 0 || Number(s.rate) > 1) throw new Error('Angka Redo di luar batas');
      result.summary = { unitDM: Number(s.unitDM), redo: Number(s.redo), rate: Number(s.rate) };
      if (!Array.isArray(extracted.events)) throw new Error('Daftar event Redo tidak valid');
      result.events = extracted.events.filter(e => String(e.date || '').slice(0, 7) === period).map(e => ({
        date: e.date, unit: e.unit, hm: e.hm, problem: e.problem
      }));
    }
    return result;
  }
  async function upload() {
    if (busy || !selected.ACHIEVEMENT || !selected.REDO) return;
    const year = Number($('kpiYear').value), month = Number($('kpiMonth').value);
    if (!Number.isInteger(year) || year < 2020 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
      notice('Bulan/tahun tidak valid.', 'error'); return;
    }
    if (typeof window.HEXA_KPI_UPLOAD_ADAPTER !== 'function' || typeof window.HEXA_KPI_SAVE_EXTRACTED !== 'function') {
      notice('Adapter upload/simpan belum tersedia. Perbarui kpi-upload-adapter.js.', 'error'); return;
    }
    if (!window.HEXA_KPI_EXTRACTOR || !window.HEXA_KPI_EXTRACTOR.ready()) {
      notice('Excel Extractor atau JSZip belum tersedia.', 'error'); return;
    }
    const period = year + '-' + String(month).padStart(2, '0');
    busy = true; refreshButton();
    ['Achievement','Redo'].forEach(key => { $('kpi' + key + 'Remove').disabled = true; $('kpi' + key + 'Choose').disabled = true; });
    overlay();
    const done = [];
    let activeType = '';
    try {
      setStage(1, 'Membaca file Excel', 'Membaca file Achievement dan Redo DM...');
      progress(3, 'Membaca file Achievement...');
      rowStatus('ACHIEVEMENT', 'Memvalidasi...');
      rowStatus('REDO', 'Menunggu validasi...');
      const ach = prepare(await window.HEXA_KPI_EXTRACTOR.extractAchievement(selected.ACHIEVEMENT), 'ACHIEVEMENT', period);
      rowStatus('ACHIEVEMENT', 'Valid (' + ach.rows.length + ' hari)', 'ok');
      progress(6, 'Achievement terbaca. Membaca file Redo DM...');
      rowStatus('REDO', 'Memvalidasi...');
      const redo = prepare(await window.HEXA_KPI_EXTRACTOR.extractRedo(selected.REDO), 'REDO', period);
      rowStatus('REDO', 'Valid (' + redo.events.length + ' event periode)', 'ok');
      setStage(2, 'Validasi data berhasil', 'Periode ' + period + ': ' + ach.rows.length + ' hari Achievement dan ' + redo.events.length + ' event Redo.');
      const prepared = { ACHIEVEMENT: ach, REDO: redo };
      progress(10, 'Validasi berhasil. Mengarsipkan dan menyimpan KPI...');
      for (const type of ['ACHIEVEMENT', 'REDO']) {
        activeType = type;
        const label = type === 'REDO' ? 'Redo DM' : 'DM Achievement';
        const base = type === 'ACHIEVEMENT' ? 10 : 55;
        setStage(3, 'Mengarsipkan Excel ke Drive', 'Mengirim ' + label + ' ke Google Drive...');
        rowStatus(type, 'Mengarsipkan...');
        const archive = await window.HEXA_KPI_UPLOAD_ADAPTER(selected[type], (_stage, pc) => {
          progress(base + pc * 0.34, 'Mengirim ' + label + ': ' + pc + '% potongan file diterima...');
        }, { reportType: type, year, month });
        if (!archive || archive.success !== true || archive.archived !== true || !archive.fileId) {
          throw new Error('Arsip ' + label + ' belum dikonfirmasi server');
        }
        setStage(4, 'Menyimpan database KPI', 'Arsip ' + label + ' berhasil. Menunggu konfirmasi penyimpanan database...');
        rowStatus(type, 'Arsip tersimpan; menyimpan KPI...');
        progress(base + 36, 'Menyimpan data ' + label + ' ke database KPI...');
        const saved = await window.HEXA_KPI_SAVE_EXTRACTED({ ...prepared[type], fileId: archive.fileId });
        if (!saved || saved.success !== true || saved.synchronized !== true) throw new Error('Database belum mengonfirmasi sinkronisasi ' + label);
        done.push(type);
        setStage(5, 'Memeriksa hasil sinkronisasi', label + ' sudah dikonfirmasi database (' + saved.saved + ' baris).');
        rowStatus(type, 'Arsip & database tersimpan', 'ok');
        progress(base + 44, label + ' tersimpan (' + saved.saved + ' baris; ' + saved.events + ' event)');
      }
      finish(true, 'Achievement dan Redo ' + period + ' berhasil diarsipkan dan disimpan ke database KPI.');
      notice('Sinkronisasi kedua laporan berhasil untuk ' + period + '.', 'ok');
      await loadHistory();
    } catch (e) {
      if (activeType) rowStatus(activeType, 'Belum selesai: ' + e.message, 'error');
      const msg = e.message + ' • ' + done.length + ' dari 2 laporan sudah tersinkron. Periksa riwayat sebelum mencoba lagi.';
      finish(false, msg);
      notice('Sinkronisasi terhenti: ' + e.message, 'error');
    } finally {
      busy = false; refreshButton();
      ['Achievement','Redo'].forEach(key => { $('kpi' + key + 'Remove').disabled = false; $('kpi' + key + 'Choose').disabled = false; });
    }
  }
  let initialized = false;
  function init() {
    if (initialized) return;
    initialized = true;
    const logged = sessionStorage.getItem('hexaLoggedIn');
    let user; try { user = JSON.parse(sessionStorage.getItem('hexaUser') || 'null'); } catch (e) {}
    if (logged !== 'true' || !user || !user.uniqId) { location.replace('index.html'); return; }
    if (Number(user.kode) !== 1) { alert('Hanya Master yang dapat mengakses halaman ini.'); location.replace('main.html'); return; }
    document.body.classList.add('theme-blue');
    $('kpiBack').addEventListener('click', () => location.href = 'system-settings.html');
    const now = new Date(); $('kpiYear').value = now.getFullYear();
    $('kpiMonth').replaceChildren();
    months.forEach((name, i) => { const opt = document.createElement('option'); opt.value = String(i + 1); opt.textContent = name; $('kpiMonth').appendChild(opt); });
    $('kpiMonth').value = String(now.getMonth() + 1);
    for (const type of ['ACHIEVEMENT', 'REDO']) {
      const key = type === 'REDO' ? 'Redo' : 'Achievement';
      const input = $('kpi' + key + 'Input'), zone = $('kpi' + key + 'Choose');
      zone.addEventListener('click', () => input.click());
      input.addEventListener('change', () => choose(type, input.files[0]));
      $('kpi' + key + 'Remove').addEventListener('click', () => clear(type));
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); choose(type, e.dataTransfer.files[0]); });
    }
    $('kpiUploadButton').addEventListener('click', upload);
    $('kpiProgressClose').addEventListener('click', () => { if (!busy) $('kpiProgressOverlay').hidden = true; });
    notice('Pilih kedua file Excel untuk periode yang sama.');
    loadHistory();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
