/**
 * Procedural network field on raw WebGL2. No three.js: this whole module is a
 * few KB gzipped against the 120 KB per-scene budget (docs/perf/budget.md).
 *
 * - Points sit in a shallow volume and drift on a cheap sine noise in the
 *   vertex shader. Nearest-neighbour lines are computed ONCE on the CPU (grid
 *   hash, O(n)) and run through the same drift so their ends stay attached.
 * - The cursor bends the field through one uniform. Scroll progress pulls the
 *   camera back and fades the field toward the ink background.
 * - ~2% of points are "signal" points: brighter, pulsing like data packets.
 * - Monochrome on purpose (brand: ink #0A0A0A, off-white #F5F5F3).
 *
 * Also used, slower and dimmer, behind the Contact section (Prompt 10).
 */

export interface FieldOptions {
  points: number;
  /** Nearest-neighbour lines. Off on phones. */
  lines: boolean;
  dpr: number;
  /** 1 = hero; lower = slower/dimmer (Contact). */
  energy?: number;
}

export interface NetworkField {
  /** Pointer in canvas-relative 0..1 coordinates, or null when it leaves. */
  setPointer(x: number | null, y?: number): void;
  /** 0 at rest, 1 when the section has scrolled away. */
  setProgress(p: number): void;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

const INK = [10 / 255, 10 / 255, 10 / 255] as const;

// Shared drift + cursor bend, used by both the point and the line program so
// a line's ends move exactly with the points they join.
const DISPLACE = /* glsl */ `
uniform float uTime;
uniform vec2  uPointer;   // world xy on the z=0 plane
uniform float uBend;      // 0..1, eased in JS
uniform float uEnergy;
vec3 displace(vec3 p, float seed) {
  float t = uTime * 0.6 * uEnergy;
  vec3 d = vec3(
    sin(t * 0.21 + seed * 6.283 + p.y * 1.7),
    cos(t * 0.17 + seed * 4.100 + p.x * 1.3),
    sin(t * 0.13 + seed * 3.000 + p.x * 0.9 + p.y * 0.7)
  ) * 0.035;
  p += d;
  vec2 delta = p.xy - uPointer;
  float fall = exp(-dot(delta, delta) * 9.0) * uBend;
  p.xy += normalize(delta + 1e-5) * fall * 0.14;
  p.z  += fall * 0.22;
  return p;
}
uniform float uCamZ;
uniform float uFocal;
uniform float uAspect;
vec4 project(vec3 p) {
  float w = uCamZ - p.z;
  return vec4(p.x * uFocal / uAspect, p.y * uFocal, 0.0, w);
}
`;

const POINT_VS = /* glsl */ `#version 300 es
in vec3 aPos;
in float aSeed;
in float aSignal;
uniform float uDpr;
uniform float uFade;
${DISPLACE}
out float vAlpha;
out float vSignal;
void main() {
  vec3 p = displace(aPos, aSeed);
  gl_Position = project(p);
  float w = gl_Position.w;
  float pulse = 0.5 + 0.5 * sin(uTime * (1.6 + aSeed) * uEnergy + aSeed * 40.0);
  float size = mix(2.0, 3.4 + pulse * 2.6, aSignal);
  gl_PointSize = size * uDpr * (2.6 / w);
  float depth = clamp(1.25 - w * 0.28, 0.25, 1.0);   // farther = dimmer
  vAlpha = mix(0.55 * depth, 0.55 + 0.45 * pulse, aSignal) * uFade * mix(0.55, 1.0, uEnergy);
  vSignal = aSignal;
}`;

const POINT_FS = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in float vSignal;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float a = smoothstep(0.5, 0.15, r) * vAlpha;
  if (a < 0.003) discard;
  vec3 col = mix(vec3(0.961, 0.961, 0.953), vec3(1.0), vSignal);
  outColor = vec4(col, a);
}`;

const LINE_VS = /* glsl */ `#version 300 es
in vec3 aPos;
in float aSeed;
in float aStrength;  // 1 for short edges, ~0 at max length
uniform float uFade;
${DISPLACE}
out float vAlpha;
void main() {
  vec3 p = displace(aPos, aSeed);
  gl_Position = project(p);
  float depth = clamp(1.25 - gl_Position.w * 0.28, 0.2, 1.0);
  vAlpha = 0.16 * aStrength * depth * uFade * mix(0.5, 1.0, uEnergy);
}`;

const LINE_FS = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
out vec4 outColor;
void main() { outColor = vec4(0.961, 0.961, 0.953, vAlpha); }`;

