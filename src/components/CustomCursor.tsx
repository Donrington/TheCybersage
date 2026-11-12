'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Site cursor: fine pointers only, never on touch or under reduced motion (the native cursor stays).
 *
 * - Dot (5px) is written in the rAF loop from the latest pointer position, no easing: 1:1.
 * - Ring (28px hairline) lerps after it at 0.18; grows to 48px over links/buttons (dot shrinks to 3px),
 *   scales to 0.8 while pressed, and hides over text fields, where the native cursor returns (globals.css).
 * - Over the hero (#top): a mono X/Y readout beside the dot and dashed crosshair lines clipped to the hero.
 * - Primary buttons marked data-magnetic lean up to 6px toward the pointer (CSS translate, see globals.css).
 *
 * No React state on the hot path and no animation library: one pointer listener, one rAF loop that idles
 * once the ring has settled. Every element is pointer-events: none. Colours use mix-blend-mode: difference
 * with white, so the cursor reads ink on canvas and white on ink with no per-section switching (no flicker).
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const hx = useRef<HTMLDivElement>(null);
  const vx = useRef<HTMLDivElement>(null);
  // ssr:false chunk, so window exists on first render.
  const [on] = useState(
    () => matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!on) return;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');
    const els = [dot.current!, ring.current!, tag.current!, hx.current!, vx.current!];
    const [d, r, t, h, v] = els;
    let x = -99, y = -99, rx = -99, ry = -99, raf = 0;
    let hero: HTMLElement | null = null;
    let mag: HTMLElement | null = null; // primary button under the pointer: pulled 6px max toward it
    const pull = (el: HTMLElement | null, dx = 0, dy = 0) => {
      el?.style.setProperty('--mag-x', `${dx}px`);
      el?.style.setProperty('--mag-y', `${dy}px`);
    };

    const frame = () => {
      raf = 0;
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      d.style.transform = `translate(${x}px,${y}px)`;
      r.style.transform = `translate(${rx}px,${ry}px)`;
      if (hero) {
        const b = hero.getBoundingClientRect();
        t.style.transform = `translate(${x + 18}px,${y + 14}px)`;
        t.textContent = `X ${String(Math.round(x)).padStart(4, '0')} Y ${String(Math.round(y - b.top)).padStart(4, '0')}`;
        h.style.cssText = `left:${b.left}px;width:${b.width}px;transform:translateY(${y}px)`;
        v.style.cssText = `top:${Math.max(0, b.top)}px;height:${Math.min(innerHeight, b.bottom) - Math.max(0, b.top)}px;transform:translateX(${x}px)`;
      }
      if (Math.abs(x - rx) + Math.abs(y - ry) > 0.2) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (rx < -90) { rx = x; ry = y; } // first move: no fly-in from the corner
      root.dataset.cursor = root.dataset.cursor || 'on';
      if (mag) {
        const b = mag.getBoundingClientRect();
        const k = (v: number, size: number) => Math.max(-6, Math.min(6, ((v / size) - 0.5) * 12)).toFixed(1);
        pull(mag, +k(x - b.left, b.width), +k(y - b.top, b.height));
      }
      kick();
    };
    // Boundary crossings only (not per pixel): pick the mode.
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element;
      root.dataset.cursor = el.closest('input:not([type=button],[type=submit],[type=checkbox],[type=radio]),textarea,select,[contenteditable]')
        ? 'text'
        : el.closest('a,button,[role=button],summary,label')
          ? 'link'
          : 'on';
      const nextMag = el.closest<HTMLElement>('[data-magnetic]');
      if (nextMag !== mag) {
        pull(mag);
        mag = nextMag;
      }
      const nextHero = el.closest<HTMLElement>('#top');
      if (nextHero !== hero) {
        hero = nextHero;
        root.toggleAttribute('data-cursor-hero', !!hero);
        kick();
      }
    };
    const onDown = () => root.toggleAttribute('data-cursor-down', true);
    const onUp = () => root.toggleAttribute('data-cursor-down', false);
    const onLeave = () => {
      pull(mag);
      mag = null;
      delete root.dataset.cursor;
      hero = null;
      root.removeAttribute('data-cursor-hero');
    };
    // The hero scrolls under a still pointer: keep the crosshair on it.
    const onScroll = () => hero && kick();

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerover', onOver, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('pointerup', onUp, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerover', onOver);
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      removeEventListener('scroll', onScroll);
      root.removeEventListener('pointerleave', onLeave);
      root.classList.remove('has-custom-cursor');
      root.removeAttribute('data-cursor-hero');
      root.removeAttribute('data-cursor-down');
      delete root.dataset.cursor;
    };
  }, [on]);

  if (!on) return null;
  return (
    <div aria-hidden className="cur">
      <div ref={hx} className="cur-h" />
      <div ref={vx} className="cur-v" />
      <div ref={ring} className="cur-ring"><i /></div>
      <div ref={dot} className="cur-dot"><i /></div>
      <div ref={tag} className="cur-tag" />
    </div>
  );
}
