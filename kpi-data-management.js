"use strict";
/* HEXA KPI Data Management
   Integrasi backend nanti: tetapkan window.HEXA_KPI_UPLOAD_ADAPTER
   sebagai async function(file, onStage) -> {fileName, uploadedAt, message}.
   onStage(stage, percent) dengan stage: uploading|validating|saving|syncing.
   Adapter harus resolve HANYA setelah penyimpanan & sinkronisasi berhasil.
   Jangan menyimpan Excel ke localStorage/sessionStorage.
*/
(function () {
  const MAX_BYTES = 20 * 1024 * 1024;
  let selectedFile = null;
  let busy = false;
  const $ = (id) => document.getElementById(id);

  document.addEventListener("DOMContentLoaded", function () {
    const loggedIn = sessionStorage.getItem("hexaLoggedIn");
    let user = null;
    try { user = JSON.parse(sessionStorage.getItem("hexaUser") || "null"); } catch (_) {}
    if (loggedIn !== "true" || !user || !user.uniqId || !user.userId) {
      window.location.replace("index.html"); return;
    }
    // Sesuai System Settings saat ini: hanya Master (kode 1).
    if (Number(user.kode) !== 1) {
      alert("You are not authorized to access this page.");
      window.location.replace("main.html"); return;
    }
    document.body.classList.add("theme-blue");
    $("kpiBack").addEventListener("click", () => window.location.href = "system-settings.html");
    $("kpiChooseFile").addEventListener("click", () => $("kpiFileInput").click());
    $("kpiFileInput").addEventListener("change", (event) => chooseFile(event.target.files[0]));
    $("kpiRemoveFile").addEventListener("click", clearFile);
    $("kpiUploadButton").addEventListener("click", uploadFile);
    $("kpiProgressClose").addEventListener("click", closeOverlay);
    const drop = $("kpiChooseFile");
    drop.addEventListener("dragover", (event) => { event.preventDefault(); drop.classList.add("dragover"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
    drop.addEventListener("drop", (event) => {
      event.preventDefault(); drop.classList.remove("dragover");
      if (event.dataTransfer.files.length) chooseFile(event.dataTransfer.files[0]);
    });
    setNotice("Pilih file Excel untuk memulai.");
  });

  function setNotice(message, kind) {
    const node = $("kpiNotice");
    node.textContent = message;
    node.className = "kpi-notice" + (kind ? " " + kind : "");
  }
  function chooseFile(file) {
    if (busy || !file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      clearFile(); setNotice("Format tidak sesuai. Gunakan file .xlsx.", "error"); return;
    }
    if (!file.size || file.size > MAX_BYTES) {
      clearFile(); setNotice("File kosong atau melebihi batas 20 MB.", "error"); return;
    }
    selectedFile = file;
    $("kpiSelectedFile").hidden = false;
    $("kpiFileName").textContent = file.name;
    $("kpiFileMeta").textContent = (file.size / 1024 / 1024).toFixed(2) + " MB • Siap diproses";
    $("kpiUploadButton").disabled = false;
    setNotice("File dipilih. Pemeriksaan isi workbook dilakukan oleh backend saat upload.");
  }
  function clearFile() {
    if (busy) return;
    selectedFile = null;
    $("kpiFileInput").value = "";
    $("kpiSelectedFile").hidden = true;
    $("kpiUploadButton").disabled = true;
  }
  function openOverlay() {
    $("kpiProgressOverlay").hidden = false;
    $("kpiProgressClose").hidden = true;
    $("kpiNutVisual").className = "kpi-nut-visual processing";
    $("kpiProgressTitle").textContent = "";
    $("kpiProgressText").textContent = "";
    $("kpiProgressBar").style.width = "0%";
  }
  function setStage(stage, percent) {
    // Tahap teknis tidak ditampilkan. Progress hanya jika backend memberikan angka nyata.
    if (Number.isFinite(percent)) {
      $("kpiProgressBar").style.width = Math.max(0, Math.min(99, percent)) + "%";
    } else {
      $("kpiProgressBar").classList.add("indeterminate");
    }
  }
  function finishOverlay(success, message) {
    $("kpiProgressBar").classList.remove("indeterminate");
    $("kpiNutVisual").className = "kpi-nut-visual " + (success ? "success" : "failure");
    $("kpiResultPath").setAttribute("d", success ? "M5 12l4 4L19 6" : "M6 6l12 12M18 6L6 18");
    $("kpiProgressTitle").textContent = success ? "Berhasil tersinkronisasi" : "Proses gagal";
    $("kpiProgressText").textContent = message || "";
    $("kpiProgressBar").style.width = success ? "100%" : "0%";
    $("kpiProgressClose").hidden = false;
  }
  function closeOverlay() { if (!busy) $("kpiProgressOverlay").hidden = true; }

  async function uploadFile() {
    if (busy || !selectedFile) return;
    const adapter = window.HEXA_KPI_UPLOAD_ADAPTER;
    if (typeof adapter !== "function") {
      setNotice("Backend belum terhubung. File belum diupload atau disimpan. Hubungkan backend terlebih dahulu.", "error");
      return;
    }
    busy = true;
    $("kpiUploadButton").disabled = true;
    $("kpiRemoveFile").disabled = true;
    openOverlay();
    try {
      const result = await adapter(selectedFile, setStage);
      if (!result || result.success !== true) throw new Error(result && result.message || "Server belum mengonfirmasi keberhasilan sinkronisasi.");
      finishOverlay(true, result.message || "Data telah tersimpan dan tersinkronisasi.");
      $("kpiSourceTitle").textContent = result.fileName || selectedFile.name;
      $("kpiSourceDetail").textContent = "Updated: " + (result.uploadedAt || new Date().toLocaleString("id-ID"));
      $("kpiSourceStatus").textContent = "Synchronized";
      $("kpiSourceStatus").classList.add("connected");
      setNotice("Sinkronisasi berhasil dikonfirmasi server.", "ok");
    } catch (error) {
      finishOverlay(false, error.message || "Terjadi kesalahan saat upload.");
      setNotice("Upload gagal: " + (error.message || "Unknown error"), "error");
    } finally {
      busy = false;
      $("kpiUploadButton").disabled = !selectedFile;
      $("kpiRemoveFile").disabled = false;
    }
  }

})();
