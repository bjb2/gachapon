// Fabric.js canvas adapter for the machine designer.
//
// Each Fabric object carries a `_component` payload pointing back to the
// schema record it represents. Selection, drag, resize all sync the schema
// fields back so the JSON view stays authoritative — Fabric is the editor,
// the schema is the truth.

import { newComponent } from './schema.js';

// ── Visual helpers ─────────────────────────────────────────────────────
// Build a Fabric Gradient from a schema spec. Spec shape:
//   { type: 'linear', coords: 'topToBottom'|'leftToRight'|'diag135'|{x1,y1,x2,y2},
//     stops: [{offset, color}, ...] }
//   { type: 'radial', innerR: 0, outerR: 50, cx, cy, stops: [...] }
function buildGradient(spec, w, h) {
  if (!spec) return null;
  if (spec.type === 'linear') {
    let coords;
    if (spec.coords === 'topToBottom' || !spec.coords) coords = { x1: 0, y1: 0, x2: 0, y2: h };
    else if (spec.coords === 'leftToRight') coords = { x1: 0, y1: 0, x2: w, y2: 0 };
    else if (spec.coords === 'diag135') coords = { x1: 0, y1: 0, x2: w, y2: h };
    else if (spec.coords === 'diag45') coords = { x1: 0, y1: h, x2: w, y2: 0 };
    else coords = spec.coords;
    return new fabric.Gradient({ type: 'linear', coords, colorStops: spec.stops });
  }
  if (spec.type === 'radial') {
    return new fabric.Gradient({
      type: 'radial',
      coords: {
        x1: spec.cx ?? w / 2, y1: spec.cy ?? h / 2, r1: spec.innerR ?? 0,
        x2: spec.cx ?? w / 2, y2: spec.cy ?? h / 2, r2: spec.outerR ?? Math.max(w, h) / 2,
      },
      colorStops: spec.stops,
    });
  }
  return null;
}

function buildShadow(spec) {
  if (!spec) return null;
  return new fabric.Shadow({
    color: spec.color || 'rgba(0,0,0,0.3)',
    blur: spec.blur ?? 6,
    offsetX: spec.offsetX ?? 0,
    offsetY: spec.offsetY ?? 4,
  });
}

// Apply optional visual enhancements (gradient fill, shadow) to a Fabric
// object. Components opt in via fillGradient / shadow fields in schema.
function enhance(obj, c, w, h) {
  if (c.fillGradient) {
    const g = buildGradient(c.fillGradient, w, h);
    if (g) obj.set('fill', g);
  }
  if (c.shadow) {
    const s = buildShadow(c.shadow);
    if (s) obj.set('shadow', s);
  }
  if (c.opacity !== undefined) obj.set('opacity', c.opacity);
  return obj;
}

// Phase 1: just hopper (dome/box) and chute have visual templates. More
// component renderers land in phases 2-4.
const RENDERERS = {
  hopper: renderHopper,
  chute: renderChute,
  crank: renderCrank,
  'brand-strip': renderBrandStrip,
  led: renderLed,
  'turn-dots': renderTurnDots,
  tray: renderTray,
  decoration: renderDecoration,
};

export class DesignerCanvas {
  constructor(canvasEl, machine, { onChange, onSelection } = {}) {
    this.machine = machine;
    this.onChange = onChange || (() => {});
    this.onSelection = onSelection || (() => {});
    this.canvas = new fabric.Canvas(canvasEl, {
      width: machine.canvas.width,
      height: machine.canvas.height,
      backgroundColor: machine.canvas.bg || '#FFFFFF',
      preserveObjectStacking: true,
    });
    // Bigger, more visible control handles — defaults are easy to miss.
    fabric.Object.prototype.set({
      cornerSize: 10,
      cornerColor: '#FF6B9D',
      cornerStrokeColor: '#FFFFFF',
      borderColor: '#FF6B9D',
      transparentCorners: false,
      cornerStyle: 'circle',
      padding: 2,
    });
    this._wireSelectionSync();
    this._wireSelectionEvents();
    this.rebuild();
  }

  rebuild() {
    this.canvas.clear();
    this.canvas.backgroundColor = this.machine.canvas.bg || '#FFFFFF';
    for (const c of this.machine.components) this._addFabricFor(c);
    this.canvas.requestRenderAll();
  }

  addComponent(type, partial = {}) {
    const c = newComponent(type, partial);
    this.machine.components.push(c);
    const obj = this._addFabricFor(c);
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    this.onChange(this.machine);
    return c;
  }

