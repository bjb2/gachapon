// Boot: seed/migrate defaults, load machine + rarities + prizes, mount Machine.
import { DEFAULT_MACHINES } from './machines/default-machines.js';
import { getAllMachines, bulkPutMachines, getMachine } from './machines/machine-store.js';
import { getAllPrizes, bulkPutPrizes, putPrize, deletePrize } from './prizes/prize-store.js';
import { loadDefaultPrizes, LEGACY_DEFAULT_PRIZE_IDS } from './prizes/default-prizes.js';
import { migrateLegacyPrize } from './prizes/prize-schema.js';
import { LEGACY_BALL_STYLES } from './prizes/legacy-ball-styles.js';
import { DEFAULT_RARITIES } from './rarities/default-rarities.js';
import { getAllRarities, bulkPutRarities } from './rarities/rarity-store.js';
import { Machine } from './machine/Machine.js';

async function ensureSeeded() {
  // Version-aware machine upsert.
  const existingMachines = await getAllMachines();
  const existingById = new Map(existingMachines.map(m => [m.id, m]));
  const toUpsert = DEFAULT_MACHINES.filter(def => {
    const stored = existingById.get(def.id);
    return !stored || (stored.version || 0) < (def.version || 0);
  });
  if (toUpsert.length > 0) await bulkPutMachines(toUpsert);

  if ((await getAllRarities()).length === 0) {
    await bulkPutRarities(DEFAULT_RARITIES);
  }

  const existingPrizes = await getAllPrizes();
  // First-time visitor → seed chibis. Visitor who only has the legacy 8 SVG
  // defaults → wipe + reseed (the 8-prize seed predates the chibi library;
  // anyone still on it never imported their own prizes, so it's safe to
  // upgrade them automatically). Anyone with custom prizes is left alone.
  const isLegacyOnly = existingPrizes.length > 0
    && existingPrizes.every(p => LEGACY_DEFAULT_PRIZE_IDS.has(p.id));
  if (existingPrizes.length === 0 || isLegacyOnly) {
    if (isLegacyOnly) {
      for (const p of existingPrizes) await deletePrize(p.id);
    }
    await bulkPutPrizes(await loadDefaultPrizes());
  } else {
    // Migrate any legacy v1 prizes in-place (string ballStyle or machineId present).
    for (const p of existingPrizes) {
      const needsMigration = typeof p.ballStyle === 'string' || 'machineId' in p;
      if (needsMigration) {
        await putPrize(migrateLegacyPrize(p, LEGACY_BALL_STYLES));
      }
    }
  }
}

async function pickMachineId() {
  const params = new URLSearchParams(location.search);
  const q = params.get('machine');
  if (q) return q;
  const stored = localStorage.getItem('gachapon:selectedMachine');
  return stored || 'valkyrie';
}

async function boot() {
  await ensureSeeded();
  const machineId = await pickMachineId();
  // Prefer stored, else DEFAULT_MACHINES by id, else first default. The middle
  // case matters when a fresh DEFAULT_MACHINES entry hasn't yet been picked up
  // by the seeder (e.g. browser cached an older default-machines.js).
  const storedDef = (await getMachine(machineId))
    || DEFAULT_MACHINES.find(d => d.id === machineId)
    || DEFAULT_MACHINES[0];
  // Merge: live DEFAULT_MACHINES entry provides any fields added since this record
  // was seeded; stored def preserves user customisations (they take precedence).
  const liveDef = DEFAULT_MACHINES.find(d => d.id === storedDef.id);
  const machineDef = liveDef ? { ...liveDef, ...storedDef } : storedDef;

  const rarities = await getAllRarities();
  const prizes = await getAllPrizes();

  const host = document.getElementById('machineWrap');
  const collectionHost = document.getElementById('collectionWrap');
  const hintHost = document.getElementById('hintLine');

  const m = new Machine({ machineDef, prizes, rarities, host, collectionHost, hintHost });
  m.mount();

  window.__gacha = m;
}

boot().catch(err => {
  console.error('[gachapon] boot failed', err);
  const hint = document.getElementById('hintLine');
  if (hint) hint.textContent = 'Error starting machine — see console.';
});
