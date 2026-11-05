# cybersage.dev redesign (branch `redesign/v2`)

Source: the "cybersage.dev Redesign Audit & Claude Code Prompts" doc (2026-11-05), Prompts 0–11.
The detailed code maps from Prompt 0 are in this folder: `map-sections.md`, `map-performance.md`,
`map-brand.md`, `map-content.md`.

## Brand guardrails (owner's instruction: do not deflect from the brand or colour scheme)

The audit proposed a new palette (bone `#ECE7DC`, electric-lime signal `#C8FF3A`) and a new display face.
Those are **not** adopted. The redesign keeps the existing identity and fixes how it is applied.

| Keep | Value |
| --- | --- |
| Ink (dark base) | `#0A0A0A` |
| Canvas (light base) | `#FFFFFF` |
| Off-white surface | `#F5F5F3` |
| Text on ink | white at 0.94 (primary), 0.72 (secondary), 0.56 (tertiary, still 4.5:1+) |
| Text on canvas | ink at 0.92 / 0.70 / 0.58 |
| Status (only non-neutral colour, already in use) | emerald-400 dot for "live / building" |
| Type | Satoshi (sans, all headings and text), Instrument Serif italic **once** (hero line), system mono for small labels |

What changes is the application: no heading uses the "bold sans + ghosted italic serif word" formula any more,
nothing is smaller than 12 px, every readable text colour clears 4.5:1, sections alternate ink and canvas by
rule, and one easing curve (`cubic-bezier(.2,.7,.2,1)`) replaces the 17 copies of local constants.

## Engineering decisions

- **Static home page.** A per-request CSP nonce (`proxy.ts` + `headers()` in the root layout) made every page
  dynamic and uncacheable: live TTFB 1.2–4.1 s, `Cache-Control: no-store`, rendered in iad1. The CSP moves into
  `next.config.ts` headers so the page can be prerendered and served from the edge.
- **WebGL without three.js.** three + React Three Fiber are ~210 KB gzipped, almost double the audit's 120 KB
  budget per scene. The hero field, the Under the Hood stack and the Contact field share one small WebGL2
  renderer written for this site (a few KB), so three, R3F, drei and postprocessing can leave the bundle.
- **Next.js security upgrade.** 16.2.6 → latest 16.x (16.2.6 carries published advisories, including a
  middleware/proxy bypass).

## Milestones (one commit each)

| # | Prompt | Status |
| --- | --- | --- |
| 0 | Map, baseline, guardrails | done |
| 1 | Performance quick wins | done (cb31456) |
| 2 | Tokens, type reset, shared components | done |
| 3 | Hero (WebGL network field + Now chip) | done (LCP still over budget, see docs/perf/budget.md) |
| 4 | Selected Work 26 → 6–8 flagships + `/work` index | done |
| 5 | Under the Hood, remade as a scroll-driven 3D stack | done |
| 6 | Currently Building → Now chip + Lab row | done (dates in now.json are first-appearance on the site; owner to confirm) |
| 7 | Delete, merge, condense, reorder | done (page 24,246 px at 1440, over the 18,000 target; see notes) |
| 8 | About, Services, Process | done |
| 9 | Testimonials, Pricing, FAQ | done |
| 10 | Contact and footer | |
| 11 | Final pass (Lighthouse, four widths, a11y, metadata) | |

## Open items from Prompt 1 (not fixed — need a decision or dedicated pass)

1. **Static `/` vs the CSP nonce.** See "Open decision" in `docs/perf/budget.md`. The highest-impact
   remaining fix; blocked on a security trade-off only the owner should sign off on.
