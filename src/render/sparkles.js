// Sparkle emojis on the reveal card. Takes a rarity tier (sparkleEmojis + sparkleCount).
export function spawnSparkles(container, tier) {
  const emojis = tier.sparkleEmojis || ['✨','⭐'];
  const count = tier.sparkleCount || 4;
  for (let i = 0; i < count; i++) {
    const sp = document.createElement('span');
    sp.className = 'sparkle';
    sp.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const angle = (i / count) * Math.PI * 2;
    const dist = 60 + Math.random() * 50;
    sp.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
    sp.style.setProperty('--sy', `${Math.sin(angle) * dist - 20}px`);
    sp.style.left = '50%';
    sp.style.top = '38%';
    sp.style.animationDelay = `${i * 0.06}s`;
    container.appendChild(sp);
  }
}

export function clearSparkles(container = document) {
  container.querySelectorAll('.sparkle').forEach(s => s.remove());
}
