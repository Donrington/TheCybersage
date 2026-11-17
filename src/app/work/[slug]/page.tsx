import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import {
  PROJECTS,
  VERTICALS,
  VERTICAL_OF,
  featuredById,
  isIndexableCaseStudy,
  projectById,
} from '@/content/projects';
import { SERVICES } from '@/content/services';
import { SubpageEnd, SubpageTop } from '@/components/SubpageChrome';

const BASE_URL = 'https://cybersage.dev';
const VERTICAL_LABEL = Object.fromEntries(VERTICALS.map((v) => [v.key, v.label]));
const pad = (n: number) => String(n).padStart(2, '0');
const hostOf = (link?: string) => (link ? new URL(link).host.replace(/^www\./, '') : null);

/** Cut at a word boundary so descriptions stay under about 155 characters. */
const clip = (text: string, max = 155) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s—-]+$/, '')}…`;
};

export const dynamicParams = false;
export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectById(slug);
  if (!p) return {};
  const f = featuredById(p.id);
  const indexable = isIndexableCaseStudy(p.id);
  return {
    title: `${p.name}: ${p.category}`,
    description: clip(f ? `${f.outcome} Built by Abakwe Carrington with ${f.tags.join(', ')}.` : `${p.tagline}`),
    alternates: { canonical: `/work/${p.id}` },
    // Pages without a real write-up stay out of the index (see content/projects.ts).
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: 'article',
      url: `${BASE_URL}/work/${p.id}`,
      title: `${p.name}: ${p.category}`,
      images: [{ url: `${BASE_URL}${f?.shots[0] ?? p.image}` }],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectById(slug);
  if (!p) notFound();

  const f = featuredById(p.id);
  const vertical = VERTICAL_OF[p.id];
  const number = PROJECTS.indexOf(p) + 1;
  const shots = f?.shots?.length ? f.shots : [p.image];
  const host = hostOf(p.link);

  // Related: same industry first, then the newest of the rest.
  const same = PROJECTS.filter((x) => x.id !== p.id && VERTICAL_OF[x.id] === vertical);
  const related = [...same, ...PROJECTS.filter((x) => x.id !== p.id && !same.includes(x))].slice(0, 3);
  // The service pages whose tools this project used.
  const stack = p.stack.map((t) => t.toLowerCase());
  const services = SERVICES.filter((s) => s.proof[0] === p.id || s.keywords.some((k) => stack.includes(k.toLowerCase()))).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${BASE_URL}/work` },
          { '@type': 'ListItem', position: 3, name: p.name, item: `${BASE_URL}/work/${p.id}` },
        ],
      },
      {
        '@type': 'CreativeWork',
        '@id': `${BASE_URL}/work/${p.id}#work`,
        name: p.name,
        headline: `${p.name}: ${p.category}`,
        description: f?.outcome ?? p.tagline,
        url: `${BASE_URL}/work/${p.id}`,
        image: `${BASE_URL}${shots[0]}`,
        dateCreated: p.year,
        genre: p.category,
        keywords: p.stack.join(', '),
        creator: { '@id': `${BASE_URL}/#person` },
        ...(p.link ? { sameAs: p.link } : {}),
      },
    ],
  };

  return (
    <div data-theme="dark" className="work-page min-h-screen bg-[#0A0A0A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <SubpageTop label={`SHEET W / CASE ${pad(number)}`} />

      <main id="main" tabIndex={-1} className="outline-none">
        <article className="work-wrap case">
          <nav aria-label="Breadcrumb" className="case-crumbs t-mono">
            <Link href="/work">Work</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{p.name}</span>
            <span className="case-crumbs-end">Plate {pad(number)} / {pad(PROJECTS.length)}</span>
          </nav>

          <header className="case-head">
            <p className="case-kicker t-mono">
              {p.category}
              {vertical && <> · {VERTICAL_LABEL[vertical]}</>} · {p.year}
            </p>
            <h1 className="case-title">{p.name}</h1>
            <p className="case-lede">{f?.outcome ?? p.tagline}</p>
          </header>

          <div className="case-hero">
            <Image src={shots[0]} alt={`${p.name}: ${p.category}`} fill priority sizes="(min-width: 1440px) 1300px, 92vw" quality={90} className="object-cover object-top" />
          </div>

          <dl className="case-facts">
            <div><dt className="t-mono">01 / Year</dt><dd>{p.year}</dd></div>
            <div><dt className="t-mono">02 / Industry</dt><dd>{vertical ? VERTICAL_LABEL[vertical] : p.category}</dd></div>
            <div><dt className="t-mono">03 / Role</dt><dd>{f?.role ?? 'Design and build'}</dd></div>
            <div>
              <dt className="t-mono">04 / Live site</dt>
              <dd>
                {p.link ? (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="case-visit">
                    {host} <ArrowUpRight size={16} aria-hidden /><span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  'Private build'
                )}
              </dd>
            </div>
          </dl>

          <div className="case-body">
            <section aria-labelledby="case-overview">
              <h2 id="case-overview" className="case-h t-mono">Overview</h2>
              <p className="t-lede">{p.tagline}</p>
              {f?.metric && (
                <p className="case-metric">
                  <b>{f.metric.value}</b>
                  <span className="t-mono">{f.metric.label}</span>
                </p>
              )}
            </section>
            <section aria-labelledby="case-stack">
              <h2 id="case-stack" className="case-h t-mono">Built with</h2>
              <ul className="case-tags">
                {p.stack.map((t) => (
                  <li key={t} className="t-mono">{t}</li>
                ))}
              </ul>
              {services.length > 0 && (
                <>
                  <h2 className="case-h t-mono case-h-gap">Services involved</h2>
                  <ul className="case-links">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/services/${s.slug}`}>
                          {s.title} <ArrowUpRight size={15} aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          {shots.length > 1 && (
            <div className="case-shots">
              {shots.slice(1).map((src) => (
                <div key={src} className="case-shot">
                  <Image src={src} alt={`${p.name}: additional screen`} fill sizes="(min-width: 900px) 46vw, 92vw" quality={85} className="object-cover object-top" />
                </div>
              ))}
            </div>
          )}

          <section aria-labelledby="case-more" className="case-more">
            <h2 id="case-more" className="case-h t-mono">More work</h2>
            <ul className="case-more-list">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/work/${r.id}`} className="case-more-card group">
                    <span className="case-more-img">
                      <Image src={r.image} alt="" fill sizes="(min-width: 900px) 30vw, 92vw" quality={75} className="object-cover object-top" />
                    </span>
                    <span className="case-more-name">{r.name}</span>
                    <span className="t-mono case-more-cat">{r.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>

      <SubpageEnd note={`Case ${pad(number)} / ${pad(PROJECTS.length)}`} />
    </div>
  );
}
