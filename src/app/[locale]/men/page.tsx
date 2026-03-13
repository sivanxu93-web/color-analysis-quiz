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
    languages[l] = l === 'en' ? `${baseUrl}/men` : `${baseUrl}/${l}/men`;
  });

  return {
    title: colorLabText.MenLanding.title,
    description: colorLabText.MenLanding.description,
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}/men` : `${baseUrl}/${locale}/men`,
      languages: {
        ...languages,
        'x-default': `${baseUrl}/men`,
      },
    }
  }
}

export default async function MenLandingPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();

  return (
    <PageComponent locale={locale} colorLabText={colorLabText} />
  )
}
