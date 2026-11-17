'use client';

import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { POSITIONING } from '@/content/site';
import { HeroFigure } from '@/components/hero/HeroFigure';
import { HeroLogo } from '@/components/hero/HeroLogo';
import { createHeroSplit, type HeroSplit } from '@/components/hero/heroSplit';
import { cancelScramble, scrambleWord } from '@/components/hero/heroScramble';
import type { HeroEntrance } from '@/components/hero/heroEntrance';
import { lenisInstance } from '@/lib/SmoothScroll';

const NAME = ['ABAKWE', 'CARRINGTON'] as const;

const SPECS = [
  { label: 'Base', value: 'Lagos, Nigeria / UTC+1' },
  { label: 'Stack', value: 'AWS · Go · Django · PostgreSQL' },
  { label: 'Works with', value: 'Remote clients, worldwide' },
] as const;

/**
 * The hero is a cover sheet built around one image: the portrait as a line
 * drawing on the left of a rule and as a photograph on the right. Drawn first,
 * then built, which is the job. The rule follows the pointer, drifts when left
 * alone, and runs out to the left as the sheet scrolls away.
 *
 * The name crosses the figure at chest height in `difference`, so it is ink on
 * the paper and on the drawing and turns white over the black coat. For that to
 * work nothing between the section and the <h1> may form a stacking context:
 * no transform, opacity, filter or z-index on `.hero-content` or `.hero-stage`.
 * Animate the name, the figure and the copy themselves, never their parents.
 *
 * The name is real text in the server HTML. Entrance and motion are armed on
 * mount (the loader covers the sheet) and never under reduced motion. Pointing
 * at a word of the name, or tapping it, replays the glyph scramble on it.
 */
export function HeroV2() {
  const sheet = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const nodeReadout = useRef<HTMLSpanElement>(null);
  const railReadout = useRef<HTMLSpanElement>(null);
  const split = useRef<HeroSplit | null>(null);
  const ctaWrap = useRef<HTMLSpanElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  // The split rule and the entrance, both released by the loader. The sheet is
  // armed on mount and disarmed by the timeline; a timeout means a stuck loader
  // can never hold the page hostage. Reduced motion never arms anything.
  useEffect(() => {
    const el = sheet.current;
    const figure = box.current;
    if (!el || !figure) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rule = createHeroSplit({
      root: el,
      box: figure,
      readouts: [nodeReadout.current, railReadout.current],
      reduced,
      held: !reduced,
    });
    split.current = rule;
    if (reduced) {
      return () => {
        rule.dispose();
        split.current = null;
      };
    }

    let alive = true;
    let started = false;
    let fallback = 0;
    let entrance: HeroEntrance | null = null;

    // The timeline lives in its own chunk, fetched while the loader runs.
    const ready = import('@/components/hero/heroEntrance')
      .then((mod) => {
        if (alive) entrance = mod.createHeroEntrance(el, () => rule.develop());
      })
      .catch((error) => {
        // Never leave the sheet hidden if the chunk fails to load.
        console.warn('[hero] entrance unavailable', error);
        el.removeAttribute('data-armed');
        rule.release();
      });

    const start = () => {
      if (!alive || started) return;
      started = true;
      window.clearTimeout(fallback);
      ready.then(() => {
        if (alive) entrance?.play();
      });
    };

    // The scramble on the name: pointerenter covers both a mouse arriving and a
    // finger landing. It waits until the entrance has let go of the letters.
    const words = Array.from(el.querySelectorAll<HTMLElement>('.hero-name-mask'));
    const onWord = (event: Event) => {
      if (el.hasAttribute('data-armed')) return;
      scrambleWord(event.currentTarget as HTMLElement);
    };
    words.forEach((word) => word.addEventListener('pointerenter', onWord));

    el.setAttribute('data-armed', '');
    const done = (window as unknown as { __loaderDone?: boolean }).__loaderDone;
    if (done) start();
    else {
      window.addEventListener('loader-done', start, { once: true });
      fallback = window.setTimeout(start, 6000);
    }

    return () => {
      alive = false;
      window.clearTimeout(fallback);
      window.removeEventListener('loader-done', start);
      words.forEach((word) => {
        word.removeEventListener('pointerenter', onWord);
        cancelScramble(word);
      });
      entrance?.dispose();
      rule.dispose();
      split.current = null;
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

  // Scroll choreography: the copy lifts away, the figure lags behind the name,
  // and the rule runs out to the left so the portrait leaves fully built. GSAP
  // is ticked by Lenis in SmoothScroll, so the scrub stays in sync. Every
  // target is a leaf of the stage (see the note on stacking contexts above).
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
          onUpdate: (self) => split.current?.setScroll(self.progress * 1.35),
        },
      });

      tl.to(q('.hero-topline'), { yPercent: -120, opacity: 0, duration: 0.35, ease: 'none' }, 0)
        .to(q('.hero-copy, .hero-rail'), { y: -70, opacity: 0, duration: 0.7, ease: 'none' }, 0)
        .to(q('.hero-figure, .hero-split-ui'), { y: 70, duration: 1, ease: 'none' }, 0)
        .to(q('.hero-name'), { y: -36, duration: 1, ease: 'none' }, 0)
        .to(q('.hero-grid-bg'), { y: 48, duration: 1, ease: 'none' }, 0);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        split.current?.setScroll(0);
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
      <div aria-hidden className="hero-spotlight" />

      <div className="hero-content">
        <header className="hero-topline">
          <span>Cybersage</span>
          <span className="hero-topline-mid">Portfolio / 2026</span>
          <span>Cover sheet / 00</span>
        </header>

        <div className="hero-stage">
          <HeroFigure boxRef={box} readoutRef={nodeReadout} />

          {/* One real phrase for crawlers and screen readers: the visible name, a real
              space between its words, and the role and place as visually hidden text.
              The label is what assistive tech announces instead of the lettered spans. */}
          <h1
            id="hero-name"
            className="hero-name"
            aria-label="Abakwe Carrington, software engineer and systems architect in Lagos, Nigeria"
          >
            {NAME.map((word, w) => (
              <span key={word} className="hero-name-mask">
                {word.split('').map((char, i) => (
                  <span key={i} className="hero-char">{char}</span>
                ))}
                {w < NAME.length - 1 ? ' ' : null}
              </span>
            ))}
            <span className="sr-only"> — Software Engineer &amp; Systems Architect in Lagos, Nigeria</span>
          </h1>

          <div className="hero-copy">
            <p className="hero-kicker">
              <span aria-hidden className="hero-kicker-mark" />
              <span>Infrastructure &amp; systems architect</span>
            </p>

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

          <div className="hero-rail" aria-hidden>
            <HeroLogo />
            <p className="hero-rail-head">
              <span>Fig. 01</span>
              <span>Principal</span>
            </p>
            <p className="hero-rail-note">
              Drawn first.
              <br />
              Then built.
            </p>
            <div className="hero-rail-key">
              <p style={{ '--k': 0 } as CSSProperties}>
                <i>A</i>
                <b>Draft</b>
                <span>Line study</span>
              </p>
              <p style={{ '--k': 1 } as CSSProperties}>
                <i>B</i>
                <b>Built</b>
                <span>Photograph</span>
              </p>
            </div>
            <p className="hero-rail-read">
              <span>Rule at</span>
              <span ref={railReadout}>0.50</span>
            </p>
            <p className="hero-rail-hint">
              <span className="hero-hint-fine">[ Move across the figure ]</span>
              <span className="hero-hint-coarse">[ Drag across the figure ]</span>
            </p>
          </div>
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
