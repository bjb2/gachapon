// Properties panel for the selected canvas component. Renders type-specific
// form controls; every change calls onPatch with a partial component object.
//
// Each field maps directly to a schema field on the component. The canvas
// adapter (`updateActive` in canvas.js) reapplies the patch and rebuilds
// the Fabric object so visual + schema stay in sync.

const FONT_OPTIONS = [
  'Orbitron', 'M PLUS Rounded 1c', 'DotGothic16', 'Share Tech Mono', 'Crimson Pro',
  'Inter', 'Arial', 'Georgia',
];

export function renderPropertiesPanel(host, component, onPatch) {
  if (!host) return;
  if (!component) {
    host.innerHTML = '<p class="muted">Select a component on the canvas to edit its properties.</p>';
    return;
  }

  const fields = fieldsFor(component);
  host.innerHTML = `
    <div class="props-header">
      <span class="props-type">${component.type}${component.variant ? ' / ' + component.variant : ''}</span>
      <span class="props-id">${component.id.split('-').slice(-1)[0]}</span>
    </div>
    <div class="props-fields">
      ${fields.map(renderField).join('')}
    </div>
  `;

  // Wire change handlers
  host.querySelectorAll('[data-prop]').forEach(input => {
    const key = input.dataset.prop;
    const kind = input.dataset.kind;
    input.addEventListener('input', () => {
      let value = input.value;
      if (kind === 'number') value = Number(value);
      else if (kind === 'bool') value = input.checked;
      onPatch({ [key]: value });
    });
  });
}

function fieldsFor(c) {
  const common = [
    { key: 'x', label: 'X', kind: 'number', value: c.x },
    { key: 'y', label: 'Y', kind: 'number', value: c.y },
    { key: 'rotation', label: 'Rotation', kind: 'number', value: c.rotation || 0 },
  ];

  switch (c.type) {
    case 'hopper':
      return [
        ...common,
        { key: 'width', label: 'Width', kind: 'number', value: c.width },
        { key: 'height', label: 'Height', kind: 'number', value: c.height },
        { key: 'wallColor', label: 'Wall color', kind: 'color', value: c.wallColor || '#DDD8E0' },
        { key: 'wallThickness', label: 'Wall thickness', kind: 'number', value: c.wallThickness || 3 },
        { key: 'windowFill', label: 'Window fill (rgba ok)', kind: 'text', value: c.windowFill || 'rgba(222,234,250,0.5)' },
      ];
    case 'chute':
      return [
        ...common,
        { key: 'width', label: 'Width', kind: 'number', value: c.width },
        { key: 'height', label: 'Height', kind: 'number', value: c.height },
        { key: 'openingColor', label: 'Opening color', kind: 'color', value: c.openingColor || '#222222' },
      ];
    case 'crank':
      return [
        ...common,
        { key: 'size', label: 'Size', kind: 'number', value: c.size },
        { key: 'accent', label: 'Accent color', kind: 'color', value: c.accent || '#888090' },
        { key: 'style', label: 'Style', kind: 'select', value: c.style, options: ['chrome', 'matte', 'soft', 'glow'] },
      ];
    case 'brand-strip':
      return [
        ...common,
        { key: 'width', label: 'Width', kind: 'number', value: c.width },
        { key: 'height', label: 'Height', kind: 'number', value: c.height },
        { key: 'text', label: 'Text', kind: 'text', value: c.text || '' },
        { key: 'font', label: 'Font', kind: 'select', value: c.font, options: FONT_OPTIONS },
        { key: 'fg', label: 'Text color', kind: 'color', value: c.fg || '#FFFFFF' },
        { key: 'bg', label: 'Background', kind: 'color', value: c.bg || '#111111' },
        { key: 'letterSpacing', label: 'Letter spacing (em)', kind: 'number', value: c.letterSpacing },
      ];
    case 'led':
      return [
        ...common,
        { key: 'width', label: 'Width', kind: 'number', value: c.width },
        { key: 'height', label: 'Height', kind: 'number', value: c.height },
        { key: 'color', label: 'Pixel color', kind: 'color', value: c.color || '#88FF44' },
        { key: 'bg', label: 'Background', kind: 'color', value: c.bg || '#12110E' },
      ];
    case 'turn-dots':
      return [
        ...common,
        { key: 'count', label: 'Count', kind: 'number', value: c.count || 3 },
        { key: 'dotSize', label: 'Dot size', kind: 'number', value: c.dotSize || 8 },
        { key: 'litColor', label: 'Lit color', kind: 'color', value: c.litColor || '#CC0000' },
        { key: 'dimColor', label: 'Dim color', kind: 'color', value: c.dimColor || '#E4E0E0' },
      ];
    case 'tray':
      return [
        ...common,
        { key: 'width', label: 'Width', kind: 'number', value: c.width },
        { key: 'height', label: 'Height', kind: 'number', value: c.height },
        { key: 'fill', label: 'Fill', kind: 'color', value: c.fill || '#EDECEC' },
        { key: 'stroke', label: 'Stroke', kind: 'color', value: c.stroke || '#D4D2D2' },
      ];
    case 'decoration':
      return [
        ...common,
        { key: 'shape', label: 'Shape', kind: 'select', value: c.shape || 'rect', options: ['rect', 'circle', 'text'] },
        { key: 'width', label: 'Width', kind: 'number', value: c.width },
        { key: 'height', label: 'Height', kind: 'number', value: c.height },
        { key: 'fill', label: 'Fill', kind: 'color', value: c.fill || '#FF6B9D' },
        { key: 'stroke', label: 'Stroke (blank for none)', kind: 'text', value: c.stroke || '' },
      ];
    default:
      return common;
  }
}

function renderField(f) {
  const id = `prop-${f.key}`;
  const common = `data-prop="${esc(f.key)}" data-kind="${esc(f.kind)}" id="${id}"`;
  let input;
  switch (f.kind) {
    case 'color':
      input = `<input type="color" ${common} value="${esc(f.value || '#000000')}">`;
      break;
    case 'select':
      input = `<select ${common}>${f.options.map(o => `<option value="${esc(o)}"${o === f.value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      break;
    case 'number':
      input = `<input type="number" step="any" ${common} value="${esc(f.value ?? 0)}">`;
      break;
    case 'bool':
      input = `<input type="checkbox" ${common}${f.value ? ' checked' : ''}>`;
      break;
    case 'text':
    default:
      input = `<input type="text" ${common} value="${esc(f.value ?? '')}">`;
  }
  return `<label class="props-field"><span>${esc(f.label)}</span>${input}</label>`;
}

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
