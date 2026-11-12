/**
 * Hand-built isometric line drawings for the Services cards. Each drawing is a
 * list of 3D polylines projected to 2D at module load (no runtime cost beyond
 * the SVG). Strokes are hairlines and draw in via stroke-dashoffset
 * when the parent card's Reveal flips to data-reveal="in" (styles: .iso-draw).
 * Server HTML, no-JS and reduced motion show the finished drawing.
 */

type P3 = [number, number, number];
type Line = P3[];

const C = Math.cos(Math.PI / 6);
// UNIT puts the viewBox at roughly CSS-pixel scale at the rendered size, so a
// 1-unit stroke reads as a hairline without vector-effect (which would break
// pathLength-based dashes).
const UNIT = 40;
const project = ([x, y, z]: P3): [number, number] => [(x - y) * C * UNIT, ((x + y) * 0.5 - z) * UNIT];

/** The 12 edges of a box, as 4 polylines (bottom ring, top ring, 2 verticals pairs). */
function box(x: number, y: number, z: number, dx: number, dy: number, dz: number): Line[] {
  const ring = (h: number): Line => [
    [x, y, h], [x + dx, y, h], [x + dx, y + dy, h], [x, y + dy, h], [x, y, h],
  ];
  return [
    ring(z),
    ring(z + dz),
    [[x, y, z], [x, y, z + dz]],
    [[x + dx, y, z], [x + dx, y, z + dz]],
    [[x + dx, y + dy, z], [x + dx, y + dy, z + dz]],
    [[x, y + dy, z], [x, y + dy, z + dz]],
  ];
}

function polygon(cx: number, cy: number, z: number, r: number, sides: number, rot = 0): Line {
  const pts: Line = [];
  for (let i = 0; i <= sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]);
  }
  return pts;
}

const DRAWINGS: Record<string, Line[]> = {
  // 01 Systems Architecture: a wireframe cube with its floor plan divided.
  architecture: [
    ...box(0, 0, 0, 2, 2, 2),
    [[1, 0, 0], [1, 2, 0]],
    [[0, 1, 0], [2, 1, 0]],
    ...box(0.5, 0.5, 2.25, 1, 1, 0.5),
  ],
  // 02 Cloud & DevOps: three stacked slabs, one pipeline running through them.
  devops: [
    ...box(0, 0, 0, 2, 2, 0.4),
    ...box(0, 0, 0.7, 2, 2, 0.4),
    ...box(0, 0, 1.4, 2, 2, 0.4),
    [[1, 1, -0.3], [1, 1, 2.2]],
  ],
  // 03 Distributed backends: a service hexagon, a raised ring, and the links between.
  backends: [
    polygon(1, 1, 0, 1.45, 6, Math.PI / 6),
    polygon(1, 1, 0.9, 0.9, 36),
    ...[0, 2, 4].map((k): Line => {
      const a = Math.PI / 6 + (k / 6) * Math.PI * 2;
      return [
        [1 + Math.cos(a) * 1.45, 1 + Math.sin(a) * 1.45, 0],
        [1 + Math.cos(a) * 0.9, 1 + Math.sin(a) * 0.9, 0.9],
      ];
    }),
    [[1, 1, 0], [1, 1, 1.6]],
  ],
  // 04 Reliability: a measured floor and a latency trace standing on its back edge.
  reliability: [
    [[0, 0, 0], [2.4, 0, 0], [2.4, 2.4, 0], [0, 2.4, 0], [0, 0, 0]],
    [[0.8, 0, 0], [0.8, 2.4, 0]],
    [[1.6, 0, 0], [1.6, 2.4, 0]],
    [[0, 0.8, 0], [2.4, 0.8, 0]],
    [[0, 1.6, 0], [2.4, 1.6, 0]],
    [
      [0, 0, 0.5], [0.4, 0, 0.5], [0.6, 0, 1.5], [0.8, 0, 0.3], [1.0, 0, 0.7],
      [1.4, 0, 0.6], [1.6, 0, 0.6], [2.0, 0, 0.55], [2.4, 0, 0.55],
    ],
  ],
  // 05 Full stack: a base slab with a screen standing on it.
  fullstack: [
    ...box(0, 0, 0, 2.4, 2, 0.3),
    [[0.3, 0.6, 0.3], [0.3, 0.6, 2.1], [2.1, 0.6, 2.1], [2.1, 0.6, 0.3], [0.3, 0.6, 0.3]],
    [[0.3, 0.6, 1.8], [2.1, 0.6, 1.8]],
    [[0.6, 0.6, 1.4], [1.6, 0.6, 1.4]],
    [[0.6, 0.6, 1.1], [1.9, 0.6, 1.1]],
    [[0.6, 0.6, 0.8], [1.3, 0.6, 0.8]],
  ],
};

export type IsoKind = keyof typeof DRAWINGS;

const BUILT = Object.fromEntries(
  Object.entries(DRAWINGS).map(([k, lines]) => {
    const flat = lines.map((l) => l.map(project));
    const xs = flat.flat().map((p) => p[0]);
    const ys = flat.flat().map((p) => p[1]);
    const pad = 6;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(...xs) - minX + pad;
    const h = Math.max(...ys) - minY + pad;
    const paths = flat.map((l) => 'M' + l.map(([x, y]) => `${(x - minX).toFixed(2)} ${(y - minY).toFixed(2)}`).join('L'));
    return [k, { viewBox: `0 0 ${w.toFixed(3)} ${h.toFixed(3)}`, paths }];
  }),
) as Record<IsoKind, { viewBox: string; paths: string[] }>;

export function IsoDrawing({ kind, className }: { kind: IsoKind; className?: string }) {
  const d = BUILT[kind];
  return (
    <svg viewBox={d.viewBox} className={`iso-draw ${className ?? ''}`} aria-hidden fill="none" stroke="currentColor">
      {d.paths.map((p, i) => (
        <path key={i} d={p} pathLength={1} style={{ ['--i' as string]: i }} />
      ))}
    </svg>
  );
}
