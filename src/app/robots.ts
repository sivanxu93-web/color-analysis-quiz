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
          '/profile', // Private user profile
          '/admin' // Admin routes if any
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
