/**
 * One source of truth for the stack's proportions and camera, shared by the
 * WebGL scene and the static SVG so both draw the same drawing. Pure math, no
 * three.js, so the SVG path never pulls the renderer in.
 */
export const STACK_LAYERS = ['EDGE', 'GATEWAY', 'SERVICES', 'CACHE', 'DATABASE', 'ACCESS', 'DEPLOY'] as const;

export const STACK = {
  /** Slab footprint (x and z) and thickness, world units. */
  size: 0.5,
  thickness: 0.05,
  /** Distance between slab centres when packed. */
  gap: 1,
  /** Extra spacing per unit of `explode` (explode 1 → gap * (1 + spread)). */
  spread: 1.6,
  /** Hover lift, world units. */
  lift: 0.15,
  /** Isometric-style orthographic view: yaw 45°, pitch 28°. */
  yaw: Math.PI / 4,
  pitch: (28 * Math.PI) / 180,
} as const;

export const LAYER_COUNT = STACK_LAYERS.length;

/** Centre height of layer i (0 = Edge, top). */
export function layerY(i: number, explode = 0) {
  const step = STACK.gap * (1 + explode * STACK.spread);
  return ((LAYER_COUNT - 1) / 2 - i) * step;
}

type Vec3 = readonly [number, number, number];

/** Camera basis for the fixed view. Screen y points up. */
export function viewBasis(yaw: number = STACK.yaw, pitch: number = STACK.pitch) {
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  return {
    /** Unit vector from the target toward the camera. */
    dir: [sy * cp, sp, cy * cp] as Vec3,
    right: [cy, 0, -sy] as Vec3,
    up: [-sy * sp, cp, -cy * sp] as Vec3,
  };
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function project(p: Vec3, basis = viewBasis()) {
  return [dot(p, basis.right), dot(p, basis.up)] as const;
}

/** Eight corners of slab i. */
export function slabCorners(i: number, explode = 0, lift = 0): Vec3[] {
  const h = STACK.size / 2;
  const t = STACK.thickness / 2;
  const y = layerY(i, explode) + lift;
  const out: Vec3[] = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) out.push([sx * h, y + sy * t, sz * h]);
  return out;
}

/** Screen-space bounds of the whole stack at rest. */
export function stackBounds(explode = 0) {
  const basis = viewBasis();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const i of [0, LAYER_COUNT - 1]) {
    for (const c of slabCorners(i, explode)) {
      const [x, y] = project(c, basis);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, maxX, minY, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
}

/** Pixels per world unit so the stack fits a box with a margin. */
export function fitZoom(width: number, height: number, explode = 0, margin = 6) {
  const b = stackBounds(explode);
  return Math.max(1, Math.min((width - margin * 2) / b.w, (height - margin * 2) / b.h));
}
