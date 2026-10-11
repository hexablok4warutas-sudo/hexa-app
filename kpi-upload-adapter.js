/* HEXA KPI Upload Adapter v2 — file ini menggantikan kpi-upload-adapter.js lama.
 * Nama file Excel asli dipertahankan. Arsip saja, belum ekstraksi/sinkronisasi KPI.
 */
(function () {
  'use strict';
  const API_URL = 'https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
  const BYTES_PER_CHUNK = 180000;
  const MAX_BYTES = 20 * 1024 * 1024;
  const RETRIES = 2;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function request(payload, retries = 0) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {'Content-Type':'text/plain;charset=utf-8'},
          body: JSON.stringify(payload),
          redirect: 'follow'
        });
        if (!response.ok) throw new Error('Server HTTP ' + response.status);
        const result = await response.json();
        if (!result || result.success !== true) {
          throw new Error((result && (result.message || result.error)) || 'Respons server tidak valid.');
        }
        return result;
      } catch (error) {
        lastError = error;
        // Hanya retry kesalahan transport. Error validasi server tidak diulang.
        const isNetwork = error instanceof TypeError || /Failed to fetch|NetworkError/i.test(String(error.message));
        if (!isNetwork || attempt >= retries) break;
        await wait(900 * (attempt + 1));
      }
    }
    throw lastError;
  }
  function toBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Gagal membaca Excel.'));
      reader.readAsDataURL(blob);
    });
  }
  function askPeriod() {
    const y = window.prompt('Tahun periode KPI (contoh: 2026):', String(new Date().getFullYear()));
    if (y === null) throw new Error('Upload dibatalkan.');
    const m = window.prompt('Bulan periode KPI (1–12):', String(new Date().getMonth()+1));
    if (m === null) throw new Error('Upload dibatalkan.');
    const year = Number(y), month = Number(m);
    if (!Number.isInteger(year) || year < 2020 || year > 2100 ||
        !Number.isInteger(month) || month < 1 || month > 12) throw new Error('Periode tidak valid.');
    return {year, month};
  }
  function askReportType() {
    const answer = window.prompt('Jenis laporan: ketik 1 untuk Redo DM, atau 2 untuk DM Achievement (Mainpro).', '2');
    if (answer === null) throw new Error('Upload dibatalkan.');
    const value = answer.trim().toUpperCase();
    if (value === '1' || value === 'REDO') return 'REDO';
    if (value === '2' || value === 'ACHIEVEMENT') return 'ACHIEVEMENT';
    throw new Error('Jenis laporan tidak valid. Gunakan 1 atau 2.');
  }
  window.HEXA_KPI_UPLOAD_ADAPTER = async function (file, onStage) {
    if (!file || !/\.xlsx$/i.test(file.name) || file.size < 1 || file.size > MAX_BYTES) {
      throw new Error('Pilih file .xlsx maksimal 20 MB.');
    }
    const user = JSON.parse(sessionStorage.getItem('hexaUser') || 'null');
    if (!user || !user.uniqId) throw new Error('Silakan login ulang.');
    const reportType = askReportType();
    const {year, month} = askPeriod();
    const base = {userId:user.uniqId};
    if (typeof onStage === 'function') onStage('preparing', 0);
    const start = await request({...base, action:'kpiBeginUpload',
      fileName:file.name, fileSize:file.size, year, month, reportType});
    const count = Math.ceil(file.size / BYTES_PER_CHUNK);
    for (let i=0; i<count; i++) {
      const part = file.slice(i * BYTES_PER_CHUNK, Math.min(file.size, (i+1) * BYTES_PER_CHUNK));
      const chunk = await toBase64(part);
      await request({...base, action:'kpiAppendUpload', uploadId:start.uploadId, index:i, chunk}, RETRIES);
      if (typeof onStage === 'function') onStage('uploading', Math.floor((i+1) / count * 95));
    }
    if (typeof onStage === 'function') onStage('saving', 96);
    // Commit tidak di-retry otomatis: bisa saja server sudah menyimpan file.
    try {
      return await request({...base, action:'kpiCommitUpload', uploadId:start.uploadId,
        totalChunks:count, replacePeriod:false});
    } catch (err) {
      if (/sudah ada|penggantian/i.test(String(err.message))) {
        const confirmed = window.confirm('Laporan jenis dan periode ini sudah ada. Ganti arsip aktif? Arsip lama tetap disimpan di Drive.');
        if (confirmed) {
          return request({...base, action:'kpiCommitUpload', uploadId:start.uploadId,
            totalChunks:count, replacePeriod:true});
        }
      }
      throw err;
    }
  };
})();
