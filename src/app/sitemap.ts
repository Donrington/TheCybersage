import type { MetadataRoute } from 'next';

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
