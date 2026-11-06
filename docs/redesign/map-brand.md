## (a) Brand spec to preserve

**Tokens (src/app/globals.css)**
- `@theme inline` (:20-34): `--font-sans` Satoshi, `--font-serif` var(--font-instrument), `--font-mono` ui-monospace/JetBrains Mono. Colours: `ink #0A0A0A`, ink-60/40/20/10 (`rgba(10,10,10,.6/.4/.2/.1)`), `canvas #FFFFFF`, `off #F5F5F3`, `dark #0A0A0A`, `on-dark #FFFFFF`.
- Body is `#FFFFFF` with `#0A0A0A` text (:51-56). Selection is inverted (:59). Scrollbar is 2px with an `rgba(10,10,10,.15)` thumb (:63-65).
- Utilities: `.beam-ring` (:91, a conic white arc), `.metal-edge` / `.metal-edge-light` (:112, :168, grey-band chrome rings), `.metal-sheen` (:130), `.metal-highlight(-light)` (:156, :182, follow the pointer). All use the mask-composite ring trick with `@property --beam-angle/--metal-angle` (:80-89).
- Section height: `.projects-section{height:var(--scene-vh)}` at md+ (:201-208). The value is set to `SCENE_COUNT*100vh` (Projects.tsx:851).
- Native cursor is hidden on pointer:fine desktops (:37-39).

**Palette (strict monochrome, stated in Process.tsx:12-18)**

| Role | Value | Freq |
|---|---|---|
| Dark base | `#0A0A0A` (also manifest/themeColor) | 49 hex + 9 `bg-[#0A0A0A]` |
| Light base / text on dark | `#FFFFFF` | 33 |
| Hairlines and surfaces on dark | `rgba(255,255,255,.02–.12)`, `border-white/6–12` | ~80 |
| Dim heading words, labels | `rgba(255,255,255,.18–.32)` | ~45 |
| Secondary copy on dark | white .55–.75 | ~30 |
| Primary copy on dark | white .85–.94 | ~10 |
| Text and lines on light | `text-black/30–70`, `border-black/[0.08]` | ~40 |
| Hero/Navbar blend text | `#D9D9D9` + `mix-blend-mode:difference` (Hero.tsx:232,264,333; Navbar.tsx:68,80) | 5 |

Non-neutral colours appear only in these places:
- `emerald-400` status pings (CurrentlyBuilding.tsx:189-195, Process.tsx:336-337)
- `#7dff7d` and `rgba(160,255,160,.4)` online dot (AIAssistant.tsx:437,442)
- `red-400/50-70` form errors (Contact.tsx:163,166,360)
- Wytnest third-party logo `#5B4FCF` / `#E8960F` (CurrentlyBuilding.tsx:40,50)

**Section tone order (page.tsx:79-93)**
Hero (video card inset 4–10px on the white body, Hero.tsx:137) → TechTicker (L) → About (L) → Work (D) → Marquee (D) → CurrentlyBuilding (D) → Stack (D) → Services (D) → Process (D) → SystemsBlueprint (L) → Credentials (D) → Testimonials (D) → FAQ (L) → Pricing (L) → StudioMarquee (D) → Contact + footer (D).

Dark sections carry `data-theme="dark"`.

**Type**
- **Satoshi Variable** 300–900, normal and italic, self-hosted (globals.css:4-17). `Satoshi-Black.woff2` and `Satoshi-Bold.woff2` in public/fonts are not referenced.
- **Instrument Serif** 400, normal and italic, through next/font as `--font-instrument` (layout.tsx:7-13, 621).
- Weights in use: 900 (22 inline, 25 `font-black`), 800 (17), 700 (11), 400 (20, all serif), 500 (`font-medium` ×58).
- Display headings: 900 weight, tracking -0.03 to -0.05em, line-height 0.88. Eyebrows: 0.6rem, uppercase, tracking 0.22em, `font-medium` Satoshi. **The eyebrows are not mono.** Mono is used only for HUD and index text (Projects.tsx:658,921,1204,1222; Navbar.tsx:145,402; SystemsBlueprint.tsx:180,197,255).