  removeActive() {
    const obj = this.canvas.getActiveObject();
    if (!obj || !obj._component) return;
    const id = obj._component.id;
    this.machine.components = this.machine.components.filter(c => c.id !== id);
    this.canvas.remove(obj);
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.onChange(this.machine);
  }

  toJSON() { return this.machine; }

  _addFabricFor(component) {
    const renderer = RENDERERS[component.type];
    if (!renderer) {
      console.warn(`[designer] no renderer for type ${component.type}`);
      return null;
    }
    const obj = renderer(component);
    obj._component = component;
    obj.set({
      left: component.x,
      top: component.y,
      angle: component.rotation,
      lockMovementX: component.locked,
      lockMovementY: component.locked,
      lockRotation: component.locked,
      lockScalingX: component.locked,
      lockScalingY: component.locked,
      visible: !component.hidden,
    });
    this.canvas.add(obj);
    return obj;
  }

  _wireSelectionSync() {
    const sync = (obj) => {
      if (!obj || !obj._component) return;
      const c = obj._component;
      c.x = Math.round(obj.left);
      c.y = Math.round(obj.top);
      c.rotation = Math.round(obj.angle || 0);
      // Resize: Fabric reports scaleX/scaleY relative to original width/height.
      // Bake the scale into the schema width/height and rebuild the Fabric
      // shape from scratch so things like ellipse rx/ry, polygon vertices,
      // group children, etc. all redraw at their new size correctly.
      if (obj.scaleX !== 1 || obj.scaleY !== 1) {
        if (typeof c.width === 'number') c.width = Math.max(8, Math.round(c.width * obj.scaleX));
        if (typeof c.height === 'number') c.height = Math.max(8, Math.round(c.height * obj.scaleY));
        if (c.type === 'crank' && typeof c.size === 'number') c.size = Math.max(8, Math.round(c.size * obj.scaleX));
        // Replace the Fabric object with a freshly-rendered one at the new
        // size. Keeps inner geometry (ellipse rx/ry, polygon points, group
        // children) in sync with the schema.
        this._replaceFabricFor(c);
      }
      this.onChange(this.machine);
    };
    this.canvas.on('object:modified', (e) => sync(e.target));
  }

  _wireSelectionEvents() {
    const fire = () => {
      const obj = this.canvas.getActiveObject();
      this.onSelection(obj && obj._component ? obj._component : null);
    };
    this.canvas.on('selection:created', fire);
    this.canvas.on('selection:updated', fire);
    this.canvas.on('selection:cleared', fire);
  }

  // Replace the Fabric object for a component without losing selection or
  // changing position. Used after a resize bake so inner geometry redraws.
  _replaceFabricFor(component) {
    const old = this.canvas.getObjects().find(o => o._component && o._component.id === component.id);
    if (!old) return;
    const wasActive = this.canvas.getActiveObject() === old;
    this.canvas.remove(old);
    const fresh = this._addFabricFor(component);
    if (wasActive && fresh) this.canvas.setActiveObject(fresh);
    this.canvas.requestRenderAll();
  }

  // Update a property on a component and refresh its Fabric representation.
  // Called by the properties panel when the user edits a field.
  updateActive(patch) {
    const obj = this.canvas.getActiveObject();
    if (!obj || !obj._component) return;
    Object.assign(obj._component, patch);
    this._replaceFabricFor(obj._component);
    this.onChange(this.machine);
  }
}

// ── Per-component Fabric renderers ────────────────────────────────────

