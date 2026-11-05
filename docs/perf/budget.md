# Performance budget

Measured with Lighthouse 12, mobile preset, against a local production build (`next build && next start`).
Baseline: `docs/perf/baseline.json`. After Prompt 1: `docs/perf/after-1.json`. After Prompt 3: `docs/perf/after-3.json`. After Prompt 4: `docs/perf/after-4.json`.

| Metric | Budget | Baseline (2026-11-05) | After Prompt 1 | After Prompt 3 | After Prompt 4 |
| --- | --- | --- | --- | --- | --- |
| First-view transfer | 1.5 MB or less | 3.82 MB (2.84 MB hero video) | **1.22 MB** ✓ | **641 KB** ✓ (video gone) | **590 KB** ✓ |
| Initial JS (gzipped) | 200 KB or less | 644 KB (largest chunk 364 KB) | not yet re-measured (dynamic imports added; full split is Prompt 2+) | not re-measured (hero no longer imports gsap, animejs or framer-motion) | not re-measured |
| Mobile LCP | 2.5 s or less | 5.8 s | 6.1 s (still the hero `<video>` — fixed in Prompt 3) | 6.1–6.4 s ✗ (see "Prompt 3" below) | 5.0–7.5 s (machine-noise bound, see below) |
| CLS | 0.05 or less | 0.022 | 0.017 | 0 | 0 |
| Total Blocking Time | 300 ms or less | 16,360 ms | 4,030 ms | 1,800–2,010 ms (Prompt 2 build, same session: 3,520–4,610 ms) | 3,010–5,520 ms (Prompt 3 build, same session: 5,630–7,410 ms) |
| TTFB (live, from Lagos) | 300 ms or less | 1.2–4.1 s | unchanged — see "Open decision" below | unchanged | unchanged |
| Page height (desktop) | 18,000 px or less | ~41,000 px | unchanged (Prompt 4/7) | unchanged | Work 23,218 → **7,722 px**; studio mosaic removed |
| WebGL code added per scene | 120 KB gzipped or less | n/a | n/a (Prompt 3+) | **3.4 KB** ✓ (hero field) | 3.4 KB ✓ |

Lighthouse category scores: baseline Performance 32 / A11y 96 / BP 96 / SEO 100 → after Prompt 1
Performance 37 / A11y 96 / BP 96 / SEO 100. The video/image/JS fixes landed cleanly; LCP/TBT/TTFB
stay budget-over until the hero is rebuilt in WebGL (Prompt 3) and `/` can render statically.

## Prompt 3: why LCP is still over budget

The hero is no longer the bottleneck. Observed (unthrottled) FCP and LCP are the same frame: the name and the
positioning line paint together. But that first frame only comes after the browser has parsed and laid out the
whole page: `/` ships **538 KB of HTML** (RSC payload inlined) and **~3,070 DOM elements**, and a
long-animation-frame trace (4x CPU) shows a **1.3 s first frame with no script in it** (parse + style/layout)
before anything paints. Most of that is the 26 pinned project scenes and the sections Prompts 4 and 7 cut, so
re-measure after Prompt 4. Lighthouse on this machine swings ±2 s on LCP/TBT, so the Prompt 2 and Prompt 3 builds
were measured interleaved, twice each.

WebGL: 60 fps on the dev laptop (Iris Xe, D3D11), median and p95 frame 16.7 ms, on both the desktop path
(3,000 points + lines) and the phone path (1,200 points, no lines, dpr 1.5). Software renderers (SwiftShader,
llvmpipe), Save-Data, reduced motion and devices with ≤2 cores or ≤2 GB get the static CSS poster (0 bytes).
Not yet measured on a real mid-range Android.

## Prompt 4: Work cut from 26 scenes to 8

- Home HTML 538 KB → 360 KB, DOM ~3,070 → 2,576 elements, Work section 23,218 → 7,722 px (1440×900).
- Image bytes before the first Work scene: 25–46 KB at all four widths (budget 1 MB). CLS inside Work: 0.
- Interleaved Lighthouse, Prompt 3 vs Prompt 4 builds, same session: main-thread work 45.4 s / 21.0 s vs
  19.3 s / 16.6 s; TBT 7.4 s / 5.6 s vs 5.5 s / 3.0 s.
- LCP is NOT reliably measurable on this laptop: the same build ranged 5.0–7.5 s between back-to-back runs
  (the machine is also running the editor, dev tooling and Chrome). Treat LCP as unverified until it is
  measured on the Vercel preview with PageSpeed Insights, which is part of Prompt 11.

## Open decision: static `/` vs the current CSP nonce

The biggest single lever (TTFB 1.2–4.1 s → sub-100ms, LCP/TBT drop sharply) is making `/` static.
It's blocked by one thing: the CSP nonce. **Tried and reverted** — removing the nonce and using a
static `script-src 'self'` CSP breaks in production: Next.js App Router injects inline
`self.__next_f.push(...)` scripts to stream RSC payloads for hydration, and those get blocked
without a nonce, `'unsafe-inline'`, or a hash allowlist. Measured both ways on this build:

| | TBT | TTI | Speed Index | Transfer |
| --- | --- | --- | --- | --- |
| Static, `'unsafe-inline'` script-src | 1,250–1,420 ms | 5.8–6.2 s | 5.7–8.3 s | 1.19 MB |
| Dynamic, nonce-based CSP (current, shipped) | 4,030 ms | 11.3 s | 14.6 s | 1.22 MB |

Three real options, in order of what's worth trying first:

1. **Next's experimental SRI** (`experimental.sri: { algorithm: 'sha256' }`, Next 16 docs:
   `01-app/02-guides/content-security-policy.md` → "Subresource Integrity (Experimental)"). Docs
   claim it enables static generation with a strict CSP. Not yet verified against App Router's
   inline hydration scripts specifically — worth a spike before the other two.
2. **`'unsafe-inline'` on `script-src`** — Next's own documented pattern for a static CSP without
   nonces. Real trade-off, not a loophole: this site has no user-generated HTML reflected
   unsanitized into the page, and `style-src` already carries `'unsafe-inline'` for the same reason
   (heavy use of inline `style={{}}`). This needs a person's sign-off, not an agent's — it was
   blocked by the safety classifier when tried during this pass, correctly, since it's a real
   security-posture change.
3. **Keep the nonce, accept dynamic rendering** — current state. Most secure, costs the TTFB/TBT
   numbers above. Nothing to change.

## Rules that keep it there

- The home page is statically generated. Nothing in the root layout may call a request-time API
  (`headers()`, `cookies()`, `searchParams`, `connection()`).
- Below-the-fold client code loads with `next/dynamic` and mounts when it nears the viewport.
- One WebGL canvas mounted at a time; render loops pause off-screen and when the tab is hidden; `dpr` capped at 1.5;
  a static poster for reduced motion, Save-Data and low-end devices.
- Every image has dimensions (or `fill` in a sized box) and an honest `sizes`; only the LCP image is preloaded.
- No font size under 12 px; body text contrast 4.5:1 or better.
