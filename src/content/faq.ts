// FAQ copy. Rendered by the FAQ section AND emitted as FAQPage JSON-LD in layout.tsx, so the two cannot drift.
// Six questions, none removed from the previous visible list.

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQS: FAQItem[] = [
  {
    id: 'who-is-abakwe',
    category: 'Background',
    question: 'Who is Abakwe Carrington?',
    answer:
      'Abakwe Carrington (also known as Cybersage or Donrington) is an Infrastructure & Systems Architect and Senior Software Engineer based in Lagos, Nigeria. Over the past 5+ years, he has designed, built, and operated high-availability distributed systems, cloud infrastructure (AWS, Docker, Kubernetes, Terraform), and Go & Django backends for global clients across North America, Europe, Australia, and Africa.',
  },
  {
    id: 'services-offered',
    category: 'Services',
    question: 'What engineering services does Cybersage offer?',
    answer:
      'Abakwe Carrington specializes in four core areas: 1) Systems Architecture & System Design (blueprinting microservice boundaries and database schemas), 2) Cloud Infrastructure & DevOps (AWS setups, IaC with Terraform, Docker containerisation, and automated zero-downtime CI/CD pipelines), 3) Distributed Backend & API Engineering (Go and Django services with rate-limiting and caching), and 4) Full Stack Web Engineering (high-performance Next.js and React web apps).',
  },
  {
    id: 'remote-global',
    category: 'Location & Remote',
    question: 'Does Abakwe Carrington work with international clients remotely?',
    answer:
      'Yes, absolutely. While based in Lagos, Nigeria (WAT / GMT+1), Abakwe works seamlessly with startups, scale-ups, and enterprises worldwide across US, UK, European, Canadian, and Australian time zones.',
  },
  {
    id: 'wytnest-platform',
    category: 'Featured Project',
    question: 'What is Wytnest and how does it work?',
    answer:
      'Wytnest is a video and written testimonial platform built by Abakwe Carrington. It isolates embeddable video widgets using Shadow DOM technology to guarantee zero style leakage on client websites. It features automated AI speech-to-text transcription to convert video reviews into searchable quotes, and supports multi-currency billing (USD & NGN) via Stripe and Paystack.',
  },
  {
    id: 'tech-stack',
    category: 'Technology Stack',
    question: 'What is Abakwe Carrington’s primary technology stack?',
    answer:
      'Core stack includes AWS, Docker, Kubernetes, Terraform, Go (Golang), Python (Django, FastAPI), PostgreSQL, Redis, Next.js, React, and TypeScript. He also has expertise in WebRTC streaming, OpenCV computer vision, HIPAA-compliant security architecture, and timeseries data.',
  },
  {
    id: 'how-to-hire',
    category: 'Engagement',
    question: 'How can I hire or contact Abakwe Carrington for a project?',
    answer:
      'You can reach out directly via email at hello@cybersage.dev, connect on LinkedIn or Twitter (@CarlSwitch_CHUG), or send a message through the contact section below. He is available for remote full-time engineering roles, contract infrastructure work, and system architecture consulting.',
  },
];
