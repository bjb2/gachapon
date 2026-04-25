// Starter machine presets for the WYSIWYG designer.
//
// Each preset is a complete customMachine record (per schema.js). Loading
// one clones the components into a new record so the user can edit freely
// without touching the original template.
//
// Designs lean hard on layered decorations + gradient fills + drop shadows
// to deliver real visual richness — flat fills alone read as wireframes.
// Each preset uses 25-50 components and exercises a different hopper variant.

const CANVAS = { width: 380, height: 600 };

// ── 1. Mid-Century Diner ───────────────────────────────────────────────
// Chrome silver body, red accent stripe, neon "DINER" sign, checker tray.
const DINER = {
  name: 'Mid-Century Diner',
  canvas: { ...CANVAS, bg: '#FBE4D8' },
  components: [
    // Sun-faded sky backdrop (radial)
    { type: 'decoration', shape: 'rect', x: 0, y: 0, width: 380, height: 280,
      fill: '#FBE4D8',
      fillGradient: { type: 'radial', cx: 190, cy: 80, innerR: 0, outerR: 260,
        stops: [{ offset: 0, color: '#FFE0B0' }, { offset: 1, color: '#F4B79A' }] } },
    // Curb beneath
    { type: 'decoration', shape: 'rect', x: 0, y: 480, width: 380, height: 120,
      fill: '#3A3A3A',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#2A2A2A' }, { offset: 1, color: '#0F0F0F' }] } },
    // Chrome chassis backplate (stacked rects for depth)
    { type: 'decoration', shape: 'rect', x: 24, y: 60, width: 332, height: 420,
      fill: '#888',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.5, color: '#C8C8D0' }, { offset: 1, color: '#7A7A82' }] },
      cornerRadius: 14,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 18, offsetY: 8 } },
    { type: 'decoration', shape: 'rect', x: 32, y: 68, width: 316, height: 404,
      fill: '#E8E8EE',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#F8F8FC' }, { offset: 1, color: '#C0C0C8' }] },
      cornerRadius: 10 },
    // Red accent stripe band across middle
    { type: 'decoration', shape: 'rect', x: 32, y: 282, width: 316, height: 18,
      fill: '#D32F2F' },
    { type: 'decoration', shape: 'rect', x: 32, y: 302, width: 316, height: 4,
      fill: '#FFFFFF' },
    // Neon halo behind brand
    { type: 'decoration', shape: 'rect', x: 60, y: 78, width: 260, height: 56,
      fill: '#FF1744', cornerRadius: 28, opacity: 0.18,
      shadow: { color: 'rgba(255,23,68,0.7)', blur: 24, offsetY: 0 } },
    // Brand neon "DINER"
    { type: 'brand-strip', x: 60, y: 84, width: 260, height: 50,
      text: 'DINER', font: 'Crimson Pro', fontStyle: 'italic', fontWeight: 'bold',
      fontSize: 36, fg: '#FFFFFF', bg: '#D32F2F', cornerRadius: 25,
      bgGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#E53935' }, { offset: 1, color: '#A30000' }] },
      shadow: { color: 'rgba(0,0,0,0.45)', blur: 8, offsetY: 4 },
      letterSpacing: 0.06 },
    // Chrome rivets at corners
    ...rivets([[40, 76], [340, 76], [40, 464], [340, 464]], '#A8A8B2'),
    // Box hopper — smoked glass window in chrome frame
    { type: 'hopper', variant: 'box', x: 56, y: 150, width: 268, height: 180,
      wallColor: '#E0E0E8', wallThickness: 6, cornerRadius: 8,
      windowFill: 'rgba(40,30,30,0.45)',
      shadow: { color: 'rgba(0,0,0,0.35)', blur: 10, offsetY: 4 } },
    // Inner window highlight
    { type: 'decoration', shape: 'rect', x: 64, y: 158, width: 252, height: 30,
      fill: '#FFFFFF', opacity: 0.18, cornerRadius: 6 },
    // Red LED display "OPEN" style
    { type: 'led', x: 68, y: 348, width: 130, height: 30,
      color: '#FF3344', bg: '#1A0A0A',
      shadow: { color: 'rgba(255,51,68,0.5)', blur: 8, offsetY: 0 } },
    // Turn dots — red lit
    { type: 'turn-dots', x: 220, y: 354, count: 3, dotSize: 14,
      litColor: '#FF1744', dimColor: '#9A8E92' },
    // Chrome ball crank
    { type: 'crank', x: 296, y: 388, size: 56, accent: '#D8D8E0',
      strokeWidth: 3, stroke: '#888',
      fillGradient: { type: 'radial', cx: 22, cy: 18, innerR: 4, outerR: 50,
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.6, color: '#C0C0C8' }, { offset: 1, color: '#6A6A72' }] },
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 8, offsetY: 4 } },
    // Red center on crank
    { type: 'decoration', shape: 'circle', x: 312, y: 404, width: 24, height: 24,
      fill: '#D32F2F', stroke: '#A00000', strokeWidth: 2 },
    // Chute — red mouth
    { type: 'chute', x: 130, y: 332, width: 120, height: 30,
      openingColor: '#1A0606', stroke: '#D32F2F', strokeWidth: 2,
      cornerRadius: 6, labelColor: '#FF6B6B' },
    // Tray — checker pattern (alternating squares)
    { type: 'tray', x: 56, y: 400, width: 268, height: 60,
      fill: '#FFFFFF', stroke: '#888', cornerRadius: 6 },
    ...checkerRow(56, 410, 268, 14, 12, ['#FFFFFF', '#D32F2F']),
    ...checkerRow(56, 424, 268, 14, 12, ['#D32F2F', '#FFFFFF']),
    ...checkerRow(56, 438, 268, 14, 12, ['#FFFFFF', '#D32F2F']),
  ],
};

