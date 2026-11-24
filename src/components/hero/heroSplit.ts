import { sfx } from '@/lib/sound';

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
 *
 * Sound: only while the pointer is driving the rule. Its movement per event
 * feeds the paper-scrape voice (sfx.drag), and the rule clicking over each 5%
 * step plays a detent. The sweep, the idle breathing and the scroll push stay
 * silent.
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
/** One detent per 5% of the figure's width. */
const DETENT = 0.05;
/** Slack either side of a step before it counts as crossed, so a shaky hand on a boundary does not rattle. */
const DETENT_SLACK = 0.003;
/** Rule movement per pointer event (fraction of the width) that counts as full speed. */
const FULL_SPEED = 0.05;
/** Keeps the scrape well under the engine's ceiling. */
const SCRAPE_LEVEL = 0.8;

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
  // Sound state: the step the rule last settled on, and the pointer's last position (null = no stroke in progress).
  let zone = Math.floor(current / DETENT);
  let lastT: number | null = null;
  let scrapeSpeed = 0;
  // When the hover rule engaged. A cursor just passing over the portrait on its way elsewhere stays silent:
  // hover sounds start after a short dwell. A pressed drag (touch) sounds straight away.
  let engagedAt = 0;
  const soundOk = () => dragging || performance.now() - engagedAt > 250;

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

    // A detent each time the pointer-driven rule crosses a 5% step. Otherwise just keep track of where it is.
    const at = clamp(current, 0, 1);
    if (engaged && !sweep && !holding) {
      if (at >= (zone + 1) * DETENT + DETENT_SLACK || at < zone * DETENT - DETENT_SLACK) {
        zone = Math.floor(at / DETENT);
        if (soundOk()) sfx.play('detent', { deg: Math.round(at * 9), pan: (at - 0.5) * 1.2, gain: dragging ? 1 : 0.6 });
      }
    } else zone = Math.floor(at / DETENT);

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

  // Paper scrape: loudness from how far the rule was asked to move since the last event, pitch from where it is.
  const scrape = () => {
    if (!soundOk()) {
      lastT = target;
      return;
    }
    if (lastT !== null) {
      const raw = Math.min(1, Math.abs(target - lastT) / FULL_SPEED);
      scrapeSpeed += (raw - scrapeSpeed) * 0.5;
      sfx.drag(scrapeSpeed * SCRAPE_LEVEL * (dragging ? 1 : 0.45), target);
    }
    lastT = target;
  };

  const disengage = () => {
    lastT = null;
    scrapeSpeed = 0;
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
        if (!engaged) engagedAt = performance.now();
        engaged = true;
        scrape();
        wake();
      } else disengage();
    } else if (dragging) {
      follow(event.clientX, event.clientY, false);
      scrape();
      wake();
    }
  };
  const onDown = (event: PointerEvent) => {
    if (holding || sweep || event.pointerType === 'mouse') return;
    if (follow(event.clientX, event.clientY, true)) {
      engaged = true;
      dragging = true;
      lastT = target;
      scrapeSpeed = 0;
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
