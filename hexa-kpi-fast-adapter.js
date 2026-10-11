/* HEXA KPI FAST ADAPTER — no Excel processing in browser.
 * Set window.HEXA_KPI_API_URL to the Apps Script Web App endpoint
 * implementing action kpiGetDashboard. No fake KPI values.
 */
(function () {
  'use strict';
  const memory = new Map();
  const inflight = new Map();
  const TTL = 5 * 60 * 1000;
  const TIMEOUT = 12000;
  const MAX_ITEMS = 36;
  const keyOf = q => ['TRACK',q.period,q.startDate,q.endDate].join('|');
  window.HEXA_DM_KPI_ADAPTER = async function (query) {
    const api = String(window.HEXA_KPI_API_URL || '').trim();
    if (!api) throw Error('Endpoint KPI belum dikonfigurasi.');
    if (query.section !== 'TRACK') throw Error('KPI hanya untuk Section TRACK.');
    const key = keyOf(query), now = Date.now();
    const cached = memory.get(key);
    if (cached && now - cached.time < TTL) return cached.data;
    if (inflight.has(key)) return inflight.get(key);
    const task = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);
      try {
        const url = new URL(api);
        url.searchParams.set('action','kpiGetDashboard');
        url.searchParams.set('section','TRACK');
        url.searchParams.set('period',query.period);
        url.searchParams.set('startDate',query.startDate);
        url.searchParams.set('endDate',query.endDate);
        const response = await fetch(url.toString(), {method:'GET', signal:controller.signal, redirect:'follow'});
        if (!response.ok) throw Error('HTTP '+response.status);
        const data = await response.json();
        if (!data || data.success !== true || data.section !== 'TRACK')
          throw Error(data?.message || 'Data KPI TRACK belum tersinkronisasi.');
        if (memory.size >= MAX_ITEMS) memory.delete(memory.keys().next().value);
        memory.set(key,{time:Date.now(),data});
        return data;
      } finally { clearTimeout(timer); }
    })();
    inflight.set(key,task);
    try {return await task;} finally {inflight.delete(key);}
  };
  window.HEXA_KPI_CLEAR_CACHE = function () {
    memory.clear();
    window.dispatchEvent(new Event('hexa:kpi-updated'));
  };
})();
