import type { MetadataRoute } from 'next';

const BASE_URL = 'https://cybersage.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      // Major Search Engine Crawlers
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        allow: '/',
      },
      // AI Crawlers & Answer Engine Bots (GEO & AEO Optimization)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'Google-Extended',
          'cohere-ai',
          'CCBot',
          'Bytespider',
          'Applebot-Extended',
          'Meta-ExternalAgent',
        ],
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
