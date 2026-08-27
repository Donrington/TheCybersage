'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Layer {
  id: string;
  label: string;
  tag: string;
  principle: string;
  proof: string;
}

/**
 * Every principle below is re-surfaced from real bullets that used to live in
 * the Experience timeline this section replaces — not invented copy. Removing
 * the chronological job list doesn't lose that substance, it re-presents the
 * most concrete parts of it as something to click through instead of scroll
 * past. The resume/full history stays in Credentials.
 */
const LAYERS: Layer[] = [
  {
    id: 'edge',
    label: 'Edge & Delivery',
    tag: 'CDN · Web Vitals',
    principle: 'Sub-second loads aren’t an accident — edge caching and Core Web Vitals get tuned before a single feature ships.',
    proof: '98/100 Lighthouse, sub-1s LCP — KRK Motors, Samdus',
  },
  {
    id: 'gateway',
    label: 'API Gateway',
    tag: 'Auth · Rate Limiting',
    principle: 'Every public endpoint gets rate-limiting and circuit breakers before it gets a feature.',
    proof: 'Payment APIs stopped cascading-failing entirely — Autoboy Express',
  },
  {
    id: 'services',
    label: 'Services',
    tag: 'Go · Django',
    principle: 'Go for throughput, Django for velocity — picked per service, not per habit.',
    proof: '30% performance gain from re-architecting this layer — NextGen Robotics',
  },
  {
    id: 'cache',
    label: 'Cache',
    tag: 'Redis',
    principle: 'I design invalidation before I design the cache.',
    proof: '30% faster DB responses under peak load — Autoboy Express',
  },
  {
    id: 'database',
    label: 'Database',
    tag: 'PostgreSQL',
    principle: 'pg_notify for live sync, rewritten queries for everything else.',
    proof: 'p95 latency cut hard once the slow paths were found — Dejaii',
  },
  {
    id: 'access',
    label: 'Access & Compliance',
    tag: 'RBAC · Encryption',
    principle: 'Role-based access on every layer, encrypted by default — not bolted on after a client asks.',
    proof: 'Unauthorized-access surface down 60% — RecoverDerm',
  },
  {
    id: 'deploy',
    label: 'Deploy & Monitor',
    tag: 'CI/CD · Zero-Downtime',
    principle: 'Zero-downtime releases and CI/CD from day one, not after the first bad deploy.',
    proof: 'Deployment time cut 45% — NextGen Robotics',
  },
];

