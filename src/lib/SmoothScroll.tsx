'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Shared handle so CTAs and the nav can hand scroll targets to Lenis. */
export let lenisInstance: Lenis | null = null;

/**
 * One smoothing layer for the whole page. Lenis is ticked by GSAP's ticker so
 * ScrollTrigger scrubs (hero, Work, Systems) read exactly the position Lenis
 * is painting. Touch devices and reduced-motion visitors keep native scroll:
 * smoothing there either fights the OS or adds lag for no gain.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      autoRaf: false,
      anchors: { offset: 0, duration: 1.25 },
    });
    lenisInstance = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    document.documentElement.classList.add('lenis');

    // Fonts and late images change document height; recompute ScrollTrigger
    // measurements once they settle.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh, { once: true });

    return () => {
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisInstance = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
    };
  }, []);

  return <>{children}</>;
}
