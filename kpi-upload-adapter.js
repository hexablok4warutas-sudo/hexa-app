/* HEXA KPI Upload Adapter v5 — auto replace arsip tanpa konfirmasi + simpan hasil ekstraksi.
 * Ganti seluruh isi kpi-upload-adapter.js dengan file ini.
 * Tidak mengubah kpi-data-management.js.
 */
(function () {
  'use strict';

  const API_URL = 'https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
  const BYTES_PER_CHUNK = 180000;
  const MAX_BYTES = 20 * 1024 * 1024;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function request(payload, retries = 0) {
    let last;
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow'
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (!data || data.success !== true) {
          throw new Error((data && (data.message || data.error)) || 'Respons API tidak valid');
        }
        return data;
      } catch (e) {
        last = e;
        const net = e instanceof TypeError ||
          /Failed to fetch|NetworkError/i.test(String(e.message));
        if (!net || i === retries) break;
        await wait(1000 * (i + 1));
      }
    }
    throw last;
  }

  function encode(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(blob);
    });
  }

  function base() {
    let user;
    try {
      user = JSON.parse(sessionStorage.getItem('hexaUser') || 'null');
    } catch (e) {}
    if (!user || !user.uniqId) throw new Error('Silakan login ulang');
    return { userId: user.uniqId };
  }

  window.HEXA_KPI_GET_HISTORY = () =>
    request({ ...base(), action: 'kpiGetUploadHistory' });

  // Dipanggil setelah arsip berhasil; payload berisi type, period,
  // fileName, fileId, serta rows ATAU summary/events.
  window.HEXA_KPI_SAVE_EXTRACTED = payload => {
    if (!payload || typeof payload !== 'object') {
      return Promise.reject(new Error('Payload ekstraksi tidak valid'));
    }
    return request({
      ...base(),
      action: 'kpiSaveExtractedData',
      payload
    });
  };

  window.HEXA_KPI_UPLOAD_ADAPTER = async function (file, onStage, options) {
    if (!file || !/\.xlsx$/i.test(file.name) ||
        file.size < 1 || file.size > MAX_BYTES) {
      throw new Error('File harus XLSX, maksimal 20 MB');
    }
    const opts = options || {};
    const reportType = String(opts.reportType || '').toUpperCase();
    const year = Number(opts.year);
    const month = Number(opts.month);

    if (!['REDO', 'ACHIEVEMENT'].includes(reportType)) {
      throw new Error('Jenis laporan wajib dipilih');
    }
    if (!Number.isInteger(year) || year < 2020 || year > 2100 ||
        !Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error('Periode tidak valid');
    }

    const user = base();
    const start = await request({
      ...user,
      action: 'kpiBeginUpload',
      fileName: file.name,
      fileSize: file.size,
      reportType,
      year,
      month
    });

    const count = Math.ceil(file.size / BYTES_PER_CHUNK);
    for (let i = 0; i < count; i++) {
      const chunk = await encode(
        file.slice(i * BYTES_PER_CHUNK,
          Math.min(file.size, (i + 1) * BYTES_PER_CHUNK))
      );
      await request({
        ...user,
        action: 'kpiAppendUpload',
        uploadId: start.uploadId,
        index: i,
        chunk
      }, 2);

      if (onStage) onStage('uploading', Math.floor((i + 1) / count * 95));
    }

    if (onStage) onStage('saving', 96);
    // Auto-replace: satu arsip aktif per jenis laporan dan periode.
    // Arsip lama tetap berada di Drive; hanya indeks arsip aktif diperbarui.
    const commit = {
      ...user,
      action: 'kpiCommitUpload',
      uploadId: start.uploadId,
      totalChunks: count,
      replacePeriod: true
    };
    return await request(commit);

  };

  console.log('[HEXA KPI] Upload Adapter v5 READY');
})();
