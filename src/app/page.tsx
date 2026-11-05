'use client';

import dynamic from 'next/dynamic';
import { SmoothScroll } from '@/lib/SmoothScroll';
import { Navbar } from '@/components/Navbar';
import { HeroV2 } from '@/components/HeroV2';
import { TechTicker } from '@/components/TechTicker';
import { About } from '@/components/About';
import { WorkV2 } from '@/components/WorkV2';
import { Services } from '@/components/Services';
import { SystemsBlueprint } from '@/components/SystemsBlueprint';
import { Credentials } from '@/components/Credentials';
import { Marquee } from '@/components/Marquee';
import { CurrentlyBuilding } from '@/components/CurrentlyBuilding';
import { Process } from '@/components/Process';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { PricingPromo } from '@/components/PricingPromo';
import { Stack } from '@/components/Stack';
import { Contact } from '@/components/Contact';

// Both are fixed-position chrome with no layout footprint of their own, so a
// client-only chunk (no SSR, no server-rendered placeholder) costs nothing
// visually and keeps thinking-orbs / the cursor's rAF loop out of the main bundle.
const AIAssistant = dynamic(() => import('@/components/AIAssistant').then((m) => m.AIAssistant), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor').then((m) => m.CustomCursor), { ssr: false });

export default function Home() {
  return (
    <>
      <CustomCursor />
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
          <TechTicker />
          <About />
          <WorkV2 />
          <Marquee />
          <CurrentlyBuilding />
          <Stack />
          <Services />
          <Process />
          <SystemsBlueprint />
          <Credentials />
          <Testimonials />
          <FAQ />
          <PricingPromo />
          <Contact />
        </main>        <AIAssistant />
      </SmoothScroll>
    </>
  );
}
