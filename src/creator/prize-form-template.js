// HTML for the prize-edit form (behaviour in prize-form.js).
export function prizeFormTemplate(rarities, prize) {
  const p = prize;
  const style = p.ballStyle;
  const isCapsule = style.type === 'capsule';
  const glowEnabled = !!style.glow;
  const glowColor = _glowToHex(style.glow) || '#FFD166';
  return `
    <div class="panel-header">
      <h2>EDIT PRIZE</h2>
      <button class="btn ghost" data-cancel>Cancel</button>
    </div>

    <div class="field"><label>Name</label><input type="text" data-name value="${esc(p.name)}"></div>

    <div class="field">
      <label>Rarity</label>
      <select data-rarity>
        ${rarities.map(t => `<option value="${esc(t.id)}" ${t.id===p.rarity?'selected':''}>${esc(t.label)}</option>`).join('')}
      </select>
    </div>

    <div class="field">
      <label>Flavor Text</label>
      <textarea data-flavor>${esc(p.flavor || '')}</textarea>
    </div>

    <div class="field ball-style-field">
      <label>Ball Style</label>
      <div class="ball-style-editor">
        <div class="ball-type-toggle" role="radiogroup">
          <label><input type="radio" name="balltype" value="capsule" ${isCapsule?'checked':''}> Capsule <span class="muted">(two-tone)</span></label>
          <label><input type="radio" name="balltype" value="plain" ${!isCapsule?'checked':''}> Plain <span class="muted">(single color)</span></label>
        </div>

        <div class="color-picker-row" data-color-row>
          <div class="color-picker" data-color1-wrap>
            <label data-color1-label>${isCapsule ? 'Color 1 (top)' : 'Color'}</label>
            <div class="color-picker-inputs">
              <input type="color" data-color1-picker value="${_hexOr(style.color1, '#FFD166')}">
              <input type="text" data-color1-text value="${_hexOr(style.color1, '#FFD166')}" spellcheck="false">
            </div>
          </div>
          <div class="color-picker" data-color2-wrap ${isCapsule ? '' : 'hidden'}>
            <label>Color 2 (bottom)</label>
            <div class="color-picker-inputs">
              <input type="color" data-color2-picker value="${_hexOr(style.color2, '#FF6B9D')}">
              <input type="text" data-color2-text value="${_hexOr(style.color2, '#FF6B9D')}" spellcheck="false">
            </div>
          </div>
        </div>

        <div class="glow-row">
          <label class="inline">
            <input type="checkbox" data-glow-toggle ${glowEnabled?'checked':''}> Glow
          </label>
          <div class="color-picker-inputs" ${glowEnabled ? '' : 'hidden'} data-glow-inputs>
            <input type="color" data-glow-picker value="${glowColor}">
            <input type="text" data-glow-text value="${glowColor}" spellcheck="false">
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <label>Art</label>
      <div class="art-mode">
        <label><input type="radio" name="artmode" value="svg" ${p.art.kind==='svg'&&p.art.source==='inline'?'checked':''}> Paste SVG</label>
        <label><input type="radio" name="artmode" value="upload" ${p.art.source==='blob'?'checked':''}> Upload</label>
        <label><input type="radio" name="artmode" value="url" ${p.art.source==='url'?'checked':''}> URL</label>
      </div>
      <div data-art-svg class="${p.art.kind==='svg'&&p.art.source==='inline'?'':'hidden'}">
        <textarea data-svg-text placeholder="Paste <svg>...</svg> here">${p.art.kind==='svg'&&p.art.source==='inline'?esc(p.art.value):''}</textarea>
      </div>
      <div data-art-upload class="${p.art.source==='blob'?'':'hidden'}">
        <div class="drop-zone" data-drop>Click or drop .svg / image here</div>
        <div class="muted" data-upload-status>${p.art.source==='blob'?'Using stored blob: '+esc(p.art.value):''}</div>
      </div>
      <div data-art-url class="${p.art.source==='url'?'':'hidden'}">
        <input type="text" data-url-value value="${p.art.source==='url'?esc(p.art.value):''}" placeholder="https://example.com/art.svg">
      </div>
    </div>

    <div class="form-actions">
      <button class="btn mint" data-save>Save</button>
      <button class="btn ghost" data-cancel2>Cancel</button>
    </div>

    <div class="panel-header" style="margin-top:18px"><h2>LIVE PREVIEW</h2></div>
    <div class="preview-card">
      <div class="preview-stage" data-preview-stage></div>
      <div class="rarity-pill ${esc(p.rarity)}" data-preview-rarity></div>
      <div style="font-size:14px;font-weight:900;margin-top:6px" data-preview-name></div>
      <div class="muted" data-preview-flavor></div>
      <div class="preview-ball" data-preview-ball></div>
    </div>
  `;
}

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

function _hexOr(v, fallback) {
  if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return fallback;
}

// Glow may be stored as `rgba(...)` on legacy records. For the color picker
// we fall back to null and let the user pick a fresh hex.
function _glowToHex(v) {
  if (!v) return null;
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return null;
}
