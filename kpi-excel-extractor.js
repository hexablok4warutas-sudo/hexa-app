/* HEXA KPI DM — selective XLSX reader v2: Achievement + Redo + DBR actions.
 * Browser only. Does not write to the server.
 * Existing extractRedo().summary and .events contracts are preserved.
 */
(function () {
  'use strict';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const MAX_DBR_ROW = 12000;

  function xml(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('XML tidak valid');
    return doc;
  }
  function direct(parent, tag) {
    return Array.from(parent?.children || []).filter(x => x.localName === tag);
  }
  function child(parent, tag) { return direct(parent, tag)[0] || null; }
  function excelDate(n) {
    if (typeof n === 'string') {
      const s = n.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const dmy = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
      if (dmy) {
        const year = Number(dmy[3]) < 100 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
        const date = new Date(Date.UTC(year, Number(dmy[2]) - 1, Number(dmy[1])));
        if (date.getUTCFullYear() === year && date.getUTCMonth() === Number(dmy[2]) - 1 && date.getUTCDate() === Number(dmy[1]))
          return date.toISOString().slice(0, 10);
      }
    }
    const v = Number(n);
    if (!Number.isFinite(v) || v < 1 || v > 100000) return '';
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000).toISOString().slice(0, 10);
  }
  function letter(col) {
    let s = '';
    while (col) { col--; s = String.fromCharCode(65 + col % 26) + s; col = Math.floor(col / 26); }
    return s;
  }
  function value(cells, col, row) { return cells[col + row] ?? ''; }
  function clean(v) { return String(v ?? '').trim(); }

  async function open(file) {
    if (!window.JSZip) throw new Error('JSZip belum dimuat');
    if (!file || !/\.xlsx$/i.test(file.name)) throw new Error('Pilih file XLSX');
    const zip = await JSZip.loadAsync(file);
    const workbook = zip.file('xl/workbook.xml');
    const relationships = zip.file('xl/_rels/workbook.xml.rels');
    if (!workbook || !relationships) throw new Error('Bukan XLSX yang valid');
    const wd = xml(await workbook.async('string'));
    const rd = xml(await relationships.async('string'));
    const rels = {};
    Array.from(rd.documentElement.children).forEach(r => {
      rels[r.getAttribute('Id')] = r.getAttribute('Target');
    });
    const paths = {};
    Array.from(wd.getElementsByTagNameNS(NS, 'sheet')).forEach(s => {
      const id = s.getAttributeNS(REL, 'id');
      const target = rels[id];
      if (target) {
        const path = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
        paths[s.getAttribute('name')] = path.replace(/^xl\/\.\.\//, '');
      }
    });
    let strings = null;
    async function shared() {
      if (strings) return strings;
      const part = zip.file('xl/sharedStrings.xml');
      if (!part) return (strings = []);
      const doc = xml(await part.async('string'));
      strings = Array.from(doc.getElementsByTagNameNS(NS, 'si')).map(si =>
        Array.from(si.getElementsByTagNameNS(NS, 't')).map(t => t.textContent).join('')
      );
      return strings;
    }
    async function readSheet(name, wanted) {
      const path = paths[name];
      if (!path || !zip.file(path)) throw new Error('Sheet tidak ditemukan: ' + name);
      const doc = xml(await zip.file(path).async('string'));
      const cells = {};
      const needed = new Set(wanted);
      const sheetData = doc.getElementsByTagNameNS(NS, 'sheetData')[0];
      for (const row of direct(sheetData, 'row')) {
        for (const c of direct(row, 'c')) {
          const ref = c.getAttribute('r');
          if (!needed.has(ref)) continue;
          const type = c.getAttribute('t');
          let result = child(c, 'v')?.textContent ?? '';
          if (type === 's' && result !== '') result = (await shared())[Number(result)] ?? '';
          else if (type === 'inlineStr') result = child(c, 'is')?.textContent ?? '';
          else if (type !== 'str' && type !== 'e' && result !== '' && !isNaN(Number(result))) result = Number(result);
          cells[ref] = result;
        }
      }
      return cells;
    }
    return { readSheet, hasSheet: name => !!paths[name] };
  }

  async function extractAchievement(file) {
    const book = await open(file);
    const refs = [];
    for (let col = 6; col <= 45; col++) for (const row of [5, 8, 9]) refs.push(letter(col) + row);
    const cells = await book.readSheet('SUMARY_RESOURCE', refs);
    const rows = [];
    for (let col = 6; col <= 45; col++) {
      const l = letter(col), date = excelDate(cells[l + '5']);
      if (!date) continue;
      rows.push({ date, section: 'TRACK', plan: Number(cells[l + '8'] || 0), actual: Number(cells[l + '9'] || 0) });
    }
    if (!rows.length) throw new Error('Tanggal Achievement tidak ditemukan');
    return { type: 'ACHIEVEMENT', fileName: file.name, rows };
  }

  async function extractDBRFromBook(book) {
    if (!book.hasSheet('DBR')) throw new Error('Sheet DBR tidak ditemukan dalam Excel Redo DM');
    // Screenshot verified columns: F=Code Unit, G=HM, H=Problem,
    // I=Start Breakdown Date, J=Start Breakdown Time, K=WO Number, O=Action Problem.
    // C=Section; only TRACK records are used for HEXA KPI TRACK.
    const refs = [];
    for (let r = 6; r <= MAX_DBR_ROW; r++) {
      for (const col of ['C', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'O']) refs.push(col + r);
    }
    const cells = await book.readSheet('DBR', refs);
    const records = [];
    for (let r = 6; r <= MAX_DBR_ROW; r++) {
      if (clean(value(cells, 'C', r)).toUpperCase() !== 'TRACK') continue;
      const unit = clean(value(cells, 'F', r));
      const problem = clean(value(cells, 'H', r));
      const action = clean(value(cells, 'O', r));
      const woNumber = clean(value(cells, 'K', r));
      const date = excelDate(value(cells, 'I', r));
      if (!unit || (!problem && !action) || !date) continue;
      const rawHm = value(cells, 'G', r);
      const hm = rawHm === '' ? '' : (Number.isFinite(Number(rawHm)) ? Number(rawHm) : clean(rawHm));
      records.push({
        date, unit, hm, problem, action,
        woNumber, startTime: clean(value(cells, 'J', r)),
        breakdownType: clean(value(cells, 'L', r)),
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
    for (let r = 3; r <= 3000; r++) for (const col of ['E', 'F', 'G', 'H', 'I']) refs.push(col + r);
    const cells = await book.readSheet('Redo DBR', refs);
    const events = [];
    for (let r = 3; r <= 3000; r++) {
      if (clean(cells['E' + r]).toUpperCase() !== 'TRACK') continue;
      const unit = clean(cells['F' + r]);
      const problem = clean(cells['H' + r]);
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
        console.log('[HEXA KPI] Memeriksa', input.files[0].name);
        const result = type === 'REDO' ? await extractRedo(input.files[0]) :
          type === 'DBR' ? await extractDBR(input.files[0]) : await extractAchievement(input.files[0]);
        console.log('[HEXA KPI] HASIL', result);
        console.table(type === 'REDO' ? result.events.slice(0, 15) :
          type === 'DBR' ? result.records.slice(0, 15) : result.rows);
        if (type === 'REDO') console.table(result.dbr.slice(0, 15));
        alert('Extractor berhasil. Periksa Console. Belum ada data tambahan DBR yang dikirim ke database.');
      } catch (e) { console.error('[HEXA KPI] GAGAL:', e); alert('Extractor gagal: ' + e.message); }
    };
    input.click();
  }

  window.HEXA_KPI_EXTRACTOR = {
    ready: () => typeof JSZip !== 'undefined',
    extractAchievement, extractRedo, extractDBR, testPick
  };
  console.log('[HEXA KPI] Excel Extractor:', window.HEXA_KPI_EXTRACTOR.ready() ? 'READY' : 'JSZIP NOT LOADED');
})();
