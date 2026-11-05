import { STEPS } from '@/content/process';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Corners } from '@/components/ui/Corners';

/**
 * Process as a four-cell timeline sheet: each step has its timeframe in a header strip, a large mono index, what
 * happens, and what you get. A line with a node per step runs behind the cells. Server component: no JS.
 */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-heading" data-theme="dark" className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,7rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.process.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
          <span className="t-mono hidden text-on-ink-3 sm:inline">SHEET 06 / TIMELINE · 04 STEPS</span>
        </div>
        <SplitHeading id="process-heading" className="t-h2 max-w-[20ch] text-white" text={SECTIONS.process.heading} />

        <ol className="relative mt-12 grid border-t border-l border-on-ink-line md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.index} className="process-step group relative border-r border-b border-on-ink-line">
              <p className="t-mono flex items-center justify-between border-b border-on-ink-line px-5 py-2 text-on-ink-3">
                <span>STEP {s.index}</span>
                <span className="text-on-ink-2">{s.duration.toUpperCase()}</span>
              </p>
              <div className="px-5 pt-6 pb-7">
                <span aria-hidden className="block text-[clamp(3.5rem,6vw,5.5rem)] leading-none font-black tracking-tighter text-white/15 transition-colors duration-500 group-hover:text-white/60">
                  {s.index}
                </span>
                <h3 className="t-h3 mt-4 text-white">{s.title}</h3>
                <p className="t-body mt-3 text-on-ink-2">{s.body}</p>
                <p className="t-mono mt-5 text-on-ink-3">{s.tags.join(' · ').toUpperCase()}</p>
              </div>
              {/* progress node on the top edge */}
              <span aria-hidden className="absolute -top-[4px] left-5 z-10 hidden h-[7px] w-[7px] bg-white md:block" />
              {i < STEPS.length - 1 && <span aria-hidden className="absolute top-[-1px] right-0 hidden h-px w-1/2 bg-white/40 md:block" />}
              <Corners />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
