// Runtime SVG renderer for custom-machine specs (no Fabric dep on the play
// page). Emits one <svg> string that paints every visual component. The
// ball canvas is clipped to the hopper window so dispense plumbing stays
// hidden — same trick the built-in machines use with `overflow: hidden`.
//
// Z-order is the array order of components. Decorations placed AFTER the
// hopper paint over the chute area, so the user can layer chassis art on
// top of where balls visually "fall in" — exactly like the modern truck
// shell hides its funnel.

import { CRANK_ICONS } from './crank-icons.js';

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function gradId(idx) { return `cmGrad${idx}`; }
function shadowId(idx) { return `cmShadow${idx}`; }
function clipId(machineId) { return `cmHopperClip-${machineId}`; }

// Convert a fillGradient spec into <linearGradient> / <radialGradient> defs
// + the `url(#id)` reference. Returns { defs, ref }.
function gradientDef(spec, id, w, h) {
  if (!spec) return { defs: '', ref: null };
  if (spec.type === 'linear') {
    let x1 = '0%', y1 = '0%', x2 = '0%', y2 = '100%';
    if (spec.coords === 'leftToRight') { y2 = '0%'; x2 = '100%'; }
    else if (spec.coords === 'diag135') { x2 = '100%'; y2 = '100%'; }
    else if (spec.coords === 'diag45') { y1 = '100%'; x2 = '100%'; y2 = '0%'; }
    else if (typeof spec.coords === 'object' && spec.coords) {
      x1 = spec.coords.x1; y1 = spec.coords.y1;
      x2 = spec.coords.x2; y2 = spec.coords.y2;
    }
    const stops = (spec.stops || []).map(s =>
      `<stop offset="${s.offset}" stop-color="${escAttr(s.color)}"/>`).join('');
    return {
      defs: `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`,
      ref: `url(#${id})`,
    };
  }
  if (spec.type === 'radial') {
    const cx = spec.cx ?? w / 2;
    const cy = spec.cy ?? h / 2;
    const r = spec.outerR ?? Math.max(w, h) / 2;
    const stops = (spec.stops || []).map(s =>
      `<stop offset="${s.offset}" stop-color="${escAttr(s.color)}"/>`).join('');
    return {
      defs: `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">${stops}</radialGradient>`,
      ref: `url(#${id})`,
    };
  }
  return { defs: '', ref: null };
}

function shadowDef(spec, id) {
  if (!spec) return { defs: '', ref: null };
  const color = spec.color || 'rgba(0,0,0,0.3)';
  const blur = spec.blur ?? 6;
  const dx = spec.offsetX ?? 0;
  const dy = spec.offsetY ?? 4;
  return {
    defs: `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${blur / 2}"/>
      <feOffset dx="${dx}" dy="${dy}" result="offsetblur"/>
      <feFlood flood-color="${escAttr(color)}"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`,
    ref: `url(#${id})`,
  };
}

// transform="translate(x,y) rotate(deg cx cy)"
function transform(c, w = 0, h = 0) {
  const rot = c.rotation || 0;
  if (!rot) return `translate(${c.x} ${c.y})`;
  return `translate(${c.x} ${c.y}) rotate(${rot} ${w / 2} ${h / 2})`;
}

function attrs(c, ref, filterRef) {
  const fill = ref || c.fill || 'transparent';
  const parts = [`fill="${escAttr(fill)}"`];
  if (c.stroke) parts.push(`stroke="${escAttr(c.stroke)}" stroke-width="${c.strokeWidth ?? 1}"`);
  if (c.opacity !== undefined && c.opacity !== 1) parts.push(`opacity="${c.opacity}"`);
  if (filterRef) parts.push(`filter="${filterRef}"`);
  return parts.join(' ');
}

