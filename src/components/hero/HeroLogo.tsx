'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { sfx } from '@/lib/sound';

/**
 * The CyberSage mark in the hero legend, with a current running through it.
 *
 * One SVG filter does all of it, applied to the logo itself, so the effect is
 * made of the logo's own strokes rather than an overlay:
 *   - a noise field that only varies down the image shears each row sideways, so
 *     the hexagon and its circuit nodes ripple like a signal on a bad line;
 *   - a second, counter-displaced copy of the strokes, tinted with the site's
 *     live-status green, trails the first and only shows when the current surges.
 *
 * Idle: a slow, soft wave and now and then a short surge, like a flicker on a
 * live wire. Hover: the wave tightens and speeds up, the noise re-seeds every
 * few frames and the whole mark shivers. All of it is attribute writes on the
 * filter in one rAF loop; React never re-renders. The loop sleeps while the
 * logo is off screen (the legend is hidden below 1200px) and does not run at
 * all under reduced motion, where the logo stays still and unfiltered.
 *
 * Sound follows the same energy: a zap when the mouse arrives, then a hum at the
 * eased level (so it fades out with the shiver). The idle sway and surges are
 * silent, and there is no sound where there is no loop.
 */
const GREEN = '0.063 0.725 0.506'; // #10B981, as 0-1 floats

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function HeroLogo() {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const main = useRef<SVGFEDisplacementMapElement>(null);
  const ghost = useRef<SVGFEDisplacementMapElement>(null);
  const tint = useRef<SVGFEColorMatrixElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const shell = img.current;
    const t = turb.current;
    const m = main.current;
    const g = ghost.current;
    const c = tint.current;
    if (!el || !shell || !t || !m || !g || !c) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let visible = false;
    let hover = false;
    let energy = 0; // 0 idle, 1 hovered; eased
    let last = 0;
    let nextSurge = 1800 + Math.random() * 1600;
    let surgeStart = 0;
    let surgeLen = 0;
    let seedAt = 0;
    let seed = 3;
    let dx = 0;
    let dy = 0;

    shell.style.filter = 'url(#hero-logo-fx)';

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(64, now - (last || now));
      last = now;

      // Hover charges the current quickly and lets it drain slowly.
      energy += ((hover ? 1 : 0) - energy) * (1 - Math.exp(-dt / (hover ? 110 : 420)));
      sfx.buzz(energy);

      // A surge: a short burst of tearing now and then while idle.
      if (!hover && now > nextSurge) {
        surgeStart = now;
        surgeLen = 150 + Math.random() * 190;
        nextSurge = now + surgeLen + 2400 + Math.random() * 3600;
      }
      const inSurge = now < surgeStart + surgeLen;
      // Flicker inside the burst so it stutters instead of easing.
      const surge = inSurge ? (Math.random() < 0.28 ? 0.35 : 1) : 0;

      // Noise frequency down the image: a long soft wave at rest, finer bands
      // when the current is up, and sharp tearing in a surge.
      const wave = 0.011 + 0.004 * Math.sin(now / 1150);
      const lively = 0.045 + 0.03 * Math.sin(now / 140);
      const freq = surge ? 0.085 : lerp(wave, lively, energy);

      // Re-seed the noise on a beat while the current is up (the stutter);
      // at rest the field only drifts through the frequency (the wave).
      const beat = energy > 0.2 || surge ? 62 : Infinity;
      if (now - seedAt > beat) {
        seedAt = now;
        seed = 1 + Math.floor(Math.random() * 250);
        t.setAttribute('seed', String(seed));
        // The whole mark shivers with it.
        const shiver = energy * 1.3 + surge * 0.9;
        dx = (Math.random() - 0.5) * 2 * shiver;
        dy = (Math.random() - 0.5) * shiver;
        shell.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      } else if (beat === Infinity && (dx || dy)) {
        dx = dy = 0;
        shell.style.transform = '';
      }

      // How far the rows slide: a gentle sway at rest, hard when the current is up.
      const idleSway = 15 + 6 * Math.sin(now / 900);
      const amp = surge ? 58 * surge : lerp(idleSway, 34 + 14 * Math.sin(now / 90), energy);
      const trail = Math.min(0.8, energy * 0.42 + surge * 0.7);

      t.setAttribute('baseFrequency', `0 ${freq.toFixed(4)}`);
      m.setAttribute('scale', amp.toFixed(1));
      g.setAttribute('scale', (-amp * 1.7).toFixed(1));
      c.setAttribute('values', `0 0 0 0 0.063  0 0 0 0 0.725  0 0 0 0 0.506  0 0 0 ${trail.toFixed(3)} 0`);

      if (visible) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else {
        // The loop is about to sleep, so nothing else would ever lower the hum.
        hover = false;
        energy = 0;
        sfx.buzz(0);
      }
    });
    observer.observe(el);

    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      hover = true;
      sfx.play('zap');
      wake();
    };
    const leave = () => {
      hover = false;
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      sfx.buzz(0);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      shell.style.filter = '';
      shell.style.transform = '';
    };
  }, []);

  return (
    <div ref={wrap} className="hero-logo">
      {/* Zero-size host for the filter; the logo points at it by id. */}
      <svg aria-hidden width="0" height="0" focusable="false" className="hero-logo-defs">
        <defs>
          <filter id="hero-logo-fx" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0 0.011" numOctaves="1" seed="3" result="noise" />
            {/* Keep only the red channel as the horizontal push; pin the rest so rows slide, never stretch. */}
            <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 1" result="rows" />
            <feDisplacementMap ref={main} in="SourceGraphic" in2="rows" scale="15" xChannelSelector="R" yChannelSelector="G" result="body" />
            <feDisplacementMap ref={ghost} in="SourceGraphic" in2="rows" scale="-25" xChannelSelector="R" yChannelSelector="G" result="echo" />
            <feColorMatrix
              ref={tint}
              in="echo"
              type="matrix"
              values={`0 0 0 0 ${GREEN.split(' ')[0]}  0 0 0 0 ${GREEN.split(' ')[1]}  0 0 0 0 ${GREEN.split(' ')[2]}  0 0 0 0 0`}
              result="trail"
            />
            <feMerge>
              <feMergeNode in="trail" />
              <feMergeNode in="body" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div ref={img} className="hero-logo-img">
        <Image
          src="/hero/cybersage-logo.png"
          alt=""
          width={720}
          height={762}
          sizes="160px"
          quality={90}
          className="hero-rail-logo"
        />
      </div>
    </div>
  );
}
