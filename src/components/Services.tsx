'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '@/content/services';
import { projectById } from '@/content/projects';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';

/**
 * Services: a sticky list on the left, the selected service on the right with one real result and a link
 * to the project it came from. Below 1024px (and without JS) every service is shown in full, no accordion.
 */
export function Services() {
  const [sel, setSel] = useState(0);

  return (
    <section id="services" aria-labelledby="services-heading" data-theme="light" className="border-t border-black/[0.08] bg-white text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,8rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.services.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
        </div>
        <SplitHeading id="services-heading" className="t-h2 max-w-[18ch] text-ink" text={SECTIONS.services.heading} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <nav aria-label="Services" className="hidden lg:block">
            <ul className="sticky top-28 border-t border-black/10">
              {SERVICES.map((s, i) => (
                <li key={s.index} className="border-b border-black/10">
                  <button
                    type="button"
                    onClick={() => setSel(i)}
                    aria-current={i === sel ? 'true' : undefined}
                    className={`flex min-h-16 w-full items-baseline gap-5 py-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                      i === sel ? 'text-ink' : 'text-on-canvas-3 hover:text-ink'
                    }`}
                  >
                    <span className="t-mono shrink-0">{s.index}</span>
                    <span>
                      <span className="block text-xl font-extrabold tracking-tight">{s.title}</span>
                      <span className="t-body mt-0.5 block text-sm">{s.short}</span>
                    </span>
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
                  className="border-t border-black/10 py-8 first:border-t-0 first:pt-0 lg:data-[selected=false]:hidden lg:border-t-0 lg:pt-0 lg:pb-0"
                >
                  <p className="t-label text-on-canvas-3 lg:hidden">
                    <span className="t-mono">{s.index}</span> · {s.short}
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:mt-0 lg:text-4xl">{s.title}</h3>
                  <p className="t-lede mt-5 max-w-[56ch] text-on-canvas-2">{s.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Key skills">
                    {s.keywords.map((k) => (
                      <li key={k} className="t-label border border-black/15 px-3 py-1.5 text-on-canvas-2">
                        {k}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-black/10 pt-5">
                    <p className="t-label text-on-canvas-3">Proof</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{s.proof[1]}</p>
                    {project && (
                      <a
                        href={project.link ?? '/work'}
                        {...(project.link ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="group mt-3 inline-flex min-h-11 items-center gap-2 border-b border-black/30 text-sm font-semibold text-ink transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
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
