'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight } from 'lucide-react';
import { animate, createTimeline, scrambleText } from 'animejs';

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';
const EASE = [0.22, 1, 0.36, 1] as const;
const STACK_TAGS = ['AWS', 'Docker', 'Go', 'PostgreSQL', 'Redis', 'Next.js'];

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
  const nameRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

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

    // ── GSAP: scroll shrink name ───────────────────────────────────────────────
    const ctx = gsap.context(() => {
      if (nameRef.current) {
        gsap.to(nameRef.current, {
          scale: 0.92,
          opacity: 0.4,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
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
      className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col"
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero_image.png"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero_vid_revamp_opt.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/55" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 w-full pl-[clamp(1rem,4vw,5rem)] pr-[clamp(1rem,8vw,14rem)]">

        {/* Top bar nav spacer */}
        <div className="pt-22" />

        {/* Main content — grows to fill */}
        <div className="flex flex-col flex-1 justify-end pb-[clamp(2.5rem,6vw,6rem)]">

          {/* Status pill */}
          <motion.div
            className="flex items-center gap-3 mb-[clamp(1.5rem,3vw,3rem)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 border border-black/15 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span
                className="text-[0.6rem] font-medium tracking-[0.2em] uppercase text-black/50"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                Available for Work
              </span>
            </span>
            <span
              className="text-[0.6rem] font-medium tracking-[0.15em] uppercase text-black/30"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              Lagos, Nigeria · Remote Worldwide
            </span>
          </motion.div>

          {/* H1 — massive display name */}
          <h1
            ref={nameRef}
            className="font-black text-black leading-[0.88] tracking-tighter will-change-transform"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(3.8rem, 11.5vw, 14rem)',
            }}
          >
            <span ref={line1Ref} className="block cursor-default select-none">Abakwe</span>
            <span ref={line2Ref} className="block cursor-default select-none">Carrington</span>
          </h1>

          {/* Italic serif tagline */}
          <p
            ref={subRef}
            className="mt-[clamp(1rem,2.5vw,2.5rem)] text-black/45 cursor-default select-none"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.25rem, 3vw, 3rem)',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}
          >
            Infrastructure &amp; Systems Architect designing distributed platforms for regulated industries — from embedded edge to cloud.
          </p>

          {/* Bottom row: stack + CTA */}
          <div className="mt-[clamp(2rem,4vw,4.5rem)] flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">

            {/* Stack tags — staggered clip-path reveal */}
            <div className="flex flex-wrap gap-2">
              {STACK_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  className="border border-black/15 px-3 py-1 text-[0.65rem] font-medium tracking-[0.12em] uppercase text-black/45"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                  initial={{ opacity: 0, y: 10, clipPath: 'inset(100% 0 0 0)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
                  transition={{ duration: 0.5, delay: 1.6 + i * 0.07, ease: EASE }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-4 shrink-0">
              <motion.a
                href="#work"
                data-cursor="view"
                className="group flex items-center gap-2 bg-black text-white px-6 py-3.5 text-[0.7rem] font-medium tracking-[0.18em] uppercase hover:bg-black/80 transition-colors duration-200"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.1, ease: EASE }}
              >
                View Work
                <ArrowDownRight
                  size={12}
                  className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
                />
              </motion.a>
              <motion.button
                data-cursor="hire"
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-black/40 hover:text-black border border-black/15 px-6 py-3.5 hover:border-black/40 transition-colors duration-200"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2, ease: EASE }}
              >
                Contact
              </motion.button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-12 bg-linear-to-b from-black/30 to-transparent"
          />
          <span
            className="text-[0.55rem] tracking-[0.22em] uppercase text-black/25"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            Scroll
          </span>
        </motion.div>
      </div>

      {/* Side label — desktop */}
      <div className="absolute right-[clamp(1rem,2vw,2.5rem)] top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-10">
        <span
          className="text-[0.55rem] tracking-[0.25em] uppercase text-black/20 [writing-mode:vertical-rl] rotate-180"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          Systems · Cloud · Distributed · Remote
        </span>
      </div>
    </section>
  );
}
