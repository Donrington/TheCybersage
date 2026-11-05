import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import now from '@/data/now.json';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { sinceLabel } from '@/components/NowChip';

const STATUS: Record<string, { label: string; dot: string }> = {
  building: { label: 'Building', dot: 'bg-live' },
  beta: { label: 'Beta', dot: 'bg-amber-300' },
  live: { label: 'Live', dot: 'bg-white/80' },
};

/** Three active projects, all from src/data/now.json. Edit that file to change this row. */
export function LabRow() {
  return (
    <section id="lab" aria-labelledby="lab-heading" data-theme="dark" className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,7rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.lab.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
        </div>
        <SplitHeading id="lab-heading" className="t-h2 max-w-[22ch] text-white" text={SECTIONS.lab.heading} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {now.entries.slice(0, 3).map((e) => {
            const st = STATUS[e.status] ?? STATUS.live;
            const since = sinceLabel(e.since);
            return (
              <li key={e.id} className="flex">
                <a
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full flex-col border border-on-ink-line p-6 transition-colors duration-200 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <div className="flex h-10 items-center justify-between">
                    <div className="relative h-7 w-32">
                      {e.logo ? (
                        <Image src={e.logo} alt="" fill sizes="128px" className="object-contain object-left opacity-80" />
                      ) : (
                        <span aria-hidden className="flex h-7 w-7 items-center justify-center border border-on-ink-line text-sm font-extrabold text-white">{e.project[0]}</span>
                      )}
                    </div>
                    <ArrowUpRight size={18} aria-hidden className="text-on-ink-3 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="t-h3 mt-6 text-white">{e.project}</h3>
                  <p className="t-label mt-1 text-on-ink-3">{e.client}</p>
                  <p className="t-body mt-4 flex-1 text-on-ink-2">{e.summary}</p>
                  <p className="t-label mt-6 flex items-center gap-2 text-on-ink-2">
                    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                    {since && <span className="text-on-ink-3">· {since}</span>}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
                    {e.tags.map((t) => (
                      <li key={t} className="t-label border border-on-ink-line px-2.5 py-1 text-on-ink-2">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <span className="sr-only">(opens {e.project} in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
