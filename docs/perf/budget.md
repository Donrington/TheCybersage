# Performance budget

Measured with Lighthouse 12, mobile preset, against a local production build (`next build && next start`).
Baseline: `docs/perf/baseline.json`. Each redesign milestone saves `after-N.json` next to it.

| Metric | Budget | Baseline (2026-11-05) |
| --- | --- | --- |
| First-view transfer | 1.5 MB or less | 3.82 MB (2.84 MB is the hero video) |
| Initial JS (gzipped) | 200 KB or less | 644 KB (largest chunk 364 KB) |
| Mobile LCP | 2.5 s or less | 5.8 s (LCP element: the hero `<video>`) |
| CLS | 0.05 or less | 0.022 |
| Total Blocking Time | 300 ms or less | 16,360 ms |
| TTFB (live, from Lagos) | 300 ms or less | 1.2–4.1 s (`Cache-Control: no-store`, function in iad1) |
| Page height (desktop) | 18,000 px or less | ~41,000 px |
| WebGL code added per scene | 120 KB gzipped or less | n/a |

Lighthouse category scores at baseline: Performance 32, Accessibility 96, Best Practices 96, SEO 100.

## Rules that keep it there

- The home page is statically generated. Nothing in the root layout may call a request-time API
  (`headers()`, `cookies()`, `searchParams`, `connection()`).
- Below-the-fold client code loads with `next/dynamic` and mounts when it nears the viewport.
- One WebGL canvas mounted at a time; render loops pause off-screen and when the tab is hidden; `dpr` capped at 1.5;
  a static poster for reduced motion, Save-Data and low-end devices.
- Every image has dimensions (or `fill` in a sized box) and an honest `sizes`; only the LCP image is preloaded.
- No font size under 12 px; body text contrast 4.5:1 or better.
