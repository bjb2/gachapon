// Starter machine presets for the WYSIWYG designer.
//
// Inspired by the kawaii character-gachapon style: mascot ears / face on
// top of the chassis, soft pastel + wood palette, small footprint, dome
// window framed like a face.
//
// Each preset is a complete customMachine record. Loading one clones the
// components into a fresh draft so the template stays pristine.

const CANVAS = { width: 360, height: 540 };

// Helpers near the bottom; presets up top so the layout reads in order.

// ── 1. Tabby Cat Machine ───────────────────────────────────────────────
//   Walnut-stained wood body, brown cat ears with pink inner ears,
//   dome window framed as the cat's face with eyes + heart nose,
//   wooden tail accent on the side.
const TABBY_CAT = {
  name: 'Tabby Cat',
  canvas: { ...CANVAS, bg: '#FFF4E2' },
  components: [
    // ─── Cat ears (drawn first, behind chassis) ─────────────────────
    // Left outer ear
    { type: 'decoration', shape: 'triangle', x: 70, y: 28, width: 56, height: 70,
      fill: '#7A4A2A', rotation: -15,
      shadow: { color: 'rgba(0,0,0,0.18)', blur: 4, offsetY: 2 } },
    // Left inner ear (pink)
    { type: 'decoration', shape: 'triangle', x: 88, y: 50, width: 28, height: 38,
      fill: '#F4B6B6', rotation: -15 },
    // Right outer ear
    { type: 'decoration', shape: 'triangle', x: 234, y: 28, width: 56, height: 70,
      fill: '#7A4A2A', rotation: 15,
      shadow: { color: 'rgba(0,0,0,0.18)', blur: 4, offsetY: 2 } },
    // Right inner ear
    { type: 'decoration', shape: 'triangle', x: 246, y: 50, width: 28, height: 38,
      fill: '#F4B6B6', rotation: 15 },

    // ─── Wood chassis ────────────────────────────────────────────────
    // Outer dark wood frame with deep shadow
    { type: 'decoration', shape: 'rect', x: 50, y: 80, width: 260, height: 380,
      fill: '#5A3820', cornerRadius: 24,
      shadow: { color: 'rgba(0,0,0,0.32)', blur: 18, offsetY: 8 } },
    // Inner lighter wood face
    { type: 'decoration', shape: 'rect', x: 60, y: 90, width: 240, height: 360,
      fill: '#A6724A', cornerRadius: 20,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#C68A60' }, { offset: 1, color: '#8A5A36' }] } },
    // Subtle wood grain lines
    { type: 'decoration', shape: 'rect', x: 60, y: 200, width: 240, height: 1,
      fill: '#5A3820', opacity: 0.25 },
    { type: 'decoration', shape: 'rect', x: 60, y: 260, width: 240, height: 1,
      fill: '#5A3820', opacity: 0.25 },
    { type: 'decoration', shape: 'rect', x: 60, y: 320, width: 240, height: 1,
      fill: '#5A3820', opacity: 0.2 },

    // ─── Dome window framing the cat face ────────────────────────────
    // Cream backdrop inside dome
    { type: 'decoration', shape: 'circle', x: 90, y: 110, width: 180, height: 180,
      fill: '#FFF8EC', cornerRadius: 90,
      shadow: { color: 'rgba(0,0,0,0.25)', blur: 6, offsetY: 3 } },
    // Hopper itself (dome) — clear ring framing the face
    { type: 'hopper', variant: 'dome', x: 90, y: 110, width: 180, height: 180,
      wallColor: '#3A2410', wallThickness: 4,
      windowFill: 'rgba(255,248,236,0.0)' },
    // Cat eyes (two oval-shaped black pupils with reflective dot)
    { type: 'decoration', shape: 'ellipse', x: 130, y: 175, width: 24, height: 30,
      fill: '#1A1A1A' },
    { type: 'decoration', shape: 'circle', x: 134, y: 180, width: 7, height: 7,
      fill: '#FFFFFF' },
    { type: 'decoration', shape: 'ellipse', x: 206, y: 175, width: 24, height: 30,
      fill: '#1A1A1A' },
    { type: 'decoration', shape: 'circle', x: 210, y: 180, width: 7, height: 7,
      fill: '#FFFFFF' },
    // Pink heart nose
    { type: 'decoration', shape: 'triangle', x: 170, y: 218, width: 20, height: 16,
      fill: '#E8839F', rotation: 180 },
    // Whiskers (thin lines)
    { type: 'decoration', shape: 'line', x: 100, y: 232, width: 32, height: 0,
      fill: '#5A3820', strokeWidth: 1.5 },
    { type: 'decoration', shape: 'line', x: 100, y: 240, width: 28, height: 0,
      fill: '#5A3820', strokeWidth: 1.5 },
    { type: 'decoration', shape: 'line', x: 228, y: 232, width: 32, height: 0,
      fill: '#5A3820', strokeWidth: 1.5 },
    { type: 'decoration', shape: 'line', x: 232, y: 240, width: 28, height: 0,
      fill: '#5A3820', strokeWidth: 1.5 },

    // ─── Brand strip ─────────────────────────────────────────────────
    { type: 'brand-strip', x: 95, y: 304, width: 170, height: 28,
      text: 'ねこガチャ', font: 'M PLUS Rounded 1c', fontWeight: 'bold',
      fontSize: 16, fg: '#FFF4E2', bg: '#3A2410', cornerRadius: 14,
      letterSpacing: 0.1,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 4, offsetY: 2 } },

    // ─── LED + turn dots ─────────────────────────────────────────────
    { type: 'led', x: 78, y: 346, width: 110, height: 22,
      color: '#FFB347', bg: '#1A0F06',
      cornerRadius: 4 },
    { type: 'turn-dots', x: 200, y: 350, count: 3, dotSize: 10,
      litColor: '#E8839F', dimColor: '#5A3820' },

    // ─── Chute (design-only marker, tucked right under the hopper) ───
    { type: 'chute', x: 150, y: 292, width: 60, height: 20,
      openingColor: '#1A0F06', stroke: '#3A2410', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#FFB347' },

    // ─── Tray ────────────────────────────────────────────────────────
    { type: 'tray', x: 60, y: 392, width: 240, height: 56,
      fill: '#3A2410', stroke: '#1A0F06',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#5A3820' }, { offset: 1, color: '#2A1808' }] },
      cornerRadius: 8 },

    // ─── Crank (inside the body, right of the LED) ───────────────────
    { type: 'crank', x: 250, y: 332, size: 44, accent: '#A6724A',
      stroke: '#3A2410', strokeWidth: 2, iconColor: '#FFF4E2',
      fillGradient: { type: 'radial', cx: 16, cy: 12, innerR: 0, outerR: 40,
        stops: [{ offset: 0, color: '#E8C9A6' }, { offset: 0.6, color: '#A6724A' }, { offset: 1, color: '#5A3820' }] },
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 4, offsetY: 2 } },

    // ─── Cat tail (curling beside the chassis bottom-right) ──────────
    { type: 'decoration', shape: 'rect', x: 314, y: 388, width: 8, height: 60,
      fill: '#7A4A2A', cornerRadius: 4, rotation: 18 },
    { type: 'decoration', shape: 'circle', x: 326, y: 446, width: 14, height: 14,
      fill: '#A6724A' },
  ],
};

