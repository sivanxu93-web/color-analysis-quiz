import { getColorLabText } from '~/i18n/languageText';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { locales } from '~/i18n/config';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coloranalysisquiz.app';
  
  const languages: Record<string, string> = {};
  locales.forEach((l) => {
    languages[l] = l === 'en' ? `${baseUrl}/16-season-color-analysis` : `${baseUrl}/${l}/16-season-color-analysis`;
  });

  return {
    title: colorLabText.SixteenSeasonLanding.title,
    description: colorLabText.SixteenSeasonLanding.description,
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/16-season-color-analysis` : `${baseUrl}/${locale}/16-season-color-analysis`,
      languages: {
        ...languages,
        'x-default': `${baseUrl}/16-season-color-analysis`,
      },
    }
  }
}

export default async function SixteenSeasonLandingPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();

  return (
    <PageComponent locale={locale} colorLabText={colorLabText} />
  )
}
