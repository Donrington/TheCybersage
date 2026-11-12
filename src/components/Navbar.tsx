'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { Corners } from '@/components/ui/Corners';
import { NAV_LINKS as SITE_NAV } from '@/content/site';

/**
 * Navigation as a technical drawing sheet (idea from the heronaiapp.com study, docs/redesign/heron-analysis.md):
 * square cells divided by hairlines, mono labels, corner ticks, wipe fills and rolling labels. The floating bar still
 * springs between a compact and an expanded width, and Work / Services still open a hover mega-panel, now drawn as a
 * sheet that wipes open and fills its cells in one by one.
 */

type PanelKey = 'services' | 'work';

const NAV_PANELS: Partial<Record<string, PanelKey>> = { Work: 'work', Services: 'services' };
const NAV_LINKS: { label: string; href: string; panel?: PanelKey }[] = SITE_NAV.map((l) => ({
  label: l.label,
  href: l.href,
  panel: NAV_PANELS[l.label],
}));

const SERVICES_PREVIEW = [
  { index: '01', title: 'Systems Architecture', short: 'Design before code.' },
  { index: '02', title: 'Cloud Infrastructure & DevOps', short: 'AWS · Docker · CI/CD.' },
  { index: '03', title: 'Full Stack Delivery', short: 'When the system needs a face.' },
];

const WORK_PREVIEW = [
  { name: 'Winsko Serves', category: 'Logistics & EPC Platform', image: '/projects/winsko.webp', link: 'https://winskoserves.com.ng' },
  { name: 'TUFF', category: 'Fitness Challenge Platform', image: '/projects/tuff-app-home.png', link: 'https://thetuffapp.com' },
  { name: 'Circles of Life Healthcare', category: 'Healthcare + AI Platform', image: '/logo/colhcs.png', link: 'https://circlesoflifehcs.com' },
  { name: 'RecoverDerm', category: 'Paramedical Platform', image: '/projects/recoverderm.png', link: 'https://recoverderm.ca' },
  { name: 'Wyns Collections', category: 'Ecommerce Platform', image: '/projects/wynscollections.png', link: 'https://wyns-collections.vercel.app' },
  { name: 'The Black-E', category: 'Arts & Culture', image: '/projects/THE_BLACK-E.png', link: 'https://theblacke.vercel.app' },
];

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 32, mass: 0.75 };
const EASE = [0.2, 0.7, 0.2, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** Section ids the bar highlights as you scroll. */
const SPY_IDS = ['work', 'services', 'about', 'contact'];

function useScrollSpy() {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const els = SPY_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const top = () => { if (window.scrollY < 200) setCurrent(null); };
    window.addEventListener('scroll', top, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', top); };
  }, []);
  return current;
}

/* A label whose letters roll up on hover (two copies, one slides in as the other leaves). */
function Roll({ children }: { children: string }) {
  return (
    <span className="nav-roll" data-text={children}>
      <span>{children}</span>
    </span>
  );
}

function NavLink({
  label, href, panel, index, isOpen, current, onEnter,
}: {
  label: string; href: string; panel?: PanelKey; index: number; isOpen: boolean; current: boolean;
  onEnter: (panel: PanelKey | null) => void;
}) {
  return (
    <a
      href={href}
      onMouseEnter={() => onEnter(panel ?? null)}
      onFocus={() => onEnter(panel ?? null)}
      aria-current={current ? 'location' : undefined}
      aria-expanded={panel ? isOpen : undefined}
      aria-haspopup={panel ? 'true' : undefined}
      data-open={isOpen || undefined}
      className="nav-cell"
    >
      <span className="nav-idx">{pad(index + 1)}</span>
      <Roll>{label}</Roll>
      {panel && (
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="inline-flex">
          <ChevronDown size={9} strokeWidth={2.5} aria-hidden />
        </motion.span>
      )}
      {current && <span aria-hidden className="nav-here" />}
      <Corners />
    </a>
  );
}

function HireBtn() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
      data-magnetic
      className="nav-hire group"
    >
      <Roll>Hire me</Roll>
      <span className="nav-hire-arrow" aria-hidden>
        <ArrowRight size={12} />
        <ArrowRight size={12} />
      </span>
    </button>
  );
}

