import type { MetadataRoute } from 'next';

const BASE_URL = 'https://cybersage.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      images: [
        `${BASE_URL}/me.png`,
        `${BASE_URL}/cybersage_og.png`,
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
  ];
}
