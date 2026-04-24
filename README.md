# gachapon ✦ capsule toy machine

An interactive, physics-driven Japanese capsule-toy machine that runs in the browser with no build step. Crank the handle, watch the balls tumble, click a dispensed capsule to reveal what's inside.

Also a **creator tool** for designing your own gachapon — build a rarity system and prize library, pick a chassis, and export a single self-contained HTML file you can host or share anywhere.

```
ガチャポン — CAPSULE TOY MACHINE
```

## Features

- **Matter.js physics** — balls jostle, cascade, and drop through a funnel + chute
- **Five chassis skins** — kawaii, noir, cyber, forest, and modern (ISUZU-inspired)
- **Two layouts** — dome and box, with different wall geometry and physics tuning
- **Per-prize ball styles** — classic two-tone capsule or single-color plain, with optional glow
- **Reveal modal** with rarity sparkles scaled to tier
- **Collection tracker** that pops the newest chip
- **Creator UI** with live-rendered iframe preview (edit a prize, see it appear in the machine)
- **Standalone HTML export** (~60 KB) — ship a single file, no server, no build
- **CSV import + template** for bulk prize authoring
- **Shared prize library** across all machines; global rarity tiers

No framework. No bundler. Just ES modules, Matter.js (CDN), and a tiny IndexedDB wrapper.

## Quick start

```bash
git clone https://github.com/bjb2/gachapon
cd gachapon
python -m http.server 8000
# then open http://localhost:8000/
```

Any static file server works — `npx serve`, `python -m http.server`, VS Code's Live Server, etc. The only hard requirement is serving over HTTP (not `file://`) so ES modules can load.

## Two entry points

### [`/index.html`](./index.html) — play

Cranks, balls, reveal cards. Five machines selectable via the nav bar or via `?machine=<id>` query param (`classic`, `noir`, `cyber`, `forest`, `modern`). Your collection persists across pulls within a session.

### [`/create.html`](./create.html) — build your own

Three panels, top to bottom:

1. **Rarities** — inline-editable table of tier ids (`common`, `rare`, `ultra`, or anything you invent). Each tier has a label, a pool weight (higher = more common), stars for the reveal card, and a list of sparkle emojis.
2. **Prizes** — the shared library. Every prize has a rarity, flavor text, a ball style, and art (paste SVG / upload file / remote URL). The prize form has two hex color pickers and a capsule/plain toggle. Buttons for downloading a CSV template and importing from CSV live in the panel header.
3. **Machine selector** (sticky right column) — live preview via iframe that re-renders when you change anything. Thumbnail row for the five skins, per-machine inline controls for brand label / ball count / turn count, and a big "Download HTML" button.

When you click export, the creator bundles every source module into a single HTML file with your prize library + rarities + chosen machine baked in as JSON. No external dependencies beyond the Matter.js CDN and Google Fonts — double-clickable, mailable, iframe-embeddable.

## Data formats

### JSON export/import (full backup)

```json
{
  "machines": [/* MachineDef[] */],
  "prizes":   [/* Prize[] */],
  "rarities": [/* RarityTier[] */]
}
```

Covers every custom machine, prize, and rarity. Overwrites by id on import.

### CSV import (prizes only)

Headers:

```
id, name, rarity, flavor, ballStyleType, color1, color2, glow, artKind, artSource, artValue
```

- `name` and `rarity` are required; `rarity` must match an existing rarity id.
- `id` blank = auto-generated; supplying an id lets you re-import and overwrite.
- `ballStyleType` is `capsule` (needs `color1` + `color2`) or `plain` (just `color1`).
- `glow` is a `#rrggbb` hex or blank.
- `artSource` supports `inline` (raw SVG in `artValue`) or `url`. Blob-source art can't travel via CSV — upload it through the prize form.

Grab the template via **Template ↓** in the Prizes header — ships with three example rows covering capsule, plain, and capsule-with-glow.

### Standalone HTML export