/* ── Mega-panel content ──────────────────────────────────────────────────── */
const tileVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.045, duration: 0.4, ease: EASE } }),
};

function ServicesPanelContent() {
  return (
    <div className="grid grid-cols-2 gap-px bg-white/10">
      {SERVICES_PREVIEW.map((s, i) => (
        <motion.a key={s.index} custom={i} variants={tileVariants} initial="hidden" animate="show" href="#services" className="nav-tile">
          <span className="t-mono text-on-ink-3">{s.index}</span>
          <span className="text-[0.95rem] font-extrabold leading-tight tracking-tight text-white">{s.title}</span>
          <span className="text-xs text-on-ink-3">{s.short}</span>
          <span className="nav-tile-go t-mono">EXPLORE <ArrowUpRight size={11} aria-hidden /></span>
        </motion.a>
      ))}
      <motion.button
        custom={SERVICES_PREVIEW.length}
        variants={tileVariants}
        initial="hidden"
        animate="show"
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
        className="nav-tile nav-tile-cta text-left"
      >
        <span className="t-mono text-on-ink-3">CTA</span>
        <span className="text-[1.05rem] font-extrabold leading-tight tracking-tight text-white">
          Let&rsquo;s build <span className="serif-i">something.</span>
        </span>
        <span className="nav-tile-go t-mono" style={{ opacity: 1, transform: 'none' }}>START A PROJECT <ArrowUpRight size={11} aria-hidden /></span>
      </motion.button>
    </div>
  );
}

function WorkPanelContent() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-px bg-white/10">
        {WORK_PREVIEW.map((p, i) => (
          <motion.a
            key={p.name}
            custom={i}
            variants={tileVariants}
            initial="hidden"
            animate="show"
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="view"
            className="nav-tile nav-fig"
          >
            <span className="relative block aspect-[16/10] w-full overflow-hidden border border-white/10">
              <Image src={p.image} alt="" fill sizes="220px" className="nav-fig-img object-cover" />
              <span className="t-mono absolute top-1 left-1 bg-[#0A0A0A] px-1.5 py-0.5 text-on-ink-2">FIG.{pad(i + 1)}</span>
            </span>
            <span className="t-mono text-on-ink-3">{p.category}</span>
            <span className="flex items-center justify-between gap-2 text-[0.82rem] font-bold tracking-tight text-white">
              {p.name}
              <ArrowUpRight size={12} aria-hidden className="nav-tile-arrow shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </span>
          </motion.a>
        ))}
      </div>
      <a href="/work" className="nav-tile mt-px flex-row items-center justify-center text-center" style={{ flexDirection: 'row' }}>
        <span className="t-mono text-on-ink-2">VIEW ALL WORK</span>
        <ArrowUpRight size={12} aria-hidden className="text-on-ink-2" />
      </a>
    </div>
  );
}

