import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { PROJECTS, VERTICALS } from '@/content/projects';
import { SubpageEnd, SubpageTop } from '@/components/SubpageChrome';
import { WorkIndex } from './WorkIndex';

export const metadata: Metadata = {
  title: `Work: all ${PROJECTS.length} projects`,
  description:
    'Every project by Abakwe Carrington, filterable by industry: fintech, e-commerce, healthcare, SaaS and AI, oil and gas, and brand sites.',
  alternates: { canonical: '/work' },
};

const years = PROJECTS.map((p) => Number(p.year)).filter(Boolean);
const FIRST_YEAR = Math.min(...years);
const LAST_YEAR = Math.max(...years);
const LIVE = PROJECTS.filter((p) => p.link).length;

/** Facts only: every number here is computed from the project list or already stated on the site. */
const STATS = [
  { label: 'Projects', value: String(PROJECTS.length) },
  { label: 'Industries', value: String(VERTICALS.length) },
  { label: 'Live links', value: String(LIVE) },
  { label: 'Years active', value: `${FIRST_YEAR}–${String(LAST_YEAR).slice(2)}` },
] as const;

/**
 * The full index, drawn as a sheet: a title that runs edge to edge, a row of
 * facts, then every project as an index you can scan (with a preview that
 * follows the pointer) or as plates. Copy rules from content/projects.ts apply.
 */
export default function WorkPage() {
  return (
    <div data-theme="dark" className="work-page min-h-screen bg-[#0A0A0A] text-white">
      <SubpageTop label="SHEET W / FULL INDEX" />

      <main id="main" tabIndex={-1} className="outline-none">
        <section className="work-wrap work-hero" aria-labelledby="work-title">
          <div className="work-topline t-mono">
            <span>Cybersage / Index</span>
            <span className="hidden sm:inline">Newest first</span>
            <span>{FIRST_YEAR} — {LAST_YEAR}</span>
          </div>

          <div className="work-hero-grid">
            {/* The wrapper owns the size and layout; the h1 is the real phrase, the count sits outside it. */}
            <div className="work-title">
              <h1 id="work-title" className="work-title-h">
                <span className="work-title-mask">
                  {'WORK'.split('').map((c, i) => (
                    <span key={i} className="work-title-char" style={{ '--i': i } as CSSProperties}>{c}</span>
                  ))}
                </span>
                <span className="sr-only"> — every build, sorted by the industry it serves</span>
              </h1>
              <sup aria-hidden className="work-title-count">({PROJECTS.length})</sup>
            </div>

            <div className="work-hero-copy">
              <p className="work-hero-line">Every build, sorted by the industry it serves.</p>
              <p className="t-body text-on-ink-2">
                {PROJECTS.length} projects for clients in Nigeria, the United States, the United Kingdom and Canada, newest first. The latest eight are also on the home page.
              </p>
            </div>
          </div>

          <dl className="work-stats">
            {STATS.map((s, i) => (
              <div key={s.label} className="work-stat" style={{ '--i': i } as CSSProperties}>
                <dt className="t-mono">{String(i + 1).padStart(2, '0')} / {s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <WorkIndex />
      </main>

      <SubpageEnd note={`End of index / ${PROJECTS.length} of ${PROJECTS.length}`} />
    </div>
  );
}
