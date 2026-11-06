# Content extraction for the rebuilt sections (cybersage-v3, branch redesign/v2)

Page order now (`src/app/page.tsx:76-91`): Hero, TechTicker, About, Projects, Marquee, CurrentlyBuilding, Stack, Services, Process, SystemsBlueprint, Credentials, Testimonials, FAQ, PricingPromo, StudioMarquee, Contact.

Eyebrow numbers clash and are out of order: About "01" (`About.tsx:150`), Work "02" (`Projects.tsx:905,1263`), Services "03" (`Services.tsx:286`), Process "04" (`Process.tsx:257`), Systems "05" (`SystemsBlueprint.tsx:323`), Credentials "06" (`Credentials.tsx:626`), **Testimonials "07"** (`Testimonials.tsx:186`), **Pricing "07"** (`PricingPromo.tsx:43`), Contact "08" (`Contact.tsx:602`), FAQ "09" (`FAQ.tsx:86`). FAQ renders before Pricing and Contact.

---

## 1. Under the Hood — `src/components/SystemsBlueprint.tsx`

- **Heading** (`:342-345`): `Under the` + italic serif `Hood.`
- **Intro** (`:355`): "Seven layers of a production system, and the decision made at each one. Click through — every claim here shipped in a real client build."
- **Data** (`:25-75`): each layer has `label`, `tag`, `principle` and `proof`. There is no separate headline field. The `principle` is the decision. The tag is shown as `NN / {tag}` (`:199`).

| # | Name (`label`) | Tag | Decision (`principle`), verbatim | Proof, verbatim | Client named |
|---|---|---|---|---|---|
| 01 | Edge & Delivery (`:28-31`) | CDN · Web Vitals | "Sub-second loads aren’t an accident — edge caching and Core Web Vitals get tuned before a single feature ships." | "98/100 Lighthouse, sub-1s LCP — KRK Motors, Samdus" | KRK Motors, Samdus |
| 02 | API Gateway (`:35-38`) | Auth · Rate Limiting | "Every public endpoint gets rate-limiting and circuit breakers before it gets a feature." | "Payment APIs stopped cascading-failing entirely — Autoboy Express" | Autoboy Express |
| 03 | Services (`:42-45`) | Go · Django | "Go for throughput, Django for velocity — picked per service, not per habit." | "30% performance gain from re-architecting this layer — NextGen Robotics" | NextGen Robotics |
| 04 | Cache (`:49-52`) | Redis | "I design invalidation before I design the cache." | "30% faster DB responses under peak load — Autoboy Express" | Autoboy Express |
| 05 | Database (`:56-59`) | PostgreSQL | "pg_notify for live sync, rewritten queries for everything else." | "p95 latency cut hard once the slow paths were found — Dejaii" | Dejaii |
| 06 | Access & Compliance (`:63-66`) | RBAC · Encryption | "Role-based access on every layer, encrypted by default — not bolted on after a client asks." | "Unauthorized-access surface down 60% — RecoverDerm" | RecoverDerm |
| 07 | Deploy & Monitor (`:70-73`) | CI/CD · Zero-Downtime | "Zero-downtime releases and CI/CD from day one, not after the first bad deploy." | "Deployment time cut 45% — NextGen Robotics" | NextGen Robotics |

- **UI strings:** "Select a layer" (`:182`). Desktop is a hover/click node diagram (`:78-218`); mobile is a tap-to-expand list (`:221-303`).
- **Closing card** (`:379-394`): "Want the full chronological history?" + italic "It’s in the résumé." Button "View Credentials" goes to `href="#credentials"`. This anchor needs a new target once Credentials merges into About.
- **Where the metrics come from:** all of them trace to the deleted `Experience.tsx` (`git show 1f4c78e^`), which matches the comment at `:18-24`.
  - Old lines: RecoverDerm 60% (`:20`), NextGen 30% and 45% (`:43-44`), Autoboy 30% DB and cascading failures (`:56-57`), Dejaii p95 (`:146`), Samdus 98/100 (`:101`), KRK 98/100 (`:79`).
  - The NextGen 30% and 45% figures appear only there. They are not in `PROJECTS` and not in `src/app/api/chat/route.ts`.
  - Dejaii is not in `PROJECTS`.

