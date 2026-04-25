// Runtime machine class for designer-authored custom-machine specs. Parallel
// to Machine.js — same public surface (mount, _onCrank, dispense, etc.) so
// it can be slotted into the play page without changes elsewhere.

import { renderMachineSvg } from './custom-svg-renderer.js';
import { CustomPhysics } from './custom-physics.js';
import { GachaState } from '../core/state.js';
import { EventEmitter } from '../core/events.js';
import { AudioBus } from '../render/audio.js';
import { RevealModal } from '../reveal/modal.js';
import { renderChips } from '../collection/chips.js';
import { applyBallStyle } from './ball-style.js';
import { buildPool } from '../core/pool.js';

export class CustomMachine {
  constructor({ machineDef, prizes, rarities, host, collectionHost, hintHost }) {
    this.def = machineDef;
    this.prizes = prizes;
    this.rarities = rarities;
    this.prizeById = new Map(prizes.map(p => [p.id, p]));
    this.host = host;
    this.collectionHost = collectionHost;
    this.hintHost = hintHost;
    const turns = (machineDef.controls && machineDef.controls.turnsNeeded) || 3;
    this.state = new GachaState({ turnsNeeded: turns });
    this.audio = new AudioBus(machineDef.audio || {
      click: { freq: 440, dur: 0.06, type: 'sine', gain: 0.09 },
      dispense: [{ freq: 330, dur: 0.14, type: 'sine', gain: 0.12 }],
      pop: [{ freq: 550, dur: 0.04, type: 'sine', gain: 0.11 }],
    });
    this.controlBus = new EventEmitter();
    this.crankRotation = 0;
  }

  static COLLECTION_KEY = 'gachapon:collection';

  mount() {
    document.documentElement.dataset.skin = 'custom';
    this.host.classList.add('machine-wrap', 'cm-wrap');

    // 1. Paint the SVG chassis. playMode hides the chute marker (the
    // dispense flow handles ball-exit visualization via the tray-ball).
    this.host.innerHTML = renderMachineSvg(this.def, { playMode: true });

    this.$ = {
      svg:        this.host.querySelector('svg.cm-svg'),
      canvas:     this.host.querySelector('[data-dome-canvas]'),
      crank:      this.host.querySelector('[data-crank]'),
      led:        this.host.querySelector('[data-led]'),
      dots:       [...this.host.querySelectorAll('[data-dots-group] [data-dot]')],
      tray:       this.host.querySelector('[data-tray]'),
      trayHint:   this.host.querySelector('[data-tray-hint]'),
      trayBall:   this.host.querySelector('[data-tray-ball]'),
    };
    if (!this.$.canvas) throw new Error('CustomMachine: hopper missing — every machine needs one');

    const dotsGroup = this.host.querySelector('[data-dots-group]');
    this._dotLitColor = dotsGroup ? dotsGroup.dataset.litColor : '#CC0000';
    this._dotDimColor = dotsGroup ? dotsGroup.dataset.dimColor : '#E4E0E0';

    // 2. Physics + ball renderer. Geometry is hopper-local (the ball canvas
    // sits inside the hopper <g>).
    this.physics = new CustomPhysics(this.def);
    this.renderer = new SimpleBallRenderer(this.$.canvas, this.physics);
    this._spawnPool();

    // 3. Size the tray ball from the actual ball diameter so it visually
    // matches the balls bouncing in the hopper.
    if (this.$.trayBall) {
      const d = this.physics.geometry().ballR * 2;
      this.$.trayBall.style.width = d + 'px';
      this.$.trayBall.style.height = d + 'px';
    }

    // 3. Reveal modal + state subs.
    this.reveal = new RevealModal(this.rarities);
    this.reveal.onClosed(() => {
      if (this.physics.count() === 0 && !this.state.pulling) {
        this._setHint('Machine empty! Refresh to refill.');
      }
    });
    this.state.on('pulls-changed', (n) => { if (this.$.led) this.$.led.textContent = `PULLS: ${n}`; });
    this.state.on('turns-changed', (t) => { this._updateDots(t); });

    this._wireCollectionToggle();
    this.state.on('collection-updated', (newId, collection) => {
      this._renderCollection(collection, newId, true);
      this._saveCollection();
    });
    this._restoreCollection();

    // 4. Wire controls.
    this._wireControls();
  }

  _wireControls() {
    if (this.$.crank) {
      this.$.crank.style.cursor = 'pointer';
      this.$.crank.addEventListener('click', () => this._onCrank());
    }
    if (this.$.trayBall) {
      this.$.trayBall.addEventListener('click', () => this._onTrayBallClick());
    }
  }

  _spawnPool() {
    const pool = buildPool(this.prizes, this.rarities, this.def.poolSize || 25);
    this.physics.spawnBalls(pool, (id) => this.prizeById.get(id));
  }

  _updateDots(turns) {
    this.$.dots.forEach((d, i) => {
      d.setAttribute('fill', i < turns ? this._dotLitColor : this._dotDimColor);
    });
  }
  _setHint(text) { if (this.hintHost) this.hintHost.textContent = text; }

