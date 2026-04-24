import { findTier } from './rarity.js';

// Build a shuffled pool of prize ids for a machine.
//
// Weighted sampling without replacement would be "one of each, then another
// sampled batch" — unnecessarily clever. We just do weighted sampling *with*
// replacement up to `poolSize`, which keeps the user-visible weight semantics
// intuitive: a tier with weight 4 is 4× more likely to appear than weight 1.
//
// If the prize library is empty, returns []. If a prize references an unknown
// rarity, it's skipped rather than crashing.
export function buildPool(prizes, rarityTiers, poolSize) {
  if (!prizes || prizes.length === 0) return [];
  const size = Math.max(0, Math.floor(poolSize || 0));
  if (size === 0) return [];

  // Each prize contributes its rarity's weight to the cumulative distribution.
  const weighted = [];
  let total = 0;
  for (const p of prizes) {
    const tier = findTier(rarityTiers, p.rarity);
    if (!tier) continue;
    const w = Math.max(0, tier.weight ?? tier.poolWeight ?? 1);
    if (w === 0) continue;
    total += w;
    weighted.push({ id: p.id, cum: total });
  }
  if (total === 0) return [];

  const pool = new Array(size);
  for (let i = 0; i < size; i++) {
    const r = Math.random() * total;
    // Linear scan is fine — prize libraries are small.
    let pick = weighted[0].id;
    for (const w of weighted) {
      if (r < w.cum) { pick = w.id; break; }
    }
    pool[i] = pick;
  }

  // Shuffle so clustered rarities don't drop in streaks.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