## 2. Currently Building — `src/components/CurrentlyBuilding.tsx`

The section has no heading or eyebrow. Every row links "View Live" in a new tab (`:154-174`). Only row 1 carries the pulsing "Currently Building" badge (`:189-200`).

| Row | Name — tagline | Logo | Chips (label · detail) | Link |
|---|---|---|---|---|
| 1 (`:185-216`) | **Orion** — "distributed AI surveillance, embedded edge to browser." | `/logo/NEXTGEN PL (Landscape) WHITE.png` (hidden below sm) | AI Inference · YOLOv8-nano person & object detection; Thermal Sensing · Pipeline leak detection layer; Protobuf · DetectionEvent real-time schema (`:10-14`) | https://app.nextgenerationrobotics.org/ |
| 2 (`:217-223`) | **Wytnest** — "testimonial SaaS — campaigns, video collection, embeddable widgets." | inline SVG `WytnestLogo` (`:35-67`); `/logo/wytnest-logo-secondary-light.png` exists but is unused | Multi-tenant · RLS-enforced workspace isolation; Video · Cloudflare R2 + Stream HLS delivery; Dual payments · Paystack NGN · Stripe USD (`:16-20`) | https://wytnest.vercel.app |
| 3 (`:224-239`) | **The Black-E** — "redesign for Britain’s first community arts centre, Liverpool since 1967." | `/logo/theblacke.png` | ScrollTrigger · pinned cinematic sequences; Lenis · smooth scroll layer; In progress · events, archive & facilities routes (`:22-26`) | https://theblacke.vercel.app |
| 4 (`:240-255`) | **VER** — "share more, waste less — community platform connecting givers with receivers." | `/logo/ver.png` | Supabase · auth + RLS on ver_* tables; Cloudinary · item image upload pipeline; TanStack Query · data and cache layer (`:28-32`) | https://ver-share-circle.vercel.app |

## 3. About — `src/components/About.tsx`

- **Heading:** `About` + italic `Me` (`:167-177`).
- **Stats** (`:12-17`, animated count-up): 5+ Years of Experience · 50+ Projects Shipped · 40+ Global Clients · 8 Countries Served.
- **Country chips**, under the label "Shipped across" (`:240`, list at `:19-22`): Nigeria, United States, Canada, United Kingdom, Australia, India, Ghana, Kenya. The list has 8 entries, matching the stat.
- **Quote** (`:24-27`, animated word by word): "I architect systems that don’t just work — they scale, survive failure, and stay clean under pressure."
- **Body paragraph 2** (`:286`): "Core: AWS, Docker, Go, Django, PostgreSQL, Redis, CI/CD. Fluent in Next.js for when the system needs a face. I care about the whole system — not just the feature."
- **Links:** GitHub https://github.com/Donrington (`:296`) and LinkedIn https://www.linkedin.com/in/carrington-abakwe-b0b0a0217 (`:305`). There is **no résumé or CV link in About**; the résumé lives in Credentials.
- **Portrait** (`:322-325`): `/me.png`, 1,746,816 bytes, rendered `grayscale`. Alt text: "Abakwe Carrington — software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria".

## 4. Built to Scale, tech marquee and From the Studio

- **Built to Scale = `Stack.tsx`** (`id="stack"`, dark).
  - Eyebrow "Technologies" (`:249`). Heading: "Built to Scale." plus italic "Engineered." (`:16-17`).
  - Tagline (`:338`): "Production-grade systems built with / a modern, battle-tested stack."
  - Stats (`:355-359`): 5+ Years · 50+ Projects · 12+ Technologies. The `+` comes from the CountUp default at `:62`.
  - 22 floating decorative words drawn from `WORDS` (`:7-14`).