// ── 2. Speakeasy — deco brass + emerald + gold sunburst ────────────────
const SPEAKEASY = {
  name: 'Speakeasy',
  canvas: { ...CANVAS, bg: '#1A2A22' },
  components: [
    // Emerald wallpaper backdrop with subtle radial
    { type: 'decoration', shape: 'rect', x: 0, y: 0, width: 380, height: 600,
      fill: '#1A2A22',
      fillGradient: { type: 'radial', cx: 190, cy: 280, innerR: 40, outerR: 360,
        stops: [{ offset: 0, color: '#2C4536' }, { offset: 1, color: '#0E1812' }] } },
    // Gold sunburst lines emanating from top-center
    ...sunburst(190, 50, 12, 280, 'rgba(201,161,74,0.18)'),
    // Deco frame outer
    { type: 'decoration', shape: 'rect', x: 24, y: 60, width: 332, height: 460,
      fill: '#1A2A22', stroke: '#C9A14A', strokeWidth: 3,
      cornerRadius: 4,
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 14, offsetY: 6 } },
    // Inner frame
    { type: 'decoration', shape: 'rect', x: 34, y: 70, width: 312, height: 440,
      fill: 'transparent', stroke: '#C9A14A', strokeWidth: 1, cornerRadius: 2 },
    // Top + bottom gold accent bands
    { type: 'decoration', shape: 'rect', x: 24, y: 96, width: 332, height: 4, fill: '#C9A14A' },
    { type: 'decoration', shape: 'rect', x: 24, y: 480, width: 332, height: 4, fill: '#C9A14A' },
    // Brand — gold serif on dark green
    { type: 'brand-strip', x: 50, y: 30, width: 280, height: 40,
      text: 'S P E A K E A S Y', font: 'Crimson Pro', fontWeight: 'bold',
      fontSize: 22, fg: '#E8C674', bg: '#0E1812',
      bgGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#1A2A22' }, { offset: 1, color: '#0E1812' }] },
      letterSpacing: 0.1,
      shadow: { color: 'rgba(0,0,0,0.7)', blur: 6, offsetY: 3 } },
    // Diamond ornaments on either side of brand
    { type: 'decoration', shape: 'polygon', x: 24, y: 38,
      points: [{ x: 12, y: 0 }, { x: 24, y: 12 }, { x: 12, y: 24 }, { x: 0, y: 12 }],
      fill: '#C9A14A' },
    { type: 'decoration', shape: 'polygon', x: 332, y: 38,
      points: [{ x: 12, y: 0 }, { x: 24, y: 12 }, { x: 12, y: 24 }, { x: 0, y: 12 }],
      fill: '#C9A14A' },
    // Hourglass hopper — emerald with gold rim
    { type: 'hopper', variant: 'hourglass', x: 70, y: 110, width: 240, height: 280,
      wallColor: '#C9A14A', wallThickness: 4,
      windowFill: 'rgba(80,140,100,0.32)',
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 10, offsetY: 4 } },
    // Gold pillars flanking hopper
    { type: 'decoration', shape: 'rect', x: 50, y: 110, width: 14, height: 280,
      fill: '#C9A14A',
      fillGradient: { type: 'linear', coords: 'leftToRight',
        stops: [{ offset: 0, color: '#7A5F2A' }, { offset: 0.5, color: '#E8C674' }, { offset: 1, color: '#7A5F2A' }] } },
    { type: 'decoration', shape: 'rect', x: 316, y: 110, width: 14, height: 280,
      fill: '#C9A14A',
      fillGradient: { type: 'linear', coords: 'leftToRight',
        stops: [{ offset: 0, color: '#7A5F2A' }, { offset: 0.5, color: '#E8C674' }, { offset: 1, color: '#7A5F2A' }] } },
    // Pillar caps
    { type: 'decoration', shape: 'rect', x: 46, y: 102, width: 22, height: 8, fill: '#E8C674' },
    { type: 'decoration', shape: 'rect', x: 46, y: 388, width: 22, height: 8, fill: '#E8C674' },
    { type: 'decoration', shape: 'rect', x: 312, y: 102, width: 22, height: 8, fill: '#E8C674' },
    { type: 'decoration', shape: 'rect', x: 312, y: 388, width: 22, height: 8, fill: '#E8C674' },
    // Amber LED
    { type: 'led', x: 90, y: 408, width: 130, height: 28,
      color: '#E8B95B', bg: '#0E0A04',
      shadow: { color: 'rgba(232,185,91,0.4)', blur: 8 } },
    // Gold turn dots
    { type: 'turn-dots', x: 244, y: 414, count: 3, dotSize: 12,
      litColor: '#E8C674', dimColor: '#3A4A36' },
    // Chute — dark wood with gold trim
    { type: 'chute', x: 140, y: 392, width: 100, height: 28,
      openingColor: '#1A1006', stroke: '#C9A14A', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#C9A14A' },
    // Wood tray
    { type: 'tray', x: 50, y: 446, width: 280, height: 60,
      fill: '#3A2615', stroke: '#C9A14A',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#5A3A1F' }, { offset: 1, color: '#2A1A0A' }] },
      cornerRadius: 6 },
    // Brass crank with art deco rosette
    { type: 'crank', x: 290, y: 422, size: 50, accent: '#C9A14A',
      stroke: '#7A5F2A', strokeWidth: 3,
      fillGradient: { type: 'radial', cx: 18, cy: 14, innerR: 2, outerR: 40,
        stops: [{ offset: 0, color: '#FFE6A3' }, { offset: 0.5, color: '#C9A14A' }, { offset: 1, color: '#7A5F2A' }] },
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 6, offsetY: 3 } },
    // Wallpaper diamond pattern (subtle)
    ...wallpaperDiamonds(380, 600, 60, 'rgba(201,161,74,0.06)'),
  ],
};

