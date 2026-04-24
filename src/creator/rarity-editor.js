// Global rarity-tier editor. Inline-editable table: label, weight, stars,
// sparkle count, sparkle emojis. Add / delete tiers.
//
// Emits `onChange` after every persisted change so sibling panels (prize-form,
// prize-editor) can refresh their rarity dropdowns / pills.
import { getAllRarities, putRarity, deleteRarity, bulkPutRarities } from '../rarities/rarity-store.js';
import { defaultRarity, validateRarity } from '../rarities/default-rarities.js';

export class RarityEditor {
  constructor(root, { onChange } = {}) {
    this.root = root;
    this.onChange = onChange || (() => {});
    this.rarities = [];
  }

  async refresh() {
    this.rarities = await getAllRarities();
    this._render();
  }

  _render() {
    this.root.innerHTML = `
      <div class="panel-header">
        <h2>RARITIES</h2>
        <button class="btn" data-add>+ Add Tier</button>
      </div>
      <p class="muted rarity-intro">
        Shared across all prizes and machines. Weight = relative chance to show up in the pool
        (higher = more common). Stars and sparkle emojis show on the reveal card.
      </p>
      <table class="rarity-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Label</th>
            <th>Weight</th>
            <th>Stars</th>
            <th>Sparkles</th>
            <th>Emojis</th>
            <th></th>
          </tr>
        </thead>
        <tbody data-tbody></tbody>
      </table>
    `;
    const tbody = this.root.querySelector('[data-tbody]');
    if (this.rarities.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="muted">No rarity tiers. Add one to get started.</td></tr>`;
    } else {
      for (const r of this.rarities) tbody.appendChild(this._rowFor(r));
    }
    this.root.querySelector('[data-add]').addEventListener('click', () => this._addNew());
  }

  _rowFor(r) {
    const tr = document.createElement('tr');
    tr.dataset.id = r.id;
    tr.innerHTML = `
      <td><code>${esc(r.id)}</code></td>
      <td><input type="text" data-field="label" value="${esc(r.label)}"></td>
      <td><input type="number" data-field="weight" min="0" step="1" value="${r.weight}"></td>
      <td><input type="text" data-field="stars" value="${esc(r.stars)}"></td>
      <td><input type="number" data-field="sparkleCount" min="0" step="1" value="${r.sparkleCount}"></td>
      <td><input type="text" data-field="sparkleEmojis" value="${esc((r.sparkleEmojis || []).join(' '))}" placeholder="✨ ⭐ 💫"></td>
      <td><button class="btn danger" data-del>Delete</button></td>
    `;
    for (const input of tr.querySelectorAll('input[data-field]')) {
      input.addEventListener('change', () => this._save(tr));
      input.addEventListener('blur',   () => this._save(tr));
    }
    tr.querySelector('[data-del]').addEventListener('click', () => this._delete(r));
    return tr;
  }

  async _save(tr) {
    const id = tr.dataset.id;
    const existing = this.rarities.find(r => r.id === id);
    if (!existing) return;
    const updated = {
      ...existing,
      label: tr.querySelector('[data-field="label"]').value,
      weight: Math.max(0, Number(tr.querySelector('[data-field="weight"]').value) || 0),
      stars: tr.querySelector('[data-field="stars"]').value,
      sparkleCount: Math.max(0, Number(tr.querySelector('[data-field="sparkleCount"]').value) || 0),
      sparkleEmojis: tr.querySelector('[data-field="sparkleEmojis"]').value
        .split(/\s+/)
        .map(s => s.trim())
        .filter(Boolean),
    };
    const v = validateRarity(updated);
    if (!v.ok) { alert('Invalid rarity:\n' + v.errors.join('\n')); return; }
    await putRarity(updated);
    this.rarities = this.rarities.map(r => r.id === id ? updated : r);
    this.onChange(this.rarities);
  }

  async _delete(r) {
    if (this.rarities.length <= 1) { alert('Keep at least one rarity tier.'); return; }
    if (!confirm(`Delete rarity "${r.label}"? Prizes still referencing it will keep the id but render with fallback styling.`)) return;
    await deleteRarity(r.id);
    await this.refresh();
    this.onChange(this.rarities);
  }

  async _addNew() {
    const id = prompt('Id for the new tier (lowercase, no spaces):', 'legendary');
    if (!id) return;
    const cleaned = id.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleaned) { alert('Id must have at least one letter or digit.'); return; }
    if (this.rarities.some(r => r.id === cleaned)) { alert('That id already exists.'); return; }
    const r = defaultRarity({ id: cleaned, label: cleaned.toUpperCase() });
    await putRarity(r);
    await this.refresh();
    this.onChange(this.rarities);
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
