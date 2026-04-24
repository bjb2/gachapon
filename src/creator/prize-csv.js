// CSV import/export for prizes.
//
// Columns (header row is required):
//   id              Optional. Stable identifier; auto-generated if blank.
//   name            Required. Display name.
//   rarity          Required. Must match a rarity tier id currently in the library.
//   flavor          Optional. Flavor text shown on the reveal card.
//   ballStyleType   "capsule" | "plain"          (default: capsule)
//   color1          #rrggbb hex                  (default: #FFD166)
//   color2          #rrggbb hex                  (capsule only; default: #FF6B9D)
//   glow            #rrggbb or empty for no glow (default: empty)
//   artKind         "svg" | "image"              (default: svg)
//   artSource       "inline" | "url"             (default: inline)
//   artValue        SVG text, URL, or empty      (default: simple placeholder circle)
import { defaultBallStyle } from '../prizes/prize-schema.js';

const HEADER = [
  'id', 'name', 'rarity', 'flavor',
  'ballStyleType', 'color1', 'color2', 'glow',
  'artKind', 'artSource', 'artValue',
];

// ── CSV parser (quoted fields, escaped quotes, CRLF/LF tolerant) ─────────
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++;
      } else {
        field += c; i++;
      }
    } else {
      if (c === '"') { inQuotes = true; i++; }
      else if (c === ',') { row.push(field); field = ''; i++; }
      else if (c === '\r') { i++; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; }
      else { field += c; i++; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[,"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function isHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v); }

// ── Template download ────────────────────────────────────────────────────
export function buildTemplateCsv() {
  const examples = [
    ['', 'Cherry Cat',    'common', 'A sleepy cat with cherry markings.',      'capsule', '#FFE6F4', '#FF6B9D', '',         'svg', 'inline', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#FF6B9D"/></svg>'],
    ['', 'Forest Sprite', 'rare',   'Shy. Helpful. Smells faintly of moss.',   'plain',   '#7CB342', '',        '',         'svg', 'inline', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="#7CB342"/></svg>'],
    ['', 'Star Fragment', 'ultra',  'Warm to the touch. Sings when no one looks.', 'capsule', '#FFFBE8', '#FFD700', '#FFD700', 'svg', 'inline', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 61,40 97,40 68,62 79,96 50,75 21,96 32,62 3,40 39,40" fill="#FFD700"/></svg>'],
  ];
  const rows = [HEADER, ...examples];
  return rows.map(r => r.map(csvEscape).join(',')).join('\r\n') + '\r\n';
}

export function downloadTemplate() {
  const blob = new Blob([buildTemplateCsv()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gachapon-prizes-template.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
}

// ── CSV → prize objects ──────────────────────────────────────────────────
export function csvToPrizes(text, rarities) {
  const rows = parseCsv(text).filter(r => r.some(v => (v || '').trim() !== ''));
  if (rows.length < 2) throw new Error('CSV has no data rows.');
  const [header, ...dataRows] = rows;
  const columnIndex = (name) => header.findIndex(h => (h || '').trim().toLowerCase() === name.toLowerCase());

  for (const required of ['name', 'rarity']) {
    if (columnIndex(required) < 0) throw new Error(`CSV missing required column: ${required}`);
  }
  const rarityIds = new Set(rarities.map(r => r.id));
  const prizes = [];
  const errors = [];
  const now = Date.now();

  dataRows.forEach((r, i) => {
    const get = (name) => {
      const j = columnIndex(name);
      return j >= 0 ? (r[j] || '').trim() : '';
    };
    const rowNum = i + 2; // 1-indexed + header row
    const name = get('name');
    if (!name) { errors.push(`Row ${rowNum}: name is required.`); return; }

    const rarity = get('rarity');
    if (!rarityIds.has(rarity)) {
      errors.push(`Row ${rowNum}: rarity "${rarity}" is not in your rarity list (${[...rarityIds].join(', ')}).`);
      return;
    }

    const type = (get('ballStyleType') || 'capsule').toLowerCase();
    if (!['capsule', 'plain'].includes(type)) {
      errors.push(`Row ${rowNum}: ballStyleType must be "capsule" or "plain".`);
      return;
    }
    const def = defaultBallStyle();
    const color1 = get('color1') || def.color1;
    const color2 = get('color2') || def.color2;
    const glow = get('glow') || null;
    if (!isHex(color1)) { errors.push(`Row ${rowNum}: color1 must be #rrggbb (got "${color1}").`); return; }
    if (type === 'capsule' && !isHex(color2)) { errors.push(`Row ${rowNum}: color2 must be #rrggbb for capsule.`); return; }
    if (glow && !isHex(glow)) { errors.push(`Row ${rowNum}: glow must be #rrggbb or blank.`); return; }

    const artKind = (get('artKind') || 'svg').toLowerCase();
    const artSource = (get('artSource') || 'inline').toLowerCase();
    if (!['svg', 'image'].includes(artKind)) { errors.push(`Row ${rowNum}: artKind must be "svg" or "image".`); return; }
    if (!['inline', 'url'].includes(artSource)) { errors.push(`Row ${rowNum}: artSource must be "inline" or "url" (blob not supported for CSV).`); return; }
    const artValue = get('artValue') || '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#ddd"/></svg>';

    const id = get('id') || `prize-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`;
    const ballStyle = type === 'capsule'
      ? { type: 'capsule', color1, color2, glow }
      : { type: 'plain', color1, glow };

    prizes.push({
      id, name, rarity,
      flavor: get('flavor') || '',
      ballStyle,
      art: { kind: artKind, source: artSource, value: artValue },
    });
  });

  if (errors.length > 0 && prizes.length === 0) {
    throw new Error('Import aborted:\n' + errors.join('\n'));
  }
  return { prizes, errors };
}
