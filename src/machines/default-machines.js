// Default MachineDefs. Each has a layout ('dome' | 'box') and skin name.
// Rarity tiers and ball styling live outside the machine (global rarities list +
// per-prize ballStyle object), so a single prize library pours into any chassis.
//
// `poolSize` — how many balls spawn in the dome on refill. Capped at 25 by the
// creator UI to keep physics stable in the smaller domes.
export const DEFAULT_MACHINES = [
  {
    id: 'valkyrie',
    name: 'Valkyrie X Truck',
    version: 2,
    skin: 'valkyrie',
    layout: 'box',
    brandLabel: 'VALKYRIE',
    poolSize: 60,
    dome: {
      widthPx: 256,
      heightPx: 190,
      borderRadiusPx: 8,
      wallArcSegments: 22,
      ballRadiusPx: 14,
      ballSpawnGridCols: 5,
    },
    physics: {
      gravity: 1.6,
      ballRestitution: 0.22,
      ballFriction: 0.25,
      ballFrictionAir: 0.038,
      funnelDropPx: 32,
      chuteHeightPx: 52,
    },
    controls: {
      turnsNeeded: 3,
      crankRotationPerTurn: 120,
    },
    audio: {
      click:    { freq: 440, dur: 0.06, type: 'sine', gain: 0.09 },
      dispense: [{ freq: 330, dur: 0.14, type: 'sine', gain: 0.12 }, { freq: 260, dur: 0.18, type: 'sine', gain: 0.09, delayMs: 80 }],
      pop:      [{ freq: 550, dur: 0.04, type: 'sine', gain: 0.11 }, { freq: 740, dur: 0.10, type: 'sine', gain: 0.14, delayMs: 40 }],
    },
  },

  {
    id: 'classic',
    name: 'Lucky Gacha',
    version: 3,
    skin: 'classic',
    layout: 'dome',
    brandLabel: '★ LUCKY GACHA ★',
    poolSize: 15,
    dome: {
      widthPx: 230,
      heightPx: 155,
      borderRadiusPx: 115,
      wallArcSegments: 22,
      ballRadiusPx: 16,
      ballSpawnGridCols: 5,
    },
    physics: {
      gravity: 2.2,
      ballRestitution: 0.12,
      ballFriction: 0.28,
      ballFrictionAir: 0.042,
      funnelDropPx: 35,
      chuteHeightPx: 55,
    },
    controls: {
      turnsNeeded: 3,
      crankRotationPerTurn: 120,
    },
    audio: {
      click:    { freq: 320, dur: 0.07, type: 'square', gain: 0.11 },
      dispense: [{ freq: 230, dur: 0.16, type: 'sine', gain: 0.14 }, { freq: 180, dur: 0.20, type: 'sine', gain: 0.11, delayMs: 90 }],
      pop:      [{ freq: 460, dur: 0.04, type: 'square', gain: 0.14 }, { freq: 680, dur: 0.11, type: 'sine', gain: 0.17, delayMs: 45 }],
    },
  },

  {
    id: 'noir',
    name: 'DEPOT No.7',
    version: 3,
    skin: 'noir',
    layout: 'box',
    brandLabel: '[ DEPOT No.7 ]',
    poolSize: 15,
    dome: {
      widthPx: 256,
      heightPx: 200,
      borderRadiusPx: 4,
      wallArcSegments: 22,
      ballRadiusPx: 15,
      ballSpawnGridCols: 5,
    },
    physics: {
      gravity: 2.8,
      ballRestitution: 0.08,
      ballFriction: 0.35,
      ballFrictionAir: 0.055,
      funnelDropPx: 30,
      chuteHeightPx: 50,
    },
    controls: {
      turnsNeeded: 2,
      crankRotationPerTurn: 180,
    },
    audio: {
      click:    { freq: 180, dur: 0.09, type: 'square', gain: 0.13 },
      dispense: [{ freq: 140, dur: 0.22, type: 'sine', gain: 0.16 }, { freq: 110, dur: 0.28, type: 'sine', gain: 0.12, delayMs: 110 }],
      pop:      [{ freq: 280, dur: 0.06, type: 'square', gain: 0.15 }, { freq: 420, dur: 0.12, type: 'sine', gain: 0.14, delayMs: 55 }],
    },
  },

  {
    id: 'cyber',
    name: 'SYNTH-X 404',
    version: 2,
    skin: 'cyber',
    layout: 'dome',
    brandLabel: '◈ SYNTH-X 404 ◈',
    poolSize: 16,
    dome: {
      widthPx: 250,
      heightPx: 168,
      borderRadiusPx: 125,
      wallArcSegments: 24,
      ballRadiusPx: 15,
      ballSpawnGridCols: 5,
    },
    physics: {
      gravity: 2.5,
      ballRestitution: 0.18,
      ballFriction: 0.22,
      ballFrictionAir: 0.038,
      funnelDropPx: 38,
      chuteHeightPx: 58,
    },
    controls: {
      turnsNeeded: 4,
      crankRotationPerTurn: 90,
    },
    audio: {
      click:    { freq: 520, dur: 0.05, type: 'square', gain: 0.09 },
      dispense: [{ freq: 440, dur: 0.12, type: 'sine', gain: 0.12 }, { freq: 660, dur: 0.16, type: 'sine', gain: 0.09, delayMs: 70 }],
      pop:      [{ freq: 880, dur: 0.03, type: 'square', gain: 0.12 }, { freq: 1100, dur: 0.09, type: 'sine', gain: 0.15, delayMs: 35 }],
    },
  },

  {
    id: 'forest',
    name: 'Mori no Tama',
    version: 2,
    skin: 'forest',
    layout: 'dome',
    brandLabel: '✦ 森の玉 ✦',
    poolSize: 15,
    dome: {
      widthPx: 240,
      heightPx: 160,
      borderRadiusPx: 120,
      wallArcSegments: 22,
      ballRadiusPx: 16,
      ballSpawnGridCols: 5,
    },
    physics: {
      gravity: 1.8,
      ballRestitution: 0.16,
      ballFriction: 0.30,
      ballFrictionAir: 0.048,
      funnelDropPx: 32,
      chuteHeightPx: 52,
    },
    controls: {
      turnsNeeded: 3,
      crankRotationPerTurn: 120,
    },
    audio: {
      click:    { freq: 260, dur: 0.08, type: 'sine', gain: 0.10 },
      dispense: [{ freq: 196, dur: 0.18, type: 'sine', gain: 0.13 }, { freq: 155, dur: 0.24, type: 'sine', gain: 0.10, delayMs: 100 }],
      pop:      [{ freq: 392, dur: 0.05, type: 'sine', gain: 0.12 }, { freq: 523, dur: 0.13, type: 'sine', gain: 0.15, delayMs: 50 }],
    },
  },

  {
    id: 'modern',
    name: 'Capsule World',
    version: 4,
    skin: 'modern',
    layout: 'box',
    brandLabel: 'ISUZU',
    poolSize: 60,
    dome: {
      widthPx: 256,
      heightPx: 190,
      borderRadiusPx: 8,
      wallArcSegments: 22,
      ballRadiusPx: 15,
      ballSpawnGridCols: 5,
    },
    physics: {
      gravity: 1.6,
      ballRestitution: 0.22,
      ballFriction: 0.25,
      ballFrictionAir: 0.038,
      funnelDropPx: 32,
      chuteHeightPx: 52,
    },
    controls: {
      turnsNeeded: 3,
      crankRotationPerTurn: 120,
    },
    audio: {
      click:    { freq: 440, dur: 0.06, type: 'sine', gain: 0.09 },
      dispense: [{ freq: 330, dur: 0.14, type: 'sine', gain: 0.12 }, { freq: 260, dur: 0.18, type: 'sine', gain: 0.09, delayMs: 80 }],
      pop:      [{ freq: 550, dur: 0.04, type: 'sine', gain: 0.11 }, { freq: 740, dur: 0.10, type: 'sine', gain: 0.14, delayMs: 40 }],
    },
  },
];

export const MAX_POOL_SIZE = 60;
export const MIN_POOL_SIZE = 3;
