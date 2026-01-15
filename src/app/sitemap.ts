import { MetadataRoute } from 'next';
import { locales } from '~/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  
  // Key static routes
  const routes = [
    '',
    '/analysis',
    '/pricing',
    '/validator',
    '/profile',
    '/privacy-policy',
    '/terms-of-service'
  ];

  const sitemapEntry: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    locales.forEach(locale => {
      sitemapEntry.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapEntry;
}
