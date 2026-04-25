---
name: gachapon-preset
description: Build a new vending-machine preset for the gachapon WYSIWYG designer. TRIGGER when the user asks to "create / design / add a preset for X machine", "make a preset based on Y", or "replicate Z chassis as a preset". Reads the existing schema + renderer, references the existing presets for style, produces a complete customMachine record (validated: exactly 1 hopper + 1 chute), and appends it to src/designer/presets.js's PRESETS array.
---

# Gachapon Preset Skill

You are creating a new preset machine for the WYSIWYG designer in this repo. Presets show up in design.html's "Start from preset" gallery; clicking one clones it into a fresh draft.

## What to read first (every time)

These files define the data model + capabilities. Skim before producing a preset:

- `src/designer/schema.js` — component types, valid hopper variants (`dome`, `half-dome`, `box`, `funnel`, `cylinder`, `hourglass`), `SINGLETON_TYPES`, `validateCustomMachine` rules
- `src/machine/custom-svg-renderer.js` — what each component supports at render time. Key fields beyond x/y/width/height: `fillGradient` (linear or radial with stops), `shadow` (color/blur/offsetX/offsetY), `opacity`, `cornerRadius`, `strokeWidth`, font fields for text + brand-strip
- `src/machine/custom-physics.js` — hopper variant → Matter.js wall geometry. Note `MAX_FUNNEL_DROP = 40` so the chute marker is purely cosmetic; physics always builds a tight funnel right under the hopper bottom
- `src/designer/presets.js` — the existing 10 presets are the bar. **Read CYBER_SYNTH and KENISY first** — they show the right scale and component density for compact + rich, respectively

## Rules that get the result right

### Composition rules

- **Components are z-ordered by array position.** Background → chassis body → hopper → "decals on the glass" (brand wordmark, reflections) → controls → tray. Decorations placed AFTER the hopper render on top of the live balls (use this for sashes, glass highlights). Decorations placed BEFORE render behind the window (use for static "capsule" backdrops the live balls cover up in play mode).
- **Required components**: exactly one `hopper` and exactly one `chute`. Validation refuses to save / test-drive otherwise.
- **Other singletons** (`crank`, `brand-strip`, `led`, `turn-dots`, `tray`) have a max of 1 each. `decoration` is unlimited.
- **Cranks must sit inside the chassis body**, not hanging off the right edge. The arrow icon is added automatically — set `accent`, `stroke`, `iconColor` (contrasts the accent), optionally a radial `fillGradient` for the chrome look.
- **Tray height must accommodate the dispense ball**. Default ball diameter is ~28 px; trays under 40 tall make the dispensed ball look like a dot. Aim for 50–70 px.
- **Chute marker is cosmetic** in design view (renders as a small dashed outline) and hidden in play. Place it close to the hopper bottom (within ~10 px) so the design view reads cleanly.

### Scale rules (this is where the agent kept missing)

