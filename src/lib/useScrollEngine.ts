'use client';

import { useEffect, type RefObject } from 'react';

/**
 * One scroll engine for the whole page: a single passive scroll listener and a
 * single requestAnimationFrame loop that only runs while something is moving.
 * Each subscribed element gets its progress written to a CSS custom property
 * (default `--progress`, 0 → 1), never to React state, so scroll-linked
 * motion costs no re-renders. CSS does the rest:
 *
 *   transform: translateY(calc((1 - var(--progress)) * 40px));
 *
 * Progress runs from 0 when the element's top reaches the bottom of the
 * viewport to 1 when its bottom leaves the top (override with `range`).
 */

type Range = 'cross' | 'enter' | 'pin';

interface Sub {
  el: HTMLElement;
  prop: string;
  range: Range;
  last: number;
}

const subs = new Set<Sub>();
let raf = 0;
let listening = false;

function measure(sub: Sub) {
  const r = sub.el.getBoundingClientRect();
  const vh = window.innerHeight;
  let p: number;
  switch (sub.range) {
    case 'enter': // 0 as the top enters the bottom of the viewport, 1 when the top reaches the middle
      p = (vh - r.top) / (vh / 2);
      break;
    case 'pin': // 0 when the top reaches the viewport top, 1 when the bottom reaches the viewport bottom (sticky stages)
      p = -r.top / Math.max(1, r.height - vh);
      break;
    default: // 'cross'
      p = (vh - r.top) / (vh + r.height);
  }
  p = Math.min(1, Math.max(0, p));
  if (Math.abs(p - sub.last) > 0.0005) {
    sub.last = p;
    sub.el.style.setProperty(sub.prop, p.toFixed(4));
  }
}

function frame() {
  raf = 0;
  subs.forEach(measure);
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

function stop() {
  if (!listening || subs.size) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export function useScrollEngine(
  ref: RefObject<HTMLElement | null>,
  { prop = '--progress', range = 'cross', enabled = true }: { prop?: string; range?: Range; enabled?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Reduced motion: pin to the final state, never animate.
      el.style.setProperty(prop, '1');
      return;
    }
    const sub: Sub = { el, prop, range, last: -1 };
    subs.add(sub);
    start();
    measure(sub);
    return () => {
      subs.delete(sub);
      stop();
    };
  }, [ref, prop, range, enabled]);
}
