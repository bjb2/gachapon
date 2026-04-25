// Renders a prize's art into a container element. Handles all three sources:
//   svg / inline   → innerHTML = svg text
//   image / blob   → <img> sourced from an IDB blob (URL.createObjectURL with revoke)
//   image / url    → <img> with the URL as src
//   svg / url      → <object> or <img> pointing at the URL (browser inlines)
import { getBlob } from './prize-store.js';

export async function renderPrizeArt(container, prize) {
  if (!prize || !prize.art) {
    container.innerHTML = '';
    return;
  }
  const { kind, source, value } = prize.art;

  if (kind === 'svg' && source === 'inline') {
    container.innerHTML = value || '';
    return;
  }

  if (kind === 'svg' && source === 'url') {
    const img = document.createElement('img');
    img.alt = prize.name;
    img.src = value;
    container.innerHTML = '';
    container.appendChild(img);
    return;
  }

  if (kind === 'image' && source === 'url') {
    const img = document.createElement('img');
    img.alt = prize.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = value;
    container.innerHTML = '';
    container.appendChild(img);
    return;
  }

  if (source === 'blob') {
    try {
      const blob = await getBlob(value);
      if (!blob) { container.innerHTML = ''; return; }
      if (kind === 'svg') {
        // Treat stored blob as text if it's an SVG string blob.
        const text = await blob.text();
        container.innerHTML = text;
        return;
      }
      const url = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.alt = prize.name;
      img.onload = () => URL.revokeObjectURL(url);
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
      container.innerHTML = '';
      container.appendChild(img);
    } catch (e) {
      console.warn('[prize-render] blob load failed', e);
      container.innerHTML = '';
    }
    return;
  }

  container.innerHTML = '';
}
