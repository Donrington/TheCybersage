import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { SheetFrame } from '@/components/SheetFrame';
import { SoundToggle } from '@/components/SoundToggle';

/**
 * Chrome shared by the standalone pages (/work, /work/[slug], /services,
 * /services/[slug]): skip link, sheet frame, the framed header bar, and a
 * closing call to action. The pages render inside `.work-page`, so they share
 * the ink theme and the `.work-*` styles in globals.css.
 */
export function SubpageTop({ label }: { label: string }) {
  return (
    <>
      <SheetFrame />
      <a
        href="#main"
        className="fixed top-3 left-3 z-[10000] -translate-y-24 bg-white px-4 py-3 text-sm font-semibold text-[#0A0A0A] focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        Skip to content
      </a>
      <header className="work-wrap pt-[26px]">
        <div className="flex h-[52px] items-stretch border border-white/20">
          <Link href="/" aria-label="Cybersage home" className="flex items-center border-r border-white/12 px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
            <Image src="/sage/sage_horiz1_white.png" alt="Cybersage" width={200} height={88} className="block h-9 w-auto" priority />
          </Link>
          <span className="t-mono hidden flex-1 items-center px-4 text-on-ink-3 sm:flex">{label}</span>
          <span className="flex-1 sm:hidden" />
          <SoundToggle variant="bar" />
          <Link href="/" className="nav-cell !border-r-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.12)' }}>
            <ArrowLeft size={13} aria-hidden />
            <span className="nav-roll" data-text="Back home"><span>Back home</span></span>
          </Link>
        </div>
      </header>
    </>
  );
}

export function SubpageEnd({ note, line = 'Have a project', em = 'in mind?' }: { note: string; line?: string; em?: string }) {
  return (
    <footer className="work-end">
      <div className="work-wrap">
        <p className="t-mono text-on-ink-3">{note}</p>
        <Link href="/#contact" className="work-end-cta group" data-cursor="hire" data-sound="primary">
          <span className="work-end-line">
            {line} <em>{em}</em>
          </span>
          <span aria-hidden className="work-end-arrow">
            <ArrowUpRight size={28} strokeWidth={1.5} />
          </span>
        </Link>
        <div className="work-end-row t-mono">
          <span>Lagos, Nigeria / Remote worldwide</span>
          <nav aria-label="Site" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/work" className="work-end-link">All work</Link>
            <Link href="/services" className="work-end-link">Services</Link>
            <Link href="/" className="work-end-link">Home</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