- **`TechTicker.tsx`** is the white band directly under the Hero. It holds 30 tech names (`:11-17`: AWS … Computer Vision), rendered twice, `aria-label="Technology stack"`.
- **`Marquee.tsx`** is the client-logo marquee "Trusted by / Real Teams." (`:258-259`), dark.
  - Sub-line (`:273`): "50+ products shipped — from local businesses to funded startups." The sr-only h2 reads "Trusted by real teams" (`:233`).
  - 21 client logos (`:8-30`) in two rows, each rendered **3×** (`:77`), so 63 img elements. That list includes "Cybersage" itself (`:22`).
- **`StudioMarquee.tsx`** is "From the Studio" (eyebrow "Selected Frames", `:135`).
  - Two opposing rows of 18 screenshots each from `/projects/` (`:13-25`), rendered 2×, so 72 img elements, all with a dark overlay.
  - CTA "More Work" goes to `#work` (`:171,197`).
  - The comment at `:12` says "Every shot in /public/projects", but the rows leave out `tuff-app-*.png`, `winsko*.webp` and the new entries.

## 5. Services and Process

**`Services.tsx`**: heading `What I` + italic `Build` (`:305-332`). List at `:18-54`; each service has a title, short line, body and keywords.

1. **Systems Architecture**, "Design before code." Body: data models, service boundaries, API contracts, failure modes, capacity planning; documentation that survives handover. Keywords: System Design, Multi-Tenant, Event-Driven, Capacity Planning.
2. **Cloud Infrastructure & DevOps**, "AWS · Docker · CI/CD." Body: container orchestration, GitHub Actions, zero-downtime deploys, env management; "rebuild from a single repo." Keywords: AWS, Docker, GitHub Actions, Terraform.
3. **Distributed Backends & APIs**, "Services that survive traffic spikes." Body: rate-limiting, idempotency keys, circuit breakers, JWT, connection pooling, caching; Go and Django. Keywords: Go, Django, Redis, REST, WebSockets.
4. **Reliability & Performance**, "Find and fix what's slow." Body: query analysis, p95 latency hunting, caching review, Core Web Vitals. Keywords: PostgreSQL, p95 Latency, Caching, Lighthouse.
5. **Full Stack Delivery**, "When the system needs a face." Body: Next.js, Stripe/Paystack e-commerce, real-time dashboards. Keywords: Next.js, React, Stripe, PostgreSQL.

A second copy of 3 of these services lives in the nav mega-menu (`Navbar.tsx:29-31`).

**`Process.tsx`**: heading `How I` + italic `Work`. Intro (`:310`): "Hiring an architect shouldn’t feel like a gamble. Here’s the exact, predictable path from first conversation to a launched, maintainable product — no disappearing acts."

Steps (`:20-53`):

| Step | Timeframe | Tags | Hover thumbnail | Body summary |
|---|---|---|---|---|
| 01 Discovery | Days 1–3 | Goals, Scope, Timeline | `/projects/anoc.png` | Scoped plan with clear deliverables |
| 02 Architecture | Week 1 | System Design, Data Models, Security | `/projects/nextgen.png` | Design before production code |
| 03 Build & Ship | Core sprint | Iterative, Weekly Demos, Staging | `/projects/wytnest_hero.png` | Weekly check-ins, live staging URL |
| 04 Launch & Support | Go-live + | Deploy, Monitoring, Handover | `/projects/colhcs_dashbaord.png` | Zero-downtime deploy, stays on after launch |

The closing card (`:343-345`) reads "Currently accepting new projects — limited slots this quarter." Its button "Start a Project" fires `open-contact-modal` with no detail, which opens the message form (`:350`).

## 6. Credentials — `src/components/Credentials.tsx`

