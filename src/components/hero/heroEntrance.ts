import { animate, createScope, createTimeline, scrambleText, stagger } from 'animejs';

/**
 * Hero entrance as one anime.js timeline. Loaded with a dynamic import by
 * HeroV2 so none of it lands in the first-load bundle.
 *
 * The sequence is the idea of the sheet played once: the survey grid and the
 * hairlines come up, the portrait is plotted left to right as a line drawing,
 * the name rises letter by letter across it, and then the rule sweeps in from
 * the right and develops the photograph (`onDevelop`, run by hero/heroSplit.ts).
 *
 * The hidden start states live in CSS under `.hero-sheet[data-armed]`, so
 * nothing flashes before this runs. Only transform, opacity, clip-path and the
 * `--rule` custom property (which scales hairlines) are animated, and every
 * inline value is reverted when the timeline ends.
 */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';

export interface HeroEntrance {
  play(): void;
  dispose(): void;
}

export function createHeroEntrance(root: HTMLElement, onDevelop: () => void): HeroEntrance {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
    Array.from(root.querySelectorAll<T>(sel));

  const scope = createScope({ root });
  let timeline: ReturnType<typeof createTimeline> | null = null;

  const scramble = (target: HTMLElement, delay: number) => {
    scope.add(() => {
      animate(target, {
        innerHTML: scrambleText({
          chars: SCRAMBLE_CHARS,
          duration: 620,
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
    const specRows = q('.hero-cell dd:not(:has(.hero-status))');

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
      .add(q('.hero-cell'), { '--rule': [0, 1], duration: 800, delay: stagger(70) }, 260)
      .add(q('.hero-topline > span'), { opacity: [0, 1], translateY: [-6, 0], duration: 700, delay: stagger(80) }, 200)
      // 2. The portrait is plotted left to right, as a drawing.
      .add(
        q('.hero-figure'),
        { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], duration: 1300, ease: 'inOutQuart' },
        280,
      )
      // 3. The name rises out of its masks, one letter after another.
      .add(q('.hero-char'), { translateY: ['112%', '0%'], duration: 1100, delay: stagger(24) }, 460)
      // 4. Role, statement, calls to action.
      .add(q('.hero-kicker'), { opacity: [0, 1], translateY: [14, 0], duration: 800 }, 900)
      .add(q('.hero-positioning'), { opacity: [0, 1], translateY: [18, 0], duration: 900 }, 1000)
      .add(q('.hero-cta, .hero-contact'), { opacity: [0, 1], translateY: [16, 0], duration: 800, delay: stagger(90) }, 1150)
      // 5. The rule arrives and develops the photograph.
      .add(q('.hero-split-ui'), { opacity: [0, 1], duration: 320, ease: 'outQuad' }, 1480)
      .call(onDevelop, 1500)
      // 6. Legend from the right.
      .add(q('.hero-rail > *'), { opacity: [0, 1], translateX: [12, 0], duration: 700, delay: stagger(70) }, 1750)
      // 7. Title block last: cells fade in and the plain values type in.
      .add(q('.hero-cell > *'), { opacity: [0, 1], duration: 600, ease: 'outQuad', delay: stagger(70) }, 2050)
      .call(() => specRows.forEach((el, i) => scramble(el, i * 90)), 2150)
      // Hold the timeline open until the sweep has landed, so the armed state
      // (which keeps the rail hint from pulsing early) lifts with it.
      .add(q('.hero-rail-hint'), { opacity: [1, 1], duration: 400 }, 2900);
  });

  return {
    play() {
      // Two frames so the armed state has painted before anything moves.
      requestAnimationFrame(() => requestAnimationFrame(() => timeline?.play()));
    },
    dispose() {
      scope.revert();
      timeline = null;
    },
  };
}
