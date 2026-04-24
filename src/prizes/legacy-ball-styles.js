// Frozen snapshot of the old per-machine ballStyles tables from DEFAULT_MACHINES
// as they existed in schema v1. Used only by migrateLegacyPrize to translate a
// legacy string ballStyle (e.g. 'pink') into the new object form.
//
// Do not edit unless you know what you're doing — this must match what users
// actually have in their IDB.
export const LEGACY_BALL_STYLES = {
  classic: {
    common: { hi: '#FFFCE0', mid: '#FFD166', lo: '#C49000', glow: null },
    rare:   { hi: '#C8EEFF', mid: '#74B9FF', lo: '#0550B8', glow: null },
    ultra:  { hi: '#FFFBE8', mid: '#FFD700', lo: '#E04800', glow: 'rgba(255,200,0,0.65)' },
    pink:   { hi: '#FFE6F4', mid: '#FF6B9D', lo: '#B0005A', glow: null },
    mint:   { hi: '#C0FBF7', mid: '#4ECDC4', lo: '#008878', glow: null },
    purple: { hi: '#EAE6FF', mid: '#A29BFE', lo: '#4840D8', glow: null },
  },
  noir: {
    common: { hi: '#888888', mid: '#3A3A3A', lo: '#111111', glow: null },
    rare:   { hi: '#FFFACC', mid: '#F7B731', lo: '#886000', glow: null },
    ultra:  { hi: '#FFFFFF', mid: '#F7B731', lo: '#AA4400', glow: 'rgba(247,183,49,0.7)' },
    steel:  { hi: '#CCDDEE', mid: '#8899AA', lo: '#334455', glow: null },
    rust:   { hi: '#FFDDBB', mid: '#CC6633', lo: '#662211', glow: null },
    neon:   { hi: '#EEFFCC', mid: '#88CC44', lo: '#225500', glow: 'rgba(136,204,68,0.5)' },
  },
  cyber: {
    common: { hi: '#A0F4FF', mid: '#00B8D4', lo: '#004A5A', glow: null },
    rare:   { hi: '#E0CCFF', mid: '#BF5AF2', lo: '#5A00A0', glow: null },
    ultra:  { hi: '#FFFFFF', mid: '#00D9FF', lo: '#004466', glow: 'rgba(0,217,255,0.75)' },
    pink:   { hi: '#FFCCEE', mid: '#FF006B', lo: '#660030', glow: 'rgba(255,0,107,0.5)' },
    yellow: { hi: '#FFFFCC', mid: '#FFE600', lo: '#665500', glow: 'rgba(255,230,0,0.45)' },
    green:  { hi: '#CCFFEE', mid: '#00FF88', lo: '#006633', glow: 'rgba(0,255,136,0.4)' },
  },
  forest: {
    common: { hi: '#D4F0A0', mid: '#7CB342', lo: '#2D5010', glow: null },
    rare:   { hi: '#FFE4AA', mid: '#C8A028', lo: '#5C3D00', glow: null },
    ultra:  { hi: '#FFF8E1', mid: '#FFB300', lo: '#6D4C00', glow: 'rgba(255,179,0,0.6)' },
    moss:   { hi: '#C8E8B0', mid: '#558B2F', lo: '#1A3800', glow: null },
    earth:  { hi: '#DDCCBB', mid: '#8D6E63', lo: '#3E2723', glow: null },
    berry:  { hi: '#F8CCCC', mid: '#C62828', lo: '#5A0000', glow: 'rgba(198,40,40,0.4)' },
  },
  modern: {
    common:   { hi: '#FFFFFF', mid: '#ADE8FF', lo: '#50A8CC', glow: null },
    rare:     { hi: '#FFFFFF', mid: '#FFB8D4', lo: '#D06888', glow: null },
    ultra:    { hi: '#FFFEF0', mid: '#FFF080', lo: '#B89010', glow: 'rgba(255,230,80,0.55)' },
    lavender: { hi: '#FFFFFF', mid: '#D4BBFF', lo: '#8060C8', glow: null },
    mint:     { hi: '#FFFFFF', mid: '#B8F4D4', lo: '#38B86A', glow: null },
    peach:    { hi: '#FFFFFF', mid: '#FFD4B0', lo: '#C88050', glow: null },
  },
};
