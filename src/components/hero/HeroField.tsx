'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mounts the WebGL network field behind the hero.
 *
 * - The renderer module is imported only after first paint (requestIdleCallback), so it never competes with the h1.
 * - Devices that should not run WebGL (reduced motion, Save-Data, software or low-end GPUs) keep the static poster.
 * - One WebGL context at a time on the page: when the hero is more than a screen away the context is DISPOSED (not just
 *   paused), and it is rebuilt when the hero comes back, so the Contact constellation never has a second one beside it.
 * - The loop pauses when the hero leaves the viewport or the tab is hidden. dpr is capped at 1.5.
 */
export function HeroField({
  energy = 1,
  density = 1,
  scrollFade = true,
}: {
  /** 1 = hero; lower = slower and dimmer (Contact uses ~0.45). */
  energy?: number;
  /** Multiplies the point count (Contact uses fewer points). */
  density?: number;
  /** Pull the camera back and fade as the host scrolls away (hero only). */
  scrollFade?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  // A canvas whose WebGL context was released can't get a new one, so each rebuild mounts a fresh <canvas>.
  const [gen, setGen] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement ?? canvas;
    let gone = false;
    let teardown: (() => void) | null = null;
    let idleId = 0;
    let farTimer = 0;

    type Mod = typeof import('@/lib/webgl/networkField');
    let mod: Mod | null = null;

    const build = () => {
      if (gone || teardown || !mod) return;
      const tier = mod.webglTier();
      if (tier === 'none') return;
      const field = mod.createNetworkField(canvas, {
        points: Math.round((tier === 'high' ? 3000 : 1200) * density),
        lines: tier === 'high',
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        energy,
      });
      if (!field) return;

      let inView = true;
      const sync = () => (inView && !document.hidden ? field.start() : field.stop());
      const onVis = () => sync();
      const onResize = () => field.resize();
      const onScroll = () => {
        if (!scrollFade) return;
        const r = host.getBoundingClientRect();
        field.setProgress(-r.top / Math.max(1, r.height));
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const r = canvas.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        field.setPointer(x >= 0 && x <= 1 && y >= 0 && y <= 1 ? x : null, y);
      };
      const onLeave = () => field.setPointer(null);
      const onLost = (e: Event) => {
        e.preventDefault();
        field.stop();
        setLive(false);
      };

      const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        sync();
      });
      io.observe(host);
      document.addEventListener('visibilitychange', onVis);
      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('webglcontextlost', onLost);

      onScroll();
      sync();
      setLive(true);

      teardown = () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('webglcontextlost', onLost);
        field.dispose();
        teardown = null;
      };
    };

    // Rebuild when the hero is near again, dispose when it has been far away for a moment.
    const far = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(farTimer);
        if (e.isIntersecting) {
          build();
        } else {
          farTimer = window.setTimeout(() => {
            if (teardown) {
              teardown();
              setLive(false);
              setGen((g) => g + 1);
            }
          }, 1500);
        }
      },
      { rootMargin: '100% 0px 100% 0px' },
    );

    const boot = async () => {
      mod = await import('@/lib/webgl/networkField');
      if (gone) return;
      far.observe(host); // its first callback builds when the hero is on or near screen
    };

    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelRic = window.cancelIdleCallback ?? window.clearTimeout;
    idleId = ric(() => void boot(), { timeout: 1500 });

    return () => {
      gone = true;
      cancelRic(idleId);
      window.clearTimeout(farTimer);
      far.disconnect();
      teardown?.();
    };
  }, [energy, density, scrollFade, gen]);

  return (
    <canvas
      key={gen}
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
