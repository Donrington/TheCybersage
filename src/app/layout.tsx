import type { Metadata, Viewport } from 'next';
import { Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { headers } from 'next/headers';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
});

const BASE_URL = 'https://cybersage.dev';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default:
      'Abakwe Carrington — Software Engineer & Systems Architect (Lagos, Nigeria & Remote Worldwide)',
    template: '%s | Abakwe Carrington — Infrastructure & Systems Architect',
  },

  description:
    'Abakwe Carrington (Cybersage / Donrington) is a Software Engineer & Infrastructure Architect with 5+ years of experience designing high-availability distributed systems, cloud infrastructure (AWS, Docker, Kubernetes, Terraform), and Go & Django backends for global enterprises and startups worldwide.',

  keywords: [
    // Brand / name
    'Abakwe Carrington',
    'Carrington Abakwe',
    'Cybersage',
    'cybersage.dev',
    'Cybersage developer',
    'Donrington',
    // Nigeria / Lagos geo cluster
    'software engineer in Nigeria',
    'software engineer in Lagos',
    'software engineer Lagos Nigeria',
    'best software engineer in Nigeria',
    'top software engineers in Nigeria',
    'top software engineer in Lagos',
    'Nigerian software engineer',
    'software developer in Nigeria',
    'software developer in Lagos',
    'web developer in Lagos Nigeria',
    'backend engineer in Nigeria',
    'DevOps engineer in Nigeria',
    'cloud architect in Nigeria',
    'systems architect in Lagos',
    'hire software engineer in Nigeria',
    'hire developer in Lagos',
    'freelance software engineer Nigeria',
    'remote software engineer Nigeria',
    'top developers in Africa',
    'African software engineer',
    // Global & Remote Intent
    'hire remote systems architect',
    'remote infrastructure architect for hire',
    'freelance cloud architect US UK Europe',
    'senior backend engineer remote worldwide',
    'Golang systems developer contract',
    'AWS DevOps consultant remote',
    'senior software architect for hire',
    'distributed systems engineer remote',
    // Role
    'Infrastructure Architect',
    'Systems Architect',
    'Solutions Architect',
    'Cloud Architect',
    'Platform Engineer',
    'Backend Architect',
    'DevOps Engineer',
    'Site Reliability Engineer',
    'Software Engineer',
    'Full Stack Engineer',
    'Backend Engineer',
    'Go Developer',
    'Golang Developer',
    'Django Developer',
    'Next.js Developer',
    'Python Developer',
    // Hire intent
    'hire systems architect',
    'hire cloud architect',
    'hire infrastructure architect',
    'hire platform engineer',
    'hire backend architect',
    'hire software engineer',
    'freelance solutions architect',
    'freelance software engineer',
    'remote systems architect for hire',
    'contract architect',
    'available for hire',
    // Tech stack
    'AWS',
    'Docker',
    'Kubernetes',
    'Terraform',
    'Go',
    'Django',
    'PostgreSQL',
    'Redis',
    'Next.js',
    'distributed systems',
    'system design',
    'infrastructure as code',
    'REST API development',
    'Microservices',
    'CI/CD',
    'high availability architecture',
    // Portfolio / reach
    'Systems Architect portfolio',
    'Cloud Architect portfolio',
    'Software Engineer portfolio',
    'remote developer worldwide',
    'enterprise web development',
    'scalable web applications',
    'production-grade web systems',
    'high-performance web apps',
    // Niche specialisations
    'AI engineer',
    'computer vision developer',
    'embedded systems developer',
    'WebRTC developer',
    'real-time systems engineer',
    'HIPAA compliant development',
    'AI surveillance system',
    'regulated industries software',
  ],

  authors: [{ name: 'Abakwe Carrington', url: BASE_URL }],
  creator: 'Abakwe Carrington',
  publisher: 'Abakwe Carrington',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/sage/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/sage/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/sage/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },

  openGraph: {
    type: 'profile',
    firstName: 'Abakwe',
    lastName: 'Carrington',
    username: 'cybersage',
    url: BASE_URL,
    siteName: 'Cybersage — Abakwe Carrington',
    title:
      'Abakwe Carrington — Software Engineer & Systems Architect',
    description:
      'Software engineer & Infrastructure Architect in Lagos, Nigeria operating globally. 5+ years architecting distributed, production-grade systems. AWS · Docker · Go · Django · PostgreSQL · Redis. Available for hire worldwide.',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/cybersage_og.png`,
        width: 1200,
        height: 630,
        alt: 'Abakwe Carrington — Software Engineer & Systems Architect',
        type: 'image/png',
      },
      {
        url: `${BASE_URL}/me.png`,
        width: 1393,
        height: 1149,
        alt: 'Portrait of Abakwe Carrington, software engineer and systems architect based in Lagos, Nigeria',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@CarlSwitch_CHUG',
    creator: '@CarlSwitch_CHUG',
    title:
      'Abakwe Carrington — Software Engineer & Systems Architect',
    description:
      'Software engineer & Infrastructure Architect. 5+ years architecting production-grade distributed systems. AWS · Docker · Go · Django · PostgreSQL. Available worldwide.',
    images: [`${BASE_URL}/cybersage_og.png`],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
    languages: {
      'en-US': BASE_URL,
      'en-GB': BASE_URL,
      'en-CA': BASE_URL,
      'en-AU': BASE_URL,
      'en-NG': BASE_URL,
      'x-default': BASE_URL,
    },
  },

  category: 'technology',

  appleWebApp: {
    capable: true,
    title: 'Cybersage',
    statusBarStyle: 'black-translucent',
  },

  other: {
    'theme-color': '#0A0A0A',
    'msapplication-TileColor': '#0A0A0A',
    'application-name': 'Cybersage',
    // Geo targeting — Lagos, Nigeria & Global Reach
    'geo.region': 'NG-LA',
    'geo.placename': 'Lagos, Nigeria',
    'geo.position': '6.5244;3.3792',
    ICBM: '6.5244, 3.3792',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

/* ── Structured data — single @graph so every entity cross-references ── */

const LAGOS = {
  '@type': 'Place',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lagos',
    addressRegion: 'Lagos State',
    addressCountry: 'NG',
  },
};

const headshot = {
  '@type': 'ImageObject',
  '@id': `${BASE_URL}/#headshot`,
  url: `${BASE_URL}/me.png`,
  contentUrl: `${BASE_URL}/me.png`,
  width: 1393,
  height: 1149,
  caption:
    'Abakwe Carrington — software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria',
  creditText: 'Abakwe Carrington (Cybersage)',
  representativeOfPage: true,
};

