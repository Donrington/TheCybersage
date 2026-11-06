import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import now from '@/data/now.json';
import { SECTIONS } from '@/content/site';
import { sinceLabel } from '@/components/NowChip';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Corners } from '@/components/ui/Corners';

const STATUS: Record<string, { label: string; dot: string }> = {
  building: { label: 'BUILDING', dot: 'bg-live' },
  beta: { label: 'BETA', dot: 'bg-amber-300' },
  live: { label: 'LIVE', dot: 'bg-white/80' },
};

/** Three active projects as numbered sheet cells, all from src/data/now.json. Edit that file to change this row. */
export function LabRow() {
  const entries = now.entries.slice(0, 3);
  return (
    <section id="lab" aria-labelledby="lab-heading" data-theme="dark" className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,7rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.lab.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
          <span className="t-mono hidden text-on-ink-3 sm:inline">SHEET 08 / IN PROGRESS · {String(entries.length).padStart(2, '0')}</span>
        </div>
        <SplitHeading id="lab-heading" className="t-h2 max-w-[22ch] text-white" text={SECTIONS.lab.heading} />

        <ul className="relative mt-10 grid border-t border-l border-white/15 md:grid-cols-3">
          {entries.map((e, i) => {
            const st = STATUS[e.status] ?? STATUS.live;
            const since = sinceLabel(e.since);
            return (
              <li key={e.id} className="flex border-r border-b border-white/15">
                <a
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-tile w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white" style={{ padding: 0, gap: 0 }}
                >
                  <span className="t-mono flex items-center justify-between border-b border-white/15 px-5 py-2 text-on-ink-3">
                    <span>LAB {String(i + 1).padStart(2, '0')}</span>
                    <span className="flex items-center gap-2 text-on-ink-2">
                      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="flex h-10 items-center justify-between">
                      <span className="relative h-7 w-32">
                        {e.logo ? (
                          <Image src={e.logo} alt="" fill sizes="128px" className="object-contain object-left opacity-80" />
                        ) : (
                          <span aria-hidden className="t-mono flex h-7 w-7 items-center justify-center border border-white/25 text-sm font-extrabold text-white">
                            {e.project[0]}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight size={18} aria-hidden className="text-on-ink-3" />
                    </span>
                    <span className="t-h3 mt-6 text-white">{e.project}</span>
                    <span className="t-mono mt-1 text-on-ink-3">
                      {e.client.toUpperCase()}
                      {since ? ` · ${since.toUpperCase()}` : ''}
                    </span>
                    <span className="t-body mt-4 flex-1 text-on-ink-2">{e.summary}</span>
                    <span className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
                      {e.tags.map((t) => (
                        <span key={t} className="t-mono border border-white/20 px-2.5 py-1 text-on-ink-2 uppercase">
                          {t}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="sr-only">(opens {e.project} in a new tab)</span>
                </a>
              </li>
            );
          })}
          <Corners />
        </ul>
      </div>
    </section>
  );
}
