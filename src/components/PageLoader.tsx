'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export function PageLoader({ onDone }: { onDone: () => void }) {
  const panelRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const countRef   = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const labelRef   = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);
  const dotRef     = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    /* ── Logo entrance ───────────────────────────────────────────────────── */
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, y: 18, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', delay: 0.2 },
    );

    /* ── Logo subtle float ───────────────────────────────────────────────── */
    gsap.to(logoRef.current, {
      y: -6,
      duration: 2.2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.2,
    });

    /* ── Dot pulse ───────────────────────────────────────────────────────── */
    gsap.to(dotRef.current, {
      opacity: 0.15,
      repeat: -1,
      yoyo: true,
      duration: 0.6,
      ease: 'power1.inOut',
    });

    /*
     * ── Readiness-driven progress (no fixed timer) ──────────────────────────
     * Progress eases toward 90% while the page is still loading, then races to
     * 100% the moment the window fires `load`. A short minimum floor prevents an
     * ugly flash on fast connections; a fallback guarantees we never hang.
     */
    let raf = 0;
    let current = 0;
    let ready = document.readyState === 'complete';
    let minElapsed = false;
    let exiting = false;

    const startExit = () => {
      if (exiting) return;
      exiting = true;
      gsap.killTweensOf([logoRef.current, dotRef.current]); // stop float/pulse before exit
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          onDone();
        },
      });
      tl.to([logoRef.current, countRef.current, labelRef.current], {
        opacity: 0,
        y: -16,
        duration: 0.4,
        ease: 'power2.in',
        stagger: 0.05,
      });
      panelRefs.current.forEach((panel, i) => {
        tl.to(panel, { y: '-100%', duration: 0.8, ease: 'power4.inOut' }, 0.2 + i * 0.07);
      });
    };

    const tick = () => {
      const target = ready && minElapsed ? 1 : 0.9;
      current += (target - current) * 0.08;
      if (target === 1 && current > 0.995) current = 1;
      setCount(Math.min(100, Math.round(current * 100)));
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${current})`;
      if (current >= 1) {
        startExit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onReady = () => { ready = true; };
    if (!ready) window.addEventListener('load', onReady);

    const minTimer  = setTimeout(() => { minElapsed = true; }, 700);
    const fallback  = setTimeout(() => { ready = true; minElapsed = true; }, 6000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(minTimer);
      clearTimeout(fallback);
      window.removeEventListener('load', onReady);
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">

      {/* ── 5 vertical panels ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { panelRefs.current[i] = el; }}
            className="flex-1"
            style={{ backgroundColor: '#0A0A0A' }}
          />
        ))}
      </div>

      {/* ── Logo — center ──────────────────────────────────────────────────── */}
      <div
        ref={logoRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none gap-5"
        style={{ opacity: 0 }}
      >
        <Image
          src="/sage/sage_prim_white.png"
          alt="Cybersage"
          width={520}
          height={140}
          priority
          style={{ height: 'clamp(60px, 12vw, 130px)', width: 'auto', objectFit: 'contain', opacity: 0.88 }}
        />

        {/* Loading indicator below logo */}
        <div
          ref={labelRef}
          className="flex items-center gap-2"
        >
          <span
            ref={dotRef}
            className="block w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
          />
          <span
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.05em',
            }}
          >
            Loading portfolio
          </span>
        </div>
      </div>

      {/* ── Progress line — bottom edge ─────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          ref={lineRef}
          className="h-full origin-left"
          style={{ backgroundColor: 'rgba(255,255,255,0.28)', transform: 'scaleX(0)' }}
        />
      </div>

      {/* ── Counter — bottom right ──────────────────────────────────────────── */}
      <div
        ref={countRef}
        className="absolute bottom-6 right-6 z-10 pointer-events-none select-none tabular-nums"
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(4rem, 10vw, 8rem)',
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        {count}%
      </div>

      {/* ── Index label — bottom left ───────────────────────────────────────── */}
      <div
        className="absolute bottom-7 left-6 z-10 pointer-events-none"
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.5rem',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.14)',
          fontWeight: 500,
        }}
      >
        Portfolio · 2026
      </div>

    </div>
  );
}
