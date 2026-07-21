'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;

const EXPERIENCE = [
  {
    year: '2026',
    role: 'Full Stack Developer',
    company: 'Recoverderm',
    type: 'Contract · Remote',
    bullets: [
      'HIPAA-compliant patient portals with JWT rotation and encrypted data flows — zero compliance violations.',
      'Role-based access across patient, clinician, and admin layers, cutting unauthorized access surface by 60%.',
      'Automated workflows reduced manual admin overhead by 40%. Deployed on AWS with zero-downtime releases.',
    ],
    stack: ['Next.js', 'Django', 'PostgreSQL'],
  },
  {
    year: '2025',
    role: 'Full Stack Developer',
    company: 'Anoc.ng',
    type: 'Contract · Remote',
    bullets: [
      'Compliance platform for Chartered Accountants — client intake, documents, and audits in one encrypted system.',
      'Multi-tenant architecture with strict data isolation supporting 50+ concurrent client cases.',
      'Automated approval chains cut manual processing time by 50% and eliminated missed compliance deadlines.',
    ],
    stack: ['Next.js', 'Node.js', 'PostgreSQL'],
  },
  {
    year: '2025',
    role: 'Software Engineer',
    company: 'NextGen Robotics',
    type: 'Contract · Remote',
    bullets: [
      'Scalable Django backend on cloud infrastructure — 30% performance gain through architecture optimisation.',
      'CI/CD pipelines and automated provisioning cut deployment time by 45%.',
      'Zero-trust security and VPN infrastructure reduced vulnerabilities by 20%, downtime by 35%.',
    ],
    stack: ['Next.js', 'Go', 'AWS'],
  },
  {
    year: '2025',
    role: 'Sr. Full Stack Developer',
    company: 'Autoboy',
    type: 'Full-time · Remote',
    bullets: [
      'Scaled a dual-sided automotive marketplace with real-time inventory and Go microservices backend.',
      'Redis caching + connection pool tuning delivered 30% faster DB responses under peak load.',
      'Rate-limiting and circuit-breaker layers eliminated cascading failures across payment APIs.',
    ],
    stack: ['React', 'Go', 'PostgreSQL', 'Redis'],
  },
  {
    year: '2024',
    role: 'Full Stack Developer',
    company: 'Axflo Oil & Gas',
    type: 'Contract · Remote',
    bullets: [
      'Full-stack corporate site with Django — improved operational communication efficiency by 40%.',
      'Job application module with automated email notifications improved processing efficiency by 50%.',
      'Newsletter system increased subscriber engagement by 35%. Frontend performance up 30% post-integration.',
    ],
    stack: ['Next.js', 'Django', 'PostgreSQL'],
  },
  {
    year: '2024',
    role: 'Web Developer',
    company: 'KRK Motors',
    type: 'Contract · Remote',
    bullets: [
      'Premium brand site with GSAP animations — sub-1s load time, 98/100 Lighthouse score.',
      'Custom scroll-driven animation system tuned to the luxury automotive identity.',
    ],
    stack: ['Next.js', 'Tailwind', 'GSAP'],
  },
  {
    year: '2024',
    role: 'Full Stack Developer',
    company: 'Rokeyla Fashion',
    type: 'Contract · Remote',
    bullets: [
      'Full e-commerce platform with Stripe, live inventory sync via pg_notify, and order lifecycle management.',
      'Eliminated overselling during demand spikes. Reduced manual dispatch coordination by 55%.',
    ],
    stack: ['Next.js', 'Stripe', 'PostgreSQL'],
  },
  {
    year: '2024',
    role: 'Web Developer',
    company: 'Samdus Oil and Gas',
    type: 'Contract · Remote',
    bullets: [
      '98/100 Lighthouse score, sub-1s LCP, full Core Web Vitals compliance on INP, LCP, and CLS.',
      'SEO-first SSR architecture with structured data and custom scroll-driven animation system.',
    ],
    stack: ['Next.js', 'Django'],
  },
  {
    year: '2024',
    role: 'Web Developer',
    company: 'Handyman & Contractors',
    type: 'Contract · Remote',
    bullets: [
      'Conversion-optimised lead gen site — qualified inquiries tripled within 30 days of launch.',
      'CRM webhooks and automated lead routing ensured immediate team follow-up on every submission.',
    ],
    stack: ['React', 'Node.js', 'Tailwind'],
  },
  {
    year: '2024',
    role: 'Lead Full Stack Developer',
    company: 'Amanigo Travels',
    type: 'Contract · Remote',
    bullets: [
      'Booking engine, itinerary builder, and CMS with real-time pricing APIs from global travel providers.',
      'Idempotent payment API prevented duplicate charges and race conditions across concurrent bookings.',
    ],
    stack: ['Next.js', 'Django', 'PostgreSQL'],
  },
  {
    year: '2024',
    role: 'Team Leader',
    company: 'Zidio',
    type: 'Internship · Remote',
    bullets: [
      'Led 8 developers across 2 software products — 50% increase in user engagement, 100% deadline hit rate.',
      'Scrum implementation improved team productivity by 65% and cut feature cycle time by 50%.',
    ],
    stack: ['Agile', 'Jira', 'Scrum'],
  },
  {
    year: '2023',
    role: 'Lead Back-End Engineer',
    company: 'Dejaii',
    type: 'Contract · Remote',
    bullets: [
      'Built the API integration layer across multiple services into a unified, fault-tolerant pipeline.',
      'Rewrote critical queries and added caching — significantly reduced p95 latency on high-traffic endpoints.',
    ],
    stack: ['Django', 'PostgreSQL', 'REST API'],
  },
  {
    year: '2021',
    role: 'Full Stack Developer',
    company: 'Xtus Connect',
    type: 'Full-time · Remote',
    bullets: [
      'Owned full web app lifecycle — architecture through client handoff — over a 2+ year engagement.',
      'Resolved DB and SSR bottlenecks, improving page load times by 35% across the platform.',
    ],
    stack: ['React', 'Django', 'PostgreSQL'],
  },
  {
    year: '2019',
    role: 'QA Engineer',
    company: 'Nigerian Bottling Company',
    type: 'Internship · On-site',
    bullets: [
      'Automated Brix level monitoring across production lines — manual inspection cycles cut by 40%.',
      'Built test harnesses and dashboards giving ops real-time visibility into quality metrics.',
    ],
    stack: ['Python', 'Selenium', 'PostgreSQL'],
  },
];

