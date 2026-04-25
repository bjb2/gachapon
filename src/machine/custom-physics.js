// Matter.js physics for custom machines.
//
// Walls are derived from the hopper component shape (variant-aware) plus an
// auto-built funnel + chute path to the chute component. Mirrors the
// built-in trick where the funnel + chute live BELOW the visible canvas
// area so the dispense queue ("which ball drifted lowest?") stays out of
// sight; here we set up the same invisible plumbing and clip the visual
// to the hopper window via SVG (see custom-svg-renderer.js).
//
// Coordinates are in CANVAS units. Matter.js receives coordinates relative
// to the hopper's local origin (we transform: hopper.x/.y are subtracted)
// because the ball <canvas> sits inside the hopper <g> in the SVG.

// Cap how far below the hopper the funnel extends. Tight (40px) so the
// queued balls accumulate just barely below the hopper viewport — keeping
// most of the pool visibly bouncing inside the hopper rather than queued
// invisibly down a long chute. The chute marker can be placed anywhere
// the designer likes; physics doesn't follow it down past this cap.
const MAX_FUNNEL_DROP = 40;

export class CustomPhysics {
  constructor(machine) {
    this.machine = machine;
    this.hopper = machine.components.find(c => c.type === 'hopper');
    this.chute = machine.components.find(c => c.type === 'chute');
    if (!this.hopper) throw new Error('CustomPhysics: machine has no hopper');

    const { Engine, Runner } = window.Matter;
    const physics = machine.physics || {};
    this.engine = Engine.create({ gravity: { y: physics.gravity ?? 1.6 } });
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    this.world = this.engine.world;
    this.bodies = [];

    this._geo = this._deriveGeometry();
    this._buildWalls();
  }

  _deriveGeometry() {
    const h = this.hopper;
    const physics = this.machine.physics || {};
    const ballR = physics.ballRadiusPx ?? 14;
    const gapHalf = ballR + 3;

    // Hopper-local coords (origin at hopper top-left).
    const w = h.width, hh = h.height;

    // Chute exit position relative to hopper origin. If no chute, drop
    // straight down from hopper bottom-center.
    let exitX = w / 2;
    let exitY = hh + 30;
    let chuteHeight = 40;
    if (this.chute) {
      const chuteCenterX = (this.chute.x - h.x) + this.chute.width / 2;
      const chuteTopY = (this.chute.y - h.y);
      // Cap distance so a chute placed across the canvas doesn't produce a
      // crazy long slide.
      const dy = Math.min(chuteTopY - hh, MAX_FUNNEL_DROP);
      exitX = chuteCenterX;
      exitY = hh + Math.max(20, dy);
      chuteHeight = this.chute.height;
    }

    return {
      w, hh, ballR, gapHalf,
      // Funnel slopes from hopper bottom inward to the chute throat.
      funnelTopY: hh,
      funnelBotY: exitY,
      throatX: exitX,
      // Chute pipe extends below the throat; balls accumulate at its floor.
      chuteH: chuteHeight,
      // Ball-friendliness from machineDef.physics, with sane defaults.
      ballRestitution: physics.ballRestitution ?? 0.22,
      ballFriction: physics.ballFriction ?? 0.25,
      ballFrictionAir: physics.ballFrictionAir ?? 0.038,
      spawnCols: physics.ballSpawnGridCols ?? 5,
    };
  }

  _buildWalls() {
    const { Bodies, Composite } = window.Matter;
    const walls = [];
    this._addHopperWalls(walls);
    this._addFunnelAndChute(walls);
    Composite.add(this.world, walls);
  }

