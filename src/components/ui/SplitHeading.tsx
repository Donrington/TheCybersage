'use client';

import { useEffect, useRef } from 'react';
import { DUR, EASE_CSS, prefersReducedMotion } from '@/lib/motion';

interface SplitHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  id?: string;
  className?: string;
  /** Plain text only. The server renders exactly this string. */
  text: string;
  /** `load` animates on mount (above the fold); `view` when scrolled into view. */
  trigger?: 'load' | 'view';
}

const LINE_STAGGER_MS = 80;

/**
 * Headline whose lines rise out of masks.
 *
 * The server renders plain text, so search engines, no-JS visitors and
 * reduced motion get an ordinary heading. On the client the text is split
 * into lines by measuring where words wrap, each line is masked and rises in,
 * and once the animation finishes the plain text is put back so later
 * resizes reflow naturally. Uses the Web Animations API: no library.
 */
export function SplitHeading({ as = 'h2', id, className, text, trigger = 'view' }: SplitHeadingProps) {
  const Tag = as as 'h2';
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let done = false;
    let lines: HTMLElement[] = [];

    const restore = () => {
      el.textContent = text;
    };

    const split = () => {
      // 1. Wrap each word so we can read where lines break.
      el.textContent = '';
      const words = text.split(/\s+/).filter(Boolean);
      const wordEls = words.map((w, i) => {
        const s = document.createElement('span');
        s.textContent = w + (i < words.length - 1 ? ' ' : '');
        el.appendChild(s);
        return s;
      });

      // 2. Group words by their top offset into lines.
      const groups: string[][] = [];
      let lastTop = Number.NaN;
      for (const s of wordEls) {
        const top = s.offsetTop;
        if (top !== lastTop) {
          groups.push([]);
          lastTop = top;
        }
        groups[groups.length - 1].push(s.textContent ?? '');
      }

      // 3. Rebuild as masked lines, each starting below its mask.
      el.textContent = '';
      lines = groups.map((g) => {
        const mask = document.createElement('span');
        mask.className = 'split-line';
        const inner = document.createElement('span');
        inner.textContent = g.join('');
        inner.style.transform = 'translateY(105%)';
        mask.appendChild(inner);
        el.appendChild(mask);
        return inner;
      });
    };

    const play = () => {
      if (done) return;
      done = true;
      const anims = lines.map((line, i) =>
        line.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], {
          duration: DUR.slow * 1000,
          delay: i * LINE_STAGGER_MS,
          easing: EASE_CSS,
          fill: 'forwards',
        }),
      );
      Promise.all(anims.map((a) => a.finished))
        .then(restore)
        .catch(restore);
    };

    if (trigger === 'load') {
      split();
      // Next frame, so the hidden start state paints before rising.
      const raf = requestAnimationFrame(play);
      return () => {
        cancelAnimationFrame(raf);
        restore();
      };
    }

    // trigger === 'view': headings already on screen are left alone.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    split();

    // If the width changes before the reveal, the measured lines are stale.
    let resizeTimer = 0;
    const onResize = () => {
      if (done) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(split, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      restore();
    };
  }, [text, trigger]);

  return (
    <Tag ref={ref} id={id} className={className}>
      {text}
    </Tag>
  );
}
