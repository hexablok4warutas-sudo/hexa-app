/* HEXA KPI DM — selective XLSX reader, test version (no server writes) */
(function () {
  'use strict';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
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
    const v = Number(n);
    if (!Number.isFinite(v) || v < 1) return '';
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000).toISOString().slice(0, 10);
  }
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
      if (target) paths[s.getAttribute('name')] = target.startsWith('/')
        ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
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
          let value = child(c, 'v')?.textContent ?? '';
          if (type === 's' && value !== '') value = (await shared())[Number(value)] ?? '';
          else if (type === 'inlineStr') value = child(c, 'is')?.textContent ?? '';
          else if (type !== 'str' && type !== 'e' && value !== '' && !isNaN(Number(value))) value = Number(value);
          cells[ref] = value;
        }
      }
      return cells;
    }
    return { readSheet };
  }
  async function extractAchievement(file) {
    const book = await open(file);
    const refs = [];
    for (let col = 6; col <= 45; col++) {
      let n = col, letter = '';
      while (n) { n--; letter = String.fromCharCode(65 + n % 26) + letter; n = Math.floor(n / 26); }
      for (const row of [5, 8, 9]) refs.push(letter + row);
    }
    const cells = await book.readSheet('SUMARY_RESOURCE', refs);
    const rows = [];
    for (let col = 6; col <= 45; col++) {
      let n = col, letter = '';
      while (n) { n--; letter = String.fromCharCode(65 + n % 26) + letter; n = Math.floor(n / 26); }
      const date = excelDate(cells[letter + '5']);
      if (!date) continue;
      rows.push({ date, section: 'TRACK', plan: Number(cells[letter + '8'] || 0), actual: Number(cells[letter + '9'] || 0) });
    }
    if (!rows.length) throw new Error('Tanggal Achievement tidak ditemukan');
    return { type: 'ACHIEVEMENT', fileName: file.name, rows };
  }
  async function extractRedo(file) {
    const book = await open(file);
    const summary = await book.readSheet('Dashboard', ['T22', 'T23', 'T24']);
    const refs = [];
    for (let r = 3; r <= 3000; r++) for (const col of ['E', 'F', 'G', 'H', 'I']) refs.push(col + r);
    const cells = await book.readSheet('Redo DBR', refs);
    const events = [];
    for (let r = 3; r <= 3000; r++) {
      if (String(cells['E' + r] || '').trim().toUpperCase() !== 'TRACK') continue;
      const unit = String(cells['F' + r] || '').trim();
      const problem = String(cells['H' + r] || '').trim();
      if (!unit || !problem) continue;
      events.push({ date: excelDate(cells['I' + r]), unit, hm: cells['G' + r] ?? '', problem, section: 'TRACK' });
    }
    const unitDM = Number(summary.T22), redo = Number(summary.T23), rate = Number(summary.T24);
    if (![unitDM, redo, rate].every(Number.isFinite) || unitDM <= 0) throw new Error('Angka Dashboard Redo tidak valid');
    return { type: 'REDO', fileName: file.name, summary: { unitDM, redo, rate }, events };
  }
  function testPick(type) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.xlsx';
    input.onchange = async () => {
      if (!input.files?.[0]) return;
      try {
        console.log('[HEXA KPI] Memeriksa', input.files[0].name);
        const result = type === 'REDO' ? await extractRedo(input.files[0]) : await extractAchievement(input.files[0]);
        console.log('[HEXA KPI] HASIL', result);
        console.table(type === 'REDO' ? result.events.slice(0, 15) : result.rows);
        alert('Extractor berhasil. Lihat Console untuk hasil. Belum ada data yang dikirim ke database.');
      } catch (e) { console.error('[HEXA KPI] GAGAL:', e); alert('Extractor gagal: ' + e.message); }
    };
    input.click();
  }
  window.HEXA_KPI_EXTRACTOR = {
    ready: () => typeof JSZip !== 'undefined',
    extractAchievement, extractRedo, testPick
  };
  console.log('[HEXA KPI] Excel Extractor:', window.HEXA_KPI_EXTRACTOR.ready() ? 'READY' : 'JSZIP NOT LOADED');
})();
