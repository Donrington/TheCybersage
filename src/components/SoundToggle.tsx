'use client';

import { useSyncExternalStore } from 'react';
import { sfx } from '@/lib/sound';
import { Corners } from '@/components/ui/Corners';

/**
 * The one switch for all site sound. Four bars act as the meter: they dance while sound is on and running,
 * sit low while it is waiting for the first tap, and flatten when it is off. Keyboard and screen-reader reachable
 * (a pressed toggle button); it blips when switching on; switching off is an instant, silent mute.
 *
 * variant: "nav" sits in the desktop bar, "mobile" in the phone bar (bars only), "bar" on the plain sub-page bar.
 * It is drawn as one more cell of the bar: hairline left border, mono label, corner ticks on hover.
 */
export function SoundToggle({ variant = 'nav', className = '' }: { variant?: 'nav' | 'mobile' | 'bar'; className?: string }) {
  const status = useSyncExternalStore(sfx.subscribe, sfx.getStatus, () => 'locked' as const);
  const on = status !== 'off';
  return (
    <button
      type="button"
      data-sound="off"
      data-state={status}
      data-variant={variant}
      aria-pressed={on}
      aria-label="Site sound"
      onClick={sfx.toggle}
      className={`snd-toggle ${className}`.trim()}
    >
      <span className="snd-bars" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="snd-label" aria-hidden>{variant === 'nav' ? (on ? 'ON' : 'OFF') : on ? 'SND ON' : 'SND OFF'}</span>
      {variant !== 'mobile' && <Corners />}
    </button>
  );
}
