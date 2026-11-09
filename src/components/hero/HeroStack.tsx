'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { heroStackStore, isLit } from '@/components/stack/stackStore';

// Each view is its own chunk: the SVG never pulls three.js in.
const StackCanvas = dynamic(() => import('@/components/stack/StackScene'), { ssr: false });
const StackSvg = dynamic(() => import('@/components/stack/StackSvg'), { ssr: false });

type Mode = '3d' | 'svg';

const WIDE = '(min-width: 960px)';
const REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * The seven-layer stack drawn over the left edge of the portrait plate, one
 * slab per rail label. Lazy in every sense: this file is loaded with
 * next/dynamic, the 3D scene only after the loader hands over and the browser
 * is idle, and the overlay fades in only after the entrance timeline has
 * released the sheet. Below 960px or with reduced motion it is a static SVG.
 *
 * Rail labels and slabs share hover through `heroStackStore`.
 */
export default function HeroStack() {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [sheetIdle, setSheetIdle] = useState(false);
  const [mount3d, setMount3d] = useState(false);
  const [sheet, setSheet] = useState<HTMLElement | null>(null);

  // Pick the view and follow viewport / preference changes.
  useEffect(() => {
    const wide = window.matchMedia(WIDE);
    const reduced = window.matchMedia(REDUCED);
    const pick = () => setMode(wide.matches && !reduced.matches ? '3d' : 'svg');
    pick();
    wide.addEventListener('change', pick);
    reduced.addEventListener('change', pick);
    return () => {
      wide.removeEventListener('change', pick);
      reduced.removeEventListener('change', pick);
    };
  }, []);

  // Wait for the entrance to release the sheet (data-armed removed).
  useEffect(() => {
    const el = host.current?.closest<HTMLElement>('.hero-sheet') ?? null;
    setSheet(el);
    if (!el) {
      setSheetIdle(true);
      return;
    }
    const check = () => setSheetIdle(!el.hasAttribute('data-armed'));
    check();
    const mo = new MutationObserver(check);
    mo.observe(el, { attributes: true, attributeFilter: ['data-armed'] });
    return () => mo.disconnect();
  }, []);

  // 3D only after the loader has handed over and the main thread is idle.
  useEffect(() => {
    if (mode !== '3d' || mount3d) return;
    let idleId = 0;
    let fallback = 0;
    let gone = false;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelRic = window.cancelIdleCallback ?? window.clearTimeout;
    const go = () => {
      if (gone) return;
      window.clearTimeout(fallback);
      window.removeEventListener('loader-done', go);
      idleId = ric(() => !gone && setMount3d(true), { timeout: 1500 });
    };
    if ((window as unknown as { __loaderDone?: boolean }).__loaderDone) go();
    else {
      window.addEventListener('loader-done', go, { once: true });
      fallback = window.setTimeout(go, 6000);
    }
    return () => {
      gone = true;
      cancelRic(idleId);
      window.clearTimeout(fallback);
      window.removeEventListener('loader-done', go);
    };
  }, [mode, mount3d]);

  // Rail labels <-> slabs: hover writes the store, the store lights the label.
  useEffect(() => {
    const specimen = host.current?.closest<HTMLElement>('.hero-specimen');
    if (!specimen || !mode) return;
    const labels = Array.from(specimen.querySelectorAll<HTMLElement>('.hero-layer'));
    specimen.setAttribute('data-stack', mode);

    const enter = labels.map((_, i) => () => heroStackStore.set({ hover: i }));
    const leave = labels.map((_, i) => () => {
      if (heroStackStore.get().hover === i) heroStackStore.set({ hover: -1 });
    });
    labels.forEach((el, i) => {
      el.addEventListener('pointerenter', enter[i]);
      el.addEventListener('pointerleave', leave[i]);
    });
    const paint = () => {
      const s = heroStackStore.get();
      labels.forEach((el, i) => el.toggleAttribute('data-hot', isLit(s, i)));
    };
    paint();
    const unsub = heroStackStore.subscribe(paint);

    return () => {
      unsub();
      labels.forEach((el, i) => {
        el.removeEventListener('pointerenter', enter[i]);
        el.removeEventListener('pointerleave', leave[i]);
        el.removeAttribute('data-hot');
      });
      specimen.removeAttribute('data-stack');
      heroStackStore.set({ hover: -1 });
    };
  }, [mode]);

  const live = sheetIdle && (mode === 'svg' || (mode === '3d' && canvasReady));

  return (
    <div ref={host} className="hero-stack" data-mode={mode ?? undefined} data-live={live ? '' : undefined}>
      {mode === 'svg' && <StackSvg className="hero-stack-view" />}
      {mode === '3d' && mount3d && (
        <StackCanvas className="hero-stack-view" parallaxTarget={sheet} onReady={() => setCanvasReady(true)} />
      )}
    </div>
  );
}
