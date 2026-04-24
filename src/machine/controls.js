// Wires click/touch handlers for the crank, tray ball, and refill button.
// Emits high-level events on the provided bus: 'crank', 'ball-click', 'refill'.
export function wireControls(root, bus) {
  const crank = root.querySelector('[data-crank]');
  const trayBall = root.querySelector('[data-tray-ball]');
  const refill = root.querySelector('[data-refill]');

  const fire = (name) => (e) => {
    if (e && e.type === 'touchend') e.preventDefault();
    bus.emit(name);
  };

  const onCrank = fire('crank');
  crank.addEventListener('click', onCrank);
  crank.addEventListener('touchend', onCrank);

  const onBall = fire('ball-click');
  trayBall.addEventListener('click', onBall);
  trayBall.addEventListener('touchend', onBall);

  refill.addEventListener('click', fire('refill'));
}
