// Boot: seed/migrate defaults, load machine + rarities + prizes, mount Machine.
import { DEFAULT_MACHINES } from './machines/default-machines.js';
import { getAllMachines, bulkPutMachines, getMachine } from './machines/machine-store.js';
import { getAllPrizes, bulkPutPrizes, putPrize } from './prizes/prize-store.js';
import { loadDefaultPrizes } from './prizes/default-prizes.js';
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
  if (existingPrizes.length === 0) {
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
  return stored || 'classic';
}

async function boot() {
  await ensureSeeded();
  const machineId = await pickMachineId();
  const storedDef = (await getMachine(machineId)) || DEFAULT_MACHINES[0];
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
