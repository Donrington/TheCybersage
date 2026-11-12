'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';

/**
 * The portrait as a system specimen. The source photo is a dark subject on a
 * white field; multiply drops the white field into the paper plate, so the
 * figure sits in the sheet without a cut-out asset and nothing is inverted.
 * The seven hairlines are the same layers the loader and "Under the hood" use,
 * drawn over the figure as a live scan.
 */
// The 3D layer stack is its own lazy chunk; nothing of it ships in first load.
const HeroStack = dynamic(() => import('./HeroStack'), { ssr: false });

const LAYERS = ['EDGE', 'GATEWAY', 'SERVICES', 'CACHE', 'DATABASE', 'ACCESS', 'DEPLOY'];

export function HeroSpecimen() {
  return (
    <div className="hero-specimen" aria-hidden>
      <div className="hero-specimen-body">
        <div className="hero-specimen-labels">
          {LAYERS.map((name, i) => (
            <span
              key={name}
              className="hero-layer"
              data-hero="layer"
              style={{ '--i': i, '--hd': `${720 + i * 55}ms` } as CSSProperties}
            >
              <i>{String(i + 1).padStart(2, '0')}</i>
              <b>{name}</b>
            </span>
          ))}
        </div>

        <div className="hero-plate">
          <div className="hero-plate-parallax">
            <Image
              src="/me.png"
              alt=""
              fill
              sizes="(min-width: 1140px) 24vw, 80vw"
              quality={90}
              className="hero-portrait-img"
            />
          </div>
          <span className="hero-plate-scan" />
          <span className="hero-plate-glitch" />
          <span className="hero-scanlines" />
          <span className="hero-packet-track"><span className="hero-packet" /></span>
          <HeroStack />
          <span className="hero-plate-frame" />
        </div>
      </div>

      <div className="hero-specimen-caption">
        <span>FIG. 01 / PRINCIPAL</span>
        <span>LAGOS / NG</span>
      </div>
    </div>
  );
}
