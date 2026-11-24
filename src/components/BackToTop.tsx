'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { lenisInstance } from '@/lib/SmoothScroll';
import { sfx } from '@/lib/sound';

/** Appears on the right once you have scrolled a screen or so; takes you to the top in one smooth move. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fn = () => setShow(window.scrollY > window.innerHeight * 0.9);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = () => {
    // Keep section cues and hover ticks quiet through the whole smooth scroll.
    sfx.play('scrollTop', { dur: 1.2 });
    sfx.quiet(1700);
    if (lenisInstance) lenisInstance.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={go}
      aria-label="Back to top"
      data-sound="soft"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className="t-mono fixed right-6 bottom-6 z-50 flex h-12 items-center gap-2 border border-white/20 bg-[#0A0A0A] px-4 text-white uppercase transition-all duration-500 hover:bg-white hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(12px)', pointerEvents: show ? 'auto' : 'none' }}
    >
      Top
      <ArrowUp size={14} aria-hidden />
    </button>
  );
}
