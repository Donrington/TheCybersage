'use client';

import { useRef } from 'react';
import { useScrollEngine } from '@/lib/useScrollEngine';

/**
 * Scroll-linked colour curtain for a theme flip (storyboard, docs/storyboard.md).
 *
 * Place it between two sections. It takes no height: a 25vh band in the OUTGOING colour hangs over the top of the
 * incoming section and retracts upward as that section rises, finishing by the time the boundary reaches the middle of
 * the screen, so nothing under it is covered while it is being read. The flip reads as one colour wiping over the
 * other instead of a hard edge. No JS and reduced motion: the band is never shown (--curtain defaults to 1).
 */
export function Curtain({ from }: { from: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollEngine(ref, { prop: '--curtain', range: 'enter' });
  return (
    <div ref={ref} aria-hidden className="curtain">
      <div style={{ background: from }} />
    </div>
  );
}
