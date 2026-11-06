# Performance inventory: cybersage.dev (redesign/v2)

## 1. Why `/` renders dynamically (ƒ)

Two things make the route dynamic, and they work together:
- **`src/app/layout.tsx:618`** calls `await headers()` to read the nonce. This is a request-time API, and because it sits in the root layout, every route becomes dynamic.
- **`src/proxy.ts:4,9,28,34`** creates a nonce on every request (`crypto.randomUUID`) and puts it in the CSP. Next 16 docs (`02-guides/content-security-policy.md` §"Dynamic Rendering Requirement") say nonces force dynamic rendering and turn off static generation, ISR and CDN caching.
- **The proxy matcher (`proxy.ts:42`)** skips only `api|_next/static|_next/image|favicon.ico|pricing`. Every `/public` file goes through the proxy, including `.mp4`, `.png` and `/fonts`.
- **The last local build confirms it.** `.next/prerender-manifest.json` has no `/` entry, and `.next/server/app/` has no `index.html`.
- **Not causes:** there is no `cookies()`, `draftMode()`, `searchParams`, `connection()`, `no-store`, `unstable_noStore`, or `export const dynamic`/`revalidate` anywhere in `src`. The `new Date()` calls at `layout.tsx:472,487` run once at module scope; they would be frozen at build time. `Math.random` appears only inside client effects.
- **Side issue:** the whole page is a client component (`page.tsx:1 'use client'`), so all 17 sections are server-rendered and hydrated on every request.

**Fix:**
1. Delete `layout.tsx:618` and the `nonce` prop at `:626`. JSON-LD (`type="application/ld+json"`) is a data block, so `script-src` does not apply to it.
2. Delete `proxy.ts`, or remove the nonce from it and narrow its matcher.
3. Move the CSP into `next.config.ts` `headers()` using `script-src 'self' 'unsafe-inline'`, or use the docs' `experimental.sri` option. That docs section is marked experimental. Whether its inline-script handling works with an `'unsafe-inline'`-free policy is unverified.
4. Optional ISR: add `export const revalidate = 86400` to `layout.tsx`. `page.tsx` can't take it because it is a client file. This uses the previous caching model, which is valid because `cacheComponents` is not enabled.
5. Check: `next build` should show `○ /`.

## 2. Hero video

- **Single reference** at `Hero.tsx:165-175`: `autoPlay muted loop playsInline preload="auto" poster="/hero_vide_new_poster.jpg"` (`:170-171`) and one `<source src="/hero_vide_new.mp4">` (`:174`).
  - No `fetchPriority`.
  - No `<link rel=preload>` in `layout.tsx:622-630`.
  - No second `<video>` or `<source>` for this file in `src`.
- **Files:**
  - `hero_vide_new.mp4`: 2,904,275 B
  - `hero_vide_new_poster.jpg`: 82,696 B (also used at `Contact.tsx:491`)
- **The moov atom is at the front** (ftyp@0, moov@6594, mdat@14920), so the 3× load is not a moov-at-end refetch.
- **Likely cause of the 3× load (unverified):** Chrome issues several 206 range requests, and `loop` re-requests the file because `.mp4` has no Cache-Control rule. `next.config.ts:52-77` only covers `/fonts`, `/logo`, `*.png` and `*.woff2`. Every range request also goes through the proxy.
- **Load event:** `preload="auto"` holds back `window.load` until the first frame (HTML spec media behaviour). `PageLoader` waits for that load event.

## 3. Images

- **Every `next/image` has either `width`/`height` or `fill`.** The audit's "170 without width/height" are `fill` images, which render without those attributes; the boxes I checked are sized. Raw `<img>` tags appear only in email HTML (`api/contact/route.ts:46,135`).
- **`fill` with no `sizes`** (defaults to 100vw srcset):
  - `CurrentlyBuilding.tsx:203,227,243`
  - `Testimonials.tsx:285`
- **`priority`** (deprecated in Next 16 in favour of `preload`, per the image.md docs):
  - `Navbar.tsx:528` and `:579` load the same 1.40 MB PNG in both the desktop tree (`:492 hidden md:block`) and the mobile tree (`:559 md:hidden`).
  - `PageLoader.tsx:134` loads `sage_prim_white.png`, 1.54 MB.
