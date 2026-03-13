import { getColorLabText } from '~/i18n/languageText';
import LandingPage from '~/components/home/LandingPage';
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
    languages[l] = l === 'en' ? `${baseUrl}` : `${baseUrl}/${l}`;
  });

  return {
    title: colorLabText.Landing.title,
    description: colorLabText.Landing.description,
    alternates: {
      canonical: locale === 'en' ? `${baseUrl}` : `${baseUrl}/${locale}`,
      languages: {
        ...languages,
        'x-default': `${baseUrl}`,
      },
    }
  }
}

export default async function LocaleRootPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();

  return (
    <LandingPage locale={locale} colorLabText={colorLabText} />
  )
}
