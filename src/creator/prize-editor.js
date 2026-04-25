// Prize list view: shared library (no machine column). Search + rarity filter,
// edit / duplicate / delete actions per row.
import { getAllPrizes, deletePrize, putPrize } from '../prizes/prize-store.js';
import { renderPrizeArt } from '../prizes/prize-render.js';
import { findTier } from '../core/rarity.js';

export class PrizeEditor {
  constructor(root, { rarities, onEdit, onNew, onDownloadTemplate, onImportCsv }) {
    this.root = root;
    this.rarities = rarities;
    this.onEdit = onEdit;
    this.onNew = onNew;
    this.onDownloadTemplate = onDownloadTemplate || null;
    this.onImportCsv = onImportCsv || null;
    this.search = '';
    this.rarityFilter = '';
    this.page = 1;
    this.pageSize = 50;
    this.render();
  }

  async refresh() {
    this.prizes = await getAllPrizes();
    this.render();
  }

  setRarities(rarities) {
    this.rarities = rarities;
    this.render();
  }

  render() {
    this.root.innerHTML = `
      <div class="panel-header">
        <h2>PRIZES</h2>
        <div class="prize-header-actions">
          <button class="btn ghost" data-csv-template title="Download a CSV template with example rows">Template ↓</button>
          <button class="btn ghost" data-csv-import title="Import prizes from a CSV file">Import CSV</button>
          <input type="file" data-csv-file accept=".csv,text/csv" style="display:none">
          <button class="btn" data-new>+ New Prize</button>
        </div>
      </div>
      <div class="toolbar">
        <input type="text" placeholder="Search by name..." data-search value="${escapeAttr(this.search)}">
        <select data-rarity-filter>
          <option value="">All rarities</option>
          ${this.rarities.map(t => `<option value="${escapeAttr(t.id)}">${escapeHtml(t.label)}</option>`).join('')}
        </select>
      </div>
      <table class="prize-table">
        <thead><tr><th></th><th>Name</th><th>Rarity</th><th>Ball</th><th></th></tr></thead>
        <tbody data-tbody><tr><td colspan="5" class="muted">Loading...</td></tr></tbody>
      </table>
      <div class="prize-pager" data-pager></div>
    `;

    this.root.querySelector('[data-new]').addEventListener('click', () => this.onNew && this.onNew());
    this.root.querySelector('[data-csv-template]').addEventListener('click', () => this.onDownloadTemplate && this.onDownloadTemplate());
    const csvFile = this.root.querySelector('[data-csv-file]');
    this.root.querySelector('[data-csv-import]').addEventListener('click', () => csvFile.click());
    csvFile.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f && this.onImportCsv) this.onImportCsv(f);
      e.target.value = ''; // allow selecting the same file again
    });
    const searchEl = this.root.querySelector('[data-search]');
    searchEl.addEventListener('input', (e) => { this.search = e.target.value; this.page = 1; this._renderRows(); });
    const rarityEl = this.root.querySelector('[data-rarity-filter]');
    rarityEl.value = this.rarityFilter;
    rarityEl.addEventListener('change', (e) => { this.rarityFilter = e.target.value; this.page = 1; this._renderRows(); });

    if (this.prizes) this._renderRows();
    else this.refresh();
  }

  _renderRows() {
    const tbody = this.root.querySelector('[data-tbody]');
    const pager = this.root.querySelector('[data-pager]');
    const filtered = (this.prizes || []).filter(p => {
      if (this.search && !p.name.toLowerCase().includes(this.search.toLowerCase())) return false;
      if (this.rarityFilter && p.rarity !== this.rarityFilter) return false;
      return true;
    });
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="muted">No prizes.</td></tr>`;
      if (pager) pager.innerHTML = '';
      return;
    }
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.page > totalPages) this.page = totalPages;
    if (this.page < 1) this.page = 1;
    const start = (this.page - 1) * this.pageSize;
    const pageItems = filtered.slice(start, start + this.pageSize);
    this._renderPager(pager, filtered.length, totalPages);
    tbody.innerHTML = pageItems.map(p => {
      const tier = findTier(this.rarities, p.rarity);
      const ballSwatch = _ballSwatchHtml(p.ballStyle);
      return `
        <tr data-id="${escapeAttr(p.id)}">
          <td><span class="prize-thumb-wrap" data-thumb></span></td>
          <td>${escapeHtml(p.name)}</td>
          <td><span class="rarity-pill ${escapeAttr(p.rarity)}">${escapeHtml(tier.label)}</span></td>
          <td>${ballSwatch}</td>
          <td>
            <button class="btn ghost" data-edit>Edit</button>
            <button class="btn ghost" data-dup>Dup</button>
            <button class="btn danger" data-del>Del</button>
          </td>
        </tr>
      `;
    }).join('');

    for (const tr of tbody.querySelectorAll('tr[data-id]')) {
      const id = tr.dataset.id;
      const prize = pageItems.find(p => p.id === id);
      if (prize) renderPrizeArt(tr.querySelector('[data-thumb]'), prize);
      tr.querySelector('[data-edit]').addEventListener('click', () => this.onEdit && this.onEdit(prize));
      tr.querySelector('[data-dup]').addEventListener('click', async () => {
        const copy = { ...prize, id: `${prize.id}-copy-${Date.now().toString(36)}`, name: `${prize.name} (copy)` };
        await putPrize(copy);
        this.refresh();
      });
      tr.querySelector('[data-del]').addEventListener('click', async () => {
        if (!confirm(`Delete "${prize.name}"?`)) return;
        await deletePrize(prize.id);
        this.refresh();
      });
    }
  }

  _renderPager(host, total, totalPages) {
    if (!host) return;
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, total);
    host.innerHTML = `
      <span>Showing <strong>${start}-${end}</strong> of <strong>${total}</strong></span>
      <span class="pager-controls">
        <button data-pg-first ${this.page === 1 ? 'disabled' : ''}>« First</button>
        <button data-pg-prev ${this.page === 1 ? 'disabled' : ''}>‹ Prev</button>
        <span>Page</span>
        <input type="number" min="1" max="${totalPages}" value="${this.page}" data-pg-jump>
        <span>of ${totalPages}</span>
        <button data-pg-next ${this.page === totalPages ? 'disabled' : ''}>Next ›</button>
        <button data-pg-last ${this.page === totalPages ? 'disabled' : ''}>Last »</button>
      </span>
    `;
    const go = (n) => { this.page = Math.max(1, Math.min(totalPages, n)); this._renderRows(); };
    host.querySelector('[data-pg-first]').addEventListener('click', () => go(1));
    host.querySelector('[data-pg-prev]').addEventListener('click', () => go(this.page - 1));
    host.querySelector('[data-pg-next]').addEventListener('click', () => go(this.page + 1));
    host.querySelector('[data-pg-last]').addEventListener('click', () => go(totalPages));
    const jump = host.querySelector('[data-pg-jump]');
    jump.addEventListener('change', (e) => go(parseInt(e.target.value, 10) || 1));
  }
}

function _ballSwatchHtml(style) {
  if (!style) return '<span class="muted">—</span>';
  if (style.type === 'capsule') {
    const c1 = style.color1 || '#ccc';
    const c2 = style.color2 || '#fff';
    return `<span class="ball-swatch" title="capsule" style="background: linear-gradient(to bottom, ${c1} 0%, ${c1} 49%, rgba(255,255,255,0.5) 50%, ${c2} 51%, ${c2} 100%)"></span>`;
  }
  const c = style.color1 || '#ccc';
  return `<span class="ball-swatch" title="plain" style="background: radial-gradient(circle at 35% 30%, #fff, ${c})"></span>`;
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function escapeAttr(s) { return escapeHtml(s); }
