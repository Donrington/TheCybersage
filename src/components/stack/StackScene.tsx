'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LAYER_COUNT, STACK, fitZoom, layerY, stackBounds, viewBasis } from './stackGeometry';
import { heroStackStore, isLit, type StackStore } from './stackStore';

/**
 * The seven-layer system stack as a procedural three.js drawing: thin box
 * slabs drawn as edge lines in sheet ink with a near-invisible fill, an
 * orthographic isometric-style camera, a slow pointer parallax and a few dots
 * running Edge to Deploy (one instanced draw call).
 *
 * Built to be reused: `explode`, `activeLayer` and the store are all optional
 * so a scroll-driven "exploded" view can drive the same scene.
 */
export interface StackSceneProps {
  /** Shared hover/active/explode state. Defaults to the hero's store. */
  store?: StackStore;
  /** 0..1, spreads the layers apart. Overrides `store.explode` when given. */
  explode?: number;
  /** Pinned layer index, -1 for none. Overrides `store.activeLayer` when given. */
  activeLayer?: number;
  /** Explode value the camera framing is fitted for (default 0 = packed). */
  fitExplode?: number;
  /** Margin in CSS px between the stack and the canvas edge. */
  margin?: number;
  /** Pointer parallax (max ~6°). Default true. */
  parallax?: boolean;
  /** Element whose box normalises the pointer for parallax. Default: viewport. */
  parallaxTarget?: HTMLElement | null;
  /** Request dots travelling Edge → Deploy. Default true. */
  dots?: boolean;
  /** Hovering a slab writes `store.hover`. Default true. */
  interactive?: boolean;
  /**
   * Line/fill/dot colour. Default paper white, meant for a parent with
   * `mix-blend-mode: difference` (reads as ink on paper, paper on dark).
   * On a dark section without blending, white works as-is.
   */
  ink?: string;
}

// Drawn in paper white and composited with mix-blend-mode: difference (see
// .hero-stack): on the white plate it reads as sheet ink, over the black coat
// it inverts to paper, so all seven layers stay legible with no new colour.
const PAPER = '#ffffff';
const LINE_REST = 0.3;
const LINE_LIT = 0.85;
const FILL_REST = 0.04;
const FILL_LIT = 0.07;
const MAX_TILT = (6 * Math.PI) / 180;

const DOT_CAPACITY = 40;
const DOT_LANES: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.19, -0.17],
  [-0.2, 0.15],
];
const DOTS_PER_LANE = 3;
const DOT_PERIOD = 6.4; // seconds, Edge to Deploy

/** Frame-rate independent lerp factor. */
const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

// Scratch objects for the frame loop (module scope, never re-allocated).
const _target = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _matrix = new THREE.Matrix4();

