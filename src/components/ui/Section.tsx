import type { ReactNode } from 'react';

/**
 * Two section themes, alternated by rule (see docs/redesign/README.md):
 * ink = #0A0A0A with white text, canvas = #FFFFFF with ink text.
 * `data-theme="dark"` is the contract CustomCursor reads to invert itself.
 */
export type SectionTheme = 'ink' | 'canvas';

const THEME_CLASS: Record<SectionTheme, string> = {
  ink: 'bg-ink text-on-ink-1',
  canvas: 'bg-canvas text-on-canvas-1',
};

interface SectionProps {
  id?: string;
  theme: SectionTheme;
  /** id of the visible heading that names this section. */
  labelledBy?: string;
  /** Visually hidden name, when the section has no visible heading. */
  label?: string;
  className?: string;
  /** Inner container width. `wide` = 1440px, `prose` = 72ch. */
  width?: 'wide' | 'full' | 'prose';
  children: ReactNode;
}

const WIDTH_CLASS = {
  wide: 'max-w-[1440px] mx-auto px-[clamp(1.25rem,5vw,5rem)]',
  prose: 'max-w-[72ch] mx-auto px-[clamp(1.25rem,5vw,5rem)]',
  full: '',
};

export function Section({ id, theme, labelledBy, label, className = '', width = 'wide', children }: SectionProps) {
  return (
    <section
      id={id}
      data-theme={theme === 'ink' ? 'dark' : 'light'}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={`relative ${THEME_CLASS[theme]} py-[clamp(4.5rem,10vw,9rem)] ${className}`}
    >
      <div className={WIDTH_CLASS[width]}>{children}</div>
    </section>
  );
}

/** Small section label above a heading. Replaces the old "01 / ABOUT" eyebrows. */
export function SectionLabel({ children, theme }: { children: ReactNode; theme: SectionTheme }) {
  return (
    <p className={`t-label mb-5 ${theme === 'ink' ? 'text-on-ink-3' : 'text-on-canvas-3'}`}>{children}</p>
  );
}
