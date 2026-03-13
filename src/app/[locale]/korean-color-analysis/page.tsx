import { getColorLabText } from '~/i18n/languageText';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { locales } from '~/i18n/config';

import { getSeoAlternates } from '~/libs/seo';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const colorLabText = await getColorLabText();

  return {
    title: colorLabText.KoreanLanding.title,
    description: colorLabText.KoreanLanding.description,
    alternates: getSeoAlternates('/korean-color-analysis', locale),
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
