// The dispense/ball-click flow extracted from Machine.js so both files stay small.
// Each helper takes the Machine instance as `m` and reads refs from m.$ and m.def.
import { applyBallStyle } from './ball-style.js';

export function runDispense(m) {
  if (m.physics.count() === 0) return;
  m.state.pulling = true;
  m._setHint('');

  const popped = m.physics.popBottom();
  if (!popped) { m.state.pulling = false; return; }
  const prize = m.prizeById.get(popped.prizeId);
  if (!prize) { m.state.pulling = false; return; }
  m.state.recordPull(prize);

  // Cascade remaining balls toward the chute.
  m.physics.jostle({ xMag: 0.014, yMag: 0.012, yBias: 0 });
  m._shake();

  m.$.trayHint.style.display = 'none';
  m.$.trayBall.className = 'tray-ball dropping';
  applyBallStyle(m.$.trayBall, prize.ballStyle);
  m.$.trayBall.style.display = 'block';
  m.$.trayBall.dataset.prizeId = prize.id;

  m.audio.play('dispense');

  m.$.trayBall.addEventListener('animationend', () => {
    m.$.trayBall.classList.remove('dropping');
    m.$.trayBall.classList.add('waiting');
    m._setHint('Click the ball to open it!');
    m.state.pulling = false;
    if (m.physics.count() === 0) m._showEmpty();
  }, { once: true });
}

export function runBallClick(m) {
  const b = m.$.trayBall;
  if (!b.classList.contains('waiting')) return;
  const prizeId = b.dataset.prizeId;
  if (!prizeId) return;
  b.classList.remove('waiting');
  b.classList.add('popping');
  m.audio.play('pop');
  b.addEventListener('animationend', () => {
    b.style.display = 'none';
    b.classList.remove('popping');
    m.$.trayHint.style.display = 'block';
    if (m.physics.count() > 0) {
      m.$.trayHint.textContent = `Turn ${m.def.controls.turnsNeeded}× to dispense!`;
    }
    const prize = m.prizeById.get(prizeId);
    if (prize) m.reveal.open(prize);
  }, { once: true });
}
