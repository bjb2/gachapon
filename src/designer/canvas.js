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
    this.removeComponent(obj._component.id);
  }

  removeComponent(id) {
    const obj = this.canvas.getObjects().find(o => o._component && o._component.id === id);
    this.machine.components = this.machine.components.filter(c => c.id !== id);
    if (obj) this.canvas.remove(obj);
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.onChange(this.machine);
  }

  // Duplicate the active component, offset slightly so it's visible.
  duplicateActive() {
    const obj = this.canvas.getActiveObject();
    if (!obj || !obj._component) return;
    const c = obj._component;
    // Build a new component with a fresh id + minor offset; preserve every
    // other field via spread so gradients / shadows / variant survive.
    const partial = { ...c, id: undefined, x: (c.x || 0) + 14, y: (c.y || 0) + 14 };
    const fresh = newComponent(c.type, partial);
    this.machine.components.push(fresh);
    const newObj = this._addFabricFor(fresh);
    if (newObj) this.canvas.setActiveObject(newObj);
    this.canvas.requestRenderAll();
    this.onChange(this.machine);
    return fresh;
  }

  // Move a component's z-index in the components array AND in the Fabric
  // canvas. Both representations are kept in lockstep.
  reorderComponent(id, direction) {
    const idx = this.machine.components.findIndex(c => c.id === id);
    if (idx < 0) return;
    let newIdx = idx;
    if (direction === 'top')      newIdx = this.machine.components.length - 1;
    else if (direction === 'bottom') newIdx = 0;
    else if (direction === 'up')     newIdx = Math.min(this.machine.components.length - 1, idx + 1);
    else if (direction === 'down')   newIdx = Math.max(0, idx - 1);
    else if (typeof direction === 'number') newIdx = Math.max(0, Math.min(this.machine.components.length - 1, direction));
    if (newIdx === idx) return;
    const [moved] = this.machine.components.splice(idx, 1);
    this.machine.components.splice(newIdx, 0, moved);
    // Rebuild the canvas so the Fabric z-order matches.
    this.rebuild();
    // Reselect the moved component.
    const obj = this.canvas.getObjects().find(o => o._component && o._component.id === id);
    if (obj) this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    this.onChange(this.machine);
  }

  selectComponent(id) {
    const obj = this.canvas.getObjects().find(o => o._component && o._component.id === id);
    if (obj) {
      this.canvas.setActiveObject(obj);
      this.canvas.requestRenderAll();
    }
  }

  // Toggle hidden/locked flags on a component and refresh its Fabric obj.
  setComponentFlag(id, flag, value) {
    const c = this.machine.components.find(c => c.id === id);
    if (!c) return;
    c[flag] = value;
    this._replaceFabricFor(c);
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
  const style = c.style || 'chrome';
  const button = new fabric.Circle({
    radius: half, fill: c.accent || '#888090',
    stroke: c.stroke || '#666', strokeWidth: c.strokeWidth ?? 2,
    originX: 'left', originY: 'top',
  });
  enhance(button, c, c.size, c.size);

  // Build the inner icon by injecting the catalog's SVG fragment into a
  // tiny SVG document and converting to a Fabric.Group via loadSVGFromString.
  // Falls back to the chrome arrow if the style isn't in the catalog yet.
  const iconScale = (c.size * 0.65) / 30;
  const iconGroup = _buildCrankIcon(style, iconColor, iconScale, half);

  return new fabric.Group([button, iconGroup], {
    originX: 'left', originY: 'top',
  });
}

