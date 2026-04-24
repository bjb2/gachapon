// MachineDef validation. Returns { ok: true } or { ok: false, errors: [...] }.
// Rarity tiers and ball styles live outside the machine in v2+ schemas.
import { MAX_POOL_SIZE, MIN_POOL_SIZE } from './default-machines.js';

export function validateMachine(m) {
  const errors = [];
  if (!m || typeof m !== 'object') return { ok: false, errors: ['machine must be an object'] };
  for (const k of ['id', 'name']) if (!m[k]) errors.push(`missing ${k}`);
  if (!m.dome || typeof m.dome !== 'object') errors.push('missing dome');
  else {
    for (const k of ['widthPx', 'heightPx', 'borderRadiusPx', 'wallArcSegments', 'ballRadiusPx', 'ballSpawnGridCols']) {
      if (typeof m.dome[k] !== 'number') errors.push(`dome.${k} must be a number`);
    }
  }
  if (!m.physics || typeof m.physics !== 'object') errors.push('missing physics');
  if (!m.controls || typeof m.controls.turnsNeeded !== 'number') errors.push('controls.turnsNeeded required');
  if (typeof m.poolSize !== 'number' || m.poolSize < MIN_POOL_SIZE || m.poolSize > MAX_POOL_SIZE) {
    errors.push(`poolSize must be between ${MIN_POOL_SIZE} and ${MAX_POOL_SIZE}`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
