'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Every shot in /public/projects, split across the two rows. */
const ROW_A = [
  'wytnest_hero.png', 'autoboy.png', 'recoverderm.png', 'anoc.png', 'nextgen.png',
  'colhcs_dashbaord.png', 'chronos.png', 'terryonfagan.png', 'judygolden.png',
  'wynscollections.png', 'THE_BLACK-E.png', 'VER.png', 'axflo.png', 'deets.png',
  'krkmotors.png', 'samdus1_1.jpg', 'rokeyla.jpg', 'amanigo.png',
];

const ROW_B = [
  'colhc.png', 'anoc_2.png', 'autoboy2.png', 'nextgen2.png', 'chronos_2.png',
  'wyns2.png', 'anoc_3.png', 'nextgen3.png', 'wyns3.png', 'colhc_footer.png',
  'wyns4.png', 'kicslanding.png', 'techhub.png', 'tuantling.png',
  'chrisconteras.png', 'myrakeleher.png', 'handyman3.jpg', 'twerkqueenlagos.jpg',
];

/**
 * Deterministic shape per slot so the row reads as a mixed-format contact
 * sheet rather than a uniform strip — and so SSR and client agree.
 */
const SHAPES = ['wide', 'square', 'wide', 'portrait', 'wide', 'square'] as const;
const WIDTH: Record<(typeof SHAPES)[number], string> = {
  wide: 'clamp(230px, 30vw, 400px)',
  square: 'clamp(150px, 19vw, 240px)',
  portrait: 'clamp(120px, 15vw, 190px)',
};

function Row({
  files,
  reverse,
  speed,
}: {
  files: string[];
  reverse: boolean;
  speed: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const half = track.scrollWidth / 2;
    // Reverse rows start pre-shifted so they travel the opposite way without
    // ever exposing the gap at the end of the duplicated list.
    gsap.set(track, { x: reverse ? -half : 0 });
    const tween = gsap.to(track, {
      x: reverse ? 0 : -half,
      duration: half / speed,
      ease: 'none',
      repeat: -1,
    });

    return () => { tween.kill(); };
  }, [reverse, speed]);

  const items = [...files, ...files];

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ gap: 'clamp(0.5rem,1vw,0.85rem)' }}
      >
        {items.map((f, i) => {
          const shape = SHAPES[i % SHAPES.length];
          return (
            <div
              key={`${f}-${i}`}
              className="relative shrink-0 overflow-hidden"
              style={{
                width: WIDTH[shape],
                height: 'clamp(140px, 17vw, 250px)',
                borderRadius: 'clamp(10px,1vw,16px)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <Image
                src={`/projects/${f}`}
                alt=""
                aria-hidden
                fill
                loading="lazy"
                quality={60}
                sizes="(max-width: 768px) 45vw, 30vw"
                className="object-cover"
              />
              {/* Keeps the strip tonally quiet so it reads as texture, not as a
                  second Work section competing with the cube above. */}
              <div className="absolute inset-0" style={{ background: 'rgba(10,10,10,0.28)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudioMarquee() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12%' });
  const reduced = useReducedMotion();

  return (
    <section
      ref={ref}
      data-theme="dark"
      aria-label="From the studio"
      className="w-full bg-[#0A0A0A] border-t border-white/6 overflow-hidden"
      style={{ paddingTop: 'clamp(3.5rem,7vw,7rem)', paddingBottom: 'clamp(3.5rem,7vw,7rem)' }}
    >
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] mb-[clamp(2rem,4vw,3.5rem)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <motion.span
              className="block text-[0.6rem] tracking-[0.22em] uppercase text-white/25 font-medium mb-4"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              initial={{ opacity: 0, x: -14 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
            >
              Selected Frames
            </motion.span>
            <h2
              className="font-black text-white tracking-[-0.04em] leading-[0.9]"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(2.2rem,5.5vw,5.5rem)' }}
            >
              <span className="inline-block overflow-hidden mr-[0.22em]">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  From the
                </motion.span>
              </span>
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
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
                >
                  Studio
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.a
            href="#work"
            data-cursor="view"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
              e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
            }}
            onPointerEnter={(e) => e.currentTarget.style.setProperty('--mh', '1')}
            onPointerLeave={(e) => e.currentTarget.style.setProperty('--mh', '0')}
            className="group hidden sm:inline-flex items-center gap-2 border border-white/18 px-6 py-3 text-white/55 hover:text-white hover:border-white/45 transition-colors duration-300 shrink-0"
            style={{ position: 'relative' }}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          >
            {!reduced && (
              <>
                <span aria-hidden className="metal-edge" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '7s' }} />
                <span aria-hidden className="metal-sheen" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6, animationDuration: '5.5s' }} />
              </>
            )}
            <span aria-hidden className="metal-highlight" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            <span
              className="text-[0.6rem] tracking-[0.2em] uppercase font-medium"
              style={{ fontFamily: 'Satoshi, system-ui, sans-serif', position: 'relative', zIndex: 1 }}
            >
              More Work
            </span>
            <ArrowUpRight size={12} style={{ position: 'relative', zIndex: 1 }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </motion.a>
        </div>
      </div>

      {/* Opposing rows */}
      <div className="flex flex-col" style={{ gap: 'clamp(0.5rem,1vw,0.85rem)' }}>
        <Row files={ROW_A} reverse={false} speed={46} />
        <Row files={ROW_B} reverse speed={38} />
      </div>
    </section>
  );
}
