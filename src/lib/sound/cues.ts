import type { Bus } from './bus';

/**
 * The sound palette. Every cue is a small function that builds Web Audio nodes at time `t`; nothing is sampled.
 *
 * The language follows the site: a technical drawing. Graphite on paper (filtered-noise strokes), a mechanical
 * key (a short low "thock" and a bright tick), a quiet machine room (low drone, electrical hum) and glass
 * (sine plucks with an inharmonic partial and a dark reverb). Every tonal sound draws from one scale, D minor
 * pentatonic, so any two sounds that overlap are consonant. The register climbs with importance: ticks and
 * hovers live high and tiny, presses sit low and short, the loader's lift is the only big moment.
 *
 * Cues take (bus, time) rather than the live context so the same code is rendered offline to measure level,
 * peak, tail and spectrum (see the QA notes in the commit).
 */

export interface Hit {
  bus: Bus;
  /** Start time on the bus's clock, seconds. */
  t: number;
  /** -1 (left) .. 1 (right). */
  pan: number;
  /** Multiplier on the cue's level. */
  gain: number;
  /** Scale-degree offset for cues that are pitched by position or index. */
  deg: number;
  /** Duration in seconds for cues that stretch (whoosh, pencil). */
  dur: number;
  /** 1 rising, -1 falling. */
  dir: 1 | -1;
}

export interface CueDef {
  run: (h: Hit) => void;
  /** Rough length in ms, used only to count voices in flight. */
  len: number;
  /** Minimum gap between two plays of this cue, ms. */
  gap?: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const D3 = 146.83;
const SCALE = [0, 3, 5, 7, 10] as const; // D F G A C
/** Degree 0 is D3; every 5 degrees is an octave (5 = D4, 10 = D5, 15 = D6). */
export const note = (deg: number) => {
  const i = Math.round(deg);
  const oct = Math.floor(i / 5);
  return D3 * 2 ** ((SCALE[((i % 5) + 5) % 5] + 12 * oct) / 12);
};

/* ── voices ───────────────────────────────────────────────────────────────── */

/** Pan, send to the room, and connect to the cue inputs of the bus (the engine's continuous voices use dry/send). */
function route(h: Hit, node: AudioNode, send = 0, pan = h.pan) {
  const { ctx, cue: dry, cueSend: room } = h.bus;
  let out: AudioNode = node;
  if (pan && typeof ctx.createStereoPanner === 'function') {
    const p = ctx.createStereoPanner();
    p.pan.value = clamp(pan, -1, 1);
    node.connect(p);
    out = p;
  }
  out.connect(dry);
  if (send > 0) {
    const s = ctx.createGain();
    s.gain.value = send;
    out.connect(s);
    s.connect(room);
  }
}

interface ToneOpts {
  type?: OscillatorType;
  f: number;
  /** Glide to this frequency over `fd` (default the whole decay). */
  f2?: number;
  fd?: number;
  at?: number;
  a?: number;
  d: number;
  g: number;
  send?: number;
  lp?: number;
  pan?: number;
}

function tone(h: Hit, o: ToneOpts) {
  const { ctx } = h.bus;
  const t = h.t + (o.at ?? 0);
  const a = o.a ?? 0.004;
  const osc = ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.fd ?? a + o.d));
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(o.g * h.gain, 0.0002), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + o.d);
  osc.connect(g);
  let out: AudioNode = g;
  if (o.lp) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lp;
    g.connect(f);
    out = f;
  }
  route(h, out, o.send, o.pan);
  osc.start(t);
  osc.stop(t + a + o.d + 0.05);
}

interface BurstOpts {
  at?: number;
  a?: number;
  d: number;
  type?: BiquadFilterType;
  f: number;
  /** Sweep the filter to this frequency across the burst. */
  f2?: number;
  q?: number;
  g: number;
  send?: number;
  pan?: number;
}

