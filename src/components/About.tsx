'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { label: 'Years of Experience', target: 5,   suffix: '+' },
  { label: 'Projects Shipped',    target: 50,  suffix: '+' },
  { label: 'Global Clients',      target: 40, suffix: '+' },
  { label: 'Countries Served',    target: 8,   suffix: ''  },
];

const COUNTRIES = [
  'Nigeria', 'United States', 'Canada', 'United Kingdom',
  'Australia', 'India', 'Ghana', 'Kenya',
];

const QUOTE_WORDS = [
  'I', 'architect', 'systems', 'that', "don’t", 'just', 'work', '—',
  'they', 'scale,', 'survive', 'failure,', 'and', 'stay', 'clean', 'under', 'pressure.',
];

const EASE = [0.22, 1, 0.36, 1] as const;

/* Smooth count-up, fires once on scroll into view */
function CountUp({
  target,
  suffix,
  inView,
  delay = 0,
}: {
  target: number;
  suffix: string;
  inView: boolean;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const count   = useMotionValue(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const ctrl = animate(count, target, {
      duration: 2.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, target, count, delay]);

  return <>{display}{suffix}</>;
}

/* Word-by-word animated pull quote */
function AnimatedQuote({ inView }: { inView: boolean }) {
  return (
    <p
      style={{
        fontFamily:    'var(--font-instrument), Georgia, serif',
        fontStyle:     'italic',
        fontSize:      'clamp(1.8rem, 3.5vw, 3.5rem)',
        letterSpacing: '-0.01em',
        lineHeight:    1.2,
        color:         '#0A0A0A',
      }}
    >
      &ldquo;
      {QUOTE_WORDS.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.55, delay: 0.05 + i * 0.045, ease: EASE }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
      &rdquo;
    </p>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  const sectionInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const statsInView   = useInView(statsRef,   { once: true, margin: '-5%'  });

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {

      /* Horizontal rule draw-in */
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: lineRef.current, start: 'top 85%' },
          }
        );
      }

      /* Image clip-path reveal */
      gsap.fromTo(imageRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.4,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: imageRef.current, start: 'top 78%' },
        }
      );

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full bg-white border-t border-black/[0.08]"
    >
      <div className="max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] py-[clamp(5rem,10vw,11rem)]">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-[clamp(2rem,4vw,4rem)]">
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-[0.6rem] tracking-[0.22em] uppercase text-black/30 font-medium"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
          >
            01 / About
          </motion.span>
          <div ref={lineRef} className="flex-1 h-px bg-black/10" />
        </div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          className="font-black text-black tracking-tighter leading-[0.88] mb-[clamp(3rem,6vw,7rem)]"
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 900,
            fontSize:   'clamp(4rem, 10vw, 13rem)',
          }}
        >
          About{' '}
          <span
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle:  'italic',
              fontWeight: 400,
              color:      'rgba(10,10,10,0.30)',
            }}
          >
            Me
          </span>
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(3rem,6vw,8rem)]">

          {/* Left: stats + countries */}
          <div className="flex flex-col gap-[clamp(2.5rem,4vw,3.5rem)]">
          <div ref={statsRef} className="grid grid-cols-2 gap-x-8 gap-y-12 content-start">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 28, clipPath: 'inset(100% 0 0 0)' }}
                animate={statsInView ? { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' } : {}}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              >
                <p
                  className="font-black text-black leading-none tracking-tighter tabular-nums"
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize:   'clamp(3.5rem, 7vw, 9rem)',
                  }}
                >
                  <CountUp
                    target={stat.target}
                    suffix={stat.suffix}
                    inView={statsInView}
                    delay={i * 0.12}
                  />
                </p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={statsInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: EASE }}
                  className="mt-2 text-[0.75rem] font-semibold tracking-[0.14em] uppercase text-black/40"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {stat.label}
                </motion.p>

                {/* Underline draws in after the number settles */}
                <motion.div
                  className="mt-4 h-px bg-black/10"
                  initial={{ scaleX: 0, transformOrigin: 'left' }}
                  animate={statsInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: EASE }}
                />
              </motion.div>
            ))}
          </div>

          {/* Countries served */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          >
            <p
              className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-black/35 mb-4"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              Shipped across
            </p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country, i) => (
                <motion.span
                  key={country}
                  initial={{ opacity: 0, y: 8 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.05, ease: EASE }}
                  className="border border-black/12 px-3 py-1.5 text-[0.68rem] font-medium tracking-[0.06em] text-black/50"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  {country}
                </motion.span>
              ))}
            </div>
          </motion.div>
          </div>

          {/* Right: quote + body + image */}
          <div className="flex flex-col justify-between gap-10">

            <AnimatedQuote inView={sectionInView} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={sectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              className="space-y-5"
            >
              <p
                className="text-black/55 leading-relaxed"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize:   'clamp(1.05rem, 1.5vw, 1.3rem)',
                }}
              >
                A software engineer based in Lagos, Nigeria — 5+ years designing and running
                production systems for global clients: multi-tenant compliance platforms, HIPAA
                medical portals, high-traffic marketplaces. I own the system end-to-end:
                architecture, infrastructure, backend, delivery.
              </p>
              <p
                className="text-black/40 leading-relaxed"
                style={{
                  fontFamily: 'Satoshi, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize:   'clamp(1rem, 1.3vw, 1.15rem)',
                }}
              >
                Core: AWS, Docker, Go, Django, PostgreSQL, Redis, CI/CD. Fluent in Next.js for
                when the system needs a face. I care about the whole system — not just the feature.
              </p>

              <motion.div
                className="flex gap-4 pt-2"
                initial={{ opacity: 0 }}
                animate={sectionInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
              >
                <a
                  href="https://github.com/Donrington"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.65rem] tracking-[0.18em] uppercase font-medium text-black/40 hover:text-black border-b border-black/20 hover:border-black pb-px transition-colors"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/carrington-abakwe-b0b0a0217"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.65rem] tracking-[0.18em] uppercase font-medium text-black/40 hover:text-black border-b border-black/20 hover:border-black pb-px transition-colors"
                  style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                >
                  LinkedIn
                </a>
              </motion.div>
            </motion.div>

            {/* Headshot — GSAP clip reveal */}
            <div
              ref={imageRef}
              className="relative aspect-4/3 w-full overflow-hidden bg-black/4"
            >
              <Image
                src="/me.png"
                alt="Abakwe Carrington — software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria"
                fill
                className="object-cover object-top grayscale"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 mix-blend-multiply bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
