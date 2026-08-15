'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Full stack ticker — moved out of the Hero, where these read as a cramped
 * pill row. Large, light, uppercase, dot-separated: a quiet band of type that
 * keeps moving rather than a badge wall.
 */
const TECH = [
  'AWS', 'Docker', 'Kubernetes', 'Terraform', 'Go', 'Python', 'Django',
  'PostgreSQL', 'Redis', 'Node.js', 'TypeScript', 'JavaScript', 'React',
  'Next.js', 'Tailwind', 'GSAP', 'Supabase', 'Stripe', 'Paystack',
  'Microservices', 'REST APIs', 'WebSockets', 'WebRTC', 'gRPC', 'CI/CD',
  'Nginx', 'Linux', 'Distributed Systems', 'System Design', 'Computer Vision',
];

export function TechTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // The track holds the list twice; travelling exactly one copy's width and
    // repeating gives a seamless wrap with no visible reset.
    const half = track.scrollWidth / 2;
    const tween = gsap.to(track, {
      x: -half,
      duration: half / 55, // constant px/sec regardless of list length
      ease: 'none',
      repeat: -1,
    });

    return () => { tween.kill(); };
  }, []);

  const items = [...TECH, ...TECH];

  return (
    <section
      aria-label="Technology stack"
      className="w-full bg-white overflow-hidden border-y border-black/[0.06]"
      style={{ paddingTop: 'clamp(1.1rem,2.2vw,1.9rem)', paddingBottom: 'clamp(1.1rem,2.2vw,1.9rem)' }}
    >
      <div ref={trackRef} className="flex items-center w-max will-change-transform">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center shrink-0">
            <span
              className="uppercase whitespace-nowrap select-none"
              style={{
                fontFamily: 'Satoshi, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.1rem,2.6vw,2.1rem)',
                letterSpacing: '-0.01em',
                color: 'rgba(10,10,10,0.22)',
              }}
            >
              {t}
            </span>
            {/* Small solid dot separator */}
            <span
              aria-hidden
              className="shrink-0 rounded-full"
              style={{
                width: 'clamp(4px,0.5vw,6px)',
                height: 'clamp(4px,0.5vw,6px)',
                background: '#0A0A0A',
                margin: '0 clamp(1rem,2.2vw,2rem)',
              }}
            />
          </span>
        ))}
      </div>
    </section>
  );
}
