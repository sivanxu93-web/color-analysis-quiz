import { getColorLabText } from '~/i18n/languageText';
import PageComponent from './PageComponent';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const colorLabText = await getColorLabText();
  return {
    title: colorLabText.Analysis.title,
    description: colorLabText.Landing.description,
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
