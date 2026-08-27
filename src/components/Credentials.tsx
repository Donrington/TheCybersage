'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowUpRight, GitCommitHorizontal, ExternalLink } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Floating background vocabulary ───────────────────────────────────────────
const FLOAT_WORDS = [
  'Certified', 'Verified', '2025', 'Architecture',
  'IBT Learning', '2024', 'Moat Academy', 'Zidio',
  'Engineering', 'Infrastructure', 'Systems', 'Cloud',
  'Internship', 'PostgreSQL', 'Accredited', 'Remote',
  'Awarded', 'Completed', '5+ Years', 'Production',
];

function sr(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const round = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

interface FloatItem {
  id: number; word: string;
  x: number; y: number;
  rot: number; size: number;
  delay: number; dur: number;
  opacity: number;
}

function buildFloatItems(): FloatItem[] {
  return Array.from({ length: 18 }, (_, i) => {
    const r = (n: number) => sr(i * 13 + n + 7);
    const zone = Math.floor(r(0) * 4);
    let x: number, y: number;
    if      (zone === 0) { x = r(1) * 22 + 1;   y = r(2) * 80 + 8;  }
    else if (zone === 1) { x = r(1) * 22 + 75;  y = r(2) * 80 + 8;  }
    else if (zone === 2) { x = r(1) * 48 + 26;  y = r(2) * 16 + 2;  }
    else                 { x = r(1) * 48 + 26;  y = r(2) * 16 + 80; }
    return {
      id: i,
      word: FLOAT_WORDS[i % FLOAT_WORDS.length],
      x: round(x), y: round(y),
      rot:     round((r(3) - 0.5) * 12, 3),
      size:    round(0.75 + r(4) * 0.9, 4),
      delay:   round(r(5) * 3, 3),
      dur:     round(5 + r(6) * 5, 3),
      opacity: round(0.45 + r(7) * 0.35, 4),
    };
  });
}

const CERTIFICATIONS = [
  {
    num: '01',
    title: 'Full Stack Engineering',
    issuer: 'IBT Learning',
    year: '2025',
    file: '/certificates/Carrington Abakwe - 2025-08-04 - Full stack engineering Certificate (IBT Learning).pdf',
  },
  {
    num: '02',
    title: 'Web Application Development',
    issuer: 'Moat Academy',
    year: '2024',
    file: '/certificates/Abakwe Carrington - Web application development (Moat Academy).jpeg',
  },
  {
    num: '03',
    title: 'Web Development Internship',
    issuer: 'Zidio Development',
    year: '2024',
    file: '/certificates/Zidio Development - Web Devlopment Internship.jpeg',
  },
];

/* ── Magnetic download button ─────────────────────────────────────────────── */
function MagneticBtn({ href }: { href: string }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 300, damping: 28 });
  const y = useSpring(rawY, { stiffness: 300, damping: 28 });
  const reduced = useReducedMotion();

  return (
    <motion.a
      href={href}
      download
      style={{ x, y, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set((e.clientX - rect.left - rect.width / 2) * 0.32);
        rawY.set((e.clientY - rect.top - rect.height / 2) * 0.32);
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
      }}
      onMouseEnter={(e) => e.currentTarget.style.setProperty('--mh', '1')}
      onMouseLeave={(e) => { rawX.set(0); rawY.set(0); e.currentTarget.style.setProperty('--mh', '0'); }}
      className="group border border-white/20 px-8 py-4 text-white/60 hover:text-white hover:border-white/50 transition-colors duration-300"
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      transition={{ duration: 0.3 }}
    >
      {!reduced && (
        <>
          <span aria-hidden className="metal-edge" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '7s' }} />
          <span aria-hidden className="metal-sheen" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6, animationDuration: '5.5s' }} />
        </>
      )}
      <span aria-hidden className="metal-highlight" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <span
        className="text-[0.65rem] tracking-[0.22em] uppercase font-medium"
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif', position: 'relative', zIndex: 1 }}
      >
        Download Resume
      </span>
      <ArrowDownRight
        size={13}
        style={{ position: 'relative', zIndex: 1 }}
        className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform duration-200"
      />
    </motion.a>
  );
}

