'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Muted looping clip that costs nothing until it is needed: the poster is a normal lazy image, the video has
 * preload="none" and gets its source only when it comes within a screen of the viewport. It plays in view, pauses out
 * of view. Reduced motion and Save-Data keep the poster.
 */
export function LoopVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;

    let loaded = false;
    let visible = false;
    const play = () => {
      if (!loaded || !visible) return;
      v.play().then(() => (v.dataset.playing = '')).catch(() => {});
    };
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || loaded) return;
        loaded = true;
        v.src = src;
        near.disconnect();
        play(); // it may already be on screen when the source arrives
      },
      { rootMargin: '100% 0px' },
    );
    const vis = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else v.pause();
    });
    near.observe(v);
    vis.observe(v);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, [src]);

  return (
    <>
      <Image src={poster} alt="" fill sizes="400px" className={className} />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className={`loop-video absolute inset-0 h-full w-full ${className ?? ''}`}
      />
    </>
  );
}