// Deterministic PRNG so the field looks the same on every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compile(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const v = make(gl.VERTEX_SHADER, vs);
  const f = make(gl.FRAGMENT_SHADER, fs);
  const p = gl.createProgram()!;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

/** Builds the point cloud and its nearest-neighbour edges (k nearest within maxDist). */
function buildGeometry(count: number, withLines: boolean) {
  const rand = mulberry32(0x5a6e);
  const W = 1.9;   // half-width (world units, before aspect)
  const H = 1.15;  // half-height
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const signal = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Slightly denser toward the right so the name (bottom-left) sits on calmer ground.
    const u = rand();
    const x = (Math.pow(u, 0.8) * 2 - 1) * W;
    pos[i * 3] = x;
    pos[i * 3 + 1] = (rand() * 2 - 1) * H;
    pos[i * 3 + 2] = -0.7 + rand() * 0.9;
    seed[i] = rand();
    signal[i] = rand() < 0.02 ? 1 : 0;
  }
  if (!withLines) return { pos, seed, signal, lines: null };

  const maxDist = 0.16;
  const K = 3;
  const cell = maxDist;
  const grid = new Map<number, number[]>();
  const key = (cx: number, cy: number) => (cx + 512) * 1024 + (cy + 512);
  for (let i = 0; i < count; i++) {
    const k = key(Math.floor(pos[i * 3] / cell), Math.floor(pos[i * 3 + 1] / cell));
    const bucket = grid.get(k);
    if (bucket) bucket.push(i);
    else grid.set(k, [i]);
  }
  const edges: number[] = [];
  const strengths: number[] = [];
  const seen = new Set<number>();
  const best: { j: number; d: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    best.length = 0;
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get(key(cx + ox, cy + oy));
        if (!bucket) continue;
        for (const j of bucket) {
          if (j === i) continue;
          const dx = pos[j * 3] - x, dy = pos[j * 3 + 1] - y, dz = pos[j * 3 + 2] - z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < maxDist) best.push({ j, d });
        }
      }
    best.sort((a, b) => a.d - b.d);
    for (let n = 0; n < Math.min(K, best.length); n++) {
      const { j, d } = best[n];
      const id = i < j ? i * count + j : j * count + i;
      if (seen.has(id)) continue;
      seen.add(id);
      edges.push(i, j);
      strengths.push(1 - d / maxDist);
    }
  }
  const n = edges.length;
  const lPos = new Float32Array(n * 3);
  const lSeed = new Float32Array(n);
  const lStr = new Float32Array(n);
  for (let e = 0; e < n; e++) {
    const i = edges[e];
    lPos.set(pos.subarray(i * 3, i * 3 + 3), e * 3);
    lSeed[e] = seed[i];
    lStr[e] = strengths[e >> 1];
  }
  return { pos, seed, signal, lines: { pos: lPos, seed: lSeed, strength: lStr, count: n } };
}

