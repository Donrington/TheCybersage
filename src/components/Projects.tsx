'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = [
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
    link: 'https://deetsnigeria.org',
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
] as const;

type Project = (typeof PROJECTS)[number];

// ─── Cube geometry ─────────────────────────────────────────────────────────────
// Scene 0 = intro, scenes 1–16 = projects
const SCENE_COUNT = PROJECTS.length + 1;

// Which of the 6 cube faces is front-facing at each scroll stop
function faceAtStop(i: number): number {
  if (i < 6) return i;
  return 1 + ((i - 2) % 4);
}

// CSS 3D transforms for a 16:9 rectangular prism (depth = width).
// Side faces use --cw/2; top/bottom use --ch/2 so the box seals correctly.
const FACE_TRANSFORMS: string[] = [
  'rotateX(-90deg) translateZ(calc(var(--ch) / 2))', // 0 top
  'translateZ(calc(var(--cw) / 2))',                  // 1 front
  'rotateY(90deg) translateZ(calc(var(--cw) / 2))',   // 2 right
  'rotateY(180deg) translateZ(calc(var(--cw) / 2))',  // 3 back
  'rotateY(-90deg) translateZ(calc(var(--cw) / 2))',  // 4 left
  'rotateX(90deg) translateZ(calc(var(--ch) / 2))',   // 5 bottom
];

// Scroll stops: rotation state at each scene index
function buildStops(n: number): { rx: number; ry: number }[] {
  const base = [
    { rx: 90,  ry: 0 },
    { rx: 0,   ry: 0 },
    { rx: 0,   ry: -90 },
    { rx: 0,   ry: -180 },
    { rx: 0,   ry: -270 },
    { rx: -90, ry: -360 },
  ];
  const out = base.slice(0, Math.min(n, 6));
  for (let i = 6; i < n; i++) {
    out.push({ rx: 0, ry: -360 - (i - 6) * 90 });
  }
  return out;
}

const STOPS = buildStops(SCENE_COUNT);

const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

function getCubeTransform(progress: number): { rx: number; ry: number } {
  const t = progress * (SCENE_COUNT - 1);
  const i = Math.min(Math.floor(t), SCENE_COUNT - 2);
  const f = easeIO(t - i);
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return { rx: a.rx + (b.rx - a.rx) * f, ry: a.ry + (b.ry - a.ry) * f };
}

function sceneFromProgress(progress: number): number {
  return Math.min(SCENE_COUNT - 1, Math.floor(progress * SCENE_COUNT));
}

// Compute which project image belongs on each face, pre-loading nearby stops
const SWAP_RADIUS = 3;

function deriveFaceImages(stopIdx: number): (number | null)[] {
  const images: (number | null)[] = Array(6).fill(null);
  for (let offset = -SWAP_RADIUS; offset <= SWAP_RADIUS; offset++) {
    const si = stopIdx + offset;
    if (si < 0 || si >= SCENE_COUNT) continue;
    const fi = faceAtStop(si);
    const pi = si - 1; // scene 0 is intro (no project image)
    if (pi >= 0 && pi < PROJECTS.length) {
      images[fi] = pi;
    }
  }
  return images;
}