// ── 3. Vapor Mall — pastel Y2K with palm + grid ────────────────────────
const VAPOR_MALL = {
  name: 'Vapor Mall',
  canvas: { ...CANVAS, bg: '#1A0F2E' },
  components: [
    // Sunset gradient sky
    { type: 'decoration', shape: 'rect', x: 0, y: 0, width: 380, height: 360,
      fill: '#1A0F2E',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [
          { offset: 0, color: '#FFB7D9' },
          { offset: 0.4, color: '#FF6E9F' },
          { offset: 0.7, color: '#7B2CBF' },
          { offset: 1, color: '#1A0F2E' },
        ] } },
    // Sun disc behind hopper
    { type: 'decoration', shape: 'circle', x: 130, y: 90, width: 120, height: 120,
      fill: '#FFE066',
      fillGradient: { type: 'radial', cx: 60, cy: 60, innerR: 0, outerR: 60,
        stops: [{ offset: 0, color: '#FFFAA0' }, { offset: 0.7, color: '#FFB347' }, { offset: 1, color: '#FF6E9F' }] },
      shadow: { color: 'rgba(255,176,71,0.6)', blur: 30 } },
    // Sun horizontal slits
    { type: 'decoration', shape: 'rect', x: 130, y: 130, width: 120, height: 4, fill: '#1A0F2E', opacity: 0.4 },
    { type: 'decoration', shape: 'rect', x: 130, y: 145, width: 120, height: 4, fill: '#1A0F2E', opacity: 0.3 },
    { type: 'decoration', shape: 'rect', x: 130, y: 160, width: 120, height: 4, fill: '#1A0F2E', opacity: 0.2 },
    // Grid floor receding
    ...vaporGrid(0, 360, 380, 240, '#FF1493'),
    // Palm silhouette left
    ...palm(20, 220, '#1A0F2E'),
    // Palm silhouette right
    ...palm(320, 240, '#1A0F2E'),
    // Brand "VAPOR MALL" with chrome gradient
    { type: 'brand-strip', x: 40, y: 30, width: 300, height: 44,
      text: 'V A P O R  M A L L', font: 'Orbitron', fontWeight: 'bold',
      fontSize: 22, fg: '#FFFFFF', bg: 'transparent',
      bgGradient: { type: 'linear', coords: 'diag135',
        stops: [{ offset: 0, color: '#FF6E9F' }, { offset: 0.5, color: '#A663CC' }, { offset: 1, color: '#5BC0EB' }] },
      cornerRadius: 22, letterSpacing: 0.12,
      shadow: { color: 'rgba(91,192,235,0.7)', blur: 12, offsetY: 0 } },
    // Dome hopper — holographic window
    { type: 'hopper', variant: 'dome', x: 50, y: 110, width: 280, height: 220,
      wallColor: '#FFFFFF', wallThickness: 5,
      windowFill: 'rgba(255,182,231,0.32)',
      fillGradient: { type: 'radial', cx: 140, cy: 80, innerR: 20, outerR: 180,
        stops: [{ offset: 0, color: 'rgba(255,255,255,0.4)' }, { offset: 0.5, color: 'rgba(180,140,220,0.3)' }, { offset: 1, color: 'rgba(91,192,235,0.5)' }] },
      shadow: { color: 'rgba(255,110,159,0.5)', blur: 20 } },
    // Hopper glass highlight
    { type: 'decoration', shape: 'ellipse', x: 90, y: 130, width: 100, height: 30,
      fill: '#FFFFFF', opacity: 0.4 },
    // Greek bust silhouette (simplified) at center
    { type: 'decoration', shape: 'ellipse', x: 165, y: 200, width: 50, height: 60,
      fill: '#FFFFFF', opacity: 0.7 },
    { type: 'decoration', shape: 'rect', x: 175, y: 240, width: 30, height: 50,
      fill: '#FFFFFF', opacity: 0.7 },
    // LED — pink on dark purple
    { type: 'led', x: 70, y: 388, width: 130, height: 28,
      color: '#FF6EC7', bg: '#1A0628',
      shadow: { color: 'rgba(255,110,199,0.6)', blur: 10 } },
    // Cyan turn dots
    { type: 'turn-dots', x: 230, y: 394, count: 3, dotSize: 14,
      litColor: '#5BC0EB', dimColor: '#3A2A52' },
    // Chute with neon outline
    { type: 'chute', x: 140, y: 332, width: 100, height: 30,
      openingColor: '#0A0214', stroke: '#FF6EC7', strokeWidth: 2,
      cornerRadius: 6, labelColor: '#FF6EC7' },
    // Crank — chrome with pink rim
    { type: 'crank', x: 290, y: 420, size: 56, accent: '#FFFFFF',
      stroke: '#FF6EC7', strokeWidth: 3,
      fillGradient: { type: 'radial', cx: 22, cy: 16, innerR: 4, outerR: 50,
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.5, color: '#E8C8DC' }, { offset: 1, color: '#A06080' }] },
      shadow: { color: 'rgba(255,110,199,0.7)', blur: 14 } },
    // Tray — purple glass
    { type: 'tray', x: 40, y: 426, width: 240, height: 60,
      fill: '#2A1A4A', stroke: '#5BC0EB',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#3A2862' }, { offset: 1, color: '#1A0F2E' }] },
      cornerRadius: 12 },
  ],
};