  _onCrank() {
    if (this.state.pulling) return;
    if (this.physics.count() === 0) return;
    const ready = this.state.tickCrank();
    this.crankRotation += (this.def.controls && this.def.controls.crankRotationPerTurn) || 120;
    if (this.$.crank) this.$.crank.setAttribute('transform-origin', 'center');
    this.physics.jostle({ xMag: 0.028, yMag: 0.012, yBias: 0.3 });
    this.audio.play('click');
    if (ready) {
      this.state.resetTurns();
      setTimeout(() => this._runDispense(), 180);
    } else {
      this._setHint(this.state.turns === 1 ? 'Keep turning...' : 'One more turn!');
    }
  }

  _runDispense() {
    if (this.physics.count() === 0) return;
    this.state.pulling = true;
    this._setHint('');
    const popped = this.physics.popBottom();
    if (!popped) { this.state.pulling = false; return; }
    const prize = this.prizeById.get(popped.prizeId);
    if (!prize) { this.state.pulling = false; return; }
    this.state.recordPull(prize);
    this.physics.jostle({ xMag: 0.014, yMag: 0.012, yBias: 0 });

    if (this.$.trayHint) this.$.trayHint.style.display = 'none';
    if (this.$.trayBall) {
      this.$.trayBall.style.display = 'block';
      applyBallStyle(this.$.trayBall, prize.ballStyle);
      this.$.trayBall.dataset.prizeId = prize.id;
    }
    this.audio.play('dispense');
    this._setHint('Click the ball to open it!');
    this.state.pulling = false;
    if (this.physics.count() === 0) this._setHint('Machine empty!');
  }

  _onTrayBallClick() {
    const b = this.$.trayBall;
    if (!b || b.style.display === 'none') return;
    const prizeId = b.dataset.prizeId;
    if (!prizeId) return;
    this.audio.play('pop');
    b.style.display = 'none';
    if (this.$.trayHint) this.$.trayHint.style.display = 'block';
    const prize = this.prizeById.get(prizeId);
    if (prize) this.reveal.open(prize);
  }

  // ── Collection persistence (mirrors Machine.js) ─────────────────────
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
      for (const [id, entry] of Object.entries(this.state.collection)) counts[id] = entry.count;
      localStorage.setItem(CustomMachine.COLLECTION_KEY, JSON.stringify(counts));
    } catch (e) {}
  }
  _restoreCollection() {
    let counts;
    try {
      const raw = localStorage.getItem(CustomMachine.COLLECTION_KEY);
      if (!raw) return;
      counts = JSON.parse(raw);
    } catch (e) { return; }
    if (!counts || typeof counts !== 'object') return;
    let restored = 0;
    for (const [id, count] of Object.entries(counts)) {
      const prize = this.prizeById.get(id);
      if (!prize || !Number.isFinite(count) || count <= 0) continue;
      this.state.collection[id] = { count, prize };
      this.state.totalPulls += count;
      restored++;
    }
    if (restored === 0) return;
    if (this.$.led) this.$.led.textContent = `PULLS: ${this.state.totalPulls}`;
    this._renderCollection(this.state.collection, null, false);
  }
  _wireCollectionToggle() {
    if (!this.collectionHost) return;
    const toggle = this.collectionHost.querySelector('[data-collection-toggle]');
    const chips = this.collectionHost.querySelector('[data-collection-chips]');
    if (!toggle || !chips) return;
    toggle.addEventListener('click', () => {
      const open = !chips.hasAttribute('hidden');
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

  destroy() {
    try { this.renderer && this.renderer.stop(); } catch (e) {}
    try { this.physics && this.physics.stop(); } catch (e) {}
    if (this.reveal && this.reveal.root && this.reveal.root.parentNode) {
      this.reveal.root.parentNode.removeChild(this.reveal.root);
    }
    if (this.host) this.host.innerHTML = '';
  }
}

// Minimal Matter.js ball renderer that paints onto the hopper's clipped
// canvas. Doesn't need to know about chassis bodies — it just draws the
// dynamic ball circles.
class SimpleBallRenderer {
  constructor(canvas, physics) {
    this.canvas = canvas;
    this.physics = physics;
    this.ctx = canvas.getContext('2d');
    this._raf = 0;
    this._loop = this._loop.bind(this);
    this._loop();
  }
  _loop() {
    this._raf = requestAnimationFrame(this._loop);
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const b of this.physics.bodies) {
      const r = b.circleRadius;
      const style = b.ballStyle || {};
      if (style.type === 'plain') {
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, r, 0, Math.PI * 2);
        ctx.fillStyle = style.color1 || '#FFD166';
        ctx.fill();
        if (style.glow) {
          ctx.shadowColor = style.glow;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Capsule: top half c1, bottom half c2 with a divider line.
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle || 0);
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, 0);
        ctx.fillStyle = style.color1 || '#FFD166';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.fillStyle = style.color2 || '#FF6B9D';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
        if (style.glow) {
          ctx.shadowColor = style.glow;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    }
  }
  stop() { cancelAnimationFrame(this._raf); }
}
