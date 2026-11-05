import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const CERTS = [
  { title: 'Full Stack Engineering', issuer: 'IBT Learning', year: '2025', file: '/certificates/Carrington Abakwe - 2025-08-04 - Full stack engineering Certificate (IBT Learning).pdf' },
  { title: 'Web Application Development', issuer: 'Moat Academy', year: '2024', file: '/certificates/Abakwe Carrington - Web application development (Moat Academy).jpeg' },
  { title: 'Web Development Internship', issuer: 'Zidio Development', year: '2024', file: '/certificates/Zidio Development - Web Devlopment Internship.jpeg' },
];

/** Resume card + one row of certificates, inside About (replaces the Credentials section). */
export function ResumeStrip() {
  return (
    <div className="mt-[clamp(3rem,6vw,5rem)] border-t border-black/10 pt-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-label text-on-canvas-3">Résumé · PDF · 2025</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink">Abakwe Carrington</p>
          <p className="t-body mt-1 text-on-canvas-2">Infrastructure &amp; Systems Architect · 5+ years · Remote</p>
          <p className="t-label mt-3 text-on-canvas-3">AWS · Docker · Go · Django · PostgreSQL · Redis</p>
        </div>
        <a
          href="/resume/Abakwe Carrington.pdf"
          download
          className="group inline-flex min-h-11 items-center gap-2 self-start bg-[#0A0A0A] px-6 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Download résumé
          <ArrowDownRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
        </a>
      </div>
      <ul className="mt-8 grid gap-3 md:grid-cols-3" aria-label="Certifications">
        {CERTS.map((c) => (
          <li key={c.title}>
            <a
              href={c.file}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-11 items-center justify-between gap-3 border border-black/10 px-4 py-3 transition-colors hover:border-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{c.title}</span>
                <span className="t-label text-on-canvas-3">
                  {c.issuer} · {c.year}
                </span>
              </span>
              <ArrowUpRight size={16} aria-hidden className="shrink-0 text-on-canvas-3 group-hover:text-ink" />
              <span className="sr-only">(opens certificate)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
