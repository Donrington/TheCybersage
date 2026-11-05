'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { SECTIONS } from '@/content/site';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { FEATURED, PROJECTS, projectById, type FeaturedScene, type Project } from '@/content/projects';
import { useScrollEngine } from '@/lib/useScrollEngine';
import { ProjectVideo } from '@/components/ProjectVideo';

const pad = (n: number) => String(n).padStart(2, '0');

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

/** A screenshot in a fixed 16:9 browser frame: no layout shift whether or not the image has mounted. */
function Shot({ src, alt, near, sizes, className = '' }: { src: string; alt: string; near: boolean; sizes: string; className?: string }) {
  return (
    <div className={`work-shot overflow-hidden rounded-[10px] border border-on-ink-line bg-[#141414] ${className}`}>
      <div aria-hidden className="flex h-6 items-center gap-1.5 border-b border-on-ink-line px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
      </div>
      <div className="relative aspect-[16/9]">
        {near && <Image src={src} alt={alt} fill sizes={sizes} quality={70} className="object-cover object-top" />}
      </div>
    </div>
  );
}

function SceneText({ scene, project, index, total }: { scene: FeaturedScene; project: Project; index: number; total: number }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-on-ink-3">
        <span className="t-mono text-on-ink-2">
          {pad(index + 1)} / {pad(total)}
        </span>
        <span aria-hidden>·</span>
        <span>{project.category}</span>
        <span aria-hidden>·</span>
        <span>{project.year}</span>
      </div>
      <h3 className="t-h3 text-white" style={{ fontSize: 'clamp(2rem, 3.6vw, 3.5rem)', lineHeight: 1 }}>
        {project.name}
      </h3>
      <p className="t-body max-w-[46ch] text-on-ink-2">{scene.outcome}</p>
      <p className="t-label text-on-ink-3">
        Role <span className="text-on-ink-2">· {scene.role}</span>
      </p>
      <ul className="flex flex-wrap gap-2" aria-label="Stack">
        {scene.tags.map((t) => (
          <li key={t} className="t-label border border-on-ink-line px-3 py-1.5 text-on-ink-2">
            {t}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-2 border border-white/60 px-5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
          >
            Visit site
            <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span className="sr-only">(opens {project.name} in a new tab)</span>
          </a>
        )}
        {project.video && <ProjectVideo src={project.video} poster={project.videoPoster} title={project.name} compact />}
      </div>
    </div>
  );
}

function Metric({ metric, compact = false }: { metric: NonNullable<FeaturedScene['metric']>; compact?: boolean }) {
  return (
    <p className="flex flex-col">
      <span className="font-black leading-[0.85] tracking-tighter text-white" style={{ fontSize: compact ? 'clamp(3rem, 5vw, 4.5rem)' : 'clamp(4.5rem, 10vw, 10rem)' }}>
        {metric.value}
      </span>
      <span className="t-label mt-3 text-on-ink-2">{metric.label}</span>
    </p>
  );
}

function Scene({ scene, index, total }: { scene: FeaturedScene; index: number; total: number }) {
  const project = projectById(scene.id);
  const [ref, near] = useNear<HTMLLIElement>();
  useScrollEngine(ref, { prop: '--enter', range: 'enter' });
  if (!project) return null;

  const alt = `${project.name}: ${project.category}`;
  const text = <SceneText scene={scene} project={project} index={index} total={total} />;

  let body: React.ReactNode;
  if (scene.template === 'device') {
    // Full-bleed device: the screenshot owns the scene, copy sits beside it.
    body = (
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
        <div className="order-2 flex flex-col gap-6 md:order-1">
          {scene.metric && <Metric metric={scene.metric} compact />}
          {text}
        </div>
        <Shot className="order-1 md:order-2" src={scene.shots[0]} alt={alt} near={near} sizes="(min-width: 768px) 58vw, 100vw" />
      </div>
    );
  } else if (scene.template === 'metric') {
    // Split with a big number: metric and copy left, one screenshot right.
    body = (
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-8">
          {scene.metric && <Metric metric={scene.metric} />}
          {text}
        </div>
        <Shot src={scene.shots[0]} alt={alt} near={near} sizes="(min-width: 768px) 48vw, 100vw" />
      </div>
    );
  } else {
    // Two-up screenshots, overlapped, beside the metric and copy.
    body = (
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
        <div className="order-2 flex flex-col gap-8 md:order-1">
          {scene.metric && <Metric metric={scene.metric} />}
          {text}
        </div>
        <div className="relative order-1 pb-[24%] md:order-2">
          <Shot className="w-[84%]" src={scene.shots[0]} alt={alt} near={near} sizes="(min-width: 768px) 49vw, 84vw" />
          <Shot
            className="absolute right-0 bottom-0 w-[56%] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            src={scene.shots[1] ?? scene.shots[0]}
            alt=""
            near={near}
            sizes="(min-width: 768px) 33vw, 56vw"
          />
        </div>
      </div>
    );
  }

  return (
    <li
      ref={ref}
      aria-label={`${project.name}, ${index + 1} of ${total}`}
      className="work-scene md:sticky md:top-0 md:h-[100svh]"
    >
      {/* Full-height, opaque: it must completely cover the scene it stacks over. */}
      <article className="work-scene-card w-full border-t border-on-ink-line bg-[#0A0A0A] py-10 md:flex md:h-full md:flex-col md:justify-center md:py-0 md:pt-20">
        <div className="mx-auto w-full max-w-[1440px] px-[clamp(1rem,4vw,5rem)]">
          {body}
        </div>
      </article>
    </li>
  );
}

/**
 * Selected Work, v2: eight flagship scenes instead of 26 near-identical ones.
 * Desktop: each scene sticks for one viewport and the next rises over it.
 * Mobile: plain vertical cards. Everything else lives on /work.
 */
export function WorkV2() {
  const total = FEATURED.length;
  return (
    <section id="work" aria-labelledby="work-heading" data-theme="dark" className="relative bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(1rem,4vw,5rem)] pt-[clamp(5rem,10vw,9rem)] pb-[clamp(2rem,5vw,4rem)]">
        <div className="mb-8 flex items-center gap-4">
          <span className="t-label text-on-ink-2">{SECTIONS.work.label}</span>
          <span aria-hidden className="h-px flex-1 bg-on-ink-line" />
          <span className="t-label text-on-ink-3">
            {pad(total)} of {PROJECTS.length}
          </span>
        </div>
        <SplitHeading id="work-heading" className="t-h2 max-w-[18ch] text-white" text={SECTIONS.work.heading} />
      </div>

      <ol className="relative">
        {FEATURED.map((scene, i) => (
          <Scene key={scene.id} scene={scene} index={i} total={total} />
        ))}
      </ol>

      <div className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between gap-6 border-t border-on-ink-line bg-[#0A0A0A] px-[clamp(1rem,4vw,5rem)] py-12">
        <p className="t-body text-on-ink-2">Fintech, e-commerce, healthcare, SaaS and oil &amp; gas builds, all in one index.</p>
        <Link
          href="/work"
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 bg-white px-6 text-xs font-medium uppercase tracking-[0.18em] text-[#0A0A0A] transition-colors duration-200 hover:bg-white/85"
        >
          See all {PROJECTS.length}
          <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