// ── 2. Bunny Hop ───────────────────────────────────────────────────────
//   Soft pink chassis, white bunny ears with pink inner, dome face with
//   bunny features, heart cheek, carrot decoration on the side.
const BUNNY_HOP = {
  name: 'Bunny Hop',
  canvas: { ...CANVAS, bg: '#FFE6EC' },
  components: [
    // Bunny ears (long, white with pink inner)
    { type: 'decoration', shape: 'ellipse', x: 110, y: 8, width: 28, height: 80,
      fill: '#FFFFFF', stroke: '#F4B6C8', strokeWidth: 2,
      rotation: -8,
      shadow: { color: 'rgba(0,0,0,0.15)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'ellipse', x: 116, y: 18, width: 14, height: 56,
      fill: '#FFC2CF', rotation: -8 },
    { type: 'decoration', shape: 'ellipse', x: 222, y: 8, width: 28, height: 80,
      fill: '#FFFFFF', stroke: '#F4B6C8', strokeWidth: 2,
      rotation: 8,
      shadow: { color: 'rgba(0,0,0,0.15)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'ellipse', x: 228, y: 18, width: 14, height: 56,
      fill: '#FFC2CF', rotation: 8 },

    // Pink chassis with rounded top
    { type: 'decoration', shape: 'rect', x: 50, y: 80, width: 260, height: 380,
      fill: '#F49AB6', cornerRadius: 32,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FFC2D4' }, { offset: 1, color: '#E87BA0' }] },
      shadow: { color: 'rgba(0,0,0,0.25)', blur: 16, offsetY: 8 } },
    // Inner cream face panel
    { type: 'decoration', shape: 'rect', x: 64, y: 96, width: 232, height: 350,
      fill: '#FFF8F4', cornerRadius: 24,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 1, color: '#FFEEF2' }] } },

    // Dome window framing bunny face
    { type: 'decoration', shape: 'circle', x: 95, y: 116, width: 170, height: 170,
      fill: '#FFE6EC', cornerRadius: 85,
      shadow: { color: 'rgba(244,154,182,0.4)', blur: 8, offsetY: 2 } },
    { type: 'hopper', variant: 'dome', x: 95, y: 116, width: 170, height: 170,
      wallColor: '#E87BA0', wallThickness: 4,
      windowFill: 'rgba(255,230,236,0.0)' },

    // Bunny eyes (closed, happy)
    { type: 'decoration', shape: 'rect', x: 132, y: 184, width: 18, height: 3,
      fill: '#1A1A1A', cornerRadius: 2 },
    { type: 'decoration', shape: 'rect', x: 210, y: 184, width: 18, height: 3,
      fill: '#1A1A1A', cornerRadius: 2 },
    // Pink nose
    { type: 'decoration', shape: 'triangle', x: 173, y: 200, width: 14, height: 12,
      fill: '#E87BA0', rotation: 180 },
    // Mouth (small w shape using two triangles)
    { type: 'decoration', shape: 'rect', x: 174, y: 216, width: 12, height: 6,
      fill: 'transparent', stroke: '#1A1A1A', strokeWidth: 1.5,
      cornerRadius: 6 },
    // Heart cheek (left)
    { type: 'decoration', shape: 'circle', x: 122, y: 218, width: 12, height: 12,
      fill: '#F49AB6', opacity: 0.8 },
    // Heart cheek (right)
    { type: 'decoration', shape: 'circle', x: 226, y: 218, width: 12, height: 12,
      fill: '#F49AB6', opacity: 0.8 },

    // Brand strip
    { type: 'brand-strip', x: 90, y: 302, width: 180, height: 28,
      text: 'うさぎ ・ HOP', font: 'M PLUS Rounded 1c', fontWeight: 'bold',
      fontSize: 14, fg: '#FFFFFF', bg: '#E87BA0', cornerRadius: 14,
      letterSpacing: 0.1,
      shadow: { color: 'rgba(232,123,160,0.4)', blur: 6 } },

    // LED + turn dots
    { type: 'led', x: 78, y: 346, width: 110, height: 22,
      color: '#FF6EC7', bg: '#1A0612' },
    { type: 'turn-dots', x: 200, y: 350, count: 3, dotSize: 10,
      litColor: '#E87BA0', dimColor: '#F4DCE2' },
    // Chute (design-only marker, tucked under the hopper)
    { type: 'chute', x: 150, y: 290, width: 60, height: 20,
      openingColor: '#3A1828', stroke: '#E87BA0', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#FFC2D4' },

    // Tray with cute scallop look (rounded heavily)
    { type: 'tray', x: 60, y: 388, width: 240, height: 56,
      fill: '#FFFFFF', stroke: '#E87BA0',
      cornerRadius: 18 },

    // Crank (pink with white center) — sits inside the body, right of LED
    { type: 'crank', x: 250, y: 332, size: 44, accent: '#E87BA0',
      stroke: '#A04060', strokeWidth: 2, iconColor: '#FFFFFF',
      fillGradient: { type: 'radial', cx: 16, cy: 12, innerR: 0, outerR: 40,
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.6, color: '#F49AB6' }, { offset: 1, color: '#A04060' }] },
      shadow: { color: 'rgba(0,0,0,0.3)', blur: 4, offsetY: 2 } },

    // Carrot decoration on the side
    { type: 'decoration', shape: 'triangle', x: 24, y: 280, width: 22, height: 56,
      fill: '#FF8C42', rotation: 18 },
    { type: 'decoration', shape: 'triangle', x: 14, y: 248, width: 12, height: 24,
      fill: '#7AB342', rotation: -25 },
    { type: 'decoration', shape: 'triangle', x: 28, y: 244, width: 12, height: 22,
      fill: '#7AB342', rotation: 12 },
  ],
};