**Heading pattern: bold sans + italic serif word at 0.12–0.32 alpha**

| File:line | Heading | Serif part |
|---|---|---|
| About.tsx:170 | About Me | Me |
| Projects.tsx:1107 / :1293 | Selected Work (desktop / mobile) | Work |
| Stack.tsx:282 | Built to Scale. / Engineered. | the whole 2nd h2 (.12) |
| Services.tsx:322 | What I Build | Build |
| Process.tsx:289 | How I Work | Work |
| SystemsBlueprint.tsx:350 | Under the Hood. | Hood. |
| Credentials.tsx:662 | Proof of Work | Work |
| Testimonials.tsx:221 | Trusted by clients & peers | clients & peers |
| FAQ.tsx:107 | Frequently Asked Questions | Questions |
| PricingPromo.tsx:104 | Transparent Pricing | Pricing |
| StudioMarquee.tsx:155 | From the Studio | Studio |
| Contact.tsx:232 | Start a conversation / Let's talk | conversation / talk |
| not-found.tsx:241 | Page Not Found. | whole subtitle |

Inline serif phrases: Hero.tsx:259 (tagline), CurrentlyBuilding.tsx:127, Process.tsx:344, SystemsBlueprint.tsx:208,282,381, Contact.tsx:262,617, Credentials.tsx:728. Testimonials.tsx:271 uses serif for quotes and About.tsx:67 for the pull quote. Stack.tsx:159 and Credentials.tsx:552 use serif for floating background words.

**Numbered eyebrows**

| Label | Location |
|---|---|
| 00 / Error | not-found:194 |
| 01 / About | About:150 |
| 02 / Work | Projects:905, :1263 |
| 03 / Services | Services:286 |
| 04 / Process | Process:257 |
| 05 / Systems | SystemsBlueprint:323 |
| 06 / Credentials | Credentials:626 |
| 07 / Testimonials | Testimonials:186 |
| 07 / Pricing | PricingPromo:43 |
| 08 / Contact | Contact:602 |
| 09 / FAQ & Answer Engine Index | FAQ:86 |

Unnumbered eyebrows: Stack:235, StudioMarquee:129, Projects:1081, CurrentlyBuilding:198.

**Motion**
- House ease: `[0.22,1,0.36,1]` (expo-out). It is re-declared as `const EASE` in 17 files, used 20× in arrays and 4× as `cubic-bezier`.
- Outlier: `[0.16,1,0.3,1]` (1× array, 1× cubic-bezier).
- GSAP eases: `power3.out`, `power4.inOut`, `power1.inOut`, `none`/linear for scrub. Framer: `easeInOut` ×12.
- Springs: Navbar.tsx:48 (280/32/0.75), CustomCursor.tsx:26-27, AIAssistant.tsx:362.
- Durations cluster at 0.6s (37), 0.7s (20) and 0.3s (13). Reveals are a mask slide-up from `y:'110%'`.
- Lenis: duration 1.3, expo easing (SmoothScroll.tsx:18). Hero uses anime.js `scrambleText` (Hero.tsx:8,40).

**Reduced motion today**
- `useReducedMotion` (a useSyncExternalStore hook that updates live) is used in 12 components.
- 3 components (Marquee, TechTicker, StudioMarquee) use an inline `matchMedia` check instead.
- CSS kills beam/metal animations only (globals.css:189-193).
- `useSplitReveal` honours the setting (useSplitReveal.ts:37).

**Brand assets**
- `public/sage/`: icon-192 / icon-512 / apple-icon (favicon set), `cybersage_og_whatsapp.png` (OG and Twitter, layout.tsx:159,190), and logo lockups `sage_horiz1_white` (Navbar.tsx:524,575, 1.4MB), `sage_prim_white` (PageLoader:130, Contact:426, 1.5MB), plus dark and trimmed variants.
- `src/app/favicon.ico` (9KB). `me.png` is the person image (1.7MB).
- `public/logo/` holds 28 files, mostly client logos and the older `cybersage_*` / `logo_white*` marks; `logo_white_horizontal` is used in Marquee.tsx:22 and `logo_white` in not-found:162.

