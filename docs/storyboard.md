# Storyboard: cinematic pass (audit Prompt 16, step 1)

Status: **approved 2026-11-12 and built.** Owner decisions: the loader plays on **every reload** (unchanged), and the
rest follows this draft: the audit's sentence for the breath line, curtains on every theme flip, and Under the Hood
trimmed to 16svh per layer (was 21). Deviations while building:
- No vignette: a viewport-fixed vignette needs `background-attachment: fixed` or an extra fixed layer, which repaints
  on every scroll frame. Not worth it at 6%.
- No parallax added to Work plates: they already have a GSAP depth scrub. Parallax went on the About portrait only.
- View Transitions: a page-level fade/rise on every same-origin navigation (`@view-transition`), not a named heading
  morph, because the Work heading is off-screen when "See all" is clicked.
- Curtains: 5, one on every theme flip, including Services/breath → Process.

Rules for every scene: one easing (`--ease-sig`, cubic-bezier(.2,.7,.2,1)). Durations are micro 150 ms, standard 600 ms,
scene 1000–1400 ms, stagger 80 ms. Animate only transform and opacity, with at most three things moving at once.
Under reduced motion every scene cuts straight to its final state and the layout stays identical.

Scroll distances are at 1440×900. "vh" means viewport heights.

## Load sequence

| Beat | Now | Proposed |
| --- | --- | --- |
| Blueprint loader | Every visit: ≥1.9 s hold + 0.9 s exit (≈2.8 s before the hero) | **Once per session** (sessionStorage). Skipped on repeat visits, Save-Data and reduced motion. Hold cut to 1.2 s. |
| Hero entrance (anime.js timeline) | Grid 1.4 s → rules → name lines 420 ms → positioning → plate wipe | Unchanged, but on a repeat visit it starts at first paint. The name is real text from frame one, so LCP is never gated. |
| Nav | Appears with the page | Drops 8 px into place at +600 ms (standard). |
| Ticker / Now chip | With the hero | Last beat, at +1000 ms. |

## Scenes

Theme flips are marked ◐. Each flip gets a **colour curtain**: a 25vh scroll-linked band where the next section's
background wipes up over the last, instead of a hard edge. Pinned sections overlap the next one by 10vh.

| # | Scene | Theme | Entry | Hold | Exit | Density |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hero | light | Load sequence | Name + positioning, about 1vh | Plate shrinks/dims as it scrolls (existing CSS var) | dense |
| 2 | Work, 8 plates | ◐ dark | Curtain (ink rises over canvas) | Each plate sticks 1vh; the next rises over it | Last plate un-pins, Marquee slides under | dense |
| 3 | Client logos | dark | Hard continue (same theme) | Two counter-scrolling rows | Scrolls out | light |
| 4 | Type band | dark | Continue | **Breath.** Oversized type drifts; nothing else moves | Scrolls out | breath |
| 5 | Under the Hood | dark | Stage pins | Packet travels 7 layers, ≈5vh | Un-pins with a 10vh overlap into About | dense |
| 6 | About | ◐ light | Curtain (canvas rises over ink) | Statement fills word by word (WordFill), dossier reveals | Scrolls out | dense |
| 7 | Services | light | Cards reveal in rows of three (80 ms stagger), drawings stroke in 200 ms later | Read | Scrolls out | dense |
| 8 | **New breath** | light → ◐ | One line, centred, 1vh, no pin. Proposed copy (owner to write): *"Every claim here shipped in a real client build."* (the audit's "best sentence") | Read | The curtain into Process starts under it | breath |
| 9 | Process | dark | Curtain | Timeline | Scrolls out | medium |
| 10 | Testimonials | dark | Screenshot slides in (standard) | Read, prev/next | Scrolls out | dense |
| 11 | Lab | dark | Three cards, 80 ms stagger | Read | Scrolls out | light |
| 12 | Pricing | ◐ light | Curtain | Read | Scrolls out | dense |
| 13 | FAQ | light | Rows reveal | details/summary open with height transition | Scrolls out | medium |
| 14 | Contact + footer | ◐ dark | Curtain; network field fades in over scene duration | **Closing breath.** Giant email, then wordmark painting | End | breath |

Pacing check: breath scenes fall at #4, #8 and #14, so there are never more than three dense scenes in a row
(5–7 is the longest run, and #8 now breaks it).

## Depth (site-wide)

- Film grain: already on dark sections. Keep it at ≈4% opacity and extend it to the light sections at 2%.
- Vignette: one fixed radial gradient, 6% at the corners, on dark sections only.
- Parallax at 0.9× / 1× / 1.1×, limited to the **hero plate** (exists), **Work plate images** and **About portrait**.
  Nothing else gets parallax.

## Transitions and micro-interactions

- **View Transitions:** there are no per-project pages yet, so the morph runs on "See all projects" → `/work`: the
  section heading morphs into the /work title. Browsers without support get a 150 ms fade. If per-project pages are
  added later, the plate image → hero image morph slots in the same way.
- **Magnetic pull:** 4–6 px on primary buttons only (Hire me, View work, Start a conversation, Contact CTA).
  Pointer: fine only.
- **Hover:** 120–180 ms everywhere, same curve.
- No sound.

## Questions for the owner

1. Is the loader once per session OK? It currently plays on every visit.
2. The new breath line (#8): use the audit's sentence, or write your own?
3. Curtains on all four ◐ flips, or only the two biggest (Hero → Work, Under the Hood → About)?
4. Page height is 20.7k px at 1920×900 against the 18k budget. The breath line adds about 900 px. Should I claw
   that back elsewhere (e.g. Under the Hood at 0.6vh per layer instead of ≈0.7vh)?
