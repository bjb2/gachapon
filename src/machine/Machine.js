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
    // Collection: collapsed by default so the user has to opt in to see what
    // they've collected. Avoids spoiling future pulls with the chip strip
    // sitting open under the machine.
    this._wireCollectionToggle();
    this.state.on('collection-updated', (newId, collection) => {
      this._renderCollection(collection, newId, /* pulse */ true);
      this._saveCollection();
    });
    // Restore any previously-collected prizes from localStorage so the
    // collection survives page refresh / coming back later.
    this._restoreCollection();

    // 6. Wire user controls.
    wireControls(this.host, this.controlBus);
    this.controlBus.on('crank', () => this._onCrank());
    this.controlBus.on('ball-click', () => runBallClick(this));
    this.controlBus.on('refill', () => this._onRefill());
  }

  // Single shared key — the prize library is chassis-independent, so a pull
  // from any machine should show up in the collection on every machine.
  static COLLECTION_KEY = 'gachapon:collection';

  _renderCollection(collection, newId, pulse) {
    if (!this.collectionHost) return;
    this.collectionHost.style.display = 'block';
    const count = Object.keys(collection).length;
    const countEl = this.collectionHost.querySelector('[data-collection-count]');
    if (countEl) countEl.textContent = String(count);
    if (pulse) {
      const toggle = this.collectionHost.querySelector('[data-collection-toggle]');
      if (toggle) {
        toggle.classList.remove('has-new');
        void toggle.offsetWidth;
        toggle.classList.add('has-new');
      }
    }
    renderChips(
      this.collectionHost.querySelector('[data-collection-chips]'),
      collection, newId,
      (prize) => this.reveal.open(prize),
    );
  }

  _saveCollection() {
    try {
      const counts = {};
      for (const [id, entry] of Object.entries(this.state.collection)) {
        counts[id] = entry.count;
      }
      localStorage.setItem(Machine.COLLECTION_KEY, JSON.stringify(counts));
    } catch (e) { /* quota / serialization — ignore */ }
  }

  _restoreCollection() {
    let counts;
    try {
      const raw = localStorage.getItem(Machine.COLLECTION_KEY);
      if (!raw) return;
      counts = JSON.parse(raw);
    } catch (e) { return; }
    if (!counts || typeof counts !== 'object') return;
    let restored = 0;
    for (const [id, count] of Object.entries(counts)) {
      const prize = this.prizeById.get(id);
      // Skip prizes that no longer exist in the library (deleted / renamed).
      if (!prize || !Number.isFinite(count) || count <= 0) continue;
      this.state.collection[id] = { count, prize };
      this.state.totalPulls += count;
      restored++;
    }
    if (restored === 0) return;
    this.$.led.textContent = `PULLS: ${this.state.totalPulls}`;
    this._renderCollection(this.state.collection, null, /* pulse */ false);
  }

  _wireCollectionToggle() {
    if (!this.collectionHost) return;
    const toggle = this.collectionHost.querySelector('[data-collection-toggle]');
    const chips = this.collectionHost.querySelector('[data-collection-chips]');
    if (!toggle || !chips) return;
    toggle.addEventListener('click', () => {
      const open = chips.hasAttribute('hidden') ? false : true;
      if (open) {
        chips.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('open');
      } else {
        chips.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('open');
        toggle.classList.remove('has-new');
      }
    });
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