2. **19 pre-existing ESLint errors**, surfaced by the Next.js 16.4.5 upgrade's stricter
   `react-hooks/*` (React Compiler) rules — not introduced by this redesign, not present in the
   16.2.6 config, and not build-blocking (`next build` succeeds either way). Files: `not-found.tsx`,
   `AIAssistant.tsx`, `ContactCanvas.tsx`, `Credentials.tsx`, `CustomCursor.tsx`, `Stack.tsx`. Rules:
   `react-hooks/immutability`, `react-hooks/set-state-in-effect`, `react-hooks/use-memo`. Worth a
   dedicated pass since these touch files Prompt 2+ will rework anyway (CustomCursor, Credentials).
   Run `npx eslint src` for the current list.

## Prompt 2 notes

- Tokens: `--color-on-ink-1/2/3`, `--color-on-canvas-1/2/3`, `--color-live`, `--ease-sig`, `--dur-fast/base/slow`;
  type classes `.t-display / .t-h2 / .t-h3 / .t-lede / .t-body / .t-label / .t-mono` (12px floor).
- Shared: `src/lib/motion.ts`, `src/lib/useScrollEngine.ts`, `src/components/ui/{Section,Reveal,SplitHeading}.tsx`,
  copy in `src/content/site.ts` (positioning, nav, footer index, every section label + one-statement heading).
- Every section eyebrow is now a plain label (no "NN /" numbering); every heading is one statement in Satoshi.
  Serif kept only for the hero line, About pull quote and testimonial quotes (8–9), Stack/Credentials decor (7).
- Nav: 5 links (Work, Services, About, Pricing, Contact). Back-to-top removed; AI launcher is a 44px icon button;
  custom cursor only when `html.has-custom-cursor` is set (fine pointer, ≥768px, no reduced motion).
- Codemods: 99 sub-12px sizes raised; 80 low-alpha text colours moved to the tertiary tokens (4.5:1+).
- QA (prod build, 1440/1024/768/390): overflow 0, one h1, 0 text <12px, no serif headings, reduced motion leaves
  0 pending reveals. Lint errors 19 → 17 (all pre-existing).


## Prompt 3 notes

- `HeroV2` replaces the video hero. Old `Hero.tsx`, `hero-loop.mp4` and the full-screen `PageLoader` are deleted (the
  loader hid the name for ~2-3 s, which made "readable instantly" impossible). `hero-poster.jpg` stays only because the
  footer CTA still uses it; Prompt 10 replaces that.
- Field: `src/lib/webgl/networkField.ts`, raw WebGL2, 3.4 KB gzipped (no three.js / R3F / detect-gpu). Monochrome:
  off-white points on ink, ~2% brighter pulsing "signal" points (no lime, no bone). Scroll fades toward ink.
- Mount: `src/components/hero/HeroField.tsx` imports the renderer in requestIdleCallback, pauses off-screen and on
  hidden tabs, disposes on unmount, dpr ≤ 1.5. Static CSS poster for reduced motion, Save-Data, software or low-end GPUs.
- Name: real h1 text, CSS line-mask rise (no JS, no scramble). Positioning line from `src/content/site.ts`.
  Now chip from `src/data/now.json` (`since: 2026-06` = when Orion first appeared on the site; owner to confirm).
- Satoshi woff2 is preloaded in the layout head.

## Prompt 4 notes

- `WorkV2` replaces `Projects` (26 pinned cube scenes, GSAP, background canvas). Eight scenes, in order: Anoc.ng,
  RecoverDerm, Circles of Life, NextGen Robotics, Autoboy Express, Wytnest, Winsko Serves, The Black-E. Templates
  rotate (pair, metric, device) so no two neighbours match.
- Desktop: each scene is `position: sticky` for one viewport and the next rises over it (CSS + one `--enter` var from
  useScrollEngine; static under reduced motion). Mobile: plain vertical cards. Images mount within one viewport.
- All project data now lives in `src/content/projects.ts` (`PROJECTS`, `FEATURED`, `VERTICAL_OF`). Roles and
  one-sentence outcomes are condensed from the existing project copy; metrics are only numbers already on the site
  (Anoc zero breaches, RecoverDerm 60%, Circles of Life 4 AI features, NextGen 45%, Autoboy 30%, Winsko 9 pages).
  **Owner to review the role lines.**