- **Canvas is sized to the actual content**, not 600 px every time. Add up: dome height + body height + tray height + small padding. CYBER fits in 360 × 420.
- **Body height = sum of its widget rows + padding**. Don't leave 50+ px of dead space anywhere. The visible row layout for a typical chassis: brand strip (24) + LED row (22) + lucky-ball + dots + crank row (~50) + bottom padding (~20) ≈ 220 px body.
- **Dome proportions for half-dome**: width:height roughly 7:4. Cap arc radius is `min(width/2, height)` capped at `height/2` (the renderer enforces this so the arch doesn't go above y=0 — but the visible shape is the upper-half-ellipse cap).
- **Floor shadow** belongs RIGHT under the tray (within 10 px), not 60+ px below.

### Visual richness rules

- **Use gradients for body shells, brand strips, cranks, trays.** Flat fills read as wireframes. Linear top-to-bottom or diagonal works for chassis; radial with off-center origin (e.g., `cx: 18, cy: 14` on a 60 px crank) creates the chrome highlight.
- **Add shadows liberally**. Body shells get 12–18 px blur, controls get 4–8 px, accents get glow shadows in their own color.
- **Layer for depth**. Dark frame → mid plate → highlight strip → contents. See KENISY's window assembly for the pattern.
- **Static backdrops in the window**. For dome / box hoppers with a translucent fill, scatter a few decoration circles inside the window bounds BEFORE the hopper component. They render behind the window glass; live balls cover them in play mode. Adds depth to the design view.

## Process

1. Read the user's reference (image, description, real machine name). Identify: hopper variant, color palette, brand wordmark text + style, distinctive chassis features.
2. Read `src/designer/presets.js` and pick the closest existing preset by silhouette. Use it as a structural template.
3. Sketch the layout on paper (or in your head): canvas dimensions, hopper bbox, body bbox, tray bbox. Verify they stack cleanly with no gaps.
4. Write the preset constant. Naming: `SCREAMING_SNAKE_CASE`, descriptive (`KENISY`, `BEARS_DEN`, `MID_CENTURY_DINER`).
5. Append to the `PRESETS` array at the bottom of the file.
6. Validate: `node --check src/designer/presets.js` (syntax) and `node -e "import('file:///.../presets.js').then(m => console.log(m.PRESETS.length, m.PRESETS.map(p=>p.name)))"` (structure).
7. Tell the user what you added with one-sentence-per-feature, no full code dump.

## Component cookbook

### Hopper (required, exactly 1)

```js
{ type: 'hopper', variant: 'half-dome', x: 60, y: 22, width: 230, height: 130,
  wallColor: 'rgba(0,217,255,0.7)', wallThickness: 3,
  windowFill: 'rgba(0,28,48,0.65)' }
```

Variants: `dome` (full ellipse, only for "face frame" decorative use), `half-dome` (arch window — the standard chassis dome cap), `box` (rounded rect — the standard window machine), `cylinder` (tall pill), `funnel` (cone), `hourglass` (narrow waist).

### Chute (required, exactly 1)

```js
{ type: 'chute', x: 150, y: 154, width: 60, height: 18,
  openingColor: '#020408', stroke: 'rgba(0,217,255,0.32)', strokeWidth: 2,
  cornerRadius: 4, labelColor: '#00D9FF' }
```

Keep small (60 × 18 typical). `labelColor` becomes the dashed-outline color in the designer.

### Brand strip

```js
{ type: 'brand-strip', x: 90, y: 182, width: 160, height: 24,
  text: '◈ SYNTH-X 404 ◈', font: 'Orbitron', fontWeight: 'bold',
  fontSize: 9, fg: '#00D9FF', bg: 'rgba(0,0,0,0)',
  cornerRadius: 3, stroke: 'rgba(0,217,255,0.45)', strokeWidth: 1,
  letterSpacing: 0.18,
  shadow: { color: 'rgba(0,217,255,0.6)', blur: 8 } }
```

### Crank with chrome look

```js
{ type: 'crank', x: 226, y: 232, size: 56, accent: '#0A1018',
  stroke: 'rgba(0,217,255,0.55)', strokeWidth: 3, iconColor: '#00D9FF',
  fillGradient: { type: 'radial', cx: 20, cy: 16, innerR: 0, outerR: 50,
    stops: [
      { offset: 0, color: 'rgba(0,217,255,0.25)' },
      { offset: 0.45, color: '#0A1018' },
      { offset: 1, color: '#050810' },
    ] },
  shadow: { color: 'rgba(0,217,255,0.4)', blur: 14, offsetY: 4 } }
```

### Decoration shapes available

`rect` (cornerRadius), `circle`, `ellipse`, `triangle` (rotation rotates around center), `line`, `text` (font, fontSize, fontWeight, fontStyle, letterSpacing, fill), `polygon` (`points: [{x, y}, ...]`).

### Static "capsules" pattern (decorative balls behind hopper)

For window machines that should look full even in design view, scatter circles inside the window bounds BEFORE the hopper component:

```js
// each entry: [x, y, diameter, topColor, bottomColor]
...staticCapsules([
  [86, 90, 22, '#FFB6C1', '#E08CA0'],
  [120, 110, 24, '#FFD966', '#C8A030'],
  ...
])
```

See KENISY for the helper. Live balls cover them in play.

## What not to do

- Don't use canvas height > 540 unless the chassis genuinely needs it. Kenisy at 600 was wrong.
- Don't leave gaps > 30 px between components vertically. If you have a gap, the body is too tall — shrink it.
- Don't use only flat fills. Every chassis surface should have either a gradient or a layered highlight.
- Don't put the crank outside the body bounds. It must visually sit on the chassis.
- Don't make the chute decorative — it's a hidden marker. Use a regular decoration if you want a visible "exit alcove".