- **Explicit lazy:** `Marquee.tsx:104`, `StudioMarquee.tsx:95`, `Projects.tsx:643`.
- **Qualities not in the allowlist:** 60 (`Process:240`, `StudioMarquee:96`) and 72 (`Projects:641`) are not in `qualities: [75, 90]`. Snap behaviour is unverified.
- **DOM multipliers:**
  - `Marquee.tsx:77`: 21 logos × 3 = 63 nodes
  - `StudioMarquee.tsx:68`: 36 files × 2 = 72 nodes
  - Projects mobile list: 26 nodes
- **Projects cube** (`SCENE_COUNT = 27` at `:283`, `SWAP_RADIUS = 3` at `:344`): `deriveFaceImages` (`:346`) puts at most 6 face images on screen, 3 at scene 0. They use `quality={90}` and `sizes="… 1400px"` (`:1049-1050`).
- **Mobile list on desktop:** it stays in the DOM (`:1251 md:hidden`, 26 `MobileProjectCard`s at `:1304`), each with a framer `whileInView` observer. They are lazy and `display:none`, so they are probably not downloaded (unverified).
- **Desktop cube on mobile:** it stays mounted (`:860 hidden md:block`). `BackgroundCanvas` runs a 160-dot rAF loop on a 0×0 canvas on phones and never pauses offscreen (`:395,417,441`).
- **Winsko video:** `ProjectVideo` mounts on open with `preload="none"` (`ProjectVideo.tsx:26-29,116`). Good.
- **Why 102 images load up front:** I can't tell from the code; unverified.

## 4. `public/`: 30 largest files

The folder has 127 files totalling 179.1 MB. 37 of them (59.4 MB) are not referenced anywhere in `src`.

| bytes | file | used in src |
|---|---|---|
| 29,920,926 | projects/techhub.png | yes (cube, StudioMarquee, sitemap) |
| 16,092,112 | vid.mp4 | **no** |
| 8,645,249 | videos/winsko-reel.mp4 | yes |
| 6,144,563 | hero_new_16_9.png | **no** |
| 5,660,041 | hero_new_1.png | **no** |
| 3,679,531 | cybersage_new.png | **no** |
| 3,286,158 | videoframe_5511.png | **no** |
| 3,142,605 | projects/samdus1_1.jpg | yes |
| 3,069,374 | exp_cine.mp4 | **no** |
| 2,904,275 | hero_vide_new.mp4 | yes |
| 2,650,487 | cybersage_horiz_new.png | **no** |
| 2,591,208 | projects/axflo.png | yes |
| 2,322,891 | projects/terryonfagan.png | yes |
| 2,270,309 | logo/tuantling.png | yes |
| 2,263,323 | projects/wynscollections.png | yes |
| 2,254,280 | logo/cybersage_horizontal.png | yes (email) |
| 2,235,073 | logo/cybersage_icon.png | yes (email) |
| 2,221,630 | logo/cybersage_logo_primary.png | **no** |
| 2,181,891 | projects/wytnest_hero.png | yes |
| 2,179,249 | sage/sage_horiz1_dark.png | **no** |
| 2,154,075 | projects/anoc.png | yes |
| 2,001,916 | projects/anoc_3.png | yes |
| 1,953,890 | projects/chronos_2.png | yes |
| 1,880,221 | hero_cine.mp4 | **no** |
| 1,776,383 | projects/krkmotors.png | yes |
| 1,764,104 | projects/kicslanding.png | yes |
| 1,746,816 | me.png | yes |
| 1,745,265 | projects/chrisconteras.png | yes |
| 1,689,668 | projects/myrakeleher.png | yes |
| 1,669,232 | logo/chronos_logo_trans2.png | yes |

`techhub.png` is a 30 MB source. The sitemap also lists it raw for image crawlers.

## 5. Fonts

- **Instrument Serif:** `next/font/google` (`layout.tsx:2,7-13`), normal and italic, `swap`. It is self-hosted and preloaded automatically.
- **Satoshi:** `@font-face` in `globals.css:4-16`, variable 300–900, `swap`, no preload.
  - `Satoshi-Variable.woff2`: 42,588 B
  - `Satoshi-VariableItalic.woff2`: 43,844 B
  - `Satoshi-Bold.woff2`: 26,728 B (unused)
  - `Satoshi-Black.woff2`: 24,228 B (unused)
- **License problem:** all 4 Satoshi files are tracked in git (`git ls-files public/fonts`), and origin is `github.com/Donrington/TheCybersage`. They need `git rm` plus a history rewrite to fully remove them from the public repo.

