'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { FEATURED, PROJECTS, projectById, type FeaturedScene, type Project } from '@/content/projects';
import { useScrollEngine } from '@/lib/useScrollEngine';
import { ProjectVideo } from '@/components/ProjectVideo';
import { Corners } from '@/components/ui/Corners';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The spread rhythm. Copy and media swap sides on every plate, and the copy
 * column widens in a 5 → 6 → 7 → 5 cycle, so no two neighbours share a
 * silhouette. Kept as data so the markup stays one predictable branch.
 */
const SPREADS = [
  { side: 'left', copy: 5 },
  { side: 'right', copy: 5 },
  { side: 'left', copy: 6 },
  { side: 'right', copy: 6 },
  { side: 'left', copy: 7 },
  { side: 'right', copy: 7 },
  { side: 'left', copy: 5 },
] as const;

/** True once the element is within about one viewport. Images mount then, not before. */
function useNear<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, near] as const;
}

/**
 * A screenshot in a print-plate frame: a mono caption bar, a sharp hairline
 * border, corner ticks, and a fixed aspect ratio so nothing shifts when the
 * image mounts. `work-shot` is the reveal target for useScrollEngine.
 */
function Shot({
  src,
  alt,
  near,
  sizes,
  plate,
  meta,
  aspect,
  className = '',
  bar = true,
}: {
  src: string;
  alt: string;
  near: boolean;
  sizes: string;
  plate: string;
  meta?: string;
  aspect: string;
  className?: string;
  bar?: boolean;
}) {
  return (
    <div className={`work-frame ${className}`}>
      {bar && (
        <div aria-hidden className="work-frame-bar">
          <span>{plate}</span>
          <span className="work-frame-meta">{meta ?? 'LIVE'}</span>
        </div>
      )}
      <div className="work-shot work-frame-body" style={{ aspectRatio: aspect }}>
        {near && (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={78}
            loading="eager"
            className="work-frame-img"
          />
        )}
      </div>
      <Corners />
    </div>
  );
}

function SceneMedia({
  scene,
  project,
  index,
  near,
}: {
  scene: FeaturedScene;
  project: Project;
  index: number;
  near: boolean;
}) {
  const alt = `${project.name}: ${project.category}`;
  const plate = `PLATE ${pad(index + 1)}`;
  const host = project.link ? new URL(project.link).host.replace(/^www\./, '').toUpperCase() : 'PRIVATE BUILD';

  if (scene.template === 'pair') {
    return (
      <figure className="work-media work-media-pair">
        <div className="work-pair-stage">
          <Shot
            className="work-pair-a"
            src={scene.shots[0]}
            alt={alt}
            near={near}
            sizes="(min-width: 900px) 36vw, 82vw"
            plate={plate}
            meta={host}
            aspect="16 / 10"
          />
          <Shot
            className="work-pair-b"
            src={scene.shots[1] ?? scene.shots[0]}
            alt=""
            near={near}
            sizes="(min-width: 900px) 24vw, 54vw"
            plate={plate}
            aspect="16 / 10"
            bar={false}
          />
        </div>
        <figcaption className="work-media-cap">
          <span>FIG. {pad(index + 1)} / {project.name}</span>
          <span>TWO VIEWS</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="work-media work-media-single">
      <Shot
        className="work-media-frame"
        src={scene.shots[0]}
        alt={alt}
        near={near}
        sizes="(min-width: 900px) 52vw, 100vw"
        plate={plate}
        meta={host}
        aspect={scene.template === 'device' ? '4 / 3' : '16 / 10'}
      />
      <figcaption className="work-media-cap">
        <span>FIG. {pad(index + 1)} / {project.name}</span>
        <span>{scene.template === 'device' ? 'PRODUCT SURFACE' : 'LIVE INTERFACE'}</span>
      </figcaption>
    </figure>
  );
}

function SceneCopy({ scene, project, index }: { scene: FeaturedScene; project: Project; index: number }) {
  return (
    <div className="work-copy">
      <h3 className="work-name">{project.name}</h3>
      <p className="work-outcome">{scene.outcome}</p>

      <div className="work-facts">
        {scene.metric ? (
          <p className="work-metric">
            <span className="work-metric-value">{scene.metric.value}</span>
            <span className="work-metric-label">{scene.metric.label}</span>
          </p>
        ) : (
          <p className="work-plate-mark" aria-hidden="true">
            <span>{pad(index + 1)}</span>
            <small>Plate</small>
          </p>
        )}

        <dl className="work-spec">
          <div>
            <dt>Role</dt>
            <dd>{scene.role}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{scene.tags.join(' / ')}</dd>
          </div>
        </dl>
      </div>

      <div className="work-actions">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="work-link"
          >
            <span>Visit site</span>
            <ArrowUpRight size={14} aria-hidden />
            <span className="sr-only">(opens {project.name} in a new tab)</span>
          </a>
        )}
        {project.video && (
          <ProjectVideo src={project.video} poster={project.videoPoster} title={project.name} compact />
        )}
      </div>
    </div>
  );
}

