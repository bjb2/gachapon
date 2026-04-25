// Default prize library: the 694 Valkyrie X Truck chibis. Loaded on first
// visit by fetching `images/chibi_prizes.csv` (the same file the creator's
// CSV-import button consumes) and parsing it into prize objects.
//
// LEGACY_DEFAULT_PRIZE_IDS lets the boot seeder detect users who only have
// the old 8 SVG defaults — those records can be safely wiped + replaced with
// the chibi set without touching anyone who has imported their own library.

// IDs of the original 8 SVG-based default prizes (pre-Valkyrie). Used by the
// migration check in main.js / creator.js to recognize an untouched seed.
export const LEGACY_DEFAULT_PRIZE_IDS = new Set([
  'tanuki', 'neko', 'shiba', 'usagi', 'kappa', 'kitsune', 'oni', 'ryuu',
]);

const CSV_URL = './images/chibi_prizes.csv';

// Minimal RFC-4180-ish CSV parser (quoted fields, "" escapes, CRLF/LF
// tolerant). Mirrors the parser in src/creator/prize-csv.js but kept inline
// so the play-page bundle doesn't need to pull in creator code.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false, i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++;
      } else { field += c; i++; }
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

function rowsToPrizes(rows) {
  const [header, ...data] = rows;
  const idx = (name) => header.findIndex(h => (h || '').trim().toLowerCase() === name);
  const I = {
    id: idx('id'), name: idx('name'), rarity: idx('rarity'), flavor: idx('flavor'),
    type: idx('ballstyletype'), c1: idx('color1'), c2: idx('color2'), glow: idx('glow'),
    kind: idx('artkind'), source: idx('artsource'), value: idx('artvalue'),
  };
  const get = (r, k) => I[k] >= 0 ? (r[I[k]] || '').trim() : '';
  const out = [];
  data.forEach((r, i) => {
    if (!r.some(v => (v || '').trim())) return;
    const name = get(r, 'name');
    const rarity = get(r, 'rarity');
    if (!name || !rarity) return;
    const type = (get(r, 'type') || 'capsule').toLowerCase();
    const c1 = get(r, 'c1') || '#FFD166';
    const c2 = get(r, 'c2') || '#FF6B9D';
    const glow = get(r, 'glow') || null;
    const ballStyle = type === 'plain'
      ? { type: 'plain', color1: c1, glow }
      : { type: 'capsule', color1: c1, color2: c2, glow };
    out.push({
      id: get(r, 'id') || `prize-default-${i}`,
      name, rarity,
      flavor: get(r, 'flavor') || '',
      ballStyle,
      art: {
        kind: (get(r, 'kind') || 'svg').toLowerCase(),
        source: (get(r, 'source') || 'inline').toLowerCase(),
        value: get(r, 'value') || '',
      },
    });
  });
  return out;
}

export async function loadDefaultPrizes() {
  try {
    const resp = await fetch(CSV_URL);
    if (!resp.ok) throw new Error(`fetch ${CSV_URL}: ${resp.status}`);
    const text = await resp.text();
    return rowsToPrizes(parseCsv(text));
  } catch (err) {
    console.warn('[default-prizes] could not load chibi CSV; seeding empty pool', err);
    return [];
  }
}
