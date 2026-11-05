'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS, VERTICALS, VERTICAL_OF, type Vertical } from '@/content/projects';

type Filter = Vertical | 'all';

export function WorkIndex() {
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: PROJECTS.length };
    for (const p of PROJECTS) {
      const v = VERTICAL_OF[p.id];
      if (v) c[v] = (c[v] ?? 0) + 1;
    }
    return c;
  }, []);

  const shown = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => VERTICAL_OF[p.id] === filter);
  const options: { key: Filter; label: string }[] = [{ key: 'all', label: 'All' }, ...VERTICALS];

  return (
    <>
      <div role="group" aria-label="Filter by industry" className="mt-10 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = filter === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(o.key)}
              className={`inline-flex min-h-11 items-center gap-2 border px-4 text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200 ${
                active ? 'border-white bg-white text-[#0A0A0A]' : 'border-on-ink-line text-on-ink-2 hover:border-white/40 hover:text-white'
              }`}
            >
              {o.label}
              <span className={active ? 'text-[#0A0A0A]/60' : 'text-on-ink-3'}>{counts[o.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} projects shown
      </p>

      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => {
          const body = (
            <>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] border border-on-ink-line bg-[#141414]">
                <Image
                  src={p.image}
                  alt={`${p.name}: ${p.category}`}
                  fill
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                  quality={65}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  className="object-cover object-top transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="t-h3 text-white">{p.name}</h2>
                  <p className="t-label mt-2 text-on-ink-3">
                    {p.category} · {p.year}
                  </p>
                </div>
                {p.link && <ArrowUpRight size={18} aria-hidden className="mt-1 shrink-0 text-on-ink-3 transition-colors group-hover:text-white" />}
              </div>
              <p className="t-body mt-3 line-clamp-3 text-on-ink-2">{p.tagline}</p>
              <p className="t-label mt-3 text-on-ink-3">{p.stack.slice(0, 3).join(' · ')}</p>
            </>
          );
          return (
            <li key={p.id}>
              {p.link ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="group block">
                  {body}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <div className="group">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