// ── 3. Bear's Den ──────────────────────────────────────────────────────
//   Knotted brown wood, round bear ears, cream muzzle below the dome,
//   honey jar accent. Hourglass hopper for variety.
const BEARS_DEN = {
  name: "Bear's Den",
  canvas: { ...CANVAS, bg: '#F5E8C8' },
  components: [
    // Bear ears (round)
    { type: 'decoration', shape: 'circle', x: 80, y: 38, width: 50, height: 50,
      fill: '#6B4423',
      shadow: { color: 'rgba(0,0,0,0.2)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'circle', x: 90, y: 48, width: 30, height: 30,
      fill: '#A6724A' },
    { type: 'decoration', shape: 'circle', x: 230, y: 38, width: 50, height: 50,
      fill: '#6B4423',
      shadow: { color: 'rgba(0,0,0,0.2)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'circle', x: 240, y: 48, width: 30, height: 30,
      fill: '#A6724A' },

    // Wood chassis with planks
    { type: 'decoration', shape: 'rect', x: 50, y: 78, width: 260, height: 384,
      fill: '#4A2E18', cornerRadius: 22,
      shadow: { color: 'rgba(0,0,0,0.32)', blur: 18, offsetY: 8 } },
    { type: 'decoration', shape: 'rect', x: 60, y: 88, width: 240, height: 364,
      fill: '#6B4423', cornerRadius: 18,
      fillGradient: { type: 'linear', coords: 'diag135',
        stops: [{ offset: 0, color: '#8B5C30' }, { offset: 1, color: '#4A2E18' }] } },
    // Wood plank lines (vertical)
    { type: 'decoration', shape: 'rect', x: 130, y: 88, width: 1, height: 364,
      fill: '#2A1808', opacity: 0.4 },
    { type: 'decoration', shape: 'rect', x: 230, y: 88, width: 1, height: 364,
      fill: '#2A1808', opacity: 0.4 },
    // Knot circles
    { type: 'decoration', shape: 'circle', x: 78, y: 148, width: 16, height: 16,
      fill: '#3A2010', opacity: 0.55 },
    { type: 'decoration', shape: 'circle', x: 78, y: 380, width: 12, height: 12,
      fill: '#3A2010', opacity: 0.55 },
    { type: 'decoration', shape: 'circle', x: 280, y: 360, width: 14, height: 14,
      fill: '#3A2010', opacity: 0.55 },

    // Dome window — small for the bear face
    { type: 'decoration', shape: 'circle', x: 100, y: 110, width: 160, height: 160,
      fill: '#F5E8C8', cornerRadius: 80,
      shadow: { color: 'rgba(0,0,0,0.3)', blur: 8, offsetY: 3 } },
    { type: 'hopper', variant: 'hourglass', x: 100, y: 110, width: 160, height: 160,
      wallColor: '#3A2010', wallThickness: 4,
      windowFill: 'rgba(245,232,200,0.0)' },

    // Bear muzzle (cream oval)
    { type: 'decoration', shape: 'ellipse', x: 140, y: 198, width: 80, height: 50,
      fill: '#F5E8C8', stroke: '#6B4423', strokeWidth: 2 },
    // Bear nose (black triangle)
    { type: 'decoration', shape: 'triangle', x: 168, y: 206, width: 24, height: 18,
      fill: '#1A0F08', rotation: 180 },
    // Mouth line
    { type: 'decoration', shape: 'rect', x: 178, y: 226, width: 4, height: 12,
      fill: '#1A0F08' },
    // Bear eyes
    { type: 'decoration', shape: 'circle', x: 134, y: 168, width: 14, height: 14,
      fill: '#1A0F08' },
    { type: 'decoration', shape: 'circle', x: 137, y: 171, width: 5, height: 5,
      fill: '#FFFFFF' },
    { type: 'decoration', shape: 'circle', x: 212, y: 168, width: 14, height: 14,
      fill: '#1A0F08' },
    { type: 'decoration', shape: 'circle', x: 215, y: 171, width: 5, height: 5,
      fill: '#FFFFFF' },

    // Brand
    { type: 'brand-strip', x: 90, y: 286, width: 180, height: 28,
      text: 'KUMA · 熊', font: 'Crimson Pro', fontWeight: 'bold',
      fontSize: 16, fg: '#F5E8C8', bg: '#2A1808', cornerRadius: 4,
      letterSpacing: 0.18,
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetY: 2 } },

    // LED + turn dots
    { type: 'led', x: 78, y: 332, width: 110, height: 22,
      color: '#FFB347', bg: '#1A0F06' },
    { type: 'turn-dots', x: 200, y: 336, count: 3, dotSize: 10,
      litColor: '#FFB347', dimColor: '#3A2010' },
    { type: 'decoration', shape: 'rect', x: 240, y: 334, width: 28, height: 6,
      fill: '#1A0F06', cornerRadius: 3 },

    // Chute (tucked under the hourglass)
    { type: 'chute', x: 150, y: 274, width: 60, height: 20,
      openingColor: '#1A0F06', stroke: '#3A2010', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#FFB347' },

    // Tray
    { type: 'tray', x: 60, y: 388, width: 240, height: 60,
      fill: '#3A2010', stroke: '#1A0F06',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#6B4423' }, { offset: 1, color: '#2A1808' }] },
      cornerRadius: 8 },

    // Crank (brass) — sits inside the body, right of the LED
    { type: 'crank', x: 250, y: 322, size: 44, accent: '#C9A14A',
      stroke: '#7A5F2A', strokeWidth: 2, iconColor: '#3A2010',
      fillGradient: { type: 'radial', cx: 16, cy: 12, innerR: 0, outerR: 40,
        stops: [{ offset: 0, color: '#FFE6A3' }, { offset: 0.6, color: '#C9A14A' }, { offset: 1, color: '#7A5F2A' }] },
      shadow: { color: 'rgba(0,0,0,0.35)', blur: 4, offsetY: 2 } },

    // Honey jar accent (left side)
    { type: 'decoration', shape: 'rect', x: 18, y: 296, width: 28, height: 36,
      fill: '#E8B95B', cornerRadius: 4, stroke: '#7A5F2A', strokeWidth: 1 },
    { type: 'decoration', shape: 'rect', x: 16, y: 290, width: 32, height: 8,
      fill: '#7A5F2A', cornerRadius: 2 },
    // Tiny leaf on top of jar
    { type: 'decoration', shape: 'ellipse', x: 22, y: 280, width: 16, height: 8,
      fill: '#7AB342', rotation: -20 },
  ],
};

// ── 4. Treasure Bowl Ninja Cat ─────────────────────────────────────────
//   Slate gray cat with a ninja headband across the top of the dome,
//   black mask across the eyes, tail curling from the back, dark moody
//   palette with red shuriken accents.
const NINJA_CAT = {
  name: 'Treasure Bowl',
  canvas: { ...CANVAS, bg: '#1F2530' },
  components: [
    // Cat ears — gray
    { type: 'decoration', shape: 'triangle', x: 70, y: 32, width: 56, height: 64,
      fill: '#5A6470', rotation: -12,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'triangle', x: 86, y: 50, width: 28, height: 36,
      fill: '#3A4250', rotation: -12 },
    { type: 'decoration', shape: 'triangle', x: 234, y: 32, width: 56, height: 64,
      fill: '#5A6470', rotation: 12,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'triangle', x: 246, y: 50, width: 28, height: 36,
      fill: '#3A4250', rotation: 12 },

    // Slate body
    { type: 'decoration', shape: 'rect', x: 50, y: 80, width: 260, height: 380,
      fill: '#2A323C', cornerRadius: 28,
      shadow: { color: 'rgba(0,0,0,0.55)', blur: 18, offsetY: 8 } },
    { type: 'decoration', shape: 'rect', x: 62, y: 92, width: 236, height: 356,
      fill: '#3E4854', cornerRadius: 22,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#525E6E' }, { offset: 1, color: '#252B33' }] } },

    // Dome window framing the ninja face
    { type: 'decoration', shape: 'circle', x: 95, y: 112, width: 170, height: 170,
      fill: '#F8F4E8', cornerRadius: 85,
      shadow: { color: 'rgba(0,0,0,0.55)', blur: 10, offsetY: 3 } },
    { type: 'hopper', variant: 'dome', x: 95, y: 112, width: 170, height: 170,
      wallColor: '#1A1F26', wallThickness: 4,
      windowFill: 'rgba(248,244,232,0.0)' },

    // Black ninja mask strip across eyes
    { type: 'decoration', shape: 'rect', x: 95, y: 168, width: 170, height: 36,
      fill: '#1A1F26' },
    // Mask eye holes
    { type: 'decoration', shape: 'ellipse', x: 132, y: 178, width: 24, height: 18,
      fill: '#FFFFFF' },
    { type: 'decoration', shape: 'circle', x: 138, y: 182, width: 9, height: 9,
      fill: '#1A1A1A' },
    { type: 'decoration', shape: 'ellipse', x: 204, y: 178, width: 24, height: 18,
      fill: '#FFFFFF' },
    { type: 'decoration', shape: 'circle', x: 210, y: 182, width: 9, height: 9,
      fill: '#1A1A1A' },
    // Red headband ribbon (tied at right side)
    { type: 'decoration', shape: 'rect', x: 95, y: 138, width: 170, height: 14,
      fill: '#C0322C',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#E04830' }, { offset: 1, color: '#8A1810' }] } },
    // Headband knot (right side flaps)
    { type: 'decoration', shape: 'triangle', x: 252, y: 138, width: 18, height: 16,
      fill: '#C0322C', rotation: -12 },
    { type: 'decoration', shape: 'triangle', x: 252, y: 152, width: 18, height: 16,
      fill: '#8A1810', rotation: 12 },
    // Pink nose
    { type: 'decoration', shape: 'triangle', x: 172, y: 218, width: 16, height: 12,
      fill: '#D8849A', rotation: 180 },
    // Mouth
    { type: 'decoration', shape: 'rect', x: 178, y: 234, width: 4, height: 8,
      fill: '#1A1A1A' },
    // Whiskers
    { type: 'decoration', shape: 'line', x: 100, y: 230, width: 30, height: 0,
      fill: '#FFFFFF', strokeWidth: 1.5 },
    { type: 'decoration', shape: 'line', x: 230, y: 230, width: 30, height: 0,
      fill: '#FFFFFF', strokeWidth: 1.5 },

    // Brand
    { type: 'brand-strip', x: 90, y: 304, width: 180, height: 28,
      text: '忍 · NINJA', font: 'Crimson Pro', fontWeight: 'bold',
      fontSize: 16, fg: '#E04830', bg: '#0F141B', cornerRadius: 2,
      letterSpacing: 0.22,
      shadow: { color: 'rgba(224,72,48,0.5)', blur: 6 } },

    // LED + turn dots
    { type: 'led', x: 78, y: 348, width: 110, height: 22,
      color: '#E04830', bg: '#0A0608' },
    { type: 'turn-dots', x: 200, y: 352, count: 3, dotSize: 10,
      litColor: '#E04830', dimColor: '#3E4854' },
    { type: 'decoration', shape: 'rect', x: 240, y: 350, width: 28, height: 6,
      fill: '#0A0608', cornerRadius: 3 },

    // Shuriken accent on left (4-point star)
    { type: 'decoration', shape: 'polygon', x: 22, y: 280,
      points: [
        { x: 12, y: 0 }, { x: 16, y: 8 }, { x: 24, y: 12 }, { x: 16, y: 16 },
        { x: 12, y: 24 }, { x: 8, y: 16 }, { x: 0, y: 12 }, { x: 8, y: 8 },
      ],
      fill: '#1A1F26', stroke: '#5A6470', strokeWidth: 1, rotation: 22 },
    { type: 'decoration', shape: 'polygon', x: 18, y: 320,
      points: [
        { x: 10, y: 0 }, { x: 14, y: 6 }, { x: 20, y: 10 }, { x: 14, y: 14 },
        { x: 10, y: 20 }, { x: 6, y: 14 }, { x: 0, y: 10 }, { x: 6, y: 6 },
      ],
      fill: '#1A1F26', stroke: '#5A6470', strokeWidth: 1, rotation: -8 },

    // Chute (tucked under the hopper)
    { type: 'chute', x: 152, y: 286, width: 60, height: 20,
      openingColor: '#0A0608', stroke: '#E04830', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#E04830' },

    // Tray
    { type: 'tray', x: 60, y: 390, width: 240, height: 60,
      fill: '#1A1F26', stroke: '#0F141B',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#2A323C' }, { offset: 1, color: '#0A0E14' }] },
      cornerRadius: 8 },

    // Cat tail (curling from right side, beside chassis)
    { type: 'decoration', shape: 'rect', x: 314, y: 188, width: 8, height: 60,
      fill: '#5A6470', cornerRadius: 4, rotation: -20 },
    { type: 'decoration', shape: 'circle', x: 322, y: 188, width: 14, height: 14,
      fill: '#3A4250' },

    // Crank — sits inside the body, right of the LED
    { type: 'crank', x: 250, y: 332, size: 44, accent: '#3E4854',
      stroke: '#1A1F26', strokeWidth: 2, iconColor: '#E04830',
      fillGradient: { type: 'radial', cx: 16, cy: 12, innerR: 0, outerR: 40,
        stops: [{ offset: 0, color: '#7A8694' }, { offset: 0.6, color: '#3E4854' }, { offset: 1, color: '#1A1F26' }] },
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetY: 2 } },
  ],
};

// ── 5. KENISY-style Capsule Vending Machine ────────────────────────────
//   Modeled directly on the real "Kenisy Capsule Vending Machine" reference
//   photo: tall white plastic body, gray hood with KENISY chip, large
//   square window full of capsules with a curved red CAPSULE sash on the
//   glass, control plate with coin slot + viewer porthole + big white knob,
//   visible cream chute alcove above a wide catch tray.
//
//   Component order matters — anything after the hopper renders on top of
//   the live balls, mimicking how decals on the real glass sit in front
//   of the capsules behind them.
const KENISY = {
  name: 'Kenisy Capsule Vending',
  canvas: { ...CANVAS, bg: '#E8E5E0' },
  components: [
    // ─── Floor shadow (sits under everything) ────────────────────────
    { type: 'decoration', shape: 'ellipse', x: 40, y: 510, width: 280, height: 20,
      fill: 'rgba(0,0,0,0.22)', opacity: 0.7 },

    // ─── Light-gray hood with vents ──────────────────────────────────
    { type: 'decoration', shape: 'rect', x: 56, y: 12, width: 248, height: 46,
      fill: '#D4D2CE', cornerRadius: 14,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#E2E0DA' }, { offset: 1, color: '#B6B2AC' }] },
      shadow: { color: 'rgba(0,0,0,0.2)', blur: 6, offsetY: 3 } },
    // KENISY plate
    { type: 'decoration', shape: 'rect', x: 152, y: 24, width: 56, height: 18,
      fill: '#0E0E0C', cornerRadius: 2,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 2, offsetY: 1 } },
    { type: 'decoration', shape: 'text', x: 157, y: 27, text: 'KENISY',
      fill: '#FFFFFF', font: 'Arial', fontWeight: 'bold', fontSize: 11,
      letterSpacing: 0.16 },
    // Hood vent slots
    { type: 'decoration', shape: 'rect', x: 70, y: 46, width: 70, height: 3,
      fill: '#9A9893', cornerRadius: 1, opacity: 0.7 },
    { type: 'decoration', shape: 'rect', x: 220, y: 46, width: 70, height: 3,
      fill: '#9A9893', cornerRadius: 1, opacity: 0.7 },

    // ─── White plastic main body ─────────────────────────────────────
    { type: 'decoration', shape: 'rect', x: 50, y: 50, width: 260, height: 460,
      fill: '#FFFFFF', cornerRadius: 16,
      fillGradient: { type: 'linear', coords: 'diag135',
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.5, color: '#F4F1EA' }, { offset: 1, color: '#DCD9D0' }] },
      shadow: { color: 'rgba(0,0,0,0.22)', blur: 16, offsetY: 8 } },
    // Vertical edge highlight (left)
    { type: 'decoration', shape: 'rect', x: 56, y: 60, width: 3, height: 440,
      fill: '#FFFFFF', opacity: 0.7 },
    // Vertical shadow edge (right)
    { type: 'decoration', shape: 'rect', x: 302, y: 60, width: 4, height: 440,
      fill: 'rgba(0,0,0,0.07)' },

    // ─── Capsule window: deep recessed dark frame ────────────────────
    // Outer dark frame
    { type: 'decoration', shape: 'rect', x: 64, y: 70, width: 232, height: 218,
      fill: '#0E0E0C', cornerRadius: 8,
      shadow: { color: 'rgba(0,0,0,0.3)', blur: 4, offsetY: 2 } },
    // Inner mid-gray plate (the shelf you see capsules sitting on)
    { type: 'decoration', shape: 'rect', x: 70, y: 76, width: 220, height: 206,
      fill: '#454343', cornerRadius: 5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#5A5755' }, { offset: 1, color: '#2A2826' }] } },

    // ─── Static capsules visible inside the window ───────────────────
    // (These render BEHIND the hopper so live balls cover them in play.)
    ...staticCapsules([
      [86, 90, 22, '#FFB6C1', '#E08CA0'],
      [120, 110, 24, '#FFD966', '#C8A030'],
      [200, 100, 22, '#87CEEB', '#5BA8D0'],
      [240, 130, 20, '#C8A2C8', '#A075A0'],
      [98, 240, 24, '#FFFFFF', '#C0C0C0'],
      [150, 250, 22, '#98FB98', '#6FCC6F'],
      [220, 245, 24, '#FFA07A', '#D8704A'],
      [264, 220, 20, '#E6E6FA', '#B0B0E0'],
    ]),

    // ─── The actual hopper (clipped, holds the live ball canvas) ─────
    { type: 'hopper', variant: 'box', x: 70, y: 76, width: 220, height: 206,
      wallColor: '#454343', wallThickness: 0, cornerRadius: 5,
      windowFill: 'rgba(120,150,180,0.0)' },

    // ─── Glass reflection overlay (renders ON TOP of capsules + balls) ─
    { type: 'decoration', shape: 'rect', x: 70, y: 78, width: 220, height: 30,
      fill: '#FFFFFF', opacity: 0.3, cornerRadius: 4 },
    { type: 'decoration', shape: 'rect', x: 70, y: 110, width: 90, height: 4,
      fill: '#FFFFFF', opacity: 0.18 },

    // ─── Curved CAPSULE wordmark sash ────────────────────────────────
    // Cream sash backing
    { type: 'decoration', shape: 'ellipse', x: 76, y: 138, width: 208, height: 56,
      fill: '#FFF8F4', opacity: 0.92, rotation: -8,
      shadow: { color: 'rgba(0,0,0,0.25)', blur: 4, offsetY: 2 } },
    // CAPSULE — large italic red
    { type: 'decoration', shape: 'text', x: 92, y: 144, text: 'CAPSULE',
      fill: '#D8242C', font: 'Crimson Pro', fontStyle: 'italic',
      fontWeight: 'bold', fontSize: 36, letterSpacing: 0.04, rotation: -8 },
    // VENDING MACHINE — tucked underneath
    { type: 'decoration', shape: 'text', x: 116, y: 184, text: 'VENDING MACHINE',
      fill: '#A8242C', font: 'Inter', fontWeight: 'bold', fontSize: 10,
      letterSpacing: 0.22, rotation: -8 },

    // ─── Control plate (mid section) ─────────────────────────────────
    { type: 'decoration', shape: 'rect', x: 60, y: 296, width: 240, height: 76,
      fill: '#F4F2EC', cornerRadius: 6,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FAF8F2' }, { offset: 1, color: '#E4E1D8' }] } },
    // Subtle inner shadow at top
    { type: 'decoration', shape: 'rect', x: 60, y: 296, width: 240, height: 4,
      fill: 'rgba(0,0,0,0.1)' },

    // Coin acceptor (vertical slot with ring around it)
    { type: 'decoration', shape: 'circle', x: 78, y: 308, width: 44, height: 44,
      fill: '#1A1A1A',
      shadow: { color: 'rgba(0,0,0,0.45)', blur: 3, offsetY: 2 } },
    { type: 'decoration', shape: 'circle', x: 82, y: 312, width: 36, height: 36,
      fill: '#252525',
      fillGradient: { type: 'radial', cx: 14, cy: 12, innerR: 0, outerR: 22,
        stops: [{ offset: 0, color: '#3A3A3A' }, { offset: 1, color: '#0E0E0C' }] } },
    // Vertical coin slot
    { type: 'decoration', shape: 'rect', x: 96, y: 318, width: 8, height: 24,
      fill: '#FFFFFF', cornerRadius: 2 },
    { type: 'decoration', shape: 'rect', x: 97, y: 319, width: 6, height: 22,
      fill: '#0A0A0A', cornerRadius: 1 },

    // Instructions
    { type: 'decoration', shape: 'text', x: 134, y: 308, text: 'INSERT 1 COIN',
      fill: '#3A3A3A', font: 'Arial', fontWeight: 'bold', fontSize: 9,
      letterSpacing: 0.16 },
    { type: 'decoration', shape: 'text', x: 134, y: 326, text: 'TURN HANDLE →',
      fill: '#888', font: 'Arial', fontWeight: 'bold', fontSize: 9,
      letterSpacing: 0.16 },

    // Big white knob crank — sits in the right side of the control plate
    { type: 'crank', x: 224, y: 300, size: 64, accent: '#FFFFFF',
      stroke: '#A8A39A', strokeWidth: 3, iconColor: '#444',
      fillGradient: { type: 'radial', cx: 22, cy: 18, innerR: 4, outerR: 56,
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.5, color: '#F4F0E6' }, { offset: 1, color: '#A8A39A' }] },
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 6, offsetY: 4 } },

    // ─── LED counter + turn dots tucked under the control plate ──────
    { type: 'led', x: 64, y: 380, width: 96, height: 20,
      color: '#88FF44', bg: '#0E0E08', cornerRadius: 3 },
    { type: 'turn-dots', x: 168, y: 386, count: 3, dotSize: 9,
      litColor: '#D8242C', dimColor: '#D8D5CE' },
    // Compact NO REFUND label
    { type: 'decoration', shape: 'rect', x: 218, y: 378, width: 78, height: 22,
      fill: '#D8242C', cornerRadius: 2,
      shadow: { color: 'rgba(0,0,0,0.25)', blur: 3, offsetY: 1 } },
    { type: 'decoration', shape: 'text', x: 226, y: 382, text: 'NO REFUND',
      fill: '#FFFFFF', font: 'Arial', fontWeight: 'bold', fontSize: 10,
      letterSpacing: 0.08 },

    // ─── Visible chute alcove (deep dark cutout above the tray) ──────
    // This is the *visible* opening you'd reach into. The chute marker
    // (hidden in play) just tells the dispense flow where to place the
    // ball — the alcove decoration provides the chassis cutout look.
    { type: 'decoration', shape: 'rect', x: 70, y: 408, width: 220, height: 38,
      fill: '#0A0A08', cornerRadius: 4,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#1F1F1C' }] },
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetY: 2 } },
    // Inner depth gradient (faux 3D recess)
    { type: 'decoration', shape: 'rect', x: 74, y: 412, width: 212, height: 8,
      fill: '#000000', opacity: 0.7, cornerRadius: 2 },
    // Cream "lip" above the alcove
    { type: 'decoration', shape: 'rect', x: 68, y: 404, width: 224, height: 4,
      fill: '#E8DDC8', cornerRadius: 2 },

    // ─── Hidden chute marker (positions the dispense exit, tucked
    // right under the hopper bottom so the queue sits at the viewport edge) ─
    { type: 'chute', x: 150, y: 286, width: 60, height: 20,
      openingColor: '#000000', cornerRadius: 0 },

    // ─── Cream catch tray ────────────────────────────────────────────
    { type: 'tray', x: 60, y: 446, width: 240, height: 50,
      fill: '#E8DDC8', stroke: '#A89E84',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#F0E6D0' }, { offset: 1, color: '#C8BCA0' }] },
      cornerRadius: 6,
      shadow: { color: 'rgba(0,0,0,0.18)', blur: 4, offsetY: 2 } },
  ],
};

