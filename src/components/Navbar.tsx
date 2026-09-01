'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';

type PanelKey = 'services' | 'work';

const NAV_LINKS: { label: string; href: string; panel?: PanelKey }[] = [
  { label: 'Work',        href: '#work',                          panel: 'work' },
  { label: 'Services',    href: '#services',                      panel: 'services' },
  { label: 'Process',     href: '#process' },
  { label: 'About',       href: '#about' },
  { label: 'Systems',     href: '#systems' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Reviews',     href: '#testimonials' },
  { label: 'FAQ',         href: '#faq-section' },
  { label: 'Pricing',     href: 'https://cybersage.dev/pricing' },
];

/* Curated 3-of-5 spread across the technical range (architecture → infra →
   delivery) — the full 5-item list already lives in the on-page Services
   section; this is a quick preview, not a duplicate of it. Renumbered 01-03
   for the preview itself rather than carrying over the main section's
   01-05 indices, since this is its own compact count, not a cross-reference. */
const SERVICES_PREVIEW = [
  { index: '01', title: 'Systems Architecture', short: 'Design before code.' },
  { index: '02', title: 'Cloud Infrastructure & DevOps', short: 'AWS · Docker · CI/CD.' },
  { index: '03', title: 'Full Stack Delivery', short: 'When the system needs a face.' },
];

/* 6 flagship projects spanning categories (marketplace, healthcare, AI,
   automation, creative). Each links straight to the live project — the
   Projects section itself is a scroll-jacked scene with no addressable
   per-project anchor, so a generic "#work" link here would be less useful
   than the real destination. */
const WORK_PREVIEW = [
  { name: 'Autoboy Express', category: 'B2B / B2C Marketplace', image: '/projects/autoboy.png', link: 'https://autoboyexpress.com' },
  { name: 'RecoverDerm', category: 'Paramedical Platform', image: '/projects/recoverderm.png', link: 'https://recoverderm.ca' },
  { name: 'Chronos', category: 'Ambient AI Platform', image: '/projects/chronos.png', link: 'https://thechronosaura.com' },
  { name: 'NextGen Robotics', category: 'Automation Hub', image: '/projects/nextgen.png', link: 'https://nextgenerationrobotics.org' },
  { name: 'Circles of Life Healthcare', category: 'Healthcare + AI Platform', image: '/logo/colhcs.png', link: 'https://circlesoflifehcs.com' },
  { name: 'The Black-E', category: 'Arts & Culture', image: '/projects/THE_BLACK-E.png', link: 'https://theblacke.vercel.app' },
];

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 32, mass: 0.75 };
const EASE = [0.22, 1, 0.36, 1] as const;
/* The mega-panel's own soft, fast-out curve — distinct from the site's
   general EASE above, kept exactly as specified for this feature. */
const PANEL_EASE = [0.16, 1, 0.3, 1] as const;

function NavLink({
  label, href, panel, isOpen, onEnter,
}: {
  label: string;
  href: string;
  panel?: PanelKey;
  isOpen: boolean;
  onEnter: (panel: PanelKey | null) => void;
}) {
  return (
    <a
      href={href}
      onMouseEnter={() => onEnter(panel ?? null)}
      className="flex items-center gap-1 px-2.5 py-2 rounded-full text-[0.62rem] font-medium tracking-wide uppercase hover:bg-white/8 transition-all duration-200 whitespace-nowrap"
      style={{ fontFamily: 'Satoshi, system-ui, sans-serif', color: '#D9D9D9', mixBlendMode: 'difference' }}
    >
      {label}
      {panel && (
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown
            size={8}
            strokeWidth={2.5}
            style={{ color: '#D9D9D9', mixBlendMode: 'difference', marginTop: '1px' }}
          />
        </motion.span>
      )}
    </a>
  );
}