function renderHopper(c) {
  const stroke = c.wallColor || '#DDD8E0';
  const fill = c.windowFill || 'rgba(222,234,250,0.5)';
  const strokeWidth = c.wallThickness || 3;
  let obj;
  switch (c.variant) {
    case 'box':
      obj = new fabric.Rect({
        width: c.width, height: c.height, fill, stroke, strokeWidth,
        rx: c.cornerRadius ?? 6, ry: c.cornerRadius ?? 6,
        originX: 'left', originY: 'top',
      });
      break;
    case 'cylinder':
      obj = new fabric.Rect({
        width: c.width, height: c.height, fill, stroke, strokeWidth,
        rx: c.width / 2, ry: c.width / 2,
        originX: 'left', originY: 'top',
      });
      break;
    case 'funnel':
      obj = new fabric.Polygon([
        { x: 0, y: 0 }, { x: c.width, y: 0 },
        { x: c.width * 0.65, y: c.height }, { x: c.width * 0.35, y: c.height },
      ], { fill, stroke, strokeWidth });
      break;
    case 'hourglass':
      // Waist gap = 30% of width so balls (typical d=28px) flow through
      // even on narrow hoppers.
      obj = new fabric.Polygon([
        { x: 0, y: 0 }, { x: c.width, y: 0 },
        { x: c.width * 0.65, y: c.height / 2 }, { x: c.width, y: c.height },
        { x: 0, y: c.height }, { x: c.width * 0.35, y: c.height / 2 },
      ], { fill, stroke, strokeWidth });
      break;
    case 'half-dome': {
      // Rounded-top "tombstone": rectangle with top corners rounded.
      // Matches the built-in classic / forest / cyber domes (CSS
      // border-radius on the dome-outer rect). The shape stays within
      // the declared bbox (0,0)-(W,H) — earlier "arc through both top
      // points" approach drew a semicircle that overflowed above y=0
      // when chord >= 2*radius.
      const R = Math.min(c.width / 2, c.height);
      obj = new fabric.Path(
        `M 0 ${c.height} L 0 ${R} A ${R} ${R} 0 0 1 ${R} 0 L ${c.width - R} 0 A ${R} ${R} 0 0 1 ${c.width} ${R} L ${c.width} ${c.height} Z`,
        { fill, stroke, strokeWidth, originX: 'left', originY: 'top' },
      );
      break;
    }
    case 'dome':
    default:
      obj = new fabric.Ellipse({
        rx: c.width / 2, ry: c.height / 2, fill, stroke, strokeWidth,
        originX: 'left', originY: 'top',
      });
  }
  return enhance(obj, c, c.width, c.height);
}

function renderChute(c) {
  // Designer-only marker — kept subtle so it doesn't clobber the chassis
  // visuals while you're laying things out. Hidden entirely in play mode.
  // Dashed outline + small lowercase label reads as "this is the dispense
  // exit" without competing with the brand / window / etc.
  const stroke = c.labelColor || c.stroke || 'rgba(255,255,255,0.55)';
  const grp = new fabric.Group([
    new fabric.Rect({
      width: c.width, height: c.height,
      fill: 'rgba(0,0,0,0)',
      stroke, strokeWidth: 1,
      strokeDashArray: [3, 3],
      rx: c.cornerRadius ?? 3, ry: c.cornerRadius ?? 3,
      originX: 'left', originY: 'top',
    }),
    new fabric.Text('↓ chute', {
      fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold',
      fill: stroke, opacity: 0.85,
      left: c.width / 2, top: c.height / 2,
      originX: 'center', originY: 'center',
    }),
  ]);
  return grp;
}

function renderCrank(c) {
  const half = c.size / 2;
  const iconColor = c.iconColor || '#FFFFFF';
  // Group of: round button + 3/4 arc with arrowhead (matches the built-in
  // crank icon). Scaled to fit inside the button.
  const button = new fabric.Circle({
    radius: half, fill: c.accent || '#888090',
    stroke: c.stroke || '#666', strokeWidth: c.strokeWidth ?? 2,
    originX: 'left', originY: 'top',
  });
  // Apply gradient/shadow to the button itself if present.
  enhance(button, c, c.size, c.size);
  const arrowScale = (c.size * 0.65) / 30;
  const arc = new fabric.Path('M 22 22 A 9.5 9.5 0 1 1 22 8', {
    stroke: iconColor, strokeWidth: 2.8, fill: '', strokeLineCap: 'round',
    originX: 'left', originY: 'top',
  });
  const head = new fabric.Polygon(
    [{ x: 22, y: 3 }, { x: 22, y: 13 }, { x: 29, y: 8 }],
    { fill: iconColor, originX: 'left', originY: 'top' },
  );
  const iconGroup = new fabric.Group([arc, head], {
    originX: 'left', originY: 'top',
    scaleX: arrowScale, scaleY: arrowScale,
  });
  // Fabric Group.left/.top points at the bbox top-left, NOT the viewbox
  // origin. Path bbox starts at ~(6, 3) (arc bulges left to x=6, arrowhead
  // tip at y=3). The icon's visual center is at viewbox (17.5, 13.75), so
  // the offset from bbox top-left to visual center is (11.5, 10.75).
  // To center that visual center inside the button: button-half - that.
  iconGroup.set({
    left: half - (11.5 * arrowScale),
    top: half - (10.75 * arrowScale),
  });
  return new fabric.Group([button, iconGroup], {
    originX: 'left', originY: 'top',
  });
}

