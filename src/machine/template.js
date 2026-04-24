// HTML string for the machine DOM. Layout ('dome' | 'box') controls the
// container shape. Data attributes are identical across layouts so Machine.js
// queries work unchanged.
export function machineTemplate(machineDef) {
  const layout = machineDef.layout || 'dome';
  return layout === 'box' ? _boxTemplate(machineDef) : _domeTemplate(machineDef);
}

function _controls(machineDef) {
  const turns = machineDef.controls.turnsNeeded;
  const dots = Array.from({ length: turns }, (_, i) => `<div class="pdot" data-dot="${i}"></div>`).join('');
  return `
    <div class="brand-strip"><span class="brand-label">${machineDef.brandLabel || machineDef.name}</span></div>
    <div class="controls-row">
      <div class="left-panel">
        <div class="led-display" data-led>PULLS: 0</div>
        <div class="lucky-circle"><div class="lucky-text">LUCKY<br>BALL</div></div>
      </div>
      <div class="crank-panel">
        <div class="crank-label">TURN HERE</div>
        <div class="crank-btn" data-crank>
          <div class="crank-inner" data-crank-inner>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <!-- 3/4 arc forming a "C" shape with the opening on the right -->
              <path d="M 22 22 A 9.5 9.5 0 1 1 22 8" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
              <!-- Arrowhead at top-right endpoint, pointing outward (to the right) -->
              <polygon points="22,3 22,13 29,8" fill="currentColor"/>
            </svg>
          </div>
        </div>
        <div class="progress-dots" data-dots>${dots}</div>
      </div>
    </div>
    <div class="tray" data-tray>
      <div class="tray-flap"></div>
      <div class="tray-hint" data-tray-hint>Turn ${turns}× to dispense!</div>
      <div class="refill-wrap" data-refill-wrap>
        <span class="refill-empty">MACHINE EMPTY</span>
        <button class="refill-btn" data-refill>↺ REFILL</button>
      </div>
      <div class="tray-ball" data-tray-ball></div>
    </div>`;
}

function _domeTemplate(machineDef) {
  return `
    <div class="dome-outer">
      <div class="dome-shell" data-dome-shell>
        <canvas data-dome-canvas></canvas>
        <div class="dome-glass"></div>
      </div>
    </div>
    <div class="dome-collar"></div>
    <div class="machine-body">${_controls(machineDef)}</div>`;
}

function _boxTemplate(machineDef) {
  return `
    <div class="box-outer">
      <div class="box-shell" data-dome-shell>
        <canvas data-dome-canvas></canvas>
        <div class="box-glass"></div>
      </div>
    </div>
    <div class="machine-body">${_controls(machineDef)}</div>`;
}