function MegaPanel({ active }: { active: PanelKey | null }) {
  const reduced = useReducedMotion();
  const label = active === 'services' ? 'SERVICES' : 'SELECTED WORK';
  const count = active === 'services' ? `${SERVICES_PREVIEW.length} OF 5` : `${WORK_PREVIEW.length} OF 26`;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="panel"
          initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)', opacity: 1 }}
          animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.38, ease: EASE }}
          className="nav-sheet pointer-events-auto mt-2"
          style={{ width: 'min(760px, 92vw)' }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="t-mono text-on-ink-2">{active === 'services' ? 'A' : 'B'} / {label}</span>
            <span className="t-mono text-on-ink-3">{count}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
              {active === 'services' ? <ServicesPanelContent /> : <WorkPanelContent />}
            </motion.div>
          </AnimatePresence>
          <Corners />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Mobile ──────────────────────────────────────────────────────────────── */
function MobileNavRow({
  link, i, expanded, onToggle, onNavigate,
}: {
  link: { label: string; href: string; panel?: PanelKey }; i: number; expanded: boolean; onToggle: () => void; onNavigate: () => void;
}) {
  const row = (
    <>
      <span className="t-mono w-8 shrink-0 text-on-ink-3">{pad(i + 1)}</span>
      <span className="flex-1 font-extrabold tracking-[-0.04em] text-white" style={{ fontSize: 'clamp(2rem, 9vw, 2.9rem)', lineHeight: 1.05 }}>
        {link.label}
      </span>
    </>
  );
  const anim = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.18 + i * 0.06, duration: 0.45, ease: EASE } };

  if (!link.panel) {
    return (
      <motion.a href={link.href} onClick={onNavigate} {...anim} className="flex min-h-16 items-center border-b border-white/10 py-3">
        {row}
        <ArrowRight size={18} aria-hidden className="text-on-ink-3" />
      </motion.a>
    );
  }
  return (
    <motion.div {...anim} className="border-b border-white/10">
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex min-h-16 w-full items-center py-3 text-left">
        {row}
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3, ease: EASE }} className="inline-flex">
          <ChevronDown size={18} aria-hidden className="text-on-ink-3" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.34, ease: EASE }} className="overflow-hidden">
            <div className="flex flex-col gap-px bg-white/10 mb-5 border border-white/10">
              {link.panel === 'services'
                ? SERVICES_PREVIEW.map((s) => (
                    <a key={s.index} href="#services" onClick={onNavigate} className="flex items-center gap-3 bg-[#0A0A0A] px-3.5 py-3">
                      <span className="t-mono text-on-ink-3">{s.index}</span>
                      <span className="text-sm font-bold text-white">{s.title}</span>
                    </a>
                  ))
                : WORK_PREVIEW.map((p, n) => (
                    <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#0A0A0A] px-3.5 py-2.5">
                      <span className="relative block h-7 w-11 shrink-0 overflow-hidden border border-white/10">
                        <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="t-mono text-on-ink-3">FIG.{pad(n + 1)} · {p.category}</span>
                        <span className="text-sm font-bold text-white">{p.name}</span>
                      </span>
                    </a>
                  ))}
              <a href={link.label === 'Work' ? '/work' : link.href} onClick={onNavigate} className="t-mono bg-[#0A0A0A] px-3.5 py-3 text-center text-on-ink-2">
                VIEW ALL {link.label.toUpperCase()} →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [expandedW, setExpandedW] = useState(1280);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<PanelKey | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  const lockRef = useRef(false); // keep the bar visible while a panel or the mobile menu is open
  const reduced = useReducedMotion();
  const spy = useScrollSpy();

  useEffect(() => {
    const calc = () => {
      const padding = Math.min(Math.max(window.innerWidth * 0.04, 20), 80);
      setExpandedW(Math.min(window.innerWidth - padding * 2, 1040));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    // Scrolling down hides the bar, scrolling up (or being near the top) brings it back.
    let lastY = window.scrollY, raf = 0;
    const apply = (h: boolean) => { if (hiddenRef.current !== h) { hiddenRef.current = h; setHidden(h); } };
    const fn = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 60);
      const dy = y - lastY;
      if (y < 90 || lockRef.current) apply(false);
      else if (dy > 8) apply(true);
      else if (dy < -8) apply(false);
      if (Math.abs(dy) > 8) lastY = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(fn); };
    fn();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setActivePanel(null);
      setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock page scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    if (mobileOpen) document.body.dataset.navOpen = ''; else delete document.body.dataset.navOpen;
    return () => { document.body.style.overflow = ''; delete document.body.dataset.navOpen; };
  }, [mobileOpen]);

  useEffect(() => { lockRef.current = mobileOpen || activePanel !== null; if (lockRef.current) { hiddenRef.current = false; setHidden(false); } }, [mobileOpen, activePanel]);

  const openPanel = (panel: PanelKey | null) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setActivePanel(panel);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActivePanel(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };

  const COMPACT_W = 940;
  const targetW = scrolled ? expandedW : COMPACT_W;

  return (
    <>
      {/* ══ DESKTOP ══ */}
      <div data-theme="dark" className="pointer-events-none fixed top-0 right-0 left-0 z-50 hidden md:block" style={{ transform: hidden ? 'translateY(-150px)' : 'none', transition: reduced ? 'none' : 'transform 450ms cubic-bezier(0.2,0.7,0.2,1)' }} onFocusCapture={() => { hiddenRef.current = false; setHidden(false); }}>
        <div className="nav-enter absolute inset-x-0 top-[22px] flex flex-col items-center" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <motion.nav
            aria-label="Primary"
            animate={{ width: targetW }}
            transition={reduced ? { duration: 0 } : SPRING}
            className="nav-bar pointer-events-auto"
            data-scrolled={scrolled || undefined}
          >
            <a href="#" className="nav-logo" aria-label="Cybersage home">
              <Image src="/sage/sage_horiz1_white.png" alt="Cybersage" width={200} height={88} loading="eager" className="block object-contain" style={{ height: 40, width: 'auto' }} />
            </a>
            <div className="absolute left-1/2 flex h-full -translate-x-1/2 items-stretch">
              {NAV_LINKS.map((l, i) => (
                <NavLink
                  key={l.label}
                  {...l}
                  index={i}
                  isOpen={l.panel != null && activePanel === l.panel}
                  current={l.href.startsWith('#') && spy === l.href.slice(1)}
                  onEnter={openPanel}
                />
              ))}
            </div>
            <div className="flex-1" />
            <HireBtn />
            <Corners />
          </motion.nav>
          <MegaPanel active={activePanel} />
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div data-theme="dark" className="pointer-events-none fixed top-0 right-0 left-0 z-50 md:hidden" style={{ transform: hidden ? 'translateY(-90px)' : 'none', transition: reduced ? 'none' : 'transform 450ms cubic-bezier(0.2,0.7,0.2,1)' }}>
        <div className="nav-enter pointer-events-auto absolute top-[14px] right-[14px] left-[14px] z-20 flex h-14 items-stretch border border-white/15 bg-[#0A0A0A]/90 backdrop-blur-md">
          <a href="#" className="flex items-center border-r border-white/10 px-3.5" aria-label="Cybersage home">
            <Image src="/sage/sage_horiz1_white.png" alt="Cybersage" width={200} height={88} loading="eager" className="block object-contain" style={{ height: 34, width: 'auto' }} />
          </a>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="t-mono flex items-center gap-3 border-l border-white/10 px-4 text-white"
          >
            {mobileOpen ? 'CLOSE' : 'MENU'}
            <span className="relative block h-3 w-4" aria-hidden>
              <motion.span className="absolute top-0 left-0 h-px w-full bg-white" animate={mobileOpen ? { y: 5.5, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.25, ease: EASE }} />
              <motion.span className="absolute top-[5.5px] left-0 h-px w-full bg-white" animate={{ opacity: mobileOpen ? 0 : 1 }} transition={{ duration: 0.15 }} />
              <motion.span className="absolute top-[11px] left-0 h-px w-full bg-white" animate={mobileOpen ? { y: -5.5, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.25, ease: EASE }} />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              exit={{ clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              className="pointer-events-auto absolute inset-0 flex h-[100svh] flex-col overflow-y-auto bg-[#0A0A0A] px-6 pt-[88px] pb-8"
            >
              <p className="t-mono mb-2 text-on-ink-3">NAVIGATION / SHEET 01</p>
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
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4, ease: EASE }} className="mt-auto pt-8">
                <dl className="t-mono mb-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-on-ink-2">
                  <dt className="text-on-ink-3">BASE</dt><dd>LAGOS, NIGERIA · UTC+1</dd>
                  <dt className="text-on-ink-3">MAIL</dt><dd>HELLO@CYBERSAGE.DEV</dd>
                  <dt className="text-on-ink-3">STATUS</dt><dd className="flex items-center gap-2"><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-live" />AVAILABLE FOR WORK</dd>
                </dl>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); window.dispatchEvent(new CustomEvent('open-contact-modal')); }}
                  className="t-mono flex min-h-14 w-full items-center justify-between bg-white px-5 text-[0.8rem] text-[#0A0A0A]"
                >
                  HIRE ME
                  <ArrowRight size={16} aria-hidden />
                </button>
              </motion.div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="sr-only"><X /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