// Helper: spawn a row of "static capsule" decorations (each is two stacked
// circles to suggest a capsule top + bottom). Used to fill the window in
// design view; live balls render on top of these in play mode.
function staticCapsules(specs) {
  const out = [];
  for (const [x, y, d, top, bot] of specs) {
    // Top half (lighter)
    out.push({ type: 'decoration', shape: 'circle', x, y, width: d, height: d,
      fill: top, opacity: 0.92,
      shadow: { color: 'rgba(0,0,0,0.25)', blur: 2, offsetY: 1 } });
    // Bottom half (darker, slight offset)
    out.push({ type: 'decoration', shape: 'circle', x: x + d * 0.04, y: y + d * 0.4, width: d * 0.95, height: d * 0.6,
      fill: bot, opacity: 0.85 });
  }
  return out;
}

// ── 6. Lucky Gacha (built-in `classic` chassis replica) ────────────────
//   Cream/pink kawaii dome machine. Soft beige body with pink brand chip,
//   teal LED, white chrome crank, pink turn dots, glass dome with two
//   reflection highlights. Two small "rivet" headlight dots flank the
//   brand strip just like the CSS ::before/::after.
const CLASSIC_LUCKY = {
  name: 'Lucky Gacha',
  canvas: { width: 360, height: 600, bg: '#FDEEF5' },
  components: [
    // ─── Floor shadow ────────────────────────────────────────────────
    { type: 'decoration', shape: 'ellipse', x: 50, y: 568, width: 260, height: 18,
      fill: 'rgba(0,0,0,0.18)', opacity: 0.7 },

    // ─── Dome collar (sits behind body, above dome) ──────────────────
    { type: 'decoration', shape: 'rect', x: 55, y: 198, width: 250, height: 14,
      fill: '#DDD5C8', cornerRadius: 4,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#DDD5C8' }, { offset: 1, color: '#C8C0B4' }] },
      stroke: '#C8BFB5', strokeWidth: 2,
      shadow: { color: 'rgba(0,0,0,0.12)', blur: 4, offsetY: 2 } },

    // ─── Cream body chassis (rounded only at bottom) ─────────────────
    { type: 'decoration', shape: 'rect', x: 45, y: 210, width: 270, height: 332,
      fill: '#F2EDE6', cornerRadius: 26,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#F2EDE6' }, { offset: 0.5, color: '#E8E0D5' }, { offset: 1, color: '#DDD4C6' }] },
      stroke: '#C8BFB5', strokeWidth: 3,
      shadow: { color: 'rgba(0,0,0,0.16)', blur: 16, offsetY: 10 } },
    // Square the top of the body so the collar sits flush
    { type: 'decoration', shape: 'rect', x: 45, y: 210, width: 270, height: 18,
      fill: '#F2EDE6' },
    // Top edge highlight
    { type: 'decoration', shape: 'rect', x: 48, y: 212, width: 264, height: 2,
      fill: '#FFFFFF', opacity: 0.6 },

    // Two pearl rivet "screws" ─ machine-body::before/::after
    { type: 'decoration', shape: 'circle', x: 58, y: 226, width: 10, height: 10,
      fill: '#E8E0D8', stroke: '#999999', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 3.5, cy: 3, innerR: 0, outerR: 9,
        stops: [{ offset: 0, color: '#E8E0D8' }, { offset: 1, color: '#B0A8A0' }] } },
    { type: 'decoration', shape: 'circle', x: 292, y: 226, width: 10, height: 10,
      fill: '#E8E0D8', stroke: '#999999', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 3.5, cy: 3, innerR: 0, outerR: 9,
        stops: [{ offset: 0, color: '#E8E0D8' }, { offset: 1, color: '#B0A8A0' }] } },

    // ─── Pink brand chip (centered between rivets) ───────────────────
    { type: 'brand-strip', x: 122, y: 222, width: 116, height: 18,
      text: '★ LUCKY GACHA ★', font: 'DotGothic16', fontWeight: 'bold',
      fontSize: 9, fg: '#FFFFFF', bg: '#FF6B9D', cornerRadius: 4,
      letterSpacing: 0.12,
      shadow: { color: 'rgba(255,107,157,0.45)', blur: 5, offsetY: 2 } },

    // ─── Glass dome (sits ABOVE the collar) ──────────────────────────
    // Dome backdrop ring (pale glass tint behind hopper)
    { type: 'decoration', shape: 'ellipse', x: 65, y: 50, width: 230, height: 310,
      fill: '#D7EEFF', opacity: 0.2 },
    // Hopper itself (dome window)
    { type: 'hopper', variant: 'half-dome', x: 65, y: 50, width: 230, height: 155,
      wallColor: 'rgba(160,200,240,0.75)', wallThickness: 3,
      windowFill: 'rgba(215,238,255,0.55)' },
    // Glass reflection highlights on the dome
    { type: 'decoration', shape: 'ellipse', x: 84, y: 64, width: 30, height: 80,
      fill: '#FFFFFF', opacity: 0.22, rotation: -18 },
    { type: 'decoration', shape: 'ellipse', x: 124, y: 60, width: 13, height: 38,
      fill: '#FFFFFF', opacity: 0.14, rotation: -12 },

    // ─── LED display (dark with teal text) ───────────────────────────
    { type: 'led', x: 64, y: 256, width: 110, height: 22,
      color: '#4ECDC4', bg: '#12112A', cornerRadius: 5,
      shadow: { color: 'rgba(78,205,196,0.2)', blur: 8 } },

    // ─── "LUCKY" lucky-circle (white with text) ──────────────────────
    { type: 'decoration', shape: 'circle', x: 64, y: 290, width: 50, height: 50,
      fill: '#FFFFFF', stroke: '#C0B8B0', strokeWidth: 2,
      shadow: { color: 'rgba(0,0,0,0.1)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'text', x: 76, y: 305, text: 'LUCKY',
      fill: '#2D2A26', font: 'Arial', fontWeight: 'bold', fontSize: 8,
      letterSpacing: 0.08 },
    { type: 'decoration', shape: 'text', x: 79, y: 318, text: 'GACHA',
      fill: '#2D2A26', font: 'Arial', fontWeight: 'bold', fontSize: 8,
      letterSpacing: 0.08 },

    // ─── Turn dots (pink) ────────────────────────────────────────────
    { type: 'turn-dots', x: 130, y: 296, count: 3, dotSize: 9,
      litColor: '#FF6B9D', dimColor: '#D0C8BE' },

    // ─── Big chrome/white crank ──────────────────────────────────────
    { type: 'crank', x: 220, y: 282, size: 64, accent: '#FFFFFF',
      stroke: '#B0A8A0', strokeWidth: 3, iconColor: '#666666',
      fillGradient: { type: 'radial', cx: 22, cy: 18, innerR: 0, outerR: 60,
        stops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.45, color: '#DDD5CC' }, { offset: 1, color: '#C0B8B0' }] },
      shadow: { color: 'rgba(0,0,0,0.22)', blur: 8, offsetY: 6 } },

    // ─── Chute marker (tucked under the half-dome cap) ───────────────
    { type: 'chute', x: 150, y: 208, width: 60, height: 20,
      openingColor: '#1A0F06', stroke: '#C8BFB5', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#FF6B9D' },

    // ─── Tray (cream rounded) ────────────────────────────────────────
    { type: 'tray', x: 60, y: 470, width: 240, height: 72,
      fill: '#C8C0B6', stroke: '#AAA29A',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#C8C0B6' }, { offset: 1, color: '#BEB6AC' }] },
      cornerRadius: 14,
      shadow: { color: 'rgba(0,0,0,0.22)', blur: 10, offsetY: 4 } },
    // Tray flap (the small lip above center)
    { type: 'decoration', shape: 'rect', x: 154, y: 466, width: 52, height: 18,
      fill: '#C4BDB4', cornerRadius: 5, stroke: '#A8A09A', strokeWidth: 1.5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#C4BDB4' }, { offset: 1, color: '#D0C8BF' }] },
      shadow: { color: 'rgba(0,0,0,0.12)', blur: 3, offsetY: 3 } },
  ],
};

