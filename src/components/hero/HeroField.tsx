'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mounts the WebGL network field behind the hero.
 *
 * - The renderer module is imported only after first paint (requestIdleCallback),
 *   so it never competes with the h1 for LCP.
 * - Devices that should not run WebGL (reduced motion, Save-Data, software or
 *   low-end GPUs) keep the static poster rendered by the parent.
 * - The loop pauses when the hero leaves the viewport or the tab is hidden, and
 *   everything is disposed on unmount. dpr is capped at 1.5.
 */
export function HeroField({ energy = 1 }: { energy?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    const boot = async () => {
      const { createNetworkField, webglTier } = await import('@/lib/webgl/networkField');
      if (disposed) return;
      const tier = webglTier();
      if (tier === 'none') return;

      const field = createNetworkField(canvas, {
        points: tier === 'high' ? 3000 : 1200,
        lines: tier === 'high',
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        energy,
      });
      if (!field) return;

      const host = canvas.parentElement ?? canvas;
      let inView = true;
      const sync = () => (inView && !document.hidden ? field.start() : field.stop());

      const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        sync();
      });
      io.observe(host);

      const onVis = () => sync();
      const onResize = () => field.resize();
      const onScroll = () => {
        const r = host.getBoundingClientRect();
        field.setProgress(-r.top / Math.max(1, r.height));
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return; // touch scrolls; don't bend on it
        const r = canvas.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        field.setPointer(x >= 0 && x <= 1 && y >= 0 && y <= 1 ? x : null, y);
      };
      const onLeave = () => field.setPointer(null);
      const onLost = (e: Event) => {
        e.preventDefault();
        field.stop();
        setLive(false); // fall back to the poster
      };

      document.addEventListener('visibilitychange', onVis);
      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('webglcontextlost', onLost);

      onScroll();
      sync();
      setLive(true);

      cleanup = () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('webglcontextlost', onLost);
        field.dispose();
      };
    };

    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelRic = window.cancelIdleCallback ?? window.clearTimeout;
    const id = ric(() => void boot(), { timeout: 1500 });

    return () => {
      disposed = true;
      cancelRic(id);
      cleanup();
    };
  }, [energy]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{
        opacity: live ? 1 : 0,
        transition: 'opacity var(--dur-slow) var(--ease-sig)',
      }}
    />
  );
}
