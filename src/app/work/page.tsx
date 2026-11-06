import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PROJECTS } from '@/content/projects';
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
      <header className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-[clamp(1rem,4vw,5rem)] py-6">
        <Link href="/" aria-label="Cybersage home" className="inline-flex min-h-11 items-center">
          <Image src="/sage/sage_horiz1_white.png" alt="Cybersage" width={140} height={36} className="h-8 w-auto" />
        </Link>
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-on-ink-2 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden className="transition-transform group-hover:-translate-x-0.5" />
          Back home
        </Link>
      </header>

      <main className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] pt-[clamp(2rem,6vw,5rem)] pb-24">
        <p className="t-label mb-6 text-on-ink-2">All work</p>
        <h1 className="t-h2 max-w-[20ch] text-white">Every build, sorted by the industry it serves.</h1>
        <p className="t-body mt-5 max-w-[60ch] text-on-ink-2">
          {PROJECTS.length} projects for clients in Nigeria, the United States, the United Kingdom and Canada.
          The latest eight are on the home page, newest first.
        </p>
        <WorkIndex />
      </main>

      <footer className="border-t border-on-ink-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-[clamp(1rem,4vw,5rem)] py-10">
          <p className="t-body text-on-ink-2">Have a project in mind?</p>
          <Link
            href="/#contact"
            className="inline-flex min-h-11 items-center bg-white px-6 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] transition-colors hover:bg-white/85"
          >
            Let&rsquo;s talk
          </Link>
        </div>
      </footer>
    </div>
  );
}
