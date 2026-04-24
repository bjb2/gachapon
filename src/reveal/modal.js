import { revealModalTemplate } from './template.js';
import { spawnSparkles, clearSparkles } from '../render/sparkles.js';
import { findTier } from '../core/rarity.js';
import { renderPrizeArt } from '../prizes/prize-render.js';

// RevealModal — opens/closes the reveal card for a given prize.
// Mounts into document.body the first time it's needed.
export class RevealModal {
  constructor(rarityTiers) {
    this.rarityTiers = rarityTiers;
    const wrap = document.createElement('div');
    wrap.innerHTML = revealModalTemplate();
    this.root = wrap.firstElementChild;
    document.body.appendChild(this.root);

    this.banner = this.root.querySelector('[data-rarity-banner]');
    this.stage = this.root.querySelector('[data-char-stage]');
    this.stars = this.root.querySelector('[data-rarity-stars]');
    this.nameEl = this.root.querySelector('[data-char-name]');
    this.flavorEl = this.root.querySelector('[data-char-flavor]');
    this.card = this.root.querySelector('[data-reveal-card]');
    this.closeBtn = this.root.querySelector('[data-close-btn]');

    this._onClose = () => this.close();
    this.closeBtn.addEventListener('click', this._onClose);
    this.root.addEventListener('click', (e) => { if (e.target === this.root) this.close(); });

    this._onClosedCb = null;
  }

  onClosed(cb) { this._onClosedCb = cb; }

  async open(prize) {
    const tier = findTier(this.rarityTiers, prize.rarity);
    this.banner.textContent = tier.label;
    this.banner.className = 'rarity-banner ' + prize.rarity;
    this.stars.textContent = tier.stars;
    this.nameEl.textContent = prize.name;
    this.flavorEl.textContent = prize.flavor || '';
    this.stage.innerHTML = '';
    await renderPrizeArt(this.stage, prize);
    this.stage.classList.remove('popped');

    this.root.classList.add('open');
    setTimeout(() => {
      this.stage.classList.add('popped');
      spawnSparkles(this.card, tier);
    }, 180);
  }

  close() {
    this.root.classList.remove('open');
    this.stage.classList.remove('popped');
    clearSparkles(this.card);
    if (this._onClosedCb) this._onClosedCb();
  }
}
