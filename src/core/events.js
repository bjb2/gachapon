// Tiny pub/sub EventEmitter. No dependencies.
export class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const set = this._listeners.get(event);
    if (set) set.delete(handler);
  }

  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (!set) return;
    // Snapshot to avoid mutation-during-iteration issues.
    for (const handler of [...set]) {
      try { handler(...args); } catch (e) { console.error(`[events] handler for "${event}" threw:`, e); }
    }
  }

  clear() { this._listeners.clear(); }
}
