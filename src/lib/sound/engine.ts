import { buildBus, MASTER, prewarm, type Bus } from './bus';
import { CUES, note, type CueDef, type CueName } from './cues';

/**
 * The site's sound engine: one AudioContext, created on the first gesture, one shared signal chain (bus.ts), the
 * cue library (cues.ts) and three continuous voices (loader drone, electrical hum, paper drag).
 *
 * Rules it keeps:
 *  - Silent until the visitor does something. Browsers refuse audio before a gesture, so cues are dropped, never
 *    queued, until the context is running; a stale burst never plays at the first click.
 *  - On by default once unlocked, and one switch (SoundToggle) turns everything off. The choice is remembered.
 *  - Everything is synthesised. No files, so nothing for the CSP (media-src 'self') to block and nothing to load.
 *  - Never throws into the UI: every entry point is guarded.
 *  - Sleeps in a hidden tab, and tears down continuous voices when they go quiet so nothing idles on the audio thread.
 */

const KEY = 'cs-sound';

export type SoundStatus = 'off' | 'locked' | 'on';

export interface PlayOpts {
  /** -1..1 */
  pan?: number;
  /** Level multiplier, default 1. */
  gain?: number;
  /** Scale-degree offset for pitched cues. */
  deg?: number;
  /** Seconds, for cues that stretch. */
  dur?: number;
  /** 1 rising, -1 falling. */
  dir?: 1 | -1;
}

const readPref = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
};
/** True only if the visitor turned sound on themselves at some point (the toggle writes "on"). */
const readExplicitOn = (): boolean => {
  try {
    return window.localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
};
const writePref = (on: boolean) => {
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode, blocked storage: the choice just doesn't persist */
  }
};

type AutoplayNavigator = Navigator & { getAutoplayPolicy?: (type: string) => string };

interface Hum {
  oscs: OscillatorNode[];
  lp: BiquadFilterNode;
  gain: GainNode;
}
interface Buzz {
  saw: OscillatorNode;
  bp: BiquadFilterNode;
  gain: GainNode;
  noise: AudioBufferSourceNode;
  crackle: GainNode;
}
interface Drag {
  noise: AudioBufferSourceNode;
  bp: BiquadFilterNode;
  gain: GainNode;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bus: Bus | null = null;
  private enabled = true;
  private inited = false;
  /** Set inside a gesture so cues scheduled in the same tick are allowed before the context reports "running". */
  private unlockingUntil = 0;
  private listeners = new Set<() => void>();
  private last: Partial<Record<CueName, number>> = {};
  private inflight = 0;
  private quietUntil = 0;
  private pointerAt = 0;

  private hum: Hum | null = null;
  private humWanted = false;
  private humP = 0;
  private buzzV: Buzz | null = null;
  private buzzTimer = 0;
  private dragV: Drag | null = null;
  private dragTimer = 0;
  private dragTeardown = 0;

  /* ── lifecycle ──────────────────────────────────────────────────────────── */

  /** Read the saved choice and attach the page-level listeners. Safe to call more than once. */
  init = () => {
    if (this.inited || typeof window === 'undefined') return;
    this.inited = true;
    this.enabled = readPref();
    // Do the buffer arithmetic in an idle moment so the first tap does not pay for it (see bus.ts).
    if (this.enabled) {
      const idle = (window as unknown as { requestIdleCallback?: (fn: () => void) => number }).requestIdleCallback;
      if (idle) idle(() => prewarm());
      else window.setTimeout(() => prewarm(), 600);
    }
    document.addEventListener('visibilitychange', () => {
      const c = this.ctx;
      if (!c) return;
      if (document.hidden) {
        void c.suspend().catch(() => {});
      } else if (this.enabled && c.state === 'suspended') {
        void c.resume().catch(() => {});
      }
    });
    // Sound before any gesture only for a visitor who switched it on themselves earlier, where the browser allows
    // it, and never in a hidden tab. Everyone else gets sound from their first tap.
    const policy = (navigator as AutoplayNavigator).getAutoplayPolicy?.('audiocontext');
    if (policy === 'allowed' && this.enabled && readExplicitOn() && !document.hidden) this.unlock();
    this.notify();
  };

