'use client';

import { useEffect, useRef } from 'react';
import { useScrollEngine } from '@/lib/useScrollEngine';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Paragraph that fills word by word as it scrolls up the screen (audit Prompt 14).
 *
 * Server HTML, no-JS and reduced motion get the plain, fully-coloured paragraph. After mount the element is marked
 * data-fill and CSS (.word-fill in globals.css) maps the scroll engine's --fill (0 → 1) onto each word's opacity
 * through its --i index. No React state, no animation library: one CSS variable per frame.
 */
export function WordFill({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  useScrollEngine(ref, { prop: '--fill', range: 'enter' });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    el.dataset.fill = '';
    return () => {
      delete el.dataset.fill;
    };
  }, []);

  return (
    <p ref={ref} className={`word-fill ${className ?? ''}`} style={{ ['--n' as string]: words.length }}>
      {words.map((w, i) => (
        <span key={i} style={{ ['--i' as string]: i }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
