// Render the "YOUR COLLECTION" chip row. Highlights the newly-received chip.
// Uses the prize's own ballStyle.color1 as the dot color.
export function renderChips(container, collection, newId = null) {
  container.innerHTML = '';
  Object.values(collection).forEach(({ prize, count }) => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (prize.id === newId ? ' new-chip' : '');
    const dot = document.createElement('span');
    const color = prize.ballStyle?.color1 || '#CCCCCC';
    dot.className = 'chip-dot';
    dot.style.background = color;
    chip.appendChild(dot);
    chip.appendChild(document.createTextNode(` ${prize.name.split(' ')[0]} ×${count}`));
    container.appendChild(chip);
  });
}
