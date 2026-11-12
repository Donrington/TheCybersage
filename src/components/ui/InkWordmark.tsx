'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Huge outline "CYBERSAGE" wordmark with construction lines (audit Prompt 15).
 *
 * The outline is SVG and readable without JS. Over it, one 2D canvas paints the
 * solid letters through a brush mask: the cursor (or a tap) lays down a few
 * overlapping soft dabs with ragged edges, and the painted area fades out over
 * about three seconds once painting stops. The loop runs only while there is
 * paint on screen, and never off-screen. Reduced motion: outline only.
 *
 * Geometry is fixed in viewBox units (font-size 100, text stretched to
 * TEXT_W with textLength), and the canvas reproduces the same stretch with a
 * horizontal scale, so fill and outline line up at any width.
 */

const WORD = 'CYBERSAGE';
const VB_W = 1000;
const VB_H = 150;
const TEXT_X = 10;
const TEXT_W = 980;
const BASELINE = 112;
const FONT_SIZE = 100;
const CAP = BASELINE - 72; // Satoshi cap height ≈ 0.72em
const FONT = `900 ${FONT_SIZE}px Satoshi, system-ui, sans-serif`;

const HOLD_MS = 500; // paint stays solid this long after the last dab
const FADE_MS = 2500; // then decays to nothing over this long

export function InkWordmark({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');
    if (!ctx || !mctx) return;

    let scale = 1; // canvas px per viewBox unit
    let stretch = 1; // textLength squeeze, reproduced in canvas
    let raf = 0;
    let inView = false;
    let lastPaint = 0;
    let painted = false;
    let lastX = -1;
    let lastY = -1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = host.getBoundingClientRect();
      canvas.width = mask.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = mask.height = Math.max(1, Math.round(r.height * dpr));
      scale = canvas.width / VB_W;
      ctx.font = FONT;
      stretch = TEXT_W / Math.max(1, ctx.measureText(WORD).width);
      painted = false;
      mctx.clearRect(0, 0, mask.width, mask.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // A ragged dab: a soft core plus a few smaller offset blots.
    const dab = (x: number, y: number, size: number) => {
      const blots = 5;
      for (let i = 0; i < blots; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = i === 0 ? 0 : size * (0.35 + Math.random() * 0.45);
        const bx = x + Math.cos(a) * d;
        const by = y + Math.sin(a) * d;
        const br = size * (i === 0 ? 1 : 0.35 + Math.random() * 0.4);
        const g = mctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(0.6, 'rgba(0,0,0,0.85)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        mctx.fillStyle = g;
        mctx.beginPath();
        mctx.arc(bx, by, br, 0, Math.PI * 2);
        mctx.fill();
      }
    };

    const paintAt = (clientX: number, clientY: number, burst = false) => {
      const r = canvas.getBoundingClientRect();
      const k = canvas.width / r.width;
      const x = (clientX - r.left) * k;
      const y = (clientY - r.top) * k;
      const size = canvas.height * 0.26;
      mctx.globalCompositeOperation = 'source-over';
      if (burst) {
        for (let i = 0; i < 6; i++) dab(x + (Math.random() - 0.5) * size * 2.4, y + (Math.random() - 0.5) * size, size);
      } else if (lastX >= 0) {
        // Fill the gap between pointer events so fast strokes stay continuous.
        const dist = Math.hypot(x - lastX, y - lastY);
        const steps = Math.min(12, Math.ceil(dist / (size * 0.5)));
        for (let s = 1; s <= steps; s++) dab(lastX + ((x - lastX) * s) / steps, lastY + ((y - lastY) * s) / steps, size);
      } else {
        dab(x, y, size);
      }
      lastX = burst ? -1 : x;
      lastY = burst ? -1 : y;
      lastPaint = performance.now();
      painted = true;
      if (inView && !raf) raf = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      raf = 0;
      const idle = now - lastPaint;
      if (idle > HOLD_MS + FADE_MS) {
        mctx.clearRect(0, 0, mask.width, mask.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        painted = false;
        return; // nothing left on screen: the loop stops
      }
      if (idle > HOLD_MS) {
        mctx.globalCompositeOperation = 'destination-out';
        mctx.fillStyle = 'rgba(0,0,0,0.045)';
        mctx.fillRect(0, 0, mask.width, mask.height);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.setTransform(scale * stretch, 0, 0, scale, TEXT_X * scale, BASELINE * scale);
      ctx.font = FONT;
      ctx.fillStyle = '#F5F5F3';
      ctx.fillText(WORD, 0, 0);
      ctx.restore();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0);
      if (inView) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') paintAt(e.clientX, e.clientY);
    };
    const onLeave = () => {
      lastX = lastY = -1;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') paintAt(e.clientX, e.clientY, true);
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (!inView && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (inView && painted && !raf) {
        raf = requestAnimationFrame(frame);
      }
    });
    const ro = new ResizeObserver(resize);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      resize();
      ro.observe(host);
      io.observe(host);
      host.addEventListener('pointermove', onMove, { passive: true });
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('pointerdown', onDown, { passive: true });
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
    };
  }, []);

  const ticks = Array.from({ length: 21 }, (_, i) => TEXT_X + (TEXT_W / 20) * i);

  return (
    <div ref={hostRef} className={`relative select-none ${className ?? ''}`} style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      <p className="sr-only">Cybersage</p>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" aria-hidden fill="none">
        {/* Construction lines: cap height and baseline, with a ruler of ticks. */}
        <g stroke="rgba(255,255,255,0.14)" strokeWidth={1} vectorEffect="non-scaling-stroke">
          <line x1={0} x2={VB_W} y1={CAP} y2={CAP} vectorEffect="non-scaling-stroke" />
          <line x1={0} x2={VB_W} y1={BASELINE} y2={BASELINE} vectorEffect="non-scaling-stroke" />
          {ticks.map((x, i) => (
            <line key={x} x1={x} x2={x} y1={BASELINE} y2={BASELINE + (i % 5 === 0 ? 14 : 7)} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <text
          x={TEXT_X}
          y={BASELINE}
          textLength={TEXT_W}
          lengthAdjust="spacingAndGlyphs"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          style={{ font: FONT }}
        >
          {WORD}
        </text>
      </svg>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  );
}