// ── 7. DEPOT No.7 (built-in `noir` chassis replica) ────────────────────
//   Dark navy noir crate with amber/yellow accents. Square box window
//   instead of dome, scanline overlay, corner bracket accents (top-L
//   and top-R), amber rivet bolts, square amber turn-dots. Brand label
//   uses Share Tech Mono with bracketed text.
const NOIR_DEPOT = {
  name: 'DEPOT No.7',
  canvas: { width: 360, height: 600, bg: '#0A0E14' },
  components: [
    // ─── Subtle grid backdrop hint (very faint) ──────────────────────
    { type: 'decoration', shape: 'rect', x: 0, y: 0, width: 360, height: 600,
      fill: 'rgba(247,183,49,0.02)' },

    // ─── Floor shadow ────────────────────────────────────────────────
    { type: 'decoration', shape: 'ellipse', x: 50, y: 568, width: 260, height: 18,
      fill: 'rgba(0,0,0,0.6)', opacity: 0.75 },

    // ─── Dark navy box-shaped window (top of unit) ───────────────────
    { type: 'decoration', shape: 'rect', x: 50, y: 36, width: 260, height: 200,
      fill: 'rgba(5,10,16,0.92)', cornerRadius: 4,
      stroke: 'rgba(247,183,49,0.5)', strokeWidth: 3,
      shadow: { color: 'rgba(247,183,49,0.1)', blur: 22 } },
    // Box hopper (live capsules render here)
    { type: 'hopper', variant: 'box', x: 52, y: 38, width: 256, height: 200,
      wallColor: 'rgba(247,183,49,0.0)', wallThickness: 0, cornerRadius: 4,
      windowFill: 'rgba(5,10,16,0.0)' },
    // Scanline overlay (top half band)
    { type: 'decoration', shape: 'rect', x: 50, y: 36, width: 260, height: 100,
      fill: 'rgba(0,0,0,0.07)', opacity: 0.5 },
    { type: 'decoration', shape: 'rect', x: 50, y: 140, width: 260, height: 96,
      fill: 'rgba(0,0,0,0.07)', opacity: 0.5 },
    // Top-left corner bracket
    { type: 'decoration', shape: 'rect', x: 57, y: 43, width: 14, height: 2,
      fill: 'rgba(247,183,49,0.55)' },
    { type: 'decoration', shape: 'rect', x: 57, y: 43, width: 2, height: 14,
      fill: 'rgba(247,183,49,0.55)' },
    // Top-right corner bracket
    { type: 'decoration', shape: 'rect', x: 289, y: 43, width: 14, height: 2,
      fill: 'rgba(247,183,49,0.55)' },
    { type: 'decoration', shape: 'rect', x: 301, y: 43, width: 2, height: 14,
      fill: 'rgba(247,183,49,0.55)' },

    // ─── Dark navy chassis body (rounded only at bottom) ─────────────
    { type: 'decoration', shape: 'rect', x: 50, y: 236, width: 260, height: 308,
      fill: '#1E2A35', cornerRadius: 4,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#1E2A35' }, { offset: 0.5, color: '#141E28' }, { offset: 1, color: '#0C1520' }] },
      stroke: 'rgba(247,183,49,0.32)', strokeWidth: 3,
      shadow: { color: 'rgba(0,0,0,0.65)', blur: 18, offsetY: 10 } },
    // Square the top so it flush-meets the window
    { type: 'decoration', shape: 'rect', x: 50, y: 236, width: 260, height: 14,
      fill: '#1E2A35' },
    // Inner top edge gold highlight
    { type: 'decoration', shape: 'rect', x: 53, y: 238, width: 254, height: 1,
      fill: 'rgba(247,183,49,0.08)' },

    // Amber rivet bolts (top-left, top-right at top of body)
    { type: 'decoration', shape: 'circle', x: 58, y: 244, width: 9, height: 9,
      fill: '#3A4A55', stroke: 'rgba(247,183,49,0.22)', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 3, cy: 2.5, innerR: 0, outerR: 7,
        stops: [{ offset: 0, color: '#3A4A55' }, { offset: 1, color: '#1A2530' }] } },
    { type: 'decoration', shape: 'circle', x: 293, y: 244, width: 9, height: 9,
      fill: '#3A4A55', stroke: 'rgba(247,183,49,0.22)', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 3, cy: 2.5, innerR: 0, outerR: 7,
        stops: [{ offset: 0, color: '#3A4A55' }, { offset: 1, color: '#1A2530' }] } },

    // ─── Amber-glow brand strip ──────────────────────────────────────
    { type: 'brand-strip', x: 110, y: 260, width: 140, height: 20,
      text: '[ DEPOT No.7 ]', font: 'Share Tech Mono', fontWeight: 'normal',
      fontSize: 9, fg: '#F7B731', bg: 'rgba(0,0,0,0)', cornerRadius: 2,
      stroke: 'rgba(247,183,49,0.4)', strokeWidth: 1,
      letterSpacing: 0.22,
      shadow: { color: 'rgba(247,183,49,0.55)', blur: 8 } },

    // ─── Amber LED display ───────────────────────────────────────────
    { type: 'led', x: 64, y: 296, width: 110, height: 22,
      color: '#F7B731', bg: '#04080D', cornerRadius: 2,
      shadow: { color: 'rgba(247,183,49,0.12)', blur: 6 } },

    // Hex porthole circle (small "lucky" replacement)
    { type: 'decoration', shape: 'circle', x: 64, y: 332, width: 44, height: 44,
      fill: '#080E16', stroke: 'rgba(247,183,49,0.22)', strokeWidth: 1.5,
      shadow: { color: 'rgba(247,183,49,0.08)', blur: 4 } },
    { type: 'decoration', shape: 'text', x: 73, y: 348, text: 'NO.7',
      fill: 'rgba(247,183,49,0.65)', font: 'Share Tech Mono', fontWeight: 'bold',
      fontSize: 9, letterSpacing: 0.06 },

    // ─── Square amber turn-dots ──────────────────────────────────────
    // turn-dots component renders circles, so layer square decorations to mimic the noir look.
    { type: 'decoration', shape: 'rect', x: 124, y: 336, width: 8, height: 8,
      fill: '#F7B731', stroke: '#C08800', strokeWidth: 1,
      shadow: { color: 'rgba(247,183,49,0.7)', blur: 4 } },
    { type: 'decoration', shape: 'rect', x: 138, y: 336, width: 8, height: 8,
      fill: '#141E28', stroke: 'rgba(247,183,49,0.18)', strokeWidth: 1 },
    // Functional turn-dots component (tucked above for engine wiring)
    { type: 'turn-dots', x: 124, y: 322, count: 2, dotSize: 8,
      litColor: '#F7B731', dimColor: '#141E28' },

    // ─── Crank (dark with amber accent) ──────────────────────────────
    { type: 'crank', x: 224, y: 304, size: 60, accent: '#1E2A35',
      stroke: 'rgba(247,183,49,0.42)', strokeWidth: 3, iconColor: '#F7B731',
      fillGradient: { type: 'radial', cx: 20, cy: 16, innerR: 0, outerR: 56,
        stops: [{ offset: 0, color: '#3A4A55' }, { offset: 0.5, color: '#1E2A35' }, { offset: 1, color: '#0C1520' }] },
      shadow: { color: 'rgba(247,183,49,0.18)', blur: 10, offsetY: 4 } },

    // ─── Chute marker (tucked under the box hopper) ──────────────────
    { type: 'chute', x: 150, y: 240, width: 60, height: 20,
      openingColor: '#04080D', stroke: 'rgba(247,183,49,0.32)', strokeWidth: 2,
      cornerRadius: 0, labelColor: '#F7B731' },

    // ─── Tray (dark with amber border) ───────────────────────────────
    { type: 'tray', x: 50, y: 478, width: 260, height: 68,
      fill: '#0C1520', stroke: 'rgba(247,183,49,0.32)',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#0C1520' }, { offset: 1, color: '#080E16' }] },
      cornerRadius: 4,
      shadow: { color: 'rgba(0,0,0,0.45)', blur: 12, offsetY: 4 } },
    // Tray flap
    { type: 'decoration', shape: 'rect', x: 160, y: 474, width: 40, height: 12,
      fill: '#1A2530', stroke: 'rgba(247,183,49,0.22)', strokeWidth: 1.5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#1A2530' }, { offset: 1, color: '#141E28' }] } },
  ],
};

