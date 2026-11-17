# Reference study: heronaiapp.com (animation and architecture)

Observed in a live browser on 2026-11-05 (public page, no code copied; the site's own `main.js` is obfuscated and was not read).
Purpose: learn the techniques and rebuild them in our own style (ink / white / off-white, systems-architecture concept).
Do not reuse their artwork, copy, fonts or brand colours.

## Stack (from network + runtime)

Webflow (layout, CSS, interactions) + Lenis 1.1.5 + GSAP 3.12.5 (ScrollTrigger, SplitText, TextPlugin) + Barba
(page transitions) + Swiper + one custom `main.js` served from a separate Netlify site. 41 ScrollTriggers, 233 tweens,
one full-viewport canvas (hero interaction), a CSS `mask-image` pixel mask (`pixel-mask.svg`), fonts: BT Grotesk + Geist Mono.

## The ideas worth taking

1. **Framed viewport.** The page sits inside a thin border; the scroll container is an inner element (`.main-inner`,
   Lenis `wrapper`/`content`), not the window. Corner "+" registration marks and a dashed ruler along the edges.
   It reads as a technical drawing sheet. The whole site commits to one metaphor (architectural drawing).
2. **Loader that draws.** A line drawing of the product's subject builds itself with SVG stroke animation while a thin
   accent line and a `%` counter advance, with mono "terminal" lines appearing. It resolves into the real hero.
3. **Hero hotspots + crosshair.** The hero image has marked hotspots; a crosshair with live px coordinates and a mono
   tooltip follows the cursor ("click and drag your mouse to see ...").
4. **Typography system.** One tight grotesk in uppercase for headlines, one mono for every label and data point,
   hairline rules between cells, a nav built from bordered cells with corner ticks. Very little else.
5. **Scroll as sequence.** The "map" section is 6,300 px (about 7 viewports) of pinned, scrubbed scenes with a small
   captioned panel ("[scroll to continue]") narrating each state. Every other section reveals with the same
   ScrollTrigger recipe: `start: clamp(top bottom+=50%)`, `end: bottom top-=50%`, toggle `play`, with
   SplitText titles scrubbed word-by-word and body text fading in from grey.
6. **Paper grain** over everything; one accent colour used only for hotspots, progress and links.
7. **Barba page transitions** between pages (not needed for a one-page site).

## What we are adopting (and what we are not)

| Technique | Our version |
| --- | --- |
| Framed viewport | Fixed hairline frame + corner crosses + edge ticks, `mix-blend-mode: difference` so it works on ink and white. Window scroll is kept (no inner scroller; it breaks anchors, find-in-page and our sticky stages). |
| Drawing loader | Systems-architecture diagram (seven layers, the Under the Hood stack) that draws itself with a `%` counter. |
| Hero crosshair | Crosshair + live coordinates that follows the cursor; the WebGL field bends under it. |
| Mono spec block | Real facts only: role, base, status, stack. |
| Scroll sequence | Under the Hood already is one; Work gets the same captioned-panel pattern next. |
| Section reveal recipe | One shared offset recipe in `useScrollEngine` / `SplitHeading` (already close). |
| Barba, Webflow, their art and accent colour | Not adopted. |

## Built so far from this study

- Hero: blueprint loader, sheet frame, crosshair + coordinates, mono spec block.
- Navbar (desktop + mobile): bordered cells with index, rolling mono labels, wipe fills and corner ticks; Work/Services mega-panel drawn as a sheet that wipes open and fills its tiles in sequence (FIG. labels, greyscale to colour thumbnails); scroll-spy marker; Escape closes; opens on keyboard focus; mobile full-screen sheet with numbered rows, accordion, mono info block, and the AI launcher hidden while open.
- Work: stats strip of hairline cells, every screenshot is a numbered PLATE with corner ticks and its host in mono (replaces fake browser dots), a caption panel per plate ("PLATE 05 / 08, Next: Wytnest, [SCROLL TO CONTINUE]"), and a right-edge progress ruler that lights the current plate. Content scales to fit short laptop screens (measured at 1440x900, 1366x768, 1280x720, 1024x768).
- Under the Hood: the stack sits in a framed FIG. A sheet with corner ticks and a title block (SHEET / LAYER / SCALE N.T.S.); the side panel is a caption card (white header strip LAYER 04 / 07, result and shipped-in as hairline cells); layer buttons are a hairline strip with 3-letter codes; list version (phones, reduced motion) uses square numbered marks. Film grain no longer uses a blend mode (it cost frame time over animated sections).
- Services (hairline list + framed card with header strip, proof cell and project link), Process (four-cell timeline sheet, step headers with timeframe, ghost numerals, nodes on a top rule), Contact (SHEET 07 tag, hairline info cells with live status dot) and the footer (INDEX / ALL SHEETS grid with wipe tiles, FIG. 99 framed poster in greyscale, the duplicate nav row removed, closing headlines no longer break mid-word).
- Lab (numbered cells with LAB 01 status strips), Testimonials (EXHIBIT plates with corner ticks, caption card with source strip, hairline prev/next and a tick per exhibit), Pricing (RATE SHEET: numbered rows, custom-engagement row filled ink) and FAQ (numbered hairline rows). Every section now carries a SHEET nn tag. Prices and FAQ JSON-LD unchanged and still in sync.

## Second pass, 2026-11-17: hero and the team portrait hover

Captured with REA (headless Chrome, 1440x900, home and `/about-us`), plus the public HTML and stylesheet.
`main.js` is string-array obfuscated; only its selectors were read, no code was reused.

Observed:

- **Hero.** One illustration carries the whole first screen, centred and standing on a ground line, inside the
  framed sheet. Headline, description and CTA sit in a strip below it. The loader resolves into that picture.
- **Team portraits (sketch to photograph).** Each card is two complete, stacked copies: `.about-team-item-inner-bot`
  holds a pen drawing of the person, `.about-team-item-inner-top` holds the black-and-white photograph on an ink
  panel. The top copy starts at `clip-path: inset(100% 0 0)` and on `:hover` (hover-capable, 992px and up) goes to
  `inset(0)` over 0.4 s. The drawing and photograph are separate assets drawn to the same registration, and the
  images are multiplied (`mix-blend-mode: multiply`) into the paper. No canvas, no filter.

Inferred, not observed: the drawings were made from the photographs (they register to the pixel).

What we built from it (`src/components/HeroV2.tsx`, `src/components/hero/*`):

- The portrait is the hero. Two registered layers, `public/hero/portrait-draft.webp` (graphite study) and
  `public/hero/portrait-built.jpg` (photograph), both generated from `public/me.png` and multiplied into the sheet.
- Instead of a hover swap, a vertical rule splits them: drawing on the left, photograph on the right. `--split`
  drives two `clip-path` insets. The rule follows the pointer, drifts when idle, can be dragged on touch, and runs
  out to the left on scroll. Reduced motion gets a static split that still follows the pointer.
- The name runs edge to edge across the figure in `mix-blend-mode: difference`, so it is ink on paper and on the
  drawing and white over the coat. This needs every wrapper between the section and the `<h1>` to stay free of
  stacking contexts (see the comment at the top of the hero CSS).
- Pointing at a word of the name, or tapping it, replays the glyph scramble (`hero/heroScramble.ts`).

Still to do (Prompt 11): final QA, Lighthouse run, page-height trim (target 18,000 px), preview URL.