const personSchema = {
  '@type': 'Person',
  '@id': `${BASE_URL}/#person`,
  name: 'Abakwe Carrington',
  givenName: 'Abakwe',
  familyName: 'Carrington',
  alternateName: ['Cybersage', 'Carrington Abakwe', 'Donrington'],
  url: BASE_URL,
  image: { '@id': `${BASE_URL}/#headshot` },
  jobTitle: ['Infrastructure & Systems Architect', 'Software Engineer', 'Senior Backend Engineer'],
  description:
    'Abakwe Carrington is a software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria, with 5+ years of experience designing distributed, production-grade platforms — cloud infrastructure, DevOps pipelines, and resilient backends on AWS, Docker, Go, Django, and PostgreSQL — for clients worldwide.',
  email: 'abakwecarrington@gmail.com',
  nationality: { '@type': 'Country', name: 'Nigeria' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lagos',
    addressRegion: 'Lagos State',
    addressCountry: 'NG',
  },
  homeLocation: LAGOS,
  workLocation: [
    LAGOS,
    { '@type': 'Place', name: 'Remote — Worldwide' },
  ],
  worksFor: { '@id': `${BASE_URL}/#org` },
  hasOccupation: [
    {
      '@type': 'Occupation',
      name: 'Software Engineer',
      description:
        'Designs and builds production software — distributed backends, APIs, and full-stack products — from Lagos, Nigeria for clients worldwide.',
      occupationLocation: [
        { '@type': 'City', name: 'Lagos' },
        { '@type': 'Country', name: 'Nigeria' },
      ],
      skills:
        'Software Engineering, Go, Django, Python, TypeScript, Next.js, React, PostgreSQL, Redis, REST APIs, Microservices',
    },
    {
      '@type': 'Occupation',
      name: 'Infrastructure & Systems Architect',
      description:
        'Designs cloud infrastructure, distributed backends, and system architecture — from data models and service boundaries to zero-downtime deployment.',
      occupationLocation: [
        { '@type': 'City', name: 'Lagos' },
        { '@type': 'Country', name: 'Nigeria' },
      ],
      skills:
        'System Design, Cloud Architecture, AWS, Docker, Kubernetes, Terraform, CI/CD, DevOps, Infrastructure as Code, High Availability',
    },
  ],
  knowsAbout: [
    'Software Engineering', 'System Design', 'Cloud Architecture', 'Distributed Systems',
    'AWS', 'Docker', 'Kubernetes', 'Terraform',
    'CI/CD', 'DevOps', 'Infrastructure as Code',
    'Go', 'Django', 'Python', 'Node.js',
    'PostgreSQL', 'Redis', 'MongoDB',
    'REST APIs', 'Microservices', 'High Availability',
    'Web Performance Optimisation',
    'Next.js', 'React', 'TypeScript', 'JavaScript',
    'Computer Vision', 'Embedded Systems', 'WebRTC',
    'Real-time Systems', 'AI Engineering', 'HIPAA Compliance',
  ],
  knowsLanguage: ['English'],
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'Moat Academy',
      address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
    },
    { '@type': 'EducationalOrganization', name: 'IBT Learning' },
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Web Application Development',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'EducationalOrganization', name: 'Moat Academy' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Full Stack Engineering',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'EducationalOrganization', name: 'IBT Learning' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Web Development Internship',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Zidio Development' },
    },
  ],
  makesOffer: [
    {
      '@type': 'Offer',
      areaServed: ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Worldwide'],
      itemOffered: {
        '@type': 'Service',
        name: 'Systems Architecture & Design',
        description:
          'Data models, service boundaries, API contracts, and capacity planning — system design before production code.',
      },
    },
    {
      '@type': 'Offer',
      areaServed: ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Worldwide'],
      itemOffered: {
        '@type': 'Service',
        name: 'Cloud Infrastructure & DevOps',
        description:
          'AWS cloud infrastructure, CI/CD pipelines, Docker containerisation, and zero-downtime deployment automation.',
      },
    },
    {
      '@type': 'Offer',
      areaServed: ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Worldwide'],
      itemOffered: {
        '@type': 'Service',
        name: 'Distributed Backend & API Engineering',
        description:
          'Go and Django services with rate-limiting, idempotency, circuit breakers, and caching strategies built for scale.',
      },
    },
    {
      '@type': 'Offer',
      areaServed: ['Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Worldwide'],
      itemOffered: {
        '@type': 'Service',
        name: 'Full Stack Product Delivery',
        description:
          'High-performance React and Next.js frontends built on top of sound architecture — end-to-end delivery.',
      },
    },
  ],
  sameAs: [
    'https://github.com/Donrington',
    'https://www.linkedin.com/in/carrington-abakwe-b0b0a0217',
    'https://x.com/CarlSwitch_CHUG',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'abakwecarrington@gmail.com',
    contactType: 'professional inquiry',
    availableLanguage: 'English',
    areaServed: 'Worldwide',
  },
};

