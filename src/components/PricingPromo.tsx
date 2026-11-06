import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Corners } from '@/components/ui/Corners';

// Mirrors the categories and starting prices on cybersage.dev/pricing. Do not change numbers here
// without changing that page (pricing-data.ts there).
const TIERS = [
  { label: 'Static & Landing', note: 'Landing pages & portfolios', price: 'From $300' },
  { label: 'Corporate & CMS', note: 'Corporate sites & blogs', price: 'From $1,100' },
  { label: 'E-Commerce', note: 'Full commerce platforms', price: 'From $1,600' },
  { label: 'Web Applications', note: 'Dashboards & SaaS builds', price: 'From $1,500' },
  { label: 'Maintenance', note: 'Monthly care & support', price: 'From $125/mo' },
];

/** Pricing as a rate sheet: numbered hairline rows, the custom-engagement row first and filled. Server component. */
export function PricingPromo() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" data-theme="light" className="w-full border-t border-black/[0.08] bg-[#F5F5F3] text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,8rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.pricing.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
          <span className="t-mono hidden text-on-canvas-3 sm:inline">SHEET 09 / RATE SHEET</span>
        </div>
        <SplitHeading id="pricing-heading" className="t-h2 max-w-[16ch] text-ink" text={SECTIONS.pricing.heading} />
        <p className="t-lede mt-5 max-w-[56ch] text-on-canvas-2">
          Starting prices by type of project. Find the row that matches what you are building; anything bigger is quoted after a call.
        </p>

        <ul className="relative mt-12 border-t border-l border-r border-black/25">
          <li className="border-b border-black/25">
            <Link
              href="#contact"
              className="group relative flex min-h-24 flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-[#0A0A0A] px-5 py-5 text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black sm:px-7"
            >
              <span className="flex items-baseline gap-5">
                <span className="t-mono text-white/55">00</span>
                <span>
                  <span className="block text-xl font-extrabold tracking-tight sm:text-2xl">Custom architecture engagements</span>
                  <span className="t-mono mt-1 block text-white/60">SYSTEMS, INFRASTRUCTURE AND BACKENDS · QUOTED PER ENGAGEMENT</span>
                </span>
              </span>
              <span className="t-mono inline-flex items-center gap-2 uppercase">
                Talk to me
                <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
          {TIERS.map((t, i) => (
            <li key={t.label} className="price-row relative flex min-h-24 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-black/25 px-5 py-5 transition-colors duration-300 hover:bg-white sm:px-7">
              <span className="flex items-baseline gap-5">
                <span className="t-mono text-on-canvas-3">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{t.label}</span>
                  <span className="t-mono mt-1 block text-on-canvas-3 uppercase">For {t.note.charAt(0).toLowerCase() + t.note.slice(1)}</span>
                </span>
              </span>
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-ink sm:text-2xl">{t.price}</span>
            </li>
          ))}
          <Corners />
        </ul>

        <a
          href="https://cybersage.dev/pricing"
          className="group t-mono mt-8 inline-flex min-h-11 items-center gap-2 border border-black/25 px-4 text-ink uppercase transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          See full pricing
          <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
