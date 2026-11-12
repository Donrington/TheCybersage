/**
 * Isometric technical plates for the Services cards, drawn like an engraved blueprint rather than a wireframe:
 *
 * - structure: visible edges only, drawn in with stroke-dashoffset when the card reveals;
 * - hidden: back edges as faint dashes ("planned", not built);
 * - hatch: engraving lines that shade the left face of every solid;
 * - flow: dashed data paths that march on hover (always on touch);
 * - nodes and mono labels name the parts of each system;
 * - a stippled ground lattice anchors the drawing.
 *
 * Everything is projected to 2D at module load, so the cost at runtime is the SVG itself. Styles: .iso-* in globals.css.
 * Server HTML, no JS and reduced motion all show the finished plate.
 */

type P3 = [number, number, number];
type Line = P3[];
interface Label { at: P3; text: string; dx?: number; dy?: number }
interface Drawing { s: Line[]; x: Line[]; h: Line[]; f: Line[]; n: P3[]; l: Label[]; ground: [number, number, number, number] }

const C = Math.cos(Math.PI / 6);
const UNIT = 34;
const project = ([x, y, z]: P3): [number, number] => [(x - y) * C * UNIT, ((x + y) * 0.5 - z) * UNIT];

const empty = (): Drawing => ({ s: [], x: [], h: [], f: [], n: [], l: [], ground: [0, 0, 4, 4] });

/** A solid: visible edges to `s`, the three hidden back edges to `x`, the left face (y = y + dy) hatched vertically. */
function solid(d: Drawing, x: number, y: number, z: number, dx: number, dy: number, dz: number, hatch = 6) {
  const X = x + dx, Y = y + dy, Z = z + dz;
  d.s.push(
    [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z], [x, y, Z]],
    [[X, y, Z], [X, y, z], [X, Y, z], [x, Y, z], [x, Y, Z]],
    [[X, Y, z], [X, Y, Z]],
  );
  d.x.push([[x, y, Z], [x, y, z], [X, y, z]], [[x, y, z], [x, Y, z]]);
  for (let i = 1; i < hatch; i++) {
    const t = x + (dx * i) / hatch;
    d.h.push([[t, Y, z], [t, Y, Z]]);
  }
}

/** A vertical cylinder (a data store): rings top and bottom, silhouette edges, hatched front. */
function cylinder(d: Drawing, cx: number, cy: number, z: number, r: number, h: number, bands = 2) {
  const ring = (zz: number, from = 0, to = Math.PI * 2): Line => {
    const pts: Line = [];
    for (let i = 0; i <= 32; i++) {
      const a = from + ((to - from) * i) / 32;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, zz]);
    }
    return pts;
  };
  // Silhouette at the angles where screen-x is extreme (x − y max/min).
  const a1 = -Math.PI / 4, a2 = (3 * Math.PI) / 4;
  const front = (zz: number) => ring(zz, a1, a2); // the half facing the viewer
  d.s.push(ring(z + h), front(z));
  d.x.push(ring(z, a2, a1 + Math.PI * 2));
  for (let b = 1; b <= bands; b++) d.s.push(front(z + (h * b) / (bands + 1)));
  for (const a of [a1, a2]) d.s.push([[cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z + h]]);
  for (let i = 1; i < 8; i++) {
    const a = a1 + ((a2 - a1) * i) / 8;
    d.h.push([[cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z + h]]);
  }
}

const DRAWINGS: Record<string, Drawing> = {};

// 01 Systems Architecture: a plan slab with three tiers on it; the third tier is still only planned (hidden edges).
{
  const d = empty();
  d.ground = [0, 0, 5, 4];
  d.s.push([[0, 0, 0], [5, 0, 0], [5, 4, 0], [0, 4, 0], [0, 0, 0]]);
  solid(d, 0.4, 0.6, 0, 1, 1, 1.8);
  solid(d, 2, 0.6, 0, 1, 1, 1.2);
  d.x.push(...[[[3.6, 0.6, 0], [4.6, 0.6, 0], [4.6, 1.6, 0], [3.6, 1.6, 0], [3.6, 0.6, 0]], [[3.6, 0.6, 0.7], [4.6, 0.6, 0.7], [4.6, 1.6, 0.7], [3.6, 1.6, 0.7], [3.6, 0.6, 0.7]], [[4.6, 1.6, 0], [4.6, 1.6, 0.7]], [[3.6, 1.6, 0], [3.6, 1.6, 0.7]], [[4.6, 0.6, 0], [4.6, 0.6, 0.7]]] as Line[]);
  d.f.push([[0.9, 1.6, 0], [0.9, 3, 0], [2.5, 3, 0], [2.5, 1.6, 0]], [[2.5, 3, 0], [4.1, 3, 0], [4.1, 1.6, 0]]);
  d.n.push([0.9, 3, 0], [2.5, 3, 0], [4.1, 3, 0]);
  d.l.push({ at: [0.9, 1.1, 1.8], text: 'EDGE' }, { at: [2.5, 1.1, 1.2], text: 'SERVICE' }, { at: [4.1, 1.1, 0.7], text: 'DATA · PLANNED' });
  DRAWINGS.architecture = d;
}