function HireBtn() {
  const reduced = useReducedMotion();
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onPointerEnter={(e) => e.currentTarget.style.setProperty('--mh', '1')}
      onPointerLeave={(e) => e.currentTarget.style.setProperty('--mh', '0')}
      className="group flex items-center bg-white rounded-full overflow-hidden hover:bg-white/80 transition-colors duration-200 shrink-0"
      style={{ position: 'relative' }}
    >
      {/* Light-tuned liquid metal — this pill is white, not the site's usual
          dark fill, so it uses the -light gradient variants (dark bands +
          multiply blend) rather than the ones built for dark buttons. */}
      {!reduced && (
        <span aria-hidden className="metal-edge-light" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '7s', borderRadius: 'inherit' }} />
      )}
      <span aria-hidden className="metal-highlight-light" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit' }} />

      <span
        className="pl-4 pr-1.5 py-1.75 text-black text-[0.61rem] font-medium tracking-[0.14em] uppercase whitespace-nowrap"
        style={{ fontFamily: 'Satoshi, system-ui, sans-serif', position: 'relative', zIndex: 1 }}
      >
        Hire Me
      </span>
      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-black/10 group-hover:bg-black/15 transition-colors mr-0.5 shrink-0" style={{ position: 'relative', zIndex: 1 }}>
        <ArrowRight size={11} className="text-black" />
      </span>
    </button>
  );
}

/* ── Mega-panel: shared chrome + swappable content ──────────────────────── */
function ServicesPanelContent() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
      {SERVICES_PREVIEW.map((s) => (
        <a
          key={s.index}
          href="#services"
          className="group"
          style={{
            padding: '1.1rem 1.25rem',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.045)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <span style={{ fontFamily: 'ui-monospace, "JetBrains Mono", monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            {s.index}
          </span>
          <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: '0.85rem', color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
            {s.title}
          </span>
          <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
            {s.short}
          </span>
          <span
            className="flex items-center gap-1 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
            style={{ marginTop: '0.1rem' }}
          >
            <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              Explore
            </span>
            <ArrowUpRight size={10} style={{ color: 'rgba(255,255,255,0.55)' }} />
          </span>
        </a>
      ))}

      {/* CTA cell — visually distinct (tinted border + liquid metal), same
          "open the contact modal" action every other primary CTA on this
          site dispatches. */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
        className="group"
        style={{
          position: 'relative',
          padding: '1.1rem 1.25rem',
          border: '1px solid rgba(255,255,255,0.22)',
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span aria-hidden className="metal-edge" style={{ position: 'absolute', inset: 0, padding: 1.5, pointerEvents: 'none', animationDuration: '6s' }} />
        <span aria-hidden className="metal-sheen" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.55, animationDuration: '5s' }} />
        <span aria-hidden className="metal-highlight" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <span
          style={{
            position: 'relative', zIndex: 1,
            fontFamily: 'var(--font-instrument), Georgia, serif',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: '#FFFFFF',
            lineHeight: 1.3,
          }}
        >
          Let&rsquo;s build something.
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{ position: 'relative', zIndex: 1, fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}
        >
          Start a project
          <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </span>
      </button>
    </div>
  );
}

function WorkPanelContent() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.9rem' }}>
        {WORK_PREVIEW.map((p) => (
          <a
            key={p.name}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="view"
            className="group"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="220px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.category}
                </span>
                <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {p.name}
                </span>
              </div>
              <ArrowUpRight
                size={11}
                className="opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 shrink-0"
                style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}
              />
            </div>
          </a>
        ))}
      </div>

      <a
        href="#work"
        className="group"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          marginTop: '1rem', padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)', transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.045)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
      >
        <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
          View all work
        </span>
        <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" style={{ color: 'rgba(255,255,255,0.6)' }} />
      </a>
    </div>
  );
}

