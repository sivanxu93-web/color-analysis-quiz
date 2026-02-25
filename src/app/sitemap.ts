import { MetadataRoute } from 'next';
import { locales } from '~/i18n/config';
import { EXAMPLE_MAP } from '~/libs/examples';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  
  // Example Routes
  const exampleRoutes = Object.keys(EXAMPLE_MAP).map(slug => `/examples/${slug}`);

  // Key static routes
  const routes = [
    '',
    '/analysis',
    '/pricing',
    '/validator',
    '/profile',
    '/privacy-policy',
    '/terms-of-service',
    ...exampleRoutes
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
