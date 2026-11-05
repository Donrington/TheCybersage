// Services, copy moved verbatim from the old Services component. proof = [project id, one real result].

export const SERVICES: {
  index: string; proof: [string, string]; title: string; short: string; body: string; keywords: string[];
}[] = [
  {
    index: '01',
    proof: ['anoc','Encrypted compliance platform for chartered accountants: zero breaches.'],
    title: 'Systems Architecture',
    short: 'Design before code.',
    body: 'Data models, service boundaries, API contracts, failure modes, and capacity planning — mapped before a line of production code. I deliver architectures teams can build on for years, with documentation that survives handover.',
    keywords: ['System Design', 'Multi-Tenant', 'Event-Driven', 'Capacity Planning'],
  },
  {
    index: '02',
    proof: ['nextgen','Deployment time cut 45%.'],
    title: 'Cloud Infrastructure & DevOps',
    short: 'AWS · Docker · CI/CD.',
    body: 'Container orchestration, GitHub Actions pipelines, zero-downtime deploys, environment management. I build infrastructure your team can actually understand — and rebuild from a single repo.',
    keywords: ['AWS', 'Docker', 'GitHub Actions', 'Terraform'],
  },
  {
    index: '03',
    proof: ['autoboy','Payment APIs stopped cascading-failing; DB responses 30% faster under peak load.'],
    title: 'Distributed Backends & APIs',
    short: 'Services that survive traffic spikes.',
    body: 'Rate-limiting, idempotency keys, circuit breakers, JWT auth, connection pooling, caching strategies. Go and Django services engineered to fail gracefully instead of cascading.',
    keywords: ['Go', 'Django', 'Redis', 'REST', 'WebSockets'],
  },
  {
    index: '04',
    proof: ['krkmotors','98/100 Lighthouse, sub-1s LCP.'],
    title: 'Reliability & Performance',
    short: "Find and fix what's slow.",
    body: 'Database query analysis, p95 latency hunting, caching architecture review, Core Web Vitals improvement. I find bottlenecks and eliminate them with evidence.',
    keywords: ['PostgreSQL', 'p95 Latency', 'Caching', 'Lighthouse'],
  },
  {
    index: '05',
    proof: ['wytnest','Dual-rail payments in NGN and USD, widgets embeddable anywhere.'],
    title: 'Full Stack Delivery',
    short: 'When the system needs a face.',
    body: 'Next.js front-ends, e-commerce with Stripe/Paystack, real-time dashboards — built on top of the architecture, not instead of it. From zero to production, end to end.',
    keywords: ['Next.js', 'React', 'Stripe', 'PostgreSQL'],
  },
];