function burst(h: Hit, o: BurstOpts) {
  const { ctx, noise } = h.bus;
  const t = h.t + (o.at ?? 0);
  const a = o.a ?? 0.003;
  const len = a + o.d;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.Q.value = o.q ?? 1;
  f.frequency.setValueAtTime(o.f, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + len);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(o.g * h.gain, 0.0002), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(f);
  f.connect(g);
  route(h, g, o.send, o.pan);
  src.start(t, Math.random() * Math.max(0, noise.duration - len - 0.1), len + 0.03);
}

/** A glass pluck: the note, a quiet inharmonic partial, a long dark tail. */
function glass(h: Hit, f: number, at: number, d: number, g: number, send = 0.55) {
  tone(h, { f, at, d, g, send });
  tone(h, { f: f * 2.76, at, d: d * 0.45, g: g * 0.22, send: send * 0.7 });
}

/** The mouse-down key-thock, shared by press and pressPrimary. */
function thock(h: Hit) {
  tone(h, { f: 200, f2: 62, fd: 0.08, d: 0.11, g: 0.21 });
  burst(h, { type: 'lowpass', f: 1600, f2: 400, d: 0.05, g: 0.1 });
  burst(h, { type: 'highpass', f: 5500, d: 0.008, g: 0.06 });
}

/* ── the cues ─────────────────────────────────────────────────────────────── */

