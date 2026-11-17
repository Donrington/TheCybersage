/**
 * The hero portrait is two registered layers: a line drawing (A, draft) and the
 * photograph (B, built). One number, `--split`, says where the drawing stops
 * and the photograph begins, as a fraction of the figure's width. CSS clips
 * both layers from it and places the rule and its tags, so this file only ever
 * writes that custom property (plus a text readout).
 *
 * Behaviour:
 *  - held at 1 (all drawing) until the entrance calls `develop()`, which sweeps
 *    the rule to the middle once;
 *  - idle: the rule breathes a few percent either side of the middle;
 *  - pointer over the figure: the rule follows it (mouse hover, or a touch drag);
 *  - scroll: `setScroll(p)` pushes the rule out to the left, so the portrait is
 *    fully "built" by the time the sheet leaves.
 *
 * Reduced motion: no sweep, no breathing, no easing. The rule still goes where
 * the pointer is, because that is direct manipulation, not decoration.
 */
export interface HeroSplit {
  develop(duration?: number): void;
  release(): void;
  setScroll(progress: number): void;
  dispose(): void;
}

interface Options {
  /** The element that owns `--split` (the hero section). */
  root: HTMLElement;
  /** The figure box the rule travels across. */
  box: HTMLElement;
  /** Optional text nodes that show the current split. */
  readouts?: (HTMLElement | null)[];
  reduced: boolean;
  /** Start held on the drawing, waiting for `develop()`. */
  held: boolean;
}

const REST = 0.5;
const MIN = 0.02;
const MAX = 0.98;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const easeInOutCubic = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function createHeroSplit({ root, box, readouts = [], reduced, held }: Options): HeroSplit {
  const coarse = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Touch screens cannot hover, so the idle drift is wider there: it is the
  // only way those visitors see the drawing turn into the photograph unasked.
  const amplitude = coarse ? 0.16 : 0.035;
  const period = coarse ? 9000 : 7000;

  let current = held ? 1 : REST;
  let target = current;
  let holding = held;
  let engaged = false;
  let dragging = false;
  let scroll = 0;
  let visible = true;
  let raf = 0;
  let last = 0;
  let idleStart = 0;
  let sweep: { start: number; from: number; duration: number } | null = null;
  let shown = '';

  const write = () => {
    const value = clamp(current * (1 - scroll), 0, 1);
    root.style.setProperty('--split', value.toFixed(4));
    const text = value.toFixed(2);
    if (text !== shown) {
      shown = text;
      for (const node of readouts) if (node) node.textContent = text;
    }
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(64, now - (last || now));
    last = now;

    if (sweep) {
      const k = clamp((now - sweep.start) / sweep.duration, 0, 1);
      current = sweep.from + (REST - sweep.from) * easeInOutCubic(k);
      if (k >= 1) {
        sweep = null;
        idleStart = now;
      }
    } else if (!holding) {
      if (!engaged) target = reduced ? REST : REST + amplitude * Math.sin(((now - idleStart) / period) * Math.PI * 2);
      // Exponential approach, frame-rate independent: quick under the pointer,
      // slow when it is only drifting back.
      const rate = engaged ? 14 : 3.2;
      current = reduced ? target : current + (target - current) * (1 - Math.exp((-dt / 1000) * rate));
    }

    write();
    const settled = reduced && !sweep && Math.abs(target - current) < 0.0005;
    if (visible && !holding && !settled) raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (!raf && visible) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  const follow = (clientX: number, clientY: number, strict: boolean) => {
    const rect = box.getBoundingClientRect();
    if (!rect.width) return false;
    const t = (clientX - rect.left) / rect.width;
    const inside = t > -0.06 && t < 1.06 && clientY > rect.top - 24 && clientY < rect.bottom + 4;
    if (strict && !inside) return false;
    target = clamp(t, MIN, MAX);
    return true;
  };

  const disengage = () => {
    if (!engaged) return;
    engaged = false;
    dragging = false;
    idleStart = performance.now();
    // Start the drift from the middle of its cycle so it eases back, not jumps.
    target = REST;
    wake();
  };

  const onMove = (event: PointerEvent) => {
    if (holding || sweep) return;
    if (event.pointerType === 'mouse') {
      if (follow(event.clientX, event.clientY, true)) {
        engaged = true;
        wake();
      } else disengage();
    } else if (dragging) {
      follow(event.clientX, event.clientY, false);
      wake();
    }
  };
  const onDown = (event: PointerEvent) => {
    if (holding || sweep || event.pointerType === 'mouse') return;
    if (follow(event.clientX, event.clientY, true)) {
      engaged = true;
      dragging = true;
      wake();
    }
  };
  const onUp = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') disengage();
  };

  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('pointerdown', onDown, { passive: true });
  root.addEventListener('pointerleave', disengage);
  window.addEventListener('pointerup', onUp, { passive: true });
  window.addEventListener('pointercancel', onUp, { passive: true });

  // Nothing to paint while the sheet is off screen.
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });
  observer.observe(root);

  write();
  if (!holding) wake();

  return {
    develop(duration = 1500) {
      if (!holding) return;
      holding = false;
      if (reduced) {
        current = target = REST;
        write();
        return;
      }
      sweep = { start: performance.now(), from: current, duration };
      wake();
    },
    release() {
      if (!holding) return;
      holding = false;
      current = target = REST;
      idleStart = performance.now();
      write();
      wake();
    },
    setScroll(progress) {
      scroll = clamp(progress, 0, 1);
      write();
    },
    dispose() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerleave', disengage);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      root.style.removeProperty('--split');
    },
  };
}
