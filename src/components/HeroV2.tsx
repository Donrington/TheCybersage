'use client';

import { ArrowDownRight } from 'lucide-react';
import { POSITIONING } from '@/content/site';
import { NowChip } from '@/components/NowChip';
import { HeroField } from '@/components/hero/HeroField';

/**
 * Hero, v2. The name is real text, painted on the first frame (no scramble, no
 * loader in front of it); the network field is WebGL behind it, loaded after
 * first paint. Without WebGL the static poster below IS the background.
 */
export function HeroV2() {
  return (
    <section
      id="top"
      aria-labelledby="hero-name"
      data-theme="dark"
      className="relative flex w-full min-h-[100svh]"
      style={{ isolation: 'isolate', zIndex: 2, padding: 'clamp(4px, 0.6vw, 10px)' }}
    >
      <div
        className="relative flex flex-1 flex-col overflow-hidden bg-[#0A0A0A]"
        style={{ borderRadius: 'clamp(16px, 2vw, 28px)' }}
      >
        {/* Background: static poster (always), WebGL field fades in over it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-poster absolute inset-0" />
          <HeroField />
          {/* Keeps the name and buttons on calm ground whatever the field does. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 85% 75% at 0% 100%, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0) 75%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end px-[clamp(1rem,4vw,5rem)] pt-28 pb-24 sm:pb-[clamp(2.5rem,6vw,6rem)]">
          <p className="t-label text-on-ink-2 mb-[clamp(1.25rem,2.5vw,2.5rem)] flex flex-wrap gap-x-2 gap-y-1">
            <span>Infrastructure &amp; Systems Architect</span>
            <span aria-hidden className="text-on-ink-3">·</span>
            <span>Lagos, Nigeria</span>
            <span aria-hidden className="hidden text-on-ink-3 sm:inline">·</span>
            <span className="hidden sm:inline">Remote worldwide</span>
          </p>

          <h1
            id="hero-name"
            className="font-black leading-[0.88] tracking-tighter text-white"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(3.6rem, 11.5vw, 14rem)' }}
          >
            <span className="hero-line"><span>Abakwe</span></span>
            <span className="hero-line"><span>Carrington</span></span>
          </h1>

          <p
            className="hero-slide mt-[clamp(1rem,2.5vw,2.25rem)] max-w-[34ch] text-on-ink-1"
            style={{
              fontFamily: 'var(--font-instrument), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.35rem, 2.6vw, 2.6rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {POSITIONING}
          </p>

          <div className="hero-fade mt-[clamp(2rem,4vw,3.5rem)] flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#work"
                data-cursor="view"
                className="group inline-flex min-h-11 items-center gap-2 bg-white px-6 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] transition-colors duration-200 hover:bg-white/85"
              >
                View work
                <ArrowDownRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
              <button
                type="button"
                data-cursor="hire"
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="inline-flex min-h-11 items-center border border-white/60 px-6 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
              >
                Contact
              </button>
            </div>

            <NowChip />
          </div>
        </div>
      </div>
    </section>
  );
}
