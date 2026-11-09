'use client';

import { useEffect, useRef } from 'react';

/**
 * A silent looping clip that behaves like a GIF but ships as video (a 10 s loop that was an 11.6 MB GIF is
 * 0.4 MB as MP4). It loads nothing until it scrolls near, plays only while visible, and stays on its still
 * frame for visitors who prefer reduced motion.
 */
export function LoopVideo({
  mp4,
  webm,
  poster,
  label,
  className,
}: {
  mp4: string;
  webm?: string;
  poster: string;
  /** What the clip shows, for assistive tech. */
  label: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={video}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      role="img"
      aria-label={label}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
