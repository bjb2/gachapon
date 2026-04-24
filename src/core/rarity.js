// Rarity tier helpers. The actual default list lives in src/rarities/default-rarities.js;
// this module just provides the lookup used by pool builder, reveal modal, and sparkles.
//
// A tier has: { id, label, weight, stars, sparkleCount, sparkleEmojis }.

export function findTier(tiers, id) {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return { id: 'common', label: 'COMMON', weight: 1, stars: '★', sparkleCount: 4, sparkleEmojis: ['✨'] };
  }
  return tiers.find(t => t.id === id) || tiers[0];
}