- **Heading:** `Proof of` + italic `Work` (`:645-672`).
- **Résumé card:**
  - Eyebrow "Resume · PDF · 2025" (`:706`); name "Abakwe Carrington" (`:721`).
  - Subtitle "Infrastructure & Systems Architect — 5+ years · Remote" (`:736`).
  - Tags: AWS, Docker, Go, Django, PostgreSQL, Redis (`:741`).
  - Button "Download Resume" (`:121`) links to `/resume/Abakwe Carrington.pdf` with the `download` attribute (`:763`). The file exists, 1,446,407 bytes.
- **Certifications** (`:60-82`), each row downloads its file:
  1. Full Stack Engineering · IBT Learning · 2025. File: `/certificates/Carrington Abakwe - 2025-08-04 - Full stack engineering Certificate (IBT Learning).pdf`
  2. Web Application Development · Moat Academy · 2024. File: `/certificates/Abakwe Carrington - Web application development (Moat Academy).jpeg`
  3. Web Development Internship · Zidio Development · 2024. File: `/certificates/Zidio Development - Web Devlopment Internship.jpeg`
- **Year mismatch:** `src/app/api/chat/route.ts` says Moat Academy was "completed 2023". Credentials says 2024.
- **Also in the section:**
  - A GitHub Activity panel that fetches `/api/github` (`:298`): contribution grid; Public Repos / Followers / Contributions per year; recent events; footer "Refreshes every hour · Public activity only" (`:490`).
  - 18 floating words (`:15-21`).

## 7. Testimonials — `src/components/Testimonials.tsx`

Heading: `Trusted by` + italic `clients & peers` (`:205-231`). Data at `:32-91`.

| # | Name | Role · Company | Source | Screenshot | Logo |
|---|---|---|---|---|---|
| 1 | Hycinth | Chief Executive Officer · SAMDUS Oil & Gas | Client | `/testimonial/samdus.jpg` | `/logo/samdus_white.png` |
| 2 | Carita | Founder · RecoverDerm | Client | `/testimonial/recoverderm.jpg` | `/logo/ReCoverDerm Logo Varient (White).png` |
| 3 | Halima | Executive Director · AmaniGo Travel | Client | `/testimonial/amanigo.png` | `/logo/amanigo.png` (scale 2) |
| 4 | Godspower Lawrence | Software Engineer · Endorsement · LinkedIn | LinkedIn | `/testimonial/lawerence_linkedin.jpg` | — |
| 5 | Precious Ukasoanya | Fullstack Software Engineer · Endorsement · LinkedIn | LinkedIn | `/testimonial/preciousLinkedIn.jpg` | — |
| 6 | Ashley J. | Software Engineer · Verified · Upwork | Upwork | `/testimonial/ashley_upwork.jpg` | — |

Quotes, verbatim:
1. "It has been quite a pleasure and delightful experience working with you. Your professionalism, dedication, commitment, enthusiasm, passion, and especially patience are all commendable." (`:38`)
2. "The website is beautiful — already I’m getting a lot of compliments. I’m happy and proud we were able to bring my vision to light." (`:48`)
3. "Cybersage delivered a top-notch CMS for our travel agency. It’s user-friendly and has genuinely enhanced our client engagement." (`:58`)
4. "I was consistently impressed by his exceptional Python skills, dedication, and attention to detail. He excels at solving complex problems with a systematic approach and collaborates effectively within a team. He is an asset to any team." (`:69`)
5. "Carrington possesses an in-depth understanding of Python, consistently delivering high-quality code with a keen eye for detail. A great team player who communicates effectively — I wholeheartedly endorse him." (`:78`)
6. "He consistently delivered quality work on time, communicated effectively, and demonstrated strong technical skills in Python. Professional, reliable, and easy to work with. Highly recommended." (`:87`)

- **Counter** (`:246-254`): the active index `01` is in Satoshi 900, `clamp(2.5rem,5vw,4rem)`, white/80, tabular figures. It is followed by `/ 06` in text-sm white/20 and a Quote icon in white/12.
- **Behaviour:** autoplay every 7000 ms (`:14`), linear progress bar, first-name tabs, prev/next arrows.
- **Labels:** "Verified Client" / "via {source}" (`:100`); caption "Unedited · Direct from …" (`:414`).
- **Unused files in `public/testimonial/`:** `samdus2.png`, `tuantlingvinyl.jpg` (no reference in src).

