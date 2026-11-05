'use client';

import { useEffect, useRef } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { animate, scrambleText } from 'animejs';
import { POSITIONING } from '@/content/site';
import { NowChip } from '@/components/NowChip';
import { HeroField } from '@/components/hero/HeroField';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';

/**
 * Hero, v2. The name is real text in the server HTML (readable, indexable, and
 * what no-JS and reduced-motion visitors see); after mount each line runs the
 * original glyph-scramble reveal, and replays on hover. The network field is
 * WebGL behind it, loaded after first paint; without WebGL the static poster
 * below IS the background.
 */
export function HeroV2() {
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const card = useRef<HTMLDivElement>(null);

  // Scroll shrink + dim of the whole card as the hero leaves (CSS var, no re-renders).
  useEffect(() => {
    const el = card.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      el.style.setProperty('--hs', p.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [line1.current, line2.current];
    if (els.some((e) => !e)) return;
    const cleanups: (() => void)[] = [];

    const run = (el: HTMLElement, delay = 0, duration = 820) =>
        animate(el, {
          innerHTML: scrambleText({ chars: SCRAMBLE_CHARS, duration, delay, perturbation: 0.22, cursor: '█▓▒░', settleDuration: 260 }),
        });
    const start = () => {
      run(els[0]!, 120);
      run(els[1]!, 260);
    };
    const done = (window as unknown as { __loaderDone?: boolean }).__loaderDone;
    if (done) start();
    else window.addEventListener('loader-done', start, { once: true });
    cleanups.push(() => window.removeEventListener('loader-done', start));
    for (const el of els as HTMLElement[]) {
      const onEnter = () => run(el, 0, 700);
      el.addEventListener('pointerenter', onEnter);
      cleanups.push(() => el.removeEventListener('pointerenter', onEnter));
    }
    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      id="top"
      aria-labelledby="hero-name"
      data-theme="dark"
      className="relative flex w-full min-h-[100svh]"
      style={{ isolation: 'isolate', zIndex: 2, padding: 'clamp(4px, 0.6vw, 10px)' }}
    >
      <div
        ref={card}
        className="hero-card relative flex flex-1 flex-col overflow-hidden bg-[#0A0A0A]"
        style={{ borderRadius: 'clamp(16px, 2vw, 28px)' }}
      >
        {/* Rotating light ring around the card, as before. */}
        <span aria-hidden className="beam-ring pointer-events-none absolute inset-0 z-20 motion-reduce:hidden" style={{ padding: 2, animationDuration: '9s', borderRadius: 'inherit' }} />
        {/* Background: static poster (always), WebGL field fades in over it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-poster absolute inset-0" />
          <HeroField />
          {/* Keeps the name and buttons on calm ground whatever the field does. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 85% 75% at 0% 100%, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0) 75%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end px-[clamp(1rem,4vw,5rem)] pt-28 pb-24 sm:pb-[clamp(2.5rem,6vw,6rem)]">
          <p className="t-label text-on-ink-2 mb-[clamp(1.25rem,2.5vw,2.5rem)] flex flex-wrap gap-x-2 gap-y-1">
            <span>Infrastructure &amp; Systems Architect</span>
            <span aria-hidden className="text-on-ink-3">·</span>
            <span>Lagos, Nigeria</span>
            <span aria-hidden className="hidden text-on-ink-3 sm:inline">·</span>
            <span className="hidden sm:inline">Remote worldwide</span>
          </p>

          <h1
            id="hero-name"
            aria-label="Abakwe Carrington"
            className="font-black leading-[0.88] tracking-tighter text-white"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(3.6rem, 11.5vw, 14rem)' }}
          >
            <span className="hero-line"><span ref={line1} className="cursor-default select-none">Abakwe</span></span>
            <span className="hero-line"><span ref={line2} className="cursor-default select-none">Carrington</span></span>
          </h1>

          <p
            className="hero-slide mt-[clamp(1rem,2.5vw,2.25rem)] max-w-[34ch] text-on-ink-1"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.35rem, 2.6vw, 2.6rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {POSITIONING}
          </p>

          <div className="hero-fade mt-[clamp(2rem,4vw,3.5rem)] flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#work"
                data-cursor="view"
                className="group relative inline-flex min-h-11 items-center gap-2 bg-white px-6 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] transition-colors duration-200 hover:bg-white/85"
              >
                <span aria-hidden className="metal-edge motion-reduce:hidden" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '7s' }} />
                <span className="relative">View work</span>
                <ArrowDownRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
              <button
                type="button"
                data-cursor="hire"
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="inline-flex min-h-11 items-center border border-white/60 px-6 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
              >
                Contact
              </button>
            </div>

            <NowChip />
          </div>
        </div>
      </div>
    </section>
  );
}
