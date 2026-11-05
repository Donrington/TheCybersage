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
| 1 | Performance quick wins | |
| 2 | Tokens, type reset, shared components | |
| 3 | Hero (WebGL network field + Now chip) | |
| 4 | Selected Work 26 → 6–8 flagships + `/work` index | |
| 5 | Under the Hood, remade as a scroll-driven 3D stack | |
| 6 | Currently Building → Now chip + Lab row | |
| 7 | Delete, merge, condense, reorder | |
| 8 | About, Services, Process | |
| 9 | Testimonials, Pricing, FAQ | |
| 10 | Contact and footer | |
| 11 | Final pass (Lighthouse, four widths, a11y, metadata) | |

## Working rules

1. Build each redesigned section as a new component next to the old one (`HeroV2`, `WorkV2`, ...); swap the
   import only when it is finished.
2. Every animation has a reduced-motion path and a no-JS path (final state visible).
3. Check 1440, 1024, 768 and 390 px wide before a milestone is called done; no horizontal overflow.
4. Never invent facts: numbers, clients and claims come from the existing copy or the owner.
