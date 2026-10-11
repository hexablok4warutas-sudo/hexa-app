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
    $("kpiPreviewAnimation").addEventListener("click", previewAnimation);
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
  function openOverlay(title, description) {
    $("kpiProgressOverlay").hidden = false;
    $("kpiProgressClose").hidden = true;
    $("kpiProgressTitle").textContent = title;
    $("kpiProgressText").textContent = description;
    $("kpiProgressBar").style.width = "0%";
    $("kpiProgressPercent").textContent = "Memproses...";
    $("kpiNutSpinner").parentElement.classList.remove("stopped");
  }
  function setStage(stage, percent) {
    const labels = {
      uploading: ["Uploading Excel...", "Mengirim file ke server"],
      validating: ["Validating File...", "Memeriksa struktur workbook"],
      saving: ["Saving DM Data...", "Menyimpan data ke database"],
      syncing: ["Synchronizing Database...", "Menunggu konfirmasi sinkronisasi"]
    };
    const current = labels[stage] || ["Processing...", "Memproses data"];
    $("kpiProgressTitle").textContent = current[0];
    $("kpiProgressText").textContent = current[1];
    if (Number.isFinite(percent)) {
      const safe = Math.max(0, Math.min(99, percent));
      $("kpiProgressBar").style.width = safe + "%";
      $("kpiProgressPercent").textContent = safe + "%";
    } else {
      $("kpiProgressPercent").textContent = "Sedang diproses...";
    }
  }
  function finishOverlay(success, message) {
    $("kpiNutSpinner").parentElement.classList.add("stopped");
    $("kpiProgressTitle").textContent = success ? "Synchronization Complete!" : "Process Not Completed";
    $("kpiProgressText").textContent = message;
    $("kpiProgressBar").style.width = success ? "100%" : "0%";
    $("kpiProgressPercent").textContent = success ? "100%" : "Belum tersimpan";
    $("kpiProgressClose").hidden = false;
  }
  function closeOverlay() { if (!busy) $("kpiProgressOverlay").hidden = true; }

  async function uploadFile() {
    if (busy || !selectedFile) return;
    const adapter = window.HEXA_KPI_UPLOAD_ADAPTER;
    if (typeof adapter !== "function") {
      setNotice("Backend belum terhubung. File belum diupload atau disimpan. Gunakan Preview Animation untuk melihat animasi.", "error");
      return;
    }
    busy = true;
    $("kpiUploadButton").disabled = true;
    $("kpiRemoveFile").disabled = true;
    openOverlay("Uploading Excel...", "Memulai proses upload");
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

  // Demo visual saja. Tidak mengirim, membaca, atau menyimpan data.
  async function previewAnimation() {
    if (busy) return;
    busy = true;
    openOverlay("HEXA Animation Preview", "Simulasi tampilan animasi, bukan proses upload.");
    const stages = [
      ["uploading", 20], ["validating", 45], ["saving", 70], ["syncing", 90]
    ];
    for (const [stage, progress] of stages) {
      await new Promise(resolve => setTimeout(resolve, 650));
      setStage(stage, progress);
      $("kpiProgressText").textContent += " • Demo only";
    }
    await new Promise(resolve => setTimeout(resolve, 600));
    finishOverlay(false, "Preview selesai. Tidak ada file yang diupload atau disimpan.");
    $("kpiProgressTitle").textContent = "Animation Preview Finished";
    $("kpiProgressPercent").textContent = "Demo only";
    busy = false;
  }
})();
