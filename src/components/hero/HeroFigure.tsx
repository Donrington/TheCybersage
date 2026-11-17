import Image from 'next/image';
import type { Ref } from 'react';

/**
 * The portrait, twice: a draughtsman's line study and the photograph it was
 * traced from, registered to the pixel. `--split` (owned by hero/heroSplit.ts)
 * clips the drawing to the left of the rule and the photograph to the right.
 *
 * Both sources sit on pure white, so the figure is multiplied into the sheet:
 * the survey grid runs straight through it and no cut-out asset is needed. The
 * rule, its tags and its node live in a sibling layer that is not multiplied.
 */
export function HeroFigure({ boxRef, readoutRef }: { boxRef: Ref<HTMLDivElement>; readoutRef: Ref<HTMLSpanElement> }) {
  return (
    <div className="hero-figure-slot">
      <div ref={boxRef} className="hero-figure-box">
        <div className="hero-figure">
          <div className="hero-figure-layer hero-figure-draft" aria-hidden>
            <Image
              src="/hero/portrait-draft.webp"
              alt=""
              fill
              loading="eager"
              sizes="(min-width: 960px) 48vw, 92vw"
              quality={90}
            />
          </div>
          <div className="hero-figure-layer hero-figure-built">
            <Image
              src="/hero/portrait-built.jpg"
              alt="Abakwe Carrington, infrastructure and systems architect. Black-and-white portrait."
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 960px) 48vw, 92vw"
              quality={90}
            />
          </div>
        </div>

        <div className="hero-split-ui" aria-hidden>
          <span className="hero-split-tag hero-split-tag-a">A / Draft</span>
          <span className="hero-split-tag hero-split-tag-b">B / Built</span>
          <span className="hero-split-line" />
          <span className="hero-split-node">
            <i />
            <b ref={readoutRef}>0.50</b>
          </span>
        </div>
      </div>
    </div>
  );
}
