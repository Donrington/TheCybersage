'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sfx, type CueName } from '@/lib/sound';

/**
 * Page-wide sound, mounted once in the root layout. Renders nothing; it listens.
 *
 * One set of delegated listeners gives every link, button, tab and summary on every route a hover tick and a press
 * sound without touching each component. Bespoke moments (the loader, the hero, the logo, forms, the assistant)
 * call `sfx.play` themselves.
 *
 * Opt out per element or subtree with data-sound="off". data-sound="primary" gives a call to action the heavier
 * press; data-sound="soft" the light tap.
 *
 * Hover only counts when the pointer actually moved a moment ago. Content sliding under a still cursor during a
 * scroll fires pointerover too, and that must stay silent.
 */
const SEL = 'a[href], button, [role="button"], [role="tab"], [role="switch"], summary, [data-sound]';
const FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]), textarea';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function interactive(e: Event): HTMLElement | null {
  const t = e.target;
  if (!(t instanceof Element)) return null;
  const el = t.closest<HTMLElement>(SEL);
  if (!el || el.closest('[data-sound="off"]')) return null;
  if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return null;
  return el;
}

const panOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return clamp(((r.left + r.width / 2) / window.innerWidth - 0.5) * 1.4, -0.7, 0.7);
};

function pressCue(el: HTMLElement, touch: boolean): CueName {
  const kind = el.closest<HTMLElement>('[data-sound]')?.dataset.sound;
  if (el.matches('button[aria-expanded], [role="button"][aria-expanded]')) {
    return el.getAttribute('aria-expanded') === 'true' ? 'close' : 'open';
  }
  if (el.tagName === 'SUMMARY') {
    const d = el.parentElement;
    return d instanceof HTMLDetailsElement && d.open ? 'close' : 'open';
  }
  if (kind === 'primary') return 'pressPrimary';
  if (kind === 'soft' || touch) return 'tap';
  return 'press';
}

export function SoundLayer() {
  const pathname = usePathname();

  // Page-level listeners, once.
  useEffect(() => {
    sfx.init();
    let lastKey = 0;
    let lastEl: Element | null = null;
    let lastAt = 0;

    const tick = (el: HTMLElement) => {
      const now = performance.now();
      if (el === lastEl && now - lastAt < 300) return;
      lastEl = el;
      lastAt = now;
      sfx.play('hover', { deg: Math.floor(Math.random() * 5), pan: panOf(el) });
    };

    const onMove = () => sfx.notePointer();
    const onOver = (e: PointerEvent) => {
      // A finger landing is the pointer acting (pointerover precedes pointerenter), but touch gets no hover tick.
      if (e.pointerType === 'touch') {
        sfx.notePointer();
        return;
      }
      const el = interactive(e);
      if (!el) return;
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
      if (!sfx.pointerRecent(140) || sfx.isQuiet()) return;
      tick(el);
    };
    // A finger landing might be the start of a scroll, so a touch only sounds when it lifts without having travelled.
    let touch: { id: number; x: number; y: number; at: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        touch = { id: e.pointerId, x: e.clientX, y: e.clientY, at: performance.now() };
        return;
      }
      if (e.button !== 0) return;
      sfx.unlock();
      const el = interactive(e);
      if (!el) return;
      if (el.matches('a[href^="#"]')) sfx.quiet(1300);
      sfx.play(pressCue(el, false));
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      const start = touch;
      touch = null;
      sfx.unlock();
      if (!start || start.id !== e.pointerId) return;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10 || performance.now() - start.at > 700) return;
      const el = interactive(e);
      if (!el) return;
      if (el.matches('a[href^="#"]')) sfx.quiet(1300);
      sfx.play(pressCue(el, true));
    };
    const onCancel = () => {
      touch = null;
    };
    const onKey = (e: KeyboardEvent) => {
      sfx.unlock();
      lastKey = performance.now();
      if (e.repeat) return;
      const t = e.target;
      if (t instanceof Element && t.matches(FIELD) && !t.closest('[data-sound="off"]')) {
        if (e.key.length === 1 || e.key === 'Backspace') sfx.play('key');
        return;
      }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = interactive(e);
      if (!el) return;
      // Space does not follow a link, and Enter on an in-page anchor starts a smooth scroll like a click does.
      if (e.key === ' ' && el.tagName === 'A') return;
      if (e.key === 'Enter' && el.matches('a[href^="#"]')) sfx.quiet(1300);
      sfx.play(pressCue(el, false));
    };
    const onFocus = (e: FocusEvent) => {
      if (performance.now() - lastKey > 500) return;
      const t = e.target;
      if (!(t instanceof Element) || !t.matches(':focus-visible')) return;
      const el = interactive(e);
      if (el && !sfx.isQuiet()) tick(el);
    };
    // iOS only counts touchend and click as a gesture for audio.
    const unlock = () => sfx.unlock();

    document.addEventListener('pointermove', onMove, { capture: true, passive: true });
    document.addEventListener('pointerover', onOver, true);
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onCancel, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('focusin', onFocus, true);
    document.addEventListener('touchend', unlock, { capture: true, passive: true });
    document.addEventListener('click', unlock, true);
    return () => {
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerover', onOver, true);
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onCancel, true);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('focusin', onFocus, true);
      document.removeEventListener('touchend', unlock, true);
      document.removeEventListener('click', unlock, true);
    };
  }, []);

  // A sheet-turn as you cross into the next section; re-armed on every route.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    if (!sections.length) return;
    let current: string | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (id === current) continue;
          const first = current === null;
          current = id;
          // Not on arrival, not while the loader is up, not during a programmatic jump.
          if (first || window.scrollY < 8 || 'loading' in document.documentElement.dataset || sfx.isQuiet()) continue;
          sfx.play('section');
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