// ─── Background canvas — tiny drifting particles ──────────────────────────────
function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    interface Dot {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      a: number;
      aMin: number;
      aMax: number;
      aDir: number;
      aSpd: number;
    }

    const COUNT = 160;
    const make = (): Dot => {
      const isStar = Math.random() < 0.25;
      const aMax = isStar ? 0.12 + Math.random() * 0.1 : 0.04 + Math.random() * 0.06;
      const aMin = aMax * 0.15;
      return {
        x: Math.random() * (w || window.innerWidth),
        y: Math.random() * (h || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.14 - 0.025, // slight upward float
        r: isStar ? 0.75 + Math.random() * 0.9 : 0.35 + Math.random() * 0.55,
        a: aMin + Math.random() * (aMax - aMin),
        aMin,
        aMax,
        aDir: Math.random() < 0.5 ? 1 : -1,
        aSpd: 0.00025 + Math.random() * 0.0005,
      };
    };

    const dots: Dot[] = Array.from({ length: COUNT }, make);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < -2) d.x = w + 2;
        else if (d.x > w + 2) d.x = -2;
        if (d.y < -2) d.y = h + 2;
        else if (d.y > h + 2) d.y = -2;

        d.a += d.aSpd * d.aDir;
        if (d.a >= d.aMax) { d.a = d.aMax; d.aDir = -1; }
        else if (d.a <= d.aMin) { d.a = d.aMin; d.aDir = 1; }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.a.toFixed(3)})`;
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ProjectCard({ project, align }: { project: Project; align: 'left' | 'right' }) {
  const right = align === 'right';
  return (
    <div
      style={{
        padding: '1.75rem 1.5rem',
        background: 'rgba(12,12,12,0.92)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        borderLeft: right ? 'none' : '1px solid rgba(255,255,255,0.07)',
        borderRight: right ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: '2rem',
          height: '1px',
          background: 'rgba(255,255,255,0.5)',
          marginBottom: '1.1rem',
          marginLeft: right ? 'auto' : 0,
        }}
      />

      {/* Category · year */}
      <p
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.5rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.28)',
          marginBottom: '0.75rem',
          textAlign: right ? 'right' : 'left',
        }}
      >
        {project.category}&nbsp;·&nbsp;{project.year}
      </p>

      {/* Name */}
      <h3
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
          letterSpacing: '-0.04em',
          lineHeight: 0.88,
          color: 'rgba(255,255,255,0.92)',
          marginBottom: '0.9rem',
          textAlign: right ? 'right' : 'left',
        }}
      >
        {project.name}
      </h3>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'Satoshi, system-ui, sans-serif',
          fontSize: '0.73rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.32)',
          marginBottom: '1rem',
          textAlign: right ? 'right' : 'left',
        }}
      >
        {project.tagline}
      </p>

      {/* Stack pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          marginBottom: '1.2rem',
          justifyContent: right ? 'flex-end' : 'flex-start',
        }}
      >
        {project.stack.map((t) => (
          <span
            key={t}
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.28)',
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontSize: '0.48rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '0.18rem 0.5rem',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* CTA */}
      {'link' in project && project.link && (
        <div style={{ display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start' }}>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontSize: '0.5rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '0.5rem 0.9rem',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = 'rgba(255,255,255,0.07)';
              el.style.color = 'rgba(255,255,255,0.9)';
              el.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = 'transparent';
              el.style.color = 'rgba(255,255,255,0.45)';
              el.style.borderColor = 'rgba(255,255,255,0.14)';
            }}
          >
            View Project
            <ArrowUpRight size={9} />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  // Direct DOM refs for HUD — avoids React re-renders on every scroll frame
  const hudPctRef = useRef<HTMLDivElement>(null);
  const hudFillRef = useRef<HTMLDivElement>(null);
  const hudSceneRef = useRef<HTMLDivElement>(null);
  const captionNumRef = useRef<HTMLDivElement>(null);
  const captionLabelRef = useRef<HTMLDivElement>(null);

  const [activeScene, setActiveScene] = useState(0);
  const activeSceneRef = useRef(0);
  const [faceImages, setFaceImages] = useState<(number | null)[]>(() => deriveFaceImages(0));

  useEffect(() => {
    if (!sectionRef.current || !cubeRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        const p = self.progress;

        // Cube rotation — direct DOM write, no React state
        const { rx, ry } = getCubeTransform(p);
        cubeRef.current!.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

        // HUD percentage
        const pct = Math.round(p * 100);
        if (hudPctRef.current) {
          hudPctRef.current.textContent = String(pct).padStart(3, '0') + '%';
        }
        if (hudFillRef.current) {
          hudFillRef.current.style.width = `${pct}%`;
        }

        // Scene transition (fires only when crossing a scene boundary)
        const newScene = sceneFromProgress(p);
        if (newScene !== activeSceneRef.current) {
          activeSceneRef.current = newScene;

          const label =
            newScene === 0 ? 'OVERVIEW' : PROJECTS[newScene - 1].category.toUpperCase();

          if (hudSceneRef.current) hudSceneRef.current.textContent = label;
          if (captionNumRef.current) {
            captionNumRef.current.textContent = String(newScene).padStart(2, '0');
          }
          if (captionLabelRef.current) captionLabelRef.current.textContent = label;

          setActiveScene(newScene);
          setFaceImages(deriveFaceImages(newScene));
        }
      },
    });

    return () => trigger.kill();
  }, []);

  const project = activeScene > 0 ? PROJECTS[activeScene - 1] : null;
  // Odd scenes → left card, even scenes → right card
  const isRight = activeScene > 0 && activeScene % 2 === 0;

  return (
    <section
      ref={sectionRef}
      id="work"
      data-theme="dark"
      style={{ height: `${SCENE_COUNT * 100}vh`, background: '#0A0A0A', position: 'relative' }}
    >
      {/* ── Sticky viewport ─────────────────────────────────────────────────── */}
      <div data-cursor="view" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* ── Background layer — no filter:blur so preserve-3d cube stays sharp ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <BackgroundCanvas />

          {/* Ambient orb 1 — top-left. Pure radial-gradient, no filter:blur. */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-15%',
              width: '75vw',
              height: '75vw',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.032) 0%, rgba(255,255,255,0.01) 40%, transparent 70%)',
            }}
            animate={{ x: [0, 40, -25, 0], y: [0, 30, -40, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Ambient orb 2 — bottom-right */}
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: '-25%',
              right: '-18%',
              width: '70vw',
              height: '70vw',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.007) 45%, transparent 70%)',
            }}
            animate={{ x: [0, -35, 20, 0], y: [0, -25, 35, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Section label — top left */}
        <div className="absolute top-7 left-8 z-20 flex items-center gap-3">
          <span
            className="text-[0.52rem] tracking-[0.25em] uppercase font-medium"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif', color: 'rgba(255,255,255,0.18)' }}
          >
            02 / Work
          </span>
          <div style={{ width: '2rem', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span
            className="text-[0.52rem] tracking-[0.25em] uppercase font-medium"
            style={{ fontFamily: 'Satoshi, system-ui, sans-serif', color: 'rgba(255,255,255,0.1)' }}
          >
            {PROJECTS.length} Projects
          </span>
        </div>

        {/* HUD — top right */}
        <div className="absolute top-7 right-8 z-20 text-right">
          <div
            ref={hudPctRef}
            style={{
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.22)',
            }}
          >
            000%
          </div>
          <div
            style={{
              width: '6rem',
              height: '1px',
              background: 'rgba(255,255,255,0.08)',
              marginTop: '0.4rem',
              marginLeft: 'auto',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              ref={hudFillRef}
              style={{
                position: 'absolute',
                inset: '0 auto 0 0',
                width: '0%',
                background: 'rgba(255,255,255,0.55)',
              }}
            />
          </div>
          <div
            ref={hudSceneRef}
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontSize: '0.45rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.18)',
              marginTop: '0.3rem',
            }}
          >
            OVERVIEW
          </div>
        </div>

        {/* Nav dots — left (hidden on small screens) */}
        <div className="absolute left-7 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-2">
          {Array.from({ length: SCENE_COUNT }, (_, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: i === activeScene ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.18)',
                transform: i === activeScene ? 'scale(1.6)' : 'scale(1)',
                transition: 'background 0.3s, transform 0.3s',
              }}
            />
          ))}
        </div>

        {/* ── 3-D cube + mobile card ──────────────────────────────────────── */}
        <div
          className={`projects-cube-scene${activeScene > 0 ? ' scene-active' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1100px',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div
            ref={cubeRef}
            style={
              {
                // 16:9 prism — depth equals width so all 4 side faces are 16:9
                '--cw': 'min(72vw, 700px)',
                '--ch': 'calc(var(--cw) * 9 / 16)',
                width: 'var(--cw)',
                height: 'var(--ch)',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(90deg) rotateY(0deg)',
                flexShrink: 0,
              } as React.CSSProperties
            }
          >
            {([0, 1, 2, 3, 4, 5] as const).map((fi) => {
              // Top (0) & bottom (5) cap the box — they must be square (width × width)
              // so the prism seals without gaps. Side faces use inset:0 (16:9).
              const isCapFace = fi === 0 || fi === 5;
              return (
                <div
                  key={fi}
                  style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: FACE_TRANSFORMS[fi],
                    background: `
                      repeating-linear-gradient(0deg,   rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 48px),
                      repeating-linear-gradient(90deg,  rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 48px),
                      #0e0c0b
                    `,
                    // Cap faces: square (var(--cw) × var(--cw)), centered on the container
                    ...(isCapFace
                      ? {
                          left: 0,
                          right: 0,
                          top: 'calc(50% - var(--cw) / 2)',
                          width: 'var(--cw)',
                          height: 'var(--cw)',
                        }
                      : { inset: 0 }),
                  }}
                >
                  {faceImages[fi] !== null && (
                    <>
                      <Image
                        src={PROJECTS[faceImages[fi]!].image}
                        alt={PROJECTS[faceImages[fi]!].name}
                        fill
                        className="object-cover"
                        quality={90}
                        sizes="(max-width: 768px) 90vw, 1400px"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.28)',
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile card — directly below cube, hidden on md+ */}
          <div
            className="md:hidden"
            style={{
              marginTop: '0.75rem',
              width: 'min(72vw, 700px)',
              maxWidth: 'calc(100% - 2rem)',
              flexShrink: 0,
              pointerEvents: 'auto',
            }}
          >
            <AnimatePresence mode="wait">
              {activeScene > 0 && project && (
                <motion.div
                  key={`mob-${activeScene}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.32 }}
                >
                  <ProjectCard project={project} align="left" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Intro card — desktop (md+) fades out on scroll ───────────────── */}
        <AnimatePresence>
          {activeScene === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
              className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <div style={{ textAlign: 'center', maxWidth: '32rem', padding: '0 1.5rem' }}>
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.52rem',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    marginBottom: '1.5rem',
                  }}
                >
                  Selected Work&nbsp;·&nbsp;{PROJECTS.length} Projects
                </p>
                <h2
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: 0.88,
                    color: 'rgba(255,255,255,0.92)',
                    marginBottom: '0.15em',
                  }}
                >
                  Selected{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument), Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.18)',
                    }}
                  >
                    Work
                  </span>
                </h2>
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.65rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.15)',
                    marginTop: '2rem',
                  }}
                >
                  Scroll to explore
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Intro title — mobile: slides from center → top as user scrolls ── */}
        <div
          className="md:hidden absolute left-1/2 z-10 pointer-events-none"
          style={{
            top: activeScene === 0 ? '50%' : '3.5rem',
            transform: `translateX(-50%) translateY(${activeScene === 0 ? '-50%' : '0'})`,
            transition: 'top 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)',
            textAlign: 'center',
            maxWidth: 'calc(100vw - 4rem)',
            width: 'max-content',
          }}
        >
          <AnimatePresence mode="wait">
            {activeScene === 0 ? (
              <motion.div
                key="mob-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.52rem',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    marginBottom: '1.25rem',
                  }}
                >
                  Selected Work&nbsp;·&nbsp;{PROJECTS.length} Projects
                </p>
                <h2
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(3rem, 9vw, 5.5rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: 0.88,
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  Selected{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument), Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.18)',
                    }}
                  >
                    Work
                  </span>
                </h2>
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.15)',
                    marginTop: '1.75rem',
                  }}
                >
                  Scroll to explore
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="mob-compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontSize: '0.42rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.18)',
                    marginBottom: '0.3rem',
                  }}
                >
                  02 / Work
                </p>
                <h2
                  style={{
                    fontFamily: 'Satoshi, system-ui, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(2rem, 8vw, 3rem)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Selected{' '}
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument), Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 400,
                    }}
                  >
                    Work
                  </span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Project cards — desktop left slot ─────────────────────────────── */}
        <div
          className="absolute hidden md:block z-10"
          style={{
            left: 'clamp(4rem, 7vw, 7rem)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(21rem, 28%)',
          }}
        >
          <AnimatePresence mode="wait">
            {!isRight && activeScene > 0 && project && (
              <motion.div
                key={`left-${activeScene}`}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.38 }}
              >
                <ProjectCard project={project} align="left" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Project cards — desktop right slot ────────────────────────────── */}
        <div
          className="absolute hidden md:block z-10"
          style={{
            right: 'clamp(4rem, 7vw, 7rem)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(21rem, 28%)',
          }}
        >
          <AnimatePresence mode="wait">
            {isRight && activeScene > 0 && project && (
              <motion.div
                key={`right-${activeScene}`}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.38 }}
              >
                <ProjectCard project={project} align="right" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Scene counter — bottom right ──────────────────────────────────── */}
        <div
          className="absolute bottom-7 right-8 z-20"
          style={{ pointerEvents: 'none', textAlign: 'right' }}
        >
          <span
            style={{
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize: '0.52rem',
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.18)',
            }}
          >
            {String(activeScene).padStart(2, '0')}&nbsp;/&nbsp;{String(PROJECTS.length).padStart(2, '0')}
          </span>
        </div>

        {/* ── Face caption — bottom center ──────────────────────────────────── */}
        <div
          className="absolute bottom-7 left-1/2 z-20"
          style={{ transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}
        >
          <div
            ref={captionNumRef}
            style={{
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize: '0.45rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: '0.2rem',
            }}
          >
            00
          </div>
          <div
            ref={captionLabelRef}
            style={{
              fontFamily: 'Satoshi, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.06)',
            }}
          >
            OVERVIEW
          </div>
        </div>

      </div>
    </section>
  );
}
