// Starter machine presets for the WYSIWYG designer.
//
// Each preset is a complete customMachine record (per schema.js). Loading
// one clones the components into a new record so the user can edit freely
// without touching the original template.
//
// Designed to feel different from the six built-in skins
// (classic / noir / cyber / forest / modern / valkyrie) and to showcase
// each hopper variant: funnel, cylinder, box, hourglass.

const CANVAS = { width: 360, height: 540 };

// ── 1. Tiki Bar — warm sand + cocoa + brass + jungle green ─────────────
const TIKI_BAR = {
  name: 'Tiki Bar',
  canvas: { ...CANVAS, bg: '#FFF1D6' },
  components: [
    // Bamboo strips along the sides
    { type: 'decoration', shape: 'rect', x: 16, y: 56, width: 12, height: 380,
      fill: '#7A8C3F', stroke: '#5A6E2C' },
    { type: 'decoration', shape: 'rect', x: 332, y: 56, width: 12, height: 380,
      fill: '#7A8C3F', stroke: '#5A6E2C' },
    // Brand strip — palm green band with cream wordmark
    { type: 'brand-strip', x: 50, y: 22, width: 260, height: 30,
      text: '✦ TIKI BAR ✦', font: 'M PLUS Rounded 1c',
      fg: '#FFF1D6', bg: '#3F5A2C', letterSpacing: 0.32 },
    // Funnel hopper
    { type: 'hopper', variant: 'funnel', x: 60, y: 72, width: 240, height: 220,
      wallColor: '#8B5A3C', wallThickness: 4, windowFill: 'rgba(255,200,120,0.42)' },
    // LED above the hopper bottom
    { type: 'led', x: 50, y: 300, width: 100, height: 22,
      color: '#FFB347', bg: '#1F1308' },
    // Turn dots
    { type: 'turn-dots', x: 165, y: 308, count: 3, dotSize: 10,
      litColor: '#D17400', dimColor: '#E2C9A8' },
    // Chute beneath hopper
    { type: 'chute', x: 140, y: 332, width: 80, height: 40,
      openingColor: '#5C3A24' },
    // Tray
    { type: 'tray', x: 50, y: 380, width: 260, height: 56,
      fill: '#F5E6CB', stroke: '#C9B796' },
    // Copper crank to the side
    { type: 'crank', x: 230, y: 388, size: 56, style: 'matte', accent: '#B87333' },
  ],
};

// ── 2. U-7 Nautilus — deep navy + brass + green CRT ────────────────────
const SUBMARINE = {
  name: 'U-7 Nautilus',
  canvas: { ...CANVAS, bg: '#0E1A26' },
  components: [
    // Brass rivets at corners
    { type: 'decoration', shape: 'circle', x: 28, y: 64, width: 14, height: 14,
      fill: '#C9A66B' },
    { type: 'decoration', shape: 'circle', x: 318, y: 64, width: 14, height: 14,
      fill: '#C9A66B' },
    { type: 'decoration', shape: 'circle', x: 28, y: 380, width: 14, height: 14,
      fill: '#C9A66B' },
    { type: 'decoration', shape: 'circle', x: 318, y: 380, width: 14, height: 14,
      fill: '#C9A66B' },
    // Brand strip — brass on dark teal
    { type: 'brand-strip', x: 50, y: 24, width: 260, height: 32,
      text: 'U-7 · NAUTILUS', font: 'Share Tech Mono',
      fg: '#C9A66B', bg: '#173040', letterSpacing: 0.3 },
    // Cylinder hopper — vertical tube
    { type: 'hopper', variant: 'cylinder', x: 100, y: 76, width: 160, height: 260,
      wallColor: '#C9A66B', wallThickness: 5, windowFill: 'rgba(40,80,100,0.6)' },
    // Green CRT readout
    { type: 'led', x: 50, y: 348, width: 110, height: 24,
      color: '#7CFCAA', bg: '#0A1612' },
    { type: 'turn-dots', x: 175, y: 354, count: 3, dotSize: 12,
      litColor: '#C9A66B', dimColor: '#33454F' },
    // Brass porthole chute
    { type: 'chute', x: 140, y: 296, width: 80, height: 44,
      openingColor: '#3A2B1A' },
    // Brass crank
    { type: 'crank', x: 240, y: 354, size: 60, style: 'chrome', accent: '#C9A66B' },
    // Tray with brass stroke
    { type: 'tray', x: 50, y: 392, width: 260, height: 60,
      fill: '#0A1018', stroke: '#C9A66B' },
  ],
};

