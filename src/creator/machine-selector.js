// "Character selector" machine picker for the creator UI.
//
// Live preview is served via <iframe src="./index.html?machine=X">. The iframe
// shares the parent's IndexedDB (same origin), so it renders the user's current
// prize library using the real Machine code — we don't re-implement rendering
// or skin scoping inside the creator page.
//
// Thumbnail row below swaps the iframe src. Inline customization (brand label /
// pool size / turns) persists to IDB and reloads the iframe so changes show up
// immediately.
import { getAllMachines, putMachine } from '../machines/machine-store.js';
import { MAX_POOL_SIZE, MIN_POOL_SIZE } from '../machines/default-machines.js';

export class MachineSelector {
  constructor(root, { onExport }) {
    this.root = root;
    this.onExport = onExport || (() => {});
    this.machines = [];
    this.selectedId = null;
  }

  async refresh() {
    const result = await getAllMachines();
    this.machines = Array.isArray(result) ? result : [];
    if (!this.selectedId || !this.machines.find(m => m.id === this.selectedId)) {
      this.selectedId = this.machines[0]?.id || null;
    }
    this._render();
  }

  reloadPreview() {
    const iframe = this.root.querySelector('[data-preview-frame]');
    if (iframe) iframe.src = this._previewUrl();
  }

  _previewUrl() {
    if (!this.selectedId) return 'about:blank';
    // embed=1 → index.html hides its nav/title chrome.
    // t=... → cache-bust so iframe picks up IDB changes on reload.
    return `./index.html?machine=${encodeURIComponent(this.selectedId)}&embed=1&t=${Date.now()}`;
  }

  _render() {
    this.root.innerHTML = `
      <div class="panel-header">
        <h2>MACHINE</h2>
        <span class="muted">Pick your chassis</span>
      </div>
      <div class="selector-stage">
        <iframe class="selector-preview-frame" data-preview-frame
                src="${this._previewUrl()}"
                title="Live machine preview"
                loading="eager"></iframe>
      </div>
      <div class="selector-thumbs" data-thumbs></div>
      <div class="selector-meta" data-meta></div>
      <button class="btn primary selector-export" data-export>↓ Export as HTML</button>
    `;
    this._renderThumbs();
    this._renderMeta();
    this.root.querySelector('[data-export]').addEventListener('click', () => {
      const m = this._selected();
      if (m) this.onExport(m);
    });
  }

  _selected() {
    return this.machines.find(m => m.id === this.selectedId) || this.machines[0];
  }

  _renderThumbs() {
    const host = this.root.querySelector('[data-thumbs]');
    host.innerHTML = '';
    for (const m of this.machines) {
      const thumb = document.createElement('button');
      thumb.className = 'selector-thumb' + (m.id === this.selectedId ? ' active' : '');
      thumb.type = 'button';
      thumb.dataset.id = m.id;
      thumb.innerHTML = `
        <div class="selector-thumb-preview selector-thumb-${esc(m.skin || 'classic')}">
          <div class="selector-thumb-dot" style="background:${_skinAccent(m.skin)}"></div>
        </div>
        <div class="selector-thumb-label">${esc(m.skin || m.id)}</div>
      `;
      thumb.addEventListener('click', () => this._select(m.id));
      host.appendChild(thumb);
    }
  }

  _renderMeta() {
    const host = this.root.querySelector('[data-meta]');
    const m = this._selected();
    if (!m) { host.innerHTML = '<div class="muted">No machine selected.</div>'; return; }
    const poolSize = clamp(m.poolSize ?? 15, MIN_POOL_SIZE, MAX_POOL_SIZE);
    host.innerHTML = `
      <div class="selector-name">${esc(m.name)}</div>
      <div class="selector-controls">
        <label class="inline-field">
          <span>Brand label</span>
          <input type="text" data-field="brandLabel" value="${esc(m.brandLabel || '')}">
        </label>
        <label class="inline-field narrow">
          <span>Balls</span>
          <input type="number" data-field="poolSize" min="${MIN_POOL_SIZE}" max="${MAX_POOL_SIZE}" value="${poolSize}">
        </label>
        <label class="inline-field narrow">
          <span>Turns</span>
          <input type="number" data-field="turnsNeeded" min="1" max="8" value="${m.controls?.turnsNeeded ?? 3}">
        </label>
      </div>
    `;
    const bind = (fieldName) => {
      const input = host.querySelector(`[data-field="${fieldName}"]`);
      if (!input) return;
      const commit = async () => {
        if (fieldName === 'poolSize') {
          const n = clamp(Number(input.value) || 15, MIN_POOL_SIZE, MAX_POOL_SIZE);
          input.value = n;
          m.poolSize = n;
        } else if (fieldName === 'turnsNeeded') {
          const n = clamp(Number(input.value) || 3, 1, 8);
          input.value = n;
          m.controls = { ...(m.controls || {}), turnsNeeded: n };
        } else if (fieldName === 'brandLabel') {
          m.brandLabel = String(input.value);
        }
        await putMachine(m);
        this.reloadPreview();
      };
      input.addEventListener('change', commit);
      input.addEventListener('blur', commit);
    };
    bind('brandLabel');
    bind('poolSize');
    bind('turnsNeeded');
  }

  _select(id) {
    if (id === this.selectedId) return;
    this.selectedId = id;
    for (const t of this.root.querySelectorAll('.selector-thumb')) {
      t.classList.toggle('active', t.dataset.id === id);
    }
    this._renderMeta();
    this.reloadPreview();
  }
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function _skinAccent(skin) {
  switch (skin) {
    case 'classic': return '#FF6B9D';
    case 'noir':    return '#F7B731';
    case 'cyber':   return '#00D9FF';
    case 'forest':  return '#7CB342';
    case 'modern':  return '#FFB8D4';
    default:        return '#999999';
  }
}
