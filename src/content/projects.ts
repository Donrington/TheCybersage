// Every project on the site, in one place. The home page shows the FEATURED
// scenes; /work lists all of them with filters. Copy is the owner's own; do not
// add numbers that are not already true (see docs/redesign/README.md).

export type Vertical = 'fintech' | 'ecommerce' | 'healthcare' | 'saas' | 'energy' | 'brand';

export const VERTICALS: { key: Vertical; label: string }[] = [
  { key: 'fintech', label: 'Fintech' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'saas', label: 'SaaS & AI' },
  { key: 'energy', label: 'Oil, gas & industrial' },
  { key: 'brand', label: 'Brand & services' },
];

export interface Project {
  id: string;
  name: string;
  category: string;
  tagline: string;
  stack: readonly string[];
  image: string;
  year: string;
  link?: string;
  video?: string;
  videoPoster?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'autoboy',
    name: 'Autoboy Express',
    category: 'B2B / B2C Marketplace',
    tagline: 'Dual-sided automotive marketplace on Go microservices. Real-time inventory, Redis-cached feeds, React seller dashboard. 30% DB latency reduction.',
    stack: ['React', 'Go', 'PostgreSQL', 'Redis'],
    image: '/projects/autoboy.png',
    year: '2025',
    link: 'https://autoboyexpress.com',
  },
  {
    id: 'recoverderm',
    name: 'RecoverDerm',
    category: 'Paramedical Platform',
    tagline: 'Full stack for a paramedical clinic. Secure patient portals, treatment tracking, headless CMS. JWT + refresh token rotation, HIPAA-compliant.',
    stack: ['Next.js', 'Django', 'PostgreSQL'],
    image: '/projects/recoverderm.png',
    year: '2026',
    link: 'https://recoverderm.ca',
  },
  {
    id: 'anoc',
    name: 'Anoc.ng',
    category: 'Audit / Finance',
    tagline: 'Platform for Chartered Accountants to handle compliance, manage documents, and keep audit records clean. Encrypted pipelines, zero breaches.',
    stack: ['Next.js', 'Node.js', 'PostgreSQL'],
    image: '/projects/anoc.png',
    year: '2025',
    link: 'https://anoc.ng',
  },
  {
    id: 'wytnest',
    name: 'Wytnest',
    category: 'Testimonial SaaS',
    tagline: 'Multi-tenant testimonial platform — campaigns, video via Cloudflare Stream, shadow DOM widget embeds, and idempotent dual-rail payments: Paystack NGN + Stripe USD.',
    stack: ['Next.js', 'Supabase', 'Cloudflare', 'Paystack', 'Stripe'],
    image: '/projects/wytnest_hero.png',
    year: '2026',
    link: 'https://wytnest.vercel.app',
  },
  {
    id: 'nextgen',
    name: 'NextGen Robotics',
    category: 'Automation Hub',
    tagline: 'Web platform and cloud deployment for a robotics company. CI/CD automation, Go backend, AWS. 25% user engagement lift post-launch.',
    stack: ['Next.js', 'Go', 'AWS', 'Docker'],
    image: '/projects/nextgen.png',
    year: '2025',
    link: 'https://nextgenerationrobotics.org',
  },
  {
    id: 'axflo',
    name: 'Axflo Oil & Gas',
    category: 'Enterprise CMS',
    tagline: 'Headless CMS for an oil & gas company with workflow automation, document generation, and role-based access. Cut manual ops by 60%.',
    stack: ['Next.js', 'Django', 'PostgreSQL'],
    image: '/projects/axflo.png',
    year: '2025',
    link: 'https://axfloo.com',
  },
  {
    id: 'samdus',
    name: 'Samdus Oil & Gas',
    category: 'Corp Portfolio',
    tagline: 'Corporate site for an oil & gas company. Custom GSAP animations, SEO-first build, 98/100 on Lighthouse. Sub-1s LCP.',
    stack: ['Next.js', 'Django'],
    image: '/projects/samdus1_1.jpg',
    year: '2024',
    link: 'https://samdus.com',
  },
  {
    id: 'deets',
    name: 'Deets',
    category: 'Industrial System',
    tagline: 'Manufacturing platform with real-time production tracking, compliance workflows, and WebSocket-powered reporting.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    image: '/projects/deets.png',
    year: '2025',
  },
  {
    id: 'handyman',
    name: 'All A Handyman',
    category: 'Lead Generation',
    tagline: 'Lead gen site for a home services company. Conversion-tuned landing pages, qualified inquiries tripled post-launch.',
    stack: ['React', 'Node.js', 'Tailwind'],
    image: '/projects/handyman3.jpg',
    year: '2024',
  },
  {
    id: 'twerk',
    name: 'Twerk Queen Lagos',
    category: 'Event Portfolio',
    tagline: 'Event portfolio for a professional performer. GSAP showcase, booking engine, 60fps scroll animations, sub-800ms FCP.',
    stack: ['Next.js', 'Tailwind', 'GSAP'],
    image: '/projects/twerkqueenlagos.jpg',
    year: '2024',
    link: 'https://twerkqueenlagos.vercel.app',
  },
  {
    id: 'chrisconteras',
    name: 'Chris Conteras',
    category: 'Cleaning Agency',
    tagline: 'Lead gen site for a Texas cleaning agency. SEO-first build, optimised inquiry funnels, qualified bookings up since launch.',
    stack: ['Next.js', 'Tailwind', 'SEO'],
    image: '/projects/chrisconteras.png',
    year: '2025',
    link: 'https://chriscleanstexas.com',
  },
  {
    id: 'myrakeleher',
    name: 'Myra Keleher',
    category: 'Cleaning Agency',
    tagline: 'Cleaning agency site for Florida. Service showcase, instant quote flow, form completion up 40%.',
    stack: ['React', 'Node.js', 'Tailwind'],
    image: '/projects/myrakeleher.png',
    year: '2025',
    link: 'https://myrakelehercleaning.com',
  },
  {
    id: 'techhub',
    name: 'TechHub',
    category: 'Dev Community',
    tagline: 'Open source dev community. Project showcases, resource sharing, real-time activity feeds.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
    image: '/projects/techhub.png',
    year: '2023',
    link: 'https://github.com/Donrington/techhub',
  },
  {
    id: 'amanigo',
    name: 'Amanigo Travels',
    category: 'Travel Mgmt App',
    tagline: 'Travel management app with booking engine, itinerary builder, and integrations with global travel providers. Idempotent payments.',
    stack: ['Next.js', 'Django', 'PostgreSQL'],
    image: '/projects/amanigo.png',
    year: '2024',
  },
  {
    id: 'rokeyla',
    name: 'Rokeyla Fashion',
    category: 'Ecommerce',
    tagline: 'E-commerce platform for a fashion brand. Stripe integration, live inventory sync via pg_notify, scales with traffic.',
    stack: ['Next.js', 'Stripe', 'PostgreSQL'],
    image: '/projects/rokeyla.jpg',
    year: '2024',
  },
  {
    id: 'krkmotors',
    name: 'KRK Motors',
    category: 'Brand Site',
    tagline: 'Brand site for a premium auto dealership. GSAP animations, sub-1s load time, clean automotive aesthetic.',
    stack: ['Next.js', 'GSAP', 'Tailwind'],
    image: '/projects/krkmotors.png',
    year: '2024',
    link: 'https://krk-motors.vercel.app',
  },
  {
    id: 'tuantling',
    name: 'Tuan Tling Vinyl Flooring',
    category: 'Home Services',
    tagline: 'SEO-optimised service platform for a vinyl flooring specialist. Service showcase, quote request funnels, sub-1s LCP.',
    stack: ['Next.js', 'Tailwind', 'SEO'],
    image: '/projects/tuantling.png',
    year: '2026',
    link: 'https://tuantlingvinylflooring.com',
  },
  {
    id: 'chronos',
    name: 'Chronos',
    category: 'Ambient AI Platform',
    tagline: 'Adaptive ambient display system powered by Google Gemini. Auto-tags images with AI, scores content by time-of-day, mood, and context. Cloudinary-backed storage with user feedback loop.',
    stack: ['Python', 'Streamlit', 'PostgreSQL', 'Gemini AI'],
    image: '/projects/chronos.png',
    year: '2026',
    link: 'https://thechronosaura.com',
  },
  {
    id: 'circlesoflife',
    name: 'Circles of Life Healthcare',
    category: 'Healthcare + AI Platform',
    tagline: 'Marketing site, admin CMS, and a four-feature Claude-powered care-advisor suite for an Atlanta in-home care provider. Streaming AI chat, care assessment, applicant auto-scoring, Supabase RLS.',
    stack: ['Next.js', 'Supabase', 'Claude AI', 'GSAP'],
    image: '/logo/colhcs.png',
    year: '2026',
    link: 'https://circlesoflifehcs.com',
  },
  {
    id: 'terryonfagan',
    name: 'Terryon Fagan',
    category: 'Home Services',
    tagline: 'Marketing site for a Gloucester, Massachusetts vinyl flooring specialist. Arch-clipped media hero, bento floor range with detail modals, and a hardened contact route — CSRF tokens, rate limiting, Resend delivery.',
    stack: ['Next.js', 'Tailwind', 'Framer Motion', 'Resend'],
    image: '/projects/terryonfagan.png',
    year: '2026',
    link: 'https://terryonfaganflooring.com',
  },
  {
    id: 'judygolden',
    name: 'Judy Golden Tiling',
    category: 'Home Services',
    tagline: 'Marketing site for a Gulfport, Mississippi tiling company. Hard-edged brand system with a single gold accent, LocalBusiness structured data, and a CSRF-protected contact pipeline that degrades gracefully without keys.',
    stack: ['Next.js', 'Tailwind', 'Framer Motion', 'Resend'],
    image: '/projects/judygolden.png',
    year: '2026',
    link: 'https://judygoldentiling.com',
  },
  {
    id: 'wynscollections',
    name: 'Wyns Collections',
    category: 'Ecommerce Platform',
    tagline: 'Storefront and back office for a Port Harcourt fashion accessories label. Paystack checkout, Supabase Postgres with row-level security across ten migrations, admin analytics, and order lifecycle management.',
    stack: ['Next.js', 'Supabase', 'Paystack', 'Recharts'],
    image: '/projects/wynscollections.png',
    year: '2026',
    link: 'https://wyns-collections.vercel.app',
  },
  {
    id: 'theblacke',
    name: 'The Black-E',
    category: 'Arts & Culture',
    tagline: 'Ground-up redesign for Britain’s first community arts centre, in Liverpool since 1967. Dark editorial build with GSAP ScrollTrigger sequences and Lenis smooth scroll, replacing a legacy WordPress stack.',
    stack: ['Next.js', 'GSAP', 'Lenis', 'Tailwind'],
    image: '/projects/THE_BLACK-E.png',
    year: '2026',
    link: 'https://theblacke.vercel.app',
  },
  {
    id: 'ver',
    name: 'VER',
    category: 'Community Platform',
    tagline: 'Share more. Waste less. Give freely. A community sharing platform connecting givers with receivers — Supabase auth and row-level security, Cloudinary image pipeline, TanStack Query data layer.',
    stack: ['React', 'Supabase', 'Cloudinary', 'TanStack Query'],
    image: '/projects/VER.png',
    year: '2026',
    link: 'https://ver-share-circle.vercel.app',
  },
  {
    id: 'tuffapp',
    name: 'TUFF',
    category: 'Fitness Challenge Platform',
    tagline: 'Team fitness challenges, streaks and leaderboards. Next.js App Router frontend, Express/MongoDB API, dual-cookie JWT auth with Google OAuth — every stat computed live from logged activity, not stored counters.',
    stack: ['Next.js', 'Express', 'MongoDB', 'TypeScript'],
    image: '/projects/tuff-app-home.png',
    year: '2026',
    link: 'https://thetuffapp.com',
  },
  {
    id: 'winsko',
    name: 'Winsko Serves',
    category: 'Logistics & EPC Platform',
    tagline: 'Website for a Port Harcourt logistics and oil & gas EPC company. Nine service pages, a scroll-driven Mapbox globe of the Nigerian base, an animated services mega-menu, a server-validated contact form with Turnstile, and a gallery built from the client’s own site photographs.',
    stack: ['Next.js', 'GSAP', 'Mapbox', 'Tailwind'],
    image: '/projects/winsko.webp',
    video: '/videos/winsko-reel.mp4',
    videoPoster: '/projects/winsko-reel-poster.webp',
    year: '2026',
    link: 'https://winskoserves.com.ng',
  },
];