const S = {
  label: {
    fontFamily: 'Satoshi, system-ui, sans-serif',
    fontSize: '0.5rem',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
  },
  micro: {
    fontFamily: 'Satoshi, system-ui, sans-serif',
    fontSize: '0.48rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
  },
};

/* ── Mobile card ──────────────────────────────────────────────────── */
function MobileCard({ exp, index }: { exp: (typeof EXPERIENCE)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={ref}
      className="relative border-b border-black/8"
      style={{ padding: 'clamp(2.5rem,8vw,4.5rem) clamp(1.5rem,6vw,3rem)' }}
    >
      {/* Meta */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <span style={{ ...S.label, color: '#D9D9D9', mixBlendMode: 'difference' }}>{num}</span>
        <span style={{ ...S.micro, color: '#D9D9D9', mixBlendMode: 'difference' }}>{exp.type}</span>
      </motion.div>

      {/* Year */}
      <motion.div
        className="leading-none select-none"
        style={{
          fontFamily: 'var(--font-instrument), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(5.5rem,27vw,11rem)',
          color: '#D9D9D9',
          mixBlendMode: 'difference',
          letterSpacing: '-0.045em',
          lineHeight: 0.85,
          marginBottom: '1.25rem',
        }}
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
      >
        {exp.year}
      </motion.div>

      {/* Hairline */}
      <motion.div
        style={{ height: '1px', background: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.85, ease: EASE, delay: 0.12 }}
      />

      {/* Company */}
      <motion.p
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.6rem', letterSpacing: '0.36em', textTransform: 'uppercase', color: '#EDEDED', mixBlendMode: 'difference', fontWeight: 700, marginBottom: '0.65rem' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {exp.company}
      </motion.p>

      {/* Role — clip reveal */}
      <div style={{ overflow: 'hidden', marginBottom: '1.75rem' }}>
        <motion.h3
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(1.9rem,9vw,3.2rem)',
            color: '#FFFFFF',
            mixBlendMode: 'difference',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
          }}
          initial={{ y: '106%' }}
          animate={inView ? { y: 0 } : {}}
          transition={{ duration: 0.75, ease: EASE, delay: 0.18 }}
        >
          {exp.role}
        </motion.h3>
      </div>

      {/* Bullets */}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {exp.bullets.map((b, i) => (
          <motion.li
            key={i}
            style={{ display: 'flex', gap: '0.65rem', fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: 'clamp(0.84rem,3.2vw,0.94rem)', color: '#E0E0E0', mixBlendMode: 'difference', fontWeight: 500, lineHeight: 1.65 }}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.07 }}
          >
            <span style={{ marginTop: '0.6em', width: '3px', height: '3px', borderRadius: '50%', background: '#E0E0E0', flexShrink: 0 }} />
            {b}
          </motion.li>
        ))}
      </ul>

      {/* Stack */}
      <motion.div
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.48 }}
      >
        {exp.stack.map((t) => (
          <span
            key={t}
            style={{
              border: '1px solid #D9D9D9',
              color: '#D9D9D9',
              mixBlendMode: 'difference',
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '0.35rem 0.75rem',
            }}
          >
            {t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ── Desktop panel ────────────────────────────────────────────────── */
function DesktopPanel({
  exp,
  index,
  total,
}: {
  exp: (typeof EXPERIENCE)[0];
  index: number;
  total: number;
}) {
  const num = String(index + 1).padStart(2, '0');
  const tot = String(total).padStart(2, '0');

  return (
    <div
      data-panel-index={index}
      className="panel relative shrink-0 h-full flex flex-col border-r border-black/6"
      style={{ width: '100vw', padding: 'clamp(2rem,3.5vw,4.5rem) clamp(2.5rem,5vw,6rem)' }}
    >
      {/* Top row */}
      <div
        className="panel-top flex items-center justify-between shrink-0 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.25)' }}
      >
        <span style={{ ...S.label, color: '#D9D9D9', mixBlendMode: 'difference' }}>
          {num}&nbsp;·&nbsp;{exp.type}
        </span>
        <span style={{ ...S.micro, color: '#D9D9D9', mixBlendMode: 'difference', fontVariantNumeric: 'tabular-nums' }}>
          {num}&nbsp;/&nbsp;{tot}
        </span>
      </div>

      {/* Middle — fills remaining height */}
      <div className="flex items-stretch flex-1 mt-10 mb-10">
        {/* Year */}
        <div
          className="flex items-center shrink-0"
          style={{ width: 'clamp(220px,36vw,520px)' }}
        >
          <span
            className="panel-year block leading-none select-none"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(7rem,18vw,24rem)',
              color: '#D9D9D9',
              mixBlendMode: 'difference',
              letterSpacing: '-0.045em',
              lineHeight: 0.85,
            }}
          >
            {exp.year}
          </span>
        </div>

        {/* Vertical divider */}
        <div
          className="panel-divider w-px bg-black/10 self-stretch shrink-0"
          style={{ margin: '0 clamp(2rem,4vw,5.5rem)' }}
        />

        {/* Content */}
        <div className="flex flex-col justify-center gap-7 flex-1 min-w-0" style={{ maxWidth: '52ch' }}>
          <p
            className="panel-company"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.62rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#EDEDED', mixBlendMode: 'difference', fontWeight: 700 }}
          >
            {exp.company}
          </p>

          <h3
            className="panel-role"
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2.2rem,4.5vw,5.8rem)',
              color: '#FFFFFF',
              mixBlendMode: 'difference',
              letterSpacing: '-0.042em',
              lineHeight: 0.93,
            }}
          >
            {exp.role}
          </h3>

          <ul className="panel-bullets flex flex-col gap-2.5">
            {exp.bullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-3 leading-relaxed"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: 'clamp(0.82rem,1vw,0.95rem)', color: '#E0E0E0', mixBlendMode: 'difference', fontWeight: 500 }}
              >
                <span style={{ marginTop: '0.55em', width: '3px', height: '3px', borderRadius: '50%', background: '#E0E0E0', flexShrink: 0 }} />
                {b}
              </li>
            ))}
          </ul>

          <div className="panel-stack flex flex-wrap gap-2">
            {exp.stack.map((t) => (
              <span
                key={t}
                className="transition-opacity duration-300 hover:opacity-60 cursor-default"
                style={{
                  border: '1px solid #D9D9D9',
                  color: '#D9D9D9',
                  mixBlendMode: 'difference',
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontSize: '0.6rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  padding: '0.35rem 0.75rem',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────── */
export function Experience() {
  const sectionRef  = useRef<HTMLElement>(null);
  const pinRef      = useRef<HTMLDivElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLSpanElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    const pin      = pinRef.current;
    const track    = trackRef.current;
    const progress = progressRef.current;
    if (!pin || !track) return;

    const ctx = gsap.context(() => {
      const getScrollDist = () => track.scrollWidth - window.innerWidth;

      /* ── Main horizontal tween ── */
      const scrollAnim = gsap.to(track, {
        x: () => -getScrollDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${getScrollDist()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            /* Velocity skew */
            const vel = self.getVelocity();
            gsap.to(track, {
              skewX: gsap.utils.clamp(-4, 4, vel * 0.00045),
              duration: 0.55,
              ease: 'power3.out',
              overwrite: 'auto',
            });

            /* Live panel label */
            const idx = Math.min(EXPERIENCE.length - 1, Math.floor(self.progress * EXPERIENCE.length));
            if (labelRef.current) {
              labelRef.current.textContent =
                `${String(idx + 1).padStart(2, '0')} · ${EXPERIENCE[idx].role} · ${EXPERIENCE[idx].company}`;
            }
          },
        },
      });

      /* ── Progress bar ── */
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${getScrollDist()}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      /* ── Per-panel reveal animations ── */
      const panels = Array.from(track.querySelectorAll('.panel'));

      panels.forEach((panel, i) => {
        const year    = panel.querySelector('.panel-year');
        const divider = panel.querySelector('.panel-divider');
        const company = panel.querySelector('.panel-company');
        const role    = panel.querySelector('.panel-role');
        const bullets = Array.from(panel.querySelectorAll('.panel-bullets li'));
        const stack   = panel.querySelector('.panel-stack');
        const topRow  = panel.querySelector('.panel-top');

        if (!year || !divider || !company || !role || !stack || !topRow) return;

        /* Set hidden initial state */
        gsap.set(topRow,   { opacity: 0, y: -10 });
        gsap.set(year,     { opacity: 0, x: -40 });
        gsap.set(divider,  { scaleY: 0, transformOrigin: 'top center' });
        gsap.set(company,  { opacity: 0, y: 10 });
        gsap.set(role,     { opacity: 0, y: 28 });
        gsap.set(bullets,  { opacity: 0, x: -12 });
        gsap.set(stack,    { opacity: 0, y: 10 });

        const stConfig = i === 0
          ? { trigger: pin,                  start: 'top 80%',  toggleActions: 'play none none none' }
          : { trigger: panel as Element, containerAnimation: scrollAnim, start: 'left 90%', toggleActions: 'play none none none' };

        const tl = gsap.timeline({ scrollTrigger: stConfig, defaults: { ease: 'power3.out' } });
        tl.to(topRow,  { opacity: 1, y: 0,  duration: 0.5 })
          .to(year,    { opacity: 1, x: 0,  duration: 0.95 }, '-=0.35')
          .to(divider, { scaleY: 1,         duration: 0.8  }, '-=0.7')
          .to(company, { opacity: 1, y: 0,  duration: 0.45 }, '-=0.45')
          .to(role,    { opacity: 1, y: 0,  duration: 0.75 }, '-=0.3')
          .to(bullets, { opacity: 1, x: 0,  duration: 0.5, stagger: 0.07 }, '-=0.45')
          .to(stack,   { opacity: 1, y: 0,  duration: 0.4  }, '-=0.25');
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Shared header ── */
  const Header = (
    <div className="px-[clamp(1.25rem,5vw,5rem)] pt-[clamp(4rem,8vw,10rem)] pb-[clamp(2rem,4vw,4rem)]">
      <div className="flex items-center gap-4 mb-[clamp(2rem,4vw,4rem)]">
        <motion.span
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D9D9D9', mixBlendMode: 'difference', fontWeight: 500 }}
          className="shrink-0"
          initial={{ opacity: 0, x: -16 }}
          animate={sectionInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          05 / Experience
        </motion.span>
        <motion.div
          className="flex-1 h-px"
          style={{ transformOrigin: 'left', background: '#D9D9D9', mixBlendMode: 'difference' }}
          initial={{ scaleX: 0 }}
          animate={sectionInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
        />
      </div>

      <h2
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 900, fontSize: 'clamp(2.4rem,7vw,8rem)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#FFFFFF', mixBlendMode: 'difference' }}
      >
        {(['Where', "I've"] as const).map((word, i) => (
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
            style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#D9D9D9' }}
            initial={{ y: '110%' }}
            animate={sectionInView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
          >
            Worked
          </motion.span>
        </span>
      </h2>
    </div>
  );

  return (
    <section ref={sectionRef} id="experience" className="w-full border-t border-black/8">

      {/* ── Mobile (< lg) ─────────────────────────────────────────── */}
      <div className="block lg:hidden relative overflow-hidden" style={{ isolation: 'isolate' }}>
        <video
          autoPlay muted loop playsInline preload="auto"
          poster="/exp_arch_poster.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/exp_arch_opt.mp4" type="video/mp4" />
        </video>
        {/* Light atmospheric lift only — text below is auto-inverting (mix-blend-mode:
            difference), so it no longer relies on this tint for legibility. */}
        <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="relative z-10">
          {Header}
          <div>
            {EXPERIENCE.map((exp, i) => (
              <MobileCard key={i} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop (≥ lg) ────────────────────────────────────────── */}
      <div className="hidden lg:block">
        {/* Header above the pin — plain white */}
        <div className="bg-white">{Header}</div>

        {/* Pinned horizontal scroll */}
        <div ref={pinRef} data-cursor="drag" className="h-screen overflow-hidden relative" style={{ isolation: 'isolate' }}>
          {/* Video */}
          <video
            autoPlay muted loop playsInline
            poster="/exp_arch_poster.jpg"
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          >
            <source src="/exp_arch_opt.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: 'rgba(255,255,255,0.12)' }} />

          {/* Top progress bar — decorative track, plain translucent white (no blend
              needed: it reads fine over both the video and the light tint) */}
          <div className="absolute top-0 left-0 right-0 h-px z-20 pointer-events-none" style={{ background: 'rgba(255,255,255,0.3)' }}>
            <div
              ref={progressRef}
              className="h-full origin-left"
              style={{ transform: 'scaleX(0)', background: 'rgba(255,255,255,0.75)' }}
            />
          </div>

          {/* Bottom label strip */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.25)',
              padding: 'clamp(0.75rem,1.4vw,1.1rem) clamp(2.5rem,5vw,6rem)',
            }}
          >
            <span ref={labelRef} style={{ ...S.label, color: '#D9D9D9', mixBlendMode: 'difference' }}>
              01 · Full Stack Developer · Recoverderm
            </span>
            <span style={{ ...S.micro, color: '#D9D9D9', mixBlendMode: 'difference' }}>
              ← Drag to navigate →
            </span>
          </div>

          {/* Scrolling track */}
          <div
            ref={trackRef}
            className="relative z-10 flex h-full"
            style={{ width: `${EXPERIENCE.length * 100}vw`, willChange: 'transform' }}
          >
            {EXPERIENCE.map((exp, i) => (
              <DesktopPanel key={i} exp={exp} index={i} total={EXPERIENCE.length} />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
