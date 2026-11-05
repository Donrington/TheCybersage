# Performance budget

Measured with Lighthouse 12, mobile preset, against a local production build (`next build && next start`).
Baseline: `docs/perf/baseline.json`. After Prompt 1: `docs/perf/after-1.json`.

| Metric | Budget | Baseline (2026-11-05) | After Prompt 1 |
| --- | --- | --- | --- |
| First-view transfer | 1.5 MB or less | 3.82 MB (2.84 MB hero video) | **1.22 MB** ✓ |
| Initial JS (gzipped) | 200 KB or less | 644 KB (largest chunk 364 KB) | not yet re-measured (dynamic imports added; full split is Prompt 2+) |
| Mobile LCP | 2.5 s or less | 5.8 s | 6.1 s (still the hero `<video>` — fixed in Prompt 3) |
| CLS | 0.05 or less | 0.022 | 0.017 |
| Total Blocking Time | 300 ms or less | 16,360 ms | 4,030 ms |
| TTFB (live, from Lagos) | 300 ms or less | 1.2–4.1 s | unchanged — see "Open decision" below |
| Page height (desktop) | 18,000 px or less | ~41,000 px | unchanged (Prompt 4/7) |
| WebGL code added per scene | 120 KB gzipped or less | n/a | n/a (Prompt 3+) |

Lighthouse category scores: baseline Performance 32 / A11y 96 / BP 96 / SEO 100 → after Prompt 1
Performance 37 / A11y 96 / BP 96 / SEO 100. The video/image/JS fixes landed cleanly; LCP/TBT/TTFB
stay budget-over until the hero is rebuilt in WebGL (Prompt 3) and `/` can render statically.

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
