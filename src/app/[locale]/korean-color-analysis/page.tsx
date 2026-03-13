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
    languages[l] = l === 'en' ? `${baseUrl}/korean-color-analysis` : `${baseUrl}/${l}/korean-color-analysis`;
  });

  return {
    title: colorLabText.KoreanLanding.title,
    description: colorLabText.KoreanLanding.description,
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/korean-color-analysis` : `${baseUrl}/${locale}/korean-color-analysis`,
      languages: {
        ...languages,
        'x-default': `${baseUrl}/korean-color-analysis`,
      },
    }
  }
}

export default async function KoreanLandingPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();

  return (
    <PageComponent locale={locale} colorLabText={colorLabText} />
  )
}
