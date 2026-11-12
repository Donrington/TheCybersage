'use client';

import { useEffect, useRef, useState } from 'react';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { LAYERS, splitProof } from '@/content/systems';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { lenisInstance } from '@/lib/SmoothScroll';
import { Corners } from '@/components/ui/Corners';

const N = LAYERS.length;
const pad = (n: number) => String(n).padStart(2, '0');

/* ── Shared: the detail for one layer ──────────────────────────────────── */
function LayerDetail({ index, headingLevel = 'h3' }: { index: number; headingLevel?: 'h3' | 'p' }) {
  const layer = LAYERS[index];
  const { metric, shippedIn } = splitProof(layer.proof);
  const Title = headingLevel;
  return (
    <div className="relative border border-on-ink-line bg-[#0A0A0A]">
      <p className="t-mono flex items-center justify-between bg-white px-4 py-2 text-[#0A0A0A]">
        <span>LAYER {pad(index + 1)} / {pad(N)}</span>
        <span>{layer.tag.toUpperCase()}</span>
      </p>
      <div className="px-4 pt-5 pb-5">
        <Title className="font-extrabold tracking-tight text-white" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.5rem)', lineHeight: 1.05 }}>
          {layer.label}
        </Title>
        <p className="t-body mt-3 text-on-ink-1">{layer.principle}</p>
      </div>
      <dl className="grid border-t border-on-ink-line sm:grid-cols-2">
        <div className="px-4 py-3 sm:border-r sm:border-on-ink-line">
          <dt className="t-mono text-on-ink-3">RESULT</dt>
          <dd className="mt-1 text-base font-semibold text-white">{metric}</dd>
        </div>
        {shippedIn && (
          <div className="border-t border-on-ink-line px-4 py-3 sm:border-t-0">
            <dt className="t-mono text-on-ink-3">SHIPPED IN</dt>
            <dd className="mt-1 text-base text-on-ink-2">{shippedIn}</dd>
          </div>
        )}
      </dl>
      <Corners />
    </div>
  );
}

/* ── Mobile, tablet and reduced motion: a plain list ────────────────────── */
function StackList({ animate }: { animate: boolean }) {
  const ref = useRef<HTMLOListElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !animate) return;
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  return (
    <ol ref={ref} className="stack-list relative mt-12 pl-10" data-run={run && animate ? 'true' : 'false'}>
      <span aria-hidden className="absolute top-2 bottom-2 left-[11px] w-px bg-on-ink-line" />
      {animate && <span aria-hidden className="stack-list-packet" />}
      {LAYERS.map((layer, i) => (
        <li key={layer.id} className="relative pb-10 last:pb-0">
          <span aria-hidden className="t-mono absolute top-1 -left-10 flex h-[23px] w-[23px] items-center justify-center border border-white/30 bg-[#0A0A0A] text-on-ink-2">
            {pad(i + 1).slice(1)}
          </span>
          <LayerDetail index={i} />
        </li>
      ))}
    </ol>
  );
}

/* ── Desktop: sticky stage with the CSS 3D stack ────────────────────────── */
function StackStage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    let target = 0;
    let shown = 0;
    let raf = 0;
    let lastActive = -1;

    // The packet follows scroll through a damped value; the loop only runs while it is catching up.
    const tick = () => {
      shown += (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      stage.style.setProperty('--pk', shown.toFixed(4));
      raf = shown === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const r = wrap.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      target = p;
      const a = Math.min(N - 1, Math.floor(p * N));
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /** Scrolls so layer i sits in the middle of its stretch of the stage. */
  const goTo = (i: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const span = wrap.offsetHeight - window.innerHeight;
    const y = top + ((i + 0.5) / N) * span;
    if (lenisInstance) lenisInstance.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div ref={wrapRef} className="relative" style={{ height: `calc(100svh + ${N} * 16svh)` }}>
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-center gap-10 px-[clamp(1rem,4vw,5rem)] pt-16">
          {/* Stage: decoration. Every word in it is repeated in the panel and the list. */}
          <div className="relative border border-on-ink-line px-5 py-6" aria-hidden>
          <Corners />
          <p className="t-mono absolute top-2 left-3 text-on-ink-3">FIG. A · SYSTEM STACK</p>
          <div ref={stageRef} className="stack-stage relative mt-4" style={{ ['--pk' as string]: 0 }}>
            {LAYERS.map((layer, i) => (
              <div key={layer.id} className="stack-row" data-active={i === active} style={{ ['--i' as string]: i, zIndex: N - i }}>
                <span className="stack-label">
                  <span className="t-mono">{pad(i + 1)}</span> {layer.label}
                  <span className="stack-leader" />
                </span>
                <span className="stack-plane" />
              </div>
            ))}
            <span className="stack-trail" />
            <span className="stack-packet" />
          </div>
          <dl className="t-mono absolute right-3 bottom-2 grid grid-cols-[auto_auto] gap-x-3 text-right text-on-ink-3">
            <dt>SHEET</dt><dd className="text-on-ink-2">03</dd>
            <dt>LAYER</dt><dd className="text-on-ink-2">{pad(active + 1)}/{pad(N)}</dd>
            <dt>SCALE</dt><dd className="text-on-ink-2">N.T.S.</dd>
          </dl>
        </div>

          {/* Panel + the real navigation. */}
          <div className="flex flex-col gap-8">
            <div key={active} className="stack-panel-in min-h-[17rem]" aria-live="polite">
              <LayerDetail index={active} />
            </div>
            <nav aria-label="Layers">
              <ol className="grid grid-cols-7 border-t border-l border-on-ink-line">
                {LAYERS.map((layer, i) => (
                  <li key={layer.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === active ? 'step' : undefined}
                      aria-label={`${pad(i + 1)} ${layer.label}`}
                      title={layer.label}
                      className={`t-mono relative flex h-12 w-full flex-col items-center justify-center border-r border-b border-on-ink-line leading-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white ${
                        i === active ? 'bg-white text-[#0A0A0A]' : 'text-on-ink-2 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{pad(i + 1)}</span>
                      <span className="text-[0.75rem] opacity-70">{layer.label.slice(0, 3).toUpperCase()}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Under the hood, v2. Desktop: a sticky stage where a packet travels down
 * seven isometric layers as you scroll, and the panel reads out each layer's
 * decision and proof. Built with CSS 3D transforms, not WebGL: no extra JS,
 * no second canvas, crisp at any resolution. Below 1024px, and with reduced
 * motion, the same content is a vertical list with every layer visible.
 */
export function SystemsStackV2() {
  const reduced = useReducedMotion();
  return (
    <section id="systems" aria-labelledby="systems-heading" data-theme="dark" className="relative bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] pt-[clamp(5rem,10vw,9rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.systems.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
        </div>
        <SplitHeading id="systems-heading" className="t-h2 max-w-[18ch] text-white" text={SECTIONS.systems.heading} />
        <p className="t-body mt-5 max-w-[56ch] text-on-ink-2">
          One real decision per layer, and the client build where it shipped.
        </p>
      </div>

      {/* Which version shows is decided in CSS (width + prefers-reduced-motion), so it is
          right on the first paint, before any JS runs. */}
      <div className="stack-list-wrap mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] pb-20 lg:hidden">
        <StackList animate={!reduced} />
      </div>
      <div className="stack-stage-wrap hidden lg:block">{!reduced && <StackStage />}</div>
    </section>
  );
}
