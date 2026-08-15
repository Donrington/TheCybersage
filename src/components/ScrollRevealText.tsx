'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Description/body copy face — titles keep Satoshi. */
export const DESC_FONT =
  "'Segoe UI', 'Segoe UI Variable Text', system-ui, -apple-system, 'Helvetica Neue', sans-serif";

interface Props {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  /** Base colour channels, e.g. '255,255,255' on dark sections, '10,10,10' on light. */
  rgb?: string;
  /** Alpha before a word is reached, and once it is fully lit. */
  from?: number;
  to?: number;
  /**
   * How many words the brightness ramp spans. 1 would snap word-by-word;
   * a handful makes it read as a moving spotlight instead of a toggle.
   */
  spread?: number;
  as?: 'p' | 'div';
}

export function ScrollRevealText({
  children,
  className,
  style,
  rgb = '255,255,255',
  from = 0.16,
  to = 0.92,
  spread = 6,
  as = 'p',
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const words = children.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
    if (!nodes.length) return;

    // Respect reduced-motion: show the copy fully lit, no scroll coupling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => { n.style.color = `rgba(${rgb},${to})`; });
      return;
    }

    const n = nodes.length;
    const st = ScrollTrigger.create({
      trigger: el,
      // Ends before the paragraph leaves the viewport so the last word actually
      // reaches full brightness while still on screen.
      start: 'top 88%',
      end: 'bottom 55%',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate(self) {
        // Head runs past the final word by `spread` so the tail completes.
        const head = self.progress * (n + spread);
        for (let i = 0; i < n; i++) {
          const t = Math.min(1, Math.max(0, (head - i) / spread));
          nodes[i].style.color = `rgba(${rgb},${(from + (to - from) * t).toFixed(3)})`;
        }
      },
    });

    return () => st.kill();
  }, [children, rgb, from, to, spread]);

  const Tag = as;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      style={{ fontFamily: DESC_FONT, fontWeight: 700, ...style }}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          data-word
          // Starts dim inline so SSR paints the correct state before GSAP runs.
          style={{ color: `rgba(${rgb},${from})`, transition: 'none' }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
