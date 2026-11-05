'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

interface RevealProps {
  as?: 'div' | 'section' | 'article' | 'li' | 'p' | 'ul';
  /** Stagger, in ms, added to the transition. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * One-shot fade-and-rise when the element enters the viewport.
 *
 * Visible by default: the server HTML, no-JS visitors and reduced motion all
 * see the final state. After mount, only elements that start BELOW the fold
 * are marked pending, so nothing on the first screen ever blinks out.
 */
export function Reveal({ as = 'div', delay = 0, className, children }: RevealProps) {
  // One concrete tag type for the ref; every allowed tag is an HTMLElement.
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen

    el.dataset.reveal = 'pending';
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.dataset.reveal = 'in';
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
