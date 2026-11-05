'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Floating vocabulary ───────────────────────────────────────────────────────
const WORDS = [
  'Next.js',     'Go',           'Django',        'PostgreSQL',
  'Redis',       'Docker',       'AWS',           'WebSockets',
  'TypeScript',  'React',        'Node.js',       'Python',
  'Microservices','REST APIs',   'CI/CD',         'Nginx',
  'Scalable',    'Resilient',    'Performant',    'Real-time',
  'Idempotent',  'Distributed',  'Type-safe',     'Secure',
];

// One statement across two lines (src/content/site.ts → SECTIONS.stack).
const LINE1 = 'The stack behind';
const LINE2 = 'every build.';

// ─── Seeded pseudo-random — stable across SSR/CSR ─────────────────────────────
function sr(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface FloatWord {
  id: number; word: string;
  x: number; y: number;
  rot: number; size: number;
  delay: number; dur: number;
  opacity: number;
}

const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

function buildFloatWords(): FloatWord[] {
  return Array.from({ length: 22 }, (_, i) => {
    const r = (n: number) => sr(i * 17 + n);
    // Place in four edge zones, avoid center (30%–70% x, 30%–70% y)
    const zone = Math.floor(r(0) * 4);
    let x: number, y: number;
    if      (zone === 0) { x = r(1) * 26 + 1;   y = r(2) * 85 + 7;  } // left
    else if (zone === 1) { x = r(1) * 26 + 73;  y = r(2) * 85 + 7;  } // right
    else if (zone === 2) { x = r(1) * 50 + 25;  y = r(2) * 18 + 2;  } // top
    else                 { x = r(1) * 50 + 25;  y = r(2) * 18 + 78; } // bottom
    return {
      id: i,
      word: WORDS[i % WORDS.length],
      x: round(x, 3),
      y: round(y, 3),
      rot:     round((r(3) - 0.5) * 14, 3),
      size:    round(1.0 + r(4) * 1.1, 4),
      delay:   round(r(5) * 2.5, 3),
      dur:     round(5 + r(6) * 5, 3),
      opacity: round(0.45 + r(7) * 0.35, 4),
    };
  });
}

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Count-up ─────────────────────────────────────────────────────────────────
function CountUp({ target, suffix = '+', duration = 1600 }: { target: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setDisplay(Math.round(ease * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Stack() {
  const sectionRef  = useRef<HTMLElement>(null);
  const charRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const words       = useMemo(buildFloatWords, []);

  // Mouse-repulsion on title chars
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const RADIUS = 90;

    const onMove = (e: MouseEvent) => {
      charRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RADIUS && dist > 0) {
          const p = (RADIUS - dist) / RADIUS;
          const mx = (dx / dist) * p * -24;
          const my = (dy / dist) * p * -24;
          el.style.transform = `translate(${mx}px,${my}px) scale(${1 + p * 0.06})`;
          el.style.opacity = String(1 - p * 0.45);
        } else {
          el.style.transform = '';
          el.style.opacity   = '';
        }
      });
    };

    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, []);

  const l1 = LINE1.split('');
  const l2 = LINE2.split('');

  return (
    <section
      ref={sectionRef}
      id="stack"
      data-theme="dark"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ── Floating vocabulary ─────────────────────────────────────────────── */}
      {words.map((w) => (
        <motion.span
          key={w.id}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontFamily: 'var(--font-instrument), Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${w.size}rem`,
            letterSpacing: '0.02em',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, w.opacity, w.opacity * 0.7, w.opacity, 0],
            filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'],
            y: [8, 0, -4, 0, -8],
            color: [
              'rgba(255,255,255,0.6)',
              'rgba(255,255,255,0.9)',
              'rgba(255,255,255,0.7)',
              'rgba(255,255,255,0.9)',
              'rgba(255,255,255,0.6)',
            ],
          }}
          transition={{
            duration: w.dur,
            delay: w.delay,
            repeat: Infinity,
            repeatDelay: w.dur * 0.8,
            ease: 'easeInOut',
          }}
        >
          {w.word}
        </motion.span>
      ))}

      {/* Ambient orb — top left */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-8%',
          width: '55vw',
          height: '55vw',
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 45%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Ambient orb — bottom right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.018) 0%, rgba(255,255,255,0.006) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Center content ──────────────────────────────────────────────────── */}
      <motion.div
        style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          padding: '0 clamp(1.5rem, 5vw, 4rem)',
        }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* Section label */}
        <motion.p
          className="t-label text-on-ink-3"
          style={{ marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          Technologies
        </motion.p>

        {/* One heading over two lines, both interactive. Was two <h2>s with the
            second in ghosted italic serif; now one statement, one typeface. */}
        <h2
          aria-label={`${LINE1} ${LINE2}`}
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.6rem, 7.5vw, 7rem)',
            letterSpacing: '-0.05em',
            lineHeight: 0.92,
            color: 'rgba(255,255,255,0.94)',
            display: 'block',
            margin: 0,
          }}
        >
          <span aria-hidden style={{ display: 'block' }}>
          {l1.map((char, i) => (
            <span
              key={i}
              ref={(el) => { charRefs.current[i] = el; }}
              style={{
                display: 'inline-block',
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
          </span>
          <span aria-hidden style={{ display: 'block' }}>
          {l2.map((char, i) => (
            <span
              key={i}
              ref={(el) => { charRefs.current[l1.length + i] = el; }}
              style={{
                display: 'inline-block',
                transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
          </span>
        </h2>

        {/* Hairline divider */}
        <motion.div
          style={{
            width: '2.5rem',
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: 'clamp(2.5rem, 5vw, 4rem) auto',
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
        />

        {/* Tagline */}
        <motion.p
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontSize: 'clamp(0.75rem, 1.4vw, 0.78rem)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.56)',
            maxWidth: '28rem',
            margin: '0 auto',
            lineHeight: 2,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
        >
          Production-grade systems built with<br />a modern, battle-tested stack.
        </motion.p>

        {/* Stat row */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(1.5rem, 4vw, 3.5rem)',
            marginTop: 'clamp(3rem, 6vw, 5rem)',
          }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
        >
          {[
            { target: 5,  label: 'Years' },
            { target: 50, label: 'Projects' },
            { target: 12, label: 'Technologies' },
          ].map((stat, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                  letterSpacing: '-0.04em',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1,
                }}
              >
                <CountUp target={stat.target} duration={1600 + idx * 200} />
              </div>
              <div
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.56)',
                  marginTop: '0.5rem',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
