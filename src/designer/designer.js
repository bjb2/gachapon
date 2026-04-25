// WYSIWYG machine designer — boot.
//
// Phase 1: minimal. Loads / creates a draft custom-machine record, mounts the
// Fabric canvas, wires the component palette buttons. Selection panel +
// physics tuning + preset gallery + standalone export integration land in
// later phases.

import { newCustomMachine, newComponent, validateCustomMachine, SINGLETON_TYPES } from './schema.js';
import { DesignerCanvas } from './canvas.js';
import {
  getCustomMachine, putCustomMachine, getAllCustomMachines, deleteCustomMachine,
} from './custom-machine-store.js';
import { renderPropertiesPanel } from './properties-panel.js';
import { renderLayersPanel } from './layers-panel.js';
import { PRESETS } from './presets.js';

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
  const propsHost = document.getElementById('propertiesPanel');
  const layersHost = document.getElementById('layersPanel');
  const designer = new DesignerCanvas(canvasEl, machine, {
    onChange: (m) => { save(m); refreshPalette(); refreshProps(); refreshLayers(); },
    onSelection: (component) => { refreshProps(component); refreshLayers(); },
  });
  window.__designer = designer;

  function refreshProps(component) {
    if (component === undefined) {
      const obj = designer.canvas.getActiveObject();
      component = obj && obj._component ? obj._component : null;
    }
    renderPropertiesPanel(propsHost, component, (patch) => designer.updateActive(patch));
  }

  function refreshLayers() {
    const obj = designer.canvas.getActiveObject();
    const activeId = obj && obj._component ? obj._component.id : null;
    renderLayersPanel(layersHost, designer.machine, designer, activeId);
  }

  // Disable palette buttons for singleton types whose slot is taken.
  function refreshPalette() {
    const counts = {};
    for (const c of machine.components) counts[c.type] = (counts[c.type] || 0) + 1;
    document.querySelectorAll('#palette [data-add]').forEach(btn => {
      const type = btn.dataset.add;
      const isHopperVariant = type === 'hopper';
      // Hopper buttons are always enabled — clicking swaps the variant.
      if (isHopperVariant) {
        btn.disabled = false;
        btn.title = counts.hopper ? 'Swap to this hopper variant' : 'Add hopper';
      } else if (SINGLETON_TYPES.has(type) && counts[type]) {
        btn.disabled = true;
        btn.title = `Only one ${type} allowed`;
      } else {
        btn.disabled = false;
        btn.title = '';
      }
    });
  }

  // Palette: each button adds (or swaps, for hopper) a component at canvas center.
  const palette = document.getElementById('palette');
  palette.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    const type = btn.dataset.add;
    const variant = btn.dataset.variant;

    // Hopper: replace the existing one (preserving x/y/size) so the user
    // can swap variants without losing placement.
    if (type === 'hopper') {
      const existing = machine.components.find(c => c.type === 'hopper');
      if (existing) {
        designer.updateActive({}); // clear any in-flight edits — no-op if none
        existing.variant = variant;
        designer._replaceFabricFor(existing);
        designer.canvas.setActiveObject(designer.canvas.getObjects().find(o => o._component && o._component.id === existing.id));
        designer.onChange(machine);
        designer.canvas.requestRenderAll();
        return;
      }
    }

    const partial = variant ? { variant } : {};
    partial.x = Math.round((machine.canvas.width - 200) / 2);
    partial.y = Math.round((machine.canvas.height - 200) / 2);
    designer.addComponent(type, partial);
  });

  // Keyboard shortcuts: Delete/Backspace removes the selected component;
  // Ctrl+D duplicates it. Skip while typing in a form field.
  window.addEventListener('keydown', (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      designer.removeActive();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      designer.duplicateActive();
    }
  });

  refreshPalette();
  refreshProps();
  refreshLayers();

  // Toolbar
  document.getElementById('btnDelete').addEventListener('click', () => designer.removeActive());
  document.getElementById('btnDuplicate').addEventListener('click', () => designer.duplicateActive());
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
  // Import JSON: paste a customMachine record (same format as preset entries)
  // or upload a .json file; clones into a fresh draft and reloads.
  document.getElementById('btnImportJson').addEventListener('click', () => {
    document.getElementById('importJsonFile').click();
  });
  document.getElementById('importJsonFile').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const text = await f.text();
      await importMachineJson(text);
    } catch (err) {
      alert('Import failed:\n' + err.message);
    }
  });
  document.getElementById('btnImportPaste').addEventListener('click', async () => {
    const text = prompt('Paste a customMachine JSON record:');
    if (!text) return;
    try { await importMachineJson(text); }
    catch (err) { alert('Import failed:\n' + err.message); }
  });

  document.getElementById('btnTestDrive').addEventListener('click', async () => {
    // Save current draft so the play page reads the latest, then open it.
    const errors = validateCustomMachine(designer.machine);
    if (errors.length) {
      alert('Cannot test drive — fix these first:\n' + errors.map(e => '- ' + e).join('\n'));
      return;
    }
    await save(designer.machine);
    window.open(`./index.html?customMachine=${encodeURIComponent(designer.machine.id)}`, '_blank');
  });
  await renderSavedList(designer);
  renderPresetGallery();
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

