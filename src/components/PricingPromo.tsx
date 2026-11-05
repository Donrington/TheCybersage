import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';

// Mirrors the categories and starting prices on cybersage.dev/pricing. Do not change numbers here
// without changing that page (pricing-data.ts there).
const TIERS = [
  { label: 'Static & Landing', note: 'Landing pages & portfolios', price: 'From $300' },
  { label: 'Corporate & CMS', note: 'Corporate sites & blogs', price: 'From $1,100' },
  { label: 'E-Commerce', note: 'Full commerce platforms', price: 'From $1,600' },
  { label: 'Web Applications', note: 'Dashboards & SaaS builds', price: 'From $1,500' },
  { label: 'Maintenance', note: 'Monthly care & support', price: 'From $125/mo' },
];

/** Pricing: clean rows on the off-white surface. Server component. */
export function PricingPromo() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" data-theme="light" className="w-full border-t border-black/[0.08] bg-[#F5F5F3] text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,8rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.pricing.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
        </div>
        <SplitHeading id="pricing-heading" className="t-h2 max-w-[16ch] text-ink" text={SECTIONS.pricing.heading} />
        <p className="t-lede mt-5 max-w-[56ch] text-on-canvas-2">
          Starting prices by type of project. Find the row that matches what you are building; anything bigger is quoted after a call.
        </p>

        <ul className="mt-12 border-t border-black/10">
          <li className="border-b border-black/10">
            <Link
              href="#contact"
              className="group flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <span>
                <span className="block text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Custom architecture engagements</span>
                <span className="t-label mt-1 block text-on-canvas-3">Systems, infrastructure and backends · quoted per engagement</span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                Talk to me
                <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
          {TIERS.map((t) => (
            <li key={t.label} className="flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-black/10 py-5">
              <span>
                <span className="block text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{t.label}</span>
                <span className="t-label mt-1 block text-on-canvas-3">For {t.note.charAt(0).toLowerCase() + t.note.slice(1)}</span>
              </span>
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-ink sm:text-2xl">{t.price}</span>
            </li>
          ))}
        </ul>

        <a
          href="https://cybersage.dev/pricing"
          className="group mt-8 inline-flex min-h-11 items-center gap-2 border-b border-black/30 text-sm font-semibold text-ink transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          See full pricing
          <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
