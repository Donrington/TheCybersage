import { Plus } from 'lucide-react';
import { FAQS } from '@/content/faq';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';

/** Six questions as numbered hairline rows of native <details> (exclusive via name="faq"). Server component, works without JS. */
export function FAQ() {
  return (
    <section id="faq-section" aria-labelledby="faq-heading" data-theme="light" className="w-full border-t border-black/[0.08] bg-white text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(3rem,6vw,5.5rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.faq.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
          <span className="t-mono hidden text-on-canvas-3 sm:inline">SHEET 10 / QUESTIONS · {String(FAQS.length).padStart(2, '0')}</span>
        </div>
        <SplitHeading id="faq-heading" className="t-h2 max-w-[18ch] text-ink" text={SECTIONS.faq.heading} />
        <div className="mt-12 border-t border-l border-r border-black/25">
          {FAQS.map((faq, i) => (
            <details key={faq.id} name="faq" open={i === 0} className="faq-item border-b border-black/25">
              <summary className="flex min-h-16 cursor-pointer list-none items-start justify-between gap-6 px-5 py-5 transition-colors hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black sm:px-7 [&::-webkit-details-marker]:hidden">
                <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="t-mono w-28 shrink-0 text-on-canvas-3">
                    {String(i + 1).padStart(2, '0')} · {faq.category.toUpperCase()}
                  </span>
                  <span className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{faq.question}</span>
                </span>
                <span aria-hidden className="faq-icon mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-black/25 text-ink">
                  <Plus size={14} />
                </span>
              </summary>
              <p className="t-lede max-w-[70ch] px-5 pr-8 pb-8 text-on-canvas-2 sm:pl-[calc(1.75rem+7rem+1.5rem)]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
