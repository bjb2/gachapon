import { EventEmitter } from './events.js';

// GachaState — pulls counter, collection, crank-turn progress.
// Emits: 'pulls-changed' (total), 'turns-changed' (turns, needed),
// 'collection-updated' (newId, collection), 'empty' (), 'reset' ().
export class GachaState extends EventEmitter {
  constructor({ turnsNeeded = 3 } = {}) {
    super();
    this.turnsNeeded = turnsNeeded;
    this.totalPulls = 0;
    this.turns = 0;
    this.pulling = false;
    this.collection = {}; // id → { count, prize }
  }

  tickCrank() {
    this.turns += 1;
    this.emit('turns-changed', this.turns, this.turnsNeeded);
    return this.turns >= this.turnsNeeded;
  }

  resetTurns() {
    this.turns = 0;
    this.emit('turns-changed', this.turns, this.turnsNeeded);
  }

  recordPull(prize) {
    this.totalPulls += 1;
    this.emit('pulls-changed', this.totalPulls);
    if (!this.collection[prize.id]) this.collection[prize.id] = { count: 0, prize };
    this.collection[prize.id].count += 1;
    this.emit('collection-updated', prize.id, this.collection);
  }

  markEmpty() { this.emit('empty'); }
  markReset() { this.emit('reset'); }
}
