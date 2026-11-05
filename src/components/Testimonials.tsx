'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TESTIMONIALS } from '@/content/testimonials';
import { SECTIONS } from '@/content/site';

const N = TESTIMONIALS.length;

/**
 * Testimonials: the screenshot is the proof, so it leads. One at a time, with the quote and name beside it.
 * Only the visible screenshot is mounted; the next one is preloaded by a hidden lazy image.
 */
export function Testimonials() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  const next = TESTIMONIALS[(i + 1) % N];
  const go = (d: number) => setI((v) => (v + d + N) % N);

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" data-theme="dark" className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] py-[clamp(4rem,8vw,8rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.testimonials.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
        </div>
        <h2 id="testimonials-heading" className="t-h2 max-w-[20ch] text-white">
          {SECTIONS.testimonials.heading}
        </h2>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16" aria-roledescription="carousel" aria-label="Testimonials">
          <figure key={t.image} className="testimonial-in relative mx-auto h-[min(70svh,640px)] w-full max-w-[640px] overflow-hidden rounded-[10px] border border-on-ink-line bg-[#141414]">
            <Image
              src={t.image}
              alt={`Screenshot of ${t.name}'s message about working with Abakwe Carrington (${t.company})`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={80}
              loading="lazy"
              className="object-contain object-top"
            />
          </figure>

          <div aria-live="polite" className="flex flex-col gap-6 lg:pt-6">
            <p className="t-label text-on-ink-3">{t.source === 'Client' ? 'Verified client' : `Via ${t.source}`}</p>
            <blockquote className="text-on-ink-1" style={{ fontFamily: 'var(--font-instrument), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', lineHeight: 1.35 }}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-white">{t.name}</p>
              <p className="t-label mt-1 text-on-ink-3">
                {t.role} · {t.company}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="flex h-11 w-11 items-center justify-center border border-on-ink-line text-white transition-colors hover:border-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <ArrowLeft size={16} aria-hidden />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="flex h-11 w-11 items-center justify-center border border-on-ink-line text-white transition-colors hover:border-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <ArrowRight size={16} aria-hidden />
              </button>
              <span className="t-label ml-2 text-on-ink-3">
                {i + 1} of {N}
              </span>
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