## (b) Violations to fix

1. **Tokens are bypassed.** The @theme colour and font tokens have 0 class usages. `'Satoshi, system-ui…'` is hardcoded 183 times, `#0A0A0A` is inlined everywhere, and `--color-off #F5F5F3` is unused.
2. **Off-palette near-blacks:**
   - `#0d0d0d` (Contact.tsx:188)
   - `#090909` (AIAssistant.tsx:355)
   - warm `#0e0c0b` (Projects.tsx:1028)
   - `rgba(12,12,12,.92)` (Projects.tsx:473)
   - `#ECEEEE` (Contact.tsx:467)

   Collapse these into the tokens.
3. **Microtext.** 120 font sizes are below 12px, between 7.0px (0.44rem) and 11.7px. By file: Credentials 19, Projects 18, Contact 15, Navbar 12. The 15 worst:

   | File:line | Size | Colour | Text |
   |---|---|---|---|
   | not-found:330 | 7.0px | black/12 | |
   | not-found:349 | 7.0px | black/15 | |
   | Projects:954 | 7.2px | .18 | HUD "OVERVIEW" |
   | Projects:1223 | 7.2px | .20 | |
   | AIAssistant:734 | 7.4px | .12 | "Powered by Claude" |
   | Credentials:487 | 7.7px | /12 | |
   | Credentials:388 | 7.7px | /18 | |
   | Stack:376 | 7.7px | .20 | stat labels |
   | Projects:556 | 7.7px | .28 | tech tags |
   | PageLoader:196 | 8px | .14 | |
   | Credentials:420 | 8px | /22 | GitHub stats |
   | Projects:498 | 8px | .28 | category · year |
   | Testimonials:96 | 8px | /35 | |
   | Projects:902 | 8.3px | .18 | "02 / Work" |
   | Stack:238 | 8.3px | .18 | |

4. **Contrast** (computed WCAG ratio on #0A0A0A: white .30 = 2.6:1, .35 = 3.2:1, .40 = 3.8:1, .45 = 4.5:1, .55 = 6.3:1).
   - **Readable copy below 4.5:1 (31 elements):**
     - Projects:526 taglines .32
     - Services:161 .35, Services:190 .50 (that one passes)
     - Stack:322 .20
     - Contact:269,614 .30, Contact:678 .22
     - Credentials:725 .35
     - Testimonials:302 .40, Testimonials:410 .22
     - AIAssistant:520 .28
   - **Light-section failures:** eyebrows `black/30` = 2.0:1 (About:147, SystemsBlueprint:318, Pricing, FAQ). Also SystemsBlueprint:208,282 at .40 and :348 at .45, About:236 at .35.
   - **Ghosted serif heading words** at .12–.30 are 1.3–2.6:1, which fails even the 3:1 large-text minimum.
5. **Eyebrow numbering is broken.** 07 is used twice, and the DOM order is 09 (FAQ) → 07 (Pricing) → 08 (Contact). It will not survive the restructure; drop or renumber it.
6. **Heading pattern is used 13 times.** Stack also splits one heading across two `<h2>` (Stack.tsx:263/282).
7. **Reduced-motion gaps:**
   - Hero scramble and desktop pin run without a check (Hero.tsx:40,93-94); `reduced` only gates the beam (:156,293).
   - The Projects cube ScrollTrigger is ungated (Projects.tsx:789).
   - Lenis is ungated (SmoothScroll.tsx:18).
   - No check at all in About, Services, Stack, FAQ, PricingPromo, CurrentlyBuilding, PageLoader or CustomCursor.
   - Tailwind `animate-ping` has no `motion-reduce:` variant (CurrentlyBuilding:191, Process:336).
8. **Ease constant duplicated in 17 files.** Centralise it.
9. **Brand asset weight.** Navbar and loader logos are 1.4–1.5MB PNGs, and two Satoshi font files are unused.