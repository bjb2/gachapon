// Machine — orchestrator. Wires core + physics + render + DOM + reveal + collection.
// Heavy dispense/click logic lives in ./dispense-flow.js to keep this file small.
import { buildPool } from '../core/pool.js';
import { GachaState } from '../core/state.js';
import { EventEmitter } from '../core/events.js';
import { deriveGeometry, geometryToCssVars } from '../physics/geometry.js';
import { DomePhysics } from '../physics/dome-physics.js';
import { DomeRenderer } from '../render/dome-canvas.js';
import { AudioBus } from '../render/audio.js';
import { machineTemplate } from './template.js';
import { wireControls } from './controls.js';
import { RevealModal } from '../reveal/modal.js';
import { renderChips } from '../collection/chips.js';
import { runDispense, runBallClick } from './dispense-flow.js';

export class Machine {
  constructor({ machineDef, prizes, rarities, host, collectionHost, hintHost }) {
    this.def = machineDef;
    this.prizes = prizes;
    this.rarities = rarities;
    this.prizeById = new Map(prizes.map(p => [p.id, p]));
    this.host = host;
    this.collectionHost = collectionHost;
    this.hintHost = hintHost;
    this.geo = deriveGeometry(machineDef);
    this.state = new GachaState({ turnsNeeded: machineDef.controls.turnsNeeded });
    this.audio = new AudioBus(machineDef.audio);
    this.controlBus = new EventEmitter();
    this.crankRotation = 0;
  }

  mount() {
    // 1. Apply skin to <html> so all scoped CSS rules activate immediately.
    document.documentElement.dataset.skin = this.def.skin || 'classic';

    // 2. DOM shell + CSS custom properties.
    this.host.classList.add('machine-wrap');
    this.host.innerHTML = machineTemplate(this.def);
    const cssVars = geometryToCssVars(this.geo, this.def);
    for (const [k, v] of Object.entries(cssVars)) this.host.style.setProperty(k, v);

    // 3. Query element refs.
    this.$ = {
      crankInner: this.host.querySelector('[data-crank-inner]'),
      dots:       [...this.host.querySelectorAll('[data-dots] .pdot')],
      led:        this.host.querySelector('[data-led]'),
      trayHint:   this.host.querySelector('[data-tray-hint]'),
      trayBall:   this.host.querySelector('[data-tray-ball]'),
      refillWrap: this.host.querySelector('[data-refill-wrap]'),
      canvas:     this.host.querySelector('[data-dome-canvas]'),
    };

    // 4. Physics + renderer + initial pool.
    this.physics = new DomePhysics(this.geo);
    this.renderer = new DomeRenderer(this.$.canvas, this.physics, this.geo);
    this._spawnPool();

    // 5. Reveal modal + state subscriptions.
    this.reveal = new RevealModal(this.rarities);
    this.reveal.onClosed(() => {
      if (this.physics.count() === 0 && !this.state.pulling) {
        this._setHint('Machine empty! Hit REFILL to go again.');
      }
    });
    this.state.on('pulls-changed', (n) => { this.$.led.textContent = `PULLS: ${n}`; });
    this.state.on('turns-changed', (t) => { this._updateDots(t); });
    this.state.on('collection-updated', (newId, collection) => {
      this.collectionHost.style.display = 'block';
      renderChips(this.collectionHost.querySelector('[data-collection-chips]'), collection, newId);
    });

    // 6. Wire user controls.
    wireControls(this.host, this.controlBus);
    this.controlBus.on('crank', () => this._onCrank());
    this.controlBus.on('ball-click', () => runBallClick(this));
    this.controlBus.on('refill', () => this._onRefill());
  }

  _spawnPool() {
    const pool = buildPool(this.prizes, this.rarities, this.def.poolSize);
    this.physics.spawnBalls(pool, (id) => this.prizeById.get(id));
  }

  _updateDots(turns) { this.$.dots.forEach((d, i) => d.classList.toggle('lit', i < turns)); }
  _setHint(text) { if (this.hintHost) this.hintHost.textContent = text; }

  _shake() {
    this.host.classList.remove('shaking');
    void this.host.offsetWidth;
    this.host.classList.add('shaking');
    this.host.addEventListener('animationend', () => this.host.classList.remove('shaking'), { once: true });
  }

  _onCrank() {
    if (this.state.pulling) return;
    if (this.physics.count() === 0) return;

    const ready = this.state.tickCrank();
    this.crankRotation += this.def.controls.crankRotationPerTurn;
    this.$.crankInner.style.transform = `rotate(${this.crankRotation}deg)`;
    this._shake();
    this.physics.jostle({ xMag: 0.028, yMag: 0.012, yBias: 0.3 });
    this.audio.play('click');

    if (ready) {
      this.state.resetTurns();
      setTimeout(() => runDispense(this), 180);
    } else {
      this._setHint(this.state.turns === 1 ? 'Keep turning...' : 'One more turn!');
    }
  }

  _showEmpty() {
    this.$.trayHint.style.display = 'none';
    this.$.refillWrap.classList.add('show');
    this.state.markEmpty();
  }

  _onRefill() {
    this.$.refillWrap.classList.remove('show');
    this.$.trayHint.style.display = 'block';
    this.$.trayHint.textContent = `Turn ${this.def.controls.turnsNeeded}× to dispense!`;
    this._setHint('');
    this._spawnPool();
    this.state.resetTurns();
    this.state.markReset();
  }

  // Tear down physics + renderer + reveal modal so a new Machine can mount in
  // the same host (used by the creator's live preview).
  destroy() {
    try { this.renderer && this.renderer.stop(); } catch (e) { /* ignore */ }
    try { this.physics && this.physics.stop(); } catch (e) { /* ignore */ }
    if (this.reveal && this.reveal.root && this.reveal.root.parentNode) {
      this.reveal.root.parentNode.removeChild(this.reveal.root);
    }
    if (this.host) this.host.innerHTML = '';
    this.controlBus && this.controlBus.clear && this.controlBus.clear();
  }
}
