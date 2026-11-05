import { STEPS } from '@/content/process';
import { SECTIONS } from '@/content/site';

/**
 * Process, condensed: four steps on one horizontal timeline (a vertical list on phones).
 * Each step has its timeframe and what you get. Server component: no JS.
 */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-heading" data-theme="dark" className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,7rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.process.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
        </div>
        <h2 id="process-heading" className="t-h2 max-w-[20ch] text-white">
          {SECTIONS.process.heading}
        </h2>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute top-[7px] right-0 left-0 hidden h-px bg-on-ink-line md:block" />
          {STEPS.map((s) => (
            <li key={s.index} className="relative md:pr-4">
              <span aria-hidden className="relative z-10 mb-5 block h-[15px] w-[15px] rounded-full border border-white/40 bg-[#0A0A0A]" />
              <p className="t-label text-on-ink-3">
                <span className="t-mono text-on-ink-2">{s.index}</span> · {s.duration}
              </p>
              <h3 className="t-h3 mt-2 text-white">{s.title}</h3>
              <p className="t-body mt-3 text-on-ink-2">{s.body}</p>
              <p className="t-label mt-4 text-on-ink-3">{s.tags.join(' · ')}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
