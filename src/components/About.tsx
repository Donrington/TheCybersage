'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { SECTIONS } from '@/content/site';
import { CERTIFICATIONS } from '@/content/certifications';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Corners } from '@/components/ui/Corners';
import { WordFill } from '@/components/ui/WordFill';
import { useScrollEngine } from '@/lib/useScrollEngine';

const STATS = [
  { label: 'Years of experience', target: 5, suffix: '+' },
  { label: 'Projects shipped', target: 50, suffix: '+' },
  { label: 'Global clients', target: 40, suffix: '+' },
  { label: 'Countries served', target: 8, suffix: '' },
];

/** Counts up once when scrolled into view; shows the final number without JS or with reduced motion. */
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.textContent = '0' + suffix;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / 1600);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, suffix]);
  return (
    <span ref={ref}>
      {target}
      {suffix}
    </span>
  );
}

/**
 * About, rebuilt as a drawing sheet. Left: the quote, the story, links and the numbers. Right: a dossier card with
 * the portrait beside the résumé and certifications (newest first), so the proof sits next to the person.
 */
export function About() {
  const portraitRef = useRef<HTMLDivElement>(null);
  useScrollEngine(portraitRef, { prop: '--portrait' });
  return (
    <section id="about" aria-labelledby="about-heading" data-theme="light" className="w-full border-t border-black/[0.08] bg-[#F5F5F3] text-ink">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(3rem,6vw,5.5rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-canvas-3">{SECTIONS.about.label}</span>
          <span aria-hidden className="h-px flex-1 bg-black/10" />
          <span className="t-mono hidden text-on-canvas-3 sm:inline">SHEET 04 / PROFILE</span>
        </div>
        <SplitHeading id="about-heading" className="t-h2 max-w-[18ch] text-ink" text={SECTIONS.about.heading} />

        <div className="mt-[clamp(2.5rem,5vw,4.5rem)] grid items-start gap-[clamp(2.5rem,5vw,5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Left: story */}
          <div className="flex flex-col gap-10">
            <Reveal>
              <blockquote
                className="relative pt-6 text-ink"
                style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(1.7rem, 2.8vw, 2.7rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
              >
                <span aria-hidden className="absolute top-0 -left-1 text-[4rem] leading-none text-black/15">
                  &ldquo;
                </span>
                I architect systems that don&rsquo;t just work &mdash; they scale, survive failure, and stay clean under pressure.
              </blockquote>
            </Reveal>

            <Reveal className="space-y-4">
              <WordFill
                className="t-lede text-on-canvas-1"
                text="A software engineer based in Lagos, Nigeria — 5+ years designing and running production systems for global clients: multi-tenant compliance platforms, HIPAA medical portals, high-traffic marketplaces. I own the system end-to-end: architecture, infrastructure, backend, delivery."
              />
              <p className="t-body text-on-canvas-2">
                Core: AWS, Docker, Go, Django, PostgreSQL, Redis, CI/CD. Fluent in Next.js for when the system needs a face. I care about the whole system &mdash; not just the feature.
              </p>
            </Reveal>

            <div className="flex gap-3">
              {[
                ['GitHub', 'https://github.com/Donrington'],
                ['LinkedIn', 'https://www.linkedin.com/in/carrington-abakwe-b0b0a0217'],
              ].map(([l, href]) => (
                <a
                  key={l}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group t-mono inline-flex min-h-11 items-center gap-2 border border-black/20 px-4 text-ink uppercase transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  {l}
                  <ArrowUpRight size={13} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: the dossier */}
          <Reveal className="lg:sticky lg:top-24">
            <article aria-label="Profile" className="relative border border-black/20 bg-white">
              <Corners />
              <header className="t-mono flex items-center justify-between bg-[#0A0A0A] px-4 py-2 text-white">
                <span>DOSSIER · ABAKWE CARRINGTON</span>
                <span className="text-white/60">REV 2026</span>
              </header>

              <div className="grid sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                {/* Portrait */}
                <div className="p-4 pr-5 pb-5 sm:p-5 sm:pr-6">
                  <div ref={portraitRef} className="portrait relative aspect-[4/5] w-full bg-black/5">
                    <span className="portrait-clip">
                    <Image
                      src="/me.png"
                      alt="Abakwe Carrington, software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria"
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 28vw"
                      className="portrait-img object-cover object-top"
                    />
                    </span>
                    <span aria-hidden className="portrait-frame" />
                    <span aria-hidden className="t-mono absolute bottom-2 left-2 z-[3] bg-[#0A0A0A] px-2 py-0.5 text-white">
                      FIG. 01 · LAGOS, NG
                    </span>
                  </div>
                </div>

                {/* Résumé + certifications */}
                <div className="flex flex-col border-t border-black/10 sm:border-t-0 sm:border-l">
                  <div className="border-b border-black/10 p-5">
                    <p className="t-mono text-on-canvas-3">RÉSUMÉ · PDF · 2025</p>
                    <p className="mt-2 text-xl font-extrabold tracking-tight text-ink">Infrastructure &amp; Systems Architect</p>
                    <p className="t-body mt-1 text-sm text-on-canvas-2">5+ years · Remote worldwide</p>
                    <p className="t-mono mt-3 text-on-canvas-3">AWS · DOCKER · GO · DJANGO · POSTGRESQL · REDIS</p>
                    <a
                      href="/resume/Abakwe Carrington.pdf"
                      download
                      className="group t-mono mt-4 inline-flex min-h-11 w-full items-center justify-between bg-[#0A0A0A] px-4 text-white uppercase transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      Download résumé
                      <ArrowDownRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                    </a>
                  </div>

                  <div className="flex-1">
                    <p className="t-mono border-b border-black/10 px-5 py-2 text-on-canvas-3">CERTIFICATIONS · {String(CERTIFICATIONS.length).padStart(2, '0')}</p>
                    <ul aria-label="Certifications">
                      {CERTIFICATIONS.map((c) => (
                        <li key={c.title} className="border-b border-black/10 last:border-b-0">
                          <a
                            href={c.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-h-14 items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#0A0A0A] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black"
                          >
                            <span>
                              <span className="block text-sm font-bold text-ink group-hover:text-white">{c.title}</span>
                              <span className="t-mono text-on-canvas-3 group-hover:text-white/60">
                                {c.issuer} · {c.year}
                              </span>
                            </span>
                            <ArrowUpRight size={15} aria-hidden className="shrink-0 text-on-canvas-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                            <span className="sr-only">(opens certificate)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        <dl className="mt-[clamp(2.5rem,5vw,4.5rem)] grid grid-cols-2 border-t border-l border-black/15 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="relative border-r border-b border-black/15 px-4 py-6">
              <dd className="text-[clamp(2.75rem,5vw,4.75rem)] leading-none font-black tracking-tighter text-ink tabular-nums">
                <CountUp target={s.target} suffix={s.suffix} />
              </dd>
              <dt className="t-mono mt-2 text-on-canvas-3 uppercase">{s.label}</dt>
            </div>
          ))}
        </dl>

      </div>
    </section>
  );
}
