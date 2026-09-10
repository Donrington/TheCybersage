'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

/* `scale` compensates for logos with heavy internal whitespace (e.g. square marks) */
const CLIENTS: { name: string; logo: string; scale?: number }[] = [
  { name: 'RecoverDerm', logo: '/logo/ReCoverDerm Logo Varient (White).png' },
  { name: 'Autoboy', logo: '/logo/autoboy.png' },
  { name: 'NextGen', logo: '/logo/NEXTGEN PL (Landscape) WHITE.png' },
  { name: 'Axflo', logo: '/logo/AXFLOOILLOGOWHITE.png' },
  { name: 'Rokeyla', logo: '/logo/RokeylaSecondaryLogoWhite.png' },
  { name: 'Samdus', logo: '/logo/samdus_white.png' },
  { name: 'Anoc', logo: '/logo/anoc.svg' },
  { name: 'AmaniGo', logo: '/logo/amanigo.png', scale: 2 },
  { name: 'Chronos', logo: '/logo/chronos_logo_trans2.png' },
  { name: 'TechHub', logo: '/logo/techwhite.png' },
  { name: 'Chris Cleans', logo: '/logo/chris_con.png' },
  { name: 'Myra Keleher', logo: '/logo/myra_logo.webp' },
  { name: 'Tuan Tling', logo: '/logo/tuantling.png' },
  { name: 'Cybersage', logo: '/logo/logo_white_horizontal.png' },
  { name: 'TQL', logo: '/logo/TQL LOGO 2-01.png' },
  { name: 'Circles of Life Healthcare', logo: '/logo/colhcs_logo_light.png' },
  { name: 'Terryon Fagan', logo: '/logo/terryonfagan.png' },
  { name: 'Judy Golden Tiling', logo: '/logo/judygolden.png' },
  { name: 'The Black-E', logo: '/logo/theblacke.png' },
  { name: 'VER', logo: '/logo/ver.png' },
  { name: 'Wyns Collections', logo: '/logo/wynscollections.webp' },
];

const MID = Math.ceil(CLIENTS.length / 2);
const ROW_A = CLIENTS.slice(0, MID);
const ROW_B = CLIENTS.slice(MID);

/* Same GSAP infinite-tween technique as StudioMarquee.tsx's Row — proven in
   this codebase already, and functionally equivalent to a hand-rolled rAF
   loop (GSAP's own ticker is rAF-driven and frame-rate independent), so
   there's no need for a second, different animation technique living
   alongside the one already used for every other continuous marquee here. */
function Row({
  clients,
  reverse,
  speed,
  onTween,
}: {
  clients: typeof CLIENTS;
  reverse: boolean;
  speed: number;
  onTween: (tween: gsap.core.Tween) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const half = track.scrollWidth / 2;
    // Reverse rows start pre-shifted so they travel the opposite way without
    // ever exposing the gap at the end of the duplicated list.
    gsap.set(track, { x: reverse ? -half : 0 });
    const tween = gsap.to(track, {
      x: reverse ? 0 : -half,
      duration: half / speed,
      ease: 'none',
      repeat: -1,
    });
    onTween(tween);

    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reverse, speed]);

  const items = [...clients, ...clients, ...clients];

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ gap: 'clamp(0.6rem, 1.4vw, 1.25rem)' }}
      >
        {items.map((client, i) => (
          <div
            key={`${client.name}-${i}`}
            className="relative shrink-0 flex items-center justify-center border border-white/8"
            style={{
              width: 'clamp(130px, 15vw, 210px)',
              height: 'clamp(130px, 15vw, 210px)',
              background: 'rgba(255,255,255,0.03)',
              padding: 'clamp(1.25rem, 2.5vw, 2.25rem)',
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={client.logo}
                alt={client.name}
                fill
                loading="lazy"
                sizes="210px"
                className="object-contain opacity-70"
                style={client.scale ? { transform: `scale(${client.scale})` } : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Fixed slots (not push) so a StrictMode dev double-mount overwrites each
  // row's own entry instead of accumulating stale, already-killed tweens.
  const tweensRef = useRef<(gsap.core.Tween | undefined)[]>([]);

  // Pause both rows' tweens while the section is off-screen — a continuous
  // background animation has no reason to keep ticking when nobody can see
  // it. Collected via the Row callback rather than one observer per row.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        for (const tween of tweensRef.current) {
          if (!tween) continue;
          if (entry.isIntersecting) tween.resume();
          else tween.pause();
        }
      },
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      data-theme="dark"
      className="w-full bg-[#0A0A0A] border-t border-white/6 overflow-hidden"
      style={{ paddingTop: 'clamp(3rem,7vw,6rem)', paddingBottom: 'clamp(3rem,7vw,6rem)' }}
    >
      {/* Mobile: heading stacks above the rows in normal flow — the
          gradient-masked overlay trick below needs a wide viewport to read
          as "text over a grid" rather than "text over noise." */}
      <div className="lg:hidden px-[clamp(1.25rem,5vw,5rem)] mb-8 text-center select-none">
        <Heading />
      </div>

      {/* Desktop: heading floats centered over the marquee, masked by a
          horizontal gradient so it darkens the logos directly behind the
          text while the rows near the screen edges stay fully visible —
          the section still reads as a logo grid, not as text with a
          strip of logos peeking out below it. */}
      <div className="relative">
        <div className="flex flex-col" style={{ gap: 'clamp(0.6rem,1.4vw,1.25rem)' }}>
          <Row clients={ROW_A} reverse={false} speed={70} onTween={(t) => { tweensRef.current[0] = t; }} />
          <Row clients={ROW_B} reverse speed={58} onTween={(t) => { tweensRef.current[1] = t; }} />
        </div>

        <div
          className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <div
            className="flex flex-col items-center text-center px-16 py-10"
            style={{
              width: 'clamp(32rem, 46vw, 46rem)',
              background: 'linear-gradient(90deg, transparent, #0A0A0A 15%, #0A0A0A 85%, transparent)',
            }}
          >
            <Heading />
          </div>
        </div>
      </div>

      {/* Screen-reader-only heading, since the visible one above is aria-hidden on desktop */}
      <h2 className="sr-only">Trusted by real teams</h2>
    </div>
  );
}

/* No entrance reveal here, deliberately — every other heading on this site
   slides/fades in on scroll, but this one stays static at full opacity the
   whole time. The perpetual crisscrossing rows are the section's only
   motion; a still, confident headline anchoring a moving background reads
   better than two competing animations. */
function Heading() {
  return (
    <>
      <span
        aria-hidden="true"
        className="font-black text-white"
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 6.5vw, 5.5rem)',
          letterSpacing: '-0.03em',
          lineHeight: 0.88,
          textTransform: 'uppercase',
        }}
      >
        <span className="block">Trusted by</span>
        <span className="block">Real Teams.</span>
      </span>
      <p
        aria-hidden="true"
        className="mt-4"
        style={{
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(0.8rem, 1.1vw, 1rem)',
          letterSpacing: '0.01em',
          color: 'rgba(255,255,255,0.55)',
          maxWidth: '32ch',
        }}
      >
        20+ products shipped — from local businesses to funded startups.
      </p>
    </>
  );
}
