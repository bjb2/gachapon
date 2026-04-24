// deriveGeometry(machineDef) — turns the MachineDef dome/physics block into the
// full set of derived values used by CSS custom properties, canvas sizing, and
// Matter.js body placement. Single source of truth; CSS and physics both read
// from this so they cannot drift.
export function deriveGeometry(machineDef) {
  const dome = machineDef.dome;
  const physics = machineDef.physics;
  const layout = machineDef.layout || 'dome';

  const domeW = dome.widthPx;           // outer shell width
  const domeH = dome.heightPx;          // outer shell height
  const border = 3;                     // shell border thickness
  const canvasW = domeW - border * 2;
  const canvasH = domeH - border;       // shell has no bottom border, canvas offset top:3 left:3

  const arcR = dome.borderRadiusPx - border; // inner radius inside the border
  const arcCx = canvasW / 2;
  const arcCy = arcR;                   // for dome: center so arc bottom meets canvas middle

  const ballR = dome.ballRadiusPx;
  const nArc = dome.wallArcSegments;
  const spawnCols = dome.ballSpawnGridCols;

  const gapHalf = ballR + 3;            // chute opening half-width
  const funnelTopY = canvasH;           // funnel slopes start at canvas bottom (hidden)
  const funnelBotY = canvasH + physics.funnelDropPx;
  const chuteH = physics.chuteHeightPx;

  return {
    layout,
    domeW, domeH, border,
    canvasW, canvasH,
    arcR, arcCx, arcCy,
    ballR, nArc, spawnCols,
    gapHalf, funnelTopY, funnelBotY, chuteH,
    gravity: physics.gravity,
    ballRestitution: physics.ballRestitution,
    ballFriction: physics.ballFriction,
    ballFrictionAir: physics.ballFrictionAir,
  };
}

// Project geometry into CSS custom properties that the skin reads.
export function geometryToCssVars(geo, machineDef) {
  return {
    '--dome-width': `${geo.domeW}px`,
    '--dome-height': `${geo.domeH}px`,
    '--dome-radius': `${machineDef.dome.borderRadiusPx}px`,
    '--canvas-width': `${geo.canvasW}px`,
    '--canvas-height': `${geo.canvasH}px`,
    '--ball-radius': `${geo.ballR}px`,
  };
}
