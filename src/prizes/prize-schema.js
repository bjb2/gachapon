// Prize schema — chassis-independent. A prize carries its own ball style so it
// renders the same in any machine. Art is one of { kind: svg|image, source:
// inline|blob|url, value }.
//
// ballStyle:
//   { type: 'capsule', color1: '#hex', color2: '#hex', glow: '#hex' | null }
//       Two-tone classic gachapon look (upper hemisphere = color1, lower = color2).
//   { type: 'plain',   color1: '#hex',                  glow: '#hex' | null }
//       Single-color ball with subtle shading.

export function defaultBallStyle() {
  return { type: 'capsule', color1: '#FFD166', color2: '#FF6B9D', glow: null };
}

export function defaultPrize(partial = {}) {
  return {
    id: partial.id || `prize-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: partial.name || 'New Prize',
    rarity: partial.rarity || 'common',
    flavor: partial.flavor || '',
    ballStyle: partial.ballStyle || defaultBallStyle(),
    art: partial.art || { kind: 'svg', source: 'inline', value: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="40" fill="#ddd"/></svg>' },
  };
}

export function validatePrize(p) {
  const errors = [];
  if (!p || typeof p !== 'object') return { ok: false, errors: ['prize must be an object'] };
  for (const k of ['id', 'name', 'rarity']) if (!p[k]) errors.push(`missing ${k}`);
  if (!p.art || typeof p.art !== 'object') errors.push('missing art');
  else {
    if (!['svg', 'image'].includes(p.art.kind)) errors.push('art.kind must be "svg" or "image"');
    if (!['inline', 'blob', 'url'].includes(p.art.source)) errors.push('art.source must be "inline" | "blob" | "url"');
    if (!p.art.value) errors.push('art.value required');
  }
  if (!p.ballStyle || typeof p.ballStyle !== 'object') errors.push('missing ballStyle');
  else {
    if (!['capsule', 'plain'].includes(p.ballStyle.type)) errors.push('ballStyle.type must be "capsule" or "plain"');
    if (!/^#[0-9a-fA-F]{6}$/.test(p.ballStyle.color1 || '')) errors.push('ballStyle.color1 must be a #rrggbb hex');
    if (p.ballStyle.type === 'capsule' && !/^#[0-9a-fA-F]{6}$/.test(p.ballStyle.color2 || '')) errors.push('ballStyle.color2 must be a #rrggbb hex');
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

// Convert legacy v1 prizes (with machineId + string ballStyle) to the new
// schema. Returns a new prize object; does not mutate.
//
// `legacyBallStylesByMachine` is a { machineId → { styleKey → {hi, mid, lo, glow} } }
// lookup captured from the old DEFAULT_MACHINES, so we can translate the string
// ballStyle field into the new { type, color1, color2, glow } object.
export function migrateLegacyPrize(p, legacyBallStylesByMachine) {
  if (!p || typeof p !== 'object') return p;
  // Already migrated: ballStyle is an object with `type`.
  if (p.ballStyle && typeof p.ballStyle === 'object' && p.ballStyle.type) {
    const { machineId, ...rest } = p;
    return rest;
  }
  const mid = legacyBallStylesByMachine?.[p.machineId]?.[p.ballStyle] || null;
  const newStyle = mid
    ? { type: 'capsule', color1: mid.hi || '#FFF', color2: mid.lo || '#888', glow: mid.glow || null }
    : defaultBallStyle();
  const { machineId, ballStyle, ...rest } = p;
  return { ...rest, ballStyle: newStyle };
}
