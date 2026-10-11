/* HEXA KPI — upload arsip Excel ke Apps Script.
 * Ganti URL di bawah dengan URL /exec DEPLOYMENT HEXA yang sudah ada.
 * Tahap ini hanya arsip, BELUM sinkronisasi angka KPI.
 */
(function () {
  'use strict';
  const API_URL = 'https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
  const BYTES_PER_CHUNK = 180000;
  async function request(payload) {
    if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(API_URL)) {
      throw new Error('Isi API_URL di kpi-upload-adapter.js terlebih dahulu.');
    }
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    if (!response.ok) throw new Error('Server HTTP ' + response.status);
    const result = await response.json();
    if (!result || result.success !== true) throw new Error(result && result.message || 'Respons server tidak valid.');
    return result;
  }
  function toBase64(blob) {
    return new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Gagal membaca Excel.'));
      reader.readAsDataURL(blob);
    });
  }
  window.HEXA_KPI_UPLOAD_ADAPTER = async function(file, onStage) {
    const user = JSON.parse(sessionStorage.getItem('hexaUser') || 'null');
    if (!user || !user.uniqId) throw new Error('Silakan login ulang.');
    // Periode tidak ditentukan hanya dari nama file. Admin wajib mengonfirmasi.
    const year = Number(window.prompt('Tahun periode KPI (contoh: 2026):', new Date().getFullYear()));
    const month = Number(window.prompt('Bulan periode KPI (1–12):', new Date().getMonth()+1));
    if (!Number.isInteger(year) || year < 2020 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error('Periode tidak valid atau dibatalkan.');
    }
    const base = {userId:user.uniqId};
    const start = await request({...base, action:'kpiBeginUpload', fileName:file.name, fileSize:file.size, year, month});
    const count = Math.ceil(file.size / BYTES_PER_CHUNK);
    for (let i=0; i<count; i++) {
      const part = file.slice(i*BYTES_PER_CHUNK, Math.min(file.size,(i+1)*BYTES_PER_CHUNK));
      const chunk = await toBase64(part);
      await request({...base, action:'kpiAppendUpload', uploadId:start.uploadId, index:i, chunk});
      if (typeof onStage === 'function') onStage('uploading', Math.floor((i+1)/count*95));
    }
    return request({...base, action:'kpiCommitUpload', uploadId:start.uploadId, totalChunks:count, replacePeriod:false});
  };
})();