// 02 Cloud & DevOps: three exploded stages, a pipeline dropping through all three, containers shipped on top.
{
  const d = empty();
  d.ground = [0, 0, 4, 3];
  solid(d, 0, 0, 0, 3.4, 2.4, 0.35, 10);
  solid(d, 0, 0, 0.9, 3.4, 2.4, 0.35, 10);
  solid(d, 0, 0, 1.8, 3.4, 2.4, 0.35, 10);
  solid(d, 0.4, 0.5, 2.15, 0.6, 0.6, 0.6, 3);
  solid(d, 1.2, 0.5, 2.15, 0.6, 0.6, 0.6, 3);
  d.x.push([[2.0, 0.5, 2.15], [2.6, 0.5, 2.15], [2.6, 1.1, 2.15], [2.0, 1.1, 2.15], [2.0, 0.5, 2.15]]);
  d.f.push([[2.9, 2.0, 3.2], [2.9, 2.0, -0.4]]);
  d.n.push([2.9, 2.0, 2.15], [2.9, 2.0, 1.25], [2.9, 2.0, 0.35]);
  d.l.push({ at: [3.4, 2.4, 2.15], text: 'DEPLOY' }, { at: [3.4, 2.4, 1.25], text: 'TEST' }, { at: [3.4, 2.4, 0.35], text: 'BUILD' });
  DRAWINGS.devops = d;
}

// 03 Distributed backends: a datastore at the hub, four services around it, one link held open by a breaker.
{
  const d = empty();
  d.ground = [0, 0, 5, 5];
  cylinder(d, 2.5, 2.5, 0, 0.75, 1.5);
  solid(d, 0.2, 0.2, 0, 0.8, 0.8, 0.8, 4);
  solid(d, 4.0, 0.2, 0, 0.8, 0.8, 0.8, 4);
  solid(d, 0.2, 4.0, 0, 0.8, 0.8, 0.8, 4);
  solid(d, 4.0, 4.0, 0, 0.8, 0.8, 0.8, 4);
  d.f.push([[1.0, 1.0, 0], [1.97, 1.97, 0]], [[4.0, 1.0, 0], [3.03, 1.97, 0]], [[1.0, 4.0, 0], [1.97, 3.03, 0]]);
  // The breaker: a broken link with a gap and a tick.
  d.f.push([[4.0, 4.0, 0], [3.65, 3.65, 0]]);
  d.s.push([[3.5, 3.38, 0], [3.38, 3.5, 0]], [[3.32, 3.2, 0], [3.2, 3.32, 0]]);
  d.n.push([1.0, 1.0, 0], [4.0, 1.0, 0], [1.0, 4.0, 0], [2.5, 2.5, 1.5]);
  d.l.push({ at: [2.5, 2.5, 1.5], text: 'POSTGRES' }, { at: [4.4, 0.6, 0.8], text: 'REDIS' }, { at: [4.4, 4.4, 0.8], text: 'BREAKER OPEN', dy: 18 });
  DRAWINGS.backends = d;
}

// 04 Reliability: a latency profile stood up as bars, the p95 budget as a plane cutting through them, the trace on top.
{
  const d = empty();
  d.ground = [0, 0, 6, 3];
  d.s.push([[0, 0, 0], [6, 0, 0], [6, 2.4, 0], [0, 2.4, 0], [0, 0, 0]]);
  const hs = [0.6, 0.9, 0.7, 2.4, 1.1, 0.8, 0.65, 0.7];
  hs.forEach((h, i) => solid(d, 0.3 + i * 0.7, 0.9, 0, 0.45, 0.6, h, 3));
  d.f.push([[0, 0.6, 1.6], [6, 0.6, 1.6]]);
  d.x.push([[0, 0.6, 0], [0, 0.6, 1.6]], [[6, 0.6, 0], [6, 0.6, 1.6]]);
  d.s.push(hs.map((h, i): P3 => [0.52 + i * 0.7, 2.1, Math.min(h, 1.5) * 0.5 + 0.1]));
  d.n.push([2.62, 0.9, 2.4]);
  d.l.push({ at: [6, 0.6, 1.6], text: 'p95 BUDGET' }, { at: [2.62, 0.9, 2.4], text: 'OUTLIER → FIXED' });
  DRAWINGS.reliability = d;
}

