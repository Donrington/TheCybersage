'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TESTIMONIALS } from '@/content/testimonials';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Corners } from '@/components/ui/Corners';

const N = TESTIMONIALS.length;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Testimonials as numbered exhibits: the screenshot is the proof, so it leads inside a framed plate; the quote, name and
 * source sit in a caption card beside it. One at a time, with prev/next and a tick per exhibit.
 * Only the visible screenshot is mounted; the next one is warmed by a hidden lazy image.
 */
export function Testimonials() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  const next = TESTIMONIALS[(i + 1) % N];
  const go = (d: number) => setI((v) => (v + d + N) % N);
  const src = t.source === 'Client' ? 'VERIFIED CLIENT' : `VIA ${t.source.toUpperCase()}`;

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" data-theme="dark" className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(3rem,6vw,5.5rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.testimonials.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
          <span className="t-mono hidden text-on-ink-3 sm:inline">SHEET 11 / EXHIBITS · {pad(N)}</span>
        </div>
        <SplitHeading id="testimonials-heading" className="t-h2 max-w-[20ch] text-white" text={SECTIONS.testimonials.heading} />

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12" aria-roledescription="carousel" aria-label="Testimonials">
          <figure key={t.image} className="testimonial-in relative mx-auto w-full max-w-[640px] border border-white/20 bg-[#141414]">
            <figcaption className="t-mono flex items-center justify-between border-b border-white/15 px-4 py-2 text-on-ink-3">
              <span>EXHIBIT {pad(i + 1)} / {pad(N)}</span>
              <span>{t.company.toUpperCase()}</span>
            </figcaption>
            <div className="relative h-[min(60svh,560px)] w-full overflow-hidden">
              <Image
                src={t.image}
                alt={`Screenshot of ${t.name}'s message about working with Abakwe Carrington (${t.company})`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={80}
                loading="lazy"
                className="object-contain object-top"
              />
            </div>
            <Corners />
          </figure>

          <div aria-live="polite" className="relative border border-white/20">
            <Corners />
            <p className="t-mono flex items-center justify-between bg-white px-4 py-2 text-[#0A0A0A]">
              <span>{src}</span>
              <span>{pad(i + 1)} / {pad(N)}</span>
            </p>
            <blockquote className="px-5 pt-6 text-on-ink-1" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', lineHeight: 1.35 }}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="px-5 pt-5 pb-6">
              <p className="text-lg font-extrabold tracking-tight text-white">{t.name}</p>
              <p className="t-mono mt-1 text-on-ink-3">{t.role.toUpperCase()} · {t.company.toUpperCase()}</p>
            </div>
            <div className="flex items-stretch border-t border-white/20">
              <button type="button" style={{ padding: 0 }} onClick={() => go(-1)} aria-label="Previous testimonial" className="nav-tile h-12 w-14 items-center justify-center border-r border-white/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
                <ArrowLeft size={16} aria-hidden className="text-white" />
              </button>
              <button type="button" style={{ padding: 0 }} onClick={() => go(1)} aria-label="Next testimonial" className="nav-tile h-12 w-14 items-center justify-center border-r border-white/20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
                <ArrowRight size={16} aria-hidden className="text-white" />
              </button>
              <div aria-hidden className="flex flex-1 items-center justify-end gap-1.5 px-4">
                {TESTIMONIALS.map((x, n) => (
                  <span key={x.image} className={`block h-px transition-all duration-500 ${n === i ? 'w-8 bg-white' : 'w-4 bg-white/30'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Warm the next screenshot so Next feels instant. */}
        <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
          <Image src={next.image} alt="" width={10} height={10} sizes="640px" quality={80} loading="lazy" />
        </div>
      </div>
    </section>
  );
}
