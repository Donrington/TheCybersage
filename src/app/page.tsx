'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';
import { SmoothScroll } from '@/lib/SmoothScroll';
import { Navbar } from '@/components/Navbar';
import { HeroV2 } from '@/components/HeroV2';
import { About } from '@/components/About';
import { WorkV2 } from '@/components/WorkV2';
import { Services } from '@/components/Services';
import { SystemsStackV2 } from '@/components/SystemsStackV2';
import { Marquee } from '@/components/Marquee';
import { TypeBand } from '@/components/TypeBand';
import { LabRow } from '@/components/LabRow';
import { Process } from '@/components/Process';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { PricingPromo } from '@/components/PricingPromo';
import { Contact } from '@/components/Contact';

// Both are fixed-position chrome with no layout footprint of their own, so a
// client-only chunk (no SSR, no server-rendered placeholder) costs nothing
// visually and keeps thinking-orbs / the cursor's rAF loop out of the main bundle.
const AIAssistant = dynamic(() => import('@/components/AIAssistant').then((m) => m.AIAssistant), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor').then((m) => m.CustomCursor), { ssr: false });

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const finish = () => {
    (window as unknown as { __loaderDone?: boolean }).__loaderDone = true;
    window.dispatchEvent(new Event('loader-done'));
    setLoaded(true);
  };

  return (
    <>
      <CustomCursor />
      {!loaded && <PageLoader onDone={finish} />}
      <SmoothScroll>
        <Navbar />
        <main>
          {/* Static indexing helper for crawlers & search bots. h2 (not h1):
              the page's one h1 is the visible name in Hero, just below. */}
          <article className="sr-only">
            <h2>Abakwe Carrington — Software Engineer &amp; Systems Architect</h2>
            <p>
              Abakwe Carrington (Cybersage / Donrington) is an Infrastructure &amp; Systems Architect and Senior Software Engineer based in Lagos, Nigeria, working with remote clients worldwide across the United States, United Kingdom, Canada, Australia, and Europe.
            </p>
            <h3>Core Stack &amp; Engineering Disciplines</h3>
            <p>AWS Cloud Infrastructure, Docker Containerisation, Kubernetes, Terraform Infrastructure as Code, Go (Golang), Python Django, PostgreSQL, Redis, Microservices System Design, Next.js, and TypeScript.</p>
          </article>

          <HeroV2 />
          <WorkV2 />
          <Marquee />
          <TypeBand />
          <SystemsStackV2 />
          <About />
          <Services />
          <Process />
          <Testimonials />
          <LabRow />
          <PricingPromo />
          <FAQ />
          <Contact />
        </main>        <AIAssistant />
      </SmoothScroll>
    </>
  );
}