const orgSchema = {
  '@type': 'ProfessionalService',
  '@id': `${BASE_URL}/#org`,
  name: 'Cybersage',
  legalName: 'Cybersage — Abakwe Carrington',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/sage/icon-512.png`,
    width: 512,
    height: 512,
  },
  image: { '@id': `${BASE_URL}/#headshot` },
  description:
    'Independent software engineering and systems architecture practice of Abakwe Carrington — distributed platforms, cloud infrastructure, and production-grade backends. Based in Lagos, Nigeria; serving clients worldwide.',
  founder: { '@id': `${BASE_URL}/#person` },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lagos',
    addressRegion: 'Lagos State',
    addressCountry: 'NG',
  },
  areaServed: [
    { '@type': 'Country', name: 'Nigeria' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'Australia' },
    'Worldwide',
  ],
  knowsAbout: [
    'Software Engineering', 'Systems Architecture', 'Cloud Infrastructure',
    'DevOps', 'Distributed Systems', 'Backend Engineering',
  ],
  email: 'abakwecarrington@gmail.com',
  sameAs: [
    'https://github.com/Donrington',
    'https://www.linkedin.com/in/carrington-abakwe-b0b0a0217',
    'https://x.com/CarlSwitch_CHUG',
  ],
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Cybersage — Abakwe Carrington',
  alternateName: ['cybersage.dev', 'Abakwe Carrington Portfolio'],
  description:
    'Portfolio and professional profile of Abakwe Carrington — software engineer and Infrastructure & Systems Architect in Lagos, Nigeria.',
  author: { '@id': `${BASE_URL}/#person` },
  publisher: { '@id': `${BASE_URL}/#org` },
  inLanguage: 'en',
  copyrightYear: new Date().getFullYear(),
};

