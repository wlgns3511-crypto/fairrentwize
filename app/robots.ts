import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/embed/', '/api/', '/_next/'],
      },
      { userAgent: 'AhrefsBot', disallow: ['/'] },
      { userAgent: 'SemrushBot', disallow: ['/'] },
      { userAgent: 'MJ12bot', disallow: ['/'] },
      { userAgent: 'DotBot', disallow: ['/'] },
      { userAgent: 'PetalBot', disallow: ['/'] },
      { userAgent: 'BLEXBot', disallow: ['/'] },
      { userAgent: 'DataForSeoBot', disallow: ['/'] },
      { userAgent: 'GPTBot', disallow: ['/'] },
      { userAgent: 'CCBot', disallow: ['/'] },
    ],
    sitemap: 'https://fairrentwize.com/sitemap.xml',
  };
}