  _addHopperWalls(walls) {
    const { Bodies } = window.Matter;
    const h = this.hopper;
    const g = this._geo;

    switch (h.variant) {
      case 'box': {
        // Top wall (full width).
        walls.push(Bodies.rectangle(g.w / 2, 5, g.w - 6, 8, { isStatic: true, friction: 0.4 }));
        // Side walls full height.
        walls.push(Bodies.rectangle(3, g.hh / 2, 8, g.hh, { isStatic: true, friction: 0.4 }));
        walls.push(Bodies.rectangle(g.w - 3, g.hh / 2, 8, g.hh, { isStatic: true, friction: 0.4 }));
        break;
      }
      case 'cylinder': {
        // Pill: rounded ends + straight sides. Top arc + side walls + funnel takes over below.
        this._arcWall(walls, g.w / 2, g.w / 2, g.w / 2 - 4, Math.PI, 0, 16);
        walls.push(Bodies.rectangle(3, g.hh / 2, 8, g.hh, { isStatic: true, friction: 0.4 }));
        walls.push(Bodies.rectangle(g.w - 3, g.hh / 2, 8, g.hh, { isStatic: true, friction: 0.4 }));
        break;
      }
      case 'funnel': {
        // Top edge wall, then sloped sides converging to bottom 30%-65% width.
        walls.push(Bodies.rectangle(g.w / 2, 5, g.w - 6, 8, { isStatic: true, friction: 0.4 }));
        this._lineWall(walls, 3, 0, g.w * 0.35, g.hh, 8);
        this._lineWall(walls, g.w - 3, 0, g.w * 0.65, g.hh, 8);
        break;
      }
      case 'hourglass': {
        walls.push(Bodies.rectangle(g.w / 2, 5, g.w - 6, 8, { isStatic: true, friction: 0.4 }));
        // Waist gap = 30% of width so balls (typical d=28px) actually fit
        // through. Top half slopes inward to the waist, bottom half slopes
        // back out.
        this._lineWall(walls, 3, 0, g.w * 0.35, g.hh / 2, 8);
        this._lineWall(walls, g.w * 0.35, g.hh / 2, 0, g.hh, 8);
        this._lineWall(walls, g.w - 3, 0, g.w * 0.65, g.hh / 2, 8);
        this._lineWall(walls, g.w * 0.65, g.hh / 2, g.w, g.hh, 8);
        break;
      }
      case 'half-dome': {
        // Arch-window walls: a semicircle arch on top + straight vertical
        // sides connecting the arch to the bottom (open). Bottom is open
        // so balls fall through into the auto funnel.
        const archR = Math.min(g.w / 2, g.hh) - 4;
        const straightH = g.hh - archR - 4;
        // Left straight wall (only if there's a flat-side portion).
        if (straightH > 0) {
          walls.push(Bodies.rectangle(3, straightH + (g.hh - straightH) / 2, 8, g.hh - straightH,
            { isStatic: true, friction: 0.4 }));
          walls.push(Bodies.rectangle(g.w - 3, straightH + (g.hh - straightH) / 2, 8, g.hh - straightH,
            { isStatic: true, friction: 0.4 }));
        }
        // Semicircle arch on top — center at (w/2, archR + 4 from top), radius archR.
        const cx = g.w / 2;
        const cy = g.hh - archR; // arch's flat baseline (bottom of arch)
        const n = h.wallArcSegments || 24;
        let prev = { x: cx - archR, y: cy };
        for (let i = 1; i <= n; i++) {
          const a = -Math.PI + (Math.PI * i) / n;
          const x = cx + archR * Math.cos(a);
          const y = cy + archR * Math.sin(a);
          this._segmentWall(walls, prev.x, prev.y, x, y, 10);
          prev = { x, y };
        }
        break;
      }
      case 'dome':
      default: {
        // Upper half of an ellipse, plus side walls dropping to canvas bottom.
        const cx = g.w / 2, cy = g.hh / 2;
        const rx = g.w / 2 - 4, ry = g.hh / 2 - 4;
        // Approximate the upper half ellipse with N segments.
        const n = h.wallArcSegments || 24;
        let prev = { x: cx - rx, y: cy };
        for (let i = 1; i <= n; i++) {
          const a = -Math.PI + (Math.PI * i) / n;
          const x = cx + rx * Math.cos(a);
          const y = cy + ry * Math.sin(a);
          this._segmentWall(walls, prev.x, prev.y, x, y, 10);
          prev = { x, y };
        }
        // Side walls down from ellipse equator to bottom.
        const sideH = g.hh - cy;
        walls.push(Bodies.rectangle(3, cy + sideH / 2, 8, sideH, { isStatic: true, friction: 0.4 }));
        walls.push(Bodies.rectangle(g.w - 3, cy + sideH / 2, 8, sideH, { isStatic: true, friction: 0.4 }));
      }
    }
  }