// ── 4. NYC Subway 1979 — yellow car + rust + graffiti ──────────────────
const SUBWAY = {
  name: 'NYC Subway 1979',
  canvas: { ...CANVAS, bg: '#1A1A1A' },
  components: [
    // Tunnel wall texture
    { type: 'decoration', shape: 'rect', x: 0, y: 0, width: 380, height: 600,
      fill: '#1A1A1A',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#2A2A28' }, { offset: 1, color: '#0E0E0C' }] } },
    // Subway car body — vintage yellow with brushed gradient
    { type: 'decoration', shape: 'rect', x: 20, y: 70, width: 340, height: 440,
      fill: '#F5C32C',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FFD93D' }, { offset: 0.5, color: '#F5C32C' }, { offset: 1, color: '#C49620' }] },
      cornerRadius: 6,
      shadow: { color: 'rgba(0,0,0,0.7)', blur: 16, offsetY: 8 } },
    // Black trim top
    { type: 'decoration', shape: 'rect', x: 20, y: 70, width: 340, height: 14, fill: '#0A0A0A' },
    // Black trim bottom
    { type: 'decoration', shape: 'rect', x: 20, y: 496, width: 340, height: 14, fill: '#0A0A0A' },
    // Route number badge — circle with "7"
    { type: 'decoration', shape: 'circle', x: 30, y: 30, width: 50, height: 50,
      fill: '#9B59B6', stroke: '#FFFFFF', strokeWidth: 4,
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 6 } },
    { type: 'decoration', shape: 'text', x: 47, y: 38, text: '7', fill: '#FFFFFF',
      font: 'Inter', fontWeight: 'bold', fontSize: 32 },
    // MTA brand strip
    { type: 'brand-strip', x: 100, y: 36, width: 240, height: 38,
      text: 'EXPRESS · 1979', font: 'Inter', fontWeight: 'bold',
      fontSize: 18, fg: '#F5C32C', bg: '#0A0A0A',
      letterSpacing: 0.18, cornerRadius: 2,
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 4 } },
    // Window frame (cylinder hopper styled like subway window)
    { type: 'decoration', shape: 'rect', x: 38, y: 100, width: 304, height: 240,
      fill: '#0A0A0A', cornerRadius: 8 },
    // Cylinder hopper inset into the window frame
    { type: 'hopper', variant: 'cylinder', x: 50, y: 110, width: 280, height: 220,
      wallColor: '#888888', wallThickness: 5,
      windowFill: 'rgba(150,180,200,0.25)',
      shadow: { color: 'rgba(0,0,0,0.7)', blur: 8, offsetY: 4 } },
    // Window highlight bar
    { type: 'decoration', shape: 'rect', x: 50, y: 120, width: 280, height: 8,
      fill: '#FFFFFF', opacity: 0.18, cornerRadius: 4 },
    // Rust spots (irregular orange-brown blotches)
    { type: 'decoration', shape: 'ellipse', x: 28, y: 380, width: 48, height: 22,
      fill: '#7A3A1A', opacity: 0.65 },
    { type: 'decoration', shape: 'ellipse', x: 36, y: 388, width: 28, height: 14,
      fill: '#3A1A06', opacity: 0.85 },
    { type: 'decoration', shape: 'ellipse', x: 312, y: 460, width: 56, height: 20,
      fill: '#7A3A1A', opacity: 0.55 },
    { type: 'decoration', shape: 'ellipse', x: 320, y: 466, width: 32, height: 10,
      fill: '#3A1A06', opacity: 0.75 },
    // Graffiti tag (text decoration)
    { type: 'decoration', shape: 'text', x: 220, y: 360, text: 'KOOL',
      fill: '#E91E63', font: 'Crimson Pro', fontStyle: 'italic', fontWeight: 'bold',
      fontSize: 28, opacity: 0.85, rotation: -8 },
    // Smaller tag
    { type: 'decoration', shape: 'text', x: 50, y: 458, text: 'FLY',
      fill: '#3CB371', font: 'Crimson Pro', fontStyle: 'italic', fontWeight: 'bold',
      fontSize: 20, opacity: 0.85, rotation: 6 },
    // Rivets around the window
    ...rivets([
      [44, 106], [336, 106], [44, 334], [336, 334],
      [190, 106], [190, 334], [44, 220], [336, 220],
    ], '#3A3A38'),
    // Orange dot-matrix LED
    { type: 'led', x: 50, y: 360, width: 130, height: 28,
      color: '#FF8C00', bg: '#0A0A06' },
    // Turn dots — red emergency style
    { type: 'turn-dots', x: 200, y: 366, count: 3, dotSize: 12,
      litColor: '#FF1744', dimColor: '#3A3A38' },
    // Chute — black with yellow trim
    { type: 'chute', x: 140, y: 396, width: 100, height: 28,
      openingColor: '#0A0A0A', stroke: '#F5C32C', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#F5C32C' },
    // Industrial crank — black knob
    { type: 'crank', x: 280, y: 392, size: 60, accent: '#1A1A1A',
      stroke: '#F5C32C', strokeWidth: 3,
      fillGradient: { type: 'radial', cx: 22, cy: 16, innerR: 2, outerR: 50,
        stops: [{ offset: 0, color: '#4A4A48' }, { offset: 0.6, color: '#1A1A1A' }, { offset: 1, color: '#000000' }] },
      shadow: { color: 'rgba(0,0,0,0.6)', blur: 6, offsetY: 4 } },
    // Subway floor tray
    { type: 'tray', x: 30, y: 432, width: 320, height: 56,
      fill: '#3A3A38', stroke: '#0A0A0A',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#5A5A55' }, { offset: 1, color: '#2A2A28' }] },
      cornerRadius: 4 },
  ],
};

