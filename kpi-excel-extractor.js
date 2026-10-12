/* HEXA KPI Excel Extractor v3 — Achievement, Redo DBR, dan DBR activities.
 * GANTI SELURUH isi kpi-excel-extractor.js dengan kode ini.
 * Browser only; tidak menulis DBR ke server. Kontrak summary/events lama dipertahankan.
 */
(function () {
  'use strict';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const MAX_DBR_ROW = 12000;
  const MAX_REDO_ROW = 3000;

  function xml(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('XML Excel tidak valid');
    return doc;
  }
  function direct(parent, tag) { return Array.from(parent?.children || []).filter(x => x.localName === tag); }
  function child(parent, tag) { return direct(parent, tag)[0] || null; }
  function clean(v) { return String(v == null ? '' : v).trim(); }
  function upper(v) { return clean(v).replace(/\s+/g, ' ').toUpperCase(); }
  function letter(col) {
    let s = '';
    while (col) { col--; s = String.fromCharCode(65 + col % 26) + s; col = Math.floor(col / 26); }
    return s;
  }
  function excelDate(n) {
    if (typeof n === 'string') {
      const s = n.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
      if (m) {
        const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
        const d = new Date(Date.UTC(y, Number(m[2]) - 1, Number(m[1])));
        if (d.getUTCFullYear() === y && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[1]))
          return d.toISOString().slice(0, 10);
      }
    }
    const v = Number(n);
    if (!Number.isFinite(v) || v < 1 || v > 100000) return '';
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000).toISOString().slice(0, 10);
  }
  function excelTime(n) {
    if (n == null || n === '') return '';
    if (typeof n === 'string' && /^\d{1,2}:\d{2}/.test(n.trim())) return n.trim();
    const v = Number(n);
    if (!Number.isFinite(v) || v < 0) return clean(n);
    const seconds = Math.round(((v % 1) + 1) % 1 * 86400) % 86400;
    return String(Math.floor(seconds / 3600)).padStart(2, '0') + ':' +
      String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  }
  function hmValue(v) {
    if (v == null || clean(v) === '') return '';
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : clean(v);
  }

  async function open(file) {
    if (!window.JSZip) throw new Error('JSZip belum dimuat');
    if (!file || !/\.xlsx$/i.test(file.name)) throw new Error('Pilih file XLSX');
    const zip = await window.JSZip.loadAsync(file);
    const wb = zip.file('xl/workbook.xml');
    const relFile = zip.file('xl/_rels/workbook.xml.rels');
    if (!wb || !relFile) throw new Error('Struktur XLSX tidak valid');
    const wd = xml(await wb.async('string'));
    const rd = xml(await relFile.async('string'));
    const rels = {};
    Array.from(rd.documentElement.children).forEach(r => { rels[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const paths = {};
    Array.from(wd.getElementsByTagNameNS(NS, 'sheet')).forEach(s => {
      const target = rels[s.getAttributeNS(REL, 'id')];
      if (!target) return;
      const path = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
      paths[s.getAttribute('name')] = path.replace(/^xl\/\.\.\//, '');
    });
    let stringsPromise;
    function shared() {
      if (!stringsPromise) stringsPromise = (async () => {
        const part = zip.file('xl/sharedStrings.xml');
        if (!part) return [];
        const doc = xml(await part.async('string'));
        return Array.from(doc.getElementsByTagNameNS(NS, 'si')).map(si =>
          Array.from(si.getElementsByTagNameNS(NS, 't')).map(t => t.textContent).join(''));
      })();
      return stringsPromise;
    }
    async function readSheet(name, wanted) {
      const path = paths[name];
      if (!path || !zip.file(path)) throw new Error('Sheet tidak ditemukan: ' + name);
      const doc = xml(await zip.file(path).async('string'));
      const needed = new Set(wanted), cells = {};
      const sheetData = doc.getElementsByTagNameNS(NS, 'sheetData')[0];
      for (const row of direct(sheetData, 'row')) {
        for (const c of direct(row, 'c')) {
          const ref = c.getAttribute('r');
          if (!needed.has(ref)) continue;
          const type = c.getAttribute('t');
          let val = child(c, 'v')?.textContent ?? '';
          if (type === 's' && val !== '') val = (await shared())[Number(val)] ?? '';
          else if (type === 'inlineStr') val = child(c, 'is')?.textContent ?? '';
          else if (type !== 'str' && type !== 'e' && val !== '' && !isNaN(Number(val))) val = Number(val);
          cells[ref] = val;
        }
      }
      return cells;
    }
    return { readSheet, hasSheet: name => Boolean(paths[name]) };
  }

  async function extractAchievement(file) {
    const book = await open(file), refs = [];
    for (let col = 6; col <= 45; col++) for (const row of [5, 8, 9]) refs.push(letter(col) + row);
    const cells = await book.readSheet('SUMARY_RESOURCE', refs), rows = [];
    for (let col = 6; col <= 45; col++) {
      const l = letter(col), date = excelDate(cells[l + '5']);
      if (!date) continue;
      rows.push({ date, section: 'TRACK', plan: Number(cells[l + '8'] || 0), actual: Number(cells[l + '9'] || 0) });
    }
    if (!rows.length) throw new Error('Tanggal Achievement tidak ditemukan');
    return { type: 'ACHIEVEMENT', fileName: file.name, rows };
  }

  async function extractDBRFromBook(book) {
    if (!book.hasSheet('DBR')) throw new Error('Sheet DBR tidak ditemukan');
    const columns = ['C', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'R', 'S', 'T', 'U', 'V', 'W'];
    const refs = [];
    for (let r = 6; r <= MAX_DBR_ROW; r++) for (const c of columns) refs.push(c + r);
    const cells = await book.readSheet('DBR', refs);
    const records = [];
    let activeSection = '';
    for (let r = 6; r <= MAX_DBR_ROW; r++) {
      const rawSection = upper(cells['C' + r]);
      // Di file asli, baris aktivitas lanjutan memakai string "None" pada kolom C.
      // Jangan menganggap "None" sebagai section baru; pertahankan section sebelumnya.
      if (rawSection && rawSection !== 'NONE' && rawSection !== 'NULL' && rawSection !== '-')
        activeSection = rawSection;
      if (activeSection !== 'TRACK') continue;
      const unit = clean(cells['F' + r]);
      const problem = clean(cells['H' + r]);
      const action = clean(cells['O' + r]);
      const woNumber = clean(cells['K' + r]);
      const date = excelDate(cells['I' + r]);
      if (!unit || !date || (!problem && !action)) continue;
      records.push({
        date, unit, hm: hmValue(cells['G' + r]), problem, action, woNumber,
        section: 'TRACK', breakdownType: clean(cells['L' + r]),
        maintenanceType: clean(cells['M' + r]),
        startTime: excelTime(cells['J' + r]),
        activityStartDate: excelDate(cells['R' + r]),
        activityStartTime: excelTime(cells['S' + r]),
        activityFinishDate: excelDate(cells['T' + r]),
        activityFinishTime: excelTime(cells['U' + r]),
        rfuDate: excelDate(cells['V' + r]),
        rfuTime: excelTime(cells['W' + r]),
        sourceRow: r
      });
    }
    return records;
  }

  async function extractDBR(file) {
    const book = await open(file);
    return { type: 'DBR', fileName: file.name, records: await extractDBRFromBook(book) };
  }

  async function extractRedo(file) {
    const book = await open(file);
    const summary = await book.readSheet('Dashboard', ['T22', 'T23', 'T24']);
    const refs = [];
    for (let r = 3; r <= MAX_REDO_ROW; r++) for (const c of ['E', 'F', 'G', 'H', 'I']) refs.push(c + r);
    const cells = await book.readSheet('Redo DBR', refs), events = [];
    for (let r = 3; r <= MAX_REDO_ROW; r++) {
      if (upper(cells['E' + r]) !== 'TRACK') continue;
      const unit = clean(cells['F' + r]), problem = clean(cells['H' + r]);
      if (!unit || !problem) continue;
      events.push({ date: excelDate(cells['I' + r]), unit, hm: cells['G' + r] ?? '', problem, section: 'TRACK' });
    }
    const unitDM = Number(summary.T22), redo = Number(summary.T23), rate = Number(summary.T24);
    if (![unitDM, redo, rate].every(Number.isFinite) || unitDM <= 0) throw new Error('Angka Dashboard Redo tidak valid');
    const dbr = await extractDBRFromBook(book);
    return { type: 'REDO', fileName: file.name, summary: { unitDM, redo, rate }, events, dbr };
  }

  function testPick(type) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.xlsx';
    input.onchange = async () => {
      if (!input.files?.[0]) return;
      try {
        const result = type === 'DBR' ? await extractDBR(input.files[0]) :
          type === 'REDO' ? await extractRedo(input.files[0]) : await extractAchievement(input.files[0]);
        console.log('[HEXA KPI] HASIL', result);
        console.table(type === 'DBR' ? result.records.slice(0, 20) :
          type === 'REDO' ? result.events.slice(0, 20) : result.rows);
        if (type === 'REDO') console.table(result.dbr.slice(0, 20));
        alert('Ekstraksi selesai. Lihat Console. Data DBR belum disimpan ke database.');
      } catch (err) {
        console.error('[HEXA KPI] ERROR', err);
        alert('Extractor gagal: ' + err.message);
      }
    };
    input.click();
  }

  window.HEXA_KPI_EXTRACTOR = {
    ready: () => typeof window.JSZip !== 'undefined',
    extractAchievement, extractRedo, extractDBR, testPick
  };
  console.log('[HEXA KPI] Excel Extractor v3 READY');
})();
