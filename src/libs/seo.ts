import { Metadata } from "next";

const BASE_URL = 'https://coloranalysisquiz.app';

/**
 * Generates correct canonical and alternate language URLs for the 'as-needed' locale strategy.
 * English (en) is the default and should NOT have /en in the URL.
 */
export function getSeoAlternates(path: string, locale: string) {
  // Ensure path starts with / but doesn't end with it (unless root)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const finalPath = cleanPath === '/' ? '' : cleanPath;

  const languages: Record<string, string> = {
    'en': `${BASE_URL}${finalPath}`,
    'zh': `${BASE_URL}/zh${finalPath}`,
  };

  return {
    canonical: locale === 'en' ? `${BASE_URL}${finalPath}` : `${BASE_URL}/${locale}${finalPath}`,
    languages: {
      ...languages,
      'x-default': `${BASE_URL}${finalPath}`,
    }
  };
}

/**
 * Standard OG/Twitter image generator to ensure absolute paths.
 */
export function getSeoImages(imageUrl?: string | null) {
  const finalImage = imageUrl || `${BASE_URL}/seasonal_color_analysis.jpg`;
  return [
    {
      url: finalImage,
      width: 1200,
      height: 630,
      alt: 'Seasonal Color Analysis AI',
    }
  ];
}
