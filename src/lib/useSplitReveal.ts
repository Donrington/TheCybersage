'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useReducedMotion } from './useReducedMotion';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface SplitRevealOptions {
  /** Seconds between each character's start. Default 0.025 (~25ms). */
  stagger?: number;
  /** Seconds each character takes to flip in. Default 0.38. */
  duration?: number;
  /** Extra delay in seconds before the whole line starts. Default 0. */
  delay?: number;
}

/**
 * Per-character 3D flip-up reveal (rotateX 90deg -> 0, opacity 0 -> 1),
 * fired once when the element scrolls into view — never re-triggers on
 * scroll-back-up. Attach the returned ref to the element whose *text
 * content* should be split and animated; SplitText handles wrapping each
 * character in its own span, so pass plain text as children.
 *
 * Accessibility: SplitText's per-character spans are decorative only, so
 * mark the ref'd element aria-hidden and render a separate sr-only sibling
 * with the plain text — this hook doesn't do that for you, since it only
 * owns the one element it's attached to.
 *
 * Respects prefers-reduced-motion: renders at full opacity immediately,
 * no rotation, no scroll trigger.
 */
export function useSplitReveal<T extends HTMLElement>(options: SplitRevealOptions = {}) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const { stagger = 0.025, duration = 0.38, delay = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    const split = new SplitText(el, { type: 'chars' });
    const chars = split.chars as HTMLElement[];

    // preserve-3d on the line itself, so each char's rotateX renders with
    // real depth instead of being flattened by the parent's own compositing
    // — transform-origin at the baseline (50% 100%) makes each character
    // hinge up from its foot like a flap, not spin around its center.
    gsap.set(el, { perspective: 800, transformStyle: 'preserve-3d', opacity: 1 });
    gsap.set(chars, {
      display: 'inline-block',
      transformOrigin: '50% 100%',
      opacity: 0,
      rotateX: 90,
    });

    const ctx = gsap.context(() => {
      gsap.to(chars, {
        opacity: 1,
        rotateX: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out', // decelerate-only, no overshoot — same spirit as the cubic-bezier(0.16,1,0.3,1) curve used elsewhere on this site
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none', // fires once; scrolling back up never reverses or re-triggers it
        },
      });
    }, el);

    return () => {
      ctx.revert();
      split.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, stagger, duration, delay]);

  return ref;
}