// ── 3. Arcade 1989 — neon hot pink + cyan on jet black ─────────────────
const ARCADE = {
  name: 'Arcade 1989',
  canvas: { ...CANVAS, bg: '#0A0014' },
  components: [
    // Cyan stripes top + bottom
    { type: 'decoration', shape: 'rect', x: 0, y: 0, width: 360, height: 6,
      fill: '#00F5FF' },
    { type: 'decoration', shape: 'rect', x: 0, y: 460, width: 360, height: 6,
      fill: '#FF0080' },
    // Brand strip — Orbitron magenta wordmark on black
    { type: 'brand-strip', x: 30, y: 24, width: 300, height: 36,
      text: 'ARCADE · 1989', font: 'Orbitron',
      fg: '#FF0080', bg: '#0A0014', letterSpacing: 0.4 },
    // Box hopper, neon-tinted window
    { type: 'hopper', variant: 'box', x: 50, y: 80, width: 260, height: 220,
      wallColor: '#FF0080', wallThickness: 3, windowFill: 'rgba(255,0,128,0.12)' },
    // Cyan CRT readout
    { type: 'led', x: 50, y: 312, width: 120, height: 26,
      color: '#00F5FF', bg: '#000813' },
    { type: 'turn-dots', x: 185, y: 320, count: 3, dotSize: 12,
      litColor: '#00F5FF', dimColor: '#1A2840' },
    // Black chute with magenta tint
    { type: 'chute', x: 140, y: 304, width: 80, height: 40,
      openingColor: '#1A0420' },
    // Glow crank
    { type: 'crank', x: 240, y: 344, size: 60, style: 'glow', accent: '#FF0080' },
    // Tray with cyan stroke
    { type: 'tray', x: 50, y: 386, width: 260, height: 56,
      fill: '#080010', stroke: '#00F5FF' },
  ],
};

// ── 4. Apothecary No. 9 — vintage cream + forest green + gold ──────────
const APOTHECARY = {
  name: 'Apothecary No. 9',
  canvas: { ...CANVAS, bg: '#F5EBD3' },
  components: [
    // Gold ornaments at top corners
    { type: 'decoration', shape: 'rect', x: 30, y: 18, width: 24, height: 24,
      fill: '#C9A14A' },
    { type: 'decoration', shape: 'rect', x: 306, y: 18, width: 24, height: 24,
      fill: '#C9A14A' },
    // Brand strip — Crimson Pro cream on forest green
    { type: 'brand-strip', x: 60, y: 22, width: 240, height: 30,
      text: 'APOTHECARY No. 9', font: 'Crimson Pro',
      fg: '#F5EBD3', bg: '#2C4A33', letterSpacing: 0.18 },
    // Hourglass hopper — narrow waist
    { type: 'hopper', variant: 'hourglass', x: 70, y: 70, width: 220, height: 280,
      wallColor: '#2C4A33', wallThickness: 4, windowFill: 'rgba(150,200,160,0.35)' },
    // Amber glass LED
    { type: 'led', x: 50, y: 360, width: 110, height: 24,
      color: '#E8B95B', bg: '#1A1408' },
    // Gold turn dots
    { type: 'turn-dots', x: 175, y: 366, count: 3, dotSize: 12,
      litColor: '#C9A14A', dimColor: '#D8CDB0' },
    // Forest chute
    { type: 'chute', x: 140, y: 350, width: 80, height: 36,
      openingColor: '#1A2E20' },
    // Brass crank
    { type: 'crank', x: 250, y: 374, size: 56, style: 'soft', accent: '#C9A14A' },
    // Cream tray with forest border
    { type: 'tray', x: 50, y: 408, width: 260, height: 60,
      fill: '#EFE3C5', stroke: '#2C4A33' },
  ],
};

export const PRESETS = [TIKI_BAR, SUBMARINE, ARCADE, APOTHECARY];
