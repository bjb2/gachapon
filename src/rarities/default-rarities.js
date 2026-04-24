// Global rarity tiers. User can add / remove / re-order via the creator UI.
// Each prize points to a tier by `id`; each tier carries its display details
// (label, weight in the spawn pool, stars, sparkle config).
export const DEFAULT_RARITIES = [
  {
    id: 'common',
    label: 'COMMON',
    weight: 4,
    stars: '★',
    sparkleCount: 4,
    sparkleEmojis: ['✨', '⭐'],
  },
  {
    id: 'rare',
    label: 'RARE',
    weight: 2,
    stars: '★★',
    sparkleCount: 6,
    sparkleEmojis: ['✨', '💫', '⭐'],
  },
  {
    id: 'ultra',
    label: 'ULTRA RARE ✦',
    weight: 1,
    stars: '★★★',
    sparkleCount: 10,
    sparkleEmojis: ['✨', '🌟', '💫', '⭐', '🔥'],
  },
];

// Version bumps here trigger the seeder in main.js / creator.js to upsert the
// defaults even for existing users. Increment when the shipped default list
// changes in a way that should propagate.
export const DEFAULT_RARITIES_VERSION = 1;

export function defaultRarity(partial = {}) {
  return {
    id: partial.id || `tier-${Date.now().toString(36)}`,
    label: partial.label || 'NEW TIER',
    weight: partial.weight ?? 1,
    stars: partial.stars || '★',
    sparkleCount: partial.sparkleCount ?? 4,
    sparkleEmojis: partial.sparkleEmojis || ['✨'],
  };
}

export function validateRarity(r) {
  const errors = [];
  if (!r || typeof r !== 'object') return { ok: false, errors: ['rarity must be an object'] };
  if (!r.id) errors.push('missing id');
  if (!r.label) errors.push('missing label');
  if (typeof r.weight !== 'number' || r.weight < 0) errors.push('weight must be a non-negative number');
  if (!Array.isArray(r.sparkleEmojis) || r.sparkleEmojis.length === 0) errors.push('sparkleEmojis must be a non-empty array');
  return errors.length ? { ok: false, errors } : { ok: true };
}
