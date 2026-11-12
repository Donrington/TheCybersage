import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '@/content/services';
import { projectById } from '@/content/projects';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Reveal } from '@/components/ui/Reveal';
import { IsoDrawing, type IsoKind } from '@/components/ui/IsoDrawing';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Services as a hairline grid of numbered cards (audit Prompt 14). Each card carries an isometric line drawing that
 * strokes in when the card reveals, the service copy, its skills, and one real result linking to the project it came
 * from. The sixth cell closes the 3×2 grid with a route to Contact. Every service is visible without JS; no accordion.
 */
export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" data-theme="light" className="border-t border-black/[0.08] bg-white text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(3rem,6vw,5.5rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.services.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
          <span className="t-mono hidden text-on-canvas-3 sm:inline">SHEET 05 / SERVICES · {pad(SERVICES.length)}</span>
        </div>
        <SplitHeading id="services-heading" className="t-h2 max-w-[18ch] text-ink" text={SECTIONS.services.heading} />

        <ul className="mt-12 grid border-t border-l border-black/20 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const project = projectById(s.proof[0]);
            return (
              <Reveal as="li" key={s.index} delay={(i % 3) * 80} className="svc-card flex flex-col border-r border-b border-black/20">
                <div className="flex items-center justify-between px-6 pt-5">
                  <span className="t-mono text-ink">[{s.index}]</span>
                  <span className="t-mono text-on-canvas-3 uppercase">{s.short}</span>
                </div>
                <IsoDrawing kind={s.drawing as IsoKind} className="mx-6 mt-6 h-28 w-auto self-start text-ink lg:h-32" />
                <div className="flex flex-1 flex-col px-6 pt-6 pb-6">
                  <h3 className="text-2xl font-extrabold tracking-tight text-ink">{s.title}</h3>
                  <p className="t-body mt-3 text-on-canvas-2">{s.body}</p>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Key skills">
                    {s.keywords.map((k) => (
                      <li key={k} className="t-mono border border-black/20 px-2.5 py-1 text-on-canvas-2 uppercase">
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto border-t border-black/20 px-6 py-4">
                  <p className="t-mono text-on-canvas-3">PROOF</p>
                  <p className="mt-1 font-semibold text-ink">{s.proof[1]}</p>
                  {project && (
                    <a
                      href={project.link ?? '/work'}
                      {...(project.link ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group t-mono mt-3 inline-flex min-h-11 items-center gap-2 text-ink uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      {project.name}
                      <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      {project.link && <span className="sr-only">(opens in a new tab)</span>}
                    </a>
                  )}
                </div>
              </Reveal>
            );
          })}
          <Reveal as="li" delay={160} className="flex flex-col justify-between border-r border-b border-black/20 bg-[#0A0A0A] p-6 text-white">
            <span className="t-mono text-white/60">[{pad(SERVICES.length + 1)}]</span>
            <div className="mt-10">
              <p className="text-2xl font-extrabold tracking-tight">Not sure which one you need?</p>
              <p className="t-body mt-3 text-white/70">Describe the problem. I will tell you which of these it is, or that it is none of them.</p>
              <a
                href="#contact"
                data-magnetic
                className="group t-mono mt-6 inline-flex min-h-11 items-center gap-2 border border-white/40 px-4 uppercase transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start a conversation
                <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}
