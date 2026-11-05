import { Plus } from 'lucide-react';
import { FAQS } from '@/content/faq';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';

/** Six questions as native <details> (exclusive via name="faq"). Server component, works without JS. */
export function FAQ() {
  return (
    <section id="faq-section" aria-labelledby="faq-heading" data-theme="light" className="w-full border-t border-black/[0.08] bg-white text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,8rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.faq.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
        </div>
        <SplitHeading id="faq-heading" className="t-h2 max-w-[18ch] text-ink" text={SECTIONS.faq.heading} />
        <div className="mt-12 border-t border-black/10">
          {FAQS.map((faq, i) => (
            <details key={faq.id} name="faq" open={i === 0} className="faq-item border-b border-black/10">
              <summary className="flex min-h-16 cursor-pointer list-none items-start justify-between gap-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black [&::-webkit-details-marker]:hidden">
                <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="t-label w-32 shrink-0 text-on-canvas-3">{faq.category}</span>
                  <span className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{faq.question}</span>
                </span>
                <span aria-hidden className="faq-icon mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/15 text-on-canvas-2">
                  <Plus size={14} />
                </span>
              </summary>
              <p className="t-lede max-w-[70ch] pr-4 pb-8 text-on-canvas-2 sm:pl-38">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
