import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '@/content/services';
import { SubpageEnd, SubpageTop } from '@/components/SubpageChrome';

const BASE_URL = 'https://cybersage.dev';

export const metadata: Metadata = {
  title: 'Services: architecture, cloud, backends',
  description:
    'Five services from Abakwe Carrington: systems architecture, cloud and DevOps, distributed backends, reliability work and full-stack delivery.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
        ],
      },
      {
        '@type': 'ItemList',
        itemListElement: SERVICES.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.title,
          url: `${BASE_URL}/services/${s.slug}`,
        })),
      },
    ],
  };

  return (
    <div data-theme="dark" className="work-page min-h-screen bg-[#0A0A0A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <SubpageTop label="SHEET S / SERVICES" />

      <main id="main" tabIndex={-1} className="outline-none">
        <section className="work-wrap work-hero" aria-labelledby="services-title">
          <div className="work-topline t-mono">
            <span>Cybersage / Services</span>
            <span className="hidden sm:inline">Architecture first</span>
            <span>{String(SERVICES.length).padStart(2, '0')} services</span>
          </div>
          <h1 id="services-title" className="case-title svc-page-title">Five things I get <em>hired</em> to build.</h1>
          <p className="case-lede">
            Systems architecture, cloud infrastructure, distributed backends, reliability work and full-stack delivery, for clients in Nigeria, the United States, the United Kingdom and Canada.
          </p>
        </section>

        <ul className="work-wrap svc-list">
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="svc-index-row group">
                <span className="t-mono svc-index-no">{s.index}</span>
                <span className="svc-index-main">
                  <span className="svc-index-title">{s.title}</span>
                  <span className="svc-index-short">{s.short}</span>
                </span>
                <span className="t-mono svc-index-kw">{s.keywords.slice(0, 3).join(' · ')}</span>
                <span aria-hidden className="svc-index-arrow"><ArrowUpRight size={22} strokeWidth={1.5} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <SubpageEnd note="Services / 05" />
    </div>
  );
}