export function createNetworkField(canvas: HTMLCanvasElement, opts: FieldOptions): NetworkField | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: opts.dpr < 2,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const energy = opts.energy ?? 1;
  const geo = buildGeometry(opts.points, opts.lines);
  const pointProg = compile(gl, POINT_VS, POINT_FS);
  const lineProg = geo.lines ? compile(gl, LINE_VS, LINE_FS) : null;
  const buffers: WebGLBuffer[] = [];
  const vaos: WebGLVertexArrayObject[] = [];

  const attr = (prog: WebGLProgram, name: string, data: Float32Array, size: number) => {
    const loc = gl.getAttribLocation(prog, name);
    if (loc < 0) return;
    const b = gl.createBuffer()!;
    buffers.push(b);
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };

  const pointVao = gl.createVertexArray()!;
  vaos.push(pointVao);
  gl.bindVertexArray(pointVao);
  attr(pointProg, 'aPos', geo.pos, 3);
  attr(pointProg, 'aSeed', geo.seed, 1);
  attr(pointProg, 'aSignal', geo.signal, 1);

  let lineVao: WebGLVertexArrayObject | null = null;
  if (geo.lines && lineProg) {
    lineVao = gl.createVertexArray()!;
    vaos.push(lineVao);
    gl.bindVertexArray(lineVao);
    attr(lineProg, 'aPos', geo.lines.pos, 3);
    attr(lineProg, 'aSeed', geo.lines.seed, 1);
    attr(lineProg, 'aStrength', geo.lines.strength, 1);
  }
  gl.bindVertexArray(null);

  const uniforms = (prog: WebGLProgram) => {
    const u = (n: string) => gl.getUniformLocation(prog, n);
    return {
      time: u('uTime'), pointer: u('uPointer'), bend: u('uBend'), energy: u('uEnergy'),
      camZ: u('uCamZ'), focal: u('uFocal'), aspect: u('uAspect'), fade: u('uFade'), dpr: u('uDpr'),
    };
  };
  const pu = uniforms(pointProg);
  const lu = lineProg ? uniforms(lineProg) : null;

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive: overlaps glow, ink stays ink

  // State, eased toward targets every frame.
  let aspect = 1;
  let pointerTarget: [number, number] | null = null;
  const pointer = [0, 0];
  let bend = 0;
  let progress = 0;
  let progressEased = 0;
  let time = 0;
  let last = 0;
  let raf = 0;
  let running = false;
  const focal = 1.9;

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * opts.dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * opts.dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
  };

  const frame = (now: number) => {
    if (!running) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;

    // Ease pointer and bend (~150 ms feel), and scroll progress.
    const k = 1 - Math.exp(-dt * 7);
    if (pointerTarget) {
      pointer[0] += (pointerTarget[0] - pointer[0]) * k;
      pointer[1] += (pointerTarget[1] - pointer[1]) * k;
    }
    bend += ((pointerTarget ? 1 : 0) - bend) * k;
    progressEased += (progress - progressEased) * (1 - Math.exp(-dt * 10));

    const camZ = 2.4 + progressEased * 1.8;
    const fade = 1 - progressEased * 0.85;

    gl.clearColor(INK[0], INK[1], INK[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const set = (u: ReturnType<typeof uniforms>) => {
      gl.uniform1f(u.time, time);
      gl.uniform2f(u.pointer, pointer[0], pointer[1]);
      gl.uniform1f(u.bend, bend);
      gl.uniform1f(u.energy, energy);
      gl.uniform1f(u.camZ, camZ);
      gl.uniform1f(u.focal, focal);
      gl.uniform1f(u.aspect, aspect);
      gl.uniform1f(u.fade, fade);
      if (u.dpr) gl.uniform1f(u.dpr, opts.dpr);
    };

    if (lineProg && lineVao && lu && geo.lines) {
      gl.useProgram(lineProg);
      set(lu);
      gl.bindVertexArray(lineVao);
      gl.drawArrays(gl.LINES, 0, geo.lines.count);
    }
    gl.useProgram(pointProg);
    set(pu);
    gl.bindVertexArray(pointVao);
    gl.drawArrays(gl.POINTS, 0, opts.points);

    raf = requestAnimationFrame(frame);
  };

  resize();

  return {
    setPointer(x, y = 0) {
      if (x === null) {
        pointerTarget = null;
        return;
      }
      // canvas 0..1 -> world xy on the z=0 plane at the current camera distance
      const camZ = 2.4 + progressEased * 1.8;
      const wx = ((x * 2 - 1) * aspect * camZ) / focal;
      const wy = ((1 - y * 2) * camZ) / focal;
      if (!pointerTarget) {
        pointer[0] = wx;
        pointer[1] = wy;
      }
      pointerTarget = [wx, wy];
    },
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
    },
    resize,
    start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      buffers.forEach((b) => gl.deleteBuffer(b));
      vaos.forEach((v) => gl.deleteVertexArray(v));
      gl.deleteProgram(pointProg);
      if (lineProg) gl.deleteProgram(lineProg);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

/**
 * Should this device get WebGL at all? No for reduced motion, Save-Data,
 * no WebGL2, software renderers and very low-end hardware: those get the
 * static poster. (Hand-rolled instead of detect-gpu, which fetches benchmark
 * data from a CDN at runtime — blocked by our CSP and another request.)
 */
export function webglTier(): 'none' | 'low' | 'high' {
  if (typeof window === 'undefined') return 'none';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'none';
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return 'none';
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2');
  if (!gl) return 'none';
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return 'none';
  if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return 'none';
  if (/mali-4|mali-t[67]|adreno \(tm\) [34]\d\d|powervr sgx/i.test(renderer)) return 'none';
  const small = window.matchMedia('(max-width: 767px)').matches;
  return small || (nav.deviceMemory ?? 8) <= 4 ? 'low' : 'high';
}
