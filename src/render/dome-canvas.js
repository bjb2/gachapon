// Dome canvas draw loop. Paints each ball using the ballStyle stashed on its
// body (set during spawn in DomePhysics.spawnBalls).
//
// ballStyle = { type: 'capsule' | 'plain', color1, color2?, glow? }
//   capsule → iconic split-hemisphere gachapon capsule (rotates with body.angle)
//   plain   → single-color sphere with specular highlight
import { lighten, darken } from '../core/color.js';

export class DomeRenderer {
  constructor(canvas, physics, geometry) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.physics = physics;
    this.geo = geometry;
    canvas.width = geometry.canvasW;
    canvas.height = geometry.canvasH;
    this._running = true;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  stop() { this._running = false; }

  _loop() {
    if (!this._running) return;
    requestAnimationFrame(this._loop);
    const { ctx } = this;
    const { canvasW, canvasH, ballR } = this.geo;
    ctx.clearRect(0, 0, canvasW, canvasH);
    for (const b of this.physics.bodies) {
      if (b.position.y < canvasH + ballR) this._drawBall(b);
    }
  }

  _drawBall(b) {
    const style = b.ballStyle || { type: 'plain', color1: '#CCCCCC', glow: null };
    if (style.type === 'capsule') return this._drawCapsule(b, style);
    this._drawPlain(b, style);
  }

  _drawPlain(b, style) {
    const { ctx } = this;
    const r = this.geo.ballR;
    const { x, y } = b.position;
    const c = style.color1 || '#CCCCCC';

    ctx.save();
    if (style.glow) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = style.glow;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.fill();
      ctx.shadowBlur = 0;
    }

    const grad = ctx.createRadialGradient(x - r * 0.32, y - r * 0.38, r * 0.06, x, y, r);
    grad.addColorStop(0, lighten(c, 0.55));
    grad.addColorStop(0.55, c);
    grad.addColorStop(1, darken(c, 0.45));
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();

    // Specular highlight.
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.beginPath();
    ctx.ellipse(x - r * 0.3, y - r * 0.33, r * 0.33, r * 0.22, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.restore();
  }

  // Two-tone capsule — top hemisphere = color1, bottom hemisphere = color2.
  // Rotates with the body so the split visually spins as balls roll.
  _drawCapsule(b, style) {
    const { ctx } = this;
    const r = this.geo.ballR;
    const { x, y } = b.position;
    const c1 = style.color1 || '#FFD166';
    const c2 = style.color2 || '#FFFFFF';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(b.angle);

    if (style.glow) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = style.glow;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = c1; ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Clip to the ball circle so subsequent fills stay inside.
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();

    // Bottom hemisphere (color2 with a soft spherical shadow toward the bottom).
    ctx.fillStyle = c2;
    ctx.fillRect(-r, 0, r * 2, r + 1);
    const botShade = ctx.createRadialGradient(0, r * 0.3, 0, 0, 0, r);
    botShade.addColorStop(0.5, 'rgba(0,0,0,0)');
    botShade.addColorStop(1,   'rgba(0,0,0,0.18)');
    ctx.fillStyle = botShade;
    ctx.fillRect(-r, 0, r * 2, r + 1);

    // Top hemisphere (color1 with subtle crown lightening).
    const topGrad = ctx.createLinearGradient(0, -r, 0, 0);
    topGrad.addColorStop(0,    lighten(c1, 0.30));
    topGrad.addColorStop(0.15, c1);
    topGrad.addColorStop(0.65, c1);
    topGrad.addColorStop(1,    darken(c1, 0.25));
    ctx.fillStyle = topGrad;
    ctx.fillRect(-r, -r, r * 2, r);

    // Seam groove + highlight right above it.
    ctx.strokeStyle = 'rgba(0,0,0,0.20)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r, -1); ctx.lineTo(r, -1); ctx.stroke();

    // Specular highlight on top half.
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, -r * 0.45, r * 0.30, r * 0.16, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.fill();

    ctx.restore();
  }
}