// ── Per-component SVG emitters. Returns string of SVG fragment. ────────
function emitDecoration(c, gRef, fRef) {
  const t = transform(c, c.width || 0, c.height || 0);
  const a = attrs(c, gRef, fRef);
  switch (c.shape) {
    case 'circle':
      return `<circle cx="${(c.width || 0) / 2}" cy="${(c.width || 0) / 2}" r="${(c.width || 0) / 2}" ${a} transform="${t}"/>`;
    case 'ellipse':
      return `<ellipse cx="${c.width / 2}" cy="${c.height / 2}" rx="${c.width / 2}" ry="${c.height / 2}" ${a} transform="${t}"/>`;
    case 'triangle':
      return `<polygon points="${c.width / 2},0 ${c.width},${c.height} 0,${c.height}" ${a} transform="${t}"/>`;
    case 'line':
      return `<line x1="0" y1="0" x2="${c.width}" y2="${c.height || 0}" stroke="${escAttr(c.fill || c.stroke || '#000')}" stroke-width="${c.strokeWidth ?? 2}" transform="${t}"/>`;
    case 'text': {
      if (!c.text) return '';
      const fs = c.fontSize || c.height || 16;
      const ff = c.font || 'Inter';
      const fw = c.fontWeight || 'normal';
      const fst = c.fontStyle || 'normal';
      const ls = (c.letterSpacing || 0) * fs;
      return `<text x="0" y="${fs}" font-size="${fs}" font-family="${escAttr(ff)}" font-weight="${fw}" font-style="${fst}" letter-spacing="${ls}" fill="${escAttr(c.fill || '#000')}" transform="${t}"${c.opacity !== undefined ? ` opacity="${c.opacity}"` : ''}>${escAttr(c.text)}</text>`;
    }
    case 'polygon': {
      const pts = (c.points || []).map(p => `${p.x},${p.y}`).join(' ');
      return `<polygon points="${pts}" ${a} transform="${t}"/>`;
    }
    case 'rect':
    default: {
      const r = c.cornerRadius || 0;
      return `<rect width="${c.width}" height="${c.height}" rx="${r}" ry="${r}" ${a} transform="${t}"/>`;
    }
  }
}

function emitHopper(c, gRef, fRef, machineId) {
  const t = transform(c, c.width, c.height);
  const fill = gRef || c.windowFill || 'rgba(222,234,250,0.5)';
  const stroke = c.wallColor || '#DDD8E0';
  const sw = c.wallThickness || 3;
  const baseAttrs = `fill="${escAttr(fill)}" stroke="${escAttr(stroke)}" stroke-width="${sw}"${fRef ? ` filter="${fRef}"` : ''}${c.opacity !== undefined ? ` opacity="${c.opacity}"` : ''}`;
  let inner;
  switch (c.variant) {
    case 'box':
      inner = `<rect width="${c.width}" height="${c.height}" rx="${c.cornerRadius ?? 6}" ry="${c.cornerRadius ?? 6}" ${baseAttrs}/>`;
      break;
    case 'cylinder':
      inner = `<rect width="${c.width}" height="${c.height}" rx="${c.width / 2}" ry="${c.width / 2}" ${baseAttrs}/>`;
      break;
    case 'funnel':
      inner = `<polygon points="0,0 ${c.width},0 ${c.width * 0.65},${c.height} ${c.width * 0.35},${c.height}" ${baseAttrs}/>`;
      break;
    case 'hourglass':
      inner = `<polygon points="0,0 ${c.width},0 ${c.width * 0.65},${c.height / 2} ${c.width},${c.height} 0,${c.height} ${c.width * 0.35},${c.height / 2}" ${baseAttrs}/>`;
      break;
    case 'half-dome': {
      // Rounded-top tombstone: rectangle with top corners rounded by R.
      const _R = Math.min(c.width / 2, c.height);
      inner = `<path d="M 0 ${c.height} L 0 ${_R} A ${_R} ${_R} 0 0 1 ${_R} 0 L ${c.width - _R} 0 A ${_R} ${_R} 0 0 1 ${c.width} ${_R} L ${c.width} ${c.height} Z" ${baseAttrs}/>`;
      break;
    }
    case 'dome':
    default:
      inner = `<ellipse cx="${c.width / 2}" cy="${c.height / 2}" rx="${c.width / 2}" ry="${c.height / 2}" ${baseAttrs}/>`;
  }
  // The ball <canvas> sits inside this group, clipped to the hopper shape.
  return `<g class="cm-hopper" data-hopper transform="${t}">
    ${inner}
    <foreignObject class="cm-ball-stage" x="0" y="0" width="${c.width}" height="${c.height}" clip-path="url(#${clipId(machineId)})">
      <canvas xmlns="http://www.w3.org/1999/xhtml" data-dome-canvas width="${c.width}" height="${c.height}" style="width:${c.width}px;height:${c.height}px;display:block;"></canvas>
    </foreignObject>
  </g>`;
}

function emitChute(c, fRef) {
  const t = transform(c, c.width, c.height);
  const fill = c.openingColor || '#222';
  const stroke = c.stroke;
  const sw = c.strokeWidth ?? 0;
  const r = c.cornerRadius ?? 4;
  return `<g transform="${t}"${fRef ? ` filter="${fRef}"` : ''}>
    <rect width="${c.width}" height="${c.height}" rx="${r}" ry="${r}" fill="${escAttr(fill)}"${stroke ? ` stroke="${escAttr(stroke)}" stroke-width="${sw}"` : ''}/>
  </g>`;
}