export const CUES = {
  /** Pointer over something you can press: a tiny tick and a glassy blip, panned to where it is. */
  hover: {
    len: 120,
    gap: 45,
    run(h) {
      burst(h, { d: 0.012, f: 5200, q: 2.5, g: 0.05 });
      tone(h, { f: note(15 + (h.deg % 5)), d: 0.05, g: 0.035, send: 0.3 });
    },
  },

  /** Mouse down: a low key-thock with a bright edge. */
  press: {
    len: 220,
    run: thock,
  },

  /** The main calls to action: the same thock plus a small rising glass note. */
  pressPrimary: {
    len: 420,
    run(h) {
      thock(h);
      tone(h, { type: 'triangle', f: note(15), at: 0.03, d: 0.16, g: 0.06, send: 0.35 });
      tone(h, { type: 'triangle', f: note(17), at: 0.075, d: 0.2, g: 0.05, send: 0.4 });
    },
  },

  /** Touch: lighter and a little higher than the mouse thock. */
  tap: {
    len: 200,
    run(h) {
      tone(h, { f: 250, f2: 96, fd: 0.07, d: 0.09, g: 0.2 });
      burst(h, { f: 3000, q: 1.2, d: 0.012, g: 0.06 });
    },
  },

  /** Key-up: a faint high click. Used for the largest buttons only. */
  release: {
    len: 120,
    run(h) {
      burst(h, { f: 3600, q: 2, d: 0.012, g: 0.26 });
      tone(h, { f: 1400, d: 0.03, g: 0.15 });
    },
  },

  toggleOn: {
    len: 500,
    run(h) {
      glass(h, note(10), 0, 0.14, 0.12, 0.3);
      glass(h, note(12), 0.07, 0.2, 0.12, 0.35);
    },
  },

  toggleOff: {
    len: 500,
    run(h) {
      glass(h, note(12), 0, 0.14, 0.1, 0.3);
      glass(h, note(8), 0.07, 0.2, 0.1, 0.35);
    },
  },

  /** Something opens (menu sheet, modal, accordion): a rising air sweep and a soft note. */
  open: {
    len: 420,
    gap: 120,
    run(h) {
      burst(h, { f: 700, f2: 2600, q: 1.4, a: 0.08, d: 0.14, g: 0.19, send: 0.2 });
      tone(h, { f: note(10), at: 0.04, d: 0.18, g: 0.095, send: 0.4 });
    },
  },

  /** The reverse of open. */
  close: {
    len: 360,
    gap: 120,
    run(h) {
      burst(h, { f: 2600, f2: 700, q: 1.4, a: 0.05, d: 0.12, g: 0.135, send: 0.2 });
      tone(h, { f: note(5), at: 0.03, d: 0.16, g: 0.075, send: 0.35 });
    },
  },

  /** An air sweep. dur and dir stretch and flip it. */
  whoosh: {
    len: 1000,
    run(h) {
      const dur = h.dur || 0.5;
      const up = h.dir > 0;
      burst(h, { f: up ? 300 : 3800, f2: up ? 3800 : 300, q: 0.9, a: dur * 0.4, d: dur * 0.6, g: 0.22, send: 0.3 });
    },
  },

  thud: {
    len: 700,
    run(h) {
      tone(h, { f: 96, f2: 34, fd: 0.35, a: 0.006, d: 0.5, g: 0.4 });
      burst(h, { type: 'lowpass', f: 220, d: 0.12, g: 0.15 });
    },
  },

  /** One layer of the loader's drawing completing: a plucked scale note, climbing with `deg` (0..6). */
  layer: {
    len: 600,
    run(h) {
      const f = note(5 + h.deg);
      tone(h, { type: 'triangle', f, a: 0.003, d: 0.32, g: 0.17, lp: 3200, send: 0.45 });
      tone(h, { f: f * 2, d: 0.18, g: 0.05, send: 0.5 });
      burst(h, { f: 4800, q: 2, d: 0.012, g: 0.05 });
    },
  },

  /** The loader sheet lifting away: a long rising sweep, the thud as it clears, then a held chord. */
  lift: {
    len: 2600,
    run(h) {
      burst(h, { f: 260, f2: 5200, q: 0.8, a: 0.34, d: 0.46, g: 0.25, send: 0.3 });
      tone(h, { f: 96, f2: 34, fd: 0.35, a: 0.006, d: 0.5, g: 0.7, at: 0.62 });
      for (const [deg, at] of [[5, 0.7], [8, 0.74], [10, 0.78], [12, 0.82]] as const) {
        tone(h, { f: note(deg), at, a: 0.03, d: 1.5, g: 0.075, send: 0.8 });
      }
    },
  },

  /** Graphite on paper: a run of short bandpassed strokes, loudest in the middle. */
  pencil: {
    len: 1600,
    run(h) {
      const dur = h.dur || 1.3;
      const n = Math.max(4, Math.round(dur / 0.09));
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const bell = Math.sin(Math.PI * k) ** 0.8;
        burst(h, {
          at: (i * dur) / n + rand(0, 0.02),
          a: 0.012,
          d: rand(0.045, 0.1),
          f: rand(2600, 4200),
          q: 0.9,
          g: (0.066 + bell * 0.15) * rand(0.6, 1),
          pan: rand(-0.25, 0.25),
        });
      }
    },
  },

  /** The name rising out of its masks: a short low swell. */
  rise: {
    len: 800,
    run(h) {
      burst(h, { f: 250, f2: 1400, q: 1, a: 0.1, d: 0.5, g: 0.09, send: 0.25 });
      tone(h, { f: 110, f2: 165, fd: 0.5, a: 0.12, d: 0.4, g: 0.08, lp: 600, send: 0.3 });
    },
  },

  /** The photograph developing as the rule lands: a swelling pad, a sweep, a low boom, then glass. */
  develop: {
    len: 2800,
    run(h) {
      tone(h, { type: 'sawtooth', f: note(0), f2: note(0) * 1.5, fd: 0.9, a: 0.5, d: 0.5, g: 0.055, lp: 700, send: 0.6 });
      tone(h, { type: 'sawtooth', f: note(5), a: 0.5, d: 0.6, g: 0.045, lp: 900, send: 0.7 });
      burst(h, { f: 400, f2: 3000, q: 0.9, a: 0.6, d: 0.3, g: 0.07, send: 0.5 });
      tone(h, { f: 80, f2: 40, fd: 0.5, a: 0.01, d: 0.5, g: 0.115, at: 0.95 });
      tone(h, { f: note(15), at: 0.95, a: 0.02, d: 1.2, g: 0.05, send: 0.9 });
    },
  },

  /** A burst of data chirps: the name scrambling, the spec rows typing in. */
  glitch: {
    len: 260,
    gap: 120,
    run(h) {
      for (let i = 0; i < 5; i++) {
        tone(h, { type: 'square', f: rand(700, 3500), at: i * 0.028, a: 0.002, d: 0.02, g: 0.054, lp: 5000, pan: rand(-0.4, 0.4) });
      }
    },
  },

  /** A surge on the wire. */
  zap: {
    len: 360,
    gap: 150,
    run(h) {
      burst(h, { type: 'highpass', f: 1800, a: 0.002, d: 0.09, g: 0.15 });
      burst(h, { f: 4000, f2: 900, q: 1.2, d: 0.1, g: 0.13 });
      tone(h, { type: 'sawtooth', f: 110, f2: 55, fd: 0.14, d: 0.14, g: 0.19, lp: 900 });
    },
  },

  /** Crossing into the next section: a sheet turning over. */
  section: {
    len: 360,
    gap: 700,
    run(h) {
      burst(h, { f: 1500, f2: 700, q: 0.8, a: 0.03, d: 0.16, g: 0.07, send: 0.3 });
      tone(h, { f: 120, f2: 80, fd: 0.09, d: 0.09, g: 0.11 });
    },
  },

  /** Form sent, copy confirmed, anything that worked: a four-note glass arpeggio, D F A D. */
  success: {
    len: 1400,
    run(h) {
      [10, 11, 13, 15].forEach((deg, i) => glass(h, note(deg), i * 0.07, 0.5, 0.1, 0.6));
    },
  },

  error: {
    len: 600,
    run(h) {
      tone(h, { type: 'triangle', f: 196, d: 0.16, g: 0.14, lp: 900 });
      tone(h, { type: 'triangle', f: 156, at: 0.11, d: 0.24, g: 0.14, lp: 700 });
      burst(h, { type: 'lowpass', f: 500, d: 0.05, g: 0.08 });
    },
  },

  copy: {
    len: 300,
    run(h) {
      tone(h, { f: 1760, d: 0.035, g: 0.056, send: 0.3 });
      tone(h, { f: 2349, at: 0.06, d: 0.05, g: 0.056, send: 0.3 });
    },
  },

  /** Message sent. */
  send: {
    len: 400,
    run(h) {
      burst(h, { f: 600, f2: 2800, q: 1, a: 0.07, d: 0.1, g: 0.17, send: 0.2 });
      burst(h, { f: 3400, q: 2, at: 0.17, d: 0.012, g: 0.13 });
    },
  },

  /** Message arrived: two soft descending notes. */
  receive: {
    len: 600,
    run(h) {
      tone(h, { f: note(13), d: 0.12, g: 0.1, send: 0.5 });
      tone(h, { f: note(10), at: 0.07, d: 0.18, g: 0.085, send: 0.5 });
    },
  },

  /** One typed character while an answer streams in. */
  key: {
    len: 80,
    gap: 38,
    run(h) {
      burst(h, { f: rand(2400, 3600), q: 2, d: 0.012, g: 0.063 });
      tone(h, { f: rand(1800, 2400), d: 0.02, g: 0.022 });
    },
  },

  /** A preview image swapping: a short slide. */
  swap: {
    len: 200,
    gap: 70,
    run(h) {
      burst(h, { f: 1800, f2: 900, q: 1, a: 0.01, d: 0.08, g: 0.095 });
      burst(h, { f: 4200, q: 2, d: 0.01, g: 0.065 });
    },
  },

  /** A detent: a notch on a slider, pitched by position (deg 0..9). */
  detent: {
    len: 120,
    gap: 28,
    run(h) {
      tone(h, { f: note(10 + h.deg), d: 0.04, g: 0.05 });
      burst(h, { f: 4000, q: 2, d: 0.008, g: 0.04 });
    },
  },

  /** Back to top: one long rising sweep that matches the scroll. */
  scrollTop: {
    len: 1500,
    run(h) {
      burst(h, { f: 240, f2: 4200, q: 0.8, a: 0.5, d: 0.6, g: 0.2, send: 0.3 });
    },
  },
} satisfies Record<string, CueDef>;

export type CueName = keyof typeof CUES;
