import { getColorLabText } from '~/i18n/languageText';
import PageComponent from './PageComponent';
import { Metadata } from 'next';
import { getSeoAlternates } from '~/libs/seo';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  return {
    title: `${colorLabText.Analysis.title} | Color Analysis Quiz`,
    description: colorLabText.Landing.description,
    alternates: getSeoAlternates('/analysis', locale),
  }
}

export default async function AnalysisPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const colorLabText = await getColorLabText();
  return (
    <PageComponent locale={locale} colorLabText={colorLabText} />
  )
}
