import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES, serviceBySlug } from '@/content/services';
import { PROJECTS, projectById } from '@/content/projects';
import { SubpageEnd, SubpageTop } from '@/components/SubpageChrome';

const BASE_URL = 'https://cybersage.dev';

export const dynamicParams = false;
export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

const clip = (text: string, max = 155) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s—-]+$/, '')}…`;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  return {
    title: `${s.title} services`,
    description: clip(`${s.short} ${s.body}`),
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { type: 'website', url: `${BASE_URL}/services/${s.slug}`, title: `${s.title} services` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();

  const proof = projectById(s.proof[0]);
  // Other work that used these tools, newest first, without repeating the proof project.
  const keys = s.keywords.map((k) => k.toLowerCase());
  const related = PROJECTS.filter((p) => p.id !== s.proof[0] && p.stack.some((t) => keys.includes(t.toLowerCase()))).slice(0, 3);
  const others = SERVICES.filter((x) => x.slug !== s.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
          { '@type': 'ListItem', position: 3, name: s.title, item: `${BASE_URL}/services/${s.slug}` },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${BASE_URL}/services/${s.slug}#service`,
        name: s.title,
        serviceType: s.title,
        description: `${s.short} ${s.body}`,
        url: `${BASE_URL}/services/${s.slug}`,
        provider: { '@id': `${BASE_URL}/#person` },
        areaServed: ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Worldwide'],
      },
    ],
  };

  return (
    <div data-theme="dark" className="work-page min-h-screen bg-[#0A0A0A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <SubpageTop label={`SHEET S / SERVICE ${s.index}`} />

      <main id="main" tabIndex={-1} className="outline-none">
        <article className="work-wrap case">
          <nav aria-label="Breadcrumb" className="case-crumbs t-mono">
            <Link href="/services">Services</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{s.title}</span>
            <span className="case-crumbs-end">{s.index} / {String(SERVICES.length).padStart(2, '0')}</span>
          </nav>

          <header className="case-head">
            <p className="case-kicker t-mono">Service {s.index} · {s.keywords.slice(0, 3).join(' · ')}</p>
            <h1 className="case-title">{s.title}</h1>
            <p className="case-lede">{s.short}</p>
          </header>

          <div className="case-body case-body-top">
            <section aria-labelledby="svc-what">
              <h2 id="svc-what" className="case-h t-mono">What it is</h2>
              <p className="t-lede">{s.body}</p>
            </section>
            <section aria-labelledby="svc-tools">
              <h2 id="svc-tools" className="case-h t-mono">Tools and techniques</h2>
              <ul className="case-tags">
                {s.keywords.map((k) => (
                  <li key={k} className="t-mono">{k}</li>
                ))}
              </ul>
              <a href="/pricing" className="case-link-row">
                See pricing <ArrowUpRight size={15} aria-hidden />
              </a>
            </section>
          </div>

          {proof && (
            <section aria-labelledby="svc-proof" className="svc-proof">
              <h2 id="svc-proof" className="case-h t-mono">Proof</h2>
              <Link href={`/work/${proof.id}`} className="svc-proof-card group">
                <span className="svc-proof-img">
                  <Image src={proof.image} alt={`${proof.name}: ${proof.category}`} fill sizes="(min-width: 900px) 46vw, 92vw" quality={80} className="object-cover object-top" />
                </span>
                <span className="svc-proof-text">
                  <span className="t-mono case-more-cat">{proof.category} · {proof.year}</span>
                  <span className="svc-proof-name">{proof.name}</span>
                  <span className="svc-proof-result">{s.proof[1]}</span>
                  <span className="t-mono case-visit">Read the case study <ArrowUpRight size={16} aria-hidden /></span>
                </span>
              </Link>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="svc-related" className="case-more">
              <h2 id="svc-related" className="case-h t-mono">More work with these tools</h2>
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
          )}

          <section aria-labelledby="svc-others" className="svc-others">
            <h2 id="svc-others" className="case-h t-mono">Other services</h2>
            <ul className="case-links">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/services/${o.slug}`}>
                    <span className="t-mono">{o.index}</span> {o.title} <ArrowUpRight size={15} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>

      <SubpageEnd note={`Service ${s.index} / ${String(SERVICES.length).padStart(2, '0')}`} />
    </div>
  );
}
