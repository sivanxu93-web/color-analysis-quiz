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
    title: colorLabText.MenLanding.title,
    description: colorLabText.MenLanding.description,
    alternates: getSeoAlternates('/men', locale),
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
