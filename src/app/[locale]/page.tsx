import { getColorLabText } from '~/i18n/languageText';
import LandingPage from '~/components/home/LandingPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  return {
    title: colorLabText.Landing.title,
    description: colorLabText.Landing.description,
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}`,
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
