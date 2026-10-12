
/**
 * HEXA KPI DM - EXCEL EXTRACTOR
 * Tahap awal: memeriksa kesiapan JSZip.
 */

window.HEXA_KPI_EXTRACTOR = {
  ready: function () {
    return typeof JSZip !== "undefined";
  }
};

console.log(
  "[HEXA KPI] Excel Extractor:",
  window.HEXA_KPI_EXTRACTOR.ready()
    ? "READY"
    : "JSZIP NOT LOADED"
);
