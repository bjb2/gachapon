// WebAudio tone generator. Reads a machineDef.audio block and plays named cues.
// Each cue is either a single tone object or an array of tone objects with optional delayMs.
export class AudioBus {
  constructor(audioDef) {
    this.def = audioDef || {};
    this._ctx = null;
  }

  _ctx_() {
    if (!this._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this._ctx = new AC();
    }
    return this._ctx;
  }

  _tone({ freq = 300, dur = 0.1, type = 'sine', gain = 0.16 } = {}) {
    const ctx = this._ctx_();
    if (!ctx) return;
    try {
      const o = ctx.createOscillator();
      const v = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(Math.max(1, freq * 0.55), ctx.currentTime + dur);
      v.gain.setValueAtTime(gain, ctx.currentTime);
      v.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(v); v.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch (e) { /* swallow — audio is nonessential */ }
  }

  play(cueName) {
    const cue = this.def[cueName];
    if (!cue) return;
    const steps = Array.isArray(cue) ? cue : [cue];
    steps.forEach(step => {
      if (step.delayMs) setTimeout(() => this._tone(step), step.delayMs);
      else this._tone(step);
    });
  }
}