  /** Create or resume the context. Must be called from a gesture handler (pointerdown, keydown, touchend, click). */
  unlock = () => {
    if (typeof window === 'undefined' || !this.enabled) return;
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor({ latencyHint: 'interactive' });
        this.bus = buildBus(this.ctx);
        this.ctx.addEventListener('statechange', () => {
          if (this.ctx?.state === 'running') this.afterRunning();
          this.notify();
        });
      }
      this.unlockingUntil = performance.now() + 300;
      const c = this.ctx;
      if (c.state !== 'running') void c.resume().catch(() => {});
      this.afterRunning();
      this.notify();
    } catch {
      /* no audio on this device: everything stays a silent no-op */
    }
  };

  private afterRunning() {
    if (this.humWanted) this.startHum();
  }

  private ready(): boolean {
    const c = this.ctx;
    if (!this.enabled || !c || !this.bus || c.state === 'closed' || document.hidden) return false;
    return c.state === 'running' || performance.now() < this.unlockingUntil;
  }

  /* ── state for the UI ───────────────────────────────────────────────────── */

  getStatus = (): SoundStatus => {
    return !this.enabled ? 'off' : this.ctx?.state === 'running' ? 'on' : 'locked';
  };

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  private notify() {
    for (const fn of this.listeners) fn();
  }

  isEnabled = () => this.enabled;

  setEnabled = (on: boolean) => {
    if (on === this.enabled) return;
    if (on) {
      this.enabled = true;
      writePref(true);
      this.fadeMaster(MASTER * this.volume, 0.01);
      this.unlock();
      this.play('toggleOn');
    } else {
      // Mute means mute: fade the master out so cues already in flight (a lift, a reverb tail) stop too.
      this.enabled = false;
      writePref(false);
      this.fadeMaster(0, 0.015);
      this.stopHum(0.2);
      this.stopBuzz();
      this.stopDrag();
    }
    this.notify();
  };

  toggle = () => this.setEnabled(!this.enabled);

  private volume = 1;

  private fadeMaster(level: number, timeConstant: number) {
    const b = this.bus;
    const c = this.ctx;
    if (!b || !c) return;
    const t = c.currentTime;
    b.master.gain.cancelScheduledValues(t);
    b.master.gain.setTargetAtTime(level, t, timeConstant);
  }

  /** 0..1.5, for the sound lab; not persisted. */
  setVolume = (v: number) => {
    this.volume = Math.min(1.5, Math.max(0, v));
    if (this.enabled) this.fadeMaster(MASTER * this.volume, 0.02);
  };

  /** Mute ambient cues (hover, section) for a while, e.g. during a programmatic scroll. */
  quiet = (ms: number) => {
    this.quietUntil = Math.max(this.quietUntil, performance.now() + ms);
  };
  isQuiet = () => performance.now() < this.quietUntil;

  /** SoundLayer reports every real pointer move (and a touch landing) here. */
  notePointer = () => {
    this.pointerAt = performance.now();
  };
  /** True when the pointer itself acted in the last `ms`; false when content merely slid under a still cursor. */
  pointerRecent = (ms = 140) => performance.now() - this.pointerAt < ms;

  /* ── one-shot cues ──────────────────────────────────────────────────────── */

  play = (name: CueName, o: PlayOpts = {}) => {
    try {
      if (!this.ready()) return;
      const def: CueDef | undefined = CUES[name];
      if (!def) return;
      const now = performance.now();
      if (def.gap && now - (this.last[name] ?? -1e9) < def.gap) return;
      this.last[name] = now;
      if (this.inflight > 28) return;
      const ctx = this.ctx as AudioContext;
      const bus = this.bus as Bus;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
      this.inflight++;
      window.setTimeout(() => {
        this.inflight--;
      }, def.len);
      def.run({
        bus,
        t: ctx.currentTime + 0.005,
        pan: o.pan ?? 0,
        gain: o.gain ?? 1,
        deg: o.deg ?? 0,
        dur: o.dur ?? 0,
        dir: o.dir ?? 1,
      });
    } catch {
      /* a failed cue must never break a click */
    }
  };

  /* ── loader drone ───────────────────────────────────────────────────────── */

  /** Begin the loader's low drone. If audio is still locked it joins as soon as it unlocks. */
  loaderStart = () => {
    this.humWanted = true;
    this.humP = 0;
    this.startHum();
  };

  /** Progress 0..1: the drone brightens and climbs a fifth as the drawing completes. */
  loaderProgress = (p: number) => {
    this.humP = p;
    this.applyHum();
  };

  /** The sheet lifts: the drone releases and the lift cue plays. */
  loaderLift = () => {
    this.humWanted = false;
    this.stopHum(0.5);
    this.play('lift');
  };

  /** Unmount safety: drop the drone without a lift. */
  loaderStop = () => {
    this.humWanted = false;
    this.stopHum(0.2);
  };

  private startHum() {
    try {
      if (!this.humWanted || this.hum || !this.ready()) return;
      const ctx = this.ctx as AudioContext;
      const bus = this.bus as Bus;
      const root = note(-5); // D2
      const oscs = [
        Object.assign(ctx.createOscillator(), { type: 'sawtooth' as OscillatorType }),
        Object.assign(ctx.createOscillator(), { type: 'sawtooth' as OscillatorType }),
        Object.assign(ctx.createOscillator(), { type: 'sine' as OscillatorType }),
      ];
      oscs[0].frequency.value = root;
      oscs[1].frequency.value = root * 1.007;
      oscs[2].frequency.value = root * 1.5; // A2
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 120;
      lp.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      const mix = ctx.createGain();
      mix.gain.value = 0.5;
      oscs.forEach((o) => o.connect(mix));
      mix.connect(lp);
      lp.connect(gain);
      gain.connect(bus.dry);
      const send = ctx.createGain();
      send.gain.value = 0.5;
      gain.connect(send);
      send.connect(bus.send);
      oscs.forEach((o) => o.start());
      this.hum = { oscs, lp, gain };
      this.applyHum();
    } catch {
      this.hum = null;
    }
  }

  private applyHum() {
    const h = this.hum;
    const ctx = this.ctx;
    if (!h || !ctx) return;
    const p = Math.min(1, Math.max(0, this.humP));
    const t = ctx.currentTime;
    h.lp.frequency.setTargetAtTime(120 + p * p * 1400, t, 0.08);
    h.gain.gain.setTargetAtTime(0.03 + p * 0.09, t, 0.1);
    const base = 73.42 * (1 + 0.5 * p);
    h.oscs[0].frequency.setTargetAtTime(base, t, 0.1);
    h.oscs[1].frequency.setTargetAtTime(base * 1.007, t, 0.1);
    h.oscs[2].frequency.setTargetAtTime(base * 1.5, t, 0.1);
  }

  private stopHum(release: number) {
    const h = this.hum;
    const ctx = this.ctx;
    this.hum = null;
    if (!h || !ctx) return;
    try {
      const t = ctx.currentTime;
      h.gain.gain.cancelScheduledValues(t);
      h.gain.gain.setTargetAtTime(0, t, release / 3);
      h.oscs.forEach((o) => o.stop(t + release + 0.4));
      window.setTimeout(() => {
        try {
          h.gain.disconnect();
        } catch {
          /* already gone */
        }
      }, (release + 0.6) * 1000);
    } catch {
      /* ignore */
    }
  }

  /* ── electrical hum (the logo) ──────────────────────────────────────────── */

  /**
   * Level 0..1, called every frame while the logo is live: a mains-pitch hum and, probabilistically, crackle.
   * Falls to silence and frees its nodes when the level stays near zero.
   */
  buzz = (level: number) => {
    try {
      if (!this.ready()) {
        if (this.buzzV) this.stopBuzz();
        return;
      }
      if (level < 0.01 && !this.buzzV) return;
      const ctx = this.ctx as AudioContext;
      const bus = this.bus as Bus;
      if (!this.buzzV) {
        const saw = ctx.createOscillator();
        saw.type = 'sawtooth';
        saw.frequency.value = 100;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 260;
        bp.Q.value = 1.6;
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        saw.connect(bp);
        bp.connect(gain);
        gain.connect(bus.dry);
        const noise = ctx.createBufferSource();
        noise.buffer = bus.noise;
        noise.loop = true;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2200;
        const crackle = ctx.createGain();
        crackle.gain.value = 0.0001;
        noise.connect(hp);
        hp.connect(crackle);
        crackle.connect(bus.dry);
        saw.start();
        noise.start();
        this.buzzV = { saw, bp, gain, noise, crackle };
      }
      const v = this.buzzV;
      const t = ctx.currentTime;
      // Centred on the 2nd-5th harmonics of the 100 Hz saw so the hum has body and is actually heard (about -39 dB RMS
      // at full hover, close to the loader drone); the whole voice still peaks under -22 dBFS with the crackle.
      v.gain.gain.setTargetAtTime(Math.max(0.0001, level * 0.22), t, 0.05);
      v.bp.frequency.setTargetAtTime(260 + level * 300, t, 0.05);
      if (Math.random() < level * 0.2) {
        v.crackle.gain.cancelScheduledValues(t);
        v.crackle.gain.setValueAtTime(Math.max(0.0002, level * 0.12), t);
        v.crackle.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
      }
      // The caller reports every frame, so arm the teardown once and let it run out; re-arming on each call would
      // push it back forever and the voice would idle on the audio thread for as long as the logo is on screen.
      if (level < 0.01) {
        if (!this.buzzTimer) {
          this.buzzTimer = window.setTimeout(() => {
            this.buzzTimer = 0;
            this.stopBuzz();
          }, 400);
        }
      } else if (this.buzzTimer) {
        window.clearTimeout(this.buzzTimer);
        this.buzzTimer = 0;
      }
    } catch {
      this.buzzV = null;
    }
  };

  private stopBuzz() {
    window.clearTimeout(this.buzzTimer);
    this.buzzTimer = 0;
    const v = this.buzzV;
    this.buzzV = null;
    if (!v || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      v.gain.gain.setTargetAtTime(0.0001, t, 0.04);
      v.saw.stop(t + 0.3);
      v.noise.stop(t + 0.3);
      window.setTimeout(() => {
        try {
          v.gain.disconnect();
          v.crackle.disconnect();
        } catch {
          /* already gone */
        }
      }, 500);
    } catch {
      /* ignore */
    }
  }

  /* ── paper drag (the split rule) ────────────────────────────────────────── */

  /**
   * Call on every pointer move while dragging. speed 0..1 sets the loudness, pos 0..1 the pitch of the scrape.
   * Fades itself out shortly after the calls stop.
   */
  drag = (speed: number, pos: number) => {
    try {
      if (!this.ready()) return;
      const ctx = this.ctx as AudioContext;
      const bus = this.bus as Bus;
      if (!this.dragV) {
        const noise = ctx.createBufferSource();
        noise.buffer = bus.noise;
        noise.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 1.2;
        bp.frequency.value = 1500;
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        noise.connect(bp);
        bp.connect(gain);
        gain.connect(bus.dry);
        noise.start();
        this.dragV = { noise, bp, gain };
      }
      const v = this.dragV;
      const t = ctx.currentTime;
      v.bp.frequency.setTargetAtTime(1000 + Math.min(1, Math.max(0, pos)) * 3000, t, 0.03);
      v.gain.gain.setTargetAtTime(Math.max(0.0001, Math.min(0.09, speed * 0.12)), t, 0.03);
      window.clearTimeout(this.dragTimer);
      window.clearTimeout(this.dragTeardown);
      this.dragTimer = window.setTimeout(() => {
        if (this.dragV && this.ctx) this.dragV.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.06);
      }, 90);
      this.dragTeardown = window.setTimeout(() => this.stopDrag(), 700);
    } catch {
      this.dragV = null;
    }
  };

  private stopDrag() {
    window.clearTimeout(this.dragTimer);
    window.clearTimeout(this.dragTeardown);
    const v = this.dragV;
    this.dragV = null;
    if (!v) return;
    try {
      v.noise.stop();
      v.gain.disconnect();
    } catch {
      /* already gone */
    }
  }
}

export const sfx = new SoundEngine();
