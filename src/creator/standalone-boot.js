// Entry point for an exported single-file gachapon.
//
// Reads the machine def + rarities + prize pool from the embedded
// <script id="gacha-data"> tag (written by export-package.js) and mounts
// Machine directly. No IndexedDB, no seeding — the data is already baked in.
import { Machine } from '../machine/Machine.js';

function parseEmbedded() {
  const el = document.getElementById('gacha-data');
  if (!el) throw new Error('missing #gacha-data payload');
  return JSON.parse(el.textContent);
}

function boot() {
  const { machine, prizes, rarities } = parseEmbedded();

  document.documentElement.dataset.skin = machine.skin || 'classic';

  const host = document.getElementById('machineWrap');
  const collectionHost = document.getElementById('collectionWrap');
  const hintHost = document.getElementById('hintLine');

  const m = new Machine({ machineDef: machine, prizes, rarities, host, collectionHost, hintHost });
  m.mount();
  window.__gacha = m;
}

try {
  boot();
} catch (err) {
  console.error('[gachapon] boot failed', err);
  const hint = document.getElementById('hintLine');
  if (hint) hint.textContent = 'Error starting machine — see console.';
}