export function StackScene({
  store = heroStackStore,
  explode,
  activeLayer,
  fitExplode = 0,
  margin = 6,
  parallax = true,
  parallaxTarget = null,
  dots = true,
  interactive = true,
  ink = PAPER,
}: StackSceneProps) {
  const root = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const lineMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const fillMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const spine = useRef<THREE.LineSegments>(null);
  const dotMesh = useRef<THREE.InstancedMesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const lit = useRef<number[]>(Array.from({ length: LAYER_COUNT }, () => 0));
  const clock = useRef(0);
  const framed = useRef('');

  // Latest props, read inside the frame loop without re-subscribing.
  const latest = useRef({ explode, activeLayer, fitExplode, margin, dots });
  useEffect(() => {
    latest.current = { explode, activeLayer, fitExplode, margin, dots };
  }, [explode, activeLayer, fitExplode, margin, dots]);

  // One box shared by the seven edge outlines; disposed on unmount. Everything
  // declared in JSX below is disposed by R3F.
  const box = useMemo(() => new THREE.BoxGeometry(STACK.size, STACK.thickness, STACK.size), []);
  const spinePositions = useMemo(() => new Float32Array(6), []);
  useEffect(() => () => box.dispose(), [box]);

  // Pointer parallax source. Mouse only; touch never tilts the drawing.
  useEffect(() => {
    if (!parallax) return;
    const p = pointer.current;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = parallaxTarget?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      p.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1));
      p.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1));
    };
    const reset = () => {
      p.x = 0;
      p.y = 0;
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', reset);
      reset();
    };
  }, [parallax, parallaxTarget]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    clock.current += dt;
    const s = store.get();
    const o = latest.current;
    const ex = o.explode ?? s.explode;
    const active = o.activeLayer ?? s.activeLayer;

    // Framing: fit the stack to the canvas whenever its size changes.
    const key = `${state.size.width}x${state.size.height}|${o.fitExplode}|${o.margin}`;
    if (framed.current !== key) {
      framed.current = key;
      const b = stackBounds(o.fitExplode);
      const { dir, right, up } = viewBasis();
      _target.set(
        right[0] * b.cx + up[0] * b.cy,
        right[1] * b.cx + up[1] * b.cy,
        right[2] * b.cx + up[2] * b.cy,
      );
      const cam = state.camera;
      cam.position.set(_target.x + dir[0] * 20, _target.y + dir[1] * 20, _target.z + dir[2] * 20);
      cam.up.set(0, 1, 0);
      cam.lookAt(_target);
      cam.zoom = fitZoom(state.size.width, state.size.height, o.fitExplode, o.margin);
      cam.near = 0.1;
      cam.far = 60;
      cam.updateProjectionMatrix();
    }

    // Parallax: tilt the stack a few degrees toward the pointer, slowly.
    const g = root.current;
    if (g) {
      const k = damp(2.4, dt);
      g.rotation.y += (pointer.current.x * MAX_TILT - g.rotation.y) * k;
      // Pitch tilt kept small: on a tall stack it reads as a shear.
      g.rotation.x += (pointer.current.y * MAX_TILT * 0.3 - g.rotation.x) * k;
    }

    // Slabs: position from explode, lift + ink from lit state.
    const lerp = damp(9, dt);
    for (let i = 0; i < LAYER_COUNT; i++) {
      const target = isLit({ hover: s.hover, activeLayer: active }, i) ? 1 : 0;
      lit.current[i] += (target - lit.current[i]) * lerp;
      const l = lit.current[i];
      const slab = slabs.current[i];
      if (slab) slab.position.y = layerY(i, ex) + STACK.lift * l;
      const line = lineMats.current[i];
      if (line) line.opacity = LINE_REST + (LINE_LIT - LINE_REST) * l;
      const fill = fillMats.current[i];
      if (fill) fill.opacity = FILL_REST + (FILL_LIT - FILL_REST) * l;
    }

    const top = layerY(0, ex);
    const bottom = layerY(LAYER_COUNT - 1, ex);

    // Spine the requests travel along.
    const sp = spine.current;
    if (sp) {
      const attr = sp.geometry.getAttribute('position') as THREE.BufferAttribute;
      if (attr.getY(0) !== top || attr.getY(1) !== bottom) {
        attr.setXYZ(0, 0, top, 0);
        attr.setXYZ(1, 0, bottom, 0);
        attr.needsUpdate = true;
        sp.geometry.computeBoundingSphere();
      }
    }

    // Dots: from above Edge to below Deploy, fading in and out at the ends.
    const mesh = dotMesh.current;
    if (mesh) {
      const start = top + 0.35;
      const span = start - (bottom - 0.35);
      let n = 0;
      if (o.dots) {
        for (let lane = 0; lane < DOT_LANES.length; lane++) {
          for (let j = 0; j < DOTS_PER_LANE; j++) {
            const phase = (clock.current / DOT_PERIOD + j / DOTS_PER_LANE + lane * 0.137) % 1;
            const fade = Math.max(0.001, Math.min(1, phase / 0.08, (1 - phase) / 0.08));
            _pos.set(DOT_LANES[lane][0], start - phase * span, DOT_LANES[lane][1]);
            _scale.setScalar(fade);
            _matrix.compose(_pos, _quat, _scale);
            mesh.setMatrixAt(n++, _matrix);
          }
        }
      }
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  const initialExplode = explode ?? 0;

  return (
    <group ref={root}>
      {Array.from({ length: LAYER_COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            slabs.current[i] = el;
          }}
          position={[0, layerY(i, initialExplode), 0]}
        >
          <mesh
            renderOrder={0}
            onPointerOver={
              interactive
                ? (e) => {
                    e.stopPropagation();
                    store.set({ hover: i });
                  }
                : undefined
            }
            onPointerOut={
              interactive
                ? () => {
                    if (store.get().hover === i) store.set({ hover: -1 });
                  }
                : undefined
            }
          >
            <boxGeometry args={[STACK.size, STACK.thickness, STACK.size]} />
            <meshBasicMaterial
              ref={(el) => {
                fillMats.current[i] = el;
              }}
              color={ink}
              transparent
              opacity={FILL_REST}
              depthWrite
              polygonOffset
              polygonOffsetFactor={1}
              polygonOffsetUnits={1}
            />
          </mesh>
          <lineSegments renderOrder={1}>
            <edgesGeometry args={[box]} />
            <lineBasicMaterial
              ref={(el) => {
                lineMats.current[i] = el;
              }}
              color={ink}
              transparent
              opacity={LINE_REST}
            />
          </lineSegments>
        </group>
      ))}
      <lineSegments ref={spine} renderOrder={1} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[spinePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ink} transparent opacity={0.16} />
      </lineSegments>
      <instancedMesh ref={dotMesh} args={[undefined, undefined, DOT_CAPACITY]} renderOrder={2} frustumCulled={false}>
        <sphereGeometry args={[0.026, 10, 8]} />
        <meshBasicMaterial color={ink} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

export interface StackCanvasProps extends StackSceneProps {
  className?: string;
  style?: CSSProperties;
  /** Called once the WebGL context exists. */
  onReady?: () => void;
}

/**
 * Canvas wrapper: dpr [1, 1.5], and the loop only runs while the canvas is on
 * screen (frameloop "demand" otherwise). R3F disposes the renderer and every
 * JSX-declared geometry/material on unmount.
 */
export default function StackCanvas({ className, style, onReady, ...scene }: StackCanvasProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} style={style}>
      <Canvas
        orthographic
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'demand'}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        camera={{ position: [10, 10, 10], zoom: 60, near: 0.1, far: 60 }}
        onCreated={() => onReady?.()}
        style={{ position: 'absolute', inset: 0 }}
      >
        <StackScene {...scene} />
      </Canvas>
    </div>
  );
}
