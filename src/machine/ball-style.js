// Apply a prize's ballStyle ({ type, color1, color2, glow }) to a DOM
// element — used for the tray ball.
import { lighten, darken } from '../core/color.js';

export function applyBallStyle(el, style) {
  if (!style) return;
  const glow = style.glow || null;
  if (style.type === 'capsule') {
    // Horizontal split at 50 % with a thin highlight band on the seam to
    // emulate a real capsule toy. Slightly darkened bottom stop for depth.
    const c1 = style.color1 || '#FFD166';
    const c2 = style.color2 || '#FF6B9D';
    el.style.background = [
      'linear-gradient(to bottom,',
      `${lighten(c1, 0.2)} 0%,`,
      `${c1} 48%,`,
      'rgba(255,255,255,0.55) 49.5%,',
      'rgba(255,255,255,0.55) 50.5%,',
      `${c2} 52%,`,
      `${darken(c2, 0.25)} 100%)`,
    ].join(' ');
  } else {
    const c = style.color1 || '#CCCCCC';
    el.style.background = `radial-gradient(circle at 35% 30%, ${lighten(c, 0.55)}, ${c} 55%, ${darken(c, 0.45)})`;
  }
  if (glow) {
    el.style.boxShadow = `0 4px 9px rgba(0,0,0,.18), 0 0 14px ${glow}`;
    el.classList.add('is-glow');
  } else {
    el.style.boxShadow = '0 4px 9px rgba(0,0,0,.18)';
    el.classList.remove('is-glow');
  }
}