export const VERTICAL_OF: Record<string, Vertical> = {
  anoc: 'fintech',
  autoboy: 'ecommerce', rokeyla: 'ecommerce', wynscollections: 'ecommerce', krkmotors: 'ecommerce',
  recoverderm: 'healthcare', circlesoflife: 'healthcare',
  wytnest: 'saas', chronos: 'saas', ver: 'saas', tuffapp: 'saas', techhub: 'saas', amanigo: 'saas', nextgen: 'saas',
  axflo: 'energy', samdus: 'energy', winsko: 'energy', deets: 'energy',
  handyman: 'brand', twerk: 'brand', chrisconteras: 'brand', myrakeleher: 'brand', tuantling: 'brand',
  terryonfagan: 'brand', judygolden: 'brand', theblacke: 'brand',
};

export type SceneTemplate = 'device' | 'metric' | 'pair';

export interface FeaturedScene {
  id: string;
  /** Scope of my work on it, from the project copy. Edit freely. */
  role: string;
  /** One sentence. */
  outcome: string;
  /** Exactly three. */
  tags: [string, string, string];
  /** Only numbers already published elsewhere on the site. */
  metric?: { value: string; label: string };
  template: SceneTemplate;
  /** One image for device/metric, two for pair. */
  shots: string[];
}

