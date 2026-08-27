'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight } from 'lucide-react';
import { animate, createTimeline, scrambleText } from 'animejs';
import { useReducedMotion } from '@/lib/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';
const EASE = [0.22, 1, 0.36, 1] as const;

function runScramble(el: HTMLElement, duration = 900, delay = 0) {
  animate(el, {
    innerHTML: scrambleText({
      chars: SCRAMBLE_CHARS,
      duration,
      delay,
      perturbation: 0.18,
      cursor: '█▓▒░',
      settleDuration: 280,
    }),
  });
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    // ── Scramble entrance ──────────────────────────────────────────────────────
    const tl = createTimeline({ delay: 180 });

    if (line1Ref.current && line2Ref.current && subRef.current) {
      tl.add(line1Ref.current, {
        innerHTML: scrambleText({
          chars: SCRAMBLE_CHARS,
          duration: 820,
          perturbation: 0.22,
          cursor: '█▓▒░',
          settleDuration: 260,
        }),
      });
      tl.add(line2Ref.current, {
        innerHTML: scrambleText({
          chars: SCRAMBLE_CHARS,
          duration: 820,
          perturbation: 0.22,
          cursor: '█▓▒░',
          settleDuration: 260,
        }),
      }, '-=680');
      tl.add(subRef.current, {
        innerHTML: scrambleText({
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz —',
          duration: 700,
          perturbation: 0.15,
          cursor: '░▒',
          settleDuration: 200,
        }),
      }, '-=500');
    }

    // ── GSAP: pin hero, shrink/dim the whole card, release into About ───────────
    // Desktop only — pinning eats an extra viewport-height of scroll, which reads
    // as intentional dwell time on desktop but as scroll-lock jank on mobile, so
    // mobile keeps the lighter plain-scrub version (matches Experience.tsx, which
    // draws the same line for its own scroll-jacking horizontal-scroll section).
    // Targets the card (video + gradient + all text, as one unit) rather than
    // just the name — everything shrinks/dims/lifts together as one block.
    const ctx = gsap.context(() => {
      if (!cardRef.current || !containerRef.current) return;
      const isDesktop = window.innerWidth >= 1024;

      gsap.to(cardRef.current, {
        scale: 0.92,
        opacity: 0.4,
        y: -40,
        transformOrigin: 'center center',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: isDesktop ? '+=50%' : 'bottom top',
          scrub: 1.5,
          pin: isDesktop,
          // true (the default): reserves proper scroll space for the pin, so
          // About is fully pushed out of the viewport until the pin actually
          // releases — no overlap with the pinned card, ever. (Tried false for
          // a peek-through-the-frame effect; it visibly collided with About's
          // headline on desktop, not worth the risk.)
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Settles fully pinned or fully released rather than leaving the hero
          // stranded mid-shrink if the user stops scrolling mid-transition.
          snap: isDesktop ? { snapTo: 1, duration: 0.4, ease: 'power1.inOut' } : undefined,
        },
      });
    }, containerRef);

    // ── Hover replay ───────────────────────────────────────────────────────────
    const hoverTargets: [HTMLElement | null, number][] = [
      [line1Ref.current, 700],
      [line2Ref.current, 700],
      [subRef.current, 600],
    ];
    const cleanups: (() => void)[] = [];
    hoverTargets.forEach(([el, dur]) => {
      if (!el) return;
      const handler = () => runScramble(el, dur);
      el.addEventListener('pointerenter', handler);
      cleanups.push(() => el.removeEventListener('pointerenter', handler));
    });

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden flex"
      style={{
        isolation: 'isolate',
        zIndex: 2,
        padding: 'clamp(4px, 0.6vw, 10px)',
        // Transparent — the padding reveals the page behind it (just background
        // at rest; About never reaches it, since pinSpacing:true below keeps
        // About fully offscreen for the whole pin duration).
      }}
    >
      {/* Rounded, clipped card — the section's small padding shows around it as
          a light frame, so the pin reads as a card holding still rather than a
          flat surface hard-cutting into the next section. */}
      <div
        ref={cardRef}
        className="relative flex-1 w-full overflow-hidden flex flex-col"
        style={{ borderRadius: 'clamp(16px, 2vw, 28px)' }}
      >
      {/* Beam — the site's biggest surface, so a thicker ring (2px vs the
          standard 1px) and a slower rotation (9s) read better at this scale
          than the button-sized defaults. overflow-hidden above is safe here:
          it only breaks position:sticky (a different bug, fixed earlier in
          PricingPromo), not an inset:0 absolute child like this. */}
      {!reduced && (
        <span
          aria-hidden
          className="beam-ring"
          style={{ position: 'absolute', inset: 0, padding: 2, pointerEvents: 'none', zIndex: 20, animationDuration: '9s', borderRadius: 'inherit' }}
        />
      )}
      {/* Video background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero_cine_poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero_cine.mp4" type="video/mp4" />
        </video>
        {/* Dark scrim, NOT white. The text is white on mix-blend-mode: difference,
            which renders |255 - backdrop| — so it vanishes over mid-grey (~128)
            and is brightest over near-black. The old white scrim lifted this
            corner to ~150 and made ~27% of the headline zone unreadable; a dark
            scrim pushes it the other way (measured ~2%) and deepens the blacks
            the brand wants. Keep any scrim here dark for that reason. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 85% 78% at 18% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 42%, rgba(0,0,0,0) 80%)',
          }}
        />
      </div>

      {/* Content */}
      {/* Right padding is symmetric with the left on mobile — the wide desktop-only
          gap exists to dodge the side label, which is hidden below lg */}
      <div className="relative z-10 flex flex-col flex-1 w-full pl-[clamp(1rem,4vw,5rem)] pr-[clamp(1rem,4vw,5rem)] lg:pr-[clamp(1rem,8vw,14rem)]">

        {/* Top bar nav spacer */}
        <div className="pt-22" />

        {/* Main content — grows to fill */}
        <div className="flex flex-col flex-1 justify-end pb-[clamp(2.5rem,6vw,6rem)]">

          {/* Status pill — wraps on narrow phones instead of clipping/overflowing */}
          <motion.div
            className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-[clamp(1.5rem,3vw,3rem)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: EASE }}
          >
            <span
              className="inline-flex items-center gap-2 border px-3 py-1.5"
              style={{ borderColor: '#FFFFFF', mixBlendMode: 'difference' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FFFFFF' }} />
              <span
                className="text-[0.6rem] font-medium tracking-[0.2em] uppercase"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif', color: '#FFFFFF' }}
              >
                Available for Work
              </span>
            </span>
            <span
              className="text-[0.6rem] font-medium tracking-[0.15em] uppercase"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif', color: '#D9D9D9', mixBlendMode: 'difference' }}
            >
              Lagos, Nigeria · Remote Worldwide
            </span>
          </motion.div>

          {/* H1 — massive display name */}
          <h1
            ref={nameRef}
            className="font-black leading-[0.88] tracking-tighter will-change-transform"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3.8rem, 11.5vw, 14rem)',
              color: '#FFFFFF',
              mixBlendMode: 'difference',
            }}
          >
            <span ref={line1Ref} className="block cursor-default select-none">Abakwe</span>
            <span ref={line2Ref} className="block cursor-default select-none">Carrington</span>
          </h1>

          {/* Italic serif tagline — auto-inverting like the name above it */}
          <p
            ref={subRef}
            className="mt-[clamp(1rem,2.5vw,2.5rem)] cursor-default select-none"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.25rem, 3vw, 3rem)',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
              color: '#D9D9D9',
              mixBlendMode: 'difference',
            }}
          >
            Infrastructure &amp; Systems Architect designing distributed platforms for regulated industries — from embedded edge to cloud.
          </p>

          {/* Bottom row: CTA (stack pills now live in the TechTicker below the hero) */}
          <div className="mt-[clamp(2rem,4vw,4.5rem)] flex flex-col sm:flex-row items-start sm:items-end justify-end gap-8">

            {/* CTAs */}
            <div className="flex items-center gap-4 shrink-0">
              <motion.a
                href="#work"
                data-cursor="view"
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                  e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
                }}
                onPointerEnter={(e) => e.currentTarget.style.setProperty('--mh', '1')}
                onPointerLeave={(e) => e.currentTarget.style.setProperty('--mh', '0')}
                className="group flex items-center gap-2 bg-black text-white px-6 py-3.5 text-[0.7rem] font-medium tracking-[0.18em] uppercase hover:bg-black/80 transition-colors duration-200"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif', position: 'relative' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.1, ease: EASE }}
                whileTap={{ scale: 0.96 }}
              >
                {!reduced && (
                  <>
                    <span aria-hidden className="metal-edge" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '7s' }} />
                    <span aria-hidden className="metal-sheen" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6, animationDuration: '5.5s' }} />
                  </>
                )}
                <span aria-hidden className="metal-highlight" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  View Work
                  <ArrowDownRight
                    size={12}
                    className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
                  />
                </span>
              </motion.a>
              <motion.button
                data-cursor="hire"
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="text-[0.7rem] font-medium tracking-[0.18em] uppercase border px-6 py-3.5 transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  color: '#FFFFFF',
                  borderColor: '#FFFFFF',
                  mixBlendMode: 'difference',
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2, ease: EASE }}
              >
                Contact
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Side label — desktop */}
      <div className="absolute right-[clamp(1rem,2vw,2.5rem)] top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-10">
        <span
          className="text-[0.55rem] tracking-[0.25em] uppercase [writing-mode:vertical-rl] rotate-180"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif', color: '#D9D9D9', mixBlendMode: 'difference' }}
        >
          Systems · Cloud · Distributed · Remote
        </span>
      </div>
      </div>
    </section>
  );
}
