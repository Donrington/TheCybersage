'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

/* `scale` compensates for logos with heavy internal whitespace (e.g. square marks) */
const CLIENTS: { name: string; logo: string; scale?: number }[] = [
  { name: 'RecoverDerm', logo: '/logo/ReCoverDerm Logo Varient (White).png' },
  { name: 'Autoboy', logo: '/logo/autoboy.png' },
  { name: 'NextGen', logo: '/logo/NEXTGEN PL (Landscape) WHITE.png' },
  { name: 'Axflo', logo: '/logo/AXFLOOILLOGOWHITE.png' },
  { name: 'Rokeyla', logo: '/logo/RokeylaSecondaryLogoWhite.png' },
  { name: 'Samdus', logo: '/logo/samdus_white.png' },
  { name: 'Anoc', logo: '/logo/anoc.svg' },
  { name: 'AmaniGo', logo: '/logo/amanigo.png', scale: 2 },
  { name: 'Chronos', logo: '/logo/chronos_logo_trans2.png' },
  { name: 'TechHub', logo: '/logo/techwhite.png' },
  { name: 'Chris Cleans', logo: '/logo/chris_con.png' },
  { name: 'Myra Keleher', logo: '/logo/myra_logo.webp' },
  { name: 'Tuan Tling', logo: '/logo/tuantling.png' },
  { name: 'Cybersage', logo: '/logo/logo_white_horizontal.png' },
  { name: 'TQL', logo: '/logo/TQL LOGO 2-01.png' },
  { name: 'Circles of Life Healthcare', logo: '/logo/colhcs_logo_light.png' },
  { name: 'Terryon Fagan', logo: '/logo/terryonfagan.png' },
  { name: 'Judy Golden Tiling', logo: '/logo/judygolden.png' },
  { name: 'The Black-E', logo: '/logo/theblacke.png' },
  { name: 'VER', logo: '/logo/ver.png' },
  { name: 'Wyns Collections', logo: '/logo/wynscollections.webp' },
];

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const totalWidth = track.scrollWidth / 2;
    gsap.to(track, {
      x: -totalWidth,
      duration: 40,
      ease: 'none',
      repeat: -1,
    });
    return () => gsap.killTweensOf(track);
  }, []);

  const items = [...CLIENTS, ...CLIENTS];

  return (
    <div data-theme="dark" className="w-full bg-[#0A0A0A] border-t border-white/6 py-8 overflow-hidden">
      <div ref={trackRef} className="flex items-center gap-16 w-max">
        {items.map((client, i) => (
          <div key={`${client.name}-${i}`} className="flex items-center gap-16 shrink-0">
            <div className="relative h-14 w-56 opacity-25 hover:opacity-60 transition-opacity duration-300">
              <Image
                src={client.logo}
                alt={client.name}
                fill
                className="object-contain"
                style={client.scale ? { transform: `scale(${client.scale})` } : undefined}
              />
            </div>
            <span className="text-white/10 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