function emitCrank(c, gRef, fRef) {
  const t = transform(c, c.size, c.size);
  const fill = gRef || c.accent || '#888090';
  const stroke = c.stroke || '#666';
  const sw = c.strokeWidth ?? 2;
  const iconColor = c.iconColor || '#FFFFFF';
  const half = c.size / 2;
  const scale = (c.size * 0.65) / 30;
  const icon = CRANK_ICONS[c.style] || CRANK_ICONS.chrome;
  // Three nested transforms so data-crank-inner can hold a clean rotate(deg)
  // updated per turn — wrapping groups handle position + scale.
  // The inner-most translate uses the icon's bbox center so each style sits
  // visually centered in the button (the chrome arrow's bbox isn't at 15,15).
  return `<g transform="${t}" data-crank style="cursor:pointer"${fRef ? ` filter="${fRef}"` : ''}>
    <circle cx="${half}" cy="${half}" r="${half}" fill="${escAttr(fill)}" stroke="${escAttr(stroke)}" stroke-width="${sw}"/>
    <g transform="translate(${half} ${half})">
      <g data-crank-inner transform="rotate(0)" style="transition:transform 0.32s cubic-bezier(0.34,1.4,0.64,1);">
        <g transform="scale(${scale}) translate(${-icon.bboxCx} ${-icon.bboxCy})">
          ${icon.svg(iconColor)}
        </g>
      </g>
    </g>
  </g>`;
}

function emitBrandStrip(c, gRef, fRef) {
  const t = transform(c, c.width, c.height);
  const fill = gRef || c.bg || '#111';
  const sw = c.strokeWidth ?? 0;
  const r = c.cornerRadius ?? 0;
  const fs = c.fontSize || c.height * 0.5;
  const ff = c.font || 'Orbitron';
  const fw = c.fontWeight || 'bold';
  const ls = (c.letterSpacing || 0.3) * fs;
  return `<g transform="${t}"${fRef ? ` filter="${fRef}"` : ''}>
    <rect width="${c.width}" height="${c.height}" rx="${r}" ry="${r}" fill="${escAttr(fill)}"${c.stroke ? ` stroke="${escAttr(c.stroke)}" stroke-width="${sw}"` : ''}/>
    <text x="${c.width / 2}" y="${c.height / 2}" font-size="${fs}" font-family="${escAttr(ff)}" font-weight="${fw}" letter-spacing="${ls}" fill="${escAttr(c.fg || '#fff')}" text-anchor="middle" dominant-baseline="central">${escAttr(c.text || '')}</text>
  </g>`;
}

function emitLed(c, fRef) {
  const t = transform(c, c.width, c.height);
  const r = c.cornerRadius ?? 3;
  const fs = c.height * 0.55;
  return `<g transform="${t}" data-led-group${fRef ? ` filter="${fRef}"` : ''}>
    <rect width="${c.width}" height="${c.height}" rx="${r}" ry="${r}" fill="${escAttr(c.bg || '#12110E')}"/>
    <text x="6" y="${c.height / 2}" font-size="${fs}" font-family="monospace" fill="${escAttr(c.color || '#88FF44')}" dominant-baseline="central" data-led>PULLS: 0</text>
  </g>`;
}

function emitTurnDots(c) {
  const t = transform(c);
  const gap = 4;
  const r = c.dotSize / 2;
  let inner = '';
  for (let i = 0; i < c.count; i++) {
    inner += `<circle cx="${i * (c.dotSize + gap) + r}" cy="${r}" r="${r}" fill="${escAttr(c.dimColor || '#E4E0E0')}" data-dot="${i}"/>`;
  }
  return `<g transform="${t}" data-dots-group data-lit-color="${escAttr(c.litColor || '#CC0000')}" data-dim-color="${escAttr(c.dimColor || '#E4E0E0')}">${inner}</g>`;
}

function emitTray(c, gRef, fRef) {
  const t = transform(c, c.width, c.height);
  const fill = gRef || c.fill || '#EDECEC';
  const stroke = c.stroke || '#D4D2D2';
  const sw = c.strokeWidth ?? 2;
  const r = c.cornerRadius ?? 8;
  // The tray-ball is absolute-positioned so the drop animation (top: -14 ->
  // resting top) actually moves it; CustomMachine sizes it at mount.
  return `<g transform="${t}" data-tray-group${fRef ? ` filter="${fRef}"` : ''}>
    <rect width="${c.width}" height="${c.height}" rx="${r}" ry="${r}" fill="${escAttr(fill)}" stroke="${escAttr(stroke)}" stroke-width="${sw}" data-tray/>
    <foreignObject x="0" y="0" width="${c.width}" height="${c.height}" overflow="visible">
      <div xmlns="http://www.w3.org/1999/xhtml" class="cm-tray-inner" style="position:relative;width:100%;height:100%;font-family:'M PLUS Rounded 1c',monospace;font-size:11px;color:rgba(0,0,0,0.45);pointer-events:none;">
        <span data-tray-hint style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);">Turn to dispense!</span>
        <div data-tray-ball class="cm-tray-ball" style="display:none;position:absolute;border-radius:50%;pointer-events:auto;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.3);"></div>
      </div>
    </foreignObject>
  </g>`;
}

