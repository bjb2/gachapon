// WYSIWYG machine designer — boot.
//
// Phase 1: minimal. Loads / creates a draft custom-machine record, mounts the
// Fabric canvas, wires the component palette buttons. Selection panel +
// physics tuning + preset gallery + standalone export integration land in
// later phases.

import { newCustomMachine, validateCustomMachine } from './schema.js';
import { DesignerCanvas } from './canvas.js';
import {
  getCustomMachine, putCustomMachine, getAllCustomMachines, deleteCustomMachine,
} from './custom-machine-store.js';

const DRAFT_ID_KEY = 'gachapon:designer:draftId';

async function boot() {
  // Load or create the draft machine.
  const draftId = localStorage.getItem(DRAFT_ID_KEY);
  let machine;
  if (draftId) {
    machine = await getCustomMachine(draftId);
  }
  if (!machine) {
    machine = newCustomMachine();
    localStorage.setItem(DRAFT_ID_KEY, machine.id);
    await putCustomMachine(machine);
  }

  // Mount canvas.
  const canvasEl = document.getElementById('designerCanvas');
  const designer = new DesignerCanvas(canvasEl, machine, {
    onChange: (m) => save(m),
  });
  window.__designer = designer;

  // Palette: each button drags-or-clicks to add a component at canvas center.
  const palette = document.getElementById('palette');
  palette.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const type = btn.dataset.add;
    const variant = btn.dataset.variant;
    const partial = variant ? { variant } : {};
    // Drop the new component near the canvas center.
    partial.x = Math.round((machine.canvas.width - 200) / 2);
    partial.y = Math.round((machine.canvas.height - 200) / 2);
    designer.addComponent(type, partial);
  });

  // Toolbar
  document.getElementById('btnDelete').addEventListener('click', () => designer.removeActive());
  document.getElementById('btnNew').addEventListener('click', async () => {
    if (!confirm('Discard current draft and start a new machine?')) return;
    const fresh = newCustomMachine();
    localStorage.setItem(DRAFT_ID_KEY, fresh.id);
    await putCustomMachine(fresh);
    location.reload();
  });
  document.getElementById('btnValidate').addEventListener('click', () => {
    const errors = validateCustomMachine(designer.machine);
    if (errors.length) alert('Validation errors:\n' + errors.map(e => '- ' + e).join('\n'));
    else alert('Looks good — has at least one hopper and exactly one chute.');
  });
  document.getElementById('btnDumpJson').addEventListener('click', () => {
    const json = JSON.stringify(designer.machine, null, 2);
    const w = window.open('', '_blank');
    w.document.write('<pre>' + json.replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;') + '</pre>');
    w.document.close();
  });
  await renderSavedList(designer);
  document.getElementById('btnSaveAs').addEventListener('click', async () => {
    const name = prompt('Name this machine:', designer.machine.name);
    if (!name) return;
    designer.machine.name = name;
    await save(designer.machine);
    await renderSavedList(designer);
  });
}

async function save(machine) {
  await putCustomMachine(machine);
}

async function renderSavedList(designer) {
  const host = document.getElementById('savedList');
  const all = await getAllCustomMachines();
  if (all.length === 0) { host.innerHTML = '<p class="muted">No saved machines yet.</p>'; return; }
  host.innerHTML = all.map(m => `
    <div class="saved-row" data-id="${m.id}">
      <span class="saved-name">${escapeHtml(m.name)}</span>
      <button data-action="load">Load</button>
      <button data-action="delete">Delete</button>
    </div>
  `).join('');
  host.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('[data-id]');
      const id = row.dataset.id;
      if (btn.dataset.action === 'load') {
        localStorage.setItem(DRAFT_ID_KEY, id);
        location.reload();
      } else if (btn.dataset.action === 'delete') {
        if (!confirm('Delete this machine?')) return;
        await deleteCustomMachine(id);
        if (id === designer.machine.id) {
          localStorage.removeItem(DRAFT_ID_KEY);
          location.reload();
        } else {
          await renderSavedList(designer);
        }
      }
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

boot().catch(err => {
  console.error('[designer] boot failed', err);
  document.body.insertAdjacentHTML('afterbegin',
    `<div style="background:#fee;color:#900;padding:10px;font-family:monospace">Designer boot failed: ${escapeHtml(err.message)}</div>`);
});
