## Section and architecture map: cybersage.dev (redesign/v2)

### 1. Render order (`src/app/page.tsx`)

- `page.tsx:1` is `'use client'`, so the whole page tree is client-side. There is no `next/dynamic` or `React.lazy` anywhere in `src` (grep finds nothing), so every section and three.js load statically.
- `layout.tsx:618` calls `await headers()` to get the CSP nonce, which makes every request render dynamically. That may explain part of the 1.7s TTFB (unverified).

| # | Audit name | Component (page.tsx line) | Libraries | Background | id |
|---|---|---|---|---|---|
| – | (global) | CustomCursor :61, PageLoader :62, SmoothScroll :63 | framer / gsap / lenis | – | – |
| – | Nav | Navbar :64 | framer, next/image | fixed overlay | – |
| – | SEO article | inline :67-74 | – | sr-only | – |
| 1 | Hero | Hero :76 | gsap+ST (pin), animejs scrambleText, framer; `<video preload="auto">` Hero.tsx:165-175 | video + black radial scrim; transparent padding frame shows body `#FFFFFF` | none |
| 2 | Tech marquee | TechTicker :77 | gsap | `bg-white` | none |
| 3 | About | About :78 | framer, gsap+ST, next/image, ScrollRevealText | `bg-white` | `#about` |
| 4 | Selected Work | Projects :79 | gsap+ST (scrub, no pin; CSS sticky :861), framer, 2D canvas BackgroundCanvas :361-449, ProjectVideo (`<dialog>`) | `#0A0A0A` | `#work` |
| 5 | (Trusted by, a client logo marquee; not in the audit's list) | Marquee :80 (root is a `<div>`) | gsap, next/image, IntersectionObserver | `#0A0A0A` | none |
| 6 | Currently Building | CurrentlyBuilding :81 | framer, next/image | `#0A0A0A` | none |
| 7 | Built to Scale | Stack :82 | framer, IntersectionObserver + rAF | `#0A0A0A` | `#stack` |
| 8 | Services | Services :83 | framer, gsap+ST | `#0A0A0A` | `#services` |
| 9 | Process | Process :84 | framer, ScrollRevealText, next/image, rAF | `#0A0A0A` | `#process` |
| 10 | Under the Hood | SystemsBlueprint :85 (7 `LAYERS`, :25) | framer only. **No 3D today.** | `bg-white` | `#systems` |
| 11 | Credentials | Credentials :86 | framer, gsap+ST, `fetch('/api/github')` :298 | `#0A0A0A` | `#credentials` |
| 12 | Testimonials | Testimonials :87 | framer, gsap+ST, next/image | `#0A0A0A` | `#testimonials` |
| 13 | FAQ | FAQ :88 | framer | `bg-white` | `#faq-section` |
| 14 | Pricing | PricingPromo :89 | framer | `bg-white` | `#pricing` |
| 15 | From the Studio | StudioMarquee :90 | framer, gsap, next/image | `#0A0A0A` | none |
| 16 | Contact + footer | Contact :91 | framer, gsap+ST+SplitText, useSplitReveal, **three + @react-three/fiber** (ContactCanvas :588, dpr 1), next/image | `#0A0A0A` | `#contact` |
| – | – | BackToTop :93, AIAssistant :94 | framer, thinking-orbs, `fetch('/api/chat')` | – | – |

- **Audit discrepancy:** the code has 26 entries in `PROJECTS` (Projects.tsx:15-~276), and `SCENE_COUNT = PROJECTS.length + 1` (:283), which gives 27 scenes. The section height is `27 × 100vh` (`--scene-vh` :853 plus globals.css:201-207). The audit counted 25 scenes, so the live site may be behind this branch (unverified).
- Projects puts both the desktop cube tree (`hidden md:block` :860) and the mobile list (`md:hidden` :1251) in the DOM.
- `HeroCanvas.tsx` (R3F + drei) is never imported. It is dead code.

### 2. Global layer

- **layout.tsx** contains:
  - the Instrument Serif font (:7)
  - the JSON-LD graph: Person, 4× Service, ProfessionalService, WebSite, FAQPage :502, ItemList :549
  - the `llms.txt` link
  - `<Analytics/>`

  None of the client layer is in layout. It all sits in page.tsx.
- **SmoothScroll** (lib/SmoothScroll.tsx):
  - It is skipped below 768px (:16).
  - Lenis config: `duration 1.3`, expo easing (:18).
  - `lenis.on('scroll', ScrollTrigger.update)` (:22).
  - It is driven by the GSAP ticker (:24) with `lagSmoothing(0)` (:25).
  - It exports a mutable singleton `lenisInstance` (:10).
- **PageLoader**:
  - Sets `body overflow:hidden` (:17).
  - Progress eases toward 90%, then completes on window `load`. Minimum 700ms, fallback 6s (:97-98).
  - Exits by sliding panels up (:76-78), then `onDone`.
  - The Hero scramble timeline starts on mount with a 180ms delay (Hero.tsx:40). The loader does not hold it back, so it plays behind the overlay.
- **CustomCursor**: returns null on coarse pointers (:80, :153). Otherwise it renders a dot and a rAF-lagged ring. It reads `data-theme` and `data-cursor` from the nearest ancestor (:101-110).
- **ScrollRevealText**: splits text into word spans and scrubs brightness between `top 88%` and `bottom 55%` (:62-64). Used in About and Process.
- **useSplitReveal**: SplitText by chars, triggers at `top 80%` (:49, :74), and respects reduced motion. Used only in Contact (:456).

### 3. Fixed-position elements (11 declarations)

1. `page.tsx:46` BackToTop, shown when scrollY > 600
2. `Navbar.tsx:492` desktop nav (md+)
3. `Navbar.tsx:559` mobile nav (<md)
4. `CustomCursor.tsx:168` cursor dot
5. `CustomCursor.tsx:190` cursor ring
6. `Process.tsx:220` hover-follow thumbnail (md+, always mounted)
7. `AIAssistant.tsx:271` launcher pill, bottom-left
8. `AIAssistant.tsx:335` backdrop (open state only)
9. `AIAssistant.tsx:347` chat panel (open state only)
10. `Contact.tsx:170` contact modal (open state only)
11. `PageLoader.tsx:109` loader overlay (until done)

The video player in `ProjectVideo.tsx:93` is a native `<dialog>` in the top layer, so it is not in the list. The audit's 7 likely matches items 1-7 at rest on desktop (unverified).

### 4. h1 tags

- `page.tsx:68`: "Abakwe Carrington — Software Engineer & Systems Architect", inside `<article className="sr-only">` (:67).
  - The article also holds 2 `<p>` and 1 `<h2>`: 68 words, about 545 characters.
- `Hero.tsx:239`: visible name "Abakwe / Carrington".
- `not-found.tsx:207` and `api/contact/route.ts:69` (email HTML) are on other routes.

### 5. Nav and footer

- **Navbar links** (`NAV_LINKS` :11-20):

  | Label | href |
  |---|---|
  | Work | `#work` (mega panel) |
  | Services | `#services` (mega panel) |
  | Process | `#process` |
  | About | `#about` |
  | Systems | `#systems` |
  | Credentials | `#credentials` |
  | Reviews | `#testimonials` |
  | FAQ | `#faq-section` |
  | Pricing | `https://cybersage.dev/pricing` |

  - `/pricing` is a Vercel rewrite to `cybersage-pricing.vercel.app` (vercel.json); proxy.ts excludes it.
  - The Work panel uses its own hard-coded `WORK_PREVIEW` of 6 projects with external links (:39-46).
  - The Services panel uses `SERVICES_PREVIEW` of 3 (:28-32).
- **Navbar mobile**:
  - A hamburger (:587) opens a full-screen `bg-black/95` overlay (:626) with expandable panels.
  - The contact CTA dispatches `open-contact-modal` (:656).
  - No body scroll lock was found.
- **Footer** lives inside `Contact.tsx`, nested in `<section id="contact">` (:711):
  - `FooterNavRow` (:407): Work, Services, logo `#`, About, Contact.
  - `FooterCtaBlock` (:479).
  - `FooterBottomBar` (:504): websitelaunches.com link, ©, and socials (GitHub, LinkedIn, X; `SOCIALS` :18), with 0.55rem text.

### 6. What blocks a section-by-section rebuild

1. **Contact modal event:** Hero:310, Navbar:92/170/656 and Process:350 dispatch `window` event `open-contact-modal`. Only Contact.tsx:554 listens, so removing or reworking Contact breaks every CTA.
2. **Lenis singleton:** `lenisInstance` is imported by ProjectVideo.tsx:32/43/48 to stop and start scrolling.
3. **Cursor contract:** sections must carry `data-theme="dark"` and `data-cursor`. Also, globals.css:37-39 sets `cursor:none !important` globally on fine pointers, so it must change together with CustomCursor.
4. **Scroll geometry chain:** the Hero pin with `pinSpacing:true` and snap (Hero.tsx:89-104) plus the 2700vh Projects track shift every downstream ScrollTrigger. There are no `ScrollTrigger.refresh()` calls anywhere. `gsap.registerPlugin` is repeated in 9 files.
5. **Shared global CSS:** `.beam-ring` / `.metal-*` (globals.css:91-195) are used by 9 components, and `.projects-section` (:201) by Projects. Theme tokens are in `@theme` (:20-34). Most components hard-code `#0A0A0A` and Satoshi instead of using the tokens.
6. **Duplicated content to keep in sync:**
   - Nav anchors and footer anchors are hard-coded ids.
   - `WORK_PREVIEW` vs `PROJECTS`.
   - JSON-LD FAQPage vs `FAQS`.
   - layout.tsx:368-398 and :518 say 4 services, but Services.tsx:18 has 5. This is already out of sync.
   - PricingPromo mirrors external pricing data (:9-12).
7. **Client-only shell:** `page.tsx` `'use client'` plus `headers()` in layout. Making any section a server component, or making the page static, means restructuring the page shell first.