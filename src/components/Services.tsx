'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '@/content/services';
import { projectById } from '@/content/projects';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Corners } from '@/components/ui/Corners';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Services as a drawing sheet. Left: a column of hairline cells, the selected one filled. Right: the chosen service in
 * a framed card with its skills and one real result linking to the project it came from. Below 1024px (and without JS)
 * every service shows in full; there is no accordion.
 */
export function Services() {
  const [sel, setSel] = useState(0);

  return (
    <section id="services" aria-labelledby="services-heading" data-theme="light" className="border-t border-black/[0.08] bg-white text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,8rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.services.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
          <span className="t-mono hidden text-on-canvas-3 sm:inline">SHEET 05 / SERVICES · {pad(SERVICES.length)}</span>
        </div>
        <SplitHeading id="services-heading" className="t-h2 max-w-[18ch] text-ink" text={SECTIONS.services.heading} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-0">
          <nav aria-label="Services" className="hidden lg:block">
            <ul className="sticky top-28 border-t border-l border-black/20">
              {SERVICES.map((s, i) => (
                <li key={s.index} className="border-r border-b border-black/20">
                  <button
                    type="button"
                    onClick={() => setSel(i)}
                    aria-current={i === sel ? 'true' : undefined}
                    className={`svc-cell group relative flex min-h-[5.25rem] w-full items-center gap-5 px-5 py-4 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black ${
                      i === sel ? 'bg-[#0A0A0A] text-white' : 'text-ink hover:bg-black/[0.04]'
                    }`}
                  >
                    <span className={`t-mono shrink-0 ${i === sel ? 'text-white/60' : 'text-on-canvas-3'}`}>{s.index}</span>
                    <span className="flex-1">
                      <span className="block text-lg font-extrabold tracking-tight">{s.title}</span>
                      <span className={`t-body mt-0.5 block text-sm ${i === sel ? 'text-white/70' : 'text-on-canvas-3'}`}>{s.short}</span>
                    </span>
                    <ArrowUpRight size={16} aria-hidden className={`shrink-0 transition-all duration-300 ${i === sel ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'}`} />
                    {i === sel && <Corners />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            {SERVICES.map((s, i) => {
              const project = projectById(s.proof[0]);
              return (
                <article
                  key={s.index}
                  data-selected={i === sel}
                  className="svc-card relative border border-black/20 bg-white lg:data-[selected=false]:hidden lg:border-l-0 [&:not(:first-child)]:mt-6 lg:[&:not(:first-child)]:mt-0"
                >
                  <Corners />
                  <p className="t-mono flex items-center justify-between bg-[#0A0A0A] px-5 py-2 text-white">
                    <span>SERVICE {s.index} / {pad(SERVICES.length)}</span>
                    <span className="text-white/60">{s.short.toUpperCase()}</span>
                  </p>
                  <div className="p-6 lg:p-8">
                    <h3 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">{s.title}</h3>
                    <p className="t-lede mt-5 max-w-[56ch] text-on-canvas-2">{s.body}</p>
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Key skills">
                      {s.keywords.map((k) => (
                        <li key={k} className="t-mono border border-black/20 px-3 py-1.5 text-on-canvas-2 uppercase">
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid border-t border-black/20 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="px-6 py-4 lg:px-8">
                      <p className="t-mono text-on-canvas-3">PROOF</p>
                      <p className="mt-1 text-lg font-semibold text-ink">{s.proof[1]}</p>
                    </div>
                    {project && (
                      <a
                        href={project.link ?? '/work'}
                        {...(project.link ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="group t-mono flex min-h-14 items-center justify-between gap-3 border-t border-black/20 bg-[#0A0A0A] px-6 text-white uppercase transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black sm:border-t-0 sm:border-l"
                      >
                        {project.name}
                        <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        {project.link && <span className="sr-only">(opens in a new tab)</span>}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
