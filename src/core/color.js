// Tiny color helpers. Used by ball rendering to derive highlight / shadow
// colors from a single user-picked base color.
export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return { r: 200, g: 200, b: 200 };
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

export function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, v | 0));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Mix a color toward white (`amount` 0..1).
export function lighten(hex, amount = 0.3) {
  const { r, g, b } = hexToRgb(hex);
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

// Mix a color toward black.
export function darken(hex, amount = 0.3) {
  const { r, g, b } = hexToRgb(hex);
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
}
