// Render the "YOUR COLLECTION" chip row. Highlights the newly-received chip.
// Uses the prize's own ballStyle.color1 as the dot color.
// onChipClick: optional (prize) => void — when supplied, chips are buttons that
// re-open the reveal card for that prize so the user can revisit it.
export function renderChips(container, collection, newId = null, onChipClick = null) {
  container.innerHTML = '';
  Object.values(collection).forEach(({ prize, count }) => {
    const chip = document.createElement(onChipClick ? 'button' : 'div');
    chip.className = 'chip' + (prize.id === newId ? ' new-chip' : '');
    if (onChipClick) {
      chip.type = 'button';
      chip.title = `View ${prize.name}`;
      chip.addEventListener('click', () => onChipClick(prize));
    }
    const dot = document.createElement('span');
    const color = prize.ballStyle?.color1 || '#CCCCCC';
    dot.className = 'chip-dot';
    dot.style.background = color;
    chip.appendChild(dot);
    chip.appendChild(document.createTextNode(` ${prize.name.split(' ')[0]} ×${count}`));
    container.appendChild(chip);
  });
}
