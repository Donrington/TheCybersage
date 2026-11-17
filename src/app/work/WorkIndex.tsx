'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS, VERTICALS, VERTICAL_OF, type Project, type Vertical } from '@/content/projects';
import { Corners } from '@/components/ui/Corners';

type Filter = Vertical | 'all';
type View = 'index' | 'plates';

const pad = (n: number) => String(n).padStart(2, '0');
const VERTICAL_LABEL = Object.fromEntries(VERTICALS.map((v) => [v.key, v.label])) as Record<Vertical, string>;
const hostOf = (p: Project) => (p.link ? new URL(p.link).host.replace(/^www\./, '') : 'Private build');

/**
 * Every project, filterable by industry, in two views:
 *  - Index: one row per project. On a fine pointer a preview of the hovered
 *    project follows the cursor (direct DOM writes in rAF, no re-render per
 *    frame); on touch each row carries its own thumbnail.
 *  - Plates: a bento grid of screenshots.
 * A filter change remounts the list so the rows stagger back in.
 */
export function WorkIndex() {
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('index');

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
    <section aria-label="Projects" className="work-wrap">
      <div className="work-controls">
        <div role="group" aria-label="Filter by industry" className="work-filters">
          {options.map((o, i) => {
            const active = filter === o.key;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(o.key)}
                className="work-filter t-mono"
              >
                <span className="work-filter-idx">{pad(i)}</span>
                <span>{o.label}</span>
                <sup>{counts[o.key] ?? 0}</sup>
              </button>
            );
          })}
        </div>

        <div className="work-controls-end">
          <p className="t-mono work-showing" aria-live="polite">
            Showing <b>{pad(shown.length)}</b> / {pad(PROJECTS.length)}
          </p>
          <div role="group" aria-label="Layout" className="work-views">
            {(['index', 'plates'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className="work-view t-mono"
              >
                <span aria-hidden className={`work-view-icon work-view-icon-${v}`}>
                  <i /><i /><i /><i />
                </span>
                {v === 'index' ? 'Index' : 'Plates'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'index' ? (
        <IndexList key={`i-${filter}`} projects={shown} />
      ) : (
        <PlateGrid key={`p-${filter}`} projects={shown} />
      )}
    </section>
  );
}

/** Every row and plate opens its case study; the live site is one click further, on that page. */
function RowLink({ project, className, children }: { project: Project; className: string; children: React.ReactNode }) {
  return (
    <Link href={`/work/${project.id}`} className={className}>
      {children}
    </Link>
  );
}

function IndexList({ projects }: { projects: Project[] }) {
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Project | null>(null);
  const [layers, setLayers] = useState<{ key: number; project: Project }[]>([]);
  const seq = useRef(0);

  // Each newly hovered project becomes a layer that wipes up over the last
  // one. Only the two most recent stay mounted.
  const hover = (p: Project) => {
    if (active?.id === p.id) return;
    setActive(p);
    seq.current += 1;
    const key = seq.current;
    setLayers((prev) => [...prev.slice(-1), { key, project: p }]);
  };

  // Cursor-following preview. Fine pointers only; reduced motion snaps to the
  // pointer without the lag and tilt.
  useEffect(() => {
    const ul = list.current;
    const box = preview.current;
    if (!ul || !box) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let on = false;
    let tx = 0, ty = 0, x = 0, y = 0, tilt = 0;
    const W = () => box.offsetWidth;
    const H = () => box.offsetHeight;

    const tick = () => {
      raf = 0;
      const k = reduced ? 1 : 0.16;
      const px = x;
      x += (tx - x) * k;
      y += (ty - y) * k;
      tilt += (Math.max(-7, Math.min(7, (x - px) * 0.35)) - tilt) * 0.12;
      box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(reduced ? 0 : tilt).toFixed(2)}deg)`;
      if (on || Math.abs(tx - x) > 0.3 || Math.abs(tilt) > 0.05) raf = requestAnimationFrame(tick);
    };
    const target = (cx: number, cy: number) => {
      const w = W(), h = H();
      // Sit to the right of the cursor; flip to the left near the right edge.
      const right = cx + 32 + w < window.innerWidth - 16;
      tx = right ? cx + 32 : cx - 32 - w;
      ty = Math.max(16, Math.min(window.innerHeight - h - 16, cy - h / 2));
    };
    const move = (e: PointerEvent) => {
      target(e.clientX, e.clientY);
      if (!on) {
        on = true;
        x = tx;
        y = ty;
        box.setAttribute('data-on', '');
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      on = false;
      box.removeAttribute('data-on');
      setActive(null);
    };
    // The list scrolls under a still pointer: the hovered row changes but no
    // pointermove fires, so hide the preview until the pointer moves again.
    const scroll = () => {
      if (on) leave();
    };

    ul.addEventListener('pointermove', move, { passive: true });
    ul.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ul.removeEventListener('pointermove', move);
      ul.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="work-head t-mono">
        <span>No.</span>
        <span>Project</span>
        <span>Discipline</span>
        <span>Industry</span>
        <span>Stack</span>
        <span>Year</span>
        <span />
      </div>

      <ul ref={list} className="work-list" data-hovering={active ? '' : undefined}>
        {projects.map((p, i) => {
          const vertical = VERTICAL_OF[p.id];
          return (
            <li
              key={p.id}
              className="work-row-item"
              style={{ '--i': Math.min(i, 14) } as CSSProperties}
              data-active={active?.id === p.id ? '' : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') hover(p);
              }}
            >
              <RowLink project={p} className="work-row">
                <span className="work-row-no t-mono">{pad(PROJECTS.indexOf(p) + 1)}</span>
                <span className="work-row-thumb">
                  <Image src={p.image} alt="" fill sizes="96px" quality={75} className="object-cover object-top" />
                </span>
                <span className="work-row-name">
                  <span className="work-row-title">{p.name}</span>
                  <span className="work-row-host t-mono">{hostOf(p)}</span>
                </span>
                <span className="work-row-cat t-mono">{p.category}</span>
                <span className="work-row-vert t-mono">{vertical ? VERTICAL_LABEL[vertical] : ''}</span>
                <span className="work-row-stack t-mono">{p.stack.slice(0, 3).join(' · ')}</span>
                <span className="work-row-year t-mono">{p.year}</span>
                <span className="work-row-arrow" aria-hidden>
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </span>
              </RowLink>
            </li>
          );
        })}
      </ul>

      <div ref={preview} aria-hidden className="work-preview">
        <div className="work-preview-stage">
          {layers.map((l) => (
            <span key={l.key} className="work-preview-layer">
              {/* Shown until the screenshot arrives, so the box is never blank. */}
              <span className="work-preview-name">{l.project.name}</span>
              <Image src={l.project.image} alt="" fill sizes="440px" quality={75} className="object-cover object-top" />
            </span>
          ))}
        </div>
        <div className="work-preview-cap t-mono">
          <span>{active ? hostOf(active) : ''}</span>
          <span>{active ? 'Case study →' : ''}</span>
        </div>
        <Corners />
      </div>
    </>
  );
}

function PlateGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="work-plates">
      {projects.map((p, i) => {
        const vertical = VERTICAL_OF[p.id];
        return (
          <li key={p.id} className="work-plate-item" style={{ '--i': Math.min(i, 10) } as CSSProperties}>
            <RowLink project={p} className="work-plate group">
              <span className="work-plate-frame">
                <span className="work-plate-bar t-mono">
                  <span>Plate {pad(PROJECTS.indexOf(p) + 1)} · {hostOf(p)}</span>
                  <span>{p.year}</span>
                </span>
                <span className="work-plate-img">
                  <Image
                    src={p.image}
                    alt={`${p.name}: ${p.category}`}
                    fill
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    quality={75}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    className="object-cover object-top"
                  />
                </span>
                <Corners />
              </span>
              <span className="work-plate-meta">
                <span className="work-plate-title">{p.name}</span>
                <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden className="work-plate-arrow" />
              </span>
              <span className="work-plate-tags t-mono">
                <span>{p.category}</span>
                {vertical && <span>{VERTICAL_LABEL[vertical]}</span>}
              </span>
              <span className="t-body work-plate-line">{p.tagline}</span>
              <span className="t-mono work-plate-stack">{p.stack.slice(0, 4).join(' · ')}</span>
            </RowLink>
          </li>
        );
      })}
    </ul>
  );
}
