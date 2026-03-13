import { getColorLabText } from '~/i18n/languageText';
import LandingPage from '~/components/home/LandingPage';
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
    title: colorLabText.Landing.title,
    description: colorLabText.Landing.description,
    alternates: getSeoAlternates('/', locale),
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
