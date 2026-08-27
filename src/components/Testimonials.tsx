'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import Image from 'next/image';
import { useReducedMotion } from '@/lib/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 7000;

type Source = 'Client' | 'LinkedIn' | 'Upwork';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
  /** White company logo in /public/logo — omitted for peer endorsements */
  logo?: string;
  /** Scale-up factor for logos with heavy internal whitespace */
  logoScale?: number;
  source: Source;
}

/* Real testimonials — quotes transcribed from the source screenshots in /public/testimonial */
const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Hycinth',
    role: 'Chief Executive Officer',
    company: 'SAMDUS Oil & Gas',
    quote:
      'It has been quite a pleasure and delightful experience working with you. Your professionalism, dedication, commitment, enthusiasm, passion, and especially patience are all commendable.',
    image: '/testimonial/samdus.jpg',
    logo: '/logo/samdus_white.png',
    source: 'Client',
  },
  {
    name: 'Carita',
    role: 'Founder',
    company: 'RecoverDerm',
    quote:
      'The website is beautiful — already I’m getting a lot of compliments. I’m happy and proud we were able to bring my vision to light.',
    image: '/testimonial/recoverderm.jpg',
    logo: '/logo/ReCoverDerm Logo Varient (White).png',
    source: 'Client',
  },
  {
    name: 'Halima',
    role: 'Executive Director',
    company: 'AmaniGo Travel',
    quote:
      'Cybersage delivered a top-notch CMS for our travel agency. It’s user-friendly and has genuinely enhanced our client engagement.',
    image: '/testimonial/amanigo.png',
    logo: '/logo/amanigo.png',
    logoScale: 2,
    source: 'Client',
  },
  {
    name: 'Godspower Lawrence',
    role: 'Software Engineer',
    company: 'Endorsement · LinkedIn',
    quote:
      'I was consistently impressed by his exceptional Python skills, dedication, and attention to detail. He excels at solving complex problems with a systematic approach and collaborates effectively within a team. He is an asset to any team.',
    image: '/testimonial/lawerence_linkedin.jpg',
    source: 'LinkedIn',
  },
  {
    name: 'Precious Ukasoanya',
    role: 'Fullstack Software Engineer',
    company: 'Endorsement · LinkedIn',
    quote:
      'Carrington possesses an in-depth understanding of Python, consistently delivering high-quality code with a keen eye for detail. A great team player who communicates effectively — I wholeheartedly endorse him.',
    image: '/testimonial/preciousLinkedIn.jpg',
    source: 'LinkedIn',
  },
  {
    name: 'Ashley J.',
    role: 'Software Engineer',
    company: 'Verified · Upwork',
    quote:
      'He consistently delivered quality work on time, communicated effectively, and demonstrated strong technical skills in Python. Professional, reliable, and easy to work with. Highly recommended.',
    image: '/testimonial/ashley_upwork.jpg',
    source: 'Upwork',
  },
];

