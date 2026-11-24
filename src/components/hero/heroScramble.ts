/**
 * The name's glyph scramble, replayed when a word is pointed at or tapped.
 *
 * Same character set and block cursor as the original effect, but run on the
 * word's own letter spans: every letter keeps its measured width while it
 * cycles, so the word never changes length and nothing around it moves. Letters
 * settle left to right behind a block cursor.
 */
import { sfx } from '@/lib/sound';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@_!∆';
const CURSOR = '█▓▒░';
const STEP = 46; // ms between glyph changes

interface Run {
  raf: number;
  letters: HTMLElement[];
  finals: string[];
}

const runs = new WeakMap<HTMLElement, Run>();
const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

function finish(word: HTMLElement, run: Run) {
  cancelAnimationFrame(run.raf);
  run.letters.forEach((letter, i) => {
    letter.textContent = run.finals[i];
    letter.style.width = '';
  });
  word.removeAttribute('data-scramble');
  runs.delete(word);
}

export function scrambleWord(word: HTMLElement, duration = 760) {
  const running = runs.get(word);
  if (running) finish(word, running);

  const letters = Array.from(word.querySelectorAll<HTMLElement>('.hero-char'));
  if (!letters.length) return;
  const finals = letters.map((letter) => letter.textContent ?? '');
  // Measure first, then write: one layout read for the whole word.
  const widths = letters.map((letter) => letter.getBoundingClientRect().width);
  letters.forEach((letter, i) => {
    letter.style.width = `${widths[i].toFixed(2)}px`;
  });
  word.setAttribute('data-scramble', '');
  // Rate-limited by the engine, so crossing both words is one burst. Silent when the word only slid under a still cursor.
  if (sfx.pointerRecent(250)) sfx.play('glitch');

  const run: Run = { raf: 0, letters, finals };
  runs.set(word, run);

  const start = performance.now();
  let lastStep = -1;
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    if (t >= 1) {
      finish(word, run);
      return;
    }
    const step = Math.floor((now - start) / STEP);
    if (step !== lastStep) {
      lastStep = step;
      // Ease-out, so the first letters lock quickly and the tail lingers.
      const settled = Math.floor((1 - Math.pow(1 - t, 2)) * (letters.length + 1));
      letters.forEach((letter, i) => {
        if (i < settled) letter.textContent = finals[i];
        else if (i === settled) letter.textContent = pick(CURSOR);
        else letter.textContent = pick(GLYPHS);
      });
    }
    run.raf = requestAnimationFrame(frame);
  };
  run.raf = requestAnimationFrame(frame);
}

export function cancelScramble(word: HTMLElement) {
  const running = runs.get(word);
  if (running) finish(word, running);
}