// 05 Full stack: data at the base, an API slab, and the interface standing on top, wired through.
{
  const d = empty();
  d.ground = [0, 0, 5, 4];
  cylinder(d, 0.9, 2.6, 0, 0.55, 0.9, 1);
  solid(d, 0, 0, 0, 3.6, 1.8, 0.3, 12);
  // Screen standing on the slab, with a UI wireframe on its face (y = 1.2 plane).
  const sx = 0.5, sw = 2.6, sz = 0.3, sh = 2.2, py = 1.2;
  d.s.push([[sx, py, sz], [sx, py, sz + sh], [sx + sw, py, sz + sh], [sx + sw, py, sz], [sx, py, sz]]);
  d.s.push([[sx, py, sz + sh - 0.35], [sx + sw, py, sz + sh - 0.35]]);
  d.s.push([[sx + 0.2, py, sz + 1.5], [sx + 1.2, py, sz + 1.5], [sx + 1.2, py, sz + 0.25], [sx + 0.2, py, sz + 0.25], [sx + 0.2, py, sz + 1.5]]);
  for (let i = 0; i < 4; i++) d.h.push([[sx + 1.45, py, sz + 1.5 - i * 0.32], [sx + 2.4 - (i % 2) * 0.4, py, sz + 1.5 - i * 0.32]]);
  for (let i = 1; i < 6; i++) d.h.push([[sx + 0.2 + i * 0.17, py, sz + 0.25], [sx + 0.2 + i * 0.17, py, sz + 1.5]]);
  d.f.push([[0.9, 2.6, 0.9], [0.9, 1.8, 0.3], [1.8, 1.2, 0.3], [1.8, 1.2, 0.55]]);
  d.n.push([0.9, 2.6, 0.9], [1.8, 1.2, 0.3]);
  d.l.push({ at: [sx + sw, py, sz + sh], text: 'INTERFACE' }, { at: [3.6, 1.8, 0.3], text: 'API' }, { at: [1.45, 2.6, 0.9], text: 'DATA', dy: 14 });
  DRAWINGS.fullstack = d;
}

export type IsoKind = 'architecture' | 'devops' | 'backends' | 'reliability' | 'fullstack';

const path = (l: Line, ox: number, oy: number) =>
  'M' + l.map((p) => project(p)).map(([x, y]) => `${(x - ox).toFixed(1)} ${(y - oy).toFixed(1)}`).join('L');

const BUILT = Object.fromEntries(
  Object.entries(DRAWINGS).map(([k, d]) => {
    const [gx, gy, gw, gh] = d.ground;
    const dots: P3[] = [];
    for (let i = gx; i <= gw; i += 0.5) for (let j = gy; j <= gh; j += 0.5) dots.push([i, j, 0]);
    const labelPts = d.l.map((l) => project(l.at));
    const all = [...d.s, ...d.x, ...d.f].flat().map(project).concat(dots.map(project))
      .concat(labelPts.map(([x, y]) => [x + 100, y - 34] as [number, number]));
    const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const ox = Math.min(...xs) - 8, oy = Math.min(...ys) - 8;
    const w = Math.max(...xs) - ox + 8, h = Math.max(...ys) - oy + 8;
    const pt = (p: P3) => { const [x, y] = project(p); return [x - ox, y - oy] as const; };
    return [k, {
      viewBox: `0 0 ${w.toFixed(0)} ${h.toFixed(0)}`,
      s: d.s.map((l) => path(l, ox, oy)),
      x: d.x.map((l) => path(l, ox, oy)),
      h: d.h.map((l) => path(l, ox, oy)),
      f: d.f.map((l) => path(l, ox, oy)),
      n: d.n.map(pt),
      dots: dots.map(pt),
      l: d.l.map((l) => ({ ...l, p: pt(l.at) })),
    }];
  }),
) as Record<IsoKind, {
  viewBox: string; s: string[]; x: string[]; h: string[]; f: string[];
  n: (readonly [number, number])[]; dots: (readonly [number, number])[];
  l: (Label & { p: readonly [number, number] })[];
}>;

export function IsoDrawing({ kind, className }: { kind: IsoKind; className?: string }) {
  const d = BUILT[kind];
  const v = (i: number) => ({ ['--i' as string]: i });
  return (
    <svg viewBox={d.viewBox} className={`iso-draw ${className ?? ''}`} aria-hidden fill="none" stroke="currentColor">
      <g className="iso-ground">
        {d.dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={0.9} />)}
      </g>
      <g className="iso-x">{d.x.map((p, i) => <path key={i} d={p} />)}</g>
      <g className="iso-h">{d.h.map((p, i) => <path key={i} d={p} />)}</g>
      <g className="iso-s">{d.s.map((p, i) => <path key={i} d={p} pathLength={1} style={v(i)} />)}</g>
      <g className="iso-f">{d.f.map((p, i) => <path key={i} d={p} />)}</g>
      <g className="iso-n">
        {d.n.map(([x, y], i) => (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <circle className="iso-ring" r={7} style={v(i)} />
            <circle className="iso-dot" r={2.6} />
          </g>
        ))}
      </g>
      <g className="iso-l">
        {d.l.map((l, i) => {
          const [x, y] = l.p;
          const tx = x + 18, ty = y - 18 + (l.dy ?? 0);
          return (
            <g key={i} style={v(i)}>
              <path d={`M${x.toFixed(1)} ${y.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}h14`} />
              <text x={tx + 18} y={ty + 3.5}>{l.text}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