const profilePageSchema = {
  '@type': 'ProfilePage',
  '@id': `${BASE_URL}/#profilepage`,
  url: BASE_URL,
  name: 'Abakwe Carrington — Software Engineer & Systems Architect (Lagos, Nigeria & Remote Worldwide)',
  description:
    'Professional portfolio of Abakwe Carrington (Cybersage), a software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria, with 5+ years of experience designing production-grade distributed systems.',
  isPartOf: { '@id': `${BASE_URL}/#website` },
  about: { '@id': `${BASE_URL}/#person` },
  mainEntity: { '@id': `${BASE_URL}/#person` },
  primaryImageOfPage: { '@id': `${BASE_URL}/#headshot` },
  dateCreated: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
  inLanguage: 'en',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    ],
  },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '#about p', '#faq-section'],
  },
};

const faqSchema = {
  '@type': 'FAQPage',
  '@id': `${BASE_URL}/#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is Abakwe Carrington?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Abakwe Carrington (also known as Cybersage or Donrington) is an Infrastructure & Systems Architect and Senior Software Engineer based in Lagos, Nigeria. He has over 5 years of commercial experience designing distributed cloud infrastructure, microservices, Go and Django backends, and high-performance web applications for clients worldwide.',
      },
    },
    {
      '@type': 'Question',
      name: 'What services does Abakwe Carrington / Cybersage offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Abakwe Carrington offers four core services: 1) Systems Architecture & Design, 2) Cloud Infrastructure & DevOps (AWS, Docker, IaC), 3) Distributed Backend & API Engineering (Go, Django, PostgreSQL, Redis), and 4) Full Stack Web Engineering (Next.js, TypeScript, React).',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Abakwe Carrington work with international clients remotely?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Abakwe Carrington works remotely with companies, startups, and enterprises worldwide across the United States, United Kingdom, Canada, Australia, Europe, and Africa.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Wytnest?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wytnest is a video and written testimonial platform built by Abakwe Carrington. It isolates embeddable video widgets using Shadow DOM technology to avoid style contamination and automatically converts video testimonials into searchable text transcripts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I hire or contact Abakwe Carrington?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can contact Abakwe Carrington directly via email at abakwecarrington@gmail.com or submit a message through his official portfolio website at https://cybersage.dev.',
      },
    },
  ],
};

const projectItemListSchema = {
  '@type': 'ItemList',
  '@id': `${BASE_URL}/#projects-list`,
  name: 'Featured Engineering Projects by Abakwe Carrington',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Wytnest',
        operatingSystem: 'Web-based',
        applicationCategory: 'BusinessApplication',
        description: 'Isolated Shadow DOM testimonial SaaS with automated AI speech-to-text transcription.',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Axflo System',
        operatingSystem: 'Linux / Docker',
        applicationCategory: 'DeveloperApplication',
        description: 'Distributed Go-based fleet telemetry and real-time WebSocket ingestion engine handling 10k+ geo-pings/sec.',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'SoftwareApplication',
        name: 'RecoverDerm',
        operatingSystem: 'Web-based',
        applicationCategory: 'MedicalApplication',
        description: 'US HIPAA-compliant tele-dermatology platform with WebRTC video consultation and zero-knowledge encryption.',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Chronos',
        operatingSystem: 'Linux',
        applicationCategory: 'FinanceApplication',
        description: 'Low-latency financial market telemetry engine with sub-10ms execution bounds.',
      },
    },
  ],
};

const schemaGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    headshot,
    personSchema,
    orgSchema,
    websiteSchema,
    profilePageSchema,
    faqSchema,
    projectItemListSchema,
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" className={instrumentSerif.variable} suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Machine Readable Profile" />
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