function Scene({ scene, index, total }: { scene: FeaturedScene; index: number; total: number }) {
  const project = projectById(scene.id);
  const [ref, near] = useNear<HTMLLIElement>();
  useScrollEngine(ref, { prop: '--enter', range: 'enter' });

  if (!project) return null;

  const spread = SPREADS[index % SPREADS.length];
  const nextProject = FEATURED[index + 1] ? projectById(FEATURED[index + 1].id) : null;
  const host = project.link ? new URL(project.link).host.replace(/^www\./, '').toUpperCase() : 'PRIVATE BUILD';

  return (
    <li
      ref={ref}
      data-side={spread.side}
      data-copy={spread.copy}
      className="work-case"
      aria-label={`${project.name}, ${index + 1} of ${total}`}
    >
      <article className="work-case-inner">
        <div className="work-case-rail">
          <span className="work-rail-index">
            {pad(index + 1)}
            <i>/{pad(total)}</i>
          </span>
          <span className="work-rail-cat">{project.category}</span>
          <span className="work-rail-end">
            <span>{project.year}</span>
            <span>{host}</span>
          </span>
        </div>

        <div className="work-case-grid">
          <div className="work-case-copy">
            <SceneCopy scene={scene} project={project} index={index} />
          </div>
          <div className="work-case-media">
            <SceneMedia scene={scene} project={project} index={index} near={near} />
          </div>
        </div>

        <div className="work-case-foot">
          <span className="work-foot-label">Next</span>
          <span className="work-foot-name">{nextProject ? nextProject.name : 'End of set'}</span>
          <span aria-hidden className="work-foot-rule" />
          <span className="work-foot-note">
            {project.link ? 'LIVE BUILD' : 'PRIVATE BUILD'} / {pad(index + 1)}
          </span>
        </div>
      </article>
    </li>
  );
}

/**
 * Selected Work, v3. Seven full-height editorial plates with alternating sides
 * and column ratios. On desktop each plate pins at the top and the next rises
 * over it, with a short GSAP scrub for depth; the plate height is fixed, so
 * the old caption clipping cannot return. Below 1024px it is a plain readable
 * list. Everything beyond the shortlist lives on /work.
 */
export function WorkV2() {
  const listRef = useRef<HTMLOListElement>(null);
  const total = FEATURED.length;

  // Scroll choreography for the desktop stack. CSS makes every plate sticky
  // at the top (see the matching media query in globals.css), so each one
  // holds the screen while the next rises over it. GSAP only scrubs the depth:
  // the outgoing plate eases back, the incoming media and copy settle forward.
  // Lenis drives ScrollTrigger from SmoothScroll, so the scrub stays in sync.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (min-height: 720px)', () => {
      const cases = gsap.utils.toArray<HTMLElement>('.work-case', list);

      cases.forEach((el, i) => {
        const inner = el.querySelector<HTMLElement>('.work-case-inner');
        const media = el.querySelector<HTMLElement>('.work-case-media');
        const copy = el.querySelector<HTMLElement>('.work-case-copy');
        if (!inner) return;

        if (media) {
          gsap.fromTo(
            media,
            { y: 34 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: 0.4 },
            },
          );
        }
        if (copy) {
          gsap.fromTo(
            copy,
            { y: 18 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 60%', scrub: 0.4 },
            },
          );
        }

        // The next plate is the timer for this one's exit: its top travels from
        // the bottom of the viewport to the top, exactly one plate of scroll.
        const next = cases[i + 1];
        if (next) {
          gsap.to(inner, {
            y: -28,
            scale: 0.95,
            opacity: 0.42,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: 0.4 },
          });
        }
      });
    });

    return () => mm.revert();
  }, []);

  const stats: [string, string][] = [
    [String(PROJECTS.length), 'PROJECTS SHIPPED'],
    [pad(total), 'FEATURED BELOW'],
    ['06', 'INDUSTRIES'],
    ['08', 'COUNTRIES SERVED'],
  ];

  return (
    <section id="work" aria-labelledby="work-heading" data-theme="dark" className="work-section">
      <header className="work-head">
        <div className="work-head-top">
          <span className="work-head-label">
            <i aria-hidden />
            {SECTIONS.work.label}
          </span>
          <span aria-hidden className="work-head-line" />
          <span className="work-head-count">
            {pad(total)} plates / {PROJECTS.length} projects
          </span>
        </div>

        <div className="work-head-main">
          <SplitHeading id="work-heading" className="t-h2 work-heading" text={SECTIONS.work.heading} />

          <dl className="work-ledger">
            <div className="work-ledger-lead">
              <dt>{stats[0][1]}</dt>
              <dd>{stats[0][0]}</dd>
            </div>
            <div className="work-ledger-rows">
              {stats.slice(1).map(([n, l]) => (
                <div key={l} className="work-ledger-row">
                  <dt>{l}</dt>
                  <dd>{n}</dd>
                </div>
              ))}
            </div>
          </dl>
        </div>
      </header>

      <ol ref={listRef} className="work-cases">
        {FEATURED.map((scene, i) => (
          <Scene key={scene.id} scene={scene} index={i} total={total} />
        ))}
      </ol>

      <footer className="work-tail">
        <p className="work-tail-copy">
          The latest builds are above. Every project, from fintech to oil &amp; gas, is in the index.
        </p>
        <Link href="/work" className="work-tail-link">
          <span>See all {PROJECTS.length}</span>
          <ArrowRight size={15} aria-hidden />
        </Link>
      </footer>
    </section>
  );
}
