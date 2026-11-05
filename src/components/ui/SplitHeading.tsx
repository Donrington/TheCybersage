'use client';

import { useEffect, useRef } from 'react';

interface SplitHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'p';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Plain text; wrap words in *asterisks* to set them in the italic serif. */
  text: string;
}

/** Splits "I build the *system* behind." into words, flagging the starred ones as italic. */
export function parseTitle(text: string) {
  const words: { w: string; em: boolean }[] = [];
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    const em = part.startsWith('*') && part.endsWith('*') && part.length > 2;
    (em ? part.slice(1, -1) : part).split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, em }));
  });
  return words;
}

/** The same title without markers, for aria-labels and metadata. */
export const plainTitle = (text: string) => text.replace(/\*/g, '');

/**
 * Section title in the site's two-voice style: bold Satoshi with italic Instrument Serif words.
 * Every word is real text in the server HTML. After mount, titles below the fold hide their words
 * under a mask and rise in one by one when scrolled into view (CSS transition, no animation library).
 * Reduced motion and no-JS see the finished title.
 */
export function SplitHeading({ as = 'h2', id, className, style, text }: SplitHeadingProps) {
  const Tag = as as 'h2';
  const ref = useRef<HTMLHeadingElement>(null);
  const words = parseTitle(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.dataset.split = 'pending';
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.split = 'in';
        io.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} className={className} style={style}>
      {words.map((x, i) => (
        <span key={i}>
          <span className="wd">
            <span className={x.em ? 'serif-i' : undefined} style={{ ['--i' as string]: i }}>
              {x.w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
