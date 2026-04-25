// Creator UI boot. Seeds + migrates defaults, wires the rarities/prize/machine
// panels, and handles per-machine standalone-HTML export plus JSON export/import/reset.
import { DEFAULT_MACHINES } from './machines/default-machines.js';
import { getAllMachines, bulkPutMachines } from './machines/machine-store.js';
import { getAllPrizes, bulkPutPrizes, openDB, putPrize, deletePrize } from './prizes/prize-store.js';
import { loadDefaultPrizes, LEGACY_DEFAULT_PRIZE_IDS } from './prizes/default-prizes.js';
import { migrateLegacyPrize } from './prizes/prize-schema.js';
import { LEGACY_BALL_STYLES } from './prizes/legacy-ball-styles.js';
import { DEFAULT_RARITIES } from './rarities/default-rarities.js';
import { getAllRarities, bulkPutRarities } from './rarities/rarity-store.js';

import { PrizeEditor } from './creator/prize-editor.js';
import { PrizeForm } from './creator/prize-form.js';
import { MachineSelector } from './creator/machine-selector.js';
import { RarityEditor } from './creator/rarity-editor.js';
import { downloadExport } from './creator/export-package.js';
import { downloadTemplate, csvToPrizes } from './creator/prize-csv.js';

async function ensureSeeded() {
  if ((await getAllMachines()).length === 0) {
    await bulkPutMachines(DEFAULT_MACHINES);
  } else {
    // Version-aware upsert so shipped machine changes reach existing users.
    const existing = new Map((await getAllMachines()).map(m => [m.id, m]));
    const toUpsert = DEFAULT_MACHINES.filter(def => {
      const stored = existing.get(def.id);
      return !stored || (stored.version || 0) < (def.version || 0);
    });
    if (toUpsert.length) await bulkPutMachines(toUpsert);
  }

  if ((await getAllRarities()).length === 0) {
    await bulkPutRarities(DEFAULT_RARITIES);
  }

  const existingPrizes = await getAllPrizes();
  // Same first-visit / legacy-only migration as main.js.
  const isLegacyOnly = existingPrizes.length > 0
    && existingPrizes.every(p => LEGACY_DEFAULT_PRIZE_IDS.has(p.id));
  if (existingPrizes.length === 0 || isLegacyOnly) {
    if (isLegacyOnly) {
      for (const p of existingPrizes) await deletePrize(p.id);
    }
    await bulkPutPrizes(await loadDefaultPrizes());
  } else {
    for (const p of existingPrizes) {
      if (typeof p.ballStyle === 'string' || 'machineId' in p) {
        await putPrize(migrateLegacyPrize(p, LEGACY_BALL_STYLES));
      }
    }
  }
}