async function importMachineJson(text) {
  let parsed;
  try { parsed = JSON.parse(text); }
  catch (e) { throw new Error('Not valid JSON: ' + e.message); }
  if (!parsed || typeof parsed !== 'object') throw new Error('Expected an object.');
  if (!parsed.canvas || !Array.isArray(parsed.components)) {
    throw new Error('Missing required fields: canvas {width,height,bg} and components [...].');
  }
  // Re-key everything via newComponent / newCustomMachine so any extra fields
  // (gradient, shadow, etc.) survive but ids are regenerated to avoid clashes
  // with whatever the user already has saved.
  const clone = newCustomMachine({
    name: parsed.name || 'Imported Machine',
    canvas: { ...parsed.canvas },
    components: parsed.components.map(c => newComponent(c.type, c)),
  });
  const errors = validateCustomMachine(clone);
  if (errors.length) {
    if (!confirm('Imported machine has validation issues:\n' +
      errors.map(e => '- ' + e).join('\n') + '\n\nLoad anyway?')) return;
  }
  await putCustomMachine(clone);
  localStorage.setItem(DRAFT_ID_KEY, clone.id);
  location.reload();
}

function renderPresetGallery() {
  const host = document.getElementById('presetGallery');
  if (!host) return;
  host.innerHTML = PRESETS.map((p, i) => `
    <button class="preset-btn" data-preset="${i}" title="${escapeHtml(p.name)}">
      <span class="preset-name">${escapeHtml(p.name)}</span>
      <span class="preset-meta">${p.components.length} parts</span>
    </button>
  `).join('');
  host.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Load this preset as a new draft? Your current draft stays saved separately.')) return;
      const idx = Number(btn.dataset.preset);
      const preset = PRESETS[idx];
      // Clone components with fresh ids so the preset itself is never mutated
      // and the new draft has its own component identities.
      const clone = newCustomMachine({
        name: preset.name,
        canvas: { ...preset.canvas },
        components: preset.components.map(c => newComponent(c.type, c)),
      });
      await putCustomMachine(clone);
      localStorage.setItem('gachapon:designer:draftId', clone.id);
      location.reload();
    });
  });
}

async function renderSavedList(designer) {
  const host = document.getElementById('savedList');
  const all = await getAllCustomMachines();
  if (all.length === 0) { host.innerHTML = '<p class="muted">No saved machines yet.</p>'; return; }
  host.innerHTML = `
    <div class="saved-toolbar">
      <span class="muted">${all.length} saved</span>
      <button data-delete-all class="danger-link">Delete all</button>
    </div>
    ${all.map(m => `
      <div class="saved-row" data-id="${m.id}">
        <span class="saved-name">${escapeHtml(m.name)}</span>
        <button data-action="load">Load</button>
        <button data-action="delete">Delete</button>
      </div>
    `).join('')}
  `;
  host.querySelector('[data-delete-all]').addEventListener('click', async () => {
    if (!confirm(`Delete all ${all.length} saved machines? This can't be undone.`)) return;
    for (const m of all) await deleteCustomMachine(m.id);
    localStorage.removeItem(DRAFT_ID_KEY);
    location.reload();
  });
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
