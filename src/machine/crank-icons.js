// Crank icon catalog. Each style is a small set of paths in a 30x30 viewbox
// plus the visual bbox center (for centering inside the crank button —
// using the viewbox midpoint isn't always right, e.g. the chrome arrow's
// arc bulges left while its arrowhead extends right).
//
// Used by both the designer (Fabric) and the runtime (SVG) renderers so
// the visual stays identical between editing and play.

export const CRANK_STYLES = ['chrome', 'cross', 'star', 'wheel', 'lever', 'pushbutton'];

// SVG path/shape strings, parameterized by stroke/fill color.
// Each entry: { svg(color), bboxCx, bboxCy }  — the bbox center coords are
// what `translate(-bboxCx, -bboxCy)` should subtract before scaling so the
// icon ends up visually centered.
export const CRANK_ICONS = {
  // 3/4 arc + arrowhead — the original gachapon refresh arrow.
  chrome: {
    svg: (color) =>
      `<path d="M 22 22 A 9.5 9.5 0 1 1 22 8" stroke="${color}" stroke-width="2.8" fill="none" stroke-linecap="round"/>` +
      `<polygon points="22,3 22,13 29,8" fill="${color}"/>`,
    bboxCx: 17.5, bboxCy: 13.75,
  },
  // Plus sign — coin-op machine T-handle from above.
  cross: {
    svg: (color) =>
      `<line x1="3" y1="15" x2="27" y2="15" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<line x1="15" y1="3" x2="15" y2="27" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<circle cx="15" cy="15" r="2.2" fill="${color}"/>`,
    bboxCx: 15, bboxCy: 15,
  },
  // Asterisk / spinner — classic 4-axis turn key.
  star: {
    svg: (color) =>
      `<line x1="3" y1="15" x2="27" y2="15" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<line x1="15" y1="3" x2="15" y2="27" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<line x1="6" y1="6" x2="24" y2="24" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<line x1="6" y1="24" x2="24" y2="6" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<circle cx="15" cy="15" r="2" fill="${color}"/>`,
    bboxCx: 15, bboxCy: 15,
  },
  // Old-school finger-hole dial.
  wheel: {
    svg: (color) =>
      `<circle cx="15" cy="15" r="11" fill="none" stroke="${color}" stroke-width="2.4"/>` +
      `<circle cx="15" cy="6" r="2.8" fill="${color}"/>`,
    bboxCx: 15, bboxCy: 15,
  },
  // Side lever with a knob — slot-machine arm.
  lever: {
    svg: (color) =>
      `<rect x="15" y="13" width="12" height="4" rx="2" fill="${color}"/>` +
      `<circle cx="27" cy="15" r="3.5" fill="${color}"/>` +
      `<circle cx="15" cy="15" r="3" fill="${color}"/>`,
    bboxCx: 17, bboxCy: 15,
  },
  // Minimalist push button — flat dot in the center, no rotation needed.
  pushbutton: {
    svg: (color) =>
      `<circle cx="15" cy="15" r="6" fill="${color}"/>` +
      `<circle cx="15" cy="15" r="3" fill="rgba(255,255,255,0.35)"/>`,
    bboxCx: 15, bboxCy: 15,
  },
};
