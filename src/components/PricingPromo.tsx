'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

// Mirrors the 5 real categories on cybersage.dev/pricing — starting price is
// the cheapest tier within each. Labels are shortened slightly for this
// compact list (e.g. "E-Commerce" not "E-Commerce Solutions") but map 1:1
// to the categories there; keep these in sync if pricing-data.ts changes.
const TIERS = [
  { label: 'Static & Landing', note: 'Landing pages & portfolios', price: 'From $300' },
  { label: 'Corporate & CMS',  note: 'Corporate sites & blogs',    price: 'From $1,100' },
  { label: 'E-Commerce',       note: 'Full commerce platforms',    price: 'From $1,600' },
  { label: 'Web Applications', note: 'Dashboards & SaaS builds',   price: 'From $1,500' },
  { label: 'Maintenance',      note: 'Monthly care & support',     price: 'From $125/mo' },
];

export function PricingPromo() {
  const ref     = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      id="pricing"
      className="w-full bg-white border-t border-black/[0.08]"
    >
      <div className="max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)] py-[clamp(4rem,8vw,9rem)]">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-[clamp(2rem,4vw,4rem)]">
          <motion.span
            className="text-[0.6rem] tracking-[0.22em] uppercase text-black/30 font-medium shrink-0"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            07 / Pricing
          </motion.span>
          <motion.div
            ref={lineRef}
            className="flex-1 h-px bg-black/10"
            style={{ transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.1, ease: EASE }}
          />
        </div>

        {/* Two-column layout — headline left, copy + CTA right.
            1.3fr/1fr (not an even split — matches Process.tsx's headline row):
            "Transparent" is one unbroken word, so it can't wrap to fit a
            narrower column the way multi-word headlines elsewhere can. The
            font-size clamp below is sized against this column's actual
            worst-case width (~430px at the 1024px lg breakpoint, capped at
            ~608px once the 1440px container max-width takes over), not the
            full viewport — the previous 9vw/11rem formula was sized for a
            full-width single-column headline and overflowed at every
            desktop width once this became a 2-column layout.

            items-start (not items-end): the right column (paragraph + 5
            tier rows + CTA) is naturally taller than the 2-line headline,
            so the grid row's height already tracks the right column. With
            items-start both columns begin at the same top edge, which is
            what the lg:sticky headline below needs — it pins at top-22
            (clearing the fixed navbar pill) and releases on its own once
            the right column's bottom (=row bottom) scrolls into range. No
            manual scroll-distance math needed; this is CSS-native and
            resizes/reflows correctly for free. Desktop-only via lg:. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-[clamp(3rem,6vw,8rem)] items-start">

          {/* Left — display headline, pinned on desktop while the right
              column scrolls past it */}
          <div className="lg:sticky lg:top-22 lg:self-start">
            <h2
              className="font-black text-black tracking-tighter leading-[0.88]"
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontWeight: 900,
                fontSize:   'clamp(2.5rem, 5.85vw, 5.25rem)',
              }}
            >
              {['Transparent'].map((word, i) => (
                <span key={word} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 0.75, delay: 0.05 + i * 0.1, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  style={{
                    fontFamily: 'var(--font-instrument), Georgia, serif',
                    fontStyle:  'italic',
                    fontWeight: 400,
                    color:      'rgba(10,10,10,0.28)',
                  }}
                  initial={{ y: '110%' }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 0.75, delay: 0.18, ease: EASE }}
                >
                  Pricing
                </motion.span>
              </span>
            </h2>
          </div>

          {/* Right — descriptor + tiers + CTA */}
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
          >
            <p
              className="text-black/55 leading-relaxed"
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontWeight: 400,
                fontSize:   'clamp(1.05rem, 1.5vw, 1.3rem)',
              }}
            >
              Every service tier, clearly priced — no discovery calls required to
              understand what you&apos;re paying for. Scope your engagement, pick
              the tier that fits, and get started the same week.
            </p>

            {/* Category rows — label+price share a line (with a wrap fallback
                in case a future longer label ever gets tight), note sits
                below on its own line rather than squeezing three strings
                onto one row. */}
            <div className="flex flex-col gap-3">
              {TIERS.map((tier, i) => (
                <motion.div
                  key={tier.label}
                  className="flex flex-col gap-1 border-b border-black/8 pb-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.08, ease: EASE }}
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <span
                      className="font-black text-black tracking-tight"
                      style={{
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        fontWeight: 800,
                        fontSize:   'clamp(1.1rem, 1.6vw, 1.35rem)',
                      }}
                    >
                      {tier.label}
                    </span>
                    <span
                      className="text-black/55"
                      style={{
                        fontFamily: 'Satoshi, system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize:   '0.85rem',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {tier.price}
                    </span>
                  </div>
                  <span
                    className="text-black/35"
                    style={{
                      fontFamily: 'Satoshi, system-ui, sans-serif',
                      fontWeight: 400,
                      fontSize:   '0.72rem',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tier.note}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
            >
              <a
                href="https://cybersage.dev/pricing"
                data-cursor="view"
                className="group flex items-center gap-2 bg-black text-white px-7 py-3.5 text-[0.68rem] font-medium tracking-[0.18em] uppercase hover:bg-black/80 transition-colors duration-200"
                style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
              >
                View All Tiers
                <ArrowUpRight
                  size={12}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                />
              </a>
              <span
                className="text-black/30"
                style={{
                  fontFamily:    'Satoshi, system-ui, sans-serif',
                  fontSize:      '0.65rem',
                  letterSpacing: '0.06em',
                }}
              >
                cybersage.dev/pricing
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
