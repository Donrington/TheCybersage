'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSITIONING } from '@/content/site';
import { HeroSpecimen } from '@/components/hero/HeroSpecimen';
import type { HeroEntrance } from '@/components/hero/heroEntrance';
import { lenisInstance } from '@/lib/SmoothScroll';

const SPECS = [
  { label: 'Role', value: 'Infrastructure & systems architect' },
  { label: 'Base', value: 'Lagos, Nigeria / UTC+1' },
  { label: 'Stack', value: 'AWS · Go · Django · PostgreSQL' },
] as const;

/**
 * The hero is drawn as a cover sheet: a drafting grid, a specimen portrait
 * scanned by the same seven layers as the loader, and a title block of real
 * facts along the bottom edge.
 *
 * The name stays real text in the server HTML. Once the loader hands over, each
 * line rises out of a mask and runs the original glyph-scramble; the second
 * line is an outline until you point at it, then fills and scrambles again.
 */
export function HeroV2() {
  const sheet = useRef<HTMLElement>(null);
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const ctaWrap = useRef<HTMLSpanElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  // Entrance and the name scramble, both released by the loader. The sheet is
  // armed on mount (the loader covers it) and disarmed on `loader-done`; CSS
  // transitions do the rest. A timeout means a stuck loader can never hold the
  // page hostage. Reduced motion never arms anything.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lines = [line1.current, line2.current].filter(Boolean) as HTMLElement[];
    let alive = true;
    let started = false;
    let fallback = 0;
    let entrance: HeroEntrance | null = null;

    // The timeline lives in its own chunk, fetched while the loader runs.
    const ready = import('@/components/hero/heroEntrance')
      .then((mod) => {
        if (alive) entrance = mod.createHeroEntrance(el, lines);
      })
      .catch((error) => {
        // Never leave the sheet hidden if the chunk fails to load.
        console.warn('[hero] entrance unavailable', error);
        el.removeAttribute('data-armed');
      });

    const start = () => {
      if (!alive || started) return;
      started = true;
      window.clearTimeout(fallback);
      ready.then(() => {
        if (alive) entrance?.play();
      });
    };

    el.setAttribute('data-armed', '');
    const done = (window as unknown as { __loaderDone?: boolean }).__loaderDone;
    if (done) start();
    else {
      window.addEventListener('loader-done', start, { once: true });
      fallback = window.setTimeout(start, 6000);
    }

    const onEnter = (event: Event) => {
      if (!started) return;
      entrance?.replay(event.currentTarget as HTMLElement);
    };
    lines.forEach((line) => line.addEventListener('pointerenter', onEnter));

    return () => {
      alive = false;
      window.clearTimeout(fallback);
      window.removeEventListener('loader-done', start);
      lines.forEach((line) => line.removeEventListener('pointerenter', onEnter));
      entrance?.dispose();
      el.removeAttribute('data-armed');
    };
  }, []);

  // A faint drafting spotlight follows the pointer. Direct DOM writes only, so
  // moving the mouse never re-renders React.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      el.style.setProperty('--spot', '1');
    };
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => {
      el.style.setProperty('--spot', '0');
    };

    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Magnetic primary CTA: a few pixels of lag toward the pointer, springing
  // back on leave. Disabled for touch and reduced motion.
  useEffect(() => {
    const wrap = ctaWrap.current;
    const anchor = cta.current;
    if (!wrap || !anchor) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const clamp = (n: number) => Math.max(-5, Math.min(5, n));

    const tick = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      wrap.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.08 || Math.abs(ty - cy) > 0.08) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      const rect = anchor.getBoundingClientRect();
      tx = clamp((event.clientX - (rect.left + rect.width / 2)) * 0.16);
      ty = clamp((event.clientY - (rect.top + rect.height / 2)) * 0.16);
      wake();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      wake();
    };

    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerleave', leave);
    return () => {
      wrap.removeEventListener('pointermove', move);
      wrap.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
      wrap.style.transform = '';
    };
  }, []);

  // Scroll choreography: the sheet lifts away while the name lines drift apart
  // and the specimen lags behind, giving the handoff to Work some depth. GSAP
  // is ticked by Lenis in SmoothScroll, so the scrub stays in sync.
  useEffect(() => {
    const root = sheet.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 960px)', () => {
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      tl.to(q('.hero-topline'), { yPercent: -120, opacity: 0, duration: 0.35, ease: 'none' }, 0)
        .to(q('.hero-copy'), { y: -80, opacity: 0.12, duration: 1, ease: 'none' }, 0)
        .to(q('.hero-specimen'), { y: 56, opacity: 0.2, duration: 1, ease: 'none' }, 0)
        .fromTo(q('.hero-plate-parallax'), { yPercent: 0 }, { yPercent: 6, duration: 1, ease: 'none' }, 0)
        .to(q('.hero-grid-bg'), { y: 48, duration: 1, ease: 'none' }, 0);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => mm.revert();
  }, []);

  const onWork = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector<HTMLElement>('#work');
    if (!target) return;
    event.preventDefault();

    if (lenisInstance) {
      lenisInstance.scrollTo('#work', { duration: 1.6 });
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      ref={sheet}
      id="top"
      aria-labelledby="hero-name"
      data-theme="light"
      className="hero-sheet"
    >
      <div aria-hidden className="hero-grid-bg" />
      <div aria-hidden className="hero-glow" />
      <div aria-hidden className="hero-spotlight" />

      <div className="hero-content">
        <header className="hero-topline">
          <span>Cybersage</span>
          <span className="hero-topline-mid">Portfolio / 2026</span>
          <span>Cover sheet / 00</span>
        </header>

        <div className="hero-stage">
          <div className="hero-copy">
            <p className="hero-kicker">
              <span>Infrastructure &amp; systems architect</span>
              <span aria-hidden className="hero-kicker-line" />
              <span>Lagos, Nigeria / UTC+1</span>
            </p>

            <h1 id="hero-name" aria-label="Abakwe Carrington" className="hero-name">
              <span className="hero-name-mask">
                <span ref={line1} className="hero-name-line cursor-default select-none">ABAKWE</span>
              </span>
              <span className="hero-name-mask">
                <span ref={line2} className="hero-name-line hero-name-outline cursor-default select-none">CARRINGTON</span>
              </span>
            </h1>

            <p className="hero-positioning">{POSITIONING}</p>

            <div className="hero-actions">
              <span ref={ctaWrap} className="hero-cta-wrap">
                <a
                  ref={cta}
                  href="#work"
                  onClick={onWork}
                  data-cursor="view"
                  data-magnetic
                  data-theme="dark"
                  className="hero-cta"
                >
                  <span>View work</span>
                  <span aria-hidden className="hero-cta-icon">
                    <ArrowDownRight size={16} strokeWidth={2} />
                  </span>
                </a>
              </span>

              <button
                type="button"
                data-cursor="hire"
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="hero-contact"
              >
                <span>Contact</span>
                <ArrowUpRight size={13} aria-hidden />
              </button>
            </div>
          </div>

          <HeroSpecimen />
        </div>

        <dl className="hero-titleblock" aria-label="At a glance">
          {SPECS.map((spec) => (
            <div key={spec.label} className="hero-cell">
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
          <div className="hero-cell">
            <dt>Status</dt>
            <dd>
              <span className="hero-status">
                <span aria-hidden className="hero-live" />
                <span>Available for work</span>
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
