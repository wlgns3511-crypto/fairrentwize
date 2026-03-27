import type { MetadataRoute } from 'next';
import { getAllStates, getAllCountySlugs, getAllMetroSlugs, generateCompareSlugs } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fairrentwize.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/calculator/`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/about/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/contact/`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const states = getAllStates().map(s => ({
    url: `${SITE_URL}/state/${s.slug}/`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8,
  }));

  const counties = getAllCountySlugs().map(c => ({
    url: `${SITE_URL}/county/${c.slug}/`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7,
  }));

  const metros = getAllMetroSlugs().map(m => ({
    url: `${SITE_URL}/metro/${m.slug}/`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7,
  }));

  const comparisons = generateCompareSlugs().map(slug => ({
    url: `${SITE_URL}/compare/${slug}/`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5,
  }));

  return [...staticPages, ...states, ...counties, ...metros, ...comparisons];
}
