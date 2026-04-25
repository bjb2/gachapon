// Custom machine schema. Used by the designer UI, the IDB store, and (in
// later phases) the runtime renderer + standalone exporter.
//
// Component types:
//   hopper      — required, exactly 1; the ball container. variant picks the shape.
//   chute       — required, exactly 1; the dispense location.
//   crank       — optional, <= 1; clickable, rotates each turn.
//   brand-strip — optional, <= 1; text band.
//   led         — optional, <= 1; pull counter readout.
//   turn-dots   — optional, <= 1; progress indicators.
//   tray        — optional, <= 1; visual catch tray.
//   decoration  — optional, unlimited; pure visual (no engine wiring).

export const COMPONENT_TYPES = [
  'hopper', 'chute', 'crank', 'brand-strip', 'led', 'turn-dots', 'tray', 'decoration',
];

export const HOPPER_VARIANTS = ['dome', 'box', 'funnel', 'cylinder', 'hourglass', 'polygon'];

// Shape any custom-machine record. Phase 1 only persists the fields the
// canvas needs; engine fields (physics, controls, audio) are filled in by
// later phases and default to the modern-truck values.
export function newCustomMachine(partial = {}) {
  return {
    id: partial.id || `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: partial.name || 'Untitled Machine',
    version: 1,
    canvas: partial.canvas || { width: 360, height: 540, bg: '#FFFFFF' },
    components: partial.components || [],
  };
}

export function newComponent(type, partial = {}) {
  if (!COMPONENT_TYPES.includes(type)) throw new Error(`unknown component type: ${type}`);
  const base = {
    id: partial.id || `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    x: partial.x ?? 100,
    y: partial.y ?? 100,
    rotation: partial.rotation ?? 0,
    locked: partial.locked ?? false,
    hidden: partial.hidden ?? false,
  };
  switch (type) {
    case 'hopper':
      return {
        ...base,
        variant: partial.variant || 'dome',
        width: partial.width ?? 240,
        height: partial.height ?? 180,
        wallColor: partial.wallColor || '#DDD8E0',
        wallThickness: partial.wallThickness ?? 3,
        windowFill: partial.windowFill || 'rgba(222,234,250,0.5)',
      };
    case 'chute':
      // Visual marker; the renderer auto-builds a funnel from the nearest
      // hopper exit to this chute opening.
      return {
        ...base,
        width: partial.width ?? 80,
        height: partial.height ?? 60,
        openingColor: partial.openingColor || '#222',
      };
    case 'crank':
      return {
        ...base, size: partial.size ?? 64, accent: partial.accent || '#888090',
        style: partial.style || 'chrome',
      };
    case 'brand-strip':
      return {
        ...base, width: partial.width ?? 240, height: partial.height ?? 28,
        text: partial.text || 'BRAND',
        fg: partial.fg || '#FFFFFF', bg: partial.bg || '#111111',
        font: partial.font || 'Orbitron', letterSpacing: partial.letterSpacing ?? 0.45,
      };
    case 'led':
      return {
        ...base, width: partial.width ?? 80, height: partial.height ?? 22,
        color: partial.color || '#88FF44', bg: partial.bg || '#12110E',
      };
    case 'turn-dots':
      return {
        ...base, count: partial.count ?? 3, dotSize: partial.dotSize ?? 8,
        litColor: partial.litColor || '#CC0000', dimColor: partial.dimColor || '#E4E0E0',
      };
    case 'tray':
      return {
        ...base, width: partial.width ?? 240, height: partial.height ?? 70,
        fill: partial.fill || '#EDECEC', stroke: partial.stroke || '#D4D2D2',
      };
    case 'decoration':
      return {
        ...base,
        shape: partial.shape || 'rect',
        width: partial.width ?? 80, height: partial.height ?? 80,
        fill: partial.fill || '#FF6B9D', stroke: partial.stroke || null,
      };
  }
}

// Validation — used by save / export to refuse invalid machines.
// Singleton component types — at most one of each per machine.
export const SINGLETON_TYPES = new Set([
  'hopper', 'chute', 'crank', 'brand-strip', 'led', 'turn-dots', 'tray',
]);

export function validateCustomMachine(m) {
  const errors = [];
  if (!m || typeof m !== 'object') return ['machine must be an object'];
  if (!m.id) errors.push('missing id');
  if (!m.name) errors.push('missing name');
  if (!Array.isArray(m.components)) errors.push('components must be an array');
  else {
    const counts = {};
    for (const c of m.components) counts[c.type] = (counts[c.type] || 0) + 1;
    if ((counts.hopper || 0) !== 1) errors.push('machine must have exactly one hopper');
    if ((counts.chute || 0) !== 1) errors.push('machine must have exactly one chute');
    for (const t of SINGLETON_TYPES) {
      if ((counts[t] || 0) > 1) errors.push(`only one ${t} allowed`);
    }
  }
  return errors;
}
