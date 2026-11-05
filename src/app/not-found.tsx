'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { animate, scrambleText } from 'animejs';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { CustomCursor } from '@/components/CustomCursor';

// ─── Seeded pseudo-random (stable SSR/CSR) ────────────────────────────────────
function sr(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆░▒▓';
const EASE = [0.22, 1, 0.36, 1] as const;

const FLOAT_TERMS = [
  'undefined', 'null', 'void', 'NaN', '0x404',
  'ERR', 'NOT_FOUND', '404', 'ENOENT', '∅',
  'false', 'dead link', 'null ref', '0',
];

function runScramble(el: HTMLElement, duration = 1200) {
  animate(el, {
    innerHTML: scrambleText({
      chars: SCRAMBLE_CHARS,
      duration,
      perturbation: 0.22,
      cursor: '█▓▒░',
      settleDuration: 340,
    }),
  });
}

interface Floater {
  id: number; word: string;
  x: number; y: number;
  rot: number; size: number;
  delay: number; dur: number;
  opacity: number;
}

function buildFloaters(): Floater[] {
  return Array.from({ length: 14 }, (_, i) => {
    const r = (n: number) => sr(i * 19 + n);
    const zone = Math.floor(r(0) * 4);
    let x: number, y: number;
    if      (zone === 0) { x = r(1) * 16 + 1;   y = r(2) * 78 + 10; }
    else if (zone === 1) { x = r(1) * 16 + 82;  y = r(2) * 78 + 10; }
    else if (zone === 2) { x = r(1) * 58 + 20;  y = r(2) * 14 + 3;  }
    else                 { x = r(1) * 58 + 20;  y = r(2) * 11 + 85; }
    return {
      id: i,
      word: FLOAT_TERMS[i % FLOAT_TERMS.length],
      x: round(x), y: round(y),
      rot:     round((r(3) - 0.5) * 14),
      size:    round(0.52 + r(4) * 0.34, 4),
      delay:   round(r(5) * 2.8),
      dur:     round(6 + r(6) * 5),
      opacity: round(0.05 + r(7) * 0.07, 4),
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotFound() {
  const numRef  = useRef<HTMLHeadingElement>(null);
  const sub1Ref = useRef<HTMLSpanElement>(null);
  const sub2Ref = useRef<HTMLSpanElement>(null);
  const floaters = useMemo(buildFloaters, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => numRef.current  && runScramble(numRef.current,  1700), 180),
      setTimeout(() => sub1Ref.current && runScramble(sub1Ref.current, 1100), 1050),
      setTimeout(() => sub2Ref.current && runScramble(sub2Ref.current,  850), 1600),
    ];
    // Re-scramble on hover — like the hero
    const el = numRef.current;
    const handler = () => el && runScramble(el, 1000);
    el?.addEventListener('pointerenter', handler);
    return () => {
      timers.forEach(clearTimeout);
      el?.removeEventListener('pointerenter', handler);
    };
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col">
      <CustomCursor />

      {/* ── Floating error vocabulary (desktop only) ──────────────────────── */}
      {floaters.map((f) => (
        <motion.span
          key={f.id}
          aria-hidden
          className="hidden md:block"
          style={{
            position: 'absolute',
            left: `${f.x}%`,
            top:  `${f.y}%`,
            fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
            fontSize: `${f.size}rem`,
            color: `rgba(10,10,10,${f.opacity})`,
            rotate: `${f.rot}deg`,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: '0.06em',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, f.opacity, f.opacity * 0.6, f.opacity, 0],
            y: [6, 0, -3, 0, -6],
          }}
          transition={{
            duration: f.dur,
            delay: f.delay,
            repeat: Infinity,
            repeatDelay: f.dur * 0.7,
            ease: 'easeInOut',
          }}
        >
          {f.word}
        </motion.span>
      ))}

      {/* ── Ghost 404 — massive faded background ──────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-end pr-[5vw] pointer-events-none select-none"
      >
        <span
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(14rem, 38vw, 52rem)',
            letterSpacing: '-0.07em',
            color: 'rgba(10,10,10,0.028)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          404
        </span>
      </div>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-[clamp(1.5rem,5vw,5rem)] pt-7"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Logo */}
        <Link href="/" aria-label="Cybersage">
          <Image
            src="/logo/logo_white.png"
            alt="Cybersage"
            width={110}
            height={28}
            style={{ filter: 'invert(1)', opacity: 0.4 }}
            className="hover:opacity-70 transition-opacity duration-300"
          />
        </Link>

        {/* Status badge */}
        <span
          className="text-xs tracking-[0.24em] uppercase text-on-canvas-3 font-medium border border-black/10 px-3 py-1.5"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          Error · 404
        </span>
      </motion.div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 justify-center px-[clamp(1.5rem,5vw,5rem)] pb-[clamp(4rem,8vw,8rem)]">

        {/* Section label row — matches all other section headers */}
        <motion.div
          className="flex items-center gap-4 mb-[clamp(2.5rem,5vw,5rem)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          <span
            className="text-xs tracking-[0.26em] uppercase text-on-canvas-3 font-medium shrink-0"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            00 / Error
          </span>
          <motion.div
            className="h-px bg-black/10"
            style={{ width: 'clamp(2rem,8vw,6rem)' }}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          />
        </motion.div>

        {/* ── 404 heading — scramble animated ─────────────────────────────── */}
        <div className="overflow-hidden mb-[clamp(1.5rem,3vw,3rem)]">
          <h1
            ref={numRef}
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(5.5rem, 17vw, 18rem)',
              letterSpacing: '-0.055em',
              lineHeight: 0.88,
              color: '#0A0A0A',
              display: 'block',
              cursor: 'default',
            }}
          >
            404
          </h1>
        </div>

        {/* Hairline rule — clips in from left */}
        <motion.div
          style={{
            height: '1px',
            background: 'rgba(10,10,10,0.10)',
            width: 'clamp(8rem, 22vw, 20rem)',
            marginBottom: 'clamp(1.8rem,3.5vw,3.5rem)',
            transformOrigin: 'left',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.85, ease: EASE }}
        />

        {/* ── Subtitle — scrambles in ──────────────────────────────────────── */}
        <h2
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(1.6rem, 3.6vw, 3.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'rgba(10,10,10,0.58)',
            marginBottom: 'clamp(1.2rem,2.5vw,2.5rem)',
          }}
        >
          <span ref={sub1Ref}>Page Not Found.</span>
        </h2>

        {/* ── Body copy — scrambles in ─────────────────────────────────────── */}
        <p
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontSize: 'clamp(0.78rem, 1.3vw, 0.92rem)',
            letterSpacing: '0.04em',
            color: 'rgba(10,10,10,0.58)',
            maxWidth: '38ch',
            lineHeight: 1.9,
            marginBottom: 'clamp(2.8rem,5.5vw,5rem)',
          }}
        >
          <span ref={sub2Ref}>
            This page doesn&apos;t exist — but your next project can.
          </span>
        </p>

        {/* ── CTAs ─────────────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.85, ease: EASE }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 bg-black text-white px-7 py-4 text-xs font-medium tracking-[0.2em] uppercase hover:bg-black/80 transition-colors duration-200"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            Back to Home
            <ArrowUpRight
              size={11}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
            />
          </Link>
          <Link
            href="/#contact"
            className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-on-canvas-3 hover:text-black border border-black/15 px-7 py-4 hover:border-black/40 transition-colors duration-200"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            <ArrowLeft size={11} />
            Get in Touch
          </Link>
        </motion.div>
      </div>

      {/* ── Bottom status bar ─────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 flex items-center justify-between px-[clamp(1.5rem,5vw,5rem)] pb-8 border-t border-black/[0.05]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2, ease: EASE }}
      >
        <span
          className="text-xs tracking-[0.2em] uppercase text-black/15 font-medium pt-6"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          © 2026 Abakwe Carrington · Cybersage
        </span>
        <span
          className="text-xs tracking-[0.18em] uppercase text-black/12 font-medium pt-6"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          Infrastructure &amp; Systems Architect
        </span>
      </motion.div>

      {/* ── HUD coordinates — desktop only ────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="absolute bottom-20 right-[clamp(1.5rem,5vw,5rem)] z-10 text-right hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4, ease: EASE }}
      >
        <p
          className="text-xs tracking-[0.18em] uppercase text-black/12 leading-relaxed"
          style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace' }}
        >
          X · 404<br />
          Y · 0000<br />
          STATUS · NOT_FOUND
        </p>
      </motion.div>

      {/* ── Left vertical label — desktop only ───────────────────────────── */}
      <motion.div
        aria-hidden
        className="absolute left-7 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
      >
        <div className="w-px h-12 bg-black/8" />
        <span
          className="text-xs tracking-[0.24em] uppercase text-black/15 font-medium"
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            writingMode: 'vertical-rl',
            letterSpacing: '0.22em',
          }}
        >
          Cybersage · 2026
        </span>
        <div className="w-px h-12 bg-black/8" />
      </motion.div>

      {/* ── Decorative edge lines ─────────────────────────────────────────── */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-px bg-black/[0.04] hidden lg:block pointer-events-none"
        initial={{ scaleY: 0, transformOrigin: 'top' }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.3, delay: 0.2, ease: EASE }}
      />
    </main>
  );
}
