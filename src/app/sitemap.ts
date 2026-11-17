import type { MetadataRoute } from 'next';
import { SERVICES } from '@/content/services';
import { INDEXABLE_CASE_STUDIES } from '@/content/projects';

const BASE_URL = 'https://cybersage.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [
        `${BASE_URL}/me.png`,
        `${BASE_URL}/sage/cybersage_og_whatsapp.png`,
        `${BASE_URL}/sage/icon-512.png`,
        `${BASE_URL}/hero_image.png`,
        `${BASE_URL}/projects/axflo.png`,
        `${BASE_URL}/projects/anoc.png`,
        `${BASE_URL}/projects/chronos.png`,
        `${BASE_URL}/projects/autoboy.png`,
        `${BASE_URL}/projects/nextgen.png`,
        `${BASE_URL}/projects/recoverderm.png`,
        `${BASE_URL}/projects/amanigo.png`,
        `${BASE_URL}/projects/techhub.png`,
      ],
    },
    {
      url: `${BASE_URL}/work`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...SERVICES.map((s) => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Only case studies with a real write-up; the rest are noindex (see content/projects.ts).
    ...INDEXABLE_CASE_STUDIES.map((p) => ({
      url: `${BASE_URL}/work/${p.id}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: `${BASE_URL}/llms.txt`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/llms-full.txt`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