  _segmentWall(walls, x1, y1, x2, y2, thick) {
    const { Bodies } = window.Matter;
    const len = Math.hypot(x2 - x1, y2 - y1);
    walls.push(Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, len + 2, thick, {
      isStatic: true, angle: Math.atan2(y2 - y1, x2 - x1),
      friction: 0.4, restitution: 0.15,
    }));
  }

  _lineWall(walls, x1, y1, x2, y2, thick) {
    this._segmentWall(walls, x1, y1, x2, y2, thick);
  }

  _arcWall(walls, cx, cy, r, angleStart, angleEnd, segments) {
    const step = (angleEnd - angleStart) / segments;
    let prev = { x: cx + r * Math.cos(angleStart), y: cy + r * Math.sin(angleStart) };
    for (let i = 1; i <= segments; i++) {
      const a = angleStart + step * i;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      this._segmentWall(walls, prev.x, prev.y, x, y, 10);
      prev = { x, y };
    }
  }

  _addFunnelAndChute(walls) {
    const { Bodies } = window.Matter;
    const g = this._geo;
    // Slopes from canvas bottom edges to throat.
    this._segmentWall(walls, 3, g.funnelTopY, g.throatX - g.gapHalf, g.funnelBotY, 8);
    this._segmentWall(walls, g.w - 3, g.funnelTopY, g.throatX + g.gapHalf, g.funnelBotY, 8);
    // Chute pipe walls.
    walls.push(Bodies.rectangle(g.throatX - g.gapHalf - 4, g.funnelBotY + g.chuteH / 2, 8, g.chuteH,
      { isStatic: true, friction: 0.1 }));
    walls.push(Bodies.rectangle(g.throatX + g.gapHalf + 4, g.funnelBotY + g.chuteH / 2, 8, g.chuteH,
      { isStatic: true, friction: 0.1 }));
    // Chute floor (catches the queued balls).
    walls.push(Bodies.rectangle(g.throatX, g.funnelBotY + g.chuteH + 5, g.gapHalf * 6, 10,
      { isStatic: true, friction: 0.6 }));
  }

  // ── Mirrors DomePhysics public API used by Machine + dispense flow ──
  spawnBalls(pool, prizeLookup) {
    const { Bodies, Composite } = window.Matter;
    this.clearBalls();
    const g = this._geo;
    const D = g.ballR * 2 + 4;
    const cols = g.spawnCols;
    const cx = g.w / 2;
    const leftEdge = cx - ((cols - 1) / 2) * D;
    pool.forEach((prizeId, i) => {
      const prize = prizeLookup(prizeId);
      if (!prize) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = leftEdge + col * D + (Math.random() - 0.5) * 8;
      const baseY = 22 + row * D;
      const y = baseY + (Math.random() - 0.5) * 4;
      const body = Bodies.circle(x, y, g.ballR, {
        restitution: g.ballRestitution,
        friction: g.ballFriction,
        frictionAir: g.ballFrictionAir,
      });
      body.prizeId = prizeId;
      body.ballStyle = prize.ballStyle;
      this.bodies.push(body);
      Composite.add(this.world, body);
    });
  }

  jostle({ xMag = 0.028, yMag = 0.012, yBias = 0.3 } = {}) {
    const { Body } = window.Matter;
    this.bodies.forEach(b => {
      Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * xMag,
        y: (Math.random() - yBias) * yMag,
      });
    });
  }

  popBottom() {
    const { Composite } = window.Matter;
    if (this.bodies.length === 0) return null;
    const bottom = this.bodies.reduce((max, b) => b.position.y > max.position.y ? b : max, this.bodies[0]);
    const idx = this.bodies.indexOf(bottom);
    this.bodies.splice(idx, 1);
    Composite.remove(this.world, bottom);
    return { prizeId: bottom.prizeId };
  }

  count() { return this.bodies.length; }
  geometry() { return this._geo; }

  clearBalls() {
    const { Composite } = window.Matter;
    this.bodies.forEach(b => Composite.remove(this.world, b));
    this.bodies = [];
  }

  stop() {
    const { Runner, Engine, World } = window.Matter;
    try { Runner.stop(this.runner); } catch (e) {}
    try { World.clear(this.world, false); } catch (e) {}
    try { Engine.clear(this.engine); } catch (e) {}
    this.bodies = [];
  }
}