## 8. Pricing — `src/components/PricingPromo.tsx`

- **Heading:** `Transparent` + italic `Pricing`, sticky on desktop.
- **Intro** (`:134-136`): "Every service tier, clearly priced — no discovery calls required to understand what you're paying for. Scope your engagement, pick the tier that fits, and get started the same week."
- **Tiers** (`:13-19`). Each has a label, a one-line note and a starting price; there are **no feature lists**.

| Tier | Note | Price |
|---|---|---|
| Static & Landing | Landing pages & portfolios | From $300 |
| Corporate & CMS | Corporate sites & blogs | From $1,100 |
| E-Commerce | Full commerce platforms | From $1,600 |
| Web Applications | Dashboards & SaaS builds | From $1,500 |
| Maintenance | Monthly care & support | From $125/mo |

- **CTA:** "View All Tiers" links to the absolute URL `https://cybersage.dev/pricing` (`:198`). The nav uses the same URL (`Navbar.tsx:20`).
- **Rewrite:** `vercel.json` sends `/pricing` and `/pricing/:path*` to `https://cybersage-pricing.vercel.app/pricing…`.
- **Sync note:** the comment at `:9-12` says the tiers mirror `pricing-data.ts`. That file is not in this repo; it is presumably in the separate pricing app (unverified).

## 9. FAQ — `src/components/FAQ.tsx`

Heading: `Frequently Asked` + italic `Questions`. There are **6 questions** (`:16-59`):

1. Who is Abakwe Carrington? (`:20`)
2. What engineering services does Cybersage offer? (`:27`)
3. Does Abakwe Carrington work with international clients remotely? (`:34`)
4. What is Wytnest and how does it work? (`:41`)
5. What is Abakwe Carrington’s primary technology stack? (`:48`)
6. How can I hire or contact Abakwe Carrington for a project? (`:55`)

**FAQPage JSON-LD (`src/app/layout.tsx:501-546`) has 5 questions and does not match the visible FAQ:**

| Visible question | JSON-LD question | Mismatch |
|---|---|---|
| Q1 | "Who is Abakwe Carrington?" (`:507`) | Same question, **different answer text** (`:510` vs `FAQ.tsx:22`) |
| Q2 | "What services does Abakwe Carrington / Cybersage offer?" (`:515`) | **Different question and answer**. Both say "four" services; `Services.tsx` lists 5 (Reliability & Performance is missing). The `makesOffer` list (`:363-404`) also has only 4. |
| Q3 | Same question (`:523`) | Answer differs: visible has "WAT / GMT+1"; JSON-LD adds Africa |
| Q4 | "What is Wytnest?" (`:531`) | **Different question**; answer drops the Stripe/Paystack billing sentence |
| Q5 (tech stack) | — | **Missing from JSON-LD** |
| Q6 | "How can I hire or contact Abakwe Carrington?" (`:539`) | **Different question**; answer drops LinkedIn/Twitter and the role-availability sentence |

## 10. Contact — `src/components/Contact.tsx`

- **Lead-in:** "Have a project in mind?" (`:625`).
- **Email:** giant `hello@cybersage.dev` as a `mailto:` link (`:631-640`), plus "or email directly →" (`:653-657`).
- **Buttons:** "Book a Call" opens `setModal('call')` and "Send a Message" opens `setModal('message')` (`:650-651`). Both open the same in-page form modal that POSTs `{name,email,message}` to `/api/contact` (`:151`).
  - The call variant only pre-fills the message: "I’d like to book a quick call to discuss a project. My availability / timezone is: " (`:128`).
  - There is **no calendar link**.
  - Success copy: "I'll be in touch within 24 hours." (`:273`).
  - The modal also opens on the window event `open-contact-modal` (`:549-556`).