// ── 8. SYNTH-X 404 (built-in `cyber` chassis replica) ──────────────────
//   Synthwave dome machine. Deep navy/black body with cyan glow trim,
//   purple secondary accents, glowing cyan brand strip, dome with cyan
//   bezel and cyan/purple highlights, cyan glow crank, cyan dots.
const CYBER_SYNTH = {
  name: 'SYNTH-X 404',
  canvas: { width: 360, height: 420, bg: '#050810' },
  components: [
    // ─── Floor glow (right under the tray) ───────────────────────────
    { type: 'decoration', shape: 'ellipse', x: 50, y: 408, width: 260, height: 12,
      fill: 'rgba(0,217,255,0.14)', opacity: 0.75 },

    // ─── Dome (half-dome cap with glowing cyan rim) ──────────────────
    // Outer cyan glow ring (decoration behind hopper)
    { type: 'decoration', shape: 'rect', x: 50, y: 18, width: 240, height: 132,
      fill: 'rgba(0,217,255,0.05)',
      shadow: { color: 'rgba(0,217,255,0.3)', blur: 18 } },
    // The dome window
    { type: 'hopper', variant: 'half-dome', x: 55, y: 22, width: 230, height: 130,
      wallColor: 'rgba(0,217,255,0.75)', wallThickness: 3,
      windowFill: 'rgba(0,28,48,0.65)' },
    // Cyan + purple highlight reflections (after hopper, on top)
    { type: 'decoration', shape: 'ellipse', x: 76, y: 38, width: 22, height: 60,
      fill: 'rgba(0,217,255,0.22)', opacity: 0.9, rotation: -16 },
    { type: 'decoration', shape: 'ellipse', x: 108, y: 32, width: 9, height: 24,
      fill: 'rgba(191,90,242,0.3)', opacity: 0.9, rotation: -10 },

    // ─── Dome collar (dark band connecting dome to body) ─────────────
    { type: 'decoration', shape: 'rect', x: 38, y: 148, width: 264, height: 10,
      fill: '#0A1020',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#0A1020' }, { offset: 1, color: '#060C18' }] },
      stroke: 'rgba(0,217,255,0.4)', strokeWidth: 2,
      shadow: { color: 'rgba(0,217,255,0.18)', blur: 8, offsetY: 2 } },

    // ─── Deep navy chassis ───────────────────────────────────────────
    { type: 'decoration', shape: 'rect', x: 33, y: 158, width: 274, height: 230,
      fill: '#0C1224', cornerRadius: 8,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#0C1224' }, { offset: 1, color: '#050810' }] },
      stroke: 'rgba(0,217,255,0.32)', strokeWidth: 3,
      shadow: { color: 'rgba(0,0,0,0.7)', blur: 18, offsetY: 8 } },
    // Top edge cyan highlight
    { type: 'decoration', shape: 'rect', x: 36, y: 161, width: 268, height: 1,
      fill: 'rgba(0,217,255,0.12)' },
    // Cyan corner indicator dots
    { type: 'decoration', shape: 'circle', x: 43, y: 168, width: 7, height: 7,
      fill: '#00D9FF',
      shadow: { color: 'rgba(0,217,255,0.7)', blur: 6 } },
    { type: 'decoration', shape: 'circle', x: 290, y: 168, width: 7, height: 7,
      fill: '#00D9FF',
      shadow: { color: 'rgba(0,217,255,0.7)', blur: 6 } },

    // ─── Brand strip ─────────────────────────────────────────────────
    { type: 'brand-strip', x: 90, y: 182, width: 160, height: 24,
      text: '◈ SYNTH-X 404 ◈', font: 'Orbitron', fontWeight: 'bold',
      fontSize: 9, fg: '#00D9FF', bg: 'rgba(0,0,0,0)', cornerRadius: 3,
      stroke: 'rgba(0,217,255,0.45)', strokeWidth: 1,
      letterSpacing: 0.18,
      shadow: { color: 'rgba(0,217,255,0.6)', blur: 8 } },

    // ─── LED display (left side of controls row) ─────────────────────
    { type: 'led', x: 50, y: 220, width: 110, height: 22,
      color: '#00D9FF', bg: '#020408', cornerRadius: 3,
      shadow: { color: 'rgba(0,217,255,0.18)', blur: 8 } },

    // ─── 404 lucky-ball plate (below LED) ────────────────────────────
    { type: 'decoration', shape: 'circle', x: 60, y: 264, width: 48, height: 48,
      fill: '#030608', stroke: 'rgba(191,90,242,0.4)', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 18, cy: 14, innerR: 0, outerR: 36,
        stops: [{ offset: 0, color: 'rgba(191,90,242,0.18)' }, { offset: 1, color: '#030608' }] },
      shadow: { color: 'rgba(191,90,242,0.25)', blur: 8 } },
    { type: 'decoration', shape: 'text', x: 71, y: 280, text: '404',
      fill: 'rgba(191,90,242,0.95)', font: 'Orbitron', fontWeight: 'bold',
      fontSize: 13, letterSpacing: 0.08,
      shadow: { color: 'rgba(191,90,242,0.6)', blur: 4 } },

    // ─── Turn dots (cyan, 4 for SYNTH-X) ─────────────────────────────
    { type: 'turn-dots', x: 124, y: 282, count: 4, dotSize: 8,
      litColor: '#00D9FF', dimColor: '#070D18' },

    // ─── Glowing crank (right side) ──────────────────────────────────
    { type: 'crank', x: 226, y: 232, size: 56, accent: '#0A1018',
      stroke: 'rgba(0,217,255,0.55)', strokeWidth: 3, iconColor: '#00D9FF',
      fillGradient: { type: 'radial', cx: 20, cy: 16, innerR: 0, outerR: 50,
        stops: [{ offset: 0, color: 'rgba(0,217,255,0.25)' }, { offset: 0.45, color: '#0A1018' }, { offset: 1, color: '#050810' }] },
      shadow: { color: 'rgba(0,217,255,0.4)', blur: 14, offsetY: 4 } },

    // ─── Chute marker (tucked under the dome) ────────────────────────
    { type: 'chute', x: 150, y: 154, width: 60, height: 18,
      openingColor: '#020408', stroke: 'rgba(0,217,255,0.32)', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#00D9FF' },

    // ─── Tray (dark with cyan border) ────────────────────────────────
    { type: 'tray', x: 50, y: 348, width: 260, height: 56,
      fill: '#0A1020', stroke: 'rgba(0,217,255,0.32)',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#0A1020' }, { offset: 1, color: '#060C18' }] },
      cornerRadius: 6,
      shadow: { color: 'rgba(0,217,255,0.08)', blur: 10, offsetY: 4 } },
    // Tray flap
    { type: 'decoration', shape: 'rect', x: 154, y: 344, width: 52, height: 10,
      fill: '#0C1224', stroke: 'rgba(0,217,255,0.25)', strokeWidth: 1.5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#0C1224' }, { offset: 1, color: '#0A1020' }] } },
  ],
};

// ── 9. Mori no Tama (built-in `forest` chassis replica) ────────────────
//   Stained walnut chassis with an amber half-dome glass cap sitting flush
//   on top, just like the real built-in. The dome is a SEMICIRCLE (using
//   the new half-dome variant) — its flat bottom rests on the wooden
//   collar, and balls cascade through the open bottom into the chassis.
const FOREST_MORI = {
  name: 'Mori no Tama',
  canvas: { width: 360, height: 620, bg: '#1A1208' },
  components: [
    // ─── Floor shadow ────────────────────────────────────────────────
    { type: 'decoration', shape: 'ellipse', x: 50, y: 588, width: 260, height: 18,
      fill: 'rgba(0,0,0,0.55)', opacity: 0.8 },

    // ─── Amber half-dome glass cap (sits flush on top of the collar) ─
    // Half-dome bottom edge at y=240, peak at y=80 (160 tall, 240 wide,
    // centered horizontally so its base lines up with the chassis top).
    { type: 'hopper', variant: 'half-dome', x: 60, y: 80, width: 240, height: 160,
      wallColor: 'rgba(200,160,40,0.7)', wallThickness: 4,
      windowFill: 'rgba(160,110,20,0.32)',
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 10, offsetY: 4 } },
    // Glass highlight stripes inside the dome (render after hopper so they sit on top of balls)
    { type: 'decoration', shape: 'ellipse', x: 84, y: 110, width: 26, height: 72,
      fill: 'rgba(255,235,170,0.18)', rotation: -18 },
    { type: 'decoration', shape: 'ellipse', x: 124, y: 108, width: 11, height: 36,
      fill: 'rgba(255,225,130,0.14)', rotation: -12 },

    // ─── Wooden collar — connects the dome to the chassis body ───────
    { type: 'decoration', shape: 'rect', x: 50, y: 232, width: 260, height: 18,
      fill: '#5C3D2E', cornerRadius: 4,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#7A5238' }, { offset: 1, color: '#4A3024' }] },
      stroke: 'rgba(40,24,12,0.6)', strokeWidth: 2,
      shadow: { color: 'rgba(0,0,0,0.45)', blur: 6, offsetY: 2 } },
    // Collar grain stripes
    ...[60, 80, 100, 140, 180, 220, 260, 290].map(x => ({
      type: 'decoration', shape: 'rect', x, y: 234, width: 1, height: 14,
      fill: 'rgba(200,140,70,0.18)',
    })),

    // ─── Stained walnut body ─────────────────────────────────────────
    { type: 'decoration', shape: 'rect', x: 40, y: 248, width: 280, height: 320,
      fill: '#4A3020', cornerRadius: 14,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#4A3020' }, { offset: 0.5, color: '#3D2618' }, { offset: 1, color: '#2C1C0E' }] },
      stroke: 'rgba(92,61,46,0.92)', strokeWidth: 3,
      shadow: { color: 'rgba(0,0,0,0.55)', blur: 18, offsetY: 10 } },
    // Top edge highlight
    { type: 'decoration', shape: 'rect', x: 43, y: 250, width: 274, height: 1,
      fill: 'rgba(200,160,90,0.18)' },
    // Wood grain stripes
    ...[60, 96, 132, 168, 204, 240, 276].map((x, i) => ({
      type: 'decoration', shape: 'rect', x, y: 260, width: 1, height: 300,
      fill: i % 2 === 0 ? 'rgba(200,140,70,0.08)' : 'rgba(150,100,50,0.06)',
    })),
    // Single knot accent on the body
    { type: 'decoration', shape: 'circle', x: 296, y: 264, width: 10, height: 10,
      fill: '#8B6914', stroke: 'rgba(200,160,80,0.38)', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 3.5, cy: 3, innerR: 0, outerR: 8,
        stops: [{ offset: 0, color: '#8B6914' }, { offset: 1, color: '#4A3020' }] },
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 2 } },

    // ─── Amber/gold brand strip ──────────────────────────────────────
    { type: 'brand-strip', x: 110, y: 282, width: 140, height: 24,
      text: '✦ 森の玉 ✦', font: 'Crimson Pro', fontWeight: 'bold',
      fontSize: 13, fg: '#F0D9A0', bg: 'rgba(40,24,12,0.7)', cornerRadius: 12,
      stroke: 'rgba(200,160,80,0.4)', strokeWidth: 1,
      letterSpacing: 0.16,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 4, offsetY: 1 } },

    // ─── Amber LED display ───────────────────────────────────────────
    { type: 'led', x: 60, y: 322, width: 110, height: 22,
      color: '#C8A028', bg: '#180E04', cornerRadius: 3,
      shadow: { color: 'rgba(200,160,40,0.15)', blur: 5 } },

    // ─── Wooden lucky-ball plate (left of crank) ─────────────────────
    { type: 'decoration', shape: 'circle', x: 60, y: 360, width: 50, height: 50,
      fill: '#1C1005', stroke: 'rgba(139,105,20,0.45)', strokeWidth: 1.5,
      fillGradient: { type: 'radial', cx: 18, cy: 14, innerR: 0, outerR: 36,
        stops: [{ offset: 0, color: '#3A2410' }, { offset: 1, color: '#0F0804' }] },
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 4 } },
    { type: 'decoration', shape: 'text', x: 70, y: 374, text: 'MORI',
      fill: 'rgba(200,165,80,0.85)', font: 'Crimson Pro', fontWeight: 'bold',
      fontSize: 9, fontStyle: 'italic', letterSpacing: 0.06 },
    { type: 'decoration', shape: 'text', x: 76, y: 388, text: '森',
      fill: 'rgba(200,165,80,0.75)', font: 'Crimson Pro', fontWeight: 'bold',
      fontSize: 13, letterSpacing: 0 },

    // ─── Gold turn dots ──────────────────────────────────────────────
    { type: 'turn-dots', x: 130, y: 376, count: 3, dotSize: 9,
      litColor: '#C8A028', dimColor: '#2C1C0E' },

    // ─── Wood-stained crank ──────────────────────────────────────────
    { type: 'crank', x: 220, y: 340, size: 60, accent: '#4A3020',
      stroke: 'rgba(139,105,20,0.7)', strokeWidth: 3, iconColor: '#C8A028',
      fillGradient: { type: 'radial', cx: 20, cy: 16, innerR: 0, outerR: 56,
        stops: [{ offset: 0, color: '#8B6914' }, { offset: 0.45, color: '#4A3020' }, { offset: 1, color: '#1C1005' }] },
      shadow: { color: 'rgba(0,0,0,0.55)', blur: 14, offsetY: 6 } },

    // ─── Chute marker (tucked right under the half-dome's flat bottom) ─
    { type: 'chute', x: 150, y: 244, width: 60, height: 20,
      openingColor: '#180E04', stroke: 'rgba(139,105,20,0.45)', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#C8A028' },

    // ─── Tray (dark wood) ────────────────────────────────────────────
    { type: 'tray', x: 50, y: 490, width: 260, height: 70,
      fill: '#2A1808', stroke: 'rgba(92,61,46,0.92)',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#3A2410' }, { offset: 1, color: '#1E1005' }] },
      cornerRadius: 10,
      shadow: { color: 'rgba(0,0,0,0.38)', blur: 12, offsetY: 4 } },
    // Tray flap
    { type: 'decoration', shape: 'rect', x: 154, y: 486, width: 52, height: 12,
      fill: '#4A3020', stroke: 'rgba(92,61,46,0.7)', strokeWidth: 1.5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#5A3820' }, { offset: 1, color: '#3D2618' }] },
      cornerRadius: 4 },
  ],
};

