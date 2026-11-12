import { animate, createScope, createTimeline, scrambleText, stagger } from 'animejs';

/**
 * Hero entrance as one anime.js timeline. Loaded with a dynamic import by
 * HeroV2 so none of it lands in the first-load bundle.
 *
 * The hidden start states live in CSS under `.hero-sheet[data-armed]`, so
 * nothing flashes before this runs. Only transform, opacity, clip-path and the
 * `--rule` custom property (which scales hairlines) are animated. The outline
 * hover on CARRINGTON is never touched: no colour or stroke is written here,
 * and every inline value is reverted when the timeline ends.
 */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';

export interface HeroEntrance {
  play(): void;
  replay(target: HTMLElement): void;
  dispose(): void;
}

export function createHeroEntrance(root: HTMLElement, lines: HTMLElement[]): HeroEntrance {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
    Array.from(root.querySelectorAll<T>(sel));

  const scope = createScope({ root });
  let timeline: ReturnType<typeof createTimeline> | null = null;

  const scramble = (target: HTMLElement | undefined, delay = 0, duration = 820) => {
    if (!target) return;
    scope.add(() => {
      animate(target, {
        innerHTML: scrambleText({
          chars: SCRAMBLE_CHARS,
          duration,
          delay,
          perturbation: 0.22,
          cursor: '█▓▒░',
          settleDuration: 260,
        }),
      });
    });
  };

  scope.add(() => {
    const rules = [...q('.hero-topline'), ...q('.hero-titleblock')];
    const spines = q('.hero-specimen-labels');
    const dividers = q('.hero-cell');
    const toplineText = q('.hero-topline > span');
    // The anchor and the contact button, not the magnetic wrapper: that one
    // owns its own inline transform.
    const unique = q('.hero-cta, .hero-contact');
    const specRows = q('.hero-cell dd:not(:has(.hero-status))');
    const cellInner = q('.hero-cell > *');
    const [line1, line2] = lines;

    timeline = createTimeline({
      autoplay: false,
      defaults: { ease: 'outExpo' },
      onComplete: () => {
        // Hand the sheet back to its normal CSS: drop the armed state first so
        // the computed values already match, then clear every inline value.
        root.removeAttribute('data-armed');
        timeline?.revert();
      },
    });

    timeline
      // 1. Survey grid fades up while the hairlines draw from their origins.
      .add(q('.hero-grid-bg'), { opacity: [0, 1], duration: 1400, ease: 'linear' }, 0)
      .add(rules, { '--rule': [0, 1], duration: 1000, delay: stagger(120) }, 0)
      .add(spines, { '--rule': [0, 1], duration: 900 }, 160)
      .add(dividers, { '--rule': [0, 1], duration: 800, delay: stagger(70) }, 260)
      .add(toplineText, { opacity: [0, 1], translateY: [-6, 0], duration: 700, delay: stagger(80) }, 320)
      .add(q('.hero-kicker'), { opacity: [0, 1], duration: 700 }, 380)
      // 2–3. Name lines rise out of their masks; the scramble is the original.
      .add(line1 ?? [], { translateY: ['115%', '0%'], duration: 900 }, 420)
      .call(() => scramble(line1, 0), 560)
      .add(line2 ?? [], { translateY: ['115%', '0%'], duration: 900 }, '-=500')
      .call(() => scramble(line2, 0), '-=780')
      // 4. Tagline, then the CTA row.
      .add(q('.hero-positioning'), { opacity: [0, 1], translateY: [20, 0], duration: 800 }, '-=520')
      .add(unique, { opacity: [0, 1], translateY: [16, 0], duration: 800, delay: stagger(80) }, '-=600')
      // 5. Portrait is revealed top to bottom, then the scan band settles once.
      .add(
        q('.hero-plate'),
        { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], duration: 1100, ease: 'inOutQuart' },
        '-=1000',
      )
      .add(
        q('.hero-plate-glitch'),
        {
          translateY: ['-100%', '720%'],
          translateX: [0, -6, 5, -3, 0],
          opacity: [0, 1, 1, 0],
          duration: 1100,
          ease: 'inOutSine',
        },
        '-=500',
      )
      // 6. Layer rail from the left.
      .add(
        q('.hero-layer'),
        { opacity: [0, 1], translateX: [-14, 0], duration: 650, delay: stagger(60) },
        '-=1100',
      )
      .add(q('.hero-specimen-caption'), { opacity: [0, 1], duration: 700 }, '-=300')
      // 7. Title block last: cells fade in and the plain values type in.
      .add(cellInner, { opacity: [0, 1], duration: 600, ease: 'outQuad', delay: stagger(70) }, '-=700')
      .call(() => specRows.forEach((el, i) => scramble(el, i * 90, 620)), '-=620');
  });

  return {
    play() {
      // Two frames so the armed state has painted before anything moves.
      requestAnimationFrame(() => requestAnimationFrame(() => timeline?.play()));
    },
    replay(target) {
      scramble(target, 0, 700);
    },
    dispose() {
      scope.revert();
      timeline = null;
    },
  };
}