// ── Helper generators ──────────────────────────────────────────────────

function rivets(coords, color) {
  return coords.map(([x, y]) => ({
    type: 'decoration', shape: 'circle', x, y, width: 12, height: 12,
    fill: color,
    fillGradient: { type: 'radial', cx: 4, cy: 4, innerR: 0, outerR: 8,
      stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 1, color: color }] },
    shadow: { color: 'rgba(0,0,0,0.5)', blur: 2, offsetY: 1 },
  }));
}

function checkerRow(x, y, totalW, h, cellW, colors) {
  const cells = Math.ceil(totalW / cellW);
  const out = [];
  for (let i = 0; i < cells; i++) {
    out.push({
      type: 'decoration', shape: 'rect',
      x: x + i * cellW, y, width: Math.min(cellW, totalW - i * cellW), height: h,
      fill: colors[i % 2],
    });
  }
  return out;
}

function sunburst(cx, cy, count, radius, color) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    out.push({
      type: 'decoration', shape: 'rect',
      x: cx - 1, y: cy, width: 2, height: radius,
      fill: color, rotation: angle,
    });
  }
  return out;
}

function vaporGrid(x, y, w, h, color) {
  const out = [];
  // Horizontal lines (perspective spaced)
  for (let i = 0; i < 8; i++) {
    const ratio = Math.pow(i / 7, 1.6);
    const ly = y + ratio * h;
    out.push({
      type: 'decoration', shape: 'rect',
      x, y: ly, width: w, height: 2,
      fill: color, opacity: 0.4 + ratio * 0.4,
    });
  }
  // Vertical lines (radial from center bottom)
  const cx = x + w / 2, by = y + h;
  for (let i = -6; i <= 6; i++) {
    if (i === 0) continue;
    const tx = cx + i * 30;
    out.push({
      type: 'decoration', shape: 'line',
      x: tx, y, width: cx - tx, height: h,
      fill: color, opacity: 0.5,
    });
  }
  return out;
}

