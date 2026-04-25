// Fabric.js canvas adapter for the machine designer.
//
// Each Fabric object carries a `_component` payload pointing back to the
// schema record it represents. Selection, drag, resize all sync the schema
// fields back so the JSON view stays authoritative — Fabric is the editor,
// the schema is the truth.

import { newComponent } from './schema.js';

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
  switch (c.variant) {
    case 'box':
      return new fabric.Rect({
        width: c.width, height: c.height, fill, stroke, strokeWidth,
        rx: 6, ry: 6, originX: 'left', originY: 'top',
      });
    case 'cylinder':
      return new fabric.Rect({
        width: c.width, height: c.height, fill, stroke, strokeWidth,
        rx: c.width / 2, ry: c.width / 2,
      });
    case 'funnel':
      return new fabric.Polygon([
        { x: 0, y: 0 }, { x: c.width, y: 0 },
        { x: c.width * 0.65, y: c.height }, { x: c.width * 0.35, y: c.height },
      ], { fill, stroke, strokeWidth });
    case 'hourglass':
      return new fabric.Polygon([
        { x: 0, y: 0 }, { x: c.width, y: 0 },
        { x: c.width * 0.55, y: c.height / 2 }, { x: c.width, y: c.height },
        { x: 0, y: c.height }, { x: c.width * 0.45, y: c.height / 2 },
      ], { fill, stroke, strokeWidth });
    case 'dome':
    default:
      return new fabric.Ellipse({
        rx: c.width / 2, ry: c.height / 2, fill, stroke, strokeWidth,
      });
  }
}

function renderChute(c) {
  return new fabric.Group([
    new fabric.Rect({
      width: c.width, height: c.height, fill: c.openingColor || '#222',
      rx: 4, ry: 4, originX: 'left', originY: 'top',
    }),
    new fabric.Text('CHUTE', {
      fontSize: 10, fontFamily: 'monospace',
      fill: '#FFFFFF', left: c.width / 2, top: c.height / 2,
      originX: 'center', originY: 'center',
    }),
  ]);
}

function renderCrank(c) {
  return new fabric.Circle({
    radius: c.size / 2, fill: c.accent || '#888090',
    stroke: '#666', strokeWidth: 2,
  });
}

function renderBrandStrip(c) {
  return new fabric.Group([
    new fabric.Rect({ width: c.width, height: c.height, fill: c.bg, originX: 'left', originY: 'top' }),
    new fabric.Text(c.text || 'BRAND', {
      fontSize: c.height * 0.5, fontFamily: c.font || 'Orbitron',
      fill: c.fg, left: c.width / 2, top: c.height / 2,
      originX: 'center', originY: 'center',
      charSpacing: (c.letterSpacing || 0.3) * 1000,
    }),
  ]);
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
  return new fabric.Rect({
    width: c.width, height: c.height, fill: c.fill,
    stroke: c.stroke, strokeWidth: 2, rx: 8, ry: 8,
    originX: 'left', originY: 'top',
  });
}

function renderDecoration(c) {
  switch (c.shape) {
    case 'circle':
      return new fabric.Circle({ radius: c.width / 2, fill: c.fill, stroke: c.stroke || undefined });
    case 'text':
      return new fabric.Text(c.text || 'TEXT', { fontSize: c.height || 16, fill: c.fill });
    case 'rect':
    default:
      return new fabric.Rect({ width: c.width, height: c.height, fill: c.fill, stroke: c.stroke || undefined, originX: 'left', originY: 'top' });
  }
}