/* ── Certificate row ──────────────────────────────────────────────────────── */
function CertRow({
  cert,
  index,
  hoveredIndex,
  onHover,
}: {
  cert: (typeof CERTIFICATIONS)[0];
  index: number;
  hoveredIndex: number | null;
  onHover: (i: number | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  const isHovered = hoveredIndex === index;
  const isDimmed = hoveredIndex !== null && !isHovered;
  const rawX = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 380, damping: 32 });

  return (
    <motion.div
      ref={ref}
      animate={{ opacity: isDimmed ? 0.28 : 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="border-b border-white/8 relative overflow-hidden"
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-px bg-white/30 origin-top"
        animate={{ scaleY: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />

      <motion.a
        href={cert.file}
        download
        className="group flex items-center gap-4 lg:gap-10 py-7 lg:py-9 w-full pl-4"
        onMouseEnter={() => { onHover(index); rawX.set(8); }}
        onMouseLeave={() => { onHover(null); rawX.set(0); }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: index * 0.1, ease: EASE }}
      >
        {/* Number */}
        <motion.span
          className="text-[0.58rem] tracking-[0.22em] font-semibold tabular-nums shrink-0"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          animate={{ color: isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
          transition={{ duration: 0.25 }}
        >
          {cert.num}
        </motion.span>

        {/* Divider */}
        <motion.div
          className="hidden lg:block h-px bg-white/10 shrink-0"
          style={{ width: '2rem' }}
          animate={{ scaleX: isHovered ? 1 : 0.5, opacity: isHovered ? 0.4 : 0.2 }}
          transition={{ duration: 0.3 }}
        />

        {/* Title */}
        <motion.div style={{ x }} className="flex-1 min-w-0">
          <span
            className="block font-black text-white tracking-[-0.03em] leading-none"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.1rem, 2.4vw, 2rem)',
            }}
          >
            {cert.title}
          </span>
        </motion.div>

        {/* Issuer */}
        <motion.span
          className="hidden md:block text-[0.6rem] tracking-[0.18em] uppercase font-medium shrink-0"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          animate={{ color: isHovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)' }}
          transition={{ duration: 0.25 }}
        >
          {cert.issuer}
        </motion.span>

        {/* Year */}
        <span
          className="text-[0.58rem] tracking-[0.18em] uppercase text-white/20 font-medium shrink-0 tabular-nums hidden sm:block"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
        >
          {cert.year}
        </span>

        {/* Arrow box */}
        <motion.div
          className="shrink-0 w-8 h-8 flex items-center justify-center border"
          animate={{
            borderColor: isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)',
            backgroundColor: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ x: isHovered ? 1 : 0, y: isHovered ? -1 : 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <ArrowUpRight
              size={12}
              className="text-white/30 group-hover:text-white/80 transition-colors duration-200"
            />
          </motion.div>
        </motion.div>
      </motion.a>
    </motion.div>
  );
}

/* ── GitHub Activity block ────────────────────────────────────────────────── */
interface GHEvent  { action: string; repo: string; time: string; }
interface GHDay    { date: string; count: number; level: number; }
interface GHData   { login: string; repos: number; followers: number; lastActive: string; totalLastYear: number; contributions: GHDay[]; events: GHEvent[]; }

const LEVEL_OPACITY = ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.42)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.88)'];

function ContribGrid({ contributions }: { contributions: GHDay[] }) {
  // Build week columns from the contributions array
  const weeks: GHDay[][] = [];
  let week: GHDay[] = [];
  contributions.forEach((day, i) => {
    week.push(day);
    if (week.length === 7 || i === contributions.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div className="flex gap-[3px] overflow-hidden w-full">
      {weeks.map((wk, wi) => (
        <div key={wi} className="flex flex-col gap-[3px] flex-1 min-w-0">
          {wk.map((day, di) => (
            <div
              key={di}
              title={`${day.date}: ${day.count} contributions`}
              className="rounded-[2px]"
              style={{
                aspectRatio: '1',
                backgroundColor: LEVEL_OPACITY[day.level] ?? LEVEL_OPACITY[0],
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function GitHubActivity({ sectionInView }: { sectionInView: boolean }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  const reduced = useReducedMotion();
  const [data, setData]         = useState<GHData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    fetch('/api/github')
      .then((r) => r.json())
      .then((d: GHData & { error?: boolean }) => {
        if (d?.error) { setUnavailable(true); } else { setData(d); }
        setLoading(false);
      })
      .catch(() => { setUnavailable(true); setLoading(false); });
  }, []);

  return (
    <motion.div
      ref={ref}
      className="mt-[clamp(4rem,7vw,8rem)]"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {/* Sub-label */}
      <div className="flex items-center gap-4 mb-8">
        <motion.span
          className="text-[0.55rem] tracking-[0.28em] uppercase text-white/20 font-medium shrink-0"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={sectionInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          Live on GitHub
        </motion.span>
        <motion.div
          className="flex-1 h-px bg-white/8"
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={sectionInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.95, ease: EASE }}
        />
      </div>

      {/* Card */}
      <div
        className="relative border border-white/10 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        {!reduced && (
          <span aria-hidden className="beam-ring" style={{ position: 'absolute', inset: 0, padding: 1, pointerEvents: 'none', animationDuration: '6s' }} />
        )}
        {/* Corner accents */}
        <div className="absolute top-0 right-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-px h-8 bg-white/18" />
          <div className="absolute top-0 right-0 w-8 h-px bg-white/18" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-px h-8 bg-white/18" />
          <div className="absolute bottom-0 left-0 w-8 h-px bg-white/18" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            {/* Live dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white/70" />
            </span>
            <span
              className="text-[0.58rem] tracking-[0.22em] uppercase text-white/40 font-medium"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              {loading ? 'Fetching activity…' : unavailable ? 'GitHub · rate limited' : `Active ${data?.lastActive ?? 'recently'}`}
            </span>
          </div>
          <a
            href="https://github.com/Donrington"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/25 hover:text-white/60 transition-colors duration-200"
          >
            <span
              className="text-[0.55rem] tracking-[0.18em] uppercase"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              @Donrington
            </span>
            <ExternalLink size={10} />
          </a>
        </div>

        {/* Contribution graph */}
        {data && data.contributions.length > 0 && (
          <div className="px-6 pt-5 pb-5 border-b border-white/6">
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[0.48rem] tracking-[0.2em] uppercase text-white/18"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                Contributions · Past Year
              </p>
              <p
                className="text-[0.52rem] tracking-[0.14em] uppercase font-semibold text-white/35"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                {data.totalLastYear.toLocaleString()} total
              </p>
            </div>
            <ContribGrid contributions={data.contributions} />
          </div>
        )}

        {/* Stats row */}
        {data && (
          <div className="flex items-center gap-8 px-6 py-4 border-b border-white/6">
            {[
              { value: data.repos,             label: 'Public Repos'   },
              { value: data.followers,          label: 'Followers'      },
              { value: data.totalLastYear.toLocaleString(), label: 'Contributions / yr' },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-white/80 font-black leading-none tabular-nums"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.04em' }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[0.5rem] tracking-[0.2em] uppercase text-white/22 mt-1"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Events list */}
        <div className="divide-y divide-white/6">
          {loading && (
            <div className="px-6 py-8 flex justify-center">
              <div className="flex gap-1.5">
                {[0,1,2].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-1.5 h-1.5 rounded-full bg-white/20"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          )}
          {!loading && data?.events.map((ev, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between px-6 py-4 group"
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: EASE }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <GitCommitHorizontal size={12} className="text-white/20 shrink-0" />
                <span
                  className="text-[0.7rem] text-white/35 shrink-0"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {ev.action}
                </span>
                <span
                  className="text-[0.72rem] font-semibold text-white/70 truncate"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {ev.repo}
                </span>
              </div>
              <span
                className="text-[0.55rem] tracking-[0.14em] uppercase text-white/20 tabular-nums shrink-0 ml-4"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                {ev.time}
              </span>
            </motion.div>
          ))}
          {!loading && !data && (
            <p className="px-6 py-6 text-white/20 text-[0.72rem]" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
              Could not load activity.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/6">
          <p
            className="text-[0.48rem] tracking-[0.16em] uppercase text-white/12"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            Refreshes every hour · Public activity only
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────────────── */
export function Credentials() {
  const sectionRef   = useRef<HTMLElement>(null);
  const lineRef      = useRef<HTMLDivElement>(null);
  const resumeRef    = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });
  const resumeInView  = useInView(resumeRef,  { once: true, margin: '-8%'  });
  const reduced = useReducedMotion();
  const [hoveredCert, setHoveredCert] = useState<number | null>(null);
  const floatItems = useMemo(buildFloatItems, []);

  useEffect(() => {
    if (!sectionRef.current || !lineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 35%',
            scrub: 1.5,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="credentials"
      data-theme="dark"
      className="w-full bg-[#0A0A0A] relative overflow-hidden"
    >
      {/* Scroll-progress line — left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 hidden lg:block pointer-events-none">
        <div ref={lineRef} className="w-full h-full bg-white/20" />
      </div>

      {/* Floating background vocabulary */}
      {floatItems.map((item) => (
        <motion.span
          key={item.id}
          aria-hidden
          className="hidden md:block"
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontFamily: 'var(--font-instrument), Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${item.size}rem`,
            letterSpacing: '0.02em',
            rotate: item.rot,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            zIndex: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, item.opacity, item.opacity * 0.7, item.opacity, 0],
            filter: ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(5px)'],
            y: [8, 0, -4, 0, -8],
            color: [
              'rgba(255,255,255,0.7)',
              'rgba(255,255,255,1)',
              'rgba(255,255,255,0.8)',
              'rgba(255,255,255,1)',
              'rgba(255,255,255,0.7)',
            ],
          }}
          transition={{
            duration: item.dur,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: item.dur * 0.9,
            ease: 'easeInOut',
          }}
        >
          {item.word}
        </motion.span>
      ))}

      {/* Ambient orbs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-6%',
          width: '45vw',
          height: '45vw',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.006) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-8%',
          left: '-4%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.004) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-360 mx-auto px-[clamp(1.25rem,5vw,5rem)] py-[clamp(5rem,10vw,11rem)]">

        {/* Section label + divider */}
        <div className="flex items-center gap-4 mb-[clamp(3rem,6vw,7rem)]">
          <motion.span
            className="text-[0.6rem] tracking-[0.22em] uppercase text-white/20 font-medium shrink-0"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            initial={{ opacity: 0, x: -16 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            06 / Credentials
          </motion.span>
          <motion.div
            className="flex-1 h-px bg-white/10"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={sectionInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
          />
        </div>

        {/* Headline */}
        <h2
          className="font-black text-white tracking-[-0.04em] leading-[0.9] mb-[clamp(3rem,5vw,6rem)]"
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.8rem, 7vw, 8rem)',
          }}
        >
          {(['Proof', 'of'] as const).map((word, i) => (
            <span key={word} className="inline-block overflow-hidden mr-[0.22em]">
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={sectionInView ? { y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.05 + i * 0.1, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          {' '}
          <span className="inline-block overflow-hidden">
            <motion.span
              className="block"
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.28)',
              }}
              initial={{ y: '110%' }}
              animate={sectionInView ? { y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            >
              Work
            </motion.span>
          </span>
        </h2>

        {/* ── Resume card ───────────────────────────────────────────────────── */}
        <motion.div
          ref={resumeRef}
          className="relative border border-white/10 p-[clamp(2rem,4vw,4rem)] mb-[clamp(4rem,7vw,8rem)] overflow-hidden"
          initial={{ opacity: 0, y: 28 }}
          animate={resumeInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: EASE }}
        >
          {!reduced && (
            <span aria-hidden className="beam-ring" style={{ position: 'absolute', inset: 0, padding: 1, pointerEvents: 'none', animationDuration: '6.5s' }} />
          )}
          {/* Gradient wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(130deg, rgba(255,255,255,0.03) 0%, transparent 55%)',
            }}
          />

          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-16">

            {/* Left — identity */}
            <div className="flex flex-col gap-5">
              <motion.span
                className="text-[0.55rem] tracking-[0.3em] uppercase text-white/22 font-medium"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                initial={{ opacity: 0 }}
                animate={resumeInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                Resume · PDF · 2025
              </motion.span>

              <div className="overflow-hidden">
                <motion.h3
                  className="font-black text-white tracking-[-0.04em] leading-[0.92]"
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(2.2rem, 5vw, 5.5rem)',
                  }}
                  initial={{ y: '110%' }}
                  animate={resumeInView ? { y: 0 } : {}}
                  transition={{ delay: 0.22, duration: 0.75, ease: EASE }}
                >
                  Abakwe Carrington
                </motion.h3>
              </div>

              <motion.p
                className="text-white/35"
                style={{
                  fontFamily: 'var(--font-instrument), Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={resumeInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.42, duration: 0.55, ease: EASE }}
              >
                Infrastructure &amp; Systems Architect — 5+ years · Remote
              </motion.p>

              {/* Stack tags */}
              <div className="flex flex-wrap gap-2 mt-1">
                {['AWS', 'Docker', 'Go', 'Django', 'PostgreSQL', 'Redis'].map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="border border-white/12 text-white/28 text-[0.52rem] tracking-[0.16em] uppercase px-2.5 py-1"
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    initial={{ opacity: 0, y: 6, clipPath: 'inset(100% 0 0 0)' }}
                    animate={resumeInView ? { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' } : {}}
                    transition={{ delay: 0.52 + i * 0.06, duration: 0.38, ease: EASE }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Right — download CTA */}
            <motion.div
              className="shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={resumeInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
            >
              <MagneticBtn href="/resume/Abakwe Carrington.pdf" />
            </motion.div>
          </div>

          {/* Corner brackets */}
          <div className="absolute top-0 right-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-px h-10 bg-white/18" />
            <div className="absolute top-0 right-0 w-10 h-px bg-white/18" />
          </div>
          <div className="absolute bottom-0 left-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-px h-10 bg-white/18" />
            <div className="absolute bottom-0 left-0 w-10 h-px bg-white/18" />
          </div>
          <div className="absolute bottom-0 right-0 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-px h-6 bg-white/8" />
            <div className="absolute bottom-0 right-0 w-6 h-px bg-white/8" />
          </div>
        </motion.div>

        {/* ── Certifications ─────────────────────────────────────────────────── */}
        <div>
          {/* Sub-label */}
          <div className="flex items-center gap-4 mb-8">
            <motion.span
              className="text-[0.55rem] tracking-[0.28em] uppercase text-white/20 font-medium shrink-0"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={sectionInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Certifications
            </motion.span>
            <motion.div
              className="flex-1 h-px bg-white/8"
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={sectionInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.75, ease: EASE }}
            />
          </div>

          {/* List */}
          <motion.div
            className="border-t border-white/8"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={sectionInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
          >
            {CERTIFICATIONS.map((cert, i) => (
              <CertRow
                key={cert.num}
                cert={cert}
                index={i}
                hoveredIndex={hoveredCert}
                onHover={setHoveredCert}
              />
            ))}
          </motion.div>
        </div>

        {/* ── GitHub Activity ────────────────────────────────────────────────── */}
        <GitHubActivity sectionInView={sectionInView} />

      </div>
    </section>
  );
}