## 6. JavaScript

- **No `next/dynamic` or `React.lazy` anywhere.** Everything is imported statically into the client page.
- **Three.js and @react-three/fiber** are imported by `ContactCanvas.tsx:4`. `Contact.tsx:10` imports it statically and `:588` always renders it, even though it is the bottom section.
- **thinking-orbs** is imported at the top of `AIAssistant.tsx:6` but only used inside the open panel (`:412`).
- **Other libraries pulled in:** gsap with ScrollTrigger and SplitText (`Contact`, `useSplitReveal`), animejs (`Hero`, `not-found`), framer-motion (about 18 files) and lenis.
- **Dead code:** `HeroCanvas.tsx` (drei) is imported nowhere. `@react-three/postprocessing` is installed but unused.
- **Largest chunk:** `.next/static/chunks/0xocsec-zt3oe.js` is 1,311,010 B uncompressed. It contains three, r3f, gsap, framer-motion, animejs, thinking-orbs and lenis.
- **`@anthropic-ai/sdk`** is server-only (`api/chat/route.ts`). Good.

## 7. Config

- **`next.config.ts`:**
  - `reactCompiler`, `compress`, images set to avif/webp, `qualities: [75, 90]`, `deviceSizes` up to 1920.
  - `minimumCacheTTL` is not set, so it uses the 4-hour default.
  - Headers: security headers, plus `immutable` for `/fonts`, `/logo`, `*.png` and `*.woff2`. These are unhashed names, so replacing a file in place leaves returning visitors with the stale copy.
  - No rule for `.mp4`, `.jpg` or `.webp`. No redirects. No experimental flags.
- **`vercel.json`:** only rewrites `/pricing` and `/pricing/:path*` to `cybersage-pricing.vercel.app`.

## Ranked fix list (impact × effort)

1. **Make `/` static** (`layout.tsx:618,626`, `proxy.ts`, CSP moved into `next.config.ts`). High impact, small effort. Should fix most of the 1.7 s TTFB.
2. **Remove the PageLoader gate** (`page.tsx:62`, `PageLoader.tsx:94-97,109`). The page sits behind a fixed z-9999 overlay until `load`, plus a 700 ms minimum and a ~1 s exit animation. High impact, small effort.
3. **Lighten the hero video** (`Hero.tsx:170`):
   - Switch to `preload="metadata"` and start playback after idle.
   - Re-encode to about 1 MB and add a webm source.
   - Use the poster only on mobile.
   - Add an `immutable` header for `.mp4`, `.jpg` and `.webp`, and exclude media from the proxy.

   High impact, small effort.
4. **Recompress the source images:**
   - `techhub.png`, which is 30 MB.
   - The other 1–3 MB PNGs.
   - The 1.4–1.5 MB logos (`Navbar:523/574`, `PageLoader:129`), which should become SVG or small PNGs.

   High impact, small effort.
5. **Code-split heavy components** with `next/dynamic({ ssr: false })` plus an in-view mount:
   - `ContactCanvas` (`Contact.tsx:10,588`)
   - `AIAssistant` and its thinking-orbs import (`page.tsx:24`, `AIAssistant.tsx:6`)
   - `CustomCursor`

   Also delete `HeroCanvas.tsx` and the unused dependencies. High impact, medium effort.
6. **Trim Projects to 6–8 flagships** (`Projects.tsx:283`): the scroll height drops from 2700vh to about 900vh. Also:
   - Lower cube images to quality 75 with a realistic `sizes` value (`:1049-1050`).
   - Pause `BackgroundCanvas` offscreen and on mobile (`:417`).
   - Mount only one of the mobile list (`:1251`) or the cube tree, not both.

   High impact, medium effort.
7. **Make `page.tsx` a server component** with client islands: smaller hydration and static HTML. Medium impact, medium effort.
8. **Cut marquee DOM nodes** (`Marquee.tsx:77`, `StudioMarquee.tsx:68`). Add `sizes` at `CurrentlyBuilding.tsx:203/227/243` and `Testimonials.tsx:285`. Change `priority` to `preload` on the visible Navbar tree only. Medium impact, small effort.
9. **Satoshi:** remove it from the public repo (license), switch to `next/font/local` so it gets preloaded, and drop Bold and Black. License-driven, medium effort.
10. **Delete the 37 unused `public` files** (59.4 MB). This is repo and deploy hygiene only; it won't speed up the page. Small effort.