function renderBrandStrip(c) {
  const bgRect = new fabric.Rect({
    width: c.width, height: c.height, fill: c.bg,
    stroke: c.stroke || undefined, strokeWidth: c.strokeWidth ?? 0,
    rx: c.cornerRadius ?? 0, ry: c.cornerRadius ?? 0,
    originX: 'left', originY: 'top',
  });
  if (c.bgGradient) {
    const g = buildGradient(c.bgGradient, c.width, c.height);
    if (g) bgRect.set('fill', g);
  }
  const grp = new fabric.Group([
    bgRect,
    new fabric.Text(c.text || 'BRAND', {
      fontSize: c.fontSize || c.height * 0.5,
      fontFamily: c.font || 'Orbitron',
      fontWeight: c.fontWeight || 'bold',
      fontStyle: c.fontStyle || 'normal',
      fill: c.fg, left: c.width / 2, top: c.height / 2,
      originX: 'center', originY: 'center',
      charSpacing: (c.letterSpacing || 0.3) * 1000,
    }),
  ]);
  return enhance(grp, c, c.width, c.height);
}

function renderLed(c) {
  return new fabric.Group([
    new fabric.Rect({ width: c.width, height: c.height, fill: c.bg, rx: 3, ry: 3, originX: 'left', originY: 'top' }),
    new fabric.Text('PULLS: 0', {
      fontSize: c.height * 0.55, fontFamily: 'monospace', fill: c.color,
      left: 6, top: c.height / 2, originX: 'left', originY: 'center',
    }),
  ]);
}

function renderTurnDots(c) {
  const dots = [];
  const gap = 4;
  for (let i = 0; i < c.count; i++) {
    dots.push(new fabric.Circle({
      radius: c.dotSize / 2, fill: c.dimColor,
      left: i * (c.dotSize + gap), top: 0,
    }));
  }
  return new fabric.Group(dots);
}

function renderTray(c) {
  const obj = new fabric.Rect({
    width: c.width, height: c.height, fill: c.fill,
    stroke: c.stroke, strokeWidth: c.strokeWidth ?? 2,
    rx: c.cornerRadius ?? 8, ry: c.cornerRadius ?? 8,
    originX: 'left', originY: 'top',
  });
  return enhance(obj, c, c.width, c.height);
}

function renderDecoration(c) {
  let obj;
  switch (c.shape) {
    case 'circle':
      obj = new fabric.Circle({
        radius: c.width / 2, fill: c.fill,
        stroke: c.stroke || undefined, strokeWidth: c.strokeWidth ?? 1,
        originX: 'left', originY: 'top',
      });
      break;
    case 'ellipse':
      obj = new fabric.Ellipse({
        rx: c.width / 2, ry: c.height / 2, fill: c.fill,
        stroke: c.stroke || undefined, strokeWidth: c.strokeWidth ?? 1,
        originX: 'left', originY: 'top',
      });
      break;
    case 'triangle':
      obj = new fabric.Triangle({
        width: c.width, height: c.height, fill: c.fill,
        stroke: c.stroke || undefined, strokeWidth: c.strokeWidth ?? 1,
        originX: 'left', originY: 'top',
      });
      break;
    case 'line':
      obj = new fabric.Line(
        [0, 0, c.width, c.height || 0],
        { stroke: c.fill || c.stroke, strokeWidth: c.strokeWidth ?? 2 },
      );
      break;
    case 'text':
      // Empty text decorations render as nothing rather than the literal
      // word "TEXT" (which slips into the canvas when the text field gets
      // dropped during cloning / save-load).
      obj = new fabric.Text(c.text != null ? String(c.text) : '', {
        fontSize: c.fontSize || c.height || 16,
        fontFamily: c.font || 'Inter',
        fontWeight: c.fontWeight || 'normal',
        fontStyle: c.fontStyle || 'normal',
        fill: c.fill,
        charSpacing: (c.letterSpacing || 0) * 1000,
        originX: 'left', originY: 'top',
      });
      break;
    case 'polygon':
      obj = new fabric.Polygon(c.points || [], {
        fill: c.fill, stroke: c.stroke || undefined, strokeWidth: c.strokeWidth ?? 1,
      });
      break;
    case 'rect':
    default:
      obj = new fabric.Rect({
        width: c.width, height: c.height, fill: c.fill,
        stroke: c.stroke || undefined, strokeWidth: c.strokeWidth ?? 1,
        rx: c.cornerRadius ?? 0, ry: c.cornerRadius ?? 0,
        originX: 'left', originY: 'top',
      });
  }
  return enhance(obj, c, c.width, c.height);
}