function SourceBadge({ source }: { source: Source }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 border border-white/12 px-2.5 py-1 text-[0.5rem] tracking-[0.2em] uppercase text-white/35 font-medium"
      style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
    >
      <span className="w-1 h-1 rounded-full bg-white/40" />
      {source === 'Client' ? 'Verified Client' : `via ${source}`}
    </span>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-12%' });
  const reduced = useReducedMotion();

  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number, direction: number) => {
    setDir(direction);
    setActive((next + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  const next = useCallback(() => go(active + 1, 1), [active, go]);
  const prev = useCallback(() => go(active - 1, -1), [active, go]);

  /* Auto-advance — pauses on hover/focus */
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(active + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, paused, go]);

  /* Section reveal + ambient */
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        showcaseRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: showcaseRef.current, start: 'top 82%' },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      data-theme="dark"
      className="relative w-full bg-[#0A0A0A] border-t border-white/6 overflow-hidden"
    >
      {/* Ambient orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.025), transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -right-24 w-[36rem] h-[36rem] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.02), transparent 70%)' }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] py-[clamp(5rem,10vw,11rem)]">

        {/* Section label */}
        <div ref={headerRef} className="flex items-center gap-4 mb-[clamp(2.5rem,5vw,5rem)]">
          <motion.span
            className="text-[0.6rem] tracking-[0.22em] uppercase text-white/20 font-medium shrink-0"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            initial={{ opacity: 0, x: -16 }}
            animate={sectionInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            07 / Testimonials
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
          className="font-black text-white tracking-[-0.04em] leading-[0.9] mb-[clamp(3rem,6vw,6rem)]"
          style={{
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(2.6rem, 6.5vw, 7.5rem)',
          }}
        >
          {(['Trusted', 'by'] as const).map((word, i) => (
            <span key={word} className="inline-block overflow-hidden mr-[0.25em]">
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
          <span className="inline-block overflow-hidden">
            <motion.span
              className="block"
              style={{
                fontFamily: 'var(--font-instrument), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.3)',
              }}
              initial={{ y: '110%' }}
              animate={sectionInView ? { y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            >
              clients &amp; peers
            </motion.span>
          </span>
        </h2>

        {/* Showcase */}
        <div
          ref={showcaseRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-[clamp(2.5rem,5vw,5rem)] items-center border-t border-white/8 pt-[clamp(2.5rem,5vw,4.5rem)]"
        >
          {/* ── LEFT: write-up ─────────────────────────────────────────────── */}
          <div className="relative min-h-[clamp(22rem,40vw,26rem)] flex flex-col justify-between order-2 lg:order-1">
            {/* index */}
            <div className="flex items-center gap-4 mb-8">
              <span
                className="text-white/80 tabular-nums font-black leading-none"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem,5vw,4rem)' }}
              >
                {String(active + 1).padStart(2, '0')}
              </span>
              <span className="text-white/20 text-sm tabular-nums" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                / {String(TESTIMONIALS.length).padStart(2, '0')}
              </span>
              <Quote size={22} className="text-white/12 ml-auto" />
            </div>

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={active}
                custom={dir}
                initial={{ opacity: 0, y: dir > 0 ? 26 : -26, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: dir > 0 ? -26 : 26, filter: 'blur(6px)' }}
                transition={{ duration: 0.6, ease: EASE }}
                className="flex-1"
              >
                <blockquote
                  className="text-white/85"
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.4rem, 2.6vw, 2.5rem)',
                    lineHeight: 1.32,
                    letterSpacing: '-0.01em',
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="mt-9 flex items-center gap-5">
                  {/* company logo OR source badge slot */}
                  {t.logo ? (
                    <div className="relative h-12 w-32 shrink-0 opacity-80">
                      <Image
                        src={t.logo}
                        alt={t.company}
                        fill
                        className="object-contain object-left"
                        style={t.logoScale ? { transform: `scale(${t.logoScale})`, transformOrigin: 'left center' } : undefined}
                      />
                    </div>
                  ) : null}

                  <div className={t.logo ? 'border-l border-white/12 pl-5' : ''}>
                    <p
                      className="text-white font-semibold"
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: 'clamp(0.95rem,1.4vw,1.1rem)' }}
                    >
                      {t.name}
                    </p>
                    <p
                      className="text-white/40 mt-0.5"
                      style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.78rem' }}
                    >
                      {t.role}{t.logo ? ` · ${t.company}` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <SourceBadge source={t.source} />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls + tabs */}
            <div className="mt-10">
              {/* progress bar */}
              <div className="h-px w-full bg-white/8 relative overflow-hidden mb-6">
                {!paused && (
                  <motion.div
                    key={active}
                    className="absolute inset-y-0 left-0 bg-white/40"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                  />
                )}
              </div>

              <div className="flex items-center justify-between gap-6">
                {/* name tabs */}
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {TESTIMONIALS.map((item, i) => (
                    <button
                      key={item.name}
                      onClick={() => go(i, i > active ? 1 : -1)}
                      className="text-[0.6rem] tracking-[0.16em] uppercase font-medium transition-colors duration-200"
                      style={{
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        color: i === active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {item.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* arrows */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={prev}
                    aria-label="Previous testimonial"
                    className="w-10 h-10 border border-white/12 flex items-center justify-center text-white/35 hover:text-white hover:border-white/35 transition-colors duration-200"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next testimonial"
                    className="w-10 h-10 border border-white/12 flex items-center justify-center text-white/35 hover:text-white hover:border-white/35 transition-colors duration-200"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: source image ────────────────────────────────────────── */}
          <div className="relative order-1 lg:order-2">
            {/* corner accents */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t border-l border-white/20 pointer-events-none z-20" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b border-r border-white/20 pointer-events-none z-20" />

            <div className="relative w-full aspect-[4/5] sm:aspect-[5/5] bg-white/[0.02] border border-white/10 overflow-hidden">
              {!reduced && (
                <span aria-hidden className="beam-ring" style={{ position: 'absolute', inset: 0, padding: 1, pointerEvents: 'none', zIndex: 20, animationDuration: '6s' }} />
              )}
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={active}
                  className="absolute inset-0 flex items-center justify-center p-3 sm:p-5"
                  initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
                  exit={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
                  transition={{ duration: 0.65, ease: EASE }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={t.image}
                      alt={`${t.name} — testimonial`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      quality={90}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* subtle top sheen */}
              <div
                className="absolute top-0 inset-x-0 h-px pointer-events-none z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 50%, transparent)' }}
              />
            </div>

            <p
              className="mt-4 text-[0.55rem] tracking-[0.2em] uppercase text-white/22 font-medium text-center"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            >
              Unedited · Direct from {t.source === 'Client' ? 'the client' : t.source}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