- `/work`: all 26 projects, filters by vertical (aria-pressed buttons), linked from the section and the nav's Work
  panel. Replaces the "From the studio" mosaic, which is deleted. Added to the sitemap.
- `public/projects/techhub.png` was 29.9 MB (7592×3188); resized to 1920 wide, 517 KB.

## Prompt 5 notes

- `SystemsStackV2` replaces `SystemsBlueprint` (white block, horizontal stepper, "full chronological history" card:
  all deleted). Layer copy moved verbatim to `src/content/systems.ts`; every proof names its client build.
- **CSS 3D, not R3F/WebGL.** Seven planes are `rotateX(60deg) rotateZ(45deg)` squares with grid fill and edge lines;
  the packet and its short trail move on `transform` from one damped `--pk` value. 0 KB of added JS for the scene
  (budget 80 KB), no second WebGL canvas, crisp at any dpr, and the label leader lines line up exactly because each
  plane's screen geometry is known in CSS.
- Desktop (≥1024px): sticky 100svh stage on ink; scroll moves the packet layer to layer; the active plane brightens;
  the side panel shows layer, decision, result and "Shipped in". The seven numbered buttons are the real navigation
  (`aria-current="step"`, keyboard reachable); clicking scrolls the packet to that layer. The stage is aria-hidden.
- Below 1024px and with reduced motion: a vertical list with all seven layers and proofs; a packet runs down the line
  on an `@property` timeline, paused off-screen by IntersectionObserver. The switch is in CSS, so it is right before
  hydration too.
- Measured (GPU headless Chrome, Iris Xe): frame time median 16.7 ms while scrolling the stage at 1440 and 1024.

## Prompt 7 notes

- Deleted: TechTicker, Built to Scale (Stack), Credentials (incl. the GitHub activity grid; /api/github is now unused), From the Studio (Prompt 4). Credentials content lives in About as `ResumeStrip` (resume card + three certificates).
- Process is a server component: four steps on one horizontal timeline, 705-752 px at 1024-1440 (target ~700). Copy in `src/content/process.ts`.
- Order: Hero, Work, client-logo Marquee, Under the Hood, About, Services, Process, Testimonials, Lab, Pricing, FAQ, Contact. The Marquee ("Trusted by real teams", 50+ products shipped) was not on the delete list, so it stays; say if it should go.
- Page height 24,246 px at 1440 (22,397 at 390), over the 18,000 target. Biggest blocks: Work 7,722 px and the Under the Hood sticky stage (~5,000 px of scroll). Trim candidates for Prompt 11: shorten the stage scroll per layer, one scene per project instead of a full viewport.
- Hero name: the original glyph-scramble reveal and hover replay are back on both lines (animejs). The name stays real text in the server HTML, reduced motion skips it, and the h1 has a fixed aria-label.

## Motion and type, restored after review

- Owner feedback: the redesign had become too plain. Restored: full-screen page loader (hero scramble now starts when it exits), hero rotating light ring, button shine, hero scroll shrink/dim (CSS var, no GSAP).
- Two-voice titles are back: every section title is bold Satoshi with italic Instrument Serif words (mark with *asterisks* in content/site.ts). One SplitHeading component renders them with a word-by-word mask reveal (CSS only).
- New artistic layer, all cheap: oversized sans+italic type band, film grain on dark sections, work screenshots wipe open on scroll.
- This overrides the audit's "serif once" rule by the owner's choice; the budget still applies (measure in Prompt 11).

## Working rules

1. Build each redesigned section as a new component next to the old one (`HeroV2`, `WorkV2`, ...); swap the
   import only when it is finished.
2. Every animation has a reduced-motion path and a no-JS path (final state visible).
3. Check 1440, 1024, 768 and 390 px wide before a milestone is called done; no horizontal overflow.
4. Never invent facts: numbers, clients and claims come from the existing copy or the owner.