function palm(baseX, baseY, color) {
  const out = [];
  // Trunk
  out.push({ type: 'decoration', shape: 'rect',
    x: baseX, y: baseY, width: 6, height: 140, fill: color });
  // Fronds (5 angled triangles)
  const fronds = [
    { rot: -45, len: 60 }, { rot: -20, len: 70 },
    { rot: 0, len: 80 }, { rot: 20, len: 70 }, { rot: 45, len: 60 },
  ];
  for (const f of fronds) {
    out.push({
      type: 'decoration', shape: 'triangle',
      x: baseX - 2, y: baseY - f.len + 12,
      width: 16, height: f.len, fill: color, rotation: f.rot,
    });
  }
  return out;
}

function wallpaperDiamonds(canvasW, canvasH, spacing, color) {
  const out = [];
  for (let y = 110; y < canvasH - 60; y += spacing) {
    for (let x = 60; x < canvasW - 40; x += spacing) {
      out.push({
        type: 'decoration', shape: 'polygon', x, y,
        points: [{ x: 4, y: 0 }, { x: 8, y: 4 }, { x: 4, y: 8 }, { x: 0, y: 4 }],
        fill: color,
      });
    }
  }
  return out;
}

export const PRESETS = [DINER, SPEAKEASY, VAPOR_MALL, SUBWAY];
