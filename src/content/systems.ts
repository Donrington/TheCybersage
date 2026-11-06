// Under the hood: seven layers of a production system. Copy moved verbatim from the old
// SystemsBlueprint; every proof line names the client build it shipped in.

export interface Layer {
  id: string;
  label: string;
  tag: string;
  /** The decision, one sentence. */
  principle: string;
  /** "<metric> — <client build>" */
  proof: string;
}

export const LAYERS: Layer[] = [
  {
    id: 'edge',
    label: 'Edge & Delivery',
    tag: 'CDN · Web Vitals',
    principle: 'Sub-second loads aren’t an accident — edge caching and Core Web Vitals get tuned before a single feature ships.',
    proof: '98/100 Lighthouse, sub-1s LCP — KRK Motors, Samdus',
  },
  {
    id: 'gateway',
    label: 'API Gateway',
    tag: 'Auth · Rate Limiting',
    principle: 'Every public endpoint gets rate-limiting and circuit breakers before it gets a feature.',
    proof: 'Payment APIs stopped cascading-failing entirely — Autoboy Express',
  },
  {
    id: 'services',
    label: 'Services',
    tag: 'Go · Django',
    principle: 'Go for throughput, Django for velocity — picked per service, not per habit.',
    proof: '30% performance gain from re-architecting this layer — NextGen Robotics',
  },
  {
    id: 'cache',
    label: 'Cache',
    tag: 'Redis',
    principle: 'I design invalidation before I design the cache.',
    proof: '30% faster DB responses under peak load — Autoboy Express',
  },
  {
    id: 'database',
    label: 'Database',
    tag: 'PostgreSQL',
    principle: 'pg_notify for live sync, rewritten queries for everything else.',
    proof: 'p95 latency cut hard once the slow paths were found — Dejaii',
  },
  {
    id: 'access',
    label: 'Access & Compliance',
    tag: 'RBAC · Encryption',
    principle: 'Role-based access on every layer, encrypted by default — not bolted on after a client asks.',
    proof: 'Unauthorized-access surface down 60% — RecoverDerm',
  },
  {
    id: 'deploy',
    label: 'Deploy & Monitor',
    tag: 'CI/CD · Zero-Downtime',
    principle: 'Zero-downtime releases and CI/CD from day one, not after the first bad deploy.',
    proof: 'Deployment time cut 45% — NextGen Robotics',
  },
];

/** Splits a proof line into the metric and the client build it shipped in. */
export function splitProof(proof: string) {
  const i = proof.lastIndexOf(" — ");
  return i < 0 ? { metric: proof, shippedIn: "" } : { metric: proof.slice(0, i), shippedIn: proof.slice(i + 3) };
}