function MegaPanel({ active }: { active: PanelKey | null }) {
  const reduced = useReducedMotion();
  const chromeTransition = reduced
    ? { duration: 0.15 }
    : { duration: 0.22, ease: PANEL_EASE };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          transition={chromeTransition}
          style={{
            pointerEvents: 'auto',
            marginTop: '0.6rem',
            width: 'min(700px, 92vw)',
            padding: '1.5rem',
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          }}
        >
          <AnimatePresence mode="wait">
            {active === 'services' ? (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: EASE }}
              >
                <ServicesPanelContent />
              </motion.div>
            ) : (
              <motion.div
                key="work"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: EASE }}
              >
                <WorkPanelContent />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Mobile: tap-to-expand accordion for Services/Work ──────────────────── */
function MobileNavRow({
  link, i, expanded, onToggle, onNavigate,
}: {
  link: { label: string; href: string; panel?: PanelKey };
  i: number;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (!link.panel) {
    return (
      <motion.a
        href={link.href}
        onClick={onNavigate}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + i * 0.06, duration: 0.32, ease: EASE }}
        className="flex items-center justify-between border-b border-white/8 py-4"
      >
        <span
          className="font-black tracking-[-0.04em] text-white"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 8vw, 2.8rem)' }}
        >
          {link.label}
        </span>
        <ArrowRight size={18} className="text-white/20" />
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + i * 0.06, duration: 0.32, ease: EASE }}
      className="border-b border-white/8"
    >
      <button onClick={onToggle} className="flex items-center justify-between w-full py-4 text-left">
        <span
          className="font-black tracking-[-0.04em] text-white"
          style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 8vw, 2.8rem)' }}
        >
          {link.label}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown size={18} className="text-white/30" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingBottom: '1.25rem' }}>
              {link.panel === 'services'
                ? SERVICES_PREVIEW.map((s) => (
                    <a
                      key={s.index}
                      href="#services"
                      onClick={onNavigate}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.index}</span>
                      <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>{s.title}</span>
                    </a>
                  ))
                : WORK_PREVIEW.map((p) => (
                    <a
                      key={p.name}
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div style={{ position: 'relative', width: 44, height: 28, flexShrink: 0, overflow: 'hidden' }}>
                        <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
                        <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>{p.category}</span>
                        <span style={{ fontFamily: 'Satoshi, system-ui, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#FFFFFF' }}>{p.name}</span>
                      </div>
                    </a>
                  ))}
              <a
                href={link.href}
                onClick={onNavigate}
                style={{ textAlign: 'center', padding: '0.6rem', fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}
              >
                View all {link.label.toLowerCase()} →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ONE pill. Spring-animates its width between compact and expanded.
   No AnimatePresence. No fading. Just physical expansion.
   Glass contrast is HIGH at default (top), lighter when expanded (scrolled).
 ═══════════════════════════════════════════════════════════════════════════ */
export function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [expandedW, setExpandedW] = useState(1280);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<PanelKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Measure available width for the expanded state */
  useEffect(() => {
    const calc = () => {
      const padding = Math.min(Math.max(window.innerWidth * 0.04, 20), 80);
      setExpandedW(Math.min(window.innerWidth - padding * 2, 980));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* Opening is instant; closing waits 120ms so a diagonal move from the
     trigger down into the panel doesn't flicker it shut. The timer lives on
     the wrapper spanning pill + panel, so it only fires once the pointer
     truly leaves that whole region. */
  const openPanel = (panel: PanelKey | null) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setActivePanel(panel);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActivePanel(null), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };

  /* Compact ≈ logo(160) + sep + 8 links(~580) + sep + CTA(~90) + padding ≈ 900 */
  const COMPACT_W = 920;
  const targetW   = scrolled ? expandedW : COMPACT_W;

  return (
    <>
      {/* ══ DESKTOP ══════════════════════════════════════════════════════════ */}
      <div data-theme="dark" className="fixed top-0 left-0 right-0 z-50 hidden md:block pointer-events-none">

        {/* Centering wrapper — flex column so the panel stacks under the pill,
            both sharing one hover region for the grace-delay close logic */}
        <div
          className="absolute top-4 inset-x-0 flex flex-col items-center"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >

        {/* THE pill — springs its width, centered by parent flex */}
        <motion.div
          animate={{ width: targetW }}
          transition={SPRING}
          className="pointer-events-auto flex items-center rounded-full"
          style={{
            /* Glass: contrast by default, lighter on expand */
            backdropFilter:  scrolled ? 'blur(16px)' : 'blur(28px)',
            WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(28px)',
            backgroundColor: scrolled ? 'rgba(10,10,10,0.75)' : 'rgba(10,10,10,0.95)',
            border:          scrolled ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow:       scrolled
              ? '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 8px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)',
            transition: 'background-color 0.45s ease, backdrop-filter 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',
            padding: '6px 10px 6px 14px',
            isolation: 'isolate',
          }}
        >
          {/* Logo — always left */}
          <a href="#" className="flex items-center shrink-0 mr-3" aria-label="Cybersage">
            <Image
              src="/sage/sage_horiz1_white.png"
              alt="Cybersage"
              width={200}
              height={50}
              priority
              className="block object-contain"
              style={{ height: 46, width: 'auto' }}
            />
          </a>

          {/* Separator */}
          <div className="h-5 w-px bg-white/12 shrink-0 mr-1" />

          {/* Nav links — always in the absolute center of the pill */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.label} {...l} isOpen={l.panel != null && activePanel === l.panel} onEnter={openPanel} />
            ))}
          </div>

          {/* Push CTA to the right */}
          <div className="flex-1" />

          {/* Separator */}
          <div className="h-5 w-px bg-white/12 shrink-0 ml-1 mr-3" />

          {/* CTA — always right */}
          <HireBtn />
        </motion.div>

        <MegaPanel active={activePanel} />
        </div> {/* end centering wrapper */}
      </div>

      {/* ══ MOBILE ═══════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden pointer-events-none">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">

          {/* Logo pill */}
          <a
            href="#"
            className="flex items-center rounded-full px-4 py-2.5"
            style={{
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              backgroundColor: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 6px 28px rgba(0,0,0,0.40)',
            }}
          >
            <Image
              src="/sage/sage_horiz1_white.png"
              alt="Cybersage"
              width={200}
              height={50}
              priority
              className="block object-contain"
              style={{ height: 38, width: 'auto' }}
            />
          </a>

          {/* Menu pill */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center gap-2.5 rounded-full px-4 py-3"
            style={{
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              backgroundColor: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 6px 28px rgba(0,0,0,0.40)',
            }}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.25 w-3.75">
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
                className="block h-px bg-white w-full origin-center"
              />
              <motion.span
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                transition={{ duration: 0.16 }}
                className="block h-px bg-white w-full"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
                className="block h-px bg-white w-full origin-center"
              />
            </div>
          </button>
        </div>

        {/* Mobile drawer — clips down from top */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)'   }}
              exit={{    clipPath: 'inset(0 0 100% 0)'  }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 h-screen overflow-y-auto bg-black/95 backdrop-blur-2xl pt-24 px-6 pb-10 flex flex-col pointer-events-auto"
            >
              {/* Visible close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"
                aria-label="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {NAV_LINKS.map((link, i) => (
                <MobileNavRow
                  key={link.label}
                  link={link}
                  i={i}
                  expanded={link.panel != null && mobileExpanded === link.panel}
                  onToggle={() => setMobileExpanded((cur) => (cur === link.panel ? null : link.panel ?? null))}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="mt-auto pt-8"
              >
                <button
                  onClick={() => { setMobileOpen(false); window.dispatchEvent(new CustomEvent('open-contact-modal')); }}
                  className="flex items-center justify-center gap-2 bg-white text-black rounded-full py-4 w-full"
                >
                  <span className="text-[0.68rem] font-medium tracking-[0.18em] uppercase" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    Hire Me
                  </span>
                  <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                    <ArrowRight size={10} className="text-black" />
                  </span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