// ── 10. Capsule World — ISUZU truck (built-in `modern` chassis replica) ─
//   White plastic body box-window machine. Black ISUZU brand band spans
//   edge-to-edge with two black "headlight" circles flanking it. White
//   plastic frame box with two orange LED indicator lights at the top,
//   green LED display, big chrome crank, red turn dots.
const MODERN_ISUZU = {
  name: 'Capsule World (ISUZU)',
  canvas: { width: 380, height: 600, bg: '#FFFFFF' },
  components: [
    // ─── Floor shadow ────────────────────────────────────────────────
    { type: 'decoration', shape: 'ellipse', x: 60, y: 568, width: 260, height: 18,
      fill: 'rgba(0,0,0,0.18)', opacity: 0.7 },

    // ─── White plastic frame around the box window ───────────────────
    { type: 'decoration', shape: 'rect', x: 56, y: 36, width: 268, height: 200,
      fill: '#F8F5FA', cornerRadius: 10,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#F8F5FA' }, { offset: 1, color: '#F0ECF4' }] },
      stroke: '#E0D8E8', strokeWidth: 3,
      shadow: { color: 'rgba(0,0,0,0.06)', blur: 8, offsetY: -2 } },
    // Inner top-edge highlight
    { type: 'decoration', shape: 'rect', x: 58, y: 38, width: 264, height: 2,
      fill: '#FFFFFF', opacity: 0.9 },

    // ─── Two orange LED indicator lights (on the white frame) ────────
    { type: 'decoration', shape: 'rect', x: 70, y: 43, width: 36, height: 11,
      fill: '#FFBB44', cornerRadius: 5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FFBB44' }, { offset: 1, color: '#FF8800' }] },
      shadow: { color: 'rgba(255,140,0,0.45)', blur: 6, offsetY: 2 } },
    { type: 'decoration', shape: 'rect', x: 72, y: 44, width: 32, height: 3,
      fill: '#FFFFFF', opacity: 0.4, cornerRadius: 2 },
    { type: 'decoration', shape: 'rect', x: 274, y: 43, width: 36, height: 11,
      fill: '#FFBB44', cornerRadius: 5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FFBB44' }, { offset: 1, color: '#FF8800' }] },
      shadow: { color: 'rgba(255,140,0,0.45)', blur: 6, offsetY: 2 } },
    { type: 'decoration', shape: 'rect', x: 276, y: 44, width: 32, height: 3,
      fill: '#FFFFFF', opacity: 0.4, cornerRadius: 2 },

    // ─── The actual box window (transparent blue glass) ──────────────
    // Glass backdrop visible behind capsules
    { type: 'decoration', shape: 'rect', x: 56, y: 62, width: 268, height: 174,
      fill: 'rgba(222,234,250,0.68)', cornerRadius: 0,
      shadow: { color: 'rgba(255,255,255,0.5)', blur: 8 } },
    // Static capsules behind hopper (live balls cover these in play)
    ...staticCapsules([
      [80, 80, 24, '#FFB6C1', '#E08CA0'],
      [120, 100, 24, '#FFD966', '#C8A030'],
      [180, 90, 24, '#87CEEB', '#5BA8D0'],
      [240, 110, 24, '#C8A2C8', '#A075A0'],
      [78, 160, 24, '#FFFFFF', '#C0C0C0'],
      [128, 170, 24, '#98FB98', '#6FCC6F'],
      [180, 165, 24, '#FFA07A', '#D8704A'],
      [240, 180, 24, '#E6E6FA', '#B0B0E0'],
    ]),
    // Box hopper (live capsules render here, clipped to box window)
    { type: 'hopper', variant: 'box', x: 56, y: 62, width: 268, height: 174,
      wallColor: 'rgba(200,188,218,0.5)', wallThickness: 1.5, cornerRadius: 0,
      windowFill: 'rgba(0,0,0,0)' },
    // Glass sheen overlay (renders on top)
    { type: 'decoration', shape: 'rect', x: 56, y: 62, width: 268, height: 30,
      fill: '#FFFFFF', opacity: 0.2 },
    { type: 'decoration', shape: 'rect', x: 56, y: 92, width: 90, height: 4,
      fill: '#FFFFFF', opacity: 0.12 },

    // ─── White plastic main body (rounded only at bottom) ────────────
    { type: 'decoration', shape: 'rect', x: 50, y: 236, width: 280, height: 308,
      fill: '#FAF9FA', cornerRadius: 18,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#FAF9FA' }, { offset: 0.5, color: '#F5F4F6' }, { offset: 1, color: '#EEECEF' }] },
      stroke: '#DCDADE', strokeWidth: 3,
      shadow: { color: 'rgba(0,0,0,0.12)', blur: 18, offsetY: 10 } },
    // Square the top
    { type: 'decoration', shape: 'rect', x: 50, y: 236, width: 280, height: 14,
      fill: '#FAF9FA' },
    // Top inner highlight
    { type: 'decoration', shape: 'rect', x: 53, y: 238, width: 274, height: 1,
      fill: '#FFFFFF', opacity: 0.95 },

    // ─── Two black "headlight" circles flanking brand band ───────────
    { type: 'decoration', shape: 'circle', x: 59, y: 249, width: 20, height: 20,
      fill: '#111111', cornerRadius: 10,
      fillGradient: { type: 'radial', cx: 7, cy: 6, innerR: 0, outerR: 16,
        stops: [{ offset: 0, color: '#666666' }, { offset: 1, color: '#111111' }] },
      shadow: { color: 'rgba(0,0,0,0.28)', blur: 5, offsetY: 2 } },
    { type: 'decoration', shape: 'circle', x: 301, y: 249, width: 20, height: 20,
      fill: '#111111', cornerRadius: 10,
      fillGradient: { type: 'radial', cx: 7, cy: 6, innerR: 0, outerR: 16,
        stops: [{ offset: 0, color: '#666666' }, { offset: 1, color: '#111111' }] },
      shadow: { color: 'rgba(0,0,0,0.28)', blur: 5, offsetY: 2 } },

    // ─── Full-width black ISUZU brand band ───────────────────────────
    { type: 'brand-strip', x: 50, y: 250, width: 280, height: 30,
      text: 'ISUZU', font: 'Orbitron', fontWeight: 'bold',
      fontSize: 13, fg: '#FFFFFF', bg: '#111111', cornerRadius: 0,
      letterSpacing: 0.45,
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 0, offsetY: 1 } },
    // Inner top highlight on the band
    { type: 'decoration', shape: 'rect', x: 50, y: 250, width: 280, height: 1,
      fill: 'rgba(255,255,255,0.08)' },
    // Inner bottom shadow on the band
    { type: 'decoration', shape: 'rect', x: 50, y: 279, width: 280, height: 1,
      fill: 'rgba(0,0,0,0.4)' },

    // ─── Green-pixel LED display ─────────────────────────────────────
    { type: 'led', x: 64, y: 300, width: 110, height: 22,
      color: '#88FF44', bg: '#12110E', cornerRadius: 4,
      stroke: '#2A261E', strokeWidth: 2,
      shadow: { color: 'rgba(136,255,68,0.12)', blur: 5 } },

    // ─── Lucky-circle (white with text) ──────────────────────────────
    { type: 'decoration', shape: 'circle', x: 64, y: 334, width: 50, height: 50,
      fill: '#FFFFFF', stroke: '#E0DEDE', strokeWidth: 2,
      shadow: { color: 'rgba(0,0,0,0.08)', blur: 4, offsetY: 2 } },
    { type: 'decoration', shape: 'text', x: 75, y: 350, text: 'PUSH',
      fill: '#808080', font: 'Arial', fontWeight: 'bold', fontSize: 8 },
    { type: 'decoration', shape: 'text', x: 76, y: 363, text: 'COIN',
      fill: '#808080', font: 'Arial', fontWeight: 'bold', fontSize: 8 },

    // ─── Red turn dots ───────────────────────────────────────────────
    { type: 'turn-dots', x: 130, y: 340, count: 3, dotSize: 9,
      litColor: '#CC0000', dimColor: '#E4E0E0' },

    // ─── Big chrome crank ────────────────────────────────────────────
    { type: 'crank', x: 226, y: 304, size: 72, accent: '#D8D0DC',
      stroke: '#C0B8C8', strokeWidth: 3, iconColor: '#555555',
      fillGradient: { type: 'radial', cx: 26, cy: 22, innerR: 0, outerR: 68,
        stops: [
          { offset: 0, color: '#FFFFFF' },
          { offset: 0.25, color: '#D8D0DC' },
          { offset: 0.5, color: '#B8B0BC' },
          { offset: 0.75, color: '#A0989E' },
          { offset: 1, color: '#888090' },
        ] },
      shadow: { color: 'rgba(0,0,0,0.22)', blur: 14, offsetY: 6 } },

    // ─── Chute marker (tucked under the box hopper) ──────────────────
    { type: 'chute', x: 160, y: 240, width: 60, height: 20,
      openingColor: '#1A1A1A', stroke: '#CCCACA', strokeWidth: 2,
      cornerRadius: 4, labelColor: '#CC0000' },

    // ─── Tray (light gray, rounded) ──────────────────────────────────
    { type: 'tray', x: 60, y: 478, width: 260, height: 72,
      fill: '#EDECEC', stroke: '#D4D2D2',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#EDECEC' }, { offset: 1, color: '#E6E4E4' }] },
      cornerRadius: 12,
      shadow: { color: 'rgba(0,0,0,0.08)', blur: 10, offsetY: 4 } },
    // Tray flap
    { type: 'decoration', shape: 'rect', x: 164, y: 474, width: 52, height: 12,
      fill: '#EEECEA', stroke: '#CCCACA', strokeWidth: 1.5,
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#EEECEA' }, { offset: 1, color: '#E6E4E4' }] },
      cornerRadius: 4 },
  ],
};

export const PRESETS = [TABBY_CAT, BUNNY_HOP, BEARS_DEN, NINJA_CAT, KENISY,
  CLASSIC_LUCKY, NOIR_DEPOT, CYBER_SYNTH, FOREST_MORI, MODERN_ISUZU];
