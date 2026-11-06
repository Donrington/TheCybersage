'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS, VERTICALS, VERTICAL_OF, type Vertical } from '@/content/projects';
import { Corners } from '@/components/ui/Corners';

type Filter = Vertical | 'all';
const pad = (n: number) => String(n).padStart(2, '0');

/** Index of every project as numbered plates, with industry filters as a hairline strip. */
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
      <div role="group" aria-label="Filter by industry" className="relative mt-10 flex flex-wrap border-t border-l border-white/20">
        {options.map((o, i) => {
          const active = filter === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(o.key)}
              className={`t-mono relative flex min-h-12 items-center gap-3 border-r border-b border-white/20 px-4 uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
                active ? 'bg-white text-[#0A0A0A]' : 'text-on-ink-2 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={active ? 'text-[#0A0A0A]/55' : 'text-on-ink-3'}>{pad(i)}</span>
              {o.label}
              <span className={active ? 'text-[#0A0A0A]/60' : 'text-on-ink-3'}>{counts[o.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} projects shown
      </p>

      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => {
          const host = p.link ? new URL(p.link).host.replace(/^www\./, '').toUpperCase() : 'PRIVATE BUILD';
          const body = (
            <>
              <span className="relative block border border-white/20 bg-[#141414]">
                <span className="t-mono flex h-7 items-center justify-between border-b border-white/15 px-3 text-on-ink-3">
                  <span>PLATE {pad(i + 1)} · {host}</span>
                  <span>{p.year}</span>
                </span>
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={`${p.name}: ${p.category}`}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                    quality={65}
                    loading={i < 3 ? 'eager' : 'lazy'}
                    className="object-cover object-top grayscale transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04] group-hover:grayscale-0 group-focus-visible:grayscale-0"
                  />
                </span>
                <Corners />
              </span>
              <span className="mt-4 flex items-start justify-between gap-4">
                <span>
                  <span className="t-h3 block text-white">{p.name}</span>
                  <span className="t-mono mt-2 block text-on-ink-3 uppercase">{p.category}</span>
                </span>
                {p.link && <ArrowUpRight size={18} aria-hidden className="mt-1 shrink-0 text-on-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />}
              </span>
              <span className="t-body mt-3 line-clamp-3 block text-on-ink-2">{p.tagline}</span>
              <span className="t-mono mt-3 block text-on-ink-3 uppercase">{p.stack.slice(0, 3).join(' · ')}</span>
            </>
          );
          return (
            <li key={p.id}>
              {p.link ? (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
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
