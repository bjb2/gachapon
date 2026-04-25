// Layers panel — lists every component on the canvas in z-order so the
// user can pick items buried under others, reorder z, hide, and lock.
//
// Render top of the list = top of the z-stack (last in components array).
// Drag-and-drop within the list reorders the underlying array. Each row
// also offers a click target (select), a visibility toggle, a lock toggle,
// and up/down/top/bottom z-buttons for users who don't want to drag.

const TYPE_ICONS = {
  hopper: '◯', chute: '↓', crank: '⊙', 'brand-strip': '▭',
  led: '▤', 'turn-dots': '⋯', tray: '⬓', decoration: '◆',
};

export function renderLayersPanel(host, machine, designer, activeId) {
  if (!host) return;
  const comps = machine.components || [];
  if (comps.length === 0) {
    host.innerHTML = '<p class="muted">No components yet — add one from the palette.</p>';
    return;
  }
  // Render top-of-stack first (visually conventional).
  const items = [...comps].reverse();
  host.innerHTML = `
    <ol class="layers-list" data-layers-list>
      ${items.map((c, i) => renderRow(c, comps.length - 1 - i, comps.length, c.id === activeId)).join('')}
    </ol>
  `;

  // Wire row interactions
  host.querySelectorAll('[data-layer-row]').forEach(row => {
    const id = row.dataset.id;
    // Click anywhere on row (except controls) → select
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]')) return;
      designer.selectComponent(id);
    });
    row.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.action;
        if (act === 'hide') {
          const c = comps.find(c => c.id === id);
          designer.setComponentFlag(id, 'hidden', !c.hidden);
        } else if (act === 'lock') {
          const c = comps.find(c => c.id === id);
          designer.setComponentFlag(id, 'locked', !c.locked);
        } else if (act === 'top' || act === 'up' || act === 'down' || act === 'bottom') {
          designer.reorderComponent(id, act);
        } else if (act === 'delete') {
          if (confirm('Delete this component?')) designer.removeComponent(id);
        }
      });
    });
    // Drag handle drag-and-drop
    row.draggable = true;
    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', id);
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => row.classList.remove('dragging'));
    row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      row.classList.remove('drag-over');
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId && draggedId !== id) {
        const targetIdx = comps.findIndex(c => c.id === id);
        designer.reorderComponent(draggedId, targetIdx);
      }
    });
  });
}

function renderRow(c, zIndex, total, isActive) {
  const icon = TYPE_ICONS[c.type] || '?';
  const label = labelFor(c);
  const hiddenCls = c.hidden ? ' is-hidden' : '';
  const lockedCls = c.locked ? ' is-locked' : '';
  return `
    <li class="layer-row${isActive ? ' is-active' : ''}${hiddenCls}${lockedCls}"
        data-layer-row data-id="${esc(c.id)}" title="z-index ${zIndex}">
      <span class="layer-grip" aria-hidden="true">⋮⋮</span>
      <span class="layer-icon">${icon}</span>
      <span class="layer-label">${esc(label)}</span>
      <span class="layer-controls">
        <button data-action="up"     title="Move up">↑</button>
        <button data-action="down"   title="Move down">↓</button>
        <button data-action="hide"   title="${c.hidden ? 'Show' : 'Hide'}" class="${c.hidden ? 'on' : ''}">${c.hidden ? '◌' : '●'}</button>
        <button data-action="lock"   title="${c.locked ? 'Unlock' : 'Lock'}" class="${c.locked ? 'on' : ''}">${c.locked ? '🔒' : '🔓'}</button>
        <button data-action="delete" title="Delete" class="danger">×</button>
      </span>
    </li>
  `;
}

function labelFor(c) {
  if (c.type === 'hopper')      return `Hopper (${c.variant || 'dome'})`;
  if (c.type === 'brand-strip') return `Brand: ${truncate(c.text || '', 14)}`;
  if (c.type === 'decoration') {
    if (c.shape === 'text') return `Text: ${truncate(c.text || '', 14)}`;
    return `Decoration (${c.shape || 'rect'})`;
  }
  return cap(c.type);
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function truncate(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
