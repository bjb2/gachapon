export function revealModalTemplate() {
  return `
    <div class="modal-overlay" data-modal>
      <div class="reveal-card" data-reveal-card>
        <div class="rarity-banner" data-rarity-banner>COMMON</div>
        <div class="char-stage" data-char-stage></div>
        <div class="rarity-stars" data-rarity-stars>★</div>
        <div class="char-name" data-char-name>Name</div>
        <div class="char-flavor" data-char-flavor>Flavor</div>
        <button class="close-btn" data-close-btn>Nice! ✦</button>
      </div>
    </div>
  `;
}
