'use client';

import { LAYER_COUNT, STACK, layerY, project, stackBounds, viewBasis } from './stackGeometry';
import { heroStackStore, isLit, useStackStore, type StackStore } from './stackStore';

/**
 * Static fallback of the 3D stack: the same slabs from the same camera,
 * projected once into an inline SVG. Used below 960px and under reduced
 * motion. No canvas, no animation; a lit layer only darkens its lines.
 */
export interface StackSvgProps {
  store?: StackStore;
  explode?: number;
  activeLayer?: number;
  className?: string;
  /** Stroke/fill colour; default paper white for a difference-blended parent. */
  ink?: string;
}

type P = readonly [number, number, number];

const basis = viewBasis();
const pt = (p: P) => {
  const [x, y] = project(p, basis);
  return `${x.toFixed(3)},${(-y).toFixed(3)}`;
};

function slabFaces(i: number, explode: number) {
  const h = STACK.size / 2;
  const y = layerY(i, explode);
  const top = y + STACK.thickness / 2;
  const bot = y - STACK.thickness / 2;
  const faces: P[][] = [
    // Top face, then the two side faces that face the camera (+x, +z).
    [[-h, top, -h], [h, top, -h], [h, top, h], [-h, top, h]],
    [[h, top, -h], [h, top, h], [h, bot, h], [h, bot, -h]],
    [[h, top, h], [-h, top, h], [-h, bot, h], [h, bot, h]],
  ];
  return faces.map((face) => face.map(pt).join(' '));
}

export default function StackSvg({
  store = heroStackStore,
  explode,
  activeLayer,
  className,
  ink = '#fff',
}: StackSvgProps) {
  const state = useStackStore(store, (s) => `${s.hover}|${s.activeLayer}|${s.explode}`);
  const [hover, storeActive, storeExplode] = state.split('|').map(Number);
  const ex = explode ?? storeExplode;
  const active = activeLayer ?? storeActive;

  const b = stackBounds(ex);
  const pad = 0.04;
  const viewBox = `${(b.minX - pad).toFixed(3)} ${(-b.maxY - pad).toFixed(3)} ${(b.w + pad * 2).toFixed(3)} ${(b.h + pad * 2).toFixed(3)}`;

  const spineTop = pt([0, layerY(0, ex), 0]).split(',');
  const spineBottom = pt([0, layerY(LAYER_COUNT - 1, ex), 0]).split(',');

  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false">
      <line
        x1={spineTop[0]}
        y1={spineTop[1]}
        x2={spineBottom[0]}
        y2={spineBottom[1]}
        stroke={ink}
        strokeOpacity={0.16}
        vectorEffect="non-scaling-stroke"
      />
      {Array.from({ length: LAYER_COUNT }, (_, k) => LAYER_COUNT - 1 - k).map((i) => {
        const on = isLit({ hover, activeLayer: active }, i);
        return (
          <g
            key={i}
            data-layer={i}
            fill={ink}
            fillOpacity={on ? 0.07 : 0.04}
            stroke={ink}
            strokeOpacity={on ? 0.85 : 0.3}
            strokeLinejoin="round"
          >
            {slabFaces(i, ex).map((points, f) => (
              <polygon key={f} points={points} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