// Build the icon as Fabric primitives matching the SVG catalog. Doing it
// imperatively (vs parsing SVG) is simpler and async-free.
function _buildCrankIcon(style, color, scale, half) {
  const cap = 'round';
  let parts;
  let bboxCx = 15, bboxCy = 15;

  switch (style) {
    case 'cross':
      parts = [
        new fabric.Line([3, 15, 27, 15], { stroke: color, strokeWidth: 3.2, strokeLineCap: cap }),
        new fabric.Line([15, 3, 15, 27], { stroke: color, strokeWidth: 3.2, strokeLineCap: cap }),
        new fabric.Circle({ left: 12.8, top: 12.8, radius: 2.2, fill: color, originX: 'left', originY: 'top' }),
      ];
      break;
    case 'star':
      parts = [
        new fabric.Line([3, 15, 27, 15],   { stroke: color, strokeWidth: 2.4, strokeLineCap: cap }),
        new fabric.Line([15, 3, 15, 27],   { stroke: color, strokeWidth: 2.4, strokeLineCap: cap }),
        new fabric.Line([6, 6, 24, 24],    { stroke: color, strokeWidth: 2.4, strokeLineCap: cap }),
        new fabric.Line([6, 24, 24, 6],    { stroke: color, strokeWidth: 2.4, strokeLineCap: cap }),
        new fabric.Circle({ left: 13, top: 13, radius: 2, fill: color, originX: 'left', originY: 'top' }),
      ];
      break;
    case 'wheel':
      parts = [
        new fabric.Circle({ left: 4, top: 4, radius: 11, fill: '', stroke: color, strokeWidth: 2.4, originX: 'left', originY: 'top' }),
        new fabric.Circle({ left: 12.2, top: 3.2, radius: 2.8, fill: color, originX: 'left', originY: 'top' }),
      ];
      break;
    case 'lever':
      parts = [
        new fabric.Rect({ left: 15, top: 13, width: 12, height: 4, rx: 2, ry: 2, fill: color, originX: 'left', originY: 'top' }),
        new fabric.Circle({ left: 23.5, top: 11.5, radius: 3.5, fill: color, originX: 'left', originY: 'top' }),
        new fabric.Circle({ left: 12, top: 12, radius: 3, fill: color, originX: 'left', originY: 'top' }),
      ];
      bboxCx = 17;
      break;
    case 'pushbutton':
      parts = [
        new fabric.Circle({ left: 9, top: 9, radius: 6, fill: color, originX: 'left', originY: 'top' }),
        new fabric.Circle({ left: 12, top: 12, radius: 3, fill: 'rgba(255,255,255,0.35)', originX: 'left', originY: 'top' }),
      ];
      break;
    case 'chrome':
    default: {
      const arc = new fabric.Path('M 22 22 A 9.5 9.5 0 1 1 22 8', {
        stroke: color, strokeWidth: 2.8, fill: '', strokeLineCap: cap,
        originX: 'left', originY: 'top',
      });
      const head = new fabric.Polygon(
        [{ x: 22, y: 3 }, { x: 22, y: 13 }, { x: 29, y: 8 }],
        { fill: color, originX: 'left', originY: 'top' },
      );
      parts = [arc, head];
      bboxCx = 17.5; bboxCy = 13.75;
    }
  }
  const grp = new fabric.Group(parts, {
    originX: 'left', originY: 'top',
    scaleX: scale, scaleY: scale,
  });
  // Center bbox center on the button center. Fabric Group .left points at
  // its bbox top-left, so we have to subtract the offset from bbox-top-left
  // to icon-visual-center, then position so that lands on the button center.
  const bboxTopLeftX = grp.left ?? 0;
  const bboxTopLeftY = grp.top ?? 0;
  // After group construction Fabric computes left/top from contained bbox.
  // We need: center of icon (in unscaled coords) at (half, half). The icon
  // bbox starts at (bboxTopLeftX, bboxTopLeftY) — but that's already in
  // unscaled coords because contained primitives are in the 30x30 viewbox.
  // The group's scale will scale around its origin (top-left). So the
  // visual-center of the icon, after scaling, ends up at:
  //   group.left + (bboxCx - bboxTopLeftX) * scale
  // We want that = half. So group.left = half - (bboxCx - bboxTopLeftX) * scale.
  grp.set({
    left: half - (bboxCx - bboxTopLeftX) * scale,
    top:  half - (bboxCy - bboxTopLeftY) * scale,
  });
  return grp;
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
