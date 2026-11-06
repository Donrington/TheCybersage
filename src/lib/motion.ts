// The site's one easing curve and three durations. Mirrored as CSS variables
// in globals.css (--ease-sig, --dur-fast/base/slow); keep the two in sync.
// Replaces the 17 local `const EASE = [0.22, 1, 0.36, 1]` copies as sections
// are rebuilt.

/** Fast start, long soft landing. */
export const EASE = [0.2, 0.7, 0.2, 1] as const;
export const EASE_CSS = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
/** GSAP has no cubic-bezier string parser without CustomEase; use this name after registering it. */
export const EASE_GSAP = 'power3.out';

export const DUR = {
  /** Hover, press, colour changes. */
  fast: 0.2,
  /** Most reveals and transitions. */
  base: 0.6,
  /** Large moves: headline line masks, section-level reveals. */
  slow: 1,
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
