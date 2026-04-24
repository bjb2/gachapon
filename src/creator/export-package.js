// Single-file HTML exporter.
//
// Given a machine def + its prizes, produces a standalone .html string that:
//   - inlines every JS module from the import graph (walked from standalone-boot.js)
//     using a runtime blob-URL import map — no build step needed
//   - inlines the machine's skin CSS (with @import expansion)
//   - embeds the machine + prizes as a JSON <script> tag
//   - converts any IndexedDB-backed blob art into inline SVG text or data URIs
//
// The resulting file depends only on two CDN scripts (matter.js, Google Fonts)
// and runs from any static host — or even double-clicked from disk.
import { getBlob } from '../prizes/prize-store.js';

const ENTRY = 'src/creator/standalone-boot.js';

// Matches import specifiers in: `from '...'`, bare `import '...'`, dynamic `import('...')`.
// Negative lookbehind avoids matching `.from(` method calls or `_import` identifiers.
const JS_IMPORT_RE = /(?<![.\w])(?:\bfrom\s+|\bimport\s*\(?\s*)(['"])([^'"\n]+)\1/g;

// Matches `@import url('...')` / `@import '...'` in CSS.
const CSS_IMPORT_RE = /@import\s+(?:url\()?\s*['"]?([^'")]+)['"]?\s*\)?\s*;/g;

// Resolve a relative specifier against a module key.
function resolvePath(baseKey, spec) {
  if (!spec.startsWith('./') && !spec.startsWith('../')) return spec;
  const parts = baseKey.split('/').slice(0, -1);
  for (const p of spec.split('/')) {
    if (p === '.') continue;
    if (p === '..') parts.pop();
    else parts.push(p);
  }
  return parts.join('/');
}

async function fetchText(relPath) {
  const resp = await fetch('./' + relPath);
  if (!resp.ok) throw new Error(`fetch ${relPath}: ${resp.status}`);
  return resp.text();
}

// Walk the import graph from ENTRY, returning { [key]: rewrittenSource }.
async function collectModules() {
  const out = {};
  const queue = [ENTRY];
  while (queue.length) {
    const key = queue.shift();
    if (out[key] !== undefined) continue;
    const raw = await fetchText(key);

    // Rewrite each relative specifier to the absolute key it resolves to.
    const rewritten = raw.replace(JS_IMPORT_RE, (m, q, spec) => {
      if (!spec.startsWith('./') && !spec.startsWith('../')) return m;
      const abs = resolvePath(key, spec);
      return m.replace(`${q}${spec}${q}`, `${q}${abs}${q}`);
    });
    out[key] = rewritten;

    // Enqueue transitive deps.
    JS_IMPORT_RE.lastIndex = 0;
    let mm;
    while ((mm = JS_IMPORT_RE.exec(raw)) !== null) {
      const spec = mm[2];
      if (!spec.startsWith('./') && !spec.startsWith('../')) continue;
      queue.push(resolvePath(key, spec));
    }
  }
  return out;
}

// Inline a CSS file, recursively resolving @imports (depth-first, left-to-right).
async function inlineCss(cssPath) {
  const raw = await fetchText(cssPath);
  // Materialize matches before any await so recursive calls can't clobber
  // shared regex state.
  const matches = [...raw.matchAll(CSS_IMPORT_RE)];
  let out = '';
  let lastIndex = 0;
  for (const m of matches) {
    out += raw.slice(lastIndex, m.index);
    out += '\n/* --- inlined from ' + m[1] + ' --- */\n';
    out += await inlineCss(resolvePath(cssPath, m[1]));
    lastIndex = m.index + m[0].length;
  }
  out += raw.slice(lastIndex);
  return out;
}

function blobToDataUri(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// Replace any blob-source art with self-contained inline SVG text or data URIs.
async function inlineBlobArt(prize) {
  if (!prize.art || prize.art.source !== 'blob') return prize;
  const blob = await getBlob(prize.art.value);
  if (!blob) return { ...prize, art: { kind: 'svg', source: 'inline', value: '' } };
  if (prize.art.kind === 'svg') {
    const text = await blob.text();
    return { ...prize, art: { kind: 'svg', source: 'inline', value: text } };
  }
  const uri = await blobToDataUri(blob);
  return { ...prize, art: { kind: 'image', source: 'url', value: uri } };
}

// JSON-embed a value inside a <script> tag safely: escape `</` so a stray
// `</script>` inside string data can't close the containing element.
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/**
 * Build the full HTML string for a single-file gachapon package.
 */
export async function buildExportHtml({ machine, prizes, rarities }) {
  if (!rarities || rarities.length === 0) throw new Error('rarities list is required');
  const modules = await collectModules();
  // Classic is the baseline — its rules are unscoped and every other skin
  // overrides them under `html[data-skin="X"]`. Inline classic first, then
  // the chosen skin if it differs.
  const skin = machine.skin || 'classic';
  const classicCss = await inlineCss('src/skins/classic/index.css');
  const skinCss = skin === 'classic'
    ? classicCss
    : classicCss + '\n\n' + await inlineCss(`src/skins/${skin}/index.css`);
  const inlinedPrizes = await Promise.all(prizes.map(inlineBlobArt));

  const payload = { machine, prizes: inlinedPrizes, rarities };
  const modulesJson = safeJson(modules);
  const payloadJson = safeJson(payload);
  const title = `${machine.name} · Gachapon`;

  return `<!DOCTYPE html>
<html lang="en" data-skin="${esc(skin)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+Rounded+1c:wght@400;700;900&family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
${skinCss}
.made-with {
  margin-top: 28px;
  text-align: center;
  font-family: 'DotGothic16', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  color: rgba(0,0,0,0.4);
}
.made-with a { color: inherit; text-decoration: none; border-bottom: 1px dotted currentColor; }
.made-with a:hover { color: #FF6B9D; }
</style>
</head>
<body>
  <h1 class="site-title">${esc(machine.brandLabel || machine.name)}</h1>
  <p class="site-sub">CAPSULE TOY MACHINE</p>

  <div id="machineWrap"></div>

  <p class="hint-line" id="hintLine"></p>

  <div class="collection-wrap" id="collectionWrap" style="display:none">
    <div class="collection-label">YOUR COLLECTION</div>
    <div class="collection-chips" data-collection-chips></div>
  </div>

  <p class="made-with">
    Built with <a href="https://github.com/bjb2/gachapon" target="_blank" rel="noopener">bjb2/gachapon</a>
  </p>

  <script type="application/json" id="gacha-data">${payloadJson}</script>
  <script type="application/json" id="gacha-modules">${modulesJson}</script>
  <script>
    // Turn each inlined module source into a blob-URL, wire them together via
    // an import map, then kick off the entry module. This preserves the original
    // module graph without needing a bundler.
    (function() {
      var modules = JSON.parse(document.getElementById('gacha-modules').textContent);
      var urls = {};
      Object.keys(modules).forEach(function(key) {
        urls[key] = URL.createObjectURL(new Blob([modules[key]], { type: 'text/javascript' }));
      });
      var imap = document.createElement('script');
      imap.type = 'importmap';
      imap.textContent = JSON.stringify({ imports: urls });
      document.head.appendChild(imap);

      var entry = document.createElement('script');
      entry.type = 'module';
      entry.src = urls['${ENTRY}'];
      document.head.appendChild(entry);
    })();
  </script>
</body>
</html>
`;
}

/**
 * Trigger a download of the built HTML.
 */
export async function downloadExport({ machine, prizes, rarities }) {
  const html = await buildExportHtml({ machine, prizes, rarities });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = (machine.name || 'gachapon').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gachapon';
  a.href = url;
  a.download = `${slug}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
}
