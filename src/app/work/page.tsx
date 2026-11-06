import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PROJECTS } from '@/content/projects';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { SheetFrame } from '@/components/SheetFrame';
import { WorkIndex } from './WorkIndex';

export const metadata: Metadata = {
  title: `Work: all ${PROJECTS.length} projects`,
  description:
    'Every project by Abakwe Carrington (Cybersage), filterable by vertical: fintech, e-commerce, healthcare, SaaS and AI, oil, gas and industrial, and brand sites.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return (
    <div data-theme="dark" className="min-h-screen bg-[#0A0A0A] text-white">
      <SheetFrame />
      <a
        href="#main"
        className="fixed top-3 left-3 z-[10000] -translate-y-24 bg-white px-4 py-3 text-sm font-semibold text-[#0A0A0A] focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        Skip to content
      </a>

      <header className="mx-auto max-w-[1440px] px-[clamp(1.5rem,4vw,5rem)] pt-[26px]">
        <div className="flex h-[52px] items-stretch border border-white/20">
          <Link href="/" aria-label="Cybersage home" className="flex items-center border-r border-white/12 px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
            <Image src="/sage/sage_horiz1_white.png" alt="Cybersage" width={200} height={88} className="block h-9 w-auto" priority />
          </Link>
          <span className="t-mono hidden flex-1 items-center px-4 text-on-ink-3 sm:flex">SHEET W / FULL INDEX</span>
          <span className="flex-1 sm:hidden" />
          <Link href="/" className="nav-cell !border-r-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.12)' }}>
            <ArrowLeft size={13} aria-hidden />
            <span className="nav-roll" data-text="Back home"><span>Back home</span></span>
          </Link>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1440px] px-[clamp(1.5rem,4vw,5rem)] pt-[clamp(3rem,7vw,6rem)] pb-24 outline-none">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">All work</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
          <span className="t-mono hidden text-on-ink-3 sm:inline">INDEX · {PROJECTS.length} PROJECTS</span>
        </div>
        <SplitHeading as="h1" className="t-h2 max-w-[20ch] text-white" text="Every build, sorted by the *industry* it serves." />
        <p className="t-lede mt-5 max-w-[60ch] text-on-ink-2">
          {PROJECTS.length} projects for clients in Nigeria, the United States, the United Kingdom and Canada, newest first. The latest eight are also on the home page.
        </p>
        <WorkIndex />
      </main>

      <footer className="border-t border-on-ink-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-[clamp(1.5rem,4vw,5rem)] py-10">
          <p className="t-mono text-on-ink-3">HAVE A PROJECT IN MIND?</p>
          <Link
            href="/#contact"
            className="group t-mono inline-flex min-h-12 items-center bg-white px-6 text-[#0A0A0A] uppercase transition-colors hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Let&rsquo;s talk
          </Link>
        </div>
      </footer>
    </div>
  );
}
