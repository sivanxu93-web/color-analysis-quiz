import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
          '/api/', 
          '/_next/', 
          '/profile', // Private user pages
          '/report/' // Reports are usually private unless shared, but let's disallow to save crawl budget on dynamic infinite pages
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
