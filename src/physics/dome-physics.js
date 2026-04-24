// Matter.js dome physics. Reads geometry from deriveGeometry(). Matter is a global
// loaded via CDN <script>; we pull it from window.Matter at call time.
export class DomePhysics {
  constructor(geometry) {
    this.geo = geometry;
    const { Engine, Runner, Composite } = window.Matter;
    this.engine = Engine.create({ gravity: { y: geometry.gravity } });
    this.runner = Runner.create();
    Runner.run(this.runner, this.engine);
    this.world = this.engine.world;
    this.bodies = []; // dynamic ball bodies
    this._buildWalls();
  }

  _buildWalls() {
    if (this.geo.layout === 'box') {
      this._buildBoxWalls();
    } else {
      this._buildDomeWalls();
    }
  }

  _buildDomeWalls() {
    const { Bodies, Composite } = window.Matter;
    const g = this.geo;
    const walls = [];

    // Upper dome arc — N segments of a semicircle.
    for (let i = 0; i < g.nArc; i++) {
      const a1 = -Math.PI + Math.PI * i / g.nArc;
      const a2 = -Math.PI + Math.PI * (i + 1) / g.nArc;
      const x1 = g.arcCx + g.arcR * Math.cos(a1);
      const y1 = g.arcCy + g.arcR * Math.sin(a1);
      const x2 = g.arcCx + g.arcR * Math.cos(a2);
      const y2 = g.arcCy + g.arcR * Math.sin(a2);
      walls.push(Bodies.rectangle(
        (x1 + x2) / 2, (y1 + y2) / 2,
        Math.hypot(x2 - x1, y2 - y1) + 2, 10,
        { isStatic: true, angle: Math.atan2(y2 - y1, x2 - x1), friction: 0.4, restitution: 0.15 }
      ));
    }

    // Side walls bridge arc endpoints down to canvas bottom.
    const sideH = g.canvasH - g.arcCy;
    const sideMY = g.arcCy + sideH / 2;
    walls.push(Bodies.rectangle(3, sideMY, 8, sideH, { isStatic: true, friction: 0.4 }));
    walls.push(Bodies.rectangle(g.canvasW - 3, sideMY, 8, sideH, { isStatic: true, friction: 0.4 }));

    this._addFunnelAndChute(walls);
    Composite.add(this.world, walls);
  }

  _buildBoxWalls() {
    const { Bodies, Composite } = window.Matter;
    const g = this.geo;
    const walls = [];

    // Straight top wall.
    walls.push(Bodies.rectangle(g.canvasW / 2, 5, g.canvasW - 6, 8,
      { isStatic: true, friction: 0.4, restitution: 0.15 }));

    // Full-height side walls (straight, no arc).
    walls.push(Bodies.rectangle(3, g.funnelTopY / 2, 8, g.funnelTopY,
      { isStatic: true, friction: 0.4 }));
    walls.push(Bodies.rectangle(g.canvasW - 3, g.funnelTopY / 2, 8, g.funnelTopY,
      { isStatic: true, friction: 0.4 }));

    this._addFunnelAndChute(walls);
    Composite.add(this.world, walls);
  }

  _addFunnelAndChute(walls) {
    const { Bodies } = window.Matter;
    const g = this.geo;

    // Funnel slopes — converge from canvas bottom edges to center throat.
    const lx1 = 3, ly1 = g.funnelTopY;
    const lx2 = g.arcCx - g.gapHalf, ly2 = g.funnelBotY;
    walls.push(Bodies.rectangle((lx1 + lx2) / 2, (ly1 + ly2) / 2,
      Math.hypot(lx2 - lx1, ly2 - ly1) + 2, 8,
      { isStatic: true, angle: Math.atan2(ly2 - ly1, lx2 - lx1), friction: 0.5, restitution: 0.08 }));
    const rx1 = g.canvasW - 3, ry1 = g.funnelTopY;
    const rx2 = g.arcCx + g.gapHalf, ry2 = g.funnelBotY;
    walls.push(Bodies.rectangle((rx1 + rx2) / 2, (ry1 + ry2) / 2,
      Math.hypot(rx2 - rx1, ry2 - ry1) + 2, 8,
      { isStatic: true, angle: Math.atan2(ry2 - ry1, rx2 - rx1), friction: 0.5, restitution: 0.08 }));

    // Chute walls — narrow vertical pipe below funnel throat.
    walls.push(Bodies.rectangle(g.arcCx - g.gapHalf - 4, g.funnelBotY + g.chuteH / 2, 8, g.chuteH,
      { isStatic: true, friction: 0.1 }));
    walls.push(Bodies.rectangle(g.arcCx + g.gapHalf + 4, g.funnelBotY + g.chuteH / 2, 8, g.chuteH,
      { isStatic: true, friction: 0.1 }));
    walls.push(Bodies.rectangle(g.arcCx, g.funnelBotY + g.chuteH + 5, g.gapHalf * 6, 10,
      { isStatic: true, friction: 0.6 }));
  }

  // Spawn balls for the given pool (array of prize ids). Each ball carries its
  // prizeId + a copy of the prize's ballStyle object for the renderer.
  spawnBalls(pool, prizeLookup) {
    const { Bodies, Composite } = window.Matter;
    this.clearBalls();
    const g = this.geo;
    const D = g.ballR * 2 + 4;
    const cols = g.spawnCols;
    // Center the first column so the grid stays visually balanced whatever
    // the column count is.
    const leftEdge = g.arcCx - ((cols - 1) / 2) * D;
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

  stop() {
    const { Runner, Engine, World } = window.Matter;
    try { Runner.stop(this.runner); } catch (e) { /* ignore */ }
    try { World.clear(this.world, false); } catch (e) { /* ignore */ }
    try { Engine.clear(this.engine); } catch (e) { /* ignore */ }
    this.bodies = [];
  }

  clearBalls() {
    const { Composite } = window.Matter;
    this.bodies.forEach(b => Composite.remove(this.world, b));
    this.bodies = [];
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

  // Pop the lowest visible ball (highest y). Returns { prizeId } or null.
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
}
