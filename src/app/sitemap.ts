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
    '/terms-of-service',
    '/examples/deep-winter-analysis',
    '/examples/soft-autumn-analysis',
    '/examples/light-summer-analysis',
    '/examples/warm-spring-analysis'
  ];

  const sitemapEntry: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    locales.forEach(locale => {
      // For default locale (en), we don't include the prefix because localePrefix is 'as-needed'
      const url = locale === 'en' 
        ? `${baseUrl}${route}` 
        : `${baseUrl}/${locale}${route}`;

      sitemapEntry.push({
        url: url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapEntry;
}
