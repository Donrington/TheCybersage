import { SECTIONS } from '@/content/site';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Breath scene between Services and Process (docs/storyboard.md, scene 8): one statement on an empty sheet, so the
 * pacing rests after three dense scenes. No pin; it scrolls like any section.
 */
export function BreathLine() {
  return (
    <section aria-label="Proof" data-theme="light" className="flex min-h-[70svh] items-center justify-center bg-white px-[clamp(1rem,4vw,5rem)] text-ink">
      <Reveal className="text-center">
        <p className="t-h2 mx-auto max-w-[20ch]">{SECTIONS.breath.line}</p>
      </Reveal>
    </section>
  );
}
