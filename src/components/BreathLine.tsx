'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SECTIONS } from '@/content/site';
import { PROJECTS, VERTICALS } from '@/content/projects';

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, '0');
// The serif word carries the claim; everything else is the sans display face.
const ACCENT = 'shipped';
const WORDS = SECTIONS.breath.line.split(' ');
const NAMES = PROJECTS.map((p) => p.name);

/**
 * Proof scene between Services and Process (docs/storyboard.md, scene 8). A sticky stage held for ~2.5 screens while one
 * scrubbed GSAP timeline plays (Lenis drives ScrollTrigger on desktop; native scroll on touch, same timeline):
 *   1. the claim rises word by word out of masked lines, "shipped" in the serif;
 *   2. the claim lifts and shrinks to a heading; the shipped count runs up and the industries tick in;
 *   3. every shipped project name crosses the stage as one oversized outlined strip, a ruler fills along the bottom.
 * Sticky (not a GSAP pin) so there is no pin-spacer and the layout height is known to CSS.
 * No JS and reduced motion: the stage is not held and everything sits stacked in its final state (.proof without
 * data-cine), so nothing is hidden or overlaps.
 */
export function BreathLine() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      el.dataset.cine = '';
      const q = gsap.utils.selector(el);
      const stage = q('.proof-stage')[0] as HTMLElement;
      const strip = q('.proof-strip-track')[0] as HTMLElement;
      const count = q('.proof-count')[0] as HTMLElement;
      const n = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.fromTo(q('.proof-w'), { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out' })
        .fromTo(q('.proof-rule-top'), { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 0)
        .to({}, { duration: 0.25 }) // hold on the full claim
        .to(q('.proof-line'), {
          y: () => -stage.clientHeight * (innerWidth < 768 ? 0.3 : 0.27),
          scale: innerWidth < 768 ? 0.72 : 0.56,
          duration: 0.5,
          ease: 'power2.inOut',
        })
        .fromTo(q('.proof-stat'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4, ease: 'power3.out' }, '<0.2')
        .to(n, {
          v: PROJECTS.length,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => { count.textContent = pad(Math.round(n.v)); },
        }, '<')
        .fromTo(q('.proof-vert'), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.3 }, '<0.15')
        .fromTo(strip, { x: () => innerWidth }, { x: () => -strip.scrollWidth, duration: 1.6 }, '-=0.3')
        .fromTo(q('.proof-progress'), { scaleX: 0 }, { scaleX: 1, duration: 1.6 }, '<');

      return () => {
        delete el.dataset.cine;
        count.textContent = pad(PROJECTS.length);
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="proof-heading" data-theme="light" className="proof bg-white text-ink">
      <div className="proof-stage">
        <div className="proof-meta t-mono text-on-canvas-3">
          <span>SHEET 05B / PROOF</span>
          <span aria-hidden className="proof-rule-top" />
          <span>{pad(PROJECTS.length)} BUILDS</span>
        </div>

        <h2 id="proof-heading" className="proof-line" aria-label={SECTIONS.breath.line}>
          {WORDS.map((w, i) => (
            <span key={i} aria-hidden className="proof-mask">
              <span className={`proof-w ${w === ACCENT ? 'proof-accent' : ''}`}>{w}</span>
            </span>
          ))}
        </h2>

        <div className="proof-stats">
          <div className="proof-stat">
            <p className="proof-num"><span className="proof-count">{pad(PROJECTS.length)}</span></p>
            <p className="t-mono text-on-canvas-3">PRODUCTS SHIPPED FOR CLIENTS</p>
          </div>
          <div className="proof-stat">
            <p className="proof-num">{pad(VERTICALS.length)}</p>
            <ul className="proof-verts" aria-label="Industries">
              {VERTICALS.map((v) => (
                <li key={v.key} className="proof-vert t-mono">{v.label.toUpperCase()}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="proof-strip" aria-label="Shipped projects">
          <p className="proof-strip-track">
            {NAMES.map((name, i) => (
              <span key={name}>
                {name}
                {i < NAMES.length - 1 && <span aria-hidden className="proof-sep"> / </span>}
              </span>
            ))}
          </p>
        </div>
        <span aria-hidden className="proof-progress" />
      </div>
    </section>
  );
}