/** The home-page shortlist, in scroll order. Templates rotate so no two neighbours match. */
export const FEATURED: FeaturedScene[] = [
  {
    id: 'anoc', template: 'pair',
    role: 'Full-stack build',
    outcome: 'Chartered accountants handle compliance, documents and audit records in one encrypted platform.',
    tags: ['Next.js', 'Node.js', 'PostgreSQL'],
    metric: { value: 'Zero', label: 'breaches' },
    shots: ['/projects/anoc.png', '/projects/anoc_2.png'],
  },
  {
    id: 'recoverderm', template: 'metric',
    role: 'Full-stack build',
    outcome: 'A paramedical clinic runs secure patient portals and treatment tracking on a HIPAA-compliant stack.',
    tags: ['Next.js', 'Django', 'PostgreSQL'],
    metric: { value: '60%', label: 'smaller unauthorized-access surface' },
    shots: ['/projects/recoverderm.png'],
  },
  {
    id: 'circlesoflife', template: 'device',
    role: 'Design, build and AI features',
    outcome: 'An Atlanta in-home care provider gets a CMS and a Claude-powered care-advisor suite with streaming chat.',
    tags: ['Next.js', 'Supabase', 'Claude AI'],
    metric: { value: '4', label: 'AI features in production' },
    shots: ['/projects/colhc.png'],
  },
  {
    id: 'nextgen', template: 'metric',
    role: 'Web platform and cloud deployment',
    outcome: 'A robotics company ships through CI/CD on a Go backend on AWS, with engagement up 25% after launch.',
    tags: ['Go', 'AWS', 'Docker'],
    metric: { value: '45%', label: 'faster deployments' },
    shots: ['/projects/nextgen2.png'],
  },
  {
    id: 'autoboy', template: 'pair',
    role: 'Backend architecture and build',
    outcome: 'A dual-sided automotive marketplace serves real-time inventory from Go microservices and Redis-cached feeds.',
    tags: ['Go', 'PostgreSQL', 'Redis'],
    metric: { value: '30%', label: 'lower DB latency' },
    shots: ['/projects/autoboy.png', '/projects/autoboy2.png'],
  },
  {
    id: 'wytnest', template: 'device',
    role: 'Product, architecture and build',
    outcome: 'A multi-tenant testimonial platform with video, embeddable widgets and dual-rail payments in NGN and USD.',
    tags: ['Next.js', 'Supabase', 'Stripe'],
    shots: ['/projects/wytnest_hero.png'],
  },
  {
    id: 'winsko', template: 'pair',
    role: 'Design and build',
    outcome: 'A Port Harcourt logistics and oil & gas EPC company gets nine service pages and a scroll-driven Mapbox globe.',
    tags: ['Next.js', 'GSAP', 'Mapbox'],
    metric: { value: '9', label: 'service pages' },
    shots: ['/projects/winsko.webp', '/projects/winsko-reel-poster.webp'],
  },
  {
    id: 'theblacke', template: 'device',
    role: 'Redesign and build',
    outcome: 'Britain’s first community arts centre, in Liverpool since 1967, moves off legacy WordPress to an editorial build.',
    tags: ['Next.js', 'GSAP', 'Lenis'],
    shots: ['/projects/THE_BLACK-E.png'],
  },
];

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