/* ── Desktop: horizontal blueprint diagram ──────────────────────────────── */
function BlueprintDesktop({ layers }: { layers: Layer[] }) {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const n = layers.length;
  const positions = layers.map((_, i) => 6 + i * (88 / (n - 1)));
  const active = layers[selected];

  return (
    <div>
      {/* Diagram */}
      <div style={{ position: 'relative', height: 200, marginBottom: '2.5rem' }}>
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Base track */}
          <line x1={positions[0]} y1={15} x2={positions[n - 1]} y2={15} stroke="rgba(10,10,10,0.14)" strokeWidth={0.35} />

          {/* Progress fill up to the selected layer */}
          <motion.line
            x1={positions[0]}
            y1={15}
            y2={15}
            stroke="#0A0A0A"
            strokeWidth={0.35}
            animate={{ x2: positions[selected] }}
            transition={{ duration: 0.6, ease: EASE }}
          />

          {/* Ambient flow — three dots travelling the full track, staggered */}
          {!reduced && [0, 1, 2].map((k) => (
            <motion.circle
              key={k}
              cy={15}
              r={0.5}
              fill="rgba(10,10,10,0.32)"
              animate={{ cx: [positions[0], positions[n - 1]] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: k * 1.7 }}
            />
          ))}
        </svg>

        {/* Nodes */}
        {layers.map((layer, i) => {
          const isActive = i === selected;
          const labelAbove = i % 2 === 0;
          return (
            <button
              key={layer.id}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setSelected(i)}
              aria-pressed={isActive}
              data-cursor="view"
              style={{
                position: 'absolute',
                left: `${positions[i]}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: labelAbove ? 'column-reverse' : 'column',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: isActive ? 14 : 10,
                  height: isActive ? 14 : 10,
                  borderRadius: '50%',
                  background: isActive ? '#0A0A0A' : '#FFFFFF',
                  border: `1.5px solid ${isActive ? '#0A0A0A' : 'rgba(10,10,10,0.3)'}`,
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: isActive ? '#0A0A0A' : 'rgba(10,10,10,0.4)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}
              >
                {layer.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p
        className="text-black/25"
        style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' }}
      >
        Select a layer
      </p>

      {/* Principle panel */}
      <div style={{ borderTop: '1px solid rgba(10,10,10,0.1)', paddingTop: '2rem', minHeight: 140 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span
                style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.3)' }}
              >
                {String(selected + 1).padStart(2, '0')} / {active.tag}
              </span>
            </div>
            <p
              className="text-black"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(1.3rem,2.2vw,1.9rem)', letterSpacing: '-0.02em', lineHeight: 1.3, maxWidth: '46ch', marginBottom: '0.9rem' }}
            >
              {active.principle}
            </p>
            <p
              style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(1rem,1.4vw,1.15rem)', color: 'rgba(10,10,10,0.4)' }}
            >
              {active.proof}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Mobile: vertical tap-to-expand ──────────────────────────────────────── */
function MobileRow({ layer, isOpen, onToggle }: { layer: Layer; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ position: 'relative', paddingLeft: '2.25rem' }}>
      {/* Vertical rail + node marker */}
      <div aria-hidden style={{ position: 'absolute', left: '0.4rem', top: 0, bottom: 0, width: 1, background: 'rgba(10,10,10,0.12)' }} />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '0.4rem',
          top: '1.6rem',
          transform: 'translate(-50%,-50%)',
          width: isOpen ? 12 : 8,
          height: isOpen ? 12 : 8,
          borderRadius: '50%',
          background: isOpen ? '#0A0A0A' : '#FFFFFF',
          border: `1.5px solid ${isOpen ? '#0A0A0A' : 'rgba(10,10,10,0.3)'}`,
          transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '1rem 0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <span
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#0A0A0A' }}
            >
              {layer.label}
            </span>
            <span
              style={{ display: 'block', fontFamily: 'ui-monospace, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.32)', marginTop: '0.3rem' }}
            >
              {layer.tag}
            </span>
          </div>
          <motion.span
            aria-hidden
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ fontSize: '1.3rem', color: 'rgba(10,10,10,0.3)', flexShrink: 0 }}
          >
            +
          </motion.span>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ overflow: 'hidden' }}
            >
              <p style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(10,10,10,0.75)', marginTop: '0.9rem', paddingRight: '1rem' }}>
                {layer.principle}
              </p>
              <p style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(10,10,10,0.4)', marginTop: '0.6rem' }}>
                {layer.proof}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <div style={{ borderBottom: '1px solid rgba(10,10,10,0.08)' }} />
    </div>
  );
}

function BlueprintMobile({ layers }: { layers: Layer[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {layers.map((layer, i) => (
        <MobileRow key={layer.id} layer={layer} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)} />
      ))}
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
export function SystemsBlueprint() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-12%' });

  return (
    <section ref={sectionRef} id="systems" className="w-full bg-white border-t border-black/[0.08]">
      <div className="max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] py-[clamp(5rem,10vw,11rem)]">

        {/* Section label — matches About/Process's light-section eyebrow exactly */}
        <div className="flex items-center gap-4 mb-[clamp(2rem,4vw,4rem)]">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[0.6rem] tracking-[0.22em] uppercase text-black/30 font-medium"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            05 / Systems
          </motion.span>
          <motion.div
            className="flex-1 h-px bg-black/10"
            style={{ transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
          />
        </div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          className="font-black text-black tracking-tighter leading-[0.88] mb-[clamp(1.25rem,2.5vw,2rem)]"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 900, fontSize: 'clamp(3rem, 7.5vw, 8rem)' }}
        >
          Under the{' '}
          <span style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: 'rgba(10,10,10,0.3)' }}>
            Hood.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
          className="text-black/45 leading-relaxed max-w-xl mb-[clamp(3rem,6vw,5.5rem)]"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: 'clamp(1rem,1.4vw,1.2rem)' }}
        >
          Seven layers of a production system, and the decision made at each one. Click through — every claim here shipped in a real client build.
        </motion.p>

        {/* Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        >
          <div className="hidden lg:block">
            <BlueprintDesktop layers={LAYERS} />
          </div>
          <div className="lg:hidden">
            <BlueprintMobile layers={LAYERS} />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="mt-[clamp(3rem,5vw,4.5rem)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-black/10 p-[clamp(1.5rem,3vw,2.5rem)]"
        >
          <p className="text-black/60" style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: 'clamp(0.9rem,1.4vw,1.15rem)' }}>
            Want the full chronological history?{' '}
            <span style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', color: 'rgba(10,10,10,0.4)' }}>
              It&rsquo;s in the résumé.
            </span>
          </p>
          <a
            href="#credentials"
            data-cursor="view"
            className="group inline-flex items-center gap-3 border border-black/15 px-7 py-3.5 text-black/70 hover:text-black hover:border-black/40 transition-colors duration-300 shrink-0"
          >
            <span className="text-[0.62rem] tracking-[0.22em] uppercase font-medium" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
              View Credentials
            </span>
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
