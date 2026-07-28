'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const EASE = [0.22, 1, 0.36, 1] as const;

const ORION_CHIPS = [
  { label: 'AI Inference',   detail: 'YOLOv8-nano person & object detection' },
  { label: 'Thermal Sensing', detail: 'Pipeline leak detection layer' },
  { label: 'Protobuf',       detail: 'DetectionEvent real-time schema' },
];

const WYTNEST_CHIPS = [
  { label: 'Multi-tenant',  detail: 'RLS-enforced workspace isolation' },
  { label: 'Video',         detail: 'Cloudflare R2 + Stream HLS delivery' },
  { label: 'Dual payments', detail: 'Paystack NGN · Stripe USD' },
];

/* Wytnest inline logo — "wyt" white, "nest" subdued, indigo circle */
function WytnestLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="relative flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-white/10"
        style={{ background: '#5B4FCF' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 7L12 17L18 7"
            stroke="#fff"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7" r="2" fill="#E8960F" />
        </svg>
      </span>
      <span
        style={{
          fontFamily:    'Satoshi, system-ui, sans-serif',
          fontWeight:    800,
          fontSize:      '0.9rem',
          letterSpacing: '-0.025em',
          color:         'rgba(255,255,255,0.88)',
        }}
      >
        wyt
        <span style={{ fontWeight: 300, color: 'rgba(255,255,255,0.42)' }}>nest</span>
      </span>
    </div>
  );
}

interface Chip { label: string; detail: string }

interface Build {
  logoSlot:  React.ReactNode;
  name:      string;
  tagline:   string;
  chips:     Chip[];
  link:      string;
}

function Row({
  build,
  inView,
  delay,
  divided,
}: {
  build:   Build;
  inView:  boolean;
  delay:   number;
  divided: boolean;
}) {
  return (
    <div
      style={
        divided
          ? { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 'clamp(1.25rem,2.5vw,1.75rem)' }
          : {}
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-start lg:items-center gap-5 lg:gap-12">

        {/* ── Logo / badge slot ── */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay, ease: EASE }}
        >
          {build.logoSlot}
        </motion.div>

        {/* ── Description ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.08, ease: EASE }}
        >
          <p
            className="text-white/80"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontSize:   'clamp(0.88rem,1.4vw,1.15rem)',
              fontWeight: 600,
            }}
          >
            {build.name}{' '}
            <span
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontStyle:  'italic',
                fontWeight: 400,
                color:      'rgba(255,255,255,0.38)',
              }}
            >
              — {build.tagline}
            </span>
          </p>

          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
            {build.chips.map((chip) => (
              <span key={chip.label} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                <span
                  className="text-[0.6rem] tracking-[0.05em] text-white/35"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  <span className="text-white/55">{chip.label}</span>
                  {' '}· {chip.detail}
                </span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Link ── */}
        <motion.a
          href={build.link}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="view"
          className="group inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors duration-200 shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.16, ease: EASE }}
        >
          <span
            className="text-[0.58rem] tracking-[0.2em] uppercase font-medium"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            View Live
          </span>
          <ArrowUpRight
            size={12}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
          />
        </motion.a>
      </div>
    </div>
  );
}

export function CurrentlyBuilding() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  const BUILDS: Build[] = [
    {
      logoSlot: (
        <div className="flex items-center gap-4">
          {/* Live badge */}
          <span className="inline-flex items-center gap-2 border border-emerald-400/25 px-3 py-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            <span
              className="text-[0.55rem] tracking-[0.24em] uppercase text-emerald-300/70 font-semibold"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              Currently Building
            </span>
          </span>
          {/* NextGen logo */}
          <div className="relative h-7 w-32 opacity-70 hidden sm:block">
            <Image
              src="/logo/NEXTGEN PL (Landscape) WHITE.png"
              alt="NextGen Robotics"
              fill
              className="object-contain object-left"
            />
          </div>
        </div>
      ),
      name:    'Orion',
      tagline: 'distributed AI surveillance, embedded edge to browser.',
      chips:   ORION_CHIPS,
      link:    'https://app.nextgenerationrobotics.org/',
    },
    {
      logoSlot: <WytnestLogo />,
      name:     'Wytnest',
      tagline:  'testimonial SaaS — campaigns, video collection, embeddable widgets.',
      chips:    WYTNEST_CHIPS,
      link:     'https://wytnest.vercel.app',
    },
  ];

  return (
    <section
      ref={ref}
      data-theme="dark"
      className="w-full bg-[#0A0A0A] border-t border-white/6 relative overflow-hidden"
    >
      {/* moving scan line */}
      <motion.div
        aria-hidden
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)',
        }}
        animate={{ left: ['-5%', '105%'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] py-[clamp(2rem,4vw,3.5rem)]">
        <div className="flex flex-col gap-[clamp(1.25rem,2.5vw,1.75rem)]">
          <Row build={BUILDS[0]} inView={inView} delay={0}    divided={false} />
          <Row build={BUILDS[1]} inView={inView} delay={0.14} divided={true}  />
        </div>
      </div>
    </section>
  );
}