async function exportJson() {
  const machines = await getAllMachines();
  const prizes = await getAllPrizes();
  const rarities = await getAllRarities();
  const blob = new Blob([JSON.stringify({ machines, prizes, rarities }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gachapon-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

async function importJson(file) {
  const text = await file.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { alert('Invalid JSON.'); return; }
  if (!data.machines || !data.prizes) { alert('Missing machines/prizes keys.'); return; }
  const rarityCount = data.rarities ? data.rarities.length : 0;
  if (!confirm(`Import ${data.machines.length} machines, ${data.prizes.length} prizes${rarityCount ? `, ${rarityCount} rarities` : ''}? This overwrites by id.`)) return;
  await bulkPutMachines(data.machines);
  await bulkPutPrizes(data.prizes);
  if (data.rarities) await bulkPutRarities(data.rarities);
  alert('Imported.');
  location.reload();
}

async function resetAll() {
  if (!confirm('Reset to factory defaults? This deletes all your prizes, rarities, and machines.')) return;
  const db = await openDB();
  for (const name of ['machines', 'prizes', 'blobs', 'state', 'rarities']) {
    await new Promise((resolve, reject) => {
      const r = db.transaction(name, 'readwrite').objectStore(name).clear();
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
  }
  await bulkPutMachines(DEFAULT_MACHINES);
  await bulkPutRarities(DEFAULT_RARITIES);
  await bulkPutPrizes(await loadDefaultPrizes());
  alert('Reset complete.');
  location.reload();
}

function showToast(msg, isError = false) {
  const old = document.querySelector('.export-status');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'export-status' + (isError ? ' err' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), isError ? 5000 : 2800);
}

async function handleCsvImport(file, editor, selector) {
  const text = await file.text();
  let result;
  try {
    const rarities = await getAllRarities();
    result = csvToPrizes(text, rarities);
  } catch (err) {
    showToast(err.message, true);
    return;
  }
  const { prizes, errors } = result;
  if (prizes.length === 0) {
    showToast('No valid prizes in CSV.', true);
    return;
  }
  const msg = errors.length > 0
    ? `Import ${prizes.length} prizes? ${errors.length} row(s) skipped:\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n…and ${errors.length - 5} more` : ''}`
    : `Import ${prizes.length} prize${prizes.length === 1 ? '' : 's'}?`;
  if (!confirm(msg)) return;
  await bulkPutPrizes(prizes);
  await editor.refresh();
  if (selector) selector.reloadPreview();
  showToast(`Imported ${prizes.length} prize${prizes.length === 1 ? '' : 's'}.`);
}

async function handleExport(machine, btn) {
  const prizes = await getAllPrizes();
  const rarities = await getAllRarities();
  if (prizes.length === 0) { showToast('No prizes to export. Add some first.', true); return; }
  if (rarities.length === 0) { showToast('No rarity tiers defined.', true); return; }
  const original = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Building…'; }
  try {
    await downloadExport({ machine, prizes, rarities });
    showToast(`Exported ${machine.name} with ${prizes.length} prizes.`);
  } catch (err) {
    console.error('[creator] export failed', err);
    showToast(`Export failed: ${err.message}`, true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = original; }
  }
}

async function boot() {
  await ensureSeeded();

  const rarityPanel   = document.getElementById('rarityList');
  const listPanel     = document.getElementById('prizeList');
  const formPanel     = document.getElementById('prizeForm');
  const selectorPanel = document.getElementById('machineSelector');

  const rarities = await getAllRarities();

  const selector = new MachineSelector(selectorPanel, {
    onExport: (m) => {
      const btn = selectorPanel.querySelector('.selector-export');
      handleExport(m, btn);
    },
  });

  const form = new PrizeForm(formPanel, {
    rarities,
    onSaved: () => { editor.refresh(); selector.reloadPreview(); },
  });

  const editor = new PrizeEditor(listPanel, {
    rarities,
    onEdit: (prize) => form.open(prize),
    onNew:  () => form.open(null),
    onDownloadTemplate: () => downloadTemplate(),
    onImportCsv: (file) => handleCsvImport(file, editor, selector),
  });

  const rarityEditor = new RarityEditor(rarityPanel, {
    onChange: (next) => {
      form.setRarities(next);
      editor.setRarities(next);
      selector.reloadPreview();
    },
  });

  // Isolate each panel's refresh — one bad panel shouldn't kill the whole page.
  const panels = [
    { name: 'prizes',   run: () => editor.refresh() },
    { name: 'rarities', run: () => rarityEditor.refresh() },
    { name: 'machines', run: () => selector.refresh() },
  ];
  for (const { name, run } of panels) {
    try { await run(); }
    catch (err) {
      console.error(`[creator] ${name} panel failed`, err);
      showToast(`${name} panel error: ${err.message}`, true);
    }
  }

  document.getElementById('exportBtn').addEventListener('click', exportJson);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => { if (e.target.files[0]) importJson(e.target.files[0]); });
}

boot().catch(err => {
  console.error('[creator] boot failed', err);
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:16px;background:#ffe;color:#800">Creator boot failed: ${err.message}. Try <button onclick="(async()=>{indexedDB.deleteDatabase('gachapon');location.reload();})()" style="margin-left:8px;">Reset database &amp; reload</button></div>`);
});
