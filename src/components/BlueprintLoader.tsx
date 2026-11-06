'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Page loader that draws the site's subject: the seven-layer system stack from "Under the hood", as a technical
 * drawing. Stroke progress follows real readiness (load event + a short floor, 5 s fallback), a hairline and a
 * % counter advance with it, and mono lines print as each layer completes. On finish the sheet lifts away.
 */
const LAYERS = ['EDGE', 'GATEWAY', 'SERVICES', 'CACHE', 'DATABASE', 'ACCESS', 'DEPLOY'];
const LOG = ['001 BOOT EDGE', '002 ROUTE GATEWAY', '003 START SERVICES', '004 WARM CACHE', '005 MOUNT DATABASE', '006 ENFORCE ACCESS', '007 SHIP & MONITOR'];

// One path per drawable piece, each with the progress window in which it draws.
function pieces() {
  const out: { d: string; from: number; to: number }[] = [];
  const x0 = 120, w = 420, h = 34, gap = 22, y0 = 40;
  LAYERS.forEach((_, i) => {
    const y = y0 + i * (h + gap);
    const a = 0.04 + i * 0.12;
    out.push({ d: `M${x0} ${y} h${w} v${h} h${-w} z`, from: a, to: a + 0.16 });
    out.push({ d: `M${x0 + 24} ${y + h / 2} h${w - 48}`, from: a + 0.06, to: a + 0.2 });
    for (let n = 0; n < 4; n++) out.push({ d: `M${x0 + 70 + n * 100} ${y + 8} v${h - 16}`, from: a + 0.08 + n * 0.02, to: a + 0.18 });
    if (i < LAYERS.length - 1) out.push({ d: `M${x0 + w / 2} ${y + h} v${gap}`, from: a + 0.12, to: a + 0.24 });
    out.push({ d: `M${x0 - 36} ${y + h / 2} h36`, from: a + 0.02, to: a + 0.1 });
  });
  return out;
}
const PIECES = pieces();

export function BlueprintLoader({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, cur = 0, ready = document.readyState === 'complete', minDone = false, finished = false;
    const onReady = () => { ready = true; };
    if (!ready) window.addEventListener('load', onReady);
    const minT = setTimeout(() => { minDone = true; }, reduced ? 300 : 1900);
    const fb = setTimeout(() => { ready = true; minDone = true; }, 5000);
    const tick = () => {
      const target = ready && minDone ? 1 : 0.88;
      cur += (target - cur) * (reduced ? 0.4 : 0.045);
      if (target === 1 && cur > 0.995) cur = 1;
      setP(cur);
      if (cur >= 1 && !finished) {
        finished = true;
        setLeaving(true);
        window.setTimeout(() => { document.body.style.overflow = ''; onDoneRef.current(); }, reduced ? 0 : 900);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(minT); clearTimeout(fb);
      window.removeEventListener('load', onReady);
      document.body.style.overflow = '';
    };
  }, []);

  const pct = Math.round(p * 100);
  const lines = Math.min(LOG.length, Math.floor(p * (LOG.length + 0.4)));

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#0A0A0A] text-white"
      style={{ transform: leaving ? 'translateY(-100%)' : 'none', transition: leaving ? 'transform 800ms cubic-bezier(0.76,0,0.24,1)' : 'none' }}
    >
      <svg viewBox="0 0 660 460" className="absolute top-1/2 left-1/2 w-[min(86vw,820px)] -translate-x-1/2 -translate-y-[56%]" fill="none" aria-hidden>
        {PIECES.map((s, i) => {
          const t = Math.min(1, Math.max(0, (p - s.from) / (s.to - s.from)));
          return <path key={i} d={s.d} pathLength={1} stroke="rgba(255,255,255,0.78)" strokeWidth={1} strokeDasharray={1} strokeDashoffset={1 - t} />;
        })}
        {LAYERS.map((l, i) => {
          const y = 40 + i * 56 + 21;
          const on = p > 0.1 + i * 0.12;
          return <text key={l} x={560} y={y} fontSize={9} fill="rgba(255,255,255,0.6)" fontFamily="var(--font-mono)" letterSpacing="1.4" style={{ opacity: on ? 1 : 0, transition: 'opacity 300ms' }}>{`${String(i + 1).padStart(2, '0')} ${l}`}</text>;
        })}
      </svg>

      {/* Brand mark: top-left, fades and sharpens in as the drawing builds. */}
      <div
        aria-hidden
        className="absolute top-[clamp(1.25rem,3vw,2.5rem)] left-[clamp(1rem,4vw,3rem)] w-[clamp(96px,9vw,150px)]"
        style={{ opacity: Math.min(1, p * 3), filter: `blur(${Math.max(0, 1 - p * 3) * 6}px)`, transform: `translateY(${Math.max(0, 1 - p * 3) * 10}px)` }}
      >
        <Image src="/sage/sage_prim_white.png" alt="" width={888} height={910} priority quality={95} sizes="320px" className="block h-auto w-full" style={{ filter: 'brightness(1.5) contrast(1.2) drop-shadow(0 0 0.5px rgba(255,255,255,0.9))' }} />
      </div>
      <p className="t-mono absolute top-[clamp(1.5rem,3.4vw,2.9rem)] left-[calc(clamp(1rem,4vw,3rem)+clamp(96px,9vw,150px)+0.9rem)] hidden text-white/50 sm:block" aria-hidden>CYBERSAGE / SHEET 00</p>

      {/* progress hairline + % */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" style={{ transform: 'translateY(210px)' }}>
        <div className="h-px bg-white" style={{ width: `${pct}%` }} />
        <span className="t-mono absolute -top-6 text-white/70" style={{ left: `calc(${pct}% - 1.5rem)` }}>{pct}%</span>
      </div>

      <p className="t-label absolute bottom-8 left-[clamp(1rem,4vw,3rem)] text-white/60">Abakwe Carrington · Systems · 2026</p>
      <ul className="t-mono absolute right-[clamp(1rem,4vw,3rem)] bottom-8 hidden text-right text-white/60 sm:block" aria-hidden>
        {LOG.slice(0, lines).map((l) => <li key={l}>{l}</li>)}
      </ul>
    </div>
  );
}
