/**
 * The shared signal chain every sound goes through, built the same way for the live page and for the offline
 * renderer used to measure the cues (so what is measured is what plays):
 *
 *   cue -> dry ----------------\
 *   cue -> send -> reverb ------> high-pass (28 Hz) -> compressor -> master -> destination
 *
 * Nothing here loads a file. The reverb tail is generated from noise and the noise buffer is shared.
 */

/** Overall level. Cues are written near full scale and sit under this. */
export const MASTER = 0.5;

/** Level of the continuous voices (dry/send) relative to the one-shot cues (cue/cueSend). */
export const BED = 0.4;

export interface Bus {
  ctx: BaseAudioContext;
  /** Continuous voices: direct signal (trimmed by BED). */
  dry: AudioNode;
  /** Continuous voices: reverb send (trimmed by BED). */
  send: AudioNode;
  /** One-shot cues: direct signal. */
  cue: AudioNode;
  /** One-shot cues: reverb send. */
  cueSend: AudioNode;
  master: GainNode;
  /** 2.5 s of white noise, shared by every noise voice. */
  noise: AudioBuffer;
}

const NOISE_SECONDS = 2.5;
const IR_SECONDS = 1.1;

function fillNoise(data: Float32Array) {
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

/** A short, dark, decorrelated room: decaying noise through a one-pole low-pass. */
function fillImpulse(data: Float32Array) {
  const len = data.length;
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const decay = Math.pow(1 - i / len, 2.6);
    lp += (Math.random() * 2 - 1 - lp) * 0.38;
    data[i] = lp * decay;
  }
}

/**
 * The noise and reverb tail are about 0.9 MB of arithmetic. Done inside the first tap's handler it costs a visible
 * hitch, so the engine calls prewarm() in an idle moment and buildBus() takes the arrays from here. The arrays are
 * made at 48 kHz; a context at a lower rate just plays them a touch slower, which is inaudible for noise and a
 * reverb tail. Anything unusual (no prewarm, a higher rate, the offline renderer) falls back to computing inline.
 */
let cache: { noise: Float32Array<ArrayBuffer>; ir: [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] } | null = null;

export function prewarm(rate = 48000) {
  if (cache) return;
  const noise = new Float32Array(Math.floor(rate * NOISE_SECONDS));
  fillNoise(noise);
  const irLen = Math.floor(rate * IR_SECONDS);
  const left = new Float32Array(irLen);
  const right = new Float32Array(irLen);
  fillImpulse(left);
  fillImpulse(right);
  cache = { noise, ir: [left, right] };
}

function makeNoise(ctx: BaseAudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * NOISE_SECONDS);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  if (cache && cache.noise.length >= len) buf.copyToChannel(cache.noise.subarray(0, len), 0);
  else fillNoise(buf.getChannelData(0));
  return buf;
}

function makeImpulse(ctx: BaseAudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * IR_SECONDS);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    if (cache && cache.ir[c].length >= len) buf.copyToChannel(cache.ir[c].subarray(0, len), c);
    else fillImpulse(buf.getChannelData(c));
  }
  return buf;
}

export function buildBus(ctx: BaseAudioContext, destination: AudioNode = ctx.destination, level = MASTER): Bus {
  const master = ctx.createGain();
  master.gain.value = level;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 14;
  comp.ratio.value = 5;
  comp.attack.value = 0.002;
  comp.release.value = 0.18;

  // Keeps sub-audible energy and DC out of the compressor and the speakers.
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 28;
  hp.Q.value = 0.7;

  const dry = ctx.createGain();
  dry.gain.value = BED;
  const send = ctx.createGain();
  send.gain.value = BED;
  const cue = ctx.createGain();
  const cueSend = ctx.createGain();
  const verb = ctx.createConvolver();
  verb.buffer = makeImpulse(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;

  dry.connect(hp);
  cue.connect(hp);
  send.connect(verb);
  cueSend.connect(verb);
  verb.connect(wet);
  wet.connect(hp);
  hp.connect(comp);
  comp.connect(master);
  master.connect(destination);

  const noise = makeNoise(ctx);
  cache = null; // the buffers now own the data
  return { ctx, dry, send, cue, cueSend, master, noise };
}
