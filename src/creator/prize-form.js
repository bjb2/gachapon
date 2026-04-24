// Prize edit form behaviour. HTML rendering lives in ./prize-form-template.js.
import { putPrize } from '../prizes/prize-store.js';
import { defaultPrize, validatePrize } from '../prizes/prize-schema.js';
import { renderPrizeArt } from '../prizes/prize-render.js';
import { attachDropZone } from './svg-upload.js';
import { findTier } from '../core/rarity.js';
import { applyBallStyle } from '../machine/ball-style.js';
import { prizeFormTemplate } from './prize-form-template.js';

export class PrizeForm {
  constructor(root, { rarities, onSaved }) {
    this.root = root;
    this.rarities = rarities;
    this.onSaved = onSaved;
    this.prize = null;
    this.root.classList.add('hidden');
  }

  setRarities(rarities) { this.rarities = rarities; }

  open(prize) {
    const defaultRarityId = this.rarities[0]?.id || 'common';
    this.prize = prize
      ? { ...prize, art: { ...prize.art }, ballStyle: { ...prize.ballStyle } }
      : defaultPrize({ rarity: defaultRarityId });
    this.root.classList.remove('hidden');
    this._render();
  }

  close() {
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    this.prize = null;
  }

  _render() {
    this.root.innerHTML = prizeFormTemplate(this.rarities, this.prize);
    this._bind();
    this._refreshPreview();
  }

  _bind() {
    const p = this.prize;
    const q = (s) => this.root.querySelector(s);
    q('[data-cancel]').addEventListener('click', () => this.close());
    q('[data-cancel2]').addEventListener('click', () => this.close());

    q('[data-name]').addEventListener('input', e => { p.name = e.target.value; this._refreshPreview(); });
    q('[data-rarity]').addEventListener('change', e => { p.rarity = e.target.value; this._refreshPreview(); });
    q('[data-flavor]').addEventListener('input', e => { p.flavor = e.target.value; this._refreshPreview(); });

    // ── Ball style ────────────────────────────────────────────────
    for (const r of this.root.querySelectorAll('input[name="balltype"]')) {
      r.addEventListener('change', () => {
        p.ballStyle.type = r.value;
        if (p.ballStyle.type === 'capsule' && !p.ballStyle.color2) p.ballStyle.color2 = '#FF6B9D';
        this._render();
      });
    }
    this._bindColorPair('[data-color1-picker]', '[data-color1-text]', v => { p.ballStyle.color1 = v; });
    this._bindColorPair('[data-color2-picker]', '[data-color2-text]', v => { p.ballStyle.color2 = v; });

    const glowToggle = q('[data-glow-toggle]');
    glowToggle.addEventListener('change', () => {
      if (glowToggle.checked) {
        const hex = q('[data-glow-picker]').value;
        p.ballStyle.glow = hex;
      } else {
        p.ballStyle.glow = null;
      }
      this._render();
    });
    this._bindColorPair('[data-glow-picker]', '[data-glow-text]', v => { p.ballStyle.glow = v; });

    // ── Art ──────────────────────────────────────────────────────
    for (const r of this.root.querySelectorAll('input[name="artmode"]')) {
      r.addEventListener('change', () => this._setArtMode(r.value));
    }
    q('[data-svg-text]').addEventListener('input', e => {
      p.art = { kind: 'svg', source: 'inline', value: e.target.value };
      this._refreshPreview();
    });
    q('[data-url-value]').addEventListener('input', e => {
      const url = e.target.value;
      const kind = /\.svg(\?|$)/i.test(url) ? 'svg' : 'image';
      p.art = { kind, source: 'url', value: url };
      this._refreshPreview();
    });
    attachDropZone(q('[data-drop]'), (art) => {
      p.art = art;
      const status = q('[data-upload-status]');
      status.textContent = art.source === 'blob' ? `Stored blob: ${art.value}` : 'Loaded.';
      this._refreshPreview();
    });

    q('[data-save]').addEventListener('click', () => this._save());
  }

  _bindColorPair(pickerSel, textSel, setter) {
    const picker = this.root.querySelector(pickerSel);
    const text = this.root.querySelector(textSel);
    if (!picker || !text) return;
    const sync = (v) => {
      if (!/^#[0-9a-fA-F]{6}$/.test(v)) return;
      picker.value = v;
      text.value = v;
      setter(v);
      this._refreshPreview();
    };
    picker.addEventListener('input', () => sync(picker.value));
    text.addEventListener('change', () => sync(text.value.trim()));
    text.addEventListener('blur',   () => sync(text.value.trim()));
  }

  _setArtMode(mode) {
    const p = this.prize;
    const q = (s) => this.root.querySelector(s);
    q('[data-art-svg]').classList.toggle('hidden', mode !== 'svg');
    q('[data-art-upload]').classList.toggle('hidden', mode !== 'upload');
    q('[data-art-url]').classList.toggle('hidden', mode !== 'url');
    if (mode === 'svg') {
      p.art = { kind: 'svg', source: 'inline', value: q('[data-svg-text]').value || '' };
    } else if (mode === 'url') {
      p.art = { kind: 'svg', source: 'url', value: q('[data-url-value]').value || '' };
    } else if (p.art.source !== 'blob') {
      p.art = { kind: 'image', source: 'blob', value: '' };
    }
    this._refreshPreview();
  }

  async _save() {
    const p = this.prize;
    const v = validatePrize(p);
    if (!v.ok) { alert('Invalid prize:\n' + v.errors.join('\n')); return; }
    await putPrize(p);
    if (this.onSaved) this.onSaved(p);
    this.close();
  }

  _refreshPreview() {
    const p = this.prize;
    const tier = findTier(this.rarities, p.rarity);
    const q = (s) => this.root.querySelector(s);
    const stage = q('[data-preview-stage]');
    if (!stage) return;
    renderPrizeArt(stage, p);
    const rarityEl = q('[data-preview-rarity]');
    rarityEl.textContent = tier.label;
    rarityEl.className = `rarity-pill ${p.rarity}`;
    q('[data-preview-name]').textContent = p.name;
    q('[data-preview-flavor]').textContent = p.flavor || '';
    const ballEl = q('[data-preview-ball]');
    applyBallStyle(ballEl, p.ballStyle);
  }
}