// Build the clip-path matching the hopper shape so the ball canvas only
// renders inside the visible window.
function buildHopperClip(hopper, machineId) {
  let shape;
  switch (hopper.variant) {
    case 'box':
      shape = `<rect x="0" y="0" width="${hopper.width}" height="${hopper.height}" rx="${hopper.cornerRadius ?? 6}" ry="${hopper.cornerRadius ?? 6}"/>`;
      break;
    case 'cylinder':
      shape = `<rect x="0" y="0" width="${hopper.width}" height="${hopper.height}" rx="${hopper.width / 2}" ry="${hopper.width / 2}"/>`;
      break;
    case 'funnel':
      shape = `<polygon points="0,0 ${hopper.width},0 ${hopper.width * 0.65},${hopper.height} ${hopper.width * 0.35},${hopper.height}"/>`;
      break;
    case 'hourglass':
      shape = `<polygon points="0,0 ${hopper.width},0 ${hopper.width * 0.65},${hopper.height / 2} ${hopper.width},${hopper.height} 0,${hopper.height} ${hopper.width * 0.35},${hopper.height / 2}"/>`;
      break;
    case 'half-dome': {
      const _R = Math.min(hopper.width / 2, hopper.height);
      shape = `<path d="M 0 ${hopper.height} L 0 ${_R} A ${_R} ${_R} 0 0 1 ${_R} 0 L ${hopper.width - _R} 0 A ${_R} ${_R} 0 0 1 ${hopper.width} ${_R} L ${hopper.width} ${hopper.height} Z"/>`;
      break;
    }
    case 'dome':
    default:
      shape = `<ellipse cx="${hopper.width / 2}" cy="${hopper.height / 2}" rx="${hopper.width / 2}" ry="${hopper.height / 2}"/>`;
  }
  return `<clipPath id="${clipId(machineId)}">${shape}</clipPath>`;
}

// Render the entire custom machine to an SVG string.
// Options:
//   playMode (bool, default false) — if true, hides the chute marker (built-in
//   machines have no visible chute; the tray catches the ball after the
//   dispense flow plays). The designer keeps the chute visible so the user
//   can position it.
export function renderMachineSvg(machine, { playMode = false } = {}) {
  const { canvas, components, id } = machine;
  let defs = '';
  let body = '';
  // We assign gradient/shadow ids by index so identical specs share filters.
  let gIdx = 0, sIdx = 0;

  // Hopper has to be discovered to emit the clip definition.
  const hopper = components.find(c => c.type === 'hopper');
  if (hopper) defs += buildHopperClip(hopper, id);

  // Background fill rect
  body += `<rect x="0" y="0" width="${canvas.width}" height="${canvas.height}" fill="${escAttr(canvas.bg || '#fff')}"/>`;

  for (const c of components) {
    // Chute is design-only — in play mode the dispense flow handles the
    // ball-exit visualization (tray-ball appears after popBottom). Rendering
    // the chute as a black slot would conflict with the chassis art.
    if (playMode && c.type === 'chute') continue;

    let gRef = null, fRef = null;
    if (c.fillGradient) {
      const id = gradId(gIdx++);
      const w = c.width ?? c.size ?? 0, h = c.height ?? c.size ?? 0;
      const r = gradientDef(c.fillGradient, id, w, h);
      defs += r.defs;
      gRef = r.ref;
    }
    if (c.shadow) {
      const id = shadowId(sIdx++);
      const r = shadowDef(c.shadow, id);
      defs += r.defs;
      fRef = r.ref;
    }
    let frag = '';
    switch (c.type) {
      case 'hopper':       frag = emitHopper(c, gRef, fRef, machine.id); break;
      case 'chute':        frag = emitChute(c, fRef); break;
      case 'crank':        frag = emitCrank(c, gRef, fRef); break;
      case 'brand-strip':  frag = emitBrandStrip(c, gRef, fRef); break;
      case 'led':          frag = emitLed(c, fRef); break;
      case 'turn-dots':    frag = emitTurnDots(c); break;
      case 'tray':         frag = emitTray(c, gRef, fRef); break;
      case 'decoration':   frag = emitDecoration(c, gRef, fRef); break;
    }
    body += frag;
  }

  return `<svg class="cm-svg" xmlns="http://www.w3.org/2000/svg"
    width="${canvas.width}" height="${canvas.height}"
    viewBox="0 0 ${canvas.width} ${canvas.height}"
    overflow="visible">
    <defs>${defs}</defs>
    ${body}
  </svg>`;
}