Single file, ~60–70 KB, containing:
- The full module graph collected from `standalone-boot.js`, with relative imports rewritten to absolute keys
- A runtime import-map bootstrap built from blob URLs (no bundler needed)
- Baseline classic CSS + the chosen skin's CSS (with `@import` expanded)
- The chosen machine, prize library, and rarity list as embedded JSON
- Any IndexedDB-backed blob art converted to inline SVG / data URIs

Depends only on Matter.js (CDN) and Google Fonts. Runs from any static host or the filesystem.

## Architecture

```
src/
├── main.js                     boot for /index.html
├── creator.js                  boot for /create.html
├── machine/
│   ├── Machine.js              orchestrator — wires core + physics + render + reveal
│   ├── template.js             DOM template (dome vs. box)
│   ├── controls.js             crank / refill / tray-ball event wiring
│   ├── dispense-flow.js        dispense + ball-click choreography
│   └── ball-style.js           apply per-prize ball style to the DOM tray ball
├── physics/
│   ├── geometry.js             single source of truth: machineDef → derived geometry + CSS vars
│   └── dome-physics.js         Matter.js setup (dome vs. box walls, funnel, chute)
├── render/
│   ├── dome-canvas.js          canvas draw loop (capsule + plain ball rendering)
│   ├── audio.js                WebAudio tone cues
│   └── sparkles.js             reveal-card emoji sparkles
├── reveal/                     reveal modal
├── collection/                 collection chip strip
├── core/                       pool builder, state, event bus, rarity lookup, color helpers
├── prizes/                     prize CRUD + schema + migration
├── rarities/                   global rarity tiers CRUD + schema
├── machines/                   machine-def CRUD + 5 default chassis
├── creator/                    creator-page UI (editors, CSV, exporter, standalone-boot)
├── skins/                      5 visual skins (CSS only), scoped under html[data-skin]
└── data/default-svgs/          seed prize art
```

### Key patterns

- **`html[data-skin="X"]` scoping** — all skins load at once; `<html>` attribute picks which one applies. Set synchronously in `<head>` to prevent FOUC.
- **Version-aware seeding** — `DEFAULT_MACHINES` entries carry a `version`; the seeder upserts anything whose stored version is lower. Bump the version to propagate changes to existing users without a manual DB clear.
- **Chassis-independent prizes** — a prize carries its own `rarity` + `ballStyle`, not a `machineId`. The same prize library pours into any chassis.
- **Runtime ES-module bundling** — the exporter walks the import graph, rewrites `./foo.js` specifiers to absolute keys, and ships blob URLs through an import map. Preserves modularity without a build step.
- **iframe live preview** — the creator embeds `/index.html?machine=X&embed=1` via `<iframe>` and shares the parent's IndexedDB. Skin CSS scoping stays inside the iframe; editor CSS stays outside; `iframe.src = newUrl` reloads the preview when the user edits a prize.

## Storage

Everything persists in an IndexedDB database called `gachapon` with object stores:

- `machines` — MachineDef records (keyPath `id`)
- `prizes` — Prize records (keyPath `id`)
- `rarities` — RarityTier records (keyPath `id`)
- `blobs` — uploaded image/SVG binaries (keyed by a `blob-…` string referenced from prize art)
- `state` — misc key/value

If something gets into a weird state, the creator's "Reset to defaults" button clears all stores and reseeds. You can also nuke the database from DevTools: **Application → Storage → IndexedDB → gachapon → Delete database**.

## Browser requirements

- ES modules + import maps (Chrome 89+, Firefox 108+, Safari 16.4+)
- IndexedDB (everywhere)
- `<input type="color">` for the prize form's color pickers

Tested in current Chrome, Firefox, and Safari. Mobile layouts collapse the grid to a single column.

## Development notes

- No package.json, no build. Edit source → save → reload.
- During development, `create.html` uses a cache-busting dynamic import to force a fresh `creator.js` fetch on every page load. Remove the timestamp query for production.
- Running the creator also writes to your IndexedDB — if you're iterating on schema, the "Reset to defaults" button and the version-aware seeder are your friends.

## License

MIT — see [LICENSE](./LICENSE).