- **Info strip** (`:669-673`):
  - Location: **"Remote Worldwide"** (Lagos is not mentioned here, unlike the Hero).
  - Response: "Within 24 hours".
  - Status: "Available for projects" (with a pulse dot).
- **ContactCanvas** (`:588`) is the full-section background, `aria-hidden`. It is a React Three Fiber constellation of 55 points with connecting lines (`ContactCanvas.tsx:4-9`).
- **Footer inside the section:**
  - Nav: Work. / Services. / About. / Contact. (`:416-437`), logo `/sage/sage_prim_white.png`.
  - "You Bring / The Brief." and "It Gets / Shipped." (`:483,498`), with `/hero_vide_new_poster.jpg` and a "Contact Us." button.
  - "© 2026 Abakwe Carrington · Cybersage — Established Online ↗" (`:516`); "Designed & Developed by Carrington" (`:535`).
  - Socials: GitHub, LinkedIn, X https://x.com/CarlSwitch_CHUG (`:18-45`).

## 11. Projects — `src/components/Projects.tsx`

- **Count:** `PROJECTS` has **26** entries (`:15-274`), so `SCENE_COUNT = 27` (`:283`), with `--scene-vh` = 27 × 100vh (`:851`). The comment at `:617` still says "21 screen-heights".
- **IDs in order:** autoboy, recoverderm, anoc, wytnest, nextgen, axflo, samdus, deets, handyman, twerk, chrisconteras, myrakeleher, techhub, amanigo, rokeyla, krkmotors, tuantling, chronos, circlesoflife, terryonfagan, judygolden, wynscollections, theblacke, ver, tuffapp, winsko.
- **Links:** 22 have `link`. The 4 without one are **deets, handyman, amanigo, rokeyla**. techhub links to GitHub.
- **Fields:** `id`, `name`, `category`, `tagline`, `stack[]`, `image`, `year`, and optional `link`. Only Winsko has `video` and `videoPoster`, read through the `extra()` cast (`:279`).
- **Newest entries:**
  - **TUFF** (`:253-261`): "Fitness Challenge Platform", 2026, `/projects/tuff-app-home.png`, https://thetuffapp.com. `public/projects/tuff-app-dashboard.png` exists but is unused.
  - **Winsko Serves** (`:263-273`): "Logistics & EPC Platform", 2026, image `/projects/winsko.webp`, video `/videos/winsko-reel.mp4` (8,645,249 bytes), poster `/projects/winsko-reel-poster.webp`, https://winskoserves.com.ng.
- **Winsko video player:** rendered by `ProjectVideo.tsx` (`Projects.tsx:571` desktop, `:732` mobile with `compact`). It is a "Watch Video" button that opens a native `<dialog>`. The video has `preload="none"` and only mounts on open; Lenis is stopped while it is open (`ProjectVideo.tsx:28-50,116`).
- **Image fields:** every image file exists. Circles of Life uses a logo, `/logo/colhcs.png`, rather than a screenshot (`:198`).
  - **`/projects/techhub.png` is 29.9 MB on disk.**
  - Most other images are 1–3 MB PNG/JPG.
- **Copy:** "Selected Work · {26} Projects", heading `Selected` + italic `Work`, "Scroll to explore" (`:1091-1123`). Mobile gets a plain list instead (`:1255-1308`).
- **Existing flagship pick:** the nav already chooses 6: Autoboy, RecoverDerm, Chronos, NextGen, Circles of Life, The Black-E (`Navbar.tsx:41-48`).
- **No `/work` route exists** in `src/app`.
- `src/app/api/chat/route.ts` holds a third copy of the project and experience data.

## 12. Positioning lines, verbatim

**Page metadata (`src/app/layout.tsx`)**
- Title default (`:21-22`): "Abakwe Carrington — Software Engineer & Systems Architect (Lagos, Nigeria & Remote Worldwide)"
- Title template (`:23`): "%s | Abakwe Carrington — Infrastructure & Systems Architect"
- Description (`:26-27`): "Abakwe Carrington (Cybersage / Donrington) is a Software Engineer & Infrastructure Architect with 5+ years of experience designing high-availability distributed systems, cloud infrastructure (AWS, Docker, Kubernetes, Terraform), and Go & Django backends for global enterprises and startups worldwide."

