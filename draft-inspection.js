/* HEXA Draft Inspection — Auto Sync V5.
 * Memerlukan HEXAOffline.list() dan HEXAOffline.updateStatus() dari offline store V3.
 * Backend syncOfflineInspection harus sudah mendukung clientRequestId/idempotency.
 * Tidak mengubah Service Worker, database, atau struktur HTML.
 */
'use strict';
(function () {
  const loggedIn = sessionStorage.getItem('hexaLoggedIn');
  const raw = sessionStorage.getItem('hexaUser');
  if (loggedIn !== 'true' || !raw) { window.location.replace('index.html'); return; }
  let user;
  try { user = JSON.parse(raw); if (!user || typeof user !== 'object') throw Error('invalid user'); }
  catch (_) { window.location.replace('index.html'); return; }

  const list = document.getElementById('draftList');
  const search = document.getElementById('draftSearch');
  const syncButton = document.getElementById('syncAll');
  const notice = document.getElementById('draftInfo');
  const API_URL = 'https://script.google.com/macros/s/AKfycbxB6yiEnjsE95F_5FlNhjY731u7CG0KQrPmPu5t2bKFHCaWAx0y2ioicLALH7LX6NeKFg/exec';
  const CHECK_INTERVAL_MS = 12000;
  const RETRY_DELAY_MS = 30000;
  let activeTab = 'pending';
  let syncing = false;
  let lastFailedAttempt = 0;
  let renderVersion = 0;

  function pendingItem(item) {
    return item && (item.status === 'pending' || item.status === 'failed');
  }

  function connection() {
    const element = document.getElementById('draftConnection');
    if (element) element.textContent = navigator.onLine ? '● Perangkat online' : '● Perangkat offline';
  }

  async function render() {
    const version = ++renderVersion;
    try {
      const items = await window.HEXAOffline.list();
      if (version !== renderVersion) return;
      const draftCount = document.getElementById('countDraft');
      const readyCount = document.getElementById('countReady');
      const failedCount = document.getElementById('countFailed');
      if (draftCount) draftCount.textContent = String(items.filter(x => x.status === 'draft').length);
      if (readyCount) readyCount.textContent = String(items.filter(x => x.status === 'pending').length);
      if (failedCount) failedCount.textContent = String(items.filter(x => x.status === 'failed').length);
      if (syncButton) {
        syncButton.disabled = syncing || !navigator.onLine || !items.some(pendingItem);
        syncButton.textContent = syncing ? 'Syncing...' : 'Sync All';
      }
      if (!list) return;
      list.replaceChildren();
      const query = (search?.value || '').trim().toLowerCase();
      const filtered = items.filter(x =>
        (activeTab === 'history' ? x.status === 'synced' : x.status !== 'synced') &&
        String(x.payload?.unitCode || '').toLowerCase().includes(query)
      );
      if (!filtered.length) {
        const empty = document.createElement('section');
        empty.className = 'draft-empty';
        empty.textContent = activeTab === 'history'
          ? 'Belum ada Sync History'
          : 'Belum ada inspection offline yang menunggu sinkronisasi.';
        list.append(empty);
        return;
      }
      filtered.forEach(item => {
        const card = document.createElement('article');
        card.style.cssText = 'background:white;border:1px solid #dbe4ed;border-radius:14px;padding:18px;margin-bottom:12px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap';
        const content = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = item.payload?.unitCode || 'Unit';
        const info = document.createElement('div');
        info.style.cssText = 'font-size:13px;color:#64748b;margin-top:5px';
        info.textContent = [
          item.payload?.problemDescription || '', item.payload?.rating || '',
          new Date(item.createdAt).toLocaleString('id-ID'),
          item.status === 'pending' ? 'Pending Sync' :
          item.status === 'synced' ? 'Synced · ' + (item.inspectionId || '') : item.status
        ].filter(Boolean).join(' • ');
        content.append(title, info);
        card.append(content);
        list.append(card);
      });
    } catch (error) {
      if (version !== renderVersion || !list) return;
      list.replaceChildren();
      const p = document.createElement('p');
      p.textContent = 'Gagal membaca draft lokal: ' + error.message;
      list.append(p);
    }
  }

  async function syncAll(manual = false) {
    if (syncing || !navigator.onLine) { connection(); return; }
    if (!manual && Date.now() - lastFailedAttempt < RETRY_DELAY_MS) return;
    syncing = true;
    if (syncButton) { syncButton.disabled = true; syncButton.textContent = 'Syncing...'; }
    let successCount = 0;
    let failedCount = 0;
    try {
      const items = (await window.HEXAOffline.list()).filter(pendingItem);
      if (!items.length) return;
      if (notice) notice.textContent = 'Mengirim ' + items.length + ' inspeksi yang menunggu sinkronisasi...';
      for (const item of items) {
        if (!navigator.onLine) break;
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ ...item.payload, action: 'syncOfflineInspection', clientRequestId: item.id })
          });
          if (!response.ok) throw Error('HTTP ' + response.status);
          const result = await response.json();
          if (result.success && result.clientRequestId === item.id && result.inspectionId) {
            await window.HEXAOffline.updateStatus(item.id, 'synced', {
              inspectionId: result.inspectionId,
              syncedAt: new Date().toISOString(),
              lastError: ''
            });
            successCount++;
          } else {
            const message = String(result.message || 'Server belum mengonfirmasi penyimpanan');
            await window.HEXAOffline.updateStatus(item.id, 'failed', { lastError: message });
            failedCount++;
          }
        } catch (error) {
          // Respons jaringan tidak pasti: tetap pending, aman dicoba lagi dengan clientRequestId sama.
          await window.HEXAOffline.updateStatus(item.id, 'pending', {
            lastError: 'Respons tidak diterima: ' + error.message
          });
          failedCount++;
          if (!navigator.onLine) break;
        }
        await render();
      }
      if (failedCount) lastFailedAttempt = Date.now();
      else lastFailedAttempt = 0;
      if (notice) notice.textContent = 'Sync selesai: ' + successCount + ' berhasil, ' + failedCount + ' belum berhasil. Data yang belum terkonfirmasi tetap tersimpan di perangkat.';
    } catch (error) {
      lastFailedAttempt = Date.now();
      if (notice) notice.textContent = 'Sync gagal: ' + error.message;
    } finally {
      syncing = false;
      await render();
    }
  }

  async function autoSync() {
    connection();
    if (!navigator.onLine || syncing) return;
    await syncAll(false);
  }

  syncButton?.addEventListener('click', () => { void syncAll(true); });
  window.addEventListener('online', () => { connection(); void autoSync(); });
  window.addEventListener('offline', () => { connection(); void render(); });
  window.addEventListener('focus', () => { void autoSync(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void autoSync();
  });
  window.setInterval(() => { if (!document.hidden) void autoSync(); }, CHECK_INTERVAL_MS);

  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    activeTab = button.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(b => {
      const selected = b === button;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-selected', String(selected));
    });
    void render();
  }));
  search?.addEventListener('input', () => { void render(); });
  if (notice) notice.textContent = 'Inspection offline disimpan di perangkat. Sync All aktif saat online. Auto Sync memeriksa antrean setiap 12 detik saat halaman terbuka.';
  connection();
  void render();
  void autoSync();

  // Floating Start Inspection shortcut — dipertahankan dari V3.
  const shortcut = document.getElementById('inspectionShortcut');
  if (shortcut) {
    const positionKey = 'hexaInspectionButtonPosition';
    let drag = null;
    let suppressClick = false;
    const clamp = (x, y) => ({
      left: Math.max(0, Math.min(window.innerWidth - shortcut.offsetWidth, x)),
      top: Math.max(0, Math.min(window.innerHeight - shortcut.offsetHeight, y))
    });
    function move(x, y) {
      const pos = clamp(x, y);
      shortcut.style.left = pos.left + 'px';
      shortcut.style.top = pos.top + 'px';
      shortcut.style.right = 'auto';
      shortcut.style.bottom = 'auto';
    }
    try {
      const saved = JSON.parse(localStorage.getItem(positionKey) || 'null');
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) move(saved.left, saved.top);
    } catch (_) {}
    shortcut.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const rect = shortcut.getBoundingClientRect();
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY,
        left: rect.left, top: rect.top, moved: false };
      shortcut.setPointerCapture?.(event.pointerId);
    });
    shortcut.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) <= 5) return;
      drag.moved = true;
      move(drag.left + dx, drag.top + dy);
    });
    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.moved) {
        suppressClick = true;
        const rect = shortcut.getBoundingClientRect();
        try { localStorage.setItem(positionKey, JSON.stringify({ left: rect.left, top: rect.top })); } catch (_) {}
      }
      drag = null;
    }
    shortcut.addEventListener('pointerup', endDrag);
    shortcut.addEventListener('pointercancel', endDrag);
    shortcut.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      window.location.href = 'start-inspection.html';
    });
    window.addEventListener('resize', () => {
      if (shortcut.style.left) {
        const rect = shortcut.getBoundingClientRect();
        move(rect.left, rect.top);
      }
    });
  }
})();
