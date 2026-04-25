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

    // ─── Coin slot ───────────────────────────────────────────────────
    { type: 'decoration', shape: 'rect', x: 240, y: 348, width: 28, height: 6,
      fill: '#1A0F06', cornerRadius: 3 },

    // ─── Chute ───────────────────────────────────────────────────────
    { type: 'chute', x: 130, y: 380, width: 100, height: 32,
      openingColor: '#1A0F06', stroke: '#3A2410', strokeWidth: 2,
      cornerRadius: 6, labelColor: '#FFB347' },

    // ─── Tray ────────────────────────────────────────────────────────
    { type: 'tray', x: 60, y: 422, width: 240, height: 28,
      fill: '#3A2410', stroke: '#1A0F06',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#5A3820' }, { offset: 1, color: '#2A1808' }] },
      cornerRadius: 6 },

    // ─── Crank (knob on right) ───────────────────────────────────────
    { type: 'crank', x: 312, y: 230, size: 36, accent: '#A6724A',
      stroke: '#3A2410', strokeWidth: 2,
      fillGradient: { type: 'radial', cx: 14, cy: 10, innerR: 0, outerR: 32,
        stops: [{ offset: 0, color: '#E8C9A6' }, { offset: 0.6, color: '#A6724A' }, { offset: 1, color: '#5A3820' }] },
      shadow: { color: 'rgba(0,0,0,0.4)', blur: 4, offsetY: 2 } },

    // ─── Cat tail (curling around bottom-right) ──────────────────────
    { type: 'decoration', shape: 'rect', x: 296, y: 380, width: 8, height: 70,
      fill: '#7A4A2A', cornerRadius: 4, rotation: 18 },
    { type: 'decoration', shape: 'circle', x: 312, y: 442, width: 14, height: 14,
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
    // Coin slot
    { type: 'decoration', shape: 'rect', x: 240, y: 348, width: 28, height: 6,
      fill: '#1A0612', cornerRadius: 3 },

    // Chute
    { type: 'chute', x: 130, y: 380, width: 100, height: 32,
      openingColor: '#3A1828', stroke: '#E87BA0', strokeWidth: 2,
      cornerRadius: 6, labelColor: '#FFC2D4' },

    // Tray with cute scallop look (rounded heavily)
    { type: 'tray', x: 60, y: 422, width: 240, height: 28,
      fill: '#FFFFFF', stroke: '#E87BA0',
      cornerRadius: 14 },

    // Crank (pink with white center)
    { type: 'crank', x: 314, y: 224, size: 36, accent: '#E87BA0',
      stroke: '#A04060', strokeWidth: 2,
      fillGradient: { type: 'radial', cx: 14, cy: 10, innerR: 0, outerR: 32,
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

    // Chute
    { type: 'chute', x: 130, y: 366, width: 100, height: 32,
      openingColor: '#1A0F06', stroke: '#3A2010', strokeWidth: 2,
      cornerRadius: 6, labelColor: '#FFB347' },

    // Tray
    { type: 'tray', x: 60, y: 408, width: 240, height: 36,
      fill: '#3A2010', stroke: '#1A0F06',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#6B4423' }, { offset: 1, color: '#2A1808' }] },
      cornerRadius: 6 },

    // Crank (brass)
    { type: 'crank', x: 314, y: 220, size: 36, accent: '#C9A14A',
      stroke: '#7A5F2A', strokeWidth: 2,
      fillGradient: { type: 'radial', cx: 14, cy: 10, innerR: 0, outerR: 32,
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

    // Chute
    { type: 'chute', x: 130, y: 384, width: 100, height: 32,
      openingColor: '#0A0608', stroke: '#E04830', strokeWidth: 2,
      cornerRadius: 6, labelColor: '#E04830' },

    // Tray
    { type: 'tray', x: 60, y: 426, width: 240, height: 28,
      fill: '#1A1F26', stroke: '#0F141B',
      fillGradient: { type: 'linear', coords: 'topToBottom',
        stops: [{ offset: 0, color: '#2A323C' }, { offset: 1, color: '#0A0E14' }] },
      cornerRadius: 6 },

    // Cat tail (curling from right side)
    { type: 'decoration', shape: 'rect', x: 312, y: 200, width: 8, height: 70,
      fill: '#5A6470', cornerRadius: 4, rotation: -20 },
    { type: 'decoration', shape: 'circle', x: 322, y: 200, width: 14, height: 14,
      fill: '#3A4250' },

    // Crank
    { type: 'crank', x: 314, y: 320, size: 34, accent: '#3E4854',
      stroke: '#1A1F26', strokeWidth: 2,
      fillGradient: { type: 'radial', cx: 12, cy: 10, innerR: 0, outerR: 30,
        stops: [{ offset: 0, color: '#7A8694' }, { offset: 0.6, color: '#3E4854' }, { offset: 1, color: '#1A1F26' }] },
      shadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetY: 2 } },
  ],
};

export const PRESETS = [TABBY_CAT, BUNNY_HOP, BEARS_DEN, NINJA_CAT];
