import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cybersage — Abakwe Carrington | Software Engineer & Systems Architect, Lagos, Nigeria',
    short_name: 'Cybersage',
    description:
      'Portfolio of Abakwe Carrington — software engineer and Infrastructure & Systems Architect based in Lagos, Nigeria. Available for hire worldwide.',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    categories: ['technology', 'business', 'portfolio'],
    lang: 'en',
    icons: [
      {
        src: '/sage/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/sage/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/sage/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