**Social cards (`layout.tsx`)**
- OG title (`:154-155`): "Abakwe Carrington — Software Engineer & Systems Architect"
- OG description (`:156-157`): "Software engineer & Infrastructure Architect in Lagos, Nigeria operating globally. 5+ years architecting distributed, production-grade systems. AWS · Docker · Go · Django · PostgreSQL · Redis. Available for hire worldwide."
- OG image: `/sage/cybersage_og_whatsapp.png` (`:166`) and `/me.png` (`:173`).
- Twitter description (`:188-189`): "Software engineer & Infrastructure Architect. 5+ years architecting production-grade distributed systems. AWS · Docker · Go · Django · PostgreSQL. Available worldwide."

**JSON-LD (`layout.tsx`)**
- `jobTitle` (`:279`): ["Infrastructure & Systems Architect", "Software Engineer", "Senior Backend Engineer"]
- Person description (`:281`): "Abakwe Carrington is a software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria, with 5+ years of experience designing distributed, production-grade platforms — cloud infrastructure, DevOps pipelines, and resilient backends on AWS, Docker, Go, Django, and PostgreSQL — for clients worldwide."
- ProfilePage name (`:479`) is the same as the title default.

**On the page**
- Hero (`Hero.tsx`):
  - Pill "Available for Work" (`:227`); "Lagos, Nigeria · Remote Worldwide" (`:234`).
  - h1 "Abakwe / Carrington" (`:250-251`).
  - Tagline (`:268`): "Infrastructure & Systems Architect building reliable backend systems and cloud infrastructure for companies that can't afford downtime."
  - Side label (`:335`): "Systems · Cloud · Distributed · Remote".
  - Video (`:165-175`): `/hero_vide_new.mp4` (2,904,275 bytes), `preload="auto"`.
- About opening (`About.tsx:277`): "A software engineer based in Lagos, Nigeria — 5+ years designing and running production systems for global clients: multi-tenant compliance platforms, HIPAA medical portals, high-traffic marketplaces. I own the system end-to-end: architecture, infrastructure, backend, delivery."
- Hidden SEO article (`page.tsx`):
  - **Second `<h1>`** (`:68`): "Abakwe Carrington — Software Engineer & Systems Architect".
  - Lead (`:70`): "Abakwe Carrington (Cybersage / Donrington) is an Infrastructure & Systems Architect and Senior Software Engineer based in Lagos, Nigeria, working with remote clients worldwide across the United States, United Kingdom, Canada, Australia, and Europe."

**Other files**
- `public/llms.txt`:
  - Line 1: "# Abakwe Carrington — Software Engineer & Systems Architect"
  - Lead (line 5): "Abakwe Carrington (known online as **Cybersage** or **Donrington**) is an Infrastructure & Systems Architect and Senior Software Engineer based in Lagos, Nigeria, working with clients worldwide (United States, United Kingdom, Canada, Australia, Europe, Africa). With 5+ years of experience, …"
- `src/app/manifest.ts`:
  - name (`:5`): "Cybersage — Abakwe Carrington | Software Engineer & Systems Architect, Lagos, Nigeria"
  - description (`:8`): "Portfolio of Abakwe Carrington — software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria. Available for hire worldwide."

**Inconsistent wording to settle in the rebuild**
- **Titles:** the meta, OG and llms titles say "Software Engineer & Systems Architect"; the template, Hero and résumé card say "Infrastructure & Systems Architect".
- **Location:** the Contact strip says "Remote Worldwide" only; the Hero says Lagos.
- **Stats:**
  - "12+ Technologies" (`Stack.tsx`) against 30 entries in the ticker.
  - "40+ Global Clients" against 21 logos.
  - "Europe" appears in the SEO and llms text, but the only European country chip is the UK